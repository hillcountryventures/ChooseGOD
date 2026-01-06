/**
 * FloatingAskBar - Floating text input for quick chat access
 *
 * A floating input bar at the bottom of the screen that allows users to:
 * - Type directly without opening the full sheet first
 * - Expand to see full chat history
 * - Quick access to pray/journal modes
 */

import React, { useState, useRef } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Keyboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../lib/theme';
import { useStore } from '../../store/useStore';
import { ChatMessage } from '../../types';
import { supabase } from '../../lib/supabase';
import { EDGE_FUNCTIONS } from '../../constants/database';

export function FloatingAskBar() {
  const inputRef = useRef<TextInput>(null);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);

  const setChatSheetOpen = useStore((state) => state.setChatSheetOpen);
  const addMessage = useStore((state) => state.addMessage);
  const setIsQuerying = useStore((state) => state.setIsQuerying);
  const currentMode = useStore((state) => state.currentMode);
  const messages = useStore((state) => state.messages);

  const handleExpand = () => {
    Keyboard.dismiss();
    setChatSheetOpen(true);
  };

  const handleSend = async () => {
    if (!inputText.trim() || isSending) return;

    const message = inputText.trim();
    setInputText('');
    setIsSending(true);
    setIsQuerying(true);
    Keyboard.dismiss();

    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: message,
      timestamp: new Date(),
      mode: currentMode,
    };
    addMessage(userMessage);

    // Open sheet to show conversation
    setChatSheetOpen(true);

    try {
      // Prepare conversation history
      const history = messages.slice(-10).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const { data, error } = await supabase.functions.invoke(EDGE_FUNCTIONS.companion, {
        body: {
          user_id: null,
          message,
          conversation_history: history,
          context_mode: currentMode,
        },
      });

      if (error) {
        throw new Error(error.message || String(error));
      }

      if (!data) {
        throw new Error('No data received from the server');
      }

      // Add assistant response
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response || 'No response received',
        sources: data.sources,
        timestamp: new Date(),
        mode: currentMode,
        toolsUsed: data.toolsUsed,
        celebration: data.celebration,
        suggestedActions: data.suggestedActions,
      };
      addMessage(assistantMessage);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `I'm having trouble connecting right now. Please try again.`,
        timestamp: new Date(),
      };
      addMessage(errorMessage);
    } finally {
      setIsSending(false);
      setIsQuerying(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Main input bar */}
      <View style={styles.inputBar}>
        <TouchableOpacity
          style={styles.expandButton}
          onPress={handleExpand}
          activeOpacity={0.7}
        >
          <Ionicons name="chatbubbles" size={18} color={theme.colors.primary} />
        </TouchableOpacity>

        <TextInput
          ref={inputRef}
          style={styles.input}
          placeholder="Ask anything..."
          placeholderTextColor={theme.colors.textMuted}
          value={inputText}
          onChangeText={setInputText}
          onSubmitEditing={handleSend}
          returnKeyType="send"
          blurOnSubmit={false}
          editable={!isSending}
        />

        <TouchableOpacity
          style={[
            styles.sendButton,
            (!inputText.trim() || isSending) && styles.sendButtonDisabled,
          ]}
          onPress={handleSend}
          disabled={!inputText.trim() || isSending}
          activeOpacity={0.7}
        >
          <Ionicons
            name={isSending ? 'hourglass' : 'send'}
            size={18}
            color={inputText.trim() && !isSending ? '#fff' : theme.colors.textMuted}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 65, // Above the tab bar
    left: 0,
    right: 0,
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.full,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.md,
  },
  expandButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.primaryAlpha[15],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    paddingVertical: theme.spacing.sm,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: theme.spacing.sm,
  },
  sendButtonDisabled: {
    backgroundColor: theme.colors.surface,
  },
});
