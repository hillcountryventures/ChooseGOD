import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Pressable,
  Animated,
  PanResponder,
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Alert,
  Share,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../lib/theme';
import { fetchChapter, getBookChapterCount, searchVerses } from '../lib/supabase';
import { getCachedChapter, cacheChapter } from '../services/bibleCache';
import { useOfflineStatus } from '../hooks/useOfflineStatus';
import { useSyncQueue } from '../hooks/useSyncQueue';
import { queueAction } from '../services/syncQueue';
import { useStore } from '../store/useStore';
import { useFontSize } from '../hooks/useFontSize';
import {
  BottomTabParamList,
  RootStackParamList,
  VerseSource,
  HighlightColor,
  VerseHighlight,
  VerseNote,
  VerseBookmark,
} from '../types';
import { SWIPE, TAP } from '../constants';
import { HEADER } from '../constants/dimensions';
import { CrossReferencesSheet } from '../components/CrossReferencesSheet';
import {
  SearchModal,
  BookPickerModal,
  ChapterPickerModal,
  NoteEditorModal,
  AIActionsModal,
  HIGHLIGHT_COLORS,
  AI_QUICK_ACTIONS,
  getHighlightBg,
  getVerseKey,
  formatDate,
} from '../components/bible';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { AskAboutPassage } from '../components/chat/AskAboutPassage';
import { trackBibleRead, trackScreenView } from '../services/analytics';
import { useReadingProgressStore } from '../store/readingProgressStore';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

type BibleScreenRouteProp = RouteProp<BottomTabParamList, 'Bible'>;

