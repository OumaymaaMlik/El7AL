import React from 'react';

/** The white card every admin block sits in. */
export const AdminCard: React.FC<{ className?: string; children: React.ReactNode; onClick?: () => void }> = ({
  className = '',
  children,
  onClick,
}) => (
  <div
    onClick={onClick}
    className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-tile ${className}`}
  >
    {children}
  </div>
);

/** A small label + value tile used in the detail windows. */
export const InfoTile: React.FC<{ label: React.ReactNode; children: React.ReactNode }> = ({ label, children }) => (
  <div className="p-3 bg-light-bg dark:bg-dark-bg rounded-2xl border border-slate-100 dark:border-slate-800">
    <span className="text-xs uppercase font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1 mb-1">
      {label}
    </span>
    <div className="text-xs font-bold text-slate-900 dark:text-white">{children}</div>
  </div>
);

export const EmptyState: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AdminCard className="p-10 text-center text-slate-500">{children}</AdminCard>
);

export const Spinner: React.FC = () => (
  <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-500 dark:text-slate-400">
    <div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
    <span className="text-xs font-semibold">Chargement des données en cours...</span>
  </div>
);

const TONES = {
  good: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400',
  warn: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-400',
  bad: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-400',
  neutral: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
};

const TONE_OF: Record<string, keyof typeof TONES> = {
  ACTIVE: 'good',
  COMPLETED: 'good',
  PENDING_VERIFICATION: 'warn',
  IN_PROGRESS: 'warn',
  EN_ROUTE: 'warn',
  CANCELLED: 'bad',
  BLOCKED: 'bad',
  REJECTED: 'bad',
  SUSPENDED_LOW_BALANCE: 'bad',
};

/** A status word in a coloured pill; the colour follows the meaning of the status. */
export const StatusPill: React.FC<{ status: string }> = ({ status }) => (
  <span className={`px-2 py-0.5 rounded-full text-xs font-bold uppercase ${TONES[TONE_OF[status] ?? 'neutral']}`}>
    {status}
  </span>
);
