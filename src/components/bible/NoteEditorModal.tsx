/**
 * NoteEditorModal - Verse note editing modal
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../lib/theme';
import { VerseNote, VerseSource } from '../../types';
import { formatDate } from './constants';

interface NoteEditorModalProps {
  visible: boolean;
  onClose: () => void;
  selectedVerse: VerseSource | null;
  noteText: string;
  onNoteTextChange: (text: string) => void;
  editingNote: VerseNote | null;
  onSave: () => void;
  onDelete: () => void;
}

export function NoteEditorModal({
  visible,
  onClose,
  selectedVerse,
  noteText,
  onNoteTextChange,
  editingNote,
  onSave,
  onDelete,
}: NoteEditorModalProps) {
  const handleClose = () => {
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.noteModalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingNote ? 'Edit Note' : 'Add Note'}
              </Text>
              <TouchableOpacity onPress={handleClose}>
                <Ionicons name="close" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>

            <Text style={styles.noteVerseRef}>
              {selectedVerse?.book} {selectedVerse?.chapter}:{selectedVerse?.verse}
            </Text>

            <Text style={styles.noteVersePreview} numberOfLines={3}>
              &quot;{selectedVerse?.text}&quot;
            </Text>

            {editingNote && (
              <View style={styles.noteTimestamps}>
                <Text style={styles.timestampText}>
                  Created: {formatDate(editingNote.createdAt)}
                </Text>
                {editingNote.updatedAt.getTime() !== editingNote.createdAt.getTime() && (
                  <Text style={styles.timestampText}>
                    Updated: {formatDate(editingNote.updatedAt)}
                  </Text>
                )}
              </View>
            )}

            <TextInput
              style={styles.noteInput}
              multiline
              placeholder="Write your notes, thoughts, or reflections..."
              placeholderTextColor={theme.colors.textMuted}
              value={noteText}
              onChangeText={onNoteTextChange}
              textAlignVertical="top"
              autoFocus
            />

            <View style={styles.noteButtonRow}>
              {editingNote && (
                <TouchableOpacity style={styles.deleteNoteButton} onPress={onDelete}>
                  <Ionicons name="trash-outline" size={18} color={theme.colors.error} />
                  <Text style={styles.deleteNoteButtonText}>Delete</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={[styles.saveNoteButton, editingNote && styles.saveNoteButtonWithDelete]}
                onPress={onSave}
              >
                <Text style={styles.saveNoteButtonText}>
                  {editingNote ? 'Save Changes' : 'Save Note'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  keyboardAvoidingView: {
    flex: 1,
  },
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
  },
  noteModalContent: {
    backgroundColor: theme.colors.card,
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
    paddingBottom: 32,
  },
  noteVerseRef: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.primary,
    paddingHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.md,
  },
  noteVersePreview: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
    paddingHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.xs,
    lineHeight: theme.fontSize.sm * 1.5,
  },
  noteTimestamps: {
    paddingHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.sm,
    gap: 2,
  },
  timestampText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textMuted,
  },
  noteInput: {
    height: 150,
    marginHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.md,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    color: theme.colors.text,
    fontSize: theme.fontSize.md,
    lineHeight: theme.fontSize.md * 1.5,
  },
  noteButtonRow: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  deleteNoteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.error,
    gap: theme.spacing.xs,
  },
  deleteNoteButtonText: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.error,
  },
  saveNoteButton: {
    flex: 1,
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
  },
  saveNoteButtonWithDelete: {
    flex: 2,
  },
  saveNoteButtonText: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
  },
});
