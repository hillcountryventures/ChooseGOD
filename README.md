# ChooseGOD ✝️

A Bible study and spiritual companion app built with React Native and Expo. Features daily devotionals, AI-powered Scripture chat, journaling, prayer modes, and Bible reading with highlights and notes.

## Tech Stack

- **Framework:** React Native 0.81 + Expo SDK 54
- **Language:** TypeScript
- **Backend:** Supabase (Auth, Database, Edge Functions, Realtime)
- **State Management:** Zustand
- **Navigation:** React Navigation (native stack + bottom tabs)
- **AI:** OpenAI via Supabase Edge Functions (streaming)
- **Payments:** RevenueCat
- **Analytics:** PostHog
- **Error Tracking:** Sentry
- **UI:** Custom design system (`src/lib/theme.ts`), Expo Vector Icons, Reanimated

## Prerequisites

- Node.js ≥ 18
- Expo CLI (`npx expo`)
- iOS: Xcode 15+ / macOS
- Android: Android Studio + SDK
- Supabase project (with Edge Functions deployed)

## Setup

1. **Clone & install:**
   ```bash
   git clone <repo-url> && cd ChooseGOD
   npm install
   ```

2. **Environment variables:**
   ```bash
   cp .env.example .env
   ```
   Fill in the `EXPO_PUBLIC_*` keys (Supabase URL, anon key, RevenueCat, PostHog, Sentry).

   > ⚠️ `SUPABASE_SERVICE_ROLE_KEY` and `OPENAI_API_KEY` are **server-only secrets** — they belong in Supabase Edge Function env vars, not in the client `.env`. See `.env.example` for details.

3. **Run:**
   ```bash
   npx expo start          # Dev server (Expo Go or dev client)
   npx expo run:ios         # Native iOS build
   npx expo run:android     # Native Android build
   ```

4. **Tests:**
   ```bash
   npm test                 # Jest tests
   npm test -- --coverage   # With coverage report
   ```

## Architecture

```
ChooseGOD/
├── App.tsx                    # Root component, navigation setup
├── src/
│   ├── components/            # Reusable UI components
│   │   ├── bible/             # Bible reader (VerseRow, chapter nav)
│   │   ├── chat/              # Chat bottom sheet, modes, input
│   │   └── ...                # MessageBubble, PaywallModal, etc.
│   ├── screens/               # Screen components (tab & stack)
│   │   ├── journal/           # Journal compose, detail, verse picker
│   │   ├── circles/           # Prayer circles
│   │   └── settings/          # Settings, referrals, debug
│   ├── store/                 # Zustand stores
│   │   ├── useStore.ts        # Main app store (chat, UI state)
│   │   ├── authStore.ts       # Auth state
│   │   ├── subscriptionStore.ts
│   │   └── devotionalStore.ts
│   ├── hooks/                 # Custom hooks (premium, chat quota, voice)
│   ├── lib/                   # Supabase client, theme, notifications
│   ├── constants/             # Chat modes, limits, animations, subscription tiers
│   ├── types/                 # TypeScript type definitions
│   ├── utils/                 # Input sanitizer, Sentry, helpers
│   └── services/              # Analytics service
├── supabase/
│   ├── functions/             # Edge Functions (companion, query-bible, etc.)
│   ├── migrations/            # SQL migrations
│   └── scripts/               # Seeding scripts (run locally with service key)
├── e2e/                       # End-to-end tests
├── assets/                    # Images, fonts
└── docs/                      # Additional documentation
```

### Key Patterns

- **Chat streaming:** `src/components/chat/utils.ts` → calls Supabase Edge Function `companion` with SSE streaming
- **Premium gating:** `usePremiumStatus` hook + RevenueCat + seed-based quota system
- **Bible context:** Chat receives current book/chapter/verse context from the Bible reader
- **Chat modes:** 10 spiritual practice modes (auto, devotional, prayer, lectio divina, examen, memory, confession, gratitude, celebration, journal)

## Contributing

1. Create a feature branch from `main`
2. Follow existing code patterns and TypeScript strict mode
3. Add accessibility labels to interactive elements
4. Test on both iOS and Android
5. Run `npm test` before submitting PRs
6. Keep components under ~300 lines — extract sub-components when needed

## License

Proprietary — All rights reserved.
