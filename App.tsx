import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { View, StyleSheet } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { initSentry, Sentry } from './src/utils/sentry';
import { initAnalytics } from './src/services/analytics';

// Initialize Sentry before anything else
initSentry();

// Initialize PostHog analytics
initAnalytics();

// Prevent the native splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

// Navigation
import { AuthNavigator, OnboardingNavigator, TabNavigator, DarkTheme, linking } from './src/navigation';

// Components
import { DivineEntranceSplash } from './src/components/DivineEntranceSplash';
import { ChatBottomSheet } from './src/components/chat/ChatBottomSheet';
import { PaywallModal } from './src/components/PaywallModal';

// Components
import { ScreenErrorBoundary } from './src/components/ScreenErrorBoundary';

// Screens (root-level modals/stacks)
import ChatHubScreen from './src/screens/ChatHubScreen';
import ConversationListScreen from './src/screens/chat/ConversationListScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import ReferralScreen from './src/screens/settings/ReferralScreen';
import SubscriptionDebugScreen from './src/screens/SubscriptionDebugScreen';
import ReflectionModal from './src/screens/ReflectionModal';
import CameraScreen from './src/screens/CameraScreen';
import MemoryPracticeScreen from './src/screens/MemoryPracticeScreen';
import LectioDivinaScreen from './src/screens/LectioDivinaScreen';
import JourneyInsightsScreen from './src/screens/JourneyInsightsScreen';
import { PrayerCirclesScreen, CircleDetailScreen } from './src/screens/circles';
import JournalComposeScreen from './src/screens/journal/JournalComposeScreen';
import JournalDetailScreen from './src/screens/journal/JournalDetailScreen';
import VersePickerScreen from './src/screens/journal/VersePickerScreen';

// Stores & hooks
import { useSubscriptionStore, useIsPaywallVisible } from './src/store/subscriptionStore';
import { useAppInitialization } from './src/hooks/useAppInitialization';
import { useSyncQueue } from './src/hooks/useSyncQueue';

// Types
import { RootStackParamList } from './src/types';

const RootStack = createNativeStackNavigator<RootStackParamList>();

/** Wrap a screen component in ScreenErrorBoundary */
function withErrorBoundary<P extends object>(Component: React.ComponentType<P>, name: string) {
  const Wrapped = (props: P) => (
    <ScreenErrorBoundary name={name}>
      <Component {...props} />
    </ScreenErrorBoundary>
  );
  Wrapped.displayName = `Safe${name}`;
  return Wrapped;
}

// Wrapped root screens
const SafeChatHubScreen = withErrorBoundary(ChatHubScreen, 'ChatHub');
const SafeConversationListScreen = withErrorBoundary(ConversationListScreen, 'ConversationList');
const SafeSettingsScreen = withErrorBoundary(SettingsScreen, 'Settings');
const SafeReferralScreen = withErrorBoundary(ReferralScreen, 'Referral');
const SafeSubscriptionDebugScreen = withErrorBoundary(SubscriptionDebugScreen, 'SubscriptionDebug');
const SafeReflectionModal = withErrorBoundary(ReflectionModal, 'ReflectionModal');
const SafeCameraScreen = withErrorBoundary(CameraScreen, 'CameraScreen');
const SafeMemoryPracticeScreen = withErrorBoundary(MemoryPracticeScreen, 'MemoryPractice');
const SafeLectioDivinaScreen = withErrorBoundary(LectioDivinaScreen, 'LectioDivina');
const SafeJourneyInsightsScreen = withErrorBoundary(JourneyInsightsScreen, 'JourneyInsights');
const SafePrayerCirclesScreen = withErrorBoundary(PrayerCirclesScreen, 'PrayerCircles');
const SafeCircleDetailScreen = withErrorBoundary(CircleDetailScreen, 'CircleDetail');
const SafeJournalComposeScreen = withErrorBoundary(JournalComposeScreen, 'JournalCompose');
const SafeJournalDetailScreen = withErrorBoundary(JournalDetailScreen, 'JournalDetail');
const SafeVersePickerScreen = withErrorBoundary(VersePickerScreen, 'VersePicker');

