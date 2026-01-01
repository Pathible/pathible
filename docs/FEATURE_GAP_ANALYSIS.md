# Feature Gap Analysis - Launch Readiness Audit

**Generated:** January 2026
**Last Updated:** January 2026
**Purpose:** Identify gaps between Clerk-defined features and actual implementation

---

## Executive Summary

| Product Area | Complete | Partial | Missing | Launch Ready |
|--------------|----------|---------|---------|--------------|
| Heritage Vault | 2/6 | 2/6 | 2/6 | Partial |
| Financial Intelligence | 1/5 | 1/5 | 3/5 | Partial |
| Family Network | 1/4 | 1/4 | 2/4 | Partial |
| Legacy Builder | 1/2 | 0/2 | 1/2 | Partial |
| Wisdom & Education | 2/2 | 0/2 | 0/2 | **Ready** |
| Support | 2/3 | 1/3 | 0/3 | **Ready** |
| Early Access | 0/1 | 1/1 | 0/1 | Partial |
| **Plan Limits** | 3/3 | 0/3 | 0/3 | **Ready** |
| **Feature Gating** | 5/5 | 0/5 | 0/5 | **Ready** |
| **Admin Tools** | 2/2 | 0/2 | 0/2 | **Ready** |

---

## Detailed Feature Status by Product Area

### 1. Heritage Vault

| Feature | Tier | Status | Details |
|---------|------|--------|---------|
| `vault_document_storage` | Foundations | **COMPLETE** | Full B2 integration, upload/download, access control |
| `vault_photo_video` | Foundations | **COMPLETE** | Uses document upload, MIME types validated |
| `vault_folders` | Foundations | **PARTIAL** | Feature defined but no folder UI/schema; categories used as substitute |
| `vault_tags_collections` | Heritage | **PARTIAL** | Categories exist but feature gate not enforced; no rich tagging UI |
| `vault_voice_uploads` | Heritage | **MISSING** | No voice recording UI; audio can upload as generic document |
| `vault_guided_organization` | Heritage | **MISSING** | No wizard/workflow implementation |

**What Works:**
- Document upload/download with Backblaze B2
- Photo and video uploads
- Category-based organization
- Storage quota enforcement
- Document access levels (household/admins/custom)

**What's Missing:**
- Hierarchical folder structure
- Rich tagging interface
- Voice recording/transcription UI
- Guided organization wizards

---

### 2. Financial Intelligence

| Feature | Tier | Status | Details |
|---------|------|--------|---------|
| `financial_overview` | Foundations | **COMPLETE** | Manual account/property/insurance tracking, net worth |
| `financial_summaries` | Heritage | **MISSING** | No detailed per-account summaries |
| `financial_insights` | Heritage | **PARTIAL** | Suggestion UI exists but no AI; database-driven only |
| `financial_spending_categories` | Legacy | **MISSING** | No transaction model, no categorization |
| `financial_trends` | Legacy | **MISSING** | No historical tracking, no charts |

**What Works:**
- Manual financial account entry
- Property and insurance tracking
- Net worth calculation
- Basic suggestions framework

**What's Missing:**
- **Plaid integration** (critical gap)
- Transaction fetching and history
- AI-powered insights
- Spending categorization
- Trend analysis and charts

---

### 3. Family Network

| Feature | Tier | Status | Details |
|---------|------|--------|---------|
| `family_members` | Foundations | **COMPLETE** | Full CRUD, invitations, member limits enforced |
| `family_profiles` | Heritage | **PARTIAL** | Data stored but minimal rich profile UI |
| `family_messaging` | Heritage | **MISSING** | Button stub exists, no backend or UI |
| `family_relationships` | Legacy | **MISSING** | No family tree visualization or relationship mapping |

**What Works:**
- Add/edit/remove family members
- Email invitations
- Family unit management
- Member count enforcement
- Basic profile data storage

**What's Missing:**
- Rich profile editing UI
- In-app messaging system
- Family tree visualization
- Relationship mapping

---

### 4. Legacy Builder

