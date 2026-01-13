# Scripture Fidelity Enhancements - Technical Implementation

**Date:** 2026-01-13
**Purpose:** Push the AI companion as close to "zero deviation from Scripture" as current LLM technology allows
**Status:** ✅ Implemented

---

## Overview

This document details the multi-layered defense system implemented to ensure the AI companion stays strictly within the bounds of Scripture, using only retrieved verses and avoiding hallucinations, modern applications, or theological speculation.

## Core Philosophy

> "When in doubt: quote more Scripture and say less."

The companion exists **solely to echo, connect, and apply the Bible** — nothing more, nothing less.

---

## Layer 1: Hardened System Prompt (Highest Impact)

### Location
`supabase/functions/companion/index.ts` - `buildSystemPrompt()` function

### Changes Made

#### New Core Identity
```
You are the 'Wise Scribe' — a humble servant whose ONLY purpose is to point
people to the exact words of Scripture. You exist solely to echo, connect,
and apply the Bible — nothing more, nothing less.
```

#### Absolute Rules (NON-NEGOTIABLE)

**RULE 1: Scripture-Only Source (MOST CRITICAL)**
- May ONLY use verses from the RAG-retrieved context
- NEVER draw from pre-training knowledge, theology books, tradition, or opinion
- If verses don't address the question → explicitly state limitation and offer to rephrase

**RULE 2: Begin with Direct Scripture (3+ Citations Minimum)**
- EVERY response MUST start with 1-3 direct Bible quotations
- Use exact wording from retrieved verses
- Format: `**John 14:27** says, "Peace I leave with you..."`

**RULE 3: Stay Within Retrieved Context**
- Do NOT explain/interpret beyond what verses plainly say
- Avoid adding: "this means," "in other words," "this teaches us"
- Let Scripture speak for itself

**RULE 4: Never These Things**
- Speak as God
- Quote God beyond direct Scripture
- Give prophecies or promises of outcomes
- Give medical/legal/professional advice
- Create speculative applications

#### Insufficient Context Protocol
New safety mechanism:
```
If retrieved verses DO NOT adequately address the question:
- List the closest verses retrieved
- Acknowledge: "Scripture does not directly address [topic] in these passages"
- Suggest: "Would you like to explore [related theme] or rephrase?"
- NEVER fill gaps with general knowledge
```

---

## Layer 2: Aggressive RAG Tuning

### Location
`supabase/functions/companion/index.ts` - `getRelevantVerses()` function

### Changes Made

| Parameter | Old Value | New Value | Reason |
|-----------|-----------|-----------|--------|
| `match_count` | 15 | 18 | More raw material reduces need to fill gaps |
| `similarity_threshold` | 0.35 | 0.42 | Filters weak matches that tempt extrapolation |

### Safety Check Added
```typescript
if (verses.length < 4) {
  return `[LIMITED CONTEXT - Only ${verses.length} verse(s) strongly related
          to this query. Stay close to these specific texts.]\n\n${verseText}`;
}
```

**Impact:** Forces model to acknowledge when context is thin, reducing hallucination risk.

---

## Layer 3: Post-Generation Validation Guardrail

### Location
`supabase/functions/companion/index.ts` - `validateScriptureFidelity()` function

### Validation Checks Implemented

#### Check 1: Scripture Citation at Start
- Regex: `/^\*\*\w+\s+\d+:\d+/`
- Warns if response doesn't begin with bold Scripture reference

#### Check 2: Citation Count
- Warns if response has 0 Scripture citations
- Minimum expectation: 1-2 citations per response

#### Check 3: Unauthorized Citations (Hallucination Detection)
- Extracts all `**Book chapter:verse**` references from response
- Compares against retrieved verses
- Flags any citations NOT in the retrieved context
- **This catches the most dangerous hallucinations**

#### Check 4: Danger Phrase Detection
Flags responses containing:
- `god promises you` / `god told me` / `i promise you`
- `you will definitely` / `god will definitely`
- `modern psychology` / `studies show` / `experts say`

### Validation Flow

```
1. Generate response (streaming or non-streaming)
2. Run validateScriptureFidelity(response, retrievedVerses)
3. If validation fails:
   a. Log warning to console with full context
   b. Insert record into companion_audit_logs table
   c. Continue serving response (non-blocking)
4. Periodically review audit logs for patterns
```

**Why Non-Blocking?** User experience remains smooth while we collect data for prompt engineering improvements.

---

