import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { api } from '../../../services/http/client';
import { logger } from '../../../shared/utils/logger';

/**
 * Registers device for Expo Push Notifications and updates backend user profile with pushToken
 */
export async function registerForPushNotificationsAsync(): Promise<string | null> {
  let token: string | null = null;

  try {
    const Notifications = await import('expo-notifications');

    if (Platform.OS === 'android' && Notifications?.setNotificationChannelAsync) {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance?.MAX || 5,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#22C55E',
      });
    }

    if (Notifications?.getPermissionsAsync) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted' && Notifications?.requestPermissionsAsync) {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus === 'granted' && Notifications?.getExpoPushTokenAsync) {
        const projectId = Constants.expoConfig?.extra?.eas?.projectId || Constants.easConfig?.projectId;
        token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
      }
    }

    if (token) {
      try {
        await api.put('/users/profile', { pushToken: token });
      } catch (err) {
        logger.warn('Failed to sync pushToken to backend:', err);
      }
    }
  } catch (e) {
    logger.warn('Push notifications unavailable:', e);
  }

  return token;
}