| Feature | Tier | Status | Details |
|---------|------|--------|---------|
| `legacy_questionnaires` | Legacy | **COMPLETE** | Multi-section wizard, key contacts, completion tracking |
| `legacy_story_templates` | Legacy | **MISSING** | Feature defined but zero implementation |

**What Works:**
- 5-section legacy planning questionnaire
- Key contacts management
- Completion percentage tracking
- Activity logging

**What's Missing:**
- Story template library
- Template selection UI
- Template-guided content creation

---

### 5. Wisdom & Education

| Feature | Tier | Status | Details |
|---------|------|--------|---------|
| `wisdom_entries` | Heritage | **COMPLETE** | Full CRUD, categories, library, guided creation |
| `wisdom_shared_pages` | Legacy | **PARTIAL** | `sharedWith` field exists but no collaboration UI |

**What Works:**
- Wisdom entry creation (guided + quick mode)
- 5 content categories
- Entry library with search/filter
- Core beliefs management (max 5 per household)
- Draft/publish workflow

**What's Missing:**
- Shared/collaborative page viewing
- Recipient management for "specific" sharing
- Public wisdom pages

---

### 6. Support

| Feature | Tier | Status | Details |
|---------|------|--------|---------|
| `standard_support` | Foundations | **COMPLETE** | Email + Crisp live chat + Help Center |
| `support_priority` | Heritage | **COMPLETE** | Crisp live chat with faster response commitment |
| `support_concierge` | Legacy | **PARTIAL** | No dedicated concierge rep assignment system |

**What Works:**
- Email address (support@pathible.com)
- Crisp live chat widget (site-wide)
- Help Center page (/help) with FAQ
- Ticket management via Crisp dashboard

**What's Missing:**
- Dedicated concierge rep assignment for Legacy tier

---

### 7. Early Access

| Feature | Tier | Status | Details |
|---------|------|--------|---------|
| `early_access_features` | Heritage | **PARTIAL** | Feature slug defined but no beta flagging system |

**What Works:**
- Feature definition exists

**What's Missing:**
- Beta feature flagging mechanism
- UI indicator for early access features
- Separate beta feature list

---

### 8. Plan Limit Enforcement

| Limit Type | Status | Details |
|------------|--------|---------|
| Storage Quota | **COMPLETE** | Pre-computed counters, enforced on upload |
| Family Member Limit | **COMPLETE** | Enforced in 4 mutations |
| Family Unit Limit | **COMPLETE** | Enforced on unit creation |

**Plan Limits:**
| Tier | Storage | Family Members | Family Units |
|------|---------|----------------|--------------|
| Foundations | 5 GB | 1 | 1 |
| Heritage | 25 GB | 3 | 3 |
| Legacy/Founders | Unlimited | Unlimited | Unlimited |

---

## Priority Matrix for Implementation

### P0 - Critical for Launch (Must Have)

| Feature | Area | Effort | Status |
|---------|------|--------|--------|
| ~~Support contact form~~ | Support | Low | **DONE** - Crisp live chat integrated |
| ~~Help center / FAQ page~~ | Support | Medium | **DONE** - /help page with FAQ |
| ~~Hide SubscriptionDebug~~ | System | Low | **DONE** - Hidden in production |
| ~~Coming Soon component~~ | UI | Low | **DONE** - Component ready for use |

### P1 - High Priority (Should Have for Launch)

| Feature | Area | Effort | Notes |
|---------|------|--------|-------|
| Plaid integration | Financial | High | Foundation for all financial features |
| Enforce vault_tags_collections gate | Vault | Low | Categories exist, just add gate |
| Family messaging | Family | High | New schema + real-time UI |

### P2 - Medium Priority (Nice to Have)

| Feature | Area | Effort | Notes |
|---------|------|--------|-------|
| Vault folders | Vault | Medium | Schema + UI for hierarchy |
| Voice recording UI | Vault | Medium | Browser MediaRecorder API |
| Financial insights (AI) | Financial | Medium | LLM integration |
| Rich family profiles | Family | Low | UI enhancement |
| Story templates | Legacy | Medium | Template library + selection |

### P3 - Lower Priority (Post-Launch)

