# B2B Pivot Strategy: Lawyers + CFR Partnership

**Date:** February 16, 2026

---

## The Two-Channel Approach

You have two distinct B2B channels, each using different parts of the existing codebase.

| Channel | Core Asset | Their Pain | Your Solution |
|---------|-----------|------------|---------------|
| **Estate Planning Lawyers** | Legal document wizards + vault | Client intake takes 3-5 hours per estate plan | Self-service intake portal that delivers draft-ready documents |
| **CFR (Christian Financial Resources)** | Vault + legacy planning + wisdom | Need to deepen stewardship beyond investments | Faith-aligned legacy tool that delivers on their existing promise |

---

## Channel 1: Estate Planning Lawyers

### What Lawyers Pay Today

| Tool | Price | What It Does |
|------|-------|-------------|
| **DecisionVault** | $99-990/month | Client intake questionnaires for estate planning |
| **WealthCounsel** | ~$200-400/month | Document drafting templates (300+ templates) |
| **Clio** | $49+/month per user | Practice management + client portal |
| **Smokeball** | $49-89/month per user | Practice management + 20K document templates |
| **Gavel** | $83+/month | Document automation + intake |

Lawyers already spend $200-600/month across multiple tools for intake + document drafting + client portal. Pathible combines all three.

### The Pitch

**Don't say:** "We generate legal documents for your clients."

**Do say:** "Your clients come to you with organized information and draft documents, cutting your intake time from 4 hours to 30 minutes."

**The value math:**
- Average estate plan fee: $2,000-5,000
- Lawyer time on intake + initial drafting: 3-5 hours at $250-400/hour
- Time saved per client with Pathible: ~3 hours = $750-1,200 recovered
- 10 new estate plans/month = **$7,500-12,000/month in recovered capacity**
- Your fee: $149-399/month = **20-50x ROI**

**The opener:**

> "I built a platform that lets your estate planning clients fill out their intake at home — assets, beneficiaries, guardians, healthcare wishes, all state-specific. They upload their existing documents to a secure vault. By the time they sit down with you, you have a complete picture and draft documents ready for review. Would you be open to trying it with your next 5 clients?"

### What You'd Build (4-6 weeks)

What already exists is substantial: 6 legal document wizards with 50-state requirements, secure vault, person/beneficiary management, financial tracking, activity logging, PDF generation.

**Must build:**
1. **Advisor/lawyer read-only view** — Dashboard showing client's completed intake and uploaded documents
2. **Referral link system** — Unique signup URL per lawyer (`/signup?ref=attorney-smith`), tracked in database
3. **Document sharing** — Time-limited signed URLs so lawyers can view client vault documents
4. **"Attorney Reviewed" status** — Status field on legal documents (draft > complete > attorney-reviewed > executed)
5. **Lawyer branding on PDF cover** — Firm name and contact info on generated documents

### Pricing for Lawyers

| Plan | Monthly Base | Clients Included | Extra Client | Target |
|------|-------------|-----------------|-------------|--------|
| **Solo** | $149/month | 10 | $12/client | Solo practitioners |
| **Firm** | $299/month | 30 | $8/client | Small firms (2-5 attorneys) |
| **Enterprise** | $499/month | 75 | $5/client | Mid-size firms |

"Active client" = household with activity in last 90 days.

**Why this works:** DecisionVault charges $99-990/month for intake alone (no vault, no document generation). WealthCounsel charges $200-400/month for templates alone (no intake, no vault). Pathible at $149-499 delivers intake + templates + vault.

### Getting the First 5 Lawyers

1. **Free 90-day pilot** — "I'll set up 5 of your next clients. If it saves you time, we talk pricing."
2. **Local estate planning attorneys** through church, bar association, LinkedIn
3. **State bar "technology" sections** that showcase new tools
4. **Local CLE events** (Continuing Legal Education) — lawyers must attend these
5. **Ask CFR** — they know estate planning attorneys who serve their member churches

---

## Channel 2: CFR (Christian Financial Resources)

### Understanding CFR

CFR is a **ministry**, not a financial advisory firm:
- **$850M+ in managed assets**, 7,800+ investors
- Serves independent Christian churches and their ministries
- Services: loans, investments, donor-advised funds, **legacy planning**, capital campaigns
- 38 employees, Lake Mary, FL
- **Already offers "legacy planning" as a service line** — this is your entry point

**The critical insight:** CFR already tells their 7,800 investors they help with legacy planning. They just don't have a software platform to deliver it. You're not selling a new idea — you're giving them a tool to deliver on a promise they already make.

### The Pitch

**Don't say:** "We built a legacy planning app for Christian families."

**Do say:** "You already promise legacy planning to your 7,800 investors. We give you the platform to deliver it at scale."

**The opener:**

> "I noticed CFR offers legacy planning as part of your Stewardship Steps. I built a platform specifically for Christian families to organize their legacy — documents, finances, wishes, values, letters to loved ones. It's built on Proverbs 13:22 and it's production-ready. I'd love to show it to you and explore whether it could serve your investors. Would a 30-minute demo work?"

