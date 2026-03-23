/**
 * Journal Components
 *
 * Re-export all journal-related components for easy importing
 */

export { default as FloatingComposeButton } from './FloatingComposeButton';
export { default as MediaBar } from './MediaBar';
export { default as MediaPreview, MediaPreviewList } from './MediaPreview';
export { default as VoiceNoteRecorder } from './VoiceNoteRecorder';
export { default as VoiceNotePlayer } from './VoiceNotePlayer';
export {
  default as JournalPromptsCarousel,
  MORNING_PROMPTS,
  EVENING_PROMPTS,
  VERSE_PROMPTS,
  DEFAULT_PROMPTS,
  getTimeBasedPrompts,
} from './JournalPromptsCarousel';
