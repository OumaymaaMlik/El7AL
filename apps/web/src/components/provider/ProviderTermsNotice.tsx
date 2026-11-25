import React, { useState } from 'react';
import { Banknote, CreditCard, Lock } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { useProviderStore } from '../../store/useProviderStore';
import { useWalletCopy } from '../../lib/walletCopy';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';

/** What an artisan must know before working: the activation fee, the commission and the block when it is unpaid. Shown until accepted; the server keeps the date as proof. Closing it only postpones it. */
export const ProviderTermsNotice: React.FC = () => {
  const copy = useWalletCopy();
  const isProvider = useAuthStore((s) => s.user?.role === 'PROVIDER');
  const accepted = useProviderStore((s) => s.termsAccepted);
  const acceptTerms = useProviderStore((s) => s.acceptTerms);
  const [saving, setSaving] = useState(false);
  const [failed, setFailed] = useState(false);
  const [later, setLater] = useState(false);
  const open = isProvider && accepted === false && !later;

  const accept = async () => {
    setSaving(true);
    setFailed(false);
    try {
      await acceptTerms();
    } catch {
      setFailed(true);
    } finally {
      setSaving(false);
    }
  };

  const rows = [
    { Icon: CreditCard, title: copy.termsActivationTitle, text: copy.termsActivation },
    { Icon: Banknote, title: copy.termsCommissionTitle, text: copy.termsCommission },
    { Icon: Lock, title: copy.termsBlockTitle, text: copy.termsBlock },
  ];

  return (
    <Modal isOpen={open} onClose={() => setLater(true)} title={copy.termsTitle} maxWidth="lg">
      <div className="space-y-5">
        <p className="text-slate-700 dark:text-slate-300">{copy.termsIntro}</p>
        {rows.map(({ Icon, title, text }) => (
          <div key={title} className="flex items-start gap-4">
            <span className="w-11 h-11 shrink-0 rounded-full bg-brand-500/10 dark:bg-brand-accent/15 grid place-items-center">
              <Icon className="w-5 h-5 text-brand-500 dark:text-brand-accent" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <h3 className="font-bold">{title}</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">{text}</p>
            </div>
          </div>
        ))}
        {failed && (
          <p role="alert" className="text-sm font-semibold text-red-700 dark:text-red-400">
            {copy.termsFailed}
          </p>
        )}
        <Button type="button" className="w-full" onClick={() => void accept()} isLoading={saving}>
          {copy.termsAccept}
        </Button>
      </div>
    </Modal>
  );
};
