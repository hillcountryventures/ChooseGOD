/**
 * chatHistoryStore - Persist and manage chat conversations
 *
 * Features:
 * - Auto-save conversations (5+ messages)
 * - Title generation from first user message
 * - Load/resume past conversations
 * - Delete conversations
 * - Premium: Unlimited history
 * - Free: Last 10 conversations
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ChatMessage, ChatMode } from '../types';
import { supabase } from '../lib/supabase';
import { useAuthStore } from './authStore';
import { logger } from '../utils/logger';

const STORAGE_KEY = 'choosegod-chat-history';
const FREE_HISTORY_LIMIT = 10;
const MIN_MESSAGES_TO_SAVE = 3; // Only save conversations with 3+ messages

// Cloud sync is a Pro-only feature (see L8). Pass a getter rather than
// importing subscriptionStore directly to avoid a circular dependency.
type IsPremiumFn = () => boolean;
let resolveIsPremium: IsPremiumFn = () => false;
export function registerPremiumResolver(fn: IsPremiumFn) {
  resolveIsPremium = fn;
}

export interface SavedConversation {
  id: string;
  title: string;
  preview: string; // First ~50 chars of last assistant message
  mode: ChatMode;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
  messageCount: number;
  starred?: boolean;
}

interface ChatHistoryState {
  conversations: SavedConversation[];
  currentConversationId: string | null;
  lastCloudSyncAt: number | null;

  // Actions
  saveConversation: (messages: ChatMessage[], mode: ChatMode) => string;
  loadConversation: (id: string) => SavedConversation | null;
  deleteConversation: (id: string) => void;
  clearAllHistory: () => void;
  updateCurrentConversation: (messages: ChatMessage[], mode: ChatMode) => void;
  startNewConversation: () => void;
  toggleStar: (id: string) => void;

  // Premium enforcement
  enforceHistoryLimit: (isPremium: boolean) => void;

  // Cloud sync (Pro only)
  syncToCloud: () => Promise<void>;
  syncFromCloud: () => Promise<void>;
  syncConversationToCloud: (conversation: SavedConversation) => Promise<void>;
  deleteConversationFromCloud: (id: string) => Promise<void>;
}

// Generate title from first user message
function generateTitle(messages: ChatMessage[]): string {
  const firstUserMsg = messages.find((m) => m.role === 'user');
  if (!firstUserMsg) return 'New Conversation';
  
  const text = firstUserMsg.content.trim();
  if (text.length <= 40) return text;
  return text.slice(0, 37) + '...';
}

// Generate preview from last assistant message
function generatePreview(messages: ChatMessage[]): string {
  const lastAssistant = [...messages].reverse().find((m) => m.role === 'assistant');
  if (!lastAssistant) return '';
  
  const text = lastAssistant.content.replace(/\*\*/g, '').trim();
  if (text.length <= 60) return text;
  return text.slice(0, 57) + '...';
}

// Fire-and-forget cloud upload for a single conversation (Pro only).
// Client-side; falls back silently on network/permission errors.
async function uploadConversation(conversation: SavedConversation): Promise<void> {
  if (!resolveIsPremium()) return;
  const userId = useAuthStore.getState().user?.id;
  if (!userId) return;

  try {
    const { error } = await supabase
      .from('chat_conversations')
      .upsert(
        {
          id: conversation.id,
          user_id: userId,
          title: conversation.title,
          preview: conversation.preview,
          mode: conversation.mode,
          messages: conversation.messages,
          message_count: conversation.messageCount,
          starred: conversation.starred ?? false,
          created_at: conversation.createdAt instanceof Date
            ? conversation.createdAt.toISOString()
            : conversation.createdAt,
          updated_at: conversation.updatedAt instanceof Date
            ? conversation.updatedAt.toISOString()
            : conversation.updatedAt,
        },
        { onConflict: 'id' },
      );
    if (error) throw error;
  } catch (err) {
    logger.warn('[chatHistory] cloud upload failed; will retry on next sync', err);
  }
}

