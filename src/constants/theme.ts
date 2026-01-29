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
    background: '#0e1126',
    surface: '#161a33',
    surfaceElevated: '#1e2340',
    card: '#1a1e38',

    text: '#faf8f2',
    textSecondary: '#a0a5b8',
    textMuted: '#5a6080',
    textInverse: '#0e1126',

    primary: '#d4a828',
    primaryLight: '#e0bc4a',
    primaryDark: '#8b7425',
    accent: '#faf8f2',

    success: '#4ADE80',
    warning: '#FBBF24',
    error: '#F87171',
    info: '#60A5FA',

    border: '#252a45',
    divider: '#1f2440',

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
    background: '#faf8f2',
    surface: '#FFFFFF',
    surfaceElevated: '#FFFFFF',
    card: '#FFFFFF',

    text: '#0e1126',
    textSecondary: '#3a3f55',
    textMuted: '#9A9A9A',
    textInverse: '#FFFFFF',

    primary: '#8b7425',
    primaryLight: '#d4a828',
    primaryDark: '#6b5a1e',
    accent: '#0e1126',

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
