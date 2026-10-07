# Stripe and Clerk feature branch audit

The branch should not be merged or deployed in its current state. It permits unpaid access, breaks household queries after checkout, creates duplicate subscriptions during plan changes, and does not provide a workable migration for existing Clerk subscribers.

Reviewed on October 6, 2026: `feat/stripe-clerk` at `934d0612b04169d74753997177f6dd940d2f130c`, against freshly fetched `origin/main` at `8c78c5ebd1e311e6246a1d09a41c72d987c14790`. The branch contains two additional commits dated March 7 and April 11, 2026, with 25 changed files, 1,604 insertions, and 589 deletions.

There are 17 branch findings: seven P1 issues and ten P2 issues. Three additional inherited security risks and the dependency audit appear separately below. P1 means resolve before release; P2 means a material correctness, authorization, or verification gap. Confidence scores describe the evidence for the defect, not whether its prerequisites exist in production.

## Scope and verification

The review covers the full branch diff, authentication and subscription enforcement, checkout and portal routes, webhook handling, household schema and query contracts, pricing and onboarding, executor entitlements, migration instructions, package lockfile, and CI. Adjacent checks cover profile migration, administrative bootstrap and test helpers, vault authorization, and document sharing. This is a source and dependency audit, not certification of every application feature or production infrastructure.

Branch source was inspected and tested in `/tmp/pathible-stripe-audit.Kjp0CP`. All source locations below refer to that snapshot. Application code was not changed, and no live subscriptions, accounts, or production records were modified.

| Check | Result |
| --- | --- |
| Frozen dependency installation | Passed using `pnpm install --frozen-lockfile --ignore-scripts` |
| Source formatting and lint | `pnpm exec biome check src cypress scripts` passed across 444 files |
| Unit suite | 1,086 tests passed; 13 failed; another suite could not load. Both affected suites could not resolve the absent Convex generated API |
| Convex code generation | Could not run: `No CONVEX_DEPLOYMENT set` |
| TypeScript and production build | Failed because generated Convex modules are absent; a clean build is not established |
| Offline behavioral reproductions | Confirmed unpaid Legacy entitlement, missing household validator fields, unpaid/unrelated Executor fulfillment, ignored modern invoice payload, obsolete-subscription cancellation, delayed checkout reactivation, unrelated partial-refund revocation, and duplicate processing |
| Webhook signature negative check | Invalid signature rejected with HTTP 400 |
| Browser E2E | Not run: no local server on port 3000 and no configured test deployment in the snapshot |
| Production settings and records | Not inspected: webhook API version, billing catalog, account settings, remaining Clerk subscriptions and legacy profiles, and deployment secrets |

The offline [reproduction harness](/tmp/pathible-stripe-audit.Kjp0CP/audit-repro.cjs) executes the actual TypeScript handlers with mocked Convex persistence and locally signed webhook requests. Run `node /tmp/pathible-stripe-audit.Kjp0CP/audit-repro.cjs` to repeat it. It does not simulate Stripe's hosted checkout or the Convex service's transactional and validation runtime.

## Branch findings

### B01 Unpaid households pass the new subscription gate

**P1, confidence 10/10.** [auth-session.ts:114](/tmp/pathible-stripe-audit.Kjp0CP/src/lib/auth-session.ts:114) accepts `subscription.subscriptionStatus === "active" || subscription.hasOverride`. Existing [households.ts:373](/tmp/pathible-stripe-audit.Kjp0CP/src/convex/households.ts:373) persists the caller's tier and `subscriptionStatus: "active"`; onboarding creates the same synthetic active state.

A fresh user can finish ordinary onboarding and reach the dashboard without purchasing. A caller can also request `subscriptionTier: "legacy"` or `"founders"` through the public household creation mutation. The offline harness confirmed that creation and the effective-subscription query return active Legacy access without a payment. Removing the independent Clerk gate makes this existing database default sufficient for paid access.

Initialize unpaid households as inactive, remove client authority over purchased tiers, and activate access only through verified billing events or explicit administrative grants. Reconcile existing synthetic active records before trusting the database as the billing authority.

### B02 Checkout makes household queries fail return validation

