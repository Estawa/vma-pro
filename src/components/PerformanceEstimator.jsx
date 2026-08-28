import React, { useState, useMemo } from 'react';
import { Activity, Zap } from 'lucide-react';
import { MONO } from '../constants';
import ScreenHeader from './ScreenHeader';

const DISTANCES = [
  { label: '1 km', km: 1, coeff: 0.95 },
  { label: '5 km', km: 5, coeff: 0.90 },
  { label: '10 km', km: 10, coeff: 0.85 },
  { label: 'Semi-marathon', km: 21.097, coeff: 0.80 },
  { label: 'Marathon', km: 42.195, coeff: 0.75 },
];

function formatHMS(totalSec) {
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = Math.round(totalSec % 60);
  if (h > 0) return `${h}h${m.toString().padStart(2, '0')}'${s.toString().padStart(2, '0')}"`;
  return `${m}'${s.toString().padStart(2, '0')}"`;
}

export default function PerformanceEstimator({ theme, dark, setDark, onBack }) {
  const [vmaPerso, setVmaPerso] = useState(16);

  const [distKm, setDistKm] = useState('');
  const [distM, setDistM] = useState('');
  const [timeH, setTimeH] = useState('');
  const [timeMin, setTimeMin] = useState('');
  const [timeSec, setTimeSec] = useState('');

  const estimates = useMemo(() => {
    return DISTANCES.map((d) => {
      const speed = vmaPerso * d.coeff;
      const timeSecTotal = speed > 0 ? (d.km / speed) * 3600 : 0;
      return { ...d, speed, timeSecTotal };
    });
  }, [vmaPerso]);

  const effort = useMemo(() => {
    const totalKm = (parseFloat(distKm) || 0) + (parseFloat(distM) || 0) / 1000;
    const totalSec = (parseInt(timeH) || 0) * 3600 + (parseInt(timeMin) || 0) * 60 + (parseInt(timeSec) || 0);
    if (totalKm <= 0 || totalSec <= 0) return null;
    const speedKmh = totalKm / (totalSec / 3600);
    const vmaPercentEffort = vmaPerso > 0 ? (speedKmh / vmaPerso) * 100 : 0;
    const load = (vmaPercentEffort / 100) * (totalSec / 60);
    return { speedKmh, vmaPercentEffort, load };
  }, [distKm, distM, timeH, timeMin, timeSec, vmaPerso]);

  return (
    <div className="space-y-6">
      <ScreenHeader theme={theme} subtitle="Performances estimées" onBack={onBack} dark={dark} setDark={setDark} />

      <div className="rounded-2xl border p-5 space-y-2" style={{ borderColor: theme.cardBorder, backgroundColor: theme.cardBg }}>
        <label className="flex items-center gap-2 text-xs uppercase tracking-widest" style={{ color: theme.muted }}>
          <Activity className="w-3.5 h-3.5" /> VMA Perso (km/h)
        </label>
        <input
          type="number" step="0.1" min="0" value={vmaPerso}
          onChange={(e) => setVmaPerso(parseFloat(e.target.value) || 0)}
          className="w-full rounded-lg px-3 py-2 text-2xl font-bold border"
          style={{ ...MONO, borderColor: theme.inputBorder, backgroundColor: theme.inputBg, color: theme.text }}
        />
      </div>

      <div className="rounded-2xl border overflow-hidden" style={{ borderColor: theme.cardBorder, backgroundColor: theme.cardBg }}>
        <div className="grid grid-cols-3 gap-2 px-5 py-3 text-xs uppercase tracking-widest" style={{ color: theme.muted, borderBottom: `1px solid ${theme.cardBorder}` }}>
          <span>Distance</span>
          <span className="text-right">Allure</span>
          <span className="text-right">Temps estimé</span>
        </div>
        {estimates.map((e, i) => (
          <div
            key={e.label}
            className="grid grid-cols-3 gap-2 px-5 py-3 items-center"
            style={{ borderTop: i === 0 ? 'none' : `1px solid ${theme.cardBorder}` }}
          >
            <span className="font-medium" style={{ color: theme.text }}>{e.label}</span>
            <span className="text-right text-sm" style={{ ...MONO, color: theme.muted }}>{e.speed.toFixed(2)} km/h</span>
            <span className="text-right font-bold" style={{ ...MONO, color: theme.accent }}>{formatHMS(e.timeSecTotal)}</span>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border p-5 space-y-4" style={{ borderColor: theme.cardBorder, backgroundColor: theme.cardBg }}>
        <h3 className="text-sm font-bold flex items-center gap-2" style={{ color: theme.text }}>
          <Zap className="w-4 h-4" style={{ color: theme.accent }} /> Évaluer une performance réelle
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-center font-medium mb-1" style={{ color: theme.muted }}>Distance (km)</label>
            <input
              type="number" min="0" placeholder="0" value={distKm}
              onChange={(e) => setDistKm(e.target.value)}
              className="w-full rounded-lg px-2 py-2 text-center font-bold border"
              style={{ ...MONO, borderColor: theme.inputBorder, backgroundColor: theme.inputBg, color: theme.text }}
            />
          </div>
          <div>
            <label className="block text-xs text-center font-medium mb-1" style={{ color: theme.muted }}>Distance (m)</label>
            <input
              type="number" min="0" max="999" placeholder="0" value={distM}
              onChange={(e) => setDistM(e.target.value)}
              className="w-full rounded-lg px-2 py-2 text-center font-bold border"
              style={{ ...MONO, borderColor: theme.inputBorder, backgroundColor: theme.inputBg, color: theme.text }}
            />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-xs text-center font-medium mb-1" style={{ color: theme.muted }}>Heures</label>
            <input
              type="number" min="0" placeholder="0" value={timeH}
              onChange={(e) => setTimeH(e.target.value)}
              className="w-full rounded-lg px-2 py-2 text-center font-bold border"
              style={{ ...MONO, borderColor: theme.inputBorder, backgroundColor: theme.inputBg, color: theme.text }}
            />
          </div>
          <div>
            <label className="block text-xs text-center font-medium mb-1" style={{ color: theme.muted }}>Minutes</label>
            <input
              type="number" min="0" max="59" placeholder="0" value={timeMin}
              onChange={(e) => setTimeMin(e.target.value)}
              className="w-full rounded-lg px-2 py-2 text-center font-bold border"
              style={{ ...MONO, borderColor: theme.inputBorder, backgroundColor: theme.inputBg, color: theme.text }}
            />
          </div>
          <div>
            <label className="block text-xs text-center font-medium mb-1" style={{ color: theme.muted }}>Secondes</label>
            <input
              type="number" min="0" max="59" placeholder="0" value={timeSec}
              onChange={(e) => setTimeSec(e.target.value)}
              className="w-full rounded-lg px-2 py-2 text-center font-bold border"
              style={{ ...MONO, borderColor: theme.inputBorder, backgroundColor: theme.inputBg, color: theme.text }}
            />
          </div>
        </div>

        {effort && (
          <div className="grid grid-cols-3 gap-3 pt-2">
            <div className="text-center">
              <p className="text-xs" style={{ color: theme.muted }}>Vitesse</p>
              <p className="font-bold" style={{ ...MONO, color: theme.text }}>{effort.speedKmh.toFixed(2)} km/h</p>
            </div>
            <div className="text-center">
              <p className="text-xs" style={{ color: theme.muted }}>%VMA de l'effort</p>
              <p className="font-bold text-lg" style={{ ...MONO, color: theme.accent }}>{effort.vmaPercentEffort.toFixed(1)}%</p>
            </div>
            <div className="text-center">
              <p className="text-xs" style={{ color: theme.muted }}>Charge</p>
              <p className="font-bold" style={{ ...MONO, color: theme.text }}>{effort.load.toFixed(1)} u.a.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
