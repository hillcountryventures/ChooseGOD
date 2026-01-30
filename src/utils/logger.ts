/**
 * Logger utility — replaces raw console.* calls
 *
 * In __DEV__ mode: logs to console with optional tag prefix
 * In production: no-ops (future: pipe to Sentry/Crashlytics)
 */

/* eslint-disable no-console */

type LogFn = (...args: unknown[]) => void;

export interface Logger {
  debug: LogFn;
  info: LogFn;
  warn: LogFn;
  error: LogFn;
}

const noop: LogFn = () => {};

function makeLogger(tag?: string): Logger {
  if (!__DEV__) {
    return { debug: noop, info: noop, warn: noop, error: noop };
  }

  const prefix = tag ? `[${tag}]` : '';

  return {
    debug: (...args: unknown[]) => console.log(prefix, ...args),
    info: (...args: unknown[]) => console.info(prefix, ...args),
    warn: (...args: unknown[]) => console.warn(prefix, ...args),
    error: (...args: unknown[]) => console.error(prefix, ...args),
  };
}

/** Default logger (no tag) */
export const logger: Logger = makeLogger();

/** Create a namespaced logger */
export function createLogger(tag: string): Logger {
  return makeLogger(tag);
}