| Feature | Area | Effort | Notes |
|---------|------|--------|-------|
| Guided organization wizards | Vault | Medium | Workflow builder |
| Family tree visualization | Family | High | Graph rendering |
| Spending categories | Financial | Medium | Requires Plaid first |
| Financial trends | Financial | Medium | Charts + historical data |
| Wisdom shared pages | Wisdom | Medium | Collaboration UI |
| Early access flagging | System | Low | Feature flag system |
| Live chat support | Support | Medium | Third-party integration |

---

## Recommended Launch Configuration

### For 7-Day Founders Launch

**Gate these features (not ready):**
- `vault_voice_uploads` - Show "Coming Soon"
- `vault_guided_organization` - Show "Coming Soon"
- `financial_summaries` - Show "Coming Soon"
- `financial_insights` - Show "Coming Soon" (or leave suggestion stub)
- `financial_spending_categories` - Show "Coming Soon"
- `financial_trends` - Show "Coming Soon"
- `family_messaging` - Show "Coming Soon"
- `family_relationships` - Show "Coming Soon"
- `legacy_story_templates` - Show "Coming Soon"
- `wisdom_shared_pages` - Show "Coming Soon"

**Ready to ship:**
- `vault_document_storage` - Full functionality
- `vault_photo_video` - Full functionality
- `vault_folders` - Categories work (rename feature?)
- `vault_tags_collections` - Categories work (add gate)
- `financial_overview` - Manual entry works
- `family_members` - Full functionality
- `family_profiles` - Basic functionality
- `legacy_questionnaires` - Full functionality
- `wisdom_entries` - Full functionality

**Must build before launch:**
1. ~~Support contact mechanism~~ - **DONE** (Crisp live chat)
2. ~~Help/FAQ page~~ - **DONE** (/help)

---

### 9. Feature Gating Infrastructure

| Component | Status | Details |
|-----------|--------|---------|
| `FeatureGate` component | **COMPLETE** | Uses Clerk's `Protect` with feature-based access control |
| Dashboard page gates | **COMPLETE** | All 5 dashboard pages wrapped with appropriate gates |
| `SubscriptionStatusBanner` | **COMPLETE** | Global banner for expired/inactive subscriptions |
| `useFeatureAccess` hook | **COMPLETE** | Client-side feature access checking |
| `useSubscription` hook | **COMPLETE** | Subscription status checking |

**Dashboard Feature Gates:**
| Page | Feature | Required Plan |
|------|---------|---------------|
| `/vault` | `VAULT_DOCUMENT_STORAGE` | Foundations |
| `/financial` | `FINANCIAL_OVERVIEW` | Foundations |
| `/family` | `FAMILY_MEMBERS` | Foundations |
| `/wisdom` | `WISDOM_ENTRIES` | Heritage |
| `/legacy` | `LEGACY_QUESTIONNAIRES` | Legacy |

**Files:**
- `src/components/feature-gate.tsx` - FeatureGate component
- `src/lib/feature-access.ts` - Feature definitions and hooks
- `src/components/subscription-status-banner.tsx` - Subscription warning banner
- `src/hooks/use-subscription.ts` - Subscription status hook

---

### 10. Admin Tools

| Feature | Status | Details |
|---------|--------|---------|
| Admin Dashboard | **COMPLETE** | Real Convex data, user stats, activity logs |
| Content Manager | **COMPLETE** | CRUD for Faith & Finances articles |
| Learning Center Integration | **COMPLETE** | Articles fetched from database |
| E2E Test Infrastructure | **COMPLETE** | `cy.grantAdminRole()` for admin testing |

**Admin Content Manager:**
- Create/edit/delete educational articles
- Category filtering (faith_stewardship, financial_literacy, etc.)
- Draft/published status workflow
- View count tracking
- Learning Center automatically displays published articles

**Files:**
- `src/convex/articles.ts` - Article CRUD operations
- `src/app/(auth)/admin/content/` - Content manager pages
- `src/app/(auth)/(dashboard)/financial/components/learning-center.tsx` - Database integration
- `cypress/e2e/admin-content.cy.ts` - E2E tests

---

## Files Modified for Feature Gating

Feature gating is **COMPLETE** for launch. All dashboard pages are wrapped with appropriate `FeatureGate` components.

