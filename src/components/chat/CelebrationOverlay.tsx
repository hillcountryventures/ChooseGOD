/**
 * CelebrationOverlay - Animated celebration popup
 */
import React from 'react';
import { StyleSheet, Text, Animated } from 'react-native';
import { theme } from '../../lib/theme';

interface CelebrationOverlayProps {
  message: string;
  animValue: Animated.Value;
}

export function CelebrationOverlay({ message, animValue }: CelebrationOverlayProps) {
  return (
    <Animated.View
      style={[
        styles.celebrationOverlay,
        {
          opacity: animValue,
          transform: [{
            scale: animValue.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1] }),
          }],
        },
      ]}
    >
      <Text style={styles.celebrationEmoji}>{'\uD83C\uDF89'}</Text>
      <Text style={styles.celebrationText}>{message}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  celebrationOverlay: {
    position: 'absolute',
    top: '30%',
    left: theme.spacing.lg,
    right: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.xl,
    alignItems: 'center',
    ...theme.shadows.lg,
  },
  celebrationEmoji: {
    fontSize: 48,
    marginBottom: theme.spacing.md,
  },
  celebrationText: {
    fontSize: theme.fontSize.lg,
    fontWeight: '600',
    color: theme.colors.text,
    textAlign: 'center',
  },
});
