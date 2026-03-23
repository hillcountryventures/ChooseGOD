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
import { trackEvent } from '../services/analytics';
import { logger } from '../utils/logger';

// Verification status for entitlement integrity checking
type VerificationResult = 'VERIFIED' | 'NOT_REQUESTED' | 'FAILED' | 'VERIFIED_ON_DEVICE';

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

  // Entitlement verification status (for Trusted Entitlements)
  verificationStatus: VerificationResult;

  // Free tier usage tracking (queries today)
  freeQueriesUsedToday: number;
  lastQueryDate: string | null;

  // Paywall visibility (for custom paywall)
  isPaywallVisible: boolean;

  // Restore purchases state
  isRestoring: boolean;

  // Error state
  error: string | null;

  // Actions
  initialize: () => Promise<void>;
  loginUser: (userId: string) => Promise<void>;
  logoutUser: () => Promise<void>;
  refreshCustomerInfo: () => Promise<void>;
  restorePurchases: () => Promise<{ success: boolean; message: string }>;
  showPaywall: () => void;
  hidePaywall: () => void;
  incrementFreeQuery: () => void;
  canUseChat: () => boolean;
  setError: (error: string | null) => void;
  getSubscriptionDebugInfo: () => SubscriptionDebugInfo;
}

// Debug info for subscription diagnostics
export interface SubscriptionDebugInfo {
  isPremium: boolean;
  verificationStatus: VerificationResult;
  hasCustomerInfo: boolean;
  activeEntitlements: string[];
  originalAppUserId: string | null;
  managementUrl: string | null;
  latestExpirationDate: string | null;
  isConfigured: boolean;
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
 * Get today's date string for comparison (local timezone)
 * Uses local date to reset at midnight in user's timezone
 */
function getTodayString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
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
      verificationStatus: 'NOT_REQUESTED' as VerificationResult,
      freeQueriesUsedToday: 0,
      lastQueryDate: null,
      isPaywallVisible: false,
      isRestoring: false,
      error: null,

      /**
       * Initialize RevenueCat SDK
       * Call this once at app startup (in App.tsx)
       */
      initialize: async () => {
        // Prevent multiple initializations
        if (get().isInitialized) {
          logger.debug('[RevenueCat] Already initialized, skipping');
          return;
        }

        try {
          set({ isLoading: true, error: null });

          // Get platform-specific API key from environment
          const apiKey = Platform.select({
            ios: process.env.EXPO_PUBLIC_REVENUECAT_APPLE_KEY,
            android: process.env.EXPO_PUBLIC_REVENUECAT_GOOGLE_KEY,
          });

          if (!apiKey) {
            logger.warn('[RevenueCat] No API key found for platform:', Platform.OS);
            set({
              isLoading: false,
              isInitialized: true,
              error: 'RevenueCat API key not configured',
            });
            return;
          }

          // Check if RevenueCat is already configured
          const isConfigured = await Purchases.isConfigured();
          if (isConfigured) {
            logger.debug('[RevenueCat] SDK already configured, fetching customer info');
            set({ isInitialized: true });
            await get().refreshCustomerInfo();
            set({ isLoading: false });
            return;
          }

          // Enable verbose logging in development
          if (__DEV__) {
            Purchases.setLogLevel(LOG_LEVEL.VERBOSE);
          }

          // Configure RevenueCat
          Purchases.configure({ apiKey });

          logger.debug('[RevenueCat] SDK initialized successfully');

          // Set up customer info listener for real-time updates
          Purchases.addCustomerInfoUpdateListener((customerInfo) => {
            logger.debug('[RevenueCat] Customer info updated');

            // Check verification status for security
            let verificationStatus: VerificationResult = 'NOT_REQUESTED';
            if (customerInfo.entitlements.verification) {
              verificationStatus = customerInfo.entitlements.verification as VerificationResult;
              logger.debug('[RevenueCat] Listener verification status:', verificationStatus);

              // If verification failed, treat as non-premium
              if (verificationStatus === 'FAILED') {
                logger.warn('[RevenueCat] Listener: Verification FAILED - treating as non-premium');
                set({ customerInfo, isPremium: false, verificationStatus });
                return;
              }
            }

            const isPremium = checkPremiumStatus(customerInfo);
            set({ customerInfo, isPremium, verificationStatus });
          });

          // Fetch initial customer info
          await get().refreshCustomerInfo();

          set({ isInitialized: true, isLoading: false });
        } catch (error) {
          logger.error('[RevenueCat] Initialization error:', error);
          set({
            isLoading: false,
            isInitialized: true,
            error: error instanceof Error ? error.message : 'Failed to initialize RevenueCat',
          });
        }
      },

