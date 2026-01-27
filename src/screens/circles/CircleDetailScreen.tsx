/**
 * CircleDetailScreen - View Circle, Members, Shared Prayers
 *
 * Philosophy: "We are not God, only helping others find HIM"
 * This screen displays a prayer circle's details and shared requests
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { theme } from '../../lib/theme';
import { useAuthStore } from '../../store/authStore';
import {
  usePrayerCircleStore,
  useCurrentCircle,
  useCircleRequests,
} from '../../store/prayerCircleStore';
import { CircleMemberAvatar, SharedPrayerCard } from '../../components/circles';
import { RootStackParamList } from '../../types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type CircleDetailRouteProp = RouteProp<RootStackParamList, 'CircleDetail'>;

type TabType = 'prayers' | 'members';

// ============================================================================
// Tab Button
// ============================================================================

function TabButton({
  active,
  label,
  count,
  onPress,
}: {
  active: boolean;
  label: string;
  count?: number;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[styles.tabButton, active && styles.tabButtonActive]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={[styles.tabButtonText, active && styles.tabButtonTextActive]}>
        {label}
      </Text>
      {count !== undefined && count > 0 && (
        <View style={[styles.tabBadge, active && styles.tabBadgeActive]}>
          <Text style={[styles.tabBadgeText, active && styles.tabBadgeTextActive]}>
            {count}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

// ============================================================================
// Main Screen
// ============================================================================

export default function CircleDetailScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<CircleDetailRouteProp>();
  const { circleId } = route.params;

  const { user } = useAuthStore();
  const circle = useCurrentCircle();
  const circleRequests = useCircleRequests();
  const {
    fetchCircleById,
    fetchCirclePrayers,
    fetchCircleMembers,
    leaveCircle,
    deleteCircle,
    markPraying,
    loading,
    requestsLoading,
  } = usePrayerCircleStore();

  const [activeTab, setActiveTab] = useState<TabType>('prayers');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user?.id && circleId) {
      fetchCircleById(circleId, user.id);
      fetchCirclePrayers(circleId, user.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [circleId, user?.id]);

  const handleRefresh = useCallback(async () => {
    if (!user?.id || !circleId) return;
    setRefreshing(true);
    await Promise.all([
      fetchCircleById(circleId, user.id),
      fetchCirclePrayers(circleId, user.id),
    ]);
    setRefreshing(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [circleId, user?.id]);

  const handleGoBack = () => {
    navigation.goBack();
  };

  const handleShareInvite = async () => {
    if (!circle) return;
    try {
      await Share.share({
        message: `Join my prayer circle "${circle.name}" on ChooseGOD! Use invite code: ${circle.inviteCode}`,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleCopyCode = async () => {
    if (!circle) return;
    await Clipboard.setStringAsync(circle.inviteCode);
    Alert.alert('Copied!', 'Invite code copied to clipboard');
  };

  const handleLeaveCircle = () => {
    if (!circle || !user?.id) return;

    if (circle.isCreator) {
      Alert.alert(
        'Delete Circle?',
        'As the creator, leaving will delete this circle for everyone. This cannot be undone.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete Circle',
            style: 'destructive',
            onPress: async () => {
              const success = await deleteCircle(circle.id);
              if (success) {
                navigation.goBack();
              }
            },
          },
        ]
      );
    } else {
      Alert.alert(
        'Leave Circle?',
        `Are you sure you want to leave "${circle.name}"?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Leave',
            style: 'destructive',
            onPress: async () => {
              const success = await leaveCircle(circle.id, user.id);
              if (success) {
                navigation.goBack();
              }
            },
          },
        ]
      );
    }
  };

  const handlePray = async (requestId: string) => {
    if (!user?.id) return;
    await markPraying(requestId, user.id);
  };

  const activePrayers = circleRequests.filter((p) => p.status === 'active');
  const answeredPrayers = circleRequests.filter((p) => p.status === 'answered');

  if (loading && !circle) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading circle...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!circle) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Circle not found</Text>
          <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBack} style={styles.headerButton}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <View style={styles.headerText}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {circle.name}
          </Text>
          <Text style={styles.headerSubtitle}>
            {circle.memberCount} member{circle.memberCount !== 1 ? 's' : ''}
          </Text>
        </View>
        <TouchableOpacity onPress={handleShareInvite} style={styles.headerButton}>
          <Ionicons name="share-outline" size={24} color={theme.colors.accent} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={theme.colors.primary}
          />
        }
      >
        {/* Invite Code Card */}
        <View style={styles.inviteCard}>
          <View style={styles.inviteHeader}>
            <Ionicons name="key-outline" size={20} color={theme.colors.accent} />
            <Text style={styles.inviteLabel}>Invite Code</Text>
          </View>
          <View style={styles.inviteCodeRow}>
            <Text style={styles.inviteCode}>{circle.inviteCode}</Text>
            <TouchableOpacity onPress={handleCopyCode} style={styles.copyButton}>
              <Ionicons name="copy-outline" size={18} color={theme.colors.primary} />
              <Text style={styles.copyText}>Copy</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.inviteHint}>
            Share this code with others to invite them to your circle
          </Text>
        </View>

        {/* Tabs */}
        <View style={styles.tabContainer}>
          <TabButton
            active={activeTab === 'prayers'}
            label="Prayers"
            count={activePrayers.length}
            onPress={() => setActiveTab('prayers')}
          />
          <TabButton
            active={activeTab === 'members'}
            label="Members"
            count={circle.memberCount}
            onPress={() => setActiveTab('members')}
          />
        </View>

        {/* Tab Content */}
        {activeTab === 'prayers' && (
          <View style={styles.tabContent}>
            {requestsLoading && circleRequests.length === 0 ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color={theme.colors.primary} />
              </View>
            ) : circleRequests.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyEmoji}>🙏</Text>
                <Text style={styles.emptyTitle}>No shared prayers yet</Text>
                <Text style={styles.emptySubtitle}>
                  Share a prayer request from your Prayers tab to get started.
                </Text>
              </View>
            ) : (
              <>
                {/* Active Prayers */}
                {activePrayers.length > 0 && (
                  <View style={styles.prayerSection}>
                    <Text style={styles.prayerSectionTitle}>
                      Active Requests ({activePrayers.length})
                    </Text>
                    {activePrayers.map((prayer) => (
                      <SharedPrayerCard
                        key={prayer.id}
                        prayer={prayer}
                        onPray={() => handlePray(prayer.id)}
                        isOwnPrayer={prayer.userId === user?.id}
                      />
                    ))}
                  </View>
                )}

                {/* Answered Prayers */}
                {answeredPrayers.length > 0 && (
                  <View style={styles.prayerSection}>
                    <Text style={styles.prayerSectionTitle}>
                      Answered Prayers ({answeredPrayers.length})
                    </Text>
                    {answeredPrayers.map((prayer) => (
                      <SharedPrayerCard
                        key={prayer.id}
                        prayer={prayer}
                        onPray={() => {}}
                        isOwnPrayer={prayer.userId === user?.id}
                      />
                    ))}
                  </View>
                )}
              </>
            )}
          </View>
        )}

        {activeTab === 'members' && (
          <View style={styles.tabContent}>
            <View style={styles.membersGrid}>
              {circle.members.map((member) => (
                <View key={member.userId} style={styles.memberItem}>
                  <CircleMemberAvatar member={member} size={56} showName />
                  {member.userId === circle.createdBy && (
                    <View style={styles.creatorBadge}>
                      <Ionicons name="star" size={10} color={theme.colors.accent} />
                    </View>
                  )}
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Leave/Delete Button */}
        <TouchableOpacity
          style={styles.leaveButton}
          onPress={handleLeaveCircle}
          activeOpacity={0.7}
        >
          <Ionicons
            name={circle.isCreator ? 'trash-outline' : 'exit-outline'}
            size={18}
            color={theme.colors.error}
          />
          <Text style={styles.leaveButtonText}>
            {circle.isCreator ? 'Delete Circle' : 'Leave Circle'}
          </Text>
        </TouchableOpacity>

        <View style={styles.bottomPadding} />
      </ScrollView>
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
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  headerButton: {
    padding: theme.spacing.xs,
  },
  headerText: {
    flex: 1,
    marginHorizontal: theme.spacing.md,
  },
  headerTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
  },
  headerSubtitle: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: theme.spacing.md,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xxl,
  },
  loadingText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textMuted,
    marginTop: theme.spacing.md,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xxl,
  },
  errorText: {
    fontSize: theme.fontSize.lg,
    color: theme.colors.textMuted,
    marginBottom: theme.spacing.lg,
  },
  backButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.lg,
  },
  backButtonText: {
    color: '#fff',
    fontWeight: theme.fontWeight.semibold,
  },

  // Invite Card
  inviteCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.accentAlpha[20],
  },
  inviteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    marginBottom: theme.spacing.sm,
  },
  inviteLabel: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.accent,
  },
  inviteCodeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  inviteCode: {
    fontSize: theme.fontSize.xxl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    letterSpacing: 3,
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    backgroundColor: theme.colors.primaryAlpha[15],
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
  },
  copyText: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.primary,
  },
  inviteHint: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textMuted,
    marginTop: theme.spacing.sm,
  },

  // Tabs
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: 4,
    marginBottom: theme.spacing.lg,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.xs,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
  },
  tabButtonActive: {
    backgroundColor: theme.colors.card,
  },
  tabButtonText: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.textMuted,
  },
  tabButtonTextActive: {
    color: theme.colors.text,
  },
  tabBadge: {
    backgroundColor: theme.colors.backgroundTertiary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  tabBadgeActive: {
    backgroundColor: theme.colors.primaryAlpha[20],
  },
  tabBadgeText: {
    fontSize: 10,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.textMuted,
  },
  tabBadgeTextActive: {
    color: theme.colors.primary,
  },
  tabContent: {
    minHeight: 200,
  },

  // Prayers
  prayerSection: {
    marginBottom: theme.spacing.lg,
  },
  prayerSectionTitle: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
  },

  // Members
  membersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.lg,
    justifyContent: 'flex-start',
  },
  memberItem: {
    alignItems: 'center',
    position: 'relative',
    width: 70,
  },
  creatorBadge: {
    position: 'absolute',
    top: 0,
    right: 8,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: theme.colors.accentAlpha[20],
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: theme.colors.background,
  },

  // Empty State
  emptyState: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.xl,
    alignItems: 'center',
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: theme.spacing.md,
  },
  emptyTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  emptySubtitle: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: theme.fontSize.sm * 1.5,
  },

  // Leave Button
  leaveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.md,
    marginTop: theme.spacing.lg,
  },
  leaveButtonText: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.error,
  },

  bottomPadding: {
    height: 100,
  },
});
