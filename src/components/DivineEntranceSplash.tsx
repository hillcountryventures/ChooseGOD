/**
 * DivineEntranceSplash - The "God's Hand" Loading Experience
 *
 * Philosophy: Transform the cold technical loading into a warm, guided spiritual transition.
 * Instead of a "black wall", this creates a transition of light and purpose.
 *
 * Three Phases:
 * 1. The Emergence of Light (0-1.5s) - Radial amber glow expands, pushing back darkness
 * 2. The Hand-Holding (1.5-3s) - Pulsing seed icon with "Preparing your sanctuary..."
 * 3. The Gentle Landing (3-3.5s) - Scripture dissolves as home content slides up
 */

import React, { useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../lib/theme';

const { width, height } = Dimensions.get('window');

interface DivineEntranceSplashProps {
  /** Called when the entrance animation completes and content should be revealed */
  onAnimationComplete?: () => void;
  /** Whether to show the loading state (phase 2) or just the initial glow */
  isLoading?: boolean;
  /** Minimum display time in ms before onAnimationComplete can fire (default: 2500) */
  minimumDisplayTime?: number;
}

// Scripture for the entrance
const ENTRANCE_SCRIPTURE = {
  text: "Thy word is a lamp unto my feet, and a light unto my path.",
  reference: "Psalm 119:105",
};

export function DivineEntranceSplash({
  onAnimationComplete,
  isLoading = true,
  minimumDisplayTime = 2500,
}: DivineEntranceSplashProps) {
  // Animation values
  const glowOpacity = useRef(new Animated.Value(0)).current;
  const glowScale = useRef(new Animated.Value(0.3)).current;
  const scriptureOpacity = useRef(new Animated.Value(0)).current;
  const scriptureTranslateY = useRef(new Animated.Value(20)).current;
  const seedPulse = useRef(new Animated.Value(1)).current;
  const loadingTextOpacity = useRef(new Animated.Value(0)).current;
  const containerOpacity = useRef(new Animated.Value(1)).current;

  // Track if minimum time has passed
  const startTimeRef = useRef(Date.now());
  const hasCalledComplete = useRef(false);

  // Handle completion with minimum display time
  const handleComplete = useCallback(() => {
    if (hasCalledComplete.current) return;

    const elapsed = Date.now() - startTimeRef.current;
    const remaining = Math.max(0, minimumDisplayTime - elapsed);

    setTimeout(() => {
      if (hasCalledComplete.current) return;
      hasCalledComplete.current = true;

      // Fade out the entire splash
      Animated.timing(containerOpacity, {
        toValue: 0,
        duration: 400,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start(() => {
        onAnimationComplete?.();
      });
    }, remaining);
  }, [minimumDisplayTime, onAnimationComplete, containerOpacity]);

  // Phase 1: Emergence of Light
  useEffect(() => {
    // Start the entrance sequence
    Animated.parallel([
      // Glow fades in
      Animated.timing(glowOpacity, {
        toValue: 1,
        duration: 800,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      // Glow expands
      Animated.timing(glowScale, {
        toValue: 1,
        duration: 1200,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();

    // Scripture fades in after glow starts
    const scriptureTimer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(scriptureOpacity, {
          toValue: 1,
          duration: 800,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(scriptureTranslateY, {
          toValue: 0,
          duration: 800,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
      ]).start();
    }, 400);

    return () => clearTimeout(scriptureTimer);
  }, [glowOpacity, glowScale, scriptureOpacity, scriptureTranslateY]);

  // Phase 2: Hand-Holding (loading state with pulsing seed)
  useEffect(() => {
    if (!isLoading) return;

    // Show loading text
    const loadingTimer = setTimeout(() => {
      Animated.timing(loadingTextOpacity, {
        toValue: 1,
        duration: 600,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start();
    }, 800);

    // Seed pulse animation (breathing effect)
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(seedPulse, {
          toValue: 1.15,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(seedPulse, {
          toValue: 1,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    pulseAnimation.start();

    return () => {
      clearTimeout(loadingTimer);
      pulseAnimation.stop();
    };
  }, [isLoading, loadingTextOpacity, seedPulse]);

  // Phase 3: Trigger completion when loading finishes
  useEffect(() => {
    if (!isLoading) {
      handleComplete();
    }
  }, [isLoading, handleComplete]);

  return (
    <Animated.View style={[styles.container, { opacity: containerOpacity }]}>
      {/* Dark base layer */}
      <View style={styles.darkBase} />

      {/* Radiant glow layer - expands from center */}
      <Animated.View
        style={[
          styles.glowContainer,
          {
            opacity: glowOpacity,
            transform: [{ scale: glowScale }],
          },
        ]}
      >
        <LinearGradient
          colors={[
            'rgba(253, 245, 230, 0.35)', // Warm amber center (FDF5E6)
            'rgba(245, 158, 11, 0.15)',  // Golden accent ring
            'rgba(99, 102, 241, 0.08)',  // Primary indigo fade
            'rgba(15, 15, 15, 0)',       // Transparent to background
          ]}
          locations={[0, 0.3, 0.6, 1]}
          style={styles.glowGradient}
        />
      </Animated.View>

      {/* Central content */}
      <View style={styles.content}>
        {/* Pulsing seed icon */}
        <Animated.View
          style={[
            styles.seedContainer,
            {
              transform: [{ scale: seedPulse }],
            },
          ]}
        >
          <View style={styles.seedGlow}>
            <Ionicons name="leaf" size={32} color={theme.colors.accent} />
          </View>
        </Animated.View>

        {/* Scripture text */}
        <Animated.View
          style={[
            styles.scriptureContainer,
            {
              opacity: scriptureOpacity,
              transform: [{ translateY: scriptureTranslateY }],
            },
          ]}
        >
          <Text style={styles.scriptureText}>
            &ldquo;{ENTRANCE_SCRIPTURE.text}&rdquo;
          </Text>
          <Text style={styles.scriptureReference}>
            — {ENTRANCE_SCRIPTURE.reference}
          </Text>
        </Animated.View>

        {/* Loading text */}
        <Animated.View
          style={[
            styles.loadingContainer,
            { opacity: loadingTextOpacity },
          ]}
        >
          <Text style={styles.loadingText}>Preparing your sanctuary...</Text>
        </Animated.View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  darkBase: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: theme.colors.background,
  },
  glowContainer: {
    position: 'absolute',
    width: width * 2,
    height: width * 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  glowGradient: {
    width: '100%',
    height: '100%',
    borderRadius: width,
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
  },
  seedContainer: {
    marginBottom: theme.spacing.xl,
  },
  seedGlow: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: theme.colors.accentAlpha[20],
    justifyContent: 'center',
    alignItems: 'center',
    // Subtle glow effect
    shadowColor: theme.colors.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  scriptureContainer: {
    alignItems: 'center',
    maxWidth: 320,
  },
  scriptureText: {
    fontSize: theme.fontSize.lg,
    fontStyle: 'italic',
    color: theme.colors.text,
    textAlign: 'center',
    lineHeight: theme.fontSize.lg * 1.6,
    opacity: 0.9,
    letterSpacing: 0.3,
  },
  scriptureReference: {
    marginTop: theme.spacing.md,
    fontSize: theme.fontSize.sm,
    color: theme.colors.accent,
    fontWeight: theme.fontWeight.medium,
    letterSpacing: 1,
  },
  loadingContainer: {
    marginTop: theme.spacing.xxl,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textMuted,
    letterSpacing: 0.5,
  },
});

export default DivineEntranceSplash;
