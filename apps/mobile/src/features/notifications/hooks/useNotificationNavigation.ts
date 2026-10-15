import { useRouter } from 'expo-router';
import { ROUTES } from '../../../navigation/routes';
import { useMissionStore } from '../../missions';
import { useNotificationStore } from '../store/useNotificationStore';
import type { DisplayNotification } from '../utils/groupNotifications';

/** Marks a tapped notification as read and navigates to the screen it is about. */
export function useNotificationNavigation(onNavigate: () => void) {
  const router = useRouter();
  const markAsRead = useNotificationStore((state) => state.markAsRead);

  return (item: DisplayNotification) => {
    (item.isChat ? item.ids : [item.id]).forEach(markAsRead);
    onNavigate();

    const missionId: string | undefined = item.isChat
      ? item.missionId || item.metadata?.missionId
      : item.metadata?.missionId;

    if (item.type === 'CHAT') {
      router.push({ pathname: '/(tabs)/chat', params: missionId ? { missionId } : undefined });
    } else if (item.type === 'ACCEPT' || item.type === 'OFFER') {
      router.push({ pathname: '/(tabs)/tracking', params: missionId ? { id: missionId } : undefined });
    } else if (item.type === 'COMPLETED' && item.metadata?.reviewData) {
      useMissionStore.getState().setReviewData(item.metadata.reviewData);
      router.push(ROUTES.home);
    } else {
      router.push(ROUTES.home);
    }
  };
}
