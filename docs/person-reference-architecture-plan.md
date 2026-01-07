# Person Reference Architecture - Implementation Plan

## Overview

Refactor legal document data collection to leverage existing `familyMembers` and `keyContacts` tables instead of redundant free-text entry. This creates a unified person model with better UX (auto-selection, pre-population) while maintaining manual fallback for every field.

## Architecture Summary

```
┌─────────────────────────────────────────────────────────────────┐
│                    PERSON DATA SOURCES                          │
├─────────────────────────────────────────────────────────────────┤
│  familyMembers     → Family (spouse, children, parents, etc.)   │
│  keyContacts       → Non-family (friends, professionals, orgs)  │
│  Ephemeral         → Witnesses/notaries (document-only)         │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                   PERSON REFERENCE PATTERN                      │
├─────────────────────────────────────────────────────────────────┤
│  {                                                              │
│    sourceType: "familyMember" | "keyContact" | "manual"         │
│    familyMemberId?: Id<"familyMembers">                         │
│    keyContactId?: Id<"keyContacts">                             │
│    // Resolved or manually entered data:                        │
│    fullName: string                                             │
│    address?: string                                             │
│    city?: string                                                │
│    state?: string                                               │
│    zipCode?: string                                             │
│    phone?: string                                               │
│    email?: string                                               │
│    relationship?: string                                        │
│    dateOfBirth?: number                                         │
│  }                                                              │
└─────────────────────────────────────────────────────────────────┘
```

## Key Decisions

| Aspect | Decision |
|--------|----------|
| Family data source | `familyMembers` table |
| Non-family data source | `keyContacts` table (expanded roles) |
| Logged-in user data | From their `familyMembers` record (linked via `profileId`) |
| Data reference | Live reference - always pull current data |
| Witnesses/notaries | Ephemeral - document-only, not saved |
| Addresses | Embedded in `familyMembers` (DDD approach) |
| Auto-selection | Yes - auto-fill when relationship is known |
| Manual fallback | Always available for every field |
| New person capture | Option to save to `keyContacts` when entering new non-family person |

---

## Phase 1: Schema Changes

### 1.1 Add Address Fields to `familyMembers`

**File:** `src/convex/schema.ts`

```typescript
// Add to familyMembers table (around line 222)
familyMembers: defineTable({
  // ... existing fields ...
  city: v.optional(v.string()),
  state: v.optional(v.string()),
  // NEW: Add full address support
  address: v.optional(v.string()),    // Street address
  zipCode: v.optional(v.string()),    // ZIP/postal code
  // ... rest of fields ...
})
```

### 1.2 Expand `keyContacts` Roles

**File:** `src/convex/schema.ts`

```typescript
// Update keyContacts role union (around line 418)
keyContacts: defineTable({
  // ... existing fields ...
  role: v.union(
    // Existing professional roles
    v.literal("attorney"),
    v.literal("financial_advisor"),
    v.literal("executor"),
    v.literal("trustee"),
    v.literal("guardian"),
    v.literal("healthcare_proxy"),
    // NEW: Personal contact roles
    v.literal("friend"),
    v.literal("neighbor"),
    v.literal("business_partner"),
    v.literal("caregiver"),
    v.literal("charitable_org"),
    v.literal("religious_org"),
    v.literal("other"),
  ),
  // NEW: Add relationship field for personal contacts
  relationship: v.optional(v.string()),
  // ... rest of fields ...
})
```

### 1.3 Update Onboarding to Copy Address

**File:** `src/convex/onboarding.ts`

When creating the user's familyMembers record, also copy address fields from profile:

```typescript
// In createFirstHousehold mutation (around line 265)
await ctx.db.insert("familyMembers", {
  // ... existing fields ...
  city: profile.city,
  state: profile.state,
  address: profile.address,     // NEW
  zipCode: profile.zipCode,     // NEW
  // ... rest of fields ...
});
```

---

## Phase 2: Helper Functions

### 2.1 Person Resolver

**File:** `src/convex/persons.ts` (NEW)

