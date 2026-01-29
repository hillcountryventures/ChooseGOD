/**
 * ChatBottomSheet - Orchestrator component
 *
 * Delegates rendering to sub-components:
 * - ChatHeader: header bar with mode/premium info
 * - ChatMessageList: messages, empty state, reflection prompts
 * - ChatInputArea: text input, voice, send button
 * - ChatModeSelector: spiritual practice mode picker
 * - ChatContextBanner: context-aware prompt banner
 * - VoiceListeningBanner: voice recording indicator
 * - CelebrationOverlay: animated celebration popup
 */
import React, { useCallback, useMemo, useRef, useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  Keyboard,
  Animated,
  Platform,
  Share,
  Alert,
} from 'react-native';
import BottomSheet, {
  BottomSheetBackdrop,
} from '@gorhom/bottom-sheet';
import { FlashListRef } from '@shopify/flash-list';
import { BlurView } from 'expo-blur';
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
import { modeWelcomes } from './modeWelcomes';

// Sub-components
import { ChatHeader } from './ChatHeader';
import { ChatInputArea } from './ChatInputArea';
import { ChatMessageList } from './ChatMessageList';
import { ChatModeSelector } from './ChatModeSelector';
import { ChatContextBanner } from './ChatContextBanner';
import { VoiceListeningBanner } from './VoiceListeningBanner';
import { CelebrationOverlay } from './CelebrationOverlay';

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
      setTimeout(() => flashListRef.current?.scrollToEnd({ animated: true }), 100);
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
    (props: Record<string, unknown>) => (
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

  const handleContextPromptTap = useCallback(() => {
    const initialMessage = generateInitialMessage(chatContext);
    if (initialMessage) {
      setInputText(initialMessage);
      (inputRef.current as unknown as { focus: () => void })?.focus();
    }
  }, [chatContext]);

  const handleDailyVerseTap = useCallback(() => {
    if (dailyVerse) {
      handleSend(`Help me reflect on today's verse: ${dailyVerse.verse.book} ${dailyVerse.verse.chapter}:${dailyVerse.verse.verse}`);
    }
  }, [dailyVerse, handleSend]);

  const getLastAssistantContext = useCallback(() => {
    const last = messages.filter(m => m.role === 'assistant').pop();
    return { sources: last?.sources || [], content: last?.content || '' };
  }, [messages]);

  const handleJournalPress = useCallback(() => {
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
  }, [setChatSheetOpen, getLastAssistantContext, navigation]);

  const handlePrayPress = useCallback(() => {
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
  }, [setChatSheetOpen, getLastAssistantContext, navigation]);

  const handleVersePress = useCallback((_verse: VerseSource) => {
    // TODO: navigate to verse
  }, []);

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

      <ChatContextBanner
        screenType={chatContext.screenType || ''}
        dailyVerse={dailyVerse}
        isPrayerMode={isPrayerMode}
        contextPrompt={contextPrompt}
        onDailyVerseTap={handleDailyVerseTap}
        onContextPromptTap={handleContextPromptTap}
      />

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

      {isListening && <VoiceListeningBanner onCancel={cancelListening} />}

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

      {showCelebration && (
        <CelebrationOverlay message={celebrationMessage} animValue={celebrationAnim} />
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
});
