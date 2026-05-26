# Backend deploy — Step C (the moat's other half)

Deploys migrations **056–060** + the **`companion`** edge function to the **production** app project
`rtozduhxrfsksygsmwuj`. Without this, chat shows no personalization — the whole sale thesis.

> ⚠️ **This is the LIVE database** (the shipped RN app's users). Read steps 0–2 before running step 3.
> The MCP server is connected to a *different* project, which is why this is a manual CLI step.

## 0. Install + log in (once)
```bash
brew install supabase/tap/supabase      # or: npm i -g supabase
supabase login                          # opens browser
```

## 1. Link the repo to the production project
```bash
cd ~/ChooseGOD
supabase link --project-ref rtozduhxrfsksygsmwuj
```

## 2. SEE what will change before touching prod (do NOT skip)
```bash
supabase migration list
```
- You should see **056_founding_member_claims … 060_churches_and_partnerships** (and possibly a few earlier ones) listed as local-only / pending.
- All of 056–060 are **additive** (`CREATE TABLE IF NOT EXISTS`, `ADD COLUMN IF NOT EXISTS`), so they're safe — but eyeball the list for anything unexpected.
- Take a backup first: Supabase dashboard → **Database → Backups** (or `supabase db dump -f pre_v12_backup.sql`).

## 3. Apply the migrations (in order)
```bash
supabase db push
```

## 4. Set the OpenAI secret
The edge function reads `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` (auto-injected by the platform) and **`OPENAI_API_KEY`** (you set this):
```bash
supabase secrets list                          # check if OPENAI_API_KEY is already set
supabase secrets set OPENAI_API_KEY=sk-...      # only if missing
```

## 5. Deploy the companion edge function (carries the `<user_context>` moat injection)
```bash
supabase functions deploy companion
```

## 6. Verify it actually works
```bash
supabase functions list        # companion = deployed
```
Then, signed in as the seeded demo account (see `scripts/seed_demo_account.sql`), open **Chat** and ask
something like *"what should I pray about this week?"* — the reply should reference the seeded
journal/prayers/intention. That's the moat, live.

## Rollback
- Edge fn: redeploy the previous version, or `supabase functions delete companion`.
- Migrations: restore the backup from step 2 (migrations themselves are additive, so usually no rollback needed).