```typescript
/**
 * Person Resolution Module
 *
 * Provides helpers to:
 * - Resolve person data from familyMembers or keyContacts
 * - Find family members by relationship
 * - Build person picker options
 */

// Types
export interface PersonReference {
  sourceType: "familyMember" | "keyContact" | "manual";
  familyMemberId?: Id<"familyMembers">;
  keyContactId?: Id<"keyContacts">;
  // Resolved data (always present for display/PDF generation)
  fullName: string;
  firstName?: string;
  lastName?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  phone?: string;
  email?: string;
  relationship?: string;
  dateOfBirth?: number;
}

export interface PersonOption {
  id: string;
  type: "familyMember" | "keyContact";
  sourceId: Id<"familyMembers"> | Id<"keyContacts">;
  fullName: string;
  relationship?: string;
  isCurrentUser: boolean;
  // For display
  displayLabel: string;  // e.g., "Sarah Johnson (Spouse)"
  subLabel?: string;     // e.g., "123 Main St, Springfield, CA"
}

// Queries

/**
 * Get all person options for a household
 * Used to populate person picker dropdowns
 */
export const getPersonOptions = query({
  args: {
    householdId: v.id("households"),
    includeCurrentUser: v.optional(v.boolean()),
    filterByRelationship: v.optional(v.array(v.string())),
  },
  returns: v.array(PersonOptionValidator),
  handler: async (ctx, args) => {
    // ... implementation
  },
});

/**
 * Get current user's family member record
 * Used to pre-populate testator information
 */
export const getCurrentUserAsFamilyMember = query({
  args: { householdId: v.id("households") },
  returns: v.union(FamilyMemberValidator, v.null()),
  handler: async (ctx, args) => {
    const { profile } = await requireAuth(ctx);
    return ctx.db
      .query("familyMembers")
      .withIndex("by_household", (q) => q.eq("householdId", args.householdId))
      .filter((q) => q.eq(q.field("profileId"), profile._id))
      .first();
  },
});

/**
 * Find spouse for current user
 * Returns the family member with relationshipType "spouse" or "partner"
 */
export const getSpouse = query({
  args: { householdId: v.id("households") },
  returns: v.union(FamilyMemberValidator, v.null()),
  handler: async (ctx, args) => {
    // Find spouse in familyMembers
  },
});

/**
 * Find children for current user
 * Returns family members with relationshipType "child"
 */
export const getChildren = query({
  args: { householdId: v.id("households") },
  returns: v.array(FamilyMemberValidator),
  handler: async (ctx, args) => {
    // Find children, sorted by age (dateOfBirth)
  },
});

/**
 * Resolve a person reference to full data
 * Used when generating PDFs or displaying saved documents
 */
export const resolvePersonReference = query({
  args: {
    reference: PersonReferenceValidator,
  },
  returns: ResolvedPersonValidator,
  handler: async (ctx, args) => {
    if (args.reference.sourceType === "familyMember" && args.reference.familyMemberId) {
      const member = await ctx.db.get(args.reference.familyMemberId);
      if (member) {
        return {
          ...args.reference,
          fullName: `${member.firstName} ${member.lastName}`,
          firstName: member.firstName,
          lastName: member.lastName,
          address: member.address,
          city: member.city,
          state: member.state,
          zipCode: member.zipCode,
          phone: member.phone,
          email: member.email,
          dateOfBirth: member.dateOfBirth,
          relationship: member.relationshipType,
        };
      }
    }
    // Similar for keyContact or return manual data as-is
  },
});

// Mutations

/**
 * Save a new contact from legal document entry
 * When user enters a new person and opts to save them
 */
export const saveAsKeyContact = mutation({
  args: {
    householdId: v.id("households"),
    legacyPlanId: v.optional(v.id("legacyPlans")),
    name: v.string(),
    role: KeyContactRoleValidator,
    relationship: v.optional(v.string()),
    phone: v.optional(v.string()),
    email: v.optional(v.string()),
    address: v.optional(v.string()),
  },
  returns: v.id("keyContacts"),
  handler: async (ctx, args) => {
    // Create keyContact and return ID
  },
});
```

