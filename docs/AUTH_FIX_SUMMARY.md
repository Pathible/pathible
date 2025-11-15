# Authentication Flow Debug & Fix Summary

## Date: 2025-11-11
## Status: FIXED

This document summarizes all the fixes applied to resolve the authentication flow issues in Pathible.

---

## Issues Fixed

### 1. Profile Creation Circular Dependency (CRITICAL)

**Problem:**
The `profiles.create` mutation called `requireAuth()`, which expects a profile to exist. This created a circular dependency - we couldn't create a profile because `requireAuth()` was looking for a profile that didn't exist yet.

**Location:** `/Users/jimgibbs/Code/pathible/src/convex/profiles.ts`

**Fix Applied:**
- Changed `profiles.create` to use `authComponent.getAuthUser(ctx)` directly instead of `requireAuth()`
- Only checks that the user is authenticated, not that they have a profile
- Added console logging to track profile creation

**Code Change:**
```typescript
// BEFORE (BROKEN):
export const create = mutation({
  handler: async (ctx, args) => {
    const { user } = await requireAuth(ctx);  // ← FAILS because profile doesn't exist yet!
    // ...
  },
});

// AFTER (FIXED):
export const create = mutation({
  handler: async (ctx, args) => {
    // Get user directly without requiring profile (profile doesn't exist yet!)
    const user = await authComponent.getAuthUser(ctx);
    if (!user) {
      throw new Error("Not authenticated");
    }

    console.log(`[Profile] Creating profile for user ${user._id}`);
    // ... rest of profile creation logic
    console.log(`[Profile] Created profile ${profileId} for user ${user._id}`);
  },
});
```

---

### 2. Missing OTP Debug Logging

**Problem:**
No console output was visible when OTP emails were being sent, making it impossible to debug whether the OTP flow was working.

**Location:** `/Users/jimgibbs/Code/pathible/src/convex/auth.ts`

**Fix Applied:**
Added comprehensive debug logging to the `sendVerificationOTP` function:

**Logs Added:**
```typescript
console.log('==============================================');
console.log('[OTP] sendVerificationOTP CALLED');
console.log('[OTP] Email:', email);
console.log('[OTP] Type:', type);
console.log('[OTP] OTP Code:', otp);
console.log('[OTP] Resend configured:', !!resend);
console.log('[OTP] Site URL:', siteUrl);
console.log('==============================================');
```

**Development Mode Output:**
```
==============================================
📧 OTP Email (Development Mode)
==============================================
To: user@example.com
Type: sign-in
Subject: Sign in to Pathible
OTP Code: 123456
==============================================
Note: Configure RESEND_API_KEY to send real emails
==============================================
```

**Production Mode Logging:**
```typescript
console.log('[OTP] Attempting to send via Resend...');
// ... after send
console.log(`[OTP] ✅ Success! Email sent to ${email} (ID: ${data?.id})`);
```

---

### 3. Missing Auth Check on Onboarding Page

**Problem:**
The onboarding page could be accessed without a valid authentication session, allowing users to bypass the login flow.

**Location:** `/Users/jimgibbs/Code/pathible/src/app/(unauth)/onboarding/page.tsx`

**Fix Applied:**
Added authentication verification before allowing access to the onboarding form:

**Code Change:**
```typescript
const [isCheckingAuth, setIsCheckingAuth] = useState(true);

// Check authentication status FIRST before allowing access
useEffect(() => {
  const checkAuth = async () => {
    try {
      console.log('[Onboarding] Checking authentication...');
      const session = await authClient.getSession();
      console.log('[Onboarding] Session check:', session?.data?.session ? 'Valid session' : 'No session');

      if (!session?.data?.session) {
        console.log('[Onboarding] No valid session, redirecting to login');
        router.push('/login');
        return;
      }

      console.log('[Onboarding] Authentication verified');
      setIsCheckingAuth(false);
    } catch (error) {
      console.error('[Onboarding] Auth check failed:', error);
      router.push('/login');
    }
  };
  checkAuth();
}, [router]);

// Show loading while checking auth
if (isCheckingAuth) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <div className="spinner mx-auto" />
        <p className="text-secondary">Verifying session...</p>
      </div>
    </div>
  );
}
```

