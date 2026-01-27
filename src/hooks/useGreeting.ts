/**
 * useGreeting - Centralized time-based greeting logic
 *
 * Returns appropriate greeting (morning/afternoon/evening) based on current time.
 * Used across HomeScreen and StreakBar for consistent greetings.
 */

import { useMemo } from 'react';
import { GREETING_HOURS } from '../constants/timing';
import { GREETINGS } from '../constants/strings';

export function useGreeting(): string {
  return useMemo(() => {
    const hour = new Date().getHours();

    if (hour < GREETING_HOURS.morningEnd) {
      return GREETINGS.morning;
    } else if (hour < GREETING_HOURS.afternoonEnd) {
      return GREETINGS.afternoon;
    } else {
      return GREETINGS.evening;
    }
  }, []);
}
