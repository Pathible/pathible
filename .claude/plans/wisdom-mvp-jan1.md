# Wisdom MVP - January 1 Launch

## Scope Decision

**IN SCOPE (ship Jan 1):**
- Wisdom Hub (navigation landing)
- Create Wisdom Entry
- Wisdom Library (list + edit)
- Core Beliefs (max 5)

**DEFERRED (post-launch sprint):**
- Letters feature
- Vault integration (vaultDocumentId, PDF generation)
- Family Feed
- Versioning system
- Deceased handling
- Extended family sharing
- Complex visibility rules

---

## Schema Changes (Minimal)

### wisdomEntries - NO CHANGES NEEDED
Current schema is sufficient for MVP:
```typescript
wisdomEntries: defineTable({
  householdId: v.id("households"),
  authorId: v.id("profiles"),
  title: v.string(),
  content: v.string(),
  category: v.union("values", "lessons", "stories", "advice", "traditions"),
  tags: v.array(v.string()), // Ignore in UI, keep in schema
  isPublished: v.boolean(),  // MVP: true = shared with household, false = private
  sharedWith: v.union("household", "descendants", "specific"), // MVP: only use "household"
  mediaStorageIds: v.array(v.id("_storage")), // MVP: empty array
  updatedAt: v.number(),
})
```

### coreBeliefs - NO CHANGES NEEDED
Current schema is sufficient for MVP:
```typescript
coreBeliefs: defineTable({
  householdId: v.id("households"),
  createdBy: v.id("profiles"),
  title: v.string(),
  content: v.string(),
  category: v.union("faith", "family", "work", "community", "personal", "other"),
  orderIndex: v.number(),
  updatedAt: v.number(),
})
```

---

## Convex Functions

### wisdom.ts

**Queries:**
1. `getStats` - Count of user's entries
2. `list` - List user's wisdom entries with filters
3. `get` - Get single entry by ID

**Mutations:**
1. `create` - Create new wisdom entry
2. `update` - Update existing entry (author only)
3. `delete` - Delete entry (author only)

### coreBeliefs.ts

**Queries:**
1. `list` - List household's core beliefs (ordered)
2. `get` - Get single belief

**Mutations:**
1. `create` - Create belief (max 5 per household)
2. `update` - Update belief
3. `delete` - Delete belief
4. `reorder` - Update orderIndex values

---

## UI Pages

### /wisdom (Wisdom Hub)
- Header with description
- 4 navigation cards:
  - Create Wisdom Entry -> /wisdom/create-entry
  - Wisdom Library -> /wisdom/library
  - Core Beliefs -> /wisdom/core-beliefs
  - Write a Letter -> Coming Soon (disabled)
- Quick stats: Your entries count

### /wisdom/create-entry
- Form fields:
  - Title (required)
  - Content (required, textarea)
  - Category (select dropdown)
  - Share with household (checkbox, maps to isPublished)
- Save -> redirect to /wisdom/library
- Cancel -> back to /wisdom

### /wisdom/library
- List of user's wisdom entries
- Filters: category, search
- Sort: newest first
- Card for each entry showing title, excerpt, category, date
- Click to edit (same form as create)
- Delete button with confirmation

### /wisdom/core-beliefs
- List of up to 5 beliefs
- Each shows: title, content, category
- Drag to reorder (or simple up/down buttons)
- Add new (if < 5)
- Edit inline or modal
- Delete with confirmation

---

## Permission Model (Simplified)

For MVP, use existing `requireHouseholdAccess`:
- Any household member can view published wisdom entries
- Only author can edit/delete their own entries
- Core beliefs: any admin (owner/steward) can manage

---

## Activity Logging

Log these events (already in schema):
- wisdom_created
- wisdom_updated
- document_deleted (reuse for wisdom deletion)

---

## Files to Create

```
src/convex/wisdom.ts        # Wisdom entry CRUD
src/convex/coreBeliefs.ts   # Core beliefs CRUD
src/app/(auth)/wisdom/page.tsx                    # Hub
src/app/(auth)/wisdom/create-entry/page.tsx       # Create form
src/app/(auth)/wisdom/library/page.tsx            # Library list
src/app/(auth)/wisdom/library/[id]/page.tsx       # Edit entry
src/app/(auth)/wisdom/core-beliefs/page.tsx       # Core beliefs
src/app/(auth)/wisdom/components/                  # Shared components
```

---

## Estimated Time

| Task | Hours |
|------|-------|
| Convex functions (wisdom.ts, coreBeliefs.ts) | 3-4 |
| Wisdom Hub page | 1 |
| Create Entry page | 2 |
| Library page + edit | 3 |
| Core Beliefs page | 2-3 |
| Navigation + polish | 1 |
| Testing | 2 |
| **Total** | **14-16 hours** |

This is achievable in the remaining time with focused execution.
