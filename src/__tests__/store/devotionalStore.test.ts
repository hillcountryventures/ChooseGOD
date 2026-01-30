import { useDevotionalStore } from '../../store/devotionalStore';

jest.mock('../../lib/supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          order: jest.fn(() => Promise.resolve({ data: [], error: null })),
          single: jest.fn(() => Promise.resolve({ data: null, error: null })),
        })),
        order: jest.fn(() => Promise.resolve({ data: [], error: null })),
      })),
    })),
    rpc: jest.fn(() => Promise.resolve({ data: [], error: null })),
  },
}));

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

jest.mock('../../constants/database', () => ({
  TABLES: {
    DEVOTIONAL_SERIES: 'devotional_series',
    DEVOTIONAL_DAYS: 'devotional_days',
    USER_SERIES_ENROLLMENTS: 'user_series_enrollments',
  },
}));

describe('devotionalStore', () => {
  beforeEach(() => {
    useDevotionalStore.getState().clearStore();
  });

  it('has correct initial state', () => {
    const state = useDevotionalStore.getState();
    expect(state.allSeries).toEqual([]);
    expect(state.seriesLoading).toBe(false);
    expect(state.seriesError).toBeNull();
    expect(state.enrollments).toEqual([]);
    expect(state.onboardingCompleted).toBe(false);
  });

  it('clearStore resets all state', () => {
    useDevotionalStore.setState({
      allSeries: [{ id: '1' } as never],
      seriesLoading: true,
      onboardingCompleted: true,
    });
    useDevotionalStore.getState().clearStore();
    expect(useDevotionalStore.getState().allSeries).toEqual([]);
    expect(useDevotionalStore.getState().seriesLoading).toBe(false);
    expect(useDevotionalStore.getState().onboardingCompleted).toBe(false);
  });

  it('setOnboardingCompleted updates flag', () => {
    useDevotionalStore.getState().setOnboardingCompleted(true);
    expect(useDevotionalStore.getState().onboardingCompleted).toBe(true);
  });

  it('setOnboardingCompleted toggles flag', () => {
    useDevotionalStore.getState().setOnboardingCompleted(true);
    expect(useDevotionalStore.getState().onboardingCompleted).toBe(true);
    useDevotionalStore.getState().setOnboardingCompleted(false);
    expect(useDevotionalStore.getState().onboardingCompleted).toBe(false);
  });
});
