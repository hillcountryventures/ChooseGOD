/**
 * VersePickerScreen - Search and select Bible verses for journal entries
 *
 * Features:
 * - Search by keyword or reference
 * - Browse by book/chapter
 * - Preview verse text
 * - Multi-select support
 * - Recent/favorite verses
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  FlatList,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../lib/theme';
import { searchVerses, fetchChapter } from '../../lib/supabase';
import { VerseSource, Translation } from '../../types';
import { useStore } from '../../store/useStore';

// Bible books for browsing
const BIBLE_BOOKS = {
  oldTestament: [
    'Genesis', 'Exodus', 'Leviticus', 'Numbers', 'Deuteronomy',
    'Joshua', 'Judges', 'Ruth', '1 Samuel', '2 Samuel',
    '1 Kings', '2 Kings', '1 Chronicles', '2 Chronicles',
    'Ezra', 'Nehemiah', 'Esther', 'Job', 'Psalms', 'Proverbs',
    'Ecclesiastes', 'Song of Solomon', 'Isaiah', 'Jeremiah',
    'Lamentations', 'Ezekiel', 'Daniel', 'Hosea', 'Joel',
    'Amos', 'Obadiah', 'Jonah', 'Micah', 'Nahum', 'Habakkuk',
    'Zephaniah', 'Haggai', 'Zechariah', 'Malachi',
  ],
  newTestament: [
    'Matthew', 'Mark', 'Luke', 'John', 'Acts',
    'Romans', '1 Corinthians', '2 Corinthians', 'Galatians',
    'Ephesians', 'Philippians', 'Colossians', '1 Thessalonians',
    '2 Thessalonians', '1 Timothy', '2 Timothy', 'Titus',
    'Philemon', 'Hebrews', 'James', '1 Peter', '2 Peter',
    '1 John', '2 John', '3 John', 'Jude', 'Revelation',
  ],
};

// Popular verses for quick access
const POPULAR_VERSES = [
  { book: 'John', chapter: 3, verse: 16 },
  { book: 'Jeremiah', chapter: 29, verse: 11 },
  { book: 'Philippians', chapter: 4, verse: 13 },
  { book: 'Romans', chapter: 8, verse: 28 },
  { book: 'Proverbs', chapter: 3, verse: 5 },
  { book: 'Isaiah', chapter: 41, verse: 10 },
  { book: 'Psalms', chapter: 23, verse: 1 },
  { book: 'Matthew', chapter: 11, verse: 28 },
];

type ViewMode = 'search' | 'browse' | 'chapter';

interface VersePickerParams {
  selectedVerses?: VerseSource[];
  onSelectVerses?: (verses: VerseSource[]) => void;
}

export default function VersePickerScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<{ params: VersePickerParams }, 'params'>>();

  // Get initial selected verses from params
  const initialSelected = route.params?.selectedVerses || [];

  // Store
  const preferences = useStore((state) => state.preferences);
  const translation = preferences.preferredTranslation || 'KJV';

  // State
  const [viewMode, setViewMode] = useState<ViewMode>('search');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<VerseSource[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedVerses, setSelectedVerses] = useState<VerseSource[]>(initialSelected);
  const [selectedBook, setSelectedBook] = useState<string | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<number | null>(null);
  const [chapterVerses, setChapterVerses] = useState<VerseSource[]>([]);
  const [isLoadingChapter, setIsLoadingChapter] = useState(false);

  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Debounced search
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        // Check if it's a verse reference (e.g., "John 3:16")
        const refMatch = searchQuery.match(/^(\d?\s*\w+)\s*(\d+):(\d+)$/i);
        if (refMatch) {
          const [, book, chapter, verse] = refMatch;
          const results = await searchVerses(
            `${book} ${chapter}:${verse}`,
            translation as Translation,
            5
          );
          setSearchResults(results);
        } else {
          // Keyword search
          const results = await searchVerses(searchQuery, translation as Translation, 20);
          setSearchResults(results);
        }
      } catch (error) {
        console.error('Search error:', error);
        Alert.alert('Search Error', 'Failed to search verses. Please try again.');
      } finally {
        setIsSearching(false);
      }
    }, 500);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery, translation]);

  // Load chapter verses
  const loadChapter = useCallback(async (book: string, chapter: number) => {
    setIsLoadingChapter(true);
    try {
      const verses = await fetchChapter(book, chapter, translation as Translation);
      setChapterVerses(verses);
      setSelectedChapter(chapter);
      setViewMode('chapter');
    } catch (error) {
      console.error('Error loading chapter:', error);
      Alert.alert('Error', 'Failed to load chapter. Please try again.');
    } finally {
      setIsLoadingChapter(false);
    }
  }, [translation]);

  const toggleVerseSelection = useCallback((verse: VerseSource) => {
    setSelectedVerses((prev) => {
      const isSelected = prev.some(
        (v) =>
          v.book === verse.book &&
          v.chapter === verse.chapter &&
          v.verse === verse.verse
      );

      if (isSelected) {
        return prev.filter(
          (v) =>
            !(
              v.book === verse.book &&
              v.chapter === verse.chapter &&
              v.verse === verse.verse
            )
        );
      } else {
        return [...prev, verse];
      }
    });
  }, []);

  const isVerseSelected = useCallback(
    (verse: VerseSource) => {
      return selectedVerses.some(
        (v) =>
          v.book === verse.book &&
          v.chapter === verse.chapter &&
          v.verse === verse.verse
      );
    },
    [selectedVerses]
  );

  const handleDone = useCallback(() => {
    // Navigate back with selected verses
    navigation.navigate({
      name: 'JournalCompose',
      params: { selectedVerses },
      merge: true,
    });
  }, [selectedVerses, navigation]);

  const handleClose = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const renderSearchView = () => (
    <View style={styles.searchContainer}>
      {/* Search Input */}
      <View style={styles.searchInputContainer}>
        <Ionicons name="search" size={20} color={theme.colors.textMuted} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by keyword or reference (e.g., John 3:16)"
          placeholderTextColor={theme.colors.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color={theme.colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {/* Search Results or Popular Verses */}
      {isSearching ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Searching...</Text>
        </View>
      ) : searchQuery.length >= 2 ? (
        searchResults.length > 0 ? (
          <FlatList
            data={searchResults}
            keyExtractor={(item) =>
              `${item.book}-${item.chapter}-${item.verse}`
            }
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.verseItem,
                  isVerseSelected(item) && styles.verseItemSelected,
                ]}
                onPress={() => toggleVerseSelection(item)}
              >
                <View style={styles.verseItemContent}>
                  <View style={styles.verseRefRow}>
                    <Text style={styles.verseReference}>
                      {item.book} {item.chapter}:{item.verse}
                    </Text>
                    {isVerseSelected(item) && (
                      <Ionicons
                        name="checkmark-circle"
                        size={20}
                        color={theme.colors.primary}
                      />
                    )}
                  </View>
                  <Text style={styles.verseText} numberOfLines={3}>
                    "{item.text}"
                  </Text>
                </View>
              </TouchableOpacity>
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
                setSearchQuery(`${ref.book} ${ref.chapter}:${ref.verse}`)
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

  const renderBrowseView = () => (
    <ScrollView contentContainerStyle={styles.browseContainer}>
      {/* Old Testament */}
      <Text style={styles.testamentTitle}>Old Testament</Text>
      <View style={styles.booksGrid}>
        {BIBLE_BOOKS.oldTestament.map((book) => (
          <TouchableOpacity
            key={book}
            style={styles.bookItem}
            onPress={() => setSelectedBook(book)}
          >
            <Text style={styles.bookText}>{book}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* New Testament */}
      <Text style={[styles.testamentTitle, { marginTop: theme.spacing.lg }]}>
        New Testament
      </Text>
      <View style={styles.booksGrid}>
        {BIBLE_BOOKS.newTestament.map((book) => (
          <TouchableOpacity
            key={book}
            style={styles.bookItem}
            onPress={() => setSelectedBook(book)}
          >
            <Text style={styles.bookText}>{book}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );

  const renderChapterSelector = () => {
    if (!selectedBook) return null;

    // Generate chapter numbers (approximation - actual varies by book)
    const chapterCounts: Record<string, number> = {
      Genesis: 50, Exodus: 40, Leviticus: 27, Numbers: 36, Deuteronomy: 34,
      Joshua: 24, Judges: 21, Ruth: 4, '1 Samuel': 31, '2 Samuel': 24,
      '1 Kings': 22, '2 Kings': 25, '1 Chronicles': 29, '2 Chronicles': 36,
      Ezra: 10, Nehemiah: 13, Esther: 10, Job: 42, Psalms: 150, Proverbs: 31,
      Ecclesiastes: 12, 'Song of Solomon': 8, Isaiah: 66, Jeremiah: 52,
      Lamentations: 5, Ezekiel: 48, Daniel: 12, Hosea: 14, Joel: 3,
      Amos: 9, Obadiah: 1, Jonah: 4, Micah: 7, Nahum: 3, Habakkuk: 3,
      Zephaniah: 3, Haggai: 2, Zechariah: 14, Malachi: 4,
      Matthew: 28, Mark: 16, Luke: 24, John: 21, Acts: 28,
      Romans: 16, '1 Corinthians': 16, '2 Corinthians': 13, Galatians: 6,
      Ephesians: 6, Philippians: 4, Colossians: 4, '1 Thessalonians': 5,
      '2 Thessalonians': 3, '1 Timothy': 6, '2 Timothy': 4, Titus: 3,
      Philemon: 1, Hebrews: 13, James: 5, '1 Peter': 5, '2 Peter': 3,
      '1 John': 5, '2 John': 1, '3 John': 1, Jude: 1, Revelation: 22,
    };

    const chapters = Array.from(
      { length: chapterCounts[selectedBook] || 50 },
      (_, i) => i + 1
    );

    return (
      <View style={styles.chapterSelectorContainer}>
        <View style={styles.chapterSelectorHeader}>
          <TouchableOpacity
            onPress={() => setSelectedBook(null)}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={styles.chapterSelectorTitle}>{selectedBook}</Text>
          <View style={{ width: 40 }} />
        </View>
        <Text style={styles.selectChapterText}>Select a chapter</Text>
        <ScrollView contentContainerStyle={styles.chaptersGrid}>
          {chapters.map((chapter) => (
            <TouchableOpacity
              key={chapter}
              style={styles.chapterItem}
              onPress={() => loadChapter(selectedBook, chapter)}
            >
              <Text style={styles.chapterNumber}>{chapter}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };

  const renderChapterView = () => (
    <View style={styles.chapterViewContainer}>
      <View style={styles.chapterViewHeader}>
        <TouchableOpacity
          onPress={() => {
            setViewMode('browse');
            setSelectedChapter(null);
            setChapterVerses([]);
          }}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.chapterViewTitle}>
          {selectedBook} {selectedChapter}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      {isLoadingChapter ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading chapter...</Text>
        </View>
      ) : (
        <FlatList
          data={chapterVerses}
          keyExtractor={(item) => `${item.book}-${item.chapter}-${item.verse}`}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.verseItem,
                isVerseSelected(item) && styles.verseItemSelected,
              ]}
              onPress={() => toggleVerseSelection(item)}
            >
              <View style={styles.verseItemContent}>
                <View style={styles.verseRefRow}>
                  <Text style={styles.verseNumber}>{item.verse}</Text>
                  {isVerseSelected(item) && (
                    <Ionicons
                      name="checkmark-circle"
                      size={20}
                      color={theme.colors.primary}
                    />
                  )}
                </View>
                <Text style={styles.verseText}>{item.text}</Text>
              </View>
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.resultsList}
        />
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
          <Ionicons name="close" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Scripture</Text>
        <TouchableOpacity
          onPress={handleDone}
          style={[
            styles.doneButton,
            selectedVerses.length === 0 && styles.doneButtonDisabled,
          ]}
          disabled={selectedVerses.length === 0}
        >
          <Text
            style={[
              styles.doneButtonText,
              selectedVerses.length === 0 && styles.doneButtonTextDisabled,
            ]}
          >
            Done ({selectedVerses.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* View Mode Tabs */}
      {viewMode !== 'chapter' && !selectedBook && (
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, viewMode === 'search' && styles.tabActive]}
            onPress={() => setViewMode('search')}
          >
            <Ionicons
              name="search"
              size={18}
              color={
                viewMode === 'search'
                  ? theme.colors.primary
                  : theme.colors.textMuted
              }
            />
            <Text
              style={[
                styles.tabText,
                viewMode === 'search' && styles.tabTextActive,
              ]}
            >
              Search
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, viewMode === 'browse' && styles.tabActive]}
            onPress={() => setViewMode('browse')}
          >
            <Ionicons
              name="book-outline"
              size={18}
              color={
                viewMode === 'browse'
                  ? theme.colors.primary
                  : theme.colors.textMuted
              }
            />
            <Text
              style={[
                styles.tabText,
                viewMode === 'browse' && styles.tabTextActive,
              ]}
            >
              Browse
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Selected Verses Preview */}
      {selectedVerses.length > 0 && viewMode !== 'chapter' && (
        <View style={styles.selectedPreview}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.selectedScrollContent}
          >
            {selectedVerses.map((verse, index) => (
              <View
                key={`selected-${verse.book}-${verse.chapter}-${verse.verse}`}
                style={styles.selectedChip}
              >
                <Text style={styles.selectedChipText}>
                  {verse.book} {verse.chapter}:{verse.verse}
                </Text>
                <TouchableOpacity
                  onPress={() => toggleVerseSelection(verse)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons
                    name="close-circle"
                    size={16}
                    color={theme.colors.textMuted}
                  />
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Content */}
      {viewMode === 'search' && !selectedBook && renderSearchView()}
      {viewMode === 'browse' && !selectedBook && renderBrowseView()}
      {viewMode === 'browse' && selectedBook && !selectedChapter && renderChapterSelector()}
      {viewMode === 'chapter' && renderChapterView()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
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
  doneButton: {
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.full,
  },
  doneButtonDisabled: {
    opacity: 0.5,
  },
  doneButtonText: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.bold,
    color: '#fff',
  },
  doneButtonTextDisabled: {
    opacity: 0.7,
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    gap: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.surface,
  },
  tabActive: {
    backgroundColor: theme.colors.primary + '20',
  },
  tabText: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.textMuted,
  },
  tabTextActive: {
    color: theme.colors.primary,
  },
  selectedPreview: {
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  selectedScrollContent: {
    paddingHorizontal: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  selectedChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    backgroundColor: theme.colors.primary + '20',
    paddingVertical: theme.spacing.xs,
    paddingLeft: theme.spacing.sm,
    paddingRight: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
  },
  selectedChipText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.primary,
    fontWeight: theme.fontWeight.medium,
  },
  searchContainer: {
    flex: 1,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
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
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  loadingText: {
    marginTop: theme.spacing.md,
    fontSize: theme.fontSize.md,
    color: theme.colors.textMuted,
  },
  resultsList: {
    padding: theme.spacing.md,
  },
  verseItem: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  verseItemSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary + '10',
  },
  verseItemContent: {
    gap: theme.spacing.xs,
  },
  verseRefRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  verseReference: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.primary,
  },
  verseNumber: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.primary,
    minWidth: 24,
  },
  verseText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    lineHeight: theme.fontSize.sm * 1.5,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  popularContainer: {
    padding: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  popularItem: {
    flexDirection: 'row',
    alignItems: 'center',
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
  browseContainer: {
    padding: theme.spacing.md,
  },
  testamentTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  booksGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  bookItem: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  bookText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text,
  },
  chapterSelectorContainer: {
    flex: 1,
  },
  chapterSelectorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  backButton: {
    padding: theme.spacing.xs,
  },
  chapterSelectorTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
  },
  selectChapterText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    padding: theme.spacing.md,
  },
  chaptersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  chapterItem: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  chapterNumber: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
  },
  chapterViewContainer: {
    flex: 1,
  },
  chapterViewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  chapterViewTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
  },
});
