import { generateVerseLink, generateReferralLink, parseDeepLink } from '../../utils/deepLinks';

describe('deepLinks', () => {
  describe('generateVerseLink', () => {
    it('generates a verse URL', () => {
      const link = generateVerseLink('John', 3, 16);
      expect(link).toBe('https://choosegod.app/verse/John/3/16');
    });

    it('encodes book names with spaces', () => {
      const link = generateVerseLink('1 Corinthians', 13, 4);
      expect(link).toContain('1%20Corinthians');
    });
  });

  describe('generateReferralLink', () => {
    it('generates a referral URL', () => {
      const link = generateReferralLink('ABC123');
      expect(link).toBe('https://choosegod.app/refer/ABC123');
    });
  });

  describe('parseDeepLink', () => {
    it('parses a verse universal link', () => {
      const route = parseDeepLink('https://choosegod.app/verse/John/3/16');
      expect(route).toEqual({ type: 'verse', book: 'John', chapter: 3, verse: 16 });
    });

    it('parses a verse custom scheme link', () => {
      const route = parseDeepLink('choosegod://verse/Psalms/23/1');
      expect(route).toEqual({ type: 'verse', book: 'Psalms', chapter: 23, verse: 1 });
    });

    it('parses a referral link', () => {
      const route = parseDeepLink('https://choosegod.app/refer/XYZ');
      expect(route).toEqual({ type: 'referral', code: 'XYZ' });
    });

    it('parses an invite link (legacy)', () => {
      const route = parseDeepLink('https://choosegod.app/invite/ABC');
      expect(route).toEqual({ type: 'referral', code: 'ABC' });
    });

    it('returns unknown for unrecognized paths', () => {
      const route = parseDeepLink('https://choosegod.app/settings');
      expect(route.type).toBe('unknown');
    });

    it('handles malformed URLs gracefully', () => {
      const route = parseDeepLink('not-a-url');
      expect(route.type).toBe('unknown');
    });
  });
});
