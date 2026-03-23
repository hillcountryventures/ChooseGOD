/**
 * JourneyScreen - Track Spiritual Growth
 *
 * Philosophy: "We are not God, only helping others find HIM"
 * This screen answers: "How is God working in my life?"
 *
 * Three Balanced Views:
 * - Timeline: Chronological spiritual moments with tappable verse links
 * - Insights: Habits, themes, and growth patterns
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as Haptics from 'expo-haptics';
import { theme } from '../lib/theme';
import { useStore } from '../store/useStore';
import { RootStackParamList } from '../types';
import { usePremiumStatus } from '../hooks/usePremiumStatus';
import { generateJourneyPDF } from '../lib/journeyPDF';
import { TimelineView, InsightsView } from '../components/journey';
import { JournalReflectionModal } from '../components/journal/JournalReflectionModal';
import { useJournalPremiumStore } from '../store/journalPremiumStore';
import { logger } from '../utils/logger';
import { useTrackScreen } from '../hooks/useAnalytics';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type TabType = 'timeline' | 'insights';

// ============================================================================
// Tab Button
// ============================================================================
function TabButton({
  active,
  label,
  onPress,
}: {
  active: boolean;
  label: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[styles.tabButton, active && styles.tabButtonActive]}
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityRole="tab"
      accessibilityState={{ selected: active }}
      accessibilityLabel={label}
    >
      <Text style={[styles.tabButtonText, active && styles.tabButtonTextActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

// ============================================================================
// Main JourneyScreen
// ============================================================================
export default function JourneyScreen() {
  useTrackScreen('journey');
  const navigation = useNavigation<NavigationProp>();
  const [activeTab, setActiveTab] = useState<TabType>('timeline');
  const [isExporting, setIsExporting] = useState(false);
  const recentMoments = useStore((state) => state.recentMoments);

  // Premium status for PDF export
  const { isPremium, showPaywall } = usePremiumStatus();

  // AI Reflection modal
  const [showReflectionModal, setShowReflectionModal] = useState(false);
  
  // Journal premium features
  const getLockedCount = useJournalPremiumStore((s) => s.getLockedCount);
  const lockedCount = getLockedCount(recentMoments, isPremium);

  // Calculate streak for header
  const streak = Math.min(recentMoments.length, 30);

  const handleNewJournal = () => {
    navigation.navigate('JournalCompose', {});
  };

  // Handle PDF export (Pro only)
  const handleExportPDF = useCallback(async () => {
    if (!isPremium) {
      showPaywall();
      return;
    }

    if (recentMoments.length === 0) {
      Alert.alert('No Moments', 'Start your spiritual journey by adding some moments first.');
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsExporting(true);

    try {
      const html = generateJourneyPDF(recentMoments);
      const { uri } = await Print.printToFileAsync({ html });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          mimeType: 'application/pdf',
          dialogTitle: 'Share your spiritual journey',
          UTI: 'com.adobe.pdf',
        });
      } else {
        Alert.alert('Export Complete', 'PDF saved successfully.');
      }
    } catch (error) {
      logger.error('PDF export failed:', error);
      Alert.alert('Export Failed', 'Unable to generate PDF. Please try again.');
    } finally {
      setIsExporting(false);
    }
  }, [isPremium, showPaywall, recentMoments]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Your Journey</Text>
          <Text style={styles.subtitle}>Track your spiritual growth</Text>
        </View>
        <View style={styles.headerRight}>
          {streak > 0 && (
            <View style={styles.streakBadge}>
              <Ionicons name="flame" size={16} color={theme.colors.accent} />
              <Text style={styles.streakBadgeText}>{streak}</Text>
            </View>
          )}
          {/* AI Reflection Button */}
          <TouchableOpacity
            style={[styles.actionButton, !isPremium && styles.actionButtonLocked]}
            onPress={() => setShowReflectionModal(true)}
            accessibilityRole="button"
            accessibilityLabel="AI Reflection"
          >
            <Ionicons
              name="sparkles"
              size={18}
              color={isPremium ? theme.colors.primary : theme.colors.textMuted}
            />
            {!isPremium && (
              <Ionicons
                name="lock-closed"
                size={10}
                color={theme.colors.primary}
                style={styles.actionLockIcon}
              />
            )}
          </TouchableOpacity>
          {/* PDF Export Button (Pro feature) */}
          <TouchableOpacity
            style={[styles.actionButton, !isPremium && styles.actionButtonLocked]}
            onPress={handleExportPDF}
            disabled={isExporting}
          >
            {isExporting ? (
              <ActivityIndicator size="small" color={theme.colors.accent} />
            ) : (
              <>
                <Ionicons
                  name="document-text-outline"
                  size={18}
                  color={isPremium ? theme.colors.accent : theme.colors.textMuted}
                />
                {!isPremium && (
                  <Ionicons
                    name="lock-closed"
                    size={10}
                    color={theme.colors.accent}
                    style={styles.actionLockIcon}
                  />
                )}
              </>
            )}
          </TouchableOpacity>
          <TouchableOpacity style={styles.newJournalButton} onPress={handleNewJournal} accessibilityRole="button" accessibilityLabel="New journal entry">
            <Ionicons name="add" size={22} color={theme.colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Tab Selector */}
      <View style={styles.tabContainer}>
        <TabButton
          active={activeTab === 'timeline'}
          label="Timeline"
          onPress={() => setActiveTab('timeline')}
        />
        <TabButton
          active={activeTab === 'insights'}
          label="Insights"
          onPress={() => setActiveTab('insights')}
        />
      </View>

      {/* Locked entries banner (free users) */}
      {lockedCount > 0 && !isPremium && (
        <TouchableOpacity style={styles.lockedBanner} onPress={showPaywall}>
          <Ionicons name="lock-closed" size={16} color={theme.colors.accent} />
          <Text style={styles.lockedBannerText}>
            {lockedCount} older {lockedCount === 1 ? 'entry' : 'entries'} locked
          </Text>
          <Text style={styles.lockedBannerLink}>Unlock</Text>
        </TouchableOpacity>
      )}

      {/* Content */}
      {activeTab === 'timeline' && <TimelineView moments={recentMoments} />}
      {activeTab === 'insights' && <InsightsView moments={recentMoments} />}

      {/* AI Reflection Modal */}
      <JournalReflectionModal
        visible={showReflectionModal}
        onClose={() => setShowReflectionModal(false)}
      />
    </SafeAreaView>
  );
}

// ============================================================================
// Styles
// ============================================================================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
  },
  title: {
    fontSize: theme.fontSize.xxl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
  },
  subtitle: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
    backgroundColor: theme.colors.accentAlpha[20],
    borderRadius: theme.borderRadius.full,
  },
  streakBadgeText: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.accent,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
    position: 'relative',
  },
  actionButtonLocked: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
  },
  actionLockIcon: {
    position: 'absolute',
    top: 6,
    right: 6,
  },
  newJournalButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },

  // Tabs
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    gap: theme.spacing.sm,
  },
  tabButton: {
    flex: 1,
    paddingVertical: theme.spacing.sm,
    alignItems: 'center',
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.surface,
  },
  tabButtonActive: {
    backgroundColor: theme.colors.primary,
  },
  tabButtonText: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.textSecondary,
  },
  tabButtonTextActive: {
    color: theme.colors.text,
  },
  
  // Locked entries banner
  lockedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    backgroundColor: theme.colors.accentAlpha[10],
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    marginHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.accentAlpha[20],
  },
  lockedBannerText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  lockedBannerLink: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.accent,
  },
});
