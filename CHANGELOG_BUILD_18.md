# ChooseGOD Changelog - Build 18 (Since Build 17)

**Build Version:** 1.0.0 (Build 18)
**Date Range:** December 2025 - January 13, 2026
**Total Commits:** 110+

---

## 🎯 Major Features & Enhancements

### 1. Scripture Fidelity System (January 13, 2026) ⭐️ NEW
**The Most Significant Update** - Multi-layered defense system to ensure AI companion stays within Scripture

#### A. Hardened System Prompt
- **Added "ABSOLUTE RULES YOU MUST NEVER BREAK"** - Explicit boundaries preventing deviation
- **RULE 1:** Only use verses from RAG retrieval (no pre-training knowledge, theology books, or tradition)
- **RULE 2:** Begin every response with 3+ direct Scripture citations
- **RULE 3:** Stay within retrieved context (no speculation or modern applications)
- **RULE 4:** Never speak as God, give prophecies, or make promises of outcomes
- **"Insufficient Context Protocol"** - Honest acknowledgment when Scripture doesn't address a topic

#### B. Aggressive RAG Tuning
- **Increased verse retrieval:** 15 → 18 verses per query
- **Raised similarity threshold:** 0.35 → 0.42 (filters weak matches)
- **Added safety check:** Warns when < 4 verses found, preventing extrapolation

#### C. Post-Generation Validation System
- **Validates every response** for Scripture fidelity
- **Checks:**
  - Starts with Scripture citation?
  - Contains minimum citations?
  - Any unauthorized citations (hallucinations)?
  - Any danger phrases ("God promises you definitely...", "modern psychology", etc.)?
- **Integrated in both streaming and non-streaming modes**

#### D. Mode-Specific Enforcement
- **Prayer Mode:** Only use retrieved verse phrases (no generic prayer language)
- **Lectio Divina:** Only guide through retrieved passages
- **Memory Mode:** Only work with user-specified verses
- **Confession Mode:** Acknowledge if assurance verses not retrieved
- **All Modes:** Explicit "ONLY use retrieved verses" rules

#### E. Audit Logging Infrastructure
- **New database table:** `companion_audit_logs` - Tracks validation failures
- **Helper view:** `companion_audit_summary` - Pattern analysis by mode/type
- **Helper function:** `get_recent_companion_warnings()` - Quick monitoring
- **Logs:** Warnings, response preview, mode, verse count for continuous improvement

**Files Changed:**
- `supabase/functions/companion/index.ts` (243 insertions, 59 deletions)
- `supabase/migrations/022_create_companion_audit_logs.sql` (new)
- `SCRIPTURE_FIDELITY_ENHANCEMENTS.md` (full technical guide)
- `SCRIPTURE_FIDELITY_QUICK_START.md` (deployment guide)
- `DEPLOYMENT_SUCCESS.md` (deployment summary)

**Target Metrics:**
- 95%+ validation pass rate
- 0 hallucinated citations
- < 5% insufficient context warnings

---

### 2. Dynamic Journey Screen Transformation
**Transformed static tabs into dynamic spiritual dashboard**

#### Features
- **Wayfarer Progress Card** with real milestones from database
  - Shows current level (Seeker, Disciple, Ambassador)
  - Displays actual streak days and verses memorized
  - "Catch up" indicator for missed devotionals
  - Animated progress bar and achievement badges
- **Daily Focus Carousel** with personalized wisdom
  - Rotates through 5 encouraging prompts
  - Smooth auto-scroll every 10 seconds
  - Based on user's spiritual journey stage
- **Community Count** with live member count from Supabase
- **Dynamic greeting** based on time of day and user name
- **Scripture Scan feature** (future: camera-based verse lookup)

**Files Changed:**
- `src/screens/JourneyScreen.tsx` (complete rewrite)
- `src/components/WayfarerProgressCard.tsx` (new)
- `src/components/DailyFocusCarousel.tsx` (new)
- `src/hooks/useWayfarerMilestones.ts` (new)
- `src/hooks/useCommunityCount.ts` (new)
- `src/hooks/useGreeting.ts` (new)
- `src/hooks/useScriptureScan.ts` (new - placeholder)

---

### 3. NIV Bible Translation Support
**Added New International Version (NIV) to app**

