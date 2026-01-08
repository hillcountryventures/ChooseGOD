import { create } from 'zustand';
import { Session, User } from '@supabase/supabase-js';
import * as auth from '../lib/auth';
import { useSubscriptionStore } from './subscriptionStore';
import { supabase } from '../lib/supabase';
import { useStore } from './useStore';
import { useReadingPlanStore } from './readingPlanStore';
import { useDevotionalStore } from './devotionalStore';

interface DeleteAccountResult {
  success: boolean;
  error?: string;
}

interface AuthStore {
  user: User | null;
  session: Session | null;
  loading: boolean;
  initialized: boolean;
  isDeleting: boolean;

  // Actions
  initialize: () => Promise<void>;
  signUp: (email: string, password: string, displayName?: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
  deleteAccount: () => Promise<DeleteAccountResult>;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  session: null,
  loading: true,
  initialized: false,
  isDeleting: false,

  initialize: async () => {
    try {
      const { session } = await auth.getSession();
      set({
        session,
        user: session?.user ?? null,
        loading: false,
        initialized: true,
      });

      // Link user to RevenueCat if already logged in
      if (session?.user?.id) {
        useSubscriptionStore.getState().loginUser(session.user.id);
      }

      // Listen for auth state changes
      auth.onAuthStateChange((session) => {
        set({
          session,
          user: session?.user ?? null,
        });

        // Sync with RevenueCat
        if (session?.user?.id) {
          useSubscriptionStore.getState().loginUser(session.user.id);
        }
      });
    } catch (error) {
      console.error('Error initializing auth:', error);
      set({ loading: false, initialized: true });
    }
  },

  signUp: async (email: string, password: string, displayName?: string) => {
    const { error } = await auth.signUp(email, password, displayName);
    return { error: error as Error | null };
  },

  signIn: async (email: string, password: string) => {
    const { error } = await auth.signIn(email, password);
    return { error: error as Error | null };
  },

  signOut: async () => {
    await auth.signOut();
    await useSubscriptionStore.getState().logoutUser();
    set({ user: null, session: null });
  },

  resetPassword: async (email: string) => {
    const { error } = await auth.resetPassword(email);
    return { error: error as Error | null };
  },

  deleteAccount: async (): Promise<DeleteAccountResult> => {
    const { user, session } = get();

    if (!user || !session) {
      return { success: false, error: 'No user logged in' };
    }

    set({ isDeleting: true });

    try {
      // Call the delete-account edge function
      const { data, error } = await supabase.functions.invoke('delete-account', {
        body: {
          userId: user.id,
          confirmation: 'DELETE',
        },
      });

      if (error) {
        console.error('[Auth] Delete account error:', error);
        set({ isDeleting: false });
        return { success: false, error: error.message };
      }

      if (!data?.success) {
        console.error('[Auth] Delete account failed:', data?.error);
        set({ isDeleting: false });
        return { success: false, error: data?.error || 'Failed to delete account' };
      }

      console.log('[Auth] Account deleted successfully');

      // Clear all local stores
      useSubscriptionStore.getState().logoutUser();
      useStore.getState().clearMessages();
      useReadingPlanStore.getState().clearStore();
      useDevotionalStore.getState().clearStore();

      // Clear auth state
      set({
        user: null,
        session: null,
        isDeleting: false,
      });

      return { success: true };
    } catch (error) {
      console.error('[Auth] Delete account exception:', error);
      set({ isDeleting: false });
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An unexpected error occurred',
      };
    }
  },
}));
