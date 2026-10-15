import React from 'react';
import { Star } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { InfoTile } from './AdminUi';
import type { AdminMission } from './adminTypes';

/** One intervention seen by the admin: who, where, and the client's review if there is one. */
export const MissionDetailsModal: React.FC<{ mission: AdminMission; onClose: () => void }> = ({ mission, onClose }) => (
  <Modal isOpen onClose={onClose} title="Détails de l'intervention" maxWidth="lg">
    <div className="flex flex-col gap-3 text-xs text-slate-700 dark:text-slate-300">
      <InfoTile label="Catégorie">
        <span className="text-sm">{mission.category?.name || 'Intervention'}</span>
      </InfoTile>

      <div className="grid grid-cols-2 gap-2">
        <InfoTile label="Client">{mission.client?.user?.fullName || 'Client'}</InfoTile>
        <InfoTile label="Prestataire">
          <span className="text-emerald-600">{mission.provider?.user?.fullName || 'Non assigné'}</span>
        </InfoTile>
      </div>

      <InfoTile label="Adresse">{mission.addressText}</InfoTile>

      {mission.review && (
        <div className="bg-amber-50 dark:bg-amber-950/40 p-3 rounded-2xl border border-amber-200 dark:border-amber-900/40 text-amber-900 dark:text-amber-300">
          <span className="font-bold flex items-center gap-1 mb-1">
            <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
            Avis du client ({mission.review.rating}/5)
          </span>
          {mission.review.comment && <p className="italic">&laquo; {mission.review.comment} &raquo;</p>}
        </div>
      )}
    </div>

    <button
      onClick={onClose}
      className="mt-5 w-full py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold rounded-2xl text-xs hover:bg-slate-200 transition-colors"
    >
      Fermer
    </button>
  </Modal>
);
