# Stripe Migration Guide

Migration from Clerk Billing to Stripe for all billing (Planning subscriptions + Executor one-time purchases).

## Architecture

### Previous Flow (Clerk Billing)
```
User -> Clerk PricingTable (iframe) -> Clerk wraps Stripe checkout
  -> Clerk webhook -> syncSubscriptionTier mutation
  -> household.subscriptionTier updated -> feature gating via Convex
```

### New Flow (Stripe Direct)
```
User -> Custom Pricing UI -> Stripe Checkout Session (via API route)
  -> Stripe webhook -> syncSubscriptionFromStripe mutation
  -> household.subscriptionTier updated -> feature gating via Convex (unchanged)
```

### Executor Flow (new)
```
User -> Executor Purchase UI -> Stripe Checkout Session (mode: 'payment')
  -> Stripe webhook -> sets household.executorPurchased = true
```

## Environment Variables

### Convex Dashboard (Settings -> Environment Variables)

| Variable | Description |
|---|---|
| `STRIPE_SECRET_KEY` | Stripe secret key (starts with `sk_test_` or `sk_live_`) |
| `STRIPE_WEBHOOK_SECRET` | Webhook signing secret (starts with `whsec_`) |
| `STRIPE_PRICE_FOUNDATIONS` | Stripe Price ID for Foundations tier |
| `STRIPE_PRICE_HERITAGE` | Stripe Price ID for Heritage tier |
| `STRIPE_PRICE_LEGACY` | Stripe Price ID for Legacy tier |
| `STRIPE_PRICE_FOUNDERS` | Stripe Price ID for Founders tier |
| `STRIPE_PRICE_EXECUTOR` | Stripe Price ID for Executor one-time purchase |

### Next.js (.env.local / Vercel)

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key (starts with `pk_test_` or `pk_live_`) |
| `NEXT_PUBLIC_STRIPE_PRICE_FOUNDATIONS` | Price ID for client-side checkout redirect |
| `NEXT_PUBLIC_STRIPE_PRICE_HERITAGE` | Price ID for client-side checkout redirect |
| `NEXT_PUBLIC_STRIPE_PRICE_LEGACY` | Price ID for client-side checkout redirect |

> **Note:** The `NEXT_PUBLIC_` price IDs are used by the `PricingPlans` component to redirect users to the correct Stripe Checkout session. The Convex-side price IDs are used by the webhook handler to resolve tiers from incoming events.

## Stripe Dashboard Setup

### 1. Create Products & Prices

Create the following in Stripe Dashboard -> Products:

| Product | Type | Price | Interval |
|---|---|---|---|
| Planning - Foundations | Recurring | $9.99 | Monthly |
| Planning - Heritage | Recurring | $19.99 | Monthly |
| Planning - Legacy | Recurring | $39.99 | Monthly |
| Planning - Founders | Recurring | (invite only) | Monthly |
| Executor | One-time | TBD | N/A |

Record each Price ID (starts with `price_`) and set the environment variables above.

### 2. Configure Webhook

In Stripe Dashboard -> Developers -> Webhooks:

