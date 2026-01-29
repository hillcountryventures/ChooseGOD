import { useState, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useStore } from '../store/useStore';

/**
 * Cross-reference result from Supabase
 */
export interface CrossReference {
  id: number;
  book: string;
  chapter: number;
  verse: number;
  text: string;
  translation: string;
  votes: number;
  direction: 'from' | 'to'; // 'to' = this verse points there, 'from' = that verse points here
}

/**
 * Cross-references grouped by book for better UX
 */
export interface GroupedCrossReferences {
  book: string;
  references: CrossReference[];
}

interface UseCrossReferencesReturn {
  /** Fetch cross-references for a verse by its database ID */
  fetchByVerseId: (verseId: number, limit?: number) => Promise<CrossReference[]>;
  /** Fetch cross-references by book/chapter/verse reference */
  fetchByReference: (
    book: string,
    chapter: number,
    verse: number,
    limit?: number
  ) => Promise<CrossReference[]>;
  /** The fetched cross-references */
  crossRefs: CrossReference[];
  /** Cross-references grouped by book */
  groupedRefs: GroupedCrossReferences[];
  /** Loading state */
  isLoading: boolean;
  /** Error message if any */
  error: string | null;
  /** Clear the current results */
  clear: () => void;
}

// Simple in-memory cache for cross-references
const crossRefCache = new Map<string, { data: CrossReference[]; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Hook to fetch and manage Bible cross-references
 * 
 * Cross-references show the interconnected nature of Scripture,
 * helping users discover related passages and deeper meaning.
 */
export function useCrossReferences(): UseCrossReferencesReturn {
  const [crossRefs, setCrossRefs] = useState<CrossReference[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const preferences = useStore((state) => state.preferences);
  const abortControllerRef = useRef<AbortController | null>(null);

  /**
   * Group cross-references by book for organized display
   */
  const groupByBook = useCallback((refs: CrossReference[]): GroupedCrossReferences[] => {
    const groups = new Map<string, CrossReference[]>();
    
    for (const ref of refs) {
      const existing = groups.get(ref.book) || [];
      existing.push(ref);
      groups.set(ref.book, existing);
    }
    
    // Convert to array and sort by first reference's votes (most relevant book first)
    return Array.from(groups.entries())
      .map(([book, references]) => ({
        book,
        references: references.sort((a, b) => b.votes - a.votes),
      }))
      .sort((a, b) => {
        const maxVotesA = Math.max(...a.references.map(r => r.votes));
        const maxVotesB = Math.max(...b.references.map(r => r.votes));
        return maxVotesB - maxVotesA;
      });
  }, []);

  /**
   * Fetch cross-references using the RPC function
   */
  const fetchByVerseId = useCallback(
    async (verseId: number, limit = 10): Promise<CrossReference[]> => {
      // Cancel any pending request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      const translation = preferences.preferredTranslation.toLowerCase();
      const cacheKey = `${verseId}-${translation}-${limit}`;

      // Check cache
      const cached = crossRefCache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        setCrossRefs(cached.data);
        return cached.data;
      }

      setIsLoading(true);
      setError(null);

      try {
        const { data, error: rpcError } = await supabase.rpc('get_cross_references', {
          p_verse_id: verseId,
          p_translation: translation,
          p_limit: limit,
          p_min_votes: 0,
        });

        if (rpcError) {
          throw new Error(rpcError.message);
        }

        const refs = (data || []) as CrossReference[];
        
        // Cache the result
        crossRefCache.set(cacheKey, { data: refs, timestamp: Date.now() });
        
        setCrossRefs(refs);
        return refs;
      } catch (err) {
        if ((err as Error).name === 'AbortError') {
          return [];
        }
        const message = err instanceof Error ? err.message : 'Failed to fetch cross-references';
        setError(message);
        console.error('[CrossReferences] Error:', err);
        return [];
      } finally {
        setIsLoading(false);
      }
    },
    [preferences.preferredTranslation]
  );

  /**
   * Fetch cross-references by book/chapter/verse
   * This is more convenient when you don't have the verse ID
   */
  const fetchByReference = useCallback(
    async (
      book: string,
      chapter: number,
      verse: number,
      limit = 10
    ): Promise<CrossReference[]> => {
      // Cancel any pending request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      const translation = preferences.preferredTranslation.toLowerCase();
      const cacheKey = `${book}-${chapter}-${verse}-${translation}-${limit}`;

      // Check cache
      const cached = crossRefCache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        setCrossRefs(cached.data);
        return cached.data;
      }

      setIsLoading(true);
      setError(null);

      try {
        const { data, error: rpcError } = await supabase.rpc('get_cross_references_by_ref', {
          p_book: book,
          p_chapter: chapter,
          p_verse: verse,
          p_translation: translation,
          p_limit: limit,
          p_min_votes: 0,
        });

        if (rpcError) {
          throw new Error(rpcError.message);
        }

        const refs = (data || []) as CrossReference[];
        
        // Cache the result
        crossRefCache.set(cacheKey, { data: refs, timestamp: Date.now() });
        
        setCrossRefs(refs);
        return refs;
      } catch (err) {
        if ((err as Error).name === 'AbortError') {
          return [];
        }
        const message = err instanceof Error ? err.message : 'Failed to fetch cross-references';
        setError(message);
        console.error('[CrossReferences] Error:', err);
        return [];
      } finally {
        setIsLoading(false);
      }
    },
    [preferences.preferredTranslation]
  );

  const clear = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setCrossRefs([]);
    setError(null);
  }, []);

  return {
    fetchByVerseId,
    fetchByReference,
    crossRefs,
    groupedRefs: groupByBook(crossRefs),
    isLoading,
    error,
    clear,
  };
}
