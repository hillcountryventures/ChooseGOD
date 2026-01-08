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

import React, { useCallback, useRef, useEffect, useState, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Share,
  Alert,
  TextInput,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FlashList, FlashListRef } from '@shopify/flash-list';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Haptics from 'expo-haptics';
import NetInfo from '@react-native-community/netinfo';
import BottomSheet from '@gorhom/bottom-sheet';

import { useStore } from '../store/useStore';
import { theme } from '../lib/theme';
import { MessageBubble } from '../components/MessageBubble';
import { VerseQuickView } from '../components/chat/VerseQuickView';
import { ChatMessage, VerseSource, SuggestedAction, RootStackParamList, ChatMode, Translation } from '../types';
import { supabaseUrl, supabaseAnonKey } from '../lib/supabase';
import { CHAT_LIMITS } from '../constants/limits';
import { ANIMATION_DELAY } from '../constants/animations';
import { usePremiumStatus } from '../hooks/usePremiumStatus';
import { useChatQuota } from '../hooks/useChatQuota';
import { FREE_CHAT_MODES, PREMIUM_CHAT_MODES } from '../constants/subscription';
import { streamCompanionResponse } from '../components/chat/utils';
import { useVoiceInput } from '../hooks/useVoiceInput';
import { ScriptureSkeleton } from '../components/ScriptureSkeleton';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type ChatHubRouteProp = RouteProp<RootStackParamList, 'ChatHub'>;

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

// Seed Icon Component with animation
function SeedIcon({ filled, animating }: { filled: boolean; animating: boolean }) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (animating) {
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 1.5,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [animating]);

  return (
    <Animated.View
      style={[
        styles.seedIcon,
        {
          transform: [{ scale: animating ? scaleAnim : 1 }],
          opacity: animating ? opacityAnim : 1,
        },
      ]}
    >
      <Text style={styles.seedEmoji}>{filled ? '🌱' : '·'}</Text>
    </Animated.View>
  );
}

// Daily Seeds Tracker Component
function SeedTracker({
  seedsRemaining,
  totalSeeds,
  isPremium,
  onUpgradePress,
}: {
  seedsRemaining: number;
  totalSeeds: number;
  isPremium: boolean;
  onUpgradePress: () => void;
}) {
  if (isPremium) {
    return (
      <View style={styles.seedTrackerPremium}>
        <Ionicons name="infinite" size={16} color={theme.colors.accent} />
        <Text style={styles.seedTrackerPremiumText}>Unlimited</Text>
      </View>
    );
  }

  return (
    <TouchableOpacity style={styles.seedTracker} onPress={onUpgradePress}>
      <View style={styles.seedIcons}>
        {Array.from({ length: totalSeeds }).map((_, i) => (
          <SeedIcon key={i} filled={i < seedsRemaining} animating={false} />
        ))}
      </View>
      <Text style={styles.seedTrackerText}>
        {seedsRemaining} seed{seedsRemaining !== 1 ? 's' : ''} left
      </Text>
    </TouchableOpacity>
  );
}

// Growth verses for spiritual encouragement
const GROWTH_VERSES = [
  { text: "But grow in the grace and knowledge of our Lord and Savior Jesus Christ.", ref: "2 Peter 3:18" },
  { text: "I am the vine; you are the branches. If you remain in me and I in you, you will bear much fruit.", ref: "John 15:5" },
  { text: "Let us not become weary in doing good, for at the proper time we will reap a harvest if we do not give up.", ref: "Galatians 6:9" },
  { text: "The grass withers and the flowers fall, but the word of our God endures forever.", ref: "Isaiah 40:8" },
  { text: "Your word is a lamp for my feet, a light on my path.", ref: "Psalm 119:105" },
];

// No Seeds Card (shown when quota exhausted)
function NoSeedsCard({ onUpgradePress }: { onUpgradePress: () => void }) {
  // Select a random verse on mount
  const verse = useMemo(() => GROWTH_VERSES[Math.floor(Math.random() * GROWTH_VERSES.length)], []);

  return (
    <View style={styles.noSeedsCard}>
      <View style={styles.noSeedsContent}>
        <Text style={styles.noSeedsEmoji}>🌱</Text>
        <Text style={styles.noSeedsTitle}>You've planted all your seeds for today</Text>
        <Text style={styles.noSeedsSubtitle}>
          Want to grow deeper? Unlock unlimited Bible study.
        </Text>
        <TouchableOpacity style={styles.noSeedsButton} onPress={onUpgradePress}>
          <Ionicons name="sparkles" size={18} color="#fff" />
          <Text style={styles.noSeedsButtonText}>Unlock Unlimited ($2.99/mo)</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.growthVerseContainer}>
        <Text style={styles.growthVerseText}>"{verse.text}"</Text>
        <Text style={styles.growthVerseRef}>— {verse.ref}</Text>
      </View>
    </View>
  );
}

