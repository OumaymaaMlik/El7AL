import { useCallback, useState } from 'react';
import { logger } from '../../../shared/utils/logger';
import { joinMissionRoom } from '../../../services/socket/socket.client';
import { fetchMissionHistoryPage } from '../api/mission.api';
import type { Mission } from '../schemas/mission.schema';
import { useMissionStore } from '../store/useMissionStore';

/**
 * Restores the in-progress mission (if any) from the server into the mission store.
 * Also keeps the fetched history, which feeds the artisan's statistics.
 */
export function useActiveMissionSync(isProviderRole: boolean) {
  const [history, setHistory] = useState<Mission[] | null>(null);
  const [completedCount, setCompletedCount] = useState<number | null>(null);

  const sync = useCallback(async () => {
    try {
      const page = await fetchMissionHistoryPage();
      const missions = page?.missions ?? null;
      const store = useMissionStore.getState();
      if (!missions) {
        store.clearActiveMission();
        return;
      }
      setHistory(missions);
      setCompletedCount(page?.completedCount ?? null);

      const active = missions.find((m) => m.status !== 'COMPLETED' && m.status !== 'CANCELLED');
      if (!active) {
        store.clearActiveMission();
        return;
      }

      joinMissionRoom(active.id);
      const ongoing = active.status !== 'BROADCASTED';
      store.updateMissionState({
        activeMission: active,
        searchingMissionId: active.id,
        missionStatus: active.status as never,
        isSearching: !ongoing,
        activePairingProvider: isProviderRole
          ? active.client?.user || { fullName: 'Client' }
          : active.provider?.user || { fullName: 'Artisan' },
      });
      if (ongoing) store.stopSearching();
    } catch (e) {
      logger.warn('Failed to check active mission on mount:', e);
    }
  }, [isProviderRole]);

  return { history, completedCount, sync };
}
