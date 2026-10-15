import { useCallback, useState } from 'react';
import type { Profile } from '../../profile/schemas/profile.schema';
import { useAuthStore } from '../../auth';
import { fetchProfile, useAvailability } from '../../profile';
import { logger } from '../../../shared/utils/logger';
import { toNumber } from '../../../shared/utils/format';
import type { Mission } from '../../missions/schemas/mission.schema';
import type { ArtisanStatsData } from '../components/ArtisanStats';

/** Artisan-side data for the home screen: availability and the statistics ledger. */
export function useProviderDashboard(history: Mission[] | null, completedCount: number | null) {
  const user = useAuthStore((state) => state.user);
  const setProviderAvailable = useAuthStore((state) => state.setProviderAvailable);
  const [providerProfileData, setProviderProfileData] = useState<Profile['providerProfile'] | null>(null);

  const load = useCallback(async () => {
    try {
      const profile = await fetchProfile();
      if (profile) {
        setProviderAvailable(profile.providerProfile?.isAvailable || false);
        setProviderProfileData(profile.providerProfile || null);
      }
    } catch (e) {
      logger.warn('Fetch availability warning:', e);
    }
  }, [setProviderAvailable]);

  const { isAvailable: isProviderAvailable, toggle: toggleAvailability } = useAvailability();

  const providerProfile = providerProfileData ?? user?.providerProfile ?? null;
  const completedMissions = (history || []).filter((m) => m.status === 'COMPLETED');
  const stats: ArtisanStatsData = {
    completedCount: completedCount ?? (history ? completedMissions.length : null),
    ratingAverage: providerProfile ? toNumber(providerProfile.ratingAverage) : null,
    totalRatings: providerProfile ? toNumber(providerProfile.totalRatings) : null,
    walletBalance: providerProfile ? toNumber(providerProfile.walletBalance) : null,
  };

  return { load, isProviderAvailable, toggleAvailability, stats, completedMissions };
}
