# Testing Guide for Pathible

This document provides comprehensive testing instructions for the Pathible application, focusing on E2E testing with Cypress.

## Table of Contents

1. [Overview](#overview)
2. [Quick Start](#quick-start)
3. [Test Architecture](#test-architecture)
4. [Running Tests](#running-tests)
5. [Test Coverage](#test-coverage)
6. [Writing Tests](#writing-tests)
7. [Troubleshooting](#troubleshooting)
8. [CI/CD Integration](#cicd-integration)

## Overview

Pathible uses **Cypress** for end-to-end testing, focusing on comprehensive journey testing of the authentication flow and user interactions.

### Testing Philosophy

- **Journey-based testing**: Tests follow complete user journeys from start to finish
- **User-centric**: Tests validate what users see and do, not implementation details
- **Deterministic**: Tests produce consistent results with no flakiness
- **Fast feedback**: Tests run quickly with proper mocking and parallel execution

### Test Pyramid

```
       /\
      /  \     E2E Tests (Cypress) - User Journeys
     /----\
    /      \   Integration Tests (Future)
   /--------\
  /          \ Unit Tests (Future)
 /____________\
```

Currently, the focus is on E2E tests covering critical authentication journeys.

## Quick Start

### Prerequisites

1. **Install dependencies**:
   ```bash
   pnpm install
   ```

2. **Start development servers**:
   ```bash
   pnpm dev
   ```
   This starts both Next.js frontend and Convex backend.

### Run Tests

**Interactive mode** (recommended for development):
```bash
pnpm test:e2e:open
```

**Headless mode** (for CI/CD):
```bash
pnpm test:e2e
```

## Test Architecture

### Directory Structure

```
pathible/
├── cypress/
│   ├── e2e/                    # Test files
│   │   └── auth-journey.cy.ts  # Authentication journey tests
│   ├── fixtures/               # Test data
│   │   └── users.json         # Test user data
│   ├── support/               # Custom commands and setup
│   │   ├── commands.ts        # Custom Cypress commands
│   │   └── e2e.ts            # Global test configuration
│   └── README.md              # Cypress-specific documentation
├── cypress.config.ts          # Cypress configuration
├── TESTING.md                 # This file
└── .env.test                  # Test environment variables
```

### Test Organization

Tests are organized by **user journey** rather than by page or component:

- **Journey 1**: First-Time User Sign Up
- **Journey 2**: Returning User Sign In
- **Journey 3**: Sign Out Flow
- **Journey 4**: Protected Route Access
- **Journey 5**: Onboarding Prevention

Each journey contains multiple test cases covering happy paths and edge cases.

## Running Tests

### Development Workflow

1. **Start servers**:
   ```bash
   pnpm dev
   ```

2. **Open Cypress** in interactive mode:
   ```bash
   pnpm test:e2e:open
   ```

3. **Select test file** in the Cypress UI

4. **Watch tests run** with visual feedback

5. **Debug failures** using time-travel debugging

### Available Commands

| Command | Description |
|---------|-------------|
| `pnpm cypress` | Open Cypress Test Runner |
| `pnpm cypress:headless` | Run all tests headlessly |
| `pnpm test:e2e` | Run all tests headlessly |
| `pnpm test:e2e:open` | Open Cypress Test Runner |
| `pnpm test:e2e:ci` | Run tests in CI mode |

### Running Specific Tests

**Run single test file**:
```bash
npx cypress run --spec "cypress/e2e/auth-journey.cy.ts"
```

**Run single test case** (use `.only`):
```typescript
it.only('should complete full signup flow', () => {
  // test code
});
```

**Skip test** (use `.skip`):
```typescript
it.skip('flaky test to fix later', () => {
  // test code
});
```

## Test Coverage

### Authentication Journeys

#### Journey 1: First-Time User Sign Up
✅ **Covered:**
- Complete signup flow (email → OTP → onboarding → dashboard)
- Invalid OTP error handling
- Resend OTP functionality
- Back button navigation from OTP screen

⚠️ **Not Covered:**
- Email delivery (mocked in tests)
- Multiple OTP attempts and rate limiting

#### Journey 2: Returning User Sign In
✅ **Covered:**
- Direct login to dashboard (skip onboarding)
- Redirect to intended destination after login
- Prevent authenticated users from accessing login page

⚠️ **Not Covered:**
- Session persistence across browser restarts
- Remember me functionality (not implemented)

#### Journey 3: Sign Out Flow
✅ **Covered:**
- Complete sign-out process
- Session data cleared
- Error handling for sign-out failures

⚠️ **Not Covered:**
- Sign out from multiple tabs simultaneously

#### Journey 4: Protected Route Access
✅ **Covered:**
- Redirect unauthenticated users to login
- Preserve redirect parameter
- Multiple protected routes

⚠️ **Not Covered:**
- Role-based access control (not implemented)

#### Journey 5: Onboarding Prevention
✅ **Covered:**
- Users with profiles redirected from onboarding
- Only users without profiles can access onboarding

#### Edge Cases
✅ **Covered:**
- Network error handling
- Email format validation
- Rapid navigation
- Empty form submission

## Writing Tests

### Test Structure

Follow the **Arrange-Act-Assert** pattern:

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

**Always add `data-testid` attributes** to interactive elements:

```tsx
// Login page
<Input
  type="email"
  data-testid="email-input"
  onChange={handleChange}
/>

<Button
  data-testid="send-code-button"
  onClick={handleSubmit}
>
  Send Code
</Button>
```

### Custom Commands

Use custom commands for common operations:

```typescript
// Custom command
Cypress.Commands.add('loginWithOtp', (email: string, otp: string) => {
  cy.visit('/login');
  cy.get('[data-testid="email-input"]').type(email);
  cy.get('[data-testid="send-code-button"]').click();
  cy.get('[data-testid="otp-input"]').type(otp);
  cy.url().should('not.include', '/login');
});

// Usage in test
cy.loginWithOtp('user@test.com', '123456');
```

### Mocking API Calls

Use `cy.intercept()` to mock API calls for faster tests:

```typescript
cy.intercept('POST', '**/api/auth/email-otp/send-verification-otp', {
  statusCode: 200,
  body: { success: true },
}).as('sendOtp');

cy.get('[data-testid="send-code-button"]').click();
cy.wait('@sendOtp');
```

### Test Data

Use fixtures for test data:

```typescript
// cypress/fixtures/users.json
{
  "newUser": {
    "email": "newuser@test.pathible.com",
    "firstName": "Test",
    "lastName": "User",
    "otp": "123456"
  }
}

// In test
cy.fixture('users').then((users) => {
  cy.loginWithOtp(users.newUser.email, users.newUser.otp);
});
```

### Best Practices

1. **Test user behavior, not implementation**:
   ```typescript
   // Good
   cy.get('[data-testid="submit-button"]').click();
   cy.contains('Success').should('be.visible');

   // Avoid
   cy.window().its('store.auth.isAuthenticated').should('be.true');
   ```

2. **Use proper waiting strategies**:
   ```typescript
   // Good
   cy.get('[data-testid="element"]', { timeout: 10000 }).should('be.visible');

   // Avoid
   cy.wait(5000);
   ```

3. **Keep tests independent**:
   ```typescript
   beforeEach(() => {
     cy.clearCookies();
     cy.clearLocalStorage();
   });
   ```

4. **Use descriptive test names**:
   ```typescript
   // Good
   it('should redirect user to onboarding when profile does not exist', () => {});

   // Avoid
   it('test login', () => {});
   ```

5. **Avoid hard-coded URLs**:
   ```typescript
   // Good
   cy.visit('/login');

   // Avoid
   cy.visit('http://localhost:3000/login');
   ```

## Troubleshooting

### Common Issues

#### Tests timeout waiting for elements

**Cause**: Next.js server not running or slow Convex queries

**Solution**:
```bash
# Ensure servers are running
pnpm dev

# Increase timeout in cypress.config.ts
defaultCommandTimeout: 15000
```

#### OTP verification fails

**Cause**: Test OTP code doesn't match

**Solution**:
- Use test OTP: `123456` (configured in `cypress.config.ts`)
- Check console logs for actual OTP in development mode
- Mock OTP flow with `cy.mockOtpFlow()`

#### Tests pass locally but fail in CI

**Cause**: Environment differences, timing issues

**Solution**:
- Set environment variables in CI
- Increase timeouts for CI environment
- Use `cy.wait()` for API calls
- Check CI logs for specific errors

#### Element not found

**Cause**: Missing `data-testid` or conditional rendering

**Solution**:
1. Verify `data-testid` exists in component
2. Check if element is conditionally rendered
3. Wait for page navigation: `cy.waitForNavigation('/page')`
4. Check element visibility: `.should('be.visible')`

#### Flaky tests

**Causes & Solutions**:
- **Race conditions**: Add proper waits with `cy.wait('@apiCall')`
- **State pollution**: Clear state in `beforeEach` hooks
- **Network issues**: Mock API calls with `cy.intercept()`
- **Timing issues**: Increase timeouts or use deterministic waits

### Debug Mode

**Run tests with debug output**:
```bash
DEBUG=cypress:* pnpm test:e2e
```

**Use Cypress debugger**:
```typescript
cy.get('[data-testid="element"]').debug();
cy.pause(); // Pause execution
```

**Take screenshots**:
```typescript
cy.screenshot('test-failure');
```

## CI/CD Integration

### GitHub Actions Example

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
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'

      - name: Install pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8

      - name: Install dependencies
        run: pnpm install

      - name: Start dev servers
        run: |
          pnpm dev &
          npx wait-on http://localhost:3000

      - name: Run Cypress tests
        run: pnpm test:e2e:ci
        env:
          NEXT_PUBLIC_CONVEX_URL: ${{ secrets.CONVEX_URL }}
          CONVEX_DEPLOYMENT: ${{ secrets.CONVEX_DEPLOYMENT }}

      - name: Upload screenshots on failure
        uses: actions/upload-artifact@v3
        if: failure()
        with:
          name: cypress-screenshots
          path: cypress/screenshots

      - name: Upload videos on failure
        uses: actions/upload-artifact@v3
        if: failure()
        with:
          name: cypress-videos
          path: cypress/videos
```

### Environment Variables for CI

Set these secrets in your CI/CD platform:

- `NEXT_PUBLIC_CONVEX_URL`
- `NEXT_PUBLIC_CONVEX_SITE_URL`
- `CONVEX_DEPLOYMENT`
- `SITE_URL`

## Future Testing Roadmap

### Short Term
- [ ] Add unit tests for utility functions
- [ ] Add component tests with Cypress Component Testing
- [ ] Increase test coverage for edge cases
- [ ] Add performance testing with Lighthouse CI

### Medium Term
- [ ] Integration tests for Convex functions
- [ ] Visual regression testing with Percy or Chromatic
- [ ] API testing with Cypress
- [ ] Accessibility testing with axe-core

### Long Term
- [ ] Load testing with k6
- [ ] Security testing with OWASP ZAP
- [ ] Cross-browser testing (Firefox, Safari)
- [ ] Mobile testing with Appium

## Resources

- [Cypress Documentation](https://docs.cypress.io/)
- [Cypress Best Practices](https://docs.cypress.io/guides/references/best-practices)
- [Next.js Testing Guide](https://nextjs.org/docs/testing)
- [Convex Testing Guide](https://docs.convex.dev/production/testing)
- [Better Auth Documentation](https://www.better-auth.com/docs)

## Contributing

When adding new features:

1. **Add E2E tests** for user-facing functionality
2. **Add `data-testid` attributes** to interactive elements
3. **Update test documentation** in `cypress/README.md`
4. **Ensure tests pass** before submitting PR
5. **Follow existing test patterns** for consistency

## Support

For testing issues:
1. Check this documentation
2. Review `cypress/README.md` for detailed Cypress info
3. Check Cypress documentation
4. Ask in team chat or create an issue

---

**Last Updated**: 2025-11-11
**Maintained By**: Development Team
