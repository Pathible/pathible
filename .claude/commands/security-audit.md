# Security Audit Command

Run security checks against the current branch to identify vulnerabilities before merge.

## Arguments

$ARGUMENTS

## Argument Parsing

| Argument Type | Format | Example |
|---------------|--------|---------|
| Module | Plain text | `vault`, `financial`, `auth` |
| Flags | `--flag-name` | `--full`, `--quick`, `--log` |

**Supported Arguments:**

- `<module>` - Audit specific module (vault, financial, family, legacy, wisdom, auth)
- `--full` - Complete security audit of all modules
- `--quick` - Fast check of common vulnerabilities only
- `--log` - Append results to SECURITY_AUDIT_LOG.md
- (no args) - Audit changed files in current branch

## Instructions

### Step 1: Determine Scope

If no arguments, get changed files:
```bash
git diff main...HEAD --name-only | grep "src/convex"
```

If module specified, target those files:
- `vault` → `src/convex/vault.ts`, `src/convex/vaultActions.ts`
- `financial` → `src/convex/financial.ts`
- `family` → `src/convex/familyEcosystem.ts`, `src/convex/households.ts`
- `legacy` → `src/convex/legacy.ts`
- `auth` → `src/convex/auth.ts`

### Step 2: Run Security Checks

#### 2.1 Authentication Checks

For each mutation/action, verify:
- [ ] `requireAuth()` or `requireAuthInternal()` called
- [ ] User identity validated before data access
- [ ] No direct `ctx.db` calls without auth check

```typescript
// GOOD
const { user, profile } = await requireAuth(ctx);

// BAD - no auth check
const data = await ctx.db.query("sensitive").collect();
```

#### 2.2 Authorization Checks

For mutations accessing household data:
- [ ] `requireHouseholdAccess()` called with householdId
- [ ] Role checks for sensitive operations (owner/steward only)
- [ ] Document ownership validated

```typescript
// GOOD
await requireHouseholdAccess(ctx, args.householdId);

// BAD - no household access check
const docs = await ctx.db.query("vaultDocuments")
  .withIndex("by_household", q => q.eq("householdId", args.householdId))
  .collect();
```

#### 2.3 Subscription Enforcement

For tier-restricted features:
- [ ] `requireActiveSubscription()` on all mutations
- [ ] `requireSubscriptionTier()` for premium features
- [ ] `checkStorageQuota()` before file operations
- [ ] `checkFamilyMemberLimit()` before adding members

```typescript
// GOOD
await requireActiveSubscription(ctx, householdId);
await requireSubscriptionTier(ctx, householdId, "legacy");

// BAD - no subscription check
await ctx.db.insert("legacyPlans", { ... });
```

#### 2.4 Input Validation

Check for:
- [ ] All args validated with Convex validators
- [ ] String lengths limited where appropriate
- [ ] Enum values constrained
- [ ] No raw SQL/query injection vectors

```typescript
// GOOD
args: {
  name: v.string(), // Convex validates type
  role: v.union(v.literal("owner"), v.literal("steward")),
}

// BAD - accepts any string for role
args: {
  role: v.string(),
}
```

#### 2.5 Data Exposure

Check queries return only necessary data:
- [ ] No `.collect()` on large tables without limits
- [ ] Sensitive fields excluded from returns
- [ ] Password/token fields never returned

#### 2.6 File Operations (Vault)

For file upload/download:
- [ ] Storage quota checked before upload
- [ ] File type validation
- [ ] Download URLs time-limited
- [ ] Subscription status checked

### Step 3: Generate Report

```markdown
# Security Audit Report

**Date**: 2024-12-31
**Scope**: Changed files in feature/xyz branch
**Auditor**: Claude Code

## Summary

| Category | Status | Issues |
|----------|--------|--------|
| Authentication | PASS | 0 |
| Authorization | WARN | 1 |
| Subscription | PASS | 0 |
| Input Validation | PASS | 0 |
| Data Exposure | PASS | 0 |
| File Operations | N/A | - |

**Overall**: 1 issue found

## Issues Found

### [MEDIUM] Missing role check in updateHousehold

**File**: src/convex/households.ts:145
**Issue**: Mutation allows any household member to update settings
**Risk**: Viewers could modify household name/settings
**Fix**: Add `requireHouseholdAdmin(ctx, householdId)` check

```typescript
// Current (vulnerable)
export const updateHousehold = mutation({
  handler: async (ctx, args) => {
    await requireHouseholdAccess(ctx, args.householdId);
    // ... update logic
  }
});

// Fixed
export const updateHousehold = mutation({
  handler: async (ctx, args) => {
    await requireHouseholdAdmin(ctx, args.householdId);
    // ... update logic
  }
});
```

## Checklist

### Authentication
- [x] All mutations call requireAuth()
- [x] All actions use requireAuthInternal()
- [x] No unauthenticated data access

### Authorization
- [x] Household access validated
- [ ] Role checks on admin operations ← ISSUE
- [x] Document ownership verified

### Subscription
- [x] Active subscription required for mutations
- [x] Tier restrictions enforced
- [x] Limits checked (storage, members)

### Input
- [x] Args use Convex validators
- [x] Enums properly constrained
- [x] No injection vectors

## Recommendations

1. Add `requireHouseholdAdmin()` to updateHousehold mutation
2. Consider audit logging for sensitive operations

## Sign-off

- [ ] All critical issues resolved
- [ ] All medium issues have remediation plan
- [ ] Ready for merge: NO (1 issue outstanding)
```

### Step 4: Log Results (if --log)

Append to `docs/SECURITY_AUDIT_LOG.md`:

```markdown
### [Date] - [Branch/Feature Name]

**Reviewer:** Claude Code (security-audit command)

**Files Reviewed:**
- src/convex/households.ts

**Issues Found:**
1. [MEDIUM] Missing role check in updateHousehold

**Fixes Applied:**
1. (pending)

**Status:** Issues Found
```

### Step 5: Quick Mode (--quick)

Fast checks only:
1. Grep for mutations without `requireAuth`
2. Grep for `ctx.db.insert` without prior auth call
3. Check for `v.any()` validators
4. Check for `.collect()` without `.take()`

```bash
# Find potentially unprotected mutations
grep -n "mutation({" src/convex/*.ts | while read line; do
  # Check if requireAuth appears before ctx.db
done
```

## Security Principles Reference

1. **Defense in Depth**: Multiple layers of checks
2. **Server-Side Authority**: Never trust client-side checks alone
3. **Fail Secure**: Deny on uncertainty
4. **Minimal Exposure**: Return only needed data
5. **Audit Trail**: Log sensitive operations

## Module-Specific Rules

| Module | Required Checks |
|--------|-----------------|
| vault | requireAuth, requireHouseholdAccess, checkStorageQuota, requireActiveSubscription |
| financial | requireAuth, requireHouseholdAccess, requireActiveSubscription |
| family | requireAuth, requireHouseholdAccess, checkFamilyMemberLimit, requireActiveSubscription |
| legacy | requireAuth, requireHouseholdAccess, requireSubscriptionTier("legacy") |
| households | requireAuth, requireHouseholdAccess, requireHouseholdAdmin (for writes) |
