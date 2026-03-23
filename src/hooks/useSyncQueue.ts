/**
 * useSyncQueue
 *
 * Auto-processes the offline sync queue when connectivity is restored.
 * Exposes pending count for UI badges.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import { processQueue, getPendingCount } from '../services/syncQueue';

interface SyncQueueState {
  /** Number of actions waiting to sync */
  pendingCount: number;
  /** Whether the queue is currently being processed */
  isSyncing: boolean;
  /** Manually trigger queue processing */
  syncNow: () => Promise<void>;
  /** Refresh the pending count */
  refreshCount: () => Promise<void>;
}

export function useSyncQueue(): SyncQueueState {
  const [pendingCount, setPendingCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const wasOffline = useRef(false);

  const refreshCount = useCallback(async () => {
    const count = await getPendingCount();
    setPendingCount(count);
  }, []);

  const syncNow = useCallback(async () => {
    setIsSyncing(true);
    try {
      await processQueue();
    } finally {
      await refreshCount();
      setIsSyncing(false);
    }
  }, [refreshCount]);

  useEffect(() => {
    // Load initial count
    refreshCount();

    const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
      const isOnline = state.isConnected ?? false;

      if (isOnline && wasOffline.current) {
        // Just came back online — flush the queue
        syncNow();
      }

      wasOffline.current = !isOnline;
    });

    return unsubscribe;
  }, [refreshCount, syncNow]);

  return { pendingCount, isSyncing, syncNow, refreshCount };
}
