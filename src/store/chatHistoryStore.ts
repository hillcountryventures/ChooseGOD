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

const STORAGE_KEY = 'choosegod-chat-history';
const FREE_HISTORY_LIMIT = 10;
const MIN_MESSAGES_TO_SAVE = 3; // Only save conversations with 3+ messages

export interface SavedConversation {
  id: string;
  title: string;
  preview: string; // First ~50 chars of last assistant message
  mode: ChatMode;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
  messageCount: number;
}

interface ChatHistoryState {
  conversations: SavedConversation[];
  currentConversationId: string | null;
  
  // Actions
  saveConversation: (messages: ChatMessage[], mode: ChatMode) => string;
  loadConversation: (id: string) => SavedConversation | null;
  deleteConversation: (id: string) => void;
  clearAllHistory: () => void;
  updateCurrentConversation: (messages: ChatMessage[], mode: ChatMode) => void;
  startNewConversation: () => void;
  
  // Premium enforcement
  enforceHistoryLimit: (isPremium: boolean) => void;
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

export const useChatHistoryStore = create<ChatHistoryState>()(
  persist(
    (set, get) => ({
      conversations: [],
      currentConversationId: null,

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
        };

        set((state) => ({
          conversations: [conversation, ...state.conversations],
          currentConversationId: id,
        }));

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
      },

      clearAllHistory: () => {
        set({ conversations: [], currentConversationId: null });
      },

      updateCurrentConversation: (messages, mode) => {
        const { currentConversationId, conversations } = get();
        
        if (messages.length < MIN_MESSAGES_TO_SAVE) return;

        if (currentConversationId) {
          // Update existing conversation
          set({
            conversations: conversations.map((c) =>
              c.id === currentConversationId
                ? {
                    ...c,
                    messages: [...messages],
                    preview: generatePreview(messages),
                    updatedAt: new Date(),
                    messageCount: messages.length,
                  }
                : c
            ),
          });
        } else {
          // Create new conversation
          get().saveConversation(messages, mode);
        }
      },

      startNewConversation: () => {
        set({ currentConversationId: null });
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
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        conversations: state.conversations,
        // Don't persist currentConversationId - start fresh each app launch
      }),
    }
  )
);

// Selector hooks
export const useConversations = () => useChatHistoryStore((s) => s.conversations);
export const useCurrentConversationId = () => useChatHistoryStore((s) => s.currentConversationId);
