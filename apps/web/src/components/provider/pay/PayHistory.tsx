import React from 'react';
import { useProviderStore } from '../../../store/useProviderStore';
import { useLanguageStore } from '../../../store/useLanguageStore';
import { useWalletCopy } from '../../../lib/walletCopy';

const CARD = 'bg-white dark:bg-slate-900 rounded-tile border border-slate-200/80 dark:border-slate-800';

const STATUS_STYLE = {
  PENDING: 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200',
  APPROVED: 'bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200',
  REJECTED: 'bg-red-100 text-red-900 dark:bg-red-950 dark:text-red-200',
} as const;

/** What the artisan was charged for each job, and every transfer sent with what became of it. */
export const PayHistory: React.FC = () => {
  const copy = useWalletCopy();
  const language = useLanguageStore((s) => s.language);
  const charges = useProviderStore((s) => s.charges);
  const transfers = useProviderStore((s) => s.transfers);
  if (charges.length === 0 && transfers.length === 0) return null;

  const day = (value: string) =>
    new Date(value).toLocaleDateString(language === 'ar' ? 'ar-TN' : language === 'en' ? 'en-GB' : 'fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

  return (
    <section className="space-y-6">
      {charges.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-lg font-bold">{copy.chargesTitle}</h2>
          <ul className={`${CARD} divide-y divide-slate-100 dark:divide-slate-800`}>
            {charges.map((c) => (
              <li key={c.id} className="p-4 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <span className="block font-semibold">{c.categoryName ?? copy.job}</span>
                  <span className="block text-xs text-slate-500 dark:text-slate-400">
                    {day(c.createdAt)} · {copy.commissionWord} {c.commission} TND
                    {c.activation > 0 ? ` + ${copy.activationWord} ${c.activation} TND` : ''}
                  </span>
                </div>
                <span className="font-bold whitespace-nowrap">{c.commission + c.activation} TND</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {transfers.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-lg font-bold">{copy.transfersTitle}</h2>
          <ul className={`${CARD} divide-y divide-slate-100 dark:divide-slate-800`}>
            {transfers.map((x) => (
              <li key={x.id} className="p-4 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <span className="block font-semibold">{Number(x.amount)} TND</span>
                  <span className="block text-xs text-slate-500 dark:text-slate-400">
                    {day(x.createdAt)}
                    {x.receivedAmount !== null && x.receivedAmount !== undefined
                      ? ` · ${copy.receivedWord} ${Number(x.receivedAmount)} TND`
                      : ''}
                  </span>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${STATUS_STYLE[x.status]}`}>
                  {copy.status[x.status]}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
};
