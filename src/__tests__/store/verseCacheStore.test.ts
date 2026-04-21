/**
 * verseCacheStore tests — verify offline cache writes/reads.
 */

import { useVerseCacheStore, CachedVerse } from '../../store/verseCacheStore';

const john316: CachedVerse = {
  book: 'John',
  chapter: 3,
  verse: 16,
  text: 'For God so loved the world...',
  translation: 'KJV',
};

describe('verseCacheStore', () => {
  beforeEach(() => {
    useVerseCacheStore.getState().clearCache();
  });

  it('caches a verse under its book-chapter-verse key', () => {
    useVerseCacheStore.getState().cacheVerse(john316);
    const cached = useVerseCacheStore.getState().getCachedVerse('John-3-16');
    expect(cached).toEqual(john316);
  });

  it('returns null for uncached verses', () => {
    const cached = useVerseCacheStore.getState().getCachedVerse('Genesis-1-1');
    expect(cached).toBeNull();
  });

  it('overwrites on duplicate cache calls', () => {
    useVerseCacheStore.getState().cacheVerse(john316);
    useVerseCacheStore.getState().cacheVerse({ ...john316, text: 'Updated text' });
    const cached = useVerseCacheStore.getState().getCachedVerse('John-3-16');
    expect(cached?.text).toBe('Updated text');
  });

  it('clearCache wipes all entries', () => {
    useVerseCacheStore.getState().cacheVerse(john316);
    useVerseCacheStore.getState().clearCache();
    expect(useVerseCacheStore.getState().verses).toEqual({});
  });
});
