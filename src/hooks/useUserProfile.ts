/**
 * useUserProfile - Fetches and caches user profile data from Supabase
 *
 * Provides personalization data like display_name for greetings.
 * Caches the profile to avoid repeated fetches.
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';

interface UserProfile {
  displayName: string | null;
  preferredTranslation: string;
  maturityLevel: string;
}

interface UseUserProfileReturn {
  profile: UserProfile | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

// Simple in-memory cache
let cachedProfile: UserProfile | null = null;
let cachedUserId: string | null = null;

export function useUserProfile(): UseUserProfileReturn {
  const user = useAuthStore((state) => state.user);
  const [profile, setProfile] = useState<UserProfile | null>(cachedProfile);
  const [isLoading, setIsLoading] = useState(!cachedProfile);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    if (!user?.id) {
      setProfile(null);
      setIsLoading(false);
      return;
    }

    // Use cache if available for same user
    if (cachedProfile && cachedUserId === user.id) {
      setProfile(cachedProfile);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('user_profiles')
        .select('display_name, preferred_translation, maturity_level')
        .eq('id', user.id)
        .single();

      if (fetchError) {
        // Profile doesn't exist yet - that's okay
        if (fetchError.code === 'PGRST116') {
          const defaultProfile: UserProfile = {
            displayName: null,
            preferredTranslation: 'kjv',
            maturityLevel: 'growing',
          };
          setProfile(defaultProfile);
          cachedProfile = defaultProfile;
          cachedUserId = user.id;
        } else {
          throw fetchError;
        }
      } else {
        const userProfile: UserProfile = {
          displayName: data.display_name,
          preferredTranslation: data.preferred_translation || 'kjv',
          maturityLevel: data.maturity_level || 'growing',
        };
        setProfile(userProfile);
        cachedProfile = userProfile;
        cachedUserId = user.id;
      }
    } catch (err) {
      console.error('[useUserProfile] Error fetching profile:', err);
      setError(err instanceof Error ? err.message : 'Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  // Fetch on mount and when user changes
  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // Clear cache on sign out
  useEffect(() => {
    if (!user) {
      cachedProfile = null;
      cachedUserId = null;
    }
  }, [user]);

  return {
    profile,
    isLoading,
    error,
    refetch: fetchProfile,
  };
}

/**
 * Get the user's first name from display name or email
 * Falls back gracefully if no personalization data is available
 */
export function getFirstName(displayName: string | null, email: string | null): string | null {
  if (displayName) {
    // Get first word of display name
    const firstName = displayName.split(' ')[0].trim();
    if (firstName) return firstName;
  }

  if (email) {
    // Try to extract name from email (before @ and before any numbers/dots)
    const localPart = email.split('@')[0];
    // Remove numbers and get first segment before dots or underscores
    const namePart = localPart.split(/[._]/)[0].replace(/\d+/g, '');
    if (namePart && namePart.length > 1) {
      // Capitalize first letter
      return namePart.charAt(0).toUpperCase() + namePart.slice(1).toLowerCase();
    }
  }

  return null;
}
