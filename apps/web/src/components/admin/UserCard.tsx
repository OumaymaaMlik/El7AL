import React from 'react';
import { Calendar, Car, Eye, Star, Trash2, UserRound, Wrench } from 'lucide-react';
import { AdminCard, StatusPill } from './AdminUi';
import type { AdminUser } from './adminTypes';

interface UserCardProps {
  user: AdminUser;
  onInspect: () => void;
  onMissions: () => void;
  onDelete: () => void;
}

const META_BOX =
  'cursor-pointer flex flex-col gap-2 text-xs my-3 bg-light-bg dark:bg-dark-bg p-3 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-emerald-500/40 transition-colors';

export const UserCard: React.FC<UserCardProps> = ({ user: u, onInspect, onMissions, onDelete }) => {
  const isClient = u.role === 'CLIENT';
  const profile = u.providerProfile;
  const RoleIcon = isClient ? UserRound : Wrench;

  return (
    <AdminCard className="p-5 flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700 transition-colors group">
      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="cursor-pointer" onClick={onInspect}>
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-extrabold uppercase tracking-wider mb-1.5 ${
                isClient
                  ? 'bg-sky-100 text-sky-700 dark:bg-sky-950/60 dark:text-sky-400'
                  : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
              }`}
            >
              <RoleIcon className="w-3 h-3" />
              {isClient ? 'Client' : 'Prestataire'}
            </span>
            <h4 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 transition-colors flex items-center gap-1.5">
              {u.fullName}
              <Eye className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 group-hover:text-emerald-500" />
            </h4>
            <span className="text-xs text-slate-500">{u.phoneNumber}</span>
          </div>

          <div className="flex flex-col items-end gap-1.5">
            <StatusPill status={u.status} />
            <button
              onClick={onDelete}
              title="Supprimer cet utilisateur"
              aria-label="Supprimer cet utilisateur"
              className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-xl transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {isClient && (
          <div onClick={onInspect} className={`${META_BOX} gap-1 text-slate-600 dark:text-slate-400`}>
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" /> Inscrit le {new Date(u.createdAt).toLocaleDateString('fr-FR')}
            </span>
            <span className="flex items-center gap-1.5">
              <Car className="w-3.5 h-3.5" /> Interventions demandées : {u.missionsCount ?? 0}
            </span>
          </div>
        )}

        {!isClient && profile && (
          <div onClick={onInspect} className={META_BOX}>
            {!!profile.categories?.length && (
              <div className="flex flex-wrap gap-1">
                {profile.categories.map((c) => (
                  <span
                    key={c.category.id}
                    className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 text-xs font-semibold"
                  >
                    {c.category.name}
                  </span>
                ))}
              </div>
            )}

            <div className="flex items-center justify-between text-slate-700 dark:text-slate-300 font-semibold pt-1">
              <span className="flex items-center gap-1 text-amber-500">
                <Star className="w-3.5 h-3.5 fill-amber-500" />
                {(profile.ratingAverage ?? 0).toFixed(1)} ({profile.totalRatings ?? 0} avis)
              </span>
              <span className={`text-xs font-bold ${u.disputesCount ? 'text-rose-500' : 'text-emerald-500'}`}>
                {u.disputesCount ? `${u.disputesCount} signalement(s)` : 'Aucun signalement'}
              </span>
            </div>

            <span className="text-slate-500 text-xs">
              Solde portefeuille : <strong className="text-emerald-600">{profile.walletBalance} TND</strong>
            </span>
          </div>
        )}
      </div>

      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
        <button
          onClick={onInspect}
          className="flex-1 py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
        >
          <Eye className="w-3.5 h-3.5 text-emerald-500" />
          <span>Inspecter le profil</span>
        </button>
        <button
          onClick={onMissions}
          className="flex-1 py-2 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-400 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
        >
          <Car className="w-3.5 h-3.5" />
          <span>Interventions ({u.missionsCount ?? 0})</span>
        </button>
      </div>
    </AdminCard>
  );
};
