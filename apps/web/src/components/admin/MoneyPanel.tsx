import React from 'react';
import { AdminCard } from './AdminUi';
import type { AdminStats } from './adminTypes';

const money = (value?: number) => (value ?? 0).toFixed(2);

const Figure: React.FC<{ label: string; value?: number; hint?: string; tone: string }> = ({
  label,
  value,
  hint,
  tone,
}) => (
  <div className="p-4 rounded-2xl bg-light-bg dark:bg-dark-bg border border-slate-100 dark:border-slate-800">
    <span className="block text-xs font-bold text-slate-500 uppercase tracking-wider">{label}</span>
    <span className={`block mt-1 text-2xl font-extrabold ${tone}`}>
      {money(value)} <span className="text-xs font-bold text-slate-500">TND</span>
    </span>
    {hint && <span className="block text-xs text-slate-500 dark:text-slate-400 mt-1">{hint}</span>}
  </div>
);

/** El 7al's money, three ways: charged to artisans, really received, and still owed. */
export const MoneyPanel: React.FC<{ stats: AdminStats }> = ({ stats }) => (
  <AdminCard className="p-6 space-y-5">
    <h3 className="text-base font-bold text-slate-900 dark:text-white">Commissions</h3>
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <Figure
        label="Facturé"
        value={stats.billedTotalTND}
        hint={`dont ${money(stats.activationBilledTND)} TND d'activation`}
        tone="text-slate-900 dark:text-white"
      />
      <Figure
        label="Encaissé"
        value={stats.receivedTotalTND}
        hint="Virements validés"
        tone="text-emerald-600 dark:text-emerald-400"
      />
      <Figure
        label="Impayé"
        value={stats.unpaidTotalTND}
        hint="Pas encore payé, semaine en cours comprise"
        tone="text-amber-600"
      />
    </div>
    <div>
      <span className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Encaissé par période</span>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Figure label="Aujourd'hui" value={stats.receivedTodayTND} tone="text-emerald-600 dark:text-emerald-400" />
        <Figure label="7 derniers jours" value={stats.receivedWeekTND} tone="text-emerald-600 dark:text-emerald-400" />
        <Figure
          label="30 derniers jours"
          value={stats.receivedMonthTND}
          tone="text-emerald-600 dark:text-emerald-400"
        />
      </div>
    </div>
  </AdminCard>
);
