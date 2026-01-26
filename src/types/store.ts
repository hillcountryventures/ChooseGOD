import type { 
  BibleVerseRow, 
  DailyVerse, 
  MemoryVerse, 
  VerseSource 
} from './domain/bible';
import type { 
  ChatMode, 
  WitLevel, 
  ChatMessage, 
  ChatContext 
} from './domain/chat';
import type { PrayerRequest } from './domain/prayer';
import type { 
  SpiritualMoment, 
  JournalDraft, 
  JournalPrompt, 
  ObedienceStep 
} from './domain/journal';
import type { UserPreferences } from './user';

// Store state type
export interface AppState {
  // Chat state
  messages: ChatMessage[];
  isQuerying: boolean;
  currentMode: ChatMode;
  witLevel: WitLevel;
  isTyping: boolean;

  // Chat FAB state
  chatContext: ChatContext;
  chatSheetOpen: boolean;

  // Daily verse
  dailyVerse: DailyVerse | null;

  // Offline verse cache (for remote areas/no data)
  offlineVerses: Record<string, BibleVerseRow>;

  // User preferences
  preferences: UserPreferences;

  // Spiritual data
  activePrayers: PrayerRequest[];
  memoryVersesDue: MemoryVerse[];
  pendingObedienceSteps: ObedienceStep[];
  recentMoments: SpiritualMoment[];

  // Journal state
  currentDraft: JournalDraft | null;
  savedDrafts: JournalDraft[];
  dailyPrompts: JournalPrompt[];

  // Actions
  addMessage: (message: ChatMessage) => void;
  updateMessage: (id: string, updates: Partial<ChatMessage>) => void;
  clearMessages: () => void;
  setDailyVerse: (verse: DailyVerse | null) => void;
  updatePreferences: (prefs: Partial<UserPreferences>) => void;
  setPreferences: (prefs: Partial<UserPreferences>) => void;
  cacheVerse: (verse: BibleVerseRow) => void;
  getCachedVerse: (key: string) => BibleVerseRow | null;
  setIsQuerying: (isQuerying: boolean) => void;
  setCurrentMode: (mode: ChatMode) => void;
  setWitLevel: (level: WitLevel) => void;
  setIsTyping: (isTyping: boolean) => void;
  setActivePrayers: (prayers: PrayerRequest[]) => void;
  setMemoryVersesDue: (verses: MemoryVerse[]) => void;
  setPendingObedienceSteps: (steps: ObedienceStep[]) => void;
  setRecentMoments: (moments: SpiritualMoment[]) => void;
  addPrayer: (prayer: PrayerRequest) => void;
  updatePrayer: (id: string, updates: Partial<PrayerRequest>) => void;
  addMoment: (moment: SpiritualMoment) => void;
  updateMoment: (id: string, updates: Partial<SpiritualMoment>) => void;
  deleteMoment: (id: string) => void;

  // Chat FAB actions
  setChatContext: (context: Partial<ChatContext>) => void;
  setChatSheetOpen: (open: boolean) => void;

  // Journal actions
  setCurrentDraft: (draft: JournalDraft | null) => void;
  updateDraft: (updates: Partial<JournalDraft>) => void;
  saveDraft: (draft: JournalDraft) => void;
  deleteDraft: (draftId: string) => void;
  clearDraft: () => void;
  setDailyPrompts: (prompts: JournalPrompt[]) => void;
}

// Supabase query log type
export interface QueryLogRow {
  id: number;
  query: string;
  response: string;
  sources: VerseSource[];
  created_at: string;
  user_id?: string;
}
