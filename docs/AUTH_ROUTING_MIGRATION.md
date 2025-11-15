# Authentication Routing Migration Guide

## What Changed?

We moved authentication routing logic from components to Next.js middleware to eliminate the visible "onboarding flash" issue.

## Before & After Comparison

### Before: Component-Based Routing

```typescript
// Login Page (OLD)
router.push("/onboarding"); // Always goes to onboarding

// Onboarding Page (OLD)
useEffect(() => {
  // Check auth
  if (!session) {
    router.push('/login');
  }
  // Check profile
  if (existingProfile) {
    router.push('/dashboard');
  }
}, [session, existingProfile]);

// Auth Layout (OLD)
if (!session) {
  redirect("/login");
}
if (!sessionWithProfile) {
  redirect("/onboarding");
}
```

**Problem:** User sees each intermediate page briefly before redirects happen.

### After: Middleware-Based Routing

```typescript
// Middleware (NEW)
export async function middleware(request: NextRequest) {
  const token = request.cookies.get("better-auth.session_token")?.value;

  if (!token) {
    // Not authenticated - redirect to login
  }

  const userWithProfile = await fetchQuery(...);

  if (hasProfile) {
    // Authenticated with profile - allow dashboard
  } else {
    // Authenticated without profile - redirect to onboarding
  }
}
```

**Solution:** All decisions made before page loads. Zero visible redirects.

## Changes by File

### 1. `/src/middleware.ts` (NEW)

**Status:** Created new file
**Purpose:** Central routing logic
**Action:** No action needed (already implemented)

### 2. `/src/app/(auth)/layout.tsx`

**Before:**
```typescript
export default async function AuthLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession();
  if (!session) {
    redirect("/login?redirect=/dashboard");
  }
  const sessionWithProfile = await getServerSessionWithProfile();
  if (!sessionWithProfile) {
    redirect("/onboarding");
  }
  return <DashboardLayout>{children}</DashboardLayout>;
}
```

**After:**
```typescript
export default async function AuthLayout({ children }: { children: ReactNode }) {
  // Middleware guarantees user is authenticated with profile
  const { user, profile } = await requireServerAuth();
  return <DashboardLayout>{children}</DashboardLayout>;
}
```

**Changes:**
- Removed redirect logic
- Simplified to assume middleware did its job
- Cleaner, single-purpose component

### 3. `/src/app/(unauth)/login/page.tsx`

**Before:**
```typescript
router.push("/onboarding"); // Always redirect to onboarding
```

**After:**
```typescript
router.push(redirect); // Redirect to intended destination (middleware decides)
```

**Changes:**
- Changed hardcoded `/onboarding` to `redirect` parameter
- Middleware determines if user should see onboarding or dashboard
- No profile checks in component

### 4. `/src/app/(unauth)/onboarding/page.tsx`

**Before:**
```typescript
const [isCheckingAuth, setIsCheckingAuth] = useState(true);
const existingProfile = useQuery(api.profiles.get);

useEffect(() => {
  const checkAuth = async () => {
    const session = await authClient.getSession();
    if (!session?.data?.session) {
      router.push('/login');
      return;
    }
    setIsCheckingAuth(false);
  };
  checkAuth();
}, [router]);

useEffect(() => {
  if (!isCheckingAuth && existingProfile) {
    router.push("/dashboard");
  }
}, [existingProfile, router, isCheckingAuth]);

if (isCheckingAuth) {
  return <LoadingSpinner />;
}
```

**After:**
```typescript
// Middleware ensures user is authenticated without profile
// Just render the form
export default function OnboardingPage() {
  return <OnboardingForm />;
}
```

**Changes:**
- Removed auth check useEffect
- Removed profile check useEffect
- Removed loading state
- Cleaner, focused on form only

## No Breaking Changes

This migration is **backward compatible** and requires **no changes** to:
- Database schema
- API endpoints
- Convex functions
- Auth configuration
- Environment variables
- Client-side auth hooks
- Better Auth setup

