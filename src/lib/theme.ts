export const theme = {
  colors: {
    // Primary colors - Navy blue from logo
    primary: '#1B3A5F',
    primaryDark: '#142D4A',
    primaryLight: '#2A5080',

    // Accent - Light blue from logo background
    accent: '#88AED0',
    accentDark: '#6B9AC4',
    accentLight: '#A5C4DE',

    // Background colors (dark theme with navy tones)
    background: '#0A1520',
    backgroundSecondary: '#101D2C',
    backgroundTertiary: '#182838',

    // Surface colors for cards, modals, etc.
    surface: '#132231',
    surfaceElevated: '#1A2D40',
    card: '#101D2C',
    cardHover: '#182838',

    // Text colors
    text: '#FFFFFF',
    textSecondary: '#A3B8CC',
    textMuted: '#6B8299',
    textInverse: '#0A1520',

    // Border colors
    border: '#1E3448',
    borderLight: '#2A4560',

    // Status colors
    success: '#22C55E',
    error: '#EF4444',
    warning: '#F59E0B',
    info: '#88AED0',
    prayer: '#EC4899',
    prayerDark: '#DB2777',

    // Input colors
    inputBackground: '#101D2C',
    inputBorder: '#1E3448',
    inputFocus: '#88AED0',

    // Message bubbles
    userBubble: '#1B3A5F',
    assistantBubble: '#101D2C',

    // Bible verse highlight colors
    highlight: {
      yellow: '#FDE047',
      green: '#86EFAC',
      blue: '#93C5FD',
      pink: '#F9A8D4',
      purple: '#C4B5FD',
      orange: '#FDBA74',
    },

    // Gradient backgrounds
    gradient: {
      start: '#1B3A5F',
      end: '#2A5080',
      dark: ['#132231', '#1A2D40'],
      spiritual: ['#0A1520', '#142D4A'],
      spiritualFull: ['#0A1520', '#142D4A', '#1B3A5F'],
    },

    // Opacity variants (for transparent overlays)
    overlay: {
      light: 'rgba(255, 255, 255, 0.1)',
      medium: 'rgba(255, 255, 255, 0.2)',
      dark: 'rgba(0, 0, 0, 0.5)',
    },

    // Semantic colors with opacity (navy primary)
    primaryAlpha: {
      10: 'rgba(27, 58, 95, 0.1)',
      15: 'rgba(27, 58, 95, 0.15)',
      20: 'rgba(27, 58, 95, 0.2)',
      40: 'rgba(27, 58, 95, 0.4)',
    },
    accentAlpha: {
      10: 'rgba(136, 174, 208, 0.1)',
      20: 'rgba(136, 174, 208, 0.2)',
    },
    successAlpha: {
      20: 'rgba(34, 197, 94, 0.2)',
    },
    errorAlpha: {
      20: 'rgba(239, 68, 68, 0.2)',
    },
  },

  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
    xxxl: 64,
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
