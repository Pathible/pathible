# Debug Authentication Command

Quickly diagnose authentication issues by checking user state, sessions, and profiles in Convex.

## Arguments

$ARGUMENTS

## Argument Parsing

Arguments are passed via `$ARGUMENTS`. Parse as follows:

| Argument Type | Format | Example |
|---------------|--------|---------|
| Email | Plain text | `user@example.com` |
| Flags | `--flag-name` | `--all`, `--sessions` |

**Supported Arguments:**

- `<email>` - Look up a specific user by email
- `--all` - Show database stats overview
- `--sessions` - List active sessions
- `--profiles` - List profiles without matching users (orphans)

**Error Handling:**

- If no arguments provided, default to `--all`
- If email format is invalid, warn: "Invalid email format. Please provide a valid email address."

## Instructions

### Step 1: Parse Arguments

Determine which debug action to perform based on arguments.

### Step 2: Execute Debug Queries

#### Option A: User Lookup (`<email>`)

Run the Convex dashboard or use internal queries to check:

1. **Clerk User**: Does a user with this email exist in Clerk?
   ```bash
   # Check via Clerk Dashboard or API if available
   ```

2. **Profile**: Does a profile exist in Convex `profiles` table?
   ```typescript
   // Query pattern
   ctx.db.query("profiles")
     .filter(q => q.eq(q.field("email"), email))
     .first()
   ```

3. **Household Membership**: Is user part of a household?
   ```typescript
   ctx.db.query("householdMemberships")
     .withIndex("by_user", q => q.eq("userId", profileId))
     .collect()
   ```

4. **Subscription Status**: What tier is their household on?

Output a summary:
```
User Debug Report: user@example.com
================================
Clerk User:     Found (ID: user_xxx)
Profile:        Found (ID: profiles:xxx)
Household:      Found (ID: households:xxx, Role: owner)
Subscription:   heritage (active)
Last Login:     2024-12-31 10:30:00
```

#### Option B: Database Overview (`--all`)

Query counts from key tables:
- Total profiles
- Active sessions (from Clerk)
- Households with subscription status
- Orphaned profiles (profile without Clerk user)

Output:
```
Database Overview
=================
Profiles:           42
Active Households:  18
  - Foundations:    10
  - Heritage:       5
  - Legacy:         3
Orphaned Profiles:  0
```

#### Option C: Sessions (`--sessions`)

List recent active sessions with:
- User email
- Session created time
- Expiration time

#### Option D: Orphan Check (`--profiles`)

Find profiles that may be orphaned:
- Profiles without corresponding Clerk user
- Profiles without household membership
- Duplicate profiles for same email

### Step 3: Provide Recommendations

Based on findings, suggest fixes:

| Issue | Recommendation |
|-------|----------------|
| No profile for user | User needs to complete onboarding |
| No household | Run `ensureCurrentUserInPrimaryFamily` |
| Orphaned profile | Consider cleanup via testing module |
| Expired session | User needs to re-authenticate |
| Cancelled subscription | Check Clerk billing status |

### Step 4: Output Report

Format the results clearly:

```markdown
# Auth Debug Report

## Summary
- **Query**: user@example.com
- **Status**: Issue Found

## Findings
1. User exists in Clerk: Yes
2. Profile exists: Yes
3. Household membership: **Missing**

## Recommendations
- Run the onboarding flow to create household membership
- Or manually invoke `ensureCurrentUserInPrimaryFamily` mutation

## Quick Commands
```bash
# View in Convex Dashboard
open https://dashboard.convex.dev/d/pathible/data/profiles

# Check Clerk Dashboard
open https://dashboard.clerk.com/apps/[app-id]/users
```
```

## Common Issues Reference

| Symptom | Likely Cause | Fix |
|---------|--------------|-----|
| Can't access dashboard | No profile | Complete onboarding |
| "Unauthorized" errors | No household membership | Run ensureCurrentUserInPrimaryFamily |
| Features restricted | Subscription tier | Check Clerk billing |
| Duplicate login prompts | Session expired | Clear cookies, re-login |
| Onboarding loop | Profile exists but incomplete | Check profile fields |
