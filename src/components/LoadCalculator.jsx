import React, { useState, useMemo } from 'react';
import { Layers, Gauge, Clock } from 'lucide-react';
import { MONO, ResultCard } from '../constants';
import ScreenHeader from './ScreenHeader';

const ROW_COUNT = 7;

function makeRow() {
  return { included: true, vmaPercent: '', min: '', sec: '' };
}

export default function LoadCalculator({ theme, dark, setDark, onBack }) {
  const [rows, setRows] = useState(Array.from({ length: ROW_COUNT }, makeRow));

  const updateRow = (i, patch) => {
    setRows((prev) => prev.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));
  };

  const { totalDurationSec, weightedVma, estimatedLoad } = useMemo(() => {
    let totalSec = 0;
    let weightedSum = 0;
    rows.forEach((r) => {
      if (!r.included) return;
      const vma = parseFloat(r.vmaPercent);
      const durSec = (parseInt(r.min) || 0) * 60 + (parseInt(r.sec) || 0);
      if (!vma || durSec <= 0) return;
      totalSec += durSec;
      weightedSum += vma * durSec;
    });
    const avgVma = totalSec > 0 ? weightedSum / totalSec : 0;
    const load = (avgVma / 100) * (totalSec / 60);
    return { totalDurationSec: totalSec, weightedVma: avgVma, estimatedLoad: load };
  }, [rows]);

  const formatMinSec = (sec) => {
    const m = Math.floor(sec / 60);
    const s = Math.round(sec % 60);
    return `${m}'${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      <ScreenHeader theme={theme} subtitle="Calculatrice de charge d'entraînement" onBack={onBack} dark={dark} setDark={setDark} />

      <div className="rounded-2xl border p-5 space-y-4" style={{ borderColor: theme.cardBorder, backgroundColor: theme.cardBg }}>
        <div className="grid grid-cols-12 gap-2 text-xs uppercase tracking-widest px-1" style={{ color: theme.muted }}>
          <div className="col-span-1"></div>
          <div className="col-span-5">% VMA</div>
          <div className="col-span-3">Min</div>
          <div className="col-span-3">Sec</div>
        </div>
        {rows.map((r, i) => (
          <div key={i} className="grid grid-cols-12 gap-2 items-center">
            <div className="col-span-1 flex justify-center">
              <input
                type="checkbox"
                checked={r.included}
                onChange={(e) => updateRow(i, { included: e.target.checked })}
                style={{ accentColor: theme.accent }}
                className="w-4 h-4"
              />
            </div>
            <input
              type="number" min="0" placeholder="—"
              value={r.vmaPercent}
              onChange={(e) => updateRow(i, { vmaPercent: e.target.value })}
              className="col-span-5 rounded-lg px-3 py-2 text-center font-bold border"
              style={{ ...MONO, borderColor: theme.inputBorder, backgroundColor: theme.inputBg, color: theme.text, opacity: r.included ? 1 : 0.4 }}
            />
            <input
              type="number" min="0" placeholder="0"
              value={r.min}
              onChange={(e) => updateRow(i, { min: e.target.value })}
              className="col-span-3 rounded-lg px-2 py-2 text-center font-bold border"
              style={{ ...MONO, borderColor: theme.inputBorder, backgroundColor: theme.inputBg, color: theme.text, opacity: r.included ? 1 : 0.4 }}
            />
            <input
              type="number" min="0" max="59" placeholder="0"
              value={r.sec}
              onChange={(e) => updateRow(i, { sec: e.target.value })}
              className="col-span-3 rounded-lg px-2 py-2 text-center font-bold border"
              style={{ ...MONO, borderColor: theme.inputBorder, backgroundColor: theme.inputBg, color: theme.text, opacity: r.included ? 1 : 0.4 }}
            />
          </div>
        ))}
        <p className="text-xs" style={{ color: theme.muted }}>
          Décoche une ligne pour l'exclure du calcul (ex. pour ne calculer que sur une partie de la séance).
        </p>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <ResultCard icon={Clock} label="Durée totale" value={formatMinSec(totalDurationSec)} unit="min" theme={theme} color="#38BDF8" />
        <ResultCard icon={Gauge} label="%VMA moyen (pondéré)" value={weightedVma.toFixed(1)} unit="%" theme={theme} color="#FACC15" />
        <ResultCard icon={Layers} label="Charge estimée" value={estimatedLoad.toFixed(1)} unit="u.a." theme={theme} color="#4ADE80" />
      </div>
    </div>
  );
}
