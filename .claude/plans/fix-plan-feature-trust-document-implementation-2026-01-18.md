# Fix Plan – feature/trust-document-implementation

**Created**: 2026-01-18
**Review Source**: Code review from 2026-01-18
**Total Issues**: 10 critical, 20 major, 10+ minor

---

## Execution Order

Issues are ordered by: Priority (critical → major) then dependency (foundational fixes first).

Security issues come first as they may affect other code.

---

## 🔴 Critical Issues

### Issue #1: Missing Admin Authorization in sendEmail Action

**File**: `src/convex/adminEmail.ts:1164-1200`
**Area**: Security
**Complexity**: Quick

**Problem**:
The `sendEmail` action only calls `requireAuthInternal` (authentication check) instead of requiring admin role. Any authenticated user can potentially send broadcast emails to all users.

**Fix**:
Create `requireAdminInternal` internalQuery that verifies admin role and use it instead of `requireAuthInternal`.

**Suggested Change**:
```typescript
// In auth.ts, add:
export const requireAdminInternal = internalQuery({
  args: {},
  returns: v.object({ user: v.any(), profile: v.any() }),
  handler: async (ctx) => {
    const result = await requireAuthInternal.handler(ctx, {});
    if (result.profile.role !== "admin") {
      throw new Error("Admin access required");
    }
    return result;
  },
});

// In sendEmail action, replace:
const { user, profile } = await ctx.runQuery(internal.auth.requireAuthInternal);
// With:
const { user, profile } = await ctx.runQuery(internal.auth.requireAdminInternal);
```

- [ ] Not started

---

### Issue #2: Missing Admin Authorization in sendTestEmail Action

**File**: `src/convex/adminEmail.ts:1308-1317`
**Area**: Security
**Complexity**: Quick

**Problem**:
The `sendTestEmail` action only verifies authentication, not admin role. Any authenticated user could send test emails.

**Fix**:
Add admin role verification using the new `requireAdminInternal` internal query before sending.

**Suggested Change**:
```typescript
// Replace requireAuthInternal with requireAdminInternal
const { user, profile } = await ctx.runQuery(internal.auth.requireAdminInternal);
```

- [ ] Not started

---

### Issue #3: useSearchParams Without Suspense in Financial Page

**File**: `src/app/(auth)/(dashboard)/financial/page.tsx`
**Area**: Frontend
**Complexity**: Quick

**Problem**:
`FinancialContent` uses `useSearchParams` but the parent page has no Suspense boundary. This will cause build errors in static export and hydration issues.

**Fix**:
Wrap `<FinancialContent />` in `<Suspense fallback={...}>`.

**Suggested Change**:
```tsx
import { Suspense } from "react";
import { Loader2 } from "lucide-react";

export default function FinancialPage() {
  return (
    <Suspense fallback={<div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>}>
      <FinancialContent />
    </Suspense>
  );
}
```

- [ ] Not started

---

### Issue #4: useSearchParams Without Suspense in Legacy Page

**File**: `src/app/(auth)/(dashboard)/legacy/page.tsx`
**Area**: Frontend
**Complexity**: Quick

**Problem**:
`LegacyContent` uses `useSearchParams` but the parent page has no Suspense boundary. This will cause build errors in static export and hydration issues.

**Fix**:
Wrap `<LegacyContent />` in `<Suspense fallback={...}>`.

**Suggested Change**:
```tsx
import { Suspense } from "react";
import { Loader2 } from "lucide-react";

export default function LegacyPage() {
  return (
    <Suspense fallback={<div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>}>
      <LegacyContent />
    </Suspense>
  );
}
```

- [ ] Not started

---

### Issue #5: Unbounded profiles.collect() in automatedEmails

**File**: `src/convex/automatedEmails.ts:177`
**Area**: Performance
**Complexity**: Moderate

**Problem**:
`ctx.db.query("profiles").collect()` fetches all profiles without pagination. This will cause memory exhaustion as the user base grows.

