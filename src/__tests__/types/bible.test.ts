import { TRANSLATIONS, AVAILABLE_TRANSLATIONS, getTranslationsByLanguage, type BibleVerse } from '../../types/domain/bible';

describe('Bible Types', () => {
  describe('TRANSLATIONS', () => {
    it('should have at least 10 translations', () => {
      expect(TRANSLATIONS.length).toBeGreaterThanOrEqual(10);
    });

    it('should have KJV as available', () => {
      const kjv = TRANSLATIONS.find((t) => t.id === 'KJV');
      expect(kjv).toBeDefined();
      expect(kjv?.isAvailable).toBe(true);
    });

    it('should have all required fields for each translation', () => {
      TRANSLATIONS.forEach((translation) => {
        expect(translation).toHaveProperty('id');
        expect(translation).toHaveProperty('name');
        expect(translation).toHaveProperty('description');
        expect(translation).toHaveProperty('language');
        expect(translation).toHaveProperty('isAvailable');
      });
    });
  });

  describe('AVAILABLE_TRANSLATIONS', () => {
    it('should only contain available translations', () => {
      AVAILABLE_TRANSLATIONS.forEach((t) => {
        expect(t.isAvailable).toBe(true);
      });
    });

    it('should be a subset of TRANSLATIONS', () => {
      expect(AVAILABLE_TRANSLATIONS.length).toBeLessThanOrEqual(TRANSLATIONS.length);
    });
  });

  describe('getTranslationsByLanguage', () => {
    it('should return English translations', () => {
      const english = getTranslationsByLanguage('English');
      expect(english.length).toBeGreaterThan(0);
      english.forEach((t) => {
        expect(t.language).toBe('English');
      });
    });

    it('should return Spanish translations', () => {
      const spanish = getTranslationsByLanguage('Español');
      expect(spanish.length).toBeGreaterThan(0);
      spanish.forEach((t) => {
        expect(t.language).toBe('Español');
      });
    });

    it('should return empty array for unknown language', () => {
      const unknown = getTranslationsByLanguage('Klingon');
      expect(unknown).toEqual([]);
    });
  });

  describe('BibleVerse type', () => {
    it('should accept valid verse objects', () => {
      const verse: BibleVerse = {
        book: 'John',
        chapter: 3,
        verse: 16,
        text: 'For God so loved the world...',
      };

      expect(verse.book).toBe('John');
      expect(verse.chapter).toBe(3);
      expect(verse.verse).toBe(16);
      expect(verse.text).toContain('God');
    });
  });
});
