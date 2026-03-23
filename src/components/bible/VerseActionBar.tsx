/**
 * VerseActionBar - Bottom action bar for verse interactions
 * 
 * Shows highlight colors, note access, bookmark toggle, AI actions,
 * cross-references, and share options.
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../lib/theme';
import { HighlightColor, VerseNote } from '../../types';
import { HIGHLIGHT_COLORS, AI_QUICK_ACTIONS, formatDate } from './constants';
import { VerseWithAnnotations } from './VerseRow';

interface VerseActionBarProps {
  selectedVerse: VerseWithAnnotations;
  notes: VerseNote[];
  isHighlighted: boolean;
  isBookmarked: boolean;
  onClose: () => void;
  onHighlight: (color: HighlightColor) => void;
  onRemoveHighlight: () => void;
  onBookmark: () => void;
  onOpenNote: () => void;
  onEditNote: (note: VerseNote) => void;
  onAIAction: (prompt: string) => void;
  onCrossRefs: () => void;
  onShare: () => void;
}

export function VerseActionBar({
  selectedVerse,
  notes,
  isHighlighted,
  isBookmarked,
  onClose,
  onHighlight,
  onRemoveHighlight,
  onBookmark,
  onOpenNote,
  onEditNote,
  onAIAction,
  onCrossRefs,
  onShare,
}: VerseActionBarProps) {
  const verseRef = `${selectedVerse.book} ${selectedVerse.chapter}:${selectedVerse.verse}`;
  const sortedNotes = [...notes].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <View style={styles.actionBar}>
      {/* Header */}
      <View style={styles.actionBarHeader}>
        <Text style={styles.actionBarTitle}>{verseRef}</Text>
        <TouchableOpacity onPress={onClose}>
          <Ionicons name="close" size={24} color={theme.colors.text} />
        </TouchableOpacity>
      </View>

      {/* Existing notes timeline */}
      {notes.length > 0 && (
        <View style={styles.notesSection}>
          <View style={styles.notesSectionHeader}>
            <Text style={styles.notesSectionTitle}>Your Notes ({notes.length})</Text>
            <TouchableOpacity style={styles.addNoteButton} onPress={onOpenNote}>
              <Ionicons name="add-circle" size={20} color={theme.colors.primary} />
              <Text style={styles.addNoteButtonText}>Add</Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.notesTimeline} horizontal={false} nestedScrollEnabled>
            {sortedNotes.map((note) => (
              <TouchableOpacity
                key={note.id}
                style={styles.notePreview}
                onPress={() => onEditNote(note)}
              >
                <View style={styles.notePreviewHeader}>
                  <Text style={styles.notePreviewDate}>{formatDate(note.createdAt)}</Text>
                  <Ionicons name="chevron-forward" size={16} color={theme.colors.textMuted} />
                </View>
                <Text style={styles.notePreviewText} numberOfLines={2}>
                  {note.content}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Highlight colors */}
      <View style={styles.highlightSection}>
        <Text style={styles.sectionLabel}>Highlight</Text>
        <View style={styles.colorRow}>
          {HIGHLIGHT_COLORS.map(({ color, hex }) => (
            <TouchableOpacity
              key={color}
              style={[
                styles.colorButton,
                { backgroundColor: hex },
                selectedVerse.highlight?.color === color && styles.colorButtonSelected,
              ]}
              onPress={() => onHighlight(color)}
            />
          ))}
          {isHighlighted && (
            <TouchableOpacity style={styles.removeHighlightButton} onPress={onRemoveHighlight}>
              <Ionicons name="close-circle" size={24} color={theme.colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Quick actions */}
      <View style={styles.actionsSection}>
        {/* Primary actions row */}
        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.actionButton} onPress={onBookmark}>
            <Ionicons
              name={isBookmarked ? 'bookmark' : 'bookmark-outline'}
              size={20}
              color={isBookmarked ? theme.colors.accent : theme.colors.text}
            />
            <Text style={styles.actionButtonText}>
              {isBookmarked ? 'Bookmarked' : 'Bookmark'}
            </Text>
          </TouchableOpacity>

          {notes.length === 0 && (
            <TouchableOpacity style={styles.actionButton} onPress={onOpenNote}>
              <Ionicons name="document-text-outline" size={20} color={theme.colors.text} />
              <Text style={styles.actionButtonText}>Add Note</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.actionButton} onPress={onCrossRefs}>
            <Ionicons name="git-branch-outline" size={20} color={theme.colors.text} />
            <Text style={styles.actionButtonText}>Cross-refs</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={onShare}>
            <Ionicons name="share-outline" size={20} color={theme.colors.text} />
            <Text style={styles.actionButtonText}>Share</Text>
          </TouchableOpacity>
        </View>

        {/* AI Actions */}
        <Text style={styles.sectionLabel}>Ask AI</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.aiActionsScroll}>
          {AI_QUICK_ACTIONS.map((action) => (
            <TouchableOpacity
              key={action.id}
              style={styles.aiActionButton}
              onPress={() => onAIAction(action.getPrompt(verseRef, selectedVerse.text))}
            >
              <Ionicons name={action.icon} size={18} color={theme.colors.primary} />
              <Text style={styles.aiActionText}>{action.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  actionBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: theme.colors.card,
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
    paddingBottom: 34, // Safe area
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  actionBarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  actionBarTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.primary,
  },

  // Notes section
  notesSection: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.sm,
    maxHeight: 140,
  },
  notesSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  notesSectionTitle: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.textSecondary,
  },
  addNoteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  addNoteButtonText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.primary,
    fontWeight: theme.fontWeight.medium,
  },
  notesTimeline: {
    maxHeight: 100,
  },
  notePreview: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.sm,
    marginBottom: theme.spacing.xs,
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.primary,
  },
  notePreviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  notePreviewDate: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textMuted,
  },
  notePreviewText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text,
    lineHeight: theme.fontSize.sm * 1.4,
  },

  // Highlight section
  highlightSection: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.sm,
  },
  sectionLabel: {
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: theme.spacing.xs,
  },
  colorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  colorButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  colorButtonSelected: {
    borderColor: theme.colors.text,
    transform: [{ scale: 1.1 }],
  },
  removeHighlightButton: {
    marginLeft: theme.spacing.sm,
  },

  // Actions section
  actionsSection: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: theme.spacing.md,
  },
  actionButton: {
    alignItems: 'center',
    gap: 4,
  },
  actionButtonText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
  },
  aiActionsScroll: {
    marginTop: theme.spacing.xs,
  },
  aiActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.full,
    marginRight: theme.spacing.sm,
    gap: theme.spacing.xs,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  aiActionText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text,
  },
});
