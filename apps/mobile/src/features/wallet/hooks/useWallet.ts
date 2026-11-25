import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from '../../../shared/store/useLanguageStore';
import { getApiErrorMessage } from '../../../shared/utils/apiError';
import { toNumber } from '../../../shared/utils/format';
import { logger } from '../../../shared/utils/logger';
import { uploadDocument } from '../../auth/api/auth.api';
import { useNotificationStore } from '../../notifications/store/useNotificationStore';
import { fetchWallet, submitTopup, type Wallet } from '../api/wallet.api';

/** Where a top-up stands, from the newest transfer: nothing sent, waiting for El 7al, accepted, or refused. */
type TopupState = 'none' | 'pending' | 'approved' | 'refused';

/** What the screens read from the loaded wallet (all empty until it is loaded). */
function summarize(loaded: Wallet | null) {
  const wallet: Wallet = loaded ?? { walletBalance: 0, transactions: [] };
  const balance = toNumber(wallet.walletBalance) ?? 0;
  const transfers = wallet.transactions;
  const latest = transfers[0] ?? null;
  const states: Record<string, TopupState> = { PENDING: 'pending', REJECTED: 'refused', APPROVED: 'approved' };
  return {
    balance,
    /** What to transfer now: what is owed (the wallet is negative), or 0. */
    due: wallet.due ?? Math.max(0, -balance),
    state: latest ? states[latest.status] : ('none' as TopupState),
    latest,
    transfers,
    charges: wallet.charges ?? [],
    rib: wallet.rib ?? null,
  };
}

/** The artisan's wallet: what is owed, where the last transfer stands, and sending a new receipt. */
export function useWallet() {
  const { t } = useTranslation();
  const flashToast = useNotificationStore((s) => s.flashToast);
  const [loading, setLoading] = useState(true);
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [sending, setSending] = useState(false);

  const load = useCallback(async () => {
    try {
      setWallet(await fetchWallet());
    } catch (e) {
      logger.warn('Wallet load failed:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  /** Uploads the receipt photo, then sends it. Returns true when the request was accepted. */
  const send = async (photoUri: string): Promise<boolean> => {
    setSending(true);
    try {
      const url = await uploadDocument(photoUri, 'transfer_receipt.jpg');
      await submitTopup(url ?? photoUri);
      await load();
      return true;
    } catch (e) {
      flashToast({ title: t('errorTitle'), message: getApiErrorMessage(e, t('errSendProof')), tone: 'error' });
      return false;
    } finally {
      setSending(false);
    }
  };

  return { loading, sending, send, reload: load, ...summarize(wallet) };
}
