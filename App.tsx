import React, { useEffect, useState, useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer, DefaultTheme, NavigationContainerRef } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { View, StyleSheet, ActivityIndicator, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Chat Components
import { ChatBottomSheet } from './src/components/chat/ChatBottomSheet';
import { PaywallModal } from './src/components/PaywallModal';
import ChatHubScreen from './src/screens/ChatHubScreen';

// Auth Store
import { useAuthStore } from './src/store/authStore';
import { useDevotionalStore } from './src/store/devotionalStore';
import { useSubscriptionStore, useIsPaywallVisible } from './src/store/subscriptionStore';

// Main Screens
import HomeScreen from './src/screens/HomeScreen';
import BibleScreen from './src/screens/BibleScreen';
import JourneyScreen from './src/screens/JourneyScreen';
// ChatScreen is now used in ChatBottomSheet, not as a tab
import SettingsScreen from './src/screens/SettingsScreen';
import ReflectionModal from './src/screens/ReflectionModal';
import PrayersScreen from './src/screens/PrayersScreen';

// Journal Screens
import JournalComposeScreen from './src/screens/journal/JournalComposeScreen';
import JournalDetailScreen from './src/screens/journal/JournalDetailScreen';
import VersePickerScreen from './src/screens/journal/VersePickerScreen';

// Auth Screens
import LoginScreen from './src/screens/auth/LoginScreen';
import SignUpScreen from './src/screens/auth/SignUpScreen';
import ForgotPasswordScreen from './src/screens/auth/ForgotPasswordScreen';

// Onboarding Screens
import WelcomeScreen from './src/screens/onboarding/WelcomeScreen';
import OnboardingCarousel from './src/screens/onboarding/OnboardingCarousel';
import PersonalizationQuiz from './src/screens/onboarding/PersonalizationQuiz';
import RecommendationsScreen from './src/screens/onboarding/RecommendationsScreen';
import NotificationSetupScreen from './src/screens/onboarding/NotificationSetupScreen';
import EnrollmentConfirmScreen from './src/screens/onboarding/EnrollmentConfirmScreen';

// Devotional Screens
import DevotionalHubScreen from './src/screens/devotional/DevotionalHubScreen';
import SeriesLibraryScreen from './src/screens/devotional/SeriesLibraryScreen';
import SeriesDetailScreen from './src/screens/devotional/SeriesDetailScreen';
import DailyDevotionalScreen from './src/screens/devotional/DailyDevotionalScreen';
import DevotionalCompleteScreen from './src/screens/devotional/DevotionalCompleteScreen';

// Types
import {
  BottomTabParamList,
  RootStackParamList,
  AuthStackParamList,
  OnboardingStackParamList,
  DevotionalStackParamList,
} from './src/types';

// Notifications
import {
  setupNotificationListeners,
  handleNotificationResponse,
  scheduleDailyWisdomNotification,
  requestPermissions,
} from './src/lib/notifications';

// =====================================================
// THEME & COLORS
// =====================================================

const colors = {
  background: '#0F0F0F',
  card: '#1A1A1A',
  text: '#ffffff',
  border: '#333333',
  primary: '#6366F1',
  accent: '#F59E0B',
  textMuted: '#737373',
};

const DarkTheme = {
  ...DefaultTheme,
  dark: true,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.primary,
    background: colors.background,
    card: colors.card,
    text: colors.text,
    border: colors.border,
    notification: colors.accent,
  },
};

// =====================================================
// NAVIGATORS
// =====================================================

const RootStack = createNativeStackNavigator<RootStackParamList>();
const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const OnboardingStack = createNativeStackNavigator<OnboardingStackParamList>();
const DevotionalStack = createNativeStackNavigator<DevotionalStackParamList>();
const Tab = createBottomTabNavigator<BottomTabParamList>();

// =====================================================
// TAB ICONS
// =====================================================

type IconName = keyof typeof Ionicons.glyphMap;

