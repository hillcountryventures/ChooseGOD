/**
 * BookPickerModal - Bible book selection modal
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
import { BIBLE_BOOKS } from '../../data/bible/books';

interface BookPickerModalProps {
  visible: boolean;
  onClose: () => void;
  currentBook: string;
  onSelectBook: (book: string) => void;
}

export function BookPickerModal({
  visible,
  onClose,
  currentBook,
  onSelectBook,
}: BookPickerModalProps) {
  const handleSelect = (book: string) => {
    onSelectBook(book);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Book</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={theme.colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.bookList}>
            {Object.entries(BIBLE_BOOKS).map(([testament, books]) => (
              <View key={testament}>
                <Text style={styles.testamentHeader}>{testament}</Text>
                <View style={styles.booksGrid}>
                  {books.map((book) => (
                    <TouchableOpacity
                      key={book}
                      style={[
                        styles.bookItem,
                        currentBook === book && styles.bookItemSelected,
                      ]}
                      onPress={() => handleSelect(book)}
                    >
                      <Text
                        style={[
                          styles.bookItemText,
                          currentBook === book && styles.bookItemTextSelected,
                        ]}
                        numberOfLines={1}
                      >
                        {book}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            ))}
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
    maxHeight: '80%',
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
  bookList: {
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.md,
  },
  testamentHeader: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    paddingHorizontal: theme.spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  booksGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.xs,
  },
  bookItem: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.xs,
  },
  bookItemSelected: {
    backgroundColor: theme.colors.primary,
  },
  bookItemText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text,
  },
  bookItemTextSelected: {
    color: theme.colors.text,
    fontWeight: theme.fontWeight.semibold,
  },
});
