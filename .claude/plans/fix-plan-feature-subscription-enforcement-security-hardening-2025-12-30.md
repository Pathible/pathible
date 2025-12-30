# Fix Plan – feature/subscription-enforcement-security-hardening

**Created**: 2025-12-30
**Review Source**: Code review #2 from 2025-12-30
**Total Issues**: 5 critical, 12 major, 9 minor (2 critical skipped as false positives)

---

## Execution Order

Issues are ordered by: Priority (critical first), then dependency (foundational fixes first), then by file grouping.

**Previously Fixed (Sessions 1-2):**

- [x] Runtime error: `documents.map is not a function` (Array.isArray guard)
- [x] TOCTOU race in vaultActions.ts (atomic getDocumentWithAccessInternal)
- [x] O(n*m) category counting (added documentCount counter)
- [x] Duplicated constants (extracted to shared/constants.ts)
- [x] Type widening in vaultHelpers.ts (strict Id<"profiles"> types)
- [x] Mid-file imports in auth.ts and vault.ts
- [x] Filter after withIndex bypasses index (familyEcosystem.ts)
- [x] FEATURE_TIERS unconstrained Record<string>
- [x] Auth order in deleteProperty
- [x] checkFamilyMemberLimit/checkFamilyUnitLimit O(n) collect (counters added)
- [x] Duplicated profile validator, email regex, activity log pattern
- [x] Long updateFamilyMember method extraction
- [x] Exhaustive never check in vaultHelpers
- [x] households.ts inviteMember() limit check
- [x] onboarding.ts sendInvitations() checks
- [x] onboarding.ts compound index
- [x] households.ts compound index
- [x] schema.ts v.any() fix
- [x] households.ts update() subscription
- [x] households.ts removeMember() subscription
- [x] households.ts updateMemberRole() subscription
- [x] vault.ts updateCategory performance note
- [x] vault.ts deleteCategory performance note
- [x] vault.ts getStats single-pass aggregation
- [x] vault.ts update() decomposition (validateDocumentName, validateDocumentDescription)
- [x] familyEcosystem.ts decomposition (getOrCreatePrimaryFamilyUnit, getNextMemberOrderIndex)
- [x] vault.ts updateCategory decomposition (validateCategoryName, validateCategoryDescription)

**Groupings for New Issues:**