**Fix**:
Add pagination or use index with filters to limit the result set.

**Suggested Change**:
```typescript
// Option 1: Add pagination
const PAGE_SIZE = 100;
let cursor = null;
const allProfiles = [];

do {
  const page = await ctx.db.query("profiles")
    .withIndex("by_onboardingStatus")
    .paginate({ cursor, numItems: PAGE_SIZE });
  allProfiles.push(...page.page);
  cursor = page.continueCursor;
} while (cursor);

// Option 2: Filter earlier using index
const profiles = await ctx.db.query("profiles")
  .withIndex("by_onboardingStatus", q => q.eq("onboardingStatus", "completed"))
  .collect();
```

- [ ] Not started

---

### Issue #6: N+1 Queries in getAutomatedEmailRecipients Loop

**File**: `src/convex/automatedEmails.ts:209-225`
**Area**: Performance
**Complexity**: Complex

**Problem**:
For each profile, the code makes 3 separate database queries (preferences, membership, household). This results in O(N*3) database calls, severely degrading performance at scale.

**Fix**:
Batch fetch all data upfront, then join in memory.

**Suggested Change**:
```typescript
// Batch fetch all data first
const allPreferences = await ctx.db.query("emailPreferences").collect();
const allMemberships = await ctx.db.query("householdMemberships").collect();
const householdIds = [...new Set(allMemberships.map(m => m.householdId))];
const allHouseholds = await Promise.all(
  householdIds.map(id => ctx.db.get(id))
);

// Create lookup maps
const preferencesMap = new Map(allPreferences.map(p => [p.profileId, p]));
const membershipMap = new Map(allMemberships.map(m => [m.profileId, m]));
const householdMap = new Map(allHouseholds.filter(Boolean).map(h => [h!._id, h]));

// Then iterate profiles and join from maps
for (const profile of profiles) {
  const prefs = preferencesMap.get(profile._id);
  const membership = membershipMap.get(profile._id);
  const household = membership ? householdMap.get(membership.householdId) : null;
  // ... rest of logic
}
```

- [ ] Not started

---

### Issue #7: Duplicate N+1 Pattern in getVaultEmptyRecipients

**File**: `src/convex/automatedEmails.ts:270`
**Area**: Performance
**Complexity**: Moderate

**Problem**:
Same N+1 query pattern as Issue #6, duplicated in a separate function.

**Fix**:
Consolidate with `getAutomatedEmailRecipients` or apply the same batch-fetch pattern.

**Depends on**: Issue #6

- [ ] Not started

---

### Issue #8: Large wizard-step-definitions.ts File (2591 lines)

**File**: `src/app/(auth)/(dashboard)/legacy/components/wizard-step-definitions.ts:1-2591`
**Area**: Code Quality
**Complexity**: Complex

**Problem**:
A 2591-line data file is very hard to maintain, test, and review. Changes to one document type risk breaking others.

**Fix**:
Split into separate files per document type.

**Suggested Structure**:
```
src/app/(auth)/(dashboard)/legacy/components/wizard-steps/
├── index.ts                    # Re-exports all step definitions
├── shared-fields.ts            # Shared field definitions (county, maritalStatus, etc.)
├── will-steps.ts               # Will document steps
├── trust-steps.ts              # Trust document steps
├── healthcare-poa-steps.ts     # Healthcare POA steps
├── financial-poa-steps.ts      # Financial POA steps
├── advance-directive-steps.ts  # Advance directive steps
└── pour-over-will-steps.ts     # Pour-over will steps
```

- [ ] Not started

---

### Issue #9: Large basic-data.ts File (2484 lines)

**File**: `src/lib/state-legal-requirements/basic-data.ts:1-2484`
**Area**: Code Quality
**Complexity**: Complex

**Problem**:
A 2484-line data file with repetitive structure is hard to verify for accuracy and error-prone. Each state has similar structure but manual entry increases error risk.

