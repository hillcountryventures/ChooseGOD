import React from 'react';
import { View, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { ScreenErrorBoundary } from '../components/ScreenErrorBoundary';

// Main Screens
import HomeScreen from '../screens/HomeScreen';
import BibleScreen from '../screens/BibleScreen';
import JourneyScreen from '../screens/JourneyScreen';
import PrayersScreen from '../screens/PrayersScreen';

// Auth Screens
import LoginScreen from '../screens/auth/LoginScreen';
import SignUpScreen from '../screens/auth/SignUpScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';

// Onboarding Screens
import EmotionalWelcomeScreen from '../screens/onboarding/EmotionalWelcomeScreen';
import WelcomeScreen from '../screens/onboarding/WelcomeScreen'; // Legacy
import OnboardingCarousel from '../screens/onboarding/OnboardingCarousel'; // Legacy
import PersonalizationQuiz from '../screens/onboarding/PersonalizationQuiz';
import TranslationSelectScreen from '../screens/onboarding/TranslationSelectScreen';
import RecommendationsScreen from '../screens/onboarding/RecommendationsScreen';
import AIDemoScreen from '../screens/onboarding/AIDemoScreen';
import PaywallScreen from '../screens/onboarding/PaywallScreen';
import NotificationSetupScreen from '../screens/onboarding/NotificationSetupScreen';
import EnrollmentConfirmScreen from '../screens/onboarding/EnrollmentConfirmScreen';

// Devotional Screens
import DevotionalHubScreen from '../screens/devotional/DevotionalHubScreen';
import SeriesLibraryScreen from '../screens/devotional/SeriesLibraryScreen';
import SeriesDetailScreen from '../screens/devotional/SeriesDetailScreen';
import DailyDevotionalScreen from '../screens/devotional/DailyDevotionalScreen';
import DevotionalCompleteScreen from '../screens/devotional/DevotionalCompleteScreen';

// Types
import {
  BottomTabParamList,
  AuthStackParamList,
  OnboardingStackParamList,
  DevotionalStackParamList,
} from '../types';

import { colors } from './theme';

// =====================================================
// NAVIGATOR INSTANCES
// =====================================================

const AuthStackNav = createNativeStackNavigator<AuthStackParamList>();
const OnboardingStackNav = createNativeStackNavigator<OnboardingStackParamList>();
const DevotionalStackNav = createNativeStackNavigator<DevotionalStackParamList>();
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
// SCREEN WRAPPERS
// =====================================================

const SafeHomeScreen = (props: Record<string, unknown>) => <ScreenErrorBoundary name="HomeScreen"><HomeScreen {...props} /></ScreenErrorBoundary>;
const SafeBibleScreen = (props: Record<string, unknown>) => <ScreenErrorBoundary name="BibleScreen"><BibleScreen {...props} /></ScreenErrorBoundary>;
const SafeJourneyScreen = (props: Record<string, unknown>) => <ScreenErrorBoundary name="JourneyScreen"><JourneyScreen {...props} /></ScreenErrorBoundary>;
const SafePrayersScreen = (props: Record<string, unknown>) => <ScreenErrorBoundary name="PrayersScreen"><PrayersScreen {...props} /></ScreenErrorBoundary>;
const SafeDevotionalNavigator = (props: Record<string, unknown>) => <ScreenErrorBoundary name="DevotionalNavigator"><DevotionalNavigator {...props} /></ScreenErrorBoundary>;

// =====================================================
// NAVIGATORS
// =====================================================

export function AuthNavigator() {
  return (
    <AuthStackNav.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <AuthStackNav.Screen name="Login" component={LoginScreen} />
      <AuthStackNav.Screen name="SignUp" component={SignUpScreen} />
      <AuthStackNav.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    </AuthStackNav.Navigator>
  );
}

export function OnboardingNavigator() {
  // New flow: Welcome (emotional) → AI Demo → Translation → Quiz (short) → Notifications
  return (
    <OnboardingStackNav.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      {/* New flow */}
      <OnboardingStackNav.Screen name="Welcome" component={EmotionalWelcomeScreen} />
      <OnboardingStackNav.Screen name="AIDemo" component={AIDemoScreen} />
      <OnboardingStackNav.Screen name="TranslationSelect" component={TranslationSelectScreen} />
      <OnboardingStackNav.Screen name="Quiz" component={PersonalizationQuiz} />
      <OnboardingStackNav.Screen name="Recommendations" component={RecommendationsScreen} />
      <OnboardingStackNav.Screen name="NotificationSetup" component={NotificationSetupScreen} />
      <OnboardingStackNav.Screen name="EnrollConfirm" component={EnrollmentConfirmScreen} />
      
      {/* Legacy screens (kept for deep links / backwards compat) */}
      <OnboardingStackNav.Screen name="Carousel" component={OnboardingCarousel} />
      <OnboardingStackNav.Screen name="Paywall" component={PaywallScreen} />
    </OnboardingStackNav.Navigator>
  );
}

export function DevotionalNavigator() {
  return (
    <DevotionalStackNav.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <DevotionalStackNav.Screen name="DevotionalHub" component={DevotionalHubScreen} />
      <DevotionalStackNav.Screen name="SeriesLibrary" component={SeriesLibraryScreen} />
      <DevotionalStackNav.Screen name="SeriesDetail" component={SeriesDetailScreen} />
      <DevotionalStackNav.Screen name="DailyDevotional" component={DailyDevotionalScreen} />
      <DevotionalStackNav.Screen name="DevotionalComplete" component={DevotionalCompleteScreen} />
    </DevotionalStackNav.Navigator>
  );
}

export function TabNavigator() {
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
      <Tab.Screen name="Home" component={SafeHomeScreen} />
      <Tab.Screen
        name="Devotionals"
        component={SafeDevotionalNavigator}
        options={{ tabBarLabel: 'Devotionals' }}
      />
      <Tab.Screen
        name="Bible"
        component={SafeBibleScreen}
        options={{ tabBarLabel: '' }}
      />
      <Tab.Screen name="Journey" component={SafeJourneyScreen} />
      <Tab.Screen name="Prayers" component={SafePrayersScreen} />
    </Tab.Navigator>
  );
}

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
});
