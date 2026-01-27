# Security Quick Reference Guide

## 🚨 Before You Commit - CHECKLIST

Run these commands before every commit:

```bash
# 1. Check what you're about to commit
git diff --cached

# 2. Verify .env is NOT staged
git status | grep -E "\.env$"
# Should return nothing (or only .env.example)

# 3. Quick secret scan
git diff --cached | grep -iE "(api[_-]?key|secret|token|password|bearer)"
# Should return nothing suspicious
```

---

## ✅ Safe Files to Commit

| File | Safe? | Contains |
|------|-------|----------|
| `.env` | ❌ NO | Real secrets |
| `.env.example` | ✅ YES | Placeholders only |
| `.gitignore` | ✅ YES | Ignore rules |
| `.claudeignore` | ✅ YES | AI blocking rules |
| `eas.json` | ✅ YES | No secrets (use EAS Secrets) |
| `supabase/scripts/*.js` | ✅ YES | No hardcoded credentials |

---

## 🔐 Where Secrets Should Live

### Local Development
- **File:** `.env` (gitignored)
- **Usage:** Loaded by Expo automatically

### Production Builds (EAS)
- **Storage:** EAS Secrets
- **Set with:** `eas secret:create`
- **View with:** `eas secret:list`

### Example EAS Secret Setup
```bash
# Create secrets for production builds
eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_URL --value "https://your-project.supabase.co"
eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value "your-new-anon-key"
eas secret:create --scope project --name EXPO_PUBLIC_REVENUECAT_APPLE_KEY --value "appl_your-key"

# Verify they're set
eas secret:list
```

---

## 🔄 Key Rotation Schedule

| Secret Type | Rotation Frequency | Last Rotated |
|-------------|-------------------|--------------|
| Supabase Service Role Key | After exposure, or every 90 days | 🔴 ROTATE NOW |
| Supabase Anon Key | After exposure, or every 90 days | 🔴 ROTATE NOW |
| OpenAI API Key | After exposure, or every 90 days | 🔴 ROTATE NOW |
| RevenueCat Keys | After exposure, or yearly | 🔴 ROTATE NOW |

---

## 🆘 Emergency: "I Accidentally Committed Secrets!"

### Step 1: Rotate ALL exposed credentials immediately
Don't wait - assume they're compromised.

### Step 2: Remove from git history
```bash
# Remove file from all commits (DANGEROUS - creates new history)
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch .env" \
  --prune-empty --tag-name-filter cat -- --all

# Force push (warning: rewrites history)
git push origin --force --all
```

### Step 3: Notify your team
If this is a team repo, everyone needs to know credentials were exposed.

---

## 📋 Monthly Security Review

Run this audit monthly:

```bash
# 1. Check for secrets in tracked files
git grep -iE "(api[_-]?key|secret|token|password)" -- ':!.env' ':!*.md'

# 2. Verify .gitignore is working
git check-ignore .env
# Should output: .env

# 3. Check git history for accidents
git log --all --oneline | head -20

# 4. Review who has access
# GitHub: Settings → Collaborators
# GitLab: Project → Members
```

---

## 🛠️ Useful Commands

```bash
# Test if .env is properly ignored
git check-ignore -v .env

# See what's in staging area
git diff --cached --name-only

# Undo staging if you added .env by mistake
git restore --staged .env

# Check current EAS secrets
eas secret:list

# Delete an EAS secret (if needed)
eas secret:delete --name SECRET_NAME

# View .env without exposing in terminal history
cat .env | less
```

---

## 🎯 Best Practices Summary

### DO ✅
- Store secrets in `.env` (local) and EAS Secrets (production)
- Review every diff before committing
- Rotate credentials after exposure
- Use `.env.example` for documentation
- Keep `.claudeignore` updated

### DON'T ❌
- Never commit `.env` files
- Never hardcode credentials in source code
- Never use fallback credentials in scripts
- Never share `.env` via Slack/email/Discord
- Never skip the pre-commit diff review

---

## 📞 Support Links

- **Supabase Dashboard:** https://supabase.com/dashboard
- **OpenAI API Keys:** https://platform.openai.com/api-keys
- **RevenueCat Dashboard:** https://app.revenuecat.com
- **EAS Documentation:** https://docs.expo.dev/eas/

---

**Last Updated:** January 9, 2026  
**Audit Status:** ✅ Clean - All secrets secured
