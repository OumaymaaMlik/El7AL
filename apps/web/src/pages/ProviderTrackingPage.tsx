import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, RotateCw, AlertCircle } from 'lucide-react';
import { ProviderLayout } from '../layouts/ProviderLayout';
import { GlassCard } from '../components/ui/GlassCard';
import { Button } from '../components/ui/Button';
import { ProviderTrackingBanner } from '../components/provider/ProviderTrackingBanner';
import { RealLeafletMap } from '../components/tracking/RealLeafletMap';
import { ProviderClientInfoCard } from '../components/provider/ProviderClientInfoCard';
import { ProviderInlineChatCard } from '../components/provider/ProviderInlineChatCard';
import { ProviderActionBottomBar, SubStep } from '../components/provider/ProviderActionBottomBar';
import { useAuthStore } from '../store/useAuthStore';
import { useNotificationStore } from '../store/useNotificationStore';
import { useTranslation } from '../hooks/useTranslation';
import { api, apiErrorMessage } from '../services/api';
import { getSocket } from '../services/socket';
import { MissionEndedCard } from '../components/tracking/MissionEndedCard';
import { useLocationStream } from '../hooks/useLocationStream';
import { useMission } from '../hooks/useMission';
import { getPosition, Position, useWatchPosition } from '../hooks/useGeolocation';
import { distanceKm as haversineKm, isOngoing } from '../lib/mission';

/** Which button the artisan sees for a given stored mission status. */
function subStepOf(status?: string): SubStep {
  switch (status) {
    case 'EN_ROUTE':
      return 'EN_ROUTE';
    case 'ARRIVED':
      return 'ON_SITE';
    case 'IN_PROGRESS':
      return 'IN_PROGRESS';
    case 'DUAL_CONFIRM':
      return 'WAITING_CLIENT';
    case 'COMPLETED':
      return 'COMPLETED';
    default:
      return 'START_TRAJET';
  }
}

/** The server step each button triggers. */
const STEP_ENDPOINT: Partial<Record<SubStep, string>> = {
  START_TRAJET: 'start-route',
  EN_ROUTE: 'arrived',
  NEARBY: 'arrived',
  ON_SITE: 'start-work',
  IN_PROGRESS: 'dual-confirm',
};

