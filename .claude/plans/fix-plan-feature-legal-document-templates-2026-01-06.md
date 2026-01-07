# Fix Plan – feature/legal-document-templates

**Created**: 2026-01-06
**Review Source**: Code review from 2026-01-06
**Total Issues**: 5 critical, 9 major, 6 minor

---

## Execution Order

Issues are ordered by: Priority (critical first), then dependency (security before performance), then complexity (quick wins first).

**Recommended for tonight's release**: Issues #1, #2, #3 (security + critical performance)

---

## 🔴 Critical Issues

### Issue #1: IDOR Vulnerability in importFromKeyContacts

**File**: `src/convex/legalDocuments.ts:715-736`
**Area**: Security
**Complexity**: Quick (5 min)

**Problem**:
The `legacyPlanId` parameter is user-supplied but never validated to belong to the user's household. An attacker in Household A could supply a `legacyPlanId` from Household B and import all their key contacts (names, emails, phones, addresses).

**Fix**:
Add validation that the legacyPlan belongs to the same household before querying key contacts.

**Code Context**:
```typescript
export const importFromKeyContacts = mutation({
  args: {
    householdId: v.id("households"),
    documentId: v.id("legalDocuments"),
    legacyPlanId: v.id("legacyPlans"),  // <-- User-supplied, not validated
  },
  handler: async (ctx, args) => {
    // ... auth checks ...

    // VULNERABILITY: legacyPlanId could belong to a DIFFERENT household
    const keyContacts = await ctx.db
      .query("keyContacts")
      .withIndex("by_legacyPlan", (q) => q.eq("legacyPlanId", args.legacyPlanId))
      .collect();
```

**Suggested Change**:
```typescript
// Add after auth checks, before querying keyContacts:
const legacyPlan = await ctx.db.get(args.legacyPlanId);
if (!legacyPlan || legacyPlan.householdId !== args.householdId) {
  throw new Error("Invalid legacy plan");
}
```

- [ ] Not started

---

### Issue #2: Filter After Index in getEffectiveSubscription (profiles)

**File**: `src/convex/auth.ts:607-611`
**Area**: Performance
**Complexity**: Quick (5 min)

**Problem**:
Using `.filter()` after `.withIndex()` causes a full table scan in memory. This query runs on every page load for authenticated users.

**Fix**:
Remove the filter and check `deletedAt` after retrieval since we're using `.first()` anyway.

**Code Context**:
```typescript
const profile = await ctx.db
  .query("profiles")
  .withIndex("by_userId", (q) => q.eq("userId", user._id))
  .filter((q) => q.eq(q.field("deletedAt"), undefined))  // BAD: filter after index
  .first();
```

**Suggested Change**:
```typescript
const profile = await ctx.db
  .query("profiles")
  .withIndex("by_userId", (q) => q.eq("userId", user._id))
  .first();

// Check deletedAt in code
if (!profile || profile.deletedAt) {
  return null;
}
```

- [ ] Not started

---

### Issue #3: Filter After Index in getEffectiveSubscription (memberships)

**File**: `src/convex/auth.ts:617-622`
**Area**: Performance
**Complexity**: Quick (5 min)

**Problem**:
Same issue - using `.filter()` after `.withIndex()` for membership status check.

**Fix**:
Remove the filter and check `status` after retrieval.

**Code Context**:
```typescript
const membership = await ctx.db
  .query("householdMemberships")
  .withIndex("by_user", (q) => q.eq("userId", profile._id))
  .filter((q) => q.eq(q.field("status"), "active"))  // BAD: filter after index
  .first();
```

**Suggested Change**:
```typescript
const membership = await ctx.db
  .query("householdMemberships")
  .withIndex("by_user", (q) => q.eq("userId", profile._id))
  .first();

// Check status in code
if (!membership || membership.status !== "active") {
  return null;
}
```

- [ ] Not started

---

### Issue #4: Inefficient getByType Query

**File**: `src/convex/legalDocuments.ts:198-206`
**Area**: Performance
**Complexity**: Moderate (15 min)

**Problem**:
Query collects all documents matching household+type, then filters by profileId in JavaScript. This is inefficient for households with multiple users.

**Fix**:
Add compound index or use existing `by_household_and_profile` index and filter by type in JS (fewer docs per user).

