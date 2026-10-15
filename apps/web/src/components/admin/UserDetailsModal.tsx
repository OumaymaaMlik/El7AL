import React from 'react';
import { Car, ExternalLink, Mail, Phone, Trash2, UserCheck, UserX } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { InfoTile } from './AdminUi';
import type { AdminUser } from './adminTypes';

interface UserDetailsModalProps {
  user: AdminUser;
  onClose: () => void;
  onToggleBlock: () => void;
  onMissions: () => void;
  onDelete: () => void;
}

const isImage = (url: string) => /\.(png|jpe?g|webp|gif)(\?|$)/i.test(url) || url.includes('X-Amz-Signature');

/** Everything the admin knows about one account, with block / history / delete actions. */
export const UserDetailsModal: React.FC<UserDetailsModalProps> = ({
  user,
  onClose,
  onToggleBlock,
  onMissions,
  onDelete,
}) => {
  const profile = user.role === 'PROVIDER' ? user.providerProfile : null;
  const blocked = user.status === 'BLOCKED';

  return (
    <Modal isOpen onClose={onClose} title={user.fullName} maxWidth="xl">
      <div className="space-y-4 text-xs">
        <span className="text-xs text-slate-500 block -mt-3">
          {user.role === 'CLIENT' ? 'Client' : 'Prestataire'} · membre depuis le{' '}
          {new Date(user.createdAt).toLocaleDateString('fr-FR')}
        </span>

        <div className="grid grid-cols-2 gap-3">
          <InfoTile
            label={
              <>
                <Phone className="w-3 h-3 text-emerald-500" /> Téléphone
              </>
            }
          >
            {user.phoneNumber}
          </InfoTile>
          <InfoTile
            label={
              <>
                <Mail className="w-3 h-3 text-emerald-500" /> Email
              </>
            }
          >
            <span className="truncate block">{user.email || 'Non renseigné'}</span>
          </InfoTile>
        </div>

        {profile && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <InfoTile label="Portefeuille">
                <span className="text-emerald-600">{profile.walletBalance} TND</span>
              </InfoTile>
              <InfoTile label="Rayon d'intervention">{profile.radiusKm ?? 10} km</InfoTile>
            </div>

            {profile.bio && (
              <InfoTile label="Présentation">
                <span className="font-normal italic text-slate-700 dark:text-slate-300">
                  &laquo; {profile.bio} &raquo;
                </span>
              </InfoTile>
            )}

            {!!profile.categories?.length && (
              <InfoTile label="Spécialités">
                <div className="flex flex-wrap gap-1.5">
                  {profile.categories.map((c) => (
                    <span
                      key={c.category.id}
                      className="px-2.5 py-1 rounded-xl bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 font-bold text-xs"
                    >
                      {c.category.name}
                    </span>
                  ))}
                </div>
              </InfoTile>
            )}

            <InfoTile label="Pièces d'identité">
              {profile.documentsUrl?.length ? (
                <div className="flex flex-col gap-2">
                  {profile.documentsUrl.map((url, i) =>
                    isImage(url) ? (
                      <a
                        key={url}
                        href={url}
                        target="_blank"
                        rel="noreferrer"
                        className="block rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 max-h-48 bg-black/10"
                      >
                        <img src={url} alt={`Pièce ${i + 1}`} className="max-h-48 object-contain w-full" />
                      </a>
                    ) : (
                      <a
                        key={url}
                        href={url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-emerald-500 hover:underline flex items-center gap-1"
                      >
                        <ExternalLink className="w-3 h-3" /> Ouvrir le document {i + 1}
                      </a>
                    ),
                  )}
                </div>
              ) : (
                <span className="font-normal italic text-slate-500 dark:text-slate-400">Aucune pièce téléversée.</span>
              )}
            </InfoTile>
          </>
        )}
      </div>

      <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <button
            onClick={onToggleBlock}
            className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors text-white ${blocked ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-amber-500 hover:bg-amber-400'}`}
          >
            {blocked ? <UserCheck className="w-4 h-4" /> : <UserX className="w-4 h-4" />}
            <span>{blocked ? 'Débloquer' : 'Bloquer'}</span>
          </button>
          <button
            onClick={onMissions}
            className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold flex items-center gap-1.5 hover:bg-slate-200 transition-colors"
          >
            <Car className="w-4 h-4" />
            <span>Missions</span>
          </button>
        </div>
        <button
          onClick={onDelete}
          className="px-3 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
          <span>Supprimer le compte</span>
        </button>
      </div>
    </Modal>
  );
};
