/**
 * useOfflineStatus
 *
 * Reactive network connectivity hook using @react-native-community/netinfo.
 */

import { useState, useEffect } from 'react';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';

interface OfflineStatus {
  isOnline: boolean;
  isOffline: boolean;
  /** True until first NetInfo check completes */
  isIndeterminate: boolean;
}

export function useOfflineStatus(): OfflineStatus {
  const [isOnline, setIsOnline] = useState<boolean | null>(null);

  useEffect(() => {
    // Get initial state
    NetInfo.fetch().then((state: NetInfoState) => {
      setIsOnline(state.isConnected ?? true);
    });

    // Subscribe to changes
    const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
      setIsOnline(state.isConnected ?? true);
    });

    return unsubscribe;
  }, []);

  return {
    isOnline: isOnline ?? true, // default true until known — prevents false offline UI flash
    isOffline: isOnline === false,
    isIndeterminate: isOnline === null,
  };
}
