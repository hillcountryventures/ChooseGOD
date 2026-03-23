/**
 * Shared themed style helpers
 *
 * Usage:
 *   import { sharedStyles } from '../utils/sharedStyles';
 *   const s = sharedStyles.card(theme);
 */

import { ViewStyle, TextStyle, Platform } from 'react-native';
import { Theme } from '../constants/theme';

export const sharedStyles = {
  /** Standard card with shadow, borderRadius, background */
  card(theme: Theme): ViewStyle {
    return {
      backgroundColor: theme.colors.card,
      borderRadius: 16,
      padding: 16,
      ...(Platform.OS === 'ios'
        ? {
            shadowColor: theme.colors.shadow,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.15,
            shadowRadius: 8,
          }
        : { elevation: 4 }),
    };
  },

  /** Standard primary button */
  primaryButton(theme: Theme): ViewStyle {
    return {
      backgroundColor: theme.colors.primary,
      borderRadius: 12,
      paddingVertical: 14,
      paddingHorizontal: 24,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
    };
  },

  /** Flex row with centered items */
  row(): ViewStyle {
    return {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
    };
  },

  /** Standard screen container */
  screenContainer(theme: Theme): ViewStyle {
    return {
      flex: 1,
      backgroundColor: theme.colors.background,
    };
  },
};
