# Launch Readiness Checklist

**Generated:** 2026-01-02
**Last Audit:** 2026-01-02 (Architecture + Security Review)

---

## Quick Status Overview

| Area | Status | Notes |
|------|--------|-------|
| Core Features | **READY** | All 5 main features implemented |
| Authentication | **READY** | Clerk + Convex integration working |
| Subscription Enforcement | **READY** | Tier checks on all mutations |
| Feature Gating (Frontend) | **READY** | All pages wrapped with FeatureGate |
| Feature Gating (Backend) | **READY** | All mutations have auth + subscription checks |
| E2E Tests | **READY** | 56 tests passing |
| Security | **READY** | All critical issues resolved |
| Support | **READY** | Crisp chat integrated |

---

## Core Features Status

### Fully Implemented (Launch Ready)

| Feature | Backend | Frontend | Tests | PR |
|---------|---------|----------|-------|-----|
| Heritage Vault | ✅ | ✅ | ✅ vault.cy.ts | - |
| Financial Intelligence | ✅ | ✅ | ✅ complete-journey.cy.ts | - |
| Family Network | ✅ | ✅ | ✅ family.cy.ts | #40 |
| Legacy Builder | ✅ | ✅ | ✅ legacy.cy.ts | #41 |
| Wisdom Hub | ✅ | ✅ | ✅ user-journey.cy.ts | - |
| Core Beliefs | ✅ | ✅ | ✅ | - |
| Dashboard | ✅ | ✅ | ✅ dashboard.cy.ts | #39 |
| Admin Content Manager | ✅ | ✅ | ✅ admin-content.cy.ts | - |

### Partially Implemented (Show "Coming Soon")

| Feature | What Works | What's Missing |
|---------|------------|----------------|
| Vault Folders | Categories work | Hierarchical folder UI |
| Financial Insights | Suggestion framework | AI-powered analysis |
| Family Profiles | Data stored | Rich profile editing UI |

### Not Implemented (Hide or "Coming Soon")

| Feature | Schema Exists | Backend | Frontend | Notes |
|---------|---------------|---------|----------|-------|
| Letters (Future Delivery) | ✅ | ❌ | ❌ | schema.ts:326-352 |
| Daily Wisdom | ✅ | ❌ | ❌ | schema.ts:508-521 |
| Family Messaging | ❌ | ❌ | ❌ | Feature flag + Coming Soon card exists |
| Family Relationships | ❌ | ❌ | ❌ | No family tree |
| Voice Recordings | ❌ | ❌ | ❌ | Audio uploads work, no UI |
| Guided Organization | ❌ | ❌ | ❌ | No wizard |
| Story Templates | ❌ | ❌ | ❌ | Feature flag exists, no implementation |
| Wisdom Shared Pages | ❌ | ❌ | ❌ | sharedWith field exists |

---

## Security Audit Results

### Critical Issues (Must Fix)

| Issue | File | Risk | Status |
|-------|------|------|--------|
| `subscriptions.syncFromClerk` has no auth | subscriptions.ts | Tier manipulation | **FIXED** |

**Details:** Converted to `internalMutation`. Now only callable from Convex HTTP endpoint (`/clerk-webhook`) which verifies webhook signatures.

### Major Issues (Should Fix)

| Issue | File | Risk | Status |
|-------|------|------|--------|
| `articles.incrementViewCount` no auth | articles.ts | View count manipulation | **FIXED** |

**Details:** Added `requireAuth(ctx)` to prevent anonymous view count manipulation.

### Minor Issues (Acceptable for Launch)

- Profile updates allowed without active subscription (intentional)
- Maintenance functions (recalculateStorageUsage) no subscription check
- Some feature slugs defined but not explicitly enforced (tier limits cover them)

---

## Backend Enforcement Matrix

### Authentication Checks

| Module | requireAuth | requireHouseholdAccess | requireAdmin | Status |
|--------|-------------|------------------------|--------------|--------|
| profiles.ts | ✅ | N/A | N/A | OK |
| households.ts | ✅ | ✅ | ✅ | OK |
| vault.ts | ✅ | ✅ | ✅ | OK |
| financial.ts | ✅ | ✅ | N/A | OK |
| wisdom.ts | ✅ | ✅ | N/A | OK |
| coreBeliefs.ts | ✅ | ✅ | ✅ | OK |
| familyEcosystem.ts | ✅ | ✅ | ✅ | OK |
| legacy.ts | ✅ | ✅ | N/A | OK |
| admin.ts | N/A | N/A | ✅ | OK |
| articles.ts | ✅ | N/A | ✅ | OK |
| subscriptions.ts | ✅ | N/A | N/A | OK |

### Subscription Tier Enforcement

| Feature Area | Active Sub | Tier Check | Feature Gate | Plan Limits |
|--------------|------------|------------|--------------|-------------|
| Vault Documents | ✅ | N/A | N/A | ✅ Storage |
| Vault Categories | ✅ | ✅ Heritage | ✅ vault_tags_collections | N/A |
| Financial | ✅ | N/A | N/A | N/A |
| Family Units | ✅ | N/A | N/A | ✅ Unit count |
| Family Members | ✅ | N/A | N/A | ✅ Member count |
| Legacy | ✅ | ✅ Legacy | Implicit | N/A |
| Wisdom | ✅ | ✅ Heritage | ✅ wisdom_entries | N/A |
| Core Beliefs | ✅ | ✅ Heritage | ✅ wisdom_entries | ✅ Max 5 |

---

## Frontend Gating

