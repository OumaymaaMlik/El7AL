import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { API_URL } from '../../config/env';
import { useAuthStore } from '../../features/auth/store/useAuthStore';
import { getStorageItem } from '../storage/secureStorage';
import { logger } from '../../shared/utils/logger';
import { requestNewTokens } from './session';

export { API_URL };

export const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 8000,
});

api.interceptors.request.use(async (config) => {
  let token = useAuthStore.getState().token;
  if (!token) {
    try {
      token = await getStorageItem('user_token');
    } catch (e) {
      logger.warn('Failed to retrieve token from storage:', e);
    }
  }
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

/** One renewal at a time: requests that fail together all wait for the same new token. */
let renewing: Promise<string | null> | null = null;

function renewToken(): Promise<string | null> {
  renewing ??= (async () => {
    const { refreshToken, setTokens, logout } = useAuthStore.getState();
    const tokens = refreshToken ? await requestNewTokens(refreshToken) : null;
    if (!tokens) {
      await logout();
      return null;
    }
    await setTokens(tokens.token, tokens.refreshToken);
    return tokens.token;
  })().finally(() => {
    renewing = null;
  });
  return renewing;
}

type Retriable = InternalAxiosRequestConfig & { _renewed?: boolean };

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<{ code?: string }>) => {
    const config = error.config as Retriable | undefined;
    const url = config?.url ?? '';
    const signedIn = Boolean(useAuthStore.getState().token);
    // A rejected login, registration or code check is not an expired session.
    const isAuthCall = url.includes('/auth/') && !url.includes('/auth/me');

    if (error.response?.status === 401 && signedIn && !isAuthCall && config) {
      if (error.response.data?.code === 'ACCOUNT_BLOCKED') {
        await useAuthStore.getState().logout();
      } else if (!config._renewed) {
        config._renewed = true;
        const token = await renewToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
          return api(config);
        }
      }
    }
    if (error?.code === 'ERR_NETWORK') logger.warn(`[Network Error] Backend unreachable at ${API_URL}`);
    return Promise.reject(error);
  },
);
