/**
 * Offline Sync Queue
 *
 * Queues write actions (bookmarks, highlights, notes, reading progress)
 * to AsyncStorage when offline. On reconnect, replays them to Supabase in order.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { supabase } from '../lib/supabase';
import { logger } from '../utils/logger';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type SyncActionType =
  | 'bookmark_add'
  | 'bookmark_remove'
  | 'highlight_add'
  | 'highlight_remove'
  | 'note_add'
  | 'note_update'
  | 'note_delete'
  | 'reading_progress';

export interface SyncAction {
  id: string;
  type: SyncActionType;
  payload: Record<string, unknown>;
  timestamp: number;
  retryCount: number;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const QUEUE_KEY = '@choosegod_sync_queue';
const MAX_RETRIES = 3;

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

async function readQueue(): Promise<SyncAction[]> {
  try {
    const raw = await AsyncStorage.getItem(QUEUE_KEY);
    return raw ? (JSON.parse(raw) as SyncAction[]) : [];
  } catch {
    logger.warn('[SyncQueue] Failed to read queue');
    return [];
  }
}

async function writeQueue(queue: SyncAction[]): Promise<void> {
  try {
    await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
  } catch {
    logger.warn('[SyncQueue] Failed to write queue');
  }
}

/**
 * Execute a single queued action against Supabase.
 * Throws on failure so the caller can handle retries.
 */
async function executeAction(action: SyncAction): Promise<void> {
  const { type, payload } = action;

  switch (type) {
    case 'bookmark_add': {
      const { error } = await supabase.from('bookmarks').upsert(payload);
      if (error) throw error;
      break;
    }
    case 'bookmark_remove': {
      const { error } = await supabase
        .from('bookmarks')
        .delete()
        .match({ id: payload.id as string });
      if (error) throw error;
      break;
    }
    case 'highlight_add': {
      const { error } = await supabase.from('highlights').upsert(payload);
      if (error) throw error;
      break;
    }
    case 'highlight_remove': {
      const { error } = await supabase
        .from('highlights')
        .delete()
        .match({ id: payload.id as string });
      if (error) throw error;
      break;
    }
    case 'note_add': {
      const { error } = await supabase.from('notes').upsert(payload);
      if (error) throw error;
      break;
    }
    case 'note_update': {
      const { id, ...rest } = payload;
      const { error } = await supabase
        .from('notes')
        .update(rest)
        .eq('id', id as string);
      if (error) throw error;
      break;
    }
    case 'note_delete': {
      const { error } = await supabase
        .from('notes')
        .delete()
        .match({ id: payload.id as string });
      if (error) throw error;
      break;
    }
    case 'reading_progress': {
      const { error } = await supabase.from('reading_progress').upsert(payload);
      if (error) throw error;
      break;
    }
    default:
      logger.warn('[SyncQueue] Unknown action type:', type);
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Add an action to the offline queue.
 * If online, attempts immediate execution; on failure queues it.
 */
export async function queueAction(
  type: SyncActionType,
  payload: Record<string, unknown>,
): Promise<void> {
  const action: SyncAction = {
    id: `${type}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    type,
    payload,
    timestamp: Date.now(),
    retryCount: 0,
  };

  const state = await NetInfo.fetch();
  if (state.isConnected) {
    try {
      await executeAction(action);
      return; // success — no need to queue
    } catch (err) {
      logger.warn('[SyncQueue] Immediate exec failed, queuing', err);
    }
  }

  // Queue the action
  const queue = await readQueue();
  queue.push(action);
  await writeQueue(queue);
  logger.debug(`[SyncQueue] Queued ${type} (${queue.length} pending)`);
}

/**
 * Process all queued actions in order.
 * Successful items are removed; failed items get retryCount incremented.
 * Items exceeding MAX_RETRIES are dropped with a warning.
 */
export async function processQueue(): Promise<number> {
  const queue = await readQueue();
  if (queue.length === 0) return 0;

  logger.debug(`[SyncQueue] Processing ${queue.length} queued actions…`);

  const remaining: SyncAction[] = [];
  let processed = 0;

  for (const action of queue) {
    try {
      await executeAction(action);
      processed++;
    } catch (err) {
      action.retryCount++;
      if (action.retryCount < MAX_RETRIES) {
        remaining.push(action);
        logger.warn(
          `[SyncQueue] Retry ${action.retryCount}/${MAX_RETRIES} for ${action.type}`,
          err,
        );
      } else {
        logger.error(
          `[SyncQueue] Dropping ${action.type} after ${MAX_RETRIES} retries`,
          err,
        );
      }
    }
  }

  await writeQueue(remaining);
  logger.debug(`[SyncQueue] Processed ${processed}, ${remaining.length} remaining`);
  return processed;
}

/**
 * Get the number of pending (un-synced) actions.
 */
export async function getPendingCount(): Promise<number> {
  const queue = await readQueue();
  return queue.length;
}
