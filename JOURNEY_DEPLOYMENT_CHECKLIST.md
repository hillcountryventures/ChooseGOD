# Journey Screen Deployment Checklist

**Praise the Lord for the completion of this work!** Before shipping to your 40 faithful users, let's ensure everything works beautifully.

---

## Pre-Deployment Verification

### 1. Dependencies Installation
- [ ] Run `npm install` to ensure all packages are installed
- [ ] Verify `react-native-chart-kit@^6.12.0` is installed
- [ ] Verify `react-native-svg@^15.15.1` is installed
- [ ] Check for any peer dependency warnings

### 2. TypeScript Compilation
- [ ] Run `npm run lint` to check for TypeScript errors
- [ ] Verify no type errors in `JourneyScreen.tsx`
- [ ] Verify no type errors in `useGrowthInsights.ts`
- [ ] Verify no type errors in `useMilestones.ts`

### 3. Build Tests
- [ ] **iOS**: Run `expo run:ios` and verify app builds successfully
- [ ] **Android**: Run `expo run:android` and verify app builds successfully
- [ ] Check bundle size hasn't increased dramatically

---

## Functional Testing - Core Features

### Tab System (Phase 1)
- [ ] Open Journey screen
- [ ] Verify only 2 tabs appear: "Timeline" | "Insights"
- [ ] Tap Timeline tab - content loads correctly
- [ ] Tap Insights tab - content loads correctly
- [ ] Switch between tabs multiple times - no lag or flashing

### Heatmap Calendar (Phase 2)
**Test with NO moments:**
- [ ] Delete all test moments (or test with fresh account)
- [ ] Heatmap shows current month with all days at intensity 0 (border color)
- [ ] Today is highlighted with border

**Test with 1-2 moments:**
- [ ] Create 1-2 spiritual moments today
- [ ] Heatmap shows today with low intensity (light primary color)
- [ ] Other days remain at intensity 0

**Test with varied activity:**
- [ ] Create moments across multiple days (e.g., 1 on Monday, 5 on Tuesday, 2 on Wednesday)
- [ ] Heatmap shows different intensity colors based on count
- [ ] Legend displays "Less → More" with gradient
- [ ] Month name displays correctly (e.g., "January 2026")

### Stats Grid (Phase 2 continued)
- [ ] 4 stat cards display: Current Streak, Total Moments, Anchor Verses, Unique Days
- [ ] Numbers are accurate based on actual moments
- [ ] Icons display correctly
- [ ] Cards are tappable (no action yet, but should respond to touch)

### AI Growth Insights (Phase 3 - Pro Feature)

**Test as FREE user:**
- [ ] Navigate to Insights tab
- [ ] See AI Growth Insights card at top
- [ ] See "Pro" badge with lock icon
- [ ] Tap anywhere on locked card
- [ ] Paywall appears correctly
- [ ] Can dismiss paywall and return to Journey

**Test as PRO user:**
- [ ] Upgrade to Pro (or test with Pro account)
- [ ] Navigate to Insights tab
- [ ] See "Generate Weekly Insight" button (no Pro badge)
- [ ] Tap "Generate Weekly Insight"
- [ ] Loading indicator appears
- [ ] After 3-10 seconds, insight displays with 4 sections:
  - [ ] Summary (2-3 sentences about growth pattern)
  - [ ] Scripture Connection (relevant verse)
  - [ ] Growth Prediction (encouraging forecast)
  - [ ] Encouragement (1-2 sentences)
- [ ] Tap "Refresh Insight" button
- [ ] New insight generates successfully
- [ ] Test with 0 moments - see appropriate message

### Spiritual Landscape Chart (Phase 5)

**Test with < 5 moments:**
- [ ] Chart does NOT display
- [ ] Only see heatmap and stats

**Test with 5+ moments:**
- [ ] Chart displays with 4 dimensions: Knowledge, Intimacy, Gratitude, Action
- [ ] Progress bars show different levels based on activity types
- [ ] Chart renders without visual glitches
- [ ] Legend is readable

**Test as FREE user:**
- [ ] Chart displays but no growth tips appear
- [ ] No "Pro" badge needed (chart is visible to all)

**Test as PRO user:**
- [ ] Chart displays
- [ ] Below chart, see 4 dimension cards with growth tips
- [ ] Tips are actionable and scripture-based
- [ ] Each dimension has appropriate guidance

