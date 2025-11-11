# Code Review Report - First PR

**Review Date**: 2025-01-11
**Reviewer**: Claude Code (Multi-Specialist Review)
**Codebase**: Pathible - Next.js 16 + Convex + Better Auth
**Git Status**: Initial PR from Create Next App

---

## Executive Summary

**Overall Assessment**: GOOD with MODERATE PRIORITY improvements needed

This is a well-architected Next.js 16 application with solid authentication, clean separation of concerns, and good security practices. The codebase demonstrates strong understanding of modern web development patterns. However, there are several security concerns, performance optimization opportunities, and architectural refinements that should be addressed before production deployment.

**Priority Classification**:
- **Critical Issues**: 3 (FIXED: Security: Token generation, Type safety, Logging)
- **High Priority**: 5 (Performance, Error handling, Security hardening)
- **Medium Priority**: 8 (Code quality, Architecture improvements)
- **Low Priority**: 4 (Documentation, Developer experience)

---

## ✅ Critical Issues - FIXED

These issues have been addressed by the backend-architect agent:

### C1. ✅ FIXED: Weak Token Generation (SECURITY CRITICAL)
**Location**: `src/convex/households.ts:446-448`
**CVSS Score**: 7.5 (High) - Authentication Bypass
**Status**: ✅ RESOLVED

**Original Issue**: Used `Math.random()` for invitation tokens, which is NOT cryptographically secure and allows predictable token generation.

**Fix Applied**:
- Created `generateSecureToken` action using Node.js `crypto.randomBytes(32)`
- Generates 256-bit cryptographically secure tokens
- Updated `inviteMember` mutation to accept pre-generated secure tokens

**Breaking Change**: Invitation creation now requires two-step process:
```typescript
// 1. Generate secure token
const token = await convex.action(api.households.generateSecureToken);

// 2. Create invitation with token
await convex.mutation(api.households.inviteMember, {
  householdId,
  email,
  role,
  secureToken: token  // NEW required parameter
});
```

### C2. ✅ FIXED: Type Safety Violations
**Location**: Multiple files, primarily `src/convex/auth.ts`
**Status**: ✅ RESOLVED

**Original Issue**: ESLint configured with `"@typescript-eslint/no-explicit-any": "error"` but codebase used `any` extensively, especially for Better Auth types.

**Fix Applied**:
- Created `src/types/auth.ts` with proper Better Auth type definitions
- Replaced `v.any()` validators with explicit types in all Convex queries
- Added type guards and utility functions
- Used pragmatic `eslint-disable` comments at Better Auth integration boundaries
- Documented all remaining `any` usage with justification

### C3. ✅ FIXED: Production Logging Security
**Location**: `src/convex/auth.ts:45-52, 66-67, 86-87, 101`
**Status**: ✅ RESOLVED

**Original Issue**: OTP codes and sensitive information logged to console in all environments, exposing secrets in production logs.

**Fix Applied**:
- Added `isDevelopment` environment check
- OTP codes now only logged in development mode
- Production logs contain only sanitized error messages
- Maintained detailed debugging in development

---

## 1. Quality Auditor Findings

### ✅ Strengths

1. **Clean Project Structure** - Well-organized route groups `(auth)` and `(unauth)`, clear separation of concerns
2. **Type Safety** - TypeScript configured with `strict: true`, comprehensive Convex validators
3. **Component Architecture** - Good use of Server Components by default, minimal client-side code
4. **Code Organization** - Clear naming conventions, logical file structure
5. **Documentation** - Excellent CLAUDE.md with comprehensive project guidance

### ⚠️ Issues Found

#### High Priority

**H1. Input Validation Inconsistencies**
`src/convex/profiles.ts:125-138`

Some fields validated, others not:
```typescript
if (args.phone && args.phone.length > 20) {
  throw new Error("Phone number is too long");
}
```

**Missing validation**:
- Phone format (not just length)
- Name special characters
- SQL injection patterns in user input

**Recommendation**: Use Zod for comprehensive validation:
```typescript
import { z } from 'zod';

const profileSchema = z.object({
  firstName: z.string().min(1).max(50).regex(/^[a-zA-Z\s'-]+$/),
  lastName: z.string().min(1).max(50).regex(/^[a-zA-Z\s'-]+$/),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/).optional(),
  dateOfBirth: z.number().max(Date.now()).optional(),
});
```

**H2. Inconsistent Error Messages**
`src/convex/profiles.ts:113-114, 384-385`
```typescript
throw new Error("Profile already exists");
throw new Error("Profile not found");
```

Error messages lack context and structure. Users see raw errors.

**Recommendation**: Create error classes with codes:
```typescript
class ProfileError extends Error {
  constructor(public code: string, message: string) {
    super(message);
    this.name = 'ProfileError';
  }
}

throw new ProfileError('PROFILE_EXISTS', 'A profile already exists for this user');
```

#### Medium Priority

**M1. Magic Numbers and Hardcoded Values**
`src/convex/auth.ts:109-111`
```typescript
otpLength: 6, // 6-digit OTP
expiresIn: 300, // 5 minutes
allowedAttempts: 3,
```

**Recommendation**: Extract to constants file:
```typescript
// src/lib/constants.ts
export const OTP_CONFIG = {
  LENGTH: 6,
  EXPIRY_SECONDS: 300,
  MAX_ATTEMPTS: 3,
} as const;
```

**M2. Duplicate Code in Validation Logic**
Similar validation patterns repeated across mutations.

**Recommendation**: Create reusable validation utilities:
```typescript
// src/lib/validators.ts
export const validateName = (name: string, fieldName: string) => {
  if (!name.trim()) {
    throw new ValidationError(fieldName, 'cannot be empty');
  }
  if (name.length > 50) {
    throw new ValidationError(fieldName, 'is too long (max 50 characters)');
  }
  if (!/^[a-zA-Z\s'-]+$/.test(name)) {
    throw new ValidationError(fieldName, 'contains invalid characters');
  }
  return name.trim();
};
```

#### Low Priority

**L1. Missing JSDoc Comments**
Many exported functions lack documentation:
- `src/lib/auth-session.ts:9, 35, 61`
- `src/convex/households.ts:24, 64, 141`

**L2. No Code Documentation Standards**
Inconsistent documentation style across files.

---

## 2. Security Analyst Findings

### 🔒 Security Strengths

1. **Email OTP Authentication** - Passwordless auth reduces credential theft risk
2. **Encrypted OTP Storage** - OTPs stored encrypted in database
3. **Rate Limiting** - Max 3 OTP attempts configured
4. **Secure Session Management** - Token-based auth with Convex
5. **Route Protection** - Server-side auth checks before rendering
6. **✅ Cryptographically Secure Tokens** - Now using `crypto.randomBytes()`
7. **✅ Environment-Aware Logging** - Sensitive data only in development

### ⚠️ High Priority Security Issues

**S1. Environment Variable Validation Missing**
`src/convex/auth.ts:15, 19-22`
```typescript
const siteUrl = process.env.SITE_URL!;
const resendApiKey = process.env.RESEND_API_KEY;
```

No validation that required variables exist or are properly formatted.

**Risk**: Application fails silently or exposes errors in production

**Fix**:
```typescript
import { z } from 'zod';

const envSchema = z.object({
  SITE_URL: z.string().url(),
  RESEND_API_KEY: z.string().min(1),
  EMAIL_FROM_ADDRESS: z.string().email(),
});

const env = envSchema.parse(process.env);
```

