/**
 * Animation constants for consistent motion across the app
 */

// Timing durations (milliseconds)
export const ANIMATION_DURATION = {
  instant: 100,
  fast: 150,
  normal: 300,
  slow: 500,
  celebration: 2000,
} as const;

// Delays (milliseconds)
export const ANIMATION_DELAY = {
  scroll: 100,
  celebration: 2000,
  stagger: 50,
} as const;

// Spring animation configurations
export const SPRING_CONFIG = {
  default: {
    tension: 100,
    friction: 8,
  },
  gentle: {
    tension: 120,
    friction: 14,
  },
  bouncy: {
    tension: 180,
    friction: 12,
  },
  stiff: {
    tension: 200,
    friction: 20,
  },
} as const;

// Fade animations
export const FADE_CONFIG = {
  duration: 300,
  useNativeDriver: true,
} as const;

// Vibration patterns (Android)
export const VIBRATION_PATTERN = {
  notification: [0, 250, 250, 250],
  success: [0, 100],
  error: [0, 100, 100, 100],
} as const;
