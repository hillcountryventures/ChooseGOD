# ChooseGOD Action Plan
## Comprehensive Improvement Roadmap

**Generated:** 2026-01-27
**Current State:** 6.8/10 average across all areas
**Target State:** 9.0/10
**Total Estimated Effort:** 20-24 weeks (1 developer) or 10-12 weeks (2 developers)

---

## Executive Summary

| Phase | Focus | Duration | Impact |
|-------|-------|----------|--------|
| **Phase 1** | Critical Fixes | 2 weeks | Conversion + Data Safety |
| **Phase 2** | Performance | 2 weeks | User Experience |
| **Phase 3** | Engagement | 4 weeks | Retention + Growth |
| **Phase 4** | Polish | 3 weeks | App Store Rating |
| **Phase 5** | Scale | 3 weeks | Premium Features |

---

## Phase 1: Critical Fixes (Weeks 1-2)
*Focus: Stop losing users and data*

### Week 1: Authentication & Data Persistence

| Task | File(s) | Effort | Priority |
|------|---------|--------|----------|
| **Add Apple Sign-In** | `LoginScreen.tsx`, `SignUpScreen.tsx` | 3 days | 🔴 CRITICAL |
| **Add Google Sign-In** | Same + `app.json` config | 2 days | 🔴 CRITICAL |
| **Persist Bible annotations** | `BibleScreen.tsx`, `useStore.ts` | 1 day | 🔴 CRITICAL |
| **Fix annotation → chapter reload bug** | `BibleScreen.tsx` L117 | 2 hrs | 🔴 CRITICAL |

**Apple Sign-In Implementation:**
```typescript
// Install: expo install expo-apple-authentication
// Add to LoginScreen.tsx
import * as AppleAuthentication from 'expo-apple-authentication';

const handleAppleSignIn = async () => {
  const credential = await AppleAuthentication.signInAsync({
    requestedScopes: [
      AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
      AppleAuthentication.AppleAuthenticationScope.EMAIL,
    ],
  });
  // Pass to Supabase auth
  await supabase.auth.signInWithIdToken({
    provider: 'apple',
    token: credential.identityToken,
  });
};
```

### Week 2: Accessibility & Navigation Cleanup

| Task | File(s) | Effort | Priority |
|------|---------|--------|----------|
| **Add accessibility labels to HomeScreen** | `HomeScreen.tsx` | 4 hrs | 🔴 HIGH |
| **Add accessibility to BibleScreen** | `BibleScreen.tsx`, `VerseRow.tsx` | 4 hrs | 🔴 HIGH |
| **Remove dead `Chat` type** | `navigation.ts` | 5 min | 🟡 MEDIUM |
| **Delete empty journey folders** | `screens/journey/` | 5 min | 🟡 MEDIUM |
| **Add deep links for ChatHub, PrayerCircles** | `App.tsx` linking config | 2 hrs | 🟡 MEDIUM |

**Accessibility Pattern:**
```typescript
<TouchableOpacity
  onPress={handlePress}
  accessibilityRole="button"
  accessibilityLabel="Daily verse: John 3:16"
  accessibilityHint="Double tap to open in Bible reader"
>
```

---

## Phase 2: Performance (Weeks 3-4)
*Focus: Make the app feel fast*

### Week 3: Rendering Optimization

| Task | File(s) | Effort | Priority |
|------|---------|--------|----------|
| **Switch BibleScreen to FlashList** | `BibleScreen.tsx` | 4 hrs | 🔴 HIGH |
| **Memoize HomeScreen components** | `HomeScreen.tsx` | 3 hrs | 🔴 HIGH |
| **Extract HomeScreen sub-components** | → `components/home/` | 4 hrs | 🟡 MEDIUM |
| **Add `useShallow` to multi-selectors** | Multiple stores | 2 hrs | 🟡 MEDIUM |
| **Memoize VerseRow** | `VerseRow.tsx` | 1 hr | 🟡 MEDIUM |

