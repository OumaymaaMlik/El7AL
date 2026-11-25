import React from 'react';
import { Clock, XCircle } from 'lucide-react';
import { useWalletCopy } from '../../../lib/walletCopy';
import { Button } from '../../ui/Button';

interface Props {
  refused: boolean;
  onSendAgain: () => void;
}

/** Where the last receipt stands: being checked by El 7al, or refused with a way to send another. */
export const PayStatus: React.FC<Props> = ({ refused, onSendAgain }) => {
  const copy = useWalletCopy();
  const Icon = refused ? XCircle : Clock;
  return (
    <div
      role="status"
      className={`rounded-tile border-[1.5px] p-6 sm:p-8 flex flex-col items-start gap-4 ${
        refused
          ? 'border-red-700 bg-red-50 dark:border-red-400 dark:bg-red-950/30'
          : 'border-amber-600 bg-amber-50 dark:border-amber-400 dark:bg-amber-950/30'
      }`}
    >
      <Icon className="w-9 h-9" aria-hidden="true" />
      <div>
        <h2 className="text-xl font-bold">{refused ? copy.refusedTitle : copy.pendingTitle}</h2>
        <p className="mt-2 text-slate-700 dark:text-slate-300">{refused ? copy.refusedText : copy.pendingText}</p>
      </div>
      {refused && (
        <Button type="button" onClick={onSendAgain}>
          {copy.sendAgain}
        </Button>
      )}
    </div>
  );
};
