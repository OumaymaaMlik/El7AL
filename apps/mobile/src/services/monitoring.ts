import * as Sentry from '@sentry/react-native';

/**
 * Error reporting to Sentry. Does nothing unless EXPO_PUBLIC_SENTRY_DSN was set for the build, and never in
 * development. No personal data is attached (the SDK's default), and no screenshots or view hierarchy are taken.
 */
export function initMonitoring(): void {
  const dsn = process.env.EXPO_PUBLIC_SENTRY_DSN?.trim();
  if (!dsn || __DEV__) return;
  Sentry.init({
    dsn,
    environment: 'production',
    sendDefaultPii: false,
    tracesSampleRate: 0,
    attachScreenshot: false,
    attachViewHierarchy: false,
  });
}

/** Wraps the root component so errors thrown while drawing a screen are reported. */
export const withMonitoring = Sentry.wrap;