**Code Context**:
```typescript
const documents = await ctx.db
  .query("legalDocuments")
  .withIndex("by_household_and_type", (q) =>
    q.eq("householdId", args.householdId).eq("documentType", args.documentType),
  )
  .collect();

// Filter to this user's document
const userDocument = documents.find((doc) => doc.profileId === profile._id);
```

**Suggested Change** (Option A - Code fix):
```typescript
// Use by_household_and_profile index, filter by type in JS
const documents = await ctx.db
  .query("legalDocuments")
  .withIndex("by_household_and_profile", (q) =>
    q.eq("householdId", args.householdId).eq("profileId", profile._id),
  )
  .collect();

const userDocument = documents.find((doc) => doc.documentType === args.documentType);
```

**Suggested Change** (Option B - Add index in schema.ts):
```typescript
// Add new index to legalDocuments table
.index("by_household_profile_type", ["householdId", "profileId", "documentType"])
```

- [ ] Not started

---

### Issue #5: 3340-Line Wizard Component

**File**: `src/app/(auth)/(dashboard)/legacy/components/legal-document-wizard.tsx`
**Area**: Code Quality
**Complexity**: Complex (defer to future sprint)

**Problem**:
Component is 3340 lines (22x recommended size). Contains ~2500 lines of static step configuration data mixed with component logic.

**Fix**:
Extract step configurations to separate files in `/lib/wizard-steps/`.

**Note**: This is a significant refactor. Recommend deferring to a dedicated tech debt sprint after the initial release.

- [ ] Not started (deferred)

---

## 🟡 Major Issues

### Issue #6: Missing householdId Validation in get()

**File**: `src/convex/legalDocuments.ts:163-181`
**Area**: Security
**Complexity**: Quick (5 min)

**Problem**:
The `get()` query checks `document.profileId` but doesn't verify `document.householdId` matches the passed `args.householdId`. While profile ownership provides protection, belt-and-suspenders is safer.

**Suggested Change**:
```typescript
// After getting document
if (!document || document.profileId !== profile._id || document.householdId !== args.householdId) {
  return null;
}
```

- [ ] Not started

---

### Issue #7: No Length Validation on Name Field

**File**: `src/convex/legalDocuments.ts:573`
**Area**: Security
**Complexity**: Quick (5 min)

**Problem**:
Contact name field accepts arbitrary length strings, potential for abuse.

**Suggested Change**:
```typescript
// Add validation at start of handler
if (args.name.length > 200) {
  throw new Error("Name is too long (max 200 characters)");
}
```

- [ ] Not started

---

### Issue #8: window.location.href Instead of router.push()

**File**: `src/app/(auth)/(dashboard)/legacy/documents/[id]/page.tsx:134`
**Area**: Frontend
**Complexity**: Quick (5 min)

**Problem**:
Using `window.location.href` breaks SPA navigation pattern and causes a full page reload.

**Suggested Change**:
```typescript
// Instead of:
window.location.href = "/legacy?tab=legal-documents";

// Use:
router.push("/legacy?tab=legal-documents");
```

- [ ] Not started

---

### Issue #9: DocumentType Duplicated 6 Times

**File**: Multiple files
**Area**: Code Quality (DRY)
**Complexity**: Moderate (30 min)

**Problem**:
`DocumentType` type and `DOCUMENT_TYPES` metadata object are defined in 6+ places, creating synchronization risk.

**Files affected**:
- `src/convex/legalDocuments.ts`
- `src/app/(auth)/(dashboard)/legacy/components/legal-documents-section.tsx`
- `src/app/(auth)/(dashboard)/legacy/components/legal-document-wizard.tsx`
- `src/app/(auth)/(dashboard)/legacy/components/document-preview.tsx`

**Fix**:
Create shared `/lib/legal-document-types.ts` as single source of truth.

- [ ] Not started

---

### Issue #10: Large Static Data File in Client Bundle

**File**: `src/lib/state-legal-requirements.ts`
**Area**: Performance
**Complexity**: Moderate (defer)

**Problem**:
3665-line static data file is imported into client components, adding ~100KB+ to bundle.

**Fix**:
Move to Server Component, API route, or lazy-load per-state data.

**Note**: Defer to future sprint - not blocking for release.

- [ ] Not started (deferred)

---

### Issue #11: Incomplete Type Assertion for Role

**File**: `src/convex/legalDocuments.ts:758`
**Area**: Type Safety
**Complexity**: Quick (10 min)

**Problem**:
`roleMap` only maps 5 roles but schema defines 16. Type assertion hides potential runtime mismatch.