#### Implementation
- Full NIV text seeded to database (31,102 verses)
- Vector embeddings for semantic search (GPT-4 generated)
- Translation selector working across all screens
- **Database scripts:**
  - `seed-niv-bible.js` - Full NIV with embeddings
  - `seed-niv-no-embeddings.js` - NIV text only
  - `add-niv-embeddings.js` - Batch embedding generation

**Files Changed:**
- `supabase/scripts/seed-niv-bible.js` (new)
- `supabase/scripts/seed-niv-no-embeddings.js` (new)
- `supabase/scripts/add-niv-embeddings.js` (new)

---

### 4. Notification System Enhancements
**Fixed independent notification toggles and improved coordination**

#### Changes
- **Separate morning and evening notifications** (previously combined)
  - Morning: Daily Devotional reminder
  - Evening: Daily Wisdom reflection
- **Independent toggles** - Can enable/disable each separately
- **Proper database schema:**
  - `morning_notification_time` (devotional)
  - `evening_notification_time` (wisdom)
  - `morning_notifications_enabled` boolean
  - `evening_notifications_enabled` boolean
- **Coordination documented** in `DAILY_WISDOM_NOTIFICATION_COORDINATION.md`

**Files Changed:**
- `src/lib/notifications.ts` (scheduling logic)
- `src/screens/SettingsScreen.tsx` (UI toggles)
- Database schema updates

---

### 5. Text Truncation Fixes
**Fixed widespread text truncation issues across all screens**

#### Solution
- **Created `AppText` component** - Reusable text wrapper preventing truncation
- **Fixed screens:**
  - Home screen (daily verse, streaks, journal prompts)
  - Journey screen (progress messages, community count)
  - Daily Devotional screen (devotional text, reflection questions)
- **Root cause:** Missing `flex: 1` on parent containers + `flexShrink: 1` on text

**Files Changed:**
- `src/components/AppText.tsx` (new)
- `src/screens/HomeScreen.tsx` (applied fixes)
- `src/screens/JourneyScreen.tsx` (applied fixes)
- `src/screens/DailyDevotionalScreen.tsx` (applied fixes)
- `TEXT_TRUNCATION_FIXES.md` (comprehensive documentation)

---

### 6. Translation Availability Fixes
**Fixed incorrect translation availability based on database audit**

#### Changes
- **KJV:** ✅ Full support (31,102 verses)
- **ESV:** ✅ Full support (31,086 verses)
- **NIV:** ✅ Full support (31,102 verses)
- **CUV (Chinese Union Version):** ⚠️ Partial (23,145 verses - Old Testament only)
- **Removed fake availability** for translations not in database
- **Updated UI** to accurately reflect available translations

**Files Changed:**
- Translation selector logic
- Settings screen

---

### 7. Code Quality & Security Improvements

#### ESLint Integration
- **Added ESLint configuration** with React Native best practices
- **Centralized constants:**
  - `src/constants/chatModes.ts` - Chat mode labels and helpers
  - `src/constants/subscription.ts` - Premium/free tier configs
  - `src/constants/limits.ts` - App-wide limits
  - `src/constants/animations.ts` - Animation timings

#### Security Enhancements
- **Added `.claudeignore`** for sensitive file exclusion
- **Removed `supabase/.temp/`** from version control
- **Cleaned up ignored files** from repository
- **Security audit reports:**
  - `SECURITY_AUDIT_REPORT.md` (comprehensive)
  - `FINAL_SECURITY_AUDIT_REPORT.md` (deployment-ready)
  - `SECURITY_QUICK_REFERENCE.md` (quick checklist)

#### Database Migrations
- `013_fix_all_linter_warnings.sql` - Function cleanup
- `020_create_verse_views.sql` - Optimized verse queries
- `021_add_ab_testing_and_security.sql` - A/B testing + security
- `022_create_companion_audit_logs.sql` - Scripture fidelity logging

---

## 🐛 Bug Fixes

### iOS Build Issues
- **Fixed chat bottom sheet dismiss** - Now dismisses properly on iOS
- **Fixed keyboard handling** - Proper safe area insets
- **Added iOS dev build config** in `eas.json`

### Notification Issues
- **Fixed toggles not working independently** - Morning/evening now separate
- **Fixed notification persistence** - Properly saves to database
- **Fixed timing coordination** - Morning and evening don't conflict

