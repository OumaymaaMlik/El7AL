import React from 'react';
import { useProviderCopy } from '../../../lib/providerCopy';

interface DutyPanelProps {
  firstName: string;
  isOnline: boolean;
  canGoOnline: boolean;
  onToggle: () => void;
  stats: { done: number; rating: number | null; ongoing: number };
}

/** The green panel: the one on/off switch that matters and three real figures. */
export const DutyPanel: React.FC<DutyPanelProps> = ({ firstName, isOnline, canGoOnline, onToggle, stats }) => {
  const copy = useProviderCopy();
  const figures = [
    { label: copy.statDone, value: String(stats.done) },
    { label: copy.statRating, value: stats.rating && stats.rating > 0 ? `${stats.rating.toFixed(1)} ★` : '–' },
    { label: copy.statOngoing, value: String(stats.ongoing) },
  ];

  return (
    <section aria-label={copy.hello(firstName)} className="panel p-6 sm:p-10 flex flex-col gap-8">
      <div className="flex flex-wrap items-center justify-between gap-x-10 gap-y-6">
        <div className="min-w-0">
          <span className="micro !text-white/80">{copy.hello(firstName)}</span>
          <h1 className="mt-3 max-w-[18ch] text-[clamp(32px,4.4vw,54px)] font-bold leading-[1.05] tracking-[-0.03em] rtl:tracking-normal rtl:leading-[1.25] text-white">
            {isOnline ? copy.onTitle : copy.offTitle}
          </h1>
          <p className="mt-3.5 max-w-[52ch] text-[17px] text-white/90">{isOnline ? copy.onText : copy.offText}</p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={isOnline}
          disabled={!canGoOnline}
          onClick={onToggle}
          className={`h-16 ps-2 pe-6 rounded-full border-[1.5px] inline-flex items-center gap-3.5 font-bold text-base transition-colors ${
            !canGoOnline
              ? 'border-white/30 text-white/60 cursor-not-allowed'
              : isOnline
                ? 'bg-brand-accent border-brand-accent text-brand-on-accent'
                : 'border-white/50 text-white hover:bg-white/10'
          }`}
        >
          <span
            className={`w-12 h-12 rounded-full grid place-items-center ${isOnline ? 'bg-brand-on-accent' : 'bg-white/30'}`}
            aria-hidden="true"
          >
            <span className={`w-3.5 h-3.5 rounded-full ${isOnline ? 'bg-brand-accent' : 'bg-white'}`} />
          </span>
          {isOnline ? copy.switchOn : copy.switchOff}
        </button>
      </div>

      <dl className="grid grid-cols-3 border-t border-white/20 pt-6">
        {figures.map((stat, i) => (
          <div key={stat.label} className={`${i > 0 ? 'ps-3 sm:ps-6 border-s border-white/20' : ''} min-w-0`}>
            <dt className="micro !text-white/80">{stat.label}</dt>
            <dd className="mt-1.5 font-display font-extrabold text-[clamp(28px,4vw,44px)] leading-[1.1] tabular-nums text-white">
              {stat.value}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
};
