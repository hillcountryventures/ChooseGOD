import React, { useCallback, useMemo, useRef, useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Keyboard,
  Animated,
  Platform,
} from 'react-native';
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetScrollView,
  BottomSheetTextInput,
} from '@gorhom/bottom-sheet';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useStore } from '../../store/useStore';
import { theme } from '../../lib/theme';
import { MessageBubble } from '../MessageBubble';
import { ChatMessage, VerseSource, ChatContext, RootStackParamList } from '../../types';
import { supabase } from '../../lib/supabase';
import { EDGE_FUNCTIONS } from '../../constants/database';
import { CHAT_LIMITS } from '../../constants/limits';
import { ANIMATION_DURATION, ANIMATION_DELAY } from '../../constants/animations';
import { usePremiumStatus, useChatUsageTracking } from '../../hooks/usePremiumStatus';
import { FREE_CHAT_LIMIT } from '../../constants/subscription';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

// Generate context-aware prompt based on current screen
function generateContextPrompt(context: ChatContext): string {
  switch (context.screenType) {
    case 'bible':
      if (context.bibleContext?.selectedVerse) {
        const { book, chapter, selectedVerse } = context.bibleContext;
        const truncatedText = selectedVerse.text.length > 60
          ? selectedVerse.text.slice(0, 60) + '...'
          : selectedVerse.text;
        return `Ask about ${book} ${chapter}:${selectedVerse.verse} - "${truncatedText}"`;
      }
      if (context.bibleContext) {
        return `Ask about ${context.bibleContext.book} ${context.bibleContext.chapter}`;
      }
      return 'Ask about Scripture...';

    case 'devotional':
      if (context.devotionalContext) {
        return `Ask about Day ${context.devotionalContext.dayNumber} of "${context.devotionalContext.seriesTitle}"`;
      }
      return 'Ask about your devotional...';

    case 'journey':
      return 'Reflect on your spiritual journey...';

    default:
      return 'Ask anything about Scripture...';
  }
}

// Generate initial message for context
function generateInitialMessage(context: ChatContext): string | undefined {
  if (context.screenType === 'bible' && context.bibleContext) {
    const { book, chapter, selectedVerse } = context.bibleContext;
    if (selectedVerse) {
      return `Help me understand ${book} ${chapter}:${selectedVerse.verse}`;
    }
    return `What are the key themes in ${book} ${chapter}?`;
  }
  return undefined;
}

