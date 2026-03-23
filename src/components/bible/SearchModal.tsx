/**
 * SearchModal - Bible search modal
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../lib/theme';
import { VerseSource } from '../../types';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface SearchModalProps {
  visible: boolean;
  onClose: () => void;
  searchQuery: string;
  onSearchChange: (text: string) => void;
  searchResults: VerseSource[];
  isSearching: boolean;
  onResultPress: (verse: VerseSource) => void;
}

export function SearchModal({
  visible,
  onClose,
  searchQuery,
  onSearchChange,
  searchResults,
  isSearching,
  onResultPress,
}: SearchModalProps) {
  const handleClose = () => {
    onSearchChange('');
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.searchModalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Search Bible</Text>
              <TouchableOpacity onPress={handleClose}>
                <Ionicons name="close" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.searchInputContainer}>
              <Ionicons name="search" size={20} color={theme.colors.textMuted} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search for words or phrases..."
                placeholderTextColor={theme.colors.textMuted}
                value={searchQuery}
                onChangeText={onSearchChange}
                autoFocus
                returnKeyType="search"
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => onSearchChange('')}>
                  <Ionicons name="close-circle" size={20} color={theme.colors.textMuted} />
                </TouchableOpacity>
              )}
            </View>

            <ScrollView style={styles.searchResultsList} keyboardShouldPersistTaps="handled">
              {isSearching ? (
                <View style={styles.searchLoadingContainer}>
                  <ActivityIndicator size="small" color={theme.colors.primary} />
                  <Text style={styles.searchLoadingText}>Searching...</Text>
                </View>
              ) : searchResults.length > 0 ? (
                searchResults.map((verse, index) => (
                  <TouchableOpacity
                    key={`${verse.book}-${verse.chapter}-${verse.verse}-${index}`}
                    style={styles.searchResultItem}
                    onPress={() => onResultPress(verse)}
                  >
                    <Text style={styles.searchResultRef}>
                      {verse.book} {verse.chapter}:{verse.verse}
                    </Text>
                    <Text style={styles.searchResultText} numberOfLines={2}>
                      {verse.text}
                    </Text>
                  </TouchableOpacity>
                ))
              ) : searchQuery.length >= 2 ? (
                <View style={styles.searchEmptyContainer}>
                  <Ionicons name="search-outline" size={48} color={theme.colors.textMuted} />
                  <Text style={styles.searchEmptyText}>No verses found</Text>
                  <Text style={styles.searchEmptySubtext}>Try different keywords</Text>
                </View>
              ) : searchQuery.length > 0 ? (
                <Text style={styles.searchHintText}>Type at least 2 characters to search</Text>
              ) : (
                <View style={styles.searchEmptyContainer}>
                  <Ionicons name="book-outline" size={48} color={theme.colors.textMuted} />
                  <Text style={styles.searchEmptyText}>Search the Bible</Text>
                  <Text style={styles.searchEmptySubtext}>Find verses by keyword or phrase</Text>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  keyboardAvoidingView: {
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  searchModalContent: {
    backgroundColor: theme.colors.card,
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
    maxHeight: SCREEN_HEIGHT * 0.85,
    paddingBottom: 32,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  modalTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: theme.spacing.md,
    marginHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.md,
    height: 48,
    gap: theme.spacing.sm,
  },
  searchInput: {
    flex: 1,
    color: theme.colors.text,
    fontSize: theme.fontSize.md,
  },
  searchResultsList: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    maxHeight: SCREEN_HEIGHT * 0.5,
  },
  searchLoadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  searchLoadingText: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.md,
  },
  searchResultItem: {
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  searchResultRef: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.primary,
    marginBottom: theme.spacing.xs,
  },
  searchResultText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    lineHeight: theme.fontSize.sm * 1.5,
  },
  searchEmptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.xl,
  },
  searchEmptyText: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
    marginTop: theme.spacing.md,
  },
  searchEmptySubtext: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textMuted,
    marginTop: theme.spacing.xs,
  },
  searchHintText: {
    textAlign: 'center',
    color: theme.colors.textMuted,
    padding: theme.spacing.lg,
  },
});
