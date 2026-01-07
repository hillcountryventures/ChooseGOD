/**
 * usePremiumStatus Hook
 *
 * Provides convenient access to subscription status and premium features.
 * Uses a custom PaywallModal for purchases.
 */

import { useCallback, useMemo } from 'react';
import {
  useSubscriptionStore,
  useIsPremium,
  useSubscriptionLoading,
  useSubscriptionError,
  useFreeQueriesRemaining,
  useIsPaywallVisible,
} from '../store/subscriptionStore';
import {
  FREE_CHAT_LIMIT,
  isPremiumChatMode,
  getAvailableChatModes,
  getAvailableVerseGradients,
  getJournalInsightFeatures,
} from '../constants/subscription';
import type { ChatMode } from '../types';

// =====================================================
// Types
// =====================================================

export interface PremiumStatus {
  // Core status
  isPremium: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;

  // Chat access
  canUseChat: boolean;
  freeQueriesRemaining: number;
  freeQueriesTotal: number;

  // Chat mode access
  canUseChatMode: (mode: ChatMode) => boolean;
  availableChatModes: ChatMode[];

  // Verse card gradients
  availableGradients: [string, string][];

  // Journal insights
  journalInsightFeatures: ReturnType<typeof getJournalInsightFeatures>;

  // Paywall visibility
  isPaywallVisible: boolean;

  // Actions
  showPaywall: () => void;
  hidePaywall: () => void;
  refresh: () => Promise<void>;
  clearError: () => void;
}

// =====================================================
// Main Hook: usePremiumStatus
// =====================================================

/**
 * Hook to check premium subscription status and present paywall.
 *
 * @example
 * ```tsx
 * function ChatScreen() {
 *   const { isPremium, canUseChat, presentPaywall } = usePremiumStatus();
 *
 *   const handleSend = async () => {
 *     if (!canUseChat) {
 *       await presentPaywall();
 *       return;
 *     }
 *     // Send message...
 *   };
 * }
 * ```
 */
export function usePremiumStatus(): PremiumStatus {
  const isPremium = useIsPremium();
  const isLoading = useSubscriptionLoading();
  const error = useSubscriptionError();
  const freeQueriesRemaining = useFreeQueriesRemaining();
  const isPaywallVisible = useIsPaywallVisible();

  const isInitialized = useSubscriptionStore((s) => s.isInitialized);
  const refreshCustomerInfo = useSubscriptionStore((s) => s.refreshCustomerInfo);
  const showPaywallFn = useSubscriptionStore((s) => s.showPaywall);
  const hidePaywallFn = useSubscriptionStore((s) => s.hidePaywall);
  const canUseChatFn = useSubscriptionStore((s) => s.canUseChat);
  const setError = useSubscriptionStore((s) => s.setError);

  const refresh = useCallback(async () => {
    await refreshCustomerInfo();
  }, [refreshCustomerInfo]);

  const clearError = useCallback(() => {
    setError(null);
  }, [setError]);

  const showPaywall = useCallback(() => {
    showPaywallFn();
  }, [showPaywallFn]);

  const hidePaywall = useCallback(() => {
    hidePaywallFn();
  }, [hidePaywallFn]);

  const canUseChat = useMemo(() => {
    return canUseChatFn();
  }, [canUseChatFn, isPremium, freeQueriesRemaining]);

  // Check if user can use a specific chat mode
  const canUseChatMode = useCallback((mode: ChatMode): boolean => {
    if (isPremium) return true;
    return !isPremiumChatMode(mode);
  }, [isPremium]);

  // Get available chat modes based on premium status
  const availableChatModes = useMemo(() => {
    return getAvailableChatModes(isPremium);
  }, [isPremium]);

  // Get available verse card gradients
  const availableGradients = useMemo(() => {
    return getAvailableVerseGradients(isPremium);
  }, [isPremium]);

  // Get journal insight features
  const journalInsightFeatures = useMemo(() => {
    return getJournalInsightFeatures(isPremium);
  }, [isPremium]);

  return {
    isPremium,
    isLoading,
    isInitialized,
    error,
    canUseChat,
    freeQueriesRemaining,
    freeQueriesTotal: FREE_CHAT_LIMIT,
    canUseChatMode,
    availableChatModes,
    availableGradients,
    journalInsightFeatures,
    isPaywallVisible,
    showPaywall,
    hidePaywall,
    refresh,
    clearError,
  };
}

// =====================================================
// Usage Tracking Hook
// =====================================================

/**
 * Hook to track chat usage for free tier users.
 * Call incrementUsage() after each successful chat query.
 */
export function useChatUsageTracking() {
  const incrementFreeQuery = useSubscriptionStore((s) => s.incrementFreeQuery);
  const isPremium = useIsPremium();

  const incrementUsage = useCallback(() => {
    // Only track for free users
    if (!isPremium) {
      incrementFreeQuery();
    }
  }, [isPremium, incrementFreeQuery]);

  return { incrementUsage };
}
