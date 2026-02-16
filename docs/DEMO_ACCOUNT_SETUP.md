# Demo Account Setup

How to create a fully populated demo account for presentations, partner demos (e.g., CFR), or development testing — **without going through onboarding or billing**.

## Prerequisites

- Access to the [Clerk Dashboard](https://dashboard.clerk.com) for the target environment (dev or prod)
- Convex CLI installed (`npx convex` works)
- Convex environment configured (`.env.local` with `CONVEX_DEPLOYMENT`)

## Step-by-Step

### 1. Create a Clerk Account

Sign up at the app's sign-up page (e.g., `localhost:3000/sign-up` for dev). Just create the account — **stop there**. Do not proceed through onboarding.

For development, you can use the test account:
- **Email**: `jamesvgibbs+clerk_test@gmail.com`
- **Verification Code**: `424242`

### 2. Copy the Clerk User ID

Go to **Clerk Dashboard > Users**, click the user, and copy the **User ID** (starts with `user_`).

### 3. Run the Seed

```bash
npx convex run seeds/seedDemoAccount:seed \
  --args '{"clerkUserId": "user_xxx"}'
```

That's it. The seed creates everything:

| What | Details |
|---|---|
| **Profile** | "David Harrison" (created if missing, onboarding marked complete) |
| **Household** | "The Harrison Family" with Legacy tier override |
| **Family Members** | David (you), Sarah (spouse), Michael (child), Rebecca (child) |
| **Wisdom Entries** | 3 entries — generosity, sabbath practice, family finances |
| **Core Beliefs** | 2 entries — faith-guided finances, family as investment |
| **Financial Accounts** | Savings ($45k) and Retirement 401k ($285k) |
| **User Preferences** | Legacy planning, family heritage, financial clarity |

### 4. Log In

Sign in with the Clerk account from step 1. You'll land directly on `/dashboard` with full **Legacy-tier** access. No onboarding redirect, no billing gate.

## The Harrison Family Narrative

The seed data tells a coherent story. The demo user is **David Harrison**, patriarch of a faith-oriented family. The wisdom entries are written in his first-person voice, referencing his wife Sarah and their children. The core beliefs and financial data reinforce the family's values.

**Default names**: `firstName: "David"`, `lastName: "Harrison"`. You can override these, but the wisdom entries and family narrative will feel disconnected if you do.

If you need a different persona, override only for non-demo purposes:

```bash
npx convex run seeds/seedDemoAccount:seed \
  --args '{"clerkUserId": "user_xxx", "firstName": "Custom", "lastName": "Name", "email": "custom@example.com"}'
```

## Cleanup

To remove all demo data and reset the profile:

```bash
npx convex run seeds/seedDemoAccount:cleanup \
  --args '{"confirmDelete": true}'
```

This deletes everything created by the seed:
- Household, memberships, family units, family members
- Wisdom entries, core beliefs, financial accounts
- User preferences

It also **resets the profile** (sets `onboardingStatus` back to `"not_started"`) but does **not delete the profile itself** — the Clerk account remains intact and can be re-seeded.

## Re-seeding

To reset and re-seed:

```bash
# 1. Clean up
npx convex run seeds/seedDemoAccount:cleanup --args '{"confirmDelete": true}'

# 2. Seed again
npx convex run seeds/seedDemoAccount:seed --args '{"clerkUserId": "user_xxx"}'
```

The seed checks for an existing household and will error if one already exists. Always run cleanup first.

## Troubleshooting

| Problem | Cause | Fix |
|---|---|---|
| "This user already has a household" | Seed was already run for this user | Run `cleanup` first, then re-seed |
| Redirected to `/onboarding` | Profile's `onboardingStatus` isn't `"complete"` | The seed sets this automatically — re-run the seed |
| Redirected to `/select-plan` | No `tierOverride` on the household | The seed sets `tierOverride: "legacy"` — verify the household was created |
| Wisdom entries feel wrong | Overrode the default name | The entries reference "Sarah and I" — use David Harrison for demos |
