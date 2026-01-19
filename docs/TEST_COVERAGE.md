# Test Coverage Matrix

This document tracks test coverage across all modules in the Pathible application. Updated as tests are added or modified.

Last updated: 2025-01-19

---

## CI/CD Pipeline

### Automated Checks on Every PR

| Check | Trigger | Status |
|-------|---------|--------|
| Lint & Type Check | Every push/PR | ✅ Configured |
| Unit Tests | Every push/PR | ✅ Configured |
| Build | Every push/PR | ✅ Configured |
| E2E Tests | PRs to main | ✅ Configured |

### Pre-commit Hooks (Local)

| Check | Status |
|-------|--------|
| Lint | ✅ Enabled |
| Unit Tests | ✅ Enabled |
| Build | ✅ Enabled |

**GitHub Actions workflow:** `.github/workflows/ci.yml`

---

## Coverage Summary

| Category | Covered | Total | Coverage |
|----------|---------|-------|----------|
| E2E Tests | 16 | 18 | 89% |
| Unit Tests | 17 | 17 | 100% |

---

## E2E Test Coverage

### Core User Flows ✅

| Module | E2E File | Status | Priority |
|--------|----------|--------|----------|
| Dashboard | `cypress/e2e/dashboard.cy.ts` | ✅ Covered | - |
| Vault | `cypress/e2e/vault.cy.ts` | ✅ Covered | - |
| Financial | `cypress/e2e/financial.cy.ts` | ✅ Covered | P0 |
| Wisdom Hub | `cypress/e2e/wisdom.cy.ts` | ✅ Covered | P0 |
| Family | `cypress/e2e/family.cy.ts` | ✅ Covered | - |
| Legal Documents | `cypress/e2e/legal-documents.cy.ts` | ✅ Covered | - |
| Legacy Planning | `cypress/e2e/legacy.cy.ts` | ✅ Covered | - |

### Settings & Configuration ✅

| Module | E2E File | Status | Priority |
|--------|----------|--------|----------|
| Profile Settings | `cypress/e2e/settings/profile-settings.cy.ts` | ✅ Covered | P1 |
| Family Preferences | `cypress/e2e/settings/family-preferences.cy.ts` | ✅ Covered | P1 |

### Admin & Content ✅

| Module | E2E File | Status | Priority |
|--------|----------|--------|----------|
| Admin Content | `cypress/e2e/admin-content.cy.ts` | ✅ Covered | - |
| Public Learn | `cypress/e2e/public-learn.cy.ts` | ✅ Covered | - |

### User Journeys & Flows ✅

| Module | E2E File | Status | Priority |
|--------|----------|--------|----------|
| Complete Journey | `cypress/e2e/complete-journey.cy.ts` | ✅ Covered | - |
| User Journey | `cypress/e2e/user-journey.cy.ts` | ✅ Covered | - |
| Feature Gates | `cypress/e2e/features/feature-gate-infrastructure.cy.ts` | ✅ Covered | - |

### Authentication & Subscription ✅

| Module | E2E File | Status | Priority |
|--------|----------|--------|----------|
| Onboarding Flow | `cypress/e2e/onboarding.cy.ts` | ✅ Covered | P1 |
| Subscription/Billing | `cypress/e2e/subscription.cy.ts` | ✅ Covered | P1 |

### Missing E2E Coverage ❌

| Module | Priority | Notes |
|--------|----------|-------|
| Admin Email Management | P2 | Email compose, templates |
| Admin Tour Management | P2 | Tour CRUD operations |
| Migrate Page | P2 | Data migration flow |

---

## Unit Test Coverage

### Document Templates ✅ (100%)

| Module | Unit Test File | Status |
|--------|----------------|--------|
| Advance Directive | `src/lib/__tests__/advance-directive-document.test.ts` | ✅ Covered |
| Financial POA | `src/lib/__tests__/financial-poa-document.test.ts` | ✅ Covered |
| Healthcare POA | `src/lib/__tests__/healthcare-poa-document.test.ts` | ✅ Covered |
| Pour Over Will | `src/lib/__tests__/pour-over-will-document.test.ts` | ✅ Covered |
| Trust Document | `src/lib/__tests__/trust-document.test.ts` | ✅ Covered |
| Document Templates | `src/lib/__tests__/document-templates.test.ts` | ✅ Covered |

### Core Utilities ✅ (100%)

