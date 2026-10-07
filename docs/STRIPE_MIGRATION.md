# Stripe billing migration

Clerk remains the identity provider. Login credentials, Clerk user IDs, Convex profiles, household memberships, documents, and estate data do not move. Only the billing lifecycle changes.

Clerk Billing uses Stripe for payment processing, but its plans and subscriptions are **not** Stripe Billing subscriptions. Do not infer a billing identity from an email or assume existing payment methods can be reused. [Clerk billing overview](https://clerk.com/docs/guides/billing/overview).

## Existing accounts

New households start unpaid and without a verified provider. On first protected planning access or checkout, households without a billing provider are verified against the primary contact's current Clerk subscription using the backend API:

- A recognized paid plan becomes Clerk-managed and retains its verified tier and current coverage. A canceled item with an unexpired paid period retains access.
- A household with no paid Clerk items becomes Stripe-managed but inactive. Old synthetic `active` rows do not grant unpaid access.
- Both Clerk and Stripe webhook handlers verify signatures with their SDKs and read current billing state. Failed verification denies access and does not create another subscription.
- Existing Clerk-managed users use Clerk's user profile billing management. Stripe subscription checkout is blocked for them.
- Stripe and Clerk events cannot overwrite a subscription owned by the other provider.

Set `CLERK_SECRET_KEY` on Convex before enabling this reconciliation. Inventory existing subscriptions and verify the tier slugs before rollout; do not disable Clerk webhooks during the transition.

## Recommended paid-account cutover: next renewal

1. Inventory each household's primary contact, Clerk subscription items, tier, paid-through date, outstanding payments, and any already-linked Stripe customer. Resolve duplicates manually.
2. Ask the customer to approve the new Stripe price and billing terms. Tell them whether a new payment method entry is required.
3. Schedule the Clerk subscription to stop renewing at its paid-through date, through Clerk's supported billing management. This code does not cancel live subscriptions.
4. Keep Clerk responsible for entitlement until its paid coverage ends. Do not let a scheduled cancellation start Stripe billing early.
5. After Clerk's lifecycle has ended, an authorized operator runs the internal cutover action, using a real administrator's Clerk user ID:

   ```bash
   pnpm exec convex run stripeActions:finishClerkCutover '{"householdId":"HOUSEHOLD_ID","approvedBy":"ADMIN_CLERK_USER_ID"}'
   ```

   Select the intended deployment explicitly using the CLI's deployment options. This action re-reads Clerk, refuses active/upcoming/past-due or unexpired paid coverage, checks the administrator, and marks the household Stripe-managed and inactive. It never charges or cancels.
6. The customer signs in, completes Stripe Checkout, and receives access only after a verified webhook reconciles the current subscription. Monitor delivery errors and retry failed events.
7. Confirm the new subscription and the end of the old renewal. Retain Clerk billing verification until all legacy households have been reconciled and new-account classification no longer depends on that API. Do not disable it just because known paid accounts have migrated.

This safe manual cutover may leave a brief access gap between coverage ending and new checkout. A seamless automated cutover, credits, price guarantees, and an immediate migration need a separately approved business policy. Do not silently run either billing lifecycle twice.

Retain backups and an inventory. Never delete profiles or households to migrate billing. For old Better Auth profiles, the separate legacy profile-link operation requires a verified matching JWT email; configure `email` and `email_verified` claims in the Clerk Convex JWT template. It is not needed for accounts already using Clerk.

## Configuration

### Convex deployment

| Variable | Required purpose |
| --- | --- |
| `APP_URL` | Exact application origin allowed for checkout/portal return URLs |
| `STRIPE_SECRET_KEY` | Stripe API calls in authenticated Node actions and webhook reconciliation |
| `STRIPE_WEBHOOK_SECRET` | Signature verification |
| `STRIPE_PRICE_FOUNDATIONS`, `STRIPE_PRICE_HERITAGE`, `STRIPE_PRICE_LEGACY` | Approved recurring prices |
| `STRIPE_PRICE_EXECUTOR` | Approved one-time Executor price |
| `STRIPE_PRICE_FOUNDERS` | Optional internal/invitation plan; public checkout rejects it |
| `CLERK_SECRET_KEY` | Authoritative legacy billing verification |
| `CLERK_JWT_ISSUER_DOMAIN` | Clerk authentication issuer |
| `STRIPE_AUTOMATIC_TAX` | Set `true` only after Stripe Tax is configured; defaults off |

The current Stripe SDK is 23.0.0 and its default API version is `2026-09-30.endive`. Configure the webhook endpoint consistently and test before changing API versions. Invoice subscription identity is read from `parent.subscription_details.subscription`.

### Next.js / Vercel

Set `NEXT_PUBLIC_CONVEX_URL`, `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, and the three `NEXT_PUBLIC_STRIPE_PRICE_*` recurring price IDs matching Convex. These routes delegate to authenticated Convex actions, so **Next.js no longer requires a Stripe secret key**. No Stripe.js publishable key is needed for hosted checkout redirects.

Checkout collects and saves customer address/name for tax. Configure Stripe Customer Portal with the approved prices and subscription-update-confirmation flow. There are no automatic seven-day trials; issue controlled promotions if the business wants trials.

### Webhook endpoint

POST `https://DEPLOYMENT.convex.site/stripe-webhook`:

- `checkout.session.completed`
- `checkout.session.async_payment_succeeded`
- `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`
- `invoice.paid`, `invoice.payment_failed`
- `charge.refunded`

Failed asynchronous payments never fulfill access. Each delivery is verified with Stripe's SDK and current API state is fetched before fulfillment. Database receipts and entitlement changes commit together. Missing customer mappings return 500 for Stripe retry. Subscription updates match the tracked subscription; Executor refunds match the exact payment intent and charge. Full refunds revoke Executor; partial refunds do not. A refund received before fulfillment is recorded so replay cannot restore access.

Customer IDs are created idempotently, linked to a household before checkout, and checked against Stripe customer metadata before management. Legacy customer mappings lacking verified household metadata need operator reconciliation; email lookup is not a fallback.

## Verification and deployment gate

Deploy the updated Convex functions to the intended development/test deployment before running the new frontend against it. `Could not find public function for 'stripeActions:reconcileLegacy'` means the frontend and backend are out of sync; it is not evidence of an onboarding or membership problem. Confirm `NEXT_PUBLIC_CONVEX_URL` points to that same deployment. For an explicitly selected development deployment, run `pnpm exec convex dev --once`; production deployment requires operator approval and the release checks below. Generating types alone does not deploy backend functions.

Use Node 24.13+ and pnpm. Generated Convex API files are checked in so PR lint/unit tests do not need production credentials.

```bash
pnpm install --frozen-lockfile
pnpm lint
pnpm test:run
pnpm audit --prod
pnpm audit
pnpm build:ci
pnpm test:e2e
```

For full E2E testing, use a dedicated Clerk development instance, Stripe test mode, and an isolated Convex deployment with the updated functions. Set `TESTING_ENABLED=true` and `TESTING_USER_IDS` to an explicit comma-separated allowlist of test user IDs on that Convex deployment. Its Clerk issuer must be a `*.clerk.accounts.dev` HTTPS origin. Helpers fail closed otherwise; email patterns alone cannot grant privileges.

The current Clerk testing package's browser helpers still use removed Cypress.env APIs. The local adapter uses Cypress 16's `cy.env` for tokens and `Cypress.expose` only for non-secret test configuration. Its upstream Cypress peer range still stops at 15; authenticated flows require explicit verification before release.

Public smoke tests do not need a test account or backend writes:

```bash
CYPRESS_BILLING_SMOKE_ONLY=true pnpm exec cypress run --spec cypress/e2e/billing-public.cy.ts --config baseUrl=http://localhost:3100
```

Run settled/unsettled checkout, cancel/resubscribe, plan change, webhook duplicates/reordering, refund-before-fulfillment, unrelated/partial refunds, owner/viewer billing access, and Clerk cutover in test mode. A production build or unit-test pass is not a substitute for this gate. No production deployment or live account migration has been performed.
