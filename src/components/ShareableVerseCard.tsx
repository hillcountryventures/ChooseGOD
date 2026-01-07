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
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import * as Haptics from 'expo-haptics';
import * as Speech from 'expo-speech';
import { theme } from '../lib/theme';
import { VerseSource, Translation } from '../types';
import { fetchVerseParallel } from '../lib/supabase';
import { usePremiumStatus } from '../hooks/usePremiumStatus';

// Default translations to compare (English versions available in DB)
const COMPARE_TRANSLATIONS: Translation[] = ['KJV', 'ASV', 'BBE'];

interface ShareableVerseCardProps {
  source: VerseSource;
  onPress?: () => void;
  showShareButton?: boolean;
  compact?: boolean;
  /** Optional: Allow selecting a specific gradient index */
  gradientIndex?: number;
  /** Optional: Show gradient picker UI */
  showGradientPicker?: boolean;
  /** Optional: Callback when gradient is changed */
  onGradientChange?: (index: number) => void;
}

export function ShareableVerseCard({
  source,
  onPress,
  showShareButton = true,
  compact = false,
  gradientIndex: propGradientIndex,
  showGradientPicker = false,
  onGradientChange,
}: ShareableVerseCardProps) {
  const viewShotRef = useRef<View>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showParallel, setShowParallel] = useState(false);
  const [parallelVerses, setParallelVerses] = useState<VerseSource[]>([]);
  const [isLoadingParallel, setIsLoadingParallel] = useState(false);
  const [selectedGradientIndex, setSelectedGradientIndex] = useState<number | null>(null);

  // Get available gradients based on premium status
  const { isPremium, availableGradients, showPaywall } = usePremiumStatus();

  // Calculate default gradient index based on verse (for consistency)
  const defaultGradientIndex =
    (source.book.charCodeAt(0) + source.chapter + source.verse) %
    availableGradients.length;

  // Use prop > local state > default
  const currentGradientIndex = propGradientIndex ?? selectedGradientIndex ?? defaultGradientIndex;
  const gradient = availableGradients[currentGradientIndex] || availableGradients[0];

  // Handle gradient selection
  const handleGradientSelect = useCallback((index: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedGradientIndex(index);
    onGradientChange?.(index);
  }, [onGradientChange]);

  // Stop speaking when component unmounts
  useEffect(() => {
    return () => {
      Speech.stop();
    };
  }, []);

  // Handle compare/collapse parallel translations
  const handleCompare = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (showParallel) {
      // Collapse
      setShowParallel(false);
      return;
    }

    // Expand and fetch parallel translations
    setIsLoadingParallel(true);
    setShowParallel(true);

    try {
      const verses = await fetchVerseParallel(
        source.book,
        source.chapter,
        source.verse,
        COMPARE_TRANSLATIONS
      );
      setParallelVerses(verses);
    } catch (error) {
      console.error('Error fetching parallel translations:', error);
      setParallelVerses([]);
    } finally {
      setIsLoadingParallel(false);
    }
  }, [source, showParallel]);

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

          {/* Compare button */}
          <TouchableOpacity
            style={[styles.actionButton, showParallel && styles.actionButtonCompareActive]}
            onPress={handleCompare}
            activeOpacity={0.7}
          >
            <Ionicons
              name={showParallel ? 'chevron-up' : 'git-compare-outline'}
              size={16}
              color={showParallel ? theme.colors.accent : theme.colors.primary}
            />
            <Text style={[styles.actionButtonText, showParallel && styles.actionButtonTextCompare]}>
              {showParallel ? 'Hide' : 'Compare'}
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

      {/* Gradient Picker - shown when enabled */}
      {showGradientPicker && (
        <View style={styles.gradientPickerContainer}>
          <Text style={styles.gradientPickerLabel}>
            Card Style {!isPremium && <Text style={styles.gradientPickerProLabel}>(3 free, 12 with Pro)</Text>}
          </Text>
          <View style={styles.gradientPickerRow}>
            {availableGradients.map((grad, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.gradientPickerSwatch,
                  currentGradientIndex === index && styles.gradientPickerSwatchSelected,
                ]}
                onPress={() => handleGradientSelect(index)}
                activeOpacity={0.7}
              >
                <LinearGradient
                  colors={grad}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.gradientPickerSwatchInner}
                />
              </TouchableOpacity>
            ))}
            {/* Show "more" button for free users */}
            {!isPremium && (
              <TouchableOpacity
                style={styles.gradientPickerMoreButton}
                onPress={showPaywall}
                activeOpacity={0.7}
              >
                <Ionicons name="add" size={16} color={theme.colors.accent} />
                <Text style={styles.gradientPickerMoreText}>+9</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}

      {/* Parallel Translations Panel */}
      {showParallel && (
        <View style={styles.parallelContainer}>
          {isLoadingParallel ? (
            <View style={styles.parallelLoading}>
              <ActivityIndicator size="small" color={theme.colors.primary} />
              <Text style={styles.parallelLoadingText}>Loading translations...</Text>
            </View>
          ) : parallelVerses.length === 0 ? (
            <Text style={styles.parallelEmptyText}>
              No additional translations available for this verse.
            </Text>
          ) : (
            parallelVerses.map((verse, index) => (
              <View
                key={verse.translation}
                style={[
                  styles.parallelVerse,
                  index < parallelVerses.length - 1 && styles.parallelVerseBorder,
                ]}
              >
                <View style={styles.parallelHeader}>
                  <Text style={styles.parallelTranslation}>{verse.translation}</Text>
                  {verse.translation === source.translation && (
                    <View style={styles.currentBadge}>
                      <Text style={styles.currentBadgeText}>Current</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.parallelText}>{verse.text}</Text>
              </View>
            ))
          )}
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
    backgroundColor: theme.colors.errorAlpha?.[20] || 'rgba(239, 68, 68, 0.1)',
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
  actionButtonCompareActive: {
    backgroundColor: theme.colors.accentAlpha?.[10] || 'rgba(251, 191, 36, 0.1)',
    borderRadius: theme.borderRadius.full,
  },
  actionButtonTextCompare: {
    color: theme.colors.accent,
  },
  // Parallel translations panel
  parallelContainer: {
    marginTop: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    overflow: 'hidden',
    maxWidth: 340,
  },
  parallelLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  parallelLoadingText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textMuted,
  },
  parallelEmptyText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textMuted,
    padding: theme.spacing.md,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  parallelVerse: {
    padding: theme.spacing.md,
  },
  parallelVerseBorder: {
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  parallelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.xs,
  },
  parallelTranslation: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.accent,
  },
  currentBadge: {
    backgroundColor: theme.colors.primaryAlpha?.[20] || 'rgba(99, 102, 241, 0.2)',
    paddingHorizontal: theme.spacing.xs,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.sm,
  },
  currentBadgeText: {
    fontSize: 10,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.primary,
  },
  parallelText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text,
    lineHeight: theme.fontSize.sm * 1.6,
    fontStyle: 'italic',
  },
  // Gradient picker styles
  gradientPickerContainer: {
    marginTop: theme.spacing.md,
    maxWidth: 340,
  },
  gradientPickerLabel: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textMuted,
    marginBottom: theme.spacing.xs,
    fontWeight: theme.fontWeight.medium,
  },
  gradientPickerProLabel: {
    color: theme.colors.accent,
    fontWeight: theme.fontWeight.normal,
  },
  gradientPickerRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.xs,
  },
  gradientPickerSwatch: {
    width: 32,
    height: 32,
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  gradientPickerSwatchSelected: {
    borderColor: theme.colors.accent,
  },
  gradientPickerSwatchInner: {
    flex: 1,
    borderRadius: theme.borderRadius.md - 2,
  },
  gradientPickerMoreButton: {
    width: 32,
    height: 32,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.accentAlpha?.[20] || 'rgba(251, 191, 36, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 2,
  },
  gradientPickerMoreText: {
    fontSize: 10,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.accent,
  },
});

export default ShareableVerseCard;
