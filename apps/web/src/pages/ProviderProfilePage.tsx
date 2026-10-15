import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, RefreshCw } from 'lucide-react';
import { DeleteAccountButton } from '../components/ui/DeleteAccountModal';
import { ProviderLayout } from '../layouts/ProviderLayout';
import { ProfileInfoCard, ProfileTradesCard } from '../components/provider/profile/ProfileDetailsCards';
import { ProfileSummaryCard } from '../components/provider/profile/ProfileSummaryCard';
import { useProviderProfile } from '../components/provider/profile/useProviderProfile';
import { useAuthStore } from '../store/useAuthStore';

export const ProviderProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const profile = useProviderProfile();

  return (
    <ProviderLayout>
      <div className="max-w-6xl mx-auto space-y-8 pb-12">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Mon profil
        </h1>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            void profile.save();
          }}
          className="space-y-8"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-4">
              <ProfileSummaryCard
                fullName={profile.fullName}
                avatarUrl={profile.avatarUrl}
                uploading={profile.uploading}
                verified={user?.status === 'ACTIVE'}
                rating={profile.rating}
                onPickAvatar={(file) => void profile.uploadAvatar(file)}
                onRemoveAvatar={profile.removeAvatar}
              />
            </div>

            <div className="lg:col-span-8 space-y-6">
              <ProfileInfoCard
                fullName={profile.fullName}
                onFullName={profile.setFullName}
                phoneNumber={profile.phoneNumber}
                email={profile.email}
                address={profile.address}
                onAddress={profile.setAddress}
                coords={profile.coords}
                onCoords={(lat, lng) => profile.setCoords({ lat, lng })}
                hasDocument={profile.hasDocument}
                onEmailChanged={profile.setEmail}
              />
              <ProfileTradesCard
                trades={profile.trades}
                selected={profile.categoryIds}
                onToggle={profile.toggleTrade}
                radiusKm={profile.radiusKm}
                onRadius={profile.setRadiusKm}
                bio={profile.bio}
                onBio={profile.setBio}
              />
            </div>
          </div>

          <div className="pt-6 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={() => {
                logout();
                navigate('/login');
              }}
              className="px-5 py-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center gap-2 hover:bg-slate-50 transition-colors"
            >
              <LogOut className="w-4 h-4 text-slate-500" />
              <span>Déconnexion</span>
            </button>

            <button
              type="submit"
              disabled={profile.saving}
              className="px-8 py-3.5 rounded-2xl bg-brand-500 hover:bg-brand-600 text-white font-extrabold text-xs transition-all active:scale-95 flex items-center gap-2 disabled:opacity-60"
            >
              {profile.saving ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Enregistrement...</span>
                </>
              ) : (
                <span>Enregistrer les modifications</span>
              )}
            </button>
          </div>
        </form>
        <DeleteAccountButton
          onDeleted={() => {
            logout();
            navigate('/login');
          }}
        />
      </div>
    </ProviderLayout>
  );
};
