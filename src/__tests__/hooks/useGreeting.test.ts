import { renderHook } from '@testing-library/react-native';
import { useGreeting } from '../../hooks/useGreeting';

jest.mock('../../constants/timing', () => ({
  GREETING_HOURS: { morningEnd: 12, afternoonEnd: 17 },
}));

jest.mock('../../constants/strings', () => ({
  GREETINGS: {
    morning: 'Good morning',
    afternoon: 'Good afternoon',
    evening: 'Good evening',
  },
}));

describe('useGreeting', () => {
  it('returns a non-empty greeting string', () => {
    const { result } = renderHook(() => useGreeting());
    expect(typeof result.current).toBe('string');
    expect(result.current.length).toBeGreaterThan(0);
  });

  it('returns one of the expected greetings', () => {
    const { result } = renderHook(() => useGreeting());
    expect(['Good morning', 'Good afternoon', 'Good evening']).toContain(result.current);
  });
});
