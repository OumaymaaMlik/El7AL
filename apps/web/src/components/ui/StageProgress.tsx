import React from 'react';

interface StageProgressProps {
  /** Index of the current stage (0-based) out of `total`. */
  current: number;
  total?: number;
  /** `onDark` for the green panels, `surface` for cards. */
  tone?: 'onDark' | 'surface';
  label: string;
}

/** Segmented progress bar: done stages lime/green, the current one solid, the rest faint. */
export const StageProgress: React.FC<StageProgressProps> = ({ current, total = 6, tone = 'onDark', label }) => {
  const done = tone === 'onDark' ? 'bg-brand-accent' : 'bg-brand-500 dark:bg-brand-accent';
  const now = tone === 'onDark' ? 'bg-white' : 'bg-slate-900 dark:bg-white';
  const todo = tone === 'onDark' ? 'bg-white/20' : 'bg-light-border dark:bg-dark-border';
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={1}
      aria-valuemax={total}
      aria-valuenow={current + 1}
      className="grid gap-1.5"
      style={{ gridTemplateColumns: `repeat(${total}, minmax(0, 1fr))` }}
    >
      {Array.from({ length: total }, (_, i) => (
        <i key={i} className={`block h-1.5 rounded-[3px] ${i < current ? done : i === current ? now : todo}`} />
      ))}
    </div>
  );
};
