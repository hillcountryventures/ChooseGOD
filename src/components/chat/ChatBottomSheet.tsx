import React, { useCallback, useMemo, useRef, useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Keyboard,
  Animated,
  Platform,
} from 'react-native';
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetTextInput,
} from '@gorhom/bottom-sheet';
import { FlashList, FlashListRef } from '@shopify/flash-list';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useStore } from '../../store/useStore';
import { theme } from '../../lib/theme';
import { MessageBubble } from '../MessageBubble';
import { ChatMessage, VerseSource, SuggestedAction, RootStackParamList } from '../../types';
import { supabaseUrl, supabaseAnonKey } from '../../lib/supabase';
import { CHAT_LIMITS } from '../../constants/limits';
import { ANIMATION_DURATION, ANIMATION_DELAY } from '../../constants/animations';
import { usePremiumStatus, useChatUsageTracking } from '../../hooks/usePremiumStatus';
import { FREE_CHAT_LIMIT } from '../../constants/subscription';
import {
  streamCompanionResponse,
  generateContextPrompt,
  generateInitialMessage,
} from './utils';
import { useVoiceInput } from '../../hooks/useVoiceInput';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export function ChatBottomSheet() {
  const navigation = useNavigation<NavigationProp>();
  const bottomSheetRef = useRef<BottomSheet>(null);
  const flashListRef = useRef<FlashListRef<ChatMessage>>(null);
  const inputRef = useRef<any>(null);
  const celebrationAnim = useRef(new Animated.Value(0)).current;
  const abortControllerRef = useRef<AbortController | null>(null);
  const isClosingRef = useRef(false);
  const insets = useSafeAreaInsets();

  // Store state
  const chatSheetOpen = useStore((s) => s.chatSheetOpen);
  const setChatSheetOpen = useStore((s) => s.setChatSheetOpen);
  const chatContext = useStore((s) => s.chatContext);
  const messages = useStore((s) => s.messages);
  const isQuerying = useStore((s) => s.isQuerying);
  const currentMode = useStore((s) => s.currentMode);
  const setCurrentMode = useStore((s) => s.setCurrentMode);
  const addMessage = useStore((s) => s.addMessage);
  const updateMessage = useStore((s) => s.updateMessage);
  const setIsQuerying = useStore((s) => s.setIsQuerying);
  const clearMessages = useStore((s) => s.clearMessages);
  const dailyVerse = useStore((s) => s.dailyVerse);

  // Premium status - check if user can use chat
  const { isPremium, canUseChat, freeQueriesRemaining, showPaywall } = usePremiumStatus();
  const { incrementUsage } = useChatUsageTracking();

  // Local state
  const [inputText, setInputText] = useState('');
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationMessage, setCelebrationMessage] = useState('');

  // Voice input
  const {
    isListening,
    isAvailable: isVoiceAvailable,
    startListening,
    stopListening,
    cancelListening,
  } = useVoiceInput({
    onResult: (transcript) => {
      // When voice input completes, send the message
      if (transcript.trim()) {
        handleSend(transcript);
      }
    },
    onPartialResult: (partial) => {
      // Show interim results in the input field
      setInputText(partial);
    },
  });

  // Snap points: half, full (start at half screen)
  const snapPoints = useMemo(() => ['50%', '94%'], []);

  // Control sheet open/close
  useEffect(() => {
    if (chatSheetOpen) {
      bottomSheetRef.current?.snapToIndex(0); // Opens at 50%
      // Auto-focus input after sheet animates open
      setTimeout(() => {
        inputRef.current?.focus();
      }, 300);
    } else {
      bottomSheetRef.current?.close();
    }
  }, [chatSheetOpen]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flashListRef.current?.scrollToEnd({ animated: true });
      }, ANIMATION_DELAY.scroll);
    }
  }, [messages]);

  // Auto-expand to full height when keyboard appears on iOS
  useEffect(() => {
    if (Platform.OS !== 'ios') return;

    const showSubscription = Keyboard.addListener('keyboardDidShow', () => {
      // Snap to full screen (index 1 = '94%') so input is always visible
      // Small delay lets keyboard animation start first for smoother feel
      setTimeout(() => {
        bottomSheetRef.current?.snapToIndex(1);
      }, 100);
    });

    return () => {
      showSubscription.remove();
    };
  }, []);

  const handleSheetChanges = useCallback((index: number) => {
    if (index === -1) {
      setChatSheetOpen(false);
      Keyboard.dismiss();
      isClosingRef.current = false;
    }
  }, [setChatSheetOpen]);

  // Proper close handler that ALWAYS works
  const handleClose = useCallback(() => {
    if (isClosingRef.current) return;
    isClosingRef.current = true;

    // Dismiss keyboard first
    Keyboard.dismiss();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // Close the sheet after brief delay to let keyboard animation start
    setTimeout(() => {
      bottomSheetRef.current?.close();
    }, Platform.OS === 'ios' ? 50 : 0);
  }, []);

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.7}
        pressBehavior="close"
      >
        <BlurView
          intensity={20}
          tint="dark"
          style={StyleSheet.absoluteFill}
        />
      </BottomSheetBackdrop>
    ),
    []
  );

  // Trigger celebration animation
  const triggerCelebration = useCallback((message: string) => {
    setCelebrationMessage(message);
    setShowCelebration(true);
    Animated.sequence([
      Animated.timing(celebrationAnim, {
        toValue: 1,
        duration: ANIMATION_DURATION.normal,
        useNativeDriver: true,
      }),
      Animated.delay(ANIMATION_DELAY.celebration),
      Animated.timing(celebrationAnim, {
        toValue: 0,
        duration: ANIMATION_DURATION.normal,
        useNativeDriver: true,
      }),
    ]).start(() => setShowCelebration(false));
  }, [celebrationAnim]);

  const handleStop = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsQuerying(false);
    }
  }, [setIsQuerying]);

  const handleSend = async (message: string) => {
    if (!message.trim()) return;

    // Check if user can use chat (premium or free queries remaining)
    if (!canUseChat) {
      // Show custom paywall modal
      showPaywall();
      return;
    }

    // Cancel any existing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    setInputText('');

    // Haptic feedback on send
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: message,
      timestamp: new Date(),
      mode: currentMode,
    };
    addMessage(userMessage);
    setIsQuerying(true);

    // Expand sheet when sending
    bottomSheetRef.current?.snapToIndex(1);

    // Create placeholder assistant message for streaming
    const assistantMessageId = (Date.now() + 1).toString();
    const assistantMessage: ChatMessage = {
      id: assistantMessageId,
      role: 'assistant',
      content: '', // Start empty, will be filled by streaming
      timestamp: new Date(),
      mode: currentMode,
    };
    addMessage(assistantMessage);

    try {
      // Prepare conversation history (last N messages, excluding the placeholder)
      const history = messages.slice(-CHAT_LIMITS.historyMessages).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      // Include Bible context if available
      const bibleContext = chatContext.screenType === 'bible' ? chatContext.bibleContext : undefined;

      console.log('[ChatBottomSheet] Starting streaming response');

      // Use streaming API
      await streamCompanionResponse(
        supabaseUrl,
        supabaseAnonKey,
        {
          userId: null,
          message,
          conversationHistory: history,
          contextMode: currentMode,
          bibleContext,
        },
        {
          onMeta: ({ sources, suggestedActions }) => {
            // Update message with metadata (sources, suggested actions)
            updateMessage(assistantMessageId, {
              sources: sources as VerseSource[],
              suggestedActions,
            });
          },
          onContent: (_chunk, fullContent) => {
            // Update message content as it streams in
            updateMessage(assistantMessageId, {
              content: fullContent,
            });
          },
          onDone: (fullResponse) => {
            // Finalize message
            updateMessage(assistantMessageId, {
              content: fullResponse,
            });

            // Track usage for free tier users
            incrementUsage();

            // Success haptic
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

            setIsQuerying(false);
            abortControllerRef.current = null;
          },
          onError: (errorMsg) => {
            console.error('[ChatBottomSheet] Stream error:', errorMsg);

            // Update message with error
            updateMessage(assistantMessageId, {
              content: `I'm having trouble connecting right now.\n\nError: ${errorMsg}`,
            });

            // Error haptic
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

            setIsQuerying(false);
            abortControllerRef.current = null;
          },
        },
        abortControllerRef.current?.signal
      );
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        // User cancelled, remove the empty placeholder message
        updateMessage(assistantMessageId, {
          content: 'Cancelled.',
        });
        setIsQuerying(false);
        return;
      }

      console.error('Error sending message:', error);
      const errorDetails = error instanceof Error ? error.message : String(error);

      // Error haptic
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

      // Update placeholder with error message
      updateMessage(assistantMessageId, {
        content: `I'm having trouble connecting right now.\n\nError: ${errorDetails}`,
      });

      setIsQuerying(false);
      abortControllerRef.current = null;
    }
  };

  const handleContextPromptTap = () => {
    const initialMessage = generateInitialMessage(chatContext);
    if (initialMessage) {
      setInputText(initialMessage);
      inputRef.current?.focus();
    }
  };

  // Get the last assistant message for context
  const getLastAssistantContext = () => {
    const lastAssistantMessage = messages.filter(m => m.role === 'assistant').pop();
    const sources = lastAssistantMessage?.sources || [];
    const content = lastAssistantMessage?.content || '';
    return { sources, content };
  };

  const handleJournalPress = () => {
    setChatSheetOpen(false);
    const { sources, content } = getLastAssistantContext();
    const firstSource = sources[0];

    // Navigate to Journal with chat context
    navigation.navigate('JournalCompose', {
      initialPrompt: content ? `Reflection:\n\n` : '',
      initialVerse: firstSource ? {
        book: firstSource.book,
        chapter: firstSource.chapter,
        verse: firstSource.verse,
        text: firstSource.text,
        translation: firstSource.translation,
      } : undefined,
      source: {
        type: 'ai_prompt',
      },
    });
  };

  const handlePrayPress = () => {
    setChatSheetOpen(false);
    const { sources } = getLastAssistantContext();
    const firstSource = sources[0];

    // Navigate to Journal with prayer starter
    navigation.navigate('JournalCompose', {
      initialPrompt: 'Dear Lord,\n\n',
      initialVerse: firstSource ? {
        book: firstSource.book,
        chapter: firstSource.chapter,
        verse: firstSource.verse,
        text: firstSource.text,
        translation: firstSource.translation,
      } : undefined,
      source: {
        type: 'ai_prompt',
      },
    });
  };

  const handleVersePress = (verse: VerseSource) => {
    console.log('Verse pressed:', verse);
  };

  // Handle suggested action tap - sends the prompt as a new message
  // If it's a prayer-related action, switch to prayer mode first
  const handleSuggestedActionPress = useCallback((action: SuggestedAction) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // Check if this is a prayer-related action
    const isPrayerAction =
      action.label.toLowerCase().includes('pray') ||
      action.prompt.toLowerCase().includes('pray');

    // Switch to prayer mode if it's a prayer action
    if (isPrayerAction && currentMode !== 'prayer') {
      setCurrentMode('prayer');
    }

    handleSend(action.prompt);
  }, [handleSend, currentMode, setCurrentMode]);

  // Toggle prayer mode
  const handlePrayerModeToggle = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const newMode = currentMode === 'prayer' ? 'auto' : 'prayer';
    setCurrentMode(newMode);

    // If entering prayer mode with no messages, add a welcome prompt
    if (newMode === 'prayer' && messages.length === 0) {
      const welcomeMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: "I'm here to guide you in prayer. You can share what's on your heart, ask for Scripture to pray over a situation, or let me lead you through ACTS prayer (Adoration, Confession, Thanksgiving, Supplication).\n\nWhat would you like to bring before the Lord today?",
        timestamp: new Date(),
        mode: 'prayer',
        suggestedActions: [
          { label: 'ACTS Prayer', prompt: 'Guide me through ACTS prayer', icon: 'list-outline' },
          { label: 'Scripture to pray', prompt: 'Give me a Scripture to pray over my situation', icon: 'book-outline' },
          { label: 'Pray for peace', prompt: 'Help me pray for peace in my anxious heart', icon: 'heart-outline' },
        ],
      };
      addMessage(welcomeMessage);
    }
  }, [currentMode, setCurrentMode, messages.length, addMessage]);

  const isPrayerMode = currentMode === 'prayer';

  const contextPrompt = generateContextPrompt(chatContext);
  const hasMessages = messages.length > 0;

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={-1}
      snapPoints={snapPoints}
      onChange={handleSheetChanges}
      enablePanDownToClose
      backdropComponent={renderBackdrop}
      backgroundStyle={styles.background}
      handleIndicatorStyle={styles.handleIndicator}
      keyboardBehavior={Platform.OS === 'ios' ? 'extend' : 'interactive'}
      keyboardBlurBehavior="restore"
      android_keyboardInputMode="adjustResize"
      enableHandlePanningGesture={true}
      enableContentPanningGesture={true}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons
            name={isPrayerMode ? 'hand-left' : 'chatbubbles'}
            size={20}
            color={isPrayerMode ? theme.colors.prayer : theme.colors.primary}
          />
          <Text style={[styles.headerTitle, isPrayerMode && styles.headerTitlePrayer]}>
            {isPrayerMode ? 'Prayer' : 'Ask'}
          </Text>
          {/* Premium badge or free queries remaining */}
          {isPremium ? (
            <View style={styles.premiumBadge}>
              <Ionicons name="star" size={10} color={theme.colors.accent} />
              <Text style={styles.premiumBadgeText}>Pro</Text>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.freeQueriesBadge}
              onPress={showPaywall}
            >
              <Text style={styles.freeQueriesText}>
                {freeQueriesRemaining}/{FREE_CHAT_LIMIT} free
              </Text>
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.headerRight}>
          {/* Prayer mode toggle */}
          <TouchableOpacity
            style={[styles.headerButton, isPrayerMode && styles.headerButtonActive]}
            onPress={handlePrayerModeToggle}
          >
            <Ionicons
              name={isPrayerMode ? 'hand-left' : 'hand-left-outline'}
              size={18}
              color={isPrayerMode ? theme.colors.prayer : theme.colors.textMuted}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => clearMessages()}
          >
            <Ionicons name="refresh" size={18} color={theme.colors.textMuted} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={handleClose}
            hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
            activeOpacity={0.7}
          >
            <Ionicons name="close" size={24} color={theme.colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Context Banner - show daily verse on home screen */}
      {chatContext.screenType === 'home' && dailyVerse ? (
        <TouchableOpacity
          style={styles.dailyVerseBanner}
          onPress={() => handleSend(`Help me reflect on today's verse: ${dailyVerse.verse.book} ${dailyVerse.verse.chapter}:${dailyVerse.verse.verse}`)}
          activeOpacity={0.7}
        >
          <View style={styles.dailyVerseHeader}>
            <Ionicons name="sunny" size={16} color={theme.colors.accent} />
            <Text style={styles.dailyVerseLabel}>Today's Verse</Text>
          </View>
          <Text style={styles.dailyVerseText} numberOfLines={2}>
            "{dailyVerse.verse.text}"
          </Text>
          <Text style={styles.dailyVerseRef}>
            — {dailyVerse.verse.book} {dailyVerse.verse.chapter}:{dailyVerse.verse.verse}
          </Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={styles.contextBanner}
          onPress={handleContextPromptTap}
          activeOpacity={0.7}
        >
          <Ionicons
            name={chatContext.screenType === 'bible' ? 'book' : isPrayerMode ? 'hand-left' : 'sparkles'}
            size={16}
            color={isPrayerMode ? theme.colors.prayer : theme.colors.primary}
          />
          <Text style={styles.contextText} numberOfLines={1}>
            {isPrayerMode ? 'Share what\'s on your heart...' : contextPrompt}
          </Text>
          <Ionicons name="arrow-forward" size={14} color={theme.colors.textMuted} />
        </TouchableOpacity>
      )}

      {/* Messages */}
      <View style={styles.messageList}>
        {!hasMessages ? (
          <View style={styles.emptyState}>
            <Ionicons
              name={isPrayerMode ? 'hand-left-outline' : 'chatbubble-ellipses-outline'}
              size={48}
              color={isPrayerMode ? theme.colors.prayer : theme.colors.textMuted}
            />
            <Text style={styles.emptyStateText}>
              {isPrayerMode
                ? 'Tap "Prayer" above or speak what\'s on your heart'
                : dailyVerse && chatContext.screenType === 'home'
                  ? 'Tap the verse above to start reflecting'
                  : 'Tap the context above or type a question to start'}
            </Text>
          </View>
        ) : (
          <FlashList
            ref={flashListRef}
            data={messages}
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
              <>
                {/* Typing indicator */}
                {isQuerying && (
                  <View style={styles.typingContainer}>
                    <ActivityIndicator size="small" color={theme.colors.primary} />
                    <Text style={styles.typingText}>Thinking...</Text>
                  </View>
                )}

                {/* Journal reflection prompt - show after meaningful responses */}
                {!isQuerying && messages[messages.length - 1]?.role === 'assistant' && (
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
                        <TouchableOpacity
                          style={styles.reflectionButton}
                          onPress={handleJournalPress}
                        >
                          <Ionicons name="book-outline" size={18} color={theme.colors.primary} />
                          <Text style={styles.reflectionButtonText}>Journal</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.reflectionButton, styles.reflectionButtonPrayer]}
                          onPress={handlePrayPress}
                        >
                          <Ionicons name="hand-left-outline" size={18} color={theme.colors.prayer} />
                          <Text style={[styles.reflectionButtonText, styles.reflectionButtonTextPrayer]}>
                            Pray
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                )}
              </>
            }
          />
        )}
      </View>

      {/* Voice listening indicator */}
      {isListening && (
        <View style={styles.listeningBanner}>
          <View style={styles.listeningDot} />
          <Text style={styles.listeningText}>Listening...</Text>
          <TouchableOpacity onPress={cancelListening} style={styles.cancelListening}>
            <Ionicons name="close" size={16} color={theme.colors.textMuted} />
          </TouchableOpacity>
        </View>
      )}

      {/* Input */}
      <View style={[styles.inputContainer, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        {/* Voice input button */}
        {isVoiceAvailable && !isQuerying && (
          <TouchableOpacity
            style={[styles.voiceButton, isListening && styles.voiceButtonActive]}
            onPress={isListening ? stopListening : startListening}
            activeOpacity={0.7}
          >
            <Ionicons
              name={isListening ? 'mic' : 'mic-outline'}
              size={22}
              color={isListening ? theme.colors.error : theme.colors.primary}
            />
          </TouchableOpacity>
        )}

        <BottomSheetTextInput
          ref={inputRef}
          style={styles.input}
          placeholder={isListening ? 'Speak your question...' : 'Ask anything...'}
          placeholderTextColor={theme.colors.textMuted}
          value={inputText}
          onChangeText={setInputText}
          multiline
          maxLength={1000}
          editable={!isListening}
        />
        <TouchableOpacity
          style={[
            styles.sendButton,
            (!inputText.trim() && !isQuerying && !isListening) && styles.sendButtonDisabled,
          ]}
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
            color={inputText.trim() || isQuerying || isListening ? '#fff' : theme.colors.textMuted}
          />
        </TouchableOpacity>
      </View>

      {/* Celebration overlay */}
      {showCelebration && (
        <Animated.View
          style={[
            styles.celebrationOverlay,
            {
              opacity: celebrationAnim,
              transform: [
                {
                  scale: celebrationAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.8, 1],
                  }),
                },
              ],
            },
          ]}
        >
          <Text style={styles.celebrationEmoji}>🎉</Text>
          <Text style={styles.celebrationText}>{celebrationMessage}</Text>
        </Animated.View>
      )}
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  background: {
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  handleIndicator: {
    backgroundColor: theme.colors.border,
    width: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  headerTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: '600',
    color: theme.colors.text,
  },
  headerTitlePrayer: {
    color: theme.colors.prayer,
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.accentAlpha[20],
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.full,
    gap: 3,
  },
  premiumBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: theme.colors.accent,
  },
  freeQueriesBadge: {
    backgroundColor: theme.colors.primaryAlpha[15],
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.full,
  },
  freeQueriesText: {
    fontSize: 10,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  headerButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 18,
  },
  headerButtonActive: {
    backgroundColor: 'rgba(236, 72, 153, 0.15)',
  },
  closeButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 22,
    marginLeft: theme.spacing.xs,
  },
  contextBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
    marginHorizontal: theme.spacing.md,
    marginVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.lg,
    gap: theme.spacing.sm,
  },
  // Daily verse banner styles
  dailyVerseBanner: {
    marginHorizontal: theme.spacing.md,
    marginVertical: theme.spacing.sm,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.accentAlpha[10],
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.accentAlpha[20],
  },
  dailyVerseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    marginBottom: theme.spacing.xs,
  },
  dailyVerseLabel: {
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.accent,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  dailyVerseText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    fontStyle: 'italic',
    lineHeight: theme.fontSize.md * 1.5,
    marginBottom: theme.spacing.xs,
  },
  dailyVerseRef: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    fontWeight: theme.fontWeight.medium,
  },
  contextText: {
    flex: 1,
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
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
  actionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingVertical: theme.spacing.sm,
    gap: theme.spacing.sm,
  },
  // Journal reflection prompt styles
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
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  actionButtonText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.primary,
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    gap: theme.spacing.sm,
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
  celebrationOverlay: {
    position: 'absolute',
    top: '30%',
    left: theme.spacing.lg,
    right: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.xl,
    alignItems: 'center',
    ...theme.shadows.lg,
  },
  celebrationEmoji: {
    fontSize: 48,
    marginBottom: theme.spacing.md,
  },
  celebrationText: {
    fontSize: theme.fontSize.lg,
    fontWeight: '600',
    color: theme.colors.text,
    textAlign: 'center',
  },
});
