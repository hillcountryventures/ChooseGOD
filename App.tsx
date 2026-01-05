import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View, StyleSheet, ActivityIndicator, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Auth Store
import { useAuthStore } from './src/store/authStore';
import { useDevotionalStore } from './src/store/devotionalStore';

// Main Screens
import HomeScreen from './src/screens/HomeScreen';
import BibleScreen from './src/screens/BibleScreen';
import JourneyScreen from './src/screens/JourneyScreen';
import ChatScreen from './src/screens/ChatScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import ReflectionModal from './src/screens/ReflectionModal';

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
  Bible: { active: 'book', inactive: 'book-outline' },
  Devotionals: { active: 'heart', inactive: 'heart-outline' },
  Ask: { active: 'chatbubbles', inactive: 'chatbubbles-outline' },
  Journey: { active: 'trending-up', inactive: 'trending-up-outline' },
  Settings: { active: 'settings', inactive: 'settings-outline' },
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

          // Special styling for center Ask tab
          if (route.name === 'Ask') {
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
      <Tab.Screen name="Bible" component={BibleScreen} />
      <Tab.Screen
        name="Devotionals"
        component={DevotionalNavigator}
        options={{
          tabBarLabel: 'Devotionals',
        }}
      />
      <Tab.Screen
        name="Ask"
        component={ChatScreen}
        options={{
          tabBarLabel: '',
        }}
      />
      <Tab.Screen name="Journey" component={JourneyScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
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
  const [checkingOnboarding, setCheckingOnboarding] = useState(true);

  // Initialize auth on mount
  useEffect(() => {
    initialize();
  }, []);

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
    <SafeAreaProvider>
      <NavigationContainer theme={DarkTheme}>
        <StatusBar style="light" />
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
            </>
          )}
        </RootStack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

// =====================================================
// STYLES
// =====================================================

const styles = StyleSheet.create({
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
