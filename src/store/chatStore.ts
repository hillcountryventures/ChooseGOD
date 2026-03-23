/**
 * Chat Domain Store
 *
 * Manages chat messages, active mode, conversation state, and the Chat FAB.
 */
import { create } from 'zustand';
import type {
  ChatMessage,
  ChatMode,
  WitLevel,
  ChatContext,
} from '../types';

// =====================================================
// Types
// =====================================================

export interface ChatState {
  messages: ChatMessage[];
  isQuerying: boolean;
  currentMode: ChatMode;
  witLevel: WitLevel;
  isTyping: boolean;
  chatContext: ChatContext;
  chatSheetOpen: boolean;

  // Actions
  addMessage: (message: ChatMessage) => void;
  updateMessage: (id: string, updates: Partial<ChatMessage>) => void;
  clearMessages: () => void;
  setIsQuerying: (isQuerying: boolean) => void;
  setCurrentMode: (mode: ChatMode) => void;
  setWitLevel: (level: WitLevel) => void;
  setIsTyping: (isTyping: boolean) => void;
  setChatContext: (context: Partial<ChatContext>) => void;
  setChatSheetOpen: (open: boolean) => void;
}

// =====================================================
// Defaults
// =====================================================

const defaultChatContext: ChatContext = {
  screenType: 'home',
  bibleContext: undefined,
  devotionalContext: undefined,
  timestamp: new Date(),
};

// =====================================================
// Store
// =====================================================

export const useChatStore = create<ChatState>()((set) => ({
  messages: [],
  isQuerying: false,
  currentMode: 'auto',
  witLevel: 'medium',
  isTyping: false,
  chatContext: defaultChatContext,
  chatSheetOpen: false,

  addMessage: (message) =>
    set((state) => ({ messages: [...state.messages, message] })),

  updateMessage: (id, updates) =>
    set((state) => ({
      messages: state.messages.map((msg) =>
        msg.id === id ? { ...msg, ...updates } : msg
      ),
    })),

  clearMessages: () => set(() => ({ messages: [] })),

  setIsQuerying: (isQuerying) => set(() => ({ isQuerying })),

  setCurrentMode: (mode) => set(() => ({ currentMode: mode })),

  setWitLevel: (level) => set(() => ({ witLevel: level })),

  setIsTyping: (isTyping) => set(() => ({ isTyping })),

  setChatContext: (context) =>
    set((state) => ({
      chatContext: { ...state.chatContext, ...context, timestamp: new Date() },
    })),

  setChatSheetOpen: (open) => set(() => ({ chatSheetOpen: open })),
}));
