import React, { useState } from 'react';
import { ChangeEmailModal } from '../../ui/ChangeEmailModal';
import { Check, FileText } from 'lucide-react';
import { AddressField } from '../../ui/AddressField';
import { useNotificationStore } from '../../../store/useNotificationStore';
import { RADIUS_OPTIONS, type TradeOption } from './useProviderProfile';

const CARD =
  'bg-white dark:bg-slate-900 rounded-tile border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 space-y-6';
const LABEL = 'block font-bold text-slate-700 dark:text-slate-300 mb-1.5';
const FIELD =
  'w-full px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-brand-500';
const CHOICE_IDLE =
  'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-400';

interface InfoProps {
  fullName: string;
  onFullName: (v: string) => void;
  phoneNumber: string;
  email: string;
  address: string;
  onAddress: (v: string) => void;
  coords: { lat: number; lng: number } | null;
  onCoords: (lat: number, lng: number) => void;
  hasDocument: boolean;
  onEmailChanged: (email: string) => void;
}

/** Name, contact (read only), working address and whether an identity document is on file. */
export const ProfileInfoCard: React.FC<InfoProps> = (p) => {
  const addNotification = useNotificationStore((s) => s.addNotification);
  const [changingEmail, setChangingEmail] = useState(false);
  return (
    <div className={CARD}>
      <ChangeEmailModal
        isOpen={changingEmail}
        onClose={() => setChangingEmail(false)}
        currentEmail={p.email}
        onChanged={p.onEmailChanged}
      />
      <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Informations</h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
        <div className="sm:col-span-2">
          <label className={LABEL}>Nom et prénom *</label>
          <input
            type="text"
            value={p.fullName}
            onChange={(e) => p.onFullName(e.target.value)}
            required
            className={FIELD}
          />
        </div>
        <div>
          <label className={LABEL}>Téléphone</label>
          <input type="text" value={p.phoneNumber} readOnly className={`${FIELD} opacity-70`} />
        </div>
        <div>
          <label className={LABEL}>Adresse e-mail</label>
          <div className="flex gap-2">
            <input type="email" value={p.email} readOnly className={`${FIELD} opacity-70`} />
            <button
              type="button"
              onClick={() => setChangingEmail(true)}
              className="px-4 rounded-2xl border border-slate-200 dark:border-slate-700 font-bold text-brand-500 dark:text-brand-accent hover:border-brand-500 transition-colors"
            >
              Modifier
            </button>
          </div>
        </div>
        <p className="sm:col-span-2 text-slate-500 dark:text-slate-400">
          L&apos;e-mail se change avec un code envoyé à la nouvelle adresse. Pour changer de numéro de téléphone,
          contactez le support El 7al.
        </p>
      </div>

      <AddressField
        label="Adresse d'intervention"
        value={p.address}
        onChange={p.onAddress}
        lat={p.coords?.lat}
        lng={p.coords?.lng}
        onCoordinates={p.onCoords}
        onError={(message) => addNotification({ title: 'Position', message, type: 'warning' })}
      />

      <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2 text-xs">
        <span className={LABEL}>Pièce d&apos;identité</span>
        <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center gap-2.5 text-slate-700 dark:text-slate-300 font-semibold">
          <FileText className="w-4 h-4 text-brand-500 dark:text-brand-accent" />
          {p.hasDocument ? "Pièce fournie à l'inscription" : 'Aucun document enregistré'}
        </div>
      </div>
    </div>
  );
};

interface TradesProps {
  trades: TradeOption[];
  selected: string[];
  onToggle: (id: string) => void;
  radiusKm: number;
  onRadius: (km: number) => void;
  bio: string;
  onBio: (v: string) => void;
}

/** The trades the artisan works in, how far they travel, and the written presentation. */
export const ProfileTradesCard: React.FC<TradesProps> = (p) => (
  <div className={CARD}>
    <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Métiers, zone et présentation</h3>

    <div className="space-y-3">
      <span className="block text-xs font-bold text-slate-700 dark:text-slate-300">Mes spécialités</span>
      <div className="flex flex-wrap gap-2">
        {p.trades.map((trade) => {
          const picked = p.selected.includes(trade.id);
          return (
            <button
              key={trade.id}
              type="button"
              aria-pressed={picked}
              onClick={() => p.onToggle(trade.id)}
              className={`px-4 py-2 rounded-full text-xs font-extrabold transition-all border ${picked ? 'bg-brand-500 text-white border-brand-500' : CHOICE_IDLE}`}
            >
              {picked && <Check className="w-3.5 h-3.5 inline me-1 stroke-[3]" />}
              {trade.name}
            </button>
          );
        })}
      </div>
    </div>

    <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
      <span className="block text-xs font-bold text-slate-700 dark:text-slate-300">Rayon d&apos;intervention</span>
      <div className="grid grid-cols-5 gap-2">
        {RADIUS_OPTIONS.map((km) => (
          <button
            key={km}
            type="button"
            aria-pressed={p.radiusKm === km}
            onClick={() => p.onRadius(km)}
            className={`py-3 rounded-2xl font-extrabold text-xs transition-all border text-center ${p.radiusKm === km ? 'bg-brand-500 text-white border-brand-500' : CHOICE_IDLE}`}
          >
            {km} km
          </button>
        ))}
      </div>
    </div>

    <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-xs">
      <label className={LABEL}>Présentation écrite</label>
      <textarea rows={3} value={p.bio} onChange={(e) => p.onBio(e.target.value)} className={`${FIELD} p-4`} />
    </div>
  </div>
);
