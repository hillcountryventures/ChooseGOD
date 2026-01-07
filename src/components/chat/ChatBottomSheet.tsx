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
  Share,
  Alert,
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
import * as Sharing from 'expo-sharing';
import { captureRef } from 'react-native-view-shot';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import NetInfo from '@react-native-community/netinfo';
import { useStore } from '../../store/useStore';
import { theme } from '../../lib/theme';
import { MessageBubble } from '../MessageBubble';
import { ChatMessage, VerseSource, SuggestedAction, RootStackParamList } from '../../types';
import { supabaseUrl, supabaseAnonKey } from '../../lib/supabase';
import { CHAT_LIMITS } from '../../constants/limits';
import { ANIMATION_DURATION, ANIMATION_DELAY } from '../../constants/animations';
import { usePremiumStatus, useChatUsageTracking } from '../../hooks/usePremiumStatus';
import { FREE_CHAT_LIMIT, isPremiumChatMode, PREMIUM_CHAT_MODES, FREE_CHAT_MODES } from '../../constants/subscription';
import type { ChatMode } from '../../types';
import {
  streamCompanionResponse,
  generateContextPrompt,
  generateInitialMessage,
} from './utils';
import { useVoiceInput } from '../../hooks/useVoiceInput';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

// Helper functions for mode display
function getModeIcon(mode: ChatMode): keyof typeof Ionicons.glyphMap {
  const icons: Record<ChatMode, keyof typeof Ionicons.glyphMap> = {
    auto: 'chatbubbles-outline',
    devotional: 'sunny-outline',
    prayer: 'hand-left-outline',
    lectio: 'book-outline',
    examen: 'moon-outline',
    memory: 'school-outline',
    confession: 'heart-outline',
    gratitude: 'gift-outline',
    celebration: 'sparkles-outline',
    journal: 'create-outline',
  };
  return icons[mode] || 'chatbubbles-outline';
}

function getModeName(mode: ChatMode): string {
  const names: Record<ChatMode, string> = {
    auto: 'Ask',
    devotional: 'Devotional',
    prayer: 'Prayer',
    lectio: 'Lectio Divina',
    examen: 'Examen',
    memory: 'Memory',
    confession: 'Confession',
    gratitude: 'Gratitude',
    celebration: 'Celebrate',
    journal: 'Journal',
  };
  return names[mode] || mode;
}

