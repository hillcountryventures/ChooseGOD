import { renderHook } from '@testing-library/react-native';
import { useOfflineStatus } from '../../hooks/useOfflineStatus';

jest.mock('@react-native-community/netinfo', () => ({
  addEventListener: jest.fn(() => jest.fn()),
  fetch: jest.fn(() => Promise.resolve({ isConnected: true })),
}));

describe('useOfflineStatus', () => {
  it('returns offline status object', () => {
    const { result } = renderHook(() => useOfflineStatus());
    expect(result.current).toHaveProperty('isOffline');
    expect(typeof result.current.isOffline).toBe('boolean');
  });
});
