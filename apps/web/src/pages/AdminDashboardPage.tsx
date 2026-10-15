import React, { useEffect, useState } from 'react';
import { AlertTriangle, BarChart3, Car, Receipt, UserCheck, Users, Wrench } from 'lucide-react';
import { AdminLayout } from '../layouts/AdminLayout';
import { ProviderVerificationQueue } from '../components/admin/ProviderVerificationQueue';
import { CategoriesTab } from '../components/admin/CategoriesTab';
import { DisputesTab } from '../components/admin/DisputesTab';
import { MissionsTab } from '../components/admin/MissionsTab';
import { StatsTab } from '../components/admin/StatsTab';
import { TopupsTab } from '../components/admin/TopupsTab';
import { UsersTab } from '../components/admin/UsersTab';
import type { AdminStats } from '../components/admin/adminTypes';
import { useAdminData } from '../components/admin/useAdminData';
import { getSocket } from '../services/socket';
import { onServerEvent } from '../services/serverEvents';
import { useNotificationStore } from '../store/useNotificationStore';

type AdminTab = 'stats' | 'verifications' | 'users' | 'missions' | 'categories' | 'topups' | 'disputes';

const TABS: {
  id: AdminTab;
  label: string;
  Icon: React.FC<{ className?: string }>;
  count?: (s: AdminStats) => number | undefined;
}[] = [
  { id: 'stats', label: 'Tableau de bord', Icon: BarChart3 },
  { id: 'verifications', label: 'Vérifications', Icon: UserCheck, count: (s) => s.pendingVerifications },
  { id: 'users', label: 'Utilisateurs et prestataires', Icon: Users },
  { id: 'missions', label: 'Interventions et durées', Icon: Car },
  { id: 'categories', label: 'Catégories', Icon: Wrench },
  { id: 'topups', label: 'Virements', Icon: Receipt, count: (s) => s.pendingWireTransfers },
  { id: 'disputes', label: 'Litiges', Icon: AlertTriangle, count: (s) => s.totalDisputes },
];

/** The admin portal: one tab bar, and each tab loads and manages its own data (components/admin). */
export const AdminDashboardPage: React.FC = () => {
  const [tab, setTab] = useState<AdminTab>('stats');
  const { data: stats, reload: reloadStats } = useAdminData<AdminStats>('/admin/stats', {});
  const addNotification = useNotificationStore((s) => s.addNotification);

  // A new artisan finished registering: tell the admin at once, wherever they are in the portal.
  useEffect(() => {
    return onServerEvent(getSocket(), 'admin:artisan_pending', (artisan) => {
      addNotification({
        title: 'Nouvel artisan à vérifier',
        message: `${artisan.fullName} attend votre validation.`,
        type: 'warning',
      });
      void reloadStats();
    });
  }, [addNotification, reloadStats]);

  return (
    <AdminLayout>
      <div className="flex flex-col gap-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-slate-200 dark:border-slate-800">
          {TABS.map(({ id, label, Icon, count }) => {
            const n = count?.(stats);
            return (
              <button
                key={id}
                onClick={() => {
                  setTab(id);
                  void reloadStats();
                }}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap ${
                  tab === id
                    ? 'bg-emerald-600 text-white'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{n ? `${label} (${n})` : label}</span>
              </button>
            );
          })}
        </div>

        {tab === 'stats' && <StatsTab stats={stats} />}
        {tab === 'verifications' && <ProviderVerificationQueue onDecided={() => void reloadStats()} />}
        {tab === 'users' && <UsersTab />}
        {tab === 'missions' && <MissionsTab />}
        {tab === 'categories' && <CategoriesTab />}
        {tab === 'topups' && <TopupsTab onChanged={reloadStats} />}
        {tab === 'disputes' && <DisputesTab onChanged={reloadStats} />}
      </div>
    </AdminLayout>
  );
};
