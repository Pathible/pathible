# Pathible Product and Growth Audit

October 6, 2026

Pathible has substantial product functionality, but its current offer and acquisition system do not give a stranger a clear, credible reason to start and pay. The highest priority changes are to reconcile the offer, repair search discovery, remove barriers to the first useful result, and prove one distribution channel with paying customers. Additional feature breadth is a lower priority.

The reported absence of signups for six months is a serious business signal. It does not establish whether the primary cause is insufficient qualified traffic, signup failure, weak conversion, or measurement. Traffic, completed Clerk registrations, household creation, purchases, and revenue must be reconciled before attributing the result to organic marketing alone.

## Scope and confidence

The audit covers the current repository, public production pages, desktop and 390-pixel mobile browser checks, sitemap article checks, signup and purchase entry points, marketing and partnership documents, unit tests, and production dependency advisories. Browser checks used fresh unauthenticated sessions. Production accounts, purchases, emails, and customer data were not created or changed.

**Verified live** means the behavior was observed on the public website. **Verified code** means the implementation exists in this checkout; production configuration or authenticated behavior may differ. **Hypothesis** means a commercial explanation or proposal that needs customer evidence.

The audit does not establish production traffic, Search Console impressions, historical conversion, active paying customers, churn, margins, deliverability, legal document validity, or production exploitability. Account verification, checkout payment, authenticated family invitations, and long-term retention were not exercised. Those limitations prevent a definitive causal diagnosis or a promised date for $1M ARR.

## The main commercial problems

### The offer conflicts with itself

The public pricing table displayed one Legacy plan at $45.99 per month, billed annually, equivalent to $551.88 per year. The homepage FAQ says there are three plans. The learning page invites visitors to create a free account. Product access in `src/proxy.ts` requires a recognized subscription, and onboarding routes users without one to plan selection. A free registration is therefore different from a demonstrated free product experience.

The checkout entry also adds friction: clicking Subscribe as a new visitor opened a sign-in page, where the visitor must discover the Sign up link. The public signup form itself loaded successfully on desktop and mobile. There is no evidence here that the initial signup screen is globally broken.

**Change:** Define one authoritative offer across Clerk configuration, pricing copy, FAQ, structured data, onboarding, checkout, and upgrade rules. State the actual annual charge, renewal terms, trial conditions, available features, and what the visitor can accomplish before paying. Give new visitors an explicit account creation path from pricing.

