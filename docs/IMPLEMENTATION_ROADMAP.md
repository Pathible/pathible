# Implementation Roadmap - Feature Development Plan

**Created:** January 2026
**Last Updated:** January 2026
**Purpose:** Detailed implementation plan for P1-P3 features with effort estimates and dependencies

---

## Executive Summary

This document outlines the development roadmap for Pathible features beyond the initial launch. Features are categorized by priority (P1-P3) with detailed implementation requirements, dependencies, and realistic effort estimates.

**Key Dependencies:**
- Plaid integration is the foundational blocker for all advanced financial features
- Family messaging requires real-time infrastructure (already have Convex subscriptions)
- Voice features require browser API integration + cloud transcription

---

## P1 - High Priority (Week 1-2 Post-Launch)

These features address critical user expectations and should be prioritized immediately after launch stability is confirmed.

### 1.1 Plaid Financial Integration

**Impact:** Enables automated account linking, transaction history, and net worth tracking
**Effort:** High (8-12 days)
**Revenue Impact:** High - Heritage/Legacy tier differentiator

**Implementation Steps:**

1. **Backend Setup (3-4 days)**
   - Create Convex tables: `plaidItems`, `plaidAccounts`, `transactions`
   - Implement Plaid Link token exchange mutation
   - Create HTTP action for Plaid webhooks
   - Set up environment variables: `PLAID_CLIENT_ID`, `PLAID_SECRET`, `PLAID_ENV`

2. **Account Linking Flow (2-3 days)**
   - Integrate Plaid Link React component
   - Create "Link Account" button in Financial Overview
   - Handle success/error states
   - Store access tokens securely (encrypted in Convex)

3. **Transaction Sync (2-3 days)**
   - Implement initial transaction pull on link
   - Set up webhook handler for `TRANSACTIONS_SYNC`
   - Create transaction list UI with search/filter
   - Add refresh button for manual sync

4. **Data Display (1-2 days)**
   - Show linked accounts with real balances
   - Display transaction history
   - Update net worth calculation to use Plaid data

**Files to Create:**
```
src/convex/plaid.ts           - Queries, mutations, actions
src/convex/plaidWebhooks.ts   - HTTP webhook handlers
src/components/plaid-link.tsx  - Plaid Link wrapper
src/app/(auth)/(dashboard)/financial/components/linked-accounts.tsx
src/app/(auth)/(dashboard)/financial/components/transactions.tsx
```

**Schema Addition:**
```typescript
plaidItems: defineTable({
  householdId: v.id("households"),
  accessToken: v.string(), // encrypted
  itemId: v.string(),
  institutionId: v.string(),
  institutionName: v.string(),
  status: v.union(v.literal("active"), v.literal("error"), v.literal("pending_expiration")),
  consentExpirationTime: v.optional(v.number()),
  createdAt: v.number(),
  updatedAt: v.number(),
}).index("by_household", ["householdId"]),

plaidAccounts: defineTable({
  plaidItemId: v.id("plaidItems"),
  householdId: v.id("households"),
  accountId: v.string(),
  name: v.string(),
  officialName: v.optional(v.string()),
  type: v.string(),
  subtype: v.optional(v.string()),
  mask: v.optional(v.string()),
  currentBalance: v.optional(v.number()),
  availableBalance: v.optional(v.number()),
  isoCurrencyCode: v.optional(v.string()),
  lastUpdated: v.number(),
}).index("by_household", ["householdId"])
  .index("by_plaid_item", ["plaidItemId"]),

transactions: defineTable({
  householdId: v.id("households"),
  plaidAccountId: v.id("plaidAccounts"),
  transactionId: v.string(),
  amount: v.number(),
  date: v.string(),
  name: v.string(),
  merchantName: v.optional(v.string()),
  category: v.optional(v.array(v.string())),
  pending: v.boolean(),
}).index("by_household", ["householdId"])
  .index("by_account", ["plaidAccountId"])
  .index("by_date", ["householdId", "date"]),
```

