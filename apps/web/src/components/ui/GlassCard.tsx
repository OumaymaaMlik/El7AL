import React from 'react';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverEffect?: boolean;
}

/** The flat card used across the app (name kept for the existing call sites): white surface, hairline border. */
export const GlassCard: React.FC<GlassCardProps> = ({ children, className = '', hoverEffect = false, ...props }) => {
  return (
    <div
      className={`surface p-6 ${
        hoverEffect ? 'hover:border-brand-500 dark:hover:border-brand-accent transition-colors duration-150' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