export function ChatBottomSheet() {
  const navigation = useNavigation<NavigationProp>();
  const bottomSheetRef = useRef<BottomSheet>(null);
  const flashListRef = useRef<FlashListRef<ChatMessage>>(null);
  const inputRef = useRef<any>(null);
  const viewShotRef = useRef<View>(null);
  const celebrationAnim = useRef(new Animated.Value(0)).current;
  const abortControllerRef = useRef<AbortController | null>(null);
  const isClosingRef = useRef(false);
  const handleSendRef = useRef<(message: string, isRetry?: boolean) => void>(() => {});
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

  // Premium status - check if user can use chat and modes
  const { isPremium, canUseChat, canUseChatMode, freeQueriesRemaining, showPaywall } = usePremiumStatus();
  const { incrementUsage } = useChatUsageTracking();

  // State for mode selector
  const [showModeSelector, setShowModeSelector] = useState(false);

  // Local state
  const [inputText, setInputText] = useState('');
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationMessage, setCelebrationMessage] = useState('');

  // Voice input - uses ref to avoid circular dependency with handleSend
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
        handleSendRef.current(transcript);
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

  const handleSend = useCallback(async (message: string, isRetry: boolean = false) => {
    if (!message.trim()) return;

    // Check network connectivity first
    const netState = await NetInfo.fetch();
    if (!netState.isConnected) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert(
        'No Connection',
        'Please check your internet connection and try again.',
        [{ text: 'OK' }]
      );
      return;
    }

    // Check if user can use chat (premium or free queries remaining)
    // Retries don't check quota since the original attempt was already validated
    if (!isRetry && !canUseChat) {
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

            // Track usage for free tier users only on successful non-retry requests
            // This protects users from losing quota on connection failures
            if (!isRetry) {
              incrementUsage();
            }

            // Success haptic
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

            setIsQuerying(false);
            abortControllerRef.current = null;
          },
          onError: (errorMsg) => {
            console.error('[ChatBottomSheet] Stream error:', errorMsg);

            // Update message with friendly error and retry suggestion
            updateMessage(assistantMessageId, {
              content: `I'm having trouble connecting right now. ${errorMsg}\n\nTap "Try again" below to retry.`,
              suggestedActions: [
                { label: 'Try again', prompt: message, icon: 'refresh-outline' },
              ],
            });

            // Error haptic
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

            setIsQuerying(false);
            abortControllerRef.current = null;
          },
          onRetry: (attempt) => {
            // Show warming up message during automatic retry
            console.log(`[ChatBottomSheet] Automatic retry ${attempt}...`);
            updateMessage(assistantMessageId, {
              content: 'Warming up... just a moment.',
            });
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

      // Handle timeout errors specifically (from manual timeout pattern)
      // This only triggers after automatic retry has already failed
      if (error instanceof Error && error.name === 'TimeoutError') {
        console.error('Request timed out after retries:', error);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        updateMessage(assistantMessageId, {
          content: 'The companion is still warming up — this sometimes happens after periods of inactivity. Tap below to try again; it usually works on the second attempt.',
          suggestedActions: [
            { label: 'Try again', prompt: message, icon: 'refresh-outline' },
          ],
        });
        setIsQuerying(false);
        abortControllerRef.current = null;
        return;
      }

      console.error('Error sending message:', error);
      const errorDetails = error instanceof Error ? error.message : String(error);

      // Error haptic
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

      // Update placeholder with friendly error and retry option
      updateMessage(assistantMessageId, {
        content: `I'm having trouble connecting right now. ${errorDetails}\n\nTap "Try again" below to retry.`,
        suggestedActions: [
          { label: 'Try again', prompt: message, icon: 'refresh-outline' },
        ],
      });

      setIsQuerying(false);
      abortControllerRef.current = null;
    }
  }, [canUseChat, showPaywall, currentMode, addMessage, setIsQuerying, messages, chatContext, updateMessage, incrementUsage]);

  // Keep ref in sync with handleSend for voice input callback
  useEffect(() => {
    handleSendRef.current = handleSend;
  }, [handleSend]);

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

    // Check if this is a "Try again" retry action - these don't consume quota
    const isRetryAction = action.label.toLowerCase() === 'try again' ||
                          action.icon === 'refresh-outline';

    // Check if this is a prayer-related action
    const isPrayerAction =
      action.label.toLowerCase().includes('pray') ||
      action.prompt.toLowerCase().includes('pray');

    // Switch to prayer mode if it's a prayer action
    if (isPrayerAction && currentMode !== 'prayer') {
      setCurrentMode('prayer');
    }

    handleSend(action.prompt, isRetryAction);
  }, [handleSend, currentMode, setCurrentMode]);

  // Handle mode selection with premium gating
  const handleModeSelect = useCallback((mode: ChatMode) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Check if mode requires premium
    if (!canUseChatMode(mode)) {
      showPaywall();
      setShowModeSelector(false);
      return;
    }

    setCurrentMode(mode);
    setShowModeSelector(false);

    // Add welcome message for specific modes
    if (messages.length === 0) {
      const modeWelcomes: Partial<Record<ChatMode, { content: string; actions: SuggestedAction[] }>> = {
        prayer: {
          content: "I'm here to guide you in prayer. You can share what's on your heart, ask for Scripture to pray over a situation, or let me lead you through ACTS prayer (Adoration, Confession, Thanksgiving, Supplication).\n\nWhat would you like to bring before the Lord today?",
          actions: [
            { label: 'ACTS Prayer', prompt: 'Guide me through ACTS prayer', icon: 'list-outline' },
            { label: 'Scripture to pray', prompt: 'Give me a Scripture to pray over my situation', icon: 'book-outline' },
            { label: 'Pray for peace', prompt: 'Help me pray for peace in my anxious heart', icon: 'heart-outline' },
          ],
        },
        lectio: {
          content: "Welcome to Lectio Divina, an ancient practice of prayerful Scripture reading. I'll guide you through four movements: Reading, Meditation, Prayer, and Contemplation.\n\nWould you like to begin, or do you have a specific passage in mind?",
          actions: [
            { label: 'Begin Lectio', prompt: 'Guide me through Lectio Divina', icon: 'book-outline' },
            { label: 'Choose passage', prompt: 'I have a specific passage I want to pray with', icon: 'search-outline' },
          ],
        },
        examen: {
          content: "Welcome to the Evening Examen, a practice of reflecting on your day with God. I'll help you notice where God was present and where you might have missed Him.\n\nAre you ready to begin?",
          actions: [
            { label: 'Begin Examen', prompt: 'Guide me through the Evening Examen', icon: 'moon-outline' },
            { label: 'Quick reflection', prompt: 'Help me with a quick end-of-day reflection', icon: 'time-outline' },
          ],
        },
        memory: {
          content: "Scripture memory mode activated! I can help you memorize verses using techniques like first-letter prompts, story associations, and spaced repetition.\n\nWhat verse would you like to work on?",
          actions: [
            { label: 'Add new verse', prompt: 'I want to memorize a new verse', icon: 'add-outline' },
            { label: 'Review verses', prompt: 'Quiz me on my memory verses', icon: 'school-outline' },
          ],
        },
        confession: {
          content: "This is a safe space for heart examination. As Psalm 139:23-24 says, 'Search me, O God, and know my heart.'\n\nTake a moment. What's weighing on your heart?",
          actions: [
            { label: 'Heart check', prompt: 'Help me examine my heart with Psalm 139', icon: 'heart-outline' },
            { label: 'Confess', prompt: 'I need to confess something to God', icon: 'chatbubble-outline' },
          ],
        },
        gratitude: {
          content: "Let's focus on gratitude! 'In everything give thanks' (1 Thessalonians 5:18).\n\nWhat blessings—big or small—are you noticing today?",
          actions: [
            { label: 'Share blessing', prompt: 'I want to share something I\'m grateful for', icon: 'gift-outline' },
            { label: 'Help me notice', prompt: 'Help me recognize blessings I might be overlooking', icon: 'eye-outline' },
          ],
        },
      };

      const welcome = modeWelcomes[mode];
      if (welcome) {
        const welcomeMessage: ChatMessage = {
          id: Date.now().toString(),
          role: 'assistant',
          content: welcome.content,
          timestamp: new Date(),
          mode,
          suggestedActions: welcome.actions,
        };
        addMessage(welcomeMessage);
      }
    }
  }, [canUseChatMode, showPaywall, setCurrentMode, messages.length, addMessage]);

  // Toggle prayer mode (uses handleModeSelect)
  const handlePrayerModeToggle = useCallback(() => {
    const newMode = currentMode === 'prayer' ? 'auto' : 'prayer';
    handleModeSelect(newMode);
  }, [currentMode, handleModeSelect]);

  // Toggle mode selector panel
  const handleModeSelectorToggle = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowModeSelector(prev => !prev);
  }, []);

  // Share conversation as image or text
  const handleShareConversation = useCallback(async () => {
    if (messages.length === 0) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      // Try to capture as image first
      if (viewShotRef.current) {
        const uri = await captureRef(viewShotRef, {
          format: 'png',
          quality: 1,
        });

        if (uri && await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(uri, {
            mimeType: 'image/png',
            dialogTitle: 'Share this Scripture conversation',
          });
          return;
        }
      }
    } catch (error) {
      console.warn('Image share failed, falling back to text:', error);
    }

    // Fallback: Share as text
    try {
      const conversationText = messages
        .map((m) => {
          const role = m.role === 'user' ? 'You' : 'Companion';
          let text = `${role}: ${m.content}`;
          if (m.sources && m.sources.length > 0) {
            const refs = m.sources
              .map((s) => `${s.book} ${s.chapter}:${s.verse}`)
              .join(', ');
            text += `\n📖 ${refs}`;
          }
          return text;
        })
        .join('\n\n---\n\n');

      await Share.share({
        message: `${conversationText}\n\n✝️ Shared from ChooseGOD`,
      });
    } catch (error) {
      console.error('Share failed:', error);
      Alert.alert('Share Failed', 'Unable to share this conversation.');
    }
  }, [messages]);

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
          {/* Share conversation */}
          {hasMessages && (
            <TouchableOpacity
              style={styles.headerButton}
              onPress={handleShareConversation}
            >
              <Ionicons name="share-outline" size={18} color={theme.colors.textMuted} />
            </TouchableOpacity>
          )}
          {/* Mode selector toggle */}
          <TouchableOpacity
            style={[styles.headerButton, showModeSelector && styles.headerButtonActive]}
            onPress={handleModeSelectorToggle}
          >
            <Ionicons
              name="compass-outline"
              size={18}
              color={showModeSelector ? theme.colors.accent : theme.colors.textMuted}
            />
          </TouchableOpacity>
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

      {/* Mode Selector Panel */}
      {showModeSelector && (
        <View style={styles.modeSelectorPanel}>
          <Text style={styles.modeSelectorTitle}>Spiritual Practices</Text>
          <View style={styles.modeSelectorGrid}>
            {/* Free modes */}
            {FREE_CHAT_MODES.map((mode) => (
              <TouchableOpacity
                key={mode}
                style={[
                  styles.modeSelectorItem,
                  currentMode === mode && styles.modeSelectorItemActive,
                ]}
                onPress={() => handleModeSelect(mode)}
              >
                <Ionicons
                  name={getModeIcon(mode)}
                  size={20}
                  color={currentMode === mode ? theme.colors.primary : theme.colors.textSecondary}
                />
                <Text style={[
                  styles.modeSelectorItemText,
                  currentMode === mode && styles.modeSelectorItemTextActive,
                ]}>
                  {getModeName(mode)}
                </Text>
              </TouchableOpacity>
            ))}
            {/* Premium modes */}
            {PREMIUM_CHAT_MODES.map((mode) => (
              <TouchableOpacity
                key={mode}
                style={[
                  styles.modeSelectorItem,
                  currentMode === mode && styles.modeSelectorItemActive,
                  !isPremium && styles.modeSelectorItemLocked,
                ]}
                onPress={() => handleModeSelect(mode)}
              >
                <View style={styles.modeSelectorItemIconRow}>
                  <Ionicons
                    name={getModeIcon(mode)}
                    size={20}
                    color={currentMode === mode ? theme.colors.accent : theme.colors.textSecondary}
                  />
                  {!isPremium && (
                    <Ionicons
                      name="lock-closed"
                      size={10}
                      color={theme.colors.accent}
                      style={styles.modeSelectorLockIcon}
                    />
                  )}
                </View>
                <Text style={[
                  styles.modeSelectorItemText,
                  currentMode === mode && styles.modeSelectorItemTextActive,
                  !isPremium && styles.modeSelectorItemTextLocked,
                ]}>
                  {getModeName(mode)}
                </Text>
                {!isPremium && (
                  <Text style={styles.modeSelectorProBadge}>PRO</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

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
      <View style={styles.messageList} ref={viewShotRef} collapsable={false}>
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
  // Mode selector styles
  modeSelectorPanel: {
    backgroundColor: theme.colors.surface,
    marginHorizontal: theme.spacing.md,
    marginVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  modeSelectorTitle: {
    fontSize: theme.fontSize.sm,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
  },
  modeSelectorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.xs,
  },
  modeSelectorItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.background,
    minWidth: 72,
    gap: 4,
  },
  modeSelectorItemActive: {
    backgroundColor: theme.colors.primaryAlpha[15],
    borderWidth: 1,
    borderColor: theme.colors.primaryAlpha[20],
  },
  modeSelectorItemLocked: {
    opacity: 0.8,
  },
  modeSelectorItemIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  modeSelectorLockIcon: {
    position: 'absolute',
    top: -4,
    right: -8,
  },
  modeSelectorItemText: {
    fontSize: 10,
    fontWeight: '500',
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  modeSelectorItemTextActive: {
    color: theme.colors.primary,
    fontWeight: '600',
  },
  modeSelectorItemTextLocked: {
    color: theme.colors.textMuted,
  },
  modeSelectorProBadge: {
    fontSize: 8,
    fontWeight: '700',
    color: theme.colors.accent,
    marginTop: 2,
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
