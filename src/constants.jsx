import { useState, useEffect, useRef } from 'react';

export const ZONES = [
  { name: 'Récup', full: 'Récupération active', range: [50, 65], mid: 55, color: '#F472B6' },
  { name: 'Fond.', full: 'Endurance fondamentale', range: [65, 75], mid: 70, color: '#60A5FA' },
  { name: 'Seuil V1', full: 'Seuil V1 (aérobie)', range: [76, 81], mid: 79, color: '#A78BFA' },
  { name: 'Seuil V2', full: 'Seuil V2 (anaérobie)', range: [82, 92], mid: 87, color: '#EC4899' },
  { name: 'VMA longue', full: 'VMA longue (fractionné long)', range: [92, 105], mid: 100, color: '#FACC15' },
  { name: 'VMA courte', full: 'VMA courte (fractionné court)', range: [105, 120], mid: 112, color: '#FB923C' },
  { name: 'Sprint', full: 'Sprint / anaérobie', range: [120, 130], mid: 125, color: '#EF4444' },
];

export const MONO = { fontFamily: "ui-monospace, 'SF Mono', 'Roboto Mono', Menlo, monospace" };

export const THEMES = {
  dark: {
    bg: '#0B1120', text: '#E6EDF7', muted: '#7A8699',
    cardBg: '#121A2B', cardBorder: '#1E293F',
    inputBg: '#0B1120', inputBorder: '#1E293F',
    accent: '#C6FF3D', accentContrast: '#0B1120',
  },
  light: {
    bg: '#EAF0EC', text: '#0B1120', muted: '#5B6472',
    cardBg: '#DCE8E0', cardBorder: '#C4D6C9',
    inputBg: '#EAF0EC', inputBorder: '#C4D6C9',
    accent: '#3D6B1F', accentContrast: '#FFFFFF',
  },
};

export function useAnimatedNumber(value, duration = 350) {
  const [display, setDisplay] = useState(value);
  const frame = useRef(null);
  const start = useRef(null);
  const from = useRef(value);

  useEffect(() => {
    from.current = display;
    start.current = null;
    cancelAnimationFrame(frame.current);
    const step = (ts) => {
      if (!start.current) start.current = ts;
      const progress = Math.min((ts - start.current) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(from.current + (value - from.current) * eased);
      if (progress < 1) frame.current = requestAnimationFrame(step);
    };
    frame.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return display;
}

let sharedAudioCtx = null;
function getAudioCtx() {
  if (!sharedAudioCtx) {
    sharedAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (sharedAudioCtx.state === 'suspended') sharedAudioCtx.resume();
  return sharedAudioCtx;
}

export function beep(freq = 880, dur = 0.15) {
  try {
    const ctx = getAudioCtx();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.value = freq;
    osc.type = 'square';
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + dur);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + dur);
  } catch (e) { /* audio indisponible */ }
}

export function gong() {
  try {
    const ctx = getAudioCtx();
    const now = ctx.currentTime;
    [220, 330, 440].forEach((f, i) => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.frequency.value = f;
      osc.type = 'sine';
      g.gain.setValueAtTime(0.0001, now);
      g.gain.linearRampToValueAtTime(0.22 / (i + 1), now + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, now + 1.8);
      osc.connect(g);
      g.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 1.8);
    });
  } catch (e) { /* audio indisponible */ }
}

export function formatDuration(sec) {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  return h > 0 ? `${h}h${m.toString().padStart(2, '0')}min${s.toString().padStart(2, '0')}` : `${m}min${s.toString().padStart(2, '0')}s`;
}

export function ResultCard({ icon: Icon, label, value, unit, theme, color }) {
  return (
    <div className="relative rounded-2xl overflow-hidden border" style={{ borderColor: theme.cardBorder, backgroundColor: theme.cardBg }}>
      <div className="h-1 w-full" style={{ backgroundColor: color }} />
      <div className="p-5">
        <div className="flex items-center gap-2 mb-3">
          <Icon className="w-4 h-4" style={{ color }} />
          <p className="text-xs uppercase tracking-widest" style={{ color: theme.muted }}>{label}</p>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-bold" style={{ ...MONO, color }}>{value}</span>
          <span className="text-sm" style={{ color: theme.muted }}>{unit}</span>
        </div>
      </div>
    </div>
  );
}