**S2. Email Enumeration Vulnerability**
`src/app/(unauth)/login/page.tsx:50-70`
```typescript
const result = await authClient.emailOtp.sendVerificationOtp({
  email,
  type: "sign-in",
});
```

Returns different responses for existing vs non-existing users.

**Risk**: Attackers can enumerate valid email addresses

**Mitigation**: Always return success, regardless of email existence. Send "account doesn't exist" emails to unknown addresses.

**S3. Missing CSRF Protection**
No CSRF tokens visible in mutation endpoints. Relies solely on authentication.

**Risk**: Cross-Site Request Forgery attacks

**Recommendation**: Verify Better Auth CSRF is enabled:
```typescript
// In auth config
betterAuth({
  // ...
  advanced: {
    useSecureCookies: true,
    generateSessionToken: true,
  }
})
```

**S4. Inadequate Error Handling Exposes Information**
`src/lib/auth-session.ts:26-28`
```typescript
} catch (error) {
  console.error("[Auth] Failed to get server session:", error);
  return null;
}
```

Logs full error objects including stack traces.

**Risk**: Information disclosure in production logs

**Fix**: Log sanitized error messages only in production:
```typescript
} catch (error) {
  if (process.env.NODE_ENV === 'development') {
    console.error("[Auth] Failed to get server session:", error);
  } else {
    console.error("[Auth] Failed to get server session");
  }
  return null;
}
```

### 📋 Medium Priority Security

**S5. Missing Input Sanitization - XSS Risk**
`src/convex/households.ts:294, 308-309`
```typescript
name: args.name.trim(),
description: args.description?.trim(),
```

User input stored without sanitization, could allow stored XSS.

**Fix**: Implement input sanitization:
```typescript
import DOMPurify from 'isomorphic-dompurify';

const sanitizedName = DOMPurify.sanitize(args.name.trim());
```

**S6. No Rate Limiting on API Routes**
`src/app/api/auth/[...all]/route.ts`

Missing rate limiting on auth endpoints.

**Recommendation**: Implement rate limiting middleware (Upstash Rate Limit):
```typescript
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "10 s"),
});
```

**S7. Email Validation Regex Insufficient**
`src/convex/households.ts:419`
```typescript
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
```

Too permissive, allows many invalid emails.

**Fix**: Use proven email validation library or more strict regex.

**S8. Missing Content Security Policy (CSP)**
No CSP headers configured in `next.config.ts`.

**Recommendation**:
```typescript
const nextConfig: NextConfig = {
  async headers() {
    return [{
      source: '/:path*',
      headers: [
        {
          key: 'Content-Security-Policy',
          value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; ..."
        }
      ]
    }];
  }
};
```

---

## 3. Performance Reviewer Findings

### ⚡ Performance Strengths

1. **Server Components by Default** - Reduces client-side JavaScript
2. **Image Optimization** - Using Next.js Image component
3. **Convex Optimizations** - Proper indexing in schema
4. **Code Splitting** - Route-based splitting via App Router

### 🐌 Performance Issues

#### High Priority

**P1. N+1 Query Problem in List Functions**
`src/convex/households.ts:109-129`
```typescript
const households = await Promise.all(
  activeMemberships.map(async (membership) => {
    const household = await ctx.db.get(membership.householdId); // N queries
    // ...
    const allMemberships = await ctx.db.query(...).collect(); // N more queries
  })
);
```

**Impact**: For user with 10 households, makes 20+ database queries

**Fix**: Batch fetch with proper query patterns:
```typescript
// Fetch all households at once
const householdIds = activeMemberships.map(m => m.householdId);
const households = await Promise.all(householdIds.map(id => ctx.db.get(id)));

// Use compound index for single query
const allMemberships = await ctx.db
  .query("householdMemberships")
  .withIndex("by_household_and_status", q =>
    q.eq("householdId", householdId).eq("status", "active")
  )
  .collect();
```

**P2. Inefficient Filtering in Queries**
`src/convex/households.ts:432-438`
```typescript
const pendingInvitation = await ctx.db
  .query("householdInvitations")
  .withIndex("by_email", (q) => q.eq("email", args.email.toLowerCase()))
  .filter((q) =>  // Filter after index scan!
    q.and(
      q.eq(q.field("householdId"), args.householdId),
      q.eq(q.field("status"), "pending"),
      q.gt(q.field("expiresAt"), Date.now())
    )
  )
  .unique();
```

**Problem**: Fetches all invitations for email, then filters in application code

**Fix**: Create compound index:
```typescript
// In schema.ts
householdInvitations: defineTable({
  // ...
})
  .index("by_email_household_status", ["email", "householdId", "status"])
```

**P3. Unoptimized Login Flow - Multiple Network Requests**
`src/app/(unauth)/login/page.tsx:158-185`
```typescript
const checkHasProfile = async (): Promise<boolean> => {
  const response = await fetch("/api/auth/convex/token");
  const { token } = await response.json();

  const profileResponse = await fetch(`${convexUrl}/api/query`, {
    // ... makes manual Convex API call
  });
```

**Problem**:
- Makes 2 sequential fetch calls
- Bypasses Convex client optimizations
- Duplicates functionality

**Fix**: Use Convex React hooks or server-side checks:
```typescript
// In layout or page
const profile = await fetchQuery(api.profiles.get, {}, { token });
```

#### Medium Priority

**P4. Missing React Suspense Boundaries**
`src/app/(auth)/dashboard/page.tsx`

Async server component without suspense boundary. Blocks entire page render.

**Fix**:
```typescript
// In layout or page
<Suspense fallback={<DashboardSkeleton />}>
  <DashboardPage />
</Suspense>
```

**P5. No Font Optimization Strategy**
`src/app/layout.tsx:8-27`
Loading 4 fonts (Geist Sans, Geist Mono, Crimson Text, Inter).

**Impact**: 400-800KB additional download

**Recommendation**:
- Use only 2-3 fonts
- Subset fonts to required characters
- Use `font-display: swap`

**P6. Missing Convex Query Caching Strategy**
No pagination or cursor-based queries for large lists.

**Recommendation**: Implement pagination for activity logs:
```typescript
export const list = query({
  args: {
    householdId: v.id("households"),
    paginationOpts: paginationOptsValidator
  },
  returns: paginatedReturnValidator(v.object({
    // ...
  })),
  handler: async (ctx, args) => {
    return await ctx.db
      .query("activityLog")
      .withIndex("by_household", q => q.eq("householdId", args.householdId))
      .order("desc")
      .paginate(args.paginationOpts);
  },
});
```

#### Low Priority

**P7. No Bundle Analysis**
Missing `@next/bundle-analyzer` for tracking bundle size.

**P8. Unused Dependencies**
`input-otp` is only used in one page, could be code-split further.

---

## 4. Architecture Assessor Findings

### 🏗️ Architecture Strengths

1. **Clean Architecture** - Clear separation: UI → Server Actions → Convex → Database
2. **Domain-Driven Design** - Well-defined entities (Household, Profile, Membership)
3. **SOLID Principles** - Single responsibility in most functions
4. **Scalability** - Convex handles scaling automatically
5. **Type Safety** - Comprehensive validators in Convex schema

### 🏗️ Architecture Issues

#### High Priority

**A1. God Object Pattern in auth.ts**
`src/convex/auth.ts` - 468 lines, multiple responsibilities:
- Auth configuration
- Query functions
- Helper functions
- Authorization logic
- Email sending

