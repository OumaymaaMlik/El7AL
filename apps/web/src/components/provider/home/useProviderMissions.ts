import { useCallback, useEffect, useState } from 'react';
import { api, apiErrorMessage } from '../../../services/api';
import { getSocket } from '../../../services/socket';
import { onServerEvent } from '../../../services/serverEvents';
import { useAuthStore } from '../../../store/useAuthStore';
import { useNotificationStore } from '../../../store/useNotificationStore';
import { isOngoing, isSearching } from '../../../lib/mission';
import type { Mission } from '../../client/ActiveMissionsList';

/** The artisan's jobs sorted in the three tabs, kept fresh by the server events, and the accept action. */
export function useProviderMissions(onAccepted: (missionId: string) => void) {
  const userId = useAuthStore((s) => s.user?.id);
  const addNotification = useNotificationStore((s) => s.addNotification);
  const [missions, setMissions] = useState<Mission[]>([]);
  const [completedCount, setCompletedCount] = useState<number | null>(null);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const res = await api.get('/missions/history');
      const list = res.data.success && Array.isArray(res.data.data) ? res.data.data : [];
      setMissions(list);
      setCompletedCount(res.data.meta?.completedCount ?? null);
    } catch {
      setMissions([]);
    }
  }, []);

  useEffect(() => {
    void refresh();
    const socket = getSocket();
    // The offer pop-up and the review window open from their own notifications; here the lists just refresh.
    const events = [
      'mission:new_offer',
      'mission:offer_withdrawn',
      'mission:reviewed',
      'mission:completed',
      'mission:cancelled',
    ] as const;
    const stops = events.map((event) => onServerEvent(socket, event, () => void refresh()));
    return () => stops.forEach((stop) => stop());
  }, [userId, refresh]);

  const accept = async (missionId: string) => {
    setAcceptingId(missionId);
    try {
      await api.post(`/missions/${missionId}/accept`);
      addNotification({
        title: 'Mission acceptée',
        message: 'Navigation GPS et suivi en direct lancés.',
        type: 'success',
      });
      onAccepted(missionId);
    } catch (err) {
      addNotification({
        title: 'Erreur',
        message: apiErrorMessage(err, "Impossible d'accepter la mission."),
        type: 'danger',
      });
    } finally {
      setAcceptingId(null);
    }
  };

  return {
    ongoing: missions.filter((m) => isOngoing(m.status)),
    available: missions.filter((m) => isSearching(m.status)),
    history: missions.filter((m) => m.status === 'COMPLETED' || m.status === 'CANCELLED'),
    completedCount: completedCount ?? missions.filter((m) => m.status === 'COMPLETED').length,
    acceptingId,
    accept,
  };
}
