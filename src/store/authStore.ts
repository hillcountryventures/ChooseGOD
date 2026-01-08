import { create } from 'zustand';
import { Session, User } from '@supabase/supabase-js';
import * as auth from '../lib/auth';
import { useSubscriptionStore } from './subscriptionStore';

interface AuthStore {
  user: User | null;
  session: Session | null;
  loading: boolean;
  initialized: boolean;

  // Actions
  initialize: () => Promise<void>;
  signUp: (email: string, password: string, displayName?: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  session: null,
  loading: true,
  initialized: false,

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
}));
