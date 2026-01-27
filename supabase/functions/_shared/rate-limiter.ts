/**
 * Rate Limiter for Supabase Edge Functions
 * 
 * Uses a sliding window algorithm with database-backed state.
 * Protects against abuse while being generous to legitimate users.
 */

import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

// =====================================================
// TYPES
// =====================================================

export interface RateLimitConfig {
  /**
   * Identifier for this rate limit (e.g., 'companion', 'query-bible')
   */
  endpoint: string;

  /**
   * Maximum requests per window for free users
   */
  freeLimit: number;

  /**
   * Maximum requests per window for premium users
   */
  premiumLimit: number;

  /**
   * Time window in seconds
   */
  windowSeconds: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: Date;
  limit: number;
  retryAfterSeconds?: number;
}

// =====================================================
// DEFAULT CONFIGS
// =====================================================

export const RATE_LIMITS: Record<string, RateLimitConfig> = {
  companion: {
    endpoint: 'companion',
    freeLimit: 3,        // 3 requests per hour for free users (seed system)
    premiumLimit: 100,   // 100 requests per hour for premium
    windowSeconds: 3600, // 1 hour
  },
  'query-bible': {
    endpoint: 'query-bible',
    freeLimit: 10,       // 10 searches per hour
    premiumLimit: 200,   // 200 searches per hour
    windowSeconds: 3600,
  },
  'scripture-scan': {
    endpoint: 'scripture-scan',
    freeLimit: 5,        // 5 scans per hour
    premiumLimit: 50,    // 50 scans per hour
    windowSeconds: 3600,
  },
};

// =====================================================
// RATE LIMITER FUNCTIONS
// =====================================================

/**
 * Check if a request is allowed under rate limiting rules
 */
export async function checkRateLimit(
  supabase: SupabaseClient,
  userId: string,
  config: RateLimitConfig,
  isPremium: boolean = false
): Promise<RateLimitResult> {
  const now = new Date();
  const windowStart = new Date(now.getTime() - config.windowSeconds * 1000);
  const limit = isPremium ? config.premiumLimit : config.freeLimit;

  try {
    // Count requests in the current window
    const { count, error } = await supabase
      .from('rate_limits')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('endpoint', config.endpoint)
      .gte('created_at', windowStart.toISOString());

    if (error) {
      // If table doesn't exist or error, allow the request but log
      console.warn('[RateLimiter] Error checking rate limit:', error);
      return {
        allowed: true,
        remaining: limit - 1,
        resetAt: new Date(now.getTime() + config.windowSeconds * 1000),
        limit,
      };
    }

    const requestCount = count || 0;
    const remaining = Math.max(0, limit - requestCount);
    const allowed = requestCount < limit;

    // Calculate reset time (when oldest request in window expires)
    const resetAt = new Date(now.getTime() + config.windowSeconds * 1000);

    if (!allowed) {
      // Find when the oldest request will expire
      const { data: oldest } = await supabase
        .from('rate_limits')
        .select('created_at')
        .eq('user_id', userId)
        .eq('endpoint', config.endpoint)
        .gte('created_at', windowStart.toISOString())
        .order('created_at', { ascending: true })
        .limit(1);

      if (oldest && oldest[0]) {
        const oldestTime = new Date(oldest[0].created_at).getTime();
        const retryAfterMs = (oldestTime + config.windowSeconds * 1000) - now.getTime();
        return {
          allowed: false,
          remaining: 0,
          resetAt: new Date(oldestTime + config.windowSeconds * 1000),
          limit,
          retryAfterSeconds: Math.ceil(retryAfterMs / 1000),
        };
      }
    }

    return {
      allowed,
      remaining: allowed ? remaining - 1 : 0,
      resetAt,
      limit,
    };
  } catch (error) {
    console.error('[RateLimiter] Unexpected error:', error);
    // On error, allow the request to avoid breaking the app
    return {
      allowed: true,
      remaining: limit - 1,
      resetAt: new Date(now.getTime() + config.windowSeconds * 1000),
      limit,
    };
  }
}

/**
 * Record a request for rate limiting
 */
export async function recordRequest(
  supabase: SupabaseClient,
  userId: string,
  endpoint: string
): Promise<void> {
  try {
    const { error } = await supabase
      .from('rate_limits')
      .insert({
        user_id: userId,
        endpoint,
        created_at: new Date().toISOString(),
      });

    if (error) {
      console.warn('[RateLimiter] Error recording request:', error);
    }
  } catch (error) {
    console.error('[RateLimiter] Error recording request:', error);
  }
}

/**
 * Clean up old rate limit records (run periodically)
 */
export async function cleanupOldRecords(
  supabase: SupabaseClient,
  maxAgeSeconds: number = 7200 // 2 hours
): Promise<number> {
  const cutoff = new Date(Date.now() - maxAgeSeconds * 1000);
  
  try {
    const { data, error } = await supabase
      .from('rate_limits')
      .delete()
      .lt('created_at', cutoff.toISOString())
      .select('id');

    if (error) {
      console.warn('[RateLimiter] Error cleaning up:', error);
      return 0;
    }

    return data?.length || 0;
  } catch (error) {
    console.error('[RateLimiter] Error cleaning up:', error);
    return 0;
  }
}

/**
 * Generate rate limit response headers
 */
export function getRateLimitHeaders(result: RateLimitResult): Record<string, string> {
  return {
    'X-RateLimit-Limit': result.limit.toString(),
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': Math.floor(result.resetAt.getTime() / 1000).toString(),
    ...(result.retryAfterSeconds && {
      'Retry-After': result.retryAfterSeconds.toString(),
    }),
  };
}

/**
 * Create a 429 Too Many Requests response
 */
export function createRateLimitResponse(result: RateLimitResult): Response {
  const headers = {
    ...getRateLimitHeaders(result),
    'Content-Type': 'application/json',
  };

  return new Response(
    JSON.stringify({
      error: 'Too Many Requests',
      message: `Rate limit exceeded. Please try again in ${result.retryAfterSeconds} seconds.`,
      retryAfterSeconds: result.retryAfterSeconds,
    }),
    {
      status: 429,
      headers,
    }
  );
}
