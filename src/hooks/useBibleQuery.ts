import { useState, useCallback } from 'react';
import { queryBible } from '../lib/supabase';
import { useStore } from '../store/useStore';
import { useAuthStore } from '../store/authStore';
import { RAGQueryResponse } from '../types';

interface UseBibleQueryReturn {
  ask: (query: string) => Promise<RAGQueryResponse | null>;
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
}

export function useBibleQuery(): UseBibleQueryReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { preferences, addMessage } = useStore();
  const user = useAuthStore((state) => state.user);

  const ask = useCallback(
    async (query: string): Promise<RAGQueryResponse | null> => {
      if (!query.trim()) {
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
        const response = await queryBible(
          query,
          preferences.preferredTranslation,
          user?.id
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
    [preferences.preferredTranslation, addMessage, user?.id]
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    ask,
    isLoading,
    error,
    clearError,
  };
}
