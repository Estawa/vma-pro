import React from 'react';
import { Gauge, Clock, Ruler, Flame, Activity, Weight, Zap, Save, QrCode, History } from 'lucide-react';
import { ZONES, MONO, ResultCard, useAnimatedNumber } from '../constants';
import ScreenHeader from './ScreenHeader';

export default function Home({
  theme, dark, setDark,
  vma, setVma, weight, setWeight, vmaPercent, setVmaPercent,
  isSaving, saveMsg, saveSettings, logSession, history,
  appUrl, qrSrc, onOpenHistory,
}) {
  const targetSpeed = vma * (vmaPercent / 100);
  const paceMinPerKm = targetSpeed > 0 ? 60 / targetSpeed : 0;
  const paceMin = Math.floor(paceMinPerKm);
  const paceSec = Math.round((paceMinPerKm - paceMin) * 60);
  const distance30s = (targetSpeed * 1000) / (3600 / 30);
  const time50m = targetSpeed > 0 ? (50 / (targetSpeed * 1000)) * 3600 : 0;
  const met = 3.5 + targetSpeed * 0.8;
  const caloriesPerMin = (met * weight * 3.5) / 200;

  const animSpeed = useAnimatedNumber(targetSpeed);
  const animDist = useAnimatedNumber(distance30s);
  const animTime50 = useAnimatedNumber(time50m);
  const animCal = useAnimatedNumber(caloriesPerMin);

  const activeZone = ZONES.reduce((closest, z) => {
    if (vmaPercent < z.range[0] || vmaPercent > z.range[1]) return closest;
    if (!closest) return z;
    return Math.abs(vmaPercent - z.mid) < Math.abs(vmaPercent - closest.mid) ? z : closest;
  }, null);

  return (
    <div className="space-y-6">
      <ScreenHeader theme={theme} subtitle="Chrono. entraînement course à pied" dark={dark} setDark={setDark} />

      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        {ZONES.map((z) => {
          const isActive = activeZone?.name === z.name;
          return (
            <button
              key={z.name}
              onClick={() => setVmaPercent(z.mid)}
              className="shrink-0 px-4 py-2 rounded-full text-sm font-medium border transition-colors"
              style={isActive
                ? { backgroundColor: z.color, color: '#0B1120', borderColor: 'transparent' }
                : { borderColor: theme.cardBorder, color: theme.muted }}
            >
              {z.name}
            </button>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-5">
          <div className="rounded-2xl border p-5 space-y-5" style={{ borderColor: theme.cardBorder, backgroundColor: theme.cardBg }}>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs uppercase tracking-widest" style={{ color: theme.muted }}>
                <Activity className="w-3.5 h-3.5" /> VMA (km/h)
              </label>
              <input
                type="number" step="0.1" min="0" value={vma}
                onChange={(e) => setVma(parseFloat(e.target.value) || 0)}
                className="w-full rounded-lg px-3 py-2 text-2xl font-bold border"
                style={{ ...MONO, borderColor: theme.inputBorder, backgroundColor: theme.inputBg, color: theme.text }}
              />
            </div>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs uppercase tracking-widest" style={{ color: theme.muted }}>
                <Weight className="w-3.5 h-3.5" /> Poids (kg)
              </label>
              <input
                type="number" step="0.1" min="0" value={weight}
                onChange={(e) => setWeight(parseFloat(e.target.value) || 0)}
                className="w-full rounded-lg px-3 py-2 text-2xl font-bold border"
                style={{ ...MONO, borderColor: theme.inputBorder, backgroundColor: theme.inputBg, color: theme.text }}
              />
            </div>
            <div className="border-t pt-4 space-y-3" style={{ borderColor: theme.cardBorder }}>
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-xs uppercase tracking-widest" style={{ color: theme.muted }}>
                  <Zap className="w-3.5 h-3.5" /> % VMA
                </label>
                <span className="text-3xl font-bold" style={{ ...MONO, color: theme.accent }}>{vmaPercent}%</span>
              </div>
              {activeZone && <p className="text-xs font-medium" style={{ color: activeZone.color }}>{activeZone.full}</p>}
              <input
                type="range" min={50} max={130} step={1} value={vmaPercent}
                onChange={(e) => setVmaPercent(parseInt(e.target.value))}
                className="w-full cursor-pointer"
                style={{ accentColor: theme.accent }}
              />
            </div>
            <div className="flex gap-2">
              <button onClick={saveSettings} disabled={isSaving} className="flex-1 flex items-center justify-center gap-2 rounded-xl py-3 font-medium" style={{ backgroundColor: theme.accent, color: theme.accentContrast }}>
                <Save className="w-4 h-4" /> {isSaving ? '...' : 'Sauvegarder'}
              </button>
              <button
                onClick={() => logSession({
                  activeZone, targetSpeed, paceMin, paceSec,
                  distance30s, time50m, caloriesPerMin,
                })}
                className="px-4 rounded-xl border font-medium" style={{ borderColor: theme.cardBorder, color: theme.text }}>
                <History className="w-4 h-4" />
              </button>
            </div>
            {saveMsg && <p className="text-xs text-center" style={{ color: theme.muted }}>{saveMsg}</p>}
          </div>

          <button
            onClick={onOpenHistory}
            className="w-full flex items-center justify-center gap-2 rounded-2xl border py-4 font-medium"
            style={{ borderColor: theme.cardBorder, backgroundColor: theme.cardBg, color: theme.text }}
          >
            <History className="w-4 h-4" style={{ color: theme.accent }} /> Voir l'historique ({history.length})
          </button>

          <div className="rounded-2xl border p-5 space-y-3" style={{ borderColor: theme.cardBorder, backgroundColor: theme.cardBg }}>
            <h3 className="text-sm font-bold flex items-center gap-2" style={{ color: theme.text }}>
              <QrCode className="w-4 h-4" style={{ color: theme.accent }} /> Partager
            </h3>
            <img
              src={qrSrc}
              alt="QR code"
              className="rounded-lg mx-auto"
              width={160}
              height={160}
              onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextSibling.style.display = 'flex'; }}
            />
            <div style={{ display: 'none', width: 160, height: 160, backgroundColor: theme.inputBg, color: theme.muted }} className="rounded-lg mx-auto items-center justify-center text-xs text-center p-4">
              QR code non disponible ici — utilise le bouton ci-dessous
            </div>
            <button
              onClick={async () => {
                if (navigator.share) {
                  try { await navigator.share({ title: 'VMA Pro', text: 'Calcule ta vitesse, ton allure et tes calories selon ta VMA', url: appUrl }); } catch (e) { /* annulé */ }
                } else {
                  try { await navigator.clipboard.writeText(appUrl); } catch (e) { /* ignore */ }
                }
              }}
              className="w-full flex items-center justify-center gap-2 rounded-xl py-2.5 font-medium"
              style={{ backgroundColor: theme.accent, color: theme.accentContrast }}
            >
              Partager le lien
            </button>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-5">
          <div className="grid sm:grid-cols-2 gap-4">
            <ResultCard icon={Gauge} label="Vitesse" value={animSpeed.toFixed(2)} unit="km/h" theme={theme} color="#38BDF8" />
            <ResultCard icon={Clock} label="Allure" value={`${paceMin}'${paceSec.toString().padStart(2, '0')}`} unit="min/km" theme={theme} color="#4ADE80" />
            <ResultCard icon={Ruler} label="Distance 30s" value={animDist.toFixed(0)} unit="mètres" theme={theme} color="#C4B5FD" />
            <ResultCard icon={Clock} label="Temps 50m" value={animTime50.toFixed(1)} unit="secondes" theme={theme} color="#FB923C" />
            <ResultCard icon={Flame} label="Calories" value={animCal.toFixed(1)} unit="kcal/min" theme={theme} color="#F87171" />
          </div>
        </div>
      </div>
    </div>
  );
}
