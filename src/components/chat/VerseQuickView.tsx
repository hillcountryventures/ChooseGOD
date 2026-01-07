/**
 * VerseQuickView - Premium Scripture Quick View Bottom Sheet
 *
 * A beautiful, Bible-forward verse viewer that slides up when
 * users tap scripture references. Features:
 * - Elegant serif typography for scripture
 * - Cross-references section
 * - Action buttons (Journal, Copy, Share)
 * - "Study Deeper with AI" hook
 * - Skeleton loading state
 */

import React, { useCallback, useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Share,
  Platform,
} from 'react-native';
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetScrollView,
} from '@gorhom/bottom-sheet';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as Clipboard from 'expo-clipboard';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { theme } from '../../lib/theme';
import { fetchVerse } from '../../lib/supabase';
import { useStore } from '../../store/useStore';
import { useChatQuota } from '../../hooks/useChatQuota';
import { usePremiumStatus } from '../../hooks/usePremiumStatus';
import { RootStackParamList, Translation } from '../../types';
import { openChatHub, openJournalCompose } from '../../lib/navigationHelpers';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface VerseQuickViewProps {
  bottomSheetRef: React.RefObject<BottomSheet | null>;
  reference: {
    book: string;
    chapter: number;
    verseStart?: number;
    verseEnd?: number;
  } | null;
  onClose: () => void;
}

// Cross-reference data (simplified - in production, fetch from API)
const CROSS_REFERENCES: Record<string, string[]> = {
  'John 3:16': ['Romans 5:8', '1 John 4:9', 'Ephesians 2:4-5'],
  'Philippians 4:13': ['2 Corinthians 12:9', 'Isaiah 40:31', 'Ephesians 3:16'],
  'Jeremiah 29:11': ['Romans 8:28', 'Proverbs 3:5-6', 'Isaiah 55:8-9'],
  'Proverbs 3:5': ['Psalm 37:5', 'Isaiah 26:3', 'Proverbs 16:3'],
  'Romans 8:28': ['Genesis 50:20', 'Ephesians 1:11', 'Philippians 1:6'],
  'Psalm 23:1': ['John 10:11', 'Isaiah 40:11', 'Ezekiel 34:15'],
  'Matthew 11:28': ['John 14:27', 'Hebrews 4:9-10', 'Isaiah 28:12'],
  'Joshua 1:9': ['Deuteronomy 31:6', 'Isaiah 41:10', 'Psalm 27:1'],
  'Isaiah 40:31': ['Psalm 27:14', 'Lamentations 3:25', 'Habakkuk 2:3'],
  'James 1:5': ['Proverbs 2:6', 'Colossians 1:9', '1 Kings 3:9'],
};

// Get cross-references for a verse (fuzzy match)
function getCrossReferences(book: string, chapter: number, verse?: number): string[] {
  const key = verse ? `${book} ${chapter}:${verse}` : `${book} ${chapter}`;

  // Try exact match first
  if (CROSS_REFERENCES[key]) {
    return CROSS_REFERENCES[key];
  }

  // Try with common book name variations
  const variations = [
    key,
    key.replace('Psalms', 'Psalm'),
    key.replace('Psalm', 'Psalms'),
  ];

  for (const variant of variations) {
    if (CROSS_REFERENCES[variant]) {
      return CROSS_REFERENCES[variant];
    }
  }

  // Default related verses for any reference
  return ['Psalm 119:105', 'Proverbs 2:6', '2 Timothy 3:16'];
}

