# ChooseGOD iOS — Elon Audit (2026-05-22)

First-principles, zero-mercy audit of the shipping target `ios-native/ChooseGODApp`
(the legacy React Native `src/` was out of scope). 100% of the Swift files were read.

```
INVENTORY        213 Swift files → 184 after cleanup · 38,474 LOC · SwiftUI / XcodeGen / Supabase
PHYSICS TEST     BUILD SUCCEEDED (iPhone 17 sim) — green after every tier
P0 KILL SHOTS    0 found
P1 FIXES         5
P2 FIXES         6 + 30 orphaned files deleted
COMMITS          c103267 (P1) · 391450c (P2) · f4b8ad7 (cleanup) · 620e29c (docs) · 69bb8af (re-audit fix)
RE-AUDIT         clean-from-scratch build PASS · removed dead chat logging
```

## Headline

The app is **structurally sound** — clean launch path (`ChooseGODApp` → auth gate →
onboarding → `MainTabView`, 5 tabs), guarded Sentry/PostHog init, and all 10
deferred-feature FeatureFlags correctly gated at their entry points. There were **no P0
crash vectors.** The parallel agents' raw output flagged ~10 "P0s"; reachability
verification collapsed nearly all of them into dead code or false positives. The real
work was a handful of silent-failure P1s and a large dead-code cleanup.

## P1 — Silent failures / visible-but-broken (fixed, commit `c103267`)

| # | File | Issue | Fix |
|---|------|-------|-----|
| 1 | `Features/Bible/Views/BibleReaderView.swift` | "Word Study (Hebrew/Greek)" shipped ON but the Strong's lexicon JSON was never bundled (no `resources:` in project.yml; files live outside the iOS tree) → opened to an empty result | Removed the menu item + sheet + state (user decision); deleted `StrongsLookupView` + `StrongsService` |
| 2 | `Core/Services/AI/CompanionService.swift` | Chat analytics inserted into a non-existent table `chat_logs` (fire-and-forget; dead since inception) | **Removed** the client-side `logInteraction` (commit `69bb8af`). The re-audit found `chat_interactions` has no `query/response/sources/response_time_ms` columns *and* the companion edge fn already logs server-side with a privacy-safe metadata schema — so the client write was redundant + a raw-Q&A PII leak |
| 3 | `Features/Paywall/ViewModels/PaywallViewModel.swift` | Purchase-funnel `AnalyticsService.capture()` calls were commented out ("// TODO: Service not available" — stale; the service is used elsewhere) → no conversion tracking | Re-enabled the 5 capture calls |
| 4 | `App/AppState.swift` (`signOut()`) | Sign-out didn't clear per-user caches → journal/intention/context could leak across accounts on a shared device | Clear `UserPreferencesService` / `UserIntentionsService` / `UserContextService` on sign-out |
| 5 | `Core/Views/OfflineBanner.swift` | White text on a light-gray background → invisible in light mode | Opaque `Theme.Colors.primary` background + white text (readable in both modes) |

## P2 — Polish & correctness (fixed, commit `391450c`)

| # | File | Issue | Fix |
|---|------|-------|-----|
| 6 | `ChooseGOD.entitlements` (+ Watch/Widgets) | The **active** main-app entitlements file was empty `<dict/>` — Apple Sign-In, push, keychain, and App Group all missing for device/TestFlight builds (the configured copy was stranded in unused `Resources/`). Watch+Widgets had no App Group → can't read shared data | Declared entitlements as `properties` in `project.yml` so XcodeGen generates them populated (it had been clobbering hand-edits to `<dict/>` on every regen). **[MANUAL]** register the App Group + capabilities in the Apple Developer portal before device signing; set `aps-environment` to `production` for App Store release |
| 7 | `Features/Bible/Views/BibleReaderView.swift` | "Share as Card" verse button was a no-op (its sheet was commented out) | Removed the dead button + state |
| 8 | `Features/Discover/Views/DiscoverView.swift` | "Explore Series" rendered an empty section with no message when the series list was empty | Added an empty-state |
| 9 | `ShimmerView`, `ErrorRetryView` | Hardcoded `Color.gray`/`.white` (broke in light mode); `.borderedProminent` inconsistent with the app's button style | Adaptive `Theme.Colors` tokens; `.primaryButtonStyle()` |
| 10 | `Features/Journey/Views/PracticesHubView.swift` | Dead `PracticeAvailability.comingSoon` enum case + badge (never rendered — all rows are `.available`) | Removed the case, property, and badge block |

## Cleanup — 30 orphaned files deleted (commit `f4b8ad7`)

Verified unreachable (instantiated only in their own `#Preview`, or referenced only by
other deleted files):

- **Groups** views ×6 (a duplicate of the Prayers feature) — *kept* `GroupService`/`GroupModels` because the gated Pastor feature depends on them
- **Sermon** ×3 · **Community / Bible-in-a-Year** ×4 · **Sharing** verse cards ×3
- **AudioDevotionals** ×1 (incomplete) · `JournalListView` (orphan; history lives in the Journey Timeline)
- **Gifting** purchase flow `GiftSubscriptionView`+`GiftCardView` — *kept* the wired `GiftRedemptionView`
- `Core/Services/Sync/SyncQueue` (dormant, never referenced) · Strong's `StrongsLookupView`+`StrongsService`
- Retired Devotionals UI cluster ×7: `DevotionalHubView` + `DevotionalSeriesListView`/`DevotionalEpisodeListView`/`DevotionalNowPlayingView` + `SeriesLibraryView`/`SeriesDetailView`/`DevotionalCompleteView`

