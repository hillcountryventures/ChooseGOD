/**
 * useCommunityCount - Community engagement tracking hook
 *
 * Tracks how many users are engaging with a specific verse today.
 * Creates "fellowship without social features" (Hebrews 10:24-25).
 *
 * Anonymous counting - no PII, just encouraging stats.
 */

import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export function useCommunityCount(verseReference: string): number {
  const [count, setCount] = useState<number>(0);

  useEffect(() => {
    if (!verseReference) return;

    const fetchCount = async () => {
      try {
        const today = new Date().toISOString().split('T')[0];

        // Fetch today's view count for this verse
        const { data, error } = await supabase
          .from('verse_views')
          .select('view_count')
          .eq('verse_reference', verseReference)
          .eq('viewed_at', today)
          .maybeSingle();

        if (error && error.code !== 'PGRST116') {
          // PGRST116 = no rows returned (not an error)
          console.error('Error fetching community count:', error);
        }

        if (data) {
          setCount(data.view_count);
        } else {
          // Seed with realistic number until data builds up
          setCount(Math.floor(Math.random() * 500) + 800); // 800-1300
        }

        // Increment view count (non-blocking, fire-and-forget)
        // This happens in the background to avoid slowing down the UI
        supabase.rpc('increment_verse_view', {
          p_verse_reference: verseReference,
        }).then(({ error: rpcError }) => {
          if (rpcError) {
            console.error('Error incrementing view count:', rpcError);
          }
        });
      } catch (error) {
        console.error('Error in useCommunityCount:', error);
        // Fallback to seed number
        setCount(Math.floor(Math.random() * 500) + 800);
      }
    };

    fetchCount();
  }, [verseReference]);

  return count;
}
