/**
 * Journal prompts for daily writing and reflection
 */

import { JournalPrompt } from '../../types';
import { PROMPT_HOURS } from '../../constants/timing';

// Morning prompts
export const MORNING_PROMPTS: JournalPrompt[] = [
  { id: 'm1', type: 'morning', text: 'Morning Gratitude: List 3 blessings you woke up with today', icon: 'sunny' },
  { id: 'm2', type: 'morning', text: 'Daily Intention: What do you want to focus on today?', icon: 'compass' },
  { id: 'm3', type: 'morning', text: 'Prayer Request: Ask God for guidance in a specific area', icon: 'hand-left' },
  { id: 'm4', type: 'morning', text: 'Scripture Meditation: Reflect on your morning verse reading', icon: 'book' },
];

// Evening prompts
export const EVENING_PROMPTS: JournalPrompt[] = [
  { id: 'e1', type: 'evening', text: 'Daily Review: How did you see God\'s hand in your day?', icon: 'eye' },
  { id: 'e2', type: 'evening', text: 'Evening Gratitude: What are you most thankful for today?', icon: 'heart' },
  { id: 'e3', type: 'evening', text: 'Confession: Is there anything to release to God tonight?', icon: 'moon' },
  { id: 'e4', type: 'evening', text: 'Tomorrow\'s Prayer: What do you need strength for tomorrow?', icon: 'hand-left' },
];

// Verse-based prompts
export const VERSE_PROMPTS: JournalPrompt[] = [
  { id: 'v1', type: 'verse_based', text: 'Personal Meaning: What does this verse say to YOU specifically?', icon: 'book' },
  { id: 'v2', type: 'verse_based', text: 'Life Application: How can you live this out today?', icon: 'bulb' },
  { id: 'v3', type: 'verse_based', text: 'Questions & Curiosity: What do you want to understand better?', icon: 'help-circle' },
];

// Default/anytime prompts
export const DEFAULT_PROMPTS: JournalPrompt[] = [
  { id: 'd1', type: 'contextual', text: 'Free Write: Pour out whatever is on your heart right now', icon: 'create' },
  { id: 'd2', type: 'contextual', text: 'Written Prayer: Talk to God as you would a close friend', icon: 'hand-left' },
  { id: 'd3', type: 'contextual', text: 'Scripture Response: Write about a verse that moved you', icon: 'book' },
  { id: 'd4', type: 'contextual', text: 'Gratitude List: Name specific things you\'re thankful for', icon: 'heart' },
  { id: 'd5', type: 'contextual', text: 'Life Update: Share your highs and lows with God', icon: 'trending-up' },
];

// Helper to get prompts based on time of day
export function getTimeBasedPrompts(): JournalPrompt[] {
  const hour = new Date().getHours();

  if (hour >= PROMPT_HOURS.morningStart && hour < PROMPT_HOURS.morningEnd) {
    return MORNING_PROMPTS;
  } else if (hour >= PROMPT_HOURS.eveningStart || hour < PROMPT_HOURS.eveningEnd) {
    return EVENING_PROMPTS;
  }

  return DEFAULT_PROMPTS;
}

// All prompts combined
export const ALL_PROMPTS: JournalPrompt[] = [
  ...MORNING_PROMPTS,
  ...EVENING_PROMPTS,
  ...VERSE_PROMPTS,
  ...DEFAULT_PROMPTS,
];

// Get random prompts for display
export function getRandomPrompts(count: number = 4): JournalPrompt[] {
  const shuffled = [...ALL_PROMPTS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}