### Text Display Issues
- **Fixed truncation across all screens** - Text now wraps properly
- **Fixed overflow in cards** - Proper flex layouts
- **Fixed long verse text** - Scrollable containers

### Translation Issues
- **Fixed CUV showing as "full support"** - Now shows partial (OT only)
- **Fixed missing NIV** - Now fully available
- **Fixed translation selector** - Accurately reflects database content

---

## 📁 New Files Created

### Documentation
- `SCRIPTURE_FIDELITY_ENHANCEMENTS.md` - Full technical implementation
- `SCRIPTURE_FIDELITY_QUICK_START.md` - Quick deployment guide
- `DEPLOYMENT_SUCCESS.md` - Deployment confirmation
- `DAILY_WISDOM_NOTIFICATION_COORDINATION.md` - Notification system docs
- `TEXT_TRUNCATION_FIXES.md` - Text truncation solutions
- `SECURITY_AUDIT_REPORT.md` - Security review
- `FINAL_SECURITY_AUDIT_REPORT.md` - Final security status
- `SECURITY_QUICK_REFERENCE.md` - Security checklist
- `DEPLOYMENT_COMPLETE.md` - Previous deployment summary
- `ENHANCEMENT_SUMMARY.md` - Feature summary
- `JOURNEY_SCREEN_PRE_DEPLOYMENT.md` - Journey screen status

### Components
- `src/components/AppText.tsx` - Reusable text wrapper
- `src/components/DailyFocusCarousel.tsx` - Journey screen carousel
- `src/components/WayfarerProgressCard.tsx` - Progress card with milestones
- `src/screens/CameraScreen.tsx` - Scripture scan feature (placeholder)

### Hooks
- `src/hooks/useWayfarerMilestones.ts` - Fetch user milestones
- `src/hooks/useCommunityCount.ts` - Live member count
- `src/hooks/useGreeting.ts` - Dynamic greeting
- `src/hooks/useScriptureScan.ts` - Camera-based lookup (future)

### Database
- `supabase/migrations/022_create_companion_audit_logs.sql` - Audit logging
- `supabase/functions/export-user-data/` - GDPR data export
- `supabase/functions/scripture-scan/` - Future camera feature
- `supabase/scripts/seed-niv-bible.js` - NIV seeding
- `supabase/scripts/add-niv-embeddings.js` - Embedding generation
- `supabase/scripts/find-user-by-email.js` - User lookup utility
- `supabase/scripts/search-users.js` - User search utility
- `supabase/scripts/seed-missing-cuv.js` - CUV gap filling
- `supabase/scripts/seed-missing-verses.js` - General gap filling

### Configuration
- `.claudeignore` - Claude AI exclusion rules
- ESLint configuration updates

---

## 📊 Database Changes

### New Tables
- `companion_audit_logs` - Scripture fidelity monitoring
  - Columns: user_id, thread_id, mode, validation_warnings, response_preview, retrieved_verses_count
  - Indexes: user_id, created_at, mode, warnings (GIN)
  - Policies: Service role only (admin access)

### New Views
- `companion_audit_summary` - Aggregated warning patterns

### New Functions
- `get_recent_companion_warnings(days_back, limit_count)` - Helper for monitoring

### Data Additions
- **31,102 NIV verses** with full semantic embeddings
- Missing CUV verses (where available)
- General verse gap filling

---

## 🔧 Configuration Changes

### Package Dependencies
- **Added:** ESLint and plugins
- **Updated:** Various React Native and Expo packages
- **Voice recognition:** expo-speech-recognition configured

### Build Configuration
- **iOS bundle identifier:** `com.choosegod.app`
- **Android package:** `com.choosegod.app`
- **Runtime version:** Follows app version (1.0.0)
- **EAS project ID:** 50d7d10e-37a3-49be-90cb-1f5f96ea070c

---

## 📈 Performance Improvements

### RAG System
- **18 verses retrieved** (up from 15) - More context
- **0.42 similarity threshold** (up from 0.35) - Higher quality matches
- **Faster embedding generation** with batch processing

### UI Rendering
- **Optimized text rendering** with AppText component
- **Reduced re-renders** with proper memo usage
- **Improved animation performance** in Journey screen

---

## 🎨 UI/UX Improvements

