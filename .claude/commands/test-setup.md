# Test Setup Command

Verify and set up the test environment for Cypress E2E testing.

## Arguments

$ARGUMENTS

## Argument Parsing

Arguments are passed via `$ARGUMENTS`. Parse as follows:

| Argument Type | Format | Example |
|---------------|--------|---------|
| Flags | `--flag-name` | `--check`, `--fix`, `--ci` |

**Supported Flags:**

- `--check` - Only verify prerequisites (no fixes)
- `--fix` - Attempt to fix missing dependencies
- `--ci` - Configure for CI/CD environment
- (no flags) - Check and provide recommendations

## Instructions

### Step 1: Check Prerequisites

Run these checks in sequence:

#### 1.1 Node.js Version
```bash
node --version
```
**Required**: Node.js 20+
**Fix if missing**: "Install Node.js 20+ from https://nodejs.org"

#### 1.2 pnpm Installation
```bash
pnpm --version
```
**Required**: pnpm 8+
**Fix**: `npm install -g pnpm`

#### 1.3 Dependencies Installed
```bash
ls node_modules/.bin/cypress 2>/dev/null && echo "Cypress installed" || echo "Missing"
```
**Fix**: `pnpm install`

#### 1.4 Cypress Binary
```bash
npx cypress verify
```
**Fix**: `npx cypress install`

#### 1.5 Environment Variables

Check for required env vars:
- `NEXT_PUBLIC_CONVEX_URL`
- `CONVEX_DEPLOYMENT`

```bash
# Check .env.local exists
test -f .env.local && echo "Found" || echo "Missing"
```

#### 1.6 Development Server Accessibility
```bash
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 2>/dev/null || echo "Not running"
```

### Step 2: Report Status

Output a clear status report:

```
Test Environment Status
=======================
Component          Status    Action Needed
---------          ------    -------------
Node.js 20+        [PASS]    -
pnpm 8+            [PASS]    -
Dependencies       [PASS]    -
Cypress Binary     [FAIL]    Run: npx cypress install
Environment Vars   [PASS]    -
Dev Server         [WARN]    Not running (run: pnpm dev)

Overall: 1 issue to fix before running tests
```

### Step 3: Apply Fixes (if --fix)

If `--fix` flag provided, attempt to resolve issues:

```bash
# Install missing dependencies
pnpm install

# Install Cypress binary if missing
npx cypress install

# Copy env template if missing
test ! -f .env.local && cp .env.local.example .env.local
```

### Step 4: CI Configuration (if --ci)

For CI/CD setup, output:

```yaml
# Recommended GitHub Actions configuration
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
          cache: 'pnpm'
      - run: pnpm install
      - run: pnpm dev &
      - run: npx wait-on http://localhost:3000 --timeout 60000
      - run: pnpm test:e2e:ci
        env:
          NEXT_PUBLIC_CONVEX_URL: ${{ secrets.CONVEX_URL }}
          CONVEX_DEPLOYMENT: ${{ secrets.CONVEX_DEPLOYMENT }}
      - uses: actions/upload-artifact@v3
        if: failure()
        with:
          name: cypress-artifacts
          path: |
            cypress/screenshots
            cypress/videos
```

### Step 5: Quick Start Guide

If all checks pass, output:

```
Ready to Test!
==============

Terminal 1:
  pnpm dev

Terminal 2:
  pnpm test:e2e:open    # Interactive mode
  pnpm test:e2e         # Headless mode

Test Data:
  - Email: newuser@test.pathible.com
  - OTP: 123456

For more info: docs/TESTING.md
```

## Troubleshooting Quick Reference

| Issue | Command |
|-------|---------|
| Cypress cache corrupted | `npx cypress cache clear && npx cypress install` |
| Port 3000 in use | `lsof -i :3000` then `kill -9 <PID>` |
| Convex not synced | `pnpm generate` |
| Stale dependencies | `rm -rf node_modules && pnpm install` |
