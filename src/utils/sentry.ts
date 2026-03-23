import * as Sentry from '@sentry/react-native';
import { logger } from '../utils/logger';

const SENTRY_DSN = process.env.EXPO_PUBLIC_SENTRY_DSN || '';

export function initSentry() {
  if (!SENTRY_DSN || SENTRY_DSN.includes('PLACEHOLDER')) {
    logger.warn('[Sentry] DSN is missing or contains PLACEHOLDER — skipping Sentry initialization. Set EXPO_PUBLIC_SENTRY_DSN to a real DSN.');
    return;
  }

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
