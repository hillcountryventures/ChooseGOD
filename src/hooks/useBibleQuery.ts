import { useState, useCallback } from 'react';
import { queryBible } from '../lib/supabase';
import { useStore } from '../store/useStore';
import { useAuthStore } from '../store/authStore';
import { useOfflineStatus } from './useOfflineStatus';
import { RAGQueryResponse } from '../types';
import { getCachedChapter, cacheChapter } from '../services/bibleCache';
import { fetchWithRetry } from '../utils/fetchWithRetry';
import { sanitizeSearchQuery } from '../utils/inputSanitizer';

interface UseBibleQueryReturn {
  ask: (query: string) => Promise<RAGQueryResponse | null>;
  isLoading: boolean;
  error: string | null;
  isOffline: boolean;
  clearError: () => void;
}

/** Cache key prefix for RAG query responses */
const RAG_CACHE_TRANSLATION = '__rag__';

/** djb2 hash — collision-resistant numeric key from string */
function djb2Hash(str: string): number {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash + str.charCodeAt(i)) | 0; // force 32-bit int
  }
  return Math.abs(hash);
}

export function useBibleQuery(): UseBibleQueryReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { preferences, addMessage } = useStore();
  const user = useAuthStore((state) => state.user);
  const { isOffline } = useOfflineStatus();

  const ask = useCallback(
    async (rawQuery: string): Promise<RAGQueryResponse | null> => {
      const query = sanitizeSearchQuery(rawQuery);
      if (!query) {
        setError('Please enter a question');
        return null;
      }

      setIsLoading(true);
      setError(null);

      // Add user message to chat
      addMessage({
        id: Date.now().toString(),
        role: 'user',
        content: query,
        timestamp: new Date(),
      });

      try {
        // --- Offline-first: check cache ---
        const cacheKey = query.trim().toLowerCase().replace(/\s+/g, '_').slice(0, 120);
        const cached = await getCachedChapter<RAGQueryResponse>(
          RAG_CACHE_TRANSLATION,
          preferences.preferredTranslation,
          // Abuse chapter param as a hash — use charCode sum for numeric key
          djb2Hash(cacheKey)
        );

        if (cached) {
          // Serve from cache (works offline and online for repeat queries)
          addMessage({
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: cached.response + (isOffline ? '\n\n_📴 Offline mode — showing cached response_' : ''),
            sources: cached.sources,
            timestamp: new Date(),
          });
          return cached;
        }

        // --- If offline and no cache, bail gracefully ---
        if (isOffline) {
          const offlineMsg = 'You\'re offline and this question hasn\'t been cached yet. Please try again when connected, or ask a question you\'ve asked before.';
          setError(offlineMsg);
          addMessage({
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: '📴 ' + offlineMsg,
            timestamp: new Date(),
          });
          return null;
        }

        // --- Network fetch with retry ---
        const response = await fetchWithRetry(
          () => queryBible(query, preferences.preferredTranslation, user?.id),
          { maxAttempts: 3, timeoutMs: 20000 }
        );

        // Cache the successful response
        await cacheChapter(
          RAG_CACHE_TRANSLATION,
          preferences.preferredTranslation,
          djb2Hash(cacheKey),
          response
        );

        // Add assistant response to chat
        addMessage({
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: response.response,
          sources: response.sources,
          timestamp: new Date(),
        });

        return response;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to get response';
        setError(errorMessage);

        // Add error message to chat
        addMessage({
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: 'I apologize, but I encountered an error while searching the scriptures. Please try again.',
          timestamp: new Date(),
        });

        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [preferences.preferredTranslation, addMessage, user?.id, isOffline]
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    ask,
    isLoading,
    error,
    isOffline,
    clearError,
  };
}
