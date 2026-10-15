import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useThemeStore } from '../../store/useThemeStore';

export const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useThemeStore();
  const label = theme === 'dark' ? 'Passer en mode clair' : 'Passer en mode sombre';

  return (
    <button
      onClick={toggleTheme}
      className="w-11 h-11 rounded-full border-[1.5px] border-light-border dark:border-dark-border bg-white dark:bg-dark-card text-slate-900 dark:text-slate-100 hover:bg-light-tile dark:hover:bg-dark-surface transition-colors grid place-items-center shrink-0"
      title={label}
      aria-label={label}
      aria-pressed={theme === 'dark'}
      type="button"
    >
      {theme === 'dark' ? (
        <Sun className="w-5 h-5" aria-hidden="true" />
      ) : (
        <Moon className="w-5 h-5" aria-hidden="true" />
      )}
    </button>
  );
};
