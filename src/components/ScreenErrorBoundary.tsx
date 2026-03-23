/**
 * ScreenErrorBoundary - Convenience wrapper for screen-level error boundaries.
 * Shows full-screen ErrorState with retry + "Go Home" navigation.
 */

import React, { ReactNode, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { useNavigation, CommonActions } from '@react-navigation/native';
import { ErrorBoundary } from './ErrorBoundary';
import { ErrorState } from './ErrorState';

interface ScreenErrorBoundaryProps {
  children: ReactNode;
  /** Label for Sentry context */
  name?: string;
}

/**
 * Inner fallback that has access to navigation hooks.
 * (Can't use hooks inside a class component's render.)
 */
function ScreenFallback({ error: _error, resetError }: { error: Error; resetError: () => void }) {
  const navigation = useNavigation();

  const goHome = useCallback(() => {
    resetError();
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'Main' as never }],
      })
    );
  }, [navigation, resetError]);

  return (
    <View style={styles.container}>
      <ErrorState
        title="Screen Error"
        message="This screen encountered an error. You can retry or go back home."
        onRetry={resetError}
        onSecondaryAction={goHome}
        secondaryActionText="Go Home"
      />
    </View>
  );
}

export function ScreenErrorBoundary({ children, name }: ScreenErrorBoundaryProps) {
  return (
    <ErrorBoundary
      level="screen"
      name={name || 'Screen'}
      fallback={({ error, resetError }) => (
        <ScreenFallback error={error} resetError={resetError} />
      )}
    >
      {children}
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F0F',
  },
});