1. ~~**Frontend auth mismatch** (#1-2)~~ - INVALID: Project uses Clerk (CLAUDE.md was incorrect)
2. **Security gaps** (#3-4, #8-10) - High priority security hardening
3. **Performance N+1** (#5, #13-14) - households.ts query patterns
4. **Remaining cleanup** (#6-7, #11-12, #15-19) - Quality improvements

---

## 🔴 Critical Issues

### ~~Issue #1: Wrong Auth Provider Import (vault-content.tsx)~~ ⏭️ INVALID

**Status**: Skipped - False positive
**Reason**: The code review incorrectly assumed the project uses Better Auth. CLAUDE.md was outdated. The project actually uses **Clerk**, so importing `useUser` from `@clerk/nextjs` is correct.

---

### ~~Issue #2: Using Clerk's useUser Hook (vault-content.tsx)~~ ⏭️ INVALID

**Status**: Skipped - False positive
**Reason**: Same as #1. The project uses Clerk, so `useUser()` is the correct hook.

---

### Issue #3: getDocumentInternal Lacks Auth Check (auth.ts)

**File**: `src/convex/auth.ts:667-695`
**Area**: Security
**Complexity**: Quick

**Problem**:
`getDocumentInternal` fetches documents without any access verification. If misused, it could expose documents to unauthorized access.

**Fix**:
Add a prominent deprecation warning and recommend using `getDocumentWithAccessInternal` instead.

**Suggested Change**:
Add JSDoc deprecation notice:
```typescript
/**
 * @deprecated Use getDocumentWithAccessInternal instead for safer access control.
 * This function does NOT verify access permissions.
 */
```

- [ ] Not started

---

### Issue #4: API Key Logging in Backblaze Config

**File**: `src/lib/backblaze/config.ts:59-69`
**Area**: Security
**Complexity**: Quick

**Problem**:
Logs partial access key ID prefix which could aid attackers in credential enumeration.

**Fix**:
Remove credential information from logging, replace with boolean flags.

**Current Code**:
```typescript
accessKeyIdPrefix: accessKeyId ? `${accessKeyId.substring(0, 8)}...` : "undefined",
```

**Suggested Change**:
```typescript
accessKeyIdConfigured: !!accessKeyId,
```

- [ ] Not started

---

### Issue #5: N+1 Queries in households.ts list()

**File**: `src/convex/households.ts:99-104` and `191-196`
**Area**: Performance
**Complexity**: Moderate

**Problem**:
The `list()` query performs N+1 queries - for each household, it queries member count separately instead of using the cached `memberCount` counter.

**Fix**:
Use the pre-computed `household.memberCount` field instead of querying memberships.

- [ ] Not started

---

### Issue #6: households.ts get() Ignores Argument

**File**: `src/convex/households.ts:71`
**Area**: Convex
**Complexity**: Quick

**Problem**:
The `get` query accepts a `householdId` argument but lists all households instead of fetching the specific one.

**Fix**:
Either rename to `list` or fix to use the argument.

- [ ] Not started

---

### Issue #7: getStats Still Collects All Documents

**File**: `src/convex/vault.ts:334-343`
**Area**: Performance
**Complexity**: Moderate

**Problem**:
While getStats now uses single-pass aggregation (fixed in session 2), it still collects ALL documents into memory. For households with thousands of documents, this could cause memory issues.

**Fix**:
Consider adding a `documentCount` counter to the household document for O(1) total count, and using `take()` with index for recent uploads.

- [ ] Not started

---

## 🟡 Major Issues

### Issue #8: getKeyContacts Missing Ownership Check (legacy.ts)

**File**: `src/convex/legacy.ts:96-114`
**Area**: Security
**Complexity**: Quick

**Problem**:
Any authenticated household member can view key contacts for ANY legacy plan in that household, regardless of who owns the plan.

**Fix**:
Add ownership check: `plan.userId === profile._id`.

- [ ] Not started

---

### Issue #9: Weak Invite Token Generation (onboarding.ts)

**File**: `src/convex/onboarding.ts:437`
**Area**: Security
**Complexity**: Quick

**Problem**:
Uses `crypto.randomUUID()` for invite tokens which is less cryptographically secure.

**Fix**:
Use `crypto.getRandomValues()` with 32 bytes, then encode as hex or base64.

- [ ] Not started

---

### Issue #10: Logging Infrastructure Details (backblaze/config.ts)

**File**: `src/lib/backblaze/config.ts:122-131`
**Area**: Security
**Complexity**: Quick

**Problem**:
Logs bucketId and bucketName which exposes infrastructure details.

**Fix**:
Remove infrastructure details from logs or mask them.

- [ ] Not started

---

### Issue #11: Redundant Auth Retry Logic (vault-content.tsx)

**File**: `src/app/(auth)/vault/components/vault-content.tsx:21-43`
**Area**: Frontend
**Complexity**: Moderate

**Problem**:
Complex retry/polling logic (10 retries at 500ms) for auth race condition. The `(auth)` layout already handles authentication.

**Fix**:
Remove the retry logic entirely - rely on layout-level server-side auth check.

- [ ] Not started

---

### Issue #12: Redundant Unauthenticated UI (vault-content.tsx)

**File**: `src/app/(auth)/vault/components/vault-content.tsx:91-103`
**Area**: Frontend
**Complexity**: Quick

**Problem**:
Shows "Not authenticated" UI in a protected route. Users can never reach this component without auth.

**Fix**:
Remove the unauthenticated state handling entirely.

- [ ] Not started

---

### Issue #13: N+1 in listMembers() (households.ts)

**File**: `src/convex/households.ts:251-272`
**Area**: Performance
**Complexity**: Moderate

**Problem**:
Sequential profile fetches for each member - N+1 query pattern.

**Fix**:
Batch fetch all profiles first, then map to members.

- [ ] Not started

---

### Issue #14: N+1 in listInvitations() (households.ts)

**File**: `src/convex/households.ts:321-341`
**Area**: Performance
**Complexity**: Moderate

**Problem**:
Sequential inviter profile fetches - N+1 query pattern.

**Fix**:
Batch fetch all inviter profiles first.

- [ ] Not started

---

### Issue #15: Multiple Separate useQuery Hooks (vault-content.tsx)

**File**: `src/app/(auth)/vault/components/vault-content.tsx:50-62`
**Area**: Performance
**Complexity**: Complex

**Problem**:
4 separate useQuery hooks create 4 separate Convex subscriptions, increasing overhead.

**Fix**:
Consider creating a combined `getVaultPage` query that returns all needed data.

- [ ] Not started

---

### Issue #16: Inefficient getSuggestions Index (financial.ts)

**File**: `src/convex/financial.ts:419-422`
**Area**: Convex
**Complexity**: Moderate

**Problem**:
`getSuggestions` uses `by_user_and_status` then filters by household, inefficient if user is in multiple households.

**Fix**:
Use `by_household_and_status` index with userId filter instead.

- [ ] Not started

---

### Issue #17: Repeated Validation in financial.ts

**File**: `src/convex/financial.ts`
**Area**: Code Quality
**Complexity**: Moderate

**Problem**:
Validation pattern repeated across create/update mutations without abstraction.

**Fix**:
Extract shared `validateAccountFields`, `validatePropertyFields`, `validatePolicyFields` helpers.

- [ ] Not started

---

### Issue #18: Unsafe Type Assertion (households.ts)

**File**: `src/convex/households.ts:593`
**Area**: Type Safety
**Complexity**: Quick

**Problem**:
Unsafe type assertion `(user as { email?: string })` could cause runtime errors.

**Fix**:
Create explicit user type from auth context or use proper type guard.

- [ ] Not started

---

### Issue #19: Dynamic Field Access in counters.ts

**File**: `src/convex/shared/counters.ts:24-29`
**Area**: Type Safety
**Complexity**: Moderate

**Problem**:
Multiple `as` casts for dynamic field access bypasses TypeScript checking.

**Fix**:
Use discriminated union or explicit getters per field.

- [ ] Not started

---

## 🟢 Minor Issues (Optional)

### Issue #20: Validate email format in auth.ts:180-184

- [ ] Not started

### Issue #21: Sanitize search query for regex in vault.ts:216-223

- [ ] Not started

### Issue #22: Extract magic numbers to constants

- [ ] Not started

### Issue #23: Add explicit return types to helpers

- [ ] Not started

### Issue #24: Add aria-label to icon buttons

- [ ] Not started

### Issue #25: Extract shared components from privacy/terms

- [ ] Not started

---

## Dependencies

Some fixes depend on others. Recommended order:

1. ~~**#1, #2**~~ → SKIPPED (false positives - project uses Clerk)
2. **#3, #4, #8, #9, #10** → Security fixes (independent, can be parallelized)
3. **#5, #6** → households.ts query fixes (related, do together)
4. **#7** → vault.ts stats counter optimization
5. **#11, #12** → vault-content.tsx cleanup (optional quality improvements)
6. **#13, #14** → More households.ts N+1 fixes
7. **#15-19** → Remaining performance/quality fixes

---

## Progress Tracking

| Issue | Priority | Status | Description |
|-------|----------|--------|-------------|
| #1 | 🔴 Critical | ⏭️ Skipped | ~~vault-content.tsx wrong auth import~~ - FALSE POSITIVE |
| #2 | 🔴 Critical | ⏭️ Skipped | ~~vault-content.tsx useUser hook~~ - FALSE POSITIVE |
| #3 | 🔴 Critical | ✅ Complete | auth.ts getDocumentInternal deprecation |
| #4 | 🔴 Critical | ✅ Complete | backblaze config key logging |
| #5 | 🔴 Critical | ✅ Complete | households.ts N+1 in list() |
| #6 | 🔴 Critical | ✅ Complete | households.ts get() ignores arg |
| #7 | 🔴 Critical | ✅ Complete | vault.ts getStats document counter |
| #8 | 🟡 Major | ⬜ Not started | legacy.ts ownership check |
| #9 | 🟡 Major | ⬜ Not started | onboarding.ts token generation |
| #10 | 🟡 Major | ✅ Complete | backblaze config infrastructure logging |
| #11 | 🟡 Major | ⬜ Not started | vault-content.tsx retry logic |
| #12 | 🟡 Major | ⬜ Not started | vault-content.tsx unauth UI |
| #13 | 🟡 Major | ⬜ Not started | households.ts listMembers N+1 |
| #14 | 🟡 Major | ⬜ Not started | households.ts listInvitations N+1 |
| #15 | 🟡 Major | ⬜ Not started | vault-content.tsx query consolidation |
| #16 | 🟡 Major | ⬜ Not started | financial.ts index usage |
| #17 | 🟡 Major | ⬜ Not started | financial.ts validation DRY |
| #18 | 🟡 Major | ⬜ Not started | households.ts type assertion |
| #19 | 🟡 Major | ⬜ Not started | counters.ts type safety |
| #20-25 | 🟢 Minor | ⬜ Not started | Various minor improvements |

**Status Legend**: ⬜ Not started | 🔄 In progress | ✅ Complete | ⏭️ Skipped

---

## Commands

To fix issues from this plan:

- Fix all: `/fix-issues`
- Fix specific: `/fix-issues #1`
- Fix range: `/fix-issues #1-7`
- Fix by priority: `/fix-issues --critical` or `/fix-issues --major`
