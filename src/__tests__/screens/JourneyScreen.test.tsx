import React from 'react';
import { render } from '@testing-library/react-native';

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: jest.fn() }),
  useFocusEffect: jest.fn(),
}));
jest.mock('@react-navigation/native-stack', () => ({ NativeStackNavigationProp: jest.fn() }));
jest.mock('expo-print', () => ({ printToFileAsync: jest.fn() }));
jest.mock('expo-sharing', () => ({ shareAsync: jest.fn() }));
jest.mock('../../store/useStore', () => ({ useStore: jest.fn(() => ({ user: { id: '1' } })) }));
jest.mock('../../hooks/usePremiumStatus', () => ({ usePremiumStatus: () => ({ isPremium: false }) }));
jest.mock('../../lib/journeyPDF', () => ({ generateJourneyPDF: jest.fn() }));
jest.mock('../../components/journey', () => ({
  TimelineView: 'TimelineView',
  InsightsView: 'InsightsView',
}));

import JourneyScreen from '../../screens/JourneyScreen';

describe('JourneyScreen', () => {
  it('renders without crashing', () => {
    const { toJSON } = render(<JourneyScreen />);
    expect(toJSON()).toBeTruthy();
  });
});
