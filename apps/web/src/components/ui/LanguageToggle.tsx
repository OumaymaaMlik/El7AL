import React, { useEffect, useRef, useState } from 'react';
import { Check, ChevronDown, Globe } from 'lucide-react';
import { useLanguageStore, Language } from '../../store/useLanguageStore';

const LANGUAGES: { code: Language; short: string; name: string }[] = [
  { code: 'fr', short: 'FR', name: 'Français' },
  { code: 'en', short: 'EN', name: 'English' },
  { code: 'ar', short: 'عربي', name: 'العربية' },
];

/** Language picker: a button showing the current language that opens a short list. */
export const LanguageToggle: React.FC = () => {
  const { language, setLanguage } = useLanguageStore();
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const current = LANGUAGES.find((l) => l.code === language) ?? LANGUAGES[0];

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

  const choose = (code: Language) => {
    setLanguage(code);
    setOpen(false);
  };

  const onListKey = (e: React.KeyboardEvent<HTMLUListElement>) => {
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
    e.preventDefault();
    const items = Array.from(e.currentTarget.querySelectorAll<HTMLButtonElement>('button'));
    const at = items.indexOf(document.activeElement as HTMLButtonElement);
    const next = e.key === 'ArrowDown' ? (at + 1) % items.length : (at - 1 + items.length) % items.length;
    items[next]?.focus();
  };

  return (
    <div ref={root} className="relative shrink-0">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Langue : ${current.name}`}
        onClick={() => setOpen((v) => !v)}
        className="h-11 inline-flex items-center gap-2 ps-3.5 pe-3 rounded-full border-[1.5px] border-light-border dark:border-dark-border bg-white dark:bg-dark-card text-[13px] font-bold hover:bg-light-tile dark:hover:bg-dark-surface transition-colors"
      >
        <Globe className="w-[18px] h-[18px] text-brand-500 dark:text-brand-accent" aria-hidden="true" />
        <span lang={current.code}>{current.short}</span>
        <ChevronDown
          className={`w-4 h-4 text-slate-600 dark:text-slate-300 transition-transform ${open ? 'rotate-180' : ''}`}
          aria-hidden="true"
        />
      </button>

      {open && (
        <ul
          role="listbox"
          aria-label="Langue"
          onKeyDown={onListKey}
          className="absolute end-0 top-[calc(100%+8px)] z-50 min-w-[170px] rounded-2xl border border-light-border dark:border-dark-border bg-white dark:bg-dark-card shadow-xl p-1.5"
        >
          {LANGUAGES.map((l) => {
            const selected = l.code === language;
            return (
              <li key={l.code} role="option" aria-selected={selected}>
                <button
                  type="button"
                  lang={l.code}
                  autoFocus={selected}
                  onClick={() => choose(l.code)}
                  className={`w-full h-11 px-3 rounded-xl flex items-center justify-between gap-4 text-sm font-semibold text-start transition-colors ${
                    selected ? 'bg-light-tile dark:bg-dark-surface' : 'hover:bg-light-tile dark:hover:bg-dark-surface'
                  }`}
                >
                  <span>{l.name}</span>
                  {selected && <Check className="w-4 h-4 text-brand-500 dark:text-brand-accent" aria-hidden="true" />}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};
