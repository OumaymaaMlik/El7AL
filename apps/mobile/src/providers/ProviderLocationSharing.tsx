import { useEffect } from 'react';
import { getSocket } from '../services/socket/socket.client';
import { logger } from '../shared/utils/logger';
import { useAuthStore } from '../features/auth';
import { updateProviderLocation } from '../features/map/api/location.api';
import { watchCoords } from '../features/map/services/location';
import { useMissionStore } from '../features/missions';

/** Mission states in which the client sees the artisan coming and needs a live ETA. */
const STREAMING_STATUSES = ['ACCEPTED', 'EN_ROUTE'];

/**
 * While an artisan is online (or on a mission), shares their real position: with the server's
 * matching index so offers reach artisans nearby, and over the socket so the client gets a live
 * distance and arrival time. Renders nothing.
 */
export function ProviderLocationSharing() {
  const isProvider = useAuthStore((state) => state.user?.role === 'PROVIDER');
  const isAvailable = useAuthStore((state) => state.isProviderAvailable);
  const missionId = useMissionStore((state) => state.activeMission?.id ?? state.searchingMissionId);
  const status = useMissionStore((state) => state.missionStatus);
  const onMission = Boolean(missionId) && status !== null && status !== 'BROADCASTED' && status !== 'COMPLETED';

  const shouldShare = isProvider && (isAvailable || onMission);
  const streamToClient = onMission && STREAMING_STATUSES.includes(status as string);

  useEffect(() => {
    if (!shouldShare) return;
    let stop: (() => void) | undefined;
    let cancelled = false;

    watchCoords(
      (coords) => {
        if (onMission) useMissionStore.getState().updateMissionState({ providerPosition: coords });
        updateProviderLocation(coords).catch((e) => logger.warn('Failed to publish location:', e));
        if (streamToClient && missionId) {
          getSocket().emit('provider:location_update', { lat: coords.lat, lng: coords.lng, missionId });
        }
      },
      { live: streamToClient },
    ).then((unsubscribe) => {
      if (cancelled) unsubscribe();
      else stop = unsubscribe;
    });

    return () => {
      cancelled = true;
      stop?.();
    };
  }, [shouldShare, streamToClient, onMission, missionId]);

  return null;
}
