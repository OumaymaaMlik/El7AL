import React, { useCallback, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { RotateCw, AlertCircle, ArrowLeft } from 'lucide-react';
import { ClientLayout } from '../layouts/ClientLayout';
import { GlassCard } from '../components/ui/GlassCard';
import { Button } from '../components/ui/Button';
import { TrackingBanner } from '../components/tracking/TrackingBanner';
import { RealLeafletMap } from '../components/tracking/RealLeafletMap';
import { ProviderCard } from '../components/tracking/ProviderCard';
import { MissionDetailsCard } from '../components/tracking/MissionDetailsCard';
import { MissionEndedCard } from '../components/tracking/MissionEndedCard';
import { ClientInlineChatCard } from '../components/client/ClientInlineChatCard';
import { ClientReviewModal } from '../components/client/ClientReviewModal';
import { useLocationStream } from '../hooks/useLocationStream';
import { useMission } from '../hooks/useMission';
import { useTranslation } from '../hooks/useTranslation';
import { isActive, type ApiMission } from '../lib/mission';

export const ClientTrackingPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [isReviewOpen, setIsReviewOpen] = useState(false);

  // The artisan has finished: the client confirms, pays and rates in one flow.
  const openReviewWhenFinished = useCallback((m: ApiMission) => {
    if ((m.status === 'DUAL_CONFIRM' || m.status === 'COMPLETED') && !m.review) setIsReviewOpen(true);
  }, []);

  const { mission, loading, error, reload } = useMission(searchParams.get('id'), isActive, openReviewWhenFinished);
  const trip = useLocationStream(Boolean(mission));

  const goHome = () => navigate('/client/home');

  if (mission?.status === 'CANCELLED') {
    return (
      <ClientLayout>
        <MissionEndedCard
          tone="cancelled"
          title="Intervention annulée"
          text={
            <>
              Cette demande de dépannage{' '}
              {mission.category?.name && (
                <strong className="text-slate-700 dark:text-slate-300">({mission.category.name})</strong>
              )}{' '}
              a été annulée.
            </>
          }
          actionLabel="Lancer une nouvelle demande"
          onAction={goHome}
        />
      </ClientLayout>
    );
  }

  if (!mission && !loading && !error) {
    return (
      <ClientLayout>
        <MissionEndedCard
          tone="none"
          title="Aucune intervention en cours"
          text="Vous n'avez pas de demande de dépannage active pour le moment. Émettez une demande en 1 clic depuis l'accueil."
          actionLabel="Lancer un dépannage express"
          onAction={goHome}
        />
      </ClientLayout>
    );
  }

  const providerFirstName = mission?.provider?.user.fullName.split(' ')[0];

  return (
    <ClientLayout>
      <div className="max-w-6xl mx-auto space-y-6">
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
            {t.search}
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
            {mission.status === 'DUAL_CONFIRM' && !isReviewOpen && (
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between gap-4 flex-wrap">
                <div className="text-xs text-emerald-900 dark:text-emerald-200">
                  <strong className="block text-sm">Travaux terminés ?</strong>
                  L&apos;artisan a signalé la fin de l&apos;intervention. Confirmez pour la clôturer et laisser votre
                  avis.
                </div>
                <Button variant="primary" onClick={() => setIsReviewOpen(true)}>
                  Confirmer la fin des travaux
                </Button>
              </div>
            )}

            <TrackingBanner
              status={mission.status}
              categoryName={mission.category?.name}
              providerFirstName={providerFirstName}
              etaMinutes={trip.etaMinutes}
              radiusKm={mission.radiusKm || 25}
              createdAt={mission.createdAt}
            />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              <div className="lg:col-span-7">
                <RealLeafletMap
                  clientLat={mission.pickupLat ?? null}
                  clientLng={mission.pickupLng ?? null}
                  addressText={mission.addressText}
                  providerLat={trip.lat}
                  providerLng={trip.lng}
                  providerName={providerFirstName}
                  etaMinutes={trip.etaMinutes}
                  distanceKm={trip.distanceKm}
                  radiusKm={mission.radiusKm || 25}
                />
              </div>

              <div className="lg:col-span-5 space-y-6">
                {mission.provider && (
                  <ProviderCard
                    provider={mission.provider}
                    categoryName={mission.category?.name}
                    onOpenChat={() => undefined}
                    unreadCount={0}
                  />
                )}
                <ClientInlineChatCard
                  missionId={mission.id}
                  providerFirstName={providerFirstName || 'Technicien'}
                  initialMessages={mission.messages}
                />
                <MissionDetailsCard
                  missionId={mission.id}
                  categoryName={mission.category?.name}
                  addressText={mission.addressText}
                  description={mission.description ?? undefined}
                  status={mission.status}
                  onRefresh={() => void reload()}
                />
              </div>
            </div>

            {isReviewOpen && (
              <ClientReviewModal
                isOpen={isReviewOpen}
                onClose={() => {
                  setIsReviewOpen(false);
                  goHome();
                }}
                missionId={mission.id}
                providerName={mission.provider?.user.fullName}
                isAlreadyCompleted={mission.status === 'COMPLETED'}
                categoryName={mission.category?.name}
                onReviewSubmitted={() => {
                  void reload();
                  goHome();
                }}
              />
            )}
          </div>
        )}
      </div>
    </ClientLayout>
  );
};
