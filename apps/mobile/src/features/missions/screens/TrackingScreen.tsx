import React from 'react';
import { noSelect } from '../../../shared/theme/webStyles';
import { StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowRight, CheckCircle2, MapPin, Navigation, Play, Square } from 'lucide-react-native';
import { ChatDrawer } from '../../chat/components/ChatDrawer';
import { LiveTrackingMap } from '../../map/components/LiveTrackingMap';
import { Button } from '../../../shared/ui/Button';
import { EmptyState } from '../../../shared/ui/EmptyState';
import { InstagramPullToRefresh } from '../../../shared/ui/InstagramPullToRefresh';
import { Mirrored } from '../../../shared/ui/Mirrored';
import { ScreenHeader } from '../../../shared/ui/ScreenHeader';
import { Skeleton } from '../../../shared/ui/Skeleton';
import { Surface } from '../../../shared/ui/Surface';
import { gutter, radius, space, tabBarHeight } from '../../../shared/theme/tokens';
import { toNumber } from '../../../shared/utils/format';
import { useThemeStore } from '../../../shared/store/useThemeStore';
import { useTranslation } from '../../../shared/store/useLanguageStore';
import { ROUTES } from '../../../navigation/routes';
import { CancelMissionDialog } from '../components/CancelMissionDialog';
import { DirectPaymentModal } from '../components/DirectPaymentModal';
import { DualCompletionModal } from '../components/DualCompletionModal';
import { LiveGpsNavigationModal } from '../components/LiveGpsNavigationModal';
import { MissionHistoryList } from '../components/MissionHistoryList';
import { PartyCard } from '../components/PartyCard';
import { RatingModal } from '../components/RatingModal';
import { TrackingActions, type PrimaryAction } from '../components/TrackingActions';
import { TrackingHero } from '../components/TrackingHero';
import { useTracking } from '../hooks/useTracking';
import { useMissionStore } from '../store/useMissionStore';
import { trackingHeadline, trackingStatusLabel } from '../utils/trackingLabels';

