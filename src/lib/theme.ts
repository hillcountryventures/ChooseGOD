export const theme = {
  colors: {
    // Primary colors
    primary: '#6366F1',
    primaryDark: '#4F46E5',
    primaryLight: '#818CF8',

    // Accent - golden/warm tone for spiritual feel
    accent: '#F59E0B',
    accentDark: '#D97706',
    accentLight: '#FBBF24',

    // Background colors (dark theme)
    background: '#0F0F0F',
    backgroundSecondary: '#1A1A1A',
    backgroundTertiary: '#262626',

    // Surface colors for cards, modals, etc.
    surface: '#1F1F1F',
    surfaceElevated: '#2A2A2A',
    card: '#1A1A1A',
    cardHover: '#262626',

    // Text colors
    text: '#FFFFFF',
    textSecondary: '#A3A3A3',
    textMuted: '#737373',
    textInverse: '#0F0F0F',

    // Border colors
    border: '#333333',
    borderLight: '#404040',

    // Status colors
    success: '#22C55E',
    error: '#EF4444',
    warning: '#F59E0B',
    info: '#3B82F6',

    // Input colors
    inputBackground: '#1A1A1A',
    inputBorder: '#333333',
    inputFocus: '#6366F1',

    // Message bubbles
    userBubble: '#6366F1',
    assistantBubble: '#1A1A1A',

    // Special colors
    gradient: {
      start: '#6366F1',
      end: '#8B5CF6',
    },
  },

  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },

  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    full: 9999,
  },

  // Font sizes (top-level for easy access)
  fontSize: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 32,
    display: 40,
  },

  // Font weights (top-level for easy access)
  fontWeight: {
    normal: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },

  typography: {
    // Font sizes
    sizes: {
      xs: 12,
      sm: 14,
      md: 16,
      lg: 18,
      xl: 20,
      xxl: 24,
      xxxl: 32,
      display: 40,
    },

    // Font weights
    weights: {
      regular: '400' as const,
      medium: '500' as const,
      semibold: '600' as const,
      bold: '700' as const,
    },

    // Line heights
    lineHeights: {
      tight: 1.2,
      normal: 1.5,
      relaxed: 1.75,
    },
  },

  shadows: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.2,
      shadowRadius: 2,
      elevation: 2,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 4,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8,
    },
  },
};

export type Theme = typeof theme;