**Fix**:
Consider generating from a structured source (JSON/YAML) or storing in database. Alternatively, split by region (e.g., `states-a-m.ts`, `states-n-z.ts`).

- [ ] Not started

---

### Issue #10: Large JSX Render Block with Field Type Switching (229 lines)

**File**: `src/app/(auth)/(dashboard)/legacy/components/legal-document-wizard.tsx:437-666`
**Area**: Code Quality
**Complexity**: Moderate

**Problem**:
A 229-line JSX render block with a switch statement for field types violates SRP and OCP. Adding new field types requires modifying the switch statement.

**Fix**:
Extract field renderers into separate components.

**Suggested Change**:
```typescript
// Create field renderer registry
const fieldRenderers: Record<FieldType, React.FC<FieldRendererProps>> = {
  text: TextFieldRenderer,
  textarea: TextareaFieldRenderer,
  select: SelectFieldRenderer,
  checkbox: CheckboxFieldRenderer,
  date: DateFieldRenderer,
  personPicker: PersonPickerFieldRenderer,
  // ... etc
};

// In the wizard component:
const FieldRenderer = fieldRenderers[field.type];
return <FieldRenderer key={field.id} field={field} value={values[field.id]} onChange={handleChange} />;
```

- [ ] Not started

---

## 🟡 Major Issues

### Issue #11: listPublicArticles Lacks Rate Limiting

**File**: `src/convex/articles.ts:134-171`
**Area**: Security
**Complexity**: Quick

**Problem**:
Public query with no auth could be abused for DoS. The limit parameter could potentially be bypassed.

**Fix**:
Enforce maximum limit regardless of client input.

**Suggested Change**:
```typescript
const effectiveLimit = Math.min(args.limit ?? 20, 50); // Cap at 50
```

- [ ] Not started

---

### Issue #12: No Email Format Validation in sendTestEmail

**File**: `src/convex/adminEmail.ts:1312`
**Area**: Security
**Complexity**: Quick

**Problem**:
The `toEmail` parameter accepts any string without validation. Could allow email header injection attempts.

**Fix**:
Add EMAIL_REGEX validation before sending.

**Suggested Change**:
```typescript
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (!EMAIL_REGEX.test(args.toEmail)) {
  throw new Error("Invalid email format");
}
```

- [ ] Not started

---

### Issue #13: setTestSubscriptionTier is Public Mutation

**File**: `src/convex/testing.ts:2401-2481`
**Area**: Security
**Complexity**: Quick

**Problem**:
While protected by TEST_EMAIL_PATTERNS check, this function modifies subscription tier and is exposed as a regular mutation.

**Fix**:
Consider making this an internalMutation or add environment checks.

**Suggested Change**:
```typescript
// Option 1: Make internal
export const setTestSubscriptionTier = internalMutation({ ... });

// Option 2: Add env check
if (process.env.CONVEX_CLOUD_URL?.includes("prod")) {
  throw new Error("Test functions disabled in production");
}
```

- [ ] Not started

---

### Issue #14: filter() After withIndex for Articles

**File**: `src/convex/articles.ts:55-60`
**Area**: Convex
**Complexity**: Moderate

**Problem**:
Uses JavaScript `filter()` after `withIndex`, causing post-query filtering which is inefficient.

**Fix**:
Add composite index `by_status_category_visibility`.

**Suggested Change**:
```typescript
// In schema.ts, update articles table:
.index("by_status_category_visibility", ["status", "category", "visibility"])

// In query:
const articles = await ctx.db.query("articles")
  .withIndex("by_status_category_visibility", q =>
    q.eq("status", "published").eq("category", args.category).eq("visibility", "public")
  )
  .collect();
```

- [ ] Not started

---

### Issue #15: filter() After collect() in getSystemTemplates

**File**: `src/convex/adminEmail.ts:64`
**Area**: Convex
**Complexity**: Quick

