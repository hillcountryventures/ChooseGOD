/**
 * useStreakMilestone - Track and celebrate streak milestones
 *
 * Stores seen milestones in AsyncStorage to avoid repeat celebrations.
 */

import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getMilestoneForStreak, StreakMilestone } from '../components/StreakMilestoneModal';

const SEEN_MILESTONES_KEY = '@choosegod_seen_milestones';

export function useStreakMilestone(currentStreak: number) {
  const [pendingMilestone, setPendingMilestone] = useState<StreakMilestone | null>(null);
  const [showMilestone, setShowMilestone] = useState(false);

  const checkForMilestone = async (streak: number) => {
    const milestone = getMilestoneForStreak(streak);
    if (!milestone) return;

    // Check if we've already shown this milestone
    try {
      const seenJson = await AsyncStorage.getItem(SEEN_MILESTONES_KEY);
      const seen: number[] = seenJson ? JSON.parse(seenJson) : [];
      
      if (!seen.includes(streak)) {
        // New milestone! Show celebration
        setPendingMilestone(milestone);
        setShowMilestone(true);
        
        // Mark as seen
        seen.push(streak);
        await AsyncStorage.setItem(SEEN_MILESTONES_KEY, JSON.stringify(seen));
      }
    } catch (error) {
      console.error('Error checking milestone:', error);
    }
  };

  // Check for new milestone when streak changes
  useEffect(() => {
    checkForMilestone(currentStreak);
  }, [currentStreak]);

  const dismissMilestone = useCallback(() => {
    setShowMilestone(false);
    setPendingMilestone(null);
  }, []);

  // For testing: manually trigger a milestone
  const triggerMilestone = useCallback((days: number) => {
    const milestone = getMilestoneForStreak(days);
    if (milestone) {
      setPendingMilestone(milestone);
      setShowMilestone(true);
    }
  }, []);

  // Reset seen milestones (for testing)
  const resetSeenMilestones = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(SEEN_MILESTONES_KEY);
    } catch (error) {
      console.error('Error resetting milestones:', error);
    }
  }, []);

  return {
    pendingMilestone,
    showMilestone,
    dismissMilestone,
    triggerMilestone,
    resetSeenMilestones,
  };
}