function App() {
  const {
    user,
    onboardingCompleted,
    shouldShowSplash,
    handleSplashComplete,
    checkingOnboarding,
    initialized,
    navigationRef,
  } = useAppInitialization();

  // Wire offline sync queue — auto-processes on reconnect
  useSyncQueue();

  const hidePaywall = useSubscriptionStore((s) => s.hidePaywall);
  const isPaywallVisible = useIsPaywallVisible();

  // Show Divine Entrance splash while initializing
  if (shouldShowSplash) {
    return (
      <SafeAreaProvider>
        <StatusBar style="light" />
        <DivineEntranceSplash
          isLoading={!initialized || Boolean(user && checkingOnboarding)}
          minimumDisplayTime={2000}
          maximumDisplayTime={8000}
          onAnimationComplete={handleSplashComplete}
        />
      </SafeAreaProvider>
    );
  }

  return (
    <GestureHandlerRootView style={styles.gestureRoot}>
      <SafeAreaProvider>
        <NavigationContainer ref={navigationRef} theme={DarkTheme} linking={linking}>
          <StatusBar style="light" />
          <View style={styles.gestureRoot}>
            <RootStack.Navigator screenOptions={{ headerShown: false }}>
              {!user ? (
                <RootStack.Screen name="Auth" component={AuthNavigator} />
              ) : !onboardingCompleted ? (
                <RootStack.Screen name="Onboarding" component={OnboardingNavigator} />
              ) : (
                <>
                  <RootStack.Screen name="Main" component={TabNavigator} />
                  <RootStack.Screen name="ReflectionModal" component={SafeReflectionModal} options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
                  <RootStack.Screen name="JournalCompose" component={SafeJournalComposeScreen} options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
                  <RootStack.Screen name="JournalDetail" component={SafeJournalDetailScreen} options={{ animation: 'slide_from_right' }} />
                  <RootStack.Screen name="VersePicker" component={SafeVersePickerScreen} options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
                  <RootStack.Screen name="Settings" component={SafeSettingsScreen} options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
                  <RootStack.Screen name="Referral" component={SafeReferralScreen} options={{ presentation: 'card', animation: 'slide_from_right' }} />
                  <RootStack.Screen name="SubscriptionDebug" component={SafeSubscriptionDebugScreen} options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
                  <RootStack.Screen name="ChatHub" component={SafeChatHubScreen} options={{ headerShown: false, animation: 'slide_from_bottom' }} />
                  <RootStack.Screen name="ConversationList" component={SafeConversationListScreen} options={{ headerShown: false, animation: 'slide_from_right' }} />
                  <RootStack.Screen name="CameraScreen" component={SafeCameraScreen} options={{ headerShown: false, animation: 'slide_from_bottom' }} />
                  <RootStack.Screen name="MemoryPractice" component={SafeMemoryPracticeScreen} options={{ headerShown: false, animation: 'slide_from_bottom' }} />
                  <RootStack.Screen name="LectioDivina" component={SafeLectioDivinaScreen} options={{ headerShown: false, animation: 'slide_from_bottom' }} />
                  <RootStack.Screen name="JourneyInsights" component={SafeJourneyInsightsScreen} options={{ headerShown: false, animation: 'slide_from_right' }} />
                  <RootStack.Screen name="PrayerCircles" component={SafePrayerCirclesScreen} options={{ headerShown: false, animation: 'slide_from_right' }} />
                  <RootStack.Screen name="CircleDetail" component={SafeCircleDetailScreen} options={{ headerShown: false, animation: 'slide_from_right' }} />
                </>
              )}
            </RootStack.Navigator>

            {user && onboardingCompleted && (
              <>
                <ChatBottomSheet />
                <PaywallModal visible={isPaywallVisible} onClose={hidePaywall} />
              </>
            )}
          </View>
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  gestureRoot: {
    flex: 1,
  },
});

export default Sentry.wrap(App);
