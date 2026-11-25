import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { ProviderLayout } from '../layouts/ProviderLayout';
import { PayForm } from '../components/provider/pay/PayForm';
import { PayStatus } from '../components/provider/pay/PayStatus';
import { PayHistory } from '../components/provider/pay/PayHistory';
import { useProviderStore } from '../store/useProviderStore';
import { useWalletCopy } from '../lib/walletCopy';

/**
 * "Payer El 7al" for an artisan: the transfer form, or, once a receipt is sent, where it stands (checked by El 7al,
 * or refused with a way to send another). The same page as the mobile app's.
 */
export const ProviderPayPage: React.FC = () => {
  const navigate = useNavigate();
  const copy = useWalletCopy();
  const { due, rib, transfer, load } = useProviderStore();
  const [ready, setReady] = useState(false);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    void load().then(() => setReady(true));
  }, [load]);

  const showStatus = !resending && (transfer === 'pending' || transfer === 'refused');

  return (
    <ProviderLayout>
      <div className="max-w-xl mx-auto flex flex-col gap-6">
        <button
          type="button"
          onClick={() => navigate('/provider/home')}
          className="self-start inline-flex items-center gap-2 font-semibold text-slate-700 dark:text-slate-300 hover:underline"
        >
          <ArrowLeft className="w-4 h-4 rtl:rotate-180" aria-hidden="true" />
          {copy.back}
        </button>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">{copy.payTitle}</h1>
        <p className="text-slate-700 dark:text-slate-300">{copy.payLead}</p>

        {!ready ? null : showStatus ? (
          <PayStatus refused={transfer === 'refused'} onSendAgain={() => setResending(true)} />
        ) : due <= 0 ? (
          <p className="rounded-tile border border-slate-200 dark:border-slate-800 p-6 font-semibold">
            {copy.nothingDue}
          </p>
        ) : (
          <PayForm
            key={due}
            due={due}
            rib={rib}
            onSent={() => {
              setResending(false);
              void load();
            }}
          />
        )}
        <PayHistory />
      </div>
    </ProviderLayout>
  );
};
