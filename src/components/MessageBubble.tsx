import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { theme } from '../lib/theme';
import { ChatMessage, VerseSource } from '../types';
import { VerseCard } from './VerseCard';

interface MessageBubbleProps {
  message: ChatMessage;
  onVersePress?: (verse: VerseSource) => void;
}

export function MessageBubble({ message, onVersePress }: MessageBubbleProps) {
  const isUser = message.role === 'user';

  return (
    <View style={[styles.container, isUser ? styles.userContainer : styles.assistantContainer]}>
      <View style={[styles.bubble, isUser ? styles.userBubble : styles.assistantBubble]}>
        <Text style={[styles.messageText, isUser && styles.userMessageText]}>
          {message.content}
        </Text>
      </View>

      {/* Source verses for assistant messages */}
      {!isUser && message.sources && message.sources.length > 0 && (
        <View style={styles.sourcesContainer}>
          <Text style={styles.sourcesLabel}>Scripture References:</Text>
          {message.sources.map((source, index) => (
            <TouchableOpacity
              key={`${source.book}-${source.chapter}-${source.verse}-${index}`}
              onPress={() => onVersePress?.(source)}
              activeOpacity={0.7}
            >
              <VerseCard verse={source} compact />
            </TouchableOpacity>
          ))}
        </View>
      )}

      <Text style={[styles.timestamp, isUser && styles.userTimestamp]}>
        {formatTime(message.timestamp)}
      </Text>
    </View>
  );
}

function formatTime(date: Date): string {
  const d = date instanceof Date ? date : new Date(date);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

const styles = StyleSheet.create({
  container: {
    marginVertical: theme.spacing.xs,
    maxWidth: '85%',
  },
  userContainer: {
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
  },
  assistantContainer: {
    alignSelf: 'flex-start',
    alignItems: 'flex-start',
  },
  bubble: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm + 2,
    borderRadius: theme.borderRadius.lg,
  },
  userBubble: {
    backgroundColor: theme.colors.userBubble,
    borderBottomRightRadius: theme.borderRadius.sm,
  },
  assistantBubble: {
    backgroundColor: theme.colors.assistantBubble,
    borderBottomLeftRadius: theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  messageText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    lineHeight: theme.fontSize.md * 1.5,
  },
  userMessageText: {
    color: theme.colors.text,
  },
  timestamp: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textMuted,
    marginTop: theme.spacing.xs,
    marginHorizontal: theme.spacing.xs,
  },
  userTimestamp: {
    color: theme.colors.textMuted,
  },
  sourcesContainer: {
    marginTop: theme.spacing.sm,
    width: '100%',
  },
  sourcesLabel: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
    fontWeight: theme.fontWeight.medium,
  },
});
