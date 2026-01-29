import React from 'react';
import { render } from '@testing-library/react-native';

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: jest.fn(), goBack: jest.fn() }),
}));
jest.mock('@react-navigation/native-stack', () => ({ NativeStackNavigationProp: jest.fn() }));
jest.mock('../../store/authStore', () => ({
  useAuthStore: jest.fn((selector) => {
    const state = { user: { id: '1', email: 'test@test.com' }, signOut: jest.fn(), deleteAccount: jest.fn() };
    return typeof selector === 'function' ? selector(state) : state;
  }),
}));
jest.mock('../../store/subscriptionStore', () => ({
  useSubscriptionStore: jest.fn((selector) => {
    const state = { isPremium: false, restorePurchases: jest.fn(), showPaywall: jest.fn() };
    return typeof selector === 'function' ? selector(state) : state;
  }),
  useIsPremium: () => false,
  useIsRestoring: () => false,
}));
jest.mock('../../lib/supabase', () => ({ supabase: { from: jest.fn(() => ({ select: jest.fn(() => ({ eq: jest.fn(() => ({ single: jest.fn(() => Promise.resolve({ data: {} })) })) })) })) } }));

// Mock any additional deps SettingsScreen may need
jest.mock('expo-clipboard', () => ({ setStringAsync: jest.fn() }));
jest.mock('../../hooks/useAnalytics', () => ({ useTrackScreen: jest.fn() }));

import SettingsScreen from '../../screens/SettingsScreen';

describe('SettingsScreen', () => {
  it('renders without crashing', () => {
    const { toJSON } = render(<SettingsScreen />);
    expect(toJSON()).toBeTruthy();
  });
});