export const ProviderTrackingPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { addNotification } = useNotificationStore();
  const { t } = useTranslation();

  const { mission, loading, error, reload } = useMission(searchParams.get('id'), isOngoing);
  const [isActionLoading, setIsActionLoading] = useState(false);

  // The artisan's real position, and the server's live distance / ETA for the trip
  const [position, setPosition] = useState<Position | null>(null);
  const stream = useLocationStream(Boolean(mission));
  const subStep = subStepOf(mission?.status);

  useEffect(() => {
    void getPosition().then((p) => p && setPosition((current) => current ?? p));
  }, []);

  // Real GPS while the mission is under way; streamed to the client while heading there
  const heading = mission?.status === 'ACCEPTED' || mission?.status === 'EN_ROUTE';
  useWatchPosition(
    Boolean(mission) && isOngoing(mission?.status),
    (p) => {
      setPosition(p);
      if (heading && mission?.id) {
        getSocket().emit('provider:location_update', { lat: p.lat, lng: p.lng, missionId: mission.id });
      }
    },
    4000,
  );

  const pickupLat = typeof mission?.pickupLat === 'number' ? mission.pickupLat : null;
  const pickupLng = typeof mission?.pickupLng === 'number' ? mission.pickupLng : null;
  const localDistance =
    position && pickupLat !== null && pickupLng !== null
      ? haversineKm(position.lat, position.lng, pickupLat, pickupLng)
      : null;
  const distanceKm = stream.distanceKm ?? (localDistance !== null ? Number(localDistance.toFixed(1)) : null);
  const etaMinutes = stream.etaMinutes ?? (localDistance !== null ? Math.ceil((localDistance / 30) * 60) : null);

  // One button, one server step
  const handleAdvanceSubStep = async () => {
    const endpoint = STEP_ENDPOINT[subStep];
    if (!mission?.id || !endpoint) return;
    try {
      setIsActionLoading(true);
      await api.post(`/missions/${mission.id}/${endpoint}`);
      await reload();
      if (endpoint === 'dual-confirm') {
        addNotification({
          title: 'Fin des travaux signalée',
          message: "Le client doit maintenant confirmer la fin de l'intervention.",
          type: 'success',
        });
      }
    } catch (err) {
      addNotification({
        title: 'Erreur',
        message: apiErrorMessage(err, "Cette étape n'a pas pu être enregistrée."),
        type: 'danger',
      });
    } finally {
      setIsActionLoading(false);
    }
  };

  const goHome = () => navigate('/provider/home');

  if (!loading && (mission?.status === 'CANCELLED' || mission?.status === 'COMPLETED' || (!mission && !error))) {
    const ended =
      mission?.status === 'CANCELLED'
        ? { tone: 'cancelled' as const, title: t.missionCancelled, text: t.missionCancelledSub, action: t.home }
        : mission?.status === 'COMPLETED'
          ? {
              tone: 'completed' as const,
              title: 'Intervention terminée',
              text: 'Cette intervention a été clôturée avec succès.',
              action: t.home,
            }
          : {
              tone: 'none' as const,
              title: t.noActiveMissions,
              text: "Vous n'avez aucune intervention active en ce moment. Allez sur votre tableau de bord pour accepter des demandes en direct.",
              action: t.providerDashboard,
            };
    return (
      <ProviderLayout>
        <MissionEndedCard
          tone={ended.tone}
          title={ended.title}
          text={ended.text}
          actionLabel={ended.action}
          onAction={goHome}
        />
      </ProviderLayout>
    );
  }

  return (
    <ProviderLayout>
      <div className="max-w-6xl mx-auto space-y-6 pb-12">
        <div className="flex items-center justify-between">
          <button
            onClick={goHome}
            className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-brand-500 dark:hover:text-brand-bright transition-colors"
          >
            <ArrowLeft className="rtl:-scale-x-100 w-4 h-4" />
            {t.back}
          </button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => void reload()}
            leftIcon={<RotateCw className="w-3.5 h-3.5" />}
          >
            Actualiser
          </Button>
        </div>

        {loading ? (
          <div className="h-64 rounded-tile bg-slate-200 dark:bg-slate-800 animate-pulse" />
        ) : error || !mission ? (
          <GlassCard className="p-8 text-center space-y-3">
            <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
            <p className="text-sm font-semibold text-rose-700 dark:text-rose-300">{error}</p>
          </GlassCard>
        ) : (
          <div className="space-y-6">
            <ProviderTrackingBanner
              status={mission.status}
              categoryName={mission.category?.name}
              distanceKm={distanceKm}
              etaMinutes={etaMinutes}
            />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              <div className="lg:col-span-7">
                <RealLeafletMap
                  clientLat={pickupLat}
                  clientLng={pickupLng}
                  addressText={mission.addressText}
                  providerLat={position?.lat ?? null}
                  providerLng={position?.lng ?? null}
                  providerName={user?.fullName?.split(' ')[0] || 'Vous'}
                  etaMinutes={etaMinutes}
                  distanceKm={distanceKm}
                />
              </div>

              <div className="lg:col-span-5 space-y-6">
                <ProviderClientInfoCard
                  clientName={mission.client?.user?.fullName || 'Client El 7al'}
                  phoneNumber={mission.client?.user?.phoneNumber || ''}
                  categoryName={mission.category?.name}
                  addressText={mission.addressText}
                  description={mission.description ?? undefined}
                />
                <ProviderInlineChatCard
                  missionId={mission.id}
                  clientFirstName={mission.client?.user?.fullName?.split(' ')[0] || 'Client'}
                  initialMessages={mission.messages}
                />
              </div>
            </div>

            <ProviderActionBottomBar
              missionId={mission.id}
              status={mission.status}
              subStep={subStep}
              onAdvanceSubStep={handleAdvanceSubStep}
              isLoading={isActionLoading}
            />
          </div>
        )}
      </div>
    </ProviderLayout>
  );
};
