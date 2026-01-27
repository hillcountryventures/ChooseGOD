/**
 * ActiveStepsSection - HomeScreen component for pending obedience steps
 *
 * Shows active faith commitments that need follow-through.
 * Encourages users to be "doers of the word" (James 1:22)
 */

import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useNavigation, CompositeNavigationProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../lib/theme';
import { useStore, useObedienceSteps } from '../../store/useStore';
import { ObedienceStepCard } from '../ObedienceStepCard';
import { ObedienceCompletionModal } from '../ObedienceCompletionModal';
import { ObedienceStep, RootStackParamList, BottomTabParamList } from '../../types';

type NavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<BottomTabParamList>,
  NativeStackNavigationProp<RootStackParamList>
>;

// Maximum steps to show in compact view
const MAX_VISIBLE_STEPS = 2;

interface ActiveStepsSectionProps {
  onNavigateToJourney?: () => void;
}

export function ActiveStepsSection({ onNavigateToJourney }: ActiveStepsSectionProps) {
  const navigation = useNavigation<NavigationProp>();
  const pendingSteps = useObedienceSteps();
  const setPendingObedienceSteps = useStore((state) => state.setPendingObedienceSteps);

  // Completion modal state
  const [completingStep, setCompletingStep] = useState<ObedienceStep | null>(null);
  const [showCompletionModal, setShowCompletionModal] = useState(false);

  // Filter to only pending steps
  const activeSteps = pendingSteps.filter((step) => !step.completed);

  // Handle step completion
  const handleComplete = useCallback((step: ObedienceStep) => {
    setCompletingStep(step);
    setShowCompletionModal(true);
  }, []);

  // Handle modal dismiss
  const handleDismissModal = useCallback(() => {
    if (completingStep) {
      // Mark step as completed in store
      const updated = pendingSteps.map((s) =>
        s.id === completingStep.id
          ? { ...s, completed: true, completedAt: new Date() }
          : s
      );
      setPendingObedienceSteps(updated);
    }
    setShowCompletionModal(false);
    setCompletingStep(null);
  }, [completingStep, pendingSteps, setPendingObedienceSteps]);

  // Handle save reflection
  const handleSaveReflection = useCallback(
    (stepId: string, reflection: string) => {
      const updated = pendingSteps.map((s) =>
        s.id === stepId
          ? { ...s, completed: true, completedAt: new Date(), reflection }
          : s
      );
      setPendingObedienceSteps(updated);
      setShowCompletionModal(false);
      setCompletingStep(null);
    },
    [pendingSteps, setPendingObedienceSteps]
  );

  // Handle navigation to full list
  const handleViewAll = useCallback(() => {
    if (onNavigateToJourney) {
      onNavigateToJourney();
    } else {
      navigation.navigate('Journey');
    }
  }, [navigation, onNavigateToJourney]);

  // Handle step press (for details/editing)
  const handleStepPress = useCallback(
    (step: ObedienceStep) => {
      // Navigate to Journey screen for now
      // Could navigate to a detail screen in the future
      navigation.navigate('Journey');
    },
    [navigation]
  );

  // Don't render if no active steps
  if (activeSteps.length === 0) {
    return null;
  }

  const visibleSteps = activeSteps.slice(0, MAX_VISIBLE_STEPS);
  const hiddenCount = activeSteps.length - visibleSteps.length;

  return (
    <>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <View style={styles.iconBadge}>
              <Ionicons
                name="footsteps"
                size={14}
                color={theme.colors.success}
              />
            </View>
            <Text style={styles.title}>Active Steps</Text>
            <View style={styles.countBadge}>
              <Text style={styles.countText}>{activeSteps.length}</Text>
            </View>
          </View>
          {activeSteps.length > MAX_VISIBLE_STEPS && (
            <TouchableOpacity onPress={handleViewAll}>
              <Text style={styles.viewAll}>View All</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Steps List */}
        <View style={styles.stepsList}>
          {visibleSteps.map((step) => (
            <ObedienceStepCard
              key={step.id}
              step={step}
              onComplete={handleComplete}
              onPress={handleStepPress}
              compact
            />
          ))}
        </View>

        {/* Hidden count indicator */}
        {hiddenCount > 0 && (
          <TouchableOpacity style={styles.moreButton} onPress={handleViewAll}>
            <Text style={styles.moreText}>
              +{hiddenCount} more step{hiddenCount > 1 ? 's' : ''}
            </Text>
            <Ionicons
              name="chevron-forward"
              size={16}
              color={theme.colors.primary}
            />
          </TouchableOpacity>
        )}
      </View>

      {/* Completion Modal */}
      <ObedienceCompletionModal
        visible={showCompletionModal}
        step={completingStep}
        onDismiss={handleDismissModal}
        onSaveReflection={handleSaveReflection}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  iconBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.colors.successAlpha[20],
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
  },
  countBadge: {
    backgroundColor: theme.colors.success,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.full,
  },
  countText: {
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.bold,
    color: '#fff',
  },
  viewAll: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.primary,
  },
  stepsList: {
    gap: theme.spacing.sm,
  },
  moreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.xs,
    paddingVertical: theme.spacing.sm,
    marginTop: theme.spacing.xs,
  },
  moreText: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.primary,
  },
});

export default ActiveStepsSection;
