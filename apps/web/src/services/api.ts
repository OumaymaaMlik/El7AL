import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '../store/useAuthStore';
import { API_BASE_URL } from './config';
import { requestNewTokens } from './session';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
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
      logout();
      return null;
    }
    setTokens(tokens.token, tokens.refreshToken);
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
    // A rejected login or registration is not an expired session.
    const isAuthCall = url.includes('/auth/login') || url.includes('/auth/register') || url.includes('/auth/refresh');

    if (error.response?.status === 401 && signedIn && !isAuthCall && config) {
      if (error.response.data?.code === 'ACCOUNT_BLOCKED') {
        useAuthStore.getState().logout();
      } else if (!config._renewed) {
        config._renewed = true;
        const token = await renewToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
          return api(config);
        }
      }
    }
    return Promise.reject(error);
  },
);

/** The backend's `error` message from a failed request, or the fallback. */
export function apiErrorMessage(err: unknown, fallback: string): string {
  const data = (err as { response?: { data?: { error?: unknown; message?: unknown } } })?.response?.data;
  if (typeof data?.error === 'string' && data.error) return data.error;
  if (typeof data?.message === 'string' && data.message) return data.message;
  return fallback;
}
