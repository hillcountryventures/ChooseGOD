import { renderHook } from '@testing-library/react-native';
import { useChatQuota } from '../../hooks/useChatQuota';
import { TOTAL_SEEDS } from '../../store/chatQuotaStore';

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

jest.mock('../../hooks/usePremiumStatus', () => ({
  usePremiumStatus: jest.fn(() => ({ isPremium: false, isLoading: false })),
}));

const { usePremiumStatus } = require('../../hooks/usePremiumStatus');

describe('useChatQuota', () => {
  it('returns seed state for free users', () => {
    const { result } = renderHook(() => useChatQuota());
    expect(result.current.totalSeeds).toBe(TOTAL_SEEDS);
    expect(typeof result.current.hasSeeds).toBe('boolean');
    expect(typeof result.current.canSendMessage).toBe('function');
    expect(typeof result.current.getSeedMessage).toBe('function');
    expect(typeof result.current.consumeSeed).toBe('function');
  });

  it('premium users canSendMessage always true', () => {
    usePremiumStatus.mockReturnValue({ isPremium: true, isLoading: false });
    const { result } = renderHook(() => useChatQuota());
    expect(result.current.canSendMessage()).toBe(true);
  });

  it('getSeedMessage returns null for premium', () => {
    usePremiumStatus.mockReturnValue({ isPremium: true, isLoading: false });
    const { result } = renderHook(() => useChatQuota());
    expect(result.current.getSeedMessage()).toBeNull();
  });
});
