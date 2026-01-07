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
}

/**
 * Stream a response from the companion Edge Function.
 * Uses Server-Sent Events (SSE) for real-time streaming.
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
  },
  callbacks: StreamCallbacks,
  signal?: AbortSignal
): Promise<void> {
  const functionUrl = `${supabaseUrl}/functions/v1/companion`;

  const response = await fetch(functionUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${supabaseAnonKey}`,
      'apikey': supabaseAnonKey,
    },
    body: JSON.stringify({
      user_id: params.userId,
      message: params.message,
      conversation_history: params.conversationHistory,
      context_mode: params.contextMode,
      bible_context: params.bibleContext,
      wit_level: params.witLevel || 'medium',
      stream: true, // Enable streaming mode
    }),
    signal,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HTTP ${response.status}: ${errorText}`);
  }

  if (!response.body) {
    throw new Error('Response body is null');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let fullContent = '';

  try {
    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        break;
      }

      buffer += decoder.decode(value, { stream: true });

      // Process complete SSE events from the buffer
      const lines = buffer.split('\n');
      buffer = lines.pop() || ''; // Keep incomplete line in buffer

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const jsonStr = line.slice(6).trim();
          if (!jsonStr) continue;

          try {
            const event: StreamEvent = JSON.parse(jsonStr);

            switch (event.type) {
              case 'meta':
                callbacks.onMeta({
                  sources: event.sources || [],
                  suggestedActions: event.suggestedActions || [],
                  threadId: event.thread_id || '',
                  witLevel: event.wit_level || 'medium',
                });
                break;

              case 'content':
                if (event.content) {
                  fullContent += event.content;
                  callbacks.onContent(event.content, fullContent);
                }
                break;

              case 'done':
                callbacks.onDone(event.fullResponse || fullContent);
                break;

              case 'error':
                callbacks.onError(event.error || 'Unknown streaming error');
                break;
            }
          } catch (parseError) {
            console.warn('[Stream] Failed to parse SSE event:', jsonStr, parseError);
          }
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}
