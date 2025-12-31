# Schema Entity Roadmap

This document tracks the implementation status of all Convex schema entities and their planned development timeline.

> **Last Updated:** December 2024
> **Source of Truth:** `src/convex/schema.ts`

## Implementation Status Legend

| Status | Meaning |
|--------|---------|
| **ACTIVE** | Fully implemented with CRUD operations |
| **PARTIAL** | Schema exists, implementation incomplete |
| **PLANNED** | Schema exists, implementation deferred to specific milestone |
| **REMOVED** | Previously existed, now removed |

---

## Core Tables (ACTIVE)

These tables are fully implemented and in production use.

### Authentication & User Management
| Table | Status | Notes |
|-------|--------|-------|
| `profiles` | ACTIVE | Extends Clerk user data with profile info |
| `userRoles` | ACTIVE | Admin access control (`admin` \| `user`) |
| `userPreferences` | ACTIVE | Onboarding goals and communication preferences |

### Household & Family Structure
| Table | Status | Notes |
|-------|--------|-------|
| `households` | ACTIVE | Primary organizational unit |
| `householdMemberships` | ACTIVE | User-to-household relationships |
| `householdInvitations` | ACTIVE | Pending invites with token-based acceptance |
| `familyUnits` | ACTIVE | Sub-groups within households |
| `familyMembers` | ACTIVE | Family members (may or may not be registered users) |

### Heritage Vault
| Table | Status | Notes |
|-------|--------|-------|
| `vaultDocuments` | ACTIVE | Secure document storage with Backblaze B2 |
| `vaultCategories` | ACTIVE | Custom document categorization |

### Wisdom & Education
| Table | Status | Notes |
|-------|--------|-------|
| `wisdomEntries` | ACTIVE | Family values, lessons, and stories |
| `coreBeliefs` | ACTIVE | Documented family values and principles |

### Legacy Planning
| Table | Status | Notes |
|-------|--------|-------|
| `legacyPlans` | ACTIVE | End-of-life planning per user |
| `keyContacts` | ACTIVE | Important contacts (attorney, executor, etc.) |

### Financial Intelligence
| Table | Status | Notes |
|-------|--------|-------|
| `financialAccounts` | ACTIVE | High-level account tracking |
| `properties` | ACTIVE | Real estate and property tracking |
| `insurancePolicies` | ACTIVE | Insurance policy tracking |

### Guided Tours
| Table | Status | Notes |
|-------|--------|-------|
| `tours` | ACTIVE | Admin-managed onboarding tours |
| `tourSteps` | ACTIVE | Individual steps within tours |
| `userTourState` | ACTIVE | User progress through tours |

### Activity Tracking
| Table | Status | Notes |
|-------|--------|-------|
| `activityLog` | ACTIVE | Audit trail of user actions |

---

## Partial Implementation

### Wisdom Module (Expansion)
| Table | Status | Target Milestone | Notes |
|-------|--------|------------------|-------|
| `letters` | PARTIAL | Wisdom Area Build-out | Schema exists, no CRUD implementation. Future-delivery letters to loved ones. |

---

## Planned - Admin Dashboard

These tables will be implemented as part of the Admin Dashboard build-out.

| Table | Status | Target Milestone | Purpose |
|-------|--------|------------------|---------|
| `dailyWisdom` | PLANNED | Admin Dashboard | Admin-curated daily inspirational content displayed to users |
| `educationalArticles` | PLANNED | Admin Dashboard | Admin-authored educational content (estate planning, financial planning, etc.) |
| `emailTemplates` | PLANNED | Admin Dashboard | Transactional email templates for invitations, notifications, etc. |
| `smartSuggestions` | PLANNED | Admin Dashboard | AI-driven suggestions with eligibility rules |
| `notifications` | PLANNED | Admin Dashboard | User notification system (invitations, reminders, etc.) |

### How `userSuggestions` Will Work

The `userSuggestions` table is a **junction table** that tracks which suggestions have been shown to users:

```
smartSuggestions (admin-created)
       |
       v
userSuggestions (per-user tracking)
       |
       +-- userId (who sees it)
       +-- householdId (context)
       +-- suggestionId (which suggestion)
       +-- status: pending | dismissed | completed
       +-- dismissedAt / completedAt timestamps
```

**Flow:**
1. Admin creates `smartSuggestions` with eligibility rules (e.g., "show to users without documents")
2. When user views dashboard, system evaluates eligibility rules
3. Matching suggestions are shown; user actions tracked in `userSuggestions`
4. Users can dismiss or complete suggestions
5. Completed/dismissed suggestions don't reappear

---

## Removed Tables

| Table | Removed Date | Reason |
|-------|--------------|--------|
| `subscriptions` | Dec 2024 | Redundant - Clerk is source of truth for subscriptions. Data mirrors to `households.subscriptionTier` and `households.subscriptionStatus`. |

---

## Subscription Architecture Note

**Clerk is the source of truth** for subscription management. The architecture:

1. User subscribes via Clerk's billing features
2. Clerk webhook triggers `subscriptions.syncFromClerk` mutation
3. Subscription data mirrors to `households` table fields:
   - `subscriptionTier`: `foundations` | `heritage` | `legacy`
   - `subscriptionStatus`: `active` | `inactive` | `cancelled` | `past_due`

**Access Control:**
- Use Clerk's `has()` method for feature gating (source of truth)
- Use `households.subscriptionTier` for display purposes only

---

## Future Considerations

Tables that may be added in future iterations:

- **Family Tree Visualization** - Relationships between family members
- **Photo Albums** - Organized media collections
- **Event Calendar** - Family milestones and reminders
- **Shared Tasks** - Collaborative to-do lists for estate planning
