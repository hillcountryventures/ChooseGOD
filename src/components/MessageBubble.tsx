/**
 * MessageBubble Component
 * Chat message display with tappable verse references
 *
 * Philosophy: "We are not God, only helping others find HIM"
 * Every verse reference in AI responses is tappable, pointing users to Scripture
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  Share,
  Clipboard,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../lib/theme';
import { ChatMessage, VerseSource, SuggestedAction } from '../types';
import { navigateToBibleVerse } from '../lib/navigationHelpers';
import { InlineVerseText } from './InlineVerseText';
import { ShareableVerseCard } from './ShareableVerseCard';

interface MessageBubbleProps {
  message: ChatMessage;
  onVersePress?: (verse: VerseSource) => void;
  onActionPress?: (action: SuggestedAction) => void;
  onSaveToJourney?: (message: ChatMessage) => void;
}

export function MessageBubble({
  message,
  onVersePress,
  onActionPress,
  onSaveToJourney,
}: MessageBubbleProps) {
  const navigation = useNavigation();
  const isUser = message.role === 'user';
  const [showActions, setShowActions] = useState(false);

  // Handle verse card tap - navigate to Bible
  const handleVerseCardPress = (verse: VerseSource) => {
    navigateToBibleVerse(navigation, verse.book, verse.chapter, verse.verse);
    if (onVersePress) {
      onVersePress(verse);
    }
  };

  // Handle long press - show action menu
  const handleLongPress = () => {
    setShowActions(true);
  };

  // Copy message to clipboard
  const handleCopy = () => {
    Clipboard.setString(message.content);
    setShowActions(false);
    Alert.alert('Copied', 'Message copied to clipboard');
  };

  // Share message
  const handleShare = async () => {
    setShowActions(false);
    try {
      let shareText = message.content;
      if (message.sources && message.sources.length > 0) {
        const refs = message.sources
          .map((s) => `${s.book} ${s.chapter}:${s.verse}`)
          .join(', ');
        shareText += `\n\n📖 ${refs}\n\nShared from ChooseGOD`;
      }
      await Share.share({ message: shareText });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  // Save to Journey
  const handleSaveToJourney = () => {
    setShowActions(false);
    if (onSaveToJourney) {
      onSaveToJourney(message);
    }
  };

  return (
    <View style={[styles.container, isUser ? styles.userContainer : styles.assistantContainer]}>
      {/* Main bubble with long-press handler */}
      <Pressable
        onLongPress={!isUser ? handleLongPress : undefined}
        delayLongPress={500}
        style={[styles.bubble, isUser ? styles.userBubble : styles.assistantBubble]}
      >
        {/* Message content with inline verse detection */}
        {isUser ? (
          <Text style={[styles.messageText, styles.userMessageText]}>
            {message.content}
          </Text>
        ) : (
          <InlineVerseText
            text={message.content}
            style={styles.messageText}
            verseStyle={styles.inlineVerse}
          />
        )}
      </Pressable>

      {/* Long-press action menu */}
      {showActions && !isUser && (
        <View style={styles.actionsMenu}>
          <TouchableOpacity style={styles.actionItem} onPress={handleCopy}>
            <Ionicons name="copy-outline" size={18} color={theme.colors.text} />
            <Text style={styles.actionText}>Copy</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionItem} onPress={handleShare}>
            <Ionicons name="share-outline" size={18} color={theme.colors.text} />
            <Text style={styles.actionText}>Share</Text>
          </TouchableOpacity>
          {onSaveToJourney && (
            <TouchableOpacity style={styles.actionItem} onPress={handleSaveToJourney}>
              <Ionicons name="bookmark-outline" size={18} color={theme.colors.text} />
              <Text style={styles.actionText}>Save</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[styles.actionItem, styles.actionItemLast]}
            onPress={() => setShowActions(false)}
          >
            <Ionicons name="close" size={18} color={theme.colors.textMuted} />
            <Text style={[styles.actionText, { color: theme.colors.textMuted }]}>Cancel</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Beautiful shareable verse cards */}
      {!isUser && message.sources && message.sources.length > 0 && (
        <View style={styles.sourcesContainer}>
          <Text style={styles.sourcesLabel}>Referenced Scripture:</Text>
          {message.sources.slice(0, 3).map((source, index) => (
            <ShareableVerseCard
              key={`${source.book}-${source.chapter}-${source.verse}-${index}`}
              source={source}
              onPress={() => handleVerseCardPress(source)}
              compact={message.sources && message.sources.length > 1}
            />
          ))}
          {message.sources.length > 3 && (
            <Text style={styles.moreVersesText}>
              + {message.sources.length - 3} more verses
            </Text>
          )}
        </View>
      )}

      {/* Suggested actions */}
      {!isUser && message.suggestedActions && message.suggestedActions.length > 0 && (
        <View style={styles.suggestedActions}>
          {message.suggestedActions.map((action, index) => {
            // Check if this is a prayer-related action
            const isPrayerAction =
              action.label.toLowerCase().includes('pray') ||
              action.prompt.toLowerCase().includes('pray');

            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.suggestedAction,
                  isPrayerAction && styles.suggestedActionPrayer,
                ]}
                onPress={() => onActionPress?.(action)}
                activeOpacity={0.7}
              >
                {isPrayerAction ? (
                  <Text style={styles.prayerEmoji}>🙏</Text>
                ) : action.icon ? (
                  <Ionicons
                    name={action.icon as keyof typeof Ionicons.glyphMap}
                    size={14}
                    color={theme.colors.primary}
                  />
                ) : null}
                <Text
                  style={[
                    styles.suggestedActionText,
                    isPrayerAction && styles.suggestedActionTextPrayer,
                  ]}
                >
                  {action.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      {/* Timestamp */}
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
  inlineVerse: {
    color: theme.colors.primary,
    fontWeight: theme.fontWeight.medium,
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

  // Long-press actions menu
  actionsMenu: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    marginTop: theme.spacing.xs,
    borderWidth: 1,
    borderColor: theme.colors.border,
    overflow: 'hidden',
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    gap: theme.spacing.xs,
    borderRightWidth: 1,
    borderRightColor: theme.colors.border,
  },
  actionItemLast: {
    borderRightWidth: 0,
  },
  actionText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text,
    fontWeight: theme.fontWeight.medium,
  },

  // Verse source cards
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
  moreVersesText: {
    textAlign: 'center',
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.sm,
    marginTop: theme.spacing.sm,
    fontStyle: 'italic',
  },

  // Suggested actions
  suggestedActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.xs,
    marginTop: theme.spacing.sm,
  },
  suggestedAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
    backgroundColor: theme.colors.primary + '20',
    borderRadius: theme.borderRadius.full,
  },
  suggestedActionText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.primary,
    fontWeight: theme.fontWeight.medium,
  },
  // Prayer action special styles
  suggestedActionPrayer: {
    backgroundColor: theme.colors.prayer + '20',
    borderWidth: 1,
    borderColor: theme.colors.prayer + '40',
  },
  prayerEmoji: {
    fontSize: 14,
  },
  suggestedActionTextPrayer: {
    color: theme.colors.prayer,
    fontWeight: '600',
  },
});

export default MessageBubble;
