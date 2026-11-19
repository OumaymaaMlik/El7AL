import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from '../../../shared/store/useLanguageStore';
import { getApiErrorMessage } from '../../../shared/utils/apiError';
import { toNumber } from '../../../shared/utils/format';
import { logger } from '../../../shared/utils/logger';
import { uploadDocument } from '../../auth/api/auth.api';
import { useNotificationStore } from '../../notifications/store/useNotificationStore';
import { fetchWallet, submitTopup, type TopupTransaction } from '../api/wallet.api';

/** Where a top-up stands, from the newest transfer: nothing sent, waiting for El 7al, accepted, or refused. */
type TopupState = 'none' | 'pending' | 'approved' | 'refused';

/** The artisan's wallet: what is owed, where the last transfer stands, and sending a new receipt. */
export function useWallet() {
  const { t } = useTranslation();
  const flashToast = useNotificationStore((s) => s.flashToast);
  const [loading, setLoading] = useState(true);
  const [balance, setBalance] = useState(0);
  const [serverDue, setServerDue] = useState<number | null>(null);
  const [latest, setLatest] = useState<TopupTransaction | null>(null);
  const [sending, setSending] = useState(false);

  const load = useCallback(async () => {
    try {
      const wallet = await fetchWallet();
      setBalance(toNumber(wallet.walletBalance) ?? 0);
      setServerDue(wallet.due ?? null);
      setLatest(wallet.transactions[0] ?? null);
    } catch (e) {
      logger.warn('Wallet load failed:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  /** Uploads the receipt photo, then sends it with the amount. Returns true when the request was accepted. */
  const send = async (amount: number, photoUri: string): Promise<boolean> => {
    setSending(true);
    try {
      const url = await uploadDocument(photoUri, 'transfer_receipt.jpg');
      await submitTopup(amount, url ?? photoUri);
      await load();
      return true;
    } catch (e) {
      flashToast({ title: t('errorTitle'), message: getApiErrorMessage(e, t('errSendProof')), tone: 'error' });
      return false;
    } finally {
      setSending(false);
    }
  };

  const state: TopupState =
    latest?.status === 'PENDING'
      ? 'pending'
      : latest?.status === 'REJECTED'
        ? 'refused'
        : latest?.status === 'APPROVED'
          ? 'approved'
          : 'none';

  return {
    loading,
    sending,
    balance,
    /** What to transfer now: what is owed (the wallet is negative), or 0. */
    due: serverDue ?? Math.max(0, -balance),
    state,
    latest,
    send,
    reload: load,
  };
}
