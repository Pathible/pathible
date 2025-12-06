# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js 16 application using the App Router with Convex as the backend and Better Auth for authentication. The project uses TypeScript, Tailwind CSS v4, and shadcn/ui components.

**See [`docs/TECH_STACK.md`](docs/TECH_STACK.md) for complete dependency versions and compatibility notes.**

## Development Commands

This project uses **pnpm** as the package manager.

```bash
# Start both Next.js and Convex in parallel (recommended)
pnpm dev

# Or run separately in different terminals:
pnpm dev:frontend  # Next.js only
pnpm dev:backend   # Convex only (with typecheck and live component sources)

# Generate Convex types (one-time)
pnpm generate

# Build for production
pnpm build

# Start production server
pnpm start

# Lint (includes Next.js, TypeScript, and Convex)
pnpm lint
```

The `pnpm dev` command automatically starts both the Next.js frontend and Convex backend in parallel, eliminating the need for separate terminal windows.

## Architecture

### Authentication Flow

The application uses Better Auth integrated with Convex through `@convex-dev/better-auth`:

1. **Client-side setup** (`src/lib/auth-client.ts`): Creates the auth client with Convex and email OTP plugins
2. **Server-side setup** (`src/lib/auth-server.ts`): Exports token retrieval for Next.js server components
3. **Convex integration** (`src/convex/auth.ts`): Creates the Better Auth instance with Convex adapter and email OTP
4. **HTTP routes** (`src/convex/http.ts`): Registers auth routes with Convex
5. **Next.js API routes** (`src/app/api/auth/[...all]/route.ts`): Handles auth requests from Next.js
6. **Provider wrapper** (`src/app/ConvexClientProvider.tsx`): Wraps the app with ConvexBetterAuthProvider

The auth configuration uses **email OTP (One-Time Password)** authentication:

- Users enter their email address
- A 6-digit OTP is sent to their email via Resend
- OTP expires after 5 minutes
- Maximum 3 verification attempts per OTP
- No passwords required

**Email Templates**: Three styled email templates (sign-in, email verification, password reset) in `src/lib/email-templates/`.

**Security Features**:

- OTPs stored encrypted in database
- Email verification sent automatically on sign-up
- Rate limiting with attempt counters
- 5-minute expiration window

**Development Mode**: Without `RESEND_API_KEY`, OTPs are logged to console.
**Production Mode**: Configure Resend API key and verify your sending domain.

**Environment Variables**:

- `RESEND_API_KEY` - Required for production email sending
- `EMAIL_FROM_ADDRESS` - Sender email (must be verified in Resend)
- `EMAIL_FROM_NAME` - Sender display name (default: "Pathible")

**Client-side OTP API Methods**:

- `authClient.emailOtp.sendVerificationOtp({ email, type: "sign-in" })` - Request OTP to be sent to email
- `authClient.emailOtp.verifyEmail({ email, otp })` - Verify the OTP code

**React Hooks**:

- `useSession()` - Get current session state
- Better Auth automatically handles session management

### Route Protection

Protected routes in the `(auth)` route group require authentication:

**Server-Side Protection** (`src/app/(auth)/layout.tsx`):

- Checks authentication status using `getServerSession()` from `src/lib/auth-session.ts`
- Redirects to `/login?redirect=/dashboard` if not authenticated
- Runs on the server before rendering (no flash of protected content)

**Auth Session Utilities** (`src/lib/auth-session.ts`):

- `getServerSession()` - Get current user session (returns null if not authenticated)
- `getServerSessionWithProfile()` - Get user with profile data
- `requireServerAuth()` - Throws error if not authenticated (for Server Components)

**How It Works**:

1. User tries to access `/dashboard` (or any route in `(auth)` group)
2. Layout runs `getServerSession()` to check authentication
3. If not authenticated: Redirect to `/login?redirect=/dashboard`
4. If authenticated: Render the protected content with user data

**Client-Side Auth** (already configured):

- `ConvexClientProvider` has `expectAuth: true` which pauses Convex queries until authenticated
- Use `authClient` from `src/lib/auth-client.ts` for client-side authentication methods
- Use Better Auth React hooks for session management in Client Components

**Adding New Protected Routes**:

1. Place route files inside `src/app/(auth)/` directory
2. Authentication is automatically enforced by the layout
3. Use `requireServerAuth()` in Server Components to get user data
4. Use `useSession()` hook in Client Components to access session

### Convex Backend

Convex functions are located in `src/convex/`:

- `convex.config.ts` - Convex app configuration with Better Auth plugin
- `auth.config.ts` - Auth provider configuration (uses CONVEX_SITE_URL)
- `auth.ts` - Better Auth setup with Convex adapter, email OTP, and Resend integration
- `http.ts` - HTTP router for auth endpoints
- `users.ts` - User-related mutations (e.g., updateUserPassword)

Convex generates types in `src/convex/_generated/` - do not edit these files directly.

### Environment Variables

Required environment variables (see `.env.local.example`):

- `CONVEX_DEPLOYMENT` - Convex deployment identifier
- `NEXT_PUBLIC_CONVEX_URL` - Public Convex URL for client
- `NEXT_PUBLIC_CONVEX_SITE_URL` - Convex site URL (ends in .site)
- `SITE_URL` - Your application URL (localhost in dev)

Email configuration (optional in dev, required in production):

