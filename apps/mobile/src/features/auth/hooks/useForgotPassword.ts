import { useState } from 'react';
import { useRouter } from 'expo-router';
import { useTranslation } from '../../../shared/store/useLanguageStore';
import { useLoadingStore } from '../../../shared/store/useLoadingStore';
import { getApiErrorMessage } from '../../../shared/utils/apiError';
import { calculatePasswordStrength } from '../../../shared/utils/password';
import { ROUTES } from '../../../navigation/routes';
import { useNotificationStore } from '../../notifications';
import { requestPasswordReset, resetPassword } from '../api/auth.api';

/** The server issues six-digit codes. */
export const CODE_LENGTH = 6;

/** Three steps: ask for an emailed code, type it, then set a new password with it. */
export function useForgotPassword() {
  const router = useRouter();
  const { t } = useTranslation();
  const flashToast = useNotificationStore((state) => state.flashToast);
  const showLoading = useLoadingStore((state) => state.showLoading);
  const hideLoading = useLoadingStore((state) => state.hideLoading);

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [codeShake, setCodeShake] = useState(0);
  const [identifier, setIdentifier] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();

  const run = async (
    title: string,
    subtitle: string,
    action: () => Promise<void>,
    fallback: string,
    onFail?: () => void,
  ) => {
    setLoading(true);
    setError(undefined);
    showLoading(title, subtitle);
    try {
      await action();
    } catch (e) {
      setError(getApiErrorMessage(e, fallback));
      onFail?.();
    } finally {
      setLoading(false);
      hideLoading();
    }
  };

  const sendCode = () => {
    if (!identifier.trim()) return;
    return run(
      t('loadingSendingCode'),
      t('loadingCheckInbox'),
      async () => {
        await requestPasswordReset(identifier.trim());
        setStep(2);
      },
      t('errSendCode'),
    );
  };

  const passwordStrong = calculatePasswordStrength(newPassword) >= 2;
  const canReset = code.trim().length >= 4 && passwordStrong;

  /** Step 2 to 3: the code is checked by the server together with the new password, so this only needs all the digits. */
  const continueWithCode = () => {
    if (code.trim().length < CODE_LENGTH) {
      setCodeShake((n) => n + 1);
      return false;
    }
    setError(undefined);
    setStep(3);
    return true;
  };

  const submitReset = () => {
    if (!canReset) {
      setError(t('errCodeAndPassword'));
      return;
    }
    return run(
      t('loadingResetting'),
      t('loadingSecuring'),
      async () => {
        await resetPassword({ identifier: identifier.trim(), code: code.trim(), newPassword });
        flashToast({ title: t('successTitle'), message: t('passwordResetDone'), tone: 'success' });
        router.replace(ROUTES.login);
      },
      t('errCodeInvalid'),
      // A wrong or expired code sends the person back to retype it.
      () => {
        setStep(2);
        setCodeShake((n) => n + 1);
      },
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
    codeShake,
    continueWithCode,
    /** One step back: 3 to 2 to 1. Returns false from step 1, where the screen should leave instead. */
    backStep: () => {
      setError(undefined);
      if (step === 1) return false;
      setStep((step - 1) as 1 | 2);
      return true;
    },
  };
}