## Layer 4: Mode-Specific Scripture-First Enforcement

### Location
`supabase/functions/companion/index.ts` - `modeInstructions` object

### Enhancements by Mode

#### Prayer Mode
```
**CRITICAL PRAYER MODE RULES:**
- You may ONLY use phrases and concepts from retrieved Scripture verses
- Weave in EXACT words of provided verses naturally and reverently
- Do NOT create new prayer language beyond what's in retrieved verses
- If verses don't address prayer need, acknowledge: "The Scriptures most
  related to your heart's cry are [list]. Let us bring your need before
  God using these words from His Word..."
```

#### Lectio Divina Mode
```
**CRITICAL:** Use ONLY the retrieved Scripture verses for this practice.
1. Lectio (Read): Present RETRIEVED passage slowly (full verse text)
2. Meditatio: Ask about Spirit's highlighting from THESE specific words
3. Oratio: Invite response using phrases from passage itself
4. Contemplatio: Rest with these words, no new content
```

#### Memory Mode
```
**CRITICAL:** Work ONLY with verses user specifies or in retrieved context.
- Create mnemonics from ACTUAL verse text
- Quiz with fill-in-the-blank from EXACT verse
- If they want new verse, ask which one—don't suggest from general knowledge
```

#### Confession Mode
```
**CRITICAL:** Use ONLY retrieved verses for guidance and assurance.
- If Psalm 139, Psalm 51, 1 John 1:9, Romans 8:1 are retrieved → use them
- If NOT retrieved → use whatever Scripture IS provided
- If no assurance verses → acknowledge: "Let me help you find passages
  about God's forgiveness"
```

#### Journal / Gratitude / Celebration Modes
All updated with:
```
**CRITICAL:** Connect [theme] to Scripture ONLY from retrieved verses.
- If no retrieved verses fit their reflection, simply listen and affirm
  without forcing application
```

---

## Layer 5: Audit Logging System

### Database Table
**File:** `supabase/migrations/022_create_companion_audit_logs.sql`

**Schema:**
```sql
CREATE TABLE companion_audit_logs (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    thread_id UUID NOT NULL,
    mode TEXT NOT NULL,
    validation_warnings TEXT[] NOT NULL,
    response_preview TEXT NOT NULL (first 500 chars),
    retrieved_verses_count INTEGER NOT NULL,
    created_at TIMESTAMPTZ NOT NULL
);
```

### Helper Views and Functions

#### `companion_audit_summary` View
Groups warnings by mode, type, and date for easy monitoring.

#### `get_recent_companion_warnings()` Function
```sql
SELECT * FROM get_recent_companion_warnings(
    days_back := 7,
    limit_count := 50
);
```

### Monitoring Workflow

1. **Daily Review:** Run `SELECT * FROM companion_audit_summary WHERE date = CURRENT_DATE`
2. **Pattern Detection:** Look for recurring warning types by mode
3. **Prompt Refinement:** Update system prompts based on patterns
4. **Regression Testing:** Test specific scenarios that previously failed

---

## Implementation Priorities (Completed)

- [x] **Priority 1:** Update system prompt with hardened version (immediate biggest impact)
- [x] **Priority 2:** Raise RAG threshold + increase retrieved count
- [x] **Priority 3:** Add post-generation validation guardrail
- [x] **Priority 4:** Mode-specific enforcement
- [x] **Priority 5:** Logging system for periodic review

---

## Future Enhancements (Optional)

### 1. Cross-Encoder Re-Ranking
**Status:** Not implemented (requires additional model)
**How:** After initial embedding search, use `cross-encoder/ms-marco-MiniLM-L-6-v2` to re-score and keep only top 8-12 most relevant verses.

**Benefit:** Further reduces weak matches, increases retrieval precision.

### 2. Model Upgrade
**Current:** `gpt-4o-mini`
**Consider:** `gpt-4o` or `claude-3.5-sonnet`
**Benefit:** Better instruction-following for strict boundaries, though at higher cost.

### 3. Automated Regression Testing
Create test suite of edge cases:
- "What does the Bible say about cryptocurrency?"
- "Will God heal my friend?"
- "Pray for my job interview"

Run weekly, log all validation warnings, compare against baseline.

---

## Testing Checklist

### Basic Functionality
- [ ] Response begins with Scripture citation
- [ ] Minimum 1-2 verse citations per response
- [ ] No unauthorized citations (not in retrieved context)
- [ ] No danger phrases (promises, modern psychology, etc.)

