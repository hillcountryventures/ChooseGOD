/**
 * AskAboutPassage — "Ask about this passage" floating action button
 *
 * Appears on BibleScreen to let users quickly jump into ChatHub
 * with the current book/chapter pre-filled as context.
 */

import React from 'react';
import { StyleSheet, TouchableOpacity, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Haptics from 'expo-haptics';
import { theme } from '../../lib/theme';
import { RootStackParamList } from '../../types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface AskAboutPassageProps {
  book: string;
  chapter: number;
}

export function AskAboutPassage({ book, chapter }: AskAboutPassageProps) {
  const navigation = useNavigation<NavigationProp>();

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    navigation.navigate('ChatHub', {
      initialMessage: `I'm reading ${book} ${chapter}. Help me understand this passage.`,
      contextMode: 'auto',
    });
  };

  return (
    <TouchableOpacity
      style={styles.fab}
      onPress={handlePress}
      activeOpacity={0.85}
      accessibilityLabel={`Ask about ${book} chapter ${chapter}`}
      accessibilityRole="button"
      accessibilityHint="Opens AI chat with this passage as context"
    >
      <View style={styles.fabInner}>
        <Ionicons name="chatbubble-ellipses" size={18} color="#fff" />
        <Text style={styles.fabText}>Ask about this passage</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 16,
    left: 16,
    alignItems: 'center',
  },
  fabInner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 28,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  fabText: {
    color: '#fff',
    fontSize: theme.fontSize.md,
    fontWeight: '600',
  },
});