**FlashList Migration:**
```typescript
// Before (ScrollView + map)
<ScrollView>{verses.map(renderVerse)}</ScrollView>

// After (FlashList)
import { FlashList } from '@shopify/flash-list';
<FlashList
  data={verses}
  renderItem={({ item }) => <MemoizedVerseRow verse={item} />}
  estimatedItemSize={80}
  keyExtractor={(item) => `${item.book}-${item.chapter}-${item.verse}`}
/>
```

### Week 4: State Management Refactor

| Task | File(s) | Effort | Priority |
|------|---------|--------|----------|
| **Split `useStore` into domain stores** | `store/` folder | 2 days | 🔴 HIGH |
| **Add TanStack Query for data fetching** | New `hooks/queries/` | 2 days | 🔴 HIGH |
| **Add search debounce** | `BibleScreen.tsx` | 1 hr | 🟡 MEDIUM |
| **Standardize error handling pattern** | All stores | 4 hrs | 🟡 MEDIUM |

**Store Split Plan:**
```
useStore.ts (current monolith)
    ↓ split into ↓
├── chatStore.ts (messages, typing, mode)
├── prayerStore.ts (activePrayers, answeredPrayers)
├── journalStore.ts (drafts, prompts, moments)
└── verseStore.ts (offlineVerses, dailyVerse, annotations)
```

---

## Phase 3: Engagement Features (Weeks 5-8)
*Focus: Keep users coming back*

### Week 5-6: Audio Bible & Notifications

| Task | File(s) | Effort | Priority |
|------|---------|--------|----------|
| **Wire Bible audio player UI** | `BibleScreen.tsx`, new `AudioPlayerBar.tsx` | 3 days | 🔴 HIGH |
| **Add notification time customization** | `SettingsScreen.tsx` | 2 days | 🔴 HIGH |
| **Implement prayer reminders** | `PrayersScreen.tsx`, push config | 3 days | 🔴 HIGH |
| **Add offline chapter caching** | `BibleScreen.tsx`, `verseStore.ts` | 2 days | 🟡 MEDIUM |

**Audio Player Integration:**
```typescript
// BibleScreen.tsx - add hook
const { state, loadChapter: loadAudio, play, pause, seekToVerse } = useBibleAudio({
  translation: preferences.preferredTranslation,
  onVerseChange: (verse) => scrollToVerse(verse),
});

// Add floating player bar
{state.audioFile && (
  <AudioPlayerBar
    isPlaying={state.isPlaying}
    currentVerse={state.currentVerse}
    onPlay={play}
    onPause={pause}
    onSeek={seekToVerse}
  />
)}
```

### Week 7-8: Gamification & History

| Task | File(s) | Effort | Priority |
|------|---------|--------|----------|
| **Implement proper streak logic** | `journeyStore.ts` | 2 days | 🔴 HIGH |
| **Add badges/achievements system** | New `achievementStore.ts`, UI | 4 days | 🔴 HIGH |
| **Persist chat conversation history** | `chatStore.ts`, `ChatHubScreen.tsx` | 3 days | 🔴 HIGH |
| **Add reading goals** | `SettingsScreen.tsx`, `JourneyScreen.tsx` | 2 days | 🟡 MEDIUM |

---

## Phase 4: Polish (Weeks 9-11)
*Focus: Premium feel*

### Week 9: Design System

| Task | File(s) | Effort | Priority |
|------|---------|--------|----------|
| **Create `<Button>` primitive** | New `components/primitives/Button.tsx` | 4 hrs | 🔴 HIGH |
| **Create `<IconButton>` primitive** | `components/primitives/` | 2 hrs | 🔴 HIGH |
| **Consolidate verse components (5→2)** | `components/verse/` | 1 day | 🟡 MEDIUM |
| **Create `<BaseModal>` wrapper** | `components/primitives/` | 4 hrs | 🟡 MEDIUM |
| **Standardize on Reanimated** | Multiple files | 2 days | 🟢 LOW |

