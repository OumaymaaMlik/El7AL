import * as Sentry from '@sentry/react';

/**
 * Error reporting to Sentry. Does nothing unless VITE_SENTRY_DSN was set when the app was built, and never in
 * development. Nothing about the person or the page's content is collected: no request bodies, no headers, no
 * query strings, no clicked text. A report holds the error, where it happened, and the browser.
 */
export function initMonitoring(): void {
  const dsn = (import.meta.env.VITE_SENTRY_DSN as string | undefined)?.trim();
  if (!dsn || import.meta.env.DEV) return;
  Sentry.init({
    dsn,
    environment: 'production',
    tracesSampleRate: 0,
    dataCollection: { userInfo: false, cookies: false, httpHeaders: false, httpBodies: [], urlQueryParams: false },
    // Page clicks are recorded with the text of what was clicked, which can contain a person's data.
    integrations: [Sentry.breadcrumbsIntegration({ dom: false })],
  });
}

/** Catches errors thrown while drawing the app and reports them; the screen stays as it is today (blank). */
export const MonitoringBoundary = Sentry.ErrorBoundary;
