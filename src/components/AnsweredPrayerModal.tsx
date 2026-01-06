/**
 * AnsweredPrayerModal - Modal for marking a prayer as answered
 *
 * Allows users to:
 * - Confirm the prayer was answered
 * - Add a reflection on how God answered
 * - Celebrate God's faithfulness
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '../lib/theme';
import { PrayerRequest } from '../types';

interface AnsweredPrayerModalProps {
  visible: boolean;
  prayer: PrayerRequest | null;
  onClose: () => void;
  onConfirm: (reflection: string) => void;
}

export function AnsweredPrayerModal({
  visible,
  prayer,
  onClose,
  onConfirm,
}: AnsweredPrayerModalProps) {
  const insets = useSafeAreaInsets();
  const inputRef = useRef<TextInput>(null);
  const [reflection, setReflection] = useState('');

  // Reset when modal opens with new prayer
  useEffect(() => {
    if (visible) {
      setReflection('');
      setTimeout(() => {
        inputRef.current?.focus();
      }, 300);
    }
  }, [visible]);

  const handleConfirm = () => {
    onConfirm(reflection.trim());
    setReflection('');
  };

  const handleClose = () => {
    setReflection('');
    onClose();
  };

  if (!prayer) return null;

  const createdDate = new Date(prayer.createdAt).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const daysSince = Math.floor(
    (Date.now() - new Date(prayer.createdAt).getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={[styles.container, { paddingTop: insets.top }]}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <Ionicons name="close" size={28} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Prayer Answered!</Text>
          <View style={styles.closeButton} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 16 }]}
          keyboardShouldPersistTaps="handled"
        >
          {/* Celebration icon */}
          <View style={styles.iconContainer}>
            <Ionicons name="trophy" size={40} color={theme.colors.success} />
          </View>

          <Text style={styles.celebrationText}>
            Praise God! Another prayer answered!
          </Text>

          {/* Original prayer */}
          <View style={styles.prayerCard}>
            <View style={styles.prayerHeader}>
              <Ionicons name="heart" size={16} color={theme.colors.prayer} />
              <Text style={styles.prayerLabel}>Your Prayer</Text>
            </View>
            <Text style={styles.prayerText}>{prayer.request}</Text>
            <View style={styles.prayerMeta}>
              <Text style={styles.prayerDate}>Started praying: {createdDate}</Text>
              <Text style={styles.prayerDays}>
                {daysSince} day{daysSince !== 1 ? 's' : ''} of prayer
              </Text>
            </View>
          </View>

          {/* Reflection input */}
          <View style={styles.reflectionSection}>
            <Text style={styles.reflectionLabel}>
              How did God answer this prayer?
            </Text>
            <Text style={styles.reflectionSubtext}>
              Record how God moved so you can remember His faithfulness.
            </Text>
            <TextInput
              ref={inputRef}
              style={styles.textInput}
              placeholder="God answered by..."
              placeholderTextColor={theme.colors.textMuted}
              value={reflection}
              onChangeText={setReflection}
              multiline
              textAlignVertical="top"
            />
          </View>

          {/* Today's date */}
          <View style={styles.dateSection}>
            <Ionicons name="calendar" size={16} color={theme.colors.success} />
            <Text style={styles.answeredDate}>
              Answered: {new Date().toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </Text>
          </View>

          {/* Confirm button */}
          <TouchableOpacity
            style={styles.confirmButton}
            onPress={handleConfirm}
            activeOpacity={0.8}
          >
            <Ionicons name="checkmark-circle" size={20} color={theme.colors.text} />
            <Text style={styles.confirmButtonText}>
              {reflection.trim() ? 'Save & Celebrate' : 'Mark as Answered'}
            </Text>
          </TouchableOpacity>

          {/* Skip option */}
          <TouchableOpacity
            style={styles.skipButton}
            onPress={() => onConfirm('')}
            activeOpacity={0.7}
          >
            <Text style={styles.skipButtonText}>Skip reflection</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  closeButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: theme.spacing.lg,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.successAlpha[20],
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: theme.spacing.md,
  },
  celebrationText: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
  prayerCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.lg,
  },
  prayerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    marginBottom: theme.spacing.sm,
  },
  prayerLabel: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.prayer,
  },
  prayerText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    lineHeight: theme.fontSize.md * 1.5,
    marginBottom: theme.spacing.md,
  },
  prayerMeta: {
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  prayerDate: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  prayerDays: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textMuted,
    marginTop: theme.spacing.xs,
  },
  reflectionSection: {
    marginBottom: theme.spacing.lg,
  },
  reflectionLabel: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  reflectionSubtext: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
  },
  textInput: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    minHeight: 120,
    lineHeight: theme.fontSize.md * 1.5,
  },
  dateSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.xs,
    marginBottom: theme.spacing.lg,
  },
  answeredDate: {
    fontSize: theme.fontSize.md,
    color: theme.colors.success,
    fontWeight: theme.fontWeight.medium,
  },
  confirmButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    backgroundColor: theme.colors.success,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.md,
  },
  confirmButtonText: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
  },
  skipButton: {
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
  },
  skipButtonText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textMuted,
  },
});
