/**
 * Gesture constants for consistent touch interactions
 */

// Swipe thresholds
export const SWIPE = {
  threshold: 80,
  velocityThreshold: 0.3,
  horizontalThreshold: 50,
} as const;

// Tap timing (milliseconds)
export const TAP = {
  doubleTapDelay: 300,
  longPressDelay: 300,
  tapTimeout: 200,
} as const;

// Scroll thresholds
export const SCROLL_THRESHOLD = {
  headerCollapse: 50,
  loadMore: 100,
  pullToRefresh: 80,
} as const;

// Pan gesture
export const PAN = {
  minDistance: 10,
  activeOffsetX: [-10, 10],
  activeOffsetY: [-10, 10],
} as const;

// Pinch gesture (for zoom)
export const PINCH = {
  minScale: 0.5,
  maxScale: 3,
  defaultScale: 1,
} as const;
