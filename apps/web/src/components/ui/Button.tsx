import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyle =
    'inline-flex items-center justify-center font-bold rounded-full border-[1.5px] border-transparent transition-colors duration-150 disabled:opacity-55 disabled:cursor-not-allowed whitespace-nowrap shrink-0 relative active:scale-[0.98]';

  const variants = {
    // In dark mode the main action turns lime, as on the mobile app.
    primary:
      'bg-brand-500 text-white hover:bg-brand-600 dark:bg-brand-accent dark:text-brand-on-accent dark:hover:bg-brand-accent-hover',
    secondary:
      'bg-light-tile dark:bg-dark-surface text-slate-900 dark:text-slate-100 hover:bg-brand-100 dark:hover:bg-dark-border',
    accent: 'bg-brand-accent text-brand-on-accent hover:bg-brand-accent-hover',
    outline:
      'border-slate-900 dark:border-slate-100 text-slate-900 dark:text-slate-100 hover:bg-light-tile dark:hover:bg-dark-surface',
    ghost: 'text-slate-900 dark:text-slate-100 hover:bg-light-tile dark:hover:bg-dark-surface',
    danger: 'bg-red-700 text-white hover:bg-red-800 dark:bg-red-500 dark:hover:bg-red-400 dark:text-slate-950',
  };

  const sizes = {
    sm: 'px-4 text-sm gap-2 h-10 min-w-[44px]',
    md: 'px-6 text-[15px] gap-2.5 h-12',
    lg: 'px-8 text-base gap-2.5 h-14',
  };

  return (
    <button
      className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || isLoading}
      aria-busy={isLoading || undefined}
      {...props}
    >
      {isLoading && <Loader2 className="w-5 h-5 animate-spin absolute" aria-hidden="true" />}
      <span className={`inline-flex items-center justify-center gap-[inherit] ${isLoading ? 'invisible' : ''}`}>
        {leftIcon}
        <span>{children}</span>
        {rightIcon}
      </span>
    </button>
  );
};
