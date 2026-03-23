import { renderHook, act } from '@testing-library/react-native';
import { useCrossReferences } from '../../hooks/useCrossReferences';

jest.mock('../../lib/supabase', () => ({
  supabase: {
    rpc: jest.fn(() => Promise.resolve({ data: [], error: null })),
  },
}));

jest.mock('../../store/useStore', () => ({
  useStore: jest.fn(() => ({
    preferences: { preferredTranslation: 'KJV' },
  })),
}));

describe('useCrossReferences', () => {
  it('returns initial state', () => {
    const { result } = renderHook(() => useCrossReferences());
    expect(result.current.crossRefs).toEqual([]);
    expect(result.current.groupedRefs).toEqual([]);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('exposes fetchByVerseId function', () => {
    const { result } = renderHook(() => useCrossReferences());
    expect(typeof result.current.fetchByVerseId).toBe('function');
  });

  it('exposes fetchByReference function', () => {
    const { result } = renderHook(() => useCrossReferences());
    expect(typeof result.current.fetchByReference).toBe('function');
  });

  it('clear resets state', () => {
    const { result } = renderHook(() => useCrossReferences());
    act(() => {
      result.current.clear();
    });
    expect(result.current.crossRefs).toEqual([]);
    expect(result.current.error).toBeNull();
  });
});
