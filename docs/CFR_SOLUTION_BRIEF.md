# CFR Solution Brief: What You Can Deliver Today

**Date:** February 16, 2026
**Approach:** Brutal honesty. No vaporware. Only what the code proves.

---

## Who CFR Is (Not Who You Imagine)

Christian Financial Resources is not a megachurch. It's not a tech company. It's a **45-year-old financial ministry** in Lake Mary, FL with:

- **$880M+ in managed assets** across 7,000+ investment accounts
- **~30 employees** (lean operation managing nearly $1B)
- **Core business:** Certificates of deposit for churches, church construction loans, capital campaign consulting
- **CEO:** Darren Key — ordained minister, CFP, dual degree in Christian Service and Finance
- **Recent moves:** New mobile app (FIS/iPhi platform), growing from $500M to $880M AUM, authorized $700M in new certificates for 2024-2025

**Their legacy planning offering today:** Advisory consulting. Estate planning conversations. Charitable gift annuities ($10K minimum). Donor-advised funds. Educational webinars. **No software platform. No digital tools. No self-service.**

**Their gap:** They tell 7,000+ investors "we help with legacy planning." They deliver it through phone calls and PDFs. A 30-person team cannot provide hands-on legacy planning to 7,000 households. The math doesn't work.

**Your opportunity:** Give them the platform to deliver on a promise they already make.

---

## What Pathible Has Built (Code Audit)

This is not a pitch deck. This is what the actual codebase contains, verified against the Convex schema, UI components, and function files.

### Production-Ready Features

| Feature | What Exists | Depth | CFR Relevance |
|---------|------------|-------|---------------|
| **Heritage Vault** | Backblaze B2 file storage, upload/download, categories, search, access control (household/admins/custom), file hash verification, storage quotas | Deep | **HIGH** — Families need a place for insurance policies, deeds, account statements |
| **6 Legal Document Wizards** | Will, Trust, Pour-Over Will, Financial POA, Healthcare POA, Advance Directive. Full wizard UI with step-by-step input. 50-state legal requirements. PDF generation with react-pdf. Disclaimer acknowledgment. | Deep | **MEDIUM** — Useful but CFR may prefer to refer clients to attorneys. Could be positioned as "educational drafts" |
| **50-State Legal Requirements** | Witness counts, notary requirements, execution rules, state-specific clauses for all 50 states + DC. Comprehensive data in `state-legal-requirements/` | Deep | **MEDIUM** — Validates that document wizards aren't generic templates |
| **Financial Tracking** | Accounts (checking, savings, investment, retirement, crypto), Properties (primary/secondary/rental/land/commercial), Insurance Policies (life, health, home, auto, disability, LTC, umbrella) with premiums, coverage, beneficiaries | Deep | **HIGH** — CFR investors already have financial accounts. This organizes the full picture beyond just CFR holdings |
| **Family Management** | Households, Family Units, Family Members with full demographics (name, DOB, gender, address, marital status, relationship types). Roles: owner, steward, viewer, executor | Deep | **HIGH** — Legacy planning is inherently family-centric |
| **Legacy Planning** | Legacy plans with trusted contacts, guardians, pet care, memorial preferences, final message. Key contacts with roles (attorney, financial advisor, executor, trustee, guardian, healthcare proxy, friend, religious org). Completion tracking. | Deep | **HIGH** — This IS what CFR's legacy planning service needs to deliver digitally |
| **Wisdom & Values** | Wisdom entries (values, lessons, stories, advice, traditions) with rich text, media attachments, sharing controls. Core beliefs (faith, family, work, community, personal). Letters to loved ones with delivery conditions (specific date, after death, milestone, manual). | Deep | **VERY HIGH** — Faith-based stewardship mission alignment. "A good man leaves an inheritance to his children's children" |
| **Onboarding** | 3-step wizard: Profile > Household > Goals/Preferences. Goals include: document organization, legacy planning, family heritage, financial clarity, estate planning, end-of-life planning | Complete | **HIGH** — Clean first-run experience for new families |
| **Subscription Tiers** | 4 tiers (Foundations, Heritage, Legacy, Founders). 26 features mapped to tiers. Storage/member/family-unit limits per tier. Clerk billing integration. Admin tier override with expiration and audit trail. | Complete | **HIGH** — Tier override system means you can give CFR families access without changing billing infrastructure |
| **Admin Dashboard** | User management (search, view, deactivate). Household management (view details, update tier, apply/remove overrides). Platform analytics (users, households, content stats, tier breakdown). Activity logs with filtering. | Complete | **HIGH** — You can manage CFR pilot families manually from day one |
| **Email System** | Email templates (system + manual), email queue with rate limiting (Resend API), email campaigns, sent email tracking, system template scheduling (weekly/daily), trigger conditions. | Complete | **MEDIUM** — Engagement emails, onboarding nudges |
| **Activity Logging** | Full audit trail: vault, wisdom, financial, family, legacy, household, legal document actions. Per-household, per-user tracking. | Complete | **HIGH** — Proves engagement to CFR ("your families are using this") |
| **Educational Content** | Admin-authored articles with categories, read tracking, public/subscriber visibility, daily wisdom quotes | Complete | **MEDIUM** — CFR could contribute faith-based financial stewardship content |
| **Guided Tours** | Admin-managed product tours with steps, routes, anchors, versioning, user progress tracking | Complete | **MEDIUM** — Useful for CFR family onboarding |
| **Smart Suggestions** | Context-aware suggestions based on eligibility rules (tier, documents, onboarding status, days since signup, feature usage) | Complete | **MEDIUM** — Nudges families toward next steps |
| **Notifications** | In-app notifications (invitation, document shared, letter delivered, reminder, system) with read tracking | Complete | **LOW** — Standard feature, not a differentiator |

