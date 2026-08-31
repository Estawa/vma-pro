import React, { useState, useRef, useEffect } from 'react';
import { Ruler, Play, Pause, RotateCcw, Calculator as CalcIcon, Volume2, Square } from 'lucide-react';
import { MONO, beep, gong } from '../constants';
import ScreenHeader from './ScreenHeader';

/* ---------- Helpers communs ---------- */

function SubNav({ items, active, onChange, theme }) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
      {items.map((it) => {
        const isActive = active === it.id;
        return (
          <button
            key={it.id}
            onClick={() => onChange(it.id)}
            className="shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors"
            style={isActive
              ? { backgroundColor: theme.accent, color: theme.accentContrast, borderColor: 'transparent' }
              : { borderColor: theme.cardBorder, color: theme.muted, backgroundColor: theme.cardBg }}
          >
            {it.label}
          </button>
        );
      })}
    </div>
  );
}

function ModeToggle({ mode, setMode, theme }) {
  return (
    <div className="flex gap-2">
      <button
        onClick={() => setMode('calc')}
        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm font-medium border"
        style={mode === 'calc'
          ? { backgroundColor: theme.accent, color: theme.accentContrast, borderColor: 'transparent' }
          : { borderColor: theme.cardBorder, color: theme.text, backgroundColor: theme.cardBg }}
      >
        <CalcIcon className="w-4 h-4" /> Calculateur
      </button>
      <button
        onClick={() => setMode('guide')}
        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm font-medium border"
        style={mode === 'guide'
          ? { backgroundColor: theme.accent, color: theme.accentContrast, borderColor: 'transparent' }
          : { borderColor: theme.cardBorder, color: theme.text, backgroundColor: theme.cardBg }}
      >
        <Volume2 className="w-4 h-4" /> Guidage sonore
      </button>
    </div>
  );
}

function ResultBlock({ theme, label, value, unit, sub }) {
  return (
    <div className="rounded-2xl border p-5 text-center space-y-1" style={{ borderColor: theme.accent, backgroundColor: theme.cardBg }}>
      <p className="text-xs uppercase tracking-widest" style={{ color: theme.muted }}>{label}</p>
      <p className="text-4xl font-bold" style={{ ...MONO, color: theme.accent }}>{value} <span className="text-lg font-normal" style={{ color: theme.muted }}>{unit}</span></p>
      {sub && <p className="text-xs" style={{ color: theme.muted }}>{sub}</p>}
    </div>
  );
}

