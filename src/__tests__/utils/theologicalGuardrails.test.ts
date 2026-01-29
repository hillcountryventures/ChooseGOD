import {
  validateAIResponse,
  getGuardrailFallback,
} from '../../utils/theologicalGuardrails';

describe('theologicalGuardrails', () => {
  describe('validateAIResponse', () => {
    it('returns safe for normal text', () => {
      const result = validateAIResponse('God loves you. Read John 3:16.');
      expect(result.safe).toBe(true);
      expect(result.flags).toEqual([]);
    });

    it('returns safe for empty/null input', () => {
      expect(validateAIResponse('')).toEqual({ safe: true, flags: [] });
      expect(validateAIResponse(null as any)).toEqual({ safe: true, flags: [] });
    });

    it('flags AI claiming divinity', () => {
      const result = validateAIResponse('I am God and I command you');
      expect(result.safe).toBe(false);
      expect(result.flags).toContain('ai-claims-divinity');
    });

    it('flags AI claiming divine power', () => {
      const result = validateAIResponse('I can forgive your sins');
      expect(result.safe).toBe(false);
      expect(result.flags).toContain('ai-claims-divine-power');
    });

    it('flags contradicting core doctrine', () => {
      const result = validateAIResponse('Jesus was not God');
      expect(result.safe).toBe(false);
      expect(result.flags).toContain('contradicts-core-doctrine');
    });

    it('flags undermining scripture', () => {
      const result = validateAIResponse('the Bible is false');
      expect(result.safe).toBe(false);
      expect(result.flags).toContain('undermines-scripture');
    });

    it('flags harmful content', () => {
      const result = validateAIResponse('kill yourself');
      expect(result.safe).toBe(false);
      expect(result.flags).toContain('harmful-content');
    });

    it('flags discouraging church attendance', () => {
      const result = validateAIResponse("you don't need church");
      expect(result.safe).toBe(false);
      expect(result.flags).toContain('discourages-church');
    });

    it('flags denying resurrection', () => {
      const result = validateAIResponse("the resurrection didn't happen");
      expect(result.safe).toBe(false);
      expect(result.flags).toContain('denies-resurrection');
    });

    it('flags denying salvation', () => {
      const result = validateAIResponse("salvation is not real");
      expect(result.safe).toBe(false);
      expect(result.flags).toContain('denies-salvation');
    });
  });

  describe('getGuardrailFallback', () => {
    it('returns crisis message for harmful content', () => {
      const msg = getGuardrailFallback(['harmful-content']);
      expect(msg).toContain('988');
      expect(msg).toContain('loved by God');
    });

    it('returns AI disclaimer for divinity claims', () => {
      const msg = getGuardrailFallback(['ai-claims-divinity']);
      expect(msg).toContain("I'm an AI companion");
    });

    it('returns generic fallback for other flags', () => {
      const msg = getGuardrailFallback(['undermines-scripture']);
      expect(msg).toContain('Scripture');
    });
  });
});