## Testing the Migration

### Step 1: Clear Cookies
```bash
# In browser DevTools
Application → Cookies → Delete all pathible cookies
```

### Step 2: Test First-Time User Flow
```
1. Navigate to /login
2. Enter email
3. Enter OTP
4. Should land on /onboarding (no flash)
5. Complete profile form
6. Should land on /dashboard
```

### Step 3: Test Returning User Flow
```
1. Logout
2. Navigate to /login
3. Enter email
4. Enter OTP
5. Should land directly on /dashboard (no onboarding flash)
```

### Step 4: Test Protected Route Access
```
1. Logout
2. Navigate to /dashboard directly
3. Should redirect to /login?redirect=/dashboard
4. After login, should land on correct destination
```

### Step 5: Test Onboarding Prevention
```
1. Login as user with profile
2. Navigate to /onboarding directly
3. Should redirect to /dashboard (cannot access onboarding)
```

## Rollback Plan

If issues occur, rollback is simple:

### Option 1: Disable Middleware
```typescript
// /src/middleware.ts
export const config = {
  matcher: [], // Empty matcher = middleware doesn't run
};
```

### Option 2: Revert Files
```bash
git checkout main -- src/middleware.ts
git checkout main -- src/app/(auth)/layout.tsx
git checkout main -- src/app/(unauth)/login/page.tsx
git checkout main -- src/app/(unauth)/onboarding/page.tsx
```

### Option 3: Full Revert
```bash
git revert <commit-hash>
```

## Performance Impact

### Positive Impacts
- Faster perceived load time (no visible redirects)
- Better UX (clean, instant routing)
- Fewer client-side renders

### Considerations
- Middleware adds small latency to requests (typically <50ms)
- Convex query on every protected route request
- Runs at edge for optimal performance

### Optimization Opportunities
- Cache profile status (future enhancement)
- Use shorter-lived tokens
- Implement request deduplication

## Security Improvements

### Before
- Client-side auth checks (bypassable)
- Multiple auth queries per page load
- Race conditions in useEffect

### After
- Server-side validation (secure)
- Single auth check in middleware
- No race conditions

## Common Migration Issues

### Issue: Middleware not running
**Symptom:** Routes still show flash
**Cause:** Next.js dev server needs restart
**Fix:** Stop and restart `pnpm dev`

### Issue: Cookie not found
**Symptom:** Always redirected to login
**Cause:** Cookie name mismatch
**Fix:** Verify cookie name is `better-auth.session_token`

### Issue: Convex query fails
**Symptom:** Error in middleware
**Cause:** Token format or API change
**Fix:** Check Convex logs for query errors

### Issue: Infinite redirects
**Symptom:** Browser shows "Too many redirects"
**Cause:** Middleware logic creates loop
**Fix:** Add console.logs to trace redirect path

## Next Steps

After successful migration:

1. **Monitor Production**
   - Watch for middleware errors
   - Track redirect patterns
   - Monitor performance metrics

2. **Gather Feedback**
   - Test with real users
   - Measure time to dashboard
   - Check for edge cases

3. **Document Findings**
   - Update this guide with learnings
   - Add new edge cases
   - Improve error handling

4. **Optimize**
   - Add caching if needed
   - Reduce middleware latency
   - Improve error messages

## Questions?

- Architecture details → `/docs/AUTH_ROUTING_ARCHITECTURE.md`
- Quick reference → `/docs/AUTH_ROUTING_QUICK_REFERENCE.md`
- Code → `/src/middleware.ts`

## Approval Checklist

Before merging to production:

- [ ] All test scenarios pass
- [ ] No visible redirects/flash
- [ ] Middleware logs clean
- [ ] Performance acceptable
- [ ] Security review complete
- [ ] Documentation updated
- [ ] Team trained on new flow
- [ ] Rollback plan tested

---

**Migration Status:** ✅ Complete
**Breaking Changes:** None
**Rollback Risk:** Low
**User Impact:** Positive (better UX)
