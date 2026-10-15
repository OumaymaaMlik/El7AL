import { useState } from 'react';
import { useRouter } from 'expo-router';
import { useTranslation } from '../../../shared/store/useLanguageStore';
import { useLoadingStore } from '../../../shared/store/useLoadingStore';
import { getApiErrorMessage } from '../../../shared/utils/apiError';
import { homeRouteFor } from '../../../navigation/routes';
import { login } from '../api/auth.api';
import { useAuthStore } from '../store/useAuthStore';

interface LoginErrors {
  identifier?: string;
  password?: string;
  submit?: string;
}

export function useLogin() {
  const router = useRouter();
  const { t } = useTranslation();
  const setSession = useAuthStore((state) => state.setSession);
  const showLoading = useLoadingStore((state) => state.showLoading);
  const hideLoading = useLoadingStore((state) => state.hideLoading);

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<LoginErrors>({});

  const clearError = (field: keyof LoginErrors) => {
    if (errors[field]) setErrors((e) => ({ ...e, [field]: undefined }));
  };

  const submit = async () => {
    const next: LoginErrors = {};
    if (!identifier.trim()) next.identifier = t('errIdentifierRequired');
    if (!password.trim()) next.password = t('errPasswordRequired');
    if (next.identifier || next.password) {
      setErrors(next);
      return;
    }

    setErrors({});
    setLoading(true);
    showLoading('Connexion en cours', 'Préparation de votre espace');
    try {
      const { token, refreshToken, user } = await login({ identifier: identifier.trim(), password });
      await setSession(token, user, refreshToken);
      router.replace(homeRouteFor(user.role));
    } catch (err) {
      setErrors({ submit: getApiErrorMessage(err, t('errLoginFailed')) });
    } finally {
      setLoading(false);
      hideLoading();
    }
  };

  return { identifier, password, loading, errors, setIdentifier, setPassword, clearError, submit };
}
