# Schema Check Command

Validate that schema entities are properly used and track implementation status against the roadmap.

## Arguments

$ARGUMENTS

## Argument Parsing

| Argument Type | Format | Example |
|---------------|--------|---------|
| Table name | Plain text | `profiles`, `tours` |
| Flags | `--flag-name` | `--unused`, `--roadmap`, `--full` |

**Supported Arguments:**

- `<table>` - Check usage of a specific table
- `--unused` - Find tables with no implementation
- `--roadmap` - Compare against SCHEMA_ROADMAP.md
- `--full` - Complete audit of all tables
- (no args) - Quick summary

## Instructions

### Step 1: Parse Schema

Read and parse `src/convex/schema.ts` to get all defined tables:

```typescript
// Extract table names from schema
const tables = Object.keys(schema.tables);
```

### Step 2: Analyze Usage

For each table (or specified table), search for usage patterns:

```bash
# Search for table references (excluding schema.ts and _generated/)
grep -r "\"tableName\"" src/convex --include="*.ts" | grep -v schema.ts | grep -v _generated
```

Look for:
- `ctx.db.query("tableName")`
- `ctx.db.insert("tableName")`
- `ctx.db.get(id)` where id is typed as `Id<"tableName">`
- `v.id("tableName")` in validators

### Step 3: Cross-Reference Roadmap

Compare findings against `docs/SCHEMA_ROADMAP.md`:

| Table | Schema Status | Roadmap Status | Match |
|-------|---------------|----------------|-------|
| profiles | USED | ACTIVE | Yes |
| dailyWisdom | UNUSED | PLANNED (Admin) | Yes |
| subscriptions | MISSING | REMOVED | Yes |

### Step 4: Generate Report

#### Quick Summary (no args)
```
Schema Health Check
===================
Total Tables:    27
Active:          21
Planned:         5
Partial:         1
Orphaned:        0

Status: HEALTHY
```

#### Unused Tables (--unused)
```
Unused Schema Tables
====================
Table               Defined In          Roadmap Status
-----               ----------          --------------
dailyWisdom         schema.ts:142       PLANNED (Admin Dashboard)
educationalArticles schema.ts:156       PLANNED (Admin Dashboard)
emailTemplates      schema.ts:170       PLANNED (Admin Dashboard)
smartSuggestions    schema.ts:184       PLANNED (Admin Dashboard)
userSuggestions     schema.ts:198       PLANNED (Admin Dashboard)
notifications       schema.ts:212       PLANNED (Admin Dashboard)

Recommendation: These are expected - part of Admin Dashboard milestone
```

#### Specific Table (<table>)
```
Table: profiles
===============
Location: schema.ts:45-62

Fields:
- userId: string (indexed)
- clerkId: string (indexed)
- firstName: string
- lastName: string
- phone: string (optional)
- avatarUrl: string (optional)
- onboardingCompletedAt: number (optional)
- createdAt: number
- updatedAt: number

Indexes:
- by_userId
- by_clerkId

Usage Found (12 files):
- src/convex/auth.ts: 8 references
- src/convex/profiles.ts: 15 references
- src/convex/households.ts: 4 references
- src/convex/onboarding.ts: 6 references
...

Roadmap Status: ACTIVE
Implementation: COMPLETE
```

#### Full Audit (--full)
```
Full Schema Audit
=================
Date: 2024-12-31

## Summary
- Total Tables: 27
- With Implementation: 21 (78%)
- Planned (No Implementation): 5 (18%)
- Partial Implementation: 1 (4%)

## By Category

### Authentication & Users (3 tables)
| Table | Status | Files Using | Coverage |
|-------|--------|-------------|----------|
| profiles | ACTIVE | 12 | Full |
| userRoles | ACTIVE | 2 | Full |
| userPreferences | ACTIVE | 3 | Full |

### Households (3 tables)
| Table | Status | Files Using | Coverage |
|-------|--------|-------------|----------|
| households | ACTIVE | 15 | Full |
| householdMemberships | ACTIVE | 8 | Full |
| householdInvitations | ACTIVE | 4 | Full |

... (continue for all categories)

## Action Items
1. [letters] - PARTIAL: Add CRUD implementation
2. [dailyWisdom] - PLANNED: Part of Admin Dashboard

## Roadmap Alignment
All tables align with SCHEMA_ROADMAP.md - No orphaned or undocumented tables.
```

### Step 5: Roadmap Sync (--roadmap)

Compare schema.ts against SCHEMA_ROADMAP.md:

```
Schema ↔ Roadmap Sync
=====================

MATCHES:
- 26 tables documented and present
- All statuses accurate

DISCREPANCIES:
- None found

Last Roadmap Update: December 2024
Recommendation: Roadmap is current
```

If discrepancies found:
```
DISCREPANCIES:
- [newTable] in schema.ts but NOT in roadmap
  Action: Add to SCHEMA_ROADMAP.md

- [removedTable] in roadmap but NOT in schema.ts
  Action: Mark as REMOVED in roadmap
```

## Usage Examples

```bash
# Quick health check
/schema-check

# Find unused tables
/schema-check --unused

# Check specific table
/schema-check profiles

# Full audit report
/schema-check --full

# Verify roadmap alignment
/schema-check --roadmap
```
