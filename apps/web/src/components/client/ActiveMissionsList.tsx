import React, { useState } from 'react';
import { Phone, MapPin, ChevronRight, RotateCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { useNotificationStore } from '../../store/useNotificationStore';
import { isActive, isSearching } from '../../lib/mission';
import { STAGE_ORDER, stageIndex, useMissionCopy } from '../../lib/missionCopy';
import { LiveDot } from '../ui/LiveDot';
import { RadarArt } from '../ui/RadarArt';
import { StageProgress } from '../ui/StageProgress';
import { ConfirmDialog } from '../ui/ConfirmDialog';

export interface Mission {
  id: string;
  status: string;
  addressText: string;
  description?: string;
  createdAt: string;
  startedAt?: string | null;
  completedAt?: string | null;
  cancellationReason?: string | null;
  cancelledByRole?: string | null;
  review?: { rating: number; comment?: string | null } | null;
  category: {
    name: string;
    icon?: string;
  };
  client?: {
    user: {
      fullName: string;
      phoneNumber: string;
      avatarUrl?: string;
    };
  };
  provider?: {
    user: {
      fullName: string;
      phoneNumber: string;
      avatarUrl?: string;
    };
  };
}

interface ActiveMissionsListProps {
  missions: Mission[];
  onRefresh: () => void;
}

/** The request in progress, as the green "live" panel: what is happening, how far along, who is coming. */
export const ActiveMissionsList: React.FC<ActiveMissionsListProps> = ({ missions, onRefresh }) => {
  const navigate = useNavigate();
  const copy = useMissionCopy();
  const { addNotification } = useNotificationStore();
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [cancelId, setCancelId] = useState<string | null>(null);

  const activeMissions = missions.filter((m) => isActive(m.status));
  if (activeMissions.length === 0) return null;

  const handleCancel = async (id: string) => {
    setActionLoadingId(id);
    try {
      const res = await api.post(`/missions/${id}/cancel`, { reason: "Annulé par le client depuis l'accueil" });
      if (res.data.success) {
        addNotification({ title: 'Demande annulée', message: "L'intervention a été annulée.", type: 'warning' });
        onRefresh();
      }
    } catch {
      addNotification({ title: 'Erreur', message: "Impossible d'annuler la demande.", type: 'danger' });
    } finally {
      setActionLoadingId(null);
      setCancelId(null);
    }
  };

  const handleRelaunch = async (id: string) => {
    setActionLoadingId(id);
    try {
      const res = await api.post(`/missions/${id}/relaunch`);
      if (res.data.success) {
        addNotification({
          title: 'Relance effectuée',
          message: 'Votre demande a été rediffusée aux artisans à proximité.',
          type: 'info',
        });
        onRefresh();
      }
    } catch {
      addNotification({ title: 'Erreur', message: 'Impossible de relancer la demande.', type: 'danger' });
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      {activeMissions.map((mission) => {
        const idx = stageIndex(mission.status);
        const key = STAGE_ORDER[idx];
        const name = mission.provider?.user.fullName || copy.artisanFallback;
        const nextLabel = copy.stages[idx + 1];
        const searching = isSearching(mission.status);
        return (
          <section
            key={mission.id}
            aria-label={copy.liveTag}
            className="panel p-6 sm:p-10 grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-8 lg:gap-12 items-center"
          >
            <div className="min-w-0">
              <span className="inline-flex items-center gap-3 text-[13px] font-bold uppercase tracking-[0.08em] rtl:tracking-normal text-brand-accent">
                <LiveDot />
                {copy.liveTag} · {mission.category?.name}
              </span>
              <h2 className="mt-3.5 text-[clamp(28px,3.4vw,44px)] font-bold leading-[1.1] tracking-[-0.02em] rtl:tracking-normal rtl:leading-[1.3] text-white">
                {copy.headline[key](name)}
              </h2>
              <p className="mt-3 flex items-start gap-2 text-base text-white/90">
                <MapPin className="w-[18px] h-[18px] mt-0.5 shrink-0" aria-hidden="true" />
                <span>{mission.addressText}</span>
              </p>

              <div className="mt-7">
                <StageProgress current={idx} label={copy.stages[idx]} />
                <p className="mt-2.5 flex justify-between gap-3 text-sm text-white/85">
                  <span>
                    {copy.stepOf(idx + 1)} · <b className="text-white">{copy.stages[idx]}</b>
                  </span>
                  {nextLabel && (
                    <span>
                      {copy.next} : {nextLabel}
                    </span>
                  )}
                </p>
              </div>

              {mission.provider && (
                <div className="mt-7 flex flex-wrap items-center gap-3.5">
                  <span
                    className="w-12 h-12 rounded-full bg-brand-accent text-brand-on-accent grid place-items-center font-display font-bold text-base overflow-hidden shrink-0"
                    aria-hidden="true"
                  >
                    {mission.provider.user.avatarUrl ? (
                      <img src={mission.provider.user.avatarUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      name.charAt(0).toUpperCase()
                    )}
                  </span>
                  <div className="min-w-0">
                    <b className="block text-base">{name}</b>
                    <span className="text-sm text-white/85" dir="ltr">
                      {mission.provider.user.phoneNumber}
                    </span>
                  </div>
                  <a
                    href={`tel:${mission.provider.user.phoneNumber}`}
                    className="ms-auto h-12 px-6 rounded-full bg-brand-accent text-brand-on-accent hover:bg-brand-accent-hover font-bold inline-flex items-center gap-2.5 transition-colors"
                  >
                    <Phone className="w-5 h-5" aria-hidden="true" />
                    {copy.call}
                  </a>
                </div>
              )}

              <div className="mt-7 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => navigate(`/client/tracking?id=${mission.id}`)}
                  className="h-12 px-6 rounded-full bg-brand-accent text-brand-on-accent hover:bg-brand-accent-hover font-bold inline-flex items-center gap-2 transition-colors"
                >
                  {copy.follow}
                  <ChevronRight className="w-5 h-5 rtl:-scale-x-100" aria-hidden="true" />
                </button>
                {searching && (
                  <button
                    type="button"
                    onClick={() => handleRelaunch(mission.id)}
                    disabled={actionLoadingId === mission.id}
                    className="h-12 px-6 rounded-full border-[1.5px] border-white/55 hover:bg-white/10 font-bold inline-flex items-center gap-2 disabled:opacity-60 transition-colors"
                  >
                    <RotateCw className="w-4 h-4" aria-hidden="true" />
                    {copy.relaunch}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setCancelId(mission.id)}
                  disabled={actionLoadingId === mission.id}
                  className="h-12 px-4 rounded-full font-semibold underline underline-offset-[3px] text-white/90 hover:text-white disabled:opacity-60"
                >
                  {copy.cancel}
                </button>
              </div>
            </div>

            <RadarArt className="hidden lg:block max-w-[360px] justify-self-center" />
          </section>
        );
      })}

      <ConfirmDialog
        isOpen={cancelId !== null}
        title={copy.cancel}
        message={copy.cancelMessage}
        confirmLabel={copy.cancel}
        cancelLabel={copy.back}
        tone="danger"
        isLoading={actionLoadingId === cancelId}
        onConfirm={() => cancelId && handleCancel(cancelId)}
        onClose={() => setCancelId(null)}
      />
    </div>
  );
};
