import React, { useRef } from 'react';
import { Camera, RefreshCw, ShieldCheck, Star, Trash2 } from 'lucide-react';
import { useNotificationStore } from '../../../store/useNotificationStore';
import { useProviderStore } from '../../../store/useProviderStore';

interface ProfileSummaryCardProps {
  fullName: string;
  avatarUrl: string;
  uploading: boolean;
  verified: boolean;
  rating: { average: number; total: number };
  onPickAvatar: (file: File) => void;
  onRemoveAvatar: () => void;
}

const ROUND_BUTTON =
  'rounded-full text-white flex items-center justify-center border-2 border-slate-900 transition-colors';

/** The dark green card: photo, name, verification state, the on/off switch and the artisan's real rating. */
export const ProfileSummaryCard: React.FC<ProfileSummaryCardProps> = ({
  fullName,
  avatarUrl,
  uploading,
  verified,
  rating,
  onPickAvatar,
  onRemoveAvatar,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const addNotification = useNotificationStore((s) => s.addNotification);
  const isOnline = useProviderStore((s) => s.isOnline);
  const setOnline = useProviderStore((s) => s.setOnline);

  return (
    <div className="bg-brand-500 text-white rounded-tile p-6 border border-brand-500 space-y-6 text-center">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        aria-label="Choisir une photo de profil"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onPickAvatar(file);
          e.target.value = '';
        }}
      />

      <div className="relative w-28 h-28 mx-auto">
        {uploading ? (
          <div className="w-full h-full rounded-full bg-white/10 border-4 border-brand-accent flex items-center justify-center text-brand-accent">
            <RefreshCw className="w-8 h-8 animate-spin" />
          </div>
        ) : avatarUrl ? (
          <img
            src={avatarUrl}
            alt={fullName}
            className="w-full h-full rounded-full object-cover border-4 border-brand-accent"
          />
        ) : (
          <div className="w-full h-full rounded-full bg-white/10 border-4 border-brand-accent text-brand-accent flex items-center justify-center font-black text-3xl">
            {fullName.charAt(0)}
          </div>
        )}

        <div className="absolute bottom-0 end-0 flex items-center gap-1">
          {avatarUrl && !uploading && (
            <button
              type="button"
              onClick={onRemoveAvatar}
              title="Supprimer la photo de profil"
              aria-label="Supprimer la photo de profil"
              className={`w-8 h-8 bg-red-600 hover:bg-red-700 ${ROUND_BUTTON}`}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            title="Changer la photo de profil"
            aria-label="Changer la photo de profil"
            className={`w-9 h-9 bg-brand-500 hover:bg-brand-accent hover:text-brand-deep disabled:opacity-50 ${ROUND_BUTTON}`}
          >
            <Camera className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="space-y-1">
        <h3 className="text-xl font-extrabold text-white">{fullName}</h3>
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-white/10 text-brand-accent border border-brand-500">
          <ShieldCheck className="w-3.5 h-3.5" />
          {verified ? 'Technicien certifié' : 'Vérification en cours'}
        </span>
      </div>

      <div className="p-4 rounded-2xl bg-white/10 border border-brand-500 text-start flex items-center justify-between gap-3">
        <div>
          <span className="block text-xs font-extrabold text-white">{isOnline ? 'En service' : 'Hors service'}</span>
          <span className="block text-xs text-slate-300">Alertes d&apos;urgence en temps réel</span>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={isOnline}
          aria-label="Disponibilité"
          onClick={async () => {
            const error = await setOnline(!isOnline);
            if (error) addNotification({ title: 'Disponibilité', message: error, type: 'danger' });
          }}
          className={`w-12 h-7 rounded-full p-1 transition-colors duration-300 flex items-center ${isOnline ? 'bg-brand-accent' : 'bg-slate-700'}`}
        >
          <div
            className={`w-5 h-5 rounded-full bg-slate-950 transform transition-transform duration-300 ${isOnline ? 'translate-x-5 rtl:-translate-x-5' : 'translate-x-0'}`}
          />
        </button>
      </div>

      <div className="pt-4 border-t border-brand-500 flex items-center justify-center gap-2 text-sm">
        <Star className="w-4 h-4 text-brand-accent fill-brand-accent" />
        {rating.total > 0 ? (
          <span className="font-extrabold">
            {rating.average.toFixed(1)} <span className="font-medium text-slate-300">· {rating.total} avis</span>
          </span>
        ) : (
          <span className="text-slate-300 text-xs">Pas encore d&apos;avis</span>
        )}
      </div>
    </div>
  );
};
