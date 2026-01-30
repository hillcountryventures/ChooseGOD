/**
 * useChatHub - Core hook for ChatHub screen state and logic
 * 
 * Manages chat messages, streaming, mode selection, quota, voice input,
 * and all associated handlers.
 */

import { useCallback, useRef, useEffect, useState } from 'react';
import {
  Keyboard,
  Share,
  Alert,
  TextInput,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { FlashListRef } from '@shopify/flash-list';
import * as Haptics from 'expo-haptics';
import NetInfo from '@react-native-community/netinfo';
import BottomSheet from '@gorhom/bottom-sheet';

import { useStore } from '../store/useStore';
import { ChatMessage, VerseSource, SuggestedAction, RootStackParamList, ChatMode, Translation } from '../types';
import { getSupabaseConfig } from '../lib/supabase';
import { CHAT_LIMITS } from '../constants/limits';
import { ANIMATION_DELAY } from '../constants/animations';
import { sanitizeChatMessage } from '../utils/inputSanitizer';
import { validateAIResponse, getGuardrailFallback } from '../utils/theologicalGuardrails';
import { usePremiumStatus } from './usePremiumStatus';
import { useChatQuota } from './useChatQuota';
import { streamCompanionResponse } from '../components/chat/utils';
import { useVoiceInput } from './useVoiceInput';
import { isPrayerMode as checkIsPrayerMode } from '../constants/chatModes';
import { logger } from '../utils/logger';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type ChatHubRouteProp = RouteProp<RootStackParamList, 'ChatHub'>;

export function useChatHub() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<ChatHubRouteProp>();
  const flashListRef = useRef<FlashListRef<ChatMessage>>(null);
  const inputRef = useRef<TextInput>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const verseQuickViewRef = useRef<BottomSheet>(null);
  const handleSendRef = useRef<(message: string, isRetry?: boolean) => void>(() => {});

  const {
    contextVerse,
    contextMode: initialMode,
    initialMessage: routeInitialMessage,
  } = route.params || {};

  // Store state
  const messages = useStore((s) => s.messages);
  const isQuerying = useStore((s) => s.isQuerying);
  const currentMode = useStore((s) => s.currentMode);
  const setCurrentMode = useStore((s) => s.setCurrentMode);
  const addMessage = useStore((s) => s.addMessage);
  const updateMessage = useStore((s) => s.updateMessage);
  const setIsQuerying = useStore((s) => s.setIsQuerying);
  const clearMessages = useStore((s) => s.clearMessages);

  // Premium & Quota
  const { isPremium, canUseChatMode, showPaywall } = usePremiumStatus();
  const {
    seedsRemaining,
    totalSeeds,
    isOnLastSeed,
    hasSeeds,
    consumeSeed,
  } = useChatQuota();

  // Local state
  const [inputText, setInputText] = useState('');
  const [showModeSelector, setShowModeSelector] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);
  const [selectedVerseRef, setSelectedVerseRef] = useState<{
    book: string;
    chapter: number;
    verseStart?: number;
    verseEnd?: number;
  } | null>(null);

  // Voice input
  const {
    isListening,
    isAvailable: isVoiceAvailable,
    startListening,
    stopListening,
    cancelListening,
  } = useVoiceInput({
    onResult: (transcript) => {
      if (transcript.trim()) {
        handleSendRef.current(transcript);
      }
    },
    onPartialResult: (partial) => {
      setInputText(partial);
    },
  });

  // Set initial mode from route params
  useEffect(() => {
    if (initialMode && !hasInitialized) {
      setCurrentMode(initialMode);
    }
  }, [initialMode, hasInitialized, setCurrentMode]);

  // Handle initial message from route params
  useEffect(() => {
    if (routeInitialMessage && !hasInitialized) {
      setHasInitialized(true);
      setTimeout(() => {
        handleSendRef.current(routeInitialMessage);
      }, 300);
    } else if (!hasInitialized) {
      setHasInitialized(true);
    }
  }, [routeInitialMessage, hasInitialized]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flashListRef.current?.scrollToEnd({ animated: true });
      }, ANIMATION_DELAY.scroll);
    }
  }, [messages]);

  // Auto-focus input on mount
  useEffect(() => {
    setTimeout(() => {
      inputRef.current?.focus();
    }, 300);
  }, []);

  const handleStop = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsQuerying(false);
    }
  }, [setIsQuerying]);

  const handleSend = async (rawMessage: string, isRetry: boolean = false) => {
    const message = sanitizeChatMessage(rawMessage);
    if (!message) return;

    const netState = await NetInfo.fetch();
    if (!netState.isConnected) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('No Connection', 'Please check your internet connection and try again.', [{ text: 'OK' }]);
      return;
    }

    if (!isRetry && !hasSeeds) {
      showPaywall();
      return;
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    setInputText('');
    Keyboard.dismiss();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: message,
      timestamp: new Date(),
      mode: currentMode,
    };
    addMessage(userMessage);
    setIsQuerying(true);

    const assistantMessageId = (Date.now() + 1).toString();
    const assistantMessage: ChatMessage = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      mode: currentMode,
    };
    addMessage(assistantMessage);

    try {
      const history = messages.slice(-CHAT_LIMITS.historyMessages).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const bibleContext = contextVerse ? {
        book: contextVerse.book,
        chapter: contextVerse.chapter,
        selectedVerse: {
          verse: contextVerse.verse,
          text: contextVerse.text,
          translation: contextVerse.translation as Translation,
        },
      } : undefined;

      const quotaContext = isPremium
        ? { isPremium: true, isFreeTier: false, seedsRemaining: 999, totalSeeds: 999, isLastSeed: false }
        : { isPremium: false, isFreeTier: true, seedsRemaining, totalSeeds, isLastSeed: isOnLastSeed };

      const { url: supabaseUrl, anonKey: supabaseAnonKey } = getSupabaseConfig();
      await streamCompanionResponse(
        supabaseUrl,
        supabaseAnonKey,
        {
          userId: null,
          message,
          conversationHistory: history,
          contextMode: currentMode,
          bibleContext,
          quotaContext,
        },
        {
          onMeta: ({ sources, suggestedActions }) => {
            updateMessage(assistantMessageId, {
              sources: sources as VerseSource[],
              suggestedActions,
            });
          },
          onContent: (_chunk, fullContent) => {
            updateMessage(assistantMessageId, { content: fullContent });
          },
          onDone: async (fullResponse) => {
            // Theological guardrails — validate before displaying
            const guardrailResult = validateAIResponse(fullResponse);
            const safeContent = guardrailResult.safe
              ? fullResponse
              : getGuardrailFallback(guardrailResult.flags);
            updateMessage(assistantMessageId, { content: safeContent });
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            setIsQuerying(false);
            abortControllerRef.current = null;

            if (!isRetry) {
              const wasLastSeed = seedsRemaining === 1;
              await consumeSeed();
              if (wasLastSeed && !isPremium) {
                setTimeout(() => {
                  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                  showPaywall();
                }, 2000);
              }
            }
          },
          onError: (errorMsg) => {
            updateMessage(assistantMessageId, {
              content: `I'm having trouble connecting right now. ${errorMsg}\n\nTap "Try again" below to retry.`,
              suggestedActions: [{ label: 'Try again', prompt: message, icon: 'refresh-outline' }],
            });
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            setIsQuerying(false);
            abortControllerRef.current = null;
          },
          onRetry: () => {
            updateMessage(assistantMessageId, { content: 'Warming up... just a moment.' });
          },
        },
        abortControllerRef.current?.signal
      );
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        updateMessage(assistantMessageId, { content: 'Cancelled.' });
        setIsQuerying(false);
        return;
      }

      if (error instanceof Error && error.name === 'TimeoutError') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        updateMessage(assistantMessageId, {
          content: 'The companion is still warming up. Tap below to try again.',
          suggestedActions: [{ label: 'Try again', prompt: message, icon: 'refresh-outline' }],
        });
        setIsQuerying(false);
        abortControllerRef.current = null;
        return;
      }

      const errorDetails = error instanceof Error ? error.message : String(error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      updateMessage(assistantMessageId, {
        content: `I'm having trouble connecting. ${errorDetails}\n\nTap "Try again" below to retry.`,
        suggestedActions: [{ label: 'Try again', prompt: message, icon: 'refresh-outline' }],
      });
      setIsQuerying(false);
      abortControllerRef.current = null;
    }
  };

  // Keep ref in sync
  useEffect(() => {
    handleSendRef.current = handleSend;
  }, [isPremium, hasSeeds, seedsRemaining, isOnLastSeed, currentMode, messages, contextVerse]);

  const handleSuggestedActionPress = useCallback((action: SuggestedAction) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const isRetryAction = action.label.toLowerCase() === 'try again' || action.icon === 'refresh-outline';
    const isPrayerAction = action.label.toLowerCase().includes('pray') || action.prompt.toLowerCase().includes('pray');
    if (isPrayerAction && currentMode !== 'prayer') {
      setCurrentMode('prayer');
    }
    handleSendRef.current(action.prompt, isRetryAction);
  }, [currentMode, setCurrentMode]);

  const handleModeSelect = useCallback((mode: ChatMode) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (!canUseChatMode(mode)) {
      showPaywall();
      setShowModeSelector(false);
      return;
    }
    setCurrentMode(mode);
    setShowModeSelector(false);

    if (messages.length === 0) {
      const modeWelcomes: Partial<Record<ChatMode, { content: string; actions: SuggestedAction[] }>> = {
        prayer: {
          content: "I'm here to guide you in prayer. You can share what's on your heart, ask for Scripture to pray over a situation, or let me lead you through ACTS prayer.\n\nWhat would you like to bring before the Lord today?",
          actions: [
            { label: 'ACTS Prayer', prompt: 'Guide me through ACTS prayer', icon: 'list-outline' },
            { label: 'Scripture to pray', prompt: 'Give me a Scripture to pray over my situation', icon: 'book-outline' },
          ],
        },
        lectio: {
          content: "Welcome to Lectio Divina. I'll guide you through four movements: Reading, Meditation, Prayer, and Contemplation.\n\nWould you like to begin?",
          actions: [{ label: 'Begin Lectio', prompt: 'Guide me through Lectio Divina', icon: 'book-outline' }],
        },
        examen: {
          content: "Welcome to the Evening Examen. I'll help you notice where God was present today.\n\nAre you ready to begin?",
          actions: [{ label: 'Begin Examen', prompt: 'Guide me through the Evening Examen', icon: 'moon-outline' }],
        },
        memory: {
          content: "Scripture memory mode! I can help you memorize verses using first-letter prompts and spaced repetition.\n\nWhat verse would you like to work on?",
          actions: [
            { label: 'Add new verse', prompt: 'I want to memorize a new verse', icon: 'add-outline' },
            { label: 'Review verses', prompt: 'Quiz me on my memory verses', icon: 'school-outline' },
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

  const handleClearChat = useCallback(() => {
    Alert.alert('Clear Chat', 'Are you sure you want to clear this conversation?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear',
        style: 'destructive',
        onPress: () => {
          clearMessages();
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        },
      },
    ]);
  }, [clearMessages]);

  const handleShareConversation = useCallback(async () => {
    if (messages.length === 0) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      const conversationText = messages
        .map((m) => {
          const role = m.role === 'user' ? 'You' : 'Companion';
          let text = `${role}: ${m.content}`;
          if (m.sources && m.sources.length > 0) {
            const refs = m.sources.map((s) => `${s.book} ${s.chapter}:${s.verse}`).join(', ');
            text += `\n📖 ${refs}`;
          }
          return text;
        })
        .join('\n\n---\n\n');
      await Share.share({ message: `${conversationText}\n\n✝️ Shared from ChooseGOD` });
    } catch (error) {
      logger.error('Share failed:', error);
    }
  }, [messages]);

  const handleVersePress = useCallback((verse: VerseSource) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedVerseRef({
      book: verse.book,
      chapter: verse.chapter,
      verseStart: verse.verse,
    });
    verseQuickViewRef.current?.snapToIndex(0);
  }, []);

  const handleCloseVerseQuickView = useCallback(() => {
    verseQuickViewRef.current?.close();
    setSelectedVerseRef(null);
  }, []);

  const isPrayerMode = checkIsPrayerMode(currentMode);
  const hasMessages = messages.length > 0;

  return {
    // Navigation
    navigation,
    contextVerse,

    // Store state
    messages,
    isQuerying,
    currentMode,
    isPremium,
    seedsRemaining,
    totalSeeds,
    isOnLastSeed,
    hasSeeds,
    showPaywall,

    // Local state
    inputText,
    setInputText,
    showModeSelector,
    setShowModeSelector,
    selectedVerseRef,

    // Voice
    isListening,
    isVoiceAvailable,
    startListening,
    stopListening,
    cancelListening,

    // Refs
    flashListRef,
    inputRef,
    verseQuickViewRef,

    // Derived
    isPrayerMode,
    hasMessages,

    // Handlers
    handleSend,
    handleStop,
    handleSuggestedActionPress,
    handleModeSelect,
    handleClearChat,
    handleShareConversation,
    handleVersePress,
    handleCloseVerseQuickView,
  };
}
