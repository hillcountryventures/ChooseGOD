/**
 * ChatHubScreen - Premium "Ask the Bible" Experience
 *
 * Features:
 * - 3 Daily Seeds quota system for free users
 * - Scripture-forward: tappable verse references open Quick View
 * - Elegant parchment-style AI message bubbles
 * - Seed tracker with animated icons
 * - Final seed interstitial and paywall
 * - Context-aware verse discussions
 */

import React, { useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FlashList } from '@shopify/flash-list';
import { Ionicons } from '@expo/vector-icons';

import { theme } from '../lib/theme';
import { MessageBubble } from '../components/MessageBubble';
import { VerseQuickView } from '../components/chat/VerseQuickView';
import { ScriptureSkeleton } from '../components/ScriptureSkeleton';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { SeedTracker, FinalSeedBanner, NoSeedsCard } from '../components/chat/SeedComponents';
import { ChatModeSelector, getModeName } from '../components/chat/ChatModeSelector';
import { ChatEmptyState } from '../components/chat/ChatEmptyState';
import { useChatHub } from '../hooks/useChatHub';
import { useTrackScreen } from '../hooks/useAnalytics';

export default function ChatHubScreen() {
  useTrackScreen('chat_hub');
  const hub = useChatHub();

  const {
    navigation,
    contextVerse,
    messages,
    isQuerying,
    currentMode,
    isPremium,
    seedsRemaining,
    totalSeeds,
    isOnLastSeed,
    hasSeeds,
    showPaywall,
    inputText,
    setInputText,
    showModeSelector,
    setShowModeSelector,
    selectedVerseRef,
    isListening,
    isVoiceAvailable,
    startListening,
    stopListening,
    cancelListening,
    flashListRef,
    inputRef,
    verseQuickViewRef,
    isPrayerMode,
    hasMessages,
    handleSend,
    handleStop,
    handleSuggestedActionPress,
    handleModeSelect,
    handleClearChat,
    handleShareConversation,
    handleVersePress,
    handleCloseVerseQuickView,
  } = hub;

  // Context chip for verse being discussed
  const ContextChip = useMemo(() => {
    if (!contextVerse) return null;
    return (
      <View style={styles.contextChip}>
        <Ionicons name="book" size={14} color={theme.colors.primary} />
        <Text style={styles.contextChipText} numberOfLines={1}>
          {contextVerse.book} {contextVerse.chapter}:{contextVerse.verse}
        </Text>
      </View>
    );
  }, [contextVerse]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Ionicons name="chevron-back" size={24} color={theme.colors.text} />
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <View style={styles.headerTitleRow}>
              <Ionicons
                name={isPrayerMode ? 'hand-left' : 'book'}
                size={18}
                color={isPrayerMode ? theme.colors.prayer : theme.colors.primary}
              />
              <Text style={[styles.headerTitle, isPrayerMode && styles.headerTitlePrayer]}>
                {getModeName(currentMode)}
              </Text>
            </View>
            {ContextChip}
          </View>

          <View style={styles.headerRight}>
            <TouchableOpacity
              style={styles.modeSelectorButton}
              onPress={() => setShowModeSelector(!showModeSelector)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              accessible={true}
              accessibilityLabel="Choose conversation mode"
              accessibilityHint="Opens menu to select spiritual practice mode"
              accessibilityRole="button"
            >
              <Ionicons
                name={showModeSelector ? 'sparkles' : 'sparkles-outline'}
                size={20}
                color={showModeSelector ? theme.colors.accent : theme.colors.textSecondary}
              />
            </TouchableOpacity>

            <SeedTracker
              seedsRemaining={seedsRemaining}
              totalSeeds={totalSeeds}
              isPremium={isPremium}
              onUpgradePress={showPaywall}
            />
            {hasMessages && (
              <>
                <TouchableOpacity style={styles.headerButton} onPress={handleShareConversation} accessibilityRole="button" accessibilityLabel="Share conversation">
                  <Ionicons name="share-outline" size={20} color={theme.colors.textMuted} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.headerButton} onPress={handleClearChat} accessibilityRole="button" accessibilityLabel="Clear chat">
                  <Ionicons name="trash-outline" size={20} color={theme.colors.textMuted} />
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>

        {/* Final Seed Warning */}
        {isOnLastSeed && !isPremium && <FinalSeedBanner />}

        {/* Mode Selector Panel */}
        {showModeSelector && (
          <ChatModeSelector
            currentMode={currentMode}
            isPremium={isPremium}
            onModeSelect={handleModeSelect}
            onClose={() => setShowModeSelector(false)}
          />
        )}

        {/* Messages */}
        <View style={styles.messageList}>
          {!hasMessages ? (
            <ChatEmptyState
              currentMode={currentMode}
              isPrayerMode={isPrayerMode}
              contextVerse={contextVerse}
              onSend={handleSend}
            />
          ) : (
            <ErrorBoundary level="component" name="ChatMessageList">
              <FlashList
                ref={flashListRef}
                data={messages}
                extraData={isQuerying}
                renderItem={({ item }) => (
                  <MessageBubble
                    message={item}
                    onVersePress={handleVersePress}
                    onActionPress={handleSuggestedActionPress}
                  />
                )}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.messageListContent}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
                drawDistance={300}
                ListFooterComponent={
                  isQuerying ? (
                    <View style={styles.typingContainer}>
                      <ScriptureSkeleton lineCount={4} />
                    </View>
                  ) : null
                }
              />
            </ErrorBoundary>
          )}
        </View>

        {/* No Seeds Card */}
        {!hasSeeds && !isPremium && <NoSeedsCard onUpgradePress={showPaywall} />}

        {/* Voice listening indicator */}
        {isListening && (
          <View style={styles.listeningBanner}>
            <View style={styles.listeningDot} />
            <Text style={styles.listeningText}>Listening...</Text>
            <TouchableOpacity onPress={cancelListening} style={styles.cancelListening} accessibilityRole="button" accessibilityLabel="Cancel listening">
              <Ionicons name="close" size={16} color={theme.colors.textMuted} />
            </TouchableOpacity>
          </View>
        )}

        {/* Input */}
        {(hasSeeds || isPremium) && (
          <View style={[styles.inputContainer, isOnLastSeed && !isPremium && styles.inputContainerFinal]}>
            {isVoiceAvailable && !isQuerying && (
              <TouchableOpacity
                style={[styles.voiceButton, isListening && styles.voiceButtonActive]}
                onPress={isListening ? stopListening : startListening}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel={isListening ? "Stop listening" : "Start voice input"}
              >
                <Ionicons
                  name={isListening ? 'mic' : 'mic-outline'}
                  size={22}
                  color={isListening ? theme.colors.error : theme.colors.primary}
                />
              </TouchableOpacity>
            )}

            <TextInput
              ref={inputRef}
              style={styles.input}
              placeholder={isListening ? 'Speak your question...' : 'Ask anything...'}
              placeholderTextColor={theme.colors.textMuted}
              value={inputText}
              onChangeText={setInputText}
              multiline
              maxLength={1000}
              editable={!isListening}
              accessibilityLabel="Message input"
              accessibilityHint="Type your question about the Bible"
            />

            <TouchableOpacity
              style={[
                styles.sendButton,
                (!inputText.trim() && !isQuerying && !isListening) && styles.sendButtonDisabled,
              ]}
              accessibilityRole="button"
              accessibilityLabel={isQuerying ? "Stop generating" : isListening ? "Confirm voice input" : "Send message"}
              onPress={() => {
                if (isListening) {
                  stopListening();
                } else if (isQuerying) {
                  handleStop();
                } else {
                  handleSend(inputText);
                }
              }}
              disabled={!inputText.trim() && !isQuerying && !isListening}
            >
              <Ionicons
                name={isQuerying ? 'stop' : isListening ? 'checkmark' : 'send'}
                size={20}
                color={inputText.trim() || isQuerying || isListening ? theme.colors.text : theme.colors.textMuted}
              />
            </TouchableOpacity>
          </View>
        )}
      </KeyboardAvoidingView>

      {/* Verse Quick View Bottom Sheet */}
      <VerseQuickView
        bottomSheetRef={verseQuickViewRef}
        reference={selectedVerseRef}
        onClose={handleCloseVerseQuickView}
      />
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
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    backgroundColor: theme.colors.background,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  headerTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: '600',
    color: theme.colors.text,
  },
  headerTitlePrayer: {
    color: theme.colors.prayer,
  },
  contextChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primaryAlpha[10],
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.full,
    marginTop: 4,
    gap: 4,
  },
  contextChipText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.primary,
    fontWeight: '500',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  headerButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 18,
  },
  modeSelectorButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 18,
  },
  messageList: {
    flex: 1,
  },
  messageListContent: {
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.md,
    paddingTop: theme.spacing.sm,
  },
  typingContainer: {
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.sm,
  },
  listeningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: theme.colors.errorAlpha[20],
    gap: theme.spacing.sm,
  },
  listeningDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.error,
  },
  listeningText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.error,
    fontWeight: theme.fontWeight.medium,
    flex: 1,
  },
  cancelListening: {
    padding: theme.spacing.xs,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    backgroundColor: theme.colors.background,
    gap: theme.spacing.sm,
  },
  inputContainerFinal: {
    borderTopWidth: 2,
    borderTopColor: theme.colors.accentAlpha[50],
  },
  input: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderRadius: 20,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    maxHeight: 100,
    minHeight: 40,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: theme.colors.surface,
  },
  voiceButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  voiceButtonActive: {
    backgroundColor: theme.colors.errorAlpha[20],
    borderColor: theme.colors.error,
  },
});