**Tier Gating:**
- Foundations: Manual entry only (current)
- Heritage: Link up to 3 accounts
- Legacy: Unlimited accounts + full transaction history

---

### 1.2 Enforce Feature Gate for Tags/Collections

**Impact:** Ensures Heritage tier users get the premium tagging experience
**Effort:** Low (0.5 days)
**Revenue Impact:** Medium - differentiates Heritage from Foundations

**Implementation Steps:**

1. Wrap tag/collection features with `requireFeatureAccess(ctx, householdId, "vault_tags_collections")`
2. Add UI indication that tags are a Heritage feature
3. Show upgrade prompt for Foundations users trying to use tags

**Files to Modify:**
- `src/convex/vault.ts` - Add feature check to tag mutations
- `src/app/(auth)/(dashboard)/vault/components/document-filters.tsx` - Show upgrade prompt

---

### 1.3 Family Messaging System

**Impact:** Core communication feature for family collaboration
**Effort:** High (6-8 days)
**Revenue Impact:** High - Heritage tier feature

**Implementation Steps:**

1. **Schema Design (1 day)**
   ```typescript
   conversations: defineTable({
     householdId: v.id("households"),
     familyUnitId: v.optional(v.id("familyUnits")),
     type: v.union(v.literal("direct"), v.literal("group"), v.literal("unit")),
     participantIds: v.array(v.string()), // Clerk user IDs
     name: v.optional(v.string()),
     lastMessageAt: v.optional(v.number()),
     createdAt: v.number(),
   }).index("by_household", ["householdId"])
     .index("by_participant", ["participantIds"]),

   messages: defineTable({
     conversationId: v.id("conversations"),
     senderId: v.string(), // Clerk user ID
     content: v.string(),
     type: v.union(v.literal("text"), v.literal("system")),
     readBy: v.array(v.string()),
     createdAt: v.number(),
   }).index("by_conversation", ["conversationId", "createdAt"]),
   ```

2. **Backend Implementation (2 days)**
   - Create conversation CRUD mutations
   - Implement message send/receive
   - Add real-time subscription queries
   - Handle read receipts

3. **UI Components (3-4 days)**
   - Conversation list sidebar
   - Message thread view
   - Message composer with send button
   - Real-time message updates
   - Unread indicator badges
   - Notification integration (future)

**Files to Create:**
```
src/convex/messaging.ts
src/app/(auth)/(dashboard)/family/messages/page.tsx
src/app/(auth)/(dashboard)/family/messages/[conversationId]/page.tsx
src/components/messaging/conversation-list.tsx
src/components/messaging/message-thread.tsx
src/components/messaging/message-composer.tsx
```

**Tier Gating:**
- Foundations: No messaging
- Heritage: Family unit messaging
- Legacy: All messaging features + future: rich media

---

## P2 - Medium Priority (Week 2-4 Post-Launch)

These features enhance the user experience but are not critical for initial adoption.

### 2.1 Vault Folders/Hierarchy

**Impact:** Better organization for users with many documents
**Effort:** Medium (4-5 days)
**Revenue Impact:** Medium - improves all tier experience

**Implementation Steps:**

1. **Schema Addition (0.5 days)**
   ```typescript
   folders: defineTable({
     householdId: v.id("households"),
     parentId: v.optional(v.id("folders")),
     name: v.string(),
     path: v.string(), // e.g., "/photos/vacation/2024"
     depth: v.number(),
     createdBy: v.string(),
     createdAt: v.number(),
   }).index("by_household", ["householdId"])
     .index("by_parent", ["householdId", "parentId"]),
   ```

2. **Backend (1.5 days)**
   - CRUD operations for folders
   - Move documents between folders
   - Breadcrumb path generation