**Impact**: Difficult to maintain, test, and understand

**Recommendation**: Split into modules:
```
src/convex/
  auth/
    config.ts       - Better Auth configuration
    queries.ts      - Public query functions
    helpers.ts      - requireAuth, requireAdmin
    authorization.ts - Role checking logic
    email.ts        - Email sending functions
```

**A2. Tight Coupling Between Auth and Profile**
`src/convex/auth.ts:374-389`

`requireAuth()` returns both user AND profile. Every authenticated endpoint depends on profiles existing.

**Problem**: Can't use auth without profiles, reduces flexibility

**Recommendation**: Separate concerns:
```typescript
// Auth only returns user
export async function requireAuth(ctx: any): Promise<AuthUser> {
  const user = await authComponent.getAuthUser(ctx);
  if (!user) throw new AuthenticationError();
  return user as AuthUser;
}

// Separate helper for profile
export async function requireProfile(ctx: any) {
  const user = await requireAuth(ctx);
  const profile = await getProfile(ctx, user._id);
  if (!profile) throw new AppError('PROFILE_NOT_FOUND', 'Profile not found', 404);
  return { user, profile };
}
```

**A3. Missing Abstraction Layer for Database Operations**
Direct database access in every function:
```typescript
const profile = await ctx.db
  .query("profiles")
  .withIndex("by_userId", (q) => q.eq("userId", user._id))
  .unique();
```

**Problem**:
- Duplicated query logic
- Difficult to add caching
- Hard to test

**Recommendation**: Create repository pattern:
```typescript
// src/convex/repositories/ProfileRepository.ts
export class ProfileRepository {
  constructor(private ctx: QueryCtx | MutationCtx) {}

  async findByUserId(userId: string) {
    return this.ctx.db
      .query("profiles")
      .withIndex("by_userId", q => q.eq("userId", userId))
      .unique();
  }

  async create(data: ProfileCreateData) {
    return this.ctx.db.insert("profiles", {
      ...data,
      updatedAt: Date.now(),
    });
  }
}
```

#### Medium Priority

**A4. Business Logic in UI Components**
`src/app/(auth)/dashboard/page.tsx:37-66`
```typescript
const getNextStep = () => {
  if (stats.wisdomEntriesCount === 0) {
    return { ... };
  } // ... complex business logic
}
```

**Problem**: Logic mixed with presentation, not reusable or testable

**Fix**: Move to Convex query:
```typescript
// src/convex/dashboard.ts
export const getNextStep = query({
  args: {},
  returns: v.object({ ... }),
  handler: async (ctx) => {
    // Business logic here
  }
});
```

**A5. Inconsistent Error Handling Patterns**
Some functions return `null`, others throw errors:
- `getServerSession()` returns `null` on error
- `requireServerAuth()` throws error
- `profiles.get()` returns `null`

**Recommendation**: Establish consistent pattern:
- Query functions: Return `null` for not found
- Mutation functions: Throw errors
- Helper functions: Throw errors with specific types

**A6. Missing Service Layer**
Direct calls from UI to Convex. No intermediate business logic layer.

**Impact**: Difficult to add complex workflows, validations, or integrations

**Recommendation**: Add service layer for complex operations:
```typescript
// src/app/actions.ts
export async function createHouseholdWithInvites(data: HouseholdData) {
  // Complex multi-step logic here
  const householdId = await fetchMutation(api.households.create, data);
  const invites = await Promise.all(
    data.invites.map(invite =>
      fetchMutation(api.households.inviteMember, { householdId, ...invite })
    )
  );
  return { householdId, invites };
}
```

**A7. Schema Design - Potential Hotspots**
`src/convex/schema.ts:548-549`
```typescript
.index("by_household", ["householdId"])
```

Activity log will grow unbounded. No archival strategy.

**Risk**: Performance degradation over time

**Recommendation**:
- Add TTL (time-to-live) for old activities
- Implement archival to separate table
- Add pagination to activity queries

#### Low Priority

**A8. No Event Sourcing for Audit Trail**
Activity log is append-only but doesn't capture state changes.

**A9. Missing Dependency Injection**
Hard to test functions that directly access `ctx.db`.

**A10. No API Versioning Strategy**
All Convex functions in single namespace. Breaking changes will affect all clients.

---

## 5. Consolidated Priority Matrix

### Critical (Fixed) ✅

| ID | Issue | Location | Status |
|----|-------|----------|--------|
| C1 | Weak token generation | `households.ts:446-448` | ✅ FIXED |
| C2 | Type safety violations | Multiple files | ✅ FIXED |
| C3 | Production logging | `auth.ts` | ✅ FIXED |

### High Priority (Week 1-2)

| ID | Issue | Location | Effort | Impact |
|----|-------|----------|--------|--------|
| S1 | Environment validation | `auth.ts:15-22` | 1h | High |
| S2 | Email enumeration | `login/page.tsx:50-70` | 2h | Medium |
| S3 | CSRF verification | Auth config | 1h | Medium |
| P1 | N+1 query problem | `households.ts:109-129` | 3h | High |
| P2 | Inefficient filtering | `households.ts:432-438` | 2h | Medium |
| H1 | Input validation | `profiles.ts:125-138` | 4h | High |

### Medium Priority (Month 1)

| ID | Issue | Effort | Impact |
|----|-------|--------|--------|
| A1 | God object in auth.ts | 6h | High |
| A2 | Tight auth/profile coupling | 4h | Medium |
| M1 | Magic numbers | 1h | Low |
| M2 | Error message standards | 3h | Medium |
| S5 | Input sanitization | 3h | Medium |
| S6 | Rate limiting | 3h | Medium |
| P4 | Suspense boundaries | 2h | Medium |
| A4 | Business logic in UI | 4h | Medium |

### Low Priority (Month 2+)

| ID | Issue | Effort |
|----|-------|--------|
| L1 | JSDoc comments | 4h |
| P7 | Bundle analysis | 1h |
| P8 | Font optimization | 2h |
| A9 | Dependency injection | 8h |

---

## 6. Implementation Roadmap

### ✅ Completed: Critical Security Fixes

**Status**: DONE
**Time Invested**: ~6 hours
**Files Modified**: 5

1. ✅ Cryptographically secure token generation
2. ✅ Better Auth type definitions
3. ✅ Environment-aware logging
4. ✅ Type safety throughout Convex functions

### Phase 1: High Priority Security & Performance (Week 1-2)

**Estimated Time**: 13 hours
**Focus**: Production readiness

