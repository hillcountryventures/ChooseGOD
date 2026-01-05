/**
 * Dimension constants for consistent sizing across the app
 */

// Header dimensions
export const HEADER = {
  height: 100,
  collapsedHeight: 60,
  statusBarPadding: 44,
} as const;

// Input dimensions
export const INPUT = {
  minHeight: 44,
  noteMinHeight: 150,
  noteMaxHeight: 150,
  borderRadius: 12,
} as const;

// Card dimensions
export const CARD = {
  borderRadius: 16,
  padding: 16,
  minHeight: 100,
} as const;

// Bottom sheet dimensions
export const BOTTOM_SHEET = {
  handleHeight: 24,
  minHeight: 200,
  maxHeight: 600,
} as const;

// Floating action button
export const FAB = {
  size: 56,
  iconSize: 24,
  bottomOffset: 100,
} as const;

// Tab bar dimensions
export const TAB_BAR = {
  height: 65,
} as const;

// Calendar grid
export const CALENDAR = {
  columns: 7,
  cellPadding: 2,
  daySize: 32,
} as const;

// Scroll offsets
export const SCROLL = {
  headerOffset: 20,
  bottomPadding: 100,
} as const;

// Icon sizes
export const ICON_SIZE = {
  xs: 12,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;