**Why CFR should care:**
1. **Deepens relationship** with 7,800+ investors — stickier engagement
2. **Extends stewardship mission** — legacy planning is spiritual, not just financial
3. **Differentiator** — no other Christian financial ministry offers this
4. **Revenue opportunity** — charge for it or include as premium benefit
5. **Referral pipeline** — identifies families who need estate planning help

### What You'd Build (6-8 weeks)

Everything faith-based is already built: vault, legacy planning, wisdom entries, financial tracking, family management, onboarding, email system, the entire Proverbs 13:22 brand.

**Must build:**
1. **Organization table** — Link households to partner org (CFR)
2. **Partner referral tracking** — CFR-branded signup URL, attribution in database
3. **Tier override automation** — CFR referrals automatically get Heritage/Legacy features
4. **Partner dashboard (basic)** — CFR admin sees total households, active users, feature usage
5. **Co-branded theming** — CFR logo alongside Pathible, optional color adjustment
6. **Module toggles per partner** — CFR may not want legal documents (they'd refer to attorneys)

### Pricing for CFR

CFR is a ministry with 38 employees. They won't pay enterprise SaaS prices. Three options:

**Option A: Flat License**

| Component | Price |
|-----------|-------|
| Platform license | $1,500/month |
| Includes | Up to 200 households |
| Additional households | $5/household/month |
| Setup fee | $2,500 one-time |

Annual: ~$18,000/year base + overage.

**Option B: Revenue Share (recommended)**

| Component | Details |
|-----------|---------|
| Platform license | $500/month (reduced) |
| CFR charges families | $7.99-9.99/month |
| Revenue split | 60% CFR / 40% Pathible |
| Setup fee | $0 |

At 500 families paying $7.99: CFR keeps $2,397/month (new revenue), you get $2,098/month. At 1,000 families: CFR gets $4,794, you get $3,696. Their incentive to promote aligns with yours.

**Option C: Free Pilot First (start here regardless)**

Free 6-month pilot for 50 CFR families. Prove engagement. Then negotiate from data, not hypotheticals.

### Getting the CFR Meeting

1. **Find the stewardship/legacy planning owner.** CEO is Darren Key, but you need the VP or Director level first.
2. **Use their language.** Say "stewardship tool" and "legacy planning ministry," not "SaaS platform."
3. **Lead with their gap.** "You offer legacy planning. What tool do you give families to actually do it?"
4. **Offer the pilot for free.** "Give me 25 families. 90 days. If they engage, we talk."

**Warm intro paths:** Church connections, Kingdom Advisors / CKA network, ECFA events, Christian Leadership Alliance conferences.

---

## The Everplans Precedent

Everplans went through this exact transition and it's your playbook:

| Phase | Everplans | Pathible |
|-------|-----------|---------|
| Started as | Consumer legacy planning app | Consumer legacy planning app |
| Consumer result | Low adoption | Low adoption (same problem) |
| Pivoted to | B2B for financial advisors ($190+/month) | B2B for lawyers + CFR |
| B2B result | Acquired by NGL Insurance (2021), then Precoa (2024) | TBD |
| Key lesson | Advisors paid because it deepened client relationships | Same value prop for both channels |

Everplans proved the category works as B2B. Pathible has a stronger niche (faith-based) and more features (legal documents) than Everplans had at launch.

---

## Which Channel First?

**Start with lawyers.**

| Factor | Lawyers | CFR |
|--------|---------|-----|
| Sales cycle | 1-2 weeks | 2-6 months |
| Decision maker | 1 person | Committee |
| Revenue/deal | $149-499/month | $1,500-3,000/month |
| Build effort | 4-6 weeks | 6-8 weeks |
| Validation speed | Fast (pilot in 30 days) | Slow (3-6 months to arrange) |

**Sequence:**
1. **Weeks 1-4:** Build lawyer features (referral links, advisor view, document sharing)
2. **Weeks 2-6:** Start CFR outreach simultaneously (relationship building while you build)
3. **Weeks 5-8:** Pilot with 3-5 lawyers, iterate on feedback
4. **Weeks 6-10:** Build CFR features (org table, co-branding, partner dashboard)
5. **Weeks 8-12:** CFR pilot launch (25-50 families)

---

## Risk Factors

### Lawyer Channel
- **Legal liability** — Lawyers will scrutinize your templates. Get one attorney to review your output before pitching. "Educational purposes only" may not satisfy them.
- **Integration expectations** — They'll ask about Clio/PracticePanther/WealthCounsel. Be honest: "Focused on intake and vault first."
- **Solo attorney budgets** — $149/month is real money for lean practices. The free pilot removes this.

### CFR Channel
- **Slow decisions** — Ministry = committee approval, budget cycles, board review. Don't count on fast revenue.
- **Brand sensitivity** — CFR will want content review for theological alignment.
- **Tech comfort** — Church leaders and older investors may have lower digital comfort. Onboarding must be dead simple.
- **Single customer risk** — If CFR is your only B2B customer, losing them is catastrophic. Lawyer channel diversifies this.

---

## Bottom Line

You built a $150-500/month B2B product disguised as a $10-50/month consumer app. The features are the same — the buyer is different. Lawyers need client intake tools (you have one with 50-state coverage). CFR needs a legacy planning delivery platform (you built exactly that). Neither requires a dramatic rebuild. Both require conversations, not code.

Go get the meetings.
