/**
 * GraceSummaryModal - Displays AI-generated summary of missed readings
 *
 * This modal is shown after the Grace Path AI generates a summary of the
 * chapters the user missed. It presents the content in a spiritually
 * nourishing way that encourages continued reading.
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Animated,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { theme } from '../lib/theme';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

// ============================================================================
// Types
// ============================================================================

export interface GraceSummaryData {
  summary: string;
  daysCovered: number;
  chaptersCovered: string[];
}

interface GraceSummaryModalProps {
  visible: boolean;
  isLoading?: boolean;
  error?: string | null;
  summaryData?: GraceSummaryData | null;
  onContinueReading: () => void;
  onClose: () => void;
}

// ============================================================================
// Summary Section Parser
// ============================================================================

interface ParsedSection {
  title: string;
  content: string;
}

function parseSummary(summary: string): ParsedSection[] {
  const sections: ParsedSection[] = [];

  // Match markdown-style headers: **Title** or ## Title
  const sectionRegex = /(?:\*\*([^*]+)\*\*|##\s*([^\n]+))\s*\n([\s\S]*?)(?=(?:\*\*[^*]+\*\*|##\s*[^\n]+|\Z))/g;

  let match;
  while ((match = sectionRegex.exec(summary)) !== null) {
    const title = (match[1] || match[2] || '').trim();
    const content = (match[3] || '').trim();
    if (title && content) {
      sections.push({ title, content });
    }
  }

  // If no sections found, treat the whole summary as one section
  if (sections.length === 0 && summary.trim()) {
    sections.push({
      title: 'Summary',
      content: summary.trim(),
    });
  }

  return sections;
}

// ============================================================================
// Section Card Component
// ============================================================================

function SectionCard({
  section,
  index,
  animValue,
}: {
  section: ParsedSection;
  index: number;
  animValue: Animated.Value;
}) {
  const icons: { [key: string]: keyof typeof Ionicons.glyphMap } = {
    'The Story So Far': 'book',
    "God's Character Revealed": 'heart',
    'A Word for Your Journey': 'sunny',
    'Summary': 'document-text',
  };

  const iconName = icons[section.title] || 'document-text';

  const translateY = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: [30, 0],
  });

  const opacity = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  return (
    <Animated.View
      style={[
        styles.sectionCard,
        {
          transform: [{ translateY }],
          opacity,
        },
      ]}
    >
      <View style={styles.sectionHeader}>
        <View style={styles.sectionIcon}>
          <Ionicons name={iconName} size={16} color={theme.colors.accent} />
        </View>
        <Text style={styles.sectionTitle}>{section.title}</Text>
      </View>
      <Text style={styles.sectionContent}>{section.content}</Text>
    </Animated.View>
  );
}

// ============================================================================
// Loading State
// ============================================================================

function LoadingState() {
  const pulseAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.3,
          duration: 1200,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [pulseAnim]);

  return (
    <View style={styles.loadingContainer}>
      <Animated.View style={[styles.loadingIcon, { opacity: pulseAnim }]}>
        <Ionicons name="sparkles" size={48} color={theme.colors.accent} />
      </Animated.View>
      <Text style={styles.loadingTitle}>Preparing Your Grace Path</Text>
      <Text style={styles.loadingSubtitle}>
        Creating a thoughtful summary of your missed readings...
      </Text>
      <ActivityIndicator
        size="large"
        color={theme.colors.primary}
        style={styles.loadingSpinner}
      />
    </View>
  );
}

// ============================================================================
// Error State
// ============================================================================

function ErrorState({
  error,
  onRetry,
  onClose,
}: {
  error: string;
  onRetry?: () => void;
  onClose: () => void;
}) {
  return (
    <View style={styles.errorContainer}>
      <View style={styles.errorIcon}>
        <Ionicons name="alert-circle" size={48} color={theme.colors.error} />
      </View>
      <Text style={styles.errorTitle}>Something Went Wrong</Text>
      <Text style={styles.errorMessage}>{error}</Text>
      <View style={styles.errorActions}>
        {onRetry && (
          <TouchableOpacity
            style={styles.retryButton}
            onPress={onRetry}
            activeOpacity={0.8}
          >
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={styles.dismissButton}
          onPress={onClose}
          activeOpacity={0.8}
        >
          <Text style={styles.dismissButtonText}>Close</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ============================================================================
// Main GraceSummaryModal Component
// ============================================================================

export default function GraceSummaryModal({
  visible,
  isLoading = false,
  error = null,
  summaryData,
  onContinueReading,
  onClose,
}: GraceSummaryModalProps) {
  const slideAnim = useRef(new Animated.Value(0)).current;
  const contentAnim = useRef(new Animated.Value(0)).current;

  // Animate modal entrance
  useEffect(() => {
    if (visible) {
      Animated.sequence([
        Animated.timing(slideAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(contentAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      slideAnim.setValue(0);
      contentAnim.setValue(0);
    }
  }, [visible, slideAnim, contentAnim]);

  const translateY = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [SCREEN_HEIGHT, 0],
  });

  const parsedSections = summaryData ? parseSummary(summaryData.summary) : [];

  return (
    <Modal
      visible={visible}
      animationType="none"
      transparent
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <BlurView intensity={20} style={styles.overlay} tint="dark">
        <Animated.View
          style={[
            styles.modalContainer,
            { transform: [{ translateY }] },
          ]}
        >
          {/* Header with gradient */}
          <LinearGradient
            colors={[theme.colors.accent + '30', 'transparent'] as [string, string]}
            style={styles.headerGradient}
          >
            <View style={styles.header}>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={onClose}
                activeOpacity={0.7}
              >
                <Ionicons name="close" size={24} color={theme.colors.text} />
              </TouchableOpacity>

              <View style={styles.headerContent}>
                <View style={styles.headerIcon}>
                  <Ionicons name="sparkles" size={24} color={theme.colors.accent} />
                </View>
                <Text style={styles.headerTitle}>Grace Path</Text>
                {summaryData && (
                  <Text style={styles.headerSubtitle}>
                    {summaryData.daysCovered} day{summaryData.daysCovered > 1 ? 's' : ''} covered
                  </Text>
                )}
              </View>
            </View>
          </LinearGradient>

          {/* Content */}
          <ScrollView
            style={styles.content}
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={false}
          >
            {isLoading ? (
              <LoadingState />
            ) : error ? (
              <ErrorState error={error} onClose={onClose} />
            ) : summaryData ? (
              <>
                {/* Chapters covered badge */}
                {summaryData.chaptersCovered.length > 0 && (
                  <View style={styles.chaptersBadge}>
                    <Ionicons
                      name="book-outline"
                      size={14}
                      color={theme.colors.textSecondary}
                    />
                    <Text style={styles.chaptersText}>
                      {summaryData.chaptersCovered.slice(0, 3).join(', ')}
                      {summaryData.chaptersCovered.length > 3 &&
                        ` +${summaryData.chaptersCovered.length - 3} more`}
                    </Text>
                  </View>
                )}

                {/* Summary sections */}
                {parsedSections.map((section, index) => (
                  <SectionCard
                    key={index}
                    section={section}
                    index={index}
                    animValue={contentAnim}
                  />
                ))}

                {/* Encouragement footer */}
                <Animated.View
                  style={[
                    styles.encouragementCard,
                    { opacity: contentAnim },
                  ]}
                >
                  <Ionicons
                    name="heart"
                    size={20}
                    color={theme.colors.success}
                  />
                  <Text style={styles.encouragementText}>
                    You&apos;re all caught up! Continue your journey with today&apos;s reading.
                  </Text>
                </Animated.View>
              </>
            ) : null}
          </ScrollView>

          {/* Footer CTA */}
          {!isLoading && !error && summaryData && (
            <View style={styles.footer}>
              <TouchableOpacity
                style={styles.continueButton}
                onPress={onContinueReading}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={[theme.colors.success, '#16A34A'] as [string, string]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.continueButtonGradient}
                >
                  <Text style={styles.continueButtonText}>
                    Continue Reading
                  </Text>
                  <Ionicons name="arrow-forward" size={18} color="#fff" />
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}
        </Animated.View>
      </BlurView>
    </Modal>
  );
}

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContainer: {
    flex: 1,
    marginTop: 60,
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
    overflow: 'hidden',
  },

  // Header
  headerGradient: {
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.lg,
  },
  header: {
    paddingHorizontal: theme.spacing.lg,
  },
  closeButton: {
    position: 'absolute',
    right: theme.spacing.lg,
    top: 0,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  headerContent: {
    alignItems: 'center',
    paddingTop: theme.spacing.lg,
  },
  headerIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.colors.accentAlpha[20],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  headerTitle: {
    fontSize: theme.fontSize.xxl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  headerSubtitle: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },

  // Content
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: theme.spacing.lg,
    paddingBottom: 100,
  },

  // Chapters badge
  chaptersBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.xs,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: theme.colors.backgroundSecondary,
    borderRadius: theme.borderRadius.full,
    alignSelf: 'center',
    marginBottom: theme.spacing.lg,
  },
  chaptersText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },

  // Section cards
  sectionCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  sectionIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.accentAlpha[15],
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.accent,
    flex: 1,
  },
  sectionContent: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    lineHeight: 24,
  },

  // Encouragement card
  encouragementCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.successAlpha[20],
    borderRadius: theme.borderRadius.lg,
    marginTop: theme.spacing.sm,
  },
  encouragementText: {
    flex: 1,
    fontSize: theme.fontSize.sm,
    color: theme.colors.success,
    fontWeight: theme.fontWeight.medium,
  },

  // Footer
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
    backgroundColor: theme.colors.background,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  continueButton: {
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
  },
  continueButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  continueButtonText: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.bold,
    color: '#fff',
  },

  // Loading state
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xxl,
  },
  loadingIcon: {
    marginBottom: theme.spacing.lg,
  },
  loadingTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  loadingSubtitle: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: theme.spacing.xl,
    marginBottom: theme.spacing.lg,
  },
  loadingSpinner: {
    marginTop: theme.spacing.md,
  },

  // Error state
  errorContainer: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xxl,
  },
  errorIcon: {
    marginBottom: theme.spacing.md,
  },
  errorTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  errorMessage: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: theme.spacing.xl,
    marginBottom: theme.spacing.lg,
  },
  errorActions: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  retryButton: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
  },
  retryButtonText: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold,
    color: '#fff',
  },
  dismissButton: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    backgroundColor: theme.colors.backgroundSecondary,
    borderRadius: theme.borderRadius.md,
  },
  dismissButtonText: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.textSecondary,
  },
});
