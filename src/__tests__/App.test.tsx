/* eslint-disable @typescript-eslint/no-require-imports */
import React from 'react';
import { render } from '@testing-library/react-native';

jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
}));

jest.mock('../navigation', () => ({
  AuthNavigator: () => null,
  OnboardingNavigator: () => null,
  TabNavigator: () => null,
  DarkTheme: { dark: true, colors: {} },
  linking: { prefixes: [] },
}));

jest.mock('../components/DivineEntranceSplash', () => ({
  DivineEntranceSplash: () => null,
}));

jest.mock('../components/chat/ChatBottomSheet', () => ({
  ChatBottomSheet: () => null,
}));

jest.mock('../components/PaywallModal', () => ({
  PaywallModal: () => null,
}));

jest.mock('../screens/ChatHubScreen', () => () => null);
jest.mock('../screens/SettingsScreen', () => () => null);
jest.mock('../screens/settings/ReferralScreen', () => () => null);
jest.mock('../screens/SubscriptionDebugScreen', () => () => null);
jest.mock('../screens/ReflectionModal', () => () => null);
jest.mock('../screens/CameraScreen', () => () => null);
jest.mock('../screens/MemoryPracticeScreen', () => () => null);
jest.mock('../screens/LectioDivinaScreen', () => () => null);
jest.mock('../screens/JourneyInsightsScreen', () => () => null);
jest.mock('../screens/circles', () => ({ PrayerCirclesScreen: () => null, CircleDetailScreen: () => null }));
jest.mock('../screens/journal/JournalComposeScreen', () => () => null);
jest.mock('../screens/journal/JournalDetailScreen', () => () => null);
jest.mock('../screens/journal/VersePickerScreen', () => () => null);

// Mock all heavy dependencies before importing App
jest.mock('../utils/sentry', () => ({
  initSentry: jest.fn(),
  Sentry: { wrap: (component: any) => component },
}));

jest.mock('../services/analytics', () => ({
  initAnalytics: jest.fn(),
}));

jest.mock('../store/authStore', () => ({
  useAuthStore: () => ({
    user: null,
    initialized: true,
    initialize: jest.fn(),
  }),
}));

jest.mock('../store/devotionalStore', () => ({
  useDevotionalStore: () => ({
    onboardingCompleted: false,
    checkOnboardingStatus: jest.fn(),
  }),
}));

jest.mock('../store/subscriptionStore', () => ({
  useSubscriptionStore: (selector: any) => selector({
    initialize: jest.fn(),
    hidePaywall: jest.fn(),
  }),
  useIsPaywallVisible: () => false,
}));

jest.mock('../lib/supabase', () => ({
  supabase: { auth: { setSession: jest.fn(), onAuthStateChange: jest.fn(() => ({ data: { subscription: { unsubscribe: jest.fn() } } })) } },
}));

jest.mock('../lib/notifications', () => ({
  setupNotificationListeners: jest.fn(() => jest.fn()),
  handleNotificationResponse: jest.fn(),
  scheduleDailyWisdomNotification: jest.fn(),
  requestPermissions: jest.fn(),
}));

jest.mock('expo-linking', () => ({
  createURL: jest.fn(() => 'choosegod://'),
  getInitialURL: jest.fn(() => Promise.resolve(null)),
  addEventListener: jest.fn(() => ({ remove: jest.fn() })),
}));

jest.mock('@react-navigation/native', () => {
  const actual = jest.requireActual('@react-navigation/native');
  return {
    ...actual,
    NavigationContainer: ({ children }: any) => children,
  };
});

jest.mock('@react-navigation/native-stack', () => ({
  createNativeStackNavigator: () => ({
    Navigator: ({ children }: any) => children,
    Screen: () => null,
  }),
}));

jest.mock('@react-navigation/bottom-tabs', () => ({
  createBottomTabNavigator: () => ({
    Navigator: ({ children }: any) => children,
    Screen: () => null,
  }),
}));

jest.mock('react-native-gesture-handler', () => ({
  GestureHandlerRootView: ({ children }: any) => children,
}));

jest.mock('posthog-react-native', () => ({}));

describe('App', () => {
  it('renders without crashing', () => {
    const App = require('../../App').default;
    const { toJSON } = render(<App />);
    expect(toJSON()).toBeTruthy();
  });
});
