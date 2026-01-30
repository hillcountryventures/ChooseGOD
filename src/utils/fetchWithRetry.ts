import { logger } from '../utils/logger';
/**
 * fetchWithRetry
 *
 * Retry wrapper with exponential backoff for network calls.
 * 3 attempts: waits 1s, 2s, 4s between retries.
 */

const DEFAULT_MAX_ATTEMPTS = 3;
const BASE_DELAY_MS = 1000;
const DEFAULT_TIMEOUT_MS = 15000;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Execute an async function with retry + exponential backoff.
 *
 * @param fn - The async operation to attempt
 * @param options - Configuration
 * @returns The result of fn
 * @throws The last error after all attempts are exhausted
 */
export async function fetchWithRetry<T>(
  fn: (signal?: AbortSignal) => Promise<T>,
  options?: {
    maxAttempts?: number;
    timeoutMs?: number;
    onRetry?: (attempt: number, error: unknown) => void;
  }
): Promise<T> {
  const maxAttempts = options?.maxAttempts ?? DEFAULT_MAX_ATTEMPTS;
  const timeoutMs = options?.timeoutMs ?? DEFAULT_TIMEOUT_MS;

  let lastError: unknown;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const result = await fn(controller.signal);
      clearTimeout(timer);
      return result;
    } catch (err) {
      clearTimeout(timer);
      lastError = err;

      if (attempt < maxAttempts) {
        const backoff = BASE_DELAY_MS * Math.pow(2, attempt - 1); // 1s, 2s, 4s
        options?.onRetry?.(attempt, err);
        logger.warn(
          `[fetchWithRetry] Attempt ${attempt}/${maxAttempts} failed, retrying in ${backoff}ms`,
          err
        );
        await delay(backoff);
      }
    }
  }

  throw lastError;
}