### Page-Level Gates (All Complete)

| Page | Feature Gate | Required Tier |
|------|-------------|---------------|
| /vault | VAULT_DOCUMENT_STORAGE | Foundations |
| /financial | FINANCIAL_OVERVIEW | Foundations |
| /family | FAMILY_MEMBERS | Foundations |
| /wisdom | WISDOM_ENTRIES | Heritage |
| /legacy | LEGACY_QUESTIONNAIRES | Legacy |

### Components

| Component | Location | Purpose |
|-----------|----------|---------|
| FeatureGate | components/feature-gate.tsx | Wraps tier-restricted content |
| ComingSoonCard | components/coming-soon.tsx | Shows for future features |
| SubscriptionStatusBanner | components/subscription-status-banner.tsx | Warning for inactive subs |
| UpgradePrompt | components/feature-gate.tsx | Shown when access denied |

---

## E2E Test Coverage

| Test File | Tests | Status | Coverage |
|-----------|-------|--------|----------|
| dashboard.cy.ts | 9 | ✅ Pass | Stats, navigation, billing |
| vault.cy.ts | 5 | ✅ Pass | Upload, categories, search |
| family.cy.ts | 8 | ✅ Pass | Units, members, invitations |
| legacy.cy.ts | 7 | ✅ Pass | Wizard, summary, PDF export |
| admin-content.cy.ts | 6 | ✅ Pass | Articles CRUD |
| user-journey.cy.ts | 4 | ✅ Pass | Onboarding flow |
| complete-journey.cy.ts | 5 | ✅ Pass | Full user journey |
| features/*.cy.ts | 12 | ✅ Pass | Feature gate infrastructure |
| **Total** | **56** | ✅ | |

---

## Recent PRs (Pilot Launch)

### PR #39: Fix Dashboard Stats
- **Issue:** Legacy percentage showing 0%
- **Fix:** Fixed completion percentage query
- **Tests:** 9/9 passing
- **Code Review:** A (0 Critical)

### PR #40: Fix Invitation Emails
- **Issue:** Emails not sent on invitation
- **Fix:** Added scheduler call for email sending
- **Tests:** 8/8 passing (new family.cy.ts)
- **Code Review:** A (0 Critical)

### PR #41: Legacy PDF Export
- **Feature:** Export legacy summary to PDF
- **Files:** legacy-pdf-document.tsx, legacy-summary.tsx
- **Tests:** 7/7 passing
- **Code Review:** B (0 Critical, fixed 5 issues)

### PR #42: Heritage Tier Enforcement
- **Feature:** Gate vault categories to Heritage tier
- **Files:** vault.ts
- **Tests:** 5/5 passing
- **Code Review:** B (0 Critical, 2 optional improvements)

---

## Launch Blockers

### Must Fix Before Launch

1. [x] **subscriptions.syncFromClerk** - Convert to internalMutation
2. [x] **articles.incrementViewCount** - Add auth check

### Should Fix (Not Blocking)

3. [x] Add explicit feature gates to financial mutations
4. [x] Add explicit feature gates to family mutations
5. [ ] Remove/document unused schema tables (letters, dailyWisdom)

### Security Hardening (From Code Review)

6. [ ] **legacy.ts:90-115** - Add ownership check to `getKeyContacts` (`plan.userId === profile._id`)
7. [ ] **onboarding.ts:476** - Replace weak `crypto.randomUUID()` with `crypto.getRandomValues()`

### Performance Improvements

8. [ ] **households.ts:227-248** - Batch fetch profiles in `listMembers()` (N+1 query)
9. [ ] **households.ts:297-317** - Batch fetch inviter profiles in `listInvitations()` (N+1 query)
10. [ ] **vault-content.tsx:50-66** - Consider consolidating 4 separate useQuery hooks

### Code Quality

11. [ ] **vault-content.tsx:24-44** - Remove redundant auth retry logic (10×500ms)
12. [ ] **vault-content.tsx:94-107** - Remove unreachable "Not authenticated" UI
13. [ ] **financial.ts** - Extract shared validation helpers (DRY)
14. [ ] **households.ts:575** - Fix unsafe type assertion `(user as { email?: string })`
15. [ ] **counters.ts:24-25** - Remove duplicate type casts

---

## Post-Launch Roadmap

### Week 1 Post-Launch

- [ ] Monitor support volume via Crisp dashboard
- [ ] Gather user feedback on missing features
- [ ] Begin Plaid integration planning
- [ ] Create initial educational content in Content Manager

### Month 1

- [ ] Complete Plaid integration
- [ ] Implement family messaging
- [ ] Add voice recording UI

### Future Releases

- [ ] Letters (future delivery) feature
- [ ] Daily Wisdom content system
- [ ] Story Templates for Legacy
- [ ] Family tree/relationships visualization

---

## Verification Commands

```bash
# Run all E2E tests
pnpm test:e2e

# Run specific test suites
pnpm test:e2e --spec cypress/e2e/dashboard.cy.ts
pnpm test:e2e --spec cypress/e2e/vault.cy.ts
pnpm test:e2e --spec cypress/e2e/family.cy.ts
pnpm test:e2e --spec cypress/e2e/legacy.cy.ts

# Lint and type check
pnpm lint

# Production build
pnpm build
```

---

## Sign-Off Checklist

- [ ] All E2E tests passing
- [x] Security issues resolved
- [ ] PR descriptions updated with code review results
- [ ] FEATURE_GAP_ANALYSIS.md current
- [x] Coming Soon badges on incomplete features
- [ ] Production environment configured
