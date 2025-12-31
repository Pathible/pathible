#!/bin/bash

# Production Deployment Verification Script
# Run this before deploying to production to catch configuration issues

echo "=== Production Deployment Verification ==="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

ERRORS=0

# Check 1: Verify build:vercel script includes convex deploy
echo "Checking package.json build:vercel script..."
if grep -q '"build:vercel".*convex deploy' package.json; then
    echo -e "${GREEN}✓${NC} build:vercel includes 'convex deploy'"
else
    echo -e "${RED}✗${NC} build:vercel is missing 'convex deploy' - functions won't be deployed!"
    ERRORS=$((ERRORS + 1))
fi

# Check 2: Verify convex auth config exists
echo ""
echo "Checking Convex auth configuration..."
if [ -f "src/convex/auth.config.ts" ]; then
    echo -e "${GREEN}✓${NC} auth.config.ts exists"
    if grep -q "CLERK_JWT_ISSUER_DOMAIN" src/convex/auth.config.ts; then
        echo -e "${GREEN}✓${NC} auth.config.ts uses CLERK_JWT_ISSUER_DOMAIN env var"
    else
        echo -e "${YELLOW}!${NC} auth.config.ts may have hardcoded domain"
    fi
else
    echo -e "${RED}✗${NC} auth.config.ts not found!"
    ERRORS=$((ERRORS + 1))
fi

# Check 3: Local environment check
echo ""
echo "Checking local environment variables..."
if [ -f ".env.local" ]; then
    if grep -q "CLERK_JWT_ISSUER_DOMAIN" .env.local; then
        echo -e "${GREEN}✓${NC} CLERK_JWT_ISSUER_DOMAIN is set locally"
    else
        echo -e "${YELLOW}!${NC} CLERK_JWT_ISSUER_DOMAIN not in .env.local (may be using default)"
    fi
else
    echo -e "${YELLOW}!${NC} No .env.local file found"
fi

# Check 4: Convex config
echo ""
echo "Checking Convex configuration..."
if [ -f "convex.json" ]; then
    echo -e "${GREEN}✓${NC} convex.json exists"
else
    echo -e "${RED}✗${NC} convex.json not found!"
    ERRORS=$((ERRORS + 1))
fi

# Summary
echo ""
echo "=== Summary ==="
if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}All checks passed!${NC}"
    echo ""
    echo "Before deploying, manually verify in dashboards:"
    echo "  1. Vercel: CONVEX_DEPLOY_KEY, CLERK_JWT_ISSUER_DOMAIN are set"
    echo "  2. Convex: CLERK_JWT_ISSUER_DOMAIN matches Clerk issuer"
    echo "  3. Clerk: JWT template 'convex' has correct issuer/audience"
else
    echo -e "${RED}Found $ERRORS error(s) - fix before deploying${NC}"
    exit 1
fi
