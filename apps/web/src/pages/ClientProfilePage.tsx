import React, { useState, useEffect } from 'react';
import { User, Phone, Mail, Upload, Save, LogOut } from 'lucide-react';
import { ClientLayout } from '../layouts/ClientLayout';
import { StatusMessage } from '../components/ui/StatusMessage';
import { DeleteAccountButton } from '../components/ui/DeleteAccountModal';
import { ChangeEmailModal } from '../components/ui/ChangeEmailModal';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { GlassCard } from '../components/ui/GlassCard';
import { AddressField } from '../components/ui/AddressField';
import { useAuthStore } from '../store/useAuthStore';
import { api, apiErrorMessage } from '../services/api';
import { useNavigate } from 'react-router-dom';

export const ClientProfilePage: React.FC = () => {
  const { user, setAuth, logout } = useAuthStore();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState(user?.fullName || '');
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || '');
  const [email, setEmail] = useState(user?.email || '');
  const [defaultAddress, setDefaultAddress] = useState('');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');

  const [addressCoords, setAddressCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [changingEmail, setChangingEmail] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    // Fetch latest user profile from API
    api
      .get('/users/me')
      .then((res) => {
        if (res.data.success) {
          const profile = res.data.data;
          const defAddr = profile.clientProfile?.defaultAddress || '';
          setFullName(profile.fullName || '');
          setPhoneNumber(profile.phoneNumber || '');
          setEmail(profile.email || '');
          setAvatarUrl(profile.avatarUrl || '');
          setDefaultAddress(defAddr);
          if (
            typeof profile.clientProfile?.defaultLat === 'number' &&
            typeof profile.clientProfile?.defaultLng === 'number'
          ) {
            setAddressCoords({ lat: profile.clientProfile.defaultLat, lng: profile.clientProfile.defaultLng });
          }

          // Read the signed-in user now, not from the first render, so this runs once on arrival.
          const { user: signedIn, token, setAuth: remember } = useAuthStore.getState();
          if (signedIn) {
            remember(
              {
                ...signedIn,
                fullName: profile.fullName || signedIn.fullName,
                phoneNumber: profile.phoneNumber || signedIn.phoneNumber,
                email: profile.email || signedIn.email,
                avatarUrl: profile.avatarUrl || signedIn.avatarUrl,
                defaultAddress: defAddr || signedIn.defaultAddress,
              },
              token || '',
            );
          }
        }
      })
      .catch(() => setErrorMsg('Impossible de charger votre profil.'));
  }, []);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('avatar', file);

    try {
      const res = await api.post('/uploads/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data.success) {
        const uploadedUrl = res.data.url || res.data.data?.url;
        setAvatarUrl(uploadedUrl);
        setSuccessMsg('Photo de profil mise à jour avec succès.');
      }
    } catch (err) {
      setErrorMsg(apiErrorMessage(err, "Erreur lors de l'envoi de la photo."));
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    try {
      const res = await api.put('/users/profile', {
        fullName,
        defaultAddress,
        ...(addressCoords ? { defaultLat: addressCoords.lat, defaultLng: addressCoords.lng } : {}),
        avatarUrl,
      });

      if (res.data.success && user) {
        const updatedUser = res.data.data;
        const token = useAuthStore.getState().token || '';
        setAuth(
          {
            ...user,
            fullName: updatedUser.fullName,
            email: updatedUser.email,
            avatarUrl: updatedUser.avatarUrl,
          },
          token,
        );

        setSuccessMsg('Profil mis à jour avec succès.');
      }
    } catch (err) {
      setErrorMsg(apiErrorMessage(err, 'Erreur lors de la mise à jour du profil.'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ClientLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Page Title */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Mon Profil Client</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Gérez vos informations personnelles, coordonnées et votre adresse d'intervention
            </p>
          </div>
        </div>

        {successMsg && <StatusMessage tone="success">{successMsg}</StatusMessage>}
        {errorMsg && <StatusMessage tone="error">{errorMsg}</StatusMessage>}

        {/* Profile Card */}
        <GlassCard className="space-y-6">
          {/* Avatar Header */}
          <div className="flex items-center gap-5 border-b border-slate-200 dark:border-slate-800 pb-6">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-brand-500 text-white flex items-center justify-center text-2xl font-bold overflow-hidden ">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  fullName.charAt(0) || 'C'
                )}
              </div>
              <label
                className={`absolute bottom-0 end-0 p-1.5 rounded-full bg-brand-accent text-slate-900 cursor-pointer hover:scale-110 transition-transform ${isUploading ? 'opacity-60 pointer-events-none' : ''}`}
              >
                <Upload className={`w-3.5 h-3.5 ${isUploading ? 'animate-pulse' : ''}`} />
                <input
                  type="file"
                  accept="image/*"
                  aria-label="Changer la photo de profil"
                  disabled={isUploading}
                  onChange={handleAvatarUpload}
                  className="hidden"
                />
              </label>
            </div>

            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">{fullName || user?.fullName}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">{phoneNumber || user?.phoneNumber}</p>
              <span className="inline-block mt-1 text-xs font-semibold text-brand-500 dark:text-brand-accent bg-brand-500/10 px-2.5 py-0.5 rounded-full">
                Client El 7al
              </span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Nom et Prénom"
                icon={<User className="w-4 h-4" />}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />

              <Input
                label="Numéro de Téléphone"
                icon={<Phone className="w-4 h-4" />}
                value={phoneNumber}
                readOnly
                className="opacity-70"
              />
            </div>

            <div className="flex items-end gap-3">
              <div className="flex-1">
                <Input
                  label="Adresse E-mail"
                  type="email"
                  icon={<Mail className="w-4 h-4" />}
                  value={email}
                  readOnly
                  className="opacity-70"
                />
              </div>
              <Button type="button" variant="outline" onClick={() => setChangingEmail(true)}>
                Modifier
              </Button>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              L&apos;e-mail se change avec un code envoyé à la nouvelle adresse. Pour changer de numéro de téléphone,
              contactez le support El 7al.
            </p>

            <AddressField
              label="Adresse d'Intervention par Défaut (Lieu)"
              value={defaultAddress}
              onChange={setDefaultAddress}
              lat={addressCoords?.lat}
              lng={addressCoords?.lng}
              onCoordinates={(lat, lng) => setAddressCoords({ lat, lng })}
              onError={setErrorMsg}
            />

            <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  logout();
                  navigate('/login');
                }}
                leftIcon={<LogOut className="w-4 h-4" />}
              >
                Déconnexion
              </Button>

              <Button type="submit" variant="primary" isLoading={isLoading} leftIcon={<Save className="w-4 h-4" />}>
                Enregistrer les modifications
              </Button>
            </div>
          </form>
        </GlassCard>
        <DeleteAccountButton
          onDeleted={() => {
            logout();
            navigate('/login');
          }}
        />
      </div>
      <ChangeEmailModal
        isOpen={changingEmail}
        onClose={() => setChangingEmail(false)}
        currentEmail={email}
        onChanged={(newEmail) => {
          setEmail(newEmail);
          const { user: signedIn, token, setAuth: remember } = useAuthStore.getState();
          if (signedIn) remember({ ...signedIn, email: newEmail }, token || '');
          setSuccessMsg('Adresse e-mail mise à jour.');
        }}
      />
    </ClientLayout>
  );
};