- `RESEND_API_KEY` - Resend API key for email sending
- `EMAIL_FROM_ADDRESS` - Email address to send from (e.g., noreply@pathible.com)
- `EMAIL_FROM_NAME` - Display name for emails (e.g., Pathible)

### UI Components

The project uses shadcn/ui with the "new-york" style:

- Configuration: `components.json`
- Components directory: `src/components/ui/`
- Utilities: `src/lib/utils.ts`
- Icon library: lucide-react

Path aliases are configured in `tsconfig.json`:

- `@/*` maps to `./src/*`
- Additional aliases in `components.json`: `@/components`, `@/lib`, `@/hooks`, etc.

### Styling

Tailwind CSS v4 with:

- Global styles: `src/app/globals.css`
- CSS variables enabled
- Base color: neutral
- PostCSS processing
- Custom animations via `tw-animate-css`

## Key Patterns

### Accessing Current User in Convex

Use the `getCurrentUser` query from `src/convex/auth.ts`:

```typescript
import { getCurrentUser } from "./auth";

// In your query/mutation
const user = await ctx.runQuery(api.auth.getCurrentUser);
```

### Calling Better Auth APIs in Convex

Use the `authComponent.getAuth` helper:

```typescript
import { authComponent, createAuth } from "./auth";

const { auth, headers } = await authComponent.getAuth(createAuth, ctx);
await auth.api.someAuthMethod({ body: {}, headers });
```

### Client-side Auth

Use the `authClient` from `src/lib/auth-client.ts` with Better Auth React hooks.

### Server-side Auth in Pages

Use auth session utilities from `src/lib/auth-session.ts`:

```typescript
import { requireServerAuth, getServerSession } from "@/lib/auth-session";

// In a Server Component that requires auth:
export default async function MyPage() {
  const { user, profile } = await requireServerAuth();
  return <div>Hello {profile.firstName}</div>;
}

// In a Server Component that optionally uses auth:
export default async function MyPage() {
  const session = await getServerSession();
  if (session) {
    return <div>Authenticated content</div>;
  }
  return <div>Public content</div>;
}
```

## Convex Development Guidelines

**IMPORTANT**: Comprehensive Convex guidelines are available in [`docs/convex_rules.md`](docs/convex_rules.md). This file contains:

- Complete function syntax examples (queries, mutations, actions)
- Validator guidelines for all Convex types
- Schema design patterns and indexing conventions
- Query best practices (avoid `filter`, use `withIndex`)
- Authentication patterns with Better Auth
- Full-text search, pagination, and file storage examples
- Real-world chat app implementation example

Always reference this file when working with Convex functions.

## Component Architecture

**Server-Side First Philosophy**: This project defaults to Server Components for better performance and SEO.

- **Default**: All components are Server Components unless they need client-side interactivity
- **Use `"use client"` only when necessary** for:
  - Event handlers (onClick, onChange, etc.)
  - Browser APIs (window, document, localStorage)
  - React hooks (useState, useEffect, useContext)
  - Third-party libraries that require client-side JS

**Pattern for minimal client-side code**:

1. Keep most of the page as Server Component
2. Extract only interactive parts into small, focused Client Components
3. Example: `ScrollButton.tsx` is a tiny client component while the entire page remains server-rendered

**Navigation**:

- Use Next.js `Link` component from `next/link` for navigation (server-side)
- Avoid `useRouter()` unless you need programmatic navigation in a client component

## Important Notes

- Use `pnpm dev` to run both Next.js and Convex in parallel (or use `pnpm dev:frontend` and `pnpm dev:backend` separately if needed)
- Convex functions must be located in `src/convex/` as specified in `convex.json`
- The Convex client is configured with `expectAuth: true`, which pauses queries until authentication is complete
- When adding new Convex functions, follow the pattern of importing from `_generated/server`
- All Convex functions MUST include explicit `args` and `returns` validators using the new function syntax
- The `dev:backend` script includes `--typecheck-components` and `--live-component-sources` for better DX

## Rule Improvement Triggers

- New code patterns not covered by existing rules
- Repeated similar implementations across files
- Common error patterns that could be prevented
- New libraries or tools being used consistently
- Emerging best practices in the codebase

# Analysis Process:

- Compare new code with existing rules
- Identify patterns that should be standardized
- Look for references to external documentation
- Check for consistent error handling patterns
- Monitor test patterns and coverage

# Rule Updates:

- **Add New Rules When:**

  - A new technology/pattern is used in 3+ files
  - Common bugs could be prevented by a rule
  - Code reviews repeatedly mention the same feedback
  - New security or performance patterns emerge

- **Modify Existing Rules When:**

  - Better examples exist in the codebase
  - Additional edge cases are discovered
  - Related rules have been updated
  - Implementation details have changed

- **Rule Quality Checks:**
- Rules should be actionable and specific
- Examples should come from actual code
- References should be up to date
- Patterns should be consistently enforced

## Continuous Improvement:

- Monitor code review comments
- Track common development questions
- Update rules after major refactors
- Add links to relevant documentation
- Cross-reference related rules

## Rule Deprecation

- Mark outdated patterns as deprecated
- Remove rules that no longer apply
- Update references to deprecated rules
- Document migration paths for old patterns

## Documentation Updates:

- Keep examples synchronized with code
- Update references to external docs
- Maintain links between related rules
- Document breaking changes
