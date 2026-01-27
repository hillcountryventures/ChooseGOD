/**
 * Subscription Store Tests
 * 
 * Tests for Zustand subscription store.
 */

import { useSubscriptionStore } from '../../store/subscriptionStore';

// Mock RevenueCat
jest.mock('react-native-purchases', () => ({
  getCustomerInfo: jest.fn(),
  restorePurchases: jest.fn(),
  configure: jest.fn(),
  LOG_LEVEL: { DEBUG: 0 },
  setLogLevel: jest.fn(),
}));

describe('subscriptionStore', () => {
  describe('initial state', () => {
    it('should have customerInfo as null initially', () => {
      const state = useSubscriptionStore.getState();
      expect(state.customerInfo).toBeNull();
    });

    it('should have isPremium as false initially', () => {
      const state = useSubscriptionStore.getState();
      expect(state.isPremium).toBe(false);
    });
  });

  describe('setError', () => {
    it('should set error state', () => {
      const errorMessage = 'Test error';
      
      useSubscriptionStore.getState().setError(errorMessage);
      
      expect(useSubscriptionStore.getState().error).toBe(errorMessage);
    });

    it('should clear error when set to null', () => {
      useSubscriptionStore.getState().setError('Initial error');
      useSubscriptionStore.getState().setError(null);
      
      expect(useSubscriptionStore.getState().error).toBeNull();
    });
  });

  describe('canUseChat', () => {
    it('should return true for premium users', () => {
      // Set premium state
      useSubscriptionStore.setState({ isPremium: true });
      
      const result = useSubscriptionStore.getState().canUseChat();
      expect(result).toBe(true);
    });
  });
});
