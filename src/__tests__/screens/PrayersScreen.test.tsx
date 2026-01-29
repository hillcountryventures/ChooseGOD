/* eslint-disable @typescript-eslint/no-require-imports */
import React from 'react';
import { render } from '@testing-library/react-native';

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: jest.fn() }),
}));
jest.mock('@react-navigation/native-stack', () => ({ NativeStackNavigationProp: jest.fn() }));
jest.mock('@shopify/flash-list', () => ({
  FlashList: ({ _renderItem, data, ...props }: any) => {
    const { View } = require('react-native');
    return <View {...props} />;
  },
}));
jest.mock('../../store/useStore', () => ({
  useStore: jest.fn((selector) => {
    const state = { prayers: [], activePrayers: [], addPrayer: jest.fn(), updatePrayer: jest.fn() };
    return typeof selector === 'function' ? selector(state) : state;
  }),
}));
jest.mock('../../lib/navigationHelpers', () => ({ navigateToBibleVerse: jest.fn() }));
jest.mock('../../constants/strings', () => ({ WEEK_DAYS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'] }));
jest.mock('../../components/PrayerEntryModal', () => ({ PrayerEntryModal: 'PrayerEntryModal' }));
jest.mock('../../components/AnsweredPrayerModal', () => ({ AnsweredPrayerModal: 'AnsweredPrayerModal' }));
jest.mock('../../components/CelebrationOverlay', () => ({ CelebrationOverlay: 'CelebrationOverlay' }));

import PrayersScreen from '../../screens/PrayersScreen';

describe('PrayersScreen', () => {
  it('renders without crashing', () => {
    const { toJSON } = render(<PrayersScreen />);
    expect(toJSON()).toBeTruthy();
  });
});
