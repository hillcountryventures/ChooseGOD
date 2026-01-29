import { DefaultTheme } from '@react-navigation/native';

export const colors = {
  background: '#0F0F0F',
  card: '#1A1A1A',
  text: '#ffffff',
  border: '#333333',
  primary: '#6366F1',
  accent: '#F59E0B',
  textMuted: '#737373',
};

export const DarkTheme = {
  ...DefaultTheme,
  dark: true,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.primary,
    background: colors.background,
    card: colors.card,
    text: colors.text,
    border: colors.border,
    notification: colors.accent,
  },
};