A lower price alone will not create distribution, but the premium needs proof. [Everplans currently advertises a limited free plan and Premium at $99.99 per year](https://www.everplans.com/pricing). Pathible's observed annual price is about 5.5 times that price. The offerings are not identical; the comparison shows how much extra value Pathible must make visible.

### The homepage communicates grief before the product outcome

The opening question describes sorting a loved one's affairs while grieving, followed by empathy and a Get Started button. It does not immediately explain what the software produces, how much work starting requires, or why Pathible is worth paying for over a binder or shared folder. The page later describes files, finances, stories, and plans, but that breadth adds decisions before a visitor has seen a concrete result. [Pathible homepage](https://www.pathible.com/).

**Hypothesis:** The emotional narrative earns agreement more readily than purchase intent. A visitor can agree that preparation matters and still postpone it. The current hero also overlaps two distinct moments: preparing one's own family and administering someone else's estate after a death.

**Change:** Lead with a specific present-tense task and visible result. Keep the founder story as supporting evidence. Use separate pages and calls to action for preparation and estate administration. Faith alignment can be a strong reason for a trusted partner to recommend Pathible; it needs to accompany a clear practical outcome.

Suggested preparation copy, contingent on delivering the promised workflow:

> Help your family find what they need in an emergency.
>
> Organize important documents, accounts, contacts, and wishes in one family workspace. Start with a simple access map, then invite someone you trust.
>
> Primary action: Create my family access map. Secondary action: See a sample.

Avoid a time promise until pilot participants actually achieve it. Display a real sample, a short product demonstration, an explicit price or trial statement, and a clear explanation of who can access information.

### The marketing calendar repeats the problem without testing the offer

`marketing/social-content-calendar-4weeks.md` specifies the same grief question and core phrases in all 52 posts. This is a planned calendar, not evidence that all posts were published or reached qualified buyers. The document tracks soundbite repetition, but supplies no measured path from audience exposure to leads, activation, purchases, or retention.

**Hypothesis:** Repeated emotional posts are unlikely to discover which immediate task motivates purchase. Personal social audiences also may contain few people currently buying this category. Organic growth requires reachable demand, useful content or recommendations, a working conversion path, and retention; publishing consistently does not establish those conditions.

**Change:** Test content that produces an action: a family access worksheet, a screen demonstration, an anonymized example of a completed handoff, a workshop, and a specific customer objection. Give each campaign a tracked destination and one outcome. Measure qualified visits and activated paying households, rather than phrase counts, likes, or post volume.

### The most urgent public offer stops at a waitlist

The executor page targets someone already responsible for settling an estate, but both its principal calls to action collect an email for future access. The repository already contains checklist, asset, communication, distribution, sharing, and export functionality. Code presence does not prove launch readiness. [Executor landing page](https://www.pathible.com/for-executors).

This is a missed validation opportunity: someone dealing with an immediate estate has a clearer current task than someone contemplating a distant legacy. However, estate administration is usually a finite engagement. One-time executor purchases can validate demand and produce revenue; they do not constitute ARR unless there is a genuine recurring contract.

**Change:** Decide whether executor administration is ready for a supervised paid pilot. If ready, replace the indefinite waitlist with a concrete pilot offer and an immediate sample checklist. If not ready, explain the expected availability and provide useful help now. Do not present a complete operational solution while offering only future notification.

## Verified search and conversion defects

| Priority | Finding | Evidence | Required change |
| --- | --- | --- | --- |
| P0 | All 12 articles linked from the current learning library have the HTML title `Article Not Found \| Pathible`. | Live HTML title checks for all 12 URLs; a rendered sample displays the actual article correctly. | Generate metadata and visible content from the same published article record. |
| P0 | Five of 13 article URLs in the sitemap display Article Not Found with HTTP 200. | Rendered browser checks of every listed article. | Restore or redirect legitimate moved articles; return an actual 404 for nonexistent content; remove invalid sitemap entries. |
| P0 | None of the current 12 library article URLs appears in the sitemap. | Comparison of library links with live sitemap XML. | Build the sitemap from published public content, with real modification dates. |
| P1 | Article bodies and library links depend on client queries. Server output for an article contains only a hidden seed title and excerpt. | `src/app/(unauth)/learn/[slug]/page.tsx`, `ArticleContent.tsx`, `LearnArticlesSection.tsx`. | Render the public article body and discovery links on the server, then enhance interactive behavior. JavaScript dependence is a discovery weakness, not proof Google cannot index the site. |
| P0 | Referral attribution is dropped on the normal signup route. | `/signup?ref=audit-check` ended at `/sign-up` without the parameter; onboarding only reads `ref` from its current URL. | Persist validated attribution before authentication and carry it through onboarding and purchase. |
| P1 | Pricing says Tags & Collections, Voice Recordings, and Guided Organization are included, but their vault UI is commented out. | Live pricing table and `vault/components/vault-content.tsx`. | Audit every billed feature and remove unavailable promises or finish and verify them. |
| P1 | Email templates link to `/dashboard/vault` and `/unsubscribe`; these routes returned 404 in direct public checks and are absent from the app route inventory. | `src/lib/email-utils.ts`, `src/convex/shared/emailUtils.ts`, route inventory. | Point document actions to `/vault`; implement and verify unsubscribe without requiring product payment. Confirm which template versions are actually sent. |

The five broken sitemap article paths are `why-we-built-pathible`, `getting-started-with-pathible`, `what-makes-pathible-different`, `dont-leave-your-family-a-mess-checklist`, and `estate-planning-checklist-25-essential-documents`.

The root cause of the article mismatch is visible in code: metadata uses static seed data while visible content uses live Convex data, and the sitemap has a third hardcoded list. One content source should determine metadata, page content, canonical URLs, internal discovery, and the sitemap.

Fixing these defects improves eligibility and usability; it does not establish that search demand, rankings, or conversion will be sufficient. Use Search Console to measure indexing and relevant queries after repair. Align the preferred host consistently; current public visits redirect to `www` while canonical URLs use the non-`www` host. That discrepancy is cleanup, not a proven reason for zero signups.

## Product activation and repeat value

The current signup path requires account creation, a profile, household setup, goal selection, and a subscription decision before the dashboard. The dashboard has contextual suggestions, but it presents several modules rather than one completed first outcome. The onboarding wizard starts with empty local fields on each fresh visit, while the household mutation rejects creation if membership already exists. A interrupted onboarding flow can therefore require recovery work; verify the complete resume path with a test account.

**Recommended first result:** A family access map identifying one important document, one financial institution, one contact, and one trusted person. Allow the user to document where something is without uploading sensitive material immediately. Prepopulate a household name, defer optional phone and birth date, save progress, and offer a sample workspace before requesting sensitive information.

Define activation as a useful preparation packet plus a successful access check by a trusted person. A raw upload count does not show that the family can find anything. Family collaborators should receive appropriate household access without each needing a separate consumer subscription; the current proxy checks the current user's Clerk plan while backend authorization considers the household. This mismatch needs an authenticated owner-and-invitee test.

Useful recurring reasons to retain the product could include an annual family readiness review, important document review reminders, account/contact updates, new household events, and access checks. These are hypotheses to validate. For a preparation product, monthly use may be low while annual renewal remains valuable; measure renewal and readiness, not daily activity alone. For executor administration, measure progression and estate completion rather than assuming indefinite use.

The repository already has PostHog initialization, article events, onboarding events, document events, and subscription events. Live browser requests reached PostHog. The issue is not the complete absence of analytics. No active funnel dashboards or historical counts were available for this audit, and explicit browser-to-authenticated-user identity linkage was not found in the reviewed client code.

**Measure one funnel:** qualified visit → primary action → signup started → verified Clerk account → onboarding completed → first useful packet → trusted-person access confirmed → purchase → renewal. Preserve initial source, campaign, and partner attribution. Report account creation separately from completed onboarding and paid households. Avoid sending sensitive document contents or family information into marketing analytics.

## Security and operational issues before scaling

These findings are not evidence of a breach and are not established explanations for the lack of signups. They are material to the trust promise and readiness to expand.

| Priority | Code finding | Action |
| --- | --- | --- |
| P0 | `profiles.linkToClerkUser` accepts a caller-provided email, finds a legacy profile, and changes its owner without comparing that email with the authenticated identity. | Remove the migration entry point if finished, or require verified identity matching and a controlled migration process. Exposure depends on surviving legacy profiles and deployment. |
| P0 | Public test mutations can grant admin roles; their protection relies on URL substring checks and email patterns. | Disable test mutations by default in production and require a controlled nonproduction allowlist. A deployment name and user-controlled email pattern are unsuitable security boundaries. |
| P0 | Onboarding accepts a subscription tier from the client and stores it as active. Backend tier enforcement uses stored tier data. | Derive entitlements from verified billing or an authorized partner grant. Do not trust a client-provided paid tier. |
| P1 | `requireSubscriptionTier` uses `tierOverride` directly, without applying the expiration logic in `getEffectiveTier`. | Use one effective entitlement calculation everywhere and test expiration. |
| P1 | Proxy access requires a Clerk plan before the layout can honor admin/demo overrides or household access. It also gates estate routes before backend grace rules can help. | Unify route, household, partner, collaborator, and estate entitlements; verify each role and expired-payment scenario. |
| P1 | Public share pages and `/api/share` are absent from the public route allowlist, despite token-based public access being their intended design. | Test intended unauthenticated sharing after reconciling route protection. Keep token validation and document authorization. |
| P1 | Shared-document download has a TODO for recipient verification; rate limits are local to a process and download logging is noncritical. | Specify whether a link is a bearer credential or identity-restricted access; implement consistent recipient checks and atomic download limits where promised. |
| P1 | Delete Account promises complete permanent removal, but `deleteProfile` soft-deletes the profile and refuses deletion for household primary contacts. | Reconcile UI, household ownership transfer, file removal, retention, billing cancellation, and policy. Provide a usable deletion path for the original household owner. |
| P1 | Billing webhook parsing assumes `data.id` is a user ID and a plan is a string, and acknowledges synchronization exceptions with success. | Verify real current Clerk payloads in staging, use canonical payer/plan identifiers, log failures, and provide retry and reconciliation. This is a code risk, not a confirmed live payment failure. |

The production dependency audit reports **6 critical and 37 high vulnerability entries**, with additional lower severity entries. These counts can include multiple advisories and dependency paths; they are not counts of exploitable application flaws. Installed Next.js is 16.1.1 and Clerk Next.js is 6.36.7.

Update the framework, Clerk SDK, and affected transitive dependencies through a tested upgrade. The [Clerk advisory](https://github.com/clerk/javascript/security/advisories/GHSA-vqx2-fgx2-5wq9) lists a fix in the 6.x line at 6.39.2 and notes that downstream authentication checks remain effective; Pathible has additional checks. The [Next.js image optimization advisory](https://github.com/vercel/next.js/security/advisories/GHSA-2xp9-vwfh-vxw4) lists 16.3.3 as a patched version for that particular issue. Select maintained versions that resolve the full current audit, rather than treating either minimum as a complete security baseline. Verify actual deployment versions and hosting applicability.

Publish a plain security explanation supported by actual provider settings and tested controls: encryption in transit and at rest, access boundaries, staff access, backups and restore, deletion, export, payment expiry, and family access after an owner's death. “Bank-level encryption” does not answer those questions. Do not claim independent certification or perpetual access unless supported.

Unit test result: **1,086 tests passed; 13 failed; one additional suite could not load**, giving 16 passing and two failing test files. Failures were caused by the missing generated Convex API in this checkout. They do not prove that authentication is broken in production. Generate the required artifacts in a controlled development environment, rerun, and then verify authenticated journeys. The reviewed CI includes lint/type checks and unit tests; it does not include an E2E job. Add release checks for signup, checkout, attribution, access, sharing, article integrity, and email links.

## The best hypothesis for a recurring business

The strongest hypothesis for $1M ARR is a professional or partner-funded family readiness workflow, because a professional has repeated client work and can introduce Pathible at a meaningful moment. Start with small estate planning firms that you can personally reach, testing an organized family handoff after plan signing or preparation before a consultation. The economic reason to pay must be observable: less follow-up, complete information, or better ongoing client service.

This is a hypothesis, not a validated pivot. Consumer interest does not prove professional willingness to pay. Within the first month, also hold a smaller set of conversations with faith-aligned financial advisors to test sponsored family readiness; choose one channel based on paid commitments and actual usage.

`docs/B2B_PIVOT_STRATEGY.md` identifies useful channels, but overstates readiness and economics. It describes substantial time savings without measured pilots, understates integrations and professional workflow requirements, and assumes partnership interest from an organization's public service descriptions. Its instruction to build before validating should change. The code contains six document types, but the reviewed production UI enables only will, trust, and pour-over will. Neither template tests nor state-specific data establish legal validity or attorney acceptance.

Do not sell Pathible as a replacement for attorney drafting or claim hours saved without evidence. [DecisionVault](https://decisionvault.com/pricing/) offers professional intake, integrations, file sharing, and a no-card trial; its annual-billing prices include $83/month Solo and $165/month Team. [Everplans sells a co-branded advisor vault and family continuity workflow](https://www.everplans.com/enterprise). [Trust & Will offers advisor subscriptions](https://help.trustandwill.com/hc/en-us/articles/39627616412173-Premium-Subscription-for-Advisors). This is an established competitive category, not an empty market.

A partner MVP may need scoped advisor access, multiple client households, client invitations, completion status, export into the existing workflow, partner attribution, sponsored entitlements, and privacy-preserving usage reporting. A global administrator dashboard is not a substitute for tenant-scoped professional access. Build only what paying pilot participants demonstrate they need. Co-branding alone will not create adoption.

National ministries and large institutions can be later distribution channels. Start with a named decision maker, a scheduled introduction to a real cohort, a defined launch owner, and commercial terms. A list of potential partners is not a distribution pipeline. Do not forecast revenue from CFR or another institution without an actual commitment.

## ARR scenarios and operating economics

ARR here means annualized recurring subscription or contracted license revenue. Exclude setup fees, one-time executor purchases, lifetime sales, and unpaid pilot accounts.

| Illustrative model | Revenue per paying customer per year | Customers needed to reach at least $1M ARR |
| --- | --- | --- |
| Current observed family offer | $551.88 | 1,812 |
| Proposed $149 annual family offer | $149 | 6,712 |
| Professional plan at $299/month | $3,588 | 279 |
| Professional plan at $499/month | $5,988 | 168 |

These are arithmetic scenarios, not forecasts or validated prices. The lower-priced consumer scenario requires substantially more customers. The professional scenarios require fewer buyers but greater workflow depth, sales effort, service, and retention.

An illustrative mix of 250 firms at $299/month and 1,000 independently paid households at $120/year produces $1,017,000 ARR. Do not charge twice for households already included in firm contracts or count their revenue twice. This mix is not a recommendation to pursue two channels before proving one.

At an assumed 2% monthly firm churn, 279 firms require approximately six replacement customers each month before growth. Reaching 279 firms in 24 months requires roughly 12 net additions per month on average, plus churn replacement. That sales pace is not yet demonstrated.

For each real cohort, calculate acquisition cost including founder sales time, gross margin after storage and support, onboarding effort, activation, recurring revenue, renewal, and expansion. Acquisition payback is acquisition cost divided by monthly gross profit per customer. Evaluate cohort retention before relying on a theoretical lifetime-value formula. A $551.88 family plan with extensive concierge labor can still have poor economics.

## The next 90 days

### Days 1 through 7

Reconcile six months of Vercel/PostHog sessions, Search Console queries, Clerk accounts, Convex profiles/households, billing subscriptions, collected revenue, and waitlist entries. Identify where counts diverge and whether visits represent prospective customers rather than bots or internal use. A month with 30 qualified visits and a month with 3,000 visits require different conclusions.

Fix the article source mismatch, broken sitemap entries, lost referral attribution, inconsistent plan descriptions, unsupported feature promises, and email links. Patch and review the P0 security issues. Verify a complete test signup and paid/trial journey in staging, including an invited family member and a restart midway through onboarding. Deliver a coherent, demonstrably functioning offer.

### Days 8 through 30

Founder-led discovery target: ten small estate planning firms and five faith-aligned advisors, plus ten people currently organizing family affairs. These are proposed activity targets, not market benchmarks. Ask them to show their current workflow, last difficult case, existing spending, buying authority, and willingness to start with a real client now. Record objections and rejected offers, not only positive comments.

Recruit three professional pilots with a 30-day scope, an explicit price to continue, and two real client households each. A small paid pilot provides stronger evidence than a six-month free trial. If a free pilot is necessary, agree the paid conversion decision and date upfront. Measure completion, access success, support effort, follow-up work, and a renewal decision. Use permitted fictional examples for demos.

Validate one preparation outcome with ten assisted families. Test a concrete annual offer, for example $149/year, and separately price guided setup if customers request it. The price is an experiment. Keep service revenue separate from ARR. Observe actual payment decisions and whether the family uses the result.

### Days 31 through 60

Select the channel with the clearest paid demand and repeated useful activity. For that buyer, publish a specific landing page, sample deliverable, short walkthrough, accurate security explanation, pilot terms, and real case evidence with customer permission. Complete only the professional access, export, or activation gaps necessary to fulfill paid commitments.

Repair the content system before adding SEO volume. Publish a small set of useful pages around observed buyer questions, such as an emergency family access map, organizing documents before an estate consultation, or the first tasks after a loss. Use authoritative review for legal or medical topics and avoid generalized legal instructions disguised as jurisdiction-specific guidance. Validate query demand in Search Console and current search results. Connect each page to a worksheet, pilot, or concrete product action.

Replace the repetitive posting calendar with demonstrations, worksheets, customer questions, workshops, and measured examples. A worksheet should be useful even without signing up. Use an optional follow-up invitation with explicit consent rather than forcing registration for every piece of help.

### Days 61 through 90

Repeat the winning acquisition method. Suggested continuation gate: at least three professional customers pay or renew after using Pathible with actual clients, and most invited pilot households complete the agreed useful result without founder rescue. These are internal decision gates; report sample sizes and failures. Do not interpret three pilots as proof of scalable acquisition.

If there is use but no payment, revisit the buyer, result, price, and alternatives. If there is payment but excessive support, simplify the workflow or price the service separately. If completed packets are useful but there is no renewal reason, consider a transaction business and acknowledge that it does not meet the ARR objective without a separate recurring proposition.

Scale spending or large-partner negotiations only after at least one channel shows repeatable acquisition, useful activation, paid retention, and acceptable support cost. The first milestones are a reconciled funnel and paying pilot customers, then $1,000 and $5,000 MRR. $83,333 monthly recurring revenue is the $1M ARR target; the present evidence does not justify a deadline for reaching it.

## Immediate decisions

1. Define the actual family offer and reconcile every public promise with it.
2. Repair the content and referral infrastructure before publishing more campaigns.
3. Close access and security gaps before increasing sensitive-data adoption.
4. Demonstrate one small useful result before asking for a premium commitment.
5. Test professional-funded family readiness with real paying pilots before building a broad B2B platform.
6. Treat acquisition, activation, payment, renewal, and margins as one operating system with an owner and a weekly review.

Pathible's opportunity is to make a difficult family task reliably easier at the moment someone is ready to act. The next investment should prove that promise and its buyer, rather than expand the feature list or repeat the same message more often.
