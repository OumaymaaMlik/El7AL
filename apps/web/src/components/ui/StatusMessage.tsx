import React from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

const TONES = {
  success: {
    Icon: CheckCircle2,
    box: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300',
    icon: 'text-emerald-500',
  },
  error: {
    Icon: AlertCircle,
    box: 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800 text-red-800 dark:text-red-300',
    icon: 'text-red-500',
  },
};

/** A short result banner: green after a save, red after a failure. */
export const StatusMessage: React.FC<{ tone: keyof typeof TONES; children: React.ReactNode }> = ({
  tone,
  children,
}) => {
  const { Icon, box, icon } = TONES[tone];
  return (
    <div
      role={tone === 'error' ? 'alert' : 'status'}
      className={`p-4 rounded-xl border flex items-center gap-3 text-sm font-semibold ${box}`}
    >
      <Icon className={`w-5 h-5 flex-shrink-0 ${icon}`} />
      <span>{children}</span>
    </div>
  );
};