### Milestones & Altars (Phase 4)

**Test "Next Milestone" Section:**
- [ ] With 0 moments: Shows first milestone (e.g., "7-Day Consistency") at 0% progress
- [ ] With 3 days of activity: Shows progress bar at ~43% for 7-Day milestone
- [ ] With 7 days completed: Next milestone advances (e.g., "First 10 Verses" or "30-Day Streak")
- [ ] Progress bar animates smoothly
- [ ] Scripture reference displays below milestone

**Test "Recent Achievements" Section (FREE user):**
- [ ] With 0 achievements: Section shows empty state
- [ ] With 1 achievement: Shows 1 milestone card with:
  - [ ] Icon
  - [ ] Title
  - [ ] Scripture reference
  - [ ] Achievement date
  - [ ] "Share Altar Card" button with Pro badge
- [ ] With 3+ achievements: Shows maximum of 3 recent milestones
- [ ] Milestones sorted by most recent first

**Test "Recent Achievements" Section (PRO user):**
- [ ] With 5+ achievements: Shows maximum of 5 recent milestones
- [ ] "Share Altar Card" button has NO Pro badge
- [ ] Tap "Share Altar Card" - sharing modal appears (if implemented)
- [ ] Sharing works correctly

**Test Milestone Detection Logic:**
- [ ] Create exactly 7 moments on 7 different days
- [ ] Verify "7-Day Consistency" milestone achieved
- [ ] Create 10 memory_practice moments
- [ ] Verify "First 10 Verses" milestone achieved
- [ ] Create 10 prayer moments
- [ ] Verify "Faithful Intercessor" milestone achieved
- [ ] All 14 milestone types detect correctly:
  - [ ] Streak: 7, 30, 40, 100 days
  - [ ] Verses: 10, 50, 100
  - [ ] Prayers: 10, 50, 100
  - [ ] Journals: 10, 50
  - [ ] Devotionals: 10, 30

### Top Themes & Anchor Scriptures (Existing Features)
- [ ] Top Themes section displays if moments have themes
- [ ] Anchor Scriptures section displays if user has saved verses
- [ ] Both sections render correctly in new InsightsView layout

---

## Pro Gating Verification

### Test ALL Pro Features (as Free User):
1. [ ] **AI Growth Insights**: Locked with Pro badge, tapping shows paywall
2. [ ] **Milestone Achievement Limit**: Only shows 3 recent achievements
3. [ ] **Share Altar Card**: Button has Pro badge, tapping shows paywall
4. [ ] **Spiritual Landscape Tips**: Chart visible but no dimension tips below

### Test ALL Pro Features (as Pro User):
1. [ ] **AI Growth Insights**: Fully functional, no Pro badge
2. [ ] **Milestone Achievement Limit**: Shows up to 5 recent achievements
3. [ ] **Share Altar Card**: Fully functional, no Pro badge
4. [ ] **Spiritual Landscape Tips**: All 4 dimension tip cards appear

---

## Edge Case Testing

### Data Edge Cases
- [ ] **No moments at all**: All sections show gracefully (empty states, 0 values)
- [ ] **Exactly 1 moment**: Stats show "1" without pluralization issues
- [ ] **500+ moments**: Performance is acceptable, no lag
- [ ] **Moments with missing data**: App doesn't crash (e.g., moment without themes)

### Date Edge Cases
- [ ] **First day of month**: Heatmap renders correctly
- [ ] **Last day of month**: Heatmap renders correctly
- [ ] **Today is current day**: Heatmap highlights today correctly
- [ ] **Month transition**: Create moment on last day of month, verify next month updates

### Network Edge Cases
- [ ] **Generate AI insight with poor connection**: Shows appropriate loading/error state
- [ ] **Generate AI insight offline**: Shows clear error message
- [ ] **Retry after network error**: Works correctly

### Device Edge Cases
- [ ] **Small screen (iPhone SE)**: All content fits, no cutoff
- [ ] **Large screen (iPhone Pro Max)**: Layout looks good, not stretched
- [ ] **Tablet**: Responsive layout works correctly
- [ ] **Dark mode (if supported)**: Colors remain readable

---

## Performance Testing

### Load Times
- [ ] Journey screen loads in < 2 seconds with 100 moments
- [ ] Tab switching is instant (< 100ms)
- [ ] Heatmap renders without visible delay
- [ ] Chart renders smoothly