```typescript
// 1. Environment Variable Validation (1h)
// src/lib/env.ts
import { z } from 'zod';

const envSchema = z.object({
  SITE_URL: z.string().url(),
  NEXT_PUBLIC_CONVEX_URL: z.string().url(),
  NEXT_PUBLIC_CONVEX_SITE_URL: z.string().url(),
  RESEND_API_KEY: z.string().min(1),
  EMAIL_FROM_ADDRESS: z.string().email(),
  EMAIL_FROM_NAME: z.string().min(1),
  NODE_ENV: z.enum(['development', 'production', 'test']),
});

export const env = envSchema.parse(process.env);

// 2. Fix N+1 Query Problem (3h)
// src/convex/households.ts
export const list = query({
  args: {},
  returns: v.array(/* ... */),
  handler: async (ctx) => {
    const { profile } = await requireAuth(ctx);

    // Fetch memberships
    const memberships = await ctx.db
      .query("householdMemberships")
      .withIndex("by_user", q => q.eq("userId", profile._id))
      .filter(q => q.eq(q.field("status"), "active"))
      .collect();

    // Batch fetch households (single Promise.all)
    const householdIds = memberships.map(m => m.householdId);
    const households = await Promise.all(
      householdIds.map(id => ctx.db.get(id))
    );

    // Batch fetch member counts
    const memberCountsPromises = householdIds.map(householdId =>
      ctx.db
        .query("householdMemberships")
        .withIndex("by_household_and_status", q =>
          q.eq("householdId", householdId).eq("status", "active")
        )
        .collect()
    );
    const memberCountsResults = await Promise.all(memberCountsPromises);
    const memberCounts = memberCountsResults.map(results => results.length);

    // Combine results
    return households.map((household, idx) => ({
      ...household!,
      userRole: memberships[idx].role,
      memberCount: memberCounts[idx],
    }));
  },
});

// 3. Add Compound Index (2h)
// src/convex/schema.ts
householdInvitations: defineTable({
  // ... existing fields
})
  .index("by_household", ["householdId"])
  .index("by_token", ["token"])
  .index("by_email", ["email"])
  .index("by_email_household_status", ["email", "householdId", "status"]) // NEW
  .index("by_household_and_status", ["householdId", "status"]),

// 4. Input Validation with Zod (4h)
// src/lib/validators.ts
import { z } from 'zod';

export const profileCreateSchema = z.object({
  firstName: z.string().min(1).max(50).regex(/^[a-zA-Z\s'-]+$/),
  lastName: z.string().min(1).max(50).regex(/^[a-zA-Z\s'-]+$/),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/).optional(),
  dateOfBirth: z.number().max(Date.now()).refine(
    (val) => (Date.now() - val) / (1000 * 60 * 60 * 24 * 365) <= 150,
    "Age cannot exceed 150 years"
  ).optional(),
});

// Update profiles.ts to use Zod
export const create = mutation({
  args: {
    firstName: v.string(),
    lastName: v.string(),
    phone: v.optional(v.string()),
    dateOfBirth: v.optional(v.number()),
  },
  returns: v.id("profiles"),
  handler: async (ctx, args) => {
    const user = await authComponent.getAuthUser(ctx);
    if (!user) throw new Error("Not authenticated");

    // Validate with Zod
    const validatedData = profileCreateSchema.parse(args);

    // ... rest of implementation
  },
});

// 5. Verify CSRF Protection (1h)
// src/convex/auth.config.ts
export default {
  providers: [
    {
      domain: process.env.CONVEX_SITE_URL,
      applicationID: "convex",
    },
  ],
  // Verify these settings exist
  advanced: {
    useSecureCookies: process.env.NODE_ENV === 'production',
    generateSessionToken: true,
  }
};

// 6. Fix Email Enumeration (2h)
// src/app/(unauth)/login/page.tsx
const handleSendOtp = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsLoading(true);

  try {
    // Always show success, don't reveal if email exists
    await authClient.emailOtp.sendVerificationOtp({
      email,
      type: "sign-in",
    });

    // Always proceed to OTP screen, regardless of result
    setShowOtpInput(true);
    setCanResend(false);
    setCountdown(60);

    toast.success("Code sent!", {
      description: "Check your email for the 6-digit code.",
    });
  } catch (error) {
    // Even on error, show generic message
    toast.info("Check your email", {
      description: "If an account exists, you'll receive a code.",
    });
    setShowOtpInput(true);
  } finally {
    setIsLoading(false);
  }
};
```

### Phase 2: Code Quality & Error Handling (Week 3-4)

**Estimated Time**: 10 hours
**Focus**: Maintainability

```typescript
// 1. Error Class Hierarchy (3h)
// src/lib/errors.ts
export class AppError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode: number = 400,
    public details?: Record<string, any>
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }

  toJSON() {
    return {
      code: this.code,
      message: this.message,
      statusCode: this.statusCode,
      details: this.details,
    };
  }
}

export class AuthenticationError extends AppError {
  constructor(message = 'Authentication required') {
    super('AUTH_REQUIRED', message, 401);
  }
}

export class AuthorizationError extends AppError {
  constructor(message = 'Insufficient permissions') {
    super('FORBIDDEN', message, 403);
  }
}

export class ValidationError extends AppError {
  constructor(field: string, message: string, details?: Record<string, any>) {
    super('VALIDATION_ERROR', `${field}: ${message}`, 400, details);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super('NOT_FOUND', `${resource} not found`, 404);
  }
}

// 2. Constants File (1h)
// src/lib/constants.ts
export const OTP_CONFIG = {
  LENGTH: 6,
  EXPIRY_SECONDS: 300,
  MAX_ATTEMPTS: 3,
} as const;

export const VALIDATION_LIMITS = {
  NAME_MAX_LENGTH: 50,
  PHONE_MAX_LENGTH: 20,
  DESCRIPTION_MAX_LENGTH: 500,
  MAX_AGE_YEARS: 150,
} as const;

export const INVITATION_CONFIG = {
  EXPIRY_DAYS: 7,
  TOKEN_BYTES: 32,
} as const;

// 3. Structured Logging (2h)
// src/lib/logger.ts
type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  userId?: string;
  householdId?: string;
  action?: string;
  [key: string]: any;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';

  private log(level: LogLevel, message: string, context?: LogContext) {
    const timestamp = new Date().toISOString();
    const logData = {
      timestamp,
      level,
      message,
      ...context,
    };

    if (this.isDevelopment) {
      console.log(`[${level.toUpperCase()}] ${message}`, context);
    } else {
      // In production, send to logging service
      // e.g., Sentry, LogRocket, Datadog
      console.log(JSON.stringify(logData));
    }
  }

  debug(message: string, context?: LogContext) {
    if (this.isDevelopment) {
      this.log('debug', message, context);
    }
  }

  info(message: string, context?: LogContext) {
    this.log('info', message, context);
  }

  warn(message: string, context?: LogContext) {
    this.log('warn', message, context);
  }

  error(message: string, error?: Error, context?: LogContext) {
    this.log('error', message, {
      ...context,
      error: this.isDevelopment ? error : error?.message,
      stack: this.isDevelopment ? error?.stack : undefined,
    });
  }
}

export const logger = new Logger();

// Usage in auth.ts
import { logger } from '@/lib/logger';

sendVerificationOTP: async ({ email, otp, type }) => {
  logger.debug('Sending OTP', {
    email,
    type,
    otp: isDevelopment ? otp : '***',
  });

  // ... send email

  logger.info('OTP sent successfully', { email, type });
}

// 4. Validation Utilities (4h)
// src/lib/validators.ts (expanded)
import { z } from 'zod';
import { VALIDATION_LIMITS } from './constants';

export const nameSchema = z
  .string()
  .min(1, "Name is required")
  .max(VALIDATION_LIMITS.NAME_MAX_LENGTH, `Name must be ${VALIDATION_LIMITS.NAME_MAX_LENGTH} characters or less`)
  .regex(/^[a-zA-Z\s'-]+$/, "Name contains invalid characters");

export const emailSchema = z
  .string()
  .email("Invalid email address")
  .toLowerCase();

export const phoneSchema = z
  .string()
  .regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number format")
  .optional();

export const profileCreateSchema = z.object({
  firstName: nameSchema,
  lastName: nameSchema,
  phone: phoneSchema,
  dateOfBirth: z.number()
    .max(Date.now(), "Date of birth cannot be in the future")
    .refine(
      (val) => (Date.now() - val) / (1000 * 60 * 60 * 24 * 365) <= VALIDATION_LIMITS.MAX_AGE_YEARS,
      `Age cannot exceed ${VALIDATION_LIMITS.MAX_AGE_YEARS} years`
    )
    .optional(),
});

export const householdCreateSchema = z.object({
  name: z.string()
    .min(1, "Household name is required")
    .max(100, "Household name is too long (max 100 characters)"),
  description: z.string()
    .max(VALIDATION_LIMITS.DESCRIPTION_MAX_LENGTH, `Description is too long (max ${VALIDATION_LIMITS.DESCRIPTION_MAX_LENGTH} characters)`)
    .optional(),
});

// Reusable validation function
export function validateInput<T>(schema: z.ZodSchema<T>, data: unknown): T {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.errors[0];
      throw new ValidationError(
        firstError.path.join('.'),
        firstError.message,
        { errors: error.errors }
      );
    }
    throw error;
  }
}
```