      /**
       * Refresh customer info from RevenueCat
       * Now includes entitlement verification status for security
       */
      refreshCustomerInfo: async () => {
        try {
          // Ensure RevenueCat is configured before fetching customer info
          const isConfigured = await Purchases.isConfigured();
          if (!isConfigured) {
            logger.debug('[RevenueCat] SDK not configured yet, skipping refresh');
            return;
          }

          const customerInfo = await Purchases.getCustomerInfo();
          const isPremium = checkPremiumStatus(customerInfo);

          // Check entitlement verification status (Trusted Entitlements)
          // This helps detect tampered responses
          let verificationStatus: VerificationResult = 'NOT_REQUESTED';
          if (customerInfo.entitlements.verification) {
            verificationStatus = customerInfo.entitlements.verification as VerificationResult;
            logger.debug('[RevenueCat] Verification status:', verificationStatus);

            // If verification failed, treat as non-premium for security
            if (verificationStatus === 'FAILED') {
              logger.warn('[RevenueCat] Entitlement verification FAILED - treating as non-premium');
              set({ customerInfo, isPremium: false, verificationStatus });
              return;
            }
          }

          logger.debug('[RevenueCat] Premium status:', isPremium);
          set({ customerInfo, isPremium, verificationStatus });
        } catch (error) {
          logger.error('[RevenueCat] Error fetching customer info:', error);
          set({
            error: error instanceof Error ? error.message : 'Failed to fetch subscription status',
          });
        }
      },

      /**
       * Login user to RevenueCat (link Supabase user ID)
       * Call this when user signs in or signs up
       */
      loginUser: async (userId: string) => {
        try {
          // Ensure RevenueCat is initialized before attempting login
          const isConfigured = await Purchases.isConfigured();
          if (!isConfigured) {
            logger.debug('[RevenueCat] SDK not configured yet, skipping login');
            return;
          }

          logger.debug('[RevenueCat] Logging in user:', userId);
          const { customerInfo } = await Purchases.logIn(userId);
          const isPremium = checkPremiumStatus(customerInfo);
          logger.debug('[RevenueCat] User logged in, premium:', isPremium);
          set({ customerInfo, isPremium });
        } catch (error) {
          logger.error('[RevenueCat] Error logging in user:', error);
          set({
            error: error instanceof Error ? error.message : 'Failed to login to RevenueCat',
          });
        }
      },

      /**
       * Logout user from RevenueCat
       * Call this when user signs out
       */
      logoutUser: async () => {
        try {
          // Ensure RevenueCat is initialized before attempting logout
          const isConfigured = await Purchases.isConfigured();
          if (!isConfigured) {
            logger.debug('[RevenueCat] SDK not configured yet, skipping logout');
            return;
          }

          logger.debug('[RevenueCat] Logging out user');
          const customerInfo = await Purchases.logOut();
          set({ customerInfo, isPremium: false });
        } catch (error) {
          logger.error('[RevenueCat] Error logging out user:', error);
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

      /**
       * Restore purchases from App Store / Google Play
       * Use when user reinstalls app or switches devices
       */
      restorePurchases: async () => {
        try {
          set({ isRestoring: true, error: null });

          const isConfigured = await Purchases.isConfigured();
          if (!isConfigured) {
            return { success: false, message: 'RevenueCat not configured' };
          }

          logger.debug('[RevenueCat] Restoring purchases...');
          const customerInfo = await Purchases.restorePurchases();
          const isPremium = checkPremiumStatus(customerInfo);

          // Check verification status if available
          let verificationStatus: VerificationResult = 'NOT_REQUESTED';
          if (customerInfo.entitlements.verification) {
            verificationStatus = customerInfo.entitlements.verification as VerificationResult;
          }

          set({ customerInfo, isPremium, verificationStatus });

          if (isPremium) {
            logger.debug('[RevenueCat] Purchases restored - Premium active');
            return { success: true, message: 'Your subscription has been restored!' };
          } else {
            logger.debug('[RevenueCat] No active subscription found');
            return { success: false, message: 'No active subscription found for your account.' };
          }
        } catch (error) {
          logger.error('[RevenueCat] Restore error:', error);
          const message = error instanceof Error ? error.message : 'Failed to restore purchases';
          set({ error: message });
          return { success: false, message };
        } finally {
          set({ isRestoring: false });
        }
      },

      /**
       * Get debug info for subscription diagnostics
       * Useful for troubleshooting subscription issues
       */
      getSubscriptionDebugInfo: (): SubscriptionDebugInfo => {
        const state = get();
        const customerInfo = state.customerInfo;

        return {
          isPremium: state.isPremium,
          verificationStatus: state.verificationStatus,
          hasCustomerInfo: !!customerInfo,
          activeEntitlements: customerInfo
            ? Object.keys(customerInfo.entitlements.active)
            : [],
          originalAppUserId: customerInfo?.originalAppUserId || null,
          managementUrl: customerInfo?.managementURL || null,
          latestExpirationDate: customerInfo?.latestExpirationDate || null,
          isConfigured: state.isInitialized,
        };
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
export const useIsRestoring = () => useSubscriptionStore((s) => s.isRestoring);
export const useVerificationStatus = () => useSubscriptionStore((s) => s.verificationStatus);
export const useFreeQueriesRemaining = () => {
  const freeQueriesUsedToday = useSubscriptionStore((s) => s.freeQueriesUsedToday);
  const lastQueryDate = useSubscriptionStore((s) => s.lastQueryDate);

  const today = getTodayString();
  if (lastQueryDate !== today) return FREE_CHAT_LIMIT;

  return Math.max(0, FREE_CHAT_LIMIT - freeQueriesUsedToday);
};

/**
 * Hook to check if entitlement is verified (Trusted Entitlements)
 * Returns true if verification passed or was not requested (backwards compatible)
 * Returns false only if verification explicitly failed
 */
export const useIsEntitlementVerified = () => {
  const verificationStatus = useSubscriptionStore((s) => s.verificationStatus);
  return verificationStatus !== 'FAILED';
};
