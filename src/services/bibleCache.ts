/**
 * Bible Cache Service
 *
 * Offline-first caching layer using expo-file-system (v19+ API).
 * Caches Bible chapters as JSON files keyed by translation+book+chapter.
 */

import { File, Directory, Paths } from 'expo-file-system';

const CACHE_DIR_NAME = 'bible-cache';

// Lazy-init cache directory
let _cacheDir: Directory | null = null;
function getCacheDir(): Directory {
  if (!_cacheDir) {
    _cacheDir = new Directory(Paths.document, CACHE_DIR_NAME);
    if (!_cacheDir.exists) {
      _cacheDir.create();
    }
  }
  return _cacheDir;
}

// In-memory index for fast lookups
let cacheIndex: Set<string> | null = null;

function getCacheKey(translation: string, book: string, chapter: number): string {
  const safe = (s: string) => s.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
  return `${safe(translation)}_${safe(book)}_${chapter}`;
}

function getFile(key: string): File {
  return new File(getCacheDir(), `${key}.json`);
}

function ensureIndex(): Set<string> {
  if (cacheIndex) return cacheIndex;
  const dir = getCacheDir();
  try {
    const entries = dir.list();
    cacheIndex = new Set(
      entries
        .filter((e): e is File => e instanceof File && e.name.endsWith('.json'))
        .map((f) => f.name.replace('.json', ''))
    );
  } catch {
    cacheIndex = new Set();
  }
  return cacheIndex;
}

/**
 * Check if a chapter is cached.
 */
export function isChapterCached(
  translation: string,
  book: string,
  chapter: number
): boolean {
  const index = ensureIndex();
  return index.has(getCacheKey(translation, book, chapter));
}

/**
 * Get cached chapter data, or null if not cached.
 */
export async function getCachedChapter<T = unknown>(
  translation: string,
  book: string,
  chapter: number
): Promise<T | null> {
  const key = getCacheKey(translation, book, chapter);
  const index = ensureIndex();
  if (!index.has(key)) return null;

  try {
    const file = getFile(key);
    if (!file.exists) {
      index.delete(key);
      return null;
    }
    const raw = await file.text();
    return JSON.parse(raw) as T;
  } catch (err) {
    console.warn('[BibleCache] Read error for', key, err);
    const index2 = ensureIndex();
    index2.delete(key);
    return null;
  }
}

/**
 * Cache a chapter's verse data.
 */
export async function cacheChapter(
  translation: string,
  book: string,
  chapter: number,
  verses: unknown
): Promise<void> {
  const key = getCacheKey(translation, book, chapter);
  try {
    const file = getFile(key);
    file.write(JSON.stringify(verses));
    const index = ensureIndex();
    index.add(key);
  } catch (err) {
    console.warn('[BibleCache] Write error for', key, err);
  }
}

/**
 * Get total cache size in bytes.
 */
export async function getCacheSize(): Promise<number> {
  try {
    const dir = getCacheDir();
    if (!dir.exists) return 0;
    const entries = dir.list();
    let total = 0;
    for (const entry of entries) {
      if (entry instanceof File && entry.exists) {
        total += entry.size ?? 0;
      }
    }
    return total;
  } catch {
    return 0;
  }
}

/**
 * Clear all cached Bible data.
 */
export async function clearCache(): Promise<void> {
  try {
    const dir = getCacheDir();
    if (dir.exists) {
      dir.delete();
    }
    _cacheDir = null;
    cacheIndex = null;
  } catch (err) {
    console.warn('[BibleCache] Clear error', err);
  }
}
