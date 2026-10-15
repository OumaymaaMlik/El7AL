import { useAuthStore } from '../../auth';
import { getCurrentCoords } from '../../map/services/location';
import { useTranslation } from '../../../shared/store/useLanguageStore';
import { useNotificationStore } from '../../notifications';
import { logger } from '../../../shared/utils/logger';
import { setAvailability } from '../api/profile.api';

/**
 * Online / offline switch for artisans. Going online needs the device's real position so that
 * clients nearby can be matched; without it the switch stays off and the user is told why.
 */
export function useAvailability() {
  const { t } = useTranslation();
  const flashToast = useNotificationStore((state) => state.flashToast);
  const isAvailable = useAuthStore((state) => state.isProviderAvailable);
  const accountStatus = useAuthStore((state) => state.user?.status);
  const setProviderAvailable = useAuthStore((state) => state.setProviderAvailable);

  const toggle = async (value: boolean) => {
    if (value && accountStatus !== 'ACTIVE') {
      setProviderAvailable(false);
      flashToast({ title: t('approvalPendingTitle'), message: t('needApprovalToGoOnline'), tone: 'error' });
      return;
    }
    if (value) {
      const coords = await getCurrentCoords();
      if (!coords) {
        setProviderAvailable(false);
        flashToast({
          title: t('errorTitle'),
          message: 'Activez la localisation pour recevoir des demandes près de vous.',
          tone: 'error',
        });
        return;
      }
      setProviderAvailable(true);
      try {
        await setAvailability(true, coords);
      } catch (e) {
        logger.warn('Failed to go online:', e);
        setProviderAvailable(false);
      }
      return;
    }

    setProviderAvailable(false);
    try {
      await setAvailability(false);
    } catch (e) {
      logger.warn('Failed to go offline:', e);
      setProviderAvailable(true);
    }
  };

  return { isAvailable, toggle };
}
