import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../lib/theme';

interface Props {
  visible: boolean;
  onClose: () => void;
}

export function PhilosophyModal({ visible, onClose }: Props) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Our Philosophy</Text>
          <TouchableOpacity onPress={onClose} style={styles.modalClose} accessibilityLabel="Close" accessibilityRole="button">
            <Ionicons name="close" size={24} color={theme.colors.text} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalContent}>
          <View style={styles.philosophySection}>
            <View style={styles.philosophyIconContainer}>
              <Ionicons name="book" size={48} color={theme.colors.primary} />
            </View>
            <Text style={styles.philosophyTitle}>
              We are not God, only helping others find HIM
            </Text>
          </View>

          <View style={styles.philosophyPoint}>
            <Ionicons name="arrow-forward" size={16} color={theme.colors.accent} />
            <Text style={styles.philosophyText}>
              ChooseGOD is a tool, not a replacement for Scripture, church, or community.
            </Text>
          </View>

          <View style={styles.philosophyPoint}>
            <Ionicons name="arrow-forward" size={16} color={theme.colors.accent} />
            <Text style={styles.philosophyText}>
              The AI companion is designed to point you back to God&apos;s Word, never to replace it.
            </Text>
          </View>

          <View style={styles.philosophyPoint}>
            <Ionicons name="arrow-forward" size={16} color={theme.colors.accent} />
            <Text style={styles.philosophyText}>
              Every feature, every response, every interaction should lead you closer to Jesus.
            </Text>
          </View>

          <View style={styles.philosophyPoint}>
            <Ionicons name="arrow-forward" size={16} color={theme.colors.accent} />
            <Text style={styles.philosophyText}>
              We believe the Bible is the inspired Word of God and the ultimate authority for faith and life.
            </Text>
          </View>

          <View style={styles.philosophyVerse}>
            <Text style={styles.philosophyVerseText}>
              &quot;All Scripture is God-breathed and is useful for teaching, rebuking, correcting and training in righteousness.&quot;
            </Text>
            <Text style={styles.philosophyVerseRef}>— 2 Timothy 3:16</Text>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  modalTitle: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text,
  },
  modalClose: {
    padding: 4,
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  philosophySection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  philosophyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  philosophyTitle: {
    fontSize: theme.typography.sizes.xl,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text,
    textAlign: 'center',
  },
  philosophyPoint: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 16,
  },
  philosophyText: {
    flex: 1,
    fontSize: theme.typography.sizes.md,
    color: theme.colors.textSecondary,
    lineHeight: 22,
  },
  philosophyVerse: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
  },
  philosophyVerseText: {
    fontSize: theme.typography.sizes.md,
    color: theme.colors.text,
    fontStyle: 'italic',
    lineHeight: 22,
  },
  philosophyVerseRef: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.primary,
    marginTop: 8,
    textAlign: 'right',
  },
});
