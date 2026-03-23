import { useChatQuotaStore, TOTAL_SEEDS } from '../../store/chatQuotaStore';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

describe('chatQuotaStore', () => {
  beforeEach(() => {
    // Reset store state
    useChatQuotaStore.setState({
      seedsRemaining: TOTAL_SEEDS,
      seedsUsedToday: 0,
      lastResetDate: new Date().toISOString().split('T')[0],
      isOnLastSeed: false,
      showFinalSeedInterstitial: false,
    });
  });

  it('starts with full seeds', () => {
    const state = useChatQuotaStore.getState();
    expect(state.seedsRemaining).toBe(TOTAL_SEEDS);
    expect(state.seedsUsedToday).toBe(0);
  });

  it('useSeed decrements remaining seeds', () => {
    const result = useChatQuotaStore.getState().useSeed();
    expect(result).toBe(true);
    expect(useChatQuotaStore.getState().seedsRemaining).toBe(TOTAL_SEEDS - 1);
    expect(useChatQuotaStore.getState().seedsUsedToday).toBe(1);
  });

  it('useSeed returns false when no seeds left', () => {
    useChatQuotaStore.setState({ seedsRemaining: 0 });
    const result = useChatQuotaStore.getState().useSeed();
    expect(result).toBe(false);
  });

  it('sets isOnLastSeed when one seed remains', () => {
    useChatQuotaStore.setState({ seedsRemaining: 2, seedsUsedToday: 1 });
    useChatQuotaStore.getState().useSeed();
    expect(useChatQuotaStore.getState().isOnLastSeed).toBe(true);
  });

  it('shows final seed interstitial when last seed used', () => {
    useChatQuotaStore.setState({ seedsRemaining: 1, seedsUsedToday: 2 });
    useChatQuotaStore.getState().useSeed();
    expect(useChatQuotaStore.getState().showFinalSeedInterstitial).toBe(true);
    expect(useChatQuotaStore.getState().seedsRemaining).toBe(0);
  });

  it('dismissFinalSeedInterstitial clears flag', () => {
    useChatQuotaStore.setState({ showFinalSeedInterstitial: true });
    useChatQuotaStore.getState().dismissFinalSeedInterstitial();
    expect(useChatQuotaStore.getState().showFinalSeedInterstitial).toBe(false);
  });

  it('checkAndResetDaily resets on new day', () => {
    useChatQuotaStore.setState({
      seedsRemaining: 0,
      seedsUsedToday: 3,
      lastResetDate: '2020-01-01',
    });
    useChatQuotaStore.getState().checkAndResetDaily();
    expect(useChatQuotaStore.getState().seedsRemaining).toBe(TOTAL_SEEDS);
    expect(useChatQuotaStore.getState().seedsUsedToday).toBe(0);
  });

  it('TOTAL_SEEDS is 3', () => {
    expect(TOTAL_SEEDS).toBe(3);
  });
});
