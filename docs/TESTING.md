# Testing Guide for Pathible

This document provides comprehensive testing instructions for the Pathible application.

## Quick Start

### Prerequisites

- Node.js 20+ installed
- pnpm installed (`npm install -g pnpm`)
- Dependencies installed (`pnpm install`)

### Run Tests in 2 Steps

```bash
# Terminal 1: Start servers
pnpm dev

# Terminal 2: Run tests
pnpm test:e2e:open   # Interactive (recommended)
pnpm test:e2e        # Headless (CI/CD)
```

---

## Test Commands Reference

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start both Next.js and Convex servers |
| `pnpm test:e2e:open` | Open Cypress Test Runner (interactive) |
| `pnpm test:e2e` | Run all tests headlessly |
| `pnpm test:e2e:ci` | Run tests in CI mode |
| `pnpm cypress` | Alias for `test:e2e:open` |

### Running Specific Tests

```bash
# Single test file
npx cypress run --spec "cypress/e2e/auth-basic.cy.ts"

# Single test case (add .only in test file)
it.only('should complete signup flow', () => { ... });

# Skip a test
it.skip('flaky test to fix', () => { ... });
```

---

## Test Architecture

### Directory Structure

```
pathible/
├── cypress/
│   ├── e2e/                    # Test files
│   │   ├── auth-basic.cy.ts    # Basic auth tests (active)
│   │   └── auth-journey.cy.ts.skip  # Full journey tests (disabled)
│   ├── fixtures/               # Test data
│   │   └── users.json          # Test user data
│   ├── support/                # Custom commands and setup
│   │   ├── commands.ts         # Custom Cypress commands
│   │   └── e2e.ts              # Global test configuration
│   └── README.md               # Cypress-specific docs
├── cypress.config.ts           # Cypress configuration
└── docs/TESTING.md             # This file
```

### Test Data

Tests use these accounts:
- **New User**: `newuser@test.pathible.com`
- **Returning User**: `returning@test.pathible.com`
- **OTP Code**: `123456` (deterministic for testing)

---

## Current Test Coverage

### Passing Tests (6/6)

| Test | Description |
|------|-------------|
| Login page elements | Verifies email input, send button, welcome message |
| OTP screen transition | Tests email entry triggers OTP input |
| Back navigation | Tests "Back" button from OTP screen |
| Onboarding form | Verifies first/last name inputs, submit button |
| Dashboard redirect | Unauthenticated users redirected to login |
| Protected routes | Auth guard on protected pages |

### Not Yet Tested

- Complete signup flow with real OTP
- Onboarding form submission
- Sign-out functionality
- Returning user flow (skip onboarding)
- Error handling for invalid OTP

---

## Writing Tests

### Test Structure (AAA Pattern)

```typescript
describe('Feature Name', () => {
  beforeEach(() => {
    // Arrange - set up test state
    cy.clearCookies();
    cy.clearLocalStorage();
  });

  it('should do something specific', () => {
    // Arrange
    cy.visit('/login');

    // Act
    cy.get('[data-testid="email-input"]').type('user@test.com');
    cy.get('[data-testid="send-code-button"]').click();

    // Assert
    cy.contains('Code sent!').should('be.visible');
  });
});
```

### Adding Test IDs

Always add `data-testid` attributes to interactive elements:

```tsx
<Input
  type="email"
  data-testid="email-input"
  onChange={handleChange}
/>

<Button data-testid="send-code-button" onClick={handleSubmit}>
  Send Code
</Button>
```

### Custom Commands

```typescript
// In cypress/support/commands.ts
Cypress.Commands.add('loginWithOtp', (email: string, otp: string) => {
  cy.visit('/login');
  cy.get('[data-testid="email-input"]').type(email);
  cy.get('[data-testid="send-code-button"]').click();
  cy.get('[data-testid="otp-input"]').type(otp);
  cy.url().should('not.include', '/login');
});

// Usage
cy.loginWithOtp('user@test.com', '123456');
```

### Mocking API Calls

```typescript
cy.intercept('POST', '**/api/auth/email-otp/send-verification-otp', {
  statusCode: 200,
  body: { success: true },
}).as('sendOtp');

cy.get('[data-testid="send-code-button"]').click();
cy.wait('@sendOtp');
```

---

## Best Practices

1. **Test user behavior, not implementation**
   ```typescript
   // Good
   cy.get('[data-testid="submit"]').click();
   cy.contains('Success').should('be.visible');

   // Avoid
   cy.window().its('store.auth.isAuthenticated').should('be.true');
   ```

2. **Use proper waiting strategies**
   ```typescript
   // Good
   cy.get('[data-testid="element"]', { timeout: 10000 }).should('be.visible');

   // Avoid
   cy.wait(5000);
   ```

3. **Keep tests independent**
   ```typescript
   beforeEach(() => {
     cy.clearCookies();
     cy.clearLocalStorage();
   });
   ```

4. **Use descriptive test names**
   ```typescript
   // Good
   it('should redirect user to onboarding when profile does not exist', () => {});

   // Avoid
   it('test login', () => {});
   ```

---

## Troubleshooting

### Tests timeout waiting for elements

**Cause**: Next.js server not running or slow Convex queries

**Solution**:
```bash
# Ensure servers are running
pnpm dev

# Increase timeout in cypress.config.ts
defaultCommandTimeout: 15000
```

### OTP verification fails

**Solution**:
- Use test OTP: `123456` (configured in `cypress.config.ts`)
- Check console logs for actual OTP in development mode
- Mock OTP flow with `cy.mockOtpFlow()`

### Element not found

**Solution**:
1. Verify `data-testid` exists in component
2. Check if element is conditionally rendered
3. Wait for page navigation
4. Check element visibility: `.should('be.visible')`

### Flaky tests

**Causes & Solutions**:
- **Race conditions**: Add proper waits with `cy.wait('@apiCall')`
- **State pollution**: Clear state in `beforeEach` hooks
- **Network issues**: Mock API calls with `cy.intercept()`

---

## CI/CD Integration

### GitHub Actions

```yaml
name: E2E Tests

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  cypress:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
        with:
          version: 8
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: pnpm install
      - run: pnpm dev &
      - run: npx wait-on http://localhost:3000
      - run: pnpm test:e2e:ci
        env:
          NEXT_PUBLIC_CONVEX_URL: ${{ secrets.CONVEX_URL }}
          CONVEX_DEPLOYMENT: ${{ secrets.CONVEX_DEPLOYMENT }}
      - uses: actions/upload-artifact@v3
        if: failure()
        with:
          name: cypress-screenshots
          path: cypress/screenshots
```

---

## Test Coverage Summary

| Category | Coverage | Status |
|----------|----------|--------|
| UI Elements | 80% | Good |
| Navigation | 70% | Good |
| Authentication | 40% | Needs Work |
| Authorization | 60% | Needs Work |
| Forms | 50% | Needs Work |
| Error Handling | 20% | Minimal |

---

## Resources

- [Cypress Documentation](https://docs.cypress.io/)
- [Cypress Best Practices](https://docs.cypress.io/guides/references/best-practices)
- [Next.js Testing Guide](https://nextjs.org/docs/testing)
- [Convex Testing Guide](https://docs.convex.dev/production/testing)

---

**Last Updated**: December 2024
