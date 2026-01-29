import * as Sentry from '@sentry/react-native';

const SENTRY_DSN = process.env.EXPO_PUBLIC_SENTRY_DSN || '';

export function initSentry() {
  Sentry.init({
    dsn: SENTRY_DSN,
    enableAutoSessionTracking: true,
    sessionTrackingIntervalMillis: 30000,
    tracesSampleRate: 0.2,
    attachScreenshot: true,
    enableAutoPerformanceTracing: true,
    environment: __DEV__ ? 'development' : 'production',
    enabled: !__DEV__,
  });
}

export { Sentry };
