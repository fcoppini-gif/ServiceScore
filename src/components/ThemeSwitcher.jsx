// =============================================================================
// COMPONENTE: ThemeSwitcher - Toggle a 3 modalità per il tema
// =============================================================================
// Tre opzioni: ☀️ Chiaro | 💻 Sistema | 🌙 Scuro
// Il tema attivo ha sfondo brand (blu in light, rosso in dark).
//
// PROPS:
//   theme: valore attuale ('light' | 'system' | 'dark')
//   onThemeChange: callback per cambiare il tema
//
// COLLEGAMENTI:
// - Passato come prop a LoginView e DashboardView tramite ThemeSwitcherWrapper
// - Lo stato del tema è gestito in App.jsx (useEffect + localStorage)
// =============================================================================

import { Sun, Moon, Laptop } from 'lucide-react';

const ThemeSwitcher = ({ theme, onThemeChange }) => (
  <div className="flex bg-white/30 dark:bg-white/10 backdrop-blur-md p-1.5 rounded-2xl border border-white/20 shadow-xl">
    {[
      { id: 'light', icon: Sun },
      { id: 'system', icon: Laptop },
      { id: 'dark', icon: Moon },
    ].map((item) => (
      <button
        key={item.id}
        onClick={() => onThemeChange(item.id)}
        className={`p-3 rounded-xl transition-all cursor-pointer ${
          theme === item.id
            ? 'bg-brand-blue dark:bg-brand-red text-white shadow-md'
            : 'text-brand-blue dark:text-slate-500 hover:text-brand-blue dark:hover:text-white'
        }`}
      >
        <item.icon size={20} />
      </button>
    ))}
  </div>
);

export default ThemeSwitcher;
