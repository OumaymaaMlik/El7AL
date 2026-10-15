import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'neutral';
  size?: 'sm' | 'md';
  icon?: React.ReactNode;
  className?: string;
}

/** A status pill: tinted background, readable text (4.5:1 or better in both themes). */
export const Badge: React.FC<BadgeProps> = ({ children, variant = 'neutral', size = 'md', icon, className = '' }) => {
  const variants = {
    success: 'bg-emerald-600/15 text-emerald-800 dark:bg-emerald-400/15 dark:text-emerald-300',
    warning: 'bg-amber-500/20 text-amber-900 dark:bg-amber-400/15 dark:text-amber-300',
    danger: 'bg-red-600/15 text-red-800 dark:bg-red-400/15 dark:text-red-300',
    info: 'bg-sky-600/15 text-sky-900 dark:bg-sky-400/15 dark:text-sky-300',
    neutral: 'bg-light-tile text-slate-700 dark:bg-dark-surface dark:text-slate-300',
  };

  const sizes = {
    sm: 'h-6 px-2.5 text-xs gap-1',
    md: 'h-7 px-3 text-[13px] font-bold gap-1.5',
  };

  return (
    <span className={`inline-flex items-center rounded-full ${variants[variant]} ${sizes[size]} ${className}`}>
      {icon}
      <span>{children}</span>
    </span>
  );
};
