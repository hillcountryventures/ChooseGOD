/**
 * ChatMessageList - Message list and empty state for ChatBottomSheet
 * Extracted from ChatBottomSheet for maintainability.
 */
import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { FlashList, FlashListRef } from '@shopify/flash-list';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../lib/theme';
import { MessageBubble } from '../MessageBubble';
import { ChatMessage, VerseSource, SuggestedAction } from '../../types';

interface ChatMessageListProps {
  flashListRef: React.RefObject<FlashListRef<ChatMessage> | null>;
  viewShotRef: React.RefObject<View | null>;
  messages: ChatMessage[];
  isQuerying: boolean;
  isPrayerMode: boolean;
  hasMessages: boolean;
  hasDailyVerse: boolean;
  screenType: string;
  onVersePress: (verse: VerseSource) => void;
  onActionPress: (action: SuggestedAction) => void;
  onJournalPress: () => void;
  onPrayPress: () => void;
}

export function ChatMessageList({
  flashListRef,
  viewShotRef,
  messages,
  isQuerying,
  isPrayerMode,
  hasMessages,
  hasDailyVerse,
  screenType,
  onVersePress,
  onActionPress,
  onJournalPress,
  onPrayPress,
}: ChatMessageListProps) {
  if (!hasMessages) {
    return (
      <View style={styles.messageList} ref={viewShotRef} collapsable={false}>
        <View style={styles.emptyState}>
          <Ionicons
            name={isPrayerMode ? 'hand-left-outline' : 'chatbubble-ellipses-outline'}
            size={48}
            color={isPrayerMode ? theme.colors.prayer : theme.colors.textMuted}
          />
          <Text style={styles.emptyStateText}>
            {isPrayerMode
              ? 'Tap "Prayer" above or speak what\'s on your heart'
              : hasDailyVerse && screenType === 'home'
                ? 'Tap the verse above to start reflecting'
                : 'Tap the context above or type a question to start'}
          </Text>
        </View>
      </View>
    );
  }

  const lastMessage = messages[messages.length - 1];
  const showReflection = !isQuerying && lastMessage?.role === 'assistant';

  return (
    <View style={styles.messageList} ref={viewShotRef} collapsable={false}>
      <FlashList
        ref={flashListRef}
        data={messages}
        extraData={isQuerying}
        renderItem={({ item }) => (
          <MessageBubble
            message={item}
            onVersePress={onVersePress}
            onActionPress={onActionPress}
          />
        )}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messageListContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        drawDistance={300}
        ListFooterComponent={
          <>
            {isQuerying && (
              <View style={styles.typingContainer}>
                <ActivityIndicator size="small" color={theme.colors.primary} />
                <Text style={styles.typingText}>Thinking...</Text>
              </View>
            )}
            {showReflection && (
              <View style={styles.reflectionPromptContainer}>
                <View style={styles.reflectionPromptCard}>
                  <View style={styles.reflectionPromptHeader}>
                    <Ionicons name="sparkles" size={16} color={theme.colors.accent} />
                    <Text style={styles.reflectionPromptTitle}>
                      {isPrayerMode ? 'Continue your prayer' : 'Save this reflection?'}
                    </Text>
                  </View>
                  <Text style={styles.reflectionPromptSubtitle}>
                    {isPrayerMode
                      ? 'Write your prayer or reflection in your journal'
                      : 'Capture your thoughts while they\'re fresh'}
                  </Text>
                  <View style={styles.reflectionPromptButtons}>
                    <TouchableOpacity style={styles.reflectionButton} onPress={onJournalPress}>
                      <Ionicons name="book-outline" size={18} color={theme.colors.primary} />
                      <Text style={styles.reflectionButtonText}>Journal</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.reflectionButton, styles.reflectionButtonPrayer]}
                      onPress={onPrayPress}
                    >
                      <Ionicons name="hand-left-outline" size={18} color={theme.colors.prayer} />
                      <Text style={[styles.reflectionButtonText, styles.reflectionButtonTextPrayer]}>Pray</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}
          </>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  messageList: {
    flex: 1,
  },
  messageListContent: {
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.md,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
  },
  emptyStateText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textMuted,
    textAlign: 'center',
    marginTop: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
  },
  typingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    gap: theme.spacing.sm,
  },
  typingText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textMuted,
  },
  reflectionPromptContainer: {
    paddingVertical: theme.spacing.md,
  },
  reflectionPromptCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  reflectionPromptHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    marginBottom: theme.spacing.xs,
  },
  reflectionPromptTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
  },
  reflectionPromptSubtitle: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textMuted,
    marginBottom: theme.spacing.md,
  },
  reflectionPromptButtons: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  reflectionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.xs,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: theme.colors.primaryAlpha[15],
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.primaryAlpha[20],
  },
  reflectionButtonPrayer: {
    backgroundColor: 'rgba(236, 72, 153, 0.1)',
    borderColor: 'rgba(236, 72, 153, 0.2)',
  },
  reflectionButtonText: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.primary,
  },
  reflectionButtonTextPrayer: {
    color: theme.colors.prayer,
  },
});
