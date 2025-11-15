# Pathible Debugging Guide

This guide helps you troubleshoot authentication, OTP, and user data issues in both development and production.

## Table of Contents

1. [Quick Troubleshooting](#quick-troubleshooting)
2. [Convex Tables Reference](#convex-tables-reference)
3. [Using Debug Queries](#using-debug-queries)
4. [OTP Flow Debugging](#otp-flow-debugging)
5. [Production Monitoring](#production-monitoring)

---

## Quick Troubleshooting

### Issue: "No OTP received"

**Check 1: Convex Backend Terminal**

Look for this output in your `pnpm dev` terminal (the Convex backend side):

```
==============================================
📧 OTP Email (Development Mode)
==============================================
To: user@example.com
Type: sign-in
Subject: Your Pathible Sign In Code
OTP Code: 123456
==============================================
```

**If you DON'T see this:**
- The OTP request never reached the server
- Check browser console for errors
- Check Network tab for failed API calls

**Check 2: Browser Console**

Open DevTools → Console, look for:
- ✅ `POST /api/auth/send-verification-otp 200` (success)
- ❌ `POST /api/auth/send-verification-otp 400` (bad request)
- ❌ `POST /api/auth/send-verification-otp 404` (not found)

**Check 3: Convex Dashboard**

1. Go to https://dashboard.convex.dev
2. Select your project
3. Go to "Data" tab
4. Check `_better_auth_verification` table
5. Look for recent entries with your email

---

## Convex Tables Reference

### Better Auth Tables (System-Managed)

These tables are automatically created and managed by Better Auth:

| Table | Purpose | Key Fields |
|-------|---------|------------|
| `_better_auth_user` | User accounts | `email`, `name`, `emailVerified`, `createdAt` |
| `_better_auth_session` | Active sessions | `userId`, `expiresAt`, `token` |
| `_better_auth_verification` | OTP codes | `identifier` (email), `value` (OTP), `expiresAt` |
| `_better_auth_account` | OAuth accounts | `provider`, `providerAccountId` |

### Pathible Tables (App-Managed)

These are your application tables:

| Table | Purpose | Key Fields |
|-------|---------|------------|
| `profiles` | User profiles | `userId`, `firstName`, `lastName`, `phone` |
| `userRoles` | Admin roles | `userId`, `role` (admin/user) |
| `households` | Family units | `name`, `primaryContactId`, `subscriptionTier` |
| `householdMemberships` | User-household links | `householdId`, `userId`, `role`, `status` |

---

## Using Debug Queries

### Via Convex Dashboard

1. Go to https://dashboard.convex.dev
2. Select your project
3. Click "Functions" in the sidebar
4. Find the `debug` module
5. Click on any query to run it

### Available Debug Queries

#### `debug.getDatabaseStats`
**Purpose**: Get overview of all data
**Returns**: Counts of users, profiles, sessions, etc.

```typescript
// Run in Convex dashboard (no args needed)
```

**Example Output**:
```json
{
  "betterAuth": {
    "users": 5,
    "activeSessions": 3,
    "pendingVerifications": 2
  },
  "pathible": {
    "profiles": 4,
    "roles": 1,
    "households": 2,
    "memberships": 6
  },
  "health": {
    "orphanedProfiles": 0,
    "usersWithoutProfiles": 1
  }
}
```

#### `debug.getUserByEmail`
**Purpose**: Get complete user info
**Args**: `{ email: "user@example.com" }`

```typescript
// In Convex dashboard, pass args:
{
  "email": "jim@example.com"
}
```

**Example Output**:
```json
{
  "user": {
    "id": "abc123",
    "email": "jim@example.com",
    "emailVerified": true,
    "createdAt": 1234567890
  },
  "profile": {
    "id": "def456",
    "firstName": "Jim",
    "lastName": "Smith",
    "phone": null
  },
  "role": "admin",
  "households": [
    {
      "householdId": "ghi789",
      "role": "owner",
      "status": "active"
    }
  ]
}
```

#### `debug.listAllVerifications`
**Purpose**: See all pending/recent OTP codes
**Returns**: All verification records

**What to Look For**:
- Recent entry with your email? → OTP was created ✅
- No entry? → OTP creation failed ❌
- Entry expired? → OTP too old (5+ minutes) ⏰

#### `debug.listAllUsers`
**Purpose**: See all registered users

#### `debug.listAllSessions`
**Purpose**: See who's currently logged in

#### `debug.listAllProfiles`
**Purpose**: See all user profiles

---

## OTP Flow Debugging

### Step-by-Step: Where to Look

**Step 1: User Enters Email**

**Browser Console:**
```
POST /api/auth/send-verification-otp
```

**What to check:**
- Status code: Should be `200` or `201`
- If `400`: Invalid email format
- If `404`: Auth route not registered
- If `500`: Server error (check Convex logs)

**Step 2: OTP Sent**

**Convex Terminal (Development):**
```
==============================================
📧 OTP Email (Development Mode)
==============================================
To: jim@example.com
Type: sign-in
Subject: Your Pathible Sign In Code
OTP Code: 835291
==============================================
```

**If using Resend (Production):**
```
[Resend] OTP email sent successfully to jim@example.com (ID: abc-123-def-456)
```

**Step 3: OTP Stored in Database**

**Convex Dashboard → Data → `_better_auth_verification`:**
- New row should appear with:
  - `identifier`: Your email
  - `value`: Encrypted OTP or plain text (depending on `storeOTP` setting)
  - `expiresAt`: Timestamp 5 minutes in future
  - `_creationTime`: Just now

**Step 4: User Enters OTP**

**Browser Console:**
```
POST /api/auth/sign-in/email-otp
```

**What to check:**
- Status `200`: Success ✅
- Status `400` + "Invalid OTP": Wrong code
- Status `400` + "Too many attempts": Exceeded 3 attempts
- Status `400` + "Expired": OTP older than 5 minutes

**Step 5: Session Created**

**Convex Dashboard → Data → `_better_auth_session`:**
- New row should appear with:
  - `userId`: User's ID
  - `expiresAt`: Future timestamp
  - `token`: Session token (encrypted)

**Step 6: Profile Created (First-Time Users)**

**Convex Dashboard → Data → `profiles`:**
- New row should appear with:
  - `userId`: Same as Better Auth user ID
  - `firstName`, `lastName`: From onboarding form

---

## Production Monitoring

### Environment Variables Check

**Required for Production:**
```bash
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxx
EMAIL_FROM_ADDRESS=noreply@pathible.com
EMAIL_FROM_NAME=Pathible
```

**Verify in Production:**
1. Check environment variables are set
2. Check Resend dashboard for sent emails
3. Check Convex logs for errors

### Logging Patterns

**Success Patterns:**

```
[Resend] OTP email sent successfully to user@example.com (ID: abc-123)
```

**Error Patterns:**

```
[Resend] Failed to send OTP email: { error: "..." }
```

```
[Auth] Failed to get server session: Error: ...
```

```
Error: Unauthorized: Authentication required
```

### Common Issues & Solutions

#### Issue: OTPs not sending in production

**Check:**
1. `RESEND_API_KEY` is set correctly
2. Domain is verified in Resend dashboard
3. `EMAIL_FROM_ADDRESS` uses verified domain
4. Check Resend dashboard for failed deliveries

#### Issue: Users can't access dashboard

**Debug:**
1. Run `debug.getUserByEmail` with their email
2. Check if user exists in `_better_auth_user`
3. Check if profile exists in `profiles`
4. Check if session exists in `_better_auth_session`

**Common causes:**
- User never completed onboarding (no profile)
- Session expired
- User account exists but profile missing

#### Issue: "Too many attempts" error

**Cause:** User entered wrong OTP 3+ times

**Solution:**
1. Wait for OTP to expire (5 minutes)
2. Request new OTP
3. OTP counter resets with new code

#### Issue: Orphaned data

**Symptom:** `health.orphanedProfiles > 0` in stats

**Cause:** Profile exists but user deleted from Better Auth

**Solution:**
```typescript
// Clean up manually in Convex dashboard or create cleanup function
```

---

## Quick Reference Commands

### Check if OTP system is working
```bash
# Terminal 1: Start dev server
pnpm dev

# Watch for OTP logs in the Convex backend terminal output
```

### Check Convex data
```bash
# Go to Convex dashboard
open https://dashboard.convex.dev

# Navigate: Your Project → Data tab → Select table
```

### Test OTP flow end-to-end
1. Visit `/login`
2. Enter test email
3. Check Convex terminal for OTP
4. Enter OTP
5. Complete onboarding
6. Access dashboard

### Verify Resend integration
```bash
# Check env variable
echo $RESEND_API_KEY

# Test email sending (create test script if needed)
```

---

## Getting Help

### Information to Gather

When reporting an issue, include:

1. **User Email**: What email is being used?
2. **Error Message**: Exact error text
3. **Console Logs**: Browser console output
4. **Convex Logs**: Terminal output from Convex
5. **Network**: Screenshot of Network tab showing failed requests
6. **Debug Query Results**: Output from `debug.getUserByEmail` or `debug.getDatabaseStats`

### Where to Look First

1. **Browser DevTools Console** - Client-side errors
2. **Convex Terminal** - OTP logs and server errors
3. **Convex Dashboard → Data** - Check table contents
4. **Convex Dashboard → Logs** - Server-side errors
5. **Resend Dashboard** (if using) - Email delivery status

---

## Health Checks

### Daily Checks (Production)

```typescript
// Run debug.getDatabaseStats
// Look for:
✅ activeSessions > 0 (people are using the app)
✅ usersWithoutProfiles === 0 (everyone completed onboarding)
✅ orphanedProfiles === 0 (no data inconsistencies)
```

### Weekly Checks (Production)

1. Check Resend dashboard for delivery rates
2. Review Convex logs for errors
3. Check `_better_auth_verification` table - old entries should auto-clean
4. Verify session cleanup is working

---

## Support

- Convex Issues: https://discord.gg/convex
- Better Auth Issues: https://github.com/better-auth/better-auth/issues
- Resend Issues: https://resend.com/docs