export function TrackingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ id?: string }>();
  const colors = useThemeStore((state) => state.colors);
  const { t } = useTranslation();

  const tracking = useTracking(params.id);
  const { mission, flow, isProvider } = tracking;

  const activeMission = useMissionStore((state) => state.activeMission);
  const pairedProvider = useMissionStore((state) => state.activePairingProvider);
  const missionStatus = useMissionStore((state) => state.missionStatus);
  const etaMinutes = useMissionStore((state) => state.etaMinutes);
  const distanceKm = useMissionStore((state) => state.distanceKm);

  // Live status from the socket, or the status the server last returned.
  const status: string | null = missionStatus || mission?.status || null;

  const partnerName: string = isProvider
    ? mission?.client?.user?.fullName || t('client')
    : mission?.provider?.user?.fullName || pairedProvider?.fullName || t('artisanLabel');
  const partnerPhone: string | undefined = isProvider
    ? (mission?.client?.user?.phoneNumber ?? undefined)
    : (mission?.provider?.user?.phoneNumber ?? undefined);
  const partnerAvatar: string | null | undefined = isProvider
    ? mission?.client?.user?.avatarUrl
    : mission?.provider?.user?.avatarUrl || pairedProvider?.avatarUrl;
  const partnerRating = isProvider ? null : toNumber(mission?.provider?.ratingAverage);

  const primaryAction: PrimaryAction | null = isProvider
    ? status === 'ACCEPTED' || !status
      ? { title: t('startRoute'), onPress: () => flow.setGpsOpen(true), Icon: Navigation, busy: false }
      : status === 'EN_ROUTE'
        ? { title: t('arrived'), onPress: flow.arrived, Icon: MapPin, busy: flow.actionLoading }
        : status === 'ARRIVED'
          ? { title: t('startWork'), onPress: flow.beginWork, Icon: Play, busy: flow.actionLoading }
          : status === 'IN_PROGRESS'
            ? { title: t('finishWork'), onPress: flow.providerFinish, Icon: Square, busy: flow.actionLoading }
            : null
    : status === 'DUAL_CONFIRM'
      ? { title: t('confirmWorkFinish'), onPress: () => flow.setDualOpen(true), Icon: CheckCircle2, busy: false }
      : null;

  const providerPosition = useMissionStore((state) => state.providerPosition);
  const pickupLat = toNumber(mission?.pickupLat ?? activeMission?.pickupLat);
  const pickupLng = toNumber(mission?.pickupLng ?? activeMission?.pickupLng);
  const pickup = pickupLat !== null && pickupLng !== null ? { lat: pickupLat, lng: pickupLng } : null;

  const bottomInset = Math.max(insets.bottom, 10);

  const history = isProvider ? <MissionHistoryList missions={tracking.history} onCall={tracking.callNumber} /> : null;

  const renderEmpty = () => (
    <>
      <Surface>
        <EmptyState
          icon={<Navigation size={24} color={colors.accentText} />}
          title={t('noActiveIntervention')}
          message={isProvider ? t('noActiveInterventionProvider') : t('noActiveInterventionClient')}
          action={
            !isProvider ? (
              <Button
                title={t('searchTechnician')}
                onPress={() => router.push(ROUTES.home)}
                icon={
                  <Mirrored>
                    <ArrowRight size={18} color={colors.onAction} />
                  </Mirrored>
                }
              />
            ) : undefined
          }
        />
      </Surface>
      {history}
    </>
  );

  const renderMission = () =>
    mission && (
      <>
        <TrackingHero
          status={status}
          statusLabel={trackingStatusLabel(status, isProvider, t)}
          headline={trackingHeadline(status, isProvider, mission, t)}
          address={mission.addressText}
        />

        {/* Live map: pickup point, the artisan's position and the road between them. */}
        <LiveTrackingMap
          pickup={pickup}
          provider={providerPosition}
          onOpenNavigation={isProvider ? () => flow.setGpsOpen(true) : undefined}
        />

        <PartyCard
          name={partnerName}
          avatarUrl={partnerAvatar}
          isProvider={isProvider}
          rating={partnerRating}
          description={mission.description}
        />

        <TrackingActions
          primary={primaryAction}
          onChat={() => tracking.setChatOpen(true)}
          onCall={() => tracking.callNumber(partnerPhone)}
          onCancel={() => tracking.setCancelOpen(true)}
        />

        {history}
      </>
    );

  return (
    <InstagramPullToRefresh
      refreshing={tracking.refreshing}
      onRefresh={tracking.refresh}
      headerComponent={<ScreenHeader title={t('trackingTitle')} subtitle={t('trackingSub')} />}
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={[styles.content, { paddingBottom: tabBarHeight + bottomInset + space.xxl }]}
      showsVerticalScrollIndicator={false}
    >
      {tracking.loading ? (
        <>
          <Skeleton style={{ height: 230, borderRadius: radius.lg }} />
          <Skeleton style={{ height: 170, borderRadius: radius.md }} />
          <Skeleton style={{ height: 96, borderRadius: radius.md }} />
        </>
      ) : !mission ? (
        renderEmpty()
      ) : (
        renderMission()
      )}

      <CancelMissionDialog
        visible={tracking.cancelOpen}
        cancelling={tracking.cancelling}
        onClose={() => tracking.setCancelOpen(false)}
        onConfirm={tracking.confirmCancel}
      />

      {mission?.id && (
        <ChatDrawer visible={tracking.chatOpen} onClose={() => tracking.setChatOpen(false)} missionId={mission.id} />
      )}

      <LiveGpsNavigationModal
        visible={flow.gpsOpen}
        onClose={() => flow.setGpsOpen(false)}
        onStartDrive={flow.startDrive}
        destinationAddress={mission?.addressText || activeMission?.addressText || undefined}
        destinationLat={mission?.pickupLat ?? activeMission?.pickupLat}
        destinationLng={mission?.pickupLng ?? activeMission?.pickupLng}
        distanceKm={distanceKm}
        etaMinutes={etaMinutes}
        loading={flow.actionLoading}
      />
      <DualCompletionModal
        visible={flow.dualOpen}
        onConfirm={flow.clientConfirm}
        onClose={() => flow.setDualOpen(false)}
        loading={flow.actionLoading}
      />
      <DirectPaymentModal
        visible={flow.paymentOpen}
        onProceed={flow.submitPayment}
        onClose={() => flow.setPaymentOpen(false)}
        loading={flow.actionLoading}
      />
      <RatingModal
        visible={flow.ratingOpen}
        onSubmit={flow.submitRating}
        onClose={() => flow.setRatingOpen(false)}
        loading={flow.actionLoading}
      />
    </InstagramPullToRefresh>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, ...noSelect },
  content: { paddingHorizontal: gutter, paddingTop: space.xs, gap: space.lg },
});
