# Untested Features

This document tracks all features, pages, functions, and components that do not yet have automated tests. Use this as a backlog for improving test coverage.

Last updated: 2025-01-19

---

## Summary

| Category | Tested | Untested | Coverage |
|----------|--------|----------|----------|
| Pages (E2E) | 16 | 15 | 52% |
| Convex Functions | 0 | 28 | 0% |
| Lib Utilities | 9 | 3 | 75% |
| React Hooks | 2 | 3 | 40% |
| API Routes | 0 | 6 | 0% |
| Components | 0 | ~70 | 0% |

---

## Pages Without E2E Tests

### High Priority (User-Facing, Revenue-Critical)

| Page | Route | Risk Level | Notes |
|------|-------|------------|-------|
| ~~Onboarding~~ | `/onboarding` | ✅ Now covered | User activation |
| ~~Select Plan~~ | `/select-plan` | ✅ Now covered | Revenue critical |
| Migrate | `/migrate` | Medium | Data migration |
| Help | `/help` | Low | Support content |

### Admin Pages (Medium Priority)

| Page | Route | Risk Level | Notes |
|------|-------|------------|-------|
| Admin Dashboard | `/admin` | Medium | Admin overview |
| Admin Activity | `/admin/activity` | Low | Activity logs |
| Admin Users List | `/admin/users` | Medium | User management |
| Admin User Detail | `/admin/users/[profileId]` | Medium | Individual user |
| Admin Household | `/admin/users/households/[householdId]` | Medium | Household management |
| Admin Email Dashboard | `/admin/email` | Medium | Email overview |
| Admin Email Compose | `/admin/email/compose` | Medium | Send emails |
| Admin Email Sent | `/admin/email/sent/[emailId]` | Low | View sent emails |
| Admin Email Templates | `/admin/email/templates/[templateId]` | Low | Template management |
| Admin Email New Template | `/admin/email/templates/new` | Low | Create templates |
| Admin Tours Dashboard | `/admin/tours` | Low | Tour management |
| Admin Tour Detail | `/admin/tours/[tourId]` | Low | Edit tours |
| Admin Tour Preview | `/admin/tours/[tourId]/preview` | Low | Preview tours |

### Public Pages (Low Priority)

| Page | Route | Risk Level | Notes |
|------|-------|------------|-------|
| Privacy Policy | `/privacy` | Low | Static legal |
| Terms of Service | `/terms` | Low | Static legal |
| Sign Out | `/sign-out` | Low | Simple redirect |

---

## Convex Functions Without Unit Tests

### Critical (Auth & Data Integrity)

| File | Functions | Priority | Notes |
|------|-----------|----------|-------|
| `auth.ts` | `requireAuth`, `getProfile` | P0 | Auth security |
| `onboarding.ts` | `updateProfile`, `createFirstHousehold`, `setPreferences` | P0 | User activation |
| `households.ts` | CRUD operations | P1 | Core entity |
| `profiles.ts` | CRUD operations | P1 | Core entity |

### Important (Feature Functions)

| File | Functions | Priority | Notes |
|------|-----------|----------|-------|
| `vault.ts` | File operations | P1 | File storage |
| `vaultActions.ts` | Upload/download actions | P1 | File handling |
| `wisdom.ts` | CRUD operations | P1 | Wisdom module |
| `coreBeliefs.ts` | CRUD operations | P1 | Core beliefs |
| `financial.ts` | CRUD operations | P1 | Financial module |
| `legacy.ts` | CRUD operations | P1 | Legacy planning |
| `legalDocuments.ts` | Document generation | P1 | Legal docs |
| `familyEcosystem.ts` | Family management | P2 | Family units |
| `persons.ts` | Person management | P2 | Person data |

### Admin Functions (Lower Priority)

| File | Functions | Priority | Notes |
|------|-----------|----------|-------|
| `admin.ts` | Admin operations | P2 | Admin-only |
| `adminEmail.ts` | Email management | P2 | Admin email |
| `tours.ts` | Tour CRUD | P2 | Product tours |
| `articles.ts` | Content management | P2 | Learning content |
| `roles.ts` | Role management | P2 | User roles |

### Infrastructure (Can Skip)