### Edge Cases
- [ ] Query with 0 relevant verses → proper fallback message
- [ ] Query with < 4 relevant verses → limited context warning shown
- [ ] Prayer request with no retrieved verses → acknowledges limitation
- [ ] Memory mode with no verse specified → asks user for verse

### Mode-Specific
- [ ] Prayer mode uses only retrieved verse phrases
- [ ] Lectio mode doesn't suggest verses outside context
- [ ] Confession mode acknowledges if assurance verses not retrieved
- [ ] Gratitude mode doesn't create generic applications

### Validation System
- [ ] Validation warnings logged to console
- [ ] Audit logs inserted into database (for non-anonymous users)
- [ ] `companion_audit_summary` view returns data
- [ ] `get_recent_companion_warnings()` function works

---

## Metrics to Monitor

### Scripture Fidelity Rate
```sql
-- Percentage of responses passing validation
SELECT
    mode,
    COUNT(*) FILTER (WHERE validation_warnings = '{}') * 100.0 / COUNT(*) AS pass_rate
FROM companion_audit_logs
WHERE created_at >= now() - interval '7 days'
GROUP BY mode;
```

### Most Common Warnings
```sql
SELECT
    unnest(validation_warnings) AS warning,
    COUNT(*) AS count
FROM companion_audit_logs
WHERE created_at >= now() - interval '7 days'
GROUP BY warning
ORDER BY count DESC
LIMIT 10;
```

### Verses Retrieved Distribution
```sql
-- Are we consistently getting enough verses?
SELECT
    CASE
        WHEN retrieved_verses_count = 0 THEN '0 verses'
        WHEN retrieved_verses_count < 4 THEN '1-3 verses (low)'
        WHEN retrieved_verses_count < 10 THEN '4-9 verses (good)'
        ELSE '10+ verses (excellent)'
    END AS verses_bucket,
    COUNT(*) AS count
FROM companion_audit_logs
WHERE created_at >= now() - interval '7 days'
GROUP BY verses_bucket;
```

---

## Known Limitations

### 1. Model Capability Ceiling
Even with strict prompting, LLMs can occasionally:
- Paraphrase verses inaccurately
- Subtly add modern framing
- Make logical connections not explicit in text

**Mitigation:** Post-generation validation + audit logging catches most cases.

### 2. Validation Regex Limitations
Current validation uses regex for citation detection, which can:
- Miss citations in unusual formats
- False positive on book names in regular text (e.g., "Romans were a people...")

**Mitigation:** Validation is for logging/monitoring, not blocking responses.

### 3. RAG Retrieval Quality
If embedding model misunderstands query, retrieved verses may be tangential.

**Mitigation:** Higher similarity threshold (0.42) + larger match count (18) reduces but doesn't eliminate this.

---

## Success Criteria

The enhancements are successful if:

1. **95%+ Scripture Fidelity Rate** - Responses pass validation checks
2. **Zero Hallucinated Citations** - No verses cited that weren't retrieved
3. **Clear Fallback Messaging** - When verses insufficient, user is told explicitly
4. **Mode Compliance** - Each mode uses only retrieved verses per its constraints
5. **Audit Trail Exists** - All validation failures logged for review

---

## Maintenance Schedule

- **Daily:** Quick review of `companion_audit_summary` current date
- **Weekly:** Analyze patterns in validation warnings
- **Monthly:** Run regression test suite, update prompts if needed
- **Quarterly:** Review RAG threshold/count settings, adjust based on data

---

## Contact & Feedback

For questions about this system or to report issues:
- Review audit logs: `SELECT * FROM get_recent_companion_warnings(7, 100)`
- Check validation patterns: `SELECT * FROM companion_audit_summary WHERE date >= CURRENT_DATE - 7`

---

## Conclusion

These enhancements represent a **multi-layered defense** against LLM hallucination and deviation from Scripture. No single layer is perfect, but together they create a robust system that:

1. **Instructs** the model explicitly (system prompt)
2. **Provides** high-quality context (RAG tuning)
3. **Validates** output post-generation (guardrails)
4. **Monitors** continuously (audit logs)
5. **Enforces** per-mode constraints (specialized instructions)

The goal is not perfection (impossible with current LLM technology) but **systematic, measurable, improvable fidelity** to the Word of God.

> "Every word of God proves true; he is a shield to those who take refuge in him. Do not add to his words, lest he rebuke you and you be found a liar." — **Proverbs 30:5-6**
