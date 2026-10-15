import React, { useId } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({ label, error, icon, className = '', id, ...props }) => {
  const generatedId = useId();
  const inputId = id || props.name || generatedId;
  const errorId = `${inputId}-error`;

  return (
    <div className="flex flex-col gap-2 w-full">
      {label && (
        <label htmlFor={inputId} className="text-[13px] font-semibold text-slate-900 dark:text-slate-100">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {icon && <div className="absolute start-4 text-slate-500 dark:text-slate-400 pointer-events-none">{icon}</div>}
        <input
          id={inputId}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          className={`w-full h-[52px] rounded-field border-[1.5px] bg-white dark:bg-dark-surface text-slate-900 dark:text-slate-100 px-4 text-[15px] placeholder:text-slate-500 dark:placeholder:text-slate-400 transition-colors duration-150 focus:outline-none focus:border-brand-500 dark:focus:border-brand-accent disabled:opacity-50 disabled:bg-slate-100 ${
            icon ? 'ps-11' : ''
          } ${
            error ? 'border-red-600 dark:border-red-400' : 'border-light-border dark:border-dark-border'
          } ${className}`}
          {...props}
        />
      </div>
      {error && (
        <span id={errorId} role="alert" className="text-[13px] font-semibold text-red-700 dark:text-red-400">
          {error}
        </span>
      )}
    </div>
  );
};
