/**
 * DrawNearBanner Component
 *
 * A rotating verse banner focused exclusively on drawing nearer to God.
 * Displays at the top of the Devotional Hub to set the spiritual tone.
 *
 * Philosophy: "We are not God, only helping others find HIM"
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { theme } from '../../lib/theme';
import { getTodaysDrawNearVerse, DrawNearVerse } from '../../data/drawNearVerses';
import { parseReference } from '../../lib/verseParser';
import { navigateToBibleVerse } from '../../lib/navigationHelpers';
import type { RootStackParamList, BottomTabParamList } from '../../types';

type AnyNavigation = NavigationProp<RootStackParamList & BottomTabParamList>;

interface DrawNearBannerProps {
  /**
   * Optional: Override the verse (useful for testing)
   */
  verse?: DrawNearVerse;

  /**
   * Optional callback when the verse is pressed
   */
  onPress?: () => void;
}

export function DrawNearBanner({ verse, onPress }: DrawNearBannerProps) {
  const navigation = useNavigation<AnyNavigation>();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const todaysVerse = verse || getTodaysDrawNearVerse();

  useEffect(() => {
    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  const handlePress = () => {
    if (onPress) {
      onPress();
      return;
    }

    // Navigate to the verse in the Bible reader
    const parsed = parseReference(todaysVerse.reference);
    if (parsed) {
      navigateToBibleVerse(navigation, parsed.book, parsed.chapter, parsed.verse);
    }
  };

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <TouchableOpacity
        onPress={handlePress}
        activeOpacity={0.85}
        accessibilityRole="button"
        accessibilityLabel={`Today's verse: ${todaysVerse.text} - ${todaysVerse.reference}. Tap to open in Bible.`}
        accessibilityHint="Opens this verse in the Bible reader"
      >
        <LinearGradient
          colors={['rgba(245, 158, 11, 0.15)', 'rgba(217, 119, 6, 0.08)']}
          style={styles.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Ionicons name="sparkles" size={14} color={theme.colors.accent} />
              <Text style={styles.headerText}>DRAW NEAR</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={theme.colors.textMuted} />
          </View>

          {/* Verse Text */}
          <Text style={styles.verseText}>"{todaysVerse.text}"</Text>

          {/* Reference */}
          <View style={styles.referenceRow}>
            <Text style={styles.reference}>— {todaysVerse.reference}</Text>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.accent + '30',
  },
  gradient: {
    padding: theme.spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.sm,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  headerText: {
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.accent,
    letterSpacing: 1.5,
  },
  verseText: {
    fontSize: theme.fontSize.md,
    fontStyle: 'italic',
    color: theme.colors.text,
    lineHeight: 24,
    marginBottom: theme.spacing.sm,
  },
  referenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  reference: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.accent,
  },
});

export default DrawNearBanner;
