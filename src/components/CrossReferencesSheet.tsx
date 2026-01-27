import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Animated,
  Dimensions,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '../lib/theme';
import { useCrossReferences, CrossReference, GroupedCrossReferences } from '../hooks/useCrossReferences';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface CrossReferencesSheetProps {
  visible: boolean;
  onClose: () => void;
  /** The verse to show cross-references for */
  book: string;
  chapter: number;
  verse: number;
  verseText: string;
  /** Called when user taps a cross-reference to navigate */
  onNavigate: (book: string, chapter: number, verse: number) => void;
}

/**
 * A bottom sheet that reveals connected Scripture passages
 * 
 * Design Philosophy:
 * - Make connections feel like discovery, not academic study
 * - Group by book to show the breadth of connections
 * - Visual hierarchy based on relevance (votes)
 */
export function CrossReferencesSheet({
  visible,
  onClose,
  book,
  chapter,
  verse,
  verseText,
  onNavigate,
}: CrossReferencesSheetProps) {
  const insets = useSafeAreaInsets();
  const { fetchByReference, groupedRefs, isLoading, error, clear } = useCrossReferences();
  
  // Animation for slide-up
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  // Fetch cross-references when sheet opens
  useEffect(() => {
    if (visible) {
      fetchByReference(book, chapter, verse, 15);
      
      // Animate in
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          tension: 65,
          friction: 11,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      clear();
    }
  }, [visible, book, chapter, verse]);

  const handleClose = () => {
    // Animate out
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: SCREEN_HEIGHT,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  };

  const handleNavigate = (ref: CrossReference) => {
    handleClose();
    // Small delay to let the sheet close smoothly
    setTimeout(() => {
      onNavigate(ref.book, ref.chapter, ref.verse);
    }, 300);
  };

  /**
   * Format a verse reference for display
   */
  const formatRef = (ref: CrossReference): string => {
    return `${ref.book} ${ref.chapter}:${ref.verse}`;
  };

  /**
   * Get a connection type label based on direction and votes
   */
  const getConnectionLabel = (ref: CrossReference): string => {
    if (ref.votes >= 3) return 'Strong connection';
    if (ref.direction === 'to') return 'Referenced';
    return 'Related';
  };

  /**
   * Get icon for connection strength
   */
  const getConnectionIcon = (ref: CrossReference): string => {
    if (ref.votes >= 3) return 'link';
    if (ref.votes >= 2) return 'git-branch';
    return 'arrow-forward';
  };

  const renderReferenceCard = (ref: CrossReference) => (
    <Pressable
      key={`${ref.book}-${ref.chapter}-${ref.verse}`}
      style={({ pressed }) => [
        styles.referenceCard,
        pressed && styles.referenceCardPressed,
      ]}
      onPress={() => handleNavigate(ref)}
    >
      <View style={styles.referenceHeader}>
        <View style={styles.referenceRefContainer}>
          <Ionicons
            name={getConnectionIcon(ref) as 'link' | 'git-branch' | 'arrow-forward'}
            size={14}
            color={theme.colors.primary}
            style={styles.connectionIcon}
          />
          <Text style={styles.referenceRef}>{formatRef(ref)}</Text>
        </View>
        <View style={styles.connectionBadge}>
          <Text style={styles.connectionLabel}>{getConnectionLabel(ref)}</Text>
        </View>
      </View>
      <Text style={styles.referenceText} numberOfLines={3}>
        &ldquo;{ref.text}&rdquo;
      </Text>
      <View style={styles.tapHint}>
        <Text style={styles.tapHintText}>Tap to explore</Text>
        <Ionicons name="chevron-forward" size={12} color={theme.colors.textMuted} />
      </View>
    </Pressable>
  );

  const renderGroup = (group: GroupedCrossReferences, index: number) => (
    <Animated.View
      key={group.book}
      style={[
        styles.bookGroup,
        {
          // Stagger animation for each group
          opacity: slideAnim.interpolate({
            inputRange: [0, SCREEN_HEIGHT * 0.3],
            outputRange: [1, 0],
            extrapolate: 'clamp',
          }),
          transform: [{
            translateY: slideAnim.interpolate({
              inputRange: [0, SCREEN_HEIGHT * 0.5],
              outputRange: [0, 20 + index * 10],
              extrapolate: 'clamp',
            }),
          }],
        },
      ]}
    >
      <View style={styles.bookHeader}>
        <Ionicons name="book" size={16} color={theme.colors.accent} />
        <Text style={styles.bookName}>{group.book}</Text>
        <Text style={styles.refCount}>
          {group.references.length} {group.references.length === 1 ? 'verse' : 'verses'}
        </Text>
      </View>
      {group.references.map(renderReferenceCard)}
    </Animated.View>
  );

  const renderContent = () => {
    if (isLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Discovering connections...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons name="alert-circle" size={48} color={theme.colors.error} />
          <Text style={styles.emptyTitle}>Couldn&apos;t load references</Text>
          <Text style={styles.emptySubtitle}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => fetchByReference(book, chapter, verse, 15)}
          >
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (groupedRefs.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons name="git-network" size={48} color={theme.colors.textMuted} />
          <Text style={styles.emptyTitle}>No cross-references found</Text>
          <Text style={styles.emptySubtitle}>
            This verse may not have recorded connections in our database yet.
          </Text>
        </View>
      );
    }

    const totalRefs = groupedRefs.reduce((sum, g) => sum + g.references.length, 0);

    return (
      <>
        <View style={styles.discoveryBanner}>
          <Ionicons name="sparkles" size={20} color={theme.colors.accent} />
          <Text style={styles.discoveryText}>
            {totalRefs} connected {totalRefs === 1 ? 'passage' : 'passages'} across{' '}
            {groupedRefs.length} {groupedRefs.length === 1 ? 'book' : 'books'}
          </Text>
        </View>
        <ScrollView
          style={styles.refsScrollView}
          contentContainerStyle={styles.refsContent}
          showsVerticalScrollIndicator={false}
        >
          {groupedRefs.map(renderGroup)}
          <View style={{ height: insets.bottom + 20 }} />
        </ScrollView>
      </>
    );
  };

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={handleClose}>
      <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={handleClose} />
      </Animated.View>
      
      <Animated.View
        style={[
          styles.sheet,
          {
            paddingBottom: insets.bottom,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        {/* Handle */}
        <View style={styles.handleContainer}>
          <View style={styles.handle} />
        </View>

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.headerIcon}>
              <Ionicons name="git-network" size={24} color={theme.colors.primary} />
            </View>
            <View style={styles.headerText}>
              <Text style={styles.title}>Connected Scripture</Text>
              <Text style={styles.sourceVerse}>
                {book} {chapter}:{verse}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={handleClose}
            hitSlop={{ top: 12, right: 12, bottom: 12, left: 12 }}
          >
            <Ionicons name="close" size={24} color={theme.colors.text} />
          </TouchableOpacity>
        </View>

        {/* Source verse preview */}
        <View style={styles.sourcePreview}>
          <Text style={styles.sourceText} numberOfLines={2}>
            &ldquo;{verseText}&rdquo;
          </Text>
        </View>

        {/* Content */}
        {renderContent()}
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    maxHeight: SCREEN_HEIGHT * 0.85,
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
  },
  handleContainer: {
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
  },
  handle: {
    width: 36,
    height: 4,
    backgroundColor: theme.colors.border,
    borderRadius: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.primaryAlpha[15],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
  },
  sourceVerse: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  sourcePreview: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    marginHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.primary,
  },
  sourceText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
    lineHeight: theme.fontSize.md * 1.5,
  },
  discoveryBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  discoveryText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.accent,
    fontWeight: theme.fontWeight.medium,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.xxl,
    gap: theme.spacing.md,
  },
  loadingText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textMuted,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.xxl,
    paddingHorizontal: theme.spacing.xl,
    gap: theme.spacing.sm,
  },
  emptyTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textMuted,
    textAlign: 'center',
    lineHeight: theme.fontSize.md * 1.5,
  },
  retryButton: {
    marginTop: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.full,
  },
  retryButtonText: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.medium,
    color: '#fff',
  },
  refsScrollView: {
    flex: 1,
  },
  refsContent: {
    paddingHorizontal: theme.spacing.lg,
  },
  bookGroup: {
    marginBottom: theme.spacing.lg,
  },
  bookHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  bookName: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
    flex: 1,
  },
  refCount: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textMuted,
  },
  referenceCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  referenceCardPressed: {
    backgroundColor: theme.colors.cardHover,
    borderColor: theme.colors.primary,
  },
  referenceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.sm,
  },
  referenceRefContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  connectionIcon: {
    marginRight: theme.spacing.xs,
  },
  referenceRef: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.primary,
  },
  connectionBadge: {
    backgroundColor: theme.colors.primaryAlpha[15],
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
  },
  connectionLabel: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.primary,
    fontWeight: theme.fontWeight.medium,
  },
  referenceText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    lineHeight: theme.fontSize.md * 1.5,
    marginBottom: theme.spacing.sm,
  },
  tapHint: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: theme.spacing.xs,
  },
  tapHintText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textMuted,
  },
});

export default CrossReferencesSheet;