**P1, confidence 10/10.** [stripe.ts:223](/tmp/pathible-stripe-audit.Kjp0CP/src/convex/stripe.ts:223) writes `stripeCustomerId` and, for subscriptions, `stripeSubscriptionId`. [households.ts:96](/tmp/pathible-stripe-audit.Kjp0CP/src/convex/households.ts:96) and line 174 return `...household`, but their `returns: v.object(...)` declarations omit both new fields.

Every linked Stripe household therefore returns properties outside its declared contract. Convex rejects extra object properties, so dashboard household resolution and other consumers fail after successful checkout. The harness inspected the actual validator definitions and confirmed the omissions. [Convex validation documentation](https://docs.convex.dev/functions/validation) specifies this behavior.

Update both return contracts or return an explicit projection that excludes internal billing fields. Test the queries against a household containing both Stripe IDs.

### B03 Switching plans creates a second subscription

**P1, confidence 10/10.** [pricing-plans.tsx:100](/tmp/pathible-stripe-audit.Kjp0CP/src/components/pricing-plans.tsx:100) sends `mode: "subscription"` to Checkout for both new and change modes. [create-checkout/route.ts:114](/tmp/pathible-stripe-audit.Kjp0CP/src/app/api/stripe/create-checkout/route.ts:114) assigns another seven-day trial and creates a new session, without reading or updating the existing subscription.

An active Foundations customer choosing Heritage through “Switch Plan” gets another subscription while the first continues renewing. The UI promises immediate prorated changes, but no subscription update or proration occurs. Repeated checkout also permits repeated trials and multiple billing relationships.

Use a portal subscription-update flow or update the tracked subscription explicitly. Prevent additional planning subscriptions when one already exists, and make Checkout creation resistant to duplicate requests.

### B04 Existing Clerk subscribers lose subscription management

**P1, confidence 10/10.** [subscription-card.tsx:65](/tmp/pathible-stripe-audit.Kjp0CP/src/app/(auth)/(dashboard)/profile-settings/components/subscription-card.tsx:65) replaces Clerk management with `/api/stripe/create-portal`. [STRIPE_MIGRATION.md:175](/tmp/pathible-stripe-audit.Kjp0CP/docs/STRIPE_MIGRATION.md:175) assumes Clerk subscriptions already exist in Stripe Billing.

That assumption is false: Clerk uses Stripe to process payments, but Clerk's plans and subscriptions are not Stripe Billing subscriptions. Existing users cannot cancel or change those subscriptions through the new portal, and purchasing a new Stripe subscription can leave the Clerk lifecycle charging as well. Customer-ID backfill alone cannot migrate it. [Clerk's billing documentation](https://clerk.com/docs/guides/billing/overview) explicitly distinguishes the two systems.

Store the billing provider, retain Clerk management for existing subscribers, and define a real cutover that creates the new subscription and ends the old one. Restrict Clerk and Stripe webhook writes by provider after migration so an old cancellation cannot overwrite the new entitlement.

### B05 Repeated and delayed webhooks restore revoked access

**P1, confidence 10/10.** [http.ts:276](/tmp/pathible-stripe-audit.Kjp0CP/src/convex/http.ts:276) only logs the event ID. [stripe.ts:233](/tmp/pathible-stripe-audit.Kjp0CP/src/convex/stripe.ts:233) and line 246 unconditionally set subscription active or Executor purchased from Checkout completion.

Process cancellation, then a delayed original Checkout completion: access becomes active again. Replaying Executor Checkout after refund similarly restores the purchase. Duplicate delivery repeats analytics and mutations. The harness confirmed delayed reactivation and duplicate processing. Also, subscription sync returns `success: false` when the customer is not linked, but the webhook ignores that result and returns 200, discarding a potentially important event.

Persist event IDs atomically with entitlement updates. Reconcile current subscription/payment state and use purchase identity to prevent stale snapshots from overriding terminal states. Queue or retry unresolved customer mappings. [Stripe documents duplicate events and unordered delivery](https://docs.stripe.com/webhooks).

### B06 Old or unrelated subscriptions control current household access

**P1, confidence 10/10.** [stripe.ts:79](/tmp/pathible-stripe-audit.Kjp0CP/src/convex/stripe.ts:79) locates the household by customer alone, and line 104 overwrites its subscription ID. [http.ts:350](/tmp/pathible-stripe-audit.Kjp0CP/src/convex/http.ts:350) cancels access without passing the deleted subscription ID.

A deletion for an obsolete subscription cancels access belonging to the customer's current paid subscription. Updates for another product can change status even when its price does not map to a planning tier. The harness confirmed cancellation by an obsolete subscription.

Match events to the authorized planning subscription and approved prices. Carry the subscription ID through deletion and invoice processing; deliberately reconcile multiple subscriptions rather than letting the last event win.

### B07 Refund classification revokes unrelated Executor purchases

**P1, confidence 10/10.** [http.ts:389](/tmp/pathible-stripe-audit.Kjp0CP/src/convex/http.ts:389) treats `!charge.invoice` as proof of an Executor payment and revokes by customer ID. No Executor Checkout, PaymentIntent, or charge ID is stored.

A refund of another one-time purchase revokes Executor access. Partial refunds and refunds of older purchases also revoke it. Contemporary Stripe Charge payloads do not expose the assumed invoice relationship, so subscription refunds can enter the same branch. The harness confirmed revocation from a one-cent partial refund on an unrelated payment. API-version impact should be verified against the configured endpoint. See the [Stripe Charge object](https://docs.stripe.com/api/charges/object).

Persist purchase and payment identifiers, resolve the refunded charge to that exact Executor purchase, and apply an explicit partial/full refund policy. Do not assume subscription refunds generate subscription deletion.

### B08 Customer identity is inferred from mutable email

**P2, confidence 10/10.** [create-portal/route.ts:63](/tmp/pathible-stripe-audit.Kjp0CP/src/app/api/stripe/create-portal/route.ts:63) uses `stripe.customers.list({ email, limit: 1 })` and opens the first result. Checkout uses the same lookup at line 72 instead of the household's stored customer ID.

An email change can strand a paying customer's subscription management. Duplicate email records can select the wrong customer. Different household members can produce different customers and overwrite the shared mapping. If a first email can be unverified under the configured Clerk flow, the ownership failure may also permit unauthorized portal access; that configuration was not inspected.

Resolve the persisted household customer after billing authorization. Establish and validate ownership once, use the primary verified email only as contact information, and protect first-time creation against concurrent duplicate requests.

### B09 Any active household member can replace household billing

**P2, confidence 10/10.** [create-checkout/route.ts:60](/tmp/pathible-stripe-audit.Kjp0CP/src/app/api/stripe/create-checkout/route.ts:60) checks only that `getEffectiveSubscription` returns a household. That query accepts active viewers and executors. [stripe.ts:223](/tmp/pathible-stripe-audit.Kjp0CP/src/convex/stripe.ts:223) subsequently replaces the household's customer and subscription association.

A viewer can purchase through their own customer, replace the owner's billing mapping, and then cancel their new subscription to remove shared access while the owner's subscription continues charging.

Require an explicit household billing permission before checkout and portal access. Reuse the household customer, and make completion validate the authorized checkout's household and subscription mapping.

### B10 Any accepted one time price grants Executor access

**P2, confidence 10/10.** [create-checkout/route.ts:41](/tmp/pathible-stripe-audit.Kjp0CP/src/app/api/stripe/create-checkout/route.ts:41) checks only that price and mode are present. [stripe.ts:238](/tmp/pathible-stripe-audit.Kjp0CP/src/convex/stripe.ts:238) grants Executor for every payment-mode completion. The defined `isExecutorPriceId` helper is unused.

If the Stripe catalog contains another cheaper or legacy one-time price, paying for it unlocks Executor. The harness confirmed fulfillment using an unrelated price. The endpoint also lacks a server-side restriction for invite-only planning prices.

Validate an allowlist of price/product/mode combinations on the server and again during fulfillment. Authorize any private plans independently of whether their cards appear in the UI.

### B11 Executor fulfillment does not wait for payment

**P2, confidence 10/10.** [http.ts:302](/tmp/pathible-stripe-audit.Kjp0CP/src/convex/http.ts:302) fulfills Checkout without checking `session.payment_status`. The event list omits asynchronous payment success and failure.

With delayed payment methods enabled, an unpaid completion grants Executor permanently even if settlement fails. The harness confirmed fulfillment of an unpaid session. [Stripe's fulfillment guidance](https://docs.stripe.com/checkout/fulfillment) describes checking payment status and handling delayed settlement.

Fulfill only settled purchases under the intended zero-price policy, handle asynchronous success/failure, and make fulfillment idempotent by purchase identity.

### B12 Invoice handling uses an obsolete relationship field

**P2, confidence 10/10.** [http.ts:362](/tmp/pathible-stripe-audit.Kjp0CP/src/convex/http.ts:362) and line 375 use `if (invoice.subscription)`. The installed Stripe 20.4.1 SDK's Invoice type instead uses `parent.subscription_details.subscription`.

Current-shape invoice payment and failure events return 200 without updating anything. The harness confirmed this. A webhook endpoint pinned to an old API shape can behave differently; the SDK's request version does not set the webhook endpoint's version. See the [Stripe Invoice object](https://docs.stripe.com/api/invoices/object).

Pin and document supported webhook versions, type the event payloads, and extract the proper relationship with intentional legacy compatibility where needed.

### B13 Canceled users cannot select their former plan

**P2, confidence 10/10.** [pricing-plans.tsx:126](/tmp/pathible-stripe-audit.Kjp0CP/src/components/pricing-plans.tsx:126) computes `isCurrentPlan = currentTier === tier` and renders a disabled Current Plan button. [select-plan/page.tsx:127](/tmp/pathible-stripe-audit.Kjp0CP/src/app/(unauth)/select-plan/page.tsx:127) supplies the effective tier even when status is canceled or past due.

Cancellation preserves the tier, so the returning user cannot resume that plan. The normal selection page omits portal access, and protected settings redirect inactive users back to selection.

Disable selection only for an actually active current plan. Provide a subscription repair/resumption portal on the page available to inactive users.

### B14 Pricing sends users to checkout before household setup

**P2, confidence 9/10.** [pricing-plans.tsx:84](/tmp/pathible-stripe-audit.Kjp0CP/src/components/pricing-plans.tsx:84) directs signup toward `/select-plan`. [create-checkout/route.ts:61](/tmp/pathible-stripe-audit.Kjp0CP/src/app/api/stripe/create-checkout/route.ts:61) rejects users without a household, while selection provides no onboarding action. Signed-in users without a household encounter the same error from public pricing.

When the signup redirect is honored, a new customer reaches a dead end: “Please complete onboarding first.” The exact Clerk redirect behavior depends on configuration, but the signed-in no-household path is present regardless.

Check onboarding before initiating checkout, route missing-household users through setup, and preserve their intended plan across signup and onboarding.

### B15 Executor purchases still require a Planning subscription

**P2, confidence 10/10.** [auth/layout.tsx:47](/tmp/pathible-stripe-audit.Kjp0CP/src/app/(auth)/layout.tsx:47) applies `getHasActiveSubscription` to estate routes. The helper considers only Planning status/override. Executor checkout redirects to `/estate`, but fulfillment sets only `executorPurchased`.

An Executor purchaser whose Planning subscription is inactive or canceled gets redirected to `/select-plan` rather than the product they bought. The parent-layout limitation is inherited, but this branch adds payment fulfillment without making the route gate support it.

Use route-specific entitlements so authorized estate users with an Executor purchase can access estate routes independently of Planning billing.

### B16 Billing and entitlement changes have no automated coverage

**P2, confidence 10/10.** [feature-access.test.ts:19](/tmp/pathible-stripe-audit.Kjp0CP/src/lib/__tests__/feature-access.test.ts:19) replaces the prior helpers' tests with pure tier comparisons. No source tests exercise Stripe checkout, portal creation, webhook processing, or `getHasActiveSubscription`. Existing Cypress subscription coverage does not exercise this Stripe implementation.

The passing document and utility tests do not establish billing safety. The new API authorization, fulfillment, migration, and route regressions can pass unnoticed.

Add meaningful tests for unpaid onboarding, member roles, allowed products, duplicate checkout, payment settlement, duplicate/out-of-order events, current webhook shapes, household return validation, canceled-plan recovery, and Clerk migration. Use isolated billing test accounts and a test Convex deployment for E2E verification.

### B17 Deployment guide omits the Next.js Stripe secret

**P2, confidence 10/10.** [STRIPE_MIGRATION.md:41](/tmp/pathible-stripe-audit.Kjp0CP/docs/STRIPE_MIGRATION.md:41) lists only public Stripe values for Next.js/Vercel. Both new routes require `process.env.STRIPE_SECRET_KEY`, but the guide places that key only in Convex.

A deployment configured from the guide returns 500 for every checkout and portal request. `.env.example` and the production verification script also do not cover Stripe's required settings.

Document the server secret in both runtimes, validate required billing configuration before release, and verify that frontend price IDs map to the same approved backend prices. Tax is described as optional while checkout enables it unconditionally; verify the tax configuration and address collection in a real test checkout.

## Inherited security risks

These issues exist on the base branch as well. They should be addressed separately from assigning blame to the Stripe changes.

### A01 Public legacy migration can transfer another user profile

**P1, confidence 10/10; requires remaining legacy profiles.** [profiles.ts:447](/tmp/pathible-stripe-audit.Kjp0CP/src/convex/profiles.ts:447) matches `profile.email === args.email` and line 459 patches that profile's `userId` to the authenticated caller. It never verifies that the supplied email belongs to the caller.

A fresh identity can claim a remaining Better Auth profile by supplying its email, inheriting household memberships and ownership. Make migration internal/admin-only or verify identity ownership through a trusted process. Determine whether any legacy profiles remain; no production records were queried.

### A02 Public test helpers rely on deployment names and email substrings

**P1, confidence 10/10; production exposure depends on deployment URL.** [testing.ts:528](/tmp/pathible-stripe-audit.Kjp0CP/src/convex/testing.ts:528) disables functions only if the URL contains `prod` or a particular production hostname. Line 553 accepts email substrings such as `+e2e_test`, and the function grants a global admin role. Estate test helpers also accept household IDs without normal membership authorization.

On an unblocked deployment, registering a qualifying email can grant administration. The documented current production hostname is blocked, but renaming/replacing a deployment makes this a fragile security boundary. Exclude these public helpers from production or require an explicit default-deny test-only flag and controlled test identities. Convert unauthenticated administrative cleanup helpers to internal functions.

### A03 First admin bootstrap remains publicly callable

**P1, confidence 10/10; requires zero existing admins.** [roles.ts:223](/tmp/pathible-stripe-audit.Kjp0CP/src/convex/roles.ts:223) lets an authenticated profile become admin whenever the admin table contains none.

An empty installation or removal of the last admin allows the next ordinary user to claim the role. Move bootstrap to an internal operational process or an explicit trusted administrator allowlist. Production admin state was not inspected.

## Dependency audit

The October 6 registry scan reported the following advisory counts. They are registry matches, not a count of confirmed exploitable application vulnerabilities. Multiple advisories can affect one package, and the same advisory can affect several packages.

| Scope | Critical | High | Moderate | Low | Total |
| --- | --- | --- | --- | --- | --- |
| Production dependencies | 6 | 37 | 46 | 10 | 99 |
| All dependencies | 7 | 77 | 68 | 11 | 163 |

Most affected versions are inherited from main; the branch adds Stripe 20.4.1. Stripe itself did not appear among the returned advisories.

| Locked package | Material advisory or audit result | Required response |
| --- | --- | --- |
| `@clerk/nextjs` 6.36.7 and `@clerk/shared` 3.42.0 | Critical middleware route-matching advisory; patched Next.js SDK version 6.39.2. Another authorization advisory requires 6.39.3 | Upgrade the SDK and its resolved transitive packages; preserve downstream authorization |
| `next` 16.1.1 | Registry reports RSC DoS, proxy bypass, and later critical image/Windows-specific advisories | Upgrade to a currently supported patched 16.x release and verify deployment-specific reachability |
| `fast-xml-parser` 5.2.5 | Critical entity-processing advisory and multiple related DoS advisories | Upgrade the AWS dependency chain to a patched parser; review untrusted XML reachability |
| `protobufjs` 7.5.4 | Critical code-generation advisory and subsequent related findings through PostHog dependencies | Upgrade the PostHog/transitive chain and assess relevant parsing/code-generation paths |
| `sharp` 0.34.5 | Multiple high advisories in native image dependencies | Upgrade the Next.js/image dependency chain and verify image input exposure |
| `vitest` 4.0.16 | Additional critical advisory in development dependency scope | Upgrade test tooling and avoid exposing its service endpoints |

The [official Clerk advisory](https://github.com/clerk/javascript/security/advisories/GHSA-vqx2-fgx2-5wq9) limits its middleware issue to matching/gating and states that downstream `auth()` and token checks remain effective. This application's public-route exclusion pattern and handler checks mean the package match alone does not demonstrate authentication bypass here. Upgrade remains appropriate; do not interpret the registry's critical label as proof that sessions can be impersonated.

The [complete dependency results](STRIPE_CLERK_DEPENDENCY_AUDIT.json) preserve all returned advisory entries, affected ranges, patched ranges, and dependency paths. The 157 advisory entries produce 163 vulnerability matches because some advisories affect more than one installed package. Reproduce results with `pnpm audit --prod --json` and `pnpm audit --json` from the snapshot. Results can change as advisories are published. Review the individual advisories and resolved dependency paths before choosing overrides or asserting exploitability.

## Release sequence and remaining checks

1. Restore trusted entitlement creation and reconcile synthetic active households. Fix household query return contracts before any Stripe-linked records are introduced.
2. Bind billing to an authorized household/customer/subscription/purchase identity. Add product allowlists and replace plan-change Checkout with actual subscription updates.
3. Make payment fulfillment, cancellation, refunds, and event reconciliation idempotent and compatible with a pinned webhook version.
4. Preserve Clerk management and implement an explicit billing-provider cutover. Inventory existing subscriptions before making migration changes.
5. Repair new-user pricing, canceled-plan recovery, and independent Executor access. The executor marketing currently remains a waitlist, with no client payment-mode checkout call; the documented purchase UI is not implemented.
6. Patch inherited security issues and dependencies, then run complete generated-type checks, a production build, and isolated Stripe/Clerk/Convex E2E flows.

Before release, verify test and live price configuration, server secrets in both runtimes, portal plan-update settings, tax/address behavior, webhook versions and subscriptions, delayed payment methods, duplicate deliveries, rollback/cutover procedures, and the authority of every account that can manage household billing. These checks remain necessary because production infrastructure and live billing records were outside the available verification environment.

The gstack review guidance informed the security, API, migration, and testing passes, and the writing skill organized the report. Review-only scope took precedence over the guidance's automatic fixes and settings changes. No separate outside-provider review was run; the three specialist passes used this session's available agents.

## Remediation status — October 6, 2026

The findings above describe the original feature-branch snapshot. Remediation is implemented on `fix/stripe-clerk-audit` and, with operator approval, deployed to development deployment `quaint-loris-658`. Its Clerk development secret was validated against the configured issuer and added to that deployment. No production deployment or live account migration has been performed. Stripe test configuration remains incomplete.

- B01–B15 and A01–A03 have corresponding entitlement, authorization, billing identity, lifecycle, signature verification, provider ownership, and navigation changes. B16 adds backend/action regression coverage and public browser smoke tests. B17 adds environment verification and the revised [migration runbook](STRIPE_MIGRATION.md).
- Direct libraries were upgraded to registry-latest versions checked during this work, including Next 16.4.0, React 19.3.0, Convex 1.46.0, Clerk Next.js 7.9.11, Stripe 23.0.0, TypeScript 7.0.2, Vitest 5.0.3, and Cypress 16.1.1. Both full and production dependency audits reported zero known vulnerabilities; [updated audit output](STRIPE_CLERK_DEPENDENCY_AUDIT_UPDATED.json) preserves the current result. The original JSON remains historical evidence.
- Verification: 1,143 unit tests passed, lint and both TypeScript checks passed (23 non-blocking optional-chain warnings), the production build passed, and four public Cypress smoke tests passed. Convex browser and Node action bundles were verified without deploying.
- Full authenticated E2E and live payment lifecycle verification remain release blockers: the isolated test credentials/configuration are unavailable. The Clerk testing package's upstream peer range has not yet declared Cypress 16 compatibility; its local adapter still requires authenticated E2E verification.
- New frontend code requires the matching Convex backend deployment. Missing `stripeActions:reconcileLegacy` is a deployment mismatch, not proof of missing onboarding. Checkout/portal routes now distinguish this from generic billing unavailability instead of blaming permissions.
- Before release, inventory existing subscriptions, reconcile legacy customer metadata, validate price/portal/tax/webhook configuration, select an approved cutover policy, and test delayed payments, refunds, plan changes, replay, and provider migration in an isolated environment. No production deployment, live cancellation, account deletion, or migration has been performed.

Current official documentation checked through the repository-required browser skill informed the Stripe API, Clerk reconciliation, and Cypress compatibility changes. Do not interpret local remediation as completion of the infrastructure and authenticated E2E release gates.