const TAB_ICONS: Record<string, { active: IconName; inactive: IconName }> = {
  Home: { active: 'home', inactive: 'home-outline' },
  Devotionals: { active: 'heart', inactive: 'heart-outline' },
  Bible: { active: 'book', inactive: 'book-outline' },
  Journey: { active: 'trending-up', inactive: 'trending-up-outline' },
  Prayers: { active: 'hand-left', inactive: 'hand-left-outline' },
};

// =====================================================
// AUTH NAVIGATOR
// =====================================================

function AuthNavigator() {
  return (
    <AuthStack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="SignUp" component={SignUpScreen} />
      <AuthStack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    </AuthStack.Navigator>
  );
}

// =====================================================
// ONBOARDING NAVIGATOR
// =====================================================

function OnboardingNavigator() {
  return (
    <OnboardingStack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <OnboardingStack.Screen name="Welcome" component={WelcomeScreen} />
      <OnboardingStack.Screen name="Carousel" component={OnboardingCarousel} />
      <OnboardingStack.Screen name="Quiz" component={PersonalizationQuiz} />
      <OnboardingStack.Screen name="Recommendations" component={RecommendationsScreen} />
      <OnboardingStack.Screen name="NotificationSetup" component={NotificationSetupScreen} />
      <OnboardingStack.Screen name="EnrollConfirm" component={EnrollmentConfirmScreen} />
    </OnboardingStack.Navigator>
  );
}

// =====================================================
// DEVOTIONAL NAVIGATOR (nested in Devotionals tab)
// =====================================================

function DevotionalNavigator() {
  return (
    <DevotionalStack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <DevotionalStack.Screen name="DevotionalHub" component={DevotionalHubScreen} />
      <DevotionalStack.Screen name="SeriesLibrary" component={SeriesLibraryScreen} />
      <DevotionalStack.Screen name="SeriesDetail" component={SeriesDetailScreen} />
      <DevotionalStack.Screen name="DailyDevotional" component={DailyDevotionalScreen} />
      <DevotionalStack.Screen name="DevotionalComplete" component={DevotionalCompleteScreen} />
    </DevotionalStack.Navigator>
  );
}

// =====================================================
// TAB NAVIGATOR
// =====================================================

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          paddingBottom: 8,
          paddingTop: 8,
          height: 65,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '500',
        },
        tabBarIcon: ({ focused, color }) => {
          const icons = TAB_ICONS[route.name];
          if (!icons) return null;
          const iconName = focused ? icons.active : icons.inactive;

          // Special styling for center Bible tab (purple highlight)
          if (route.name === 'Bible') {
            return (
              <View style={styles.centerTab}>
                <Ionicons name={iconName} size={28} color="#fff" />
              </View>
            );
          }

          return <Ionicons name={iconName} size={22} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen
        name="Devotionals"
        component={DevotionalNavigator}
        options={{
          tabBarLabel: 'Devotionals',
        }}
      />
      <Tab.Screen
        name="Bible"
        component={BibleScreen}
        options={{
          tabBarLabel: '',
        }}
      />
      <Tab.Screen name="Journey" component={JourneyScreen} />
      <Tab.Screen name="Prayers" component={PrayersScreen} />
    </Tab.Navigator>
  );
}

// =====================================================
// LOADING SCREEN
// =====================================================

function LoadingScreen() {
  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={styles.loadingText}>Loading...</Text>
    </View>
  );
}

// =====================================================
// MAIN APP
// =====================================================

