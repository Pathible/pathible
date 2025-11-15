# Authentication Flow Testing Guide

## Quick Start

### 1. Start Development Server
```bash
pnpm dev
```

This starts both Next.js and Convex in parallel.

### 2. Clear Data (Optional)
If you need a fresh start:
- Convex Dashboard: Delete documents from `profiles` table
- Browser: Clear cookies and localStorage for `localhost:3000`

---

## Test Flow

### Step 1: Request OTP Code

**Action:**
1. Visit `http://localhost:3000/login`
2. Enter email: `test@example.com`
3. Click "Send Code"

**Expected Convex Terminal Output:**
```
==============================================
[OTP] sendVerificationOTP CALLED
[OTP] Email: test@example.com
[OTP] Type: sign-in
[OTP] OTP Code: 123456  ← COPY THIS CODE
[OTP] Resend configured: false
[OTP] Site URL: http://localhost:3000
==============================================
📧 OTP Email (Development Mode)
==============================================
To: test@example.com
Type: sign-in
Subject: Sign in to Pathible
OTP Code: 123456
==============================================
```

**Expected Browser Console:**
- No errors
- Success message from API call

**If You Don't See Logs:**
- OTP request isn't reaching the server
- Check browser Network tab for `/api/auth/*` errors
- Verify Convex is running (`pnpm dev` should show both processes)

---

### Step 2: Enter OTP Code

**Action:**
1. Copy the OTP code from Convex terminal (e.g., `123456`)
2. Paste into the verification input
3. Click "Verify"

**Expected Browser Behavior:**
- Success message
- Redirect to `/onboarding`

**Expected Browser Console:**
```
[Onboarding] Checking authentication...
[Onboarding] Session check: Valid session
[Onboarding] Authentication verified
```

**If Redirected to Login:**
- Session not created properly
- Check Convex logs for session creation errors
- Run `debug.checkBetterAuthStatus()` in Convex dashboard

---

### Step 3: Complete Onboarding

**Action:**
1. Should see "Complete Your Profile" page
2. Enter First Name: `John`
3. Enter Last Name: `Smith`
4. Click "Continue to Dashboard"

**Expected Convex Terminal Output:**
```
[Profile] Creating profile for user kg2abc123def456
[Profile] Created profile kg2xyz789ghi012 for user kg2abc123def456
```

**Expected Browser Console:**
```
[Onboarding] Creating profile...
[Onboarding] Profile created successfully
```

**Expected Browser Behavior:**
- Success toast: "Welcome to Pathible! Your profile has been created."
- Redirect to `/dashboard` after 500ms

**If Profile Creation Fails:**
- Check Convex terminal for error message
- Run `debug.checkBetterAuthStatus()` - should show `hasCurrentUser: true`
- Verify user is authenticated before profile creation

---

### Step 4: Verify in Convex Dashboard

**Go to Convex Dashboard Data Tab:**

1. Check `profiles` table:
   - Should have 1 document
   - Should have `firstName: "John"`, `lastName: "Smith"`
   - Should have `userId` pointing to Better Auth user

2. Check `_better_auth_users` table (in betterAuth component):
   - Should have 1 user
   - Should have `email: "test@example.com"`

**Run Debug Queries:**

1. **Check Authentication:**
   ```
   debug.amIAuthenticated()
   ```
   Expected:
   ```json
   {
     "authenticated": true,
     "hasProfile": true,
     "email": "test@example.com"
   }
   ```

2. **Check Better Auth Status:**
   ```
   debug.checkBetterAuthStatus()
   ```
   Expected:
   ```json
   {
     "componentWorking": true,
     "hasCurrentUser": true,
     "currentUserId": "kg2...",
     "currentUserEmail": "test@example.com",
     "currentUserEmailVerified": false
   }
   ```

3. **Get Complete Info:**
   ```
   debug.getMyCompleteInfo()
   ```
   Expected:
   ```json
   {
     "user": {
       "id": "kg2...",
       "email": "test@example.com",
       "emailVerified": false
     },
     "profile": {
       "id": "kg2...",
       "firstName": "John",
       "lastName": "Smith"
     },
     "systemRole": "user",
     "households": []
   }
   ```

---

## Common Issues & Solutions

### Issue: No OTP Logs in Convex Terminal

**Symptoms:**
- No console output when clicking "Send Code"
- No OTP code visible

**Check:**
1. Is Convex running? (`pnpm dev` should show both Next.js and Convex)
2. Browser Network tab - Any errors on `/api/auth/otp/send-verification-otp`?
3. Browser console - Any JavaScript errors?

**Solution:**
- Restart `pnpm dev`
- Clear browser cache
- Check that `SITE_URL` is set in `.env.local`

---

