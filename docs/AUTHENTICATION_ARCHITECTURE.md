# Authentication Architecture

This document explains how authentication works in the Pathible application using Next.js 16, Convex, and Better Auth.

## Overview

The application uses **Better Auth** integrated with **Convex** through the `@convex-dev/better-auth` package. This provides:
- Email OTP (One-Time Password) authentication
- Server-side session management
- JWT tokens for Convex API calls
- Seamless integration between Next.js and Convex

## Architecture Components

### 1. Better Auth Configuration (`src/convex/auth.ts`)

This is the core authentication setup that runs in Convex:

```typescript
export const createAuth = (ctx: any) =>
  betterAuth({
    database: authComponent.adapter(ctx),
    trustedOrigins: [
      process.env.CONVEX_SITE_URL!,
      process.env.SITE_URL!,
    ],
    emailAndPassword: { enabled: false },
    plugins: [emailOTP(...)],
  });
```

**Key Features:**
- Uses Convex adapter for database storage
- Configures trusted origins for CORS (Convex site URL + Next.js app URL)
- Email OTP plugin for passwordless authentication
- Integrates with Resend for email delivery

### 2. HTTP Routes (`src/convex/http.ts`)

Registers Better Auth HTTP endpoints in Convex:

```typescript
const http = httpRouter();
authComponent.registerRoutes(http, createAuth);
```

This creates endpoints like:
- `POST /auth/email-otp/send` - Send OTP to email
- `POST /auth/email-otp/verify` - Verify OTP code
- `GET /auth/session` - Get current session
- `POST /auth/sign-out` - Sign out user

### 3. Next.js API Routes (`src/app/api/auth/[...all]/route.ts`)

Proxies auth requests from Next.js to Convex:

```typescript
export const { GET, POST } = nextJsHandler({
  convexSiteUrl: process.env.NEXT_PUBLIC_CONVEX_SITE_URL,
});
```

When a client calls `/api/auth/sign-in`, this handler forwards it to the Convex HTTP endpoints.

### 4. Client-Side Auth (`src/lib/auth-client.ts`)

Creates the Better Auth client for React components:

```typescript
export const authClient = createAuthClient({
  plugins: [convexClient(), emailOTPClient()],
});
```

**Usage in Client Components:**
```typescript
// Request OTP
await authClient.emailOtp.sendVerificationOtp({
  email,
  type: "sign-in"
});

// Verify OTP
await authClient.emailOtp.verifyEmail({ email, otp });

// Get session
const { data: session } = useSession();
```

### 5. Server-Side Token Retrieval (`src/lib/auth-server.ts`)

Gets JWT tokens for Convex API calls from Next.js Server Components:

```typescript
export async function getToken(): Promise<string | null> {
  const token = await getBetterAuthToken(createAuth);
  return token ?? null;
}
```

**How it works:**
1. Reads the Better Auth session from cookies
2. Validates the session
3. Generates a Convex-compatible JWT token
4. Returns the token for use with `fetchQuery`

### 6. Server-Side Session Helpers (`src/lib/auth-session.ts`)

Convenience functions for Server Components:

```typescript
// Get current user (returns null if not authenticated)
const session = await getServerSession();

// Get user with profile
const userWithProfile = await getServerSessionWithProfile();

// Require authentication (throws if not authenticated)
const { user, profile } = await requireServerAuth();
```

### 7. Convex Client Provider (`src/app/ConvexClientProvider.tsx`)

Wraps the app with authentication-aware Convex client:

```typescript
const convex = new ConvexReactClient(url, { expectAuth: true });

<ConvexBetterAuthProvider client={convex} authClient={authClient}>
  {children}
</ConvexBetterAuthProvider>
```

**Key Features:**
- `expectAuth: true` pauses queries until authentication is complete
- Automatically passes JWT tokens to Convex queries
- Handles session refresh and token management

## Authentication Flow

### Sign In Flow

```
1. User enters email on login page
   ↓
2. Client calls authClient.emailOtp.sendVerificationOtp()
   ↓
3. Request goes to /api/auth/email-otp/send (Next.js)
   ↓
4. Next.js proxies to Convex HTTP endpoint
   ↓
5. Convex generates OTP and stores it encrypted
   ↓
6. Convex sends email via Resend (or logs to console in dev)
   ↓
7. User receives OTP email
   ↓
8. User enters OTP code
   ↓
9. Client calls authClient.emailOtp.verifyEmail()
   ↓
10. Convex validates OTP
   ↓
11. Better Auth creates session and sets cookies
   ↓
12. Client receives session data
   ↓
13. ConvexBetterAuthProvider detects auth change
   ↓
14. Client-side queries start executing with JWT
```

### Server Component Flow

```
1. Next.js Server Component needs user data
   ↓
2. Calls getServerSession() or requireServerAuth()
   ↓
3. getToken() extracts Better Auth session from cookies
   ↓
4. getBetterAuthToken(createAuth) generates JWT
   ↓
5. fetchQuery() calls Convex with JWT token
   ↓
6. Convex validates JWT and returns user data
   ↓
7. Server Component renders with user data
```

## Environment Variables

### Required Variables

