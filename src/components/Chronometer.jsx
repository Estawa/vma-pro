import React, { useState, useRef, useEffect } from 'react';
import { Play, Square, RotateCcw, Ruler } from 'lucide-react';
import { MONO, beep } from '../constants';
import ScreenHeader from './ScreenHeader';

export default function Chronometer({ theme, dark, setDark, onBack }) {
  const [running, setRunning] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);
  const startRef = useRef(null);
  const frameRef = useRef(null);

  const [distKm, setDistKm] = useState('');
  const [distM, setDistM] = useState('');

  useEffect(() => {
    if (!running) return;
    const tick = () => {
      setElapsedMs(Date.now() - startRef.current);
      frameRef.current = requestAnimationFrame(tick);
    };
    frameRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameRef.current);
  }, [running]);

  const toggle = () => {
    if (running) {
      setRunning(false);
      beep(440, 0.12);
    } else {
      startRef.current = Date.now() - elapsedMs;
      setRunning(true);
      beep(880, 0.12);
    }
  };

  const reset = () => {
    if (running) return;
    setElapsedMs(0);
  };

  const totalSec = elapsedMs / 1000;
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = Math.floor(totalSec % 60);
  const cs = Math.floor((elapsedMs % 1000) / 10);

  const totalKm = (parseFloat(distKm) || 0) + (parseFloat(distM) || 0) / 1000;
  const speedKmh = totalKm > 0 && totalSec > 0 ? totalKm / (totalSec / 3600) : 0;

  return (
    <div className="space-y-6">
      <ScreenHeader theme={theme} subtitle="Chronomètre" onBack={onBack} dark={dark} setDark={setDark} />

      <div className="rounded-2xl border p-6 flex flex-col items-center gap-6" style={{ borderColor: theme.cardBorder, backgroundColor: theme.cardBg }}>
        <div className="flex items-baseline justify-center" style={{ ...MONO, color: theme.text }}>
          <span className="text-5xl md:text-6xl font-bold">
            {h.toString().padStart(2, '0')}:{m.toString().padStart(2, '0')}:{s.toString().padStart(2, '0')}
          </span>
          <span className="text-2xl md:text-3xl font-bold" style={{ color: theme.muted }}>.{cs.toString().padStart(2, '0')}</span>
        </div>

        <button
          onClick={toggle}
          className="w-full max-w-xs flex items-center justify-center gap-2 rounded-2xl py-6 text-xl font-bold active:scale-95 transition-transform"
          style={{ backgroundColor: running ? '#EF4444' : theme.accent, color: running ? '#FFFFFF' : theme.accentContrast }}
        >
          {running ? <Square className="w-6 h-6" /> : <Play className="w-6 h-6" />}
          {running ? 'Arrêter' : 'Départ'}
        </button>

        <div className="w-full rounded-2xl border p-4 space-y-3" style={{ borderColor: theme.cardBorder, backgroundColor: theme.bg }}>
          <div className="flex items-center gap-2 text-xs uppercase tracking-widest" style={{ color: theme.muted }}>
            <Ruler className="w-3.5 h-3.5" /> Distance parcourue
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-center font-medium mb-1" style={{ color: theme.muted }}>km</label>
              <input
                type="number" min="0" placeholder="0" value={distKm}
                onChange={(e) => setDistKm(e.target.value)}
                className="w-full rounded-lg px-2 py-2 text-center font-bold border"
                style={{ ...MONO, borderColor: theme.inputBorder, backgroundColor: theme.inputBg, color: theme.text }}
              />
            </div>
            <div>
              <label className="block text-xs text-center font-medium mb-1" style={{ color: theme.muted }}>m</label>
              <input
                type="number" min="0" max="999" placeholder="0" value={distM}
                onChange={(e) => setDistM(e.target.value)}
                className="w-full rounded-lg px-2 py-2 text-center font-bold border"
                style={{ ...MONO, borderColor: theme.inputBorder, backgroundColor: theme.inputBg, color: theme.text }}
              />
            </div>
          </div>
          <div className="text-center pt-1">
            <span className="text-2xl font-bold" style={{ ...MONO, color: theme.accent }}>{speedKmh.toFixed(2)}</span>
            <span className="text-sm ml-1" style={{ color: theme.muted }}>km/h</span>
          </div>
        </div>

        <button
          onClick={reset}
          disabled={running}
          className="w-full max-w-xs flex items-center justify-center gap-2 rounded-xl py-3 font-medium border disabled:opacity-40"
          style={{ borderColor: theme.cardBorder, color: theme.text }}
        >
          <RotateCcw className="w-4 h-4" /> Réinitialiser
        </button>
      </div>
    </div>
  );
}
