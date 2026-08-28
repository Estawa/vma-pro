import React from 'react';
import { History, Trash2 } from 'lucide-react';
import { MONO, ZONES } from '../constants';
import ScreenHeader from './ScreenHeader';

function zoneColor(name) {
  const z = ZONES.find((z) => z.name === name);
  return z ? z.color : '#7A8699';
}

function Field({ label, value, theme }) {
  return (
    <div className="text-center">
      <p className="text-[10px] uppercase tracking-wide" style={{ color: theme.muted }}>{label}</p>
      <p className="text-sm font-bold" style={{ ...MONO, color: theme.text }}>{value}</p>
    </div>
  );
}

export default function HistoryScreen({ theme, dark, setDark, onBack, history, onDelete }) {
  return (
    <div className="space-y-6">
      <ScreenHeader theme={theme} subtitle="Historique des séances" onBack={onBack} dark={dark} setDark={setDark} />

      <div className="rounded-2xl border p-5 space-y-3" style={{ borderColor: theme.cardBorder, backgroundColor: theme.cardBg }}>
        <h3 className="font-bold flex items-center gap-2" style={{ color: theme.text }}>
          <History className="w-5 h-5" style={{ color: theme.accent }} />
          {history.length} séance{history.length > 1 ? 's' : ''} enregistrée{history.length > 1 ? 's' : ''}
        </h3>

        <div className="space-y-3 max-h-[70vh] overflow-y-auto">
          {history.length === 0 && <p className="text-sm" style={{ color: theme.muted }}>Aucune séance enregistrée.</p>}
          {history.map((h) => (
            <div key={h.id} className="rounded-xl border p-4 space-y-3" style={{ borderColor: theme.cardBorder, backgroundColor: theme.bg }}>
              <div className="flex items-center justify-between">
                <span className="text-xs" style={{ color: theme.muted }}>{h.date}</span>
                <div className="flex items-center gap-2">
                  <span
                    className="text-xs px-3 py-1 rounded-full font-medium"
                    style={{ backgroundColor: zoneColor(h.zone), color: '#0B1120' }}
                  >
                    {h.zone}
                  </span>
                  <button
                    onClick={() => onDelete(h.id)}
                    className="p-1.5 rounded-full border shrink-0"
                    style={{ borderColor: theme.cardBorder }}
                    aria-label="Supprimer cette séance"
                  >
                    <Trash2 className="w-3.5 h-3.5" style={{ color: theme.muted }} />
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                <Field label="VMA" value={`${h.vma} km/h`} theme={theme} />
                <Field label="%VMA" value={`${h.vmaPercent}%`} theme={theme} />
                <Field label="Vitesse" value={`${h.speed} km/h`} theme={theme} />
                <Field label="Allure" value={`${h.pace}/km`} theme={theme} />
                <Field label="Dist. 30s" value={`${h.distance30s} m`} theme={theme} />
                <Field label="Temps 50m" value={`${h.time50m} s`} theme={theme} />
                <Field label="Calories" value={`${h.calories} kcal/min`} theme={theme} />
                <Field label="Charge" value={`${h.charge} u.a.`} theme={theme} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
