import { renderHook } from '@testing-library/react-native';
import { useFontSize } from '../../hooks/useFontSize';

jest.mock('../../store/useStore', () => ({
  useStore: jest.fn((selector) => {
    const state = {
      preferences: { fontSize: 'medium' },
    };
    return selector(state);
  }),
}));

jest.mock('../../lib/theme', () => ({
  theme: {
    fontSize: { xs: 10, sm: 12, md: 14, lg: 16, xl: 18, xxl: 22, xxxl: 28, display: 34 },
  },
  getScaledFontSize: (base: number, _pref: string) => base,
}));

describe('useFontSize', () => {
  it('returns scaled font sizes', () => {
    const { result } = renderHook(() => useFontSize());
    expect(result.current.sizes).toBeDefined();
    expect(typeof result.current.sizes.md).toBe('number');
  });

  it('exposes getSize function', () => {
    const { result } = renderHook(() => useFontSize());
    expect(typeof result.current.getSize).toBe('function');
  });
});
