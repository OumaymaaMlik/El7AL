import React, { useState } from 'react';
import { MapPin, MessageSquare, Wrench, ShieldCheck, RotateCw } from 'lucide-react';
import { Button } from '../ui/Button';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { api, apiErrorMessage } from '../../services/api';
import { isSearching } from '../../lib/mission';
import { useNotificationStore } from '../../store/useNotificationStore';

interface MissionDetailsCardProps {
  missionId: string;
  categoryName?: string;
  addressText: string;
  description?: string;
  status: string;
  onRefresh: () => void;
}

export const MissionDetailsCard: React.FC<MissionDetailsCardProps> = ({
  missionId,
  categoryName = 'Intervention',
  addressText,
  description = '',
  status,
  onRefresh,
}) => {
  const [isRelaunching, setIsRelaunching] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const { addNotification } = useNotificationStore();

  const isPending = isSearching(status);

  const handleRelaunch = async () => {
    try {
      setIsRelaunching(true);
      const res = await api.post(`/missions/${missionId}/relaunch`);
      if (res.data.success) {
        addNotification({
          title: 'Recherche Relancée',
          message: 'Diffusion réactivée auprès des artisans à proximité.',
          type: 'info',
        });
        onRefresh();
      }
    } catch (err) {
      addNotification({
        title: 'Erreur Relance',
        message: apiErrorMessage(err, 'Impossible de relancer la recherche.'),
        type: 'danger',
      });
    } finally {
      setIsRelaunching(false);
    }
  };

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const handleCancel = async () => {
    setIsConfirmOpen(false);
    try {
      setIsCancelling(true);
      const res = await api.post(`/missions/${missionId}/cancel`, {
        reason: 'Annulé par le client depuis le suivi',
      });
      if (res.data.success) {
        addNotification({
          title: 'Intervention Annulée',
          message: 'Votre demande a été annulée avec succès.',
          type: 'info',
        });
        onRefresh();
      }
    } catch (err) {
      addNotification({
        title: 'Erreur Annulation',
        message: apiErrorMessage(err, "Impossible d'annuler l'intervention."),
        type: 'danger',
      });
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <div className="w-full bg-white dark:bg-slate-900 rounded-tile border border-slate-200/80 dark:border-slate-800 p-6 space-y-5">
      <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">Détails du dépannage</h3>

      <div className="space-y-4 text-xs">
        {/* Métier */}
        <div className="flex items-start gap-3">
          <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-brand-500 dark:text-brand-accent mt-0.5">
            <Wrench className="w-4 h-4" />
          </div>
          <div>
            <span className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Métier
            </span>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="font-extrabold text-slate-900 dark:text-white">{categoryName}</span>
              <span className="px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-extrabold text-xs">
                Express
              </span>
            </div>
          </div>
        </div>

        {/* Remarques client */}
        <div className="flex items-start gap-3">
          <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-brand-500 dark:text-brand-accent mt-0.5">
            <MessageSquare className="w-4 h-4" />
          </div>
          <div>
            <span className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Remarques du client
            </span>
            <span className="block font-bold text-slate-800 dark:text-slate-200 mt-0.5 italic">
              « {description || 'Aucune remarque supplémentaire'} »
            </span>
          </div>
        </div>

        {/* Adresse */}
        <div className="flex items-start gap-3">
          <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-brand-500 dark:text-brand-accent mt-0.5">
            <MapPin className="w-4 h-4" />
          </div>
          <div>
            <span className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Adresse d'intervention
            </span>
            <span className="block font-bold text-slate-900 dark:text-white mt-0.5">{addressText}</span>
          </div>
        </div>
      </div>

      {/* Footer Info & Actions */}
      <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4">
        <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 font-medium">
          <ShieldCheck className="w-4 h-4 text-brand-500 dark:text-brand-accent flex-shrink-0" />
          <span>
            {isPending
              ? 'Envoyée en simultané. Expire automatiquement après 5 min.'
              : "Position de l'artisan mise à jour en direct."}
          </span>
        </div>

        {/* Relancer la recherche Button (in PENDING) */}
        {isPending && (
          <Button
            type="button"
            variant="primary"
            onClick={handleRelaunch}
            isLoading={isRelaunching}
            leftIcon={<RotateCw className="w-4 h-4" />}
            className="w-full h-11 rounded-2xl bg-brand-500 hover:bg-brand-600 text-white font-extrabold text-xs "
          >
            Relancer la recherche
          </Button>
        )}

        {/* Annuler la demande Red Link */}
        {status !== 'COMPLETED' && status !== 'CANCELLED' && (
          <div className="text-center pt-1">
            <button
              type="button"
              onClick={() => setIsConfirmOpen(true)}
              disabled={isCancelling}
              className="text-xs font-bold text-rose-600 hover:text-rose-700 dark:text-rose-400 underline underline-offset-4 transition-colors"
            >
              {isCancelling ? 'Annulation en cours...' : 'Annuler la demande'}
            </button>
          </div>
        )}
      </div>
      <ConfirmDialog
        isOpen={isConfirmOpen}
        title="Annuler la demande ?"
        message="Voulez-vous vraiment annuler cette demande de dépannage ? Cette action est définitive."
        confirmLabel="Oui, annuler"
        cancelLabel="Non, la garder"
        tone="danger"
        isLoading={isCancelling}
        onConfirm={handleCancel}
        onClose={() => setIsConfirmOpen(false)}
      />
    </div>
  );
};
