import * as Sentry from '@sentry/node';
import { logger } from '../utils/logger.js';

let enabled = false;

/**
 * Error reporting to Sentry. Does nothing unless SENTRY_DSN is set, so development and tests send nothing.
 * Request bodies, cookies and credentials are removed before anything leaves the server: a report must never
 * carry a password, a token or a person's data.
 */
export function initMonitoring(): void {
  const dsn = process.env.SENTRY_DSN?.trim();
  if (!dsn) return;
  Sentry.init({
    dsn,
    environment: process.env.NODE_ENV || 'development',
    release: process.env.GIT_SHA || undefined,
    // Collect nothing about the person or the request by default (the SDK's defaults collect headers, bodies and queries).
    dataCollection: { userInfo: false, cookies: false, httpHeaders: false, httpBodies: [], urlQueryParams: false },
    tracesSampleRate: 0,
    beforeSend(event) {
      if (event.request) {
        delete event.request.data;
        delete event.request.cookies;
        if (event.request.headers) {
          delete event.request.headers.authorization;
          delete event.request.headers.cookie;
        }
      }
      if (event.user) delete event.user.ip_address;
      return event;
    },
  });
  enabled = true;
  logger.info('Error reporting to Sentry is on');
}

/** Sends an unexpected error to Sentry (no-op when reporting is off). `userId` is the only identity attached. */
export function reportError(err: unknown, context: { method?: string; url?: string; userId?: string } = {}): void {
  if (!enabled) return;
  Sentry.withScope((scope) => {
    if (context.userId) scope.setUser({ id: context.userId });
    if (context.method || context.url)
      scope.setTag('route', `${context.method ?? ''} ${context.url?.split('?')[0] ?? ''}`.trim());
    Sentry.captureException(err);
  });
}

/** Sends what is still buffered; called before the process exits so the last error is not lost. */
export async function flushMonitoring(): Promise<void> {
  if (enabled) await Sentry.flush(2000);
}