**Problem**:
Uses `filter()` after `.collect()` on templates table.

**Fix**:
Add `by_isSystemTemplate_enabled` composite index.

- [ ] Not started

---

### Issue #16: Four Separate collect() Calls in getQueueStats

**File**: `src/convex/adminEmail.ts:482-509`
**Area**: Convex/Performance
**Complexity**: Moderate

**Problem**:
Four separate `.collect()` calls to count queue items by status is inefficient.

**Fix**:
Use a single query and count in memory, or consider a dedicated counter table.

**Suggested Change**:
```typescript
const allEmails = await ctx.db.query("emailQueue").collect();
const stats = {
  pending: allEmails.filter(e => e.status === "pending").length,
  sent: allEmails.filter(e => e.status === "sent").length,
  failed: allEmails.filter(e => e.status === "failed").length,
  scheduled: allEmails.filter(e => e.status === "scheduled").length,
};
```

- [ ] Not started

---

### Issue #17: Admin Email Page Uses "use client" Unnecessarily

**File**: `src/app/(auth)/admin/email/page.tsx:1`
**Area**: Frontend
**Complexity**: Moderate

**Problem**:
Page uses `"use client"` when it could be a Server Component, passing data to child Client Components.

**Fix**:
Remove `"use client"` directive, restructure to pass data to children.

- [ ] Not started

---

### Issue #18: Missing Server-Side Data Fetching for Learn Article Page

**File**: `src/app/(unauth)/learn/[slug]/page.tsx:20`
**Area**: Frontend
**Complexity**: Moderate

**Problem**:
Server page could pre-fetch article data on server for better SEO.

**Fix**:
Fetch article in `generateMetadata` and pass to `ArticleContent`.

- [ ] Not started

---

### Issue #19: Raw `<a>` Tag Instead of Next.js Link

**File**: `src/app/(unauth)/learn/category/[category]/page.tsx:54`
**Area**: Frontend
**Complexity**: Quick

**Problem**:
Uses raw `<a>` tag instead of Next.js `Link` component, missing client-side navigation benefits.

**Fix**:
Replace `<a href="/learn">` with `<Link href="/learn">`.

- [ ] Not started

---

### Issue #20: LearnArticlesSection Fetches 100 Articles on Initial Render

**File**: `src/app/(unauth)/learn/LearnArticlesSection.tsx:115`
**Area**: Frontend/Performance
**Complexity**: Moderate

**Problem**:
Client Component fetches 100 articles on initial render, causing heavy initial load.

**Fix**:
Consider server-side fetching or pagination.

- [ ] Not started

---

### Issue #21: Webhook Payload Uses Unsafe Casts

**File**: `src/convex/http.ts:79-130`
**Area**: Type Safety
**Complexity**: Moderate

**Problem**:
Webhook payload uses `as Record<string,unknown>` casts without runtime validation.

**Fix**:
Add zod validation for runtime payload verification.

- [ ] Not started

---

### Issue #22: Unsafe `as string` Cast in useFormState

**File**: `src/hooks/use-form-state.ts:41`
**Area**: Type Safety
**Complexity**: Quick

**Problem**:
Unsafe `as string` cast in `getInputProps` could cause runtime issues.

**Fix**:
Add generic constraint for string fields only.

- [ ] Not started

---

### Issue #23: Multiple Type Casts in family-unit-detail.tsx

**File**: `src/app/(auth)/(dashboard)/family/components/family-unit-detail.tsx:65-73`
**Area**: Type Safety
**Complexity**: Quick

**Problem**:
Multiple `as Gender`, `as MaritalStatus` casts indicate form state typing could be more precise.

**Fix**:
Define `MemberFormState` with proper union types.

- [ ] Not started

---

### Issue #24: Arbitrary cy.wait() Calls in E2E Tests

**File**: `cypress/e2e/admin-content.cy.ts:89,122` and others
**Area**: Tests
**Complexity**: Moderate

