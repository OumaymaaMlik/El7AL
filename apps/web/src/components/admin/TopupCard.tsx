import React, { useState } from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';
import { AdminCard } from './AdminUi';
import type { AdminTopup } from './adminTypes';

interface Props {
  topup: AdminTopup;
  onDecide: (id: string, action: 'approve' | 'reject', receivedAmount?: number) => void;
}

/** One receipt: what is owed next to what was sent, the photo, and the amount really found on the bank account. */
export const TopupCard: React.FC<Props> = ({ topup, onDecide }) => {
  const declared = Number(topup.amount);
  const owed = topup.owed ?? declared;
  const [received, setReceived] = useState(String(declared));
  const value = Number(received.replace(',', '.'));
  const valid = Number.isFinite(value) && value > 0;
  const overdue = topup.overdue ?? owed;
  const missing = valid ? Math.max(0, overdue - value) : overdue;

  return (
    <AdminCard className="p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <span className="px-2.5 py-1 rounded-xl bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200 text-xs font-bold">
          RÉF : {topup.uniqueRef}
        </span>
        <span className="text-sm font-black text-slate-900 dark:text-white">
          Doit {owed} TND · Déclaré {declared} TND
        </span>
      </div>
      <span className="text-xs text-slate-500 font-medium">
        Prestataire : <strong>{topup.provider?.user?.fullName || 'Technicien'}</strong> (
        {topup.provider?.user?.phoneNumber})
      </span>

      {topup.receiptPhotoUrl && (
        <a href={topup.receiptPhotoUrl} target="_blank" rel="noreferrer" className="block">
          <img
            src={topup.receiptPhotoUrl}
            alt="Reçu du virement"
            className="w-full h-40 object-cover rounded-2xl border border-slate-200 dark:border-slate-800"
          />
          <span className="block mt-1 text-xs font-bold underline">Ouvrir le reçu en grand</span>
        </a>
      )}

      <label className="block text-xs font-bold text-slate-600 dark:text-slate-300">
        Montant reçu sur le compte (TND)
        <input
          inputMode="decimal"
          value={received}
          onChange={(e) => setReceived(e.target.value)}
          className="mt-1 w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
        />
      </label>
      {missing > 0 && (
        <p role="status" className="text-xs font-bold text-amber-700 dark:text-amber-300">
          Il manquera {missing} TND : l&apos;artisan restera bloqué.
        </p>
      )}

      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
        <button
          type="button"
          disabled={!valid}
          onClick={() => onDecide(topup.id, 'approve', value)}
          className="flex-1 min-h-[44px] bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5"
        >
          <CheckCircle2 className="w-4 h-4" />
          Valider {valid ? `${value} TND` : ''}
        </button>
        <button
          type="button"
          onClick={() => onDecide(topup.id, 'reject')}
          className="flex-1 min-h-[44px] bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5"
        >
          <XCircle className="w-4 h-4" />
          Rejeter
        </button>
      </div>
    </AdminCard>
  );
};
