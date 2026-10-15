import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { StatusPill } from './AdminUi';
import { MissionDetailsModal } from './MissionDetailsModal';
import { durationMinutes, type AdminMission, type AdminUser } from './adminTypes';
import { useAdminData } from './useAdminData';

/** The past interventions of one account; each line opens the intervention details. */
export const UserMissionsModal: React.FC<{ user: AdminUser; onClose: () => void }> = ({ user, onClose }) => {
  const { data: missions, loading } = useAdminData<AdminMission[]>(`/admin/users/${user.id}/missions`, []);
  const [selected, setSelected] = useState<AdminMission | null>(null);

  return (
    <Modal isOpen onClose={onClose} title={`Historique : ${user.fullName}`} maxWidth="xl">
      <div className="flex flex-col gap-3">
        {loading ? (
          <div className="py-12 text-center text-xs text-slate-500 dark:text-slate-400">
            Chargement de l&apos;historique...
          </div>
        ) : missions.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-500 dark:text-slate-400">
            Aucune intervention enregistrée pour cet utilisateur.
          </div>
        ) : (
          missions.map((m) => {
            const minutes = durationMinutes(m.startedAt, m.completedAt);
            return (
              <button
                key={m.id}
                onClick={() => setSelected(m)}
                className="p-4 rounded-2xl bg-light-bg dark:bg-dark-bg border border-slate-100 dark:border-slate-800 flex items-center justify-between text-start hover:border-emerald-500 transition-colors"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-xs text-slate-900 dark:text-white">
                      {m.category?.name || 'Intervention'}
                    </span>
                    <StatusPill status={m.status} />
                  </div>
                  <span className="text-xs text-slate-500 block">{m.addressText}</span>
                </div>
                <div className="text-end">
                  {m.status === 'COMPLETED' && (
                    <span className="text-xs font-black text-emerald-600 block">+{m.commissionFee ?? 30} TND</span>
                  )}
                  {minutes && (
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                      Durée : {minutes} min
                    </span>
                  )}
                </div>
              </button>
            );
          })
        )}
      </div>
      {selected && <MissionDetailsModal mission={selected} onClose={() => setSelected(null)} />}
    </Modal>
  );
};
