import { useState } from 'react';
import { useRouter } from 'expo-router';
import { useLoadingStore } from '../../../shared/store/useLoadingStore';
import { getApiErrorMessage } from '../../../shared/utils/apiError';
import { calculatePasswordStrength } from '../../../shared/utils/password';
import { ROUTES } from '../../../navigation/routes';
import { useNotificationStore } from '../../notifications';
import { requestPasswordReset, resetPassword } from '../api/auth.api';

/** Two steps: ask for an emailed code, then set a new password with it. */
export function useForgotPassword() {
  const router = useRouter();
  const flashToast = useNotificationStore((state) => state.flashToast);
  const showLoading = useLoadingStore((state) => state.showLoading);
  const hideLoading = useLoadingStore((state) => state.hideLoading);

  const [step, setStep] = useState<1 | 2>(1);
  const [identifier, setIdentifier] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();

  const run = async (title: string, subtitle: string, action: () => Promise<void>, fallback: string) => {
    setLoading(true);
    setError(undefined);
    showLoading(title, subtitle);
    try {
      await action();
    } catch (e) {
      setError(getApiErrorMessage(e, fallback));
    } finally {
      setLoading(false);
      hideLoading();
    }
  };

  const sendCode = () => {
    if (!identifier.trim()) return;
    return run(
      'Envoi du code',
      'Vérifiez votre boîte e-mail',
      async () => {
        const res = await requestPasswordReset(identifier.trim());
        // In development the server returns the code so the flow can be tried without a mailbox.
        if (__DEV__ && res.code) setCode(res.code);
        setStep(2);
      },
      "Impossible d'envoyer le code. Réessayez.",
    );
  };

  const passwordStrong = calculatePasswordStrength(newPassword) >= 2;
  const canReset = code.trim().length >= 4 && passwordStrong;

  const submitReset = () => {
    if (!canReset) {
      setError('Entrez le code reçu et un mot de passe plus solide.');
      return;
    }
    return run(
      'Réinitialisation en cours',
      'Sécurisation de votre compte',
      async () => {
        await resetPassword({ identifier: identifier.trim(), code: code.trim(), newPassword });
        flashToast({ title: 'Succès', message: 'Mot de passe réinitialisé', tone: 'success' });
        router.replace(ROUTES.login);
      },
      'Code invalide ou expiré.',
    );
  };

  return {
    step,
    identifier,
    setIdentifier,
    code,
    setCode,
    newPassword,
    setNewPassword,
    loading,
    error,
    canReset,
    sendCode,
    submitReset,
    backToIdentifier: () => {
      setStep(1);
      setError(undefined);
    },
  };
}
