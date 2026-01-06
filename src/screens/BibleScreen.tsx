import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  TextInput,
  Pressable,
  Animated,
  PanResponder,
  Dimensions,
  GestureResponderEvent,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../lib/theme';
import { fetchChapter, getBookChapterCount } from '../lib/supabase';
import { useStore } from '../store/useStore';
import { useChatContext } from '../hooks/useChatContext';
import { useFontSize } from '../hooks/useFontSize';
import {
  BottomTabParamList,
  VerseSource,
  HighlightColor,
  VerseHighlight,
  VerseNote,
} from '../types';
import { SWIPE, TAP } from '../constants';
import { HEADER } from '../constants/dimensions';
import { BIBLE_BOOKS } from '../data/bible/books';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type BibleScreenRouteProp = RouteProp<BottomTabParamList, 'Bible'>;

const HIGHLIGHT_COLORS: { color: HighlightColor; hex: string }[] = [
  { color: 'yellow', hex: '#FEF08A' },
  { color: 'green', hex: '#BBF7D0' },
  { color: 'blue', hex: '#BFDBFE' },
  { color: 'pink', hex: '#FBCFE8' },
  { color: 'purple', hex: '#DDD6FE' },
  { color: 'orange', hex: '#FED7AA' },
];

// AI Quick Action options for verse context
const AI_QUICK_ACTIONS = [
  {
    id: 'explain',
    icon: 'book-outline' as const,
    label: 'Explain this verse',
    getPrompt: (ref: string, text: string) =>
      `Explain ${ref} - "${text}" in simple terms. What is the main message?`,
  },
  {
    id: 'context',
    icon: 'time-outline' as const,
    label: 'Historical context',
    getPrompt: (ref: string, text: string) =>
      `What is the historical and cultural context of ${ref}? Who wrote it, when, and to whom?`,
  },
  {
    id: 'apply',
    icon: 'bulb-outline' as const,
    label: 'How to apply it',
    getPrompt: (ref: string, text: string) =>
      `How can I apply ${ref} - "${text}" to my life today? Give practical examples.`,
  },
  {
    id: 'cross-ref',
    icon: 'git-branch-outline' as const,
    label: 'Cross-references',
    getPrompt: (ref: string, text: string) =>
      `What other Bible verses relate to ${ref}? Show me connections across Scripture.`,
  },
];

// Format date for display
const formatDate = (date: Date): string => {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
};

// BIBLE_BOOKS is now imported from '../data/bible/books'

interface VerseWithAnnotations extends VerseSource {
  highlight?: VerseHighlight;
  notes?: VerseNote[];
}