### Phase 3: Architecture Refactoring (Month 1)

**Estimated Time**: 20 hours
**Focus**: Long-term maintainability

```typescript
// 1. Split auth.ts into modules (6h)

// src/convex/auth/index.ts
export { authComponent, createAuth } from './config';
export {
  getCurrentUser,
  getCurrentUserWithProfile,
  hasRole,
  isHouseholdMember,
  getHouseholdRole
} from './queries';
export {
  requireAuth,
  requireAdmin,
  requireHouseholdAccess,
  requireHouseholdAdmin
} from './helpers';

// src/convex/auth/config.ts
import { createClient } from "@convex-dev/better-auth";
import { convex } from "@convex-dev/better-auth/plugins";
import { components } from "../_generated/api";
import { DataModel } from "../_generated/dataModel";
import { betterAuth } from "better-auth";
import { emailOTP } from "better-auth/plugins";
import { sendOTPEmail } from './email';
import { env } from '@/lib/env';
import { OTP_CONFIG } from '@/lib/constants';

export const authComponent = createClient<DataModel>(components.betterAuth);

export const createAuth = (
  ctx: GenericCtx<DataModel>,
  { optionsOnly } = { optionsOnly: false }
) => {
  return betterAuth({
    logger: {
      disabled: optionsOnly,
    },
    baseURL: env.SITE_URL,
    database: authComponent.adapter(ctx),
    plugins: [
      emailOTP({
        sendVerificationOTP: sendOTPEmail,
        otpLength: OTP_CONFIG.LENGTH,
        expiresIn: OTP_CONFIG.EXPIRY_SECONDS,
        allowedAttempts: OTP_CONFIG.MAX_ATTEMPTS,
        sendVerificationOnSignUp: true,
        disableSignUp: false,
        storeOTP: "encrypted",
      }),
      convex(),
    ],
  });
};

// src/convex/auth/email.ts
import { Resend } from "resend";
import { env } from '@/lib/env';
import { logger } from '@/lib/logger';
import {
  getSignInOTPEmail
} from "@/lib/email-templates/otp-sign-in";
import {
  getEmailVerificationOTPEmail
} from "@/lib/email-templates/otp-email-verification";
import {
  getPasswordResetOTPEmail
} from "@/lib/email-templates/otp-password-reset";

const resend = env.RESEND_API_KEY ? new Resend(env.RESEND_API_KEY) : null;
const isDevelopment = env.NODE_ENV === 'development';

export async function sendOTPEmail({
  email,
  otp,
  type
}: {
  email: string;
  otp: string;
  type: "sign-in" | "email-verification" | "forget-password";
}) {
  logger.debug('Sending OTP email', {
    email,
    type,
    otp: isDevelopment ? otp : '***'
  });

  // Get email template based on type
  let emailContent: { subject: string; html: string; text: string };

  switch (type) {
    case "sign-in":
      emailContent = getSignInOTPEmail(otp);
      break;
    case "email-verification":
      emailContent = getEmailVerificationOTPEmail(otp);
      break;
    case "forget-password":
      emailContent = getPasswordResetOTPEmail(otp);
      break;
  }

  // Development mode: log to console
  if (!resend) {
    logger.info('Development mode: OTP email', {
      to: email,
      type,
      subject: emailContent.subject,
      otp,
    });
    return;
  }

  // Production: send via Resend
  try {
    const { data, error } = await resend.emails.send({
      from: `${env.EMAIL_FROM_NAME} <${env.EMAIL_FROM_ADDRESS}>`,
      to: email,
      subject: emailContent.subject,
      html: emailContent.html,
      text: emailContent.text,
    });

    if (error) {
      logger.error('Failed to send OTP email', error, { email, type });
      throw new Error(`Failed to send OTP email: ${error.message}`);
    }

    logger.info('OTP email sent successfully', {
      email,
      type,
      messageId: data?.id
    });
  } catch (error) {
    logger.error('Exception sending OTP email', error as Error, { email, type });
    throw error;
  }
}

// src/convex/auth/queries.ts
import { query } from "../_generated/server";
import { v } from "convex/values";
import { authComponent } from "./config";
import type { AuthUser } from "@/types/auth";

export const getCurrentUser = query({
  args: {},
  returns: v.union(
    v.object({
      _id: v.string(),
      email: v.string(),
      emailVerified: v.boolean(),
      createdAt: v.number(),
      updatedAt: v.number(),
    }),
    v.null()
  ),
  handler: async (ctx) => {
    return authComponent.getAuthUser(ctx) as AuthUser | null;
  },
});

// ... other query exports

// src/convex/auth/helpers.ts
import { authComponent } from "./config";
import { AuthenticationError, AuthorizationError, NotFoundError } from "@/lib/errors";
import type { AuthUser } from "@/types/auth";
import type { Id } from "../_generated/dataModel";

export async function requireAuth(ctx: any): Promise<AuthUser> {
  const user = await authComponent.getAuthUser(ctx);
  if (!user) {
    throw new AuthenticationError();
  }
  return user as AuthUser;
}

export async function requireProfile(ctx: any) {
  const user = await requireAuth(ctx);

  const profile = await ctx.db
    .query("profiles")
    .withIndex("by_userId", (q: any) => q.eq("userId", user._id))
    .unique();

  if (!profile) {
    throw new NotFoundError("Profile");
  }

  return { user, profile };
}

export async function requireAdmin(ctx: any): Promise<void> {
  const user = await requireAuth(ctx);

  const userRole = await ctx.db
    .query("userRoles")
    .withIndex("by_userId", (q: any) => q.eq("userId", user._id))
    .unique();

  if (!userRole || userRole.role !== "admin") {
    throw new AuthorizationError("Admin access required");
  }
}

export async function requireHouseholdAccess(
  ctx: any,
  householdId: Id<"households">
) {
  const { profile } = await requireProfile(ctx);

  const membership = await ctx.db
    .query("householdMemberships")
    .withIndex("by_household_and_user", (q: any) =>
      q.eq("householdId", householdId).eq("userId", profile._id)
    )
    .unique();

  if (!membership || membership.status !== "active") {
    throw new AuthorizationError("Access denied: not a member of this household");
  }

  return membership;
}

export async function requireHouseholdAdmin(
  ctx: any,
  householdId: Id<"households">
): Promise<void> {
  const membership = await requireHouseholdAccess(ctx, householdId);

  if (membership.role !== "owner" && membership.role !== "steward") {
    throw new AuthorizationError("Admin access required for this household");
  }
}

// 2. Repository Pattern (6h)

// src/convex/repositories/BaseRepository.ts
import type { GenericQueryCtx, GenericMutationCtx } from "convex/server";
import type { DataModel } from "../_generated/dataModel";

export type QueryCtx = GenericQueryCtx<DataModel>;
export type MutationCtx = GenericMutationCtx<DataModel>;

export abstract class BaseRepository<T extends keyof DataModel> {
  constructor(
    protected ctx: QueryCtx | MutationCtx,
    protected tableName: T
  ) {}

  async findById(id: any) {
    return this.ctx.db.get(id);
  }

  async insert(data: any) {
    return this.ctx.db.insert(this.tableName, data);
  }

  async patch(id: any, data: any) {
    return this.ctx.db.patch(id, data);
  }

  async delete(id: any) {
    return this.ctx.db.delete(id);
  }
}

// src/convex/repositories/ProfileRepository.ts
import { BaseRepository } from "./BaseRepository";
import type { Id } from "../_generated/dataModel";
import { NotFoundError } from "@/lib/errors";

export class ProfileRepository extends BaseRepository<"profiles"> {
  constructor(ctx: any) {
    super(ctx, "profiles");
  }

  async findByUserId(userId: string) {
    return this.ctx.db
      .query(this.tableName)
      .withIndex("by_userId", (q: any) => q.eq("userId", userId))
      .unique();
  }

  async findByUserIdOrThrow(userId: string) {
    const profile = await this.findByUserId(userId);
    if (!profile) {
      throw new NotFoundError("Profile");
    }
    return profile;
  }

  async create(data: {
    userId: string;
    firstName: string;
    lastName: string;
    phone?: string;
    dateOfBirth?: number;
  }) {
    return this.insert({
      ...data,
      updatedAt: Date.now(),
    });
  }

  async update(id: Id<"profiles">, data: Partial<{
    firstName: string;
    lastName: string;
    avatarUrl?: string;
    phone?: string;
    dateOfBirth?: number;
  }>) {
    return this.patch(id, {
      ...data,
      updatedAt: Date.now(),
    });
  }
}

// src/convex/repositories/HouseholdRepository.ts
import { BaseRepository } from "./BaseRepository";
import type { Id } from "../_generated/dataModel";

export class HouseholdRepository extends BaseRepository<"households"> {
  constructor(ctx: any) {
    super(ctx, "households");
  }

  async findByPrimaryContact(contactId: Id<"profiles">) {
    return this.ctx.db
      .query(this.tableName)
      .withIndex("by_primaryContactId", (q: any) =>
        q.eq("primaryContactId", contactId)
      )
      .collect();
  }

  async create(data: {
    name: string;
    description?: string;
    primaryContactId: Id<"profiles">;
  }) {
    return this.insert({
      ...data,
      subscriptionTier: "foundations" as const,
      subscriptionStatus: "active" as const,
      updatedAt: Date.now(),
    });
  }

  async update(id: Id<"households">, data: Partial<{
    name: string;
    description?: string;
    imageUrl?: string;
  }>) {
    return this.patch(id, {
      ...data,
      updatedAt: Date.now(),
    });
  }
}

// Usage in profiles.ts
import { ProfileRepository } from "./repositories/ProfileRepository";
import { requireAuth } from "./auth/helpers";
import { validateInput, profileCreateSchema } from "@/lib/validators";
import { ValidationError } from "@/lib/errors";

export const create = mutation({
  args: {
    firstName: v.string(),
    lastName: v.string(),
    phone: v.optional(v.string()),
    dateOfBirth: v.optional(v.number()),
  },
  returns: v.id("profiles"),
  handler: async (ctx, args) => {
    const user = await requireAuth(ctx);
    const repo = new ProfileRepository(ctx);

    // Check existing
    const existing = await repo.findByUserId(user._id);
    if (existing) {
      throw new ValidationError("profile", "Profile already exists");
    }

    // Validate input
    const validatedData = validateInput(profileCreateSchema, args);

    // Create profile
    return await repo.create({
      userId: user._id,
      ...validatedData,
    });
  },
});

// 3. Move Business Logic from UI (4h)

// src/convex/dashboard.ts
import { query } from "./_generated/server";
import { v } from "convex/values";
import { requireProfile } from "./auth/helpers";

export const getStats = query({
  args: {},
  returns: v.object({
    vaultItemsCount: v.number(),
    wisdomEntriesCount: v.number(),
    legacyPlanCompletion: v.number(),
  }),
  handler: async (ctx) => {
    const { profile } = await requireProfile(ctx);

    // Get user's households
    const memberships = await ctx.db
      .query("householdMemberships")
      .withIndex("by_user", (q) => q.eq("userId", profile._id))
      .filter(q => q.eq(q.field("status"), "active"))
      .collect();

    const householdIds = memberships.map(m => m.householdId);

    // Count vault items across all households
    const vaultItemsPromises = householdIds.map(householdId =>
      ctx.db
        .query("vaultDocuments")
        .withIndex("by_household", q => q.eq("householdId", householdId))
        .collect()
    );
    const vaultResults = await Promise.all(vaultItemsPromises);
    const vaultItemsCount = vaultResults.flat().length;

    // Count wisdom entries
    const wisdomPromises = householdIds.map(householdId =>
      ctx.db
        .query("wisdomEntries")
        .withIndex("by_household", q => q.eq("householdId", householdId))
        .collect()
    );
    const wisdomResults = await Promise.all(wisdomPromises);
    const wisdomEntriesCount = wisdomResults.flat().length;

    // Get legacy plan completion
    const legacyPlans = await ctx.db
      .query("legacyPlans")
      .withIndex("by_user", q => q.eq("userId", profile._id))
      .collect();

    const legacyPlanCompletion = legacyPlans.length > 0
      ? Math.round(
          legacyPlans.reduce((sum, plan) => sum + plan.completionPercentage, 0) /
          legacyPlans.length
        )
      : 0;

    return {
      vaultItemsCount,
      wisdomEntriesCount,
      legacyPlanCompletion,
    };
  },
});

export const getNextStep = query({
  args: {},
  returns: v.object({
    title: v.string(),
    description: v.string(),
    route: v.string(),
    icon: v.string(),
  }),
  handler: async (ctx) => {
    const stats = await getStats(ctx, {});

    if (stats.wisdomEntriesCount === 0) {
      return {
        title: "Add your first Wisdom entry",
        description: "Share life lessons and values with future generations",
        route: "/wisdom/create",
        icon: "sparkles",
      };
    } else if (stats.vaultItemsCount < 5) {
      return {
        title: "Secure important documents",
        description: "Upload essential documents to your Heritage Vault",
        route: "/vault",
        icon: "shield",
      };
    } else if (stats.legacyPlanCompletion < 50) {
      return {
        title: "Continue your Legacy Plan",
        description: "Complete your life story and wishes for loved ones",
        route: "/legacy",
        icon: "fileText",
      };
    } else {
      return {
        title: "Review Family Ecosystem",
        description: "Update family member roles and permissions",
        route: "/family",
        icon: "users",
      };
    }
  },
});

// Update dashboard page to use queries
// src/app/(auth)/dashboard/page.tsx
import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { requireServerAuth } from "@/lib/auth-session";
import { getToken } from "@/lib/auth-server";

export default async function DashboardPage() {
  const { user, profile } = await requireServerAuth();
  const token = await getToken();

  // Fetch stats and next step from Convex
  const stats = await fetchQuery(api.dashboard.getStats, {}, { token });
  const nextStep = await fetchQuery(api.dashboard.getNextStep, {}, { token });

  return (
    <div className="px-6 py-8 max-w-screen-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">
          Welcome back, {profile.firstName}.
        </h1>
        <p className="text-muted-foreground text-lg">
          Here&apos;s your legacy journey at a glance
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <DashboardStatCard
          href="/vault"
          icon="shield"
          value={stats.vaultItemsCount}
          title="Heritage Vault Items"
          description="Documents secured and protected"
        />
        <DashboardStatCard
          href="/wisdom"
          icon="bookOpen"
          value={stats.wisdomEntriesCount}
          title="Wisdom Entries"
          description="Life lessons shared with family"
        />
        <DashboardStatCard
          href="/legacy"
          icon="fileText"
          value={`${stats.legacyPlanCompletion}%`}
          title="Legacy Plan"
          description="Your story and wishes documented"
        />
      </div>

      {/* Next Step CTA */}
      <Link href={nextStep.route} className="block mb-8">
        <Card className="bg-primary/5 border-primary/20 cursor-pointer hover:shadow-lg transition-all hover:bg-primary/10">
          <CardContent className="p-6">
            {/* ... render next step */}
          </CardContent>
        </Card>
      </Link>
    </div>
  );
}

// 4. Add Service Layer (4h)

// src/app/actions.ts
"use server";

import { fetchMutation, fetchAction } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { getToken } from "@/lib/auth-server";
import type { Id } from "@/convex/_generated/dataModel";

export async function createHouseholdWithInvites(data: {
  name: string;
  description?: string;
  invites: Array<{
    email: string;
    role: "steward" | "viewer" | "executor";
    relationship?: string;
  }>;
}) {
  const token = await getToken();
  if (!token) {
    throw new Error("Not authenticated");
  }

  // Step 1: Create household
  const householdId = await fetchMutation(
    api.households.create,
    {
      name: data.name,
      description: data.description,
    },
    { token }
  );

  // Step 2: Generate secure tokens and send invites
  const inviteResults = await Promise.all(
    data.invites.map(async (invite) => {
      try {
        // Generate secure token
        const secureToken = await fetchAction(
          api.households.generateSecureToken,
          {},
          { token }
        );

        // Create invitation
        const invitationId = await fetchMutation(
          api.households.inviteMember,
          {
            householdId,
            email: invite.email,
            role: invite.role,
            relationship: invite.relationship,
            secureToken,
          },
          { token }
        );

        return { success: true, email: invite.email, invitationId };
      } catch (error) {
        return {
          success: false,
          email: invite.email,
          error: error instanceof Error ? error.message : "Unknown error"
        };
      }
    })
  );

  return {
    householdId,
    invites: inviteResults,
  };
}

export async function bulkUploadDocuments(data: {
  householdId: Id<"households">;
  documents: Array<{
    name: string;
    storageId: Id<"_storage">;
    fileSize: number;
    fileType: string;
    categories: string[];
  }>;
}) {
  const token = await getToken();
  if (!token) {
    throw new Error("Not authenticated");
  }

  const results = await Promise.all(
    data.documents.map(async (doc) => {
      try {
        const documentId = await fetchMutation(
          api.vaultDocuments.create,
          {
            householdId: data.householdId,
            ...doc,
          },
          { token }
        );
        return { success: true, name: doc.name, documentId };
      } catch (error) {
        return {
          success: false,
          name: doc.name,
          error: error instanceof Error ? error.message : "Unknown error"
        };
      }
    })
  );

  return results;
}
```

