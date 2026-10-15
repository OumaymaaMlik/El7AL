import React, { useState } from 'react';
import { Clock } from 'lucide-react';
import { AdminCard, Spinner, StatusPill } from './AdminUi';
import { MissionDetailsModal } from './MissionDetailsModal';
import { durationMinutes, type AdminMission } from './adminTypes';
import { useAdminData } from './useAdminData';

export const MissionsTab: React.FC = () => {
  const { data: missions, loading } = useAdminData<AdminMission[]>('/admin/missions', []);
  const [selected, setSelected] = useState<AdminMission | null>(null);

  if (loading) return <Spinner />;

  return (
    <AdminCard className="p-6 animate-in fade-in duration-200">
      <h3 className="text-lg font-extrabold text-slate-900 dark:text-white mb-4">
        Toutes les interventions du système
      </h3>

      <div className="overflow-x-auto">
        <table className="w-full text-start text-xs text-slate-600 dark:text-slate-400">
          <thead className="bg-light-bg dark:bg-dark-bg text-slate-800 dark:text-slate-200 uppercase font-bold text-xs">
            <tr>
              {['Catégorie', 'Client', 'Prestataire', 'Statut', 'Revenu', "Durée d'exécution"].map((h) => (
                <th key={h} className="p-3">
                  {h}
                </th>
              ))}
              <th className="p-3 text-end">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
            {missions.map((m) => {
              const minutes = durationMinutes(m.startedAt, m.completedAt);
              return (
                <tr key={m.id} className="hover:bg-slate-50 dark:hover:bg-slate-950/50">
                  <td className="p-3 font-bold text-slate-900 dark:text-white">{m.category?.name || 'Service'}</td>
                  <td className="p-3">{m.client?.user?.fullName || 'Client'}</td>
                  <td className="p-3">
                    {m.provider?.user?.fullName ? (
                      <span className="text-emerald-600 font-semibold">{m.provider.user.fullName}</span>
                    ) : (
                      <span className="text-slate-500 dark:text-slate-400 italic">Non assigné</span>
                    )}
                  </td>
                  <td className="p-3">
                    <StatusPill status={m.status} />
                  </td>
                  <td className="p-3 font-bold text-slate-900 dark:text-white">
                    {m.status === 'COMPLETED' ? `+${m.commissionFee ?? 30} TND` : '—'}
                  </td>
                  <td className="p-3">
                    {minutes ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-xs">
                        <Clock className="w-3 h-3 text-emerald-500" />
                        {minutes} min
                      </span>
                    ) : (
                      <span className="text-slate-500 dark:text-slate-400 text-xs">—</span>
                    )}
                  </td>
                  <td className="p-3 text-end">
                    <button
                      onClick={() => setSelected(m)}
                      className="px-3 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-slate-700 dark:text-slate-300 hover:text-emerald-600 rounded-xl font-bold transition-colors"
                    >
                      Détails
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {selected && <MissionDetailsModal mission={selected} onClose={() => setSelected(null)} />}
    </AdminCard>
  );
};