### Memory Usage
- [ ] No memory leaks when switching tabs repeatedly (10+ times)
- [ ] No memory leaks when generating insights multiple times
- [ ] App remains stable with 500+ moments loaded

### Animations
- [ ] Progress bars animate smoothly
- [ ] Tab transitions are smooth
- [ ] No janky animations on older devices

---

## User Experience Checks

### Visual Polish
- [ ] All text is readable (font sizes appropriate)
- [ ] Colors match existing app theme
- [ ] Spacing is consistent throughout
- [ ] No visual glitches or overlapping elements
- [ ] Pro badges are visually consistent
- [ ] Icons are properly sized and aligned

### Accessibility
- [ ] All touchable areas are large enough (44x44pt minimum)
- [ ] Text contrast meets accessibility standards
- [ ] Screen reader compatibility (if previously supported)

### Copywriting
- [ ] No typos in milestone titles/descriptions
- [ ] Scripture references are accurate
- [ ] All user-facing text is encouraging and clear
- [ ] Pro upgrade prompts are compelling but not pushy

---

## Regression Testing

### Verify Existing Features Still Work
- [ ] **Timeline tab**: All existing functionality works
- [ ] **Creating moments**: All moment types can be created
- [ ] **Editing moments**: Existing moments can be edited
- [ ] **Deleting moments**: Moments can be deleted
- [ ] **Other screens**: Home, Discover, Profile screens unaffected
- [ ] **Navigation**: Bottom tab bar works correctly
- [ ] **Pro status**: Premium features on other screens still work

---

## Pre-Ship Checklist

### Code Quality
- [ ] Remove all console.log statements (or confirm they're intentional)
- [ ] Remove commented-out code
- [ ] No TODO comments remain
- [ ] Error handling is comprehensive

### Documentation
- [ ] `JOURNEY_ENHANCEMENTS_SUMMARY.md` is accurate and complete
- [ ] Code comments explain complex logic (heatmap, milestones)
- [ ] README updated if necessary

### Version Control
- [ ] All changes committed to git
- [ ] Commit message is descriptive
- [ ] No untracked files that should be committed
- [ ] `.gitignore` properly excludes build artifacts

### User Communication
- [ ] Draft user announcement message reviewed
- [ ] Feedback collection method prepared
- [ ] Support plan for user questions

---

## Launch Readiness

### Final Checks
- [ ] **Test on YOUR personal device** - Use the app as a real user would
- [ ] **Show to 1-2 trusted users** before wider release
- [ ] **Prepare rollback plan** - Know how to revert if critical bug found
- [ ] **Monitor first 24 hours** - Be ready to respond to user feedback

### Success Metrics to Track
- [ ] How many users open Journey screen in first 3 days?
- [ ] How many Pro users generate AI insights?
- [ ] How many Free users tap Pro-gated features (paywall views)?
- [ ] Any crash reports or errors logged?
- [ ] Qualitative feedback from 5-10 most engaged users

---

## Post-Launch

### First 48 Hours
- [ ] Monitor crash reports
- [ ] Respond to user feedback quickly
- [ ] Note most common questions
- [ ] Track Pro upgrade conversions

### First Week
- [ ] Gather qualitative feedback from 5-10 engaged users
- [ ] Identify any usability issues
- [ ] Note most-loved features
- [ ] Identify potential quick improvements

### First Month
- [ ] Measure engagement metrics
- [ ] Assess Pro conversion impact
- [ ] Plan next iteration (e.g., Altar Replay feature)

---

## Known Limitations (Document for Users)

1. **Streak Calculation**: Currently counts unique days with activity, not consecutive days
2. **Heatmap**: Shows current month only (no scroll to previous months yet)
3. **AI Insights**: Requires active internet connection
4. **Altar Card Sharing**: Visual export not yet implemented (button placeholder)

---

## Emergency Contacts (For Your Team)

- **Supabase Edge Function**: Ensure companion function is deployed and stable
- **RevenueCat**: Verify Pro status checking is working
- **App Store/Google Play**: Have rollback builds ready if needed

---

## Sign-Off

**Tester Name**: _______________
**Date**: _______________
**All Critical Tests Pass**: [ ] Yes [ ] No
**Ready to Ship**: [ ] Yes [ ] No

**Notes**:
_________________________________________________________________
_________________________________________________________________

---

**"The Lord bless you and keep you."** - Numbers 6:24

Ship with confidence! 🚀
