import React from 'react';
import { api } from '../../services/api';
import { EmptyState, Spinner } from './AdminUi';
import type { AdminTopup } from './adminTypes';
import { useAdminAction, useAdminData } from './useAdminData';
import { TopupCard } from './TopupCard';
import { RibCard } from './RibCard';

export const TopupsTab: React.FC<{ onChanged: () => void }> = ({ onChanged }) => {
  const { data: topups, loading, reload } = useAdminData<AdminTopup[]>('/admin/topups/pending', []);
  const act = useAdminAction();

  const decide = async (id: string, action: 'approve' | 'reject', receivedAmount?: number) => {
    const ok = await act(() => api.post(`/admin/topups/${id}/${action}`, receivedAmount ? { receivedAmount } : {}), {
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
      <RibCard />
      <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
        Recharges par virement en attente ({topups.length})
      </h3>

      {topups.length === 0 ? (
        <EmptyState>Aucun virement bancaire en attente de validation.</EmptyState>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {topups.map((t) => (
            <TopupCard key={t.id} topup={t} onDecide={decide} />
          ))}
        </div>
      )}
    </div>
  );
};
