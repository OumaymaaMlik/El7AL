import { useState } from 'react';
import { useRouter } from 'expo-router';
import { useTranslation } from '../../../shared/store/useLanguageStore';
import { getApiErrorMessage } from '../../../shared/utils/apiError';
import { joinMissionRoom } from '../../../services/socket/socket.client';
import { useNotificationStore } from '../../notifications/store/useNotificationStore';
import { relaunchMission } from '../api/mission.api';
import { useMissionStore } from '../store/useMissionStore';

/** "Relancer": sends a request that found nobody out again, and shows the search page for it. */
export function useRelaunch() {
  const router = useRouter();
  const { t } = useTranslation();
  const flashToast = useNotificationStore((state) => state.flashToast);
  const startSearching = useMissionStore((state) => state.startSearching);
  const [busyId, setBusyId] = useState<string | null>(null);

  const relaunch = async (missionId: string) => {
    setBusyId(missionId);
    try {
      await relaunchMission(missionId);
      joinMissionRoom(missionId);
      startSearching(missionId);
      router.push('/(tabs)/home');
    } catch (e) {
      flashToast({ title: t('errorTitle'), message: getApiErrorMessage(e, t('relaunchFailed')), tone: 'error' });
    } finally {
      setBusyId(null);
    }
  };

  return { relaunch, busyId };
}