**Completed files:**
1. `/src/lib/feature-access.ts` - Feature definitions ✅
2. `/src/convex/auth.ts` - FEATURE_TIERS mapping ✅
3. `/src/components/feature-gate.tsx` - FeatureGate component ✅
4. `/src/app/(auth)/(dashboard)/vault/page.tsx` - Vault gate ✅
5. `/src/app/(auth)/(dashboard)/financial/page.tsx` - Financial gate ✅
6. `/src/app/(auth)/(dashboard)/family/page.tsx` - Family gate ✅
7. `/src/app/(auth)/(dashboard)/wisdom/page.tsx` - Wisdom gate ✅
8. `/src/app/(auth)/(dashboard)/legacy/page.tsx` - Legacy gate ✅
9. `/src/app/(auth)/(dashboard)/layout.tsx` - SubscriptionStatusBanner ✅

---

## Database Schema Gaps

Tables that need to be created for missing features:

| Table | For Feature | Priority |
|-------|-------------|----------|
| `folders` | vault_folders | P2 |
| `messages` / `conversations` | family_messaging | P1 |
| `relationships` | family_relationships | P3 |
| `storyTemplates` | legacy_story_templates | P2 |
| `transactions` | financial_spending_categories | P3 |
| `plaidAccounts` | Plaid integration | P1 |
| `supportTickets` | Support system | P0 (if building custom) |

---

## Next Steps

1. **Immediate (Pre-Launch):**
   - [x] Implement support contact form - **DONE** (Crisp)
   - [x] Create help/FAQ page - **DONE** (/help)
   - [x] Add "Coming Soon" UI component - **DONE**
   - [x] Hide SubscriptionDebug in production - **DONE**
   - [x] Frontend feature gating - **DONE** (all 5 dashboard pages gated)
   - [x] Subscription status banner - **DONE** (shows warning for inactive subscriptions)
   - [x] Admin content manager - **DONE** (Faith & Finances articles)
   - [x] E2E test coverage - **DONE** (37 tests passing, including admin content)
   - [ ] Apply Coming Soon badges to unfinished features (optional)

2. **Week 1 Post-Launch:**
   - [ ] Monitor support volume via Crisp dashboard
   - [ ] Gather user feedback on missing features
   - [ ] Begin Plaid integration planning
   - [ ] Create initial educational content in Content Manager

3. **Month 1:**
   - [ ] Complete Plaid integration
   - [ ] Implement family messaging
   - [ ] Add voice recording UI

---

## What's Next (Priority Order)

Based on the gap analysis, here are the recommended next priorities:

### P1 - High Priority (Should Have for Launch)

| Feature | Area | Effort | Status |
|---------|------|--------|--------|
| ~~Frontend feature gating~~ | System | Low | **DONE** |
| ~~Subscription status banner~~ | System | Low | **DONE** |
| ~~Admin content manager~~ | Admin | Medium | **DONE** |
| Enforce vault_tags_collections gate | Vault | Low | Pending - categories exist, just add granular gate |
| Coming Soon badges for incomplete features | UI | Low | Optional - prevents user confusion |

### P1.5 - High Value Quick Wins

| Feature | Area | Effort | Notes |
|---------|------|--------|-------|
| Add educational content | Content | Low | Use Content Manager to add articles |
| Rich family profile UI | Family | Low | Data already stored, just needs better display |
| Financial insights stub | Financial | Low | Show "AI insights coming soon" placeholder |

### P2 - Medium Priority (Post-Launch Week 1)

| Feature | Area | Effort | Notes |
|---------|------|--------|-------|
| Plaid integration | Financial | High | Foundation for all financial features |
| Vault folders | Vault | Medium | Schema + UI for hierarchy |
| Voice recording UI | Vault | Medium | Browser MediaRecorder API |

### P3 - Lower Priority (Month 1+)

| Feature | Area | Effort | Notes |
|---------|------|--------|-------|
| Family messaging | Family | High | New schema + real-time UI |
| Family tree visualization | Family | High | Graph rendering |
| Story templates | Legacy | Medium | Template library + selection |
