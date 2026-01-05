/**
 * JournalComposeScreen - X/Twitter-inspired compose experience
 *
 * Features:
 * - Full-screen modal with slide-up animation
 * - Rich text input area
 * - Verse chips for linked verses
 * - Media attachment bar (photo, voice, verse)
 * - AI prompt suggestions
 * - Auto-save drafts
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Keyboard,
  Modal,
  ActionSheetIOS,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { theme } from '../../lib/theme';
import { useStore } from '../../store/useStore';
import {
  RootStackParamList,
  SpiritualMoment,
  VerseSource,
  JournalMedia,
  JournalDraft,
} from '../../types';
import { MediaPreviewList } from '../../components/journal/MediaPreview';
import VoiceNoteRecorder from '../../components/journal/VoiceNoteRecorder';
import { getTimeBasedPrompts } from '../../components/journal/JournalPromptsCarousel';

type JournalComposeRouteProp = RouteProp<RootStackParamList, 'JournalCompose'>;

interface JournalComposeParams {
  draftId?: string;
  initialVerse?: {
    book: string;
    chapter: number;
    verse: number;
    text: string;
    translation: string;
  };
  initialPrompt?: string;
  source?: {
    type: 'standalone' | 'verse_reflection' | 'devotional' | 'ai_prompt' | 'bible_reading';
    referenceId?: string;
  };
  selectedVerses?: VerseSource[];
}

export default function JournalComposeScreen() {
  const navigation = useNavigation();
  const route = useRoute<JournalComposeRouteProp>();

  // Params
  const { draftId, initialVerse, initialPrompt, source, selectedVerses: versesFromPicker } = (route.params || {}) as JournalComposeParams;

  // Store
  const addMoment = useStore((state) => state.addMoment);
  const currentDraft = useStore((state) => state.currentDraft);
  const setCurrentDraft = useStore((state) => state.setCurrentDraft);
  const updateDraft = useStore((state) => state.updateDraft);
  const clearDraft = useStore((state) => state.clearDraft);
  const savedDrafts = useStore((state) => state.savedDrafts);
  const dailyPrompts = useStore((state) => state.dailyPrompts);

  // State
  const [content, setContent] = useState('');
  const [linkedVerses, setLinkedVerses] = useState<VerseSource[]>([]);
  const [media, setMedia] = useState<JournalMedia[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [showPrompts, setShowPrompts] = useState(true);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);

  const textInputRef = useRef<TextInput>(null);
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Prompts to show - uses time-based prompts (morning/evening/default)
  const prompts = dailyPrompts.length > 0 ? dailyPrompts : getTimeBasedPrompts();

  // Initialize from params or draft
  useEffect(() => {
    if (draftId) {
      // Load existing draft
      const draft = savedDrafts.find((d) => d.id === draftId);
      if (draft) {
        setContent(draft.content);
        setLinkedVerses(draft.linkedVerses);
        setMedia(draft.media);
      }
    } else if (initialVerse) {
      // Start with initial verse
      setLinkedVerses([initialVerse as VerseSource]);
    }

    if (initialPrompt) {
      setContent(initialPrompt);
    }

    // Restore current draft if exists and no specific params
    if (!draftId && !initialVerse && !initialPrompt && currentDraft) {
      setContent(currentDraft.content);
      setLinkedVerses(currentDraft.linkedVerses);
      setMedia(currentDraft.media);
    }
  }, []);

  // Handle verses returned from VersePicker
  useEffect(() => {
    if (versesFromPicker && versesFromPicker.length > 0) {
      setLinkedVerses((prev) => {
        // Merge with existing, avoiding duplicates
        const existingKeys = new Set(
          prev.map((v) => `${v.book}-${v.chapter}-${v.verse}`)
        );
        const newVerses = versesFromPicker.filter(
          (v) => !existingKeys.has(`${v.book}-${v.chapter}-${v.verse}`)
        );
        return [...prev, ...newVerses];
      });
    }
  }, [versesFromPicker]);

  // Keyboard listeners
  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', () => {
      setKeyboardVisible(true);
      setShowPrompts(false);
    });
    const hideSub = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardVisible(false);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  // Auto-save draft every 30 seconds
  useEffect(() => {
    if (content.trim() || linkedVerses.length > 0 || media.length > 0) {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }

      autoSaveTimerRef.current = setTimeout(() => {
        const draft: JournalDraft = {
          id: draftId || `draft-${Date.now()}`,
          content,
          linkedVerses,
          media,
          lastSavedAt: new Date(),
          source,
        };
        setCurrentDraft(draft);
      }, 30000);
    }

    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [content, linkedVerses, media]);

  const handleClose = useCallback(() => {
    if (content.trim() || linkedVerses.length > 0 || media.length > 0) {
      Alert.alert(
        'Save as Draft?',
        'Would you like to save this entry as a draft?',
        [
          {
            text: 'Discard',
            style: 'destructive',
            onPress: () => {
              clearDraft();
              navigation.goBack();
            },
          },
          {
            text: 'Save Draft',
            onPress: () => {
              const draft: JournalDraft = {
                id: draftId || `draft-${Date.now()}`,
                content,
                linkedVerses,
                media,
                lastSavedAt: new Date(),
                source,
              };
              setCurrentDraft(draft);
              navigation.goBack();
            },
          },
          { text: 'Keep Writing', style: 'cancel' },
        ]
      );
    } else {
      navigation.goBack();
    }
  }, [content, linkedVerses, media, draftId, source, navigation]);

  const handlePost = useCallback(async () => {
    if (!content.trim()) {
      Alert.alert('Empty Entry', 'Please write something before saving.');
      return;
    }

    setIsSaving(true);

    try {
      const moment: SpiritualMoment = {
        id: `journal-${Date.now()}`,
        userId: 'local-user',
        momentType: 'journal',
        content: content.trim(),
        linkedVerses,
        themes: [],
        createdAt: new Date(),
        media: media.length > 0 ? media : undefined,
        status: 'published',
        source: source || { type: 'standalone' },
        metadata: {
          wordCount: content.trim().split(/\s+/).length,
        },
      };

      addMoment(moment);
      clearDraft();
      navigation.goBack();
    } catch (error) {
      console.error('Error saving journal entry:', error);
      Alert.alert('Error', 'Failed to save your entry. Please try again.');
    } finally {
      setIsSaving(false);
    }
  }, [content, linkedVerses, media, source, addMoment, clearDraft, navigation]);

  const handlePromptPress = (promptText: string) => {
    setContent(promptText + '\n\n');
    setShowPrompts(false);
    textInputRef.current?.focus();
  };

  const removeVerse = (index: number) => {
    setLinkedVerses((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddVerse = () => {
    (navigation as any).navigate('VersePicker', {
      selectedVerses: linkedVerses,
    });
  };

  const handleAddPhoto = async () => {
    // Check permissions
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Please allow access to your photo library to add photos.',
        [{ text: 'OK' }]
      );
      return;
    }

    // Show action sheet for camera vs library
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Cancel', 'Take Photo', 'Choose from Library'],
          cancelButtonIndex: 0,
        },
        async (buttonIndex) => {
          if (buttonIndex === 1) {
            await launchCamera();
          } else if (buttonIndex === 2) {
            await launchLibrary();
          }
        }
      );
    } else {
      // For Android, show an Alert as action sheet alternative
      Alert.alert('Add Photo', 'Choose an option', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Take Photo', onPress: launchCamera },
        { text: 'Choose from Library', onPress: launchLibrary },
      ]);
    }
  };

  const launchCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Please allow camera access to take photos.',
        [{ text: 'OK' }]
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const newMedia: JournalMedia = {
        id: `photo-${Date.now()}`,
        type: 'photo',
        uri: result.assets[0].uri,
        createdAt: new Date(),
      };
      setMedia((prev) => [...prev, newMedia]);
    }
  };

  const launchLibrary = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      selectionLimit: 4 - media.filter((m) => m.type === 'photo').length, // Max 4 photos
      quality: 0.8,
    });

    if (!result.canceled && result.assets.length > 0) {
      const newMedia: JournalMedia[] = result.assets.map((asset, index) => ({
        id: `photo-${Date.now()}-${index}`,
        type: 'photo' as const,
        uri: asset.uri,
        createdAt: new Date(),
      }));
      setMedia((prev) => [...prev, ...newMedia]);
    }
  };

  const handleAddVoice = () => {
    setShowVoiceRecorder(true);
  };

  const handleVoiceRecordingComplete = (voiceMedia: JournalMedia) => {
    setMedia((prev) => [...prev, voiceMedia]);
    setShowVoiceRecorder(false);
  };

  const handleRemoveMedia = (mediaId: string) => {
    setMedia((prev) => prev.filter((m) => m.id !== mediaId));
  };

  const handleAddPrayer = () => {
    const prayerStarter = content.trim() ? '\n\nDear Lord,\n' : 'Dear Lord,\n';
    setContent((prev) => prev + prayerStarter);
    textInputRef.current?.focus();
  };

  const handleAddGratitude = () => {
    const gratitudeStarter = content.trim()
      ? '\n\nI am grateful for:\n• '
      : 'I am grateful for:\n• ';
    setContent((prev) => prev + gratitudeStarter);
    textInputRef.current?.focus();
  };

  const handleAskAI = () => {
    if (!content.trim()) {
      Alert.alert(
        'Start Writing First',
        'Write something in your journal, then tap Ask AI for reflection prompts or verse suggestions.',
        [{ text: 'OK' }]
      );
      return;
    }
    // Navigate to chat with journal context for AI-powered reflection
    (navigation as any).navigate('Chat', {
      mode: 'journal',
      initialMessage: content.trim(),
      context: {
        type: 'journal_reflection',
        linkedVerses: linkedVerses,
      },
    });
  };

  const canPost = content.trim().length > 0;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Journal</Text>
          <TouchableOpacity
            onPress={handlePost}
            style={[
              styles.postButton,
              !canPost && styles.postButtonDisabled,
              isSaving && styles.postButtonDisabled,
            ]}
            disabled={!canPost || isSaving}
          >
            <Text
              style={[
                styles.postButtonText,
                !canPost && styles.postButtonTextDisabled,
              ]}
            >
              {isSaving ? 'Saving...' : 'Post'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Writing Prompts - helps users start their entry */}
        {showPrompts && !keyboardVisible && (
          <View style={styles.promptsContainer}>
            <View style={styles.promptsHeader}>
              <Text style={styles.promptsTitle}>Tap a prompt to begin writing:</Text>
              <TouchableOpacity onPress={() => setShowPrompts(false)}>
                <Ionicons
                  name="close-circle"
                  size={20}
                  color={theme.colors.textMuted}
                />
              </TouchableOpacity>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.promptsScroll}
            >
              {prompts.map((prompt) => {
                // Split "Category: Description" format
                const [category, ...descParts] = prompt.text.split(':');
                const description = descParts.join(':').trim();

                return (
                  <TouchableOpacity
                    key={prompt.id}
                    style={styles.promptChip}
                    onPress={() => handlePromptPress(prompt.text)}
                  >
                    <View style={styles.promptIconContainer}>
                      <Ionicons
                        name={(prompt.icon || 'sparkles') as keyof typeof Ionicons.glyphMap}
                        size={18}
                        color={theme.colors.primary}
                      />
                    </View>
                    <View style={styles.promptTextContainer}>
                      <Text style={styles.promptCategory}>{category}</Text>
                      <Text style={styles.promptDescription} numberOfLines={2}>
                        {description || prompt.text}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        )}

        {/* Main Content */}
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Text Input */}
          <TextInput
            ref={textInputRef}
            style={styles.textInput}
            multiline
            placeholder="What's on your heart today?"
            placeholderTextColor={theme.colors.textMuted}
            value={content}
            onChangeText={setContent}
            textAlignVertical="top"
            autoFocus={!showPrompts}
          />

          {/* Linked Verses */}
          {linkedVerses.length > 0 && (
            <View style={styles.versesContainer}>
              {linkedVerses.map((verse, index) => (
                <View key={`${verse.book}-${verse.chapter}-${verse.verse}`} style={styles.verseChip}>
                  <Ionicons
                    name="book-outline"
                    size={14}
                    color={theme.colors.primary}
                  />
                  <Text style={styles.verseChipText}>
                    {verse.book} {verse.chapter}:{verse.verse}
                  </Text>
                  <TouchableOpacity
                    onPress={() => removeVerse(index)}
                    style={styles.verseRemoveBtn}
                  >
                    <Ionicons
                      name="close-circle"
                      size={16}
                      color={theme.colors.textMuted}
                    />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          {/* Media Previews */}
          {media.length > 0 && (
            <View style={styles.mediaContainer}>
              <MediaPreviewList
                media={media}
                onRemove={handleRemoveMedia}
                size="medium"
              />
            </View>
          )}
        </ScrollView>

        {/* Voice Recorder Modal */}
        <Modal
          visible={showVoiceRecorder}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => setShowVoiceRecorder(false)}
        >
          <SafeAreaView style={styles.voiceRecorderModal}>
            <View style={styles.voiceRecorderHeader}>
              <TouchableOpacity onPress={() => setShowVoiceRecorder(false)}>
                <Ionicons name="close" size={24} color={theme.colors.text} />
              </TouchableOpacity>
              <Text style={styles.voiceRecorderTitle}>Voice Note</Text>
              <View style={{ width: 24 }} />
            </View>
            <View style={styles.voiceRecorderContent}>
              <VoiceNoteRecorder
                onRecordingComplete={handleVoiceRecordingComplete}
                onCancel={() => setShowVoiceRecorder(false)}
              />
            </View>
          </SafeAreaView>
        </Modal>

        {/* Media Bar */}
        <View style={styles.mediaBar}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.mediaButtons}
          >
            <TouchableOpacity style={styles.mediaButton} onPress={handleAddPhoto}>
              <View style={styles.mediaButtonIcon}>
                <Ionicons name="camera-outline" size={20} color={theme.colors.primary} />
              </View>
              <Text style={styles.mediaButtonLabel}>Photo</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.mediaButton} onPress={handleAddVoice}>
              <View style={styles.mediaButtonIcon}>
                <Ionicons name="mic-outline" size={20} color={theme.colors.primary} />
              </View>
              <Text style={styles.mediaButtonLabel}>Voice</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.mediaButton} onPress={handleAddVerse}>
              <View style={styles.mediaButtonIcon}>
                <Ionicons name="book-outline" size={20} color={theme.colors.primary} />
              </View>
              <Text style={styles.mediaButtonLabel}>Scripture</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.mediaButton} onPress={handleAddPrayer}>
              <View style={styles.mediaButtonIcon}>
                <Ionicons name="hand-left-outline" size={20} color={theme.colors.accent} />
              </View>
              <Text style={styles.mediaButtonLabel}>Prayer</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.mediaButton} onPress={handleAddGratitude}>
              <View style={styles.mediaButtonIcon}>
                <Ionicons name="heart-outline" size={20} color={theme.colors.error} />
              </View>
              <Text style={styles.mediaButtonLabel}>Gratitude</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.mediaButton} onPress={handleAskAI}>
              <View style={[styles.mediaButtonIcon, styles.aiButtonIcon]}>
                <Ionicons name="sparkles" size={20} color="#fff" />
              </View>
              <Text style={styles.mediaButtonLabel}>Ask AI</Text>
            </TouchableOpacity>
          </ScrollView>
          <View style={styles.wordCount}>
            <Text style={styles.wordCountText}>
              {content.trim().split(/\s+/).filter(Boolean).length} words
            </Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  keyboardView: {
    flex: 1,
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
    padding: theme.spacing.xs,
  },
  headerTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
  },
  postButton: {
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.lg,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.full,
  },
  postButtonDisabled: {
    opacity: 0.5,
  },
  postButtonText: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.bold,
    color: '#fff',
  },
  postButtonTextDisabled: {
    opacity: 0.7,
  },
  promptsContainer: {
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  promptsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  promptsTitle: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.textSecondary,
  },
  promptsScroll: {
    paddingHorizontal: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  promptChip: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: theme.colors.surface,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    gap: theme.spacing.sm,
    minWidth: 180,
    maxWidth: 220,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  promptIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.primaryAlpha[15],
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  promptTextContainer: {
    flex: 1,
  },
  promptCategory: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.primary,
    marginBottom: 2,
  },
  promptDescription: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
    lineHeight: theme.fontSize.xs * 1.4,
  },
  promptText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text,
    flex: 1,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: theme.spacing.lg,
    flexGrow: 1,
  },
  textInput: {
    fontSize: theme.fontSize.lg,
    color: theme.colors.text,
    lineHeight: theme.fontSize.lg * 1.6,
    minHeight: 200,
  },
  versesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.lg,
  },
  verseChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primaryAlpha[20],
    paddingVertical: theme.spacing.xs,
    paddingLeft: theme.spacing.sm,
    paddingRight: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
    gap: theme.spacing.xs,
  },
  verseChipText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.primary,
    fontWeight: theme.fontWeight.medium,
  },
  verseRemoveBtn: {
    padding: 2,
  },
  mediaContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.lg,
  },
  mediaPreview: {
    width: 80,
    height: 80,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  mediaBar: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    backgroundColor: theme.colors.background,
    paddingVertical: theme.spacing.sm,
  },
  mediaButtons: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.md,
    gap: theme.spacing.md,
  },
  mediaButton: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
    minWidth: 56,
  },
  mediaButtonIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: 4,
  },
  aiButtonIcon: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  mediaButtonLabel: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
    fontWeight: theme.fontWeight.medium,
  },
  wordCount: {
    position: 'absolute',
    right: theme.spacing.md,
    top: theme.spacing.sm,
  },
  wordCountText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textMuted,
  },
  voiceRecorderModal: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  voiceRecorderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  voiceRecorderTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
  },
  voiceRecorderContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
});
