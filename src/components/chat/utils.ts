/**
 * Chat Utilities
 * Helper functions for the chat feature
 */

import { ChatContext } from '../../types';

// Wit level type
export type WitLevel = 'low' | 'medium' | 'high';

// Wit level display names
export const WIT_LEVEL_LABELS: Record<WitLevel, string> = {
  low: 'Focused',
  medium: 'Balanced',
  high: 'Playful',
};

// Cycle through wit levels
export function cycleWitLevel(current: WitLevel): WitLevel {
  const levels: WitLevel[] = ['low', 'medium', 'high'];
  const currentIndex = levels.indexOf(current);
  return levels[(currentIndex + 1) % levels.length];
}

// Generate context-aware prompt based on current screen
export function generateContextPrompt(context: ChatContext): string {
  switch (context.screenType) {
    case 'bible':
      if (context.bibleContext?.selectedVerse) {
        const { book, chapter, selectedVerse } = context.bibleContext;
        const truncatedText = selectedVerse.text.length > 60
          ? selectedVerse.text.slice(0, 60) + '...'
          : selectedVerse.text;
        return `Ask about ${book} ${chapter}:${selectedVerse.verse} - "${truncatedText}"`;
      }
      if (context.bibleContext) {
        return `Ask about ${context.bibleContext.book} ${context.bibleContext.chapter}`;
      }
      return 'Ask about Scripture...';

    case 'devotional':
      if (context.devotionalContext) {
        return `Ask about Day ${context.devotionalContext.dayNumber} of "${context.devotionalContext.seriesTitle}"`;
      }
      return 'Ask about your devotional...';

    case 'journey':
      return 'Reflect on your spiritual journey...';

    default:
      return 'Ask anything about Scripture...';
  }
}

// Generate initial message for context
export function generateInitialMessage(context: ChatContext): string | undefined {
  if (context.screenType === 'bible' && context.bibleContext) {
    const { book, chapter, selectedVerse } = context.bibleContext;
    if (selectedVerse) {
      return `Help me understand ${book} ${chapter}:${selectedVerse.verse}`;
    }
    return `What are the key themes in ${book} ${chapter}?`;
  }
  return undefined;
}

// Format response time for display
export function formatResponseTime(ms: number): string {
  if (ms < 1000) {
    return `${ms}ms`;
  }
  return `${(ms / 1000).toFixed(1)}s`;
}

// Truncate text with ellipsis
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}

// Check if a message looks like a greeting
export function isGreeting(message: string): boolean {
  const greetings = ['hello', 'hi', 'hey', 'good morning', 'good evening', 'good afternoon'];
  const lowerMessage = message.toLowerCase().trim();
  return greetings.some(g => lowerMessage.startsWith(g));
}

// Rate limiting helper
export interface RateLimitState {
  count: number;
  resetTime: number;
}

export function checkRateLimit(
  state: RateLimitState,
  maxRequests: number = 10,
  windowMs: number = 60000
): { allowed: boolean; remaining: number; resetInMs: number } {
  const now = Date.now();

  // Reset if window has passed
  if (now > state.resetTime) {
    return {
      allowed: true,
      remaining: maxRequests - 1,
      resetInMs: windowMs,
    };
  }

  // Check if under limit
  if (state.count < maxRequests) {
    return {
      allowed: true,
      remaining: maxRequests - state.count - 1,
      resetInMs: state.resetTime - now,
    };
  }

  return {
    allowed: false,
    remaining: 0,
    resetInMs: state.resetTime - now,
  };
}

// Update rate limit state
export function updateRateLimitState(
  state: RateLimitState,
  windowMs: number = 60000
): RateLimitState {
  const now = Date.now();

  if (now > state.resetTime) {
    // Start new window
    return {
      count: 1,
      resetTime: now + windowMs,
    };
  }

  // Increment count in current window
  return {
    count: state.count + 1,
    resetTime: state.resetTime,
  };
}

// ============ STREAMING UTILITIES ============

import { VerseSource, SuggestedAction, ChatMode, ChatBibleContext } from '../../types';
import EventSource from 'react-native-sse';

export interface StreamEvent {
  type: 'meta' | 'content' | 'done' | 'error';
  content?: string;
  sources?: VerseSource[];
  suggestedActions?: SuggestedAction[];
  thread_id?: string;
  wit_level?: WitLevel;
  fullResponse?: string;
  error?: string;
}

export interface StreamCallbacks {
  onMeta: (data: {
    sources: VerseSource[];
    suggestedActions: SuggestedAction[];
    threadId: string;
    witLevel: WitLevel;
  }) => void;
  onContent: (chunk: string, fullContent: string) => void;
  onDone: (fullResponse: string) => void;
  onError: (error: string) => void;
  onRetry?: (attempt: number) => void; // Called when automatic retry starts
}

// Timeout configuration for cold start handling
const INITIAL_TIMEOUT_MS = 30000; // 30s for first attempt
const RETRY_TIMEOUT_MS = 45000; // 45s for retries (server is likely warming)
const MAX_RETRIES = 1; // One retry with backoff

/**
 * Sleep helper for retry backoff
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Quota context for free tier users
export interface QuotaContext {
  isFreeTier: boolean;
  seedsRemaining: number;
  totalSeeds: number;
  isLastSeed: boolean;
}

/**
 * Creates a custom error with a name property (React Native compatible).
 * DOMException is not available in React Native.
 */
function createNamedError(message: string, name: string): Error {
  const error = new Error(message);
  error.name = name;
  return error;
}