### 2.2 Age Calculator Utility

**File:** `src/lib/person-utils.ts` (NEW)

```typescript
/**
 * Calculate age from date of birth
 */
export function calculateAge(dateOfBirth: number): number {
  const today = new Date();
  const birth = new Date(dateOfBirth);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

/**
 * Check if person is a minor (under 18)
 */
export function isMinor(dateOfBirth: number): boolean {
  return calculateAge(dateOfBirth) < 18;
}

/**
 * Format full address from parts
 */
export function formatFullAddress(parts: {
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
}): string {
  const { address, city, state, zipCode } = parts;
  const cityStateZip = [city, state, zipCode].filter(Boolean).join(", ");
  return [address, cityStateZip].filter(Boolean).join(", ");
}

/**
 * Get relationship display label
 */
export function getRelationshipLabel(type: string): string {
  const labels: Record<string, string> = {
    parent: "Parent",
    child: "Child",
    spouse: "Spouse",
    partner: "Partner",
    sibling: "Sibling",
    grandparent: "Grandparent",
    grandchild: "Grandchild",
    aunt_uncle: "Aunt/Uncle",
    niece_nephew: "Niece/Nephew",
    cousin: "Cousin",
    in_law: "In-Law",
    other: "Other",
  };
  return labels[type] || type;
}
```

---

## Phase 3: Person Picker UI Components

### 3.1 PersonPicker Component

**File:** `src/components/person-picker.tsx` (NEW)

A reusable component that:
- Shows dropdown with family members and contacts
- Groups by relationship type
- Shows "Add new person" option
- Supports auto-selection mode
- Always allows manual override

```typescript
interface PersonPickerProps {
  householdId: Id<"households">;
  value: PersonReference | null;
  onChange: (value: PersonReference) => void;

  // Filtering
  filterRelationships?: string[];  // Only show certain relationships
  excludeIds?: string[];           // Exclude specific people
  excludeMinors?: boolean;         // For executor/agent roles

  // Auto-selection
  autoSelectRelationship?: string; // Auto-select if only one match

  // Labels
  label: string;
  placeholder?: string;
  helpText?: string;
  required?: boolean;

  // Manual entry
  allowManualEntry?: boolean;      // Default true
  onSaveNewContact?: (contact: NewContactData) => void;
}

export function PersonPicker({
  householdId,
  value,
  onChange,
  filterRelationships,
  excludeIds,
  excludeMinors,
  autoSelectRelationship,
  label,
  placeholder = "Select a person...",
  helpText,
  required,
  allowManualEntry = true,
  onSaveNewContact,
}: PersonPickerProps) {
  // Query person options
  const options = useQuery(api.persons.getPersonOptions, {
    householdId,
    filterByRelationship: filterRelationships,
  });

  // State for manual entry mode
  const [isManualMode, setIsManualMode] = useState(false);
  const [manualData, setManualData] = useState<ManualPersonData>({});

  // Auto-select logic
  useEffect(() => {
    if (autoSelectRelationship && options && !value) {
      const matches = options.filter(o => o.relationship === autoSelectRelationship);
      if (matches.length === 1) {
        onChange({
          sourceType: matches[0].type,
          familyMemberId: matches[0].type === "familyMember" ? matches[0].sourceId : undefined,
          keyContactId: matches[0].type === "keyContact" ? matches[0].sourceId : undefined,
          fullName: matches[0].fullName,
          // ... other resolved fields
        });
      }
    }
  }, [autoSelectRelationship, options, value, onChange]);

  // Render grouped dropdown or manual entry form
}
```

### 3.2 PersonPickerField Component

**File:** `src/components/person-picker-field.tsx` (NEW)

A form field wrapper that handles:
- Display of selected person with edit option
- Inline manual entry expansion
- Validation messages
- "Save to contacts" checkbox for new entries

### 3.3 AddressDisplay Component

**File:** `src/components/address-display.tsx` (NEW)

