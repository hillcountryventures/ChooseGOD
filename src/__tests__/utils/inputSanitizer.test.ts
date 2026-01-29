import {
  sanitizeSearchQuery,
  sanitizeUserInput,
  sanitizeChatMessage,
} from '../../utils/inputSanitizer';

describe('inputSanitizer', () => {
  describe('sanitizeSearchQuery', () => {
    it('returns empty string for empty input', () => {
      expect(sanitizeSearchQuery('')).toBe('');
    });

    it('returns empty string for non-string input', () => {
      expect(sanitizeSearchQuery(null as any)).toBe('');
      expect(sanitizeSearchQuery(undefined as any)).toBe('');
    });

    it('trims whitespace', () => {
      expect(sanitizeSearchQuery('  John 3:16  ')).toBe('John 3:16');
    });

    it('allows Bible reference characters', () => {
      expect(sanitizeSearchQuery('Genesis 1:1-3')).toBe('Genesis 1:1-3');
      expect(sanitizeSearchQuery('Psalm 23')).toBe('Psalm 23');
      expect(sanitizeSearchQuery("God's love")).toBe("God's love");
    });

    it('strips HTML tags', () => {
      expect(sanitizeSearchQuery('<b>John</b>')).toBe('John');
    });

    it('removes script tags', () => {
      const result = sanitizeSearchQuery('<script>alert("xss")</script>');
      expect(result).not.toContain('<script');
      expect(result).not.toContain('</script>');
    });

    it('removes SQL injection patterns', () => {
      const result = sanitizeSearchQuery('John; DROP TABLE users');
      expect(result).not.toMatch(/drop\s+table/i);
    });

    it('enforces max length of 500', () => {
      const long = 'a'.repeat(600);
      expect(sanitizeSearchQuery(long).length).toBeLessThanOrEqual(500);
    });

    it('removes control characters', () => {
      expect(sanitizeSearchQuery('John\x00 3:16')).toBe('John 3:16');
    });
  });

  describe('sanitizeUserInput', () => {
    it('returns empty string for falsy input', () => {
      expect(sanitizeUserInput('')).toBe('');
    });

    it('enforces max length of 1000', () => {
      const long = 'x'.repeat(1200);
      expect(sanitizeUserInput(long).length).toBeLessThanOrEqual(1000);
    });

    it('strips dangerous patterns', () => {
      expect(sanitizeUserInput('hello <script>bad</script>')).not.toContain('script');
    });
  });

  describe('sanitizeChatMessage', () => {
    it('returns empty for empty', () => {
      expect(sanitizeChatMessage('')).toBe('');
    });

    it('enforces max length of 2000', () => {
      const long = 'y'.repeat(2500);
      expect(sanitizeChatMessage(long).length).toBeLessThanOrEqual(2000);
    });

    it('removes javascript: protocol', () => {
      const result = sanitizeChatMessage('click javascript:alert(1)');
      expect(result).not.toContain('javascript:');
    });
  });
});
