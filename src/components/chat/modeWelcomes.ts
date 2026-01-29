/**
 * Mode welcome messages - shown when user switches to a mode with no messages
 */
import type { ChatMode, SuggestedAction } from '../../types';

interface ModeWelcome {
  content: string;
  actions: SuggestedAction[];
}

export const modeWelcomes: Partial<Record<ChatMode, ModeWelcome>> = {
  prayer: {
    content: "I\u2019m here to guide you in prayer. You can share what\u2019s on your heart, ask for Scripture to pray over a situation, or let me lead you through ACTS prayer (Adoration, Confession, Thanksgiving, Supplication).\n\nWhat would you like to bring before the Lord today?",
    actions: [
      { label: 'ACTS Prayer', prompt: 'Guide me through ACTS prayer', icon: 'list-outline' },
      { label: 'Scripture to pray', prompt: 'Give me a Scripture to pray over my situation', icon: 'book-outline' },
      { label: 'Pray for peace', prompt: 'Help me pray for peace in my anxious heart', icon: 'heart-outline' },
    ],
  },
  lectio: {
    content: "Welcome to Lectio Divina, an ancient practice of prayerful Scripture reading. I\u2019ll guide you through four movements: Reading, Meditation, Prayer, and Contemplation.\n\nWould you like to begin, or do you have a specific passage in mind?",
    actions: [
      { label: 'Begin Lectio', prompt: 'Guide me through Lectio Divina', icon: 'book-outline' },
      { label: 'Choose passage', prompt: 'I have a specific passage I want to pray with', icon: 'search-outline' },
    ],
  },
  examen: {
    content: "Welcome to the Evening Examen, a practice of reflecting on your day with God. I\u2019ll help you notice where God was present and where you might have missed Him.\n\nAre you ready to begin?",
    actions: [
      { label: 'Begin Examen', prompt: 'Guide me through the Evening Examen', icon: 'moon-outline' },
      { label: 'Quick reflection', prompt: 'Help me with a quick end-of-day reflection', icon: 'time-outline' },
    ],
  },
  memory: {
    content: "Scripture memory mode activated! I can help you memorize verses using techniques like first-letter prompts, story associations, and spaced repetition.\n\nWhat verse would you like to work on?",
    actions: [
      { label: 'Add new verse', prompt: 'I want to memorize a new verse', icon: 'add-outline' },
      { label: 'Review verses', prompt: 'Quiz me on my memory verses', icon: 'school-outline' },
    ],
  },
  confession: {
    content: "This is a safe space for heart examination. As Psalm 139:23-24 says, \u201CSearch me, O God, and know my heart.\u201D\n\nTake a moment. What\u2019s weighing on your heart?",
    actions: [
      { label: 'Heart check', prompt: 'Help me examine my heart with Psalm 139', icon: 'heart-outline' },
      { label: 'Confess', prompt: 'I need to confess something to God', icon: 'chatbubble-outline' },
    ],
  },
  gratitude: {
    content: "Let\u2019s focus on gratitude! \u201CIn everything give thanks\u201D (1 Thessalonians 5:18).\n\nWhat blessings\u2014big or small\u2014are you noticing today?",
    actions: [
      { label: 'Share blessing', prompt: "I want to share something I'm grateful for", icon: 'gift-outline' },
      { label: 'Help me notice', prompt: 'Help me recognize blessings I might be overlooking', icon: 'eye-outline' },
    ],
  },
};