**Flow:**
1. User lands on `/onboarding`
2. Page checks for valid session using `authClient.getSession()`
3. If no session: Redirect to `/login`
4. If session exists: Show onboarding form
5. If profile already exists: Redirect to `/dashboard`

---

### 4. Added Better Auth Status Debug Query

**Problem:**
No easy way to check if Better Auth component was properly initialized and working.

**Location:** `/Users/jimgibbs/Code/pathible/src/convex/debug.ts`

**Fix Applied:**
Added `checkBetterAuthStatus` query to diagnose Better Auth component health:

```typescript
export const checkBetterAuthStatus = query({
  args: {},
  returns: v.any(),
  handler: async (ctx) => {
    try {
      const user = await authComponent.getAuthUser(ctx);

      if (!user) {
        return {
          componentWorking: true,
          hasCurrentUser: false,
          message: "Better Auth component is working, but no user is currently authenticated",
        };
      }

      return {
        componentWorking: true,
        hasCurrentUser: true,
        currentUserId: user._id,
        currentUserEmail: (user as any)?.email,
        currentUserEmailVerified: (user as any)?.emailVerified,
        currentUserCreatedAt: (user as any)?.createdAt,
      };
    } catch (error) {
      return {
        componentWorking: false,
        error: error instanceof Error ? error.message : "Unknown error",
        message: "Better Auth component appears to be misconfigured",
      };
    }
  },
});
```

**Usage:**
Run this query in Convex dashboard to verify Better Auth is working correctly.

---

## Better Auth Component Configuration

**Location:** `/Users/jimgibbs/Code/pathible/src/convex/convex.config.ts`

**Status:** VERIFIED - Properly configured

```typescript
import { defineApp } from "convex/server";
import betterAuth from "@convex-dev/better-auth/convex.config";
const app = defineApp();
app.use(betterAuth);
export default app;
```

The Better Auth component is correctly registered and will create its own tables:
- `_better_auth_user`
- `_better_auth_session`
- `_better_auth_verification`
- `_better_auth_account`

These tables are managed internally by the Better Auth component and are separate from the `app` database by design.

---

## Testing the Fixed Flow

### Prerequisites
1. Start the development server:
   ```bash
   pnpm dev
   ```

2. Clear existing data (if needed):
   - Convex dashboard: Delete all documents from `profiles` table
   - Browser: Clear cookies and localStorage

### Test Flow

#### 1. Request OTP
- Visit `/login`
- Enter email address
- Click "Send Code"

**Expected Console Output (Convex terminal):**
```
==============================================
[OTP] sendVerificationOTP CALLED
[OTP] Email: test@example.com
[OTP] Type: sign-in
[OTP] OTP Code: 123456
[OTP] Resend configured: false
[OTP] Site URL: http://localhost:3000
==============================================

==============================================
📧 OTP Email (Development Mode)
==============================================
To: test@example.com
Type: sign-in
Subject: Sign in to Pathible
OTP Code: 123456
==============================================
Note: Configure RESEND_API_KEY to send real emails
==============================================
```

**Expected Browser Console:**
- No errors
- Successful API call to `/api/auth/otp/send-verification-otp`

#### 2. Verify OTP
- Enter the OTP code from console
- Click "Verify"

**Expected Console Output (Convex terminal):**
```
[Auth] User authenticated successfully
[Session] Session created
```

**Expected Browser Behavior:**
- Redirect to `/onboarding`

**Expected Browser Console:**
```
[Onboarding] Checking authentication...
[Onboarding] Session check: Valid session
[Onboarding] Authentication verified
```

#### 3. Complete Onboarding
- Enter first name and last name
- Click "Continue to Dashboard"

**Expected Console Output (Convex terminal):**
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
- Redirect to `/dashboard`

#### 4. Verify in Convex Dashboard
- Go to Convex dashboard
- Check `profiles` table - should have 1 document
- Run `debug.checkBetterAuthStatus` query - should show authenticated user
- Run `debug.amIAuthenticated` query - should show `authenticated: true, hasProfile: true`

