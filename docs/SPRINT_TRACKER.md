# Sprint Tracker - Active Development

**Last Updated:** January 2026
**Current Phase:** Post-Launch Stabilization

---

## Immediate Next Steps (Priority Order)

### 1. Admin Dashboard - Connect Real Data
- [ ] Replace mock stats with actual Convex queries
- [ ] User count, content count, activity metrics
- **Effort:** 1-2 hours

### 2. Content Manager Admin Page
- [ ] Create `/admin/content` route
- [ ] Schema for articles (title, body, category, status)
- [ ] CRUD interface for Faith & Finances articles
- [ ] Publish/unpublish workflow
- **Effort:** 4-6 hours

### 3. Backend Feature Lockdown (from plan)
- [ ] Add `requireActiveSubscription()` to unprotected mutations
- [ ] wisdom.ts: create, update, remove
- [ ] coreBeliefs.ts: create, update, remove, reorder
- [ ] financial.ts: delete mutations, suggestion actions
- [ ] vault.ts: remove, deleteCategory
- [ ] familyEcosystem.ts: delete operations
- **Effort:** 2-3 hours

### 4. Frontend Feature Gating
- [ ] Add `FeatureGate` wrappers to dashboard pages
- [ ] Subscription status banner for expired users
- **Effort:** 2-3 hours

---

## P1 Features (Week 1-2 Post-Launch)

| Feature | Status | Notes |
|---------|--------|-------|
| Plaid Integration | Not Started | Foundation for financial features |
| Feature Gate Enforcement | Not Started | Tags/collections for Heritage tier |
| Family Messaging | Not Started | Real-time chat system |

## P2 Features (Week 2-4)

| Feature | Status | Notes |
|---------|--------|-------|
| Vault Folders | Not Started | Hierarchical organization |
| Voice Recording UI | Not Started | Browser MediaRecorder API |
| AI Financial Insights | Not Started | Requires Plaid first |
| Rich Family Profiles | Not Started | Extended profile fields |
| Story Templates | Not Started | Legacy tier content |

## P3 Features (Month 1-2)

| Feature | Status | Notes |
|---------|--------|-------|
| Family Tree Visualization | Not Started | Graph rendering |
| Spending Categories | Not Started | Requires Plaid |
| Wisdom Shared Pages | Not Started | Collaboration UI |
| Early Access Flagging | Not Started | Beta feature system |

---

## Admin Section Buildout

| Section | Status | Priority |
|---------|--------|----------|
| Dashboard (real data) | Pending | P0 |
| Content Manager | Not Started | P1 |
| Users & Families | Not Started | P2 |
| Activity Logs | Not Started | P2 |
| Legacy Access Queue | Not Started | P1 |
| Email System | Not Started | P2 |
| Smart Suggestions Editor | Not Started | P2 |
| Roles & Permissions | Not Started | P3 |
| System Settings | Not Started | P3 |

---

## Completed Items

### January 2026 - Launch Prep
- [x] Crisp live chat integration
- [x] Help Center page
- [x] Coming Soon badge component
- [x] Coming Soon badges on Family (Message, Share buttons)
- [x] Coming Soon badges on Financial (Smart Suggestions, Faith & Finances)
- [x] Coming Soon badges on Family Preferences (Upload, Notifications)
- [x] Help Center link in user dropdown
- [x] Implementation Roadmap document
- [x] Feature Gap Analysis updated

---

## Session Notes

_Use this section to track decisions and context between sessions_

**2026-01-XX:**
- User requested PR reviews instead of auto-merge
- Next focus: Admin real data + Content Manager
- Consider: Backend lockdown for subscription enforcement

