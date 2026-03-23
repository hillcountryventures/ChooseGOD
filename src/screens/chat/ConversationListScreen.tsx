/**
 * ConversationListScreen - View past chat conversations
 *
 * Features:
 * - List of saved conversations with preview
 * - Tap to resume conversation
 * - Swipe to delete
 * - Premium badge for unlimited history
 */

import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FlashList, SwipeableRow } from '@shopify/flash-list';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Haptics from 'expo-haptics';

import { theme } from '../../lib/theme';
import { RootStackParamList } from '../../types';
import { useChatHistoryStore, SavedConversation } from '../../store/chatHistoryStore';
import { useStore } from '../../store/useStore';
import { usePremiumStatus } from '../../hooks/usePremiumStatus';
import { useTrackScreen } from '../../hooks/useAnalytics';
import { getModeName } from '../../components/chat/ChatModeSelector';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function ConversationListScreen() {
  useTrackScreen('conversation_list');
  const navigation = useNavigation<NavigationProp>();
  const { isPremium } = usePremiumStatus();
  
  const conversations = useChatHistoryStore((s) => s.conversations);
  const loadConversation = useChatHistoryStore((s) => s.loadConversation);
  const deleteConversation = useChatHistoryStore((s) => s.deleteConversation);
  const clearAllHistory = useChatHistoryStore((s) => s.clearAllHistory);
  const startNewConversation = useChatHistoryStore((s) => s.startNewConversation);
  
  // Main store to load messages
  const setMessages = useStore((s) => s.setMessages);
  const setCurrentMode = useStore((s) => s.setCurrentMode);

  const handleConversationPress = useCallback((conversation: SavedConversation) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    // Load conversation into main store
    const loaded = loadConversation(conversation.id);
    if (loaded) {
      setMessages(loaded.messages);
      setCurrentMode(loaded.mode);
      navigation.navigate('ChatHub', {});
    }
  }, [loadConversation, setMessages, setCurrentMode, navigation]);

  const handleNewChat = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    startNewConversation();
    setMessages([]);
    navigation.navigate('ChatHub', {});
  }, [startNewConversation, setMessages, navigation]);

  const handleDelete = useCallback((id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      'Delete Conversation',
      'This conversation will be permanently deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => deleteConversation(id),
        },
      ]
    );
  }, [deleteConversation]);

  const handleClearAll = useCallback(() => {
    if (conversations.length === 0) return;
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    Alert.alert(
      'Clear All History',
      `Delete all ${conversations.length} conversations? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear All', 
          style: 'destructive',
          onPress: clearAllHistory,
        },
      ]
    );
  }, [conversations.length, clearAllHistory]);

  const formatDate = (date: Date) => {
    const d = new Date(date);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) {
      return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    } else if (days === 1) {
      return 'Yesterday';
    } else if (days < 7) {
      return d.toLocaleDateString([], { weekday: 'short' });
    } else {
      return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const renderItem = useCallback(({ item }: { item: SavedConversation }) => (
    <TouchableOpacity
      style={styles.conversationCard}
      onPress={() => handleConversationPress(item)}
      onLongPress={() => handleDelete(item.id)}
      activeOpacity={0.7}
    >
      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
          <Text style={styles.date}>{formatDate(item.updatedAt)}</Text>
        </View>
        <Text style={styles.preview} numberOfLines={2}>{item.preview}</Text>
        <View style={styles.cardFooter}>
          <View style={styles.modeBadge}>
            <Text style={styles.modeText}>{getModeName(item.mode)}</Text>
          </View>
          <Text style={styles.messageCount}>
            {item.messageCount} messages
          </Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={18} color={theme.colors.textMuted} />
    </TouchableOpacity>
  ), [handleConversationPress, handleDelete]);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chat History</Text>
        <TouchableOpacity onPress={handleClearAll} style={styles.clearButton}>
          <Ionicons name="trash-outline" size={22} color={theme.colors.textMuted} />
        </TouchableOpacity>
      </View>

      {/* Premium badge */}
      {!isPremium && (
        <View style={styles.limitBanner}>
          <Ionicons name="information-circle-outline" size={18} color={theme.colors.warning} />
          <Text style={styles.limitText}>
            Free accounts keep last 10 conversations
          </Text>
        </View>
      )}

      {/* Conversation list */}
      {conversations.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="chatbubbles-outline" size={64} color={theme.colors.textMuted} />
          <Text style={styles.emptyTitle}>No conversations yet</Text>
          <Text style={styles.emptySubtext}>
            Your chats with 3+ messages will appear here
          </Text>
        </View>
      ) : (
        <FlashList
          data={conversations}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          estimatedItemSize={100}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* New chat FAB */}
      <TouchableOpacity style={styles.fab} onPress={handleNewChat}>
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  backButton: {
    padding: theme.spacing.xs,
  },
  headerTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
  },
  clearButton: {
    padding: theme.spacing.xs,
  },
  limitBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    backgroundColor: theme.colors.warningAlpha?.[10] || 'rgba(245, 158, 11, 0.1)',
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
  },
  limitText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.warning,
  },
  listContent: {
    padding: theme.spacing.md,
  },
  conversationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  cardContent: {
    flex: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  title: {
    flex: 1,
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
    marginRight: theme.spacing.sm,
  },
  date: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textMuted,
  },
  preview: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    lineHeight: 18,
    marginBottom: theme.spacing.sm,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modeBadge: {
    backgroundColor: theme.colors.primaryAlpha[15],
    paddingVertical: 2,
    paddingHorizontal: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
  },
  modeText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.primary,
    fontWeight: theme.fontWeight.medium,
  },
  messageCount: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textMuted,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
  },
  emptyTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.xs,
  },
  emptySubtext: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textMuted,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    bottom: theme.spacing.xl,
    right: theme.spacing.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