export const useChatHistoryStore = create<ChatHistoryState>()(
  persist(
    (set, get) => ({
      conversations: [],
      currentConversationId: null,
      lastCloudSyncAt: null,

      saveConversation: (messages, mode) => {
        if (messages.length < MIN_MESSAGES_TO_SAVE) {
          return '';
        }

        const id = `conv_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const now = new Date();

        const conversation: SavedConversation = {
          id,
          title: generateTitle(messages),
          preview: generatePreview(messages),
          mode,
          messages: [...messages],
          createdAt: now,
          updatedAt: now,
          messageCount: messages.length,
          starred: false,
        };

        set((state) => ({
          conversations: [conversation, ...state.conversations],
          currentConversationId: id,
        }));

        // Pro-only: push to cloud in the background
        void uploadConversation(conversation);

        return id;
      },

      loadConversation: (id) => {
        const conversation = get().conversations.find((c) => c.id === id);
        if (conversation) {
          set({ currentConversationId: id });
        }
        return conversation || null;
      },

      deleteConversation: (id) => {
        set((state) => ({
          conversations: state.conversations.filter((c) => c.id !== id),
          currentConversationId:
            state.currentConversationId === id ? null : state.currentConversationId,
        }));
        void get().deleteConversationFromCloud(id);
      },

      clearAllHistory: () => {
        set({ conversations: [], currentConversationId: null });
      },

      updateCurrentConversation: (messages, mode) => {
        const { currentConversationId, conversations } = get();

        if (messages.length < MIN_MESSAGES_TO_SAVE) return;

        if (currentConversationId) {
          const updated = conversations.map((c) =>
            c.id === currentConversationId
              ? {
                  ...c,
                  messages: [...messages],
                  preview: generatePreview(messages),
                  updatedAt: new Date(),
                  messageCount: messages.length,
                }
              : c
          );
          set({ conversations: updated });
          const changed = updated.find((c) => c.id === currentConversationId);
          if (changed) void uploadConversation(changed);
        } else {
          // Create new conversation (which itself triggers uploadConversation)
          get().saveConversation(messages, mode);
        }
      },

      startNewConversation: () => {
        set({ currentConversationId: null });
      },

      toggleStar: (id) => {
        const { conversations } = get();
        const updated = conversations.map((c) =>
          c.id === id ? { ...c, starred: !c.starred, updatedAt: new Date() } : c,
        );
        set({ conversations: updated });
        const changed = updated.find((c) => c.id === id);
        if (changed) void uploadConversation(changed);
      },

      enforceHistoryLimit: (isPremium) => {
        if (isPremium) return; // Premium users have unlimited history

        const { conversations } = get();
        if (conversations.length > FREE_HISTORY_LIMIT) {
          set({
            conversations: conversations.slice(0, FREE_HISTORY_LIMIT),
          });
        }
      },

      // ---------- Cloud sync (Pro) ----------
      syncToCloud: async () => {
        if (!resolveIsPremium()) return;
        const userId = useAuthStore.getState().user?.id;
        if (!userId) return;

        const { conversations } = get();
        for (const convo of conversations) {
          await uploadConversation(convo);
        }
        set({ lastCloudSyncAt: Date.now() });
      },

      syncFromCloud: async () => {
        if (!resolveIsPremium()) return;
        const userId = useAuthStore.getState().user?.id;
        if (!userId) return;

        try {
          const { data, error } = await supabase
            .from('chat_conversations')
            .select('*')
            .eq('user_id', userId)
            .order('updated_at', { ascending: false })
            .limit(200);
          if (error) throw error;

          const { conversations: local } = get();
          const byId = new Map<string, SavedConversation>();
          for (const c of local) byId.set(c.id, c);

          for (const row of data ?? []) {
            const cloudUpdated = new Date(row.updated_at).getTime();
            const existing = byId.get(row.id);
            const localUpdated = existing
              ? (existing.updatedAt instanceof Date
                  ? existing.updatedAt.getTime()
                  : new Date(existing.updatedAt).getTime())
              : -Infinity;

            // Last-write-wins on updated_at
            if (cloudUpdated > localUpdated) {
              byId.set(row.id, {
                id: row.id,
                title: row.title,
                preview: row.preview ?? '',
                mode: row.mode as ChatMode,
                messages: row.messages ?? [],
                messageCount: row.message_count ?? (row.messages?.length ?? 0),
                starred: row.starred ?? false,
                createdAt: new Date(row.created_at),
                updatedAt: new Date(row.updated_at),
              });
            }
          }

          const merged = Array.from(byId.values()).sort(
            (a, b) => {
              const aT = a.updatedAt instanceof Date ? a.updatedAt.getTime() : 0;
              const bT = b.updatedAt instanceof Date ? b.updatedAt.getTime() : 0;
              return bT - aT;
            },
          );
          set({ conversations: merged, lastCloudSyncAt: Date.now() });
        } catch (err) {
          logger.warn('[chatHistory] syncFromCloud failed', err);
        }
      },

      syncConversationToCloud: uploadConversation,

      deleteConversationFromCloud: async (id) => {
        if (!resolveIsPremium()) return;
        const userId = useAuthStore.getState().user?.id;
        if (!userId) return;
        try {
          await supabase
            .from('chat_conversations')
            .delete()
            .eq('id', id)
            .eq('user_id', userId);
        } catch (err) {
          logger.warn('[chatHistory] cloud delete failed', err);
        }
      },
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        conversations: state.conversations,
        lastCloudSyncAt: state.lastCloudSyncAt,
        // Don't persist currentConversationId - start fresh each app launch
      }),
    }
  )
);

// Selector hooks
export const useConversations = () => useChatHistoryStore((s) => s.conversations);
export const useCurrentConversationId = () => useChatHistoryStore((s) => s.currentConversationId);