export function ChatBottomSheet() {
  const navigation = useNavigation<NavigationProp>();
  const bottomSheetRef = useRef<BottomSheet>(null);
  const flatListRef = useRef<FlatList>(null);
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
  const addMessage = useStore((s) => s.addMessage);
  const setIsQuerying = useStore((s) => s.setIsQuerying);
  const clearMessages = useStore((s) => s.clearMessages);

  // Premium status - check if user can use chat
  const { isPremium, canUseChat, freeQueriesRemaining, showPaywall } = usePremiumStatus();
  const { incrementUsage } = useChatUsageTracking();

  // Local state
  const [inputText, setInputText] = useState('');
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationMessage, setCelebrationMessage] = useState('');

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
        flatListRef.current?.scrollToEnd({ animated: true });
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
        opacity={0.5}
        pressBehavior="close"
      />
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

    try {
      // Prepare conversation history (last N messages)
      const history = messages.slice(-CHAT_LIMITS.historyMessages).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      // Include Bible context if available
      const bibleContext = chatContext.screenType === 'bible' ? chatContext.bibleContext : undefined;

      console.log('[ChatBottomSheet] Invoking edge function:', EDGE_FUNCTIONS.companion);

      const { data, error } = await supabase.functions.invoke(EDGE_FUNCTIONS.companion, {
        body: {
          user_id: null,
          message,
          conversation_history: history,
          context_mode: currentMode,
          bible_context: bibleContext,
        },
      });

      console.log('[ChatBottomSheet] Response:', {
        hasData: !!data,
        hasError: !!error,
        errorMessage: error?.message,
        errorContext: error?.context,
        dataKeys: data ? Object.keys(data) : [],
      });

      if (error) {
        throw new Error(error.message || String(error));
      }

      if (!data) {
        throw new Error('No data received from the server');
      }

      if (data.error) {
        throw new Error(data.error + (data.details ? `: ${data.details}` : ''));
      }

      // Add assistant response
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response || 'No response received',
        sources: data.sources as VerseSource[],
        timestamp: new Date(),
        mode: currentMode,
        toolsUsed: data.toolsUsed,
        celebration: data.celebration,
        suggestedActions: data.suggestedActions,
      };
      addMessage(assistantMessage);

      // Track usage for free tier users (only after successful response)
      incrementUsage();

      // Handle celebration
      if (data.celebration) {
        triggerCelebration(data.celebration.message);
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return;
      }

      console.error('Error sending message:', error);
      const errorDetails = error instanceof Error ? error.message : String(error);

      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `I'm having trouble connecting right now.\n\nError: ${errorDetails}`,
        timestamp: new Date(),
      };
      addMessage(errorMessage);
    } finally {
      abortControllerRef.current = null;
      setIsQuerying(false);
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
          <Ionicons name="chatbubbles" size={20} color={theme.colors.primary} />
          <Text style={styles.headerTitle}>Ask</Text>
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

      {/* Context Banner */}
      <TouchableOpacity
        style={styles.contextBanner}
        onPress={handleContextPromptTap}
        activeOpacity={0.7}
      >
        <Ionicons
          name={chatContext.screenType === 'bible' ? 'book' : 'sparkles'}
          size={16}
          color={theme.colors.primary}
        />
        <Text style={styles.contextText} numberOfLines={1}>
          {contextPrompt}
        </Text>
        <Ionicons name="arrow-forward" size={14} color={theme.colors.textMuted} />
      </TouchableOpacity>

      {/* Messages */}
      <BottomSheetScrollView
        style={styles.messageList}
        contentContainerStyle={styles.messageListContent}
        keyboardShouldPersistTaps="handled"
      >
        {!hasMessages && (
          <View style={styles.emptyState}>
            <Ionicons name="chatbubble-ellipses-outline" size={48} color={theme.colors.textMuted} />
            <Text style={styles.emptyStateText}>
              Tap the context above or type a question to start
            </Text>
          </View>
        )}
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} onVersePress={handleVersePress} />
        ))}

        {/* Typing indicator */}
        {isQuerying && (
          <View style={styles.typingContainer}>
            <ActivityIndicator size="small" color={theme.colors.primary} />
            <Text style={styles.typingText}>Thinking...</Text>
          </View>
        )}

        {/* Action buttons - Journal and Pray */}
        {hasMessages && !isQuerying && messages[messages.length - 1]?.role === 'assistant' && (
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleJournalPress}
            >
              <Ionicons name="book-outline" size={16} color={theme.colors.primary} />
              <Text style={styles.actionButtonText}>Journal</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handlePrayPress}
            >
              <Ionicons name="hand-left-outline" size={16} color={theme.colors.primary} />
              <Text style={styles.actionButtonText}>Pray</Text>
            </TouchableOpacity>
          </View>
        )}
      </BottomSheetScrollView>

      {/* Input */}
      <View style={[styles.inputContainer, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <BottomSheetTextInput
          ref={inputRef}
          style={styles.input}
          placeholder="Ask anything..."
          placeholderTextColor={theme.colors.textMuted}
          value={inputText}
          onChangeText={setInputText}
          multiline
          maxLength={1000}
        />
        <TouchableOpacity
          style={[
            styles.sendButton,
            (!inputText.trim() && !isQuerying) && styles.sendButtonDisabled,
          ]}
          onPress={() => isQuerying ? handleStop() : handleSend(inputText)}
          disabled={!inputText.trim() && !isQuerying}
        >
          <Ionicons
            name={isQuerying ? 'stop' : 'send'}
            size={20}
            color={inputText.trim() || isQuerying ? '#fff' : theme.colors.textMuted}
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
