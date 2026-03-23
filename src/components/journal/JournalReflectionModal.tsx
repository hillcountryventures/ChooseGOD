/**
 * JournalReflectionModal - AI-generated reflection on journal entries
 *
 * Premium feature: Synthesizes patterns, themes, and growth from entries.
 * Glass effect design, professional polish.
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { theme } from '../../lib/theme';
import { useJournalPremiumStore } from '../../store/journalPremiumStore';
import { useIsPremium, useSubscriptionStore } from '../../store/subscriptionStore';
import { useStore } from '../../store/useStore';
import { generateJournalReflection } from '../../services/aiReflectionService';
import { logger } from '../../utils/logger';

interface JournalReflectionModalProps {
  visible: boolean;
  onClose: () => void;
}

export function JournalReflectionModal({ visible, onClose }: JournalReflectionModalProps) {
  const insets = useSafeAreaInsets();
  const isPremium = useIsPremium();
  const showPaywall = useSubscriptionStore((s) => s.showPaywall);
  const recentMoments = useStore((s) => s.recentMoments);
  
  const lastReflection = useJournalPremiumStore((s) => s.lastReflection);
  const reflectionLoading = useJournalPremiumStore((s) => s.reflectionLoading);
  const setReflection = useJournalPremiumStore((s) => s.setReflection);
  const setReflectionLoading = useJournalPremiumStore((s) => s.setReflectionLoading);

  const [error, setError] = useState<string | null>(null);

  // Check if reflection is stale (older than 7 days)
  const isStale = lastReflection 
    ? (Date.now() - new Date(lastReflection.generatedAt).getTime()) > 7 * 24 * 60 * 60 * 1000
    : true;

  const handleGenerateReflection = async () => {
    if (!isPremium) {
      onClose();
      showPaywall();
      return;
    }

    if (recentMoments.length < 3) {
      setError('Write at least 3 journal entries to generate a reflection.');
      return;
    }

    setError(null);
    setReflectionLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    try {
      const reflection = await generateJournalReflection(recentMoments.slice(0, 20));
      setReflection({
        generatedAt: new Date().toISOString(),
        ...reflection,
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (err) {
      logger.error('Failed to generate reflection:', err);
      setError('Unable to generate reflection. Please try again.');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setReflectionLoading(false);
    }
  };

  const handleUpgrade = () => {
    onClose();
    showPaywall();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={[styles.overlay, { paddingTop: insets.top }]}>
        <View style={styles.container}>
          <BlurView intensity={80} tint="dark" style={styles.blurContainer}>
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.headerLeft}>
                <Ionicons name="sparkles" size={20} color={theme.colors.primary} />
                <Text style={styles.headerTitle}>AI Reflection</Text>
              </View>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Ionicons name="close" size={24} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView 
              style={styles.content}
              contentContainerStyle={styles.contentContainer}
              showsVerticalScrollIndicator={false}
            >
              {!isPremium ? (
                // Non-premium: Show upgrade prompt
                <View style={styles.upgradeSection}>
                  <View style={styles.premiumBadge}>
                    <Ionicons name="diamond" size={32} color={theme.colors.accent} />
                  </View>
                  <Text style={styles.upgradeTitle}>Unlock AI Reflections</Text>
                  <Text style={styles.upgradeDescription}>
                    Let AI analyze your spiritual journey. Discover patterns, themes, 
                    and areas of growth from your journal entries.
                  </Text>
                  
                  <View style={styles.featureList}>
                    <View style={styles.featureItem}>
                      <Ionicons name="analytics-outline" size={18} color={theme.colors.primary} />
                      <Text style={styles.featureText}>Identify recurring themes</Text>
                    </View>
                    <View style={styles.featureItem}>
                      <Ionicons name="trending-up-outline" size={18} color={theme.colors.primary} />
                      <Text style={styles.featureText}>Track spiritual growth areas</Text>
                    </View>
                    <View style={styles.featureItem}>
                      <Ionicons name="heart-outline" size={18} color={theme.colors.primary} />
                      <Text style={styles.featureText}>Personalized encouragement</Text>
                    </View>
                  </View>

                  <TouchableOpacity style={styles.upgradeButton} onPress={handleUpgrade}>
                    <Text style={styles.upgradeButtonText}>Upgrade to Premium</Text>
                  </TouchableOpacity>
                </View>
              ) : reflectionLoading ? (
                // Loading state
                <View style={styles.loadingSection}>
                  <ActivityIndicator size="large" color={theme.colors.primary} />
                  <Text style={styles.loadingText}>Analyzing your journal...</Text>
                  <Text style={styles.loadingSubtext}>
                    Discovering themes and patterns in your spiritual journey
                  </Text>
                </View>
              ) : lastReflection && !isStale ? (
                // Show reflection
                <View style={styles.reflectionContent}>
                  {/* Main insight */}
                  <View style={styles.insightCard}>
                    <Text style={styles.insightText}>{lastReflection.content}</Text>
                  </View>

                  {/* Themes */}
                  {lastReflection.themes.length > 0 && (
                    <View style={styles.section}>
                      <View style={styles.sectionHeader}>
                        <Ionicons name="bookmark-outline" size={18} color={theme.colors.primary} />
                        <Text style={styles.sectionTitle}>Recurring Themes</Text>
                      </View>
                      <View style={styles.tagList}>
                        {lastReflection.themes.map((theme, i) => (
                          <View key={i} style={styles.tag}>
                            <Text style={styles.tagText}>{theme}</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  )}

                  {/* Growth areas */}
                  {lastReflection.growthAreas.length > 0 && (
                    <View style={styles.section}>
                      <View style={styles.sectionHeader}>
                        <Ionicons name="leaf-outline" size={18} color={theme.colors.success} />
                        <Text style={styles.sectionTitle}>Growth Areas</Text>
                      </View>
                      <View style={styles.growthList}>
                        {lastReflection.growthAreas.map((area, i) => (
                          <View key={i} style={styles.growthItem}>
                            <View style={styles.growthBullet} />
                            <Text style={styles.growthText}>{area}</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  )}

                  {/* Encouragement */}
                  {lastReflection.encouragement && (
                    <LinearGradient
                      colors={[theme.colors.primaryAlpha[15], theme.colors.primaryAlpha[10]]}
                      style={styles.encouragementCard}
                    >
                      <Ionicons name="heart" size={20} color={theme.colors.primary} />
                      <Text style={styles.encouragementText}>
                        {lastReflection.encouragement}
                      </Text>
                    </LinearGradient>
                  )}

                  {/* Refresh button */}
                  <TouchableOpacity 
                    style={styles.refreshButton} 
                    onPress={handleGenerateReflection}
                  >
                    <Ionicons name="refresh-outline" size={18} color={theme.colors.textSecondary} />
                    <Text style={styles.refreshButtonText}>Generate new reflection</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                // Empty/stale state - generate new
                <View style={styles.emptySection}>
                  <View style={styles.emptyIcon}>
                    <Ionicons name="sparkles" size={40} color={theme.colors.primary} />
                  </View>
                  <Text style={styles.emptyTitle}>
                    {isStale ? 'Time for a fresh reflection' : 'Ready to reflect'}
                  </Text>
                  <Text style={styles.emptyDescription}>
                    {recentMoments.length < 3
                      ? `You have ${recentMoments.length} journal entries. Write at least 3 to generate a reflection.`
                      : `Analyze ${Math.min(recentMoments.length, 20)} journal entries to discover patterns in your spiritual journey.`}
                  </Text>

                  {error && (
                    <View style={styles.errorBox}>
                      <Ionicons name="alert-circle-outline" size={16} color={theme.colors.error} />
                      <Text style={styles.errorText}>{error}</Text>
                    </View>
                  )}

                  <TouchableOpacity
                    style={[
                      styles.generateButton,
                      recentMoments.length < 3 && styles.generateButtonDisabled,
                    ]}
                    onPress={handleGenerateReflection}
                    disabled={recentMoments.length < 3}
                  >
                    <Ionicons name="sparkles" size={20} color="#fff" />
                    <Text style={styles.generateButtonText}>Generate Reflection</Text>
                  </TouchableOpacity>
                </View>
              )}
            </ScrollView>
          </BlurView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  container: {
    flex: 1,
    marginTop: 60,
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
    overflow: 'hidden',
  },
  blurContainer: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  headerTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
  },
  closeButton: {
    padding: theme.spacing.xs,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: theme.spacing.lg,
  },
  // Upgrade section
  upgradeSection: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
  },
  premiumBadge: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: theme.colors.accentAlpha[15],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  upgradeTitle: {
    fontSize: theme.fontSize.xxl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  upgradeDescription: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: theme.spacing.xl,
    paddingHorizontal: theme.spacing.md,
  },
  featureList: {
    width: '100%',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.xl,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
  },
  featureText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
  },
  upgradeButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.xxl,
    borderRadius: theme.borderRadius.full,
  },
  upgradeButtonText: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: '#fff',
  },
  // Loading section
  loadingSection: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xxxl,
  },
  loadingText: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.text,
    marginTop: theme.spacing.lg,
  },
  loadingSubtext: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  // Reflection content
  reflectionContent: {
    gap: theme.spacing.lg,
  },
  insightCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  insightText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    lineHeight: 24,
  },
  section: {
    gap: theme.spacing.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  sectionTitle: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tagList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  tag: {
    backgroundColor: theme.colors.primaryAlpha[15],
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.full,
  },
  tagText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.primary,
    fontWeight: theme.fontWeight.medium,
  },
  growthList: {
    gap: theme.spacing.sm,
  },
  growthItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.spacing.sm,
  },
  growthBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.success,
    marginTop: 7,
  },
  growthText: {
    flex: 1,
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    lineHeight: 22,
  },
  encouragementCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.spacing.md,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
  },
  encouragementText: {
    flex: 1,
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    fontStyle: 'italic',
    lineHeight: 22,
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.md,
  },
  refreshButtonText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  // Empty state
  emptySection: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.primaryAlpha[15],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  emptyTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  emptyDescription: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: theme.spacing.xl,
    paddingHorizontal: theme.spacing.md,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    backgroundColor: theme.colors.errorAlpha[15],
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.lg,
  },
  errorText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.error,
  },
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.xxl,
    borderRadius: theme.borderRadius.full,
  },
  generateButtonDisabled: {
    backgroundColor: theme.colors.textMuted,
  },
  generateButtonText: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: '#fff',
  },
});

export default JournalReflectionModal;
