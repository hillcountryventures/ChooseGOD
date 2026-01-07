/**
 * Chat Analytics Hook
 * Tracks chat queries and responses for improvement and analytics
 */

import { useMutation } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

interface ChatAnalyticsData {
  query: string;
  response: string;
  sources?: Array<{ book: string; chapter: number; verse: number }>;
  witLevel?: 'low' | 'medium' | 'high';
  responseTimeMs?: number;
  threadId?: string;
}

export function useChatAnalytics() {
  const { mutate: logQuery, isPending: isLogging } = useMutation({
    mutationFn: async (data: ChatAnalyticsData) => {
      // Only log if user is authenticated
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { error } = await supabase.from('chat_logs').insert({
        user_id: user.id,
        query: data.query,
        response: data.response.substring(0, 2000), // Truncate long responses
        sources: data.sources || [],
        wit_level: data.witLevel,
        response_time_ms: data.responseTimeMs,
        thread_id: data.threadId,
        created_at: new Date().toISOString(),
      });

      if (error) {
        // Silently fail - analytics should not disrupt UX
        console.warn('[ChatAnalytics] Failed to log query:', error.message);
      }

      return null;
    },
    // Analytics mutations should never retry or show errors
    retry: false,
  });

  const logChatInteraction = (data: ChatAnalyticsData) => {
    // Fire and forget - don't await
    logQuery(data);
  };

  return {
    logChatInteraction,
    isLogging,
  };
}
