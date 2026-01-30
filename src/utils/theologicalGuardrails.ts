/**
 * Theological Guardrails — Client-side AI output validation
 *
 * Scans AI responses for red flags before displaying to users.
 * This is a defense-in-depth layer — the backend prompt engineering
 * is the primary safeguard, but this catches edge cases.
 */

export interface GuardrailResult {
  safe: boolean;
  flags: string[];
}

interface FlagPattern {
  pattern: RegExp;
  flag: string;
}

/**
 * Patterns that indicate problematic AI output.
 * Each pattern has a regex and a human-readable flag description.
 */
const FLAG_PATTERNS: FlagPattern[] = [
  // AI claiming divinity or divine authority (including contractions)
  {
    pattern: /\b(I am God|I'm God|I am the Lord|I'm the Lord|I am Jesus|I'm Jesus|I am Christ|I'm Christ|I am the Holy Spirit|I'm the Holy Spirit|I am your savior|I'm your savior|I am divine|I'm divine|worship me)\b/i,
    flag: 'ai-claims-divinity',
  },
  {
    pattern: /\b(I (?:can |will )?forgive your sins|I (?:can |will )?save you|I (?:can |will )?grant (?:you )?eternal life|I (?:can |will )?answer your prayers)\b/i,
    flag: 'ai-claims-divine-power',
  },

  // Contradicting core Christian doctrine
  {
    pattern: /\b(Jesus (?:was not|wasn't|is not|isn't) (?:God|divine|the Son of God)|there is no God|God (?:does not|doesn't) exist)\b/i,
    flag: 'contradicts-core-doctrine',
  },
  {
    pattern: /\b(the Bible(?:'s| is) (?:false|wrong|unreliable|a lie|fiction)|Scripture (?:cannot|can't) be trusted)\b/i,
    flag: 'undermines-scripture',
  },
  {
    pattern: /\b(salvation (?:is not|isn't) (?:real|possible|through|by)|you don't need (?:Jesus|God|faith|salvation))\b/i,
    flag: 'denies-salvation',
  },
  {
    pattern: /\b(the resurrection (?:didn't|did not|never) happen|Jesus (?:didn't|did not|never) rise)\b/i,
    flag: 'denies-resurrection',
  },

  // Inappropriate content
  {
    pattern: /\b(kill yourself|suicide is the answer|end your life|you should die|harm yourself)\b/i,
    flag: 'harmful-content',
  },
  {
    pattern: /\b(sexually explicit|pornograph|graphic sexual)\b/i,
    flag: 'inappropriate-sexual-content',
  },

  // AI overstepping its role
  {
    pattern: /\b(you don't need (?:a |to go to )?church|stop (?:going to|attending) church|churches are (?:bad|evil|corrupt|unnecessary))\b/i,
    flag: 'discourages-church',
  },
  {
    pattern: /\b(you don't need a pastor|pastors are (?:all )?(?:bad|evil|liars|corrupt)|ignore your (?:pastor|priest|minister))\b/i,
    flag: 'undermines-pastoral-authority',
  },
];

/**
 * Validate an AI response against theological guardrails.
 *
 * @param response - The AI-generated text to validate
 * @returns GuardrailResult with safety status and any flags triggered
 */
export function validateAIResponse(response: string): GuardrailResult {
  // Fix 6: Empty/whitespace responses are unsafe
  if (!response || typeof response !== 'string' || response.trim().length === 0) {
    return { safe: false, flags: ['empty-response'] };
  }

  const flags: string[] = [];

  for (const { pattern, flag } of FLAG_PATTERNS) {
    if (pattern.test(response)) {
      flags.push(flag);
    }
  }

  return {
    safe: flags.length === 0,
    flags,
  };
}

/**
 * Get a safe fallback message when guardrails are triggered.
 */
export function getGuardrailFallback(flags: string[]): string {
  if (flags.includes('empty-response')) {
    return "I wasn't able to generate a response. Let me try again — what would you like to explore in Scripture?";
  }

  if (flags.includes('harmful-content')) {
    return "I'm here to support you. If you're struggling, please reach out to a pastor, counselor, or call 988 (Suicide & Crisis Lifeline). You are loved by God. 💛";
  }

  if (flags.includes('ai-claims-divinity') || flags.includes('ai-claims-divine-power')) {
    return "I want to be clear — I'm an AI companion, not God. Only the Lord can forgive sins, save, and grant eternal life. Let me help you explore what Scripture says instead.";
  }

  return "I want to make sure I'm pointing you to truth. Let me rephrase that with Scripture as my guide. What would you like to explore?";
}
