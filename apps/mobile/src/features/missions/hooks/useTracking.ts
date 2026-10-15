import { useCallback, useEffect, useRef, useState } from 'react';
import { Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from '../../../shared/store/useLanguageStore';
import { useNotificationStore } from '../../notifications/store/useNotificationStore';
import { getApiErrorMessage } from '../../../shared/utils/apiError';
import { logger } from '../../../shared/utils/logger';
import { getSocket, joinMissionRoom, leaveMissionRoom } from '../../../services/socket/socket.client';
import { ROUTES } from '../../../navigation/routes';
import { useAuthStore } from '../../auth';
import { cancelMission, fetchMission, fetchMissionHistory } from '../api/mission.api';
import type { Mission } from '../schemas/mission.schema';
import { useMissionStore } from '../store/useMissionStore';
import { useMissionFlow } from './useMissionFlow';

/** Everything the tracking screen needs: the mission, its history, live socket updates and actions. */
export function useTracking(paramId?: string) {
  const router = useRouter();
  const { t } = useTranslation();
  const flashToast = useNotificationStore((state) => state.flashToast);
  const user = useAuthStore((state) => state.user);
  const activeRole = useAuthStore((state) => state.activeRole);
  const isProvider = activeRole === 'PROVIDER' || user?.role === 'PROVIDER';

  const searchingMissionId = useMissionStore((state) => state.searchingMissionId);
  const clearActiveMission = useMissionStore((state) => state.clearActiveMission);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [mission, setMission] = useState<Mission | null>(null);
  const [history, setHistory] = useState<Mission[]>([]);
  const [chatOpen, setChatOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const targetId = mission?.id || searchingMissionId;

  const flow = useMissionFlow({
    missionId: targetId,
    onReviewDone: () => {
      setMission(null);
      router.replace(ROUTES.home);
    },
  });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const missions = await fetchMissionHistory();
      if (missions) {
        setHistory(missions);
        setMission(missions.find((m) => m.status !== 'COMPLETED' && m.status !== 'CANCELLED') || null);
      }
      if (paramId) {
        const detailed = await fetchMission(paramId);
        if (detailed) setMission(detailed);
      }
    } catch (e) {
      logger.warn('Failed to fetch mission details & history:', e);
    } finally {
      setLoading(false);
    }
  }, [paramId]);

  const loadRef = useRef(load);
  loadRef.current = load;

  useEffect(() => {
    load();
  }, [load, searchingMissionId]);

  // Live mission events for the mission on screen.
  useEffect(() => {
    if (!targetId) return;
    joinMissionRoom(targetId);
    const socket = getSocket();

    const onCancelled = (data: { reason?: string }) => {
      leaveMissionRoom(targetId);
      setMission(null);
      clearActiveMission();
      flashToast({ title: t('missionCancelledTitle'), message: data.reason || t('missionCancelledMsg') });
      router.replace(ROUTES.home);
    };
    const onStatusUpdate = (data: { status?: string; providerConfirmed?: boolean }) => {
      loadRef.current();
      if (!isProvider && (data.status === 'DUAL_CONFIRM' || data.providerConfirmed)) flow.setDualOpen(true);
    };
    const onCompleted = () => {
      loadRef.current();
      if (!isProvider) {
        flow.setDualOpen(false);
        flow.setPaymentOpen(true);
      }
    };
    const onReviewed = () => {
      leaveMissionRoom(targetId);
      clearActiveMission();
      if (isProvider) router.replace(ROUTES.home);
    };

    socket.on('mission:cancelled', onCancelled);
    socket.on('mission:status_update', onStatusUpdate);
    socket.on('mission:completed', onCompleted);
    socket.on('mission:reviewed', onReviewed);
    return () => {
      leaveMissionRoom(targetId);
      socket.off('mission:cancelled', onCancelled);
      socket.off('mission:status_update', onStatusUpdate);
      socket.off('mission:completed', onCompleted);
      socket.off('mission:reviewed', onReviewed);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mission?.id, searchingMissionId, isProvider]);

  const confirmCancel = async () => {
    if (!targetId) return;
    setCancelling(true);
    try {
      if (await cancelMission(targetId, "Annulation demandée par l'utilisateur")) {
        setCancelOpen(false);
        setMission(null);
        clearActiveMission();
        flashToast({ title: t('missionCancelledTitle'), message: t('missionCancelledMsg') });
        router.replace(ROUTES.home);
      }
    } catch (e) {
      setCancelOpen(false);
      flashToast({ title: t('errorTitle'), message: getApiErrorMessage(e, t('errCancelMission')), tone: 'error' });
    } finally {
      setCancelling(false);
    }
  };

  const refresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const callNumber = (phone?: string | null) => {
    if (phone) Linking.openURL(`tel:${phone}`);
    else flashToast({ title: t('phoneNotAvailable') });
  };

  return {
    isProvider,
    loading,
    refreshing,
    refresh,
    mission,
    history,
    flow,
    chatOpen,
    setChatOpen,
    cancelOpen,
    setCancelOpen,
    cancelling,
    confirmCancel,
    callNumber,
  };
}

export type TrackingState = ReturnType<typeof useTracking>;
