import { translate } from '../../../shared/store/useLanguageStore';
import { getSocket, joinMissionRoom, leaveMissionRoom } from '../../../services/socket/socket.client';
import { onServerEvent } from '../../../services/socket/typedEvents';
import type { ServerEvents } from '@el7al/shared';
import { ROUTES } from '../../../navigation/routes';
import type { SocketContext } from '../../../types/socket';
import { useNotificationStore } from '../../notifications';
import { useAuthStore } from '../../auth';
import { useMissionStore } from '../store/useMissionStore';

/** Subscribes to mission lifecycle events app-wide and mirrors them into the mission store. Returns the cleanup. */
export function registerMissionSocketHandlers({ user, isProvider, router }: SocketContext): () => void {
  const socket = getSocket();
  const mission = () => useMissionStore.getState();
  const notify = useNotificationStore.getState().addNotification;

  const onOfferDispatched = () => {
    if (!isProvider) mission().updateSearchStatus(translate('searchOfferSent'));
  };

  const onOfferRejected = () => {
    if (isProvider) return;
    mission().updateSearchStatus(translate('searchOfferRefused'));
    setTimeout(() => mission().updateSearchStatus(translate('searchNextProvider')), 1500);
  };

  const onAccepted = (data: ServerEvents['mission:accepted']) => {
    mission().stopSearching();
    joinMissionRoom(data.missionId);
    mission().setActivePairingProvider(data.provider);
    mission().updateMissionState({
      missionStatus: 'ACCEPTED',
      isSearching: false,
      activePairingProvider: data.provider,
      activeMission: {
        id: data.missionId,
        status: 'ACCEPTED',
        provider: {
          id: data.provider.id,
          user: {
            fullName: data.provider.fullName,
            phoneNumber: data.provider.phoneNumber,
            avatarUrl: data.provider.avatarUrl,
          },
        },
      },
    });

    if (!isProvider || data.clientUserId === user.id) {
      mission().updateSearchStatus(translate('searchAccepted'));
      setTimeout(() => {
        mission().stopSearching();
        router.push('/(tabs)/tracking');
      }, 800);
    }
  };

  const onStatusUpdate = (data: ServerEvents['mission:status_update']) => {
    const update: Partial<ReturnType<typeof useMissionStore.getState>> = {
      missionStatus: data.status as ReturnType<typeof useMissionStore.getState>['missionStatus'],
      isSearching: false,
    };
    if (data.etaMinutes !== undefined) update.etaMinutes = data.etaMinutes;
    if (data.distanceKm !== undefined) update.distanceKm = data.distanceKm;
    if (data.startedAt) update.startedAt = new Date(data.startedAt).toISOString();
    if (data.providerConfirmed !== undefined) update.providerConfirmed = data.providerConfirmed;
    if (data.clientConfirmed !== undefined) update.clientConfirmed = data.clientConfirmed;
    mission().updateMissionState(update);
  };

  const onCancelled = (data: ServerEvents['mission:cancelled']) => {
    if (data.missionId) leaveMissionRoom(data.missionId);
    mission().clearActiveMission();
    router.replace(ROUTES.home);

    if (data.wasAccepted) {
      notify({
        type: 'CANCEL',
        title: translate('missionCancelledTitle'),
        message: data.reason || translate('notifMissionCancelledBody'),
        metadata: { missionId: data.missionId },
      });
    }
  };

  const onCompleted = (data: ServerEvents['mission:completed']) => {
    if (data.missionId) leaveMissionRoom(data.missionId);
    mission().updateMissionState({ missionStatus: 'COMPLETED', clientConfirmed: true, isSearching: false });
  };

  const onReviewed = (data: ServerEvents['mission:reviewed']) => {
    if (!isProvider) return;
    notify({
      type: 'COMPLETED',
      title: translate('paymentAndReviewTitle'),
      message:
        translate('notifPaidReviewed')
          .replace('{name}', data.clientName || translate('client'))
          .replace('{amount}', String(data.amount || '0'))
          .replace('{rating}', String(data.rating ?? '')) + (data.comment ? `\n"${data.comment}"` : ''),
      metadata: { missionId: data.missionId, reviewData: data },
    });
    mission().clearActiveMission();
  };

  // Live position of the artisan on the way: real distance and arrival time.
  const onLocationStream = (data: ServerEvents['location:stream'] & { missionId?: string }) => {
    const current = mission().activeMission?.id ?? mission().searchingMissionId;
    if (data.missionId && current && data.missionId !== current) return;
    mission().updateMissionState({
      ...(Number.isFinite(data.lat) && Number.isFinite(data.lng)
        ? { providerPosition: { lat: data.lat as number, lng: data.lng as number } }
        : {}),
      ...(typeof data.etaMinutes === 'number' ? { etaMinutes: data.etaMinutes } : {}),
      ...(typeof data.distanceKm === 'number' ? { distanceKm: Math.round(data.distanceKm * 10) / 10 } : {}),
    });
  };

  // An admin decided about this artisan's identity check.
  const onVerification = (data: ServerEvents['account:verification']) => {
    void useAuthStore.getState().setAccountStatus(data.status);
    const approved = data.status === 'ACTIVE';
    notify({
      type: 'SYSTEM',
      title: translate(approved ? 'accountApprovedTitle' : 'approvalRejectedTitle'),
      message: translate(approved ? 'accountApprovedBody' : 'approvalRejectedBody'),
    });
  };

  const stops = [
    onServerEvent(socket, 'account:verification', onVerification),
    onServerEvent(socket, 'location:stream', onLocationStream),
    onServerEvent(socket, 'mission:offer_dispatched', onOfferDispatched),
    onServerEvent(socket, 'mission:offer_rejected', onOfferRejected),
    onServerEvent(socket, 'mission:accepted', onAccepted),
    onServerEvent(socket, 'mission:status_update', onStatusUpdate),
    onServerEvent(socket, 'mission:cancelled', onCancelled),
    onServerEvent(socket, 'mission:completed', onCompleted),
    onServerEvent(socket, 'mission:reviewed', onReviewed),
  ];
  return () => stops.forEach((stop) => stop());
}