**Fix**:
Complete the roleMap or add default fallback.

- [ ] Not started

---

### Issue #12: Same getByType Issue in create()

**File**: `src/convex/legalDocuments.ts:309-317`
**Area**: Performance
**Complexity**: Quick (5 min)

**Problem**:
Same `.collect()` + JS filter pattern as Issue #4.

**Fix**:
Apply same fix as Issue #4.

- [ ] Not started

---

### Issue #13: 6 Parallel useQuery Calls

**File**: `src/app/(auth)/(dashboard)/legacy/components/legal-document-wizard.tsx:2665-2686`
**Area**: Performance
**Complexity**: Moderate (defer)

**Problem**:
6 separate useQuery calls for different data. Each creates a subscription.

**Note**: The queries use conditional "skip" appropriately. Low priority - defer.

- [ ] Not started (deferred)

---

### Issue #14: Missing Compound Index

**File**: `src/convex/schema.ts:468-502`
**Area**: Convex
**Complexity**: Quick (5 min)

**Problem**:
Missing `by_profile_and_type` index for efficient user+type lookup.

**Note**: Will be addressed by Issue #4 if we add the index there.

- [ ] Not started

---

## 🟢 Minor Issues (Optional)

### Issue #15: State Code Validation

Validate against `US_STATES` list, not just regex.

- [ ] Not started

---

### Issue #16: Incomplete roleMap in importFromKeyContacts

Missing 11 role mappings from keyContacts roles.

- [ ] Not started

---

### Issue #17: Consider loading.tsx for Route

Add route-level loading state file.

- [ ] Not started

---

### Issue #18: Memoize getStepsForDocumentType

Use `useMemo` for step configuration lookup.

- [ ] Not started

---

### Issue #19: Extract Preview Components

Split 1310-line document-preview.tsx into separate files.

- [ ] Not started (deferred)

---

### Issue #20: Use Record<DocumentType, number>

Stricter typing for documentsByType.

- [ ] Not started

---

## Dependencies

Some fixes depend on others. Recommended order:

1. **#1** (IDOR) → No dependencies - **FIX FIRST**
2. **#2** (filter profiles) → No dependencies
3. **#3** (filter memberships) → No dependencies
4. **#6** (householdId validation) → No dependencies
5. **#7** (name length) → No dependencies
6. **#4** (getByType) → Consider with #14 (index)
7. **#12** (create query) → Same as #4
8. **#8** (router.push) → No dependencies
9. **#9** (DRY types) → Affects multiple files, do after critical fixes
10. **#11** (roleMap types) → No dependencies

---

## Progress Tracking

| Issue | Priority | Status         | Completed  |
| ----- | -------- | -------------- | ---------- |
| #1    | Critical | ✅ Complete    | 2026-01-06 |
| #2    | Critical | ✅ Complete    | 2026-01-06 |
| #3    | Critical | ✅ Complete    | 2026-01-06 |
| #4    | Critical | ⬜ Not started | -          |
| #5    | Critical | ⏭️ Deferred    | -          |
| #6    | Major    | ✅ Complete    | 2026-01-06 |
| #7    | Major    | ✅ Complete    | 2026-01-06 |
| #8    | Major    | ⬜ Not started | -          |
| #9    | Major    | ⬜ Not started | -          |
| #10   | Major    | ⏭️ Deferred    | -          |
| #11   | Major    | ⬜ Not started | -          |
| #12   | Major    | ⬜ Not started | -          |
| #13   | Major    | ⏭️ Deferred    | -          |
| #14   | Major    | ⬜ Not started | -          |

**Status Legend**: ⬜ Not started | 🔄 In progress | ✅ Complete | ⏭️ Deferred

---

## Tonight's Release Checklist

For the initial "will-only" release, prioritize:

- [x] **#1**: IDOR vulnerability (MUST FIX) ✅
- [x] **#2**: Filter after index (profiles) ✅
- [x] **#3**: Filter after index (memberships) ✅
- [x] **#6**: householdId validation ✅
- [x] **#7**: Name length validation ✅

All critical security and performance fixes for tonight's release are complete!

---

## Commands

To fix issues from this plan:

- Fix all: `/fix-issues`
- Fix specific: `/fix-issues #1`
- Fix by priority: `/fix-issues --critical`
- Fix tonight's release: `/fix-issues #1 #2 #3 #6 #7`
