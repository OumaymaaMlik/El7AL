import { useEffect, useState } from 'react';
import { useTranslation } from '../../../shared/store/useLanguageStore';
import { logger } from '../../../shared/utils/logger';
import { leaveMissionRoom } from '../../../services/socket/socket.client';
import { cancelMission } from '../api/mission.api';
import { useMissionStore } from '../store/useMissionStore';
import { isMissionActive } from '../utils/missionState';

const SEARCH_DURATION_SECONDS = 60;

/**
 * The client's artisan search: a 60-second countdown that progressively widens the radius
 * (5 km -> 10 km -> 20 km), and cancellation / timeout handling.
 */
export function useMissionSearch() {
  const { t } = useTranslation();
  const isSearching = useMissionStore((state) => state.isSearching);
  const searchingMissionId = useMissionStore((state) => state.searchingMissionId);
  const stopSearching = useMissionStore((state) => state.stopSearching);
  const missionActive = useMissionStore(isMissionActive);

  const [noArtisanOpen, setNoArtisanOpen] = useState(false);

  const cancelSearch = async () => {
    if (searchingMissionId) {
      leaveMissionRoom(searchingMissionId);
      try {
        await cancelMission(searchingMissionId, 'Recherche annulée par le client');
      } catch (e) {
        logger.warn('Cancel search error:', e);
      }
    }
    stopSearching();
  };

  // A paired artisan ends the search phase.
  useEffect(() => {
    if (missionActive && isSearching) stopSearching();
  }, [missionActive, isSearching, stopSearching]);

  useEffect(() => {
    if (!isSearching || missionActive) return;

    const timer = setInterval(() => {
      const state = useMissionStore.getState();
      if (!state.isSearching || isMissionActive(state)) {
        clearInterval(timer);
        stopSearching();
        return;
      }

      const nextSeconds = state.searchTimerSeconds - 1;
      if (nextSeconds <= 0) {
        clearInterval(timer);
        cancelSearch();
        setNoArtisanOpen(true);
        return;
      }

      const [searchRadiusKm, searchStatusText] =
        nextSeconds > 40
          ? [5, t('searchRange5km')]
          : nextSeconds > 20
            ? [10, t('searchRange10km')]
            : [20, t('searchRange20km')];

      useMissionStore.setState({ searchTimerSeconds: nextSeconds, searchRadiusKm, searchStatusText });
    }, 1000);

    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSearching, missionActive, searchingMissionId]);

  return { cancelSearch, noArtisanOpen, setNoArtisanOpen, searchDuration: SEARCH_DURATION_SECONDS };
}