### Phase 4: Security Hardening (Month 1)

**Estimated Time**: 12 hours
**Focus**: Production security

```typescript
// 1. Rate Limiting (3h)

// Install: pnpm add @upstash/ratelimit @upstash/redis

// src/middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Create rate limiter
const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "10 s"),
  analytics: true,
  prefix: "pathible",
});

export async function middleware(request: NextRequest) {
  // Only rate limit API routes
  if (request.nextUrl.pathname.startsWith("/api")) {
    const ip = request.ip ?? "127.0.0.1";
    const { success, limit, reset, remaining } = await ratelimit.limit(
      `ratelimit_${ip}`
    );

    if (!success) {
      return NextResponse.json(
        { error: "Too many requests" },
        {
          status: 429,
          headers: {
            "X-RateLimit-Limit": limit.toString(),
            "X-RateLimit-Remaining": remaining.toString(),
            "X-RateLimit-Reset": new Date(reset).toISOString(),
          }
        }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/api/:path*",
};

// 2. Content Security Policy (2h)

// next.config.ts
import type { NextConfig } from "next";

const isDevelopment = process.env.NODE_ENV === "development";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              isDevelopment
                ? "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.convex.cloud"
                : "script-src 'self' https://cdn.convex.cloud",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: https: blob:",
              "font-src 'self' data:",
              "connect-src 'self' https://*.convex.cloud https://*.convex.site",
              "frame-ancestors 'none'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join("; "),
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;

// 3. Input Sanitization (3h)

// Install: pnpm add isomorphic-dompurify

// src/lib/sanitize.ts
import DOMPurify from "isomorphic-dompurify";

export function sanitizeHtml(dirty: string, allowedTags?: string[]): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: allowedTags || [
      "b", "i", "em", "strong", "a", "p", "br", "ul", "ol", "li", "h1", "h2", "h3"
    ],
    ALLOWED_ATTR: ["href", "title"],
    ALLOW_DATA_ATTR: false,
  });
}

export function sanitizeText(text: string, maxLength = 1000): string {
  return text
    .trim()
    .replace(/<[^>]*>/g, "") // Remove HTML tags
    .replace(/[<>]/g, "") // Remove angle brackets
    .substring(0, maxLength);
}

export function sanitizeFileName(fileName: string): string {
  return fileName
    .replace(/[^a-zA-Z0-9._-]/g, "_") // Replace invalid chars
    .substring(0, 255); // Limit length
}

// Update households.ts to use sanitization
import { sanitizeText } from "@/lib/sanitize";

export const create = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
  },
  returns: v.id("households"),
  handler: async (ctx, args) => {
    const { profile } = await requireAuth(ctx);

    // Validate and sanitize input
    const validatedData = validateInput(householdCreateSchema, args);

    const householdId = await ctx.db.insert("households", {
      name: sanitizeText(validatedData.name, 100),
      description: validatedData.description
        ? sanitizeText(validatedData.description, 500)
        : undefined,
      primaryContactId: profile._id,
      subscriptionTier: "foundations",
      subscriptionStatus: "active",
      updatedAt: Date.now(),
    });

    // ... rest of implementation
  },
});

// 4. Enhanced Error Handling (4h)

// src/lib/error-handler.ts
import { logger } from "./logger";
import { AppError } from "./errors";
import * as Sentry from "@sentry/nextjs"; // Optional: Add Sentry

export function handleError(error: unknown, context?: Record<string, any>) {
  // Log error
  if (error instanceof AppError) {
    logger.warn(error.message, {
      code: error.code,
      statusCode: error.statusCode,
      ...context
    });
  } else if (error instanceof Error) {
    logger.error(error.message, error, context);

    // Send to error tracking service
    if (process.env.NODE_ENV === "production") {
      Sentry.captureException(error, {
        contexts: { custom: context },
      });
    }
  } else {
    logger.error("Unknown error", undefined, { error, ...context });
  }

  // Return user-friendly error
  if (error instanceof AppError) {
    return {
      code: error.code,
      message: error.message,
      statusCode: error.statusCode,
    };
  }

  // Don't expose internal errors in production
  return {
    code: "INTERNAL_ERROR",
    message: process.env.NODE_ENV === "development"
      ? String(error)
      : "An unexpected error occurred",
    statusCode: 500,
  };
}

// Global error boundary for React
// src/app/error.tsx
"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { handleError } from "@/lib/error-handler";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    handleError(error, { digest: error.digest });
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <h2 className="text-2xl font-bold mb-4">Something went wrong!</h2>
      <p className="text-muted-foreground mb-6">
        We've been notified and are working on a fix.
      </p>
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}

// Global error handler for API routes
// src/app/api/error-handler.ts
import { NextResponse } from "next/server";
import { handleError } from "@/lib/error-handler";

export function createErrorResponse(error: unknown) {
  const errorData = handleError(error);
  return NextResponse.json(
    { error: errorData.message, code: errorData.code },
    { status: errorData.statusCode }
  );
}

// Usage in API routes
// src/app/api/auth/[...all]/route.ts
import { createErrorResponse } from "@/app/api/error-handler";

export const { GET, POST } = nextJsHandler({
  convexSiteUrl: process.env.NEXT_PUBLIC_CONVEX_SITE_URL,
  onError: (error) => createErrorResponse(error),
});
```

