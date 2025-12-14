# Plans & Features Schema Design

## Overview

This document outlines the data model for subscription plans and feature-based permissions in Pathible. The design enables:

- **Plans** with marketing descriptions (500 char limit)
- **Features** as permission areas with descriptions (500 char limit)
- **Role-based permissions** per feature (owner, steward, viewer, executor)
- **Plan-feature linking** with tier-specific limits

---

## Current State

### Existing Roles (in `householdMemberships`)

- `owner` - Full control
- `steward` - Admin access (can't modify owners)
- `viewer` - Read-only access
- `executor` - Special role for legacy planning

### Current Permission Checks

- `requireAuth()` - Is user authenticated?
- `requireHouseholdAccess()` - Is user a member?
- `requireHouseholdAdmin()` - Is user owner or steward?
- Document-level: `household`, `admins`, `custom` access levels

### Gap

- Subscription tiers stored (`foundations`, `heritage`, `legacy`) but not enforced
- No feature-based permission checks
- Roles are checked ad-hoc, not systematically per feature

---

## Proposed Schema

### 1. `plans` Table

```typescript
plans: defineTable({
  slug: v.string(), // "foundations", "heritage", "legacy"
  name: v.string(), // "Foundations"
  description: v.string(), // Max 500 chars - marketing copy
  focus: v.string(), // Short tagline

  // Pricing (in cents)
  priceMonthly: v.number(), // 999, 2499, 4999
  priceYearly: v.optional(v.number()),
  currency: v.string(), // "USD"

  // Member limits
  maxMembers: v.number(), // 1, 3, -1 (unlimited)

  // Display
  orderIndex: v.number(),
  isActive: v.boolean(),
  updatedAt: v.number(),
})
  .index("by_slug", ["slug"])
  .index("by_isActive", ["isActive"]);
```

### 2. `features` Table

Features ARE the areas for role permissions:

```typescript
features: defineTable({
  slug: v.string(), // "vault_documents", "financial_insights"
  name: v.string(), // "Heritage Vault Documents"
  description: v.string(), // Max 500 chars - explains the feature

  // Grouping
  area: v.union(
    v.literal("heritage_vault"),
    v.literal("financial"),
    v.literal("family_network"),
    v.literal("legacy_builder"),
    v.literal("wisdom"),
    v.literal("support"),
    v.literal("access")
  ),

  // UI
  icon: v.optional(v.string()), // Lucide icon name
  orderIndex: v.number(),

  isActive: v.boolean(),
  updatedAt: v.number(),
})
  .index("by_slug", ["slug"])
  .index("by_area", ["area"])
  .index("by_isActive", ["isActive"]);
```

### 3. `featurePermissions` Table

Defines what each role can do within a feature:

```typescript
featurePermissions: defineTable({
  featureId: v.id("features"),

  role: v.union(
    v.literal("owner"),
    v.literal("steward"),
    v.literal("viewer"),
    v.literal("executor")
  ),

  // CRUD-style permissions
  canView: v.boolean(),
  canCreate: v.boolean(),
  canEdit: v.boolean(),
  canDelete: v.boolean(),

  // Special permissions
  canShare: v.optional(v.boolean()),
  canExport: v.optional(v.boolean()),
  canManage: v.optional(v.boolean()), // Admin-level within feature

  // Notes for admin reference
  notes: v.optional(v.string()),
})
  .index("by_feature", ["featureId"])
  .index("by_feature_and_role", ["featureId", "role"]);
```

### 4. `planFeatures` Table

Links plans to features with tier-specific config:

```typescript
planFeatures: defineTable({
  planId: v.id("plans"),
  featureId: v.id("features"),

  isIncluded: v.boolean(),

  // Tier-specific limits
  limit: v.optional(v.number()),
  limitType: v.optional(v.string()), // "storage_gb", "count"

  // Tier label (e.g., "Basic", "Advanced", "Premium")
  tierLabel: v.optional(v.string()),

  // Display note (e.g., "Up to 5GB", "Unlimited")
  note: v.optional(v.string()),
})
  .index("by_plan", ["planId"])
  .index("by_feature", ["featureId"])
  .index("by_plan_and_feature", ["planId", "featureId"]);
```

### 5. `featureAccessLog` Table (Audit)

```typescript
featureAccessLog: defineTable({
  profileId: v.id("profiles"),
  householdId: v.id("households"),
  featureSlug: v.string(),
  action: v.string(), // "view", "create", "edit", "delete", "share"
  allowed: v.boolean(),
  reason: v.optional(v.string()), // Why denied
  timestamp: v.number(),
})
  .index("by_profile", ["profileId"])
  .index("by_household", ["householdId"])
  .index("by_feature", ["featureSlug"])
  .index("by_timestamp", ["timestamp"]);
```

---

## Plan Descriptions (500 chars each)

### Foundations ($9.99/month)

> Start your family's digital legacy with secure, encrypted storage for your most important documents. Upload photos, videos, and files with confidence. Get a clear view of your linked financial accounts in one place. Perfect for individuals or couples beginning their organization journey. Includes one viewer slot to share access with a trusted family member. Standard support included.

### Heritage ($24.99/month)

> The complete Pathible experience for growing families. Organize your Heritage Vault with tags, collections, and guided workflows. Capture memories through voice recordings and written stories. Gain financial clarity with summaries and insights. Connect up to three family members with customizable access levels. Enjoy priority support and early access to Family Network features. Share messages inside the family space.

### Legacy ($49.99/month)

> Build a lasting legacy for generations. Unlimited family members collaborate seamlessly with advanced profiles and relationship mapping. Unlock the full Legacy Builder with guided questionnaires and story templates. Share wisdom pages to pass down values and life lessons. Get comprehensive financial insights with spending trends. Receive concierge support and first access to every new feature we release.

---

## Features by Area (23 total)

### Heritage Vault (6 features)

| Slug                        | Name                    | Description                                                                                                                                                                                                     |
| --------------------------- | ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `vault_document_storage`    | Secure document storage | Store important documents with bank-level encryption. Upload wills, deeds, insurance policies, and certificates. All files are encrypted at rest and in transit. Access your documents anytime from any device. |
| `vault_photo_video`         | Photo & video uploads   | Preserve family memories with photo and video storage. Upload directly from your device or import from cloud services. Organize by date, event, or family member.                                               |
| `vault_folders`             | Folder organization     | Create folders to organize your documents. Nest folders for complex organization. Move and copy files between folders easily.                                                                                   |
| `vault_tags_collections`    | Tags & collections      | Add tags to documents for powerful search and filtering. Create curated collections around themes like "Estate Planning" or "Family History".                                                                   |
| `vault_voice_uploads`       | Voice recordings        | Record voice memos and oral histories directly in the app. Preserve stories, memories, and messages in your own voice for future generations.                                                                   |
| `vault_guided_organization` | Guided organization     | Step-by-step wizards help you organize documents properly. Get prompts for missing documents. Follow best practices for document management.                                                                    |

### Financial Intelligence (5 features)

| Slug                            | Name                | Description                                                                                                                          |
| ------------------------------- | ------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `financial_overview`            | Financial overview  | See all your linked accounts in one place. Get a snapshot of your financial health. Track account balances and net worth over time.  |
| `financial_summaries`           | Account summaries   | Detailed summaries for each financial account. See recent transactions and balance history. Compare accounts side by side.           |
| `financial_insights`            | Financial insights  | AI-powered insights about your financial health. Identify spending patterns and opportunities. Get personalized recommendations.     |
| `financial_spending_categories` | Spending categories | Automatic categorization of your spending. See where your money goes each month. Set category budgets and track progress.            |
| `financial_trends`              | Trend analysis      | View spending and saving trends over time. Compare month-over-month and year-over-year. Identify seasonal patterns in your finances. |

### Family Network (4 features)

| Slug                   | Name                 | Description                                                                                                                                       |
| ---------------------- | -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `family_members`       | Family members       | Add family members to your household. Control access levels for each member. Invite members via email with secure links.                          |
| `family_profiles`      | Member profiles      | Rich profiles for each family member. Store birthdays, contact info, and notes. See activity and contributions from each member.                  |
| `family_relationships` | Relationship mapping | Visualize family relationships on an interactive map. Define parent-child, sibling, and extended family connections. Build a digital family tree. |
| `family_messaging`     | Family messaging     | Private messaging within your household. Share updates, coordinate on tasks. Keep family communication in one place.                              |

### Legacy Builder (2 features)

| Slug                     | Name                  | Description                                                                                                                                                    |
| ------------------------ | --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `legacy_questionnaires`  | Guided questionnaires | Thoughtful prompts help you document your life story. Answer questions about values, experiences, and wishes. Build a comprehensive legacy document over time. |
| `legacy_story_templates` | Story templates       | Pre-built templates for common legacy topics. Write about your childhood, career, marriage, and more. Share stories with family now or after you're gone.      |

### Wisdom (2 features)

| Slug                  | Name                | Description                                                                                                                                        |
| --------------------- | ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `wisdom_entries`      | Wisdom entries      | Document family values, lessons learned, and life advice. Create entries for different life stages and situations. Tag entries for easy discovery. |
| `wisdom_shared_pages` | Shared wisdom pages | Collaborative pages where family members contribute wisdom. Build a family playbook together. Pass down collective knowledge.                      |

### Support (3 features)

| Slug                | Name              | Description                                                                                                           |
| ------------------- | ----------------- | --------------------------------------------------------------------------------------------------------------------- |
| `support_standard`  | Standard support  | Email support with 48-hour response time. Access to help center and documentation. Community forums for peer support. |
| `support_priority`  | Priority support  | Priority email with 24-hour response. Live chat during business hours. Dedicated support queue.                       |
| `support_concierge` | Concierge support | Personal support representative. Same-day response guaranteed. Phone support and screen sharing available.            |

### Access (1 feature)

| Slug                    | Name                 | Description                                                                                                                  |
| ----------------------- | -------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `early_access_features` | Early feature access | Get new features before general release. Provide feedback to shape product direction. Be first to try experimental features. |

---

## Permission Matrix

| Feature                | Owner         | Steward      | Viewer | Executor      |
| ---------------------- | ------------- | ------------ | ------ | ------------- |
| **Heritage Vault**     | CRUD + Share  | CRUD + Share | View   | View          |
| **Financial Overview** | CRUD          | CRUD         | -      | View          |
| **Financial Insights** | CRUD          | CRUD         | -      | View          |
| **Family Members**     | CRUD + Manage | CRUD         | View   | View          |
| **Legacy Planning**    | CRUD          | View         | -      | View + Export |
| **Wisdom Entries**     | CRUD          | CRUD         | View   | View          |

---

## Plan Feature Matrix

| Feature            | Foundations | Heritage        | Legacy          |
| ------------------ | ----------- | --------------- | --------------- |
| Vault Documents    | Basic (5GB) | Advanced (25GB) | Premium (100GB) |
| Photo/Video        | Yes         | Yes             | Yes             |
| Tags/Collections   | -           | Yes             | Yes             |
| Voice Uploads      | -           | Yes             | Yes             |
| Financial Overview | Basic       | Full            | Full            |
| Financial Insights | -           | Basic           | Advanced        |
| Spending Trends    | -           | -               | Yes             |
| Family Members     | 1 viewer    | 3 members       | Unlimited       |
| Family Profiles    | -           | Early Access    | Yes             |
| Relationship Map   | -           | -               | Yes             |
| Messaging          | -           | Yes             | Yes             |
| Legacy Builder     | -           | -               | Yes             |
| Wisdom Pages       | -           | -               | Yes             |
| Support            | Standard    | Priority        | Concierge       |
| Early Access       | -           | Some            | All             |

---

## Permission Helper Function

```typescript
// In auth.ts
export async function requireFeatureAccess(
  ctx: QueryCtx | MutationCtx,
  householdId: Id<"households">,
  featureSlug: string,
  action: "view" | "create" | "edit" | "delete" | "share" | "manage"
): Promise<void> {
  // 1. Get membership and role
  const membership = await requireHouseholdAccess(ctx, householdId);

  // 2. Get household's plan
  const household = await ctx.db.get(householdId);
  const plan = await ctx.db
    .query("plans")
    .withIndex("by_slug", (q) => q.eq("slug", household.subscriptionTier))
    .unique();

  // 3. Check if feature is included in plan
  const feature = await ctx.db
    .query("features")
    .withIndex("by_slug", (q) => q.eq("slug", featureSlug))
    .unique();

  const planFeature = await ctx.db
    .query("planFeatures")
    .withIndex("by_plan_and_feature", (q) =>
      q.eq("planId", plan._id).eq("featureId", feature._id)
    )
    .unique();

  if (!planFeature?.isIncluded) {
    throw new Error("Feature not available in your plan");
  }

  // 4. Check role permission for this feature
  const permission = await ctx.db
    .query("featurePermissions")
    .withIndex("by_feature_and_role", (q) =>
      q.eq("featureId", feature._id).eq("role", membership.role)
    )
    .unique();

  const actionMap = {
    view: permission?.canView,
    create: permission?.canCreate,
    edit: permission?.canEdit,
    delete: permission?.canDelete,
    share: permission?.canShare,
    manage: permission?.canManage,
  };

  if (!actionMap[action]) {
    throw new Error(`You don't have permission to ${action} this`);
  }

  // 5. Log access attempt (audit)
  await ctx.db.insert("featureAccessLog", {
    profileId: membership.userId,
    householdId,
    featureSlug,
    action,
    allowed: true,
    timestamp: Date.now(),
  });
}
```

---

## Implementation Steps

### Step 1: Add Schema Tables

**File**: `src/convex/schema.ts`

- Add `plans` table
- Add `features` table
- Add `featurePermissions` table
- Add `planFeatures` table
- Add `featureAccessLog` table

### Step 2: Create Plans Module

**File**: `src/convex/plans.ts` (new)

- `getPlans` - List all active plans
- `getPlanBySlug` - Get single plan with features
- `getFeatures` - List all features grouped by area
- `getFeaturePermissions` - Get permissions for a feature
- Admin mutations: `createPlan`, `updatePlan`, `createFeature`, etc.

### Step 3: Create Seed Data

**File**: `src/convex/seedPlans.ts` (new)

- Seed 3 plans with descriptions
- Seed 23 features with descriptions
- Seed feature permissions (4 roles x 23 features = 92 records)
- Seed plan-feature links (3 plans x 23 features = 69 records)

### Step 4: Add Permission Helper

**File**: `src/convex/auth.ts`

- Add `requireFeatureAccess(ctx, householdId, featureSlug, action)`
- Add `checkPlanLimit(ctx, householdId, featureSlug)` for storage/member limits
- Add `logFeatureAccess(ctx, ...)` for audit logging

### Step 5: Update Existing Modules

- `vault.ts` - Add `requireFeatureAccess(ctx, householdId, "vault_document_storage", "create")`
- `financial.ts` - Check `financial_overview`, `financial_insights`
- `familyEcosystem.ts` - Check `family_members`, `family_profiles`
- `legacy.ts` - Check `legacy_questionnaires`, `legacy_story_templates`
- `households.ts` - Check member limits before inviting

---

## Design Decisions

1. **Limits**: Enforce with grace period - allow 10% overage, then block new additions
2. **Free tier**: No free tier - users must subscribe to access features
3. **Audit logging**: Log all access attempts (successful + denials) for compliance and debugging

   ***

   Foundations Plan ($9.99/month)

"Start your family's digital legacy"

| Feature Slug        | Display Name            | Description                                                       |
| ------------------- | ----------------------- | ----------------------------------------------------------------- |
| vault_storage_basic | Secure Document Storage | Store up to 5GB of important documents with bank-level encryption |
| vault_photos_videos | Photo & Video Uploads   | Preserve family memories with photo and video storage             |
| vault_folders       | Folder Organization     | Create folders to organize your documents                         |
| financial_overview  | Financial Overview      | See all your linked accounts in one place                         |
| family_members_1    | 1 Family Viewer         | Share read-only access with one trusted family member             |
| support_standard    | Standard Support        | Email support with 48-hour response time                          |

---

Heritage Plan ($24.99/month)

"The complete Pathible experience for growing families"

| Feature Slug              | Display Name            | Description                                           |
| ------------------------- | ----------------------- | ----------------------------------------------------- |
| vault_storage_advanced    | Advanced Storage (25GB) | Store up to 25GB of documents, photos, and videos     |
| vault_photos_videos       | Photo & Video Uploads   | Preserve family memories with photo and video storage |
| vault_folders             | Folder Organization     | Create folders to organize your documents             |
| vault_tags_collections    | Tags & Collections      | Organize with tags and curated collections            |
| vault_voice_recordings    | Voice Recordings        | Record oral histories and voice memos                 |
| vault_guided_organization | Guided Organization     | Step-by-step wizards for document management          |
| financial_overview        | Financial Overview      | See all your linked accounts in one place             |
| financial_summaries       | Account Summaries       | Detailed summaries for each financial account         |
| financial_insights_basic  | Financial Insights      | AI-powered insights about your financial health       |
| family_members_3          | 3 Family Members        | Connect up to 3 family members with custom access     |
| family_profiles           | Member Profiles         | Rich profiles for each family member                  |
| family_messaging          | Family Messaging        | Private messaging within your household               |
| wisdom_entries            | Wisdom Entries          | Document family values, lessons, and life advice      |
| support_priority          | Priority Support        | 24-hour response time with live chat                  |
| early_access_some         | Early Access            | Get some new features before general release          |

---

Legacy Plan ($49.99/month)

"Build a lasting legacy for generations"

| Feature Slug                | Display Name                | Description                                             |
| --------------------------- | --------------------------- | ------------------------------------------------------- |
| vault_storage_unlimited     | Unlimited Storage           | Store unlimited documents, photos, and videos           |
| vault_photos_videos         | Photo & Video Uploads       | Preserve family memories with photo and video storage   |
| vault_folders               | Folder Organization         | Create folders to organize your documents               |
| vault_tags_collections      | Tags & Collections          | Organize with tags and curated collections              |
| vault_voice_recordings      | Voice Recordings            | Record oral histories and voice memos                   |
| vault_guided_organization   | Guided Organization         | Step-by-step wizards for document management            |
| financial_overview          | Financial Overview          | See all your linked accounts in one place               |
| financial_summaries         | Account Summaries           | Detailed summaries for each financial account           |
| financial_insights_advanced | Advanced Financial Insights | Comprehensive insights with spending trends             |
| financial_trends            | Trend Analysis              | View spending and saving trends over time               |
| family_members_unlimited    | Unlimited Family Members    | Connect unlimited family members                        |
| family_profiles             | Member Profiles             | Rich profiles for each family member                    |
| family_relationships        | Relationship Mapping        | Interactive family tree with relationship visualization |
| family_messaging            | Family Messaging            | Private messaging within your household                 |
| legacy_questionnaires       | Legacy Questionnaires       | Guided prompts to document your life story              |
| legacy_story_templates      | Story Templates             | Pre-built templates for common legacy topics            |
| wisdom_entries              | Wisdom Entries              | Document family values, lessons, and life advice        |
| wisdom_shared_pages         | Shared Wisdom Pages         | Collaborative pages for family wisdom                   |
| support_concierge           | Concierge Support           | Personal support rep with same-day response             |
| early_access_all            | Full Early Access           | First access to every new feature                       |

---

Feature Summary by Area

| Area               | Foundations | Heritage  | Legacy    |
| ------------------ | ----------- | --------- | --------- |
| Vault Storage      | 5GB         | 25GB      | Unlimited |
| Tags & Collections | -           | ✓         | ✓         |
| Voice Recordings   | -           | ✓         | ✓         |
| Financial Insights | -           | Basic     | Advanced  |
| Spending Trends    | -           | -         | ✓         |
| Family Members     | 1 viewer    | 3 members | Unlimited |
| Relationship Map   | -           | -         | ✓         |
| Family Messaging   | -           | ✓         | ✓         |
| Legacy Builder     | -           | -         | ✓         |
| Shared Wisdom      | -           | -         | ✓         |
| Support            | Standard    | Priority  | Concierge |
| Early Access       | -           | Some      | All       |
