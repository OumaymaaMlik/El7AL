import { useState } from 'react';
import { useTranslation } from '../../../shared/store/useLanguageStore';
import { useNotificationStore } from '../../notifications';
import { fetchUserMissions } from '../api/admin.api';
import type { AdminMission, AdminUser } from '../schemas/admin.schema';

/**
 * One sheet for a user's interventions and for a single intervention's details:
 * either the list of the user's missions, or one mission opened from that list (or from the Missions tab).
 */
export function useUserInterventions() {
  const { t } = useTranslation();
  const flashToast = useNotificationStore((state) => state.flashToast);

  const [listOpen, setListOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [user, setUser] = useState<AdminUser | null>(null);
  const [missions, setMissions] = useState<AdminMission[]>([]);
  const [loading, setLoading] = useState(false);
  const [detail, setDetail] = useState<AdminMission | null>(null);

  const openForUser = async (target: AdminUser) => {
    setUser(target);
    setDetail(null);
    setDetailOpen(false);
    setMissions([]);
    setListOpen(true);
    setLoading(true);
    try {
      setMissions((await fetchUserMissions(target.id)) ?? []);
    } catch {
      flashToast({ title: t('errorTitle'), message: t('errLoadUserMissions'), tone: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const openDetail = (mission: AdminMission) => {
    setDetail(mission);
    setDetailOpen(true);
  };

  const backToList = () => {
    setDetailOpen(false);
    setDetail(null);
  };

  const close = () => {
    setListOpen(false);
    backToList();
  };

  return {
    visible: listOpen || detailOpen,
    showingDetail: Boolean(detail),
    canGoBack: Boolean(detail) && listOpen,
    user,
    missions,
    loading,
    detail,
    openForUser,
    openDetail,
    backToList,
    close,
  };
}

export type UserInterventions = ReturnType<typeof useUserInterventions>;
