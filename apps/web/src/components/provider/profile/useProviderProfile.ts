import { useEffect, useState } from 'react';
import { api, apiErrorMessage } from '../../../services/api';
import { useAuthStore } from '../../../store/useAuthStore';
import { useNotificationStore } from '../../../store/useNotificationStore';

export interface TradeOption {
  id: string;
  name: string;
}

export const RADIUS_OPTIONS = [5, 10, 15, 25, 50];

/** Everything the artisan profile screen loads and saves: the account, the trades, the zone and the photo. */
export function useProviderProfile() {
  const { user, token, setAuth } = useAuthStore();
  const addNotification = useNotificationStore((s) => s.addNotification);

  const [fullName, setFullName] = useState(user?.fullName || '');
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || '');
  const [email, setEmail] = useState(user?.email || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');
  const [bio, setBio] = useState('');
  const [address, setAddress] = useState('');
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [radiusKm, setRadiusKm] = useState(25);
  const [categoryIds, setCategoryIds] = useState<string[]>([]);
  const [trades, setTrades] = useState<TradeOption[]>([]);
  const [rating, setRating] = useState({ average: 0, total: 0 });
  const [hasDocument, setHasDocument] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    api
      .get('/users/me')
      .then((res) => {
        const me = res.data.data;
        if (!me) return;
        setFullName(me.fullName || '');
        setPhoneNumber(me.phoneNumber || '');
        setEmail(me.email || '');
        if (me.avatarUrl) setAvatarUrl(me.avatarUrl);
        const pro = me.providerProfile;
        if (!pro) return;
        setBio(pro.bio || '');
        setAddress(pro.address || '');
        if (typeof pro.currentLat === 'number' && typeof pro.currentLng === 'number')
          setCoords({ lat: pro.currentLat, lng: pro.currentLng });
        if (pro.radiusKm) setRadiusKm(pro.radiusKm);
        setRating({ average: pro.ratingAverage ?? 0, total: pro.totalRatings ?? 0 });
        setHasDocument(Array.isArray(pro.documentsUrl) && pro.documentsUrl.length > 0);
        setCategoryIds((pro.categories || []).map((c: { category: { id: string } }) => c.category.id));
      })
      .catch(() =>
        addNotification({ title: 'Profil', message: 'Impossible de charger votre profil.', type: 'danger' }),
      );

    api
      .get('/categories')
      .then((res) => setTrades(res.data.data ?? []))
      .catch(() => undefined);
  }, [addNotification]);

  const toggleTrade = (id: string) =>
    setCategoryIds((ids) => (ids.includes(id) ? ids.filter((i) => i !== id) : [...ids, id]));

  const rememberAvatar = (url: string) => {
    setAvatarUrl(url);
    if (user) setAuth({ ...user, avatarUrl: url }, token || '');
  };

  const uploadAvatar = async (file: File) => {
    setUploading(true);
    const formData = new FormData();
    formData.append('avatar', file);
    try {
      const res = await api.post('/uploads/avatar', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      const url = res.data.url || res.data.data?.url;
      if (url) {
        rememberAvatar(url);
        addNotification({
          title: 'Photo mise à jour',
          message: 'Votre photo de profil a été enregistrée.',
          type: 'success',
        });
      }
    } catch (err) {
      addNotification({
        title: 'Photo',
        message: apiErrorMessage(err, "La photo de profil n'a pas pu être téléversée."),
        type: 'danger',
      });
    } finally {
      setUploading(false);
    }
  };

  const removeAvatar = () => {
    rememberAvatar('');
    addNotification({ title: 'Photo supprimée', message: 'Votre photo de profil a été retirée.', type: 'info' });
  };

  /** Saves the name, address, presentation, trades and zone. The phone and e-mail are not editable here: changing them needs a verification. */
  const save = async () => {
    if (categoryIds.length === 0) {
      addNotification({ title: 'Métiers', message: 'Choisissez au moins un métier.', type: 'warning' });
      return;
    }
    setSaving(true);
    try {
      const res = await api.put('/users/profile', {
        fullName,
        avatarUrl: avatarUrl || undefined,
        defaultAddress: address || undefined,
        ...(coords ? { defaultLat: coords.lat, defaultLng: coords.lng } : {}),
      });
      await api.put('/geo/provider/settings', { bio, radiusKm, categoryIds });
      const saved = res.data.data;
      if (user)
        setAuth(
          { ...user, fullName: saved?.fullName || fullName, avatarUrl: saved?.avatarUrl ?? avatarUrl },
          token || '',
        );
      addNotification({
        title: 'Modifications enregistrées',
        message: 'Votre profil a été mis à jour.',
        type: 'success',
      });
    } catch (err) {
      addNotification({
        title: 'Enregistrement impossible',
        message: apiErrorMessage(err, "Votre profil n'a pas pu être mis à jour."),
        type: 'danger',
      });
    } finally {
      setSaving(false);
    }
  };

  return {
    fullName,
    setFullName,
    phoneNumber,
    email,
    setEmail: (value: string) => {
      setEmail(value);
      if (user) setAuth({ ...user, email: value }, token || '');
    },
    avatarUrl,
    bio,
    setBio,
    address,
    setAddress,
    coords,
    setCoords,
    radiusKm,
    setRadiusKm,
    categoryIds,
    toggleTrade,
    trades,
    rating,
    hasDocument,
    saving,
    uploading,
    uploadAvatar,
    removeAvatar,
    save,
  };
}
