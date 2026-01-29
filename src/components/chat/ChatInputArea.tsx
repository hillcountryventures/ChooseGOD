/**
 * ChatInputArea - Input bar for ChatBottomSheet
 * Extracted from ChatBottomSheet for maintainability.
 */
import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { BottomSheetTextInput } from '@gorhom/bottom-sheet';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../lib/theme';

interface ChatInputAreaProps {
  inputRef: React.RefObject<any>;
  inputText: string;
  onChangeText: (text: string) => void;
  isQuerying: boolean;
  isListening: boolean;
  isVoiceAvailable: boolean;
  onSend: () => void;
  onStop: () => void;
  onStartListening: () => void;
  onStopListening: () => void;
  bottomInset: number;
}

export function ChatInputArea({
  inputRef,
  inputText,
  onChangeText,
  isQuerying,
  isListening,
  isVoiceAvailable,
  onSend,
  onStop,
  onStartListening,
  onStopListening,
  bottomInset,
}: ChatInputAreaProps) {
  const canInteract = inputText.trim() || isQuerying || isListening;

  return (
    <View style={[styles.inputContainer, { paddingBottom: Math.max(bottomInset, 12) }]}>
      {isVoiceAvailable && !isQuerying && (
        <TouchableOpacity
          style={[styles.voiceButton, isListening && styles.voiceButtonActive]}
          onPress={isListening ? onStopListening : onStartListening}
          activeOpacity={0.7}
          accessibilityLabel={isListening ? 'Stop voice input' : 'Start voice input'}
          accessibilityRole="button"
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
        onChangeText={onChangeText}
        multiline
        maxLength={1000}
        editable={!isListening}
        accessibilityLabel="Chat message input"
        accessibilityHint="Type your question or reflection"
      />

      <TouchableOpacity
        style={[styles.sendButton, !canInteract && styles.sendButtonDisabled]}
        accessibilityLabel={isQuerying ? 'Stop generating' : isListening ? 'Finish voice input' : 'Send message'}
        accessibilityRole="button"
        accessibilityState={{ disabled: !canInteract }}
        onPress={() => {
          if (isListening) {
            onStopListening();
          } else if (isQuerying) {
            onStop();
          } else {
            onSend();
          }
        }}
        disabled={!canInteract}
      >
        <Ionicons
          name={isQuerying ? 'stop' : isListening ? 'checkmark' : 'send'}
          size={20}
          color={canInteract ? '#fff' : theme.colors.textMuted}
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
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
});
