/**
 * Theme constants — Dark & Light palettes
 *
 * Single source of truth for all colors in the app.
 * Import `Theme` type and palettes from here.
 */

export interface ThemePalette {
  // Backgrounds
  background: string;
  surface: string;
  surfaceElevated: string;
  card: string;

  // Text
  text: string;
  textSecondary: string;
  textMuted: string;
  textInverse: string;

  // Brand
  primary: string;
  primaryLight: string;
  primaryDark: string;
  accent: string;

  // Semantic
  success: string;
  warning: string;
  error: string;
  info: string;

  // Borders & Dividers
  border: string;
  divider: string;

  // Highlights (bible)
  highlightYellow: string;
  highlightGreen: string;
  highlightBlue: string;
  highlightPink: string;
  highlightPurple: string;
  highlightOrange: string;

  // Misc
  overlay: string;
  shadow: string;
  statusBar: 'light-content' | 'dark-content';
}

export interface Theme {
  dark: boolean;
  colors: ThemePalette;
}

export const darkTheme: Theme = {
  dark: true,
  colors: {
    background: '#0F0F0F',
    surface: '#1A1A1A',
    surfaceElevated: '#242424',
    card: '#1E1E1E',

    text: '#FFFFFF',
    textSecondary: '#A0A0A0',
    textMuted: '#666666',
    textInverse: '#0F0F0F',

    primary: '#6C63FF',
    primaryLight: '#8B83FF',
    primaryDark: '#4A42DB',
    accent: '#FFD700',

    success: '#4ADE80',
    warning: '#FBBF24',
    error: '#F87171',
    info: '#60A5FA',

    border: '#2A2A2A',
    divider: '#222222',

    highlightYellow: '#FEF08A',
    highlightGreen: '#BBF7D0',
    highlightBlue: '#BFDBFE',
    highlightPink: '#FBCFE8',
    highlightPurple: '#DDD6FE',
    highlightOrange: '#FED7AA',

    overlay: 'rgba(0, 0, 0, 0.6)',
    shadow: '#000000',
    statusBar: 'light-content',
  },
};

export const lightTheme: Theme = {
  dark: false,
  colors: {
    background: '#F8F8FA',
    surface: '#FFFFFF',
    surfaceElevated: '#FFFFFF',
    card: '#FFFFFF',

    text: '#1A1A1A',
    textSecondary: '#5A5A5A',
    textMuted: '#9A9A9A',
    textInverse: '#FFFFFF',

    primary: '#6C63FF',
    primaryLight: '#8B83FF',
    primaryDark: '#4A42DB',
    accent: '#F59E0B',

    success: '#22C55E',
    warning: '#EAB308',
    error: '#EF4444',
    info: '#3B82F6',

    border: '#E5E5E5',
    divider: '#EEEEEE',

    highlightYellow: '#FEF08A',
    highlightGreen: '#BBF7D0',
    highlightBlue: '#BFDBFE',
    highlightPink: '#FBCFE8',
    highlightPurple: '#DDD6FE',
    highlightOrange: '#FED7AA',

    overlay: 'rgba(0, 0, 0, 0.3)',
    shadow: '#000000',
    statusBar: 'dark-content',
  },
};
