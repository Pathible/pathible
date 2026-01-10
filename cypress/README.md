# Cypress E2E Testing for Pathible

This directory contains end-to-end tests for the Pathible authentication flow using Cypress.

## Directory Structure

```
cypress/
├── e2e/                    # Test files
│   └── auth-journey.cy.ts  # Authentication journey tests
├── fixtures/               # Test data
│   └── users.json         # Test user data
├── support/               # Custom commands and setup
│   ├── commands.ts        # Custom Cypress commands
│   └── e2e.ts            # Global test setup
└── README.md             # This file
```

## Installation

Cypress is already installed as a dev dependency. To ensure everything is set up:

```bash
pnpm install
```

## Running Tests

### Interactive Mode (Recommended for Development)

Open Cypress Test Runner with a visual interface:

```bash
pnpm cypress
# or
pnpm test:e2e:open
```

This will:
1. Open the Cypress Test Runner UI
2. Allow you to select and run individual tests
3. Provide visual feedback and time-travel debugging
4. Auto-reload tests on file changes

### Headless Mode (For CI/CD)

Run all tests in headless mode:

```bash
pnpm test:e2e
# or
pnpm cypress:headless
```

For CI/CD environments:

```bash
pnpm test:e2e:ci
```

## Prerequisites

Before running tests, ensure:

1. **Next.js dev server is running** on `http://localhost:3000`:
   ```bash
   pnpm dev:frontend
   ```

2. **Convex backend is running**:
   ```bash
   pnpm dev:backend
   ```

   Or run both together:
   ```bash
   pnpm dev
   ```

3. **Environment variables are set** (see `.env.local` or `.env.test`)

## Test Journeys

### Journey 1: First-Time User Sign Up
Tests the complete signup flow for a new user:
1. Visit login page
2. Enter email and request OTP
3. Enter OTP code
4. Get redirected to onboarding (no existing profile)
5. Fill in profile form (firstName, lastName)
6. Submit and land on dashboard
7. Verify dashboard shows user name

**Test Cases:**
- ✅ Complete signup flow
- ✅ Invalid OTP code error handling
- ✅ Resend OTP functionality
- ✅ Back button navigation

### Journey 2: Returning User Sign In
Tests login for users with existing profiles:
1. Visit login page
2. Enter email and request OTP
3. Enter OTP code
4. System checks profile exists (true)
5. Redirect directly to dashboard (skip onboarding)
6. Verify dashboard loads immediately

**Test Cases:**
- ✅ Direct login to dashboard
- ✅ Redirect to intended destination after login
- ✅ Prevent authenticated users from accessing login page

### Journey 3: Sign Out Flow
Tests the sign-out process:
1. From dashboard, click user avatar
2. Open dropdown menu
3. Click "Sign Out"
4. Redirect to sign-out page
5. Redirect to login page
6. Verify session is cleared
7. Cannot access protected routes

**Test Cases:**
- ✅ Complete sign-out flow
- ✅ Clear all session data
- ✅ Error handling for sign-out failures

### Journey 4: Protected Route Access
Tests route protection for unauthenticated users:
1. Try to access protected route (e.g., `/dashboard`)
2. Redirect to `/login?redirect=/dashboard`
3. Complete login
4. Redirect back to original destination

**Test Cases:**
- ✅ Redirect to login with redirect parameter
- ✅ Return to original destination after login
- ✅ Protect all auth routes

### Journey 5: Onboarding Prevention
Tests that users with profiles cannot access onboarding:
1. Login as user with existing profile
2. Try to access `/onboarding`
3. Redirect to `/dashboard`
4. Verify onboarding form is not shown

**Test Cases:**
- ✅ Redirect users with profiles away from onboarding
- ✅ Allow only users without profiles to access onboarding

### Additional Test Cases
- ✅ Network error handling
- ✅ Email format validation
- ✅ Required field validation
- ✅ Rapid navigation handling

## Custom Commands

### `cy.loginWithOtp(email, otp)`
Complete login flow with email and OTP.

```typescript
cy.loginWithOtp('user@test.com', '123456');
```

### `cy.createProfile(firstName, lastName)`
Fill in and submit profile form on onboarding page.

```typescript
cy.createProfile('John', 'Doe');
```

### `cy.mockOtpFlow()`
Mock OTP API calls for faster tests.

```typescript
cy.mockOtpFlow();
cy.loginWithOtp('user@test.com', '123456');
```

### `cy.elementExists(selector)`
Check if element exists without failing test.

```typescript
cy.elementExists('[data-testid="profile"]').then(exists => {
  if (exists) {
    // element exists
  }
});
```

### `cy.waitForNavigation(path)`
Wait for navigation and ensure page is loaded.

```typescript
cy.waitForNavigation('/dashboard');
```

### `cy.cleanupTestUser(email)`
Clean up test user data (clears cookies/storage).

```typescript
cy.cleanupTestUser('test@example.com');
```

### `cy.authenticateViaApi(email)`
Directly authenticate via API (bypassing UI).

```typescript
cy.authenticateViaApi('user@test.com');
```

### `cy.verifyAuthenticated()` / `cy.verifyNotAuthenticated()`
Verify authentication state.

```typescript
cy.verifyAuthenticated();
cy.verifyNotAuthenticated();
```

## Test Data

Test users are defined in `cypress/fixtures/users.json`:

```json
{
  "newUser": {
    "email": "newuser@test.pathible.com",
    "firstName": "Test",
    "lastName": "User",
    "otp": "123456"
  },
  "returningUser": {
    "email": "returning@test.pathible.com",
    "firstName": "Returning",
    "lastName": "Tester",
    "otp": "123456"
  }
}
```

## Environment Configuration

Test environment variables are configured in `cypress.config.ts`:

