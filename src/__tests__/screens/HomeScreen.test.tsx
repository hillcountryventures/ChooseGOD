import React from 'react';
import { render } from '@testing-library/react-native';

// Mock all heavy dependencies
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: jest.fn(), goBack: jest.fn() }),
  useRoute: () => ({ params: {} }),
  useFocusEffect: jest.fn(),
  useIsFocused: () => true,
  CompositeNavigationProp: jest.fn(),
}));
jest.mock('@react-navigation/bottom-tabs', () => ({
  BottomTabNavigationProp: jest.fn(),
}));
jest.mock('@react-navigation/native-stack', () => ({
  NativeStackNavigationProp: jest.fn(),
}));
jest.mock('expo-linear-gradient', () => ({
  LinearGradient: 'LinearGradient',
}));
jest.mock('../../store/useStore', () => ({ useStore: jest.fn(() => ({})) }));
jest.mock('../../store/authStore', () => ({ useAuthStore: jest.fn(() => ({ user: { id: '1' } })) }));
jest.mock('../../store/readingPlanStore', () => ({
  useReadingPlanStore: jest.fn(() => ({})),
  useActiveProgress: () => null,
  useTodaysReading: () => null,
  useWayfarerState: () => ({ enrolled: false }),
}));
jest.mock('../../hooks/useDailyVerse', () => ({
  useDailyVerse: () => ({ dailyVerse: null, fetchDailyVerse: jest.fn(), isLoading: false }),
}));
jest.mock('../../hooks/useChatQuota', () => ({ useChatQuota: () => ({ remaining: 5 }) }));
jest.mock('../../hooks/useUserProfile', () => ({
  useUserProfile: () => ({ data: { display_name: 'Test' } }),
  getFirstName: () => 'Test',
}));
jest.mock('../../hooks/useCommunityCount', () => ({ useCommunityCount: () => 0 }));
jest.mock('../../hooks/useScriptureScan', () => ({ useScriptureScan: () => ({}) }));
jest.mock('../../hooks/useGreeting', () => ({ useGreeting: () => 'Good morning' }));
jest.mock('../../hooks/useStreakMilestone', () => ({ useStreakMilestone: () => ({ show: false }) }));
jest.mock('../../hooks/useAnalytics', () => ({ useTrackScreen: jest.fn() }));
jest.mock('../../services/analytics', () => ({ trackStreakDay: jest.fn() }));
jest.mock('../../components/DailyFocusCarousel', () => ({ DailyFocusCarousel: 'DailyFocusCarousel' }));
jest.mock('../../components/home/ActiveStepsSection', () => ({ ActiveStepsSection: 'ActiveStepsSection' }));
jest.mock('../../components/home/ContinueReadingBanner', () => ({ ContinueReadingBanner: 'ContinueReadingBanner' }));
jest.mock('../../components/WayfarerProgressCard', () => 'WayfarerProgressCard');
jest.mock('../../components/ReminderSetupModal', () => 'ReminderSetupModal');
jest.mock('../../components/GraceSummaryModal', () => ({ __esModule: true, default: 'GraceSummaryModal' }));
jest.mock('../../components/StreakMilestoneModal', () => ({ StreakMilestoneModal: 'StreakMilestoneModal' }));
jest.mock('../../lib/navigationHelpers', () => ({
  navigateToBibleVerse: jest.fn(),
  navigateToProverbsOfDay: jest.fn(),
  openJournalCompose: jest.fn(),
  openChatHub: jest.fn(),
}));
jest.mock('../../lib/notifications', () => ({
  requestPermissions: jest.fn(),
  scheduleWayfarerReminder: jest.fn(),
}));
jest.mock('../../lib/supabase', () => ({ supabase: { from: jest.fn() } }));

import HomeScreen from '../../screens/HomeScreen';

describe('HomeScreen', () => {
  it('renders without crashing', () => {
    const { toJSON } = render(<HomeScreen />);
    expect(toJSON()).toBeTruthy();
  });
});
