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
import { ERROR_STATE_STRINGS } from '../constants/strings';

interface ErrorStateProps {
  /** Error title - defaults to ERROR_STATE_STRINGS.defaultTitle */
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
  title = ERROR_STATE_STRINGS.defaultTitle,
  message = ERROR_STATE_STRINGS.defaultMessage,
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
      <View style={styles.compactContainer} testID="error-state-compact" accessibilityRole="alert" accessibilityLabel={message}>
        <Ionicons name={icon} size={20} color={iconColor} />
        <Text style={styles.compactMessage}>{message}</Text>
        {onRetry && (
          <TouchableOpacity onPress={onRetry} style={styles.compactRetry} testID="error-retry-compact" accessibilityRole="button" accessibilityLabel={retryText}>
            <Text style={styles.compactRetryText}>{retryText}</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  return (
    <View style={styles.container} testID="error-state" accessibilityRole="alert" accessibilityLabel={`${title}. ${message}`}>
      <View style={styles.iconContainer}>
        <Ionicons name={icon} size={64} color={iconColor} />
      </View>
      
      <Text style={styles.title} testID="error-state-title">{title}</Text>
      <Text style={styles.message} testID="error-state-message">{message}</Text>

      <View style={styles.actions}>
        {onRetry && (
          <TouchableOpacity style={styles.retryButton} onPress={onRetry} testID="error-retry-button" accessibilityRole="button" accessibilityLabel={retryText}>
            <Ionicons name="refresh" size={18} color="#fff" />
            <Text style={styles.retryButtonText}>{retryText}</Text>
          </TouchableOpacity>
        )}
        
        {onSecondaryAction && (
          <TouchableOpacity style={styles.secondaryButton} onPress={onSecondaryAction} testID="error-secondary-button" accessibilityRole="button" accessibilityLabel={secondaryActionText}>
            <Text style={styles.secondaryButtonText}>{secondaryActionText}</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Encouraging scripture */}
      <View style={styles.scriptureContainer}>
        <Ionicons name="book-outline" size={14} color={theme.colors.textMuted} />
        <Text style={styles.scriptureText}>
          {"\u201C" + ERROR_STATE_STRINGS.scripture.replace(/^[""\u201C]+|[""\u201D]+$/g, '') + "\u201D"}
        </Text>
        <Text style={styles.scriptureRef}>— {ERROR_STATE_STRINGS.scriptureRef}</Text>
      </View>
    </View>
  );
}

// Preset configurations for common error types
export const ErrorPresets = {
  network: {
    title: "You're Offline",
    message: "Check your connection and try again. He's still with you.\n\n\"Be still, and know that I am God.\" — Psalm 46:10",
    icon: 'cloud-offline-outline' as const,
  },
  server: {
    title: 'Give Us a Moment',
    message: "Our servers need a second. Try again shortly — we'll be right back.",
    icon: 'server-outline' as const,
  },
  notFound: {
    title: 'Not Found',
    message: "We couldn't find what you're looking for. Try a different search.",
    icon: 'search-outline' as const,
    iconColor: theme.colors.textMuted,
  },
  permission: {
    title: 'Permission Needed',
    message: 'Please grant the required permission so we can continue together.',
    icon: 'lock-closed-outline' as const,
    iconColor: theme.colors.warning,
  },
  empty: {
    title: 'Nothing Here Yet',
    message: 'Your journey starts with a single step. Add something to begin!',
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
