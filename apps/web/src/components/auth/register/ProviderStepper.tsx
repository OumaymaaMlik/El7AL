import React from 'react';
import { Check } from 'lucide-react';
import { PROVIDER_STEPS } from './registerOptions';

/** The four numbered steps of the artisan form, and the progress bar under them. */
export const ProviderStepper: React.FC<{ current: number; onGoTo: (step: number) => void }> = ({ current, onGoTo }) => (
  <div className="space-y-3 pt-1">
    <div className="grid grid-cols-4 gap-1 text-center text-xs font-semibold">
      {PROVIDER_STEPS.map((title, i) => {
        const num = i + 1;
        const active = current === num;
        const done = current > num;
        return (
          <button
            key={title}
            type="button"
            onClick={() => onGoTo(num)}
            className={`flex flex-col items-center gap-1 transition-all ${
              active
                ? 'text-brand-500 dark:text-brand-accent font-bold'
                : done
                  ? 'text-slate-700 dark:text-slate-300 font-medium'
                  : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                active
                  ? 'bg-brand-500 text-white'
                  : done
                    ? 'bg-brand-500/15 text-brand-500 dark:text-brand-accent'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
              }`}
            >
              {done ? <Check className="w-3.5 h-3.5" /> : num}
            </div>
            <span className="truncate max-w-full">{title}</span>
          </button>
        );
      })}
    </div>

    <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
      <div
        className="h-full bg-brand-500 dark:bg-brand-accent transition-all duration-300 rounded-full"
        style={{ width: `${(current / PROVIDER_STEPS.length) * 100}%` }}
      />
    </div>
  </div>
);
