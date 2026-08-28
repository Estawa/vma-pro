import React, { useState, useEffect } from 'react';
import { Gauge, Timer, History, Activity, Layers, TrendingUp, Watch } from 'lucide-react';
import { THEMES } from './constants';
import Home from './components/Home';
import IntervalTimer from './components/IntervalTimer';
import HistoryScreen from './components/HistoryScreen';
import BorgScale from './components/BorgScale';
import LoadCalculator from './components/LoadCalculator';
import PerformanceEstimator from './components/PerformanceEstimator';
import Chronometer from './components/Chronometer';

const STORAGE_KEY = 'vma-pro-settings';
const HISTORY_KEY = 'vma-pro-history';

const TABS = [
  { id: 'home', label: 'Accueil', icon: Gauge },
  { id: 'timer', label: 'Minuteur', icon: Timer },
  { id: 'history', label: 'Historique', icon: History },
  { id: 'chrono', label: 'Chronomètre', icon: Watch },
  { id: 'borg', label: 'Borg', icon: Activity },
  { id: 'load', label: 'Charge', icon: Layers },
  { id: 'perf', label: 'Performances', icon: TrendingUp },
];

export default function VMACalculator() {
  const [dark, setDark] = useState(true);
  const [activeTab, setActiveTab] = useState('home');

  const [vma, setVma] = useState(16);
  const [weight, setWeight] = useState(70);
  const [vmaPercent, setVmaPercent] = useState(80);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');
  const [history, setHistory] = useState([]);

  const theme = dark ? THEMES.dark : THEMES.light;

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const data = JSON.parse(raw);
        if (data.vma) setVma(data.vma);
        if (data.weight) setWeight(data.weight);
      }
      const rawHist = localStorage.getItem(HISTORY_KEY);
      if (rawHist) setHistory(JSON.parse(rawHist));
    } catch (e) { /* rien de sauvegardé */ }
  }, []);

  const saveSettings = () => {
    setIsSaving(true);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ vma, weight }));
      setSaveMsg('Sauvegardé !');
    } catch (e) {
      setSaveMsg('Échec.');
    }
    setIsSaving(false);
    setTimeout(() => setSaveMsg(''), 2000);
  };

  const logSession = ({ activeZone, targetSpeed, paceMin, paceSec, distance30s, time50m, caloriesPerMin }) => {
    const charge = vmaPercent / 100; // charge de référence pour 1 min de travail à ce %VMA
    const entry = {
      id: Date.now(),
      date: new Date().toLocaleDateString('fr-FR'),
      vma, weight, vmaPercent,
      zone: activeZone ? activeZone.name : '—',
      speed: targetSpeed.toFixed(2),
      pace: `${paceMin}'${paceSec.toString().padStart(2, '0')}`,
      distance30s: distance30s.toFixed(0),
      time50m: time50m.toFixed(1),
      calories: caloriesPerMin.toFixed(1),
      charge: charge.toFixed(1),
    };
    const updated = [entry, ...history].slice(0, 30);
    setHistory(updated);
    try { localStorage.setItem(HISTORY_KEY, JSON.stringify(updated)); } catch (e) { /* ignore */ }
  };

  const deleteSession = (id) => {
    const updated = history.filter((h) => h.id !== id);
    setHistory(updated);
    try { localStorage.setItem(HISTORY_KEY, JSON.stringify(updated)); } catch (e) { /* ignore */ }
  };

  const appUrl = typeof window !== 'undefined' ? window.location.href : '';
  const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&margin=8&color=${dark ? 'C6FF3D' : '3D6B1F'}&bgcolor=${dark ? '0B1120' : 'FFFFFF'}&data=${encodeURIComponent(appUrl)}`;

  const goHome = () => setActiveTab('home');
  const screenProps = { theme, dark, setDark, onBack: goHome };

  return (
    <div className="min-h-screen p-4 md:p-8 transition-colors duration-300" style={{ backgroundColor: theme.bg }}>
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
          {TABS.map((t) => {
            const isActive = activeTab === t.id;
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className="shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium border transition-colors"
                style={isActive
                  ? { backgroundColor: theme.accent, color: theme.accentContrast, borderColor: 'transparent' }
                  : { borderColor: theme.cardBorder, color: theme.muted, backgroundColor: theme.cardBg }}
              >
                <Icon className="w-3.5 h-3.5" />
                {t.label}
              </button>
            );
          })}
        </div>

        {activeTab === 'home' && (
          <Home
            theme={theme} dark={dark} setDark={setDark}
            vma={vma} setVma={setVma} weight={weight} setWeight={setWeight}
            vmaPercent={vmaPercent} setVmaPercent={setVmaPercent}
            isSaving={isSaving} saveMsg={saveMsg} saveSettings={saveSettings}
            logSession={logSession} history={history}
            appUrl={appUrl} qrSrc={qrSrc}
            onOpenHistory={() => setActiveTab('history')}
          />
        )}
        {activeTab === 'timer' && <IntervalTimer {...screenProps} />}
        {activeTab === 'history' && <HistoryScreen {...screenProps} history={history} onDelete={deleteSession} />}
        {activeTab === 'borg' && <BorgScale {...screenProps} />}
        {activeTab === 'load' && <LoadCalculator {...screenProps} />}
        {activeTab === 'perf' && <PerformanceEstimator {...screenProps} />}
        {activeTab === 'chrono' && <Chronometer {...screenProps} />}
      </div>
    </div>
  );
}
