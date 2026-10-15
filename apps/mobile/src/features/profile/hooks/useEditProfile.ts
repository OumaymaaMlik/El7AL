import { useEffect, useState } from 'react';
import { useAuthStore } from '../../auth';
import { useTranslation } from '../../../shared/store/useLanguageStore';
import { useLoadingStore } from '../../../shared/store/useLoadingStore';
import { useNotificationStore } from '../../notifications/store/useNotificationStore';
import { DEFAULT_MAP_CENTER } from '../../../config/constants';
import { pickImageFromDevice } from '../../../shared/utils/imagePicker';
import { getApiErrorMessage } from '../../../shared/utils/apiError';
import { calculatePasswordStrength } from '../../../shared/utils/password';
import { logger } from '../../../shared/utils/logger';
import { reverseGeocode } from '../../map/services/geocoding';
import { requestEmailChange, updateProfile, uploadAvatar } from '../api/profile.api';
import type { Profile, UpdateProfileInput } from '../schemas/profile.schema';

interface Options {
  profile: Profile | null;
  /** Form values are re-synced from `profile` whenever this changes. */
  loadedVersion: number;
  onSaved: (updated: Profile) => void;
}

/** State and actions for the edit-profile and change-password sheets. */
export function useEditProfile({ profile, loadedVersion, onSaved }: Options) {
  const { t } = useTranslation();
  const flashToast = useNotificationStore((state) => state.flashToast);
  const showLoading = useLoadingStore((state) => state.showLoading);
  const hideLoading = useLoadingStore((state) => state.hideLoading);

  const [editOpen, setEditOpen] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [mapOpen, setMapOpen] = useState(false);
  const [otpVisible, setOtpVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);

  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [originalEmail, setOriginalEmail] = useState('');
  const [address, setAddress] = useState('');
  const [lat, setLat] = useState<number>(DEFAULT_MAP_CENTER.lat);
  const [lng, setLng] = useState<number>(DEFAULT_MAP_CENTER.lng);
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [avatarFailed, setAvatarFailed] = useState(false);

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const passwordScore = calculatePasswordStrength(newPassword);
  const passwordValid = newPassword.length >= 8 && newPassword === confirmPassword && passwordScore >= 2;

  useEffect(() => {
    if (!profile) return;
    setFullName(profile.fullName || '');
    setPhoneNumber(profile.phoneNumber || '');
    setEmail(profile.email || '');
    setOriginalEmail(profile.email || '');
    setAddress(profile.clientProfile?.defaultAddress || '');
    setLat(profile.clientProfile?.defaultLat || DEFAULT_MAP_CENTER.lat);
    setLng(profile.clientProfile?.defaultLng || DEFAULT_MAP_CENTER.lng);
    setBio(profile.providerProfile?.bio || '');
    setAvatarUrl(profile.avatarUrl || '');
    setAvatarFailed(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadedVersion]);

  const pickAvatar = async () => {
    try {
      const uri = await pickImageFromDevice();
      if (!uri) return;
      setAvatarUrl(uri);
      setAvatarFailed(false);
      try {
        const hosted = await uploadAvatar(uri);
        if (hosted) setAvatarUrl(hosted);
      } catch (e) {
        logger.warn('Backend upload fallback to local URI:', e);
      }
    } catch (e) {
      logger.warn('Failed image picker:', e);
    }
  };

  const selectMapLocation = (nextLat: number, nextLng: number) => {
    setLat(nextLat);
    setLng(nextLng);
    reverseGeocode(nextLat, nextLng).then((a) => {
      if (a) setAddress(a);
    });
  };

  const performSave = async () => {
    setOtpVisible(false);
    setSaving(true);
    setError(undefined);
    showLoading('Mise à jour du profil', 'Enregistrement de vos modifications');
    try {
      const input: UpdateProfileInput = {
        fullName,
        defaultAddress: address,
        defaultLat: lat,
        defaultLng: lng,
        bio,
        avatarUrl,
        ...(newPassword && oldPassword ? { oldPassword, password: newPassword } : {}),
      };
      const updated = await updateProfile(input);
      if (updated) {
        onSaved(updated);
        const { user, token, setSession } = useAuthStore.getState();
        if (user) await setSession(token || '', { ...user, fullName: updated.fullName ?? user.fullName });
        setEditOpen(false);
        flashToast({ title: t('profileUpdatedTitle'), message: t('profileUpdatedMsg'), tone: 'success' });
      }
    } catch (err) {
      setError(getApiErrorMessage(err, t('errProfileUpdate')));
    } finally {
      setSaving(false);
      hideLoading();
    }
  };

  /** A new e-mail address is proven first: a code is sent to it, and the sheet asks for the code. */
  const save = async () => {
    if (email.trim().toLowerCase() !== originalEmail.toLowerCase()) {
      setError(undefined);
      try {
        const sent = await requestEmailChange(email.trim());
        if (!sent.success) throw new Error(sent.message);
        setOtpVisible(true);
      } catch (err) {
        setError(getApiErrorMessage(err, t('errProfileUpdate')));
      }
      return;
    }
    await performSave();
  };

  const confirmNewPassword = () => {
    if (passwordValid) setPasswordOpen(false);
    else setError('Veuillez entrer un mot de passe valide.');
  };

  return {
    editOpen,
    setEditOpen,
    passwordOpen,
    setPasswordOpen,
    mapOpen,
    setMapOpen,
    otpVisible,
    setOtpVisible,
    saving,
    error,
    fullName,
    setFullName,
    phoneNumber,
    setPhoneNumber,
    email,
    setEmail,
    address,
    setAddress,
    lat,
    lng,
    bio,
    avatarUrl,
    avatarFailed,
    setAvatarFailed,
    otpIdentifier: email.trim(),
    oldPassword,
    setOldPassword,
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,
    passwordScore,
    passwordValid,
    pickAvatar,
    selectMapLocation,
    save,
    performSave,
    confirmNewPassword,
  };
}

export type EditProfileForm = ReturnType<typeof useEditProfile>;