**Added** `Features/Discover/Views/SeriesCards.swift` — the live series cards +
`SeriesDetailSheet` that `DiscoverView` uses had been defined *inside* the otherwise-dead
`DevotionalHubView`; relocated them into the Discover feature.

**Kept as intentional FeatureFlag-gated roadmap (not dead code):** Pastor/Church
(`pastorPartnership`), Camera/ScriptureScan (`scriptureScan`), DailyDrop, CheckIns,
Founding card, PrayerCircles, SeriesGenerator.

## Verified false positives (logged so they aren't re-investigated)

- `HomeView.swift:91` `async let verse: () = loadDailyVerse()` — valid structured concurrency (awaited via the tuple on line 94).
- `CompanionService:90` "404 → crash" — caught fire-and-forget; chat never crashes (real bug was the table name).
- ChurchPartnershipView / JournalListView / GiftSubscriptionView "reachable stubs" — preview-only orphans.
- `PracticesHubView` "Coming soon" — never rendered (all rows `.available`).
- `verse_bookmarks`/`verse_notes` in `SupabaseBibleService` — only reached by the dormant `SyncQueue`; the live bookmark UI uses `BookmarkService` → `bookmarks` (correct). Now fully dead after SyncQueue deletion.

## Known limitations / follow-ups (not blocking)

- **App Group / capabilities** need registering in the Apple Developer portal for device/TestFlight signing (entitlements are now declared correctly in source).
- `SupabaseBibleService` still has dead `verse_bookmarks`/`verse_notes` methods (now caller-less after SyncQueue removal) — remove or repoint to `bookmarks` if a notes/sync feature is revived.
- **Runtime smoke test pending** — this audit verified a clean compile after each tier; the next step is launching in the simulator to walk every v1.2 surface + capture buyer screenshots.

## Verification re-audit (2026-05-22)

Re-ran to confirm the fixes actually work, not just compile:
- **Clean-from-scratch build** (fresh DerivedData, full SPM re-fetch) — **BUILD SUCCEEDED**.
- **Entitlements** regenerate populated from `project.yml` (Apple Sign-In / push / keychain / App Group on the app; App Group on Watch + Widgets). ✓
- **Zero dangling references** to any of the 30 deleted types; no duplicate symbols from the relocated cards. ✓
- **Sign-out `reset()` methods** verified to actually clear cached tradition / intention / moat-context state. ✓
- **Caught + fixed** the only real regression: the `chat_interactions` rename compiled but the table lacks the payload columns and the edge fn already logs server-side → removed the dead client log (commit `69bb8af`).

## Health

```
Swift files   213 → 184   (-29 net; 30 deleted, 1 added)
Build         PASS (iPhone 17 sim) after every tier
P0 / P1 / P2  0 / 5 fixed / 6 fixed + 30 files removed
```

---

# Audit #2 — Deeper verified-bug pass (2026-05-26)

Mandate: find **every** bug, **prove each exists**. Method: Supabase schema-parity diff
(Swift `.from`/`.rpc`/`.invoke` vs the migrations) + build-warning triage + 3 verification
agents whose findings were all re-confirmed by reading code (**9 agent false-positives
rejected**). Every fix build-gated + committed.

## Verified + fixed

- **🔴 P0 — premium not unlocked after purchase** (commit `41f1992`). Gated features read
  `currentUser.isPremium` (set only at login); purchase / gift / restore updated only
  `RevenueCatService.isPremium`, so a **paying user stayed locked until an app restart**.
  Added `AppState.refreshPremiumStatus()` wired into purchase (`PaywallView.onChange`),
  Restore, and gift redeem.
- **🟠 P1 — account deletion broken** (commit `c5a83d7`). `SupabaseAuthService:208` called
  RPC `delete_user_account`, which never existed → deletion always threw. Routed through the
  `delete-account` edge function (`auth.admin.deleteUser` + full user-table sweep), `finalize` mode.
- **🟠 P1 — Bible search highlight crash** (commit `c5a83d7`). `highlightedText` used
  `text.lowercased()` indices to subscript a different, re-sliced `String` → trap/corruption
  on multi-match or non-ASCII queries. Rewritten to search + slice one `Substring`.
- **🟡 P2** (commit `143af7d`): deleted 6 dead `SupabaseBibleService` bookmark/note methods
  (queried non-existent `verse_bookmarks`/`verse_notes`); removed 6 dead `catch` blocks in
  `DiscoverViewModel`; replaced the gift-sheet `.constant` binding with a proper read-write `Binding`.

## Documented, not fixed (gated/dormant)
**Groups/Pastor/Church backend was never migrated.** `GroupService` queries
`bible_study_groups`, `group_members`, `group_discussions`, `group_reading_plans`,
`group_prayer_requests` + RPC `increment_prayer_count` — none exist in any migration. The
feature is FeatureFlag-gated OFF and unreachable, so not a v1.2 defect; reviving it requires
those migrations (or delete the feature).

## Rejected false positives (verified safe)
VerseOfTheDayWidget date `!` · InsightsViewModel dict `!` (guard-initialized) · `User.initials`
(guarded) · OfflineBibleStore `urls(...)[0]` · `ScholarlyWork.displayTitle` (`??` safe) ·
`GroupService.randomElement()!` (non-empty literal) · `SupabaseGlobal` `fatalError` (defensive) ·
gift-sheet "won't re-present" (the `.constant` re-evaluates) · **column-level schema parity:
all 24 live tables ✓**.

## Health (after Audit #2)
Build PASS (iPhone 17 sim) after every tier. Verified: **1 P0 · 2 P1 · 4 P2**. Commits:
`41f1992` (P0) · `c5a83d7` (P1) · `143af7d` (P2).
