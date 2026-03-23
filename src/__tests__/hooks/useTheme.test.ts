import { renderHook } from '@testing-library/react-native';
import { useTheme } from '../../hooks/useTheme';

jest.mock('../../store/useStore', () => ({
  useStore: jest.fn((selector) => {
    const state = {
      preferences: { theme: 'dark' },
    };
    return selector(state);
  }),
}));

jest.mock('../../lib/theme', () => ({
  theme: { colors: { background: '#000', text: '#fff' } },
  darkTheme: { colors: { background: '#000', text: '#fff' } },
  lightTheme: { colors: { background: '#fff', text: '#000' } },
}));

describe('useTheme', () => {
  it('returns a theme object', () => {
    const { result } = renderHook(() => useTheme());
    expect(result.current).toBeDefined();
  });
});
