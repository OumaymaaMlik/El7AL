import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { useThemeStore } from '../../../shared/store/useThemeStore';
import { useAuthStore } from '../../auth';
import { PauseView } from '../components/PauseView';
import { PayForm } from '../components/PayForm';
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

  return (
    <PayForm
      due={wallet.due}
      paused={Boolean(paused)}
      sending={wallet.sending}
      onBack={back}
      onSend={async (amount, uri) => {
        if (await wallet.send(amount, uri)) setView('status');
      }}
    />
  );
}
