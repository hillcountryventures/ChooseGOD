/**
 * useBibleReader - Core hook for Bible reading state and logic
 * 
 * Manages chapter loading, verse annotations (highlights, notes, bookmarks),
 * search, navigation, gestures, and all associated handlers.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Animated,
  ScrollView,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Alert,
  Share,
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useStore } from '../store/useStore';
import { useFontSize } from './useFontSize';
import { useOfflineStatus } from './useOfflineStatus';
import { useSyncQueue } from './useSyncQueue';
import { fetchChapter, getBookChapterCount, searchVerses } from '../lib/supabase';
import { getCachedChapter, cacheChapter } from '../services/bibleCache';
import { queueAction } from '../services/syncQueue';
import { trackBibleRead, trackScreenView } from '../services/analytics';
import { useReadingProgressStore } from '../store/readingProgressStore';
import {
  BottomTabParamList,
  RootStackParamList,
  VerseSource,
  HighlightColor,
  VerseHighlight,
  VerseNote,
  VerseBookmark,
} from '../types';
import { HEADER } from '../constants/dimensions';
import { AI_QUICK_ACTIONS, getVerseKey } from '../components/bible';
import { VerseWithAnnotations } from '../components/bible/VerseRow';

type BibleScreenRouteProp = RouteProp<BottomTabParamList, 'Bible'>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export function useBibleReader() {
  const route = useRoute<BibleScreenRouteProp>();
  const navigation = useNavigation<NavigationProp>();
  const preferences = useStore((state) => state.preferences);
  const { sizes: fontSizes } = useFontSize();
  const { isOffline } = useOfflineStatus();
  const { pendingCount: _pendingSyncCount } = useSyncQueue();

  // Current reading position
  const [currentBook, setCurrentBook] = useState(route.params?.book || 'Proverbs');
  const [currentChapter, setCurrentChapter] = useState(route.params?.chapter || 1);
  const [targetVerse, setTargetVerse] = useState<number | undefined>(route.params?.verse);
  const [totalChapters, setTotalChapters] = useState(31);

  // Verses and loading state
  const [verses, setVerses] = useState<VerseWithAnnotations[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Annotations
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
  const lastScrollY = useRef(0);
  const headerTranslateY = useRef(new Animated.Value(0)).current;
  const isHeaderVisible = useRef(true);

  // Scroll view ref for programmatic scrolling
  const scrollViewRef = useRef<ScrollView>(null);
  const verseLayoutsRef = useRef<Map<number, number>>(new Map());

  // Load chapter — offline-first
  const loadChapter = useCallback(async () => {
    setIsLoading(true);
    const translation = preferences.preferredTranslation;

    try {
      const cached = await getCachedChapter<VerseSource[]>(translation, currentBook, currentChapter);
      let chapterVerses: VerseSource[] | null = null;

      if (cached && cached.length > 0) {
        chapterVerses = cached;
      }

      if (!isOffline) {
        try {
          const fresh = await fetchChapter(currentBook, currentChapter, translation);
          if (fresh.length > 0) {
            chapterVerses = fresh;
            await cacheChapter(translation, currentBook, currentChapter, fresh);
          }
        } catch (networkErr) {
          console.warn('[BibleScreen] Network fetch failed, using cache', networkErr);
        }
      }

      if (!chapterVerses) {
        chapterVerses = [];
      }

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
    if (route.params?.book) setCurrentBook(route.params.book);
    if (route.params?.chapter) setCurrentChapter(route.params.chapter);
    if (route.params?.verse) setTargetVerse(route.params.verse);
  }, [route.params]);

  // Load chapter when book/chapter changes
  useEffect(() => {
    loadChapter();
    trackBibleRead(currentBook, currentChapter);
    trackScreenView('Bible');
    useReadingProgressStore.getState().setLastRead(
      currentBook,
      currentChapter,
      preferences.preferredTranslation
    );
  }, [loadChapter]);

  // Scroll to target verse after verses load
  useEffect(() => {
    if (targetVerse && verses.length > 0 && !isLoading) {
      const timer = setTimeout(() => {
        const yOffset = verseLayoutsRef.current.get(targetVerse);
        if (yOffset !== undefined && scrollViewRef.current) {
          scrollViewRef.current.scrollTo({ y: yOffset - 20, animated: true });
        }
        setTargetVerse(undefined);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [targetVerse, verses, isLoading]);

  // Highlight handlers
  const handleHighlight = useCallback((color: HighlightColor) => {
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
  }, [selectedVerse, highlights]);

  const handleRemoveHighlight = useCallback(() => {
    if (!selectedVerse) return;
    const key = getVerseKey(selectedVerse.book, selectedVerse.chapter, selectedVerse.verse);
    const existing = highlights.get(key);
    const newHighlights = new Map(highlights);
    newHighlights.delete(key);
    setHighlights(newHighlights);
    if (existing) queueAction('highlight_remove', { id: existing.id });
    setSelectedVerse(null);
  }, [selectedVerse, highlights]);

  // Bookmark handler
  const handleBookmark = useCallback(() => {
    if (!selectedVerse) return;
    const key = getVerseKey(selectedVerse.book, selectedVerse.chapter, selectedVerse.verse);
    const existingBookmark = bookmarks.get(key);

    if (existingBookmark) {
      const newBookmarks = new Map(bookmarks);
      newBookmarks.delete(key);
      setBookmarks(newBookmarks);
      queueAction('bookmark_remove', { id: existingBookmark.id });
      Alert.alert('Bookmark Removed', `${selectedVerse.book} ${selectedVerse.chapter}:${selectedVerse.verse} removed from bookmarks.`);
    } else {
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
  }, [selectedVerse, bookmarks]);

  // Share handler
  const handleShare = useCallback(async () => {
    if (!selectedVerse) return;
    try {
      const encodedBook = encodeURIComponent(selectedVerse.book);
      const deepLink = `https://choosegod.app/bible/${encodedBook}/${selectedVerse.chapter}/${selectedVerse.verse}`;
      const textContent = `"${selectedVerse.text}"\n\n— ${selectedVerse.book} ${selectedVerse.chapter}:${selectedVerse.verse} (${preferences.preferredTranslation})\n\n📖 Read in ChooseGOD: ${deepLink}`;
      await Share.share({ message: textContent, url: deepLink });
      setSelectedVerse(null);
    } catch (error) {
      console.error('Error sharing verse:', error);
    }
  }, [selectedVerse, preferences.preferredTranslation]);

  // Note handlers
  const handleOpenNote = useCallback(() => {
    if (!selectedVerse) return;
    setEditingNote(null);
    setNoteText('');
    setShowNoteModal(true);
  }, [selectedVerse]);

  const handleEditNote = useCallback((note: VerseNote) => {
    setEditingNote(note);
    setNoteText(note.content);
    setShowNoteModal(true);
  }, []);

  const handleSaveNote = useCallback(() => {
    if (!selectedVerse || !noteText.trim()) {
      setShowNoteModal(false);
      setNoteText('');
      setEditingNote(null);
      return;
    }

    const key = getVerseKey(selectedVerse.book, selectedVerse.chapter, selectedVerse.verse);
    const existingNotes = notes.get(key) || [];

    if (editingNote) {
      const updatedNotes = existingNotes.map((n) =>
        n.id === editingNote.id ? { ...n, content: noteText.trim(), updatedAt: new Date() } : n
      );
      setNotes(new Map(notes.set(key, updatedNotes)));
      queueAction('note_update', {
        id: editingNote.id,
        content: noteText.trim(),
        updated_at: new Date().toISOString(),
      });
    } else {
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
  }, [selectedVerse, noteText, editingNote, notes]);

  const handleDeleteNote = useCallback(() => {
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
  }, [selectedVerse, editingNote, notes]);

  // Search handler
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

  const handleSearchResultPress = useCallback((verse: VerseSource) => {
    setShowSearch(false);
    setSearchQuery('');
    setSearchResults([]);
    setCurrentBook(verse.book);
    setCurrentChapter(verse.chapter);
    setTargetVerse(verse.verse);
  }, []);

  // Cross-reference navigation
  const handleCrossRefNavigate = useCallback((refBook: string, refChapter: number, refVerse: number) => {
    setShowCrossRefs(false);
    setSelectedVerse(null);
    setCurrentBook(refBook);
    setCurrentChapter(refChapter);
    setTargetVerse(refVerse);
  }, []);

  // AI action handler
  const handleAIAction = useCallback((action: typeof AI_QUICK_ACTIONS[0]) => {
    if (!selectedVerse) return;
    const displayReference = `${currentBook} ${currentChapter}:${selectedVerse.verse}`;
    const prompt = action.getPrompt(displayReference, selectedVerse.text);
    setShowAIMenu(false);
    setSelectedVerse(null);
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
  }, [selectedVerse, currentBook, currentChapter, navigation, preferences.preferredTranslation]);

  // Scroll handler for collapsible header
  const handleScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const currentScrollY = event.nativeEvent.contentOffset.y;
    const scrollDiff = currentScrollY - lastScrollY.current;

    if (currentScrollY > 50) {
      if (scrollDiff > 10 && isHeaderVisible.current) {
        isHeaderVisible.current = false;
        Animated.spring(headerTranslateY, {
          toValue: -HEADER.height,
          useNativeDriver: true,
          tension: 100,
          friction: 15,
        }).start();
      } else if (scrollDiff < -10 && !isHeaderVisible.current) {
        isHeaderVisible.current = true;
        Animated.spring(headerTranslateY, {
          toValue: 0,
          useNativeDriver: true,
          tension: 100,
          friction: 15,
        }).start();
      }
    } else if (currentScrollY <= 50 && !isHeaderVisible.current) {
      isHeaderVisible.current = true;
      Animated.spring(headerTranslateY, {
        toValue: 0,
        useNativeDriver: true,
        tension: 100,
        friction: 15,
      }).start();
    }

    lastScrollY.current = currentScrollY;
  }, [headerTranslateY]);

  // Double-tap handler
  const handleDoubleTap = useCallback((verse: VerseWithAnnotations) => {
    navigation.navigate('ChatHub', {
      contextVerse: {
        book: currentBook,
        chapter: currentChapter,
        verse: verse.verse,
        text: verse.text,
        translation: preferences.preferredTranslation,
      },
    });
  }, [navigation, currentBook, currentChapter, preferences.preferredTranslation]);

  // Track verse layout for scrolling
  const handleVerseLayout = useCallback((verseNum: number, y: number) => {
    verseLayoutsRef.current.set(verseNum, y);
  }, []);

  return {
    // State
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
    preferences,

    // Refs
    headerTranslateY,
    scrollViewRef,

    // Setters
    setCurrentBook,
    setCurrentChapter,
    setSelectedVerse,
    setShowBookPicker,
    setShowChapterPicker,
    setShowNoteModal,
    setShowAIMenu,
    setShowCrossRefs,
    setShowSearch,
    setSearchQuery,
    setNoteText,
    setEditingNote,

    // Handlers
    handleHighlight,
    handleRemoveHighlight,
    handleBookmark,
    handleShare,
    handleOpenNote,
    handleEditNote,
    handleSaveNote,
    handleDeleteNote,
    handleSearch,
    handleSearchResultPress,
    handleCrossRefNavigate,
    handleAIAction,
    handleScroll,
    handleDoubleTap,
    handleVerseLayout,
  };
}
