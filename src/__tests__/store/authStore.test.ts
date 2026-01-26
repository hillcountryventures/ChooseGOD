import { useAuthStore } from '../../store/authStore';

// Mock dependencies
jest.mock('../../lib/auth', () => ({
  getSession: jest.fn(() => Promise.resolve({ session: null })),
  onAuthStateChange: jest.fn(() => () => {}),
  signUp: jest.fn(() => Promise.resolve({ error: null })),
  signIn: jest.fn(() => Promise.resolve({ error: null })),
  signOut: jest.fn(() => Promise.resolve()),
  resetPassword: jest.fn(() => Promise.resolve({ error: null })),
}));

jest.mock('../../lib/supabase', () => ({
  supabase: {
    functions: {
      invoke: jest.fn(),
    },
  },
}));

jest.mock('../../store/subscriptionStore', () => ({
  useSubscriptionStore: {
    getState: () => ({
      loginUser: jest.fn(),
      logoutUser: jest.fn(),
    }),
  },
}));

jest.mock('../../store/useStore', () => ({
  useStore: {
    getState: () => ({
      clearMessages: jest.fn(),
    }),
  },
}));

jest.mock('../../store/readingPlanStore', () => ({
  useReadingPlanStore: {
    getState: () => ({
      clearAllData: jest.fn(),
    }),
  },
}));

jest.mock('../../store/devotionalStore', () => ({
  useDevotionalStore: {
    getState: () => ({
      clearAllData: jest.fn(),
    }),
  },
}));

describe('authStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    useAuthStore.setState({
      user: null,
      session: null,
      loading: true,
      initialized: false,
      isDeleting: false,
    });
  });

  describe('initial state', () => {
    it('should have correct initial state', () => {
      const state = useAuthStore.getState();
      
      expect(state.user).toBeNull();
      expect(state.session).toBeNull();
      expect(state.loading).toBe(true);
      expect(state.initialized).toBe(false);
      expect(state.isDeleting).toBe(false);
    });
  });

  describe('initialize', () => {
    it('should set initialized to true after initialization', async () => {
      await useAuthStore.getState().initialize();
      
      const state = useAuthStore.getState();
      expect(state.initialized).toBe(true);
      expect(state.loading).toBe(false);
    });
  });

  describe('signIn', () => {
    it('should call auth.signIn with correct params', async () => {
      const auth = require('../../lib/auth');
      
      await useAuthStore.getState().signIn('test@example.com', 'password123');
      
      expect(auth.signIn).toHaveBeenCalledWith('test@example.com', 'password123');
    });

    it('should return error when signIn fails', async () => {
      const auth = require('../../lib/auth');
      const mockError = new Error('Invalid credentials');
      auth.signIn.mockResolvedValueOnce({ error: mockError });
      
      const result = await useAuthStore.getState().signIn('test@example.com', 'wrong');
      
      expect(result.error).toBe(mockError);
    });
  });

  describe('signUp', () => {
    it('should call auth.signUp with correct params', async () => {
      const auth = require('../../lib/auth');
      
      await useAuthStore.getState().signUp('test@example.com', 'password123', 'Test User');
      
      expect(auth.signUp).toHaveBeenCalledWith('test@example.com', 'password123', 'Test User');
    });
  });

  describe('signOut', () => {
    it('should clear user and session on signOut', async () => {
      // Set a user first
      useAuthStore.setState({
        user: { id: '123' } as any,
        session: { access_token: 'token' } as any,
      });
      
      await useAuthStore.getState().signOut();
      
      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.session).toBeNull();
    });
  });

  describe('resetPassword', () => {
    it('should call auth.resetPassword with correct email', async () => {
      const auth = require('../../lib/auth');
      
      await useAuthStore.getState().resetPassword('test@example.com');
      
      expect(auth.resetPassword).toHaveBeenCalledWith('test@example.com');
    });
  });
});