function fmtMMSS(totalSec) {
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

/* ---------- TEST 1 : 4 x 3 minutes ---------- */

function Test4x3Calc({ theme }) {
  const [dists, setDists] = useState(['', '', '', '']);

  const setD = (i, v) => {
    const copy = [...dists];
    copy[i] = v;
    setDists(copy);
  };

  const nums = dists.map((d) => parseFloat(d));
  const valid = nums.every((n) => !isNaN(n) && n > 0);

  let result = null;
  if (valid) {
    const speeds = nums.map((d) => (d / 180) * 3.6); // 180s = 3 min
    const avgAll = speeds.reduce((a, b) => a + b, 0) / 4;
    const minIdx = speeds.indexOf(Math.min(...speeds));
    const best3 = speeds.filter((_, i) => i !== minIdx);
    const avgBest3 = best3.reduce((a, b) => a + b, 0) / 3;
    const drop = avgBest3 - avgAll;
    const excluded = drop > 0.5;
    result = {
      speeds,
      avgAll,
      avgBest3,
      excluded,
      minIdx,
      final: excluded ? avgBest3 : avgAll,
    };
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border p-5 space-y-4" style={{ borderColor: theme.cardBorder, backgroundColor: theme.cardBg }}>
        <h3 className="font-bold" style={{ color: theme.text }}>Distances parcourues (en m, 3 min chacune)</h3>
        <div className="grid grid-cols-2 gap-3">
          {dists.map((d, i) => (
            <div key={i}>
              <label className="block text-xs text-center font-medium mb-1" style={{ color: theme.muted }}>Course {i + 1}</label>
              <input
                type="number" min="0" value={d}
                onChange={(e) => setD(i, e.target.value)}
                placeholder="m"
                className="w-full rounded-lg px-2 py-2 text-center font-bold border-2"
                style={{ ...MONO, borderColor: theme.cardBorder, backgroundColor: theme.inputBg, color: theme.text }}
              />
            </div>
          ))}
        </div>
        <p className="text-xs text-center" style={{ color: theme.muted }}>Récupération entre chaque course : 4 min 30</p>
      </div>

      {result && (
        <>
          <ResultBlock
            theme={theme}
            label="VMA retenue"
            value={result.final.toFixed(2)}
            unit="km/h"
            sub={result.excluded
              ? `Course ${result.minIdx + 1} exclue (moyenne 3 meilleures, écart > 0,5 km/h)`
              : 'Moyenne des 4 courses'}
          />
          <div className="rounded-xl border p-4 text-xs space-y-1" style={{ borderColor: theme.cardBorder, backgroundColor: theme.bg }}>
            {result.speeds.map((s, i) => (
              <p key={i} style={{ color: i === result.minIdx && result.excluded ? theme.muted : theme.text }}>
                Course {i + 1} : {s.toFixed(2)} km/h{i === result.minIdx && result.excluded ? ' (exclue)' : ''}
              </p>
            ))}
            <p style={{ color: theme.muted }}>Moyenne des 4 : {result.avgAll.toFixed(2)} km/h — Moyenne des 3 meilleures : {result.avgBest3.toFixed(2)} km/h</p>
          </div>
        </>
      )}
    </div>
  );
}

function Test4x3Guide({ theme }) {
  // Phases : 4 courses de 180s (comptage croissant) séparées de 4 x 270s de récup (comptage décroissant), pas de récup après la 4e
  const steps = [];
  for (let i = 1; i <= 4; i++) {
    steps.push({ type: 'work', rep: i, duration: 180 });
    if (i < 4) steps.push({ type: 'rest', rep: i, duration: 270 });
  }

  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [elapsed, setElapsed] = useState(0); // pour 'work' : compte croissant
  const [countdown, setCountdown] = useState(0); // pour 'rest' : compte décroissant
  const intervalRef = useRef(null);

  const currentStep = steps[stepIndex];

  useEffect(() => {
    if (!running || done) return;
    intervalRef.current = setInterval(() => {
      if (currentStep.type === 'work') {
        setElapsed((e) => {
          const next = e + 1;
          if (next >= currentStep.duration) {
            const nextIndex = stepIndex + 1;
            if (nextIndex >= steps.length) {
              gong();
              setDone(true);
              setRunning(false);
              return currentStep.duration;
            }
            beep(1300, 0.15); // bip début récup
            setStepIndex(nextIndex);
            setCountdown(steps[nextIndex].duration);
            return 0;
          }
          if (next >= currentStep.duration - 3) beep(440, 0.08);
          return next;
        });
      } else {
        setCountdown((c) => {
          const next = c - 1;
          if (next <= 0) {
            const nextIndex = stepIndex + 1;
            beep(880, 0.2); // bip nouveau départ
            setStepIndex(nextIndex);
            setElapsed(0);
            return 0;
          }
          if (next <= 3) beep(440, 0.08);
          return next;
        });
      }
    }, 1000);
    return () => clearInterval(intervalRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, done, stepIndex]);

  const start = () => {
    setStepIndex(0);
    setElapsed(0);
    setCountdown(0);
    setDone(false);
    setRunning(true);
    beep(880, 0.2); // bip de départ
  };

  const reset = () => {
    clearInterval(intervalRef.current);
    setRunning(false);
    setDone(false);
    setStepIndex(0);
    setElapsed(0);
    setCountdown(0);
  };

  return (
    <div className="rounded-2xl border p-5 space-y-4 text-center" style={{ borderColor: theme.cardBorder, backgroundColor: theme.cardBg }}>
      {!running && !done && (
        <p className="text-sm" style={{ color: theme.muted }}>4 courses de 3 min à allure maximale, séparées de 4 min 30 de récupération.</p>
      )}
      {running && currentStep && (
        <div className="space-y-2">
          <p className="text-sm uppercase tracking-widest" style={{ color: currentStep.type === 'work' ? theme.accent : theme.muted }}>
            {currentStep.type === 'work' ? `Course ${currentStep.rep}/4` : `Récupération (avant course ${currentStep.rep + 1})`}
          </p>
          <p className="text-7xl font-bold" style={{ ...MONO, color: theme.text }}>
            {currentStep.type === 'work' ? fmtMMSS(elapsed) : fmtMMSS(countdown)}
          </p>
        </div>
      )}
      {done && <p className="text-xl font-bold" style={{ color: theme.accent }}>Test terminé ! Passe au calculateur pour saisir les distances.</p>}
      <div className="flex gap-3">
        {!running && !done && (
          <button onClick={start} className="flex-1 flex items-center justify-center gap-2 rounded-xl py-3 font-medium" style={{ backgroundColor: theme.accent, color: theme.accentContrast }}>
            <Play className="w-4 h-4" /> Démarrer
          </button>
        )}
        {(running || done) && (
          <button onClick={reset} className="flex-1 flex items-center justify-center gap-2 rounded-xl py-3 font-medium border" style={{ borderColor: theme.cardBorder, color: theme.text }}>
            <RotateCcw className="w-4 h-4" /> Réinitialiser
          </button>
        )}
      </div>
    </div>
  );
}

/* ---------- TEST 2 : Demi-Cooper (6 minutes) ---------- */

function Cooper6Calc({ theme }) {
  const [dist, setDist] = useState('');
  const n = parseFloat(dist);
  const valid = !isNaN(n) && n > 0;
  const vma = valid ? n / 100 : null; // distance(m) / 100 = distance(m)/1000 / (6/60)

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border p-5 space-y-3" style={{ borderColor: theme.cardBorder, backgroundColor: theme.cardBg }}>
        <h3 className="font-bold" style={{ color: theme.text }}>Distance parcourue en 6 minutes</h3>
        <input
          type="number" min="0" value={dist}
          onChange={(e) => setDist(e.target.value)}
          placeholder="mètres"
          className="w-full rounded-lg px-3 py-3 text-center font-bold border-2 text-lg"
          style={{ ...MONO, borderColor: theme.cardBorder, backgroundColor: theme.inputBg, color: theme.text }}
        />
      </div>
      {valid && <ResultBlock theme={theme} label="VMA" value={vma.toFixed(2)} unit="km/h" sub="VMA = distance (m) ÷ 100" />}
    </div>
  );
}

function Cooper6Guide({ theme }) {
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const intervalRef = useRef(null);
  const DURATION = 360;

  useEffect(() => {
    if (!running || done) return;
    intervalRef.current = setInterval(() => {
      setElapsed((e) => {
        const next = e + 1;
        if (next >= DURATION) {
          gong();
          setDone(true);
          setRunning(false);
          return DURATION;
        }
        if (next >= DURATION - 3) beep(440, 0.08);
        return next;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, [running, done]);

  const start = () => {
    setElapsed(0);
    setDone(false);
    setRunning(true);
    beep(880, 0.2);
  };
  const reset = () => {
    clearInterval(intervalRef.current);
    setRunning(false);
    setDone(false);
    setElapsed(0);
  };

  return (
    <div className="rounded-2xl border p-5 space-y-4 text-center" style={{ borderColor: theme.cardBorder, backgroundColor: theme.cardBg }}>
      {!running && !done && <p className="text-sm" style={{ color: theme.muted }}>Cours la plus grande distance possible en 6 minutes.</p>}
      {running && <p className="text-7xl font-bold" style={{ ...MONO, color: theme.text }}>{fmtMMSS(elapsed)}</p>}
      {done && <p className="text-xl font-bold" style={{ color: theme.accent }}>Temps écoulé ! Passe au calculateur pour saisir la distance.</p>}
      <div className="flex gap-3">
        {!running && !done && (
          <button onClick={start} className="flex-1 flex items-center justify-center gap-2 rounded-xl py-3 font-medium" style={{ backgroundColor: theme.accent, color: theme.accentContrast }}>
            <Play className="w-4 h-4" /> Démarrer
          </button>
        )}
        {(running || done) && (
          <button onClick={reset} className="flex-1 flex items-center justify-center gap-2 rounded-xl py-3 font-medium border" style={{ borderColor: theme.cardBorder, color: theme.text }}>
            <RotateCcw className="w-4 h-4" /> Réinitialiser
          </button>
        )}
      </div>
    </div>
  );
}

/* ---------- TEST 3 : VMA/VMI Gacon (45/15) ---------- */

const GACON_WORK = 45;
const GACON_REST = 15;
const GACON_START_SPEED = 8; // km/h, 1er plot à 100m
const GACON_STEP = 0.5;

function speedAtPalier(k) {
  // k = numéro de palier (1, 2, 3...) ; peut être <= 0 pour un calcul théorique
  return GACON_START_SPEED + GACON_STEP * (k - 1);
}

function GaconGuide({ theme }) {
  const [running, setRunning] = useState(false);
  const [phase, setPhase] = useState('work'); // 'work' | 'rest'
  const [palier, setPalier] = useState(1);
  const [elapsed, setElapsed] = useState(0); // work : compte croissant
  const [countdown, setCountdown] = useState(0); // rest : compte décroissant
  const [result, setResult] = useState(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!running) return;
    intervalRef.current = setInterval(() => {
      if (phase === 'work') {
        setElapsed((e) => {
          const next = e + 1;
          if (next >= GACON_WORK) {
            beep(1300, 0.15); // bip début récup
            setPhase('rest');
            setCountdown(GACON_REST);
            return 0;
          }
          if (next >= GACON_WORK - 3) beep(440, 0.08);
          return next;
        });
      } else {
        setCountdown((c) => {
          const next = c - 1;
          if (next <= 0) {
            beep(880, 0.2); // bip nouveau départ
            setPalier((p) => p + 1);
            setPhase('work');
            setElapsed(0);
            return 0;
          }
          if (next <= 3) beep(440, 0.08);
          return next;
        });
      }
    }, 1000);
    return () => clearInterval(intervalRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, phase]);

  const start = () => {
    setPalier(1);
    setPhase('work');
    setElapsed(0);
    setCountdown(0);
    setResult(null);
    setRunning(true);
    beep(880, 0.2); // bip de départ
  };

  const stop = () => {
    clearInterval(intervalRef.current);
    setRunning(false);
    gong(); // gros bip de fin

    let finalSpeed, label, palierAtteint;
    if (phase === 'rest') {
      // dernier palier pleinement validé
      finalSpeed = speedAtPalier(palier);
      palierAtteint = palier;
      label = `Palier ${palier} pleinement validé`;
    } else {
      // interrompu en cours de palier "palier"
      const prevSpeed = speedAtPalier(palier - 1);
      if (elapsed >= 20 && elapsed < 30) {
        finalSpeed = prevSpeed + 0.25;
        palierAtteint = palier - 0.5;
        label = `Palier ${palier} interrompu entre 20 et 30 s → demi-palier compté`;
      } else {
        finalSpeed = prevSpeed;
        palierAtteint = palier - 1;
        label = `Palier ${palier} interrompu (hors zone 20-30 s) → palier ${palier - 1} conservé`;
      }
    }
    setResult({ finalSpeed, label, palierAtteint });
  };

  const reset = () => {
    clearInterval(intervalRef.current);
    setRunning(false);
    setPhase('work');
    setPalier(1);
    setElapsed(0);
    setCountdown(0);
    setResult(null);
  };

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border p-5 space-y-4 text-center" style={{ borderColor: theme.cardBorder, backgroundColor: theme.cardBg }}>
        {!running && !result && (
          <p className="text-sm" style={{ color: theme.muted }}>
            1er plot à 100 m (8 km/h), puis +6,25 m par palier de 45 s. Récup 15 s en marchant jusqu'au plot suivant.
          </p>
        )}
        {running && (
          <div className="space-y-2">
            <p className="text-sm uppercase tracking-widest" style={{ color: phase === 'work' ? theme.accent : theme.muted }}>
              {phase === 'work' ? `Palier ${palier} — course (${speedAtPalier(palier).toFixed(1)} km/h)` : `Récupération (avant palier ${palier + 1})`}
            </p>
            <p className="text-7xl font-bold" style={{ ...MONO, color: theme.text }}>
              {phase === 'work' ? fmtMMSS(elapsed) : fmtMMSS(countdown)}
            </p>
          </div>
        )}
        {result && (
          <div className="space-y-3">
            <p className="text-xl font-bold" style={{ color: theme.accent }}>Test terminé</p>
            <ResultBlock theme={theme} label="VMA / VMI" value={result.finalSpeed.toFixed(2)} unit="km/h" sub={result.label} />
            <p className="text-xs" style={{ color: theme.muted }}>Palier atteint : {result.palierAtteint}</p>
          </div>
        )}
        <div className="flex gap-3">
          {!running && !result && (
            <button onClick={start} className="flex-1 flex items-center justify-center gap-2 rounded-xl py-3 font-medium" style={{ backgroundColor: theme.accent, color: theme.accentContrast }}>
              <Play className="w-4 h-4" /> Démarrer
            </button>
          )}
          {running && (
            <button onClick={stop} className="flex-1 flex items-center justify-center gap-2 rounded-xl py-3 font-medium" style={{ backgroundColor: '#EF4444', color: '#FFFFFF' }}>
              <Square className="w-4 h-4" /> Stop
            </button>
          )}
          {(result) && (
            <button onClick={reset} className="flex-1 flex items-center justify-center gap-2 rounded-xl py-3 font-medium border" style={{ borderColor: theme.cardBorder, color: theme.text }}>
              <RotateCcw className="w-4 h-4" /> Réinitialiser
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function GaconCalc({ theme }) {
  const [palier, setPalier] = useState('');
  const [half, setHalf] = useState(false);
  const p = parseFloat(palier);
  const valid = !isNaN(p) && p >= 1;
  const vma = valid ? speedAtPalier(p) + (half ? 0.25 : 0) : null;

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border p-5 space-y-4" style={{ borderColor: theme.cardBorder, backgroundColor: theme.cardBg }}>
        <h3 className="font-bold" style={{ color: theme.text }}>Saisie manuelle du résultat</h3>
        <div>
          <label className="block text-xs text-center font-medium mb-1" style={{ color: theme.muted }}>Dernier palier pleinement validé</label>
          <input
            type="number" min="1" value={palier}
            onChange={(e) => setPalier(e.target.value)}
            className="w-full rounded-lg px-3 py-2 text-center font-bold border-2"
            style={{ ...MONO, borderColor: theme.cardBorder, backgroundColor: theme.inputBg, color: theme.text }}
          />
        </div>
        <label className="flex items-center justify-center gap-2 text-sm" style={{ color: theme.text }}>
          <input type="checkbox" checked={half} onChange={(e) => setHalf(e.target.checked)} />
          Demi-palier supplémentaire (interruption entre 20 et 30 s du palier suivant)
        </label>
      </div>
      {valid && <ResultBlock theme={theme} label="VMA / VMI" value={vma.toFixed(2)} unit="km/h" sub={`Palier ${palier}${half ? ' + demi-palier' : ''}`} />}
    </div>
  );
}

/* ---------- Composant principal ---------- */

const TESTS = [
  { id: '4x3', label: '4x3 min' },
  { id: 'cooper6', label: 'Demi-Cooper (6 min)' },
  { id: 'gacon', label: 'Gacon (45/15)' },
];

export default function VmaTests({ theme, dark, setDark, onBack }) {
  const [activeTest, setActiveTest] = useState('4x3');
  const [mode, setMode] = useState('calc');

  return (
    <div className="space-y-6">
      <ScreenHeader theme={theme} subtitle="Test de VMA" onBack={onBack} dark={dark} setDark={setDark} />

      <div className="flex items-center gap-2">
        <Ruler className="w-5 h-5" style={{ color: theme.accent }} />
        <h2 className="font-bold" style={{ color: theme.text }}>Choisis un protocole</h2>
      </div>

      <SubNav items={TESTS} active={activeTest} onChange={(id) => { setActiveTest(id); setMode('calc'); }} theme={theme} />
      <ModeToggle mode={mode} setMode={setMode} theme={theme} />

      {activeTest === '4x3' && (mode === 'calc' ? <Test4x3Calc theme={theme} /> : <Test4x3Guide theme={theme} />)}
      {activeTest === 'cooper6' && (mode === 'calc' ? <Cooper6Calc theme={theme} /> : <Cooper6Guide theme={theme} />)}
      {activeTest === 'gacon' && (mode === 'calc' ? <GaconCalc theme={theme} /> : <GaconGuide theme={theme} />)}
    </div>
  );
}
