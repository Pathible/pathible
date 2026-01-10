# Fix Plan – feature/trust-document-implementation

**Created**: 2026-01-10
**Review Source**: Code review from 2026-01-10
**Status**: 8 issues completed, 6 skipped, 10 remaining

---

## ⏭️ Skipped Issues

### Issue #2: Unbounded Profile Scan in linkToClerkUser

**File**: `src/convex/profiles.ts:433-458`
**Area**: Security/Performance
**Complexity**: Moderate
**Reason Skipped**: Migration complete - email pattern check is sufficient security

---

### Issue #7: Large Wizard Component (791 lines)

**File**: `src/app/(auth)/(dashboard)/legacy/components/legal-document-wizard.tsx`
**Area**: Code Quality
**Complexity**: Complex
**Reason Skipped**: Complex refactoring - defer to future sprint

---

### Issue #8: PDF Generator Duplication (734 lines)

**File**: `src/app/(auth)/(dashboard)/legacy/components/pdf-generators/advance-directive-pdf-generator.tsx`
**Area**: Code Quality
**Complexity**: Complex
**Reason Skipped**: Complex refactoring - defer to future sprint

---

### Issue #9: Testing Mutations in Production Code

**File**: `src/convex/testing.ts:90-427`
**Area**: Security
**Complexity**: Quick
**Reason Skipped**: Convex env check not applicable; email pattern validation is sufficient

---

### Issue #10: Token Logged in Dev Mode

**File**: `src/convex/onboarding.ts:619-625`
**Area**: Security
**Complexity**: Quick
**Reason Skipped**: Token logging is dev-mode only (intentional for local testing)

---

### Issue #12: Inefficient orderIndex Lookup

**File**: `src/convex/familyEcosystem.ts:295-302`
**Area**: Performance
**Complexity**: Quick
**Reason Skipped**: Small collection (<20 members), collect is acceptable

---

## 🟡 Major Issues (Not Started)

### Issue #13: useRouter Instead of Link

**File**: `src/app/(auth)/(dashboard)/family/components/family-ecosystem-content.tsx:6`
**Area**: Frontend
**Complexity**: Quick

**Problem**:
Using `router.push()` for simple navigation instead of Next.js `Link` component.

**Fix**:
Wrap clickable elements with `Link` component for better performance and accessibility.

```tsx
// Instead of onClick={() => router.push(`/family/${unit._id}`)}
<Link href={`/family/${unit._id}`}>
  <FamilyUnitCard unit={unit} />
</Link>
```

- [ ] Not started

---

### Issue #14: Duplicated DOCUMENT_TYPES

**File**: `src/app/(auth)/(dashboard)/legacy/components/legal-documents-section.tsx:58-106`
**Area**: Code Quality
**Complexity**: Quick

**Problem**:
DOCUMENT_TYPES duplicates definitions from wizard-step-definitions.

**Fix**:
Import from single source of truth.

- [ ] Not started

---

### Issue #15: Duplicated RELATIONSHIP_OPTIONS

**File**: `src/app/(auth)/(dashboard)/family/components/member-form-dialog.tsx:55-68`
**Area**: Code Quality
**Complexity**: Quick

**Problem**:
Relationship options duplicated across multiple files.

**Fix**:
Import RELATIONSHIP_TYPES from commonValidators.ts.

- [ ] Not started

---

### Issue #18: Flaky E2E Tests with cy.wait()

**File**: `cypress/e2e/*.cy.ts`
**Area**: Test Coverage
**Complexity**: Moderate

**Problem**:
11+ arbitrary `cy.wait()` calls causing flaky and slow tests.

**Fix**:
Replace with proper Cypress retry assertions.

**Files with cy.wait()**:
- admin-content.cy.ts: lines 52, 59, 105, 237
- vault.cy.ts: line 58
- legal-documents.cy.ts: line 484
- complete-journey.cy.ts: lines 67, 76, 171, 225, 234

- [ ] Not started

---

## 🟢 Minor Issues (Optional)

### Issue #19: Loading States Return null

**File**: `family-ecosystem-content.tsx:176-178`
**Area**: Frontend
**Complexity**: Quick

**Problem**:
Components return `null` during loading, causing flash.

**Fix**:
Consider skeleton components or loading.tsx files.

- [ ] Not started

---

### Issue #20: Magic Number for maxRetries

**File**: `family-ecosystem-content.tsx:33-34`
**Area**: Code Quality
**Complexity**: Quick

**Problem**:
Magic number `10` for maxRetries should be a named constant.

**Fix**:
Extract to `const MAX_AUTH_RETRIES = 10;`

- [ ] Not started

---

### Issue #21: Memoize getHolographicWillStates

**File**: `src/lib/state-legal-requirements/index.ts:136-137`
**Area**: Performance
**Complexity**: Quick

**Problem**:
Filters 51 states on each call.

**Fix**:
Memoize the result since data is static.

- [ ] Not started

---

### Issue #22: isFieldVisible Recreation

**File**: `legal-document-wizard.tsx:309-312`
**Area**: Performance
**Complexity**: Quick

**Problem**:
Function recreated every render.

**Fix**:
Wrap in `useCallback` with `responses` dependency.

- [ ] Not started

---

### Issue #23: FormDialog Accessibility

**File**: `src/components/ui/form-dialog.tsx`
**Area**: Test Coverage
**Complexity**: Moderate

**Problem**:
No accessibility testing for keyboard navigation.

**Fix**:
Add a11y tests with testing-library.

- [ ] Not started

---

### Issue #24: Placeholder Test Assertions

**File**: `src/lib/__tests__/trust-document.test.ts:1091-1099`
**Area**: Test Coverage
**Complexity**: Quick

**Problem**:
Some tests have `expect(true).toBe(true)` placeholder assertions.

**Fix**:
Replace with actual behavior verification.

- [ ] Not started

---

## Progress Summary

| Category | Count |
|----------|-------|
| ✅ Completed | 8 |
| ⏭️ Skipped | 6 |
| ⬜ Not Started | 10 |

**Completed Issues**: #1, #3, #4, #5, #6, #11, #16, #17

---

## Commands

To fix remaining issues:

- Fix all: `/fix-issues`
- Fix specific: `/fix-issues #13`
- Fix by priority: `/fix-issues --major`
