import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { FlashList } from "@shopify/flash-list";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "../../../lib/theme";
import { VerseSource } from "../../../types";
import { VerseItem } from "./VerseItem";
import { POPULAR_VERSES } from "./constants";

interface SearchViewProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  searchResults: VerseSource[];
  isSearching: boolean;
  isVerseSelected: (verse: VerseSource) => boolean;
  onToggleVerse: (verse: VerseSource) => void;
}

export function SearchView({
  searchQuery,
  onSearchChange,
  searchResults,
  isSearching,
  isVerseSelected,
  onToggleVerse,
}: SearchViewProps) {
  return (
    <View style={styles.searchContainer}>
      <View style={styles.searchInputContainer}>
        <Ionicons name="search" size={20} color={theme.colors.textMuted} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by keyword or reference (e.g., John 3:16)"
          placeholderTextColor={theme.colors.textMuted}
          value={searchQuery}
          onChangeText={onSearchChange}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => onSearchChange("")}>
            <Ionicons
              name="close-circle"
              size={20}
              color={theme.colors.textMuted}
            />
          </TouchableOpacity>
        )}
      </View>

      {isSearching ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Searching...</Text>
        </View>
      ) : searchQuery.length >= 2 ? (
        searchResults.length > 0 ? (
          <FlashList
            data={searchResults}
            keyExtractor={(item) =>
              `${item.book}-${item.chapter}-${item.verse}`
            }
            drawDistance={300}
            renderItem={({ item }) => (
              <VerseItem
                verse={item}
                isSelected={isVerseSelected(item)}
                onToggle={onToggleVerse}
              />
            )}
            contentContainerStyle={styles.resultsList}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons
              name="search-outline"
              size={48}
              color={theme.colors.textMuted}
            />
            <Text style={styles.emptyText}>No verses found</Text>
            <Text style={styles.emptySubtext}>
              Try a different keyword or reference
            </Text>
          </View>
        )
      ) : (
        <ScrollView contentContainerStyle={styles.popularContainer}>
          <Text style={styles.sectionTitle}>Popular Verses</Text>
          {POPULAR_VERSES.map((ref) => (
            <TouchableOpacity
              key={`${ref.book}-${ref.chapter}-${ref.verse}`}
              style={styles.popularItem}
              onPress={() =>
                onSearchChange(`${ref.book} ${ref.chapter}:${ref.verse}`)
              }
            >
              <Ionicons
                name="bookmark-outline"
                size={18}
                color={theme.colors.primary}
              />
              <Text style={styles.popularText}>
                {ref.book} {ref.chapter}:{ref.verse}
              </Text>
              <Ionicons
                name="chevron-forward"
                size={18}
                color={theme.colors.textMuted}
              />
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  searchContainer: { flex: 1 },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
    margin: theme.spacing.md,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  searchInput: {
    flex: 1,
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: theme.spacing.xl,
  },
  loadingText: {
    marginTop: theme.spacing.md,
    fontSize: theme.fontSize.md,
    color: theme.colors.textMuted,
  },
  resultsList: { padding: theme.spacing.md },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: theme.spacing.xl,
  },
  emptyText: {
    marginTop: theme.spacing.md,
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
  },
  emptySubtext: {
    marginTop: theme.spacing.xs,
    fontSize: theme.fontSize.sm,
    color: theme.colors.textMuted,
  },
  popularContainer: { padding: theme.spacing.md },
  sectionTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  popularItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  popularText: {
    flex: 1,
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    fontWeight: theme.fontWeight.medium,
  },
});
