/**
 * ShareableVerseCard Component
 * Beautiful, shareable verse cards that transform Scripture citations
 * into stunning visuals users can share
 *
 * Philosophy: "We are not God, only helping others find HIM"
 * Every shared verse is a seed planted in someone's heart
 */

import React, { useRef, useCallback, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Alert,
  Share,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import * as Haptics from 'expo-haptics';
import * as Speech from 'expo-speech';
import { theme } from '../lib/theme';
import { VerseSource } from '../types';

interface ShareableVerseCardProps {
  source: VerseSource;
  onPress?: () => void;
  showShareButton?: boolean;
  compact?: boolean;
}

// Card background gradient presets (rotate through for visual variety)
const CARD_GRADIENTS: [string, string][] = [
  ['#1a1a2e', '#16213e'], // Deep blue (default)
  ['#2d1f3d', '#1a1a2e'], // Purple twilight
  ['#1f2d1a', '#1a2e16'], // Forest green
  ['#2d1a1a', '#2e1616'], // Warm ember
  ['#1a2d2d', '#162e2e'], // Teal ocean
];

export function ShareableVerseCard({
  source,
  onPress,
  showShareButton = true,
  compact = false,
}: ShareableVerseCardProps) {
  const viewShotRef = useRef<View>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Pick gradient based on book name hash for consistency
  const gradientIndex =
    (source.book.charCodeAt(0) + source.chapter + source.verse) %
    CARD_GRADIENTS.length;
  const gradient = CARD_GRADIENTS[gradientIndex];

  // Stop speaking when component unmounts
  useEffect(() => {
    return () => {
      Speech.stop();
    };
  }, []);

  // Handle listen/stop action
  const handleListen = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (isSpeaking) {
      // Stop speaking
      await Speech.stop();
      setIsSpeaking(false);
      return;
    }

    // Start speaking
    const textToSpeak = `${source.text} — ${source.book} chapter ${source.chapter}, verse ${source.verse}`;

    setIsSpeaking(true);
    Speech.speak(textToSpeak, {
      language: 'en-US',
      pitch: 1.0,
      rate: 0.85, // Slightly slower for reverence
      onDone: () => setIsSpeaking(false),
      onStopped: () => setIsSpeaking(false),
      onError: () => setIsSpeaking(false),
    });
  }, [source, isSpeaking]);

  // Handle share action
  const handleShare = useCallback(async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      // Check if sharing is available
      const isAvailable = await Sharing.isAvailableAsync();
      if (!isAvailable) {
        // Fallback to text sharing
        const textContent = `"${source.text}"\n\n— ${source.book} ${source.chapter}:${source.verse} (${source.translation.toUpperCase()})\n\nShared from ChooseGOD`;
        await Share.share({ message: textContent });
        return;
      }

      // Capture the card as an image
      if (viewShotRef.current) {
        const uri = await captureRef(viewShotRef, {
          format: 'png',
          quality: 1,
        });

        // Share the image
        await Sharing.shareAsync(uri, {
          mimeType: 'image/png',
          dialogTitle: `Share ${source.book} ${source.chapter}:${source.verse}`,
          UTI: 'public.png',
        });

        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (error) {
      console.error('Error sharing verse card:', error);

      // Fallback to text sharing
      try {
        const textContent = `"${source.text}"\n\n— ${source.book} ${source.chapter}:${source.verse} (${source.translation.toUpperCase()})\n\nShared from ChooseGOD`;
        await Share.share({ message: textContent });
      } catch (fallbackError) {
        console.error('Fallback share failed:', fallbackError);
        Alert.alert('Share Failed', 'Unable to share this verse. Please try again.');
      }
    }
  }, [source]);

  const verseReference = `${source.book} ${source.chapter}:${source.verse}`;
  const translationLabel = source.translation.toUpperCase();

  return (
    <View style={styles.container}>
      {/* Capturable Card */}
      <View ref={viewShotRef} collapsable={false}>
        <TouchableOpacity
          onPress={onPress}
          activeOpacity={onPress ? 0.9 : 1}
          disabled={!onPress}
        >
          <LinearGradient
            colors={gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.card, compact && styles.cardCompact]}
          >
            {/* Decorative elements */}
            <View style={styles.decorativeCornerTL}>
              <Text style={styles.decorativeQuote}>"</Text>
            </View>

            {/* Verse text */}
            <Text
              style={[styles.verseText, compact && styles.verseTextCompact]}
              numberOfLines={compact ? 4 : undefined}
            >
              {source.text}
            </Text>

            {/* Reference & Translation */}
            <View style={styles.referenceRow}>
              <View style={styles.referenceContainer}>
                <Ionicons
                  name="book"
                  size={compact ? 12 : 14}
                  color={theme.colors.primary}
                  style={styles.bookIcon}
                />
                <Text style={[styles.reference, compact && styles.referenceCompact]}>
                  {verseReference}
                </Text>
              </View>
              <Text style={[styles.translation, compact && styles.translationCompact]}>
                {translationLabel}
              </Text>
            </View>

            {/* App branding for shared images */}
            <View style={styles.branding}>
              <Text style={styles.brandingText}>ChooseGOD</Text>
            </View>

            {/* Decorative bottom corner */}
            <View style={styles.decorativeCornerBR}>
              <Text style={styles.decorativeQuote}>"</Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Action buttons (outside ViewShot so they're not captured) */}
      {showShareButton && (
        <View style={styles.actionButtonsRow}>
          {/* Listen button */}
          <TouchableOpacity
            style={[styles.actionButton, isSpeaking && styles.actionButtonActive]}
            onPress={handleListen}
            activeOpacity={0.7}
          >
            <Ionicons
              name={isSpeaking ? 'stop' : 'volume-high-outline'}
              size={16}
              color={isSpeaking ? theme.colors.error : theme.colors.primary}
            />
            <Text style={[styles.actionButtonText, isSpeaking && styles.actionButtonTextActive]}>
              {isSpeaking ? 'Stop' : 'Listen'}
            </Text>
          </TouchableOpacity>

          {/* Share button */}
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleShare}
            activeOpacity={0.7}
          >
            <Ionicons
              name="share-outline"
              size={16}
              color={theme.colors.primary}
            />
            <Text style={styles.actionButtonText}>Share</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: theme.spacing.sm,
    alignItems: 'flex-start',
  },
  card: {
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.xl,
    minWidth: 280,
    maxWidth: 340,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.2)',
    ...theme.shadows.lg,
  },
  cardCompact: {
    padding: theme.spacing.md,
    minWidth: 240,
    maxWidth: 280,
  },
  decorativeCornerTL: {
    position: 'absolute',
    top: theme.spacing.sm,
    left: theme.spacing.md,
    opacity: 0.3,
  },
  decorativeCornerBR: {
    position: 'absolute',
    bottom: theme.spacing.sm,
    right: theme.spacing.md,
    opacity: 0.3,
    transform: [{ rotate: '180deg' }],
  },
  decorativeQuote: {
    fontSize: 48,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    color: theme.colors.primary,
    fontWeight: '300',
  },
  verseText: {
    fontSize: theme.fontSize.lg,
    lineHeight: theme.fontSize.lg * 1.6,
    color: theme.colors.text,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    fontWeight: '300',
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.lg,
    paddingHorizontal: theme.spacing.xs,
  },
  verseTextCompact: {
    fontSize: theme.fontSize.md,
    lineHeight: theme.fontSize.md * 1.5,
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  referenceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  referenceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bookIcon: {
    marginRight: theme.spacing.xs,
  },
  reference: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.primary,
  },
  referenceCompact: {
    fontSize: theme.fontSize.sm,
  },
  translation: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textMuted,
    fontWeight: theme.fontWeight.medium,
  },
  translationCompact: {
    fontSize: theme.fontSize.xs,
  },
  branding: {
    position: 'absolute',
    bottom: 8,
    right: 12,
    opacity: 0.4,
  },
  brandingText: {
    fontSize: 10,
    color: theme.colors.textMuted,
    fontWeight: theme.fontWeight.medium,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    marginTop: theme.spacing.sm,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
  },
  actionButtonActive: {
    backgroundColor: theme.colors.errorAlpha?.[10] || 'rgba(239, 68, 68, 0.1)',
    borderRadius: theme.borderRadius.full,
  },
  actionButtonText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.primary,
    fontWeight: theme.fontWeight.medium,
  },
  actionButtonTextActive: {
    color: theme.colors.error,
  },
});

export default ShareableVerseCard;
