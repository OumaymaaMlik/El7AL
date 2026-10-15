import { useCallback, useEffect, useState } from 'react';
import { logger } from '../../../shared/utils/logger';
import {
  fetchCategories,
  fetchDisputes,
  fetchMissions,
  fetchPendingProviders,
  fetchPendingTopups,
  fetchStats,
  fetchUsers,
} from '../api/admin.api';
import type {
  AdminCategory,
  AdminMission,
  AdminStats,
  AdminTab,
  AdminUser,
  Dispute,
  PendingProvider,
  Topup,
  UserRoleFilter,
} from '../schemas/admin.schema';

/** Loads the data of the active admin tab (and reloads it on demand). */
export function useAdminData(tab: AdminTab, userSearch: string, userRole: UserRoleFilter) {
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [missions, setMissions] = useState<AdminMission[]>([]);
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [topups, setTopups] = useState<Topup[]>([]);
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [providers, setProviders] = useState<PendingProvider[]>([]);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      // The figures feed the numbers on the tabs, so they are refreshed whichever tab is open.
      void fetchStats()
        .then((data) => data && setStats(data))
        .catch((e) => logger.warn('Failed to load admin figures:', e));
      switch (tab) {
        case 'VERIFICATIONS': {
          const data = await fetchPendingProviders();
          if (data) setProviders(data);
          break;
        }
        case 'USERS': {
          const data = await fetchUsers(userSearch, userRole);
          if (data) setUsers(data);
          break;
        }
        case 'MISSIONS': {
          const data = await fetchMissions();
          if (data) setMissions(data);
          break;
        }
        case 'SERVICES': {
          const data = await fetchCategories();
          if (data) setCategories(data);
          break;
        }
        case 'TOPUPS': {
          const data = await fetchPendingTopups();
          if (data) setTopups(data);
          break;
        }
        case 'DISPUTES': {
          const data = await fetchDisputes();
          if (data) setDisputes(data);
          break;
        }
      }
    } catch (e) {
      logger.warn('Failed to load admin data:', e);
    } finally {
      setLoading(false);
    }
  }, [tab, userSearch, userRole]);

  useEffect(() => {
    reload();
  }, [reload]);

  return { loading, reload, stats, users, missions, categories, topups, disputes, providers };
}

export type AdminData = ReturnType<typeof useAdminData>;
