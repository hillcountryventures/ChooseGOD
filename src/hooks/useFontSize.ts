/**
 * useFontSize Hook
 *
 * Provides scaled font sizes based on user preferences.
 * Use this hook in components that display Bible text or other
 * content that should respect the user's font size setting.
 */

import { useMemo } from 'react';
import { useStore } from '../store/useStore';
import { theme, getScaledFontSize, FontSizePreference } from '../lib/theme';

interface ScaledFontSizes {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  xxl: number;
  xxxl: number;
  display: number;
}

interface UseFontSizeReturn {
  /** User's current font size preference */
  preference: FontSizePreference;
  /** All font sizes scaled to user preference */
  sizes: ScaledFontSizes;
  /** Get a specific scaled font size */
  getSize: (size: keyof typeof theme.fontSize) => number;
  /** Scale any arbitrary font size */
  scale: (baseSize: number) => number;
}

/**
 * Hook to get font sizes scaled to user preferences
 *
 * @example
 * ```tsx
 * const { sizes, getSize } = useFontSize();
 *
 * // Use pre-calculated sizes
 * <Text style={{ fontSize: sizes.md }}>Hello</Text>
 *
 * // Or get a specific size
 * <Text style={{ fontSize: getSize('lg') }}>Larger text</Text>
 * ```
 */
export function useFontSize(): UseFontSizeReturn {
  const fontSize = useStore((state) => state.preferences.fontSize);

  const scaledSizes = useMemo((): ScaledFontSizes => ({
    xs: getScaledFontSize(theme.fontSize.xs, fontSize),
    sm: getScaledFontSize(theme.fontSize.sm, fontSize),
    md: getScaledFontSize(theme.fontSize.md, fontSize),
    lg: getScaledFontSize(theme.fontSize.lg, fontSize),
    xl: getScaledFontSize(theme.fontSize.xl, fontSize),
    xxl: getScaledFontSize(theme.fontSize.xxl, fontSize),
    xxxl: getScaledFontSize(theme.fontSize.xxxl, fontSize),
    display: getScaledFontSize(theme.fontSize.display, fontSize),
  }), [fontSize]);

  const getSize = useMemo(() => {
    return (size: keyof typeof theme.fontSize): number => {
      return getScaledFontSize(theme.fontSize[size], fontSize);
    };
  }, [fontSize]);

  const scale = useMemo(() => {
    return (baseSize: number): number => {
      return getScaledFontSize(baseSize, fontSize);
    };
  }, [fontSize]);

  return {
    preference: fontSize,
    sizes: scaledSizes,
    getSize,
    scale,
  };
}

export default useFontSize;