Formats and displays addresses consistently:
```typescript
interface AddressDisplayProps {
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  format?: "inline" | "multiline";
}
```

---

## Phase 4: Update Legal Document Wizards

### 4.1 Refactor Wizard Field Types

**File:** `src/app/(auth)/(dashboard)/legacy/components/legal-document-wizard.tsx`

Add new field types:
```typescript
interface WizardField {
  id: string;
  label: string;
  type:
    | "text"
    | "textarea"
    | "select"
    | "checkbox"
    | "date"
    | "number"
    | "heading"
    | "info"
    | "person"        // NEW: Person picker
    | "personList";   // NEW: Multiple person picker (beneficiaries)

  // Person picker specific
  personConfig?: {
    filterRelationships?: string[];
    excludeMinors?: boolean;
    autoSelectRelationship?: string;
    allowSaveAsContact?: boolean;
  };

  // ... existing fields
}
```

### 4.2 Update Will Steps

**File:** `src/app/(auth)/(dashboard)/legacy/components/legal-document-wizard.tsx`

Transform text fields to person pickers:

```typescript
const WILL_STEPS: WizardStep[] = [
  {
    id: "personal",
    title: "Personal Information",
    description: "Your basic information for the will",
    fields: [
      // CHANGED: Auto-populated from current user's familyMembers record
      {
        id: "testator",
        label: "Your Information",
        type: "person",
        required: true,
        personConfig: {
          autoSelectCurrentUser: true,  // Auto-fill from familyMembers
          allowManualOverride: true,    // Can still edit
        },
        helpText: "Pre-filled from your profile. Edit if needed.",
      },
      // CHANGED: County is separate (not in familyMembers)
      {
        id: "county",
        label: "County of Residence",
        type: "text",
        required: true,
      },
      // CHANGED: Marital status with spouse auto-detection
      {
        id: "maritalStatus",
        label: "Marital Status",
        type: "select",
        required: true,
        options: [/* ... */],
      },
      // CHANGED: Spouse picker (auto-selects if one spouse in familyMembers)
      {
        id: "spouse",
        label: "Spouse/Partner",
        type: "person",
        dependsOn: { field: "maritalStatus", value: "married" },
        personConfig: {
          filterRelationships: ["spouse", "partner"],
          autoSelectRelationship: "spouse",
        },
      },
    ],
  },
  {
    id: "executor",
    title: "Executor Selection",
    description: "Choose who will manage your estate",
    fields: [
      // CHANGED: Person picker instead of text
      {
        id: "executor",
        label: "Primary Executor",
        type: "person",
        required: true,
        personConfig: {
          excludeMinors: true,
          allowSaveAsContact: true,
        },
        helpText: "Must be 18 or older",
      },
      {
        id: "alternateExecutor",
        label: "Alternate Executor",
        type: "person",
        personConfig: {
          excludeMinors: true,
          allowSaveAsContact: true,
        },
      },
    ],
  },
  {
    id: "beneficiaries",
    title: "Beneficiaries",
    description: "Who will inherit your estate",
    fields: [
      // CHANGED: Person picker for primary beneficiary
      {
        id: "residuaryBeneficiary",
        label: "Primary Beneficiary",
        type: "person",
        required: true,
        personConfig: {
          allowSaveAsContact: true,
        },
      },
      // Children auto-populated
      {
        id: "children",
        label: "Children",
        type: "personList",
        personConfig: {
          filterRelationships: ["child"],
          autoPopulateFromFamily: true,
        },
        helpText: "Your children are shown from your family. Add others if needed.",
      },
    ],
  },
  {
    id: "guardian",
    title: "Guardian for Minor Children",
    description: "If you have minor children",
    fields: [
      {
        id: "guardian",
        label: "Guardian for Minor Children",
        type: "person",
        personConfig: {
          excludeMinors: true,
          allowSaveAsContact: true,
        },
      },
      {
        id: "alternateGuardian",
        label: "Alternate Guardian",
        type: "person",
        personConfig: {
          excludeMinors: true,
          allowSaveAsContact: true,
        },
      },
    ],
  },
  // ... remaining steps
];
```

