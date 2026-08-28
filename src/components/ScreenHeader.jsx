import React from 'react';
import { ChevronLeft, Sun, Moon } from 'lucide-react';

export default function ScreenHeader({ theme, subtitle, onBack, dark, setDark, showThemeToggle = true }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        {onBack && (
          <button
            onClick={onBack}
            className="p-2 rounded-full border shrink-0"
            style={{ borderColor: theme.cardBorder }}
            aria-label="Retour"
          >
            <ChevronLeft className="w-5 h-5" style={{ color: theme.text }} />
          </button>
        )}
        <div>
          <h1 className="text-2xl font-bold" style={{ color: theme.text }}>
            VMA Pro <span className="text-sm font-normal" style={{ color: theme.muted }}>by C. Guilhem</span>
          </h1>
          {subtitle && <p className="text-xs" style={{ color: theme.muted }}>{subtitle}</p>}
        </div>
      </div>
      {showThemeToggle && (
        <button onClick={() => setDark(!dark)} className="p-2 rounded-full border" style={{ borderColor: theme.cardBorder }}>
          {dark ? <Sun className="w-5 h-5" style={{ color: theme.text }} /> : <Moon className="w-5 h-5" style={{ color: theme.text }} />}
        </button>
      )}
    </div>
  );
}
