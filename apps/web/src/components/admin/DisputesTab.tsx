import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { api } from '../../services/api';
import { AdminCard, EmptyState, Spinner } from './AdminUi';
import type { AdminDispute } from './adminTypes';
import { useAdminAction, useAdminData } from './useAdminData';

export const DisputesTab: React.FC<{ onChanged: () => void }> = ({ onChanged }) => {
  const { data: disputes, loading, reload } = useAdminData<AdminDispute[]>('/admin/disputes', []);
  const act = useAdminAction();

  const resolve = async (id: string, status: 'RESOLVED' | 'DISMISSED') => {
    const ok = await act(
      () =>
        api.put(`/admin/disputes/${id}`, {
          status,
          resolutionNotes:
            status === 'RESOLVED' ? "Dossier traité par l'administrateur El 7al." : 'Signalement classé sans suite.',
        }),
      {
        title: 'Litige traité',
        message: status === 'RESOLVED' ? 'Le litige est résolu.' : 'Le litige est classé sans suite.',
      },
    );
    if (ok) {
      await reload();
      onChanged();
    }
  };

  if (loading) return <Spinner />;

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-200">
      <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
        Litiges et signalements déclarés ({disputes.length})
      </h3>

      {disputes.length === 0 ? (
        <EmptyState>Aucun litige ou signalement ouvert.</EmptyState>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {disputes.map((d) => (
            <AdminCard key={d.id} className="p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-rose-500 flex items-center gap-1">
                    <AlertTriangle className="w-4 h-4" />
                    LITIGE OUVERT
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    {new Date(d.createdAt).toLocaleDateString('fr-FR')}
                  </span>
                </div>
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 bg-light-bg dark:bg-dark-bg p-3 rounded-2xl border border-slate-100 dark:border-slate-800 my-2">
                  &laquo; {d.reason} &raquo;
                </p>
              </div>

              {d.status === 'OPEN' && (
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                  <button
                    onClick={() => resolve(d.id, 'RESOLVED')}
                    className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold"
                  >
                    Traiter et résoudre
                  </button>
                  <button
                    onClick={() => resolve(d.id, 'DISMISSED')}
                    className="flex-1 py-2 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold"
                  >
                    Classer sans suite
                  </button>
                </div>
              )}
            </AdminCard>
          ))}
        </div>
      )}
    </div>
  );
};
