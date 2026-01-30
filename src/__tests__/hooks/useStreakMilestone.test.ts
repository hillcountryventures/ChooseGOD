import { renderHook, act } from '@testing-library/react-native';
import { useStreakMilestone } from '../../hooks/useStreakMilestone';

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

jest.mock('../../components/StreakMilestoneModal', () => ({
  getMilestoneForStreak: jest.fn((days: number) => {
    const milestones: Record<number, { days: number; title: string; message: string; emoji: string }> = {
      7: { days: 7, title: 'One Week!', message: '7 days strong', emoji: '🔥' },
      30: { days: 30, title: 'One Month!', message: '30 days strong', emoji: '🌟' },
    };
    return milestones[days] || null;
  }),
}));

jest.mock('../../utils/logger', () => ({
  logger: { error: jest.fn(), warn: jest.fn(), info: jest.fn(), debug: jest.fn() },
}));

describe('useStreakMilestone', () => {
  it('returns initial state with no milestone', () => {
    const { result } = renderHook(() => useStreakMilestone(1));
    expect(result.current.pendingMilestone).toBeNull();
    expect(result.current.showMilestone).toBe(false);
  });

  it('exposes dismissMilestone function', () => {
    const { result } = renderHook(() => useStreakMilestone(1));
    expect(typeof result.current.dismissMilestone).toBe('function');
  });

  it('exposes triggerMilestone function', () => {
    const { result } = renderHook(() => useStreakMilestone(1));
    expect(typeof result.current.triggerMilestone).toBe('function');
  });

  it('triggerMilestone shows a milestone', () => {
    const { result } = renderHook(() => useStreakMilestone(1));
    act(() => {
      result.current.triggerMilestone(7);
    });
    expect(result.current.pendingMilestone).toBeTruthy();
    expect(result.current.showMilestone).toBe(true);
  });

  it('dismissMilestone clears the milestone', () => {
    const { result } = renderHook(() => useStreakMilestone(1));
    act(() => {
      result.current.triggerMilestone(7);
    });
    act(() => {
      result.current.dismissMilestone();
    });
    expect(result.current.showMilestone).toBe(false);
    expect(result.current.pendingMilestone).toBeNull();
  });

  it('triggerMilestone with non-milestone day does nothing', () => {
    const { result } = renderHook(() => useStreakMilestone(1));
    act(() => {
      result.current.triggerMilestone(3);
    });
    expect(result.current.pendingMilestone).toBeNull();
    expect(result.current.showMilestone).toBe(false);
  });
});
