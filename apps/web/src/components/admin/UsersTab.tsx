import React, { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { api } from '../../services/api';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { AdminCard, Spinner } from './AdminUi';
import { UserCard } from './UserCard';
import { UserDetailsModal } from './UserDetailsModal';
import { UserMissionsModal } from './UserMissionsModal';
import type { AdminUser } from './adminTypes';
import { useAdminAction, useAdminData } from './useAdminData';

type RoleFilter = 'ALL' | 'CLIENT' | 'PROVIDER';

export const UsersTab: React.FC = () => {
  const { data: users, loading, reload } = useAdminData<AdminUser[]>('/admin/users', []);
  const act = useAdminAction();
  const [filter, setFilter] = useState<RoleFilter>('ALL');
  const [query, setQuery] = useState('');
  const [details, setDetails] = useState<AdminUser | null>(null);
  const [history, setHistory] = useState<AdminUser | null>(null);
  const [toDelete, setToDelete] = useState<AdminUser | null>(null);

  const visible = useMemo(() => {
    const q = query.toLowerCase();
    return users.filter(
      (u) =>
        (filter === 'ALL' || u.role === filter) &&
        (u.fullName.toLowerCase().includes(q) || u.phoneNumber.includes(query) || !!u.email?.toLowerCase().includes(q)),
    );
  }, [users, filter, query]);

  const count = (role: RoleFilter) => (role === 'ALL' ? users.length : users.filter((u) => u.role === role).length);

  const toggleBlock = async (user: AdminUser) => {
    const status = user.status === 'BLOCKED' ? 'ACTIVE' : 'BLOCKED';
    const ok = await act(() => api.put(`/admin/users/${user.id}/status`, { status }), {
      title: 'Statut mis à jour',
      message: status === 'BLOCKED' ? 'Le compte est bloqué.' : 'Le compte est réactivé.',
    });
    if (ok) {
      setDetails({ ...user, status });
      await reload();
    }
  };

  const remove = async (user: AdminUser) => {
    const ok = await act(() => api.delete(`/admin/users/${user.id}`), {
      title: 'Utilisateur supprimé',
      message: 'Le compte utilisateur a été définitivement supprimé.',
    });
    if (ok) {
      setToDelete(null);
      setDetails(null);
      await reload();
    }
  };

  if (loading) return <Spinner />;

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-200">
      <AdminCard className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4">
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-950 p-1 rounded-2xl w-full sm:w-auto">
          {(
            [
              ['ALL', 'Tous'],
              ['CLIENT', 'Clients'],
              ['PROVIDER', 'Prestataires'],
            ] as [RoleFilter, string][]
          ).map(([role, label]) => (
            <button
              key={role}
              onClick={() => setFilter(role)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
                filter === role
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {label} ({count(role)})
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-500 dark:text-slate-400 absolute start-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Rechercher nom, email ou téléphone"
            placeholder="Rechercher nom, email ou tél..."
            className="w-full bg-light-bg dark:bg-dark-bg border border-slate-200 dark:border-slate-800 rounded-2xl py-2 ps-10 pe-4 text-xs font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500"
          />
        </div>
      </AdminCard>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {visible.map((u) => (
          <UserCard
            key={u.id}
            user={u}
            onInspect={() => setDetails(u)}
            onMissions={() => setHistory(u)}
            onDelete={() => setToDelete(u)}
          />
        ))}
      </div>

      {details && (
        <UserDetailsModal
          user={details}
          onClose={() => setDetails(null)}
          onToggleBlock={() => toggleBlock(details)}
          onMissions={() => setHistory(details)}
          onDelete={() => setToDelete(details)}
        />
      )}
      {history && <UserMissionsModal user={history} onClose={() => setHistory(null)} />}
      <ConfirmDialog
        isOpen={!!toDelete}
        title="Supprimer l'utilisateur ?"
        message={`Supprimer définitivement le compte de ${toDelete?.fullName ?? ''} ? Cette action est irréversible.`}
        confirmLabel="Confirmer la suppression"
        cancelLabel="Annuler"
        tone="danger"
        onConfirm={() => toDelete && remove(toDelete)}
        onClose={() => setToDelete(null)}
      />
    </div>
  );
};
