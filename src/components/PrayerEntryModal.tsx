/**
 * PrayerEntryModal - Modal for entering and saving prayers
 *
 * Allows users to:
 * - Type a prayer directly
 * - Save the prayer to their prayer list
 * - Optionally record voice (future enhancement)
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
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '../lib/theme';
import { useStore } from '../store/useStore';
import { PrayerRequest } from '../types';

interface PrayerEntryModalProps {
  visible: boolean;
  onClose: () => void;
}

export function PrayerEntryModal({ visible, onClose }: PrayerEntryModalProps) {
  const insets = useSafeAreaInsets();
  const inputRef = useRef<TextInput>(null);
  const [prayerText, setPrayerText] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const addPrayer = useStore((state) => state.addPrayer);

  // Focus input when modal opens
  useEffect(() => {
    if (visible) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 300);
    }
  }, [visible]);

  const handleSave = async () => {
    if (!prayerText.trim() || isSaving) return;

    setIsSaving(true);

    try {
      const newPrayer: PrayerRequest = {
        id: Date.now().toString(),
        userId: '', // Will be set if user is authenticated
        request: prayerText.trim(),
        status: 'active',
        createdAt: new Date(),
      };

      addPrayer(newPrayer);
      setPrayerText('');
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    setPrayerText('');
    onClose();
  };

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
          <Text style={styles.headerTitle}>New Prayer</Text>
          <TouchableOpacity
            onPress={handleSave}
            disabled={!prayerText.trim() || isSaving}
            style={[
              styles.saveButton,
              (!prayerText.trim() || isSaving) && styles.saveButtonDisabled,
            ]}
          >
            {isSaving ? (
              <ActivityIndicator size="small" color={theme.colors.text} />
            ) : (
              <Text
                style={[
                  styles.saveButtonText,
                  !prayerText.trim() && styles.saveButtonTextDisabled,
                ]}
              >
                Save
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Prayer icon */}
          <View style={styles.iconContainer}>
            <Ionicons name="heart" size={32} color={theme.colors.prayer} />
          </View>

          {/* Instruction text */}
          <Text style={styles.instruction}>
            Pour out your heart to God. Write your prayer, request, or praise below.
          </Text>

          {/* Text input */}
          <TextInput
            ref={inputRef}
            style={styles.textInput}
            placeholder="Dear God..."
            placeholderTextColor={theme.colors.textMuted}
            value={prayerText}
            onChangeText={setPrayerText}
            multiline
            textAlignVertical="top"
            autoFocus={false}
          />

          {/* Character count */}
          <Text style={styles.charCount}>
            {prayerText.length > 0 ? `${prayerText.length} characters` : ''}
          </Text>
        </View>

        {/* Footer hint */}
        <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
          <View style={styles.hintContainer}>
            <Ionicons name="information-circle-outline" size={16} color={theme.colors.textMuted} />
            <Text style={styles.hintText}>
              Your prayers are private and stored on your device.
            </Text>
          </View>
        </View>
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
  saveButton: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.prayer,
    borderRadius: theme.borderRadius.full,
    minWidth: 70,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: theme.colors.surface,
  },
  saveButtonText: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
  },
  saveButtonTextDisabled: {
    color: theme.colors.textMuted,
  },
  content: {
    flex: 1,
    padding: theme.spacing.lg,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(236, 72, 153, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: theme.spacing.lg,
  },
  instruction: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
    lineHeight: theme.fontSize.md * 1.5,
  },
  textInput: {
    flex: 1,
    fontSize: theme.fontSize.lg,
    color: theme.colors.text,
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    lineHeight: theme.fontSize.lg * 1.6,
  },
  charCount: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textMuted,
    textAlign: 'right',
    marginTop: theme.spacing.sm,
  },
  footer: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  hintContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.xs,
  },
  hintText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textMuted,
  },
});
