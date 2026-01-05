/**
 * JournalDetailScreen - View and edit journal entries
 *
 * Features:
 * - Full entry display with all media
 * - Linked verses as tappable cards
 * - Edit mode toggle
 * - Share capability
 * - Delete with confirmation
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Share,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../lib/theme';
import { useStore } from '../../store/useStore';
import { RootStackParamList, SpiritualMoment, JournalMedia } from '../../types';
import { navigateToBibleVerse } from '../../lib/navigationHelpers';
import { MediaPreviewList } from '../../components/journal/MediaPreview';
import VoiceNotePlayer from '../../components/journal/VoiceNotePlayer';

type JournalDetailRouteProp = RouteProp<RootStackParamList, 'JournalDetail'>;

export default function JournalDetailScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<JournalDetailRouteProp>();
  const { momentId, editMode: initialEditMode } = route.params;

  // Store
  const recentMoments = useStore((state) => state.recentMoments);
  const updateMoment = useStore((state) => state.updateMoment);
  const deleteMoment = useStore((state) => state.deleteMoment);

  // Find the moment
  const moment = recentMoments.find((m) => m.id === momentId);

  // State
  const [isEditing, setIsEditing] = useState(initialEditMode || false);
  const [editedContent, setEditedContent] = useState(moment?.content || '');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (moment) {
      setEditedContent(moment.content);
    }
  }, [moment]);

  if (!moment) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Entry Not Found</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.emptyContainer}>
          <Ionicons name="document-outline" size={64} color={theme.colors.textMuted} />
          <Text style={styles.emptyText}>This journal entry could not be found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const formattedDate = new Date(moment.createdAt).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });

  const handleSave = async () => {
    if (!editedContent.trim()) {
      Alert.alert('Empty Entry', 'Please write something before saving.');
      return;
    }

    setIsSaving(true);
    try {
      updateMoment(momentId, {
        content: editedContent.trim(),
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating journal entry:', error);
      Alert.alert('Error', 'Failed to save changes. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Entry',
      'Are you sure you want to delete this journal entry? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteMoment(momentId);
            navigation.goBack();
          },
        },
      ]
    );
  };

  const handleShare = async () => {
    try {
      let shareText = moment.content;

      if (moment.linkedVerses && moment.linkedVerses.length > 0) {
        const verseRefs = moment.linkedVerses
          .map((v) => `${v.book} ${v.chapter}:${v.verse}`)
          .join(', ');
        shareText += `\n\nScripture: ${verseRefs}`;
      }

      shareText += '\n\n— From my journal in ChooseGOD';

      await Share.share({ message: shareText });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleVersePress = (verse: any) => {
    navigateToBibleVerse(navigation, verse.book, verse.chapter, verse.verse);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isEditing ? 'Edit Entry' : 'Journal Entry'}
        </Text>
        {isEditing ? (
          <TouchableOpacity
            onPress={handleSave}
            style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
            disabled={isSaving}
          >
            <Text style={styles.saveButtonText}>
              {isSaving ? 'Saving...' : 'Save'}
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={() => setIsEditing(true)} style={styles.editButton}>
            <Ionicons name="pencil" size={20} color={theme.colors.primary} />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Date */}
        <Text style={styles.date}>{formattedDate}</Text>

        {/* Content */}
        {isEditing ? (
          <TextInput
            style={styles.editInput}
            multiline
            value={editedContent}
            onChangeText={setEditedContent}
            textAlignVertical="top"
            autoFocus
          />
        ) : (
          <Text style={styles.content}>{moment.content}</Text>
        )}

        {/* Media */}
        {moment.media && moment.media.length > 0 && !isEditing && (
          <View style={styles.mediaSection}>
            {/* Photos */}
            {moment.media.filter((m) => m.type === 'photo').length > 0 && (
              <MediaPreviewList
                media={moment.media.filter((m) => m.type === 'photo')}
                size="large"
              />
            )}
            {/* Voice Notes */}
            {moment.media
              .filter((m) => m.type === 'voice')
              .map((voiceNote) => (
                <VoiceNotePlayer
                  key={voiceNote.id}
                  uri={voiceNote.uri}
                  duration={voiceNote.duration}
                />
              ))}
          </View>
        )}

        {/* Linked Verses */}
        {moment.linkedVerses && moment.linkedVerses.length > 0 && (
          <View style={styles.versesSection}>
            <Text style={styles.sectionTitle}>Scripture References</Text>
            {moment.linkedVerses.map((verse, index) => (
              <TouchableOpacity
                key={`${verse.book}-${verse.chapter}-${verse.verse}-${index}`}
                style={styles.verseCard}
                onPress={() => handleVersePress(verse)}
              >
                <View style={styles.verseHeader}>
                  <Ionicons name="book-outline" size={16} color={theme.colors.primary} />
                  <Text style={styles.verseReference}>
                    {verse.book} {verse.chapter}:{verse.verse}
                  </Text>
                  <Ionicons name="chevron-forward" size={16} color={theme.colors.textMuted} />
                </View>
                {verse.text && (
                  <Text style={styles.verseText} numberOfLines={3}>
                    "{verse.text}"
                  </Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Themes */}
        {moment.themes && moment.themes.length > 0 && (
          <View style={styles.themesSection}>
            <Text style={styles.sectionTitle}>Themes</Text>
            <View style={styles.themesContainer}>
              {moment.themes.map((t, index) => (
                <View key={index} style={styles.themeBadge}>
                  <Text style={styles.themeBadgeText}>{t}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* AI Insights */}
        {moment.aiInsights && (
          <View style={styles.insightsSection}>
            <View style={styles.insightsHeader}>
              <Ionicons name="sparkles" size={18} color={theme.colors.accent} />
              <Text style={styles.sectionTitle}>Insights</Text>
            </View>
            {moment.aiInsights.summary && (
              <Text style={styles.insightText}>{moment.aiInsights.summary}</Text>
            )}
            {moment.aiInsights.reflectionQuestions &&
              moment.aiInsights.reflectionQuestions.length > 0 && (
                <View style={styles.questionsContainer}>
                  <Text style={styles.questionsTitle}>Reflection Questions</Text>
                  {moment.aiInsights.reflectionQuestions.map((q, i) => (
                    <Text key={i} style={styles.questionText}>
                      • {q}
                    </Text>
                  ))}
                </View>
              )}
          </View>
        )}

        {/* Actions */}
        {!isEditing && (
          <View style={styles.actionsContainer}>
            <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
              <Ionicons name="share-outline" size={20} color={theme.colors.primary} />
              <Text style={styles.actionButtonText}>Share</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.deleteButton]}
              onPress={handleDelete}
            >
              <Ionicons name="trash-outline" size={20} color={theme.colors.error} />
              <Text style={[styles.actionButtonText, styles.deleteButtonText]}>
                Delete
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Cancel Edit */}
        {isEditing && (
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => {
              setEditedContent(moment.content);
              setIsEditing(false);
            }}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
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
  backButton: {
    padding: theme.spacing.xs,
  },
  headerTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
  },
  editButton: {
    padding: theme.spacing.sm,
  },
  saveButton: {
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.full,
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold,
    color: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: theme.spacing.lg,
  },
  date: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
  },
  content: {
    fontSize: theme.fontSize.lg,
    color: theme.colors.text,
    lineHeight: theme.fontSize.lg * 1.7,
  },
  mediaSection: {
    marginTop: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  editInput: {
    fontSize: theme.fontSize.lg,
    color: theme.colors.text,
    lineHeight: theme.fontSize.lg * 1.7,
    minHeight: 200,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  versesSection: {
    marginTop: theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  verseCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  verseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  verseReference: {
    flex: 1,
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.primary,
  },
  verseText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
    marginTop: theme.spacing.sm,
    lineHeight: theme.fontSize.sm * 1.5,
  },
  themesSection: {
    marginTop: theme.spacing.xl,
  },
  themesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  themeBadge: {
    backgroundColor: theme.colors.primary + '20',
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.full,
  },
  themeBadgeText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.primary,
    fontWeight: theme.fontWeight.medium,
    textTransform: 'capitalize',
  },
  insightsSection: {
    marginTop: theme.spacing.xl,
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  insightsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  insightText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    lineHeight: theme.fontSize.md * 1.6,
  },
  questionsContainer: {
    marginTop: theme.spacing.md,
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  questionsTitle: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
  },
  questionText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
    lineHeight: theme.fontSize.sm * 1.5,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: theme.spacing.lg,
    marginTop: theme.spacing.xxl,
    paddingTop: theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  actionButtonText: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.primary,
  },
  deleteButton: {
    borderColor: theme.colors.error + '40',
  },
  deleteButtonText: {
    color: theme.colors.error,
  },
  cancelButton: {
    marginTop: theme.spacing.lg,
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
  },
  cancelButtonText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  emptyText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: theme.spacing.md,
  },
});