3. **UI Implementation (2-3 days)**
   - Folder tree sidebar
   - Folder navigation breadcrumbs
   - Drag-and-drop organization
   - Create/rename/delete folder modals

---

### 2.2 Voice Recording UI

**Impact:** Enables voice stories and memories
**Effort:** Medium (4-5 days)
**Revenue Impact:** Medium - Heritage tier differentiator

**Implementation Steps:**

1. **Browser Recording (1-2 days)**
   - MediaRecorder API integration
   - Audio visualization during recording
   - Playback preview before save

2. **Upload & Storage (1 day)**
   - Use existing vault upload infrastructure
   - Add audio MIME type handling
   - Generate waveform thumbnail

3. **Transcription (1-2 days)** - Optional for launch
   - Integrate Whisper API or similar
   - Store transcription with document
   - Enable text search of audio content

**Files to Create:**
```
src/components/voice-recorder.tsx
src/app/(auth)/(dashboard)/vault/components/audio-player.tsx
```

---

### 2.3 Financial Insights (AI-Powered)

**Impact:** Transforms raw data into actionable advice
**Effort:** Medium (3-4 days)
**Revenue Impact:** High - premium differentiator

**Prerequisites:** Plaid integration (P1.1)

**Implementation Steps:**

1. **Backend Analysis (1-2 days)**
   - Create scheduled job to analyze spending patterns
   - Generate insight objects based on rules + AI
   - Store insights in Convex with expiration

2. **AI Integration (1-2 days)**
   - Use Claude API for personalized insights
   - Prompt engineering for financial advice
   - Rate limiting and cost management

3. **UI Display (1 day)**
   - Insight cards on financial dashboard
   - Dismiss/complete actions
   - Weekly digest email (optional)

**Schema:**
```typescript
financialInsights: defineTable({
  householdId: v.id("households"),
  type: v.union(v.literal("spending"), v.literal("saving"), v.literal("investment"), v.literal("alert")),
  title: v.string(),
  content: v.string(),
  priority: v.union(v.literal("high"), v.literal("medium"), v.literal("low")),
  actionUrl: v.optional(v.string()),
  dismissed: v.boolean(),
  expiresAt: v.optional(v.number()),
  createdAt: v.number(),
}).index("by_household", ["householdId"]),
```

---

### 2.4 Rich Family Profiles

**Impact:** Better family member representation
**Effort:** Low (2-3 days)
**Revenue Impact:** Low-Medium

**Implementation Steps:**

1. **Extended Profile Fields (1 day)**
   - Add optional fields: bio, interests, important dates
   - Profile photo upload using vault infrastructure

2. **Profile View Enhancement (1-2 days)**
   - Expanded profile card with all details
   - Edit modal with rich form
   - Activity timeline on profile

---

### 2.5 Story Templates Library

**Impact:** Guided legacy content creation
**Effort:** Medium (4-5 days)
**Revenue Impact:** Medium - Legacy tier feature

**Implementation Steps:**

1. **Template Schema (0.5 days)**
   ```typescript
   storyTemplates: defineTable({
     slug: v.string(),
     title: v.string(),
     description: v.string(),
     category: v.string(),
     prompts: v.array(v.object({
       id: v.string(),
       question: v.string(),
       helpText: v.optional(v.string()),
       inputType: v.union(v.literal("text"), v.literal("textarea"), v.literal("date")),
     })),
     isSystem: v.boolean(),
   }).index("by_slug", ["slug"]),
   ```

2. **Seed Templates (0.5 days)**
   - "My Life Story" template
   - "Family History" template
   - "Career Journey" template
   - "Values & Beliefs" template

3. **Template Selection UI (2 days)**
   - Template gallery with previews
   - Category filtering
   - Start from template flow

4. **Template-Guided Editor (1-2 days)**
   - Step-by-step prompt flow
   - Progress indicator
   - Save partial progress

---

## P3 - Lower Priority (Month 1-2 Post-Launch)

