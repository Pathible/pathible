# Claude Command: Sync Tours

Automatically discovers tour-worthy features in the codebase, adds `data-tour` attributes, and syncs them with Convex tour steps.

## Usage

```
/sync-tours
```

## What This Command Does

1. **Scan Codebase**: Search user-facing pages for tour-worthy elements
2. **Identify Large Features**: Find primary actions, main sections, and key entry points
3. **Add data-tour Attributes**: Automatically add missing `data-tour` to qualifying elements
4. **Query Convex**: Check which elements already have tour steps
5. **Generate Gap Report**: Show coverage and suggest new tour steps
6. **Create Tour Steps**: Add missing elements to existing tours or create new ones

## Feature Detection Rules

### INCLUDE (Large Features)
These patterns indicate tour-worthy elements:

**Primary Actions:**
- Buttons/links with: `create`, `add`, `new`, `upload`, `submit`, `start`, `begin`, `save`
- Form submit buttons
- Primary CTA buttons
- "Get Started" or onboarding triggers

**Main Content Sections:**
- Dashboard stat cards
- Feature overview sections
- Empty states with CTAs
- Main content containers (not nested items)

**Key Entry Points:**
- Navigation items
- Tab headers (not individual tabs)
- Section headers with actions
- Modal/dialog triggers for major features

### EXCLUDE (Minor Interactions)
These are NOT tour-worthy:

- Filter, sort, search controls
- Pagination controls
- Close, cancel, dismiss buttons
- Edit/delete on individual items (inline actions)
- Toggle switches for settings
- Dropdown option items
- Secondary/tertiary actions
- Loading states

## data-tour Naming Convention

When adding `data-tour` attributes:

1. **Use existing data-testid** if present:
   - `data-testid="upload-document-button"` → `data-tour="upload-document-button"`

2. **Generate from context** if no testid:
   - Button text "Create Entry" on `/wisdom` → `data-tour="wisdom-create-entry"`
   - Section "Daily Reflection" → `data-tour="daily-reflection"`
   - Format: `{page/feature}-{action/element}`

3. **Keep it concise and descriptive:**
   - Good: `vault-upload`, `wisdom-create-entry`, `family-add-member`
   - Bad: `button-1`, `section`, `the-main-upload-documents-button`

## Process

### Step 1: Scan Files

Scan these directories:
```
src/app/(auth)/(dashboard)/     # All dashboard pages
src/components/                  # Shared components (except tours/)
```

Exclude:
```
src/app/(auth)/admin/           # Admin area
src/components/ui/              # Base UI components
src/components/tours/           # Tour system itself
```

### Step 2: Detect Tour-Worthy Elements

For each file, look for:

```tsx
// Pattern 1: Buttons with primary actions
<Button>Create Entry</Button>
<Button onClick={...}>Add Document</Button>

// Pattern 2: Links to major features
<Link href="/vault/upload">Upload Documents</Link>

// Pattern 3: Main sections with data-testid
<div data-testid="vault-stats">...</div>

// Pattern 4: Cards/sections that are feature entry points
<Card className="...">
  <CardTitle>Heritage Vault</CardTitle>
  ...
</Card>
```

### Step 3: Add data-tour Attributes

Automatically edit files to add `data-tour`:

```tsx
// Before
<Button data-testid="upload-btn">Upload</Button>

// After
<Button data-testid="upload-btn" data-tour="upload-btn">Upload</Button>
```

```tsx
// Before (no testid)
<Button onClick={handleCreate}>Create Entry</Button>

// After
<Button onClick={handleCreate} data-tour="wisdom-create-entry">Create Entry</Button>
```

### Step 4: Generate Report

```
🔍 Tour Sync Report
==================

📁 Files Scanned: 24
🎯 Tour-Worthy Elements Found: 15
✏️ data-tour Attributes Added: 8

New data-tour attributes added:
  ✅ src/app/(auth)/(dashboard)/vault/components/upload-button.tsx
     → Added: data-tour="vault-upload"

  ✅ src/app/(auth)/(dashboard)/wisdom/page.tsx
     → Added: data-tour="wisdom-create-entry"
     → Added: data-tour="wisdom-library-link"

Existing coverage:
  ✅ dashboard-stats (Welcome Tour)
  ✅ next-step-cta (Welcome Tour)
  ✅ daily-reflection (Welcome Tour)
  ...

Uncovered elements (need tour steps):
  ❌ vault-upload
  ❌ wisdom-create-entry
  ❌ wisdom-library-link
```

### Step 5: Sync with Tours

Present options:
1. Add uncovered elements to existing tour (e.g., Welcome Tour)
2. Create feature-specific tours (e.g., "Vault Tour")
3. Skip for now

## Route Mapping

```
src/app/(auth)/(dashboard)/dashboard/  → /dashboard
src/app/(auth)/(dashboard)/vault/      → /vault
src/app/(auth)/(dashboard)/wisdom/     → /wisdom
src/app/(auth)/(dashboard)/family/     → /family
src/app/(auth)/(dashboard)/financial/  → /financial
src/app/(auth)/(dashboard)/legacy/     → /legacy
src/components/app-sidebar.tsx         → /dashboard (global)
```

## Tour Step Generation

When creating tour steps for new elements:

**For action buttons:**
```
Title: [Action] [Feature]
Body: Click here to [what it does]. [Why it matters for legacy planning].
```

**For content sections:**
```
Title: [Section Name]
Body: [What this section shows]. [How it helps you].
```

**Examples:**
- `vault-upload` → "Upload Documents" / "Click here to securely upload important documents..."
- `wisdom-create-entry` → "Share Your Wisdom" / "Create a new entry to capture life lessons..."

## Best Practices

1. **Run after new features**: Run `/sync-tours` after implementing new user-facing features
2. **Review git diff**: Check the added `data-tour` attributes make sense
3. **Test in preview**: Use tour preview to verify elements are found correctly
4. **Keep tours focused**: Create feature-specific tours for complex features
5. **Update existing tours**: Bump version to re-show to users who dismissed

## Notes

- Only modifies user-facing code (not admin)
- Won't duplicate existing `data-tour` attributes
- Uses `data-testid` as naming reference when available
- Generates descriptive keys based on context
- Requires admin privileges to create tour steps in Convex
