import React from 'react';
import { Activity } from 'lucide-react';
import { MONO, ZONES } from '../constants';
import ScreenHeader from './ScreenHeader';

const BORG_LEVELS = [
  { level: 0, label: 'Aucun effort', color: '#60A5FA', zoneMid: null },
  { level: 1, label: 'Très très léger', color: '#5AC8FA', zoneMid: null },
  { level: 2, label: 'Très léger', color: '#4ADE80', zoneMid: 55 },
  { level: 3, label: 'Léger', color: '#86EFAC', zoneMid: 55 },
  { level: 4, label: 'Modéré', color: '#BEF264', zoneMid: 70 },
  { level: 5, label: 'Un peu difficile', color: '#FACC15', zoneMid: 70 },
  { level: 6, label: 'Difficile', color: '#FBBF24', zoneMid: 79 },
  { level: 7, label: 'Très difficile', color: '#FB923C', zoneMid: 87 },
  { level: 8, label: 'Très très difficile', color: '#F97316', zoneMid: 100 },
  { level: 9, label: 'Extrêmement difficile', color: '#EF4444', zoneMid: 112 },
  { level: 10, label: 'Effort maximal', color: '#DC2626', zoneMid: 125 },
];

function zoneForMid(mid) {
  if (mid == null) return null;
  return ZONES.find((z) => z.mid === mid) || null;
}

export default function BorgScale({ theme, dark, setDark, onBack }) {
  return (
    <div className="space-y-6">
      <ScreenHeader theme={theme} subtitle="Échelle de Borg (perception de l'effort)" onBack={onBack} dark={dark} setDark={setDark} />

      <div className="rounded-2xl border overflow-hidden" style={{ borderColor: theme.cardBorder, backgroundColor: theme.cardBg }}>
        {BORG_LEVELS.map((b, i) => (
          <div
            key={b.level}
            className="flex items-center gap-4 px-5 py-3"
            style={{ borderTop: i === 0 ? 'none' : `1px solid ${theme.cardBorder}` }}
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-bold text-lg"
              style={{ backgroundColor: b.color, color: '#0B1120', ...MONO }}
            >
              {b.level}
            </div>
            <div className="flex-1">
              <p className="font-medium" style={{ color: theme.text }}>{b.label}</p>
            </div>
            {zoneForMid(b.zoneMid) && (
              <span
                className="text-xs px-3 py-1 rounded-full font-medium shrink-0"
                style={{ backgroundColor: zoneForMid(b.zoneMid).color, color: '#0B1120' }}
              >
                {zoneForMid(b.zoneMid).name}
              </span>
            )}
          </div>
        ))}
      </div>

      <div className="rounded-2xl border p-5 space-y-3" style={{ borderColor: theme.cardBorder, backgroundColor: theme.cardBg }}>
        <h3 className="text-sm font-bold flex items-center gap-2" style={{ color: theme.text }}>
          <Activity className="w-4 h-4" style={{ color: theme.accent }} /> Correspondance avec les filières du cycle
        </h3>
        <div className="space-y-2">
          {ZONES.map((z) => (
            <div key={z.name} className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: z.color }} />
                <span style={{ color: theme.text }}>{z.full}</span>
              </span>
              <span style={{ ...MONO, color: theme.muted }}>{z.range[0]}–{z.range[1]}% VMA</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