export default function BibleScreen() {
  const route = useRoute<BibleScreenRouteProp>();
  const preferences = useStore((state) => state.preferences);
  const setChatSheetOpen = useStore((state) => state.setChatSheetOpen);
  const { setBibleContext } = useChatContext();
  const { sizes: fontSizes } = useFontSize();

  // Current reading position
  const [currentBook, setCurrentBook] = useState(route.params?.book || 'Proverbs');
  const [currentChapter, setCurrentChapter] = useState(route.params?.chapter || 1);
  const [targetVerse, setTargetVerse] = useState<number | undefined>(route.params?.verse);
  const [totalChapters, setTotalChapters] = useState(31); // Proverbs has 31

  // Verses and loading state
  const [verses, setVerses] = useState<VerseWithAnnotations[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Annotations (stored locally for now - would sync to Supabase)
  const [highlights, setHighlights] = useState<Map<string, VerseHighlight>>(new Map());
  const [notes, setNotes] = useState<Map<string, VerseNote[]>>(new Map());

  // UI state
  const [selectedVerse, setSelectedVerse] = useState<VerseWithAnnotations | null>(null);
  const [showBookPicker, setShowBookPicker] = useState(false);
  const [showChapterPicker, setShowChapterPicker] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [editingNote, setEditingNote] = useState<VerseNote | null>(null);
  const [showAIMenu, setShowAIMenu] = useState(false);

  // Collapsible header animation
  const scrollY = useRef(new Animated.Value(0)).current;
  const lastScrollY = useRef(0);
  const headerTranslateY = useRef(new Animated.Value(0)).current;
  const isHeaderVisible = useRef(true);

  // Swipe gesture state
  const [swipingVerse, setSwipingVerse] = useState<number | null>(null);
  const swipeX = useRef(new Animated.Value(0)).current;

  // Double-tap detection
  const lastTap = useRef<{ verse: number; time: number } | null>(null);

  // Scroll view ref for programmatic scrolling
  const scrollViewRef = useRef<ScrollView>(null);
  const verseLayoutsRef = useRef<Map<number, number>>(new Map());

  // Generate verse key for annotations
  const getVerseKey = (book: string, chapter: number, verse: number) =>
    `${book}-${chapter}-${verse}`;

  // Load chapter
  const loadChapter = useCallback(async () => {
    setIsLoading(true);
    try {
      const chapterVerses = await fetchChapter(
        currentBook,
        currentChapter,
        preferences.preferredTranslation
      );

      // Merge with annotations
      const versesWithAnnotations: VerseWithAnnotations[] = chapterVerses.map((v) => {
        const key = getVerseKey(v.book, v.chapter, v.verse);
        return {
          ...v,
          highlight: highlights.get(key),
          notes: notes.get(key),
        };
      });

      setVerses(versesWithAnnotations);

      // Get total chapters for this book
      const count = await getBookChapterCount(currentBook, preferences.preferredTranslation);
      if (count > 0) setTotalChapters(count);
    } catch (error) {
      console.error('Error loading chapter:', error);
    } finally {
      setIsLoading(false);
    }
  }, [currentBook, currentChapter, preferences.preferredTranslation, highlights, notes]);

  // Update from route params
  useEffect(() => {
    if (route.params?.book) {
      setCurrentBook(route.params.book);
    }
    if (route.params?.chapter) {
      setCurrentChapter(route.params.chapter);
    }
    if (route.params?.verse) {
      setTargetVerse(route.params.verse);
    }
  }, [route.params]);

  // Load chapter when book/chapter changes
  useEffect(() => {
    loadChapter();
  }, [loadChapter]);

  // Report Bible context to chat FAB
  useEffect(() => {
    if (selectedVerse) {
      setBibleContext(currentBook, currentChapter, {
        verse: selectedVerse.verse,
        text: selectedVerse.text,
        translation: preferences.preferredTranslation,
      });
    } else {
      setBibleContext(currentBook, currentChapter);
    }
  }, [currentBook, currentChapter, selectedVerse, preferences.preferredTranslation, setBibleContext]);

  // Scroll to target verse after verses load
  useEffect(() => {
    if (targetVerse && verses.length > 0 && !isLoading) {
      // Small delay to ensure layout is complete
      const timer = setTimeout(() => {
        const yOffset = verseLayoutsRef.current.get(targetVerse);
        if (yOffset !== undefined && scrollViewRef.current) {
          scrollViewRef.current.scrollTo({
            y: yOffset - 20, // Offset to show some context above
            animated: true,
          });
        }
        // Clear target verse after scrolling
        setTargetVerse(undefined);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [targetVerse, verses, isLoading]);

  // Navigate chapters
  const goToPreviousChapter = () => {
    if (currentChapter > 1) {
      setCurrentChapter(currentChapter - 1);
    }
  };

  const goToNextChapter = () => {
    if (currentChapter < totalChapters) {
      setCurrentChapter(currentChapter + 1);
    }
  };

  // Handle verse selection
  const handleVersePress = (verse: VerseWithAnnotations) => {
    setSelectedVerse(verse);
  };

  const handleVerseLongPress = (verse: VerseWithAnnotations) => {
    setSelectedVerse(verse);
  };

  // Add/update highlight
  const handleHighlight = (color: HighlightColor) => {
    if (!selectedVerse) return;

    const key = getVerseKey(selectedVerse.book, selectedVerse.chapter, selectedVerse.verse);
    const newHighlight: VerseHighlight = {
      id: `highlight-${Date.now()}`,
      userId: 'local-user',
      book: selectedVerse.book,
      chapter: selectedVerse.chapter,
      verse: selectedVerse.verse,
      color,
      createdAt: new Date(),
    };

    setHighlights(new Map(highlights.set(key, newHighlight)));
    setSelectedVerse(null);
  };

  // Remove highlight
  const handleRemoveHighlight = () => {
    if (!selectedVerse) return;

    const key = getVerseKey(selectedVerse.book, selectedVerse.chapter, selectedVerse.verse);
    const newHighlights = new Map(highlights);
    newHighlights.delete(key);
    setHighlights(newHighlights);
    setSelectedVerse(null);
  };

  // Open note editor for a new note
  const handleOpenNote = () => {
    if (!selectedVerse) return;
    setEditingNote(null);
    setNoteText('');
    setShowNoteModal(true);
  };

  // Open note editor to edit an existing note
  const handleEditNote = (note: VerseNote) => {
    setEditingNote(note);
    setNoteText(note.content);
    setShowNoteModal(true);
  };

  // Save note (add new or update existing)
  const handleSaveNote = () => {
    if (!selectedVerse || !noteText.trim()) {
      setShowNoteModal(false);
      setNoteText('');
      setEditingNote(null);
      return;
    }

    const key = getVerseKey(selectedVerse.book, selectedVerse.chapter, selectedVerse.verse);
    const existingNotes = notes.get(key) || [];

    if (editingNote) {
      // Update existing note
      const updatedNotes = existingNotes.map((n) =>
        n.id === editingNote.id
          ? { ...n, content: noteText.trim(), updatedAt: new Date() }
          : n
      );
      setNotes(new Map(notes.set(key, updatedNotes)));
    } else {
      // Add new note
      const newNote: VerseNote = {
        id: `note-${Date.now()}`,
        userId: 'local-user',
        book: selectedVerse.book,
        chapter: selectedVerse.chapter,
        verse: selectedVerse.verse,
        content: noteText.trim(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      setNotes(new Map(notes.set(key, [...existingNotes, newNote])));
    }

    setShowNoteModal(false);
    setNoteText('');
    setEditingNote(null);
  };

  // Delete a specific note
  const handleDeleteNote = () => {
    if (!selectedVerse || !editingNote) return;

    const key = getVerseKey(selectedVerse.book, selectedVerse.chapter, selectedVerse.verse);
    const existingNotes = notes.get(key) || [];
    const filteredNotes = existingNotes.filter((n) => n.id !== editingNote.id);

    if (filteredNotes.length > 0) {
      setNotes(new Map(notes.set(key, filteredNotes)));
    } else {
      const newNotes = new Map(notes);
      newNotes.delete(key);
      setNotes(newNotes);
    }

    setShowNoteModal(false);
    setNoteText('');
    setEditingNote(null);
  };

  // Handle AI quick action - opens chat sheet with verse context
  const handleAIAction = (_action: typeof AI_QUICK_ACTIONS[0]) => {
    if (!selectedVerse) return;

    // Update context with selected verse before opening sheet
    setBibleContext(currentBook, currentChapter, {
      verse: selectedVerse.verse,
      text: selectedVerse.text,
      translation: preferences.preferredTranslation,
    });

    setShowAIMenu(false);
    setSelectedVerse(null);
    setChatSheetOpen(true);
  };

  // Get highlight background color
  const getHighlightBg = (color?: HighlightColor) => {
    if (!color) return 'transparent';
    const found = HIGHLIGHT_COLORS.find((c) => c.color === color);
    return found ? found.hex + '60' : 'transparent';
  };

  // Handle scroll for collapsible header
  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const currentScrollY = event.nativeEvent.contentOffset.y;
    const scrollDiff = currentScrollY - lastScrollY.current;

    // Only animate header after scrolling past a threshold
    if (currentScrollY > 50) {
      if (scrollDiff > 10 && isHeaderVisible.current) {
        // Scrolling down - hide header
        isHeaderVisible.current = false;
        Animated.spring(headerTranslateY, {
          toValue: -HEADER.height,
          useNativeDriver: true,
          tension: 100,
          friction: 15,
        }).start();
      } else if (scrollDiff < -10 && !isHeaderVisible.current) {
        // Scrolling up - show header
        isHeaderVisible.current = true;
        Animated.spring(headerTranslateY, {
          toValue: 0,
          useNativeDriver: true,
          tension: 100,
          friction: 15,
        }).start();
      }
    } else if (currentScrollY <= 50 && !isHeaderVisible.current) {
      // Near top - always show header
      isHeaderVisible.current = true;
      Animated.spring(headerTranslateY, {
        toValue: 0,
        useNativeDriver: true,
        tension: 100,
        friction: 15,
      }).start();
    }

    lastScrollY.current = currentScrollY;
  };

  // Handle double-tap for AI explain - opens chat sheet with verse context
  const handleDoubleTap = (verse: VerseWithAnnotations) => {
    const now = Date.now();

    if (
      lastTap.current &&
      lastTap.current.verse === verse.verse &&
      now - lastTap.current.time < TAP.doubleTapDelay
    ) {
      // Double tap detected - update context and open chat sheet
      setBibleContext(currentBook, currentChapter, {
        verse: verse.verse,
        text: verse.text,
        translation: preferences.preferredTranslation,
      });
      setChatSheetOpen(true);
      lastTap.current = null;
    } else {
      // First tap
      lastTap.current = { verse: verse.verse, time: now };
    }
  };

  // Create swipe pan responder for a verse
  const createVersePanResponder = (verse: VerseWithAnnotations) => {
    return PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Only respond to horizontal swipes
        return Math.abs(gestureState.dx) > 10 && Math.abs(gestureState.dy) < 30;
      },
      onPanResponderGrant: () => {
        setSwipingVerse(verse.verse);
        swipeX.setValue(0);
      },
      onPanResponderMove: (_, gestureState) => {
        // Only allow left swipe (negative dx)
        if (gestureState.dx < 0) {
          swipeX.setValue(gestureState.dx);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx < -SWIPE.threshold) {
          // Swipe threshold reached - apply highlight with default color (yellow)
          const key = getVerseKey(verse.book, verse.chapter, verse.verse);
          const existingHighlight = highlights.get(key);

          if (existingHighlight) {
            // Cycle through colors
            const currentIndex = HIGHLIGHT_COLORS.findIndex(
              (c) => c.color === existingHighlight.color
            );
            const nextIndex = (currentIndex + 1) % HIGHLIGHT_COLORS.length;
            handleHighlight(HIGHLIGHT_COLORS[nextIndex].color);
            setSelectedVerse(verse);
          } else {
            // Apply yellow highlight
            handleHighlight('yellow');
            setSelectedVerse(verse);
          }
        }

        // Reset swipe animation
        Animated.spring(swipeX, {
          toValue: 0,
          useNativeDriver: true,
          tension: 100,
          friction: 10,
        }).start(() => {
          setSwipingVerse(null);
        });
      },
      onPanResponderTerminate: () => {
        Animated.spring(swipeX, {
          toValue: 0,
          useNativeDriver: true,
        }).start(() => {
          setSwipingVerse(null);
        });
      },
    });
  };

  // Track verse layout for scrolling
  const handleVerseLayout = (verseNum: number, y: number) => {
    verseLayoutsRef.current.set(verseNum, y);
  };

  // Render verse with gestures
  const renderVerse = (verse: VerseWithAnnotations) => {
    const key = getVerseKey(verse.book, verse.chapter, verse.verse);
    const highlight = highlights.get(key);
    const verseNotes = notes.get(key) || [];
    const isSelected = selectedVerse?.verse === verse.verse;
    const isSwiping = swipingVerse === verse.verse;
    const panResponder = createVersePanResponder(verse);
    const isTargetVerse = targetVerse === verse.verse;

    return (
      <View
        key={verse.verse}
        style={styles.verseWrapper}
        onLayout={(event) => {
          const { y } = event.nativeEvent.layout;
          handleVerseLayout(verse.verse, y + HEADER.height + theme.spacing.sm);
        }}
      >
        {/* Swipe indicator background */}
        <View style={styles.swipeIndicator}>
          <Ionicons
            name="color-palette"
            size={20}
            color={theme.colors.primary}
          />
          <Text style={styles.swipeHint}>Highlight</Text>
        </View>

        <Animated.View
          {...panResponder.panHandlers}
          style={[
            styles.verseContainer,
            isSelected && styles.verseSelected,
            isTargetVerse && styles.verseHighlighted,
            isSwiping && {
              transform: [{ translateX: swipeX }],
            },
          ]}
        >
          <Pressable
            onPress={() => {
              handleDoubleTap(verse);
              handleVersePress(verse);
            }}
            onLongPress={() => handleVerseLongPress(verse)}
            delayLongPress={300}
          >
            <View
              style={[
                styles.verseTextContainer,
                { backgroundColor: getHighlightBg(highlight?.color) },
              ]}
            >
              <Text style={styles.verseNumber}>{verse.verse}</Text>
              <Text style={[styles.verseText, { fontSize: fontSizes.lg, lineHeight: fontSizes.lg * 1.8 }]}>{verse.text}</Text>
              {verseNotes.length > 0 && (
                <View style={styles.noteIndicator}>
                  <Ionicons name="document-text" size={12} color={theme.colors.primary} />
                  {verseNotes.length > 1 && (
                    <Text style={styles.noteCount}>{verseNotes.length}</Text>
                  )}
                </View>
              )}
            </View>
          </Pressable>
        </Animated.View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Collapsible Header */}
      <Animated.View
        style={[
          styles.collapsibleHeader,
          {
            transform: [{ translateY: headerTranslateY }],
          },
        ]}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.bookSelector}
            onPress={() => setShowBookPicker(true)}
          >
            <Text style={styles.bookTitle}>{currentBook}</Text>
            <Ionicons name="chevron-down" size={16} color={theme.colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.chapterSelector}
            onPress={() => setShowChapterPicker(true)}
          >
            <Text style={styles.chapterTitle}>Chapter {currentChapter}</Text>
            <Ionicons name="chevron-down" size={16} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Chapter navigation */}
        <View style={styles.chapterNav}>
          <TouchableOpacity
            style={[styles.navButton, currentChapter === 1 && styles.navButtonDisabled]}
            onPress={goToPreviousChapter}
            disabled={currentChapter === 1}
          >
            <Ionicons
              name="chevron-back"
              size={20}
              color={currentChapter === 1 ? theme.colors.textMuted : theme.colors.text}
            />
          </TouchableOpacity>

          <Text style={styles.chapterIndicator}>
            {currentChapter} of {totalChapters}
          </Text>

          <TouchableOpacity
            style={[styles.navButton, currentChapter === totalChapters && styles.navButtonDisabled]}
            onPress={goToNextChapter}
            disabled={currentChapter === totalChapters}
          >
            <Ionicons
              name="chevron-forward"
              size={20}
              color={currentChapter === totalChapters ? theme.colors.textMuted : theme.colors.text}
            />
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
        <ScrollView
          ref={scrollViewRef}
          style={styles.versesContainer}
          contentContainerStyle={[
            styles.versesContent,
            { paddingTop: HEADER.height + theme.spacing.sm },
          ]}
          showsVerticalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
        >
          {verses.map(renderVerse)}
          <View style={{ height: 100 }} />
        </ScrollView>
      )}

      {/* Verse Action Bar (when verse selected) */}
      {selectedVerse && !showNoteModal && (
        <View style={styles.actionBar}>
          <View style={styles.actionBarHeader}>
            <Text style={styles.actionBarTitle}>
              {selectedVerse.book} {selectedVerse.chapter}:{selectedVerse.verse}
            </Text>
            <TouchableOpacity onPress={() => setSelectedVerse(null)}>
              <Ionicons name="close" size={24} color={theme.colors.text} />
            </TouchableOpacity>
          </View>

          {/* Existing notes timeline */}
          {(() => {
            const verseKey = getVerseKey(selectedVerse.book, selectedVerse.chapter, selectedVerse.verse);
            const existingNotes = notes.get(verseKey) || [];
            if (existingNotes.length > 0) {
              // Sort by date, newest first
              const sortedNotes = [...existingNotes].sort(
                (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
              );
              return (
                <View style={styles.notesSection}>
                  <View style={styles.notesSectionHeader}>
                    <Text style={styles.notesSectionTitle}>
                      Your Notes ({existingNotes.length})
                    </Text>
                    <TouchableOpacity
                      style={styles.addNoteButton}
                      onPress={handleOpenNote}
                    >
                      <Ionicons name="add-circle" size={20} color={theme.colors.primary} />
                      <Text style={styles.addNoteButtonText}>Add</Text>
                    </TouchableOpacity>
                  </View>
                  <ScrollView
                    style={styles.notesTimeline}
                    horizontal={false}
                    nestedScrollEnabled
                  >
                    {sortedNotes.map((note) => (
                      <TouchableOpacity
                        key={note.id}
                        style={styles.notePreview}
                        onPress={() => handleEditNote(note)}
                      >
                        <View style={styles.notePreviewHeader}>
                          <Text style={styles.notePreviewDate}>
                            {formatDate(note.createdAt)}
                          </Text>
                          {note.updatedAt.getTime() !== note.createdAt.getTime() && (
                            <Text style={styles.noteEditedLabel}>(edited)</Text>
                          )}
                        </View>
                        <Text style={styles.notePreviewContent} numberOfLines={3}>
                          {note.content}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              );
            }
            return null;
          })()}

          {/* Highlight colors */}
          <View style={styles.highlightRow}>
            <Text style={styles.actionLabel}>Highlight</Text>
            <View style={styles.colorPicker}>
              {HIGHLIGHT_COLORS.map(({ color, hex }) => (
                <TouchableOpacity
                  key={color}
                  style={[styles.colorDot, { backgroundColor: hex }]}
                  onPress={() => handleHighlight(color)}
                />
              ))}
              <TouchableOpacity
                style={styles.removeHighlight}
                onPress={handleRemoveHighlight}
              >
                <Ionicons name="close-circle" size={24} color={theme.colors.textMuted} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Actions */}
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.actionButton} onPress={handleOpenNote}>
              <Ionicons name="add-circle-outline" size={20} color={theme.colors.primary} />
              <Text style={styles.actionButtonText}>Add Note</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton} onPress={() => setShowAIMenu(true)}>
              <Ionicons name="chatbubble-outline" size={20} color={theme.colors.primary} />
              <Text style={styles.actionButtonText}>Ask AI</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="bookmark-outline" size={20} color={theme.colors.primary} />
              <Text style={styles.actionButtonText}>Bookmark</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="share-outline" size={20} color={theme.colors.primary} />
              <Text style={styles.actionButtonText}>Share</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Book Picker Modal */}
      <Modal visible={showBookPicker} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Book</Text>
              <TouchableOpacity onPress={() => setShowBookPicker(false)}>
                <Ionicons name="close" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.bookList}>
              {Object.entries(BIBLE_BOOKS).map(([testament, books]) => (
                <View key={testament}>
                  <Text style={styles.testamentHeader}>{testament}</Text>
                  <View style={styles.booksGrid}>
                    {books.map((book) => (
                      <TouchableOpacity
                        key={book}
                        style={[
                          styles.bookItem,
                          currentBook === book && styles.bookItemSelected,
                        ]}
                        onPress={() => {
                          setCurrentBook(book);
                          setCurrentChapter(1);
                          setShowBookPicker(false);
                        }}
                      >
                        <Text
                          style={[
                            styles.bookItemText,
                            currentBook === book && styles.bookItemTextSelected,
                          ]}
                          numberOfLines={1}
                        >
                          {book}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Chapter Picker Modal */}
      <Modal visible={showChapterPicker} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Chapter</Text>
              <TouchableOpacity onPress={() => setShowChapterPicker(false)}>
                <Ionicons name="close" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.chapterList}>
              <View style={styles.chaptersGrid}>
                {Array.from({ length: totalChapters }, (_, i) => i + 1).map((ch) => (
                  <TouchableOpacity
                    key={ch}
                    style={[
                      styles.chapterItem,
                      currentChapter === ch && styles.chapterItemSelected,
                    ]}
                    onPress={() => {
                      setCurrentChapter(ch);
                      setShowChapterPicker(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.chapterItemText,
                        currentChapter === ch && styles.chapterItemTextSelected,
                      ]}
                    >
                      {ch}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Note Editor Modal */}
      <Modal visible={showNoteModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.noteModalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingNote ? 'Edit Note' : 'Add Note'}
              </Text>
              <TouchableOpacity onPress={() => {
                setShowNoteModal(false);
                setEditingNote(null);
              }}>
                <Ionicons name="close" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>

            <Text style={styles.noteVerseRef}>
              {selectedVerse?.book} {selectedVerse?.chapter}:{selectedVerse?.verse}
            </Text>

            <Text style={styles.noteVersePreview} numberOfLines={3}>
              &quot;{selectedVerse?.text}&quot;
            </Text>

            {editingNote && (
              <View style={styles.noteTimestamps}>
                <Text style={styles.timestampText}>
                  Created: {formatDate(editingNote.createdAt)}
                </Text>
                {editingNote.updatedAt.getTime() !== editingNote.createdAt.getTime() && (
                  <Text style={styles.timestampText}>
                    Updated: {formatDate(editingNote.updatedAt)}
                  </Text>
                )}
              </View>
            )}

            <TextInput
              style={styles.noteInput}
              multiline
              placeholder="Write your notes, thoughts, or reflections..."
              placeholderTextColor={theme.colors.textMuted}
              value={noteText}
              onChangeText={setNoteText}
              textAlignVertical="top"
              autoFocus
            />

            <View style={styles.noteButtonRow}>
              {editingNote && (
                <TouchableOpacity style={styles.deleteNoteButton} onPress={handleDeleteNote}>
                  <Ionicons name="trash-outline" size={18} color={theme.colors.error} />
                  <Text style={styles.deleteNoteButtonText}>Delete</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={[styles.saveNoteButton, editingNote && styles.saveNoteButtonWithDelete]}
                onPress={handleSaveNote}
              >
                <Text style={styles.saveNoteButtonText}>
                  {editingNote ? 'Save Changes' : 'Save Note'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* AI Quick Actions Modal */}
      <Modal visible={showAIMenu} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.aiMenuContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                Ask AI about {selectedVerse?.book} {selectedVerse?.chapter}:{selectedVerse?.verse}
              </Text>
              <TouchableOpacity onPress={() => setShowAIMenu(false)}>
                <Ionicons name="close" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.aiActionsList}>
              {AI_QUICK_ACTIONS.map((action) => (
                <TouchableOpacity
                  key={action.id}
                  style={styles.aiActionItem}
                  onPress={() => handleAIAction(action)}
                >
                  <View style={styles.aiActionIcon}>
                    <Ionicons name={action.icon} size={24} color={theme.colors.primary} />
                  </View>
                  <Text style={styles.aiActionLabel}>{action.label}</Text>
                  <Ionicons name="chevron-forward" size={20} color={theme.colors.textMuted} />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
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
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  bookSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  bookTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
  },
  chapterSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.full,
  },
  chapterTitle: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.text,
  },
  chapterNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.sm,
    gap: theme.spacing.lg,
  },
  navButton: {
    padding: theme.spacing.sm,
  },
  navButtonDisabled: {
    opacity: 0.3,
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
  verseWrapper: {
    marginBottom: theme.spacing.sm,
    position: 'relative',
    overflow: 'hidden',
  },
  swipeIndicator: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: SWIPE.threshold + 20,
    backgroundColor: theme.colors.primary + '20',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.xs,
    paddingRight: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
  },
  swipeHint: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.primary,
    fontWeight: theme.fontWeight.medium,
  },
  verseContainer: {
    marginBottom: 0,
    backgroundColor: theme.colors.background,
  },
  verseSelected: {
    backgroundColor: theme.colors.primary + '20',
    borderRadius: theme.borderRadius.md,
  },
  verseHighlighted: {
    backgroundColor: theme.colors.accent + '30',
    borderRadius: theme.borderRadius.md,
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.accent,
  },
  verseTextContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-start',
    padding: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
  },
  verseNumber: {
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.primary,
    marginRight: theme.spacing.xs,
    marginTop: 2,
  },
  verseText: {
    flex: 1,
    fontSize: theme.fontSize.lg,
    color: theme.colors.text,
    lineHeight: theme.fontSize.lg * 1.8,
  },
  noteIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: theme.spacing.xs,
    marginTop: 4,
    gap: 2,
  },
  noteCount: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.primary,
    fontWeight: theme.fontWeight.bold,
  },
  actionBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: theme.colors.card,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    padding: theme.spacing.md,
    paddingBottom: theme.spacing.xl,
  },
  actionBarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  actionBarTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
  },
  notesSection: {
    marginBottom: theme.spacing.md,
  },
  notesSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  notesSectionTitle: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
  },
  addNoteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
    backgroundColor: theme.colors.primary + '20',
    borderRadius: theme.borderRadius.full,
  },
  addNoteButtonText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.primary,
    fontWeight: theme.fontWeight.medium,
  },
  notesTimeline: {
    maxHeight: 150,
  },
  notePreview: {
    backgroundColor: theme.colors.backgroundSecondary,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.primary,
  },
  notePreviewHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
    gap: theme.spacing.sm,
  },
  notePreviewDate: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textMuted,
  },
  noteEditedLabel: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textMuted,
    fontStyle: 'italic',
  },
  notePreviewContent: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    lineHeight: theme.fontSize.md * 1.5,
  },
  highlightRow: {
    marginBottom: theme.spacing.md,
  },
  actionLabel: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
  },
  colorPicker: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  colorDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  removeHighlight: {
    marginLeft: theme.spacing.sm,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.xs,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.backgroundSecondary,
    borderRadius: theme.borderRadius.md,
  },
  actionButtonText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.primary,
    fontWeight: theme.fontWeight.medium,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
    maxHeight: '80%',
  },
  noteModalContent: {
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  modalTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
  },
  bookList: {
    padding: theme.spacing.md,
  },
  testamentHeader: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.primary,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  booksGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  bookItem: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  bookItemSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  bookItemText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text,
  },
  bookItemTextSelected: {
    color: '#fff',
    fontWeight: theme.fontWeight.semibold,
  },
  chapterList: {
    padding: theme.spacing.md,
  },
  chaptersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
    justifyContent: 'center',
  },
  chapterItem: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  chapterItemSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  chapterItemText: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.text,
  },
  chapterItemTextSelected: {
    color: '#fff',
    fontWeight: theme.fontWeight.bold,
  },
  noteVerseRef: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.primary,
    marginBottom: theme.spacing.xs,
  },
  noteVersePreview: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
    marginBottom: theme.spacing.sm,
    lineHeight: theme.fontSize.md * 1.5,
  },
  noteTimestamps: {
    marginBottom: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: theme.colors.backgroundSecondary,
    borderRadius: theme.borderRadius.md,
  },
  timestampText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textMuted,
  },
  noteInput: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    minHeight: 150,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.md,
  },
  noteButtonRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  deleteNoteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.xs,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    backgroundColor: theme.colors.errorAlpha[20],
    borderRadius: theme.borderRadius.lg,
  },
  deleteNoteButtonText: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.error,
  },
  saveNoteButton: {
    flex: 1,
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
  },
  saveNoteButtonWithDelete: {
    flex: 1,
  },
  saveNoteButtonText: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: '#fff',
  },
  // AI Menu Modal styles
  aiMenuContent: {
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
    paddingBottom: theme.spacing.xl,
  },
  aiActionsList: {
    padding: theme.spacing.md,
  },
  aiActionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  aiActionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  aiActionLabel: {
    flex: 1,
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    fontWeight: theme.fontWeight.medium,
  },
});