| Module | Unit Test File | Status |
|--------|----------------|--------|
| Person Utils | `src/lib/__tests__/person-utils.test.ts` | ✅ Covered |
| Person Sync | `src/lib/__tests__/person-sync.test.ts` | ✅ Covered |
| State Legal Reqs | `src/lib/__tests__/state-legal-requirements.test.ts` | ✅ Covered |
| Wizard Init | `src/lib/__tests__/wizard-initialization.test.ts` | ✅ Covered |
| Wizard Steps | `src/lib/__tests__/wizard-steps.test.ts` | ✅ Covered |
| Content Utils | `src/lib/__tests__/content-utils.test.ts` | ✅ Covered |
| Email Queue | `src/lib/__tests__/email-queue.test.ts` | ✅ Covered |

### Feature & Auth ✅ (100%)

| Module | Unit Test File | Status |
|--------|----------------|--------|
| Feature Access | `src/lib/__tests__/feature-access.test.ts` | ✅ Covered |
| Auth Session | `src/lib/__tests__/auth-session.test.ts` | ✅ Covered |

### Hooks ✅ (100%)

| Module | Unit Test File | Status |
|--------|----------------|--------|
| useDialogState | `src/hooks/__tests__/use-dialog-state.test.ts` | ✅ Covered |
| useFormState | `src/hooks/__tests__/use-form-state.test.ts` | ✅ Covered |

---

## Cypress Custom Commands

Located in `cypress/support/commands.ts`:

| Command | Description |
|---------|-------------|
| `cy.elementExists()` | Check if element exists without failing |
| `cy.waitForNavigation()` | Wait for navigation to complete |
| `cy.cleanupTestState()` | Clear cookies, localStorage, sessionStorage |
| `cy.mockUserWithPlan()` | Mock user with specific subscription plan |
| `cy.assertFeatureAccessible()` | Assert feature element is visible |
| `cy.assertFeatureBlocked()` | Assert feature shows upgrade prompt |
| `cy.assertUpgradePromptShown()` | Assert upgrade prompt for feature |
| `cy.resetTestUser()` | Reset test user to clean state |
| `cy.isTestUserClean()` | Check if test user is in clean state |
| `cy.grantAdminRole()` | Grant admin role to test user |
| `cy.cleanupTestArticles()` | Clean up test articles |
| `cy.setSubscriptionTier()` | Set subscription tier for testing |
| `cy.cleanupTestFinancialData()` | Clean up test financial data |
| `cy.cleanupTestWisdomData()` | Clean up test wisdom data |

---

## Test Data Fixtures

Located in `cypress/fixtures/`:

| Fixture | Purpose |
|---------|---------|
| `financial.json` | Test data for financial accounts, properties, insurance |
| `wisdom.json` | Test data for wisdom entries and core beliefs |

---

## Testing Best Practices

### E2E Tests
1. **Use `data-testid` attributes** for reliable element selection
2. **Clean up after tests** using `afterEach` or `after` hooks
3. **Set subscription tier** before testing gated features
4. **Handle onboarding** - ensure user is fully onboarded before testing protected routes

### Unit Tests
1. **Mock external dependencies** (Clerk, Convex)
2. **Use `vi.useFakeTimers()`** for date-dependent tests
3. **Test edge cases** (null, undefined, empty strings)
4. **Test error conditions** and validation

### Test Organization
- E2E tests: `cypress/e2e/<module>.cy.ts`
- Settings E2E: `cypress/e2e/settings/<setting>.cy.ts`
- Unit tests: `src/lib/__tests__/<module>.test.ts`

---

## Running Tests

```bash
# Unit tests (Vitest) - runs in ~1 second
pnpm test

# E2E tests (requires dev server)
pnpm dev &
pnpm test:e2e

# E2E tests with UI
pnpm test:e2e:open
```

---

## Adding New Tests

When adding a new feature:

1. Create E2E test file in appropriate directory
2. Add any needed custom commands to `commands.ts`
3. Create fixtures if test data is needed
4. Update this coverage matrix
5. Run both `pnpm test` and `pnpm test:e2e` to verify

---

## Required GitHub Secrets for CI

For CI to run, these secrets must be configured in **GitHub → Settings → Secrets → Actions**:

| Secret | Description | Where to Get |
|--------|-------------|--------------|
| `CONVEX_DEPLOY_KEY` | Convex API key for codegen | Convex Dashboard → Settings → Deploy Keys |
| `NEXT_PUBLIC_CONVEX_URL` | Convex deployment URL | Convex Dashboard → Settings |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk public key | Clerk Dashboard → API Keys |
| `CLERK_SECRET_KEY` | Clerk secret key | Clerk Dashboard → API Keys |
| `CONVEX_DEPLOYMENT` | Convex deployment name (for E2E) | Format: `dev:project-name` |
| `CYPRESS_TEST_USER_EMAIL` | Test user email for E2E | Your Clerk test user email |
