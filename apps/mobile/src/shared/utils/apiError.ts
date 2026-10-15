import { isAxiosError } from 'axios';

/** Extracts the backend's `error` message from a failed request, or returns the fallback. */
export function getApiErrorMessage(err: unknown, fallback: string): string {
  if (isAxiosError(err)) {
    const message = err.response?.data?.error;
    if (typeof message === 'string' && message) return message;
  }
  return fallback;
}
