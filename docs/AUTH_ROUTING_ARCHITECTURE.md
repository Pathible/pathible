# Authentication Routing Architecture

## Overview

This document explains how authentication routing works in Pathible to eliminate the "onboarding flash" issue where users would briefly see intermediate pages during the authentication flow.

## Problem We Solved

**Previous Architecture:**
- User logs in → Login page redirects to `/onboarding`
- Onboarding page loads → Client checks if profile exists
- If profile exists → Client redirects to `/dashboard`
- Result: User sees onboarding page briefly (flash/flicker)

**New Architecture:**
- User logs in → Middleware checks profile status **before** any page loads
- Middleware routes directly to correct destination
- Result: Clean, instant routing with no flicker

## Architecture Components

### 1. Next.js Middleware (`/src/middleware.ts`)

The middleware is the **single source of truth** for routing decisions. It runs on every request **before** any page renders.

**Key Responsibilities:**
- Reads auth token from cookies (`better-auth.session_token`)
- Fetches user profile status from Convex
- Makes routing decisions based on auth state
- Redirects before any page content loads

**Routing Logic:**

```
┌─────────────────────────────────────────────────────────────┐
│                     Middleware Decision Tree                 │
└─────────────────────────────────────────────────────────────┘

No Token + Protected Route → /login?redirect=[route]
No Token + Public Route → Allow

Has Token + /login:
  ├─ Has Profile → /dashboard (or redirect param)
  └─ No Profile → /onboarding

Has Token + /onboarding:
  └─ Has Profile → /dashboard (prevent access)

Has Token + Protected Route:
  ├─ Has Profile → Allow
  └─ No Profile → /onboarding
```

**Routes Handled by Middleware:**
- `/dashboard/*` - Protected routes
- `/settings/*` - Protected routes
- `/login` - Redirect if already authenticated
- `/onboarding` - Redirect if profile already exists

### 2. Auth Layout (`/src/app/(auth)/layout.tsx`)

**Simplified Responsibility:**
- Assumes user is authenticated and has profile (middleware guarantees this)
- Fetches user data using `requireServerAuth()`
- Wraps content with `DashboardLayout`

**What Changed:**
- Removed redirect logic (middleware handles this)
- No longer needs conditional checks
- Cleaner, single-purpose component

### 3. Login Page (`/src/app/(unauth)/login/page.tsx`)

**Simplified Responsibility:**
- Handles email OTP authentication flow
- After successful login, redirects to intended destination
- Middleware automatically routes to correct page based on profile status

**What Changed:**
- Changed redirect from `/onboarding` to `redirect` param (defaults to `/dashboard`)
- Middleware determines if user should see onboarding or dashboard
- No longer makes profile status decisions

### 4. Onboarding Page (`/src/app/(unauth)/onboarding/page.tsx`)

**Simplified Responsibility:**
- Collects user profile information
- Creates profile in database
- Redirects to dashboard after completion

**What Changed:**
- Removed all auth checks (middleware handles this)
- Removed profile existence checks (middleware prevents access if profile exists)
- Cleaner, single-purpose component focused on form

## Flow Diagrams

### First-Time User Flow

```
User Logs In
     │
     ├─→ Login page calls authClient.signIn.emailOtp()
     │
     ├─→ Login page redirects to /dashboard
     │
     ├─→ Middleware intercepts request
     │   ├─ Reads token from cookies
     │   ├─ Fetches user from Convex
     │   └─ Finds NO profile
     │
     ├─→ Middleware redirects to /onboarding
     │
     ├─→ User fills out profile form
     │
     ├─→ Onboarding submits profile
     │
     ├─→ Onboarding redirects to /dashboard
     │
     ├─→ Middleware intercepts request
     │   ├─ Reads token from cookies
     │   ├─ Fetches user from Convex
     │   └─ Finds profile exists
     │
     └─→ Middleware allows request → Dashboard renders
```

### Returning User Flow

```
User Logs In
     │
     ├─→ Login page calls authClient.signIn.emailOtp()
     │
     ├─→ Login page redirects to /dashboard
     │
     ├─→ Middleware intercepts request
     │   ├─ Reads token from cookies
     │   ├─ Fetches user from Convex
     │   └─ Finds profile exists
     │
     └─→ Middleware allows request → Dashboard renders
```

### Unauthorized Access Attempt

```
Anonymous User → /dashboard
     │
     ├─→ Middleware intercepts request
     │   ├─ Reads cookies
     │   └─ Finds NO token
     │
     └─→ Middleware redirects to /login?redirect=/dashboard
```

## Benefits of This Architecture

### 1. Zero Visible Redirects
- All routing decisions happen in middleware before page render
- Users never see intermediate pages
- Smooth, instant navigation

