# Scripture Fidelity Enhancements - Quick Start Guide

## What Changed?

Your AI companion now has **5 defensive layers** to ensure it stays within Scripture:

### 1. 🛡️ Hardened System Prompt
- **New rule:** Only use verses from RAG retrieval (no general knowledge)
- **New rule:** Every response must start with 3+ Scripture citations
- **New rule:** Acknowledge when verses don't address the question

### 2. 🎯 Stricter RAG Retrieval
- **18 verses** retrieved (was 15)
- **0.42 similarity threshold** (was 0.35) - filters weak matches
- **Warning flag** when < 4 verses found

### 3. ✅ Post-Generation Validation
Checks every response for:
- Starts with Scripture citation?
- Contains minimum citations?
- Any unauthorized citations (hallucinations)?
- Any danger phrases ("God promises you definitely...")?

### 4. 📋 Mode-Specific Enforcement
Each spiritual practice mode now has explicit "ONLY use retrieved verses" rules:
- **Prayer mode:** Only use retrieved verse phrases
- **Lectio mode:** Only guide through retrieved passages
- **Memory mode:** Only work with user-specified verses
- **Confession mode:** Acknowledge if assurance verses missing

### 5. 📊 Audit Logging
Failed validation checks are logged to database for monitoring and improvement.

---

## To Deploy

### 1. Run the Database Migration
```bash
# Apply the new audit log table
supabase db push

# Or manually:
psql $DATABASE_URL < supabase/migrations/022_create_companion_audit_logs.sql
```

### 2. Deploy the Updated Edge Function
```bash
# Deploy the companion function with new safeguards
supabase functions deploy companion

# Or if using CI/CD, merge and deploy as usual
```

### 3. Monitor the Results
```sql
-- Check recent validation warnings
SELECT * FROM get_recent_companion_warnings(7, 50);

-- Summary by mode and warning type
SELECT * FROM companion_audit_summary WHERE date >= CURRENT_DATE - 7;
```

---

## Testing

### Quick Smoke Tests

1. **Basic Query:** "What does the Bible say about love?"
   - ✅ Should start with `**1 Corinthians 13:...**` or similar
   - ✅ Should quote exact verse text

2. **Edge Case:** "What does the Bible say about artificial intelligence?"
   - ✅ Should respond: "The verses most related to your question are... Scripture does not directly address artificial intelligence..."

3. **Prayer Request:** "Pray for my anxiety"
   - ✅ Should weave in exact phrases from Philippians 4:6, Psalm 23, etc.
   - ✅ Should NOT create new prayer language

4. **Insufficient Context:** Ask about very niche topic with 0-1 retrieved verses
   - ✅ Should see `[LIMITED CONTEXT - Only X verse(s)...]` warning

---

## Monitoring Queries

### Daily Health Check
```sql
-- How many responses failed validation today?
SELECT COUNT(*)
FROM companion_audit_logs
WHERE DATE(created_at) = CURRENT_DATE;
```

### Most Common Issues
```sql
-- What are the top validation failures?
SELECT
    unnest(validation_warnings) AS warning,
    COUNT(*) AS count
FROM companion_audit_logs
WHERE created_at >= now() - interval '7 days'
GROUP BY warning
ORDER BY count DESC
LIMIT 5;
```

### Mode Performance
```sql
-- Which modes have the most issues?
SELECT
    mode,
    COUNT(*) AS total_warnings,
    AVG(retrieved_verses_count) AS avg_verses
FROM companion_audit_logs
WHERE created_at >= now() - interval '7 days'
GROUP BY mode
ORDER BY total_warnings DESC;
```

---

## Expected Impact

### Before Enhancements
- Responses occasionally drew from general theology knowledge
- Some responses lacked Scripture citations
- Prayer mode could create non-biblical prayer language
- No systematic way to detect/measure fidelity

### After Enhancements
- ✅ **Only retrieved verses used** (enforced by prompt + validation)
- ✅ **3+ citations minimum** per response (enforced)
- ✅ **Hallucination detection** (unauthorized citations flagged)
- ✅ **Audit trail** for continuous improvement
- ✅ **Mode-specific safeguards** for each spiritual practice

### Target Metrics
- **95%+ validation pass rate**
- **0 unauthorized citations** (hallucinations)
- **<5% insufficient context** warnings

---

## Rollback Plan (If Needed)

If issues arise:

### 1. Revert Edge Function
```bash
# Revert to previous version
git revert <commit-hash>
supabase functions deploy companion
```

### 2. Keep Database Migration
The audit log table is harmless and useful for monitoring, so keep it.

### 3. Adjust Validation Strictness
If validation is too aggressive, modify `validateScriptureFidelity()` checks in the code.

---

## Next Steps (Optional)

### Short-term (Week 1)
- [ ] Monitor audit logs daily
- [ ] Test edge cases manually
- [ ] Adjust prompts based on patterns

### Medium-term (Month 1)
- [ ] Analyze validation patterns
- [ ] Consider model upgrade (gpt-4o vs gpt-4o-mini)
- [ ] Add re-ranking layer if needed

### Long-term (Quarter 1)
- [ ] Build automated regression test suite
- [ ] Implement A/B testing framework
- [ ] Fine-tune embedding model for better retrieval

---

## Support

- **Documentation:** See `SCRIPTURE_FIDELITY_ENHANCEMENTS.md` for full technical details
- **Code Changes:** See `supabase/functions/companion/index.ts` (lines 331-625)
- **Database Schema:** See `supabase/migrations/022_create_companion_audit_logs.sql`

---

## Questions?

Common concerns:

**Q: Will this make responses less helpful?**
A: No. Responses will be MORE grounded in Scripture, which is the point. If verses don't address a query, the companion will acknowledge that honestly.

**Q: What if users complain about "limited context" warnings?**
A: This is a feature, not a bug. It's better to acknowledge Scripture's silence on modern topics than to create false applications.

**Q: How do I tune the validation if it's too strict?**
A: Modify the `validateScriptureFidelity()` function in `companion/index.ts` - adjust regex patterns or comment out specific checks.

**Q: Can I disable validation temporarily?**
A: Yes, comment out the validation calls in lines ~1150 and ~1233, but keep the audit logging infrastructure for future use.

---

## Success Indicator

If you see this response pattern consistently, the enhancements are working:

```
**Philippians 4:6-7** says, "Do not be anxious about anything, but in every
situation, by prayer and petition, with thanksgiving, present your requests
to God. And the peace of God, which transcends all understanding, will guard
your hearts and your minds in Christ Jesus."

**Psalm 55:22** adds, "Cast your cares on the Lord and he will sustain you."

These verses speak directly to anxiety by inviting us to bring our worries
to God in prayer. The promise is His peace—not the absence of circumstances,
but a guarding of our hearts even in the midst of them.

What specific worry feels heaviest today?
```

✅ Starts with Scripture
✅ Exact quotations
✅ Close to text meaning
✅ Invites continued reflection

---

**Deployment Date:** 2026-01-13
**Status:** ✅ Ready to Deploy
