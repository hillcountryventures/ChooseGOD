# ChooseGOD — Privacy & Data Collection Practices

**Last Updated:** June 2025

## Overview

ChooseGOD is a Bible study and devotional app. We collect the minimum data necessary to provide our services and respect your right to control your information.

## Data We Collect

### Account Data
- **Email address** — Used for authentication (via Supabase Auth)
- **Display name** — Optional, user-provided

### User-Generated Content (stored in Supabase)
- Prayer requests and journal entries
- Reading progress and bookmarks
- Chat messages with the AI companion
- Preferences (translation, font size, notifications)

### Analytics (PostHog) — Opt-out Available
- Anonymous screen views and feature usage
- Device type and OS version
- App version
- **No personal identifiers are sent to PostHog**

### Crash Reporting (Sentry) — Opt-out Available
- Anonymous crash logs and stack traces
- Device model and OS version
- **No personal content (prayers, journal) is included in crash reports**

### Subscription Data (RevenueCat)
- Purchase status and subscription tier
- Managed entirely by Apple/RevenueCat — we do not store payment details

## Data We Do NOT Collect
- Location data
- Contacts or phone book
- Photos or camera access
- Advertising identifiers
- Data from other apps

## Third-Party Services

| Service | Purpose | Data Shared |
|---------|---------|-------------|
| Supabase | Auth, database, storage | Account & user content |
| OpenAI | AI companion responses | Chat messages (no PII attached) |
| RevenueCat | Subscription management | Anonymous purchase events |
| PostHog | Analytics | Anonymous usage events |
| Sentry | Crash reporting | Anonymous crash data |

## Children's Privacy (COPPA)

ChooseGOD is not directed at children under 13. We display an age verification gate on first launch. Users who indicate they are under 13 are blocked from accessing the app and no data is collected from them.

## User Rights

- **Export:** Settings → Export Data (GDPR-compliant full export)
- **Delete:** Settings → Delete Account (permanently removes all data)
- **Opt-out:** Settings → Privacy & Data (toggle analytics and crash reporting)

## Data Retention

- Account data is retained while your account is active
- Deleted accounts are permanently purged within 30 days
- Anonymous analytics data is retained for 12 months

## Data Security

- All data is encrypted in transit (TLS 1.2+)
- Database hosted on Supabase with row-level security
- No data is sold to third parties — ever

## Contact

For privacy questions: privacy@choosegod.app

For full legal terms, visit:
- Privacy Policy: https://choosegod.app/privacy
- Terms of Service: https://choosegod.app/terms
