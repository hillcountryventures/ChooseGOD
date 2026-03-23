/**
 * Time-related constants for scheduling and time-based features
 */

// Greeting time boundaries (24-hour format)
export const GREETING_HOURS = {
  morningEnd: 12,      // Before 12 PM = morning
  afternoonEnd: 17,    // Before 5 PM = afternoon
  // After 5 PM = evening
} as const;

// Prompt time boundaries (24-hour format)
export const PROMPT_HOURS = {
  morningStart: 5,
  morningEnd: 12,
  eveningStart: 18,
  eveningEnd: 5,       // Wraps to next day
} as const;

// Default notification times
export const DEFAULT_NOTIFICATION_TIME = {
  hours: 7,
  minutes: 0,
} as const;

// Timeouts (milliseconds)
export const TIMEOUTS = {
  apiRequest: 30000,
  longPress: 500,
  debounce: 300,
  autoSave: 5000,
} as const;

// Intervals (milliseconds)
export const INTERVALS = {
  refreshData: 60000,
  syncCheck: 300000,
} as const;

// Cache durations (milliseconds)
export const CACHE_DURATION = {
  verses: 3600000,     // 1 hour
  devotional: 86400000, // 24 hours
} as const;