export function VerseQuickView({
  bottomSheetRef,
  reference,
  onClose,
}: VerseQuickViewProps) {
  const navigation = useNavigation<NavigationProp>();
  const preferences = useStore((s) => s.preferences);
  const { hasSeeds, seedsRemaining } = useChatQuota();
  const { showPaywall } = usePremiumStatus();

  const [verseText, setVerseText] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const snapPoints = useMemo(() => ['50%', '80%'], []);

  // Format reference for display
  const displayReference = useMemo(() => {
    if (!reference) return '';
    let ref = `${reference.book} ${reference.chapter}`;
    if (reference.verseStart !== undefined) {
      ref += `:${reference.verseStart}`;
      if (reference.verseEnd && reference.verseEnd !== reference.verseStart) {
        ref += `-${reference.verseEnd}`;
      }
    }
    return ref;
  }, [reference]);

  // Fetch verse when reference changes
  useEffect(() => {
    if (!reference) {
      setVerseText(null);
      return;
    }

    const loadVerse = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const verse = await fetchVerse(
          reference.book,
          reference.chapter,
          reference.verseStart || 1,
          preferences.preferredTranslation
        );

        if (verse) {
          setVerseText(verse.text);
        } else {
          setError('Verse not found');
        }
      } catch (err) {
        console.error('[VerseQuickView] Error fetching verse:', err);
        setError('Unable to load verse');
      } finally {
        setIsLoading(false);
      }
    };

    loadVerse();
  }, [reference, preferences.preferredTranslation]);

  // Cross-references
  const crossRefs = useMemo(() => {
    if (!reference) return [];
    return getCrossReferences(
      reference.book,
      reference.chapter,
      reference.verseStart
    );
  }, [reference]);

  const handleCopy = useCallback(async () => {
    if (!verseText) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await Clipboard.setStringAsync(`"${verseText}" — ${displayReference}`);
    // Could show a toast here
  }, [verseText, displayReference]);

  const handleShare = useCallback(async () => {
    if (!verseText) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      await Share.share({
        message: `"${verseText}"\n\n— ${displayReference}\n\nShared from ChooseGOD`,
      });
    } catch (err) {
      console.error('Share failed:', err);
    }
  }, [verseText, displayReference]);

  const handleJournal = useCallback(() => {
    if (!reference || !verseText) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onClose();

    openJournalCompose(navigation, {
      verse: {
        book: reference.book,
        chapter: reference.chapter,
        verse: reference.verseStart || 1,
        text: verseText,
        translation: preferences.preferredTranslation,
      },
      source: { type: 'bible_reading' },
    });
  }, [reference, verseText, preferences.preferredTranslation, navigation, onClose]);

  const handleReadFullChapter = useCallback(() => {
    if (!reference) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onClose();

    navigation.navigate('Main', {
      screen: 'Bible',
      params: {
        book: reference.book,
        chapter: reference.chapter,
        verse: reference.verseStart,
      },
    } as any);
  }, [reference, navigation, onClose]);

  const handleStudyDeeper = useCallback(() => {
    if (!reference || !verseText) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    if (!hasSeeds) {
      showPaywall();
      return;
    }

    onClose();
    openChatHub(navigation, {
      contextVerse: {
        book: reference.book,
        chapter: reference.chapter,
        verse: reference.verseStart || 1,
        text: verseText,
        translation: preferences.preferredTranslation,
      },
      initialMessage: `Tell me more about the original Greek/Hebrew meaning and historical context of ${displayReference}`,
    });
  }, [reference, verseText, displayReference, hasSeeds, showPaywall, navigation, onClose, preferences.preferredTranslation]);

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.5}
      />
    ),
    []
  );

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={-1}
      snapPoints={snapPoints}
      enablePanDownToClose
      backdropComponent={renderBackdrop}
      onClose={onClose}
      backgroundStyle={styles.sheetBackground}
      handleIndicatorStyle={styles.handleIndicator}
    >
      <BottomSheetScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Ionicons name="book" size={20} color={theme.colors.primary} />
            <Text style={styles.referenceText}>{displayReference}</Text>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={theme.colors.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Verse Content */}
        <View style={styles.verseCard}>
          {isLoading ? (
            <View style={styles.skeleton}>
              <View style={[styles.skeletonLine, { width: '100%' }]} />
              <View style={[styles.skeletonLine, { width: '90%' }]} />
              <View style={[styles.skeletonLine, { width: '75%' }]} />
            </View>
          ) : error ? (
            <Text style={styles.errorText}>{error}</Text>
          ) : (
            <Text style={styles.verseText}>"{verseText}"</Text>
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.actionButton} onPress={handleJournal}>
            <View style={styles.actionIcon}>
              <Ionicons name="create-outline" size={20} color={theme.colors.primary} />
            </View>
            <Text style={styles.actionLabel}>Journal</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={handleCopy}>
            <View style={styles.actionIcon}>
              <Ionicons name="copy-outline" size={20} color={theme.colors.primary} />
            </View>
            <Text style={styles.actionLabel}>Copy</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
            <View style={styles.actionIcon}>
              <Ionicons name="share-outline" size={20} color={theme.colors.primary} />
            </View>
            <Text style={styles.actionLabel}>Share</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={handleReadFullChapter}>
            <View style={styles.actionIcon}>
              <Ionicons name="book-outline" size={20} color={theme.colors.primary} />
            </View>
            <Text style={styles.actionLabel}>Chapter</Text>
          </TouchableOpacity>
        </View>

        {/* Cross References */}
        {crossRefs.length > 0 && (
          <View style={styles.crossRefSection}>
            <Text style={styles.sectionTitle}>Related Scriptures</Text>
            <View style={styles.crossRefList}>
              {crossRefs.map((ref, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.crossRefChip}
                  onPress={() => {
                    // Parse and navigate to this verse
                    const match = ref.match(/^(.+)\s+(\d+):?(\d+)?/);
                    if (match) {
                      onClose();
                      navigation.navigate('Main', {
                        screen: 'Bible',
                        params: {
                          book: match[1],
                          chapter: parseInt(match[2], 10),
                          verse: match[3] ? parseInt(match[3], 10) : undefined,
                        },
                      } as any);
                    }
                  }}
                >
                  <Ionicons name="link" size={14} color={theme.colors.primary} />
                  <Text style={styles.crossRefText}>{ref}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Study Deeper with AI */}
        <View style={styles.studyDeeperSection}>
          <Text style={styles.sectionTitle}>Go Deeper</Text>
          <TouchableOpacity
            style={[
              styles.studyDeeperButton,
              !hasSeeds && styles.studyDeeperButtonLocked,
            ]}
            onPress={handleStudyDeeper}
            activeOpacity={0.8}
          >
            <View style={styles.studyDeeperContent}>
              <View style={styles.studyDeeperIcon}>
                <Ionicons
                  name={hasSeeds ? 'sparkles' : 'lock-closed'}
                  size={24}
                  color={hasSeeds ? '#fff' : theme.colors.textMuted}
                />
              </View>
              <View style={styles.studyDeeperText}>
                <Text style={styles.studyDeeperTitle}>
                  {hasSeeds ? 'Study with AI' : 'Unlock AI Study'}
                </Text>
                <Text style={styles.studyDeeperSubtitle}>
                  {hasSeeds
                    ? 'Explore Greek/Hebrew roots & historical context'
                    : 'Premium feature • Get unlimited access'}
                </Text>
              </View>
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={hasSeeds ? 'rgba(255,255,255,0.8)' : theme.colors.textMuted}
            />
          </TouchableOpacity>
        </View>
      </BottomSheetScrollView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  sheetBackground: {
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  handleIndicator: {
    backgroundColor: theme.colors.border,
    width: 40,
  },
  content: {
    padding: theme.spacing.lg,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  referenceText: {
    fontSize: theme.fontSize.xl,
    fontWeight: '700',
    color: theme.colors.text,
  },
  closeButton: {
    padding: theme.spacing.xs,
  },
  verseCard: {
    backgroundColor: '#FFFDF5', // Soft cream/parchment
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.xl,
    borderWidth: 1,
    borderColor: '#E8E1D3',
    marginBottom: theme.spacing.lg,
  },
  verseText: {
    fontSize: 20,
    lineHeight: 32,
    color: '#2D2A26',
    fontFamily: Platform.OS === 'ios' ? 'Baskerville' : 'serif',
    fontStyle: 'italic',
  },
  skeleton: {
    gap: theme.spacing.sm,
  },
  skeletonLine: {
    height: 20,
    backgroundColor: theme.colors.border,
    borderRadius: 4,
  },
  errorText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.error,
    textAlign: 'center',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: theme.spacing.xl,
  },
  actionButton: {
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.primaryAlpha[10],
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionLabel: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  crossRefSection: {
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: theme.fontSize.sm,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  crossRefList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  crossRefChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: theme.colors.surface,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  crossRefText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.primary,
    fontWeight: '500',
  },
  studyDeeperSection: {
    marginBottom: theme.spacing.md,
  },
  studyDeeperButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    ...theme.shadows.sm,
  },
  studyDeeperButtonLocked: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  studyDeeperContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  studyDeeperIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  studyDeeperText: {
    flex: 1,
  },
  studyDeeperTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: '600',
    color: '#fff',
  },
  studyDeeperSubtitle: {
    fontSize: theme.fontSize.xs,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
});
