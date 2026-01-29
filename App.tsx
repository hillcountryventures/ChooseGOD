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

// Screens (root-level modals/stacks)
import ChatHubScreen from './src/screens/ChatHubScreen';
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

// Types
import { RootStackParamList } from './src/types';

const RootStack = createNativeStackNavigator<RootStackParamList>();

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
                  <RootStack.Screen name="ReflectionModal" component={ReflectionModal} options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
                  <RootStack.Screen name="JournalCompose" component={JournalComposeScreen} options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
                  <RootStack.Screen name="JournalDetail" component={JournalDetailScreen} options={{ animation: 'slide_from_right' }} />
                  <RootStack.Screen name="VersePicker" component={VersePickerScreen} options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
                  <RootStack.Screen name="Settings" component={SettingsScreen} options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
                  <RootStack.Screen name="Referral" component={ReferralScreen} options={{ presentation: 'card', animation: 'slide_from_right' }} />
                  <RootStack.Screen name="SubscriptionDebug" component={SubscriptionDebugScreen} options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
                  <RootStack.Screen name="ChatHub" component={ChatHubScreen} options={{ headerShown: false, animation: 'slide_from_bottom' }} />
                  <RootStack.Screen name="CameraScreen" component={CameraScreen} options={{ headerShown: false, animation: 'slide_from_bottom' }} />
                  <RootStack.Screen name="MemoryPractice" component={MemoryPracticeScreen} options={{ headerShown: false, animation: 'slide_from_bottom' }} />
                  <RootStack.Screen name="LectioDivina" component={LectioDivinaScreen} options={{ headerShown: false, animation: 'slide_from_bottom' }} />
                  <RootStack.Screen name="JourneyInsights" component={JourneyInsightsScreen} options={{ headerShown: false, animation: 'slide_from_right' }} />
                  <RootStack.Screen name="PrayerCircles" component={PrayerCirclesScreen} options={{ headerShown: false, animation: 'slide_from_right' }} />
                  <RootStack.Screen name="CircleDetail" component={CircleDetailScreen} options={{ headerShown: false, animation: 'slide_from_right' }} />
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
