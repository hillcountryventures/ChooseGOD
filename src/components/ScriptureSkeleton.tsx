/**
 * ScriptureSkeleton - Animated loading placeholder for chat responses
 * Displays shimmering lines that mimic the rhythm of a Bible verse
 */

import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing, DimensionValue } from 'react-native';
import { theme } from '../lib/theme';

interface ScriptureSkeletonProps {
  lineCount?: number;
}

export function ScriptureSkeleton({ lineCount = 4 }: ScriptureSkeletonProps) {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration: 1500,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    animation.start();

    return () => animation.stop();
  }, [shimmerAnim]);

  // Translate the shimmer across the skeleton
  const translateX = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-200, 200],
  });

  // Line widths to mimic verse structure
  const lineWidths: DimensionValue[] = ['90%', '75%', '85%', '60%'];

  return (
    <View style={styles.container}>
      {Array.from({ length: lineCount }).map((_, index) => (
        <View
          key={index}
          style={[
            styles.lineContainer,
            { width: lineWidths[index % lineWidths.length] }
          ]}
        >
          <View style={styles.line} />
          <Animated.View
            style={[
              styles.shimmer,
              {
                transform: [{ translateX }],
              },
            ]}
          />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFDF5',
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: '#D4C9B5',
    gap: theme.spacing.md,
    ...theme.shadows.sm,
    overflow: 'hidden',
  },
  lineContainer: {
    height: 14,
    borderRadius: 7,
    overflow: 'hidden',
    position: 'relative',
  },
  line: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#E8DFD0',
  },
  shimmer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    width: 100,
  },
});