### What Does NOT Exist

| Missing | Impact | Effort to Build |
|---------|--------|----------------|
| **Organization/Partner model** | No way to track "this household came from CFR" | 1-2 weeks |
| **Partner referral tracking** | No `?ref=cfr` signup flow, no attribution | 1 week |
| **Co-branding/white-label** | All users see "Pathible" branding, no CFR logo option | 1-2 weeks |
| **Partner dashboard** | CFR has no view of their families' engagement | 2-3 weeks |
| **Bulk user management** | Can't create 50 CFR accounts at once | 1 week |
| **SSO/SAML** | CFR investors need separate Pathible login | Not needed for pilot |
| **API for integration** | No programmatic access for CFR systems | Not needed for pilot |
| **Module toggles per partner** | Can't hide legal docs for CFR if they don't want them | 1 week |
| **"Shared with advisor" view** | No read-only view for CFR staff to see family progress | 2 weeks |

---

## The CFR Pitch: Exactly What You Say

### Context You Must Understand First

CFR is a ministry. Darren Key is an ordained minister with a finance degree. Their core values are: **Sacred Trust, Strategic Stewardship, Strong Partnerships.**

They are NOT looking for:
- A SaaS vendor pitch
- "We'll disrupt legacy planning"
- Revenue projections and TAM slides
- Technical architecture diagrams

