/**
 * ChatBottomSheet - Orchestrator component
 *
 * Delegates rendering to sub-components:
 * - ChatHeader: header bar with mode/premium info
 * - ChatMessageList: messages, empty state, reflection prompts
 * - ChatInputArea: text input, voice, send button
 * - ChatModeSelector: spiritual practice mode picker
 */
import React, { useCallback, useMemo, useRef, useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Keyboard,
  Animated,
  Platform,
  Share,
  Alert,
} from 'react-native';
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
} from '@gorhom/bottom-sheet';
import { FlashListRef } from '@shopify/flash-list';
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
import { ChatMessage, VerseSource, SuggestedAction, RootStackParamList } from '../../types';
import { getSupabaseConfig } from '../../lib/supabase';
import { CHAT_LIMITS } from '../../constants/limits';
import { sanitizeChatMessage } from '../../utils/inputSanitizer';
import { ANIMATION_DELAY } from '../../constants/animations';
import { usePremiumStatus, useChatUsageTracking } from '../../hooks/usePremiumStatus';
import { useChatQuota } from '../../hooks/useChatQuota';
import type { ChatMode } from '../../types';
import {
  streamCompanionResponse,
  generateContextPrompt,
  generateInitialMessage,
} from './utils';
import { useVoiceInput } from '../../hooks/useVoiceInput';
import { isPrayerMode as checkIsPrayerMode } from '../../constants/chatModes';