### Issue: "Not authenticated" Error on Profile Creation

**Symptoms:**
- Onboarding page redirects to login
- Error: "Not authenticated"

**Check:**
1. Run `debug.checkBetterAuthStatus()` in Convex dashboard
2. Check browser cookies - Should have auth session cookie
3. Browser console - Check for session validation errors

**Solution:**
- The fix in `profiles.ts` should resolve this
- If still occurring, session isn't being created after OTP
- Check Better Auth component is properly installed

---

### Issue: "Profile not found" Error (Circular Dependency)

**Symptoms:**
- Error when trying to create profile
- Convex logs show "Profile not found"

**Status:** FIXED

**Old Code (Broken):**
```typescript
export const create = mutation({
  handler: async (ctx, args) => {
    const { user } = await requireAuth(ctx);  // ← Looks for profile that doesn't exist
    // ...
  },
});
```

**New Code (Fixed):**
```typescript
export const create = mutation({
  handler: async (ctx, args) => {
    const user = await authComponent.getAuthUser(ctx);  // ← Only checks auth
    // ...
  },
});
```

---

### Issue: Onboarding Page Accessible Without Auth

**Symptoms:**
- Can access `/onboarding` without logging in
- No "Verifying session..." message

**Status:** FIXED

**Solution Applied:**
- Added auth check in `onboarding/page.tsx`
- Shows loading spinner while checking auth
- Redirects to login if no session

---

## Debug Commands

### In Convex Dashboard Functions Tab

Run these to check system state:

```javascript
// Check if Better Auth component is working
debug.checkBetterAuthStatus()

// Check current user (must be logged in)
debug.getCurrentAuthUser()

// Check authentication status
debug.amIAuthenticated()

// Get complete user info
debug.getMyCompleteInfo()

// List all profiles
debug.listAllProfiles()

// Get database stats
debug.getDatabaseStats()
```

---

## Expected Success Flow

### Terminal Output (Convex)
```
[OTP] sendVerificationOTP CALLED
[OTP] Email: test@example.com
[OTP] OTP Code: 123456
📧 OTP Email (Development Mode)
To: test@example.com
OTP Code: 123456

[Profile] Creating profile for user kg2abc123
[Profile] Created profile kg2xyz789 for user kg2abc123
```

### Browser Console Output
```
[Onboarding] Checking authentication...
[Onboarding] Session check: Valid session
[Onboarding] Authentication verified
[Onboarding] Creating profile...
[Onboarding] Profile created successfully
```

### Browser Behavior
1. Login page → Enter email → OTP input appears
2. Enter OTP → Redirect to onboarding
3. Onboarding → Shows "Verifying session..." briefly
4. Onboarding form → Enter name → Click continue
5. Success toast → Redirect to dashboard

### Convex Dashboard
- `profiles` table: 1 document (John Smith)
- `_better_auth_users` table: 1 user (test@example.com)
- Debug queries return user data

---

## Test Checklist

- [ ] Start `pnpm dev` - Both Next.js and Convex running
- [ ] Visit `/login` - Page loads without errors
- [ ] Enter email - "Send Code" button works
- [ ] Convex logs show OTP code
- [ ] Enter OTP - Redirects to `/onboarding`
- [ ] Onboarding shows "Verifying session..." briefly
- [ ] Onboarding form appears (not redirected to login)
- [ ] Submit name - Convex logs show profile creation
- [ ] Success toast appears
- [ ] Redirect to `/dashboard`
- [ ] Convex dashboard shows profile document
- [ ] `debug.amIAuthenticated()` returns `true`

---

## Production Testing

For production with Resend configured:

### Environment Setup
```env
RESEND_API_KEY=re_...
EMAIL_FROM_ADDRESS=noreply@your-domain.com
EMAIL_FROM_NAME=Pathible
```

### Expected Behavior
1. OTP sent via Resend (check email inbox)
2. Convex logs show Resend success:
   ```
   [OTP] Attempting to send via Resend...
   [OTP] ✅ Success! Email sent to user@example.com (ID: abc123)
   ```
3. User receives email with OTP code
4. Rest of flow same as development

---

## Support

If issues persist after following this guide:

1. Check all files were updated:
   - `/src/convex/profiles.ts`
   - `/src/convex/auth.ts`
   - `/src/app/(unauth)/onboarding/page.tsx`
   - `/src/convex/debug.ts`

2. Verify Better Auth component:
   ```
   debug.checkBetterAuthStatus()
   ```
   Should return `componentWorking: true`

3. Check logs in order:
   - Convex terminal (OTP + profile creation)
   - Browser console (onboarding checks)
   - Convex dashboard (data verification)

4. Review complete fix summary:
   `/docs/AUTH_FIX_SUMMARY.md`