They ARE looking for:
- Ministry alignment (does this serve families?)
- Trust (will their investors' data be safe?)
- Simplicity (can their 30-person team actually support this?)
- Proof (does it work?)

### The Email (Send This to Darren Key)

> **Subject:** A legacy planning platform for your investors — built, tested, ready
>
> Darren,
>
> I'm James Gibbs. I built Pathible — a digital legacy planning platform for Christian families, grounded in Proverbs 13:22.
>
> I noticed CFR offers legacy planning as part of your stewardship services. I built the tool your families need to actually do it.
>
> **What it does today:**
> - Families organize their important documents in a secure vault
> - They track their financial accounts, properties, and insurance policies in one place
> - They name their key contacts — attorneys, executors, trustees, healthcare proxies
> - They record their values, stories, and letters to loved ones
> - They walk through guided planning for guardians, memorial wishes, and final messages
> - They can generate educational drafts of wills, trusts, and powers of attorney for all 50 states
>
> **What it doesn't do:** Replace attorneys or financial advisors. It prepares families so those conversations are productive instead of starting from scratch.
>
> I'd love to show it to you. If it fits, I'd offer a free 90-day pilot for 25-50 of your investor families. No cost, no commitment. Just see if they use it.
>
> Would a 30-minute call work?
>
> James Gibbs
> Pathible | pathible.com

### The 30-Minute Demo (What You Show)

**Minute 0-5: Their world, not yours**

"Tell me about how legacy planning works with your investors today. When someone asks about getting their affairs in order, what does that process look like?"

Listen. They'll describe phone calls, meetings, PDFs, referrals to attorneys. They'll mention the gap before you do.

**Minute 5-15: Live walkthrough**

Show a pre-populated demo account (a fictional family):

1. **Dashboard** — "This is what the Johnson family sees when they log in. Progress on their legacy plan, recent activity, suggestions for next steps."
2. **Vault** — "They've uploaded their life insurance policy, deed, and marriage certificate. Secure storage on Backblaze B2, encrypted, access-controlled."
3. **Financial Overview** — "Their checking, savings, Fidelity retirement account, and your CFR Time Certificate — all in one view. Properties. Insurance policies with beneficiaries."
4. **Family** — "Their family tree. Spouse, three children, two grandchildren. Each with contact info, roles, relationships."
5. **Legacy Plan** — "Key contacts: their attorney, you as financial advisor, their eldest as executor. Guardians for the minor grandchild. Memorial preferences. A final message."
6. **Wisdom** — "This is where it gets personal. Their core beliefs — faith, family, stewardship. A letter to each child. Stories they want preserved. This is the spiritual legacy CFR talks about."
7. **Legal Documents** — "An educational draft of their will, customized for Florida law. Healthcare POA. Advance directive. Not legal advice — a starting point for their attorney."

**Minute 15-20: The math**

"You have 7,000 investor households. Your team is 30 people. Even if 10% of your investors want hands-on legacy planning help, that's 700 families. You can't serve 700 families with phone calls and PDF worksheets. This platform lets them do 80% of the work themselves, then come to you for the 20% that needs a human."

**Minute 20-25: The pilot**

"Give me 25 families. 90 days. I'll onboard them personally. You'll see exactly how they engage — what they fill out, what they skip, how often they come back. If it works, we talk about rolling it out to your full investor base. If it doesn't, you've lost nothing."

**Minute 25-30: The ask**

"Who on your team would be the right person to select the pilot families and introduce me? I want to make sure this serves your mission, not just my product."

---

## The Pilot: Exactly What Happens

### Week 0: Setup (before families touch it)

**What you do with existing code:**

1. **Create a CFR admin account** — Use existing admin system to manage pilot families
2. **Apply tier overrides** — Use `applyTierOverride()` to give all pilot families Legacy-tier access (all features unlocked, unlimited storage)
3. **Set override reason** — `"cfr_pilot_2026"` — creates audit trail
4. **Set override expiration** — 90 days from pilot start
5. **Create onboarding email template** — Use existing email template system with CFR-specific welcome message
6. **Prepare demo account** — Populate a household with realistic data for the demo

**What you build (minimal, 1-2 weeks):**

1. **Referral tracking field** — Add `referralSource` (optional string) to `profiles` table. Set to `"cfr"` during pilot signup. This is one schema field and one line in the onboarding mutation.
2. **CFR landing page** — `/signup?ref=cfr` — Same signup flow, but with a CFR-branded header ("Welcome, CFR Investor Family") and the referral source tracked. One component, one route check.
3. **Admin filter by referral** — Filter households by `referralSource` in admin dashboard. One query parameter.

That's it. No organization table. No partner dashboard. No co-branding engine. You don't need enterprise infrastructure for 25 families.

### Weeks 1-2: Onboarding (families start using it)

CFR introduces you to 25 families. You send each family:

1. A personal email with signup link (`/signup?ref=cfr`)
2. A 10-minute recorded walkthrough video (screen recording of the demo)
3. Your personal email/phone for questions

**Expected friction points (be honest about these):**
- Families will need a separate login (Clerk, not CFR's portal). This is a real friction point. Mitigate with clear instructions.
- Older investors may struggle with the interface. The onboarding wizard helps, but expect support emails.
- Some families won't upload documents (trust barrier). Vault usage will lag behind other features.
- Legal documents require disclaimer acknowledgment. Some families may be uncomfortable generating "draft" legal documents without an attorney present. This is actually correct behavior — the disclaimers protect everyone.

### Weeks 3-8: Engagement Tracking

**What you measure with existing tools:**

| Metric | How You Track It | Source |
|--------|-----------------|--------|
| Signups completed | Admin dashboard → Users → filter by referral | `profiles` table |
| Onboarding completion | Admin dashboard → User detail → onboarding status | `profiles.onboardingStatus` |
| Vault uploads | Admin dashboard → Household detail → vault document count | `households.vaultDocumentCount` |
| Financial accounts added | Activity log → filter by "financial" module | `activityLog` table |
| Legacy plan progress | Admin dashboard → Household detail | `legacyPlans.completionPercentage` |
| Wisdom entries created | Activity log → filter by "wisdom" module | `activityLog` table |
| Legal documents started | Activity log → filter by "legal_document_created" | `activityLog` table |
| Legal documents completed | Activity log → filter by "legal_document_completed" | `activityLog` table |
| Weekly active users | Activity log → unique users with actions in last 7 days | `activityLog` table |
| Feature-by-feature usage | Activity log → group by module | `activityLog` table |

You can generate all of this from the existing admin dashboard and activity log. No new analytics infrastructure needed.

### Week 10-12: The Readout

Present to Darren Key and his team:

**The data story:**

"Of your 25 pilot families:
- X completed onboarding (Y% completion rate)
- X uploaded at least one document to their vault
- X started their legacy plan
- X recorded wisdom entries or core beliefs
- X generated at least one legal document draft
- Average weekly engagement: X sessions per family
- The most-used features were: [rank by activity]
- The least-used features were: [rank by activity]"

**The narrative:**

"Your families used this. Here's what they engaged with most. Here's where they dropped off. Here's what we'd adjust for a broader rollout. Based on this data, here's what a partnership could look like."

---

## Pricing for Post-Pilot Partnership

Don't discuss pricing until you have pilot data. But have a framework ready.

### Option A: Flat License (Predictable for CFR)

| Component | Price |
|-----------|-------|
| Annual platform license | $15,000/year |
| Includes | Up to 200 active households |
| Additional households | $5/household/month |
| Setup + onboarding support | $2,500 one-time |
| Dedicated support | Email + monthly check-in |

At 500 families: $15,000 + (300 x $5 x 12) = **$33,000/year**
At 1,000 families: $15,000 + (800 x $5 x 12) = **$63,000/year**

### Option B: Per-Household (Aligns cost with value)

| Component | Price |
|-----------|-------|
| Per active household | $7/month |
| Minimum commitment | 50 households |
| Setup fee | $0 |

At 200 families: **$16,800/year**
At 500 families: **$42,000/year**
At 1,000 families: **$84,000/year**

### Option C: CFR Resells (They Charge Families)

| Component | Details |
|-----------|---------|
| Wholesale per household | $4/month to you |
| CFR charges families | $7.99-9.99/month (their choice) |
| CFR margin | $3.99-5.99/month per family |
| Setup fee | $0 |

At 500 families paying $7.99: CFR revenue $23,970/year, your revenue $24,000/year.

**Recommendation:** Start with Option B. It's simple, CFR only pays for families that actually use it, and there's no large upfront commitment that triggers committee anxiety. Move to Option A or C once you're past 200 families and have a track record.

---

## What You'd Build After the Pilot Proves Out

If the pilot works and CFR wants to roll out broadly, THEN you build:

| Feature | Why | Effort |
|---------|-----|--------|
| **Partner organization table** | Track CFR as a partner entity, not just a referral string | 1 week |
| **Partner dashboard** | CFR admin sees their families' aggregate engagement (no PII, just metrics) | 2-3 weeks |
| **Co-branded signup** | CFR logo on onboarding, "Powered by Pathible" footer | 1 week |
| **Advisor read-only view** | CFR staff can see a family's legacy plan progress (with family's consent) | 2-3 weeks |
| **Custom module config** | Toggle legal documents off if CFR prefers to handle that via attorney referrals | 1 week |
| **Bulk invitation system** | CFR imports a CSV of families, each gets a personalized invitation email | 1-2 weeks |
| **Engagement reports** | Automated monthly PDF report for CFR showing aggregate metrics | 1-2 weeks |

Total post-pilot build: **8-12 weeks** of focused development. But you don't build any of this until the pilot proves families actually use it.

---

## The Hard Truths

### Why This Could Fail

1. **CFR's investors are older.** Their median investor is likely 50-70. Many are church leaders, not tech workers. Digital adoption will be slower than you want. Budget for hand-holding.

2. **30-person team = slow decisions.** CFR is a ministry, not a startup. Expect 2-4 months from first meeting to pilot approval. They'll need board awareness if not approval. Don't mistake slow for "no."

3. **"Free" makes ministries nervous.** Free pilot sounds generous to startups. To a ministry, "free" means "what's the catch?" and "will this disappear?" Frame it as: "I'm investing in proving this works for your families. If it does, we'll discuss a sustainable partnership."

4. **Separate login is real friction.** CFR investors log into their CFR portal (FIS/iPhi platform). Now you're asking them to create a Clerk account on a different platform. This is the #1 adoption barrier. Long-term, you'd need SSO or at least "Sign in with Google" to reduce this. Short-term, crystal-clear signup instructions and a dedicated support email.

5. **Legal document liability.** CFR will ask: "Are these legal documents legally valid?" Answer honestly: "They're educational starting points with state-specific requirements. They include clear disclaimers. They're designed to prepare families for attorney conversations, not replace them." If CFR is uncomfortable, disable the legal documents module for their families and position it as "organize your information, then work with an attorney."

6. **You are one developer.** CFR will eventually ask about uptime, support SLA, data backup, and disaster recovery. Have honest answers. Convex handles infrastructure. Backblaze B2 handles document storage with 11 nines durability. Clerk handles auth. Your bus factor is 1, and that's a risk CFR should understand.

### Why This Could Work

1. **The gap is real and verified.** CFR offers legacy planning. They have no digital tool. Their competitors (other Christian financial ministries) don't either. First mover advantage in a niche.

2. **The product exists.** You're not pitching a mockup. You're showing a working platform with 6 legal document types, 50-state coverage, secure vault, financial tracking, family management, wisdom/values, and legacy planning. This took months to build. A competitor would need months to replicate it.

3. **Faith alignment is genuine.** You built this around Proverbs 13:22. The wisdom/values/core beliefs features aren't bolted-on — they're central. CFR's mission is stewardship. Your product IS digital stewardship.

4. **The tier override system is perfectly designed for this.** You can give 25 families full Legacy-tier access with one admin action per household. No billing changes, no code changes, no Clerk plan modifications. The override reason and expiration fields exist specifically for this use case.

5. **The admin dashboard lets you prove engagement.** Activity logs, per-household stats, module-by-module usage. When you sit down with Darren Key after 90 days, you'll have data, not stories.

6. **CFR's growth trajectory.** They went from $500M to $880M AUM. They launched a mobile app. They're modernizing. A digital legacy planning tool fits their trajectory.

---

## Action Items (In Order)

1. **This week:** Create the demo account. Populate it with a realistic fictional family (the Johnsons). All features filled out — vault documents, financial accounts, legacy plan, wisdom entries, core beliefs, two letters, a drafted will and healthcare POA. Screenshot every screen.

2. **This week:** Record a 3-minute walkthrough video of the demo account. No slides. Just the product. Use Loom or similar. This is your leave-behind after the email.

3. **This week:** Send the email to Darren Key. CC Daniel Patterson (VP Investment Services) if you can find his email. BCC yourself.

4. **Next week:** If no response, follow up once. Then try David Powers (Senior Regional VP) as an alternate entry point. If still no response, look for warm introductions through Kingdom Advisors, ECFA, or local church networks.

5. **While waiting:** Build the minimal pilot infrastructure (referral field, CFR landing page, admin filter). This is 1-2 weeks of work. Have it ready before the meeting, not after.

6. **Before the demo:** Practice the 30-minute walkthrough 3 times. Time yourself. Cut anything that runs long. The demo should feel like a conversation, not a pitch.

---

## Contact Information

| Person | Title | Likely Email | LinkedIn |
|--------|-------|-------------|----------|
| Darren Key | CEO & Founder | d.key@cfrministry.org | linkedin.com/in/darren-key-475b187/ |
| Daniel Patterson | VP Investment Services | d.patterson@cfrministry.org | linkedin.com/in/danielbobpatterson/ |
| David Powers | Senior Regional VP | d.powers@cfrministry.org | — |

**CFR Main:** (800) 881-3863 | Lake Mary, FL 32746
**Website:** cfrministry.org

---

## Bottom Line

You have a working product that solves a verified gap for a growing organization. The pilot requires minimal code changes (one schema field, one landing page variant, one admin filter). The existing tier override system handles access. The existing admin dashboard handles monitoring. The existing activity log handles proof.

Stop building. Start selling.