- **Endpoint URL:** `https://[your-convex-deployment].convex.site/stripe-webhook`
- **Events to listen for:**
  - `checkout.session.completed`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`
  - `invoice.paid`
  - `invoice.payment_failed`
  - `charge.refunded`

Copy the webhook signing secret and set `STRIPE_WEBHOOK_SECRET` in Convex.

### 3. Configure Customer Portal

In Stripe Dashboard -> Settings -> Billing -> Customer Portal:

- Enable: Update payment method, View invoice history, Cancel subscription
- Optionally enable: Switch plans (if you want portal-based plan changes)
- Set business information and branding

### 4. Enable Stripe Tax (Optional)

In Stripe Dashboard -> Settings -> Tax:

- Enable automatic tax collection
- Configure tax registrations for applicable jurisdictions

## Files Changed

### New Files

| File | Purpose |
|---|---|
| `src/convex/shared/stripeConfig.ts` | Price ID <-> tier mapping, event constants |
| `src/convex/stripe.ts` | Stripe sync mutations (internal) |
| `src/app/api/stripe/create-checkout/route.ts` | Creates Stripe Checkout sessions |
| `src/app/api/stripe/create-portal/route.ts` | Creates Stripe Customer Portal sessions |
| `src/components/pricing-plans.tsx` | Custom pricing cards with Stripe redirect |

### Modified Files

| File | Change |
|---|---|
| `src/convex/schema.ts` | Added `stripeCustomerId`, `stripeSubscriptionId`, `by_stripeCustomerId` index |
| `src/convex/http.ts` | Added `/stripe-webhook` route |
| `src/convex/shared/subscriptionTiers.ts` | Added `priceMonthly`, `priceLabel` to `TIER_DISPLAY` |
| `src/app/(unauth)/pricing/page.tsx` | Replaced Clerk `PricingTable` with `PricingPlans` |
| `src/app/(unauth)/select-plan/page.tsx` | Replaced Clerk `PricingTable` with `PricingPlans` + Portal button |
| `src/app/(unauth)/onboarding/page.tsx` | Uses `useEffectiveSubscription()` instead of Clerk `has()` |
| `src/app/(auth)/layout.tsx` | Uses `getHasActiveSubscription()` instead of Clerk `has()` |
| `src/app/(auth)/(dashboard)/profile-settings/components/subscription-card.tsx` | Removed `@clerk/nextjs/experimental`, uses Convex + Stripe Portal |
| `src/hooks/use-subscription.ts` | Rewritten to use Convex via `useEffectiveSubscription()` |
| `src/components/subscription-debug.tsx` | Uses Convex tier checks instead of Clerk `has()` |
| `src/proxy.ts` | Simplified to auth-only, removed subscription check |
| `src/lib/auth-session.ts` | Replaced `getHasTierOverride()` with `getHasActiveSubscription()` |
| `src/lib/feature-access.ts` | Removed `checkHasActivePlan`, `getCurrentPlanTier`, `checkFeatureAccess`, `checkAnyFeatureAccess` |
| `src/lib/__tests__/feature-access.test.ts` | Rewritten to test tier-based access |

### Clerk Artifacts (kept for transition, remove in Phase 5)

| File | Status |
|---|---|
| `/clerk-webhook` route in `src/convex/http.ts` | Keep running during transition |
| `syncSubscriptionTier` in `src/convex/auth.ts` | Keep for existing Clerk subscribers |
| `src/app/api/webhooks/clerk/route.ts` | Keep (legacy webhook forwarder) |
| `src/app/api/debug/clerk-billing/route.ts` | Keep for debugging |

## How It Works

### Checkout Flow

1. User clicks plan on `/pricing` or `/select-plan`
2. `PricingPlans` component calls `POST /api/stripe/create-checkout` with `priceId` and `mode`
3. API route authenticates via Clerk, gets household from Convex
4. Creates/finds Stripe Customer by email
5. Creates Checkout Session with `metadata: { householdId, clerkUserId, priceId }`
6. User redirected to Stripe-hosted checkout page
7. On success, Stripe fires `checkout.session.completed` webhook
8. Webhook handler calls `handleCheckoutCompleted` mutation
9. Mutation links Stripe customer, sets tier/status on household

### Subscription Management

1. User clicks "Manage Subscription" on profile settings
2. Calls `POST /api/stripe/create-portal`
3. Creates Stripe Customer Portal session
4. User redirected to Stripe-hosted portal
5. Changes trigger `customer.subscription.updated/deleted` webhooks
6. Webhook handler updates Convex household accordingly

### Subscription Gating (unchanged)

All feature gating reads from Convex `household.subscriptionTier` and `household.subscriptionStatus`:

- **Server-side (Convex):** `requireSubscriptionTier()`, `requireFeatureAccess()` in `auth.ts`
- **Client-side (React):** `useEffectiveSubscription()`, `useEffectiveFeatureAccess()` in `feature-access-hooks.ts`
- **Server-side (Next.js):** `getHasActiveSubscription()` in `auth-session.ts`

## Existing User Migration

No forced migration needed:

1. Every existing subscriber already has `subscriptionTier`/`subscriptionStatus` set in Convex
2. Feature gating reads these fields regardless of payment source
3. Clerk Billing uses Stripe under the hood - subscriptions already exist in Stripe
4. Keep Clerk webhook running during transition
5. New users go through Stripe directly
6. Existing users who change plans get routed through Stripe Customer Portal

### Optional: Batch Link Script

To cleanly cut over, batch-link existing Stripe Customer IDs:

1. Use Clerk API to get all users with billing
2. Use Stripe API to find matching customers by email
3. Run Convex mutation to set `stripeCustomerId` on each household
4. After linking, Stripe webhooks fire directly for these subscriptions

## Webhook Event Handling

| Event | Action |
|---|---|
| `checkout.session.completed` | Link Stripe customer, set tier/status or mark executor purchased |
| `customer.subscription.updated` | Map Price ID to tier, update household tier/status |
| `customer.subscription.deleted` | Set status to `cancelled` |
| `invoice.paid` | Set status back to `active` |
| `invoice.payment_failed` | Set status to `past_due` |
| `charge.refunded` | Revoke executor access (one-time) or let subscription events handle |

## Testing

### Local Development with Stripe CLI

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login to Stripe
stripe login

# Forward webhooks to local Convex
stripe listen --forward-to https://[your-convex-deployment].convex.site/stripe-webhook

# Trigger test events
stripe trigger checkout.session.completed
stripe trigger customer.subscription.updated
stripe trigger invoice.payment_failed
```

### Test Cards

| Card Number | Scenario |
|---|---|
| `4242 4242 4242 4242` | Successful payment |
| `4000 0000 0000 3220` | 3D Secure authentication required |
| `4000 0000 0000 0341` | Card declined |
| `4000 0000 0000 9995` | Insufficient funds |

### E2E Tests

`cy.setSubscriptionTier()` still works (directly sets Convex data, bypasses both Clerk and Stripe).

### Manual Testing Checklist

- [ ] New user: signup -> onboard -> select plan -> Stripe checkout -> dashboard access
- [ ] Plan change: settings -> manage subscription -> Stripe Portal -> tier updated
- [ ] Cancel: Stripe Portal -> cancel -> access revoked
- [ ] Failed payment: simulate in Stripe test mode -> past_due status
- [ ] Executor purchase: one-time checkout -> executorPurchased = true
- [ ] Existing Clerk user: continues working with no changes
- [ ] Tier override: admin sets override -> user gets elevated access regardless of Stripe

## Phase 5: Cleanup (When Ready)

Only after confirming no active Clerk-managed subscriptions remain:

1. Remove `/clerk-webhook` route from `src/convex/http.ts`
2. Remove `syncSubscriptionTier` from `src/convex/auth.ts`
3. Delete `src/app/api/webhooks/clerk/route.ts`
4. Delete `src/app/api/debug/clerk-billing/route.ts`
5. Remove `CLERK_WEBHOOK_SECRET` from Convex env vars
6. Disable Clerk Billing in Clerk Dashboard (keep auth config unchanged)
7. Optionally remove `@clerk/nextjs/experimental` if no other experimental features are used
