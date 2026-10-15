import { useState } from 'react';
import { useRouter } from 'expo-router';
import { useTranslation } from '../../../shared/store/useLanguageStore';
import { useLoadingStore } from '../../../shared/store/useLoadingStore';
import { useNotificationStore } from '../../notifications/store/useNotificationStore';
import { pickImageFromDevice } from '../../../shared/utils/imagePicker';
import { getApiErrorMessage } from '../../../shared/utils/apiError';
import { logger } from '../../../shared/utils/logger';
import { DEFAULT_MAP_CENTER } from '../../../config/constants';
import { reverseGeocode } from '../../map/services/geocoding';
import { homeRouteFor, ROUTES } from '../../../navigation/routes';
import { registerClient, registerProvider, sendEmailVerification, uploadDocument } from '../api/auth.api';
import { useRegisterCategories } from './useRegisterCategories';
import { useAuthStore } from '../store/useAuthStore';
import { formatTunisianPhone, toTunisianE164 } from '../utils/phone';
import { hasErrors, validateIdentity, type RegisterErrors } from '../utils/validateRegister';

export type RegisterRole = 'CLIENT' | 'PROVIDER';
export const REGISTER_STEP_COUNT = 3;

export function useRegisterWizard(initialRole: RegisterRole) {
  const router = useRouter();
  const { t } = useTranslation();
  const setSession = useAuthStore((state) => state.setSession);
  const flashToast = useNotificationStore((state) => state.flashToast);
  const showLoading = useLoadingStore((state) => state.showLoading);
  const hideLoading = useLoadingStore((state) => state.hideLoading);

  const [role, setRole] = useState<RegisterRole>(initialRole);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<RegisterErrors>({});

  const { categories, failed: categoriesFailed, reload: loadCategories } = useRegisterCategories();

  const [fullName, setFullName] = useState('');
  const [phoneDigits, setPhoneDigits] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [defaultAddress, setDefaultAddress] = useState('');
  const [bio, setBio] = useState('');
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [vehicleType, setVehicleType] = useState('CAR');
  const [cinNumber, setCinNumber] = useState('');
  const [cinFrontUri, setCinFrontUri] = useState('');
  const [cinBackUri, setCinBackUri] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');

  const [otpVisible, setOtpVisible] = useState(false);
  const [devCode, setDevCode] = useState<string | undefined>(undefined);

  const [mapOpen, setMapOpen] = useState(false);
  const [lat, setLat] = useState<number>(DEFAULT_MAP_CENTER.lat);
  const [lng, setLng] = useState<number>(DEFAULT_MAP_CENTER.lng);

  const isProvider = role === 'PROVIDER';

  const clearError = (field: keyof RegisterErrors) => {
    if (errors[field]) setErrors((e) => ({ ...e, [field]: undefined }));
  };

  const changeRole = (next: RegisterRole) => {
    setRole(next);
    setStep(1);
    setErrors({});
  };

  const changePhone = (text: string) => {
    setPhoneDigits(formatTunisianPhone(text));
    clearError('phone');
  };

  const toggleCategory = (id: string) => {
    setSelectedCategoryIds((ids) => (ids.includes(id) ? ids.filter((c) => c !== id) : [...ids, id]));
    clearError('trades');
  };

  const pickCin = async (side: 'front' | 'back') => {
    const uri = await pickImageFromDevice();
    if (!uri) return;
    if (side === 'front') setCinFrontUri(uri);
    else setCinBackUri(uri);
  };

  const selectMapLocation = (nextLat: number, nextLng: number) => {
    setLat(nextLat);
    setLng(nextLng);
    reverseGeocode(nextLat, nextLng).then((address) => {
      if (address) setDefaultAddress(address);
    });
  };

  const checkIdentity = (): boolean => {
    const next = validateIdentity({ fullName, phoneDigits, email, password }, t);
    setErrors(next);
    return !hasErrors(next);
  };

  const checkTrades = (): boolean => {
    if (selectedCategoryIds.length === 0) {
      setErrors({ trades: t('errSelectTrade') });
      return false;
    }
    setErrors({});
    return true;
  };

  const next = () => {
    if (step === 1 && !checkIdentity()) return;
    if (step === 2 && !checkTrades()) return;
    setStep(step + 1);
  };

  const previous = () => setStep((s) => Math.max(1, s - 1));

  /** Returns true when the wizard consumed the back press (moved to the previous step). */
  const goBackStep = (): boolean => {
    if (isProvider && step > 1) {
      previous();
      return true;
    }
    return false;
  };

  const uploadIfLocal = async (uri: string, name: string) => {
    if (!uri.startsWith('file:')) return uri;
    try {
      return (await uploadDocument(uri, name)) ?? uri;
    } catch (e) {
      logger.warn(`${name} upload fallback:`, e);
      return uri;
    }
  };

  const performRegister = async () => {
    setOtpVisible(false);
    setLoading(true);
    showLoading('Inscription en cours', 'Création de votre compte');
    try {
      const phoneNumber = toTunisianE164(phoneDigits);

      if (role === 'CLIENT') {
        const { token, refreshToken, user } = await registerClient({
          fullName,
          phoneNumber,
          email: email.trim(),
          password,
          defaultAddress,
        });
        await setSession(token, user, refreshToken);
        flashToast({ title: t('accountCreatedTitle'), message: t('accountCreatedClient'), tone: 'success' });
        router.replace(homeRouteFor(user.role));
      } else {
        const cinFrontUrl = await uploadIfLocal(cinFrontUri, 'cin_front.jpg');
        const cinBackUrl = await uploadIfLocal(cinBackUri, 'cin_back.jpg');
        const { token, refreshToken, user } = await registerProvider({
          fullName,
          phoneNumber,
          email: email.trim() || undefined,
          password,
          bio,
          categoryIds: selectedCategoryIds,
          vehicleType,
          cinNumber,
          cinFrontUrl,
          cinBackUrl,
          licenseNumber,
        });
        await setSession(token, user, refreshToken);
        flashToast({ title: t('applicationSentTitle'), message: t('applicationSentMsg'), tone: 'success' });
        router.replace(homeRouteFor(user.role));
      }
    } catch (err) {
      setErrors({ submit: getApiErrorMessage(err, t('errRegisterFailed')) });
    } finally {
      setLoading(false);
      hideLoading();
    }
  };

  /** Validates, then sends the email verification code (or registers directly without an email). */
  const submit = async () => {
    if (!checkIdentity()) {
      setStep(1);
      return;
    }
    if (isProvider && !checkTrades()) {
      setStep(2);
      return;
    }

    const cleanEmail = email.trim();
    if (!cleanEmail) {
      await performRegister();
      return;
    }

    setLoading(true);
    showLoading('Envoi du code', 'Envoi du code de vérification à votre e-mail');
    try {
      const res = await sendEmailVerification(cleanEmail, fullName.trim());
      if (res.success) {
        setDevCode(res.code);
        setOtpVisible(true);
      } else {
        setErrors({ submit: res.message || "Impossible d'envoyer le code de vérification." });
      }
    } catch (err) {
      setErrors({ submit: getApiErrorMessage(err, "Erreur lors de l'envoi du code de vérification.") });
    } finally {
      setLoading(false);
      hideLoading();
    }
  };

  return {
    // state
    role,
    isProvider,
    step,
    loading,
    errors,
    categories,
    categoriesFailed,
    fullName,
    phoneDigits,
    email,
    password,
    defaultAddress,
    bio,
    selectedCategoryIds,
    vehicleType,
    cinNumber,
    cinFrontUri,
    cinBackUri,
    licenseNumber,
    otpVisible,
    devCode,
    mapOpen,
    lat,
    lng,
    // setters
    setFullName,
    setEmail,
    setPassword,
    setDefaultAddress,
    setBio,
    setVehicleType,
    setCinNumber,
    setLicenseNumber,
    setOtpVisible,
    setMapOpen,
    // actions
    clearError,
    changeRole,
    changePhone,
    toggleCategory,
    pickCin,
    selectMapLocation,
    loadCategories,
    next,
    previous,
    goBackStep,
    submit,
    performRegister,
    goToLogin: () => router.push(ROUTES.login),
    exit: () => (router.canGoBack() ? router.back() : router.replace(ROUTES.welcome)),
  };
}

export type RegisterWizard = ReturnType<typeof useRegisterWizard>;
