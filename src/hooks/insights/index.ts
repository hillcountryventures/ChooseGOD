/**
 * Journey Insights — Barrel Export
 *
 * Composes the sub-hooks into the original useJourneyInsights interface
 * so existing consumers don't need to change.
 */
export { useSpiritualHealth } from './useSpiritualHealth';
export type { SpiritualHealthScore } from './useSpiritualHealth';

export { useTopicsExplored, categorizeTopic, TOPIC_CATEGORIES } from './useTopicsExplored';
export type { TopicEngagement } from './useTopicsExplored';

export { useBibleEngagement, BIBLE_BOOK_EMOJIS, BOOK_GRADIENTS } from './useBibleEngagement';
export type { BibleBookEngagement } from './useBibleEngagement';
