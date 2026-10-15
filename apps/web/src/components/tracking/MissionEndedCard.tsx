import React from 'react';
import { AlertCircle, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '../ui/Button';

const TONES = {
  cancelled: { Icon: XCircle, box: 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400' },
  completed: { Icon: CheckCircle2, box: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400' },
  none: { Icon: AlertCircle, box: 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400' },
};

/** What a tracking screen shows when there is nothing to follow: cancelled, finished, or no mission at all. */
export const MissionEndedCard: React.FC<{
  tone: keyof typeof TONES;
  title: string;
  text: React.ReactNode;
  actionLabel: string;
  onAction: () => void;
}> = ({ tone, title, text, actionLabel, onAction }) => {
  const { Icon, box } = TONES[tone];
  return (
    <div className="max-w-xl mx-auto p-8 text-center space-y-4 my-12 bg-white dark:bg-slate-900 rounded-tile border border-slate-200 dark:border-slate-800">
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto ${box}`}>
        <Icon className="w-8 h-8" />
      </div>
      <h2 className="text-xl font-bold text-slate-900 dark:text-white">{title}</h2>
      <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">{text}</p>
      <div className="pt-2">
        <Button variant="primary" onClick={onAction}>
          {actionLabel}
        </Button>
      </div>
    </div>
  );
};
