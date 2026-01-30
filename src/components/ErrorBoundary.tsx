/**
 * ErrorBoundary - Catches render errors and prevents full-app crashes.
 * Reports to Sentry and shows graceful fallback UI.
 */

import React, { Component, ReactNode } from 'react';
import { View, StyleSheet } from 'react-native';
import * as Sentry from '@sentry/react-native';
import { ErrorState } from './ErrorState';
import { logger } from '../utils/logger';

interface ErrorBoundaryProps {
  children: ReactNode;
  /** "screen" = full-screen fallback, "component" = inline/compact fallback */
  level?: 'screen' | 'component';
  /** Custom fallback UI (overrides default ErrorState) */
  fallback?: ReactNode | ((props: { error: Error; resetError: () => void }) => ReactNode);
  /** Called when error is caught */
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  /** Label for Sentry context */
  name?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const { name = 'Unknown', onError } = this.props;
    logger.error(`[ErrorBoundary:${name}]`, error, errorInfo);

    Sentry.captureException(error, {
      tags: { boundary: name, level: this.props.level || 'component' },
      extra: { componentStack: errorInfo.componentStack },
    });

    onError?.(error, errorInfo);
  }

  resetError = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    const { fallback, level = 'component' } = this.props;
    const error = this.state.error!;

    // Custom fallback
    if (fallback) {
      if (typeof fallback === 'function') {
        return fallback({ error, resetError: this.resetError });
      }
      return fallback;
    }

    // Default fallback using ErrorState
    const isCompact = level === 'component';

    if (isCompact) {
      return (
        <ErrorState
          compact
          message="This section failed to load."
          onRetry={this.resetError}
        />
      );
    }

    return (
      <View style={styles.fullScreen}>
        <ErrorState
          title="Something unexpected happened"
          message="An unexpected error occurred. Let's try again — God's got this."
          onRetry={this.resetError}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  fullScreen: {
    flex: 1,
    backgroundColor: '#0F0F0F',
  },
});