**Problem**:
Arbitrary `cy.wait(2000)` calls create flaky tests.

**Fix**:
Replace with condition checks like `cy.get('[data-testid="..."]').should("exist")`.

- [ ] Not started

---

### Issue #25: Duplicate Field Definitions in wizard-step-definitions

**File**: `src/app/(auth)/(dashboard)/legacy/components/wizard-step-definitions.ts`
**Area**: Code Quality
**Complexity**: Moderate

**Problem**:
Duplicate field definitions (county x6, maritalStatus x3, spouse pattern x4) violate DRY.

**Fix**:
Create shared field templates/factories.

**Depends on**: Issue #8

- [ ] Not started

---

### Issue #26: Too Many Hooks in legal-document-wizard.tsx

**File**: `src/app/(auth)/(dashboard)/legacy/components/legal-document-wizard.tsx:61-214`
**Area**: Code Quality
**Complexity**: Moderate

**Problem**:
Component has 6 useQuery + 4 useMutation + 7 useState hooks, violating SRP.

**Fix**:
Extract data fetching into custom hook (e.g., `useLegalDocumentData`).

**Depends on**: Issue #10

- [ ] Not started

---

## Dependencies

Some fixes depend on others. Recommended order:

1. **#1, #2** → Security fixes (no dependencies, highest priority)
2. **#3, #4** → Frontend Suspense fixes (no dependencies, quick wins)
3. **#11, #12, #13** → Remaining security fixes (no dependencies)
4. **#5** → Performance foundation for #6, #7
5. **#6** → Enables #7
6. **#7** → Depends on #6 pattern
7. **#8** → Enables #25
8. **#10** → Enables #26
9. **#14, #15, #16** → Convex indexes (no dependencies)
10. **#17-#24** → Remaining issues (various dependencies)

---

## Progress Tracking

| Issue | Status | Completed |
|-------|--------|-----------|
| #1 | ✅ Complete | 2026-01-18 |
| #2 | ✅ Complete | 2026-01-18 |
| #3 | ✅ Complete | 2026-01-18 |
| #4 | ✅ Complete | 2026-01-18 |
| #5 | ✅ Complete | 2026-01-18 |
| #6 | ✅ Complete | 2026-01-18 |
| #7 | ✅ Complete | 2026-01-18 |
| #8 | ⏭️ Skipped | Deferred - complex refactoring |
| #9 | ⏭️ Skipped | Deferred - complex refactoring |
| #10 | ⏭️ Skipped | Deferred - complex refactoring |
| #11 | ✅ Complete | 2026-01-18 |
| #12 | ✅ Complete | 2026-01-18 |
| #13 | ✅ Complete | 2026-01-18 |
| #14 | ✅ Complete | 2026-01-18 |
| #15 | ⏭️ Skipped | N/A - filter checks non-null fields, not indexable |
| #16 | ✅ Complete | 2026-01-18 |
| #17 | ⏭️ Skipped | Valid - Tabs component requires client-side state |
| #18 | ⏭️ Skipped | Requires Convex server-side setup - optimization deferred |
| #19 | ✅ Complete | 2026-01-18 |
| #20 | ✅ Complete | 2026-01-18 |
| #21 | ⏭️ Skipped | Defensive validation already present - zod would be overengineering |
| #22 | ✅ Complete | 2026-01-18 |
| #23 | ✅ Complete | 2026-01-18 |
| #24 | ✅ Complete | 2026-01-18 (admin-content.cy.ts improved) |
| #25 | ⏭️ Skipped | Depends on #8 which was deferred |
| #26 | ⏭️ Skipped | Depends on #10 which was deferred |

**Status Legend**: ⬜ Not started | 🔄 In progress | ✅ Complete | ⏭️ Skipped

---

## Commands

To fix issues from this plan:

- Fix all: `/fix-issues`
- Fix specific: `/fix-issues #1`
- Fix by priority: `/fix-issues --critical` or `/fix-issues --major`