/**
 * Stream a response from the companion Edge Function.
 * Uses react-native-sse for proper SSE support in React Native.
 * Includes adaptive timeout and retry for cold start resilience.
 */
export async function streamCompanionResponse(
  supabaseUrl: string,
  supabaseAnonKey: string,
  params: {
    userId: string | null;
    message: string;
    conversationHistory: Array<{ role: string; content: string }>;
    contextMode: ChatMode;
    bibleContext?: ChatBibleContext;
    witLevel?: WitLevel;
    quotaContext?: QuotaContext;
  },
  callbacks: StreamCallbacks,
  signal?: AbortSignal
): Promise<void> {
  const functionUrl = `${supabaseUrl}/functions/v1/companion`;
  let attempt = 0;
  let lastError: Error | null = null;

  while (attempt <= MAX_RETRIES) {
    // Check if user cancelled before attempting
    if (signal?.aborted) {
      throw createNamedError('Request aborted', 'AbortError');
    }

    const timeoutMs = attempt === 0 ? INITIAL_TIMEOUT_MS : RETRY_TIMEOUT_MS;

    try {
      console.log(`[Stream] Attempt ${attempt + 1}/${MAX_RETRIES + 1}, timeout: ${timeoutMs}ms`);

      await new Promise<void>((resolve, reject) => {
        let fullContent = '';
        let timeoutId: ReturnType<typeof setTimeout> | null = null;
        let eventSource: EventSource | null = null;
        let resolved = false;

        const cleanup = () => {
          if (timeoutId) {
            clearTimeout(timeoutId);
            timeoutId = null;
          }
          if (eventSource) {
            eventSource.close();
            eventSource = null;
          }
        };

        const done = (error?: Error) => {
          if (resolved) return;
          resolved = true;
          cleanup();
          if (error) {
            reject(error);
          } else {
            resolve();
          }
        };

        // Set up timeout
        timeoutId = setTimeout(() => {
          done(createNamedError('Request timed out', 'TimeoutError'));
        }, timeoutMs);

        // Handle user abort
        if (signal) {
          signal.addEventListener('abort', () => {
            done(createNamedError('Request aborted', 'AbortError'));
          });
        }

        // Create SSE connection using react-native-sse
        const requestBody = JSON.stringify({
          user_id: params.userId,
          message: params.message,
          conversation_history: params.conversationHistory,
          context_mode: params.contextMode,
          bible_context: params.bibleContext,
          wit_level: params.witLevel || 'medium',
          stream: true,
          quota_context: params.quotaContext,
        });

        eventSource = new EventSource(functionUrl, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseAnonKey}`,
            'apikey': supabaseAnonKey,
          },
          method: 'POST',
          body: requestBody,
        });

        eventSource.addEventListener('open', () => {
          console.log('[Stream] SSE connection opened');
        });

        eventSource.addEventListener('message', (event) => {
          const eventData = event.data;
          if (!eventData) return;

          try {
            const data: StreamEvent = JSON.parse(eventData);

            switch (data.type) {
              case 'meta':
                callbacks.onMeta({
                  sources: data.sources || [],
                  suggestedActions: data.suggestedActions || [],
                  threadId: data.thread_id || '',
                  witLevel: data.wit_level || 'medium',
                });
                break;

              case 'content':
                if (data.content) {
                  fullContent += data.content;
                  callbacks.onContent(data.content, fullContent);
                }
                break;

              case 'done':
                callbacks.onDone(data.fullResponse || fullContent);
                done();
                break;

              case 'error':
                callbacks.onError(data.error || 'Unknown streaming error');
                done(new Error(data.error || 'Streaming error'));
                break;
            }
          } catch (parseError) {
            console.warn('[Stream] Failed to parse SSE event:', eventData, parseError);
          }
        });

        eventSource.addEventListener('error', (event) => {
          console.error('[Stream] SSE error:', event);

          // Extract error details from the event
          const errorEvent = event as { message?: string; xhrStatus?: number; type?: string };

          // Check for specific HTTP errors
          if (errorEvent.xhrStatus === 401 || errorEvent.xhrStatus === 403) {
            done(new Error('Authentication issue. Please restart the app.'));
            return;
          }
          if (errorEvent.xhrStatus === 429) {
            done(new Error('Too many requests. Please wait a moment before trying again.'));
            return;
          }
          if (errorEvent.xhrStatus && errorEvent.xhrStatus >= 500) {
            done(new Error(`Server error (${errorEvent.xhrStatus})`));
            return;
          }

          done(new Error(errorEvent.message || 'Connection error'));
        });
      });

      // Success - exit the retry loop
      return;

    } catch (error) {
      // User cancelled - don't retry
      if (error instanceof Error && error.name === 'AbortError') {
        throw error;
      }

      // Timeout or server error - retry if we have attempts left
      if (error instanceof Error && (error.name === 'TimeoutError' || error.message.includes('Server error'))) {
        lastError = error;
        if (attempt < MAX_RETRIES) {
          attempt++;
          console.log(`[Stream] Error, retrying (attempt ${attempt + 1})...`);
          callbacks.onRetry?.(attempt);
          await sleep(1000 * attempt);
          continue;
        }
        // Out of retries
        if (error.name === 'TimeoutError') {
          const timeoutError = new Error('COLD_START_TIMEOUT');
          timeoutError.name = 'TimeoutError';
          throw timeoutError;
        }
      }

      // Other errors - throw immediately
      throw error;
    }
  }

  // Should not reach here, but just in case
  throw lastError || new Error('Failed to connect after retries');
}
