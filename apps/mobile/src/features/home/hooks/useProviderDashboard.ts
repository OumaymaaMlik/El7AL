import { useCallback, useState } from 'react';
import type { Profile } from '../../profile/schemas/profile.schema';
import { useAuthStore } from '../../auth';
import { fetchProfile, useAvailability } from '../../profile';
import { fetchWallet, type Wallet } from '../../wallet/api/wallet.api';
import { logger } from '../../../shared/utils/logger';
import { toNumber } from '../../../shared/utils/format';
import type { Mission } from '../../missions/schemas/mission.schema';
import type { ArtisanStatsData } from '../components/ArtisanHome';

/** Artisan-side data for the home screen: availability and the statistics ledger. */
export function useProviderDashboard(history: Mission[] | null, completedCount: number | null) {
  const user = useAuthStore((state) => state.user);
  const setProviderAvailable = useAuthStore((state) => state.setProviderAvailable);
  const [providerProfileData, setProviderProfileData] = useState<Profile['providerProfile'] | null>(null);
  const [wallet, setWallet] = useState<Wallet | null>(null);

  const load = useCallback(async () => {
    // Read apart: a wallet failure must not hide the rest of the home page.
    fetchWallet()
      .then(setWallet)
      .catch((e) => logger.warn('Wallet load warning:', e));
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

  return { load, wallet, isProviderAvailable, toggleAvailability, stats, completedMissions, providerProfile };
}