---

## Expected Console Output Summary

### Development Mode (No RESEND_API_KEY)

**Convex Terminal:**
```
==============================================
[OTP] sendVerificationOTP CALLED
[OTP] Email: user@example.com
[OTP] Type: sign-in
[OTP] OTP Code: 123456
[OTP] Resend configured: false
==============================================
📧 OTP Email (Development Mode)
==============================================
To: user@example.com
Type: sign-in
OTP Code: 123456
==============================================

[Profile] Creating profile for user kg2abc123
[Profile] Created profile kg2xyz789 for user kg2abc123
```

**Browser Console:**
```
[Onboarding] Checking authentication...
[Onboarding] Session check: Valid session
[Onboarding] Authentication verified
[Onboarding] Creating profile...
[Onboarding] Profile created successfully
```

---

## Debug Queries Available

Run these in the Convex dashboard to troubleshoot:

1. **Check Better Auth Status:**
   ```
   debug.checkBetterAuthStatus()
   ```

2. **Check Current User:**
   ```
   debug.getCurrentAuthUser()
   ```

3. **Check My Info:**
   ```
   debug.getMyCompleteInfo()
   ```

4. **Check Auth Status:**
   ```
   debug.amIAuthenticated()
   ```

5. **List All Profiles:**
   ```
   debug.listAllProfiles()
   ```

6. **Database Stats:**
   ```
   debug.getDatabaseStats()
   ```

---

## Files Modified

1. `/Users/jimgibbs/Code/pathible/src/convex/profiles.ts`
   - Fixed circular dependency in `create` mutation
   - Added import for `authComponent`
   - Added debug logging

2. `/Users/jimgibbs/Code/pathible/src/convex/auth.ts`
   - Added comprehensive debug logging to `sendVerificationOTP`
   - Logs OTP code, email, type, and Resend configuration

3. `/Users/jimgibbs/Code/pathible/src/app/(unauth)/onboarding/page.tsx`
   - Added authentication check before showing form
   - Added loading state while checking auth
   - Added redirect to login if not authenticated
   - Added debug logging

4. `/Users/jimgibbs/Code/pathible/src/convex/debug.ts`
   - Added `checkBetterAuthStatus` query
   - Improved error handling in debug queries

---

## Known Good Architecture

The current architecture is correct:
- `betterAuth` = Component managing authentication (separate database)
- `app` = Your application code (profiles, households, etc.)

This separation is intentional and follows Better Auth best practices. The component manages its own tables internally, which is why you see them as separate in the Convex dashboard.

---

## Next Steps

After applying these fixes:

1. **Test the complete flow** following the test instructions above
2. **Monitor console logs** in both Convex terminal and browser
3. **Verify profile creation** in Convex dashboard
4. **Check debug queries** to ensure all data is correct

If issues persist:
1. Check that OTP logs appear in Convex terminal
2. Verify session is created after OTP verification
3. Confirm onboarding page checks auth before showing form
4. Run `debug.checkBetterAuthStatus()` to verify component health

---

## Production Deployment

For production, ensure these environment variables are configured:

```env
# Required
CONVEX_DEPLOYMENT=your-deployment-id
NEXT_PUBLIC_CONVEX_URL=https://your-app.convex.cloud
NEXT_PUBLIC_CONVEX_SITE_URL=https://your-app.convex.site
SITE_URL=https://your-domain.com

# Optional (recommended for production)
RESEND_API_KEY=your-resend-api-key
EMAIL_FROM_ADDRESS=noreply@your-domain.com
EMAIL_FROM_NAME=Your App Name
```

With `RESEND_API_KEY` configured, OTP emails will be sent via Resend instead of logged to console.

---

## Summary

All critical authentication flow issues have been resolved:

1. ✅ Profile creation circular dependency - FIXED
2. ✅ OTP logging for debugging - ADDED
3. ✅ Onboarding authentication check - FIXED
4. ✅ Better Auth status debugging - ADDED
5. ✅ Better Auth component configuration - VERIFIED

The authentication flow should now work end-to-end with proper debugging visibility at each step.
