# ChooseGOD Audit — Round 7

**Date:** 2025-07-22
**Auditor:** ClawdSquad (Rupert)
**Trajectory:** R1: 7.4 → R2: 8.1 → R3: 7.9 → R4: 8.3 → R5: 8.4 → R6: 8.6 → **R7: 8.7**

---

## Summary

TypeScript errors regressed slightly (2 errors in ChatBottomSheet from BottomSheet v5 type changes). ESLint went from 290 → 306 issues (net +16, likely from new feature commits post-R6). The codebase is 55K lines across 244 files with solid architecture — services/hooks/stores are well-separated. Several large files (>800 LOC) remain and are the primary barrier to 9.0.

---

## Domain Scores

| #   | Domain                     | Score | Δ from R6 | Notes                                                                                                                                                   |
| --- | -------------------------- | ----- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | **TypeScript Correctness** | 8.5   | −0.5      | 2 TS errors (BottomSheet backdrop types). Was 0.                                                                                                        |
| 2   | **ESLint / Code Quality**  | 8.0   | +0.2      | 306 issues (7 errors, 299 warnings). `react-hooks/refs` = 195.                                                                                          |
| 3   | **Architecture**           | 9.0   | +0.2      | Clean separation: services/, hooks/, store/, contexts/. 31 hooks, 7 services, 12 stores.                                                                |
| 4   | **Component Size**         | 7.5   | +0.3      | ChatBottomSheet down to 516. But 5 files >800 LOC (SettingsScreen 1118, HomeScreen 1085, InsightsView 1066, PrayersScreen 1045, VersePickerScreen 874). |
| 5   | **Type Safety**            | 9.0   | +0.2      | Only 25 `any` casts across 55K lines. Types well-organized in src/types/.                                                                               |
| 6   | **Testing**                | 7.0   | =         | 14 test files for 244 source files (~6% coverage). No improvement since R6.                                                                             |
| 7   | **DevOps / CI**            | 9.0   | =         | 3 CI workflows (ci.yml, deploy.yml, swift-ci.yml). eas.json configured. Husky pre-commit.                                                               |
| 8   | **Security**               | 9.0   | =         | Theological guardrails, input sanitization, xcconfig keys. GDPR consent, age gate.                                                                      |
| 9   | **Error Handling**         | 8.5   | =         | Sentry integrated. Only 6 console.log statements (good). Offline support with sync queue.                                                               |
| 10  | **App Store Readiness**    | 9.5   | =         | Paywall disclosure, empty states, deep links all implemented.                                                                                           |

**Overall: 8.7** (up from 8.6)

---

## 🚫 Blockers

None. No App Store, legal, build, or security blockers identified.

---

## Remaining Fixes to Reach 9.0

### 🔴 Critical (do these first)

1. **Fix 2 TypeScript errors** in `ChatBottomSheet.tsx` — BottomSheet v5 `BackdropProps` type mismatch. Quick fix: properly type the backdrop component with `BottomSheetBackdropProps`.

2. **Decompose 5 large files** (each >800 LOC):
   - `SettingsScreen.tsx` (1118) → extract settings sections into components
   - `HomeScreen.tsx` (1085) → extract widgets/cards
   - `InsightsView.tsx` (1066) → split chart/list sections
   - `PrayersScreen.tsx` (1045) → extract prayer list, prayer form
   - `VersePickerScreen.tsx` (874) → extract search, results list

### 🟡 Important

3. **Fix 195 `react-hooks/refs` warnings** — likely needs `useRef` patterns updated for React 19 ref callback changes. Batch fix possible.

4. **Fix 30 `exhaustive-deps` warnings** — add missing deps or suppress with justification.

5. **Eliminate 56 `no-explicit-any`** — replace with proper types. Currently 25 `: any` in source + 56 ESLint hits.

6. **Fix 9 `no-unused-vars`** — trivial cleanup.

### 🟢 Nice to Have (for 9.5)

7. **Add tests** — 14 test files for 244 source files is thin. Target critical paths: auth flow, chat, payment/subscription, offline sync.

8. **Fix 6 `react-hooks/set-state-in-effect`** and 5 `react-hooks/purity` warnings.

---

## Effort Estimate to 9.0

| Task                       | Est. Time | Impact              |
| -------------------------- | --------- | ------------------- |
| Fix 2 TS errors            | 15 min    | +0.2 TypeScript     |
| Decompose 5 large files    | 3-4 hrs   | +1.0 Component Size |
| Fix react-hooks/refs (195) | 1-2 hrs   | +0.5 Code Quality   |
| Fix exhaustive-deps (30)   | 1 hr      | +0.2 Code Quality   |
| Remove `any` (56)          | 1-2 hrs   | +0.2 Type Safety    |

**Total: ~7-9 hours of focused work to reach 9.0**

---

## Score History

| Round  | Score   | Key Changes                                                          |
| ------ | ------- | -------------------------------------------------------------------- |
| R1     | 7.4     | Baseline                                                             |
| R2     | 8.1     | Initial fixes                                                        |
| R3     | 7.9     | Regression                                                           |
| R4     | 8.3     | 10-agent audit sweep                                                 |
| R5     | 8.4     | Incremental                                                          |
| R6     | 8.6     | 84 ESLint fixes, ChatBottomSheet decomp, 0 TS errors                 |
| **R7** | **8.7** | Feature commits (iOS native), architecture solid, large files remain |
