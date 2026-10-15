import { useCallback, useEffect, useState } from 'react';
import { tradeName, type TradeLink } from '../../../shared/types/provider';
import { useAuthStore } from '../../auth';
import { logger } from '../../../shared/utils/logger';
import { toNumber } from '../../../shared/utils/format';
import { fetchProfile } from '../api/profile.api';
import { useAvailability } from './useAvailability';
import type { Profile } from '../schemas/profile.schema';

/** Loads the signed-in user's profile and exposes derived, display-ready values. */
export function useProfile() {
  const storedUser = useAuthStore((state) => state.user);
  const setProviderAvailable = useAuthStore((state) => state.setProviderAvailable);

  const [profile, setProfile] = useState<Profile | null>(null);
  const [fetching, setFetching] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  /** Increments on every successful fetch so forms can re-sync with server data. */
  const [loadedVersion, setLoadedVersion] = useState(0);

  const load = useCallback(async () => {
    setFetching(true);
    try {
      const data = await fetchProfile();
      if (data) {
        setProfile(data);
        setProviderAvailable(data.providerProfile?.isAvailable || false);
        setLoadedVersion((v) => v + 1);
      }
    } catch (e) {
      logger.warn('Failed to fetch user profile:', e);
    } finally {
      setFetching(false);
    }
  }, [setProviderAvailable]);

  useEffect(() => {
    load();
  }, [load]);

  const refresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const { isAvailable: isProviderAvailable, toggle: toggleAvailability } = useAvailability();

  const activeUser = profile || storedUser;
  const rawCategories = (profile?.providerProfile?.categories ||
    storedUser?.providerProfile?.categories ||
    []) as TradeLink[];
  const professions = rawCategories.map(tradeName).filter(Boolean).join(' · ');

  return {
    profile,
    setProfile,
    loadedVersion,
    fetching,
    refreshing,
    refresh,
    toggleAvailability,
    isProviderAvailable,
    activeUser,
    isProviderUser: activeUser?.role === 'PROVIDER',
    isAdminUser: activeUser?.role === 'ADMIN',
    isVerified: activeUser?.status === 'ACTIVE',
    professions,
    address: (profile?.clientProfile?.defaultAddress as string | undefined) || undefined,
    balance: toNumber(profile?.providerProfile?.walletBalance) ?? toNumber(profile?.walletBalance) ?? 0,
  };
}

export type ProfileData = ReturnType<typeof useProfile>;
