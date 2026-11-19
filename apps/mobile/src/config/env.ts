import { Platform } from 'react-native';
import Constants from 'expo-constants';

const devHost = (): string => {
  // In a browser the backend is on the same machine that served the page (e.g. a phone opening http://192.168.1.10:8081).
  if (Platform.OS === 'web' && typeof window !== 'undefined' && window.location?.hostname) {
    return window.location.hostname;
  }
  const hostUri = Constants.expoConfig?.hostUri || Constants.manifest2?.extra?.expoGo?.debuggerHost;
  const ip = hostUri?.split(':')[0];
  if (ip) return ip;
  return Platform.OS === 'android' ? '10.0.2.2' : 'localhost';
};

function resolveApiUrl(): string {
  const configured = process.env.EXPO_PUBLIC_API_URL?.trim().replace(/\/+$/, '');
  if (configured) {
    if (!__DEV__ && !configured.startsWith('https://')) {
      throw new Error('EXPO_PUBLIC_API_URL must use https:// in production builds.');
    }
    return configured;
  }
  if (__DEV__) return `http://${devHost()}:4000/api/v1`;
  throw new Error('EXPO_PUBLIC_API_URL is not set. Define it in your EAS build profile or .env file.');
}

export const API_URL = resolveApiUrl();
/** El 7al's bank account for artisan transfers. Set EXPO_PUBLIC_EL7AL_RIB; the row is hidden when it is not set. */
export const EL7AL_RIB = process.env.EXPO_PUBLIC_EL7AL_RIB?.trim() || null;

/**
 * The client side of the app (requesting an artisan) is "coming soon" until EXPO_PUBLIC_CLIENT_ENABLED=true.
 * The first release is for artisans and admins; clients are held on a "coming soon" page.
 */
export const CLIENT_ENABLED = process.env.EXPO_PUBLIC_CLIENT_ENABLED?.trim() === 'true';

export const SOCKET_URL = API_URL.replace(/\/api\/v1$/, '');