### Phase 5: Testing & Monitoring (Month 2+)

**Estimated Time**: 40+ hours
**Focus**: Production readiness

1. **Unit Tests** (12h)
   - Set up Vitest or Jest
   - Write tests for all utilities
   - Test repository classes
   - Test validation functions

2. **Integration Tests** (12h)
   - Test Convex functions with test database
   - Test server actions
   - Test authentication flows

3. **E2E Tests** (8h)
   - Expand Cypress tests
   - Cover critical user journeys
   - Test household management flows

4. **Monitoring Setup** (4h)
   - Set up Sentry for error tracking
   - Configure performance monitoring
   - Set up log aggregation

5. **Documentation** (4h)
   - API documentation
   - Architecture diagrams
   - Deployment guide
   - Contributing guidelines

---

## 7. Testing Checklist

### Before Merging Any Phase

- [ ] All TypeScript compilation errors resolved
- [ ] All ESLint errors and warnings addressed
- [ ] Existing Cypress tests pass
- [ ] Manual testing of auth flows (login, signup, logout)
- [ ] Manual testing of household operations
- [ ] Performance testing with realistic data volumes
- [ ] Security testing of critical paths
- [ ] Cross-browser testing (Chrome, Safari, Firefox)
- [ ] Mobile responsiveness verification