### 2. Single Source of Truth
- All routing logic centralized in middleware
- No duplicate checks across multiple components
- Easier to maintain and debug

### 3. Security First
- Server-side token validation
- No client-side auth bypasses possible
- Protected content never loads before auth check

### 4. Better Performance
- Middleware runs at edge (Vercel Edge Functions)
- Fast token verification
- No client-side auth waterfalls

### 5. Cleaner Components
- Each component has single, clear responsibility
- No complex auth logic scattered across pages
- Easier to test and reason about

## Technical Details

### Cookie Management

Better Auth stores session token in cookie:
```
Cookie Name: better-auth.session_token
Location: Browser cookies
Read By: Middleware on every request
```

### Convex Integration

Middleware calls Convex to check profile status:
```typescript
const userWithProfile = await fetchQuery(
  api.auth.getCurrentUserWithProfile,
  {},
  { token }
);
```

This query:
1. Validates the token
2. Fetches user from Better Auth
3. Checks if profile exists in Convex
4. Returns combined result or null

### Error Handling

If token is invalid or Convex query fails:
- Middleware redirects to login
- User starts fresh authentication flow
- Prevents infinite redirect loops

## Configuration

### Middleware Matcher

Configure which routes middleware should handle:
```typescript
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/settings/:path*",
    "/login",
    "/onboarding",
  ],
};
```

### Adding New Protected Routes

To add a new protected route:

1. Add to matcher in `middleware.ts`:
```typescript
matcher: [
  "/dashboard/:path*",
  "/settings/:path*",
  "/new-protected-route/:path*", // Add here
  "/login",
  "/onboarding",
]
```

2. Add to route check logic:
```typescript
const isAuthRoute = pathname.startsWith("/dashboard")
  || pathname.startsWith("/settings")
  || pathname.startsWith("/new-protected-route"); // Add here
```

## Testing Scenarios

### Test Case 1: First Login
1. Navigate to `/login`
2. Enter email and OTP
3. Should land on `/onboarding` (no flash)
4. Complete profile
5. Should land on `/dashboard`

### Test Case 2: Returning Login
1. Navigate to `/login`
2. Enter email and OTP
3. Should land directly on `/dashboard` (no onboarding flash)

### Test Case 3: Direct Dashboard Access (Unauthenticated)
1. Navigate to `/dashboard`
2. Should redirect to `/login?redirect=/dashboard`
3. After login, should return to `/dashboard`

### Test Case 4: Direct Onboarding Access (With Profile)
1. Login as user with profile
2. Navigate to `/onboarding`
3. Should redirect to `/dashboard` (cannot access onboarding)

## Troubleshooting

### Issue: Still seeing flash
**Cause:** Middleware not running or token not being read correctly
**Fix:** Check browser cookies for `better-auth.session_token`

### Issue: Infinite redirects
**Cause:** Middleware redirect logic creating loop
**Fix:** Review middleware conditions - ensure each case has clear exit

### Issue: Protected routes accessible
**Cause:** Route not included in middleware matcher
**Fix:** Add route to matcher configuration

### Issue: Middleware not running in development
**Cause:** Next.js dev server needs restart after middleware changes
**Fix:** Restart `pnpm dev`

## Best Practices

1. **Always use middleware for auth routing decisions**
   - Don't make routing decisions in components
   - Keep components focused on their purpose

2. **Keep middleware logic simple**
   - Clear, linear decision tree
   - Avoid complex nested conditionals

3. **Add comprehensive logging**
   - Log middleware decisions in development
   - Remove sensitive logs in production

4. **Test all routing scenarios**
   - First login
   - Returning login
   - Unauthorized access
   - Profile creation interruption

5. **Handle edge cases**
   - Token expiration
   - Network failures
   - Incomplete profiles

## Future Enhancements

Possible improvements to consider:

1. **Caching Profile Status**
   - Cache profile check results
   - Reduce Convex query load
   - Faster middleware execution

2. **Progressive Onboarding**
   - Allow partial profiles
   - Multi-step profile completion
   - Skip optional fields

3. **Role-Based Routing**
   - Different landing pages per role
   - Admin vs user dashboards
   - Custom home pages

4. **Analytics Integration**
   - Track auth flow timing
   - Monitor redirect patterns
   - Identify UX issues

## Related Files

- `/src/middleware.ts` - Main routing logic
- `/src/app/(auth)/layout.tsx` - Protected route wrapper
- `/src/app/(unauth)/login/page.tsx` - Login form
- `/src/app/(unauth)/onboarding/page.tsx` - Profile creation
- `/src/lib/auth-session.ts` - Server-side auth utilities
- `/src/convex/auth.ts` - Convex auth queries
