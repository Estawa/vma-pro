import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, RotateCcw, Timer } from 'lucide-react';
import { MONO, beep, gong, formatDuration } from '../constants';
import ScreenHeader from './ScreenHeader';

const TIMER_HISTORY_KEY = 'vma-pro-timer-history';

function buildSteps({ numSeries, reps, workSec, rSec, RSec }) {
  const steps = [];
  for (let s = 1; s <= numSeries; s++) {
    for (let n = 1; n <= reps; n++) {
      steps.push({ type: 'work', duration: workSec, series: s, rep: n });
      if (n < reps) steps.push({ type: 'r', duration: rSec, series: s, rep: n });
    }
    if (s < numSeries) steps.push({ type: 'R', duration: RSec, series: s });
  }
  return steps;
}

export default function IntervalTimer({ theme, dark, setDark, onBack }) {
  const [numSeries, setNumSeries] = useState(3);
  const [reps, setReps] = useState(10);
  const [workSec, setWorkSec] = useState(30);
  const [rSec, setRSec] = useState(10);
  const [RSec, setRSec2] = useState(120);

  const [running, setRunning] = useState(false);
  const [paused, setPaused] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [pausedSeconds, setPausedSeconds] = useState(0);
  const [done, setDone] = useState(false);
  const [startedAt, setStartedAt] = useState(null);
  const intervalRef = useRef(null);
  const stepsRef = useRef([]);

  useEffect(() => {
    if (!running || paused || done) return;
    intervalRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          const steps = stepsRef.current;
          const nextIndex = stepIndex + 1;
          if (nextIndex >= steps.length) {
            gong();
            setDone(true);
            setRunning(false);
            return 0;
          }
          const nextStep = steps[nextIndex];
          if (nextStep.type === 'work') beep(880, 0.2);
          else if (nextStep.type === 'r') beep(1300, 0.12);
          else beep(330, 0.6);
          setStepIndex(nextIndex);
          return nextStep.duration;
        }
        if (t <= 4) beep(440, 0.08);
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, paused, done, stepIndex]);

  useEffect(() => {
    if (!paused) return;
    const p = setInterval(() => setPausedSeconds((s) => s + 1), 1000);
    return () => clearInterval(p);
  }, [paused]);

  const start = () => {
    const steps = buildSteps({ numSeries, reps, workSec, rSec, RSec });
    stepsRef.current = steps;
    setStepIndex(0);
    setTimeLeft(steps[0].duration);
    setPausedSeconds(0);
    setDone(false);
    setPaused(false);
    setRunning(true);
    setStartedAt(Date.now());
    gong();
  };

  const reset = () => {
    clearInterval(intervalRef.current);
    setRunning(false);
    setPaused(false);
    setDone(false);
    setStepIndex(0);
    setTimeLeft(0);
  };

  useEffect(() => {
    if (!done || !startedAt) return;
    const entry = {
      id: Date.now(),
      date: new Date().toLocaleDateString('fr-FR'),
      structure: `${numSeries}S x (${reps} x ${workSec}s, r=${rSec}s), R=${RSec}s`,
      totalSec: Math.round((Date.now() - startedAt) / 1000),
      pausedSec: pausedSeconds,
    };
    try {
      const raw = localStorage.getItem(TIMER_HISTORY_KEY);
      const list = raw ? JSON.parse(raw) : [];
      localStorage.setItem(TIMER_HISTORY_KEY, JSON.stringify([entry, ...list].slice(0, 30)));
    } catch (e) { /* ignore */ }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done]);

  const currentStep = stepsRef.current[stepIndex];
  const totalSteps = stepsRef.current.length;
  const stepLabel = { work: 'EFFORT', r: 'RÉCUP. (entre répét.)', R: 'RÉCUP. (entre séries)' };

  const totalPlannedSec = numSeries * reps * workSec + numSeries * Math.max(reps - 1, 0) * rSec + Math.max(numSeries - 1, 0) * RSec;

  const fields = [
    { label: 'Séries (S)', val: numSeries, set: setNumSeries, color: '#38BDF8' },
    { label: 'Rep°/Série', val: reps, set: setReps, color: '#38BDF8' },
    { label: "Temps d'effort (s)", val: workSec, set: setWorkSec, color: '#FB923C' },
    { label: 'Récup. / répét° - r (s)', val: rSec, set: setRSec, color: '#2DD4BF' },
    { label: 'Récup. / séries - R (s)', val: RSec, set: setRSec2, full: true, color: '#A78BFA' },
  ];

  return (
    <div className="space-y-6">
      <ScreenHeader theme={theme} subtitle="Minuteur fractionné" onBack={onBack} dark={dark} setDark={setDark} />

      <div className="rounded-2xl border p-5 space-y-4" style={{ borderColor: theme.cardBorder, backgroundColor: theme.cardBg }}>
        <h3 className="font-bold flex items-center gap-2" style={{ color: theme.text }}>
          <Timer className="w-5 h-5" style={{ color: theme.accent }} />
          Paramètres de la séance
        </h3>

        {!running && !done && (
          <>
            <div className="grid grid-cols-2 gap-3">
              {fields.map((f) => (
                <div key={f.label} className={f.full ? 'col-span-2' : ''}>
                  <label className="block text-xs text-center font-medium mb-1" style={{ color: f.color }}>{f.label}</label>
                  <input
                    type="number" min="0" value={f.val}
                    onChange={(e) => f.set(parseInt(e.target.value) || 0)}
                    className="w-full rounded-lg px-2 py-2 text-center font-bold border-2"
                    style={{ ...MONO, borderColor: f.color, backgroundColor: theme.inputBg, color: theme.text }}
                  />
                </div>
              ))}
            </div>
            <p className="text-xs text-center" style={{ color: theme.muted }}>
              {numSeries}S x ({reps} x {workSec}s, r={rSec}s), R={RSec}s
            </p>
            <p className="text-center text-sm font-bold" style={{ color: theme.accent }}>
              Durée totale : {formatDuration(totalPlannedSec)}
            </p>
          </>
        )}

        {running && currentStep && (
          <div className="text-center space-y-2">
            <p className="text-sm uppercase tracking-widest" style={{ color: currentStep.type === 'work' ? theme.accent : theme.muted }}>
              {stepLabel[currentStep.type]} — Série {currentStep.series}/{numSeries}
              {currentStep.type !== 'R' ? ` · Répét. ${currentStep.rep}/${reps}` : ''}
            </p>
            <p className="text-7xl font-bold" style={{ ...MONO, color: theme.text, opacity: paused ? 0.4 : 1 }}>{timeLeft}</p>
            <p className="text-xs" style={{ color: theme.muted }}>Étape {stepIndex + 1}/{totalSteps}{paused ? ' · en pause' : ''}</p>
            {pausedSeconds > 0 && <p className="text-xs" style={{ color: theme.muted }}>Temps en pause cumulé : {pausedSeconds}s</p>}
          </div>
        )}

        {done && (
          <div className="text-center py-2 space-y-2">
            <p className="text-xl font-bold" style={{ color: theme.accent }}>Séance terminée !</p>
            <p className="text-sm" style={{ color: theme.muted }}>
              Durée totale : {Math.round((Date.now() - startedAt) / 1000)}s
              {pausedSeconds > 0 ? ` (dont ${pausedSeconds}s en pause)` : ''}
            </p>
          </div>
        )}

        <div className="flex gap-3">
          {!running && !done && (
            <button onClick={start} className="flex-1 flex items-center justify-center gap-2 rounded-xl py-3 font-medium" style={{ backgroundColor: theme.accent, color: theme.accentContrast }}>
              <Play className="w-4 h-4" /> Démarrer
            </button>
          )}
          {running && !done && (
            <button
              onClick={() => setPaused((p) => !p)}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl py-3 font-medium"
              style={{ backgroundColor: theme.accent, color: theme.accentContrast }}
            >
              {paused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
              {paused ? 'Reprendre' : 'Pause'}
            </button>
          )}
          {(running || done) && (
            <button onClick={reset} className="flex-1 flex items-center justify-center gap-2 rounded-xl py-3 font-medium border" style={{ borderColor: theme.cardBorder, color: theme.text }}>
              <RotateCcw className="w-4 h-4" /> Réinitialiser
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