| File | Functions | Priority | Notes |
|------|-----------|----------|-------|
| `crons.ts` | Scheduled jobs | P3 | Internal |
| `emailQueue.ts` | Queue processing | P3 | Already unit tested |
| `automatedEmails.ts` | Email automation | P3 | Internal |
| `http.ts` | HTTP routes | P3 | Internal |
| `testing.ts` | Test helpers | P3 | Test infrastructure |

---

## Lib Utilities Without Unit Tests

| File | Functions | Priority | Notes |
|------|-----------|----------|-------|
| `utils.ts` | `cn()` helper | P3 | Trivial utility |
| `email-utils.ts` | Email formatting | P2 | Email helpers |
| `feature-access-hooks.ts` | `useFeatureAccess`, etc. | P2 | React hooks |
| `seo-config.ts` | SEO configuration | P3 | Configuration only |

---

## React Hooks Without Unit Tests

| Hook | File | Priority | Notes |
|------|------|----------|-------|
| `useMobile` | `use-mobile.ts` | P3 | Simple media query |
| `useAuthenticatedHousehold` | `use-authenticated-household.ts` | P1 | Auth + data |
| `useSubscription` | `use-subscription.ts` | P1 | Subscription state |

---

## API Routes Without Tests

| Route | File | Priority | Notes |
|-------|------|----------|-------|
| `/api/test` | `test/route.ts` | P3 | Debug only |
| `/api/vault/delete` | `vault/delete/route.ts` | P1 | File deletion |
| `/api/vault/download-url` | `vault/download-url/route.ts` | P1 | File access |
| `/api/vault/upload-url` | `vault/upload-url/route.ts` | P1 | File upload |
| `/api/debug/clerk-billing` | `debug/clerk-billing/route.ts` | P3 | Debug only |
| `/api/webhooks/clerk` | `webhooks/clerk/route.ts` | P1 | Clerk integration |

---

## Components Without Tests

Components are tested implicitly through E2E tests. Unit testing components is lower priority unless they contain complex logic.

### High-Logic Components (Consider Unit Testing)

| Component | File | Notes |
|-----------|------|-------|
| `feature-gate.tsx` | Feature gating logic | Complex conditional rendering |
| `person-picker.tsx` | Person selection | Form logic |
| `beneficiary-list.tsx` | List management | CRUD operations |
| `app-sidebar.tsx` | Navigation logic | Routing |

### UI Components (Skip Unit Tests)

All `src/components/ui/*` components are shadcn/ui primitives - already well-tested upstream.

### Marketing Components (Skip Unit Tests)

All `src/components/marketing/*` are purely presentational.

---

## Recommended Test Priorities

### Phase 1: Critical Path (P0) - Do Now

1. ~~Onboarding E2E~~ ✅ Done
2. ~~Subscription E2E~~ ✅ Done
3. Convex auth functions unit tests
4. Vault API routes tests

### Phase 2: Important (P1) - Next Sprint

1. Admin users E2E tests
2. Convex core entity unit tests (households, profiles, vault)
3. `useAuthenticatedHousehold` hook tests
4. `useSubscription` hook tests

### Phase 3: Nice to Have (P2) - When Time Permits

1. Admin email E2E tests
2. Admin tours E2E tests
3. Remaining Convex function tests
4. Email utility tests

### Phase 4: Low Priority (P3) - Skip Unless Broken

1. Static pages (privacy, terms)
2. Debug routes
3. Trivial utilities (`cn()`, `useMobile`)
4. Purely presentational components

---

## How to Use This Document

1. **Before starting new feature**: Check if related code has tests
2. **When fixing bugs**: Add regression test, mark item as tested
3. **During refactoring**: Ensure tests exist before changing code
4. **Sprint planning**: Use P0/P1 items as backlog

### Marking Items as Tested

When adding tests, update this document:
1. ~~Strike through~~ the item
2. Add "✅ Done" or link to test file
3. Update the coverage percentages

---

## Test File Naming Conventions

| Type | Location | Naming |
|------|----------|--------|
| E2E | `cypress/e2e/` | `<module>.cy.ts` |
| E2E Settings | `cypress/e2e/settings/` | `<setting>.cy.ts` |
| Unit | `src/lib/__tests__/` | `<module>.test.ts` |
| Hook | `src/hooks/__tests__/` | `<hook>.test.ts` |
| Convex | `src/convex/__tests__/` | `<module>.test.ts` |
