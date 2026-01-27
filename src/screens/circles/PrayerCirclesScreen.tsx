/**
 * PrayerCirclesScreen - List User's Circles + Discover/Create
 *
 * Philosophy: "We are not God, only helping others find HIM"
 * Prayer circles bring believers together to bear one another's burdens
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../lib/theme';
import { useAuthStore } from '../../store/authStore';
import { usePrayerCircleStore, useCircles, useCircleLoading } from '../../store/prayerCircleStore';
import { CircleCard } from '../../components/circles';
import { RootStackParamList } from '../../types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

// ============================================================================
// Create Circle Modal
// ============================================================================

interface CreateCircleModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (name: string) => Promise<void>;
  loading: boolean;
}

function CreateCircleModal({ visible, onClose, onSubmit, loading }: CreateCircleModalProps) {
  const [name, setName] = useState('');

  const handleSubmit = async () => {
    if (name.trim().length < 2) {
      Alert.alert('Invalid Name', 'Please enter a circle name with at least 2 characters.');
      return;
    }
    await onSubmit(name.trim());
    setName('');
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalOverlay}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Create Prayer Circle</Text>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Ionicons name="close" size={24} color={theme.colors.textMuted} />
            </TouchableOpacity>
          </View>

          <Text style={styles.modalSubtitle}>
            Create a space for your community to share and pray together.
          </Text>

          <TextInput
            style={styles.modalInput}
            placeholder="Circle name (e.g., Family Circle)"
            placeholderTextColor={theme.colors.textMuted}
            value={name}
            onChangeText={setName}
            autoFocus
            maxLength={50}
          />

          <TouchableOpacity
            style={[styles.modalButton, loading && styles.modalButtonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <Ionicons name="add-circle" size={20} color="#fff" />
                <Text style={styles.modalButtonText}>Create Circle</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ============================================================================
// Join Circle Modal
// ============================================================================

interface JoinCircleModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (code: string, displayName?: string) => Promise<void>;
  loading: boolean;
}

function JoinCircleModal({ visible, onClose, onSubmit, loading }: JoinCircleModalProps) {
  const [code, setCode] = useState('');
  const [displayName, setDisplayName] = useState('');

  const handleSubmit = async () => {
    if (code.trim().length !== 6) {
      Alert.alert('Invalid Code', 'Please enter a 6-character invite code.');
      return;
    }
    await onSubmit(code.trim(), displayName.trim() || undefined);
    setCode('');
    setDisplayName('');
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalOverlay}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Join a Circle</Text>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Ionicons name="close" size={24} color={theme.colors.textMuted} />
            </TouchableOpacity>
          </View>

          <Text style={styles.modalSubtitle}>
            Enter the 6-character invite code shared by a circle member.
          </Text>

          <TextInput
            style={[styles.modalInput, styles.codeInput]}
            placeholder="INVITE CODE"
            placeholderTextColor={theme.colors.textMuted}
            value={code}
            onChangeText={(text) => setCode(text.toUpperCase())}
            autoCapitalize="characters"
            autoFocus
            maxLength={6}
          />

          <TextInput
            style={styles.modalInput}
            placeholder="Your display name (optional)"
            placeholderTextColor={theme.colors.textMuted}
            value={displayName}
            onChangeText={setDisplayName}
            maxLength={30}
          />

          <TouchableOpacity
            style={[styles.modalButton, loading && styles.modalButtonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <Ionicons name="enter" size={20} color="#fff" />
                <Text style={styles.modalButtonText}>Join Circle</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ============================================================================
// Main Screen
// ============================================================================

export default function PrayerCirclesScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { user } = useAuthStore();
  const circles = useCircles();
  const loading = useCircleLoading();
  const { fetchMyCircles, createCircle, joinCircle, setCurrentCircle } = usePrayerCircleStore();

  const [refreshing, setRefreshing] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (user?.id) {
      fetchMyCircles(user.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const handleRefresh = useCallback(async () => {
    if (!user?.id) return;
    setRefreshing(true);
    await fetchMyCircles(user.id);
    setRefreshing(false);
  }, [user?.id, fetchMyCircles]);

  const handleCreateCircle = async (name: string) => {
    if (!user?.id) return;
    setActionLoading(true);
    const result = await createCircle(user.id, name);
    setActionLoading(false);
    if (result) {
      setShowCreateModal(false);
      Alert.alert(
        'Circle Created! 🙏',
        `Your circle "${name}" has been created. Share the invite code with others to let them join.`
      );
    }
  };

  const handleJoinCircle = async (code: string, displayName?: string) => {
    if (!user?.id) return;
    setActionLoading(true);
    const result = await joinCircle(user.id, code, displayName);
    setActionLoading(false);
    if (result.success) {
      setShowJoinModal(false);
      Alert.alert('Joined! 🎉', 'You have successfully joined the prayer circle.');
    } else {
      Alert.alert('Error', result.error || 'Failed to join circle');
    }
  };

  const handleCirclePress = (circle: typeof circles[0]) => {
    setCurrentCircle(circle);
    navigation.navigate('CircleDetail', { circleId: circle.id });
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <View style={styles.headerText}>
          <Text style={styles.headerLabel}>COMMUNITY</Text>
          <Text style={styles.headerTitle}>Prayer Circles</Text>
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowCreateModal(true)}
        >
          <Ionicons name="add" size={24} color={theme.colors.accent} />
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
        {/* Join Circle CTA */}
        <TouchableOpacity
          style={styles.joinCta}
          onPress={() => setShowJoinModal(true)}
          activeOpacity={0.8}
        >
          <View style={styles.joinCtaContent}>
            <View style={styles.joinCtaIcon}>
              <Ionicons name="enter-outline" size={24} color={theme.colors.primary} />
            </View>
            <View style={styles.joinCtaText}>
              <Text style={styles.joinCtaTitle}>Have an invite code?</Text>
              <Text style={styles.joinCtaSubtitle}>Join an existing prayer circle</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color={theme.colors.textMuted} />
        </TouchableOpacity>

        {/* My Circles Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>My Circles</Text>
            {circles.length > 0 && (
              <Text style={styles.sectionCount}>{circles.length}</Text>
            )}
          </View>

          {loading && circles.length === 0 ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
              <Text style={styles.loadingText}>Loading circles...</Text>
            </View>
          ) : circles.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>🙏</Text>
              <Text style={styles.emptyTitle}>No circles yet</Text>
              <Text style={styles.emptySubtitle}>
                Create a prayer circle to share requests with your community, or join one with an invite code.
              </Text>
            </View>
          ) : (
            circles.map((circle) => (
              <CircleCard
                key={circle.id}
                circle={circle}
                onPress={() => handleCirclePress(circle)}
              />
            ))
          )}
        </View>

        {/* Create Circle CTA at bottom */}
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => setShowCreateModal(true)}
          activeOpacity={0.8}
        >
          <Ionicons name="add-circle" size={22} color="#fff" />
          <Text style={styles.createButtonText}>Create New Circle</Text>
        </TouchableOpacity>

        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Modals */}
      <CreateCircleModal
        visible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateCircle}
        loading={actionLoading}
      />

      <JoinCircleModal
        visible={showJoinModal}
        onClose={() => setShowJoinModal(false)}
        onSubmit={handleJoinCircle}
        loading={actionLoading}
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
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  backButton: {
    padding: theme.spacing.xs,
    marginRight: theme.spacing.sm,
  },
  headerText: {
    flex: 1,
  },
  headerLabel: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.accent,
    fontWeight: theme.fontWeight.semibold,
    letterSpacing: 1,
  },
  headerTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.accentAlpha[15],
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: theme.spacing.md,
  },
  joinCta: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primaryAlpha[15],
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.primaryAlpha[30],
  },
  joinCtaContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  joinCtaIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.primaryAlpha[20],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  joinCtaText: {
    flex: 1,
  },
  joinCtaTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
  },
  joinCtaSubtitle: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  section: {
    marginBottom: theme.spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
  },
  sectionCount: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textMuted,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.sm,
  },
  loadingContainer: {
    padding: theme.spacing.xxl,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textMuted,
    marginTop: theme.spacing.md,
  },
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
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    backgroundColor: theme.colors.accent,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.md,
    ...theme.shadows.md,
  },
  createButtonText: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: '#fff',
  },
  bottomPadding: {
    height: 100,
  },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: theme.colors.card,
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.xxl,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.sm,
  },
  modalTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
  },
  modalSubtitle: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.lg,
  },
  modalInput: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.md,
  },
  codeInput: {
    fontSize: theme.fontSize.xl,
    textAlign: 'center',
    letterSpacing: 4,
    fontWeight: theme.fontWeight.bold,
  },
  modalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginTop: theme.spacing.sm,
  },
  modalButtonDisabled: {
    opacity: 0.6,
  },
  modalButtonText: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: '#fff',
  },
});
