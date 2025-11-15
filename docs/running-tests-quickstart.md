# Running Tests - Quick Start Guide

## Prerequisites

Ensure you have:
- Node.js 20+ installed
- pnpm installed (`npm install -g pnpm`)
- Dependencies installed (`pnpm install`)

## 1. Start Development Servers

Open a terminal and run:

```bash
pnpm dev
```

This starts:
- Next.js frontend on `http://localhost:3000`
- Convex backend

**Keep this terminal running** while you run tests.

## 2. Run Tests

### Option A: Interactive Mode (Recommended for Development)

Open a **new terminal** and run:

```bash
pnpm test:e2e:open
```

This opens the Cypress Test Runner where you can:
- Click on `auth-journey.cy.ts` to run tests
- See tests execute in a real browser
- Use time-travel debugging
- Inspect elements and network requests

### Option B: Headless Mode (For CI/CD)

```bash
pnpm test:e2e
```

This runs all tests in the terminal without opening a browser window.

## What to Expect

### Test Output

You should see:
- ✅ 19 tests passing
- Test execution time (~1-2 minutes)
- Green checkmarks for passing tests

### Test Journeys

The test suite covers:
1. **First-Time User Sign Up** (4 tests)
2. **Returning User Sign In** (3 tests)
3. **Sign Out Flow** (3 tests)
4. **Protected Route Access** (3 tests)
5. **Onboarding Prevention** (2 tests)
6. **Edge Cases** (4 tests)

## Common Issues & Solutions

### Issue: "Timed out retrying"
**Solution**: Make sure `pnpm dev` is running on port 3000

### Issue: "Cannot find element"
**Solution**: The test is looking for an element with a specific `data-testid`. Make sure your dev server is running the latest code.

### Issue: "OTP verification failed"
**Solution**: Tests use OTP code `123456`. This is configured in `cypress.config.ts` and should work automatically.

## Running Specific Tests

### Run a single test file:
```bash
npx cypress run --spec "cypress/e2e/auth-journey.cy.ts"
```

### Run a single test case:
In the test file, add `.only`:
```typescript
it.only('should complete full signup flow', () => {
  // test code
});
```

Then run:
```bash
pnpm test:e2e:open
```

## Test Commands Cheat Sheet

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start both Next.js and Convex servers |
| `pnpm test:e2e:open` | Open Cypress Test Runner (interactive) |
| `pnpm test:e2e` | Run all tests headlessly |
| `pnpm cypress` | Alias for `test:e2e:open` |
| `pnpm cypress:headless` | Alias for `test:e2e` |

## Test Data

Tests use these accounts:
- **New User**: `newuser@test.pathible.com` (for signup tests)
- **Returning User**: `returning@test.pathible.com` (for login tests)
- **OTP Code**: `123456` (deterministic for testing)

## Debugging Tests

### In Interactive Mode:
1. Open Cypress Test Runner: `pnpm test:e2e:open`
2. Click on test file to run
3. Hover over test steps to see application state at each step
4. Click elements to inspect in DevTools
5. Use the command log to see what happened

### In Headless Mode:
1. Check terminal output for errors
2. Screenshots are saved to `cypress/screenshots/` on failure
3. Videos are saved to `cypress/videos/` (if enabled)

## CI/CD Integration

For GitHub Actions, add this to `.github/workflows/test.yml`:

```yaml
name: E2E Tests

on: [push, pull_request]

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
```

## Next Steps

1. **Run tests locally** to ensure setup is correct
2. **Review test output** in Cypress Test Runner
3. **Make changes to code** and see tests auto-reload
4. **Add new tests** following patterns in `auth-journey.cy.ts`
5. **Integrate with CI/CD** using the example above

## Getting Help

- 📖 See `cypress/README.md` for detailed Cypress documentation
- 📖 See `TESTING.md` for comprehensive testing guide
- 📖 See `docs/cypress-setup-summary.md` for full setup details
- 🌐 Visit [Cypress Documentation](https://docs.cypress.io/)

## Success!

If all 19 tests pass, your setup is working correctly! 🎉

Now you can:
- Develop with confidence knowing tests cover critical flows
- Make changes and verify nothing breaks
- Add new tests for new features
- Run tests in CI/CD before deployment

---

**Quick Commands Recap**:

```bash
# Terminal 1: Start servers
pnpm dev

# Terminal 2: Run tests
pnpm test:e2e:open  # Interactive
pnpm test:e2e       # Headless
```

Happy Testing! 🚀