// Final Seed Warning Banner
function FinalSeedBanner() {
  return (
    <View style={styles.finalSeedBanner}>
      <Ionicons name="leaf" size={16} color={theme.colors.accent} />
      <Text style={styles.finalSeedText}>This is your final daily seed. Make it a deep one.</Text>
    </View>
  );
}

export default function ChatHubScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<ChatHubRouteProp>();
  const flashListRef = useRef<FlashListRef<ChatMessage>>(null);
  const inputRef = useRef<TextInput>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const verseQuickViewRef = useRef<BottomSheet>(null);
  const handleSendRef = useRef<(message: string, isRetry?: boolean) => void>(() => {});

  // Route params for context
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

  // Premium & Quota status
  const { isPremium, canUseChatMode, showPaywall } = usePremiumStatus();
  const {
    seedsRemaining,
    totalSeeds,
    isOnLastSeed,
    hasSeeds,
    useSeed,
    showFinalSeedInterstitial,
    dismissFinalSeedInterstitial,
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

  // Voice input - uses ref to avoid circular dependency with handleSend
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

  const handleSend = async (message: string, isRetry: boolean = false) => {
    if (!message.trim()) return;

    // Check network connectivity
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

    // Check quota (seeds) - but don't consume yet
    // Seeds are only consumed on successful response (in onDone callback)
    // Retries don't check quota since the original attempt was already validated
    if (!isRetry && !hasSeeds) {
      showPaywall();
      return;
    }

    // Cancel any existing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    setInputText('');
    Keyboard.dismiss();
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

    // Create placeholder assistant message
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

      // Include context verse if provided
      const bibleContext = contextVerse ? {
        book: contextVerse.book,
        chapter: contextVerse.chapter,
        selectedVerse: {
          verse: contextVerse.verse,
          text: contextVerse.text,
          translation: contextVerse.translation as Translation,
        },
      } : undefined;

      // Build quota context for backend
      // Pro users get isPremium flag for enhanced "Golden Response" on every query
      // Free users get seed tracking info
      const quotaContext = isPremium
        ? { isPremium: true }
        : {
            isFreeTier: true,
            seedsRemaining,
            totalSeeds,
            isLastSeed: isOnLastSeed,
          };

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
            updateMessage(assistantMessageId, {
              content: fullContent,
            });
          },
          onDone: async (fullResponse) => {
            updateMessage(assistantMessageId, {
              content: fullResponse,
            });
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            setIsQuerying(false);
            abortControllerRef.current = null;

            // Only consume the seed AFTER successful response
            // This protects users from losing seeds on errors
            if (!isRetry) {
              const wasLastSeed = seedsRemaining === 1;
              await useSeed();

              // If this was the final seed, show paywall after 2-second delay
              // This lets the user digest the "Golden Response" before the ask
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
              suggestedActions: [
                { label: 'Try again', prompt: message, icon: 'refresh-outline' },
              ],
            });
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            setIsQuerying(false);
            abortControllerRef.current = null;
          },
          onRetry: () => {
            updateMessage(assistantMessageId, {
              content: 'Warming up... just a moment.',
            });
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
          suggestedActions: [
            { label: 'Try again', prompt: message, icon: 'refresh-outline' },
          ],
        });
        setIsQuerying(false);
        abortControllerRef.current = null;
        return;
      }

      const errorDetails = error instanceof Error ? error.message : String(error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      updateMessage(assistantMessageId, {
        content: `I'm having trouble connecting. ${errorDetails}\n\nTap "Try again" below to retry.`,
        suggestedActions: [
          { label: 'Try again', prompt: message, icon: 'refresh-outline' },
        ],
      });
      setIsQuerying(false);
      abortControllerRef.current = null;
    }
  };

  // Keep ref in sync with handleSend for voice input and initial message callbacks
  useEffect(() => {
    handleSendRef.current = handleSend;
  }, [isPremium, hasSeeds, seedsRemaining, isOnLastSeed, currentMode, messages, contextVerse]);

  const handleSuggestedActionPress = useCallback((action: SuggestedAction) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // Check if this is a "Try again" retry action - these don't consume seeds
    const isRetryAction = action.label.toLowerCase() === 'try again' ||
                          action.icon === 'refresh-outline';

    const isPrayerAction =
      action.label.toLowerCase().includes('pray') ||
      action.prompt.toLowerCase().includes('pray');
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

    // Add welcome message for specific modes
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
          actions: [
            { label: 'Begin Lectio', prompt: 'Guide me through Lectio Divina', icon: 'book-outline' },
          ],
        },
        examen: {
          content: "Welcome to the Evening Examen. I'll help you notice where God was present today.\n\nAre you ready to begin?",
          actions: [
            { label: 'Begin Examen', prompt: 'Guide me through the Evening Examen', icon: 'moon-outline' },
          ],
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
    Alert.alert(
      'Clear Chat',
      'Are you sure you want to clear this conversation?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => {
            clearMessages();
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          },
        },
      ]
    );
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

      await Share.share({
        message: `${conversationText}\n\n✝️ Shared from ChooseGOD`,
      });
    } catch (error) {
      console.error('Share failed:', error);
    }
  }, [messages]);

  // Handle verse press - open Quick View
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

  const isPrayerMode = currentMode === 'prayer';
  const hasMessages = messages.length > 0;

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
                {isPrayerMode ? 'Prayer' : 'Ask the Bible'}
              </Text>
            </View>
            {ContextChip}
          </View>

          <View style={styles.headerRight}>
            {/* Seed Tracker */}
            <SeedTracker
              seedsRemaining={seedsRemaining}
              totalSeeds={totalSeeds}
              isPremium={isPremium}
              onUpgradePress={showPaywall}
            />
            {hasMessages && (
              <>
                <TouchableOpacity style={styles.headerButton} onPress={handleShareConversation}>
                  <Ionicons name="share-outline" size={20} color={theme.colors.textMuted} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.headerButton} onPress={handleClearChat}>
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
          <View style={styles.modeSelectorPanel}>
            <Text style={styles.modeSelectorTitle}>Spiritual Practices</Text>
            <View style={styles.modeSelectorGrid}>
              {FREE_CHAT_MODES.map((mode) => (
                <TouchableOpacity
                  key={mode}
                  style={[styles.modeSelectorItem, currentMode === mode && styles.modeSelectorItemActive]}
                  onPress={() => handleModeSelect(mode)}
                >
                  <Ionicons
                    name={getModeIcon(mode)}
                    size={20}
                    color={currentMode === mode ? theme.colors.primary : theme.colors.textSecondary}
                  />
                  <Text style={[styles.modeSelectorItemText, currentMode === mode && styles.modeSelectorItemTextActive]}>
                    {getModeName(mode)}
                  </Text>
                </TouchableOpacity>
              ))}
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
                      <Ionicons name="lock-closed" size={10} color={theme.colors.accent} style={styles.modeSelectorLockIcon} />
                    )}
                  </View>
                  <Text style={[
                    styles.modeSelectorItemText,
                    currentMode === mode && styles.modeSelectorItemTextActive,
                    !isPremium && styles.modeSelectorItemTextLocked,
                  ]}>
                    {getModeName(mode)}
                  </Text>
                  {!isPremium && <Text style={styles.modeSelectorProBadge}>PRO</Text>}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Messages */}
        <View style={styles.messageList}>
          {!hasMessages ? (
            <View style={styles.emptyState}>
              <Ionicons
                name={isPrayerMode ? 'hand-left-outline' : 'book-outline'}
                size={64}
                color={isPrayerMode ? theme.colors.prayer : theme.colors.textMuted}
              />
              <Text style={styles.emptyStateTitle}>
                {isPrayerMode ? 'Prayer Mode' : 'Ask the Bible'}
              </Text>
              <Text style={styles.emptyStateText}>
                {isPrayerMode
                  ? "Share what's on your heart and let's pray together"
                  : contextVerse
                    ? `Ask about ${contextVerse.book} ${contextVerse.chapter}:${contextVerse.verse}`
                    : 'Ask about Scripture, theology, or spiritual guidance'}
              </Text>
              {/* Quick suggestions - "Daily Reflection" chips */}
              <View style={styles.suggestionList}>
                {isPrayerMode ? (
                  <>
                    <TouchableOpacity style={styles.suggestionChip} onPress={() => handleSend('Guide me through ACTS prayer')}>
                      <Text style={styles.suggestionChipIcon}>🙏</Text>
                      <Text style={styles.suggestionChipText}>ACTS Prayer</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.suggestionChip} onPress={() => handleSend('Help me pray for peace and guidance')}>
                      <Text style={styles.suggestionChipIcon}>🕊️</Text>
                      <Text style={styles.suggestionChipText}>Peace & guidance</Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  <>
                    <TouchableOpacity style={styles.suggestionChip} onPress={() => handleSend('Help me pray through my current struggles')}>
                      <Text style={styles.suggestionChipIcon}>🙏</Text>
                      <Text style={styles.suggestionChipText}>Pray through struggles</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.suggestionChip} onPress={() => handleSend("Explain the historical context of today's verse")}>
                      <Text style={styles.suggestionChipIcon}>📖</Text>
                      <Text style={styles.suggestionChipText}>Historical context</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.suggestionChip} onPress={() => handleSend('How can I apply Scripture to my work life?')}>
                      <Text style={styles.suggestionChipIcon}>🌱</Text>
                      <Text style={styles.suggestionChipText}>Apply to work</Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>
            </View>
          ) : (
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
          )}
        </View>

        {/* No Seeds Card (when quota exhausted) */}
        {!hasSeeds && !isPremium && (
          <NoSeedsCard onUpgradePress={showPaywall} />
        )}

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

        {/* Input - hidden when no seeds */}
        {(hasSeeds || isPremium) && (
          <View style={[styles.inputContainer, isOnLastSeed && !isPremium && styles.inputContainerFinal]}>
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

  // Seed Tracker
  seedTracker: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.full,
    gap: 6,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  seedTrackerPremium: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.accentAlpha[20],
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.full,
    gap: 4,
  },
  seedTrackerPremiumText: {
    fontSize: 10,
    fontWeight: '600',
    color: theme.colors.accent,
  },
  seedIcons: {
    flexDirection: 'row',
    gap: 2,
  },
  seedIcon: {
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  seedEmoji: {
    fontSize: 12,
  },
  seedTrackerText: {
    fontSize: 10,
    color: theme.colors.textMuted,
    fontWeight: '500',
  },

  // Final Seed Banner
  finalSeedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.accentAlpha[15],
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    gap: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.accentAlpha[30],
  },
  finalSeedText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.accent,
    fontWeight: '500',
    fontStyle: 'italic',
  },

  // No Seeds Card
  noSeedsCard: {
    margin: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.xl,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.md,
  },
  noSeedsContent: {
    alignItems: 'center',
  },
  noSeedsEmoji: {
    fontSize: 48,
    marginBottom: theme.spacing.md,
  },
  noSeedsTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: '700',
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: theme.spacing.xs,
  },
  noSeedsSubtitle: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
  noSeedsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.xl,
    borderRadius: theme.borderRadius.full,
    gap: theme.spacing.sm,
  },
  noSeedsButtonText: {
    fontSize: theme.fontSize.md,
    fontWeight: '600',
    color: '#fff',
  },
  growthVerseContainer: {
    marginTop: theme.spacing.xl,
    paddingTop: theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    alignItems: 'center',
  },
  growthVerseText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: theme.spacing.sm,
  },
  growthVerseRef: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.accent,
    marginTop: 6,
    fontWeight: '600',
  },

  // Mode Selector
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

  // Message List
  messageList: {
    flex: 1,
  },
  messageListContent: {
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.md,
    paddingTop: theme.spacing.sm,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
  },
  emptyStateTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: '600',
    color: theme.colors.text,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.xs,
  },
  emptyStateText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textMuted,
    textAlign: 'center',
    lineHeight: theme.fontSize.md * 1.5,
    marginBottom: theme.spacing.lg,
    paddingHorizontal: theme.spacing.md,
  },
  suggestionList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    maxWidth: 320,
  },
  suggestionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: 6,
  },
  suggestionChipIcon: {
    fontSize: 14,
  },
  suggestionChipText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.primary,
    fontWeight: '500',
  },

  // Typing container for skeleton loader
  typingContainer: {
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.sm,
  },

  // Listening Banner
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

  // Input
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
