import { useCallback } from 'react';
import { useStore } from '../store/useStore';
import { Translation } from '../types';

export function useChatContext() {
  const setChatContext = useStore((s) => s.setChatContext);

  const setBibleContext = useCallback(
    (
      book: string,
      chapter: number,
      selectedVerse?: { verse: number; text: string; translation: Translation }
    ) => {
      setChatContext({
        screenType: 'bible',
        bibleContext: { book, chapter, selectedVerse },
        devotionalContext: undefined,
      });
    },
    [setChatContext]
  );

  const setDevotionalContext = useCallback(
    (
      seriesId: string,
      seriesTitle: string,
      dayNumber: number,
      scriptureRef?: string
    ) => {
      setChatContext({
        screenType: 'devotional',
        devotionalContext: { seriesId, seriesTitle, dayNumber, scriptureRef },
        bibleContext: undefined,
      });
    },
    [setChatContext]
  );

  const setJourneyContext = useCallback(() => {
    setChatContext({
      screenType: 'journey',
      bibleContext: undefined,
      devotionalContext: undefined,
    });
  }, [setChatContext]);

  const setHomeContext = useCallback(() => {
    setChatContext({
      screenType: 'home',
      bibleContext: undefined,
      devotionalContext: undefined,
    });
  }, [setChatContext]);

  const setSettingsContext = useCallback(() => {
    setChatContext({
      screenType: 'settings',
      bibleContext: undefined,
      devotionalContext: undefined,
    });
  }, [setChatContext]);

  const clearContext = useCallback(() => {
    setChatContext({
      screenType: 'other',
      bibleContext: undefined,
      devotionalContext: undefined,
    });
  }, [setChatContext]);

  return {
    setBibleContext,
    setDevotionalContext,
    setJourneyContext,
    setHomeContext,
    setSettingsContext,
    clearContext,
  };
}
