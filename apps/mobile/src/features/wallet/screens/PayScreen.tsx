import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { useThemeStore } from '../../../shared/store/useThemeStore';
import { useAuthStore } from '../../auth';
import { PauseView } from '../components/PauseView';
import { PayForm } from '../components/PayForm';
import { PayHistory } from '../components/PayHistory';
import { PaymentsView } from '../components/PaymentsView';
import { useWallet } from '../hooks/useWallet';

/**
 * "Payer El 7al" for an artisan: the transfer form, or, once a receipt is sent, where it stands (paused while El 7al
 * checks it, or refused with a way to send another).
 */
export function PayScreen() {
  const router = useRouter();
  const colors = useThemeStore((s) => s.colors);
  const paused = useAuthStore((s) => s.user?.status === 'SUSPENDED_LOW_BALANCE');
  const wallet = useWallet();
  const [view, setView] = useState<'form' | 'status' | null>(null);

  // Open on the status when a receipt is already waiting (or was refused); otherwise on the form.
  useEffect(() => {
    if (wallet.loading || view !== null) return;
    setView(wallet.state === 'pending' || wallet.state === 'refused' ? 'status' : 'form');
  }, [wallet.loading, wallet.state, view]);

  const back = () => (router.canGoBack() ? router.back() : router.replace('/(tabs)/home'));

  if (view === null) return <View style={{ flex: 1, backgroundColor: colors.background }} />;

  if (view === 'status') {
    return (
      <PauseView
        refused={wallet.state === 'refused'}
        latest={wallet.latest}
        onBack={back}
        onResend={() => setView('form')}
      />
    );
  }

  if (wallet.due <= 0) return <PaymentsView charges={wallet.charges} transfers={wallet.transfers} onBack={back} />;

  return (
    <PayForm
      due={wallet.due}
      rib={wallet.rib}
      paused={Boolean(paused)}
      sending={wallet.sending}
      onBack={back}
      onSend={async (uri) => {
        if (await wallet.send(uri)) setView('status');
      }}
      history={<PayHistory charges={wallet.charges} transfers={wallet.transfers} />}
    />
  );
}