These features are valuable but can wait until core product is stable.

### 3.1 Guided Organization Wizards

**Impact:** Helps new users organize their vault
**Effort:** Medium (3-4 days)
**Revenue Impact:** Low - UX improvement

**Implementation:**
- Multi-step wizard for vault organization
- Suggest categories based on document types
- Bulk tagging/moving interface

---

### 3.2 Family Tree Visualization

**Impact:** Visual family relationship mapping
**Effort:** High (6-8 days)
**Revenue Impact:** Medium - Legacy tier feature

**Implementation:**
- Graph data model for relationships
- Interactive tree visualization (consider react-flow or d3)
- Relationship type definitions (parent, sibling, spouse, etc.)
- Add/edit relationships UI

---

### 3.3 Spending Categories & Trends

**Impact:** Financial analysis and visualization
**Effort:** Medium (4-5 days)
**Revenue Impact:** Medium - Legacy tier feature

**Prerequisites:** Plaid integration (P1.1)

**Implementation:**
- Category assignment for transactions
- Spending by category charts
- Month-over-month trend graphs
- Budget tracking (optional)

---

### 3.4 Wisdom Shared Pages

**Impact:** Collaborative family wisdom
**Effort:** Medium (3-4 days)
**Revenue Impact:** Low-Medium

**Implementation:**
- Public/private sharing settings
- Shared page viewer
- Comment/reaction system (optional)

---

### 3.5 Early Access Feature Flagging

**Impact:** Beta testing framework
**Effort:** Low (1-2 days)
**Revenue Impact:** Low - internal tooling

**Implementation:**
- Feature flag table in Convex
- Admin UI for flag management
- Client-side feature flag hook
- Beta badge component

---

### 3.6 Concierge Support System

**Impact:** Premium support experience for Legacy tier
**Effort:** Medium (3-4 days)
**Revenue Impact:** Low - service enhancement

**Implementation:**
- Assigned support rep tracking
- Priority ticket queue
- Direct scheduling integration
- Support history view

---

## Timeline Summary

| Week | Focus Area | Key Deliverables |
|------|-----------|------------------|
| Week 1 | Stabilization | Monitor launch, fix bugs, gather feedback |
| Week 2 | P1.2, P1.3 | Feature gate enforcement, start messaging |
| Week 3 | P1.1, P1.3 | Plaid integration, complete messaging |
| Week 4 | P1.1, P2.1 | Complete Plaid, vault folders |
| Week 5-6 | P2.2, P2.3 | Voice recording, AI insights |
| Week 7-8 | P2.4, P2.5 | Rich profiles, story templates |
| Month 2+ | P3.x | Lower priority enhancements |

---

## Resource Requirements

**Development:**
- Full-stack developer for all features
- Consider: Plaid sandbox testing, AI API costs

**Third-Party Services:**
- Plaid: Transaction data API ($0-$500/mo depending on users)
- Claude API: Financial insights (~$0.01-0.05 per insight)
- Whisper API: Transcription (~$0.006/minute)

**Testing:**
- Plaid sandbox accounts for development
- Test households for messaging
- Audio file samples for voice features

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Plaid integration delays | Keep manual entry as fallback, phase rollout |
| AI costs exceed budget | Implement caching, limit insight frequency |
| Real-time messaging scale | Convex handles well, monitor subscription counts |
| Voice transcription quality | Offer manual editing, async processing |

---

## Success Metrics

| Feature | Target Metric |
|---------|---------------|
| Plaid Integration | 30% of users link an account in first month |
| Family Messaging | 50% of multi-member households send a message |
| Voice Recording | 10% of wisdom entries include audio |
| AI Insights | 70% of insights marked helpful/actioned |

---

## Next Steps

1. Confirm launch stability (1 week)
2. Prioritize based on user feedback
3. Begin P1.1 (Plaid) planning
4. Create technical design docs for complex features
