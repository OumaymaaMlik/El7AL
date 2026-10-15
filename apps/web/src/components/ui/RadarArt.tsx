import React from 'react';

/**
 * Decorative radar for the green panels: rings, the user at the centre and an artisan dot travelling
 * along a dotted route. It carries no data, so it is hidden from screen readers and stands still when
 * the user prefers reduced motion. Also the fallback while the 3D scene loads.
 */
export const RadarArt: React.FC<{ className?: string }> = ({ className = '' }) => {
  const reduce = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const route = 'M52 306 C98 288 118 232 160 218 S 188 204 200 200';
  return (
    <div className={`aspect-square w-full ${className}`} dir="ltr" aria-hidden="true">
      <svg viewBox="0 0 400 400" className="w-full h-full block">
        <g fill="none" stroke="rgba(255,255,255,.2)" strokeWidth="1.5">
          <circle cx="200" cy="200" r="190" />
          <circle cx="200" cy="200" r="128" />
          <circle cx="200" cy="200" r="66" />
        </g>
        <path
          d={route}
          fill="none"
          stroke="rgba(163,230,53,.9)"
          strokeWidth="3"
          strokeDasharray="1 9"
          strokeLinecap="round"
        />
        <circle cx="200" cy="200" r="22" fill="rgba(255,255,255,.14)" />
        <circle cx="200" cy="200" r="9" fill="#fff" />
        <g transform={reduce ? 'translate(160 218)' : undefined}>
          <circle r="22" fill="rgba(163,230,53,.28)" />
          <circle r="11" fill="#A3E635" stroke="#0D5C3A" strokeWidth="3" />
          {!reduce && <animateMotion dur="14s" repeatCount="indefinite" path={route} />}
        </g>
      </svg>
    </div>
  );
};
