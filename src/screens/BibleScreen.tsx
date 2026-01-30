import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../lib/theme';
import { HEADER } from '../constants/dimensions';
import { getVerseKey } from '../components/bible';
import {
  SearchModal,
  BookPickerModal,
  ChapterPickerModal,
  NoteEditorModal,
  AIActionsModal,
} from '../components/bible';
import { VerseRow } from '../components/bible/VerseRow';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { AskAboutPassage } from '../components/chat/AskAboutPassage';
import { CrossReferencesSheet } from '../components/CrossReferencesSheet';
import { useBibleReader } from '../hooks/useBibleReader';
import { VerseActionBar } from '../components/bible/VerseActionBar';
import { useTrackScreen } from '../hooks/useAnalytics';

export default function BibleScreen() {
  useTrackScreen('bible');
  const insets = useSafeAreaInsets();
  const reader = useBibleReader();

  const {
    currentBook,
    currentChapter,
    totalChapters,
    targetVerse,
    verses,
    isLoading,
    highlights,
    notes,
    bookmarks,
    selectedVerse,
    showBookPicker,
    showChapterPicker,
    showNoteModal,
    noteText,
    editingNote,
    showAIMenu,
    showCrossRefs,
    showSearch,
    searchQuery,
    searchResults,
    isSearching,
    fontSizes,
    preferences: _preferences,
    headerTranslateY,
    scrollViewRef,
  } = reader;

  return (
    <View style={styles.container}>
      {/* Collapsible Header */}
      <Animated.View
        style={[
          styles.collapsibleHeader,
          {
            paddingTop: insets.top + 12,
            transform: [{ translateY: headerTranslateY }],
          },
        ]}
      >
        <View style={styles.chapterNav}>
          <Text
            style={styles.chapterIndicator}
            accessibilityLabel={`Chapter ${currentChapter} of ${totalChapters}`}
          >
            {currentChapter} of {totalChapters}
          </Text>
          <TouchableOpacity
            style={styles.searchButton}
            onPress={() => reader.setShowSearch(true)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityLabel="Search Bible"
            accessibilityRole="button"
          >
            <Ionicons name="search" size={20} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <View style={styles.header}>
          <TouchableOpacity
            style={styles.bookSelector}
            onPress={() => reader.setShowBookPicker(true)}
            hitSlop={{ top: 12, bottom: 12, left: 8, right: 8 }}
            activeOpacity={0.7}
            accessibilityLabel={`Current book: ${currentBook}. Tap to change.`}
            accessibilityRole="button"
          >
            <Text style={styles.bookTitle}>{currentBook}</Text>
            <Ionicons name="chevron-down" size={18} color={theme.colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.chapterSelector}
            onPress={() => reader.setShowChapterPicker(true)}
            hitSlop={{ top: 12, bottom: 12, left: 8, right: 8 }}
            activeOpacity={0.7}
            accessibilityLabel={`Chapter ${currentChapter}. Tap to change.`}
            accessibilityRole="button"
          >
            <Text style={styles.chapterTitle}>Chapter {currentChapter}</Text>
            <Ionicons name="chevron-down" size={14} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* Verses */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading chapter...</Text>
        </View>
      ) : (
        <ErrorBoundary level="component" name="BibleVerseRenderer">
          <ScrollView
            ref={scrollViewRef}
            style={styles.versesContainer}
            contentContainerStyle={[
              styles.versesContent,
              { paddingTop: HEADER.height + insets.top + theme.spacing.md },
            ]}
            showsVerticalScrollIndicator={false}
            onScroll={reader.handleScroll}
            scrollEventThrottle={16}
          >
            {verses.map((verse) => (
              <VerseRow
                key={verse.verse}
                verse={verse}
                isSelected={selectedVerse?.verse === verse.verse}
                isTargetVerse={targetVerse === verse.verse}
                fontSize={fontSizes.lg}
                onPress={() => reader.setSelectedVerse(verse)}
                onLongPress={() => reader.setSelectedVerse(verse)}
                onDoubleTap={() => reader.handleDoubleTap(verse)}
                onLayout={(y) => reader.handleVerseLayout(verse.verse, y + HEADER.height + insets.top + theme.spacing.md)}
                onSwipeHighlight={() => {
                  reader.setSelectedVerse(verse);
                  reader.handleHighlight('yellow');
                }}
              />
            ))}
            <View style={{ height: 100 }} />
          </ScrollView>
        </ErrorBoundary>
      )}

      {/* Verse Action Bar */}
      {selectedVerse && !showNoteModal && (
        <VerseActionBar
          selectedVerse={selectedVerse}
          notes={notes.get(getVerseKey(selectedVerse.book, selectedVerse.chapter, selectedVerse.verse)) || []}
          isHighlighted={highlights.has(getVerseKey(selectedVerse.book, selectedVerse.chapter, selectedVerse.verse))}
          isBookmarked={bookmarks.has(getVerseKey(selectedVerse.book, selectedVerse.chapter, selectedVerse.verse))}
          onClose={() => reader.setSelectedVerse(null)}
          onHighlight={reader.handleHighlight}
          onRemoveHighlight={reader.handleRemoveHighlight}
          onBookmark={reader.handleBookmark}
          onOpenNote={reader.handleOpenNote}
          onEditNote={reader.handleEditNote}
          onAIAction={(_prompt) => {
            reader.setShowAIMenu(false);
            reader.setSelectedVerse(null);
            // Navigate handled by the action bar's onAIAction
          }}
          onCrossRefs={() => reader.setShowCrossRefs(true)}
          onShare={reader.handleShare}
        />
      )}

      {/* Ask About Passage FAB */}
      {!selectedVerse && !isLoading && verses.length > 0 && (
        <AskAboutPassage book={currentBook} chapter={currentChapter} />
      )}

      {/* Search Modal */}
      <SearchModal
        visible={showSearch}
        onClose={() => reader.setShowSearch(false)}
        searchQuery={searchQuery}
        onSearchChange={(text) => {
          reader.setSearchQuery(text);
          reader.handleSearch(text);
        }}
        searchResults={searchResults}
        isSearching={isSearching}
        onResultPress={reader.handleSearchResultPress}
      />

      {/* Book Picker Modal */}
      <BookPickerModal
        visible={showBookPicker}
        onClose={() => reader.setShowBookPicker(false)}
        currentBook={currentBook}
        onSelectBook={(book) => {
          reader.setCurrentBook(book);
          reader.setCurrentChapter(1);
        }}
      />

      {/* Chapter Picker Modal */}
      <ChapterPickerModal
        visible={showChapterPicker}
        onClose={() => reader.setShowChapterPicker(false)}
        currentChapter={currentChapter}
        totalChapters={totalChapters}
        onSelectChapter={reader.setCurrentChapter}
      />

      {/* Note Editor Modal */}
      <NoteEditorModal
        visible={showNoteModal}
        onClose={() => {
          reader.setShowNoteModal(false);
          reader.setEditingNote(null);
        }}
        selectedVerse={selectedVerse}
        noteText={noteText}
        onNoteTextChange={reader.setNoteText}
        editingNote={editingNote}
        onSave={reader.handleSaveNote}
        onDelete={reader.handleDeleteNote}
      />

      {/* AI Quick Actions Modal */}
      <AIActionsModal
        visible={showAIMenu}
        onClose={() => reader.setShowAIMenu(false)}
        selectedVerse={selectedVerse}
        onActionPress={reader.handleAIAction}
      />

      {/* Cross-References Sheet */}
      {selectedVerse && (
        <CrossReferencesSheet
          visible={showCrossRefs}
          onClose={() => reader.setShowCrossRefs(false)}
          book={selectedVerse.book}
          chapter={selectedVerse.chapter}
          verse={selectedVerse.verse}
          verseText={selectedVerse.text}
          onNavigate={reader.handleCrossRefNavigate}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  collapsibleHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    gap: theme.spacing.sm,
  },
  bookSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.xs,
    minHeight: 48,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.surface,
  },
  bookTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
  },
  chapterSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.xs,
    minHeight: 48,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.full,
  },
  chapterTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.text,
  },
  chapterNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
  },
  searchButton: {
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.surface,
  },
  chapterIndicator: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  loadingText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textMuted,
  },
  versesContainer: {
    flex: 1,
  },
  versesContent: {
    padding: theme.spacing.lg,
  },
});
