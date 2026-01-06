/**
 * Subscription Store - RevenueCat Integration
 *
 * Manages premium subscription state using RevenueCat.
 * Only the Chat feature is paywalled - all other features remain free forever.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Purchases, { CustomerInfo, LOG_LEVEL } from 'react-native-purchases';
import { Platform } from 'react-native';
import { REVENUECAT_ENTITLEMENTS, FREE_CHAT_LIMIT } from '../constants/subscription';

// =====================================================
// Types
// =====================================================

export interface SubscriptionState {
  // Premium status
  isPremium: boolean;
  isLoading: boolean;
  isInitialized: boolean;

  // Customer info from RevenueCat
  customerInfo: CustomerInfo | null;

  // Free tier usage tracking (queries today)
  freeQueriesUsedToday: number;
  lastQueryDate: string | null;

  // Paywall visibility (for custom paywall)
  isPaywallVisible: boolean;

  // Error state
  error: string | null;

  // Actions
  initialize: () => Promise<void>;
  refreshCustomerInfo: () => Promise<void>;
  showPaywall: () => void;
  hidePaywall: () => void;
  incrementFreeQuery: () => void;
  canUseChat: () => boolean;
  setError: (error: string | null) => void;
}

// =====================================================
// Helper Functions
// =====================================================

/**
 * Check if customer has ChooseGOD Pro entitlement
 */
function checkPremiumStatus(customerInfo: CustomerInfo | null): boolean {
  if (!customerInfo) return false;

  const entitlements = customerInfo.entitlements.active;
  return typeof entitlements[REVENUECAT_ENTITLEMENTS.premium_chat] !== 'undefined';
}

/**
 * Get today's date string for comparison
 */
function getTodayString(): string {
  return new Date().toISOString().split('T')[0];
}

// =====================================================
// Store
// =====================================================

export const useSubscriptionStore = create<SubscriptionState>()(
  persist(
    (set, get) => ({
      // Initial state
      isPremium: false,
      isLoading: true,
      isInitialized: false,
      customerInfo: null,
      freeQueriesUsedToday: 0,
      lastQueryDate: null,
      isPaywallVisible: false,
      error: null,

      /**
       * Initialize RevenueCat SDK
       * Call this once at app startup (in App.tsx)
       */
      initialize: async () => {
        try {
          set({ isLoading: true, error: null });

          // Get platform-specific API key from environment
          const apiKey = Platform.select({
            ios: process.env.EXPO_PUBLIC_REVENUECAT_APPLE_KEY,
            android: process.env.EXPO_PUBLIC_REVENUECAT_GOOGLE_KEY,
          });

          if (!apiKey) {
            console.warn('[RevenueCat] No API key found for platform:', Platform.OS);
            set({
              isLoading: false,
              isInitialized: true,
              error: 'RevenueCat API key not configured',
            });
            return;
          }

          // Enable verbose logging in development
          if (__DEV__) {
            Purchases.setLogLevel(LOG_LEVEL.VERBOSE);
          }

          // Configure RevenueCat
          Purchases.configure({ apiKey });

          console.log('[RevenueCat] SDK initialized successfully');

          // Set up customer info listener for real-time updates
          Purchases.addCustomerInfoUpdateListener((customerInfo) => {
            console.log('[RevenueCat] Customer info updated');
            const isPremium = checkPremiumStatus(customerInfo);
            set({ customerInfo, isPremium });
          });

          // Fetch initial customer info
          await get().refreshCustomerInfo();

          set({ isInitialized: true, isLoading: false });
        } catch (error) {
          console.error('[RevenueCat] Initialization error:', error);
          set({
            isLoading: false,
            isInitialized: true,
            error: error instanceof Error ? error.message : 'Failed to initialize RevenueCat',
          });
        }
      },

      /**
       * Refresh customer info from RevenueCat
       */
      refreshCustomerInfo: async () => {
        try {
          const customerInfo = await Purchases.getCustomerInfo();
          const isPremium = checkPremiumStatus(customerInfo);

          console.log('[RevenueCat] Premium status:', isPremium);
          set({ customerInfo, isPremium });
        } catch (error) {
          console.error('[RevenueCat] Error fetching customer info:', error);
          set({
            error: error instanceof Error ? error.message : 'Failed to fetch subscription status',
          });
        }
      },

      /**
       * Show the custom paywall modal
       */
      showPaywall: () => {
        set({ isPaywallVisible: true });
      },

      /**
       * Hide the custom paywall modal
       */
      hidePaywall: () => {
        set({ isPaywallVisible: false });
      },

      /**
       * Increment free query counter (for non-premium users)
       */
      incrementFreeQuery: () => {
        const today = getTodayString();
        const { lastQueryDate, freeQueriesUsedToday } = get();

        // Reset counter if it's a new day
        if (lastQueryDate !== today) {
          set({
            freeQueriesUsedToday: 1,
            lastQueryDate: today,
          });
        } else {
          set({
            freeQueriesUsedToday: freeQueriesUsedToday + 1,
          });
        }
      },

      /**
       * Check if user can use the chat feature
       * Premium users: unlimited
       * Free users: limited to FREE_CHAT_LIMIT per day
       */
      canUseChat: (): boolean => {
        const { isPremium, freeQueriesUsedToday, lastQueryDate } = get();

        // Premium users have unlimited access
        if (isPremium) return true;

        const today = getTodayString();

        // If it's a new day, they can use chat
        if (lastQueryDate !== today) return true;

        // Check if under the free limit
        return freeQueriesUsedToday < FREE_CHAT_LIMIT;
      },

      /**
       * Set error message
       */
      setError: (error: string | null) => {
        set({ error });
      },
    }),
    {
      name: 'subscription-storage',
      storage: createJSONStorage(() => AsyncStorage),
      // Only persist usage tracking, not sensitive subscription data
      partialize: (state) => ({
        freeQueriesUsedToday: state.freeQueriesUsedToday,
        lastQueryDate: state.lastQueryDate,
      }),
    }
  )
);

// =====================================================
// Selectors
// =====================================================

export const useIsPremium = () => useSubscriptionStore((s) => s.isPremium);
export const useSubscriptionLoading = () => useSubscriptionStore((s) => s.isLoading);
export const useSubscriptionError = () => useSubscriptionStore((s) => s.error);
export const useIsPaywallVisible = () => useSubscriptionStore((s) => s.isPaywallVisible);
export const useFreeQueriesRemaining = () => {
  const freeQueriesUsedToday = useSubscriptionStore((s) => s.freeQueriesUsedToday);
  const lastQueryDate = useSubscriptionStore((s) => s.lastQueryDate);

  const today = getTodayString();
  if (lastQueryDate !== today) return FREE_CHAT_LIMIT;

  return Math.max(0, FREE_CHAT_LIMIT - freeQueriesUsedToday);
};
