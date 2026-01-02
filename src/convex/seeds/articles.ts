/**
 * Seed data for Educational Articles
 *
 * These articles follow Pathible's brand voice guidelines:
 * - Warm, not corporate
 * - Faith-rooted, not preachy
 * - Trustworthy, not salesy
 * - Hopeful, not morbid
 */

export type ArticleCategory =
  | "estate_planning"
  | "financial_planning"
  | "family_legacy"
  | "legal"
  | "insurance"
  | "digital_legacy"
  | "end_of_life"
  | "faith_stewardship"
  | "other";

export interface ArticleSeedData {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: ArticleCategory;
  status: "draft" | "published" | "archived";
  authorName: string;
  readTimeMinutes: number;
  viewCount: number;
}

export const articleSeedData: ArticleSeedData[] = [
  // ============================================================================
  // FAITH & STEWARDSHIP (2 articles)
  // ============================================================================
  {
    title: "What Does Biblical Stewardship Really Mean?",
    slug: "what-does-biblical-stewardship-really-mean",
    excerpt:
      "Stewardship is more than just managing money well. It's about faithfully caring for everything God has entrusted to you - including your legacy.",
    content: `# What Does Biblical Stewardship Really Mean?

*"A good man leaves an inheritance to his children's children."* - Proverbs 13:22

When most people hear "stewardship," they think about tithing or managing a budget. And yes, those are part of it. But biblical stewardship goes so much deeper than our bank accounts.

## More Than Money

At its core, stewardship is about recognizing that everything we have - our time, talents, relationships, and resources - belongs to God. We're caretakers, not owners. That shift in perspective changes everything.

Think about it this way: if you were asked to house-sit for a friend, you'd take care of their home differently than if it were just a random building. You'd be intentional. Careful. Thoughtful about what you left behind.

That's what stewardship looks like when applied to our whole lives.

## The Three Dimensions of Stewardship

### 1. Stewardship of Resources

This is the one we know best - being wise with our finances, living within our means, giving generously, and planning for the future. It means making sure our families aren't left with financial chaos when we're gone.

### 2. Stewardship of Relationships

Your relationships are a gift. Investing in your marriage, your children, your friendships - these are acts of stewardship. So is preparing those relationships to thrive even when you're not around to nurture them directly.

### 3. Stewardship of Wisdom

Perhaps the most overlooked dimension. What have you learned about life, faith, work, and love? Proverbs tells us repeatedly that wisdom is more valuable than gold. Are you passing yours down?

## Why Legacy Planning Is Stewardship

When you organize your important documents, write letters to your children, or capture your family's stories, you're not just "getting organized." You're practicing stewardship in its fullest form.

You're saying: "What God gave me matters, and I want to pass it on well."

## A Practical Starting Point

If stewardship feels overwhelming, start small:

1. **Make a list** of what you've been entrusted with - not just money, but relationships, experiences, wisdom, and influence
2. **Ask yourself** what you want each of those things to become when you're no longer managing them directly
3. **Take one step** this week toward caring for one of those areas better

Maybe that means finally writing down where your important documents are kept. Maybe it's starting a letter to your grandchildren. Maybe it's having a conversation you've been putting off.

Whatever it is, do it with intention. That's stewardship.

## The Heart of It All

Stewardship isn't a burden - it's a privilege. You've been entrusted with a life, a story, and people who matter. What you do with that trust is your legacy.

And someday, when your children's children look back at what you left them, may they find more than assets. May they find wisdom, love, and a faith worth inheriting.

---

*Ready to put stewardship into practice? Start by getting your important documents in one place where your family can find them.*`,
    category: "faith_stewardship",
    status: "published",
    authorName: "Pathible Team",
    readTimeMinutes: 5,
    viewCount: 0,
  },
  {
    title: "Teaching Your Children About Money and Faith",
    slug: "teaching-children-money-and-faith",
    excerpt:
      "How do you raise kids who are both financially wise and spiritually grounded? It starts with the conversations you have at your kitchen table.",
    content: `# Teaching Your Children About Money and Faith

*"Train up a child in the way he should go; even when he is old he will not depart from it."* - Proverbs 22:6

Here's a question most parents wrestle with: How do you teach your kids about money without making them materialistic? And how do you teach them about faith without making finances seem unspiritual?

The good news is these two things aren't at odds. In fact, they work best together.

## Money Is a Tool, Not a Taboo

One of the biggest mistakes families make is treating money as a taboo subject. Kids pick up on our discomfort, and they either become anxious about finances or assume it's not something worth learning about.

But money is simply a tool - and like any tool, it can be used well or poorly. Teaching your children this distinction early helps them develop a healthy relationship with finances.

## Start With Why, Not How

Before diving into budgeting and saving, help your children understand *why* we manage money the way we do.

For our family, that "why" is rooted in faith:
- We're caretakers of what God has given us
- Generosity is part of who we are, not just what we do
- We plan ahead because we love our family
- Our security comes from God, not from our bank balance

When kids understand the "why," the "how" makes so much more sense.

## Age-Appropriate Conversations

### Ages 3-7: Introduce the Basics
- Money is used to buy things
- We can save, spend, and give
- Some things are needs, some are wants
- God provides for our family

### Ages 8-12: Build Understanding
- Talk about how your family earns income
- Let them manage small amounts of money
- Show them the family budget (age-appropriately)
- Discuss giving as a family and let them participate

### Ages 13-18: Develop Wisdom
- Include them in some financial decisions
- Help them open a bank account
- Discuss saving for college or future goals
- Talk about avoiding debt and delayed gratification
- Model generous giving together

## Practical Ideas That Work

**1. The Three-Jar System**
Give your children three jars (or accounts): Save, Spend, and Give. When they receive money, they divide it between all three. This makes the principles tangible.

**2. Matching Gifts**
When your child wants to give to a cause, match their gift. It reinforces generosity and shows them it matters to you.

**3. The Waiting Period**
Before big purchases, implement a waiting period. This teaches delayed gratification and helps them distinguish wants from needs.

**4. Transparent Giving**
Let your children see you give - whether it's tithing, supporting missionaries, or helping someone in need. Generosity caught is as powerful as generosity taught.

**5. Stories Over Lectures**
Share stories about times God provided for your family. Tell them about financial mistakes you've made and what you learned. Kids remember stories long after they forget lectures.

## The Legacy Connection

Here's something important: the lessons you teach about money and faith today become part of your family's legacy.

When you pass down these values - through conversations, modeling, and intentional teaching - you're giving your children something more valuable than any inheritance. You're giving them wisdom.

And wisdom, as Proverbs tells us, is worth more than gold.

## A Prayer for Parents

Lord, help us teach our children well. Give us wisdom to model faithful stewardship - not perfection, but progress. May our children grow to see money as a tool for good and generosity as a way of life. And may the lessons we teach today bear fruit for generations to come. Amen.

---

*Looking for ways to organize your family's financial information so your children know where to find things someday? That's part of the legacy too.*`,
    category: "faith_stewardship",
    status: "published",
    authorName: "Pathible Team",
    readTimeMinutes: 6,
    viewCount: 0,
  },

  // ============================================================================
  // LEGACY PLANNING (2 articles)
  // ============================================================================
  {
    title: "5 Conversations Every Family Should Have (Before It's Too Late)",
    slug: "five-conversations-every-family-should-have",
    excerpt:
      "The most important things often go unsaid. Here are five conversations that can spare your family confusion, conflict, and regret.",
    content: `# 5 Conversations Every Family Should Have (Before It's Too Late)

No one wants to have difficult conversations. But here's what we've learned from families who've walked through loss: the hardest thing isn't having the conversation. It's wishing you had.

These five discussions might feel uncomfortable to start, but they're gifts to your family. Think of them as investments in their peace of mind.

## 1. "Here's Where to Find Things"

When something happens to you, your family shouldn't have to become detectives. Do they know where to find:

- Your will and any trust documents?
- Insurance policies (life, home, auto, health)?
- Bank and investment account information?
- Digital passwords and account access?
- Important contacts (attorney, financial advisor, doctor)?

You don't have to share every detail right now. But someone should know where to look. A simple conversation can save weeks of stress and uncertainty.

**How to start:** "I've been getting more organized. Let me show you where I keep our important documents."

## 2. "This Is What I Want"

Your wishes matter - for healthcare decisions, end-of-life preferences, and funeral arrangements. But if you haven't shared them, your family will have to guess. And guessing during grief leads to conflict.

Consider discussing:
- Healthcare preferences if you can't speak for yourself
- Whether you've designated a healthcare proxy
- Your thoughts on life-sustaining treatment
- Memorial or funeral preferences
- Any specific wishes for your service or burial

**How to start:** "I've been thinking about what I'd want if something happened to me. Can we talk about it?"

## 3. "Here's What I'm Leaving and Why"

This isn't about the size of your estate - it's about clarity. Unequal distributions or unexpected decisions aren't wrong, but they need explanation.

If you're leaving more to one child because they're the caregiver, say that. If you're supporting a cause that matters to you, share why. Context prevents resentment.

**How to start:** "I want you to understand my thinking, so there are no surprises or hurt feelings later."

## 4. "Who Will Take Care of..."

This conversation covers the people and responsibilities that need a plan:

- **Minor children:** Who will raise them? Have you talked to that person?
- **Aging parents:** Who's responsible for their care? How will decisions be made?
- **Pets:** Who will take them? What are their needs?
- **The family home:** What happens to it? Who decides?

These conversations prevent assumptions - and assumptions create conflict.

**How to start:** "I want to make sure we're on the same page about who would handle things if something happened."

## 5. "This Is What I Want You to Know"

Beyond the practical, there's the personal. What do you want your family to remember? What wisdom do you want to pass down? What do you want them to know about how much they mattered to you?

These words are your legacy - not just your assets.

Consider sharing:
- Stories from your life they may not know
- Lessons you've learned that you want them to carry
- What you love about each of them specifically
- Your hopes for their futures
- Your faith journey and what sustained you

**How to start:** "There are some things I want to make sure you hear from me, not just assume."

## Making It Easier

These conversations don't have to happen all at once. Start with one. Keep it casual - over coffee, during a walk, on a long drive.

And remember: you're not being morbid by planning. You're being loving. You're saying, "I care enough about you to spare you confusion and conflict."

That's a gift that lasts.

---

*Need a place to document all of this? Pathible helps you organize your documents and capture your wishes, so your family has everything in one secure place.*`,
    category: "family_legacy",
    status: "published",
    authorName: "Pathible Team",
    readTimeMinutes: 6,
    viewCount: 0,
  },
  {
    title: "The Gift of Clarity: Why Your Family Needs a Legacy Plan",
    slug: "gift-of-clarity-why-your-family-needs-legacy-plan",
    excerpt:
      "A legacy plan isn't about death - it's about love. It's the gift of clarity you give your family so they don't have to guess during the hardest season of their lives.",
    content: `# The Gift of Clarity: Why Your Family Needs a Legacy Plan

Let's be honest: "legacy planning" sounds like something for wealthy people with complicated estates and teams of attorneys.

But here's the truth: if you have a family, you have a legacy. And if you love your family, they deserve a plan.

## What Is a Legacy Plan, Really?

A legacy plan is simply this: everything your family needs to know, in one place where they can find it.

That includes:
- **Documents:** Will, insurance policies, accounts, deeds
- **Wishes:** Healthcare preferences, funeral arrangements, personal requests
- **Access:** Passwords, contacts, where things are located
- **Wisdom:** Letters, stories, values you want passed down

It's not complicated. It's just intentional.

## The Real Cost of No Plan

Here's what happens when families don't have a plan:

**Confusion:** "Where's the life insurance policy?" "Did Mom have a will?" "What bank did Dad use?"

**Conflict:** "I thought I was supposed to handle this." "Why did she leave that to him?" "Who decided this?"

**Delay:** Accounts frozen. Houses stuck in probate. Bills unpaid. Opportunities missed.

**Regret:** "I wish I had asked more questions." "I wish I knew what he wanted." "I wish she had told me."

None of this happens because families don't care. It happens because no one took the time to create clarity.

## Legacy Planning Is an Act of Love

When you create a legacy plan, you're saying to your family:

"I love you too much to leave you guessing."

"I don't want you to spend your grieving time searching for papers."

"I want you to know my wishes, not have to assume them."

"I want you to remember me for more than just what I left - I want you to remember what I believed, what I learned, what I hoped for you."

That's not morbid. That's love in action.

## What a Good Legacy Plan Includes

### 1. Essential Documents
- Will and/or trust
- Power of attorney (financial and healthcare)
- Life insurance policies
- Property deeds and titles
- Account information

### 2. Practical Information
- Location of important items (safe, keys, storage)
- Digital account access
- Key contacts (attorney, financial advisor, doctor)
- Recurring bills and obligations

### 3. Your Wishes
- Healthcare directives
- Memorial and funeral preferences
- Distribution of personal items with sentimental value
- Charitable giving intentions

### 4. Your Legacy
- Letters to loved ones
- Stories and memories worth preserving
- Values and beliefs you want passed down
- Life lessons learned

## Getting Started Is Easier Than You Think

You don't need to do this all at once. Start where you are:

**Week 1:** Gather your existing documents. Just know where they are.

**Week 2:** Write down your key contacts and account information.

**Week 3:** Think through your wishes. You don't have to share them yet - just know what they are.

**Week 4:** Write one letter to someone you love.

Small steps, taken consistently, create clarity.

## A Word About Timing

People often say, "I'll get to this later." But later has a way of never arriving.

You don't have to be old or sick or wealthy to need a plan. You just have to love someone enough to spare them chaos.

The best time to create a legacy plan was years ago. The second best time is now.

---

*Ready to start? Pathible gives you one secure place for your documents, your stories, and your wishes. Everything your family needs - together.*`,
    category: "estate_planning",
    status: "published",
    authorName: "Pathible Team",
    readTimeMinutes: 5,
    viewCount: 0,
  },

  // ============================================================================
  // FINANCIAL LITERACY (2 articles)
  // ============================================================================
  {
    title: "Getting Your Financial House in Order: A Simple Guide",
    slug: "getting-your-financial-house-in-order",
    excerpt:
      "Organizing your finances doesn't have to be overwhelming. Here's a straightforward approach to getting everything in one place.",
    content: `# Getting Your Financial House in Order: A Simple Guide

"Getting your financial house in order" sounds like a big, intimidating project. But it doesn't have to be.

Think of it like cleaning out a closet. You don't have to do it all in one weekend. You just have to start - and keep going until it's done.

## Why This Matters

Here's the reality: someday, someone will need to understand your finances. Maybe it's your spouse, your kids, or whoever you've trusted to help.

When that day comes, will they be able to find:
- Your bank accounts?
- Your investment accounts?
- Your insurance policies?
- Your debts and obligations?
- Your property documents?

If you're not sure, it's time to get organized.

## The Four-Step Process

### Step 1: Inventory Everything

Start by making a list of every financial account and asset you have. Don't worry about organizing it yet - just get it all down.

**Accounts to include:**
- Checking and savings accounts
- Investment and brokerage accounts
- Retirement accounts (401k, IRA, pension)
- Health savings accounts (HSA, FSA)
- College savings (529 plans)
- Cryptocurrency accounts

**Debts to include:**
- Mortgage(s)
- Car loans
- Student loans
- Credit cards
- Personal loans
- Lines of credit

**Assets to include:**
- Real estate properties
- Vehicles
- Valuable personal property
- Business interests

### Step 2: Gather the Documents

For each item on your list, gather the relevant documents or information:

- Account statements (one recent statement is usually enough)
- Policy documents (for insurance)
- Deeds and titles
- Loan agreements

You don't need to keep every statement ever sent. You need enough to help someone understand what you have and how to access it.

### Step 3: Create a Master Reference

Now create a simple reference document that includes:

- **For each account:** Institution name, account type, approximate value, how to access it
- **For each debt:** Lender, balance, monthly payment, due date
- **For insurance:** Company, policy number, coverage amount, beneficiaries
- **For property:** Address, ownership details, where the deed is kept

This doesn't have to be fancy - a simple spreadsheet or document works fine. The goal is giving someone a starting point.

### Step 4: Store It Securely and Tell Someone

All of this organization is only helpful if someone can find it when they need it.

Store your master reference and important documents securely - either in a fireproof safe, a secure digital vault, or both.

Then tell at least one trusted person where to find everything. This is the step most people skip - and it's the most important one.

## A Few Practical Tips

**Review annually:** Set a reminder to update your reference document once a year. Accounts change, policies lapse, circumstances shift.

**Include digital accounts:** Don't forget about online accounts, subscriptions, and digital assets. These are easy to overlook but important to document.

**Note the contacts:** Include contact information for your financial advisor, accountant, attorney, and insurance agent. These professionals can help your family navigate complex situations.

**Keep it simple:** This isn't about creating a perfect system. It's about creating enough clarity that your family isn't starting from zero.

## The Payoff

When you complete this process, you'll have:
- A clear picture of your own financial situation
- Peace of mind knowing someone else can find things
- A foundation for more detailed planning
- One less thing to worry about

And your family will have the gift of clarity - which is more valuable than you might realize.

---

*Looking for a secure place to store all of this? Pathible's Heritage Vault keeps your important documents organized and accessible to the people who need them.*`,
    category: "financial_planning",
    status: "published",
    authorName: "Pathible Team",
    readTimeMinutes: 6,
    viewCount: 0,
  },
  {
    title: "Understanding Insurance: What Your Family Needs to Know",
    slug: "understanding-insurance-what-your-family-needs-to-know",
    excerpt:
      "Insurance can be confusing, but your family needs to understand what coverage you have and how to access it. Here's a practical guide.",
    content: `# Understanding Insurance: What Your Family Needs to Know

Insurance is one of those things we buy and then try not to think about. We pay the premiums, file the documents somewhere, and hope we never need them.

But here's the problem: when insurance is actually needed, you might not be the one looking for it.

Your family needs to know what coverage you have, where the policies are, and how to file a claim. This guide will help you document and communicate that information.

## The Types of Insurance Every Family Should Consider

### Life Insurance

**What it does:** Provides financial support to your beneficiaries after your death.

**What your family needs to know:**
- Who is the insurance provider?
- What is the policy number?
- What is the death benefit amount?
- Who are the beneficiaries?
- How do they file a claim?

**Important:** Life insurance benefits aren't automatic. Your beneficiaries must file a claim with the insurance company. If they don't know the policy exists, they won't receive the benefit.

### Health Insurance

**What it does:** Covers medical expenses for you and your family.

**What your family needs to know:**
- Who is the provider and what's the group/policy number?
- What's the coverage for each family member?
- Who is the primary contact for questions or claims?
- Where are the insurance cards located?

### Homeowners/Renters Insurance

**What it does:** Protects your home and belongings against damage or theft.

**What your family needs to know:**
- Who is the provider and what's the policy number?
- What's covered and what's excluded?
- What's the deductible?
- How do they file a claim?
- Is there a home inventory documented anywhere?

### Auto Insurance

**What it does:** Covers vehicle damage, liability, and sometimes medical expenses from accidents.

**What your family needs to know:**
- Who is the provider for each vehicle?
- What are the policy numbers?
- What coverage do you have (liability, collision, comprehensive)?
- Where are the insurance cards?

### Disability Insurance

**What it does:** Replaces a portion of your income if you can't work due to illness or injury.

**What your family needs to know:**
- Do you have short-term and/or long-term disability coverage?
- Is it through your employer or a private policy?
- What's the benefit amount and waiting period?
- How do they file a claim if needed?

### Long-Term Care Insurance

**What it does:** Covers costs of extended care (nursing home, assisted living, home care) that health insurance typically doesn't cover.

**What your family needs to know:**
- Do you have a policy?
- What triggers the benefits?
- What's covered and for how long?
- How do they file a claim?

## Creating Your Insurance Summary

For each policy you have, document:

1. **Type of insurance**
2. **Provider name and phone number**
3. **Policy number**
4. **Coverage amount or benefit**
5. **Premium amount and payment frequency**
6. **Beneficiaries** (for life insurance)
7. **Where the policy document is located**

Keep this summary with your other important documents, and make sure at least one trusted person knows where to find it.

## Three Common Insurance Mistakes

### 1. Not Updating Beneficiaries

Life changes - marriages, divorces, births, deaths. Your beneficiary designations should change too. Review them at least annually.

### 2. Assuming Coverage You Don't Have

Many people assume they have coverage they don't actually have - especially for things like floods, earthquakes, or specific valuable items. Know your policy limits and exclusions.

### 3. Not Telling Anyone

The most common mistake is simply not telling family members about your insurance. A policy that no one knows about can't help anyone.

## The Conversation to Have

Sit down with your spouse or the person who would need to handle things if something happened to you. Walk through:

- What insurance policies you have
- Where the policy documents are located
- Who the beneficiaries are
- How to contact each insurance company
- Any agents or advisors who can help

This isn't a long conversation - maybe 30 minutes. But it could save your family hours of confusion and stress.

## A Note on Employer Benefits

If you have insurance through your employer, make sure you understand:
- What happens to coverage if you leave the company
- What happens to coverage if you pass away
- Whether your spouse/family can continue coverage

Employer benefits often have time limits and specific procedures. Knowing these in advance helps your family act quickly when needed.

---

*Ready to organize your insurance information? Store your policies and create a summary in Pathible's Heritage Vault, where your family can access them when needed.*`,
    category: "insurance",
    status: "published",
    authorName: "Pathible Team",
    readTimeMinutes: 7,
    viewCount: 0,
  },

  // ============================================================================
  // DOCUMENT ORGANIZATION (2 articles)
  // ============================================================================
  {
    title: "The Essential Documents Every Family Should Have",
    slug: "essential-documents-every-family-should-have",
    excerpt:
      "There are certain documents every family needs - not just for legal reasons, but for peace of mind. Here's your complete checklist.",
    content: `# The Essential Documents Every Family Should Have

When it comes to important documents, most families fall into one of two categories: "I have everything somewhere" or "I really need to get organized."

The truth is, even organized families often have gaps they don't realize until they need something urgently.

This guide walks through the essential documents every family should have - and more importantly, have organized and accessible.

## Legal Documents

### Last Will and Testament
A will specifies how your assets should be distributed and names guardians for minor children. Without one, state law decides - and it might not match your wishes.

**Do you have it?** ____
**Where is it stored?** ____

### Living Will / Advance Healthcare Directive
This document specifies your wishes for medical treatment if you can't communicate them yourself.

**Do you have it?** ____
**Where is it stored?** ____

### Healthcare Power of Attorney
Names someone to make medical decisions on your behalf if you're incapacitated.

**Do you have it?** ____
**Who is named?** ____

### Financial Power of Attorney
Names someone to handle financial matters on your behalf if you're unable to.

**Do you have it?** ____
**Who is named?** ____

### Trust Documents (if applicable)
If you have a living trust or other trust arrangements, keep the complete trust document accessible.

**Do you have it?** ____
**Where is it stored?** ____

## Financial Documents

### Bank Account Information
For each account: bank name, account number, account type, approximate balance.

### Investment Account Information
For each account: institution, account number, account type, beneficiaries.

### Retirement Account Information
For each account (401k, IRA, pension): institution, account number, beneficiaries.

### Recent Tax Returns
At minimum, keep the last three years of federal and state tax returns.

### Debt Documentation
Mortgage documents, car loans, student loans, credit card accounts - include account numbers and balances.

## Insurance Documents

### Life Insurance Policies
Include policy numbers, death benefit amounts, and beneficiaries.

### Health Insurance Information
Policy details, member IDs, and contact information.

### Homeowners/Renters Insurance
Policy details, coverage amounts, and contact information.

### Auto Insurance
Policy details for each vehicle.

### Other Insurance
Disability, long-term care, umbrella - whatever you have.

## Property Documents

### Property Deeds
For any real estate you own.

### Vehicle Titles
For cars, boats, motorcycles, RVs.

### Home Improvement Records
Major renovations, warranties, contractor information.

## Personal Documents

### Birth Certificates
For each family member.

### Social Security Cards
Or at least the numbers documented securely.

### Marriage Certificate
The official copy.

### Divorce Decree (if applicable)
Including any custody agreements.

### Passports
Note expiration dates.

### Military Records (if applicable)
DD-214 and other service records.

## The Organization System

Having the documents isn't enough - you need a system:

**1. Physical Originals**
Some documents (like wills and deeds) should be kept as originals in a fireproof safe or safe deposit box.

**2. Digital Copies**
Scan important documents and store them in a secure digital vault. This provides backup and easy access.

**3. Reference Document**
Create a master list that shows what you have and where each item is located.

**4. Trusted Access**
Make sure at least one other person knows where to find everything.

## The "What If" Test

Here's a simple test: If something happened to you tomorrow, could your family find:
- Your will?
- Your insurance policies?
- Your bank accounts?
- Your digital passwords?
- Instructions for what to do next?

If the answer to any of these is "probably not," you have work to do.

## Getting Started

Don't try to organize everything at once. Start with:

1. **This week:** Locate your will and insurance policies
2. **Next week:** Gather financial account information
3. **Following week:** Organize property and personal documents
4. **After that:** Create your master reference and share access

Small steps, steady progress. That's how it gets done.

---

*Need a secure place to store and organize all of this? Pathible's Heritage Vault is designed exactly for this purpose - keeping your family's essential documents safe and accessible.*`,
    category: "legal",
    status: "published",
    authorName: "Pathible Team",
    readTimeMinutes: 7,
    viewCount: 0,
  },
  {
    title: "Creating a Document Access Map for Your Loved Ones",
    slug: "creating-document-access-map-for-loved-ones",
    excerpt:
      "Your family shouldn't have to become detectives when they need to find important information. A document access map gives them everything they need in one place.",
    content: `# Creating a Document Access Map for Your Loved Ones

Imagine this scenario: Something unexpected happens, and your family needs to access your important information quickly. Do they know:

- Where your will is located?
- How to access your bank accounts?
- What insurance policies you have?
- Your digital passwords?
- Who to contact for help?

If you're like most people, your important information is scattered across filing cabinets, desk drawers, email accounts, and various online platforms.

A Document Access Map solves this problem. It's a single reference that tells your loved ones where to find everything and how to access it.

## What Is a Document Access Map?

A Document Access Map is simply a guide that answers three questions about your important information:

1. **What do you have?**
2. **Where is it located?**
3. **How can it be accessed?**

It's not the documents themselves - it's the roadmap to finding them.

## Building Your Document Access Map

### Section 1: Physical Locations

Start by listing where you keep important physical items:

**Home Safe**
- Location: ____
- Combination/key location: ____
- Contents: ____

**Filing Cabinet**
- Location: ____
- Organization system: ____
- Key categories: ____

**Safe Deposit Box**
- Bank name: ____
- Box number: ____
- Key location: ____
- Who has access: ____

**Other locations** (desk, closet, storage):
- What's stored where: ____

### Section 2: Digital Accounts

For online accounts, document:

**Email Accounts**
- Provider: ____
- Username: ____
- Password: (store securely separately)
- Recovery method: ____

**Banking and Financial**
- Institution: ____
- Website: ____
- Username: ____
- 2-factor authentication method: ____

**Investment Accounts**
- Institution: ____
- Website: ____
- Account numbers: ____

**Insurance Accounts**
- Company: ____
- Policy portal: ____
- Policy numbers: ____

**Subscriptions and Recurring Payments**
- Service: ____
- Payment method: ____
- Cancellation process: ____

### Section 3: Key Contacts

List the people who can help:

**Attorney**
- Name: ____
- Phone: ____
- What they handle: ____

**Financial Advisor**
- Name: ____
- Phone: ____
- Firm: ____

**Accountant/Tax Preparer**
- Name: ____
- Phone: ____

**Insurance Agent**
- Name: ____
- Phone: ____
- Policies they manage: ____

**Trusted Family/Friends**
- Name: ____
- Relationship: ____
- What they know/have access to: ____

### Section 4: Important Notes

Include any special instructions:

- What needs to happen immediately
- Who should be notified
- Any time-sensitive matters
- Special circumstances to be aware of

## Security Considerations

A Document Access Map contains sensitive information. Protect it appropriately:

**For physical copies:**
- Keep in a secure location (safe, locked drawer)
- Tell trusted people where to find it
- Consider keeping a copy with your attorney

**For digital copies:**
- Use encrypted storage
- Use strong password protection
- Consider a secure platform designed for this purpose

**For passwords:**
- Don't list actual passwords in the access map
- Reference a password manager instead
- Or store passwords in a separate, secure document

## Sharing Your Access Map

The whole point of creating this map is so someone else can use it. Make sure:

- At least one trusted person knows the map exists
- They know where to find it
- They understand how to use it
- They have any necessary passwords or combinations

Consider having a conversation where you walk through the map together. It takes 30 minutes and prevents hours of confusion later.

## Keeping It Current

Your Document Access Map is only useful if it's accurate. Set a reminder to review it:

- **Annually:** Full review and update
- **When things change:** New accounts, closed accounts, new addresses
- **Major life events:** Marriage, divorce, birth, death, retirement

An outdated map is almost as bad as no map at all.

## The Peace of Mind Factor

Creating a Document Access Map isn't just about organization - it's about peace of mind.

For you: knowing that your affairs are in order and your family is prepared.

For your family: knowing they won't have to search through drawers and guess at passwords during an already difficult time.

That peace is worth the effort.

---

*Pathible makes creating and maintaining your Document Access Map simple. Keep everything organized in one secure place, with controlled access for the people who need it.*`,
    category: "digital_legacy",
    status: "published",
    authorName: "Pathible Team",
    readTimeMinutes: 7,
    viewCount: 0,
  },
];