// Sub-components
import { ChatHeader } from './ChatHeader';
import { ChatInputArea } from './ChatInputArea';
import { ChatMessageList } from './ChatMessageList';
import { ChatModeSelector } from './ChatModeSelector';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export function ChatBottomSheet() {
  const navigation = useNavigation<NavigationProp>();
  const bottomSheetRef = useRef<BottomSheet>(null);
  const flashListRef = useRef<FlashListRef<ChatMessage>>(null);
  const inputRef = useRef<React.ElementRef<typeof View>>(null);
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
  const setChatContext = useStore((s) => s.setChatContext);
  const messages = useStore((s) => s.messages);
  const isQuerying = useStore((s) => s.isQuerying);
  const currentMode = useStore((s) => s.currentMode);
  const setCurrentMode = useStore((s) => s.setCurrentMode);
  const addMessage = useStore((s) => s.addMessage);
  const updateMessage = useStore((s) => s.updateMessage);
  const setIsQuerying = useStore((s) => s.setIsQuerying);
  const clearMessages = useStore((s) => s.clearMessages);
  const dailyVerse = useStore((s) => s.dailyVerse);

  // Premium
  const { isPremium, canUseChat, canUseChatMode, showPaywall } = usePremiumStatus();
  const { incrementUsage } = useChatUsageTracking();
  const { seedsRemaining, totalSeeds } = useChatQuota();

  // Local state
  const [showModeSelector, setShowModeSelector] = useState(false);
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
      if (transcript.trim()) handleSendRef.current(transcript);
    },
    onPartialResult: (partial) => setInputText(partial),
  });

  const snapPoints = useMemo(() => ['50%', '94%'], []);
  const isPrayerMode = checkIsPrayerMode(currentMode);
  const hasMessages = messages.length > 0;

  // ==================== EFFECTS ====================

  useEffect(() => {
    if (chatSheetOpen) {
      bottomSheetRef.current?.snapToIndex(0);
      setTimeout(() => (inputRef.current as unknown as { focus: () => void })?.focus(), 300);
      if (chatContext.pendingMessage) {
        const msg = chatContext.pendingMessage;
        setChatContext({ pendingMessage: undefined });
        setTimeout(() => handleSendRef.current(msg), 400);
      }
    } else {
      bottomSheetRef.current?.close();
    }
  }, [chatSheetOpen, chatContext.pendingMessage, setChatContext]);

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => flashListRef.current?.scrollToEnd({ animated: true }), ANIMATION_DELAY.scroll);
    }
  }, [messages]);

  useEffect(() => {
    if (Platform.OS !== 'ios') return;
    const sub = Keyboard.addListener('keyboardDidShow', () => {
      setTimeout(() => bottomSheetRef.current?.snapToIndex(1), 100);
    });
    return () => sub.remove();
  }, []);

  // ==================== HANDLERS ====================

  const handleSheetChanges = useCallback((index: number) => {
    if (index === -1) {
      setChatSheetOpen(false);
      Keyboard.dismiss();
      isClosingRef.current = false;
    }
  }, [setChatSheetOpen]);

  const handleClose = useCallback(() => {
    if (isClosingRef.current) return;
    isClosingRef.current = true;
    Keyboard.dismiss();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setTimeout(() => bottomSheetRef.current?.close(), Platform.OS === 'ios' ? 50 : 0);
  }, []);

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.7}
        pressBehavior="close"
      >
        <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
      </BottomSheetBackdrop>
    ),
    []
  );

  const handleStop = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsQuerying(false);
    }
  }, [setIsQuerying]);

  const handleSend = useCallback(async (rawMessage: string, isRetry = false) => {
    const message = sanitizeChatMessage(rawMessage);
    if (!message) return;

    const netState = await NetInfo.fetch();
    if (!netState.isConnected) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('No Connection', 'Please check your internet connection and try again.', [{ text: 'OK' }]);
      return;
    }

    if (!isRetry && !canUseChat) { showPaywall(); return; }

    if (abortControllerRef.current) abortControllerRef.current.abort();
    abortControllerRef.current = new AbortController();
    setInputText('');
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
    bottomSheetRef.current?.snapToIndex(1);

    const assistantMessageId = (Date.now() + 1).toString();
    addMessage({
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      mode: currentMode,
    });

    try {
      const history = messages.slice(-CHAT_LIMITS.historyMessages).map((m) => ({
        role: m.role,
        content: m.content,
      }));
      const bibleContext = chatContext.screenType === 'bible' ? chatContext.bibleContext : undefined;
      const { url: supabaseUrl, anonKey: supabaseAnonKey } = getSupabaseConfig();

      await streamCompanionResponse(
        supabaseUrl,
        supabaseAnonKey,
        { userId: null, message, conversationHistory: history, contextMode: currentMode, bibleContext },
        {
          onMeta: ({ sources, suggestedActions }) => {
            updateMessage(assistantMessageId, { sources: sources as VerseSource[], suggestedActions });
          },
          onContent: (_chunk, fullContent) => {
            updateMessage(assistantMessageId, { content: fullContent });
          },
          onDone: (fullResponse) => {
            updateMessage(assistantMessageId, { content: fullResponse });
            if (!isRetry) incrementUsage();
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            setIsQuerying(false);
            abortControllerRef.current = null;
          },
          onError: (errorMsg) => {
            updateMessage(assistantMessageId, {
              content: `I\u2019m having trouble connecting right now. ${errorMsg}\n\nTap "Try again" below to retry.`,
              suggestedActions: [{ label: 'Try again', prompt: message, icon: 'refresh-outline' }],
            });
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            setIsQuerying(false);
            abortControllerRef.current = null;
          },
          onRetry: (_attempt) => {
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
          content: 'The companion is still warming up \u2014 this sometimes happens after periods of inactivity. Tap below to try again; it usually works on the second attempt.',
          suggestedActions: [{ label: 'Try again', prompt: message, icon: 'refresh-outline' }],
        });
        setIsQuerying(false);
        abortControllerRef.current = null;
        return;
      }
      const errorDetails = error instanceof Error ? error.message : String(error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      updateMessage(assistantMessageId, {
        content: `I\u2019m having trouble connecting right now. ${errorDetails}\n\nTap "Try again" below to retry.`,
        suggestedActions: [{ label: 'Try again', prompt: message, icon: 'refresh-outline' }],
      });
      setIsQuerying(false);
      abortControllerRef.current = null;
    }
  }, [canUseChat, showPaywall, currentMode, addMessage, setIsQuerying, messages, chatContext, updateMessage, incrementUsage]);

  useEffect(() => { handleSendRef.current = handleSend; }, [handleSend]);

  // ==================== SECONDARY HANDLERS ====================

  const handleContextPromptTap = () => {
    const initialMessage = generateInitialMessage(chatContext);
    if (initialMessage) {
      setInputText(initialMessage);
      (inputRef.current as unknown as { focus: () => void })?.focus();
    }
  };

  const getLastAssistantContext = () => {
    const last = messages.filter(m => m.role === 'assistant').pop();
    return { sources: last?.sources || [], content: last?.content || '' };
  };

  const handleJournalPress = () => {
    setChatSheetOpen(false);
    const { sources, content } = getLastAssistantContext();
    const firstSource = sources[0];
    navigation.navigate('JournalCompose', {
      initialPrompt: content ? 'Reflection:\n\n' : '',
      initialVerse: firstSource ? {
        book: firstSource.book, chapter: firstSource.chapter,
        verse: firstSource.verse, text: firstSource.text, translation: firstSource.translation,
      } : undefined,
      source: { type: 'ai_prompt' },
    });
  };

  const handlePrayPress = () => {
    setChatSheetOpen(false);
    const { sources } = getLastAssistantContext();
    const firstSource = sources[0];
    navigation.navigate('JournalCompose', {
      initialPrompt: 'Dear Lord,\n\n',
      initialVerse: firstSource ? {
        book: firstSource.book, chapter: firstSource.chapter,
        verse: firstSource.verse, text: firstSource.text, translation: firstSource.translation,
      } : undefined,
      source: { type: 'ai_prompt' },
    });
  };

  const handleVersePress = (_verse: VerseSource) => {
    // TODO: navigate to verse
  };

  const handleSuggestedActionPress = useCallback((action: SuggestedAction) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const isRetryAction = action.label.toLowerCase() === 'try again' || action.icon === 'refresh-outline';
    const isPrayerAction = action.label.toLowerCase().includes('pray') || action.prompt.toLowerCase().includes('pray');
    if (isPrayerAction && currentMode !== 'prayer') setCurrentMode('prayer');
    handleSend(action.prompt, isRetryAction);
  }, [handleSend, currentMode, setCurrentMode]);

  const handleModeSelect = useCallback((mode: ChatMode) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (!canUseChatMode(mode)) { showPaywall(); setShowModeSelector(false); return; }
    setCurrentMode(mode);
    setShowModeSelector(false);

    if (messages.length === 0) {
      const modeWelcomes: Partial<Record<ChatMode, { content: string; actions: SuggestedAction[] }>> = {
        prayer: {
          content: "I\u2019m here to guide you in prayer. You can share what\u2019s on your heart, ask for Scripture to pray over a situation, or let me lead you through ACTS prayer (Adoration, Confession, Thanksgiving, Supplication).\n\nWhat would you like to bring before the Lord today?",
          actions: [
            { label: 'ACTS Prayer', prompt: 'Guide me through ACTS prayer', icon: 'list-outline' },
            { label: 'Scripture to pray', prompt: 'Give me a Scripture to pray over my situation', icon: 'book-outline' },
            { label: 'Pray for peace', prompt: 'Help me pray for peace in my anxious heart', icon: 'heart-outline' },
          ],
        },
        lectio: {
          content: "Welcome to Lectio Divina, an ancient practice of prayerful Scripture reading. I\u2019ll guide you through four movements: Reading, Meditation, Prayer, and Contemplation.\n\nWould you like to begin, or do you have a specific passage in mind?",
          actions: [
            { label: 'Begin Lectio', prompt: 'Guide me through Lectio Divina', icon: 'book-outline' },
            { label: 'Choose passage', prompt: 'I have a specific passage I want to pray with', icon: 'search-outline' },
          ],
        },
        examen: {
          content: "Welcome to the Evening Examen, a practice of reflecting on your day with God. I\u2019ll help you notice where God was present and where you might have missed Him.\n\nAre you ready to begin?",
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
          content: "This is a safe space for heart examination. As Psalm 139:23-24 says, \u201CSearch me, O God, and know my heart.\u201D\n\nTake a moment. What\u2019s weighing on your heart?",
          actions: [
            { label: 'Heart check', prompt: 'Help me examine my heart with Psalm 139', icon: 'heart-outline' },
            { label: 'Confess', prompt: 'I need to confess something to God', icon: 'chatbubble-outline' },
          ],
        },
        gratitude: {
          content: "Let\u2019s focus on gratitude! \u201CIn everything give thanks\u201D (1 Thessalonians 5:18).\n\nWhat blessings\u2014big or small\u2014are you noticing today?",
          actions: [
            { label: 'Share blessing', prompt: "I want to share something I'm grateful for", icon: 'gift-outline' },
            { label: 'Help me notice', prompt: 'Help me recognize blessings I might be overlooking', icon: 'eye-outline' },
          ],
        },
      };
      const welcome = modeWelcomes[mode];
      if (welcome) {
        addMessage({
          id: Date.now().toString(),
          role: 'assistant',
          content: welcome.content,
          timestamp: new Date(),
          mode,
          suggestedActions: welcome.actions,
        });
      }
    }
  }, [canUseChatMode, showPaywall, setCurrentMode, messages.length, addMessage]);

  const handlePrayerModeToggle = useCallback(() => {
    handleModeSelect(currentMode === 'prayer' ? 'auto' : 'prayer');
  }, [currentMode, handleModeSelect]);

  const handleModeSelectorToggle = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowModeSelector(prev => !prev);
  }, []);

  const handleShareConversation = useCallback(async () => {
    if (messages.length === 0) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      if (viewShotRef.current) {
        const uri = await captureRef(viewShotRef, { format: 'png', quality: 1 });
        if (uri && await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(uri, { mimeType: 'image/png', dialogTitle: 'Share this Scripture conversation' });
          return;
        }
      }
    } catch (_e) { /* fall through to text share */ }
    try {
      const text = messages.map((m) => {
        const role = m.role === 'user' ? 'You' : 'Companion';
        let t = `${role}: ${m.content}`;
        if (m.sources?.length) t += `\n\uD83D\uDCD6 ${m.sources.map(s => `${s.book} ${s.chapter}:${s.verse}`).join(', ')}`;
        return t;
      }).join('\n\n---\n\n');
      await Share.share({ message: `${text}\n\n\u271D\uFE0F Shared from ChooseGOD` });
    } catch (_e) {
      Alert.alert('Share Failed', 'Unable to share this conversation.');
    }
  }, [messages]);

  // ==================== RENDER ====================

  const contextPrompt = generateContextPrompt(chatContext);

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
      enableHandlePanningGesture
      enableContentPanningGesture
    >
      <ChatHeader
        currentMode={currentMode}
        isPremium={isPremium}
        seedsRemaining={seedsRemaining}
        totalSeeds={totalSeeds}
        hasMessages={hasMessages}
        showModeSelector={showModeSelector}
        onShareConversation={handleShareConversation}
        onModeSelectorToggle={handleModeSelectorToggle}
        onPrayerModeToggle={handlePrayerModeToggle}
        onClearMessages={clearMessages}
        onClose={handleClose}
        onShowPaywall={showPaywall}
      />

      {showModeSelector && (
        <ChatModeSelector
          currentMode={currentMode}
          isPremium={isPremium}
          onModeSelect={handleModeSelect}
          onClose={() => setShowModeSelector(false)}
        />
      )}

      {/* Context Banner */}
      {chatContext.screenType === 'home' && dailyVerse ? (
        <TouchableOpacity
          style={styles.dailyVerseBanner}
          onPress={() => handleSend(`Help me reflect on today's verse: ${dailyVerse.verse.book} ${dailyVerse.verse.chapter}:${dailyVerse.verse.verse}`)}
          activeOpacity={0.7}
        >
          <View style={styles.dailyVerseHeader}>
            <Ionicons name="sunny" size={16} color={theme.colors.accent} />
            <Text style={styles.dailyVerseLabel}>{"Today\u2019s Verse"}</Text>
          </View>
          <Text style={styles.dailyVerseText} numberOfLines={2}>
            {`\u201C${dailyVerse.verse.text}\u201D`}
          </Text>
          <Text style={styles.dailyVerseRef}>
            {`\u2014 ${dailyVerse.verse.book} ${dailyVerse.verse.chapter}:${dailyVerse.verse.verse}`}
          </Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity style={styles.contextBanner} onPress={handleContextPromptTap} activeOpacity={0.7}>
          <Ionicons
            name={chatContext.screenType === 'bible' ? 'book' : isPrayerMode ? 'hand-left' : 'sparkles'}
            size={16}
            color={isPrayerMode ? theme.colors.prayer : theme.colors.primary}
          />
          <Text style={styles.contextText} numberOfLines={1}>
            {isPrayerMode ? "Share what\u2019s on your heart..." : contextPrompt}
          </Text>
          <Ionicons name="arrow-forward" size={14} color={theme.colors.textMuted} />
        </TouchableOpacity>
      )}

      <ChatMessageList
        flashListRef={flashListRef}
        viewShotRef={viewShotRef}
        messages={messages}
        isQuerying={isQuerying}
        isPrayerMode={isPrayerMode}
        hasMessages={hasMessages}
        hasDailyVerse={!!dailyVerse}
        screenType={chatContext.screenType || ''}
        onVersePress={handleVersePress}
        onActionPress={handleSuggestedActionPress}
        onJournalPress={handleJournalPress}
        onPrayPress={handlePrayPress}
      />

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

      <ChatInputArea
        inputRef={inputRef}
        inputText={inputText}
        onChangeText={setInputText}
        isQuerying={isQuerying}
        isListening={isListening}
        isVoiceAvailable={isVoiceAvailable}
        onSend={() => handleSend(inputText)}
        onStop={handleStop}
        onStartListening={startListening}
        onStopListening={stopListening}
        bottomInset={insets.bottom}
      />

      {/* Celebration overlay */}
      {showCelebration && (
        <Animated.View
          style={[
            styles.celebrationOverlay,
            {
              opacity: celebrationAnim,
              transform: [{
                scale: celebrationAnim.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1] }),
              }],
            },
          ]}
        >
          <Text style={styles.celebrationEmoji}>{'\uD83C\uDF89'}</Text>
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