### Week 10: Settings & UX

| Task | File(s) | Effort | Priority |
|------|---------|--------|----------|
| **Add light/dark mode toggle** | `theme.ts`, `SettingsScreen.tsx` | 2 days | 🟡 MEDIUM |
| **Hide SubscriptionDebug in prod** | `SettingsScreen.tsx` | 30 min | 🟡 MEDIUM |
| **Add biometric unlock option** | `SettingsScreen.tsx` | 1 day | 🟡 MEDIUM |
| **Improve paywall CTA copy** | `PaywallScreen.tsx` | 2 hrs | 🟡 MEDIUM |

### Week 11: Onboarding & Conversion

| Task | File(s) | Effort | Priority |
|------|---------|--------|----------|
| **Improve quiz "back" navigation** | `PersonalizationQuiz.tsx` | 4 hrs | 🟡 MEDIUM |
| **Add trial countdown timer** | `PaywallScreen.tsx` | 4 hrs | 🟡 MEDIUM |
| **Add feature comparison chart** | `PaywallScreen.tsx` | 4 hrs | 🟡 MEDIUM |
| **A/B test paywall variants** | RevenueCat experiments | 2 days | 🟢 LOW |

---

## Phase 5: Scale (Weeks 12-14)
*Focus: Premium features*

### Week 12-13: Social & Community

| Task | File(s) | Effort | Priority |
|------|---------|--------|----------|
| **Add "Praying for you" reactions** | `PrayerCirclesScreen.tsx` | 3 days | 🟡 MEDIUM |
| **Circle push notifications** | `prayerCircleStore.ts`, backend | 4 days | 🟡 MEDIUM |
| **Social sharing of milestones** | `JourneyScreen.tsx` | 2 days | 🟡 MEDIUM |
| **Share permalinks for devotionals** | Deep linking config | 1 day | 🟢 LOW |

### Week 14: Advanced Features

| Task | File(s) | Effort | Priority |
|------|---------|--------|----------|
| **Parallel Bible translation view** | New component | 3 days | 🟢 LOW |
| **Audio for Lectio Divina** | `LectioDivinaScreen.tsx` | 3 days | 🟢 LOW |
| **Year-in-review feature** | New screen | 3 days | 🟢 LOW |
| **Sync annotations to Supabase** | Backend + store | 4 days | 🟢 LOW |

---

## Quick Wins (Do Anytime)

| Task | Effort | Impact |
|------|--------|--------|
| Remove dead `Chat` type | 5 min | Cleaner types |
| Delete empty journey folders | 5 min | Cleaner structure |
| Fix loadChapter dependency array | 30 min | Performance |
| Add search debounce | 1 hr | API cost |
| Increase theme imports (29 files) | 2 hrs | Consistency |

---

## Success Metrics

| Metric | Current | Target | Tracking |
|--------|---------|--------|----------|
| App Store Rating | — | 4.7+ | Weekly |
| Day 1 Retention | — | 60% | RevenueCat |
| Day 7 Retention | — | 40% | RevenueCat |
| Free → Trial | — | 30% | RevenueCat |
| Trial → Paid | — | 50% | RevenueCat |
| Crash-free sessions | — | 99.5% | Sentry/Crashlytics |
| Cold start time | — | <2s | Manual testing |

---

## Dependencies & Prerequisites

1. **Apple Developer Account** — For Apple Sign-In
2. **Google Cloud Console** — For Google Sign-In OAuth
3. **TanStack Query** — `npm install @tanstack/react-query`
4. **FlashList** — Already installed
5. **Expo Apple Auth** — `expo install expo-apple-authentication`
6. **Expo Local Auth** — `expo install expo-local-authentication` (biometrics)

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Social login rejection | Test with TestFlight before store submission |
| Performance regression | Add performance monitoring (React DevTools Profiler) |
| Data migration issues | Add migration scripts for store structure changes |
| Breaking changes | Feature flag new features, gradual rollout |

---

*Last updated: 2026-01-27*