### Journey Screen
- **Modern card-based layout** replacing old tabs
- **Animated progress indicators** with milestone tracking
- **Live community counter** creating sense of connection
- **Time-aware greetings** personalizing experience
- **Auto-scrolling carousel** with encouraging messages

### Notifications
- **Clearer toggle labels** (Morning Devotional vs Evening Wisdom)
- **Independent controls** for better user control
- **Better visual feedback** when toggling

### Text Display
- **Proper word wrapping** throughout app
- **No more cut-off text** in cards and lists
- **Scrollable long content** where appropriate

---

## 🧪 Testing & Quality Assurance

### Validation System
- **Automated checks** on every AI response
- **Hallucination detection** catching unauthorized citations
- **Pattern recognition** for problematic phrases
- **Logging infrastructure** for continuous improvement

### Code Quality
- **ESLint enforcement** catching common issues
- **Type safety** with TypeScript
- **Consistent formatting** across codebase
- **Centralized constants** reducing magic strings

---

## 📚 Documentation Updates

### Technical Documentation
- 5 new comprehensive technical guides
- Security audit reports
- Deployment procedures
- API documentation updates

### User-Facing
- Updated onboarding flows
- Clearer feature descriptions
- Better error messages

---

## 🚀 Deployment Status

### Live Now
- ✅ Scripture Fidelity System deployed
- ✅ Journey Screen transformation deployed
- ✅ NIV translation available
- ✅ Notification fixes deployed
- ✅ Text truncation fixes deployed
- ✅ All database migrations applied

### Edge Functions
- ✅ `companion` - Enhanced with validation
- ✅ `query-bible` - Updated with new translations
- ✅ `export-user-data` - GDPR compliance
- ✅ `scripture-scan` - Prepared for future

---

## 🔮 Future Enhancements Prepared

### Scripture Scan
- Camera screen UI ready
- Hook scaffolding complete
- Edge function prepared
- Awaiting OCR integration

### A/B Testing Framework
- Database schema ready (`021_add_ab_testing_and_security.sql`)
- Ready for feature flag rollouts
- Analytics tracking prepared

### Cross-Encoder Re-Ranking
- Optional enhancement for RAG system
- Would improve retrieval precision
- Documented in Scripture fidelity guide

---

## 📝 Breaking Changes

### None
All changes are backward compatible. Existing users will seamlessly upgrade.

---

## 🐛 Known Issues

### None Critical
All blocking issues resolved in this build.

### Minor
- CUV translation partial (Old Testament only) - documented and UI updated
- Scripture scan placeholder (future feature)

---

## 👥 Contributors

- Bobby Hansen Jr. (Product & Development)
- Claude Sonnet 4.5 (AI Pair Programming)

---

## 📊 Statistics

- **Total Commits:** 110+
- **Files Changed:** 50+
- **Lines Added:** ~5,000+
- **Lines Removed:** ~500+
- **New Components:** 7
- **New Hooks:** 4
- **New Database Objects:** 4 (1 table, 1 view, 2 functions)
- **Documentation Pages:** 10+

---

## 🎯 Success Metrics (Targets)

### Scripture Fidelity
- Target: **95%+ validation pass rate** ⏳ Monitoring
- Target: **0 hallucinated citations** ⏳ Monitoring
- Target: **< 5% insufficient context warnings** ⏳ Monitoring

### User Engagement
- Journey screen interaction rates ⏳ To measure
- Notification response rates ⏳ To measure
- Translation usage distribution ⏳ To measure

---

## 🔗 Related Documentation

- [SCRIPTURE_FIDELITY_ENHANCEMENTS.md](SCRIPTURE_FIDELITY_ENHANCEMENTS.md) - Full technical guide
- [SCRIPTURE_FIDELITY_QUICK_START.md](SCRIPTURE_FIDELITY_QUICK_START.md) - Quick deployment
- [DEPLOYMENT_SUCCESS.md](DEPLOYMENT_SUCCESS.md) - Deployment confirmation
- [TEXT_TRUNCATION_FIXES.md](TEXT_TRUNCATION_FIXES.md) - Text display solutions
- [SECURITY_AUDIT_REPORT.md](SECURITY_AUDIT_REPORT.md) - Security review

---

**Build 18 Status:** ✅ Deployed to Production
**Date:** January 13, 2026
**Next Build:** TBD
