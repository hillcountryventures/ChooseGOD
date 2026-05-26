# App Store submission package — Step F

Everything for the App Store Connect update. The binary is a native-Swift rewrite under the **same**
bundle id (`com.choosegod.app`) as the live RN app, so this is an *update* to the existing listing —
but a full rewrite with new AI + crisis surfaces, so expect a careful review. Fill the **[BRACKETED]** bits.

---

## 1. App Review notes (paste into "Notes" in App Store Connect)

> **Demo account:** [email] / [password]  (pre-seeded with journal entries, prayers, and history)
>
> **What ChooseGOD is:** a Bible study + prayer companion. Free tier includes 16 Bible translations,
> reading, bookmarks, prayer tracking, and a limited AI companion; premium unlocks unlimited AI chat
> and guided practices.
>
> **How the AI works (important for review):** the companion is **scripture-grounded retrieval**, not
> open-ended generation. User questions are answered with retrieved Bible verses + a pastoral, non-
> doctrinaire reply; it does not invent scripture or give medical/legal/financial advice.
>
> **Safety / sensitive content:** every message is screened by a **4-tier crisis protocol**. If a
> message suggests self-harm or crisis, the app surfaces professional resources (e.g., 988 Suicide &
> Crisis Lifeline) and a clear disclaimer that the AI is not a counselor or emergency service. To see
> it: open Chat and send a message expressing distress — the crisis resource card appears.
>
> **Account & data:** users can delete their account in-app (Settings → Privacy → Delete Account),
> which removes their auth record and all associated data. Journal/prayer/chat content is private to
> the user.
>
> **Subscriptions:** monthly + annual auto-renewing (RevenueCat). Restore Purchases is on the paywall.

---

## 2. Privacy labels (App Store Connect → App Privacy)

Be most-restrictive and accurate. Data **collected + linked to the user**:
- **Health & Fitness → Sensitive Info** *(or "Other Data")*: journal entries, prayers, chat messages are
  personal/spiritual reflections — label as sensitive, **used for App Functionality only**, **not** for
  tracking, **not** shared with third parties, **not** used for ads.
- **Identifiers / Contact Info:** email (account), user id — App Functionality.
- **Usage Data / Diagnostics:** analytics (PostHog) + crash (Sentry) — Analytics / App Functionality,
  not linked to advertising, no tracking.
- **Purchases:** subscription status (RevenueCat) — App Functionality.
- Set **"Data is NOT used to track you"** (no AdTech / IDFA).

---

## 3. Listing copy

**App name:** ChooseGOD
**Subtitle (30 chars):** `The Bible app that knows you`

**Promotional text (170 chars):**
`A Bible companion that actually remembers your walk — your prayers, your journal, where you're stuck — and meets you there with Scripture. Grace over guilt.`

**Description:**
```
ChooseGOD is the Bible app that knows you.

Most faith apps treat everyone the same. ChooseGOD remembers your prayers, your journal,
and what you're walking through — and brings Scripture to meet you right there.

THE COMPANION THAT KNOWS YOUR STORY
Ask anything. The AI companion answers with real Scripture, grounded in your context —
the prayer you've been carrying for weeks, the verse that wrecked you on Tuesday, the
intention you set when you started. Not generic devotionals. You.

PRAYER THAT CLOSES THE LOOP
Write a prayer. Track it. Mark it answered — and capture the testimony. Over time you
build a faithfulness log: proof of every prayer God answered, in your own words.

GRACE, NOT GUILT
Miss a day? Grace Mode keeps your "Days With God" intact instead of shaming you with a
broken streak. We're not here to make you feel behind.

ALSO INSIDE
• 16 Bible translations, free
• Bookmarks, highlights, cross-references, audio
• Journal: reflect, give thanks, confess
• Guided practices: Lectio Divina, the Examen
• A unified Timeline of your whole walk

Premium unlocks unlimited companion chat and the guided practices.
```

**What's New (this version):**
```
A ground-up rebuild. Faster, calmer, and far more personal:
• A companion that remembers your prayers and journal and meets you in Scripture
• Personal prayers with an answered-prayer testimony log
• A unified Journey timeline of your walk
• Grace Mode so a missed day never breaks your momentum
```

**Screenshot captions** (lead with the moat; 6–8 shots):
1. "The AI that actually knows your story" — Chat referencing the user's journal *(the seeded demo)*
2. "Grace over guilt" — Home / Days With God
3. "Every answered prayer, remembered" — Prayers + answered testimony
4. "Your whole walk, in one place" — Journey Timeline (Answered filter)
5. "16 translations, beautifully readable" — Bible reader
6. "Pray. Track. Watch God move." — Prayers list
7. "Go deeper" — Paywall

---

## 4. Pre-submit checklist
- [ ] Backend deployed (`docs/BACKEND_DEPLOY.md`) — moat works on the demo account
- [ ] Demo account seeded (`scripts/seed_demo_account.sql`) + creds in the review notes above
- [ ] App Group `group.com.choosegod.app` registered in the Developer portal (Identifiers → App Groups) and on the App ID, Widget ID, Watch ID — needed for device signing + Widget/Watch data
- [ ] RevenueCat: products → single `premium` entitlement; prices match the paywall
- [ ] `aps-environment` flips to `production` for the release build (Xcode "Automatically manage signing" handles this)
- [ ] Privacy Policy + Terms URLs resolve (Settings links): choosegod.app/privacy, /terms
- [ ] TestFlight build runs on a real device: Apple Sign-In, push, and a sandbox purchase all work
