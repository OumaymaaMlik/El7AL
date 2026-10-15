import React from 'react';
import { SEVEN_ASPECT, SEVEN_POINTS } from '../../lib/sevenGlyph';

interface LogoProps {
  /** `onDark` for the green panels (lime mark and wordmark), `auto` follows the light/dark theme. */
  tone?: 'auto' | 'onDark';
  className?: string;
  /** Show only the square mark. */
  markOnly?: boolean;
}

/** The mark: the El 7al "7" (see lib/sevenGlyph.ts), in the accent colour, standing where the square used to be. */
const LogoMark: React.FC<{ className?: string; tone?: 'auto' | 'onDark' }> = ({ className = '', tone = 'auto' }) => {
  const color = tone === 'onDark' ? 'fill-brand-accent' : 'fill-brand-500 dark:fill-brand-accent';
  const points = SEVEN_POINTS.map(([x, y]) => `${(x * SEVEN_ASPECT).toFixed(3)},${y}`).join(' ');
  return (
    <svg
      aria-hidden="true"
      viewBox={`0 0 ${SEVEN_ASPECT} 1`}
      className={`shrink-0 h-9 w-auto ${className}`}
      style={{ aspectRatio: `${SEVEN_ASPECT} / 1` }}
    >
      <polygon points={points} className={color} />
    </svg>
  );
};

/** The 7 mark + the "El 7al" wordmark (Outfit bold). */
export const Logo: React.FC<LogoProps> = ({ tone = 'auto', className = 'text-[26px]', markOnly = false }) => {
  const text = tone === 'onDark' ? 'text-white' : 'text-brand-500 dark:text-white';
  const seven = tone === 'onDark' ? 'text-brand-accent' : 'text-brand-500 dark:text-brand-accent';
  return (
    <span role="img" aria-label="El 7al" dir="ltr" className="inline-flex items-center gap-2.5 leading-none">
      <LogoMark tone={tone} />
      {!markOnly && (
        <span
          aria-hidden="true"
          className={`font-display font-bold tracking-tight whitespace-nowrap ${text} ${className}`}
        >
          El <span className={seven}>7</span>al
        </span>
      )}
    </span>
  );
};
