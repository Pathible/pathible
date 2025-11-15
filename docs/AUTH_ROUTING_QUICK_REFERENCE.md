# Authentication Routing - Quick Reference

## TL;DR

All authentication routing decisions are made in **middleware** before any page loads. No more visible redirects!

## How It Works

```
User Action → Middleware Decides → Page Renders (correct page, first time)
```

## File Changes Summary

### New Files
- `/src/middleware.ts` - **Main routing logic** (NEW - most important!)
- `/docs/AUTH_ROUTING_ARCHITECTURE.md` - Full documentation

### Modified Files
- `/src/app/(auth)/layout.tsx` - Simplified (removed redirects)
- `/src/app/(unauth)/login/page.tsx` - Simplified (removed profile check)
- `/src/app/(unauth)/onboarding/page.tsx` - Simplified (removed auth checks)

## Middleware Routing Table

| User State | Route Accessed | Action |
|------------|---------------|---------|
| No Auth | `/dashboard` | → `/login?redirect=/dashboard` |
| No Auth | `/login` | Allow (show login) |
| Authenticated + No Profile | `/dashboard` | → `/onboarding` |
| Authenticated + No Profile | `/login` | → `/onboarding` |
| Authenticated + Has Profile | `/dashboard` | Allow (show dashboard) |
| Authenticated + Has Profile | `/login` | → `/dashboard` |
| Authenticated + Has Profile | `/onboarding` | → `/dashboard` |

## User Flows

### First-Time User
```
/login → Enter OTP → /dashboard → (middleware) → /onboarding → Complete form → /dashboard
```

### Returning User
```
/login → Enter OTP → /dashboard → (middleware) → /dashboard ✓
```

## Key Concepts

### 1. Middleware is the Boss
- Runs **before** any page loads
- Makes all routing decisions
- Single source of truth

### 2. Pages are Dumb
- Assume middleware did its job
- Focus on their single purpose
- No complex auth logic

### 3. Zero Flash
- Users never see intermediate pages
- Clean, instant routing
- Professional UX

## Adding New Protected Routes

1. Add to middleware matcher:
```typescript
// /src/middleware.ts
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/settings/:path*",
    "/your-new-route/:path*", // Add here
    "/login",
    "/onboarding",
  ],
};
```

2. Add to route check:
```typescript
const isAuthRoute = pathname.startsWith("/dashboard")
  || pathname.startsWith("/settings")
  || pathname.startsWith("/your-new-route"); // Add here
```

3. Done! Middleware will protect it automatically.

## Common Issues

### "Still seeing flash"
- **Check:** Browser cookies for `better-auth.session_token`
- **Fix:** Clear cookies and login again

### "Infinite redirects"
- **Check:** Middleware console logs
- **Fix:** Ensure each condition has clear exit path

### "Protected route accessible"
- **Check:** Route in middleware matcher?
- **Fix:** Add route to matcher config

### "Changes not working"
- **Check:** Restarted dev server?
- **Fix:** Run `pnpm dev` again

## Testing Checklist

- [ ] First login → lands on onboarding
- [ ] Complete onboarding → lands on dashboard
- [ ] Returning login → lands on dashboard (no flash)
- [ ] Direct `/dashboard` access → redirects to login
- [ ] After login redirect → returns to intended page
- [ ] Direct `/onboarding` with profile → redirects to dashboard

## Architecture at a Glance

```
┌─────────────────────────────────────────────────────────┐
│                     Browser Request                      │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│  Middleware (/src/middleware.ts)                         │
│  • Reads cookie (better-auth.session_token)             │
│  • Queries Convex for user + profile                    │
│  • Decides: redirect, allow, or block                   │
└────────────────────┬────────────────────────────────────┘
                     │
        ┌────────────┴────────────┐
        │                         │
        ▼                         ▼
┌──────────────┐         ┌──────────────┐
│   Redirect   │         │  Page Loads  │
└──────────────┘         └──────────────┘
```

## When to Update Middleware

Update middleware when you need to:
- Add new protected routes
- Change authentication requirements
- Add role-based routing
- Modify redirect behavior
- Add new auth states (e.g., "suspended")

## When NOT to Touch Middleware

Don't update middleware for:
- UI changes
- Adding page content
- Form validation
- API integrations
- Component styling

## Pro Tips

1. **Test with cookies visible** - Use browser DevTools → Application → Cookies
2. **Add console.logs in middleware** - But remove before production
3. **Clear cookies between tests** - Prevents stale auth state
4. **Use incognito for clean testing** - Fresh session every time
5. **Check Network tab** - See redirects in action

## Resources

- Full Architecture Doc: `/docs/AUTH_ROUTING_ARCHITECTURE.md`
- Middleware Code: `/src/middleware.ts`
- Convex Auth Queries: `/src/convex/auth.ts`
- Auth Session Utils: `/src/lib/auth-session.ts`

## Need Help?

1. Check `/docs/AUTH_ROUTING_ARCHITECTURE.md` for detailed explanation
2. Review middleware console logs
3. Verify cookie exists in browser
4. Test in incognito mode
5. Clear all cookies and restart

---

**Remember:** Middleware makes routing decisions. Pages just render content. Keep it simple!
