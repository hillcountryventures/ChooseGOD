import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, RouteProp } from '@react-navigation/native';
import { theme } from '../lib/theme';
import { useStore } from '../store/useStore';
import { ChatInput } from '../components/ChatInput';
import { MessageBubble } from '../components/MessageBubble';
import { SuggestedQuestions } from '../components/SuggestedQuestions';
import {
  ChatMessage,
  ChatMode,
  VerseSource,
  SuggestedAction,
  BottomTabParamList,
} from '../types';
import { supabase } from '../lib/supabase';

type ChatScreenRouteProp = RouteProp<BottomTabParamList, 'Ask'>;

const MODE_CONFIG: Record<ChatMode, { label: string; icon: string; color: string }> = {
  auto: { label: 'Ask Anything', icon: 'chatbubbles', color: theme.colors.primary },
  devotional: { label: 'Morning Devotional', icon: 'sunny', color: theme.colors.accent },
  prayer: { label: 'Prayer Companion', icon: 'heart', color: '#EF4444' },
  journal: { label: 'Journal', icon: 'book', color: theme.colors.primary },
  lectio: { label: 'Lectio Divina', icon: 'leaf', color: '#22C55E' },
  examen: { label: 'Evening Examen', icon: 'moon', color: '#8B5CF6' },
  memory: { label: 'Scripture Memory', icon: 'bulb', color: theme.colors.accent },
  confession: { label: 'Heart Check', icon: 'water', color: '#3B82F6' },
  gratitude: { label: 'Gratitude', icon: 'sparkles', color: '#F59E0B' },
  celebration: { label: 'Celebration', icon: 'trophy', color: '#22C55E' },
};

