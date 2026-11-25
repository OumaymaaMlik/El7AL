import React from 'react';
import { AdminCard } from './AdminUi';
import type { AdminStats } from './adminTypes';
import { MoneyPanel } from './MoneyPanel';

const LABEL = 'text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1';
const HINT = 'text-xs text-slate-500 dark:text-slate-400 mt-2 block';

export const StatsTab: React.FC<{ stats: AdminStats }> = ({ stats }) => (
  <div className="flex flex-col gap-6 animate-in fade-in duration-200">
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <AdminCard className="p-5">
        <span className={LABEL}>Interventions terminées</span>
        <span className="text-3xl font-black text-slate-900 dark:text-white">{stats.totalCompletedMissions ?? 0}</span>
        <span className={HINT}>Total missions accomplies</span>
      </AdminCard>

      <AdminCard className="p-5">
        <span className={LABEL}>Artisans actifs</span>
        <span className="text-3xl font-black text-slate-900 dark:text-white">{stats.activeProviders ?? 0}</span>
        <span className={HINT}>Prestataires validés</span>
      </AdminCard>

      <AdminCard className="p-5">
        <span className={LABEL}>Virements en attente</span>
        <span className="text-3xl font-black text-amber-500">{stats.pendingWireTransfers ?? 0}</span>
        <span className={HINT}>Preuves de paiement à valider</span>
      </AdminCard>
    </div>

    <MoneyPanel stats={stats} />

    <AdminCard className="p-6">
      <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">Vue d&apos;ensemble des utilisateurs</h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
        {[
          { value: stats.totalClients, label: 'Clients inscrits', tone: 'text-slate-900 dark:text-white' },
          {
            value: stats.totalProviders,
            label: 'Prestataires enregistrés',
            tone: 'text-emerald-600 dark:text-emerald-400',
          },
          { value: stats.totalDisputes, label: 'Litiges ouverts', tone: 'text-rose-600 dark:text-rose-400' },
        ].map((item) => (
          <div
            key={item.label}
            className="p-4 rounded-2xl bg-light-bg dark:bg-dark-bg border border-slate-100 dark:border-slate-800"
          >
            <span className={`text-2xl font-extrabold ${item.tone}`}>{item.value ?? 0}</span>
            <span className="block text-xs font-medium text-slate-500 mt-1">{item.label}</span>
          </div>
        ))}
      </div>
    </AdminCard>
  </div>
);