export default function App() {
  const { user, initialized, initialize } = useAuthStore();
  const { onboardingCompleted, checkOnboardingStatus } = useDevotionalStore();
  const initializeSubscription = useSubscriptionStore((s) => s.initialize);
  const hidePaywall = useSubscriptionStore((s) => s.hidePaywall);
  const isPaywallVisible = useIsPaywallVisible();
  const [checkingOnboarding, setCheckingOnboarding] = useState(true);

  // Navigation ref for deep-linking from notifications
  const navigationRef = useRef<NavigationContainerRef<RootStackParamList>>(null);

  // Initialize RevenueCat first, then auth (auth may call RevenueCat methods)
  useEffect(() => {
    async function initializeApp() {
      try {
        // Initialize RevenueCat first so it's ready when auth tries to call loginUser
        await initializeSubscription();
        // Then initialize auth (which may call subscriptionStore.loginUser)
        await initialize();
      } catch (error) {
        console.error('[App] Initialization error:', error);
      }
    }
    initializeApp();
  }, []);

  // Set up notification listeners for deep-linking
  useEffect(() => {
    // Handle notification taps (deep-link to ChatHub, etc.)
    const cleanup = setupNotificationListeners(
      undefined, // onNotificationReceived - handled by default
      (response) => {
        const navData = handleNotificationResponse(response);
        if (navData && navigationRef.current) {
          // Navigate to the specified screen with params
          // Small delay to ensure navigation is ready
          setTimeout(() => {
            // Use type assertion for dynamic navigation from notifications
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (navigationRef.current as any)?.navigate(navData.screen, navData.params);
          }, 100);
        }
      }
    );

    return cleanup;
  }, []);

  // Schedule daily wisdom notification when user is authenticated
  useEffect(() => {
    async function setupDailyWisdom() {
      if (user && onboardingCompleted) {
        const hasPermission = await requestPermissions();
        if (hasPermission) {
          // Schedule for 8:00 AM local time
          await scheduleDailyWisdomNotification({ hours: 8, minutes: 0 });
        }
      }
    }
    setupDailyWisdom();
  }, [user, onboardingCompleted]);

  // Check onboarding status when user changes
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

  // Show loading while initializing
  if (!initialized || (user && checkingOnboarding)) {
    return (
      <SafeAreaProvider>
        <View style={styles.loadingContainer}>
          <StatusBar style="light" />
          <LoadingScreen />
        </View>
      </SafeAreaProvider>
    );
  }

  return (
    <GestureHandlerRootView style={styles.gestureRoot}>
      <SafeAreaProvider>
        <NavigationContainer ref={navigationRef} theme={DarkTheme}>
          <StatusBar style="light" />
          <View style={styles.gestureRoot}>
            <RootStack.Navigator screenOptions={{ headerShown: false }}>
              {!user ? (
                // Not authenticated - show auth flow
                <RootStack.Screen name="Auth" component={AuthNavigator} />
              ) : !onboardingCompleted ? (
                // Authenticated but hasn't completed onboarding
                <RootStack.Screen name="Onboarding" component={OnboardingNavigator} />
              ) : (
                // Fully authenticated and onboarded
                <>
                  <RootStack.Screen name="Main" component={TabNavigator} />
                  <RootStack.Screen
                    name="ReflectionModal"
                    component={ReflectionModal}
                    options={{
                      presentation: 'modal',
                      animation: 'slide_from_bottom',
                    }}
                  />
                  <RootStack.Screen
                    name="JournalCompose"
                    component={JournalComposeScreen}
                    options={{
                      presentation: 'modal',
                      animation: 'slide_from_bottom',
                    }}
                  />
                  <RootStack.Screen
                    name="JournalDetail"
                    component={JournalDetailScreen}
                    options={{
                      animation: 'slide_from_right',
                    }}
                  />
                  <RootStack.Screen
                    name="VersePicker"
                    component={VersePickerScreen}
                    options={{
                      presentation: 'modal',
                      animation: 'slide_from_bottom',
                    }}
                  />
                  <RootStack.Screen
                    name="Settings"
                    component={SettingsScreen}
                    options={{
                      presentation: 'modal',
                      animation: 'slide_from_bottom',
                    }}
                  />
                  <RootStack.Screen
                    name="ChatHub"
                    component={ChatHubScreen}
                    options={{
                      headerShown: false,
                      animation: 'slide_from_bottom',
                    }}
                  />
                </>
              )}
            </RootStack.Navigator>

            {/* Chat Bottom Sheet & Paywall - only visible when authenticated and onboarded */}
            {user && onboardingCompleted && (
              <>
                <ChatBottomSheet />
                <PaywallModal
                  visible={isPaywallVisible}
                  onClose={hidePaywall}
                />
              </>
            )}
          </View>
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

// =====================================================
// STYLES
// =====================================================

const styles = StyleSheet.create({
  gestureRoot: {
    flex: 1,
  },
  centerTab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    marginTop: 16,
    color: colors.textMuted,
    fontSize: 16,
  },
});
