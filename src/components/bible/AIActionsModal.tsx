/**
 * AIActionsModal - AI quick actions modal for verse context
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../lib/theme';
import { VerseSource } from '../../types';
import { AI_QUICK_ACTIONS, AIQuickAction } from './constants';

interface AIActionsModalProps {
  visible: boolean;
  onClose: () => void;
  selectedVerse: VerseSource | null;
  onActionPress: (action: AIQuickAction) => void;
}

export function AIActionsModal({
  visible,
  onClose,
  selectedVerse,
  onActionPress,
}: AIActionsModalProps) {
  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.aiMenuContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              Ask the Bible about {selectedVerse?.book} {selectedVerse?.chapter}:{selectedVerse?.verse}
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={theme.colors.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.aiActionsList}>
            {AI_QUICK_ACTIONS.map((action) => (
              <TouchableOpacity
                key={action.id}
                style={styles.aiActionItem}
                onPress={() => onActionPress(action)}
              >
                <View style={styles.aiActionIcon}>
                  <Ionicons name={action.icon} size={24} color={theme.colors.primary} />
                </View>
                <Text style={styles.aiActionLabel}>{action.label}</Text>
                <Ionicons name="chevron-forward" size={20} color={theme.colors.textMuted} />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  modalTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    flex: 1,
    marginRight: theme.spacing.md,
  },
  aiMenuContent: {
    backgroundColor: theme.colors.card,
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
    paddingBottom: 32,
  },
  aiActionsList: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
  },
  aiActionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    gap: theme.spacing.md,
  },
  aiActionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  aiActionLabel: {
    flex: 1,
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    fontWeight: theme.fontWeight.medium,
  },
});