### 4.3 Update Other Document Types

Apply similar transformations to:
- Trust wizard (trustee, successor trustee, beneficiaries)
- Pour-Over Will wizard (references trust)
- Financial POA wizard (agent, alternate agent)
- Healthcare POA wizard (healthcare agent, alternate)
- Advance Directive wizard (agent if applicable)

### 4.4 Update Response Storage

The `responses` JSON blob in `legalDocuments` table will store `PersonReference` objects:

```typescript
// Before (string)
{
  "executorName": "John Smith",
  "executorAddress": "123 Main St"
}

// After (PersonReference)
{
  "executor": {
    "sourceType": "familyMember",
    "familyMemberId": "abc123",
    "fullName": "John Smith",
    "address": "123 Main St",
    "city": "Springfield",
    "state": "CA",
    "zipCode": "90210"
  }
}
```

### 4.5 Update PDF Generators

**Files:** `src/app/(auth)/(dashboard)/legacy/components/pdf-generators/*.tsx`

Update to accept `PersonReference` objects and resolve data:

```typescript
// In will-pdf-generator.tsx
interface WillPDFData {
  // Before
  // fullName: string;
  // executorName: string;

  // After
  testator: PersonReference;
  executor: PersonReference;
  alternateExecutor?: PersonReference;
  spouse?: PersonReference;
  children?: PersonReference[];
  guardian?: PersonReference;
  // ... etc
}

// Render using resolved data
<Text>{r.testator.fullName}</Text>
<Text>{formatFullAddress(r.testator)}</Text>
```

---

## Phase 5: Testing & Validation

### 5.1 Test Cases

1. **New user flow**: Onboarding creates familyMembers record with address
2. **Existing user flow**: Can update their familyMembers record
3. **Auto-selection**: Spouse auto-selects when one exists
4. **Manual override**: Can edit auto-selected values
5. **New person entry**: Can enter person not in family/contacts
6. **Save to contacts**: New person can be saved as keyContact
7. **Age validation**: Minors excluded from executor/agent roles
8. **PDF generation**: PersonReference resolves to current data

### 5.2 Edge Cases

1. User has no spouse in familyMembers but selects "married"
2. User has multiple children - all should appear
3. keyContact has no address - allow document completion
4. familyMember record updated after document created - PDF shows current data

---

## Implementation Order

1. **Schema changes** (Phase 1) - Add fields, run migration
2. **Helper functions** (Phase 2) - Build queries/mutations
3. **PersonPicker component** (Phase 3.1) - Core UI
4. **Will wizard update** (Phase 4.2) - Prove pattern works
5. **PDF generator update** (Phase 4.5) - Verify end-to-end
6. **Remaining wizards** (Phase 4.3-4.4) - Apply pattern to all documents
7. **Testing** (Phase 5) - Comprehensive validation

---

## Files to Create/Modify

### New Files
- `src/convex/persons.ts` - Person resolution queries/mutations
- `src/lib/person-utils.ts` - Utility functions
- `src/components/person-picker.tsx` - Main picker component
- `src/components/person-picker-field.tsx` - Form field wrapper
- `src/components/address-display.tsx` - Address formatting

### Modified Files
- `src/convex/schema.ts` - Add address fields, expand roles
- `src/convex/onboarding.ts` - Copy address to familyMembers
- `src/app/(auth)/(dashboard)/legacy/components/legal-document-wizard.tsx` - Add person field types
- `src/app/(auth)/(dashboard)/legacy/components/pdf-generators/*.tsx` - Accept PersonReference

---

## Estimated Scope

| Phase | Complexity | Dependencies |
|-------|------------|--------------|
| Phase 1: Schema | Low | None |
| Phase 2: Helpers | Medium | Phase 1 |
| Phase 3: UI Components | Medium | Phase 2 |
| Phase 4: Wizard Updates | High | Phase 2, 3 |
| Phase 5: Testing | Medium | All phases |
