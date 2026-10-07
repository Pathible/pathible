# Growth and maintenance fixes — 6 October 2026

Status: implemented on `jamesvgibbs/audit-organic-growth`; development backend synced on 7 October, production not deployed. The original findings remain in `PATHIBLE_GROWTH_AUDIT_2026_10_06.md` as a record of production at audit time.

## Changes

- Public article HTML, titles, descriptions, and sitemap entries now use the same published Convex records. Subscriber-only articles stay private. Deleted or nonexistent articles use `notFound()`.
- The homepage now starts with a concrete family action and three practical steps. Learning content leads into product action. Unsupported free-plan, three-plan, bank-level encryption, and deletion promises were corrected in the touched acquisition pages.
- Pricing and plan selection offer only the annual Legacy family plan. The displayed amount comes from Clerk's live annual fee; checkout uses that same plan ID and annual period. Existing subscriptions are not migrated. No new price was assumed.
- Referral attribution survives redirects and browsing using a validated 30-day attribution cookie. Onboarding restores existing progress instead of trying to create a duplicate household.
- Browser requests can no longer choose paid household tiers. Verified billing state is retained before household creation, then applied during setup. Checkout returns through a server verification step. Webhooks use the billing payer's user ID, fetch canonical Clerk billing state, and return an error when reconciliation fails instead of silently losing an update. Canceled subscriptions retain access through the paid period.
- Household members can use shared subscription access. Expired overrides no longer unlock elevated quotas/features. Executor members can reach the separate estate purchase flow without buying a planning subscription; planning pages redirect them into the estate workspace when they lack planning access. Backend estate purchase checks remain in place.
- Test mutations are disabled unless explicitly enabled for development/test and the authenticated email is in an exact allowlist. Profile migration requires the matching verified account email.
- Shared downloads require the intended recipient's verified email, and an internal mutation atomically authorizes and counts the download before its URL is released. Request throttling is now stored on the share record and shared across frontend instances.
- Broken vault email links were corrected. Queued emails to known profiles receive random 256-bit unsubscribe tokens; the unsubscribe page changes optional email preferences without requiring a subscription. Older generic links offer account sign-in. Existing automated optional email campaigns already check this preference when selecting recipients; queued campaign messages are checked again for consent when dispatch begins. Suppressed messages are recorded as failed with an explicit opt-out reason and cannot retry.
- Subscription debugging was removed from account settings. Production dependencies were updated and the remaining selector-parser advisory patched. CI audits dependencies; a weekly workflow checks live article HTML, sitemap pages, 404 behavior, the email preference link, and dependency advisories.

## Initial validation — 6 October 2026

- 1,153 unit tests passed, including annual checkout, billing parsing, attribution, test-function access, current article discovery, and recipient download checks.
- Root and Convex TypeScript checks passed. Repository-wide Biome checks passed.
- Production dependency audit: zero reported vulnerabilities.
- Production build compiled successfully, then stopped during prerendering because `NEXT_PUBLIC_CONVEX_URL` is missing. Authenticated Cypress setup also stops because Clerk development keys are missing. Neither check is recorded as passing.
- The read-only live site check reproduced the existing production failures: article HTML absent, missing article HTTP 200, and unsubscribe HTTP 404. Local fixes are not live yet.

## Required before release

1. Non-production configuration has been restored in the ignored `.env.local` and the development backend has been synced. Supply dedicated test accounts and any additional `.env.test` settings needed for authenticated integration coverage; never commit credentials.
2. Configure `CLERK_SECRET_KEY` and `CLERK_WEBHOOK_SECRET` on the target Convex deployment. Confirm the existing frontend `CONVEX_DEPLOY_KEY` used by the share API is set. Subscribe the signed webhook endpoint to `subscription.*` and `subscriptionItem.*`. Keep production test functions disabled. Migration tokens need a verified email claim.
3. In Clerk, confirm the intended annual amount, enable annual checkout for the `legacy` plan, and disable its monthly purchase option. Hide other plans from new acquisition while preserving existing subscription contracts. The code uses the current annual amount; it does not change the price or existing billing intervals.
4. Deploy the additive Convex schema/functions to staging before the corresponding frontend. Reconcile existing billing accounts against Clerk before relying on historical household subscription flags; those flags were previously client-created.
5. The configured production build and public E2E checks now pass. Run the remaining authenticated integration suite and verify fresh signup, annual checkout, cancel-at-period-end, unpaid access denial, an invited family member, onboarding restart, unsubscribe, and shared-document access for correct/wrong/unverified recipients. Test executor purchase, activation, post-grace access, and export separately.
6. The local executor feature branch matched this checkout's committed code at review time. Do not treat another merge as a launch. Replace the public executor waitlist only after its paid journey passes staging verification. Confirm whether executor content, the executor paid product, or both are intended for launch.
7. After publishing, run `pnpm audit:site https://www.pathible.com` and submit the corrected sitemap in Search Console. Review GitHub Actions failures weekly with an assigned owner.

## Remaining work

Account deletion still retains shared data and needs a defined purge/export workflow. Marketing promises on untouched pages and stored email templates need a final consistency review. Dependency updates include several major versions and require configured integration testing before deployment.

These fixes remove demonstrable faults; they do not establish the cause of six months without signups or prove product-market fit. Reconcile qualified traffic → signup → checkout → first useful action → family invitation → renewal, then run paid pilots with a specific buyer. Annual prepayment improves cash collection when customers convert, but a large upfront commitment can reduce conversion before value is demonstrated. Choose a price from actual buyer evidence, not the ARR target alone.

## Development verification update — 7 October 2026

Restored this worktree's ignored `.env.local` from the main checkout at `/Users/jimgibbs/Code/pathible`; the source was unchanged. Cypress now falls back to this configuration when `.env.test` is absent. Synced functions to development deployment `quaint-loris-658`, retaining existing Stripe-era fields and billing records to satisfy schema validation without deleting data. Clerk reconciliation refuses to overwrite Stripe-managed households.

Applied a tracked pnpm patch to `next-themes@0.4.6`: its no-flash script remains in SSR/initial hydration and is omitted on fresh client mounts. Replaced the JSON-LD `next/script` loader with escaped `application/ld+json` data blocks. Added regression coverage for SSR, hydration, client remounts, theme persistence, JSON-LD parsing, and script injection escaping.

The homepage family guide now works across the old and new content libraries: `/learn/the-family-access-map` redirects to the published legacy access-map article when the newer slug is absent. The hero actions use a column layout with a 20px gap on desktop and mobile.

Verified in a real browser: homepage HTTP 200; exact guide URL HTTP 200 after redirect; article body visible; client navigation from the guide back to the homepage and back again; four JSON-LD data blocks; no reported theme or JSON-LD executable-script warning. Final checks: 1,161 unit tests, 10 public Cypress E2E tests, `pnpm lint`, and `pnpm build:ci` all passed. Authenticated billing/executor integration tests and production release remain outstanding.