```typescript
env: {
  TEST_OTP: "123456",
  NEW_USER_EMAIL: "newuser@test.pathible.com",
  RETURNING_USER_EMAIL: "returning@test.pathible.com",
}
```

## OTP Testing Strategy

### Development Environment
In development without `RESEND_API_KEY`, OTP codes are logged to the console:

```
[Convex] OTP Code for user@test.com: 123456
```

### Test Environment
For deterministic tests, use the test OTP code: `123456`

You can:
1. **Mock the OTP API** (recommended for speed):
   ```typescript
   cy.mockOtpFlow();
   ```

2. **Use real OTP flow** (for integration testing):
   - Configure test email service
   - Use test OTP code: `123456`

## Test Selectors

All interactive elements have `data-testid` attributes for reliable selection:

### Login Page
- `data-testid="email-input"` - Email input field
- `data-testid="send-code-button"` - Send OTP button
- `data-testid="otp-input"` - OTP input field
- `data-testid="verify-code-button"` - Verify OTP button
- `data-testid="resend-code-button"` - Resend OTP button
- `data-testid="back-to-email-button"` - Back to email button

### Onboarding Page
- `data-testid="first-name-input"` - First name input
- `data-testid="last-name-input"` - Last name input
- `data-testid="submit-profile-button"` - Submit profile button

### Dashboard Page
- `data-testid="dashboard-stats"` - Dashboard statistics section
- `data-testid="user-avatar"` - User avatar
- `data-testid="user-menu-trigger"` - User menu trigger button
- `data-testid="user-menu"` - User dropdown menu
- `data-testid="sign-out-link"` - Sign out link

## Best Practices

### 1. Use Data Test IDs
Always use `data-testid` attributes instead of CSS classes or text content:

```typescript
// Good
cy.get('[data-testid="email-input"]').type('user@test.com');

// Avoid
cy.get('.input-field').first().type('user@test.com');
cy.contains('Email').next().type('user@test.com');
```

### 2. Avoid Hard-Coded Waits
Use Cypress built-in waits instead of `cy.wait(milliseconds)`:

```typescript
// Good
cy.get('[data-testid="otp-input"]', { timeout: 10000 }).should('be.visible');

// Avoid
cy.wait(5000);
cy.get('[data-testid="otp-input"]');
```

### 3. Clean Up Between Tests
Tests should be independent and not rely on previous test state:

```typescript
beforeEach(() => {
  cy.clearCookies();
  cy.clearLocalStorage();
});
```

### 4. Use Custom Commands
Create reusable commands for common operations:

```typescript
// Instead of repeating login steps everywhere
cy.loginWithOtp('user@test.com', '123456');
```

### 5. Test User Experience, Not Implementation
Focus on what users see and do, not internal implementation details:

```typescript
// Good - tests user experience
cy.get('[data-testid="send-code-button"]').click();
cy.contains('Code sent!').should('be.visible');

// Avoid - tests implementation
cy.window().its('store.auth.otpSent').should('equal', true);
```

## Troubleshooting

### Tests Fail with "Timed out retrying"
- Ensure Next.js dev server is running on `http://localhost:3000`
- Check that Convex backend is running
- Verify network requests are not blocked

### OTP Code Not Working
- Check console logs for OTP code (in development)
- Verify test OTP is set to `123456` in `cypress.config.ts`
- Ensure Better Auth is configured correctly

### Tests Pass Locally but Fail in CI
- Increase timeout values in `cypress.config.ts`
- Use `cy.wait()` for API calls to complete
- Check environment variables are set in CI

### Element Not Found
- Verify `data-testid` attributes are present in components
- Check if element is inside a conditional render
- Wait for page navigation to complete before querying

## CI/CD Integration

### GitHub Actions Example

```yaml
name: E2E Tests

on: [push, pull_request]

jobs:
  cypress:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node
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
        run: pnpm dev &

      - name: Wait for servers
        run: npx wait-on http://localhost:3000

      - name: Run Cypress tests
        run: pnpm test:e2e:ci
        env:
          NEXT_PUBLIC_CONVEX_URL: ${{ secrets.CONVEX_URL }}
          CONVEX_DEPLOYMENT: ${{ secrets.CONVEX_DEPLOYMENT }}

      - name: Upload screenshots
        uses: actions/upload-artifact@v3
        if: failure()
        with:
          name: cypress-screenshots
          path: cypress/screenshots
```

## Writing New Tests

When adding new test cases:

1. **Add data-testid to new components**:
   ```tsx
   <button data-testid="new-feature-button">Click Me</button>
   ```

2. **Follow the existing test structure**:
   ```typescript
   describe('Feature Name', () => {
     it('should do something specific', () => {
       // Arrange - set up test state
       cy.visit('/page');

       // Act - perform actions
       cy.get('[data-testid="button"]').click();

       // Assert - verify results
       cy.contains('Success').should('be.visible');
     });
   });
   ```

3. **Add to appropriate journey**:
   - Authentication-related: `auth-journey.cy.ts`
   - New features: Create new test file

4. **Update fixtures if needed**:
   - Add test data to `cypress/fixtures/`

5. **Document in this README**:
   - Add test description
   - List test cases
   - Note any special setup required

## Performance Tips

- Use `cy.intercept()` to mock API calls for faster tests
- Run critical path tests first
- Use `.only` during development to run single tests
- Parallelize test execution in CI/CD

## Further Reading

- [Cypress Documentation](https://docs.cypress.io/)
- [Cypress Best Practices](https://docs.cypress.io/guides/references/best-practices)
- [Next.js Testing](https://nextjs.org/docs/testing)
- [Clerk Documentation](https://clerk.com/docs)
- [Convex Documentation](https://docs.convex.dev/)
