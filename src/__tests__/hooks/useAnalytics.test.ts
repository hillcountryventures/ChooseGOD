import { renderHook } from '@testing-library/react-native';
import { useAnalytics, useTrackScreen } from '../../hooks/useAnalytics';

jest.mock('../../services/analytics', () => ({
  trackOnboardingStarted: jest.fn(),
  trackOnboardingCompleted: jest.fn(),
  trackFirstChat: jest.fn(),
  trackPaywallShown: jest.fn(),
  trackSubscriptionStarted: jest.fn(),
  trackScreenView: jest.fn(),
  trackVerseShared: jest.fn(),
  trackStreakDay: jest.fn(),
  trackEvent: jest.fn(),
  identifyUser: jest.fn(),
  resetAnalytics: jest.fn(),
}));

const analytics = require('../../services/analytics');

describe('useAnalytics', () => {
  it('returns all tracking functions', () => {
    const { result } = renderHook(() => useAnalytics());
    expect(typeof result.current.trackOnboardingStarted).toBe('function');
    expect(typeof result.current.trackOnboardingCompleted).toBe('function');
    expect(typeof result.current.trackFirstChat).toBe('function');
    expect(typeof result.current.trackPaywallShown).toBe('function');
    expect(typeof result.current.trackSubscriptionStarted).toBe('function');
    expect(typeof result.current.trackScreenView).toBe('function');
    expect(typeof result.current.trackVerseShared).toBe('function');
    expect(typeof result.current.trackStreakDay).toBe('function');
    expect(typeof result.current.trackEvent).toBe('function');
    expect(typeof result.current.identifyUser).toBe('function');
    expect(typeof result.current.resetAnalytics).toBe('function');
  });

  it('trackScreenView calls the underlying service', () => {
    const { result } = renderHook(() => useAnalytics());
    result.current.trackScreenView('TestScreen');
    expect(analytics.trackScreenView).toHaveBeenCalledWith('TestScreen');
  });

  it('trackEvent passes name and props', () => {
    const { result } = renderHook(() => useAnalytics());
    result.current.trackEvent('test_event', { key: 'value' });
    expect(analytics.trackEvent).toHaveBeenCalledWith('test_event', { key: 'value' });
  });
});

describe('useTrackScreen', () => {
  it('fires screen view on mount', () => {
    renderHook(() => useTrackScreen('HomeScreen'));
    expect(analytics.trackScreenView).toHaveBeenCalledWith('HomeScreen');
  });

  it('fires only once', () => {
    analytics.trackScreenView.mockClear();
    const { rerender } = renderHook(() => useTrackScreen('HomeScreen'));
    rerender({});
    expect(analytics.trackScreenView).toHaveBeenCalledTimes(1);
  });
});