### Specific Phase Testing

**Phase 1 (Security Fixes)**:
- [ ] Verify tokens are cryptographically secure (cannot predict)
- [ ] Confirm OTP codes not in production logs
- [ ] Test environment variable validation
- [ ] Performance testing: households list with 50+ items

**Phase 2 (Code Quality)**:
- [ ] Test error messages are user-friendly
- [ ] Verify validation catches all edge cases
- [ ] Confirm logging works in both dev and prod modes

**Phase 3 (Architecture)**:
- [ ] Test all refactored modules individually
- [ ] Verify repositories work correctly
- [ ] Test business logic queries independently

**Phase 4 (Security Hardening)**:
- [ ] Test rate limiting with automated requests
- [ ] Verify CSP doesn't break functionality
- [ ] Test sanitization prevents XSS
- [ ] Security audit with OWASP ZAP or similar

---

## 8. Production Deployment Checklist

### Environment Setup
- [ ] All environment variables configured
- [ ] Database backups enabled
- [ ] CDN configured (if applicable)
- [ ] SSL/TLS certificates valid
- [ ] DNS records properly set

### Security
- [ ] Rate limiting active
- [ ] CSP headers deployed
- [ ] HTTPS enforced
- [ ] Security headers verified
- [ ] Secrets rotated

### Monitoring
- [ ] Error tracking (Sentry) active
- [ ] Performance monitoring configured
- [ ] Log aggregation set up
- [ ] Uptime monitoring enabled
- [ ] Alerts configured

### Performance
- [ ] Database indexes verified
- [ ] Image optimization enabled
- [ ] Bundle size optimized
- [ ] Caching configured
- [ ] CDN working

### Documentation
- [ ] README updated
- [ ] SECURITY.md created
- [ ] CONTRIBUTING.md added
- [ ] API documentation published
- [ ] Runbook for common issues

---

## 9. Summary

### Current State

**Strengths**:
- ✅ Modern tech stack (Next.js 16, Convex, Better Auth)
- ✅ Clean architecture with good separation of concerns
- ✅ Comprehensive database schema with proper indexing
- ✅ Server-first approach minimizing client-side JavaScript
- ✅ Type-safe database operations
- ✅ **FIXED**: Cryptographically secure tokens
- ✅ **FIXED**: Type safety with Better Auth
- ✅ **FIXED**: Environment-aware logging

**Areas for Improvement**:
- ⚠️ Input validation and sanitization
- ⚠️ Error handling standardization
- ⚠️ Performance optimizations (N+1 queries)
- ⚠️ Security hardening (CSP, rate limiting)
- ⚠️ Architecture refactoring (split large files)

### Recommended Timeline

- **✅ Completed**: Critical security fixes (6 hours)
- **Week 1-2**: High priority (Security + Performance) - 13 hours
- **Week 3-4**: Code quality improvements - 10 hours
- **Month 1**: Architecture refactoring - 20 hours
- **Month 1**: Security hardening - 12 hours
- **Month 2+**: Testing and monitoring - 40+ hours

**Total Estimated Effort**: ~100 hours for complete implementation

### Next Steps

1. **Immediate** (Today):
   - ✅ Review backend-architect fixes
   - ✅ Test secure token generation
   - ✅ Update client code for new invitation flow
   - ✅ Verify type safety improvements

2. **This Week**:
   - Begin Phase 1 (High Priority Security & Performance)
   - Set up environment variable validation
   - Fix N+1 query problems
   - Add comprehensive input validation

3. **This Month**:
   - Complete Phases 2-4
   - Set up monitoring and error tracking
   - Conduct security audit
   - Performance testing with realistic data

4. **Long Term**:
   - Implement comprehensive testing
   - Add monitoring and observability
   - Create admin dashboard
   - Plan for scaling

---

## 10. Additional Resources

### Documentation to Create
- API documentation for Convex functions
- Architecture decision records (ADRs)
- Security policy (SECURITY.md)
- Contributing guidelines
- Deployment runbook

### Tools to Add
- Bundle analyzer: `@next/bundle-analyzer`
- Error tracking: Sentry
- Performance monitoring: Vercel Analytics or similar
- Rate limiting: Upstash Redis
- Code quality: SonarQube (optional)

### Recommended Reading
- [Next.js Security Best Practices](https://nextjs.org/docs/app/building-your-application/configuring/security)
- [Convex Best Practices](https://docs.convex.dev/production/best-practices)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Better Auth Documentation](https://www.better-auth.com/docs)

---

**Review Conducted By**: Claude Code (Multi-Specialist Team)
**Review Methodology**: Quality Audit, Security Analysis, Performance Review, Architecture Assessment
**Review Date**: 2025-01-11
**Status**: Initial PR Review Complete - Critical Fixes Applied ✅
