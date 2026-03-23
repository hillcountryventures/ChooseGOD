import type { VerseSource, Translation } from './bible';

// Chat modes for different spiritual experiences
export type ChatMode =
  | 'auto'
  | 'devotional'
  | 'prayer'
  | 'journal'
  | 'lectio'
  | 'examen'
  | 'memory'
  | 'confession'
  | 'gratitude'
  | 'celebration';

// Wit level for Grok-style personality
export type WitLevel = 'low' | 'medium' | 'high';

// Spiritual intent types (detected by AI)
export type SpiritualIntent =
  | 'question'
  | 'prayer'
  | 'journal'
  | 'gratitude'
  | 'confession'
  | 'guidance'
  | 'memorize'
  | 'devotional'
  | 'examen'
  | 'lectio'
  | 'celebration'
  | 'commitment'
  | 'casual';

// Chat message types
export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

// Celebration data for UI animations
export interface CelebrationData {
  type: 'answered_prayer' | 'memory_milestone' | 'growth_insight' | 'obedience_completed';
  message: string;
}

// Suggested quick actions
export interface SuggestedAction {
  label: string;
  prompt: string;
  icon?: string;
}

// Chat message with sources (for RAG responses)
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  sources?: VerseSource[];
  timestamp: Date;
  mode?: ChatMode;
  toolsUsed?: string[];
  celebration?: CelebrationData;
  suggestedActions?: SuggestedAction[];
}

// Chat context for FAB awareness
export type ChatScreenType = 'home' | 'bible' | 'devotional' | 'journey' | 'settings' | 'other';

export interface ChatBibleContext {
  book: string;
  chapter: number;
  selectedVerse?: {
    verse: number;
    text: string;
    translation: Translation;
  };
}

export interface ChatDevotionalContext {
  seriesId: string;
  seriesTitle: string;
  dayNumber: number;
  scriptureRef?: string;
}

export interface ChatContext {
  screenType: ChatScreenType;
  bibleContext?: ChatBibleContext;
  devotionalContext?: ChatDevotionalContext;
  timestamp: Date;
  pendingMessage?: string; // Auto-send this message when chat opens
}

// Companion API types
export interface CompanionRequest {
  userId: string;
  message: string;
  conversationHistory: Array<{ role: string; content: string }>;
  contextMode: ChatMode;
}

export interface CompanionResponse {
  response: string;
  sources: VerseSource[];
  toolsUsed?: string[];
  celebration?: CelebrationData;
  suggestedActions?: SuggestedAction[];
  savedData?: {
    journalId?: string;
    prayerId?: string;
    momentId?: string;
  };
}
