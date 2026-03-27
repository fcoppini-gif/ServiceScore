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
