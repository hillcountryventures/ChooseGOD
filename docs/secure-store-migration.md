# Sensitive Data → SecureStore Migration Guide

## Current State

The Zustand store persists to **AsyncStorage** (unencrypted) via `choosegod-storage` key.
Auth tokens already use **SecureStore** (via the `ExpoSecureStoreAdapter` in `supabase.ts`). ✅

## Data Currently in AsyncStorage (via Zustand `partialize`)

| Field | Sensitive? | Action |
|-------|-----------|--------|
| `preferences` | ❌ No | Keep in AsyncStorage |
| `dailyVerse` | ❌ No | Keep in AsyncStorage |
| `savedDrafts` | ⚠️ Medium — journal content | Consider SecureStore |
| `currentDraft` | ⚠️ Medium — journal content | Consider SecureStore |
| `recentMoments` | ⚠️ Medium — spiritual moments | Consider SecureStore |
| `activePrayers` | 🔴 **Yes** — prayer content is deeply personal | **Move to SecureStore** |
| `offlineVerses` | ❌ No — public Bible text | Keep in AsyncStorage |

## Other AsyncStorage Keys (outside Zustand)

| Key | Sensitive? | Action |
|-----|-----------|--------|
| Theme preference | ❌ No | Keep |
| Consent flags | ❌ No | Keep |
| Age gate state | ❌ No | Keep |
| Streak milestones | ❌ No | Keep |

## Recommended Migration

### Priority 1: `activePrayers`
Prayer requests contain deeply personal spiritual content. Move to SecureStore.

**Implementation approach:**
1. Create a separate Zustand store `usePrayerStore` with `expo-secure-store` as storage backend
2. On app load, migrate any prayers from the old AsyncStorage key to SecureStore
3. Clear prayers from the main AsyncStorage store after migration

### Priority 2: `savedDrafts` / `currentDraft` / `recentMoments`
Journal entries and spiritual moments may contain personal reflections.

**Implementation approach:**
Same pattern — separate store with SecureStore backend, one-time migration.

### ⚠️ SecureStore Limitations
- **2048-byte value limit** on some platforms
- For large data (many prayers/drafts), consider **encrypting** the JSON blob with a key stored in SecureStore, while keeping the encrypted blob in AsyncStorage
- This hybrid approach handles both security and size constraints

### No Action Needed
- **Supabase auth tokens** — Already in SecureStore ✅
- **API keys** — Now encapsulated via `getSupabaseConfig()`, read from env at runtime ✅
