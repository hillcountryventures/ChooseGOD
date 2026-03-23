/**
 * Reflection prompts for verse meditation and journaling
 */

// Contextual prompts based on verse content
export const REFLECTION_PROMPTS = [
  'What does this verse speak to you today?',
  'How does this verse apply to your life right now?',
  'What is God saying to you through this passage?',
  'What emotion or thought does this verse stir in you?',
  'How can you live out this truth today?',
] as const;

// Deeper study prompts
export const STUDY_PROMPTS = [
  'What is the historical context of this passage?',
  'How does this connect to other Scripture you know?',
  'What questions does this verse raise for you?',
  'What would change if you fully believed this?',
  'Who can you share this truth with today?',
] as const;

// Helper to get a random prompt
export const getRandomReflectionPrompt = (): string => {
  const index = Math.floor(Math.random() * REFLECTION_PROMPTS.length);
  return REFLECTION_PROMPTS[index];
};

// Helper to get a deterministic prompt based on a seed (e.g., verse reference)
export const getPromptFromSeed = (seed: string): string => {
  const hash = seed.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return REFLECTION_PROMPTS[hash % REFLECTION_PROMPTS.length];
};
