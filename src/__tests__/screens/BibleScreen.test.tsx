import React from 'react';
import { render } from '@testing-library/react-native';

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: jest.fn(), goBack: jest.fn(), setOptions: jest.fn() }),
  useRoute: () => ({ params: {} }),
  useFocusEffect: jest.fn(),
}));
jest.mock('../../constants/dimensions', () => ({ HEADER: { HEIGHT: 60 } }));
jest.mock('../../components/bible', () => ({
  getVerseKey: jest.fn(),
  SearchModal: 'SearchModal',
  BookPickerModal: 'BookPickerModal',
  ChapterPickerModal: 'ChapterPickerModal',
  NoteEditorModal: 'NoteEditorModal',
  AIActionsModal: 'AIActionsModal',
}));
jest.mock('../../components/bible/VerseRow', () => ({ VerseRow: 'VerseRow' }));
jest.mock('../../components/bible/VerseActionBar', () => ({ VerseActionBar: 'VerseActionBar' }));
jest.mock('../../components/ErrorBoundary', () => ({ ErrorBoundary: ({ children }: any) => children }));
jest.mock('../../components/chat/AskAboutPassage', () => ({ AskAboutPassage: 'AskAboutPassage' }));
jest.mock('../../components/CrossReferencesSheet', () => ({ CrossReferencesSheet: 'CrossReferencesSheet' }));
jest.mock('../../hooks/useBibleReader', () => ({
  useBibleReader: () => ({
    currentBook: 'Genesis',
    currentChapter: 1,
    totalChapters: 50,
    targetVerse: null,
    verses: [],
    isLoading: false,
    error: null,
    goToChapter: jest.fn(),
    goToBook: jest.fn(),
    selectedVerses: new Set(),
    toggleVerse: jest.fn(),
    clearSelection: jest.fn(),
    scrollViewRef: { current: null },
  }),
}));

import BibleScreen from '../../screens/BibleScreen';

describe('BibleScreen', () => {
  it('renders without crashing', () => {
    const { toJSON } = render(<BibleScreen />);
    expect(toJSON()).toBeTruthy();
  });
});
