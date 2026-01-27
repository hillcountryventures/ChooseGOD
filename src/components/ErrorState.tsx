/**
 * ErrorState - Reusable error display component
 *
 * Philosophy: "We are not God, only helping others find HIM"
 * When things go wrong, we respond with grace and clear next steps.
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../lib/theme';

interface ErrorStateProps {
  /** Error title - defaults to "Something went wrong" */
  title?: string;
  /** Error message/description */
  message?: string;
  /** Icon name from Ionicons */
  icon?: keyof typeof Ionicons.glyphMap;
  /** Icon color - defaults to error color */
  iconColor?: string;
  /** Show retry button */
  onRetry?: () => void;
  /** Retry button text */
  retryText?: string;
  /** Show secondary action */
  onSecondaryAction?: () => void;
  /** Secondary action text */
  secondaryActionText?: string;
  /** Compact mode for inline errors */
  compact?: boolean;
}

export function ErrorState({
  title = 'Something went wrong',
  message = 'Please try again or check your connection.',
  icon = 'alert-circle-outline',
  iconColor = theme.colors.error,
  onRetry,
  retryText = 'Try Again',
  onSecondaryAction,
  secondaryActionText = 'Go Back',
  compact = false,
}: ErrorStateProps) {
  if (compact) {
    return (
      <View style={styles.compactContainer}>
        <Ionicons name={icon} size={20} color={iconColor} />
        <Text style={styles.compactMessage}>{message}</Text>
        {onRetry && (
          <TouchableOpacity onPress={onRetry} style={styles.compactRetry}>
            <Text style={styles.compactRetryText}>{retryText}</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Ionicons name={icon} size={64} color={iconColor} />
      </View>
      
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>

      <View style={styles.actions}>
        {onRetry && (
          <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
            <Ionicons name="refresh" size={18} color="#fff" />
            <Text style={styles.retryButtonText}>{retryText}</Text>
          </TouchableOpacity>
        )}
        
        {onSecondaryAction && (
          <TouchableOpacity style={styles.secondaryButton} onPress={onSecondaryAction}>
            <Text style={styles.secondaryButtonText}>{secondaryActionText}</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Encouraging scripture */}
      <View style={styles.scriptureContainer}>
        <Ionicons name="book-outline" size={14} color={theme.colors.textMuted} />
        <Text style={styles.scriptureText}>
          "Cast all your anxiety on him because he cares for you."
        </Text>
        <Text style={styles.scriptureRef}>— 1 Peter 5:7</Text>
      </View>
    </View>
  );
}

// Preset configurations for common error types
export const ErrorPresets = {
  network: {
    title: 'Connection Issue',
    message: 'Please check your internet connection and try again.',
    icon: 'cloud-offline-outline' as const,
  },
  server: {
    title: 'Server Error',
    message: 'Our servers are having trouble. Please try again in a moment.',
    icon: 'server-outline' as const,
  },
  notFound: {
    title: 'Not Found',
    message: "We couldn't find what you're looking for.",
    icon: 'search-outline' as const,
    iconColor: theme.colors.textMuted,
  },
  permission: {
    title: 'Permission Needed',
    message: 'Please grant the required permissions to continue.',
    icon: 'lock-closed-outline' as const,
    iconColor: theme.colors.warning,
  },
  empty: {
    title: 'Nothing Here Yet',
    message: 'Start your journey by adding something!',
    icon: 'leaf-outline' as const,
    iconColor: theme.colors.primary,
  },
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  title: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  message: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: theme.spacing.xl,
    paddingHorizontal: theme.spacing.lg,
  },
  actions: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.xl,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.xl,
    borderRadius: theme.borderRadius.full,
  },
  retryButtonText: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: '#fff',
  },
  secondaryButton: {
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
  },
  secondaryButtonText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
  },
  scriptureContainer: {
    alignItems: 'center',
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    marginTop: theme.spacing.lg,
  },
  scriptureText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: theme.spacing.sm,
    lineHeight: 20,
  },
  scriptureRef: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textMuted,
    marginTop: theme.spacing.xs,
  },
  // Compact styles
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: theme.borderRadius.lg,
    gap: theme.spacing.sm,
  },
  compactMessage: {
    flex: 1,
    fontSize: theme.fontSize.sm,
    color: theme.colors.text,
  },
  compactRetry: {
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
  },
  compactRetryText: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.primary,
  },
});
