import React, { useEffect, useRef, useState } from 'react';
import { Check, LogOut, Moon, Settings, Sun } from 'lucide-react';
import { useLanguageStore, Language } from '../../store/useLanguageStore';
import { useThemeStore } from '../../store/useThemeStore';

const LANGUAGES: { code: Language; name: string }[] = [
  { code: 'fr', name: 'Français' },
  { code: 'en', name: 'English' },
  { code: 'ar', name: 'العربية' },
];

const COPY = {
  fr: { settings: 'Paramètres', language: 'Langue', dark: 'Mode sombre', logout: 'Se déconnecter' },
  en: { settings: 'Settings', language: 'Language', dark: 'Dark mode', logout: 'Log out' },
  ar: { settings: 'الإعدادات', language: 'اللغة', dark: 'الوضع الداكن', logout: 'تسجيل الخروج' },
} as const;

/**
 * The settings of a signed-in user behind one gear button: language, dark mode and log out.
 * (Visitors keep the plain language and theme buttons in the header.)
 */
export const SettingsMenu: React.FC<{ onLogout?: () => void }> = ({ onLogout }) => {
  const { language, setLanguage } = useLanguageStore();
  const { theme, toggleTheme } = useThemeStore();
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const c = COPY[language] ?? COPY.fr;
  const dark = theme === 'dark';

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      if (root.current && !root.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        root.current?.querySelector<HTMLButtonElement>('button[aria-haspopup]')?.focus();
      }
    };
    document.addEventListener('pointerdown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div ref={root} className="relative shrink-0">
      <button
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={c.settings}
        title={c.settings}
        onClick={() => setOpen((v) => !v)}
        className="w-11 h-11 rounded-full border-[1.5px] border-light-border dark:border-dark-border bg-white dark:bg-dark-card grid place-items-center hover:bg-light-tile dark:hover:bg-dark-surface transition-colors"
      >
        <Settings
          className={`w-5 h-5 transition-transform duration-300 ${open ? 'rotate-90' : ''}`}
          aria-hidden="true"
        />
      </button>

      {open && (
        <div
          role="dialog"
          aria-label={c.settings}
          className="absolute end-0 top-[calc(100%+8px)] z-50 w-[260px] rounded-2xl border border-light-border dark:border-dark-border bg-white dark:bg-dark-card shadow-xl p-2"
        >
          <p className="micro px-3 pt-2 pb-1.5 font-sans">{c.language}</p>
          <div role="radiogroup" aria-label={c.language}>
            {LANGUAGES.map((l) => {
              const selected = l.code === language;
              return (
                <button
                  key={l.code}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  lang={l.code}
                  onClick={() => setLanguage(l.code)}
                  className={`w-full h-11 px-3 rounded-xl flex items-center justify-between text-sm font-semibold text-start transition-colors ${
                    selected ? 'bg-light-tile dark:bg-dark-surface' : 'hover:bg-light-tile dark:hover:bg-dark-surface'
                  }`}
                >
                  {l.name}
                  {selected && <Check className="w-4 h-4 text-brand-500 dark:text-brand-accent" aria-hidden="true" />}
                </button>
              );
            })}
          </div>

          <div className="my-2 h-px bg-light-border dark:bg-dark-border" />

          <button
            type="button"
            role="switch"
            aria-checked={dark}
            onClick={toggleTheme}
            className="w-full h-11 px-3 rounded-xl flex items-center justify-between text-sm font-semibold hover:bg-light-tile dark:hover:bg-dark-surface transition-colors"
          >
            <span className="inline-flex items-center gap-2.5">
              {dark ? (
                <Moon className="w-[18px] h-[18px]" aria-hidden="true" />
              ) : (
                <Sun className="w-[18px] h-[18px]" aria-hidden="true" />
              )}
              {c.dark}
            </span>
            <span
              aria-hidden="true"
              className={`relative w-10 h-6 rounded-full transition-colors ${dark ? 'bg-brand-500 dark:bg-brand-accent' : 'bg-slate-300'}`}
            >
              <span
                className={`absolute top-1 start-1 w-4 h-4 rounded-full bg-white dark:bg-slate-900 transition-transform ${
                  dark ? 'translate-x-4 rtl:-translate-x-4' : ''
                }`}
              />
            </span>
          </button>

          {onLogout && (
            <>
              <div className="my-2 h-px bg-light-border dark:bg-dark-border" />
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  onLogout();
                }}
                className="w-full h-11 px-3 rounded-xl flex items-center gap-2.5 text-sm font-semibold text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
              >
                <LogOut className="w-[18px] h-[18px] rtl:-scale-x-100" aria-hidden="true" />
                {c.logout}
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};