```bash
# Convex Configuration
CONVEX_DEPLOYMENT=dev:your-deployment
NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud
NEXT_PUBLIC_CONVEX_SITE_URL=https://your-deployment.convex.site

# Used by Better Auth for trustedOrigins
CONVEX_SITE_URL=https://your-deployment.convex.site
SITE_URL=http://localhost:3000
```

### Optional Variables (Email)

```bash
# Resend API key (optional in dev, required in production)
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxx
EMAIL_FROM_ADDRESS=noreply@pathible.com
EMAIL_FROM_NAME=Pathible
```

**Development Mode:** Without `RESEND_API_KEY`, OTPs are logged to the console.
**Production Mode:** Must configure Resend API key and verify sending domain.

## Session vs JWT: Understanding the Difference

### The Problem

When Better Auth creates a session, it stores a **session ID** in a cookie:
```
better-auth.session_token=abc123...
```

This session ID is **not a JWT**. It's just an identifier that Better Auth uses to look up the session in the database.

However, Convex's `fetchQuery()` requires a **JWT token** with encoded user information:
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0...
```

### The Solution

The `@convex-dev/better-auth` package provides `getToken()` from `@convex-dev/better-auth/nextjs`:

```typescript
import { getToken } from "@convex-dev/better-auth/nextjs";

const jwtToken = await getToken(createAuth);
```

This function:
1. Reads the session ID from cookies
2. Validates it with Better Auth
3. Converts it to a Convex-compatible JWT
4. Returns the JWT for use with `fetchQuery()`

## Security Features

### CORS Configuration

The `trustedOrigins` setting in Better Auth ensures requests are only accepted from:
- The Convex site URL (`https://your-deployment.convex.site`)
- The Next.js app URL (`http://localhost:3000` in dev)

This prevents CSRF attacks and unauthorized access.

### JWT Validation

Convex validates JWT tokens on every request:
- Signature verification
- Expiration checking
- Issuer validation

### OTP Security

- OTPs are 6 digits
- Stored encrypted in the database
- Expire after 5 minutes
- Maximum 3 verification attempts
- Rate limiting to prevent brute force

### Session Management

- Sessions stored securely in database
- HTTP-only cookies (not accessible via JavaScript)
- Secure flag in production (HTTPS only)
- Automatic session refresh

## Protected Routes

Routes in `src/app/(auth)/` are automatically protected:

```typescript
// src/app/(auth)/layout.tsx
export default async function AuthLayout({ children }) {
  const session = await getServerSession();

  if (!session) {
    redirect(`/login?redirect=${pathname}`);
  }

  return children;
}
```

**How it works:**
1. Layout runs `getServerSession()` on the server
2. If not authenticated, redirects to login
3. If authenticated, renders protected content
4. No flash of protected content (server-side check)

## Common Patterns

### Server Component Authentication

```typescript
// Get optional session
const session = await getServerSession();
if (session) {
  // Show authenticated content
}

// Require authentication
const { user, profile } = await requireServerAuth();
```

### Client Component Authentication

```typescript
"use client";

import { useSession } from "@/lib/auth-client";

function MyComponent() {
  const { data: session, isPending } = useSession();

  if (isPending) return <div>Loading...</div>;
  if (!session) return <div>Not authenticated</div>;

  return <div>Hello {session.user.email}</div>;
}
```

### Convex Function Authentication

```typescript
import { requireAuth } from "./auth";

export const myMutation = mutation({
  args: {},
  handler: async (ctx, args) => {
    const { user, profile } = await requireAuth(ctx);
    // User is authenticated and has a profile
  }
});
```

## Troubleshooting

### "Could not parse JWT payload"

**Problem:** The code is trying to use a session ID as a JWT token.

**Solution:** Use `getToken()` from `@convex-dev/better-auth/nextjs` instead of reading cookies directly.

### "Invalid origin" Error

**Problem:** Better Auth is rejecting requests because the origin isn't trusted.

**Solution:** Add the origin to `trustedOrigins` in `src/convex/auth.ts` and ensure `SITE_URL` and `CONVEX_SITE_URL` are set correctly.

### OTP Emails Not Sending

**Problem:** No email received after requesting OTP.

**Solution:**
- In development: Check the console for logged OTP codes
- In production: Verify `RESEND_API_KEY` is set and domain is verified in Resend

### Session Not Persisting

**Problem:** User is logged out after page refresh.

**Solution:** Ensure cookies are being set correctly. Check that `SITE_URL` matches your actual domain.

## Migration from Other Auth Systems

If migrating from another auth system:

1. Update client code to use `authClient` from Better Auth
2. Replace JWT token retrieval with `getToken()` from `@convex-dev/better-auth/nextjs`
3. Update Convex functions to use `requireAuth()` helper
4. Configure `trustedOrigins` in Better Auth config
5. Test the authentication flow end-to-end

## Additional Resources

- [Better Auth Documentation](https://better-auth.com)
- [Convex Better Auth Guide](https://convex-better-auth.netlify.app)
- [Next.js App Router Authentication](https://nextjs.org/docs/app/building-your-application/authentication)
- [Convex Authentication](https://docs.convex.dev/auth)
