/**
 * useTheme — Hook to access theme context
 *
 * Usage:
 *   const { theme, toggleTheme } = useTheme();
 *   const bg = theme.colors.background;
 */

import { useContext } from 'react';
import { ThemeContext, ThemeContextValue } from '../contexts/ThemeContext';

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  return ctx;
}
