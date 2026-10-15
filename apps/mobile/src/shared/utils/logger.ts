/* eslint-disable no-console -- this is the one place allowed to print, and only in development */
import { isAxiosError } from 'axios';

/** Reduces an unknown error to non-sensitive fields (never headers, bodies or tokens). */
function scrub(err: unknown): unknown {
  if (isAxiosError(err)) {
    return {
      message: err.message,
      code: err.code,
      status: err.response?.status,
      method: err.config?.method,
      url: err.config?.url,
    };
  }
  if (err instanceof Error) return { name: err.name, message: err.message };
  return err;
}

/** Dev-only logger. Silent in production builds. */
export const logger = {
  debug: (message: string, data?: unknown) => {
    if (__DEV__) console.log(message, data === undefined ? '' : scrub(data));
  },
  warn: (message: string, err?: unknown) => {
    if (__DEV__) console.warn(message, err === undefined ? '' : scrub(err));
  },
  error: (message: string, err?: unknown) => {
    if (__DEV__) console.error(message, err === undefined ? '' : scrub(err));
  },
};
