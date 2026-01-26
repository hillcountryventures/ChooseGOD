import type { Translation } from './domain/bible';

// User settings
export interface UserSettings {
  theme: 'dark' | 'light' | 'system';
  fontSize: 'small' | 'medium' | 'large';
  notifications: boolean;
  dailyVerse: boolean;
}

// User preferences for store
export interface UserPreferences {
  preferredTranslation: Translation;
  fontSize: 'small' | 'medium' | 'large';
  dailyDevotional: boolean;
  eveningExamen: boolean;
  notificationsEnabled: boolean;
  maturityLevel: 'new_believer' | 'growing' | 'mature' | 'leader';
}

// User profile
export interface UserProfile {
  id: string;
  displayName?: string;
  preferredTranslation: string;
  maturityLevel: 'new_believer' | 'growing' | 'mature' | 'leader';
  dailyDevotional: boolean;
  eveningExamen: boolean;
  currentRhythm?: string;
  notificationToken?: string;
  timezone: string;
  createdAt: Date;
  updatedAt: Date;
}