interface VerseWithAnnotations extends VerseSource {
  highlight?: VerseHighlight;
  notes?: VerseNote[];
  bookmark?: VerseBookmark;
}

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function BibleScreen() {
  const route = useRoute<BibleScreenRouteProp>();
  const navigation = useNavigation<NavigationProp>();
  const insets = useSafeAreaInsets();
  const preferences = useStore((state) => state.preferences);
  const { sizes: fontSizes } = useFontSize();
  const { isOffline } = useOfflineStatus();
  const { pendingCount: _pendingSyncCount } = useSyncQueue();

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
  const [bookmarks, setBookmarks] = useState<Map<string, VerseBookmark>>(new Map());

  // UI state
  const [selectedVerse, setSelectedVerse] = useState<VerseWithAnnotations | null>(null);
  const [showBookPicker, setShowBookPicker] = useState(false);
  const [showChapterPicker, setShowChapterPicker] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [editingNote, setEditingNote] = useState<VerseNote | null>(null);
  const [showAIMenu, setShowAIMenu] = useState(false);
  const [showCrossRefs, setShowCrossRefs] = useState(false);
  
  // Search state
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<VerseSource[]>([]);
  const [isSearching, setIsSearching] = useState(false);

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

  // Load chapter — offline-first: try cache, then network, cache result
  const loadChapter = useCallback(async () => {
    setIsLoading(true);
    const translation = preferences.preferredTranslation;

    try {
      // 1. Try cache first
      const cached = await getCachedChapter<VerseSource[]>(translation, currentBook, currentChapter);
      let chapterVerses: VerseSource[] | null = null;

      if (cached && cached.length > 0) {
        chapterVerses = cached;
      }

      // 2. If online, fetch fresh data (even if cached, to stay up to date)
      if (!isOffline) {
        try {
          const fresh = await fetchChapter(currentBook, currentChapter, translation);
          if (fresh.length > 0) {
            chapterVerses = fresh;
            // Cache the fresh result
            await cacheChapter(translation, currentBook, currentChapter, fresh);
          }
        } catch (networkErr) {
          console.warn('[BibleScreen] Network fetch failed, using cache', networkErr);
          // If we already have cached data, that's fine — fall through
        }
      }

      // 3. If still nothing, show empty
      if (!chapterVerses) {
        chapterVerses = [];
      }

      // Merge with annotations
      const versesWithAnnotations: VerseWithAnnotations[] = chapterVerses.map((v) => {
        const key = getVerseKey(v.book, v.chapter, v.verse);
        return {
          ...v,
          highlight: highlights.get(key),
          notes: notes.get(key),
          bookmark: bookmarks.get(key),
        };
      });

      setVerses(versesWithAnnotations);

      // Get total chapters for this book
      if (!isOffline) {
        const count = await getBookChapterCount(currentBook, translation);
        if (count > 0) setTotalChapters(count);
      }
    } catch (error) {
      console.error('Error loading chapter:', error);
    } finally {
      setIsLoading(false);
    }
  }, [currentBook, currentChapter, preferences.preferredTranslation, highlights, notes, bookmarks, isOffline]);

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
    trackBibleRead(currentBook, currentChapter);
    trackScreenView('Bible');
    // Track reading progress for Continue Reading banner
    useReadingProgressStore.getState().setLastRead(
      currentBook,
      currentChapter,
      preferences.preferredTranslation
    );
  }, [loadChapter]);


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
    // Queue sync
    queueAction('highlight_add', {
      id: newHighlight.id,
      user_id: newHighlight.userId,
      book: newHighlight.book,
      chapter: newHighlight.chapter,
      verse: newHighlight.verse,
      color: newHighlight.color,
      created_at: newHighlight.createdAt.toISOString(),
    });
    setSelectedVerse(null);
  };

  // Remove highlight
  const handleRemoveHighlight = () => {
    if (!selectedVerse) return;

    const key = getVerseKey(selectedVerse.book, selectedVerse.chapter, selectedVerse.verse);
    const existing = highlights.get(key);
    const newHighlights = new Map(highlights);
    newHighlights.delete(key);
    setHighlights(newHighlights);
    if (existing) {
      queueAction('highlight_remove', { id: existing.id });
    }
    setSelectedVerse(null);
  };

  // Toggle bookmark for selected verse
  const handleBookmark = () => {
    if (!selectedVerse) return;

    const key = getVerseKey(selectedVerse.book, selectedVerse.chapter, selectedVerse.verse);
    const existingBookmark = bookmarks.get(key);

    if (existingBookmark) {
      // Remove bookmark
      const newBookmarks = new Map(bookmarks);
      newBookmarks.delete(key);
      setBookmarks(newBookmarks);
      queueAction('bookmark_remove', { id: existingBookmark.id });
      Alert.alert('Bookmark Removed', `${selectedVerse.book} ${selectedVerse.chapter}:${selectedVerse.verse} removed from bookmarks.`);
    } else {
      // Add bookmark
      const newBookmark: VerseBookmark = {
        id: `bookmark-${Date.now()}`,
        userId: 'local-user',
        book: selectedVerse.book,
        chapter: selectedVerse.chapter,
        verse: selectedVerse.verse,
        createdAt: new Date(),
      };
      setBookmarks(new Map(bookmarks.set(key, newBookmark)));
      queueAction('bookmark_add', {
        id: newBookmark.id,
        user_id: newBookmark.userId,
        book: newBookmark.book,
        chapter: newBookmark.chapter,
        verse: newBookmark.verse,
        created_at: newBookmark.createdAt.toISOString(),
      });
      Alert.alert('Bookmarked!', `${selectedVerse.book} ${selectedVerse.chapter}:${selectedVerse.verse} added to your bookmarks.`);
    }
    setSelectedVerse(null);
  };

  // Share verse with deep link
  const handleShare = async () => {
    if (!selectedVerse) return;

    try {
      // Encode book name for URL (e.g., "1 John" -> "1%20John")
      const encodedBook = encodeURIComponent(selectedVerse.book);
      const deepLink = `https://choosegod.app/bible/${encodedBook}/${selectedVerse.chapter}/${selectedVerse.verse}`;
      
      const textContent = `"${selectedVerse.text}"\n\n— ${selectedVerse.book} ${selectedVerse.chapter}:${selectedVerse.verse} (${preferences.preferredTranslation})\n\n📖 Read in ChooseGOD: ${deepLink}`;
      
      await Share.share({ 
        message: textContent,
        url: deepLink, // iOS will use this for link preview
      });
      setSelectedVerse(null);
    } catch (error) {
      console.error('Error sharing verse:', error);
    }
  };

  // Open note editor for a new note
  const handleOpenNote = () => {
    if (!selectedVerse) return;
    setEditingNote(null);
    setNoteText('');
    setShowNoteModal(true);
  };

  // Handle Bible search
  const handleSearch = useCallback(async (query: string) => {
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }
    
    setIsSearching(true);
    try {
      const results = await searchVerses(query, preferences.preferredTranslation, 20);
      setSearchResults(results);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [preferences.preferredTranslation]);

  // Navigate to search result
  const handleSearchResultPress = (verse: VerseSource) => {
    setShowSearch(false);
    setSearchQuery('');
    setSearchResults([]);
    // Navigate to the verse
    setCurrentBook(verse.book);
    setCurrentChapter(verse.chapter);
    setTargetVerse(verse.verse);
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
      queueAction('note_update', {
        id: editingNote.id,
        content: noteText.trim(),
        updated_at: new Date().toISOString(),
      });
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
      queueAction('note_add', {
        id: newNote.id,
        user_id: newNote.userId,
        book: newNote.book,
        chapter: newNote.chapter,
        verse: newNote.verse,
        content: newNote.content,
        created_at: newNote.createdAt.toISOString(),
        updated_at: newNote.updatedAt.toISOString(),
      });
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
    queueAction('note_delete', { id: editingNote.id });

    setShowNoteModal(false);
    setNoteText('');
    setEditingNote(null);
  };

  // Handle navigation to a cross-referenced verse
  const handleCrossRefNavigate = (refBook: string, refChapter: number, refVerse: number) => {
    setShowCrossRefs(false);
    setSelectedVerse(null);
    setCurrentBook(refBook);
    setCurrentChapter(refChapter);
    setTargetVerse(refVerse);
  };

  // Handle AI quick action - navigates to ChatHubScreen with verse context
  const handleAIAction = (action: typeof AI_QUICK_ACTIONS[0]) => {
    if (!selectedVerse) return;

    // Generate the prompt for this action
    const displayReference = `${currentBook} ${currentChapter}:${selectedVerse.verse}`;
    const prompt = action.getPrompt(displayReference, selectedVerse.text);

    // Close modals and clear selection
    setShowAIMenu(false);
    setSelectedVerse(null);

    // Navigate to ChatHubScreen with verse context and initial message
    navigation.navigate('ChatHub', {
      contextVerse: {
        book: currentBook,
        chapter: currentChapter,
        verse: selectedVerse.verse,
        text: selectedVerse.text,
        translation: preferences.preferredTranslation,
      },
      initialMessage: prompt,
    });
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
      // Double tap detected - navigate to ChatHubScreen with verse context
      navigation.navigate('ChatHub', {
        contextVerse: {
          book: currentBook,
          chapter: currentChapter,
          verse: verse.verse,
          text: verse.text,
          translation: preferences.preferredTranslation,
        },
      });
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
    const isBookmarked = bookmarks.has(key);
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
          handleVerseLayout(verse.verse, y + HEADER.height + insets.top + theme.spacing.md);
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
            accessibilityLabel={`Verse ${verse.verse}: ${verse.text}${isBookmarked ? '. Bookmarked.' : ''}${verseNotes.length > 0 ? `. ${verseNotes.length} note${verseNotes.length > 1 ? 's' : ''}.` : ''}`}
            accessibilityHint="Tap to select. Double-tap for AI explanation. Long press for options."
            accessibilityRole="button"
          >
            <View
              style={[
                styles.verseTextContainer,
                { backgroundColor: getHighlightBg(highlight?.color) },
              ]}
            >
              <Text style={styles.verseNumber}>{verse.verse}</Text>
              <Text style={[styles.verseText, { fontSize: fontSizes.lg, lineHeight: fontSizes.lg * 1.8 }]}>{verse.text}</Text>
              {isBookmarked && (
                <View style={styles.bookmarkIndicator} accessibilityElementsHidden>
                  <Ionicons name="bookmark" size={14} color={theme.colors.accent} />
                </View>
              )}
              {verseNotes.length > 0 && (
                <View style={styles.noteIndicator} accessibilityElementsHidden>
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
        {/* Chapter indicator and search - at top */}
        <View style={styles.chapterNav}>
          <Text 
            style={styles.chapterIndicator}
            accessibilityLabel={`Chapter ${currentChapter} of ${totalChapters}`}
          >
            {currentChapter} of {totalChapters}
          </Text>
          <TouchableOpacity
            style={styles.searchButton}
            onPress={() => setShowSearch(true)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityLabel="Search Bible"
            accessibilityRole="button"
          >
            <Ionicons name="search" size={20} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Book/Chapter selectors - below navigation */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.bookSelector}
            onPress={() => setShowBookPicker(true)}
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
            onPress={() => setShowChapterPicker(true)}
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
          onScroll={handleScroll}
          scrollEventThrottle={16}
        >
          {verses.map(renderVerse)}
          <View style={{ height: 100 }} />
        </ScrollView>
        </ErrorBoundary>
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
            <View style={styles.colorPicker} accessibilityRole="radiogroup" accessibilityLabel="Highlight colors">
              {HIGHLIGHT_COLORS.map(({ color, hex }) => (
                <TouchableOpacity
                  key={color}
                  style={[styles.colorDot, { backgroundColor: hex }]}
                  onPress={() => handleHighlight(color)}
                  accessibilityLabel={`${color} highlight`}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: selectedVerse?.highlight?.color === color }}
                />
              ))}
              <TouchableOpacity
                style={styles.removeHighlight}
                onPress={handleRemoveHighlight}
                accessibilityLabel="Remove highlight"
                accessibilityRole="button"
              >
                <Ionicons name="close-circle" size={24} color={theme.colors.textMuted} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Actions */}
          <View style={styles.actionButtons} accessibilityRole="toolbar">
            <TouchableOpacity 
              style={styles.actionButton} 
              onPress={() => setShowCrossRefs(true)}
              accessibilityLabel="See related verses"
              accessibilityRole="button"
            >
              <Ionicons name="git-network-outline" size={20} color={theme.colors.accent} />
              <Text style={[styles.actionButtonText, { color: theme.colors.accent }]}>See Related</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionButton} 
              onPress={handleOpenNote}
              accessibilityLabel="Add a note to this verse"
              accessibilityRole="button"
            >
              <Ionicons name="add-circle-outline" size={20} color={theme.colors.primary} />
              <Text style={styles.actionButtonText}>Add Note</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionButton} 
              onPress={() => setShowAIMenu(true)}
              accessibilityLabel="Ask AI about this verse"
              accessibilityRole="button"
            >
              <Ionicons name="book-outline" size={20} color={theme.colors.primary} />
              <Text style={styles.actionButtonText}>Ask AI</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionButton} 
              onPress={handleBookmark}
              accessibilityLabel={selectedVerse && bookmarks.has(getVerseKey(selectedVerse.book, selectedVerse.chapter, selectedVerse.verse)) ? 'Remove bookmark' : 'Bookmark this verse'}
              accessibilityRole="button"
            >
              <Ionicons
                name={selectedVerse && bookmarks.has(getVerseKey(selectedVerse.book, selectedVerse.chapter, selectedVerse.verse)) ? "bookmark" : "bookmark-outline"}
                size={20}
                color={theme.colors.primary}
              />
              <Text style={styles.actionButtonText}>
                {selectedVerse && bookmarks.has(getVerseKey(selectedVerse.book, selectedVerse.chapter, selectedVerse.verse)) ? 'Saved' : 'Save'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionButton} 
              onPress={handleShare}
              accessibilityLabel="Share this verse"
              accessibilityRole="button"
            >
              <Ionicons name="share-outline" size={20} color={theme.colors.primary} />
              <Text style={styles.actionButtonText}>Share</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Ask About Passage FAB */}
      {!selectedVerse && !isLoading && verses.length > 0 && (
        <AskAboutPassage book={currentBook} chapter={currentChapter} />
      )}

      {/* Search Modal */}
      <SearchModal
        visible={showSearch}
        onClose={() => setShowSearch(false)}
        searchQuery={searchQuery}
        onSearchChange={(text) => {
          setSearchQuery(text);
          handleSearch(text);
        }}
        searchResults={searchResults}
        isSearching={isSearching}
        onResultPress={handleSearchResultPress}
      />

      {/* Book Picker Modal */}
      <BookPickerModal
        visible={showBookPicker}
        onClose={() => setShowBookPicker(false)}
        currentBook={currentBook}
        onSelectBook={(book) => {
          setCurrentBook(book);
          setCurrentChapter(1);
        }}
      />

      {/* Chapter Picker Modal */}
      <ChapterPickerModal
        visible={showChapterPicker}
        onClose={() => setShowChapterPicker(false)}
        currentChapter={currentChapter}
        totalChapters={totalChapters}
        onSelectChapter={setCurrentChapter}
      />

      {/* Note Editor Modal */}
      <NoteEditorModal
        visible={showNoteModal}
        onClose={() => {
          setShowNoteModal(false);
          setEditingNote(null);
        }}
        selectedVerse={selectedVerse}
        noteText={noteText}
        onNoteTextChange={setNoteText}
        editingNote={editingNote}
        onSave={handleSaveNote}
        onDelete={handleDeleteNote}
      />

      {/* AI Quick Actions Modal */}
      <AIActionsModal
        visible={showAIMenu}
        onClose={() => setShowAIMenu(false)}
        selectedVerse={selectedVerse}
        onActionPress={handleAIAction}
      />

      {/* Cross-References Sheet */}
      {selectedVerse && (
        <CrossReferencesSheet
          visible={showCrossRefs}
          onClose={() => setShowCrossRefs(false)}
          book={selectedVerse.book}
          chapter={selectedVerse.chapter}
          verse={selectedVerse.verse}
          verseText={selectedVerse.text}
          onNavigate={handleCrossRefNavigate}
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
  bookmarkIndicator: {
    position: 'absolute',
    top: 0,
    right: 0,
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
    height: SCREEN_HEIGHT * 0.6,
    backgroundColor: theme.colors.card,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
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
    maxHeight: SCREEN_HEIGHT * 0.25,
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
  keyboardAvoidingView: {
    flex: 1,
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
  searchModalContent: {
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
    maxHeight: '85%',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    marginHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    paddingVertical: theme.spacing.sm,
  },
  searchResultsList: {
    flex: 1,
    paddingHorizontal: theme.spacing.md,
  },
  searchLoadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.xl,
    gap: theme.spacing.sm,
  },
  searchLoadingText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
  },
  searchResultItem: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  searchResultRef: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.primary,
    marginBottom: theme.spacing.xs,
  },
  searchResultText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    lineHeight: 22,
  },
  searchEmptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.xxl,
  },
  searchEmptyText: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
    marginTop: theme.spacing.md,
  },
  searchEmptySubtext: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textMuted,
    marginTop: theme.spacing.xs,
  },
  searchHintText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textMuted,
    textAlign: 'center',
    padding: theme.spacing.xl,
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
