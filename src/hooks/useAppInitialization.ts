import { useEffect, useState, useRef, useCallback } from 'react';
import { NavigationContainerRef } from '@react-navigation/native';
import * as Linking from 'expo-linking';
import { useAuthStore } from '../store/authStore';
import { supabase } from '../lib/supabase';
import { useDevotionalStore } from '../store/devotionalStore';
import { useSubscriptionStore } from '../store/subscriptionStore';
import {
  setupNotificationListeners,
  handleNotificationResponse,
  scheduleDailyWisdomNotification,
  requestPermissions,
} from '../lib/notifications';
import { RootStackParamList } from '../types';

export function useAppInitialization() {
  const { user, initialized, initialize } = useAuthStore();
  const { onboardingCompleted, checkOnboardingStatus } = useDevotionalStore();
  const initializeSubscription = useSubscriptionStore((s) => s.initialize);
  const [checkingOnboarding, setCheckingOnboarding] = useState(true);
  const [splashComplete, setSplashComplete] = useState(false);
  const [initTimedOut, setInitTimedOut] = useState(false);

  const navigationRef = useRef<NavigationContainerRef<RootStackParamList>>(null);

  // Initialize RevenueCat first, then auth
  useEffect(() => {
    async function initializeApp() {
      try {
        await initializeSubscription();
        await initialize();
      } catch (error) {
        console.error('[App] Initialization error:', error);
      }
    }
    initializeApp();

    const timeoutId = setTimeout(() => {
      if (!initialized) {
        console.warn('[App] Initialization timeout reached, proceeding to app');
        setInitTimedOut(true);
      }
    }, 10000);

    return () => clearTimeout(timeoutId);
  }, []);

  // Notification listeners
  useEffect(() => {
    const cleanup = setupNotificationListeners(
      undefined,
      (response) => {
        const navData = handleNotificationResponse(response);
        if (navData && navigationRef.current) {
          setTimeout(() => {
            (navigationRef.current as any)?.navigate(navData.screen, navData.params);
          }, 100);
        }
      }
    );
    return cleanup;
  }, []);

  // Deep link handling for Supabase auth
  useEffect(() => {
    const handleDeepLink = async (event: { url: string }) => {
      const url = event.url;
      if (url.includes('access_token') || url.includes('refresh_token')) {
        const params = new URLSearchParams(url.split('#')[1] || url.split('?')[1]);
        const accessToken = params.get('access_token');
        const refreshToken = params.get('refresh_token');

        if (accessToken && refreshToken) {
          await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
        }
      }
    };

    Linking.getInitialURL().then((url) => {
      if (url) handleDeepLink({ url });
    });

    const subscription = Linking.addEventListener('url', handleDeepLink);
    return () => subscription.remove();
  }, []);

  // Daily wisdom notification
  useEffect(() => {
    async function setupDailyWisdom() {
      if (user && onboardingCompleted) {
        const hasPermission = await requestPermissions();
        if (hasPermission) {
          await scheduleDailyWisdomNotification({ hours: 8, minutes: 0 });
        }
      }
    }
    setupDailyWisdom();
  }, [user, onboardingCompleted]);

  // Onboarding status check
  useEffect(() => {
    async function checkOnboarding() {
      if (user) {
        setCheckingOnboarding(true);
        await checkOnboardingStatus(user.id);
        setCheckingOnboarding(false);
      } else {
        setCheckingOnboarding(false);
      }
    }
    checkOnboarding();
  }, [user]);

  const shouldShowSplash = !splashComplete && !initTimedOut && (!initialized || (user && checkingOnboarding));

  const handleSplashComplete = useCallback(() => {
    setSplashComplete(true);
  }, []);

  return {
    user,
    initialized,
    onboardingCompleted,
    checkingOnboarding,
    shouldShowSplash,
    handleSplashComplete,
    navigationRef,
  };
}