export default function ChatScreen() {
  const route = useRoute<ChatScreenRouteProp>();
  const flatListRef = useRef<FlatList>(null);
  const celebrationAnim = useRef(new Animated.Value(0)).current;
  const abortControllerRef = useRef<AbortController | null>(null);

  // Get mode from route params or default to auto
  const initialMode = route.params?.mode || 'auto';
  const initialMessage = route.params?.initialMessage;

  // Store state
  const messages = useStore((state) => state.messages);
  const isQuerying = useStore((state) => state.isQuerying);
  const currentMode = useStore((state) => state.currentMode);
  const addMessage = useStore((state) => state.addMessage);
  const setIsQuerying = useStore((state) => state.setIsQuerying);
  const setCurrentMode = useStore((state) => state.setCurrentMode);
  const clearMessages = useStore((state) => state.clearMessages);

  // Local state
  const [suggestedActions, setSuggestedActions] = useState<SuggestedAction[]>([]);
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationMessage, setCelebrationMessage] = useState('');

  // Set initial mode when screen loads
  useEffect(() => {
    if (initialMode !== currentMode) {
      setCurrentMode(initialMode);
    }
    // Send initial message if provided
    if (initialMessage) {
      handleSend(initialMessage);
    }
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  // Trigger celebration animation
  const triggerCelebration = useCallback((message: string) => {
    setCelebrationMessage(message);
    setShowCelebration(true);
    Animated.sequence([
      Animated.timing(celebrationAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.delay(2000),
      Animated.timing(celebrationAnim, {
        toValue: 0,
        duration: 300,
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
    // Cancel any existing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller for this request
    abortControllerRef.current = new AbortController();

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
    setSuggestedActions([]);

    try {
      // Prepare conversation history (last 10 messages)
      const history = messages.slice(-10).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      // Call the companion API
      console.log('Calling companion function with:', {
        message,
        context_mode: currentMode,
        history_length: history.length,
      });

      const { data, error } = await supabase.functions.invoke('companion', {
        body: {
          user_id: null, // TODO: Add user authentication
          message,
          conversation_history: history,
          context_mode: currentMode,
        },
      });

      console.log('Response received:', { data, error });

      if (error) {
        console.error('Supabase function error:', error);
        throw new Error(
          error.message ||
          (typeof error === 'object' ? JSON.stringify(error) : String(error))
        );
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

      // Handle celebration
      if (data.celebration) {
        triggerCelebration(data.celebration.message);
      }

      // Set suggested actions
      if (data.suggestedActions) {
        setSuggestedActions(data.suggestedActions);
      }
    } catch (error) {
      // Check if this was an abort
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('Request was cancelled');
        return;
      }

      console.error('Error sending message:', error);

      // Build helpful error message
      const errorDetails = error instanceof Error ? error.message : String(error);
      let helpText = "I'm having trouble connecting right now.";

      if (errorDetails.includes('FunctionsFetch')) {
        helpText += '\n\n📡 Edge Function may not be deployed. Run:\nsupabase functions deploy companion';
      } else if (errorDetails.includes('Missing') || errorDetails.includes('env')) {
        helpText += '\n\n🔑 Missing environment variables. Set secrets with:\nsupabase secrets set OPENAI_API_KEY=sk-...\nsupabase secrets set SUPABASE_SERVICE_ROLE_KEY=eyJ...';
      } else if (errorDetails.includes('match_verses')) {
        helpText += '\n\n📖 Database function missing. Create match_verses RPC in Supabase SQL Editor.';
      }

      // Add error message
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `${helpText}\n\nError: ${errorDetails}`,
        timestamp: new Date(),
      };
      addMessage(errorMessage);
    } finally {
      abortControllerRef.current = null;
      setIsQuerying(false);
    }
  };

  const handleQuestionPress = (question: string) => {
    handleSend(question);
  };

  const handleVersePress = (verse: VerseSource) => {
    // TODO: Navigate to verse detail or Bible reader
    console.log('Verse pressed:', verse);
  };

  const handleActionPress = (action: SuggestedAction) => {
    handleSend(action.prompt);
  };

  const renderMessage = ({ item }: { item: ChatMessage }) => (
    <MessageBubble message={item} onVersePress={handleVersePress} />
  );

  const renderHeader = () => {
    if (messages.length > 0) return null;

    return (
      <View style={styles.welcomeContainer}>
        <View style={styles.modeIndicator}>
          <Ionicons
            name={MODE_CONFIG[currentMode].icon as keyof typeof Ionicons.glyphMap}
            size={32}
            color={MODE_CONFIG[currentMode].color}
          />
          <Text style={styles.modeTitle}>{MODE_CONFIG[currentMode].label}</Text>
        </View>
        <Text style={styles.welcomeText}>
          {getWelcomeText(currentMode)}
        </Text>
        <SuggestedQuestions onQuestionPress={handleQuestionPress} />
      </View>
    );
  };

  const modeConfig = MODE_CONFIG[currentMode];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.modeButton}
          onPress={() => {
            // TODO: Show mode picker modal
          }}
        >
          <Ionicons
            name={modeConfig.icon as keyof typeof Ionicons.glyphMap}
            size={20}
            color={modeConfig.color}
          />
          <Text style={[styles.modeButtonText, { color: modeConfig.color }]}>
            {modeConfig.label}
          </Text>
          <Ionicons name="chevron-down" size={16} color={theme.colors.textMuted} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.clearButton}
          onPress={() => {
            clearMessages();
            setSuggestedActions([]);
          }}
        >
          <Ionicons name="refresh" size={20} color={theme.colors.textMuted} />
        </TouchableOpacity>
      </View>

      {/* Messages */}
      <KeyboardAvoidingView
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={90}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messagesList}
          ListHeaderComponent={renderHeader}
          showsVerticalScrollIndicator={false}
        />

        {/* Typing indicator */}
        {isQuerying && (
          <View style={styles.typingContainer}>
            <ActivityIndicator size="small" color={theme.colors.primary} />
            <Text style={styles.typingText}>Thinking...</Text>
          </View>
        )}

        {/* Suggested actions */}
        {suggestedActions.length > 0 && !isQuerying && (
          <View style={styles.actionsContainer}>
            {suggestedActions.map((action, index) => (
              <TouchableOpacity
                key={index}
                style={styles.actionButton}
                onPress={() => handleActionPress(action)}
              >
                <Text style={styles.actionButtonText}>{action.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Input */}
        <ChatInput
          onSend={handleSend}
          onStop={handleStop}
          isLoading={isQuerying}
          placeholder={getPlaceholder(currentMode)}
        />
      </KeyboardAvoidingView>

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
    </SafeAreaView>
  );
}

function getWelcomeText(mode: ChatMode): string {
  const texts: Record<ChatMode, string> = {
    auto: "Ask me anything about Scripture, share what's on your heart, or let me guide you through a spiritual practice.",
    devotional: "Let's begin your morning encounter with God's Word. I'll share a passage and help you meditate on it.",
    prayer: "I'm here to pray with you. Share what's on your heart, and I'll help you bring it to God.",
    journal: "Share what's on your mind. I'll listen, reflect, and help you process through Scripture.",
    lectio: "Let's practice Lectio Divina together. I'll guide you through reading, meditating, praying, and contemplating Scripture.",
    examen: "Let's reflect on your day together. Where did you see God? What brought you joy or struggle?",
    memory: "I'll help you memorize Scripture with mnemonics, stories, and practice. Which verse would you like to learn?",
    confession: "This is a safe space to examine your heart. I'll guide you gently, always pointing to God's grace.",
    gratitude: "Let's count your blessings together. What are you thankful for today?",
    celebration: "I want to celebrate with you! Tell me what God has done.",
  };
  return texts[mode];
}

function getPlaceholder(mode: ChatMode): string {
  const placeholders: Record<ChatMode, string> = {
    auto: 'Ask about Scripture...',
    devotional: "I'm ready for today's word...",
    prayer: 'What do you want to pray about?',
    journal: "What's on your heart today?",
    lectio: 'Share what stands out to you...',
    examen: 'Reflect on your day...',
    memory: 'Which verse to memorize?',
    confession: 'What do you need to share?',
    gratitude: "I'm thankful for...",
    celebration: 'Tell me what happened!',
  };
  return placeholders[mode];
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  modeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
  },
  modeButtonText: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.medium,
  },
  clearButton: {
    padding: theme.spacing.xs,
  },
  content: {
    flex: 1,
  },
  messagesList: {
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.md,
    flexGrow: 1,
  },
  welcomeContainer: {
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.lg,
  },
  modeIndicator: {
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  modeTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    marginTop: theme.spacing.sm,
  },
  welcomeText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: theme.spacing.lg,
    lineHeight: theme.fontSize.md * 1.5,
    marginBottom: theme.spacing.lg,
  },
  typingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
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
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    gap: theme.spacing.sm,
  },
  actionButton: {
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  actionButtonText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.primary,
    fontWeight: theme.fontWeight.medium,
  },
  celebrationOverlay: {
    position: 'absolute',
    top: '40%',
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
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
    textAlign: 'center',
  },
});
