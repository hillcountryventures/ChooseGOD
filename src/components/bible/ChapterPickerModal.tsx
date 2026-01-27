/**
 * ChapterPickerModal - Bible chapter selection modal
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../lib/theme';

interface ChapterPickerModalProps {
  visible: boolean;
  onClose: () => void;
  currentChapter: number;
  totalChapters: number;
  onSelectChapter: (chapter: number) => void;
}

export function ChapterPickerModal({
  visible,
  onClose,
  currentChapter,
  totalChapters,
  onSelectChapter,
}: ChapterPickerModalProps) {
  const handleSelect = (chapter: number) => {
    onSelectChapter(chapter);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Chapter</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={theme.colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.chapterList}>
            <View style={styles.chaptersGrid}>
              {Array.from({ length: totalChapters }, (_, i) => i + 1).map((ch) => (
                <TouchableOpacity
                  key={ch}
                  style={[
                    styles.chapterItem,
                    currentChapter === ch && styles.chapterItemSelected,
                  ]}
                  onPress={() => handleSelect(ch)}
                >
                  <Text
                    style={[
                      styles.chapterItemText,
                      currentChapter === ch && styles.chapterItemTextSelected,
                    ]}
                  >
                    {ch}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
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
  modalContent: {
    backgroundColor: theme.colors.card,
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
    maxHeight: '60%',
    paddingBottom: 32,
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
  },
  chapterList: {
    padding: theme.spacing.md,
  },
  chaptersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
    justifyContent: 'center',
  },
  chapterItem: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
  },
  chapterItemSelected: {
    backgroundColor: theme.colors.primary,
  },
  chapterItemText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
  },
  chapterItemTextSelected: {
    fontWeight: theme.fontWeight.bold,
  },
});
