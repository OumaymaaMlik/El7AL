import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ACTIVATION_FEE_TND, COMMISSION_FEE_TND } from '@el7al/shared';
import { useProviderStore } from '../../../store/useProviderStore';
import { useLanguageStore } from '../../../store/useLanguageStore';
import { useWalletCopy } from '../../../lib/walletCopy';
import { Button } from '../../ui/Button';

const BLOCKED = 'border-amber-600 bg-amber-50 dark:border-amber-400 dark:bg-amber-950/30';
const PLAIN = 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900';

const MoneyBox: React.FC<{ label: string; value: string; hint: string; warn?: boolean }> = (props) => (
  <div className={`rounded-tile border-[1.5px] p-4 sm:p-6 min-w-0 ${props.warn ? BLOCKED : PLAIN}`}>
    <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">{props.label}</p>
    <p className="mt-2 text-2xl sm:text-3xl font-extrabold">{props.value}</p>
    <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{props.hint}</p>
  </div>
);

/**
 * The artisan's week in two figures: the cash collected from clients, and what is to be paid to El 7al. Blocked (an
 * amount is overdue): a warning explains it.
 */
export const WeekMoney: React.FC = () => {
  const navigate = useNavigate();
  const copy = useWalletCopy();
  const language = useLanguageStore((s) => s.language);
  const { due, blocked, nextDueAt, transfer, earnedThisWeek, jobsThisWeek } = useProviderStore();

  const amount = `${due} TND`;
  const first = due === COMMISSION_FEE_TND + ACTIVATION_FEE_TND;
  // The server gives Monday 00:00: the last day to pay is the Sunday before it.
  const lastDay = nextDueAt
    ? new Date(Date.parse(nextDueAt) - 60000).toLocaleDateString(
        language === 'ar' ? 'ar-TN' : language === 'en' ? 'en-GB' : 'fr-FR',
        { weekday: 'long', day: 'numeric', month: 'long' },
      )
    : '';
  const toPayHint = due <= 0 ? copy.nothingToPay : lastDay && !blocked ? copy.payByDate(lastDay) : '';

  return (
    <section className="flex flex-col gap-3">
      {blocked && (
        <div role="status" className={`rounded-tile border-[1.5px] p-5 ${BLOCKED}`}>
          <h2 className="text-xl font-bold">{copy.dueTitle}</h2>
          <p className="mt-2 text-slate-700 dark:text-slate-300">
            {first ? copy.dueFirstSub(amount) : copy.dueSub(amount)}
          </p>
        </div>
      )}
      <div className="grid grid-cols-2 gap-3">
        <MoneyBox
          label={copy.earnedWeek}
          value={earnedThisWeek === null ? '—' : `${earnedThisWeek} TND`}
          hint={copy.jobsCount(jobsThisWeek)}
        />
        <MoneyBox label={blocked ? copy.toPayNow : copy.toPayWeekEnd} value={amount} hint={toPayHint} warn={blocked} />
      </div>
      {transfer === 'pending' && (
        <p className="font-semibold text-amber-800 dark:text-amber-300">{copy.pendingTitle}</p>
      )}
      {due > 0 && (
        <Button
          type="button"
          variant={blocked ? 'primary' : 'secondary'}
          className="self-stretch sm:self-start"
          onClick={() => navigate('/provider/pay')}
        >
          {copy.payButton}
        </Button>
      )}
    </section>
  );
};
