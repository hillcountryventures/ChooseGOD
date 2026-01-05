import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../lib/theme';
import { useStore } from '../store/useStore';
import { RootStackParamList, SpiritualMoment } from '../types';

type ReflectionModalRouteProp = RouteProp<RootStackParamList, 'ReflectionModal'>;

export default function ReflectionModal() {
  const navigation = useNavigation();
  const route = useRoute<ReflectionModalRouteProp>();
  const { verse, reference } = route.params;

  const [reflection, setReflection] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const addMoment = useStore((state) => state.addMoment);

  const handleSave = async () => {
    if (!reflection.trim()) {
      Alert.alert('Empty Reflection', 'Please write something before saving.');
      return;
    }

    setIsSaving(true);

    try {
      // Create a spiritual moment for the journal entry
      const moment: SpiritualMoment = {
        id: `journal-${Date.now()}`,
        userId: 'local-user', // Will be replaced with actual auth
        momentType: 'journal',
        content: reflection.trim(),
        linkedVerses: [{
          book: verse.book,
          chapter: verse.chapter,
          verse: verse.verse,
          text: verse.text,
          translation: 'KJV', // Default, could be made dynamic
        }],
        themes: [],
        createdAt: new Date(),
        metadata: {
          source: 'verse_reflection',
          verseReference: reference,
        },
      };

      addMoment(moment);

      // Navigate back
      navigation.goBack();
    } catch (error) {
      console.error('Error saving reflection:', error);
      Alert.alert('Error', 'Failed to save your reflection. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    if (reflection.trim()) {
      Alert.alert(
        'Discard Reflection?',
        'You have unsaved changes. Are you sure you want to leave?',
        [
          { text: 'Keep Writing', style: 'cancel' },
          { text: 'Discard', style: 'destructive', onPress: () => navigation.goBack() },
        ]
      );
    } else {
      navigation.goBack();
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Reflect</Text>
          <TouchableOpacity
            onPress={handleSave}
            style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
            disabled={isSaving}
          >
            <Text style={[styles.saveButtonText, !reflection.trim() && styles.saveButtonTextDisabled]}>
              {isSaving ? 'Saving...' : 'Save'}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Verse Display */}
          <View style={styles.verseCard}>
            <View style={styles.verseHeader}>
              <Ionicons name="book-outline" size={16} color={theme.colors.primary} />
              <Text style={styles.verseReference}>{reference}</Text>
            </View>
            <Text style={styles.verseText}>&quot;{verse.text}&quot;</Text>
          </View>

          {/* Reflection Prompt */}
          <Text style={styles.prompt}>What does this verse speak to you today?</Text>

          {/* Text Input */}
          <TextInput
            style={styles.textInput}
            multiline
            placeholder="Write your thoughts, prayers, or reflections..."
            placeholderTextColor={theme.colors.textMuted}
            value={reflection}
            onChangeText={setReflection}
            textAlignVertical="top"
            autoFocus
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  closeButton: {
    padding: theme.spacing.xs,
  },
  headerTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
  },
  saveButton: {
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.full,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold,
    color: '#fff',
  },
  saveButtonTextDisabled: {
    opacity: 0.5,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: theme.spacing.lg,
  },
  verseCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.lg,
  },
  verseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    marginBottom: theme.spacing.sm,
  },
  verseReference: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.primary,
  },
  verseText: {
    fontSize: theme.fontSize.lg,
    color: theme.colors.text,
    lineHeight: theme.fontSize.lg * 1.6,
    fontStyle: 'italic',
  },
  prompt: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
  },
  textInput: {
    flex: 1,
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    lineHeight: theme.fontSize.md * 1.6,
    minHeight: 200,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
});
