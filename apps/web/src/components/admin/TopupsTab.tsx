import React from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';
import { api } from '../../services/api';
import { AdminCard, EmptyState, Spinner } from './AdminUi';
import type { AdminTopup } from './adminTypes';
import { useAdminAction, useAdminData } from './useAdminData';

export const TopupsTab: React.FC<{ onChanged: () => void }> = ({ onChanged }) => {
  const { data: topups, loading, reload } = useAdminData<AdminTopup[]>('/admin/topups/pending', []);
  const act = useAdminAction();

  const decide = async (id: string, action: 'approve' | 'reject') => {
    const ok = await act(() => api.post(`/admin/topups/${id}/${action}`), {
      title: action === 'approve' ? 'Virement validé' : 'Virement rejeté',
      message: action === 'approve' ? 'Le portefeuille du prestataire a été crédité.' : 'Demande rejetée.',
      type: action === 'approve' ? 'success' : 'warning',
    });
    if (ok) {
      await reload();
      onChanged();
    }
  };

  if (loading) return <Spinner />;

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-200">
      <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
        Recharges par virement en attente ({topups.length})
      </h3>

      {topups.length === 0 ? (
        <EmptyState>Aucun virement bancaire en attente de validation.</EmptyState>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {topups.map((t) => (
            <AdminCard key={t.id} className="p-5 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-3">
                <span className="px-2.5 py-1 rounded-xl bg-amber-100 text-amber-800 dark:bg-amber-950 text-xs font-bold">
                  RÉF : {t.uniqueRef}
                </span>
                <span className="text-xl font-black text-emerald-600">{t.amount} TND</span>
              </div>
              <span className="text-xs text-slate-500 font-medium block">
                Prestataire : <strong>{t.provider?.user?.fullName || 'Technicien'}</strong> (
                {t.provider?.user?.phoneNumber})
              </span>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                <button
                  onClick={() => decide(t.id, 'approve')}
                  className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Valider et créditer
                </button>
                <button
                  onClick={() => decide(t.id, 'reject')}
                  className="flex-1 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5"
                >
                  <XCircle className="w-4 h-4" />
                  Rejeter
                </button>
              </div>
            </AdminCard>
          ))}
        </div>
      )}
    </div>
  );
};
