import React, { useEffect, useRef, useState } from 'react';
import { Check, ChevronDown, Tag } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Category, getCategoryIcon } from './CategoryGrid';
import { useTranslation } from '../../hooks/useTranslation';

/** The little movement each trade plays when picked (see the .motion-* rules in index.css). */
function tradeMotion(name: string, iconName?: string): string {
  const n = `${name} ${iconName ?? ''}`.toLowerCase();
  const has = (...words: string[]) => words.some((w) => n.includes(w));
  if (has('plomb', 'eau', 'fuite', 'sanitaire')) return 'motion-drip';
  if (has('électr', 'elec', 'courant', 'prise')) return 'motion-flash';
  if (has('clim', 'froid', 'frigo')) return 'motion-spin';
  if (has('chauff', 'gaz', 'chaudière')) return 'motion-flicker';
  if (has('mécan', 'auto', 'remorq', 'véhic', 'voiture', 'vidange')) return 'motion-drive';
  if (has('serrur', 'clé', 'porte', 'verrou')) return 'motion-wiggle';
  if (has('menuis', 'ébénist', 'bois', 'meuble', 'maçon', 'brique', 'carrelage', 'béton')) return 'motion-hammer';
  if (has('peint', 'déco', 'rénov')) return 'motion-sweep';
  if (has('ménag', 'nettoy', 'entretien', 'propreté')) return 'motion-sparkle';
  if (has('jardin', 'fleur', 'vert', 'haie')) return 'motion-sway';
  return 'motion-pop';
}

interface TradePickerProps {
  categories: Category[];
  value: string;
  onChange: (id: string) => void;
  invalid?: boolean;
  describedBy?: string;
}

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

/**
 * The trade field of the request form: a button showing the chosen trade, opening a window with every
 * trade as a big tile. Picking one plays that trade's small animation, then the window closes.
 */
export const TradePicker: React.FC<TradePickerProps> = ({ categories, value, onChange, invalid, describedBy }) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [picking, setPicking] = useState<string | null>(null);
  /** Plays the animation once on the button's icon after a pick. */
  const [justPicked, setJustPicked] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>();
  useEffect(() => () => timer.current && clearTimeout(timer.current), []);

  const current = categories.find((c) => c.id === value) ?? null;

  const pick = (cat: Category) => {
    if (picking) return;
    setPicking(cat.id);
    timer.current = setTimeout(
      () => {
        onChange(cat.id);
        setPicking(null);
        setOpen(false);
        setJustPicked(true);
        timer.current = setTimeout(() => setJustPicked(false), 1000);
      },
      prefersReducedMotion() ? 0 : 900,
    );
  };

  return (
    <>
      <button
        type="button"
        id="rc-category"
        aria-haspopup="dialog"
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy}
        onClick={() => setOpen(true)}
        className={`flex items-center gap-2.5 w-full h-[52px] px-4 rounded-field border-[1.5px] bg-white dark:bg-dark-surface text-start text-[15px] transition-colors hover:border-brand-500 dark:hover:border-brand-accent ${
          invalid ? 'border-red-600 dark:border-red-400' : 'border-light-border dark:border-dark-border'
        }`}
      >
        {current ? (
          <span
            key={justPicked ? 'play' : 'still'}
            className={`shrink-0 text-brand-500 dark:text-brand-accent ${justPicked ? tradeMotion(current.name, current.icon) : ''}`}
          >
            {getCategoryIcon(current.name, current.icon)}
          </span>
        ) : (
          <Tag className="w-5 h-5 shrink-0 text-slate-600 dark:text-slate-400" aria-hidden="true" />
        )}
        <span className={`flex-1 min-w-0 truncate ${current ? 'font-semibold' : 'text-slate-500 dark:text-slate-400'}`}>
          {current ? current.name : t.selectMetier}
        </span>
        <ChevronDown className="w-4 h-4 shrink-0 text-slate-600 dark:text-slate-400" aria-hidden="true" />
      </button>

      <Modal isOpen={open} onClose={() => !picking && setOpen(false)} title={t.metier} maxWidth="lg">
        <ul className="grid grid-cols-2 sm:grid-cols-3 gap-3" aria-label={t.metier}>
          {categories.map((cat) => {
            const active = picking === cat.id;
            const chosen = !picking && cat.id === value;
            return (
              <li key={cat.id}>
                <button
                  type="button"
                  onClick={() => pick(cat)}
                  disabled={!!picking && !active}
                  aria-pressed={chosen || active}
                  className={`relative w-full h-full min-h-[116px] p-3 rounded-2xl border-[1.5px] flex flex-col items-center justify-center gap-2.5 text-center transition-all duration-200 disabled:opacity-40 ${
                    active
                      ? 'bg-brand-accent border-brand-accent text-brand-on-accent scale-[1.04]'
                      : chosen
                        ? 'border-brand-500 dark:border-brand-accent bg-light-tile dark:bg-dark-surface'
                        : 'border-light-border dark:border-dark-border bg-white dark:bg-dark-card hover:bg-light-tile dark:hover:bg-dark-surface hover:border-brand-500 dark:hover:border-brand-accent'
                  } ${cat.isActive === false ? 'opacity-60' : ''}`}
                >
                  {chosen && (
                    <span className="absolute top-2 end-2 w-5 h-5 rounded-full grid place-items-center bg-brand-500 dark:bg-brand-accent text-white dark:text-brand-on-accent">
                      <Check className="w-3 h-3" strokeWidth={3} aria-hidden="true" />
                    </span>
                  )}
                  <span
                    className={`grid place-items-center w-12 h-12 [&>svg]:w-8 [&>svg]:h-8 ${active ? tradeMotion(cat.name, cat.icon) : 'text-brand-500 dark:text-brand-accent'}`}
                  >
                    {getCategoryIcon(cat.name, cat.icon)}
                  </span>
                  <span className="text-sm font-bold leading-tight">{cat.name}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </Modal>
    </>
  );
};
