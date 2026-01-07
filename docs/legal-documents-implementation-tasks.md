# Legal Document Template Remediation - Implementation Tasks

**Project:** Second Nature Legacy Planning - Legal Document Templates  
**Created:** January 5, 2026  
**Target Files:**
- `src/lib/state-legal-requirements.ts`
- `src/app/(auth)/(dashboard)/legacy/components/legal-document-pdf.tsx`
- `src/app/(auth)/(dashboard)/legacy/components/legal-document-wizard.tsx`
- `src/app/(auth)/(dashboard)/legacy/components/legal-documents-section.tsx`

**Tech Stack:** React, TypeScript, Convex, @react-pdf/renderer

---

## Task Legend

- **[CRITICAL]** — Must be completed; creates legal exposure if missing
- **[HIGH]** — Important for document validity; prioritize
- **[MEDIUM]** — Enhances document quality; schedule after critical/high
- **[LOW]** — Nice to have; schedule as time permits

---

## Epic 1: Type System Enhancements

### Task 1.1: Add Witness Restriction Types [HIGH]

**File:** `src/lib/state-legal-requirements.ts`

**Location:** After line 182 (after `AdvanceDirectiveRequirements` interface)

**Implementation:**

Add the following TypeScript interfaces:

```typescript
/**
 * Witness restriction categories by document type and state
 */
export interface WitnessRestrictions {
  /** Whether beneficiaries can serve as witnesses */
  beneficiaryCanWitness: boolean;
  /** Consequence if beneficiary witnesses */
  beneficiaryWitnessConsequence: 'void_bequest' | 'void_will' | 'no_consequence' | null;
  /** Whether family members can witness */
  familyCanWitness: boolean;
  /** Whether healthcare providers can witness healthcare documents */
  healthcareProviderCanWitness: boolean;
  /** Whether facility operators/employees can witness */
  facilityEmployeeCanWitness: boolean;
  /** Special restrictions as free text */
  additionalRestrictions: string | null;
}
```

**Acceptance Criteria:**
- [ ] Interface compiles without errors
- [ ] Interface is exported from module
- [ ] JSDoc comments included for each property

---

### Task 1.2: Add Pregnancy Provisions Type [HIGH]

**File:** `src/lib/state-legal-requirements.ts`

**Location:** After `WitnessRestrictions` interface

**Implementation:**

```typescript
/**
 * Pregnancy provisions for advance directives
 * Some states require explicit language about pregnancy
 */
export interface PregnancyProvisions {
  /** Whether state requires pregnancy exception language */
  pregnancyExceptionRequired: boolean;
  /** State's default behavior if not specified */
  defaultBehavior: 'directive_suspended' | 'directive_continues' | 'patient_choice';
  /** Required statutory language if any */
  statutoryLanguage: string | null;
}
```

**Acceptance Criteria:**
- [ ] Interface compiles without errors
- [ ] Interface is exported from module

---

### Task 1.3: Add Enhanced Will Requirements Type [CRITICAL]

**File:** `src/lib/state-legal-requirements.ts`

**Location:** After `PregnancyProvisions` interface

**Implementation:**

```typescript
/**
 * Enhanced Will Requirements extending base WillRequirements
 */
export interface EnhancedWillRequirements extends WillRequirements {
  /** Witness restrictions */
  witnessRestrictions: WitnessRestrictions;
  /** Whether no-contest clauses are enforceable in this state */
  noContestClauseEnforceable: boolean;
  /** Limitations on no-contest clause enforcement */
  noContestLimitations: string | null;
  /** Default survival period (days) recognized by state */
  defaultSurvivalPeriod: number;
  /** Whether state has adopted RUFADAA for digital assets */
  rufadaaAdopted: boolean;
  /** Whether this is a community property state */
  communityPropertyState: boolean;
}
```

**Acceptance Criteria:**
- [ ] Interface extends `WillRequirements` correctly
- [ ] All new properties have appropriate types
- [ ] Interface is exported

---

### Task 1.4: Add Enhanced Healthcare POA Requirements Type [CRITICAL]

**File:** `src/lib/state-legal-requirements.ts`

**Location:** After `EnhancedWillRequirements` interface

**Implementation:**

```typescript
/**
 * Enhanced Healthcare POA Requirements
 */
export interface EnhancedHealthcarePOARequirements extends HealthcarePOARequirements {
  /** Witness restrictions specific to healthcare documents */
  witnessRestrictions: WitnessRestrictions;
  /** Whether HIPAA authorization is combined or separate */
  hipaaIntegration: 'combined' | 'separate_recommended' | 'separate_required';
  /** Mental health treatment authority */
  mentalHealthAuthority: 'included' | 'separate_required' | 'not_permitted';
  /** Nursing home admission authority */
  nursingHomeAuthority: 'included' | 'separate_required' | 'court_required';
}
```

**Acceptance Criteria:**
- [ ] Interface extends `HealthcarePOARequirements` correctly
- [ ] All enum values documented
- [ ] Interface is exported

---

### Task 1.5: Add Enhanced Advance Directive Requirements Type [CRITICAL]

**File:** `src/lib/state-legal-requirements.ts`

**Location:** After `EnhancedHealthcarePOARequirements` interface

**Implementation:**

```typescript
/**
 * Enhanced Advance Directive Requirements
 */
export interface EnhancedAdvanceDirectiveRequirements extends AdvanceDirectiveRequirements {
  /** Pregnancy provisions */
  pregnancyProvisions: PregnancyProvisions;
  /** Witness restrictions */
  witnessRestrictions: WitnessRestrictions;
  /** Whether state has statutory form that must be substantially followed */
  statutoryFormRequired: boolean;
  /** Reference to state statutory form */
  statutoryFormReference: string | null;
  /** State-specific condition definitions */
  conditionDefinitions: {
    terminalCondition: string;
    permanentUnconsciousness: string;
    endStageCondition: string;
  };
}
```

**Acceptance Criteria:**
- [ ] Interface extends base type correctly
- [ ] Nested `conditionDefinitions` object typed properly
- [ ] Interface is exported

---

### Task 1.6: Add Enhanced Financial POA Requirements Type [HIGH]

**File:** `src/lib/state-legal-requirements.ts`

**Location:** After `EnhancedAdvanceDirectiveRequirements` interface

**Implementation:**

```typescript
/**
 * Enhanced Financial POA Requirements
 */
export interface EnhancedFinancialPOARequirements extends FinancialPOARequirements {
  /** Whether state has adopted Uniform Power of Attorney Act */
  upoaaAdopted: boolean;
  /** Witness restrictions */
  witnessRestrictions: WitnessRestrictions;
  /** Whether agent acceptance acknowledgment is recommended */
  agentAcceptanceRecommended: boolean;
  /** Whether state has statutory third-party reliance provisions */
  thirdPartyRelianceStatutory: boolean;
  /** Powers that require explicit grant (not implied) */
  explicitGrantRequired: string[];
}
```

**Acceptance Criteria:**
- [ ] Interface extends base type correctly
- [ ] `explicitGrantRequired` array typed as `string[]`
- [ ] Interface is exported

---

### Task 1.7: Add Enhanced Trust Requirements Type [HIGH]

**File:** `src/lib/state-legal-requirements.ts`

**Location:** After `EnhancedFinancialPOARequirements` interface

**Implementation:**

```typescript
/**
 * Enhanced Trust Requirements
 */
export interface EnhancedTrustRequirements extends TrustRequirements {
  /** Whether certificate of trust is recognized */
  certificateOfTrustRecognized: boolean;
  /** Pour-over will coordination requirements */
  pourOverWillRequirements: string | null;
  /** Reference to state trust code */
  trustCodeReference: string | null;
}
```

**Acceptance Criteria:**
- [ ] Interface extends base type correctly
- [ ] Interface is exported

---

### Task 1.8: Add Document Coordination Types [MEDIUM]

**File:** `src/lib/state-legal-requirements.ts`

**Location:** After all enhanced requirement interfaces

**Implementation:**

```typescript
/**
 * Document coordination and dependencies
 */
export interface DocumentCoordination {
  /** Documents that should be created together */
  recommendedCompanions: DocumentType[];
  /** Documents that must reference each other */
  requiredReferences: DocumentType[];
  /** Warning message for standalone creation */
  standaloneWarning: string | null;
}

/**
 * Coordination rules for each document type
 */
export const DOCUMENT_COORDINATION: Record<string, DocumentCoordination> = {
  will: {
    recommendedCompanions: ['financial_poa', 'healthcare_poa', 'advance_directive'],
    requiredReferences: [],
    standaloneWarning: null,
  },
  revocable_trust: {
    recommendedCompanions: ['financial_poa', 'healthcare_poa'],
    requiredReferences: [],
    standaloneWarning: 'A trust without a pour-over will may leave assets outside the trust subject to probate.',
  },
  pour_over_will: {
    recommendedCompanions: [],
    requiredReferences: ['revocable_trust'],
    standaloneWarning: 'A pour-over will requires an existing trust to pour assets into. Create your trust first.',
  },
  financial_poa: {
    recommendedCompanions: ['healthcare_poa', 'advance_directive'],
    requiredReferences: [],
    standaloneWarning: null,
  },
  healthcare_poa: {
    recommendedCompanions: ['advance_directive', 'financial_poa'],
    requiredReferences: [],
    standaloneWarning: null,
  },
  advance_directive: {
    recommendedCompanions: ['healthcare_poa'],
    requiredReferences: [],
    standaloneWarning: 'An advance directive without a healthcare POA means no one can make decisions not covered by the directive.',
  },
};
```

**Acceptance Criteria:**
- [ ] Interface and constant compile without errors
- [ ] All six document types have coordination entries
- [ ] Both are exported from module

---

### Task 1.9: Update StateLegalRequirements Interface [CRITICAL]

**File:** `src/lib/state-legal-requirements.ts`

**Location:** Line 187-193 (existing `StateLegalRequirements` interface)

**Implementation:**

Update the interface to use enhanced types:

```typescript
/**
 * Complete state legal requirements with enhanced types
 */
export interface StateLegalRequirements {
  will: EnhancedWillRequirements;
  revocable_trust: EnhancedTrustRequirements;
  financial_poa: EnhancedFinancialPOARequirements;
  healthcare_poa: EnhancedHealthcarePOARequirements;
  advance_directive: EnhancedAdvanceDirectiveRequirements;
}
```

**Note:** This is a breaking change. All state data entries must be updated (see Epic 2).

**Acceptance Criteria:**
- [ ] Interface uses all enhanced types
- [ ] TypeScript compilation identifies all state data entries needing updates

---

## Epic 2: State Data Enhancement

### Task 2.1: Create State Data Migration Template [CRITICAL]

**File:** `src/lib/state-legal-requirements.ts`

**Purpose:** Create a template object showing required structure for each state entry.

**Implementation:**

Create a reference template (can be placed in comments or as a separate constant):

```typescript
/**
 * Template for state data migration - copy this structure for each state
 */
const STATE_DATA_TEMPLATE: StateLegalRequirements = {
  will: {
    // Existing fields
    witnessCount: 2,
    notaryRequired: false,
    notaryAlternative: false,
    selfProvingAllowed: true,
    minimumWitnessAge: 18,
    holographicAllowed: false,
    specialRequirements: null,
    // NEW fields
    witnessRestrictions: {
      beneficiaryCanWitness: false,
      beneficiaryWitnessConsequence: null,
      familyCanWitness: true,
      healthcareProviderCanWitness: true,
      facilityEmployeeCanWitness: true,
      additionalRestrictions: null,
    },
    noContestClauseEnforceable: true,
    noContestLimitations: null,
    defaultSurvivalPeriod: 120, // hours per Uniform Simultaneous Death Act
    rufadaaAdopted: false,
    communityPropertyState: false,
  },
  revocable_trust: {
    // Existing fields
    witnessCount: 0,
    notaryRequired: true,
    documentName: "Revocable Living Trust",
    minimumWitnessAge: 18,
    specialRequirements: null,
    // NEW fields
    certificateOfTrustRecognized: true,
    pourOverWillRequirements: null,
    trustCodeReference: null,
  },
  financial_poa: {
    // Existing fields
    witnessCount: 2,
    notaryRequired: true,
    notaryAlternative: false,
    documentName: "Durable Power of Attorney",
    minimumWitnessAge: 18,
    specialRequirements: null,
    // NEW fields
    upoaaAdopted: false,
    witnessRestrictions: {
      beneficiaryCanWitness: true,
      beneficiaryWitnessConsequence: null,
      familyCanWitness: true,
      healthcareProviderCanWitness: true,
      facilityEmployeeCanWitness: true,
      additionalRestrictions: null,
    },
    agentAcceptanceRecommended: true,
    thirdPartyRelianceStatutory: false,
    explicitGrantRequired: [],
  },
  healthcare_poa: {
    // Existing fields
    witnessCount: 2,
    notaryRequired: false,
    notaryAlternative: true,
    documentName: "Healthcare Power of Attorney",
    minimumWitnessAge: 18,
    specialRequirements: null,
    // NEW fields
    witnessRestrictions: {
      beneficiaryCanWitness: false,
      beneficiaryWitnessConsequence: null,
      familyCanWitness: true,
      healthcareProviderCanWitness: false,
      facilityEmployeeCanWitness: false,
      additionalRestrictions: null,
    },
    hipaaIntegration: 'combined',
    mentalHealthAuthority: 'included',
    nursingHomeAuthority: 'included',
  },
  advance_directive: {
    // Existing fields
    witnessCount: 2,
    notaryRequired: false,
    notaryAlternative: true,
    documentName: "Advance Healthcare Directive",
    minimumWitnessAge: 18,
    specialRequirements: null,
    // NEW fields
    pregnancyProvisions: {
      pregnancyExceptionRequired: false,
      defaultBehavior: 'patient_choice',
      statutoryLanguage: null,
    },
    witnessRestrictions: {
      beneficiaryCanWitness: false,
      beneficiaryWitnessConsequence: null,
      familyCanWitness: true,
      healthcareProviderCanWitness: false,
      facilityEmployeeCanWitness: false,
      additionalRestrictions: null,
    },
    statutoryFormRequired: false,
    statutoryFormReference: null,
    conditionDefinitions: {
      terminalCondition: "incurable and irreversible condition that will result in death within a relatively short time",
      permanentUnconsciousness: "irreversible condition with absence of thought and awareness",
      endStageCondition: "irreversible condition with severe deterioration and complete physical dependency",
    },
  },
};
```

**Acceptance Criteria:**
- [ ] Template compiles against `StateLegalRequirements` interface
- [ ] All required fields present with sensible defaults

---

### Task 2.2: Update California State Data [CRITICAL]

**File:** `src/lib/state-legal-requirements.ts`

**Location:** CA entry in `STATE_LEGAL_REQUIREMENTS` (around line 260-300)

**Implementation:**

Update CA with researched values:

```typescript
CA: {
  will: {
    witnessCount: 2,
    notaryRequired: false,
    notaryAlternative: false,
    selfProvingAllowed: true,
    minimumWitnessAge: 18,
    holographicAllowed: true,
    specialRequirements: "Witnesses cannot be beneficiaries; interested witness rule applies (Prob. Code §6112)",
    // NEW fields
    witnessRestrictions: {
      beneficiaryCanWitness: true,
      beneficiaryWitnessConsequence: 'void_bequest',
      familyCanWitness: true,
      healthcareProviderCanWitness: true,
      facilityEmployeeCanWitness: true,
      additionalRestrictions: "Interested witness rule: bequest to witness is presumptively void but rebuttable",
    },
    noContestClauseEnforceable: true,
    noContestLimitations: "Not enforceable if contestant had probable cause (Prob. Code §21311)",
    defaultSurvivalPeriod: 120,
    rufadaaAdopted: true,
    communityPropertyState: true,
  },
  revocable_trust: {
    witnessCount: 0,
    notaryRequired: true,
    documentName: "Revocable Living Trust",
    minimumWitnessAge: 18,
    specialRequirements: null,
    certificateOfTrustRecognized: true,
    pourOverWillRequirements: "Pour-over will should reference trust by name and date",
    trustCodeReference: "California Probate Code §§15000-19530",
  },
  financial_poa: {
    witnessCount: 0,
    notaryRequired: true,
    notaryAlternative: false,
    documentName: "Uniform Statutory Form Power of Attorney",
    minimumWitnessAge: 18,
    specialRequirements: "California has adopted the Uniform Power of Attorney Act (Prob. Code §4000 et seq.)",
    upoaaAdopted: true,
    witnessRestrictions: {
      beneficiaryCanWitness: true,
      beneficiaryWitnessConsequence: null,
      familyCanWitness: true,
      healthcareProviderCanWitness: true,
      facilityEmployeeCanWitness: true,
      additionalRestrictions: null,
    },
    agentAcceptanceRecommended: true,
    thirdPartyRelianceStatutory: true,
    explicitGrantRequired: ['real_property', 'gifts'],
  },
  healthcare_poa: {
    witnessCount: 2,
    notaryRequired: false,
    notaryAlternative: true,
    documentName: "Advance Health Care Directive",
    minimumWitnessAge: 18,
    specialRequirements: "One witness must be unrelated and not entitled to estate (Prob. Code §4701)",
    witnessRestrictions: {
      beneficiaryCanWitness: false,
      beneficiaryWitnessConsequence: null,
      familyCanWitness: true,
      healthcareProviderCanWitness: false,
      facilityEmployeeCanWitness: false,
      additionalRestrictions: "At least one witness must not be: related, entitled to estate, agent, or healthcare provider/employee",
    },
    hipaaIntegration: 'combined',
    mentalHealthAuthority: 'included',
    nursingHomeAuthority: 'included',
  },
  advance_directive: {
    witnessCount: 2,
    notaryRequired: false,
    notaryAlternative: true,
    documentName: "Advance Health Care Directive",
    minimumWitnessAge: 18,
    specialRequirements: "Combined with Healthcare POA in California statutory form",
    pregnancyProvisions: {
      pregnancyExceptionRequired: false,
      defaultBehavior: 'patient_choice',
      statutoryLanguage: null,
    },
    witnessRestrictions: {
      beneficiaryCanWitness: false,
      beneficiaryWitnessConsequence: null,
      familyCanWitness: true,
      healthcareProviderCanWitness: false,
      facilityEmployeeCanWitness: false,
      additionalRestrictions: "Same restrictions as Healthcare POA",
    },
    statutoryFormRequired: false,
    statutoryFormReference: "California Probate Code §§4700-4701",
    conditionDefinitions: {
      terminalCondition: "incurable and irreversible condition that has been medically confirmed and will result in death within a relatively short time",
      permanentUnconsciousness: "irreversible condition in which thought, awareness of self and environment, and other indicators of consciousness are absent",
      endStageCondition: "irreversible condition caused by injury, disease, or illness that has resulted in severe and permanent deterioration indicated by incompetency and complete physical dependency",
    },
  },
},
```

**Acceptance Criteria:**
- [ ] CA entry compiles against enhanced interface
- [ ] All new fields have researched, accurate values
- [ ] Statutory references included where applicable

---

### Task 2.3: Update Texas State Data [CRITICAL]

**File:** `src/lib/state-legal-requirements.ts`

**Location:** TX entry in `STATE_LEGAL_REQUIREMENTS`

**Implementation:**

Texas has specific pregnancy language requirements:

```typescript
TX: {
  will: {
    witnessCount: 2,
    notaryRequired: false,
    notaryAlternative: false,
    selfProvingAllowed: true,
    minimumWitnessAge: 14, // Texas allows witnesses 14+
    holographicAllowed: true,
    specialRequirements: "Texas allows witnesses age 14 and older",
    witnessRestrictions: {
      beneficiaryCanWitness: true,
      beneficiaryWitnessConsequence: 'no_consequence', // Texas allows
      familyCanWitness: true,
      healthcareProviderCanWitness: true,
      facilityEmployeeCanWitness: true,
      additionalRestrictions: null,
    },
    noContestClauseEnforceable: true,
    noContestLimitations: "Enforceable; Texas courts generally uphold (Tex. Est. Code §254.005)",
    defaultSurvivalPeriod: 120,
    rufadaaAdopted: true,
    communityPropertyState: true,
  },
  // ... other document types
  advance_directive: {
    witnessCount: 2,
    notaryRequired: false,
    notaryAlternative: false,
    documentName: "Directive to Physicians and Family or Surrogates",
    minimumWitnessAge: 18,
    specialRequirements: "Texas requires specific pregnancy language (Health & Safety Code §166.049)",
    pregnancyProvisions: {
      pregnancyExceptionRequired: true,
      defaultBehavior: 'directive_suspended',
      statutoryLanguage: "I understand that under Texas law this directive cannot be given effect during my pregnancy.",
    },
    witnessRestrictions: {
      beneficiaryCanWitness: false,
      beneficiaryWitnessConsequence: null,
      familyCanWitness: true,
      healthcareProviderCanWitness: false,
      facilityEmployeeCanWitness: false,
      additionalRestrictions: "Witness cannot be attending physician or employee of healthcare facility",
    },
    statutoryFormRequired: true,
    statutoryFormReference: "Texas Health & Safety Code §166.033",
    conditionDefinitions: {
      terminalCondition: "incurable condition caused by injury, disease, or illness that according to reasonable medical judgment will produce death within six months, even with available life-sustaining treatment",
      permanentUnconsciousness: "irreversible condition in which the patient is unconscious with no reasonable medical probability of regaining consciousness",
      endStageCondition: "irreversible condition caused by injury, disease, or illness that has resulted in progressively severe and permanent deterioration and that, in reasonable medical judgment, treatment would be ineffective",
    },
  },
},
```

**Acceptance Criteria:**
- [ ] TX entry compiles against enhanced interface
- [ ] Pregnancy provisions marked as required with statutory language
- [ ] Terminal condition definition uses "six months" per Texas statute

---

### Task 2.4: Update Florida State Data [HIGH]

**File:** `src/lib/state-legal-requirements.ts`

**Location:** FL entry in `STATE_LEGAL_REQUIREMENTS`

**Implementation:**

Florida has strict POA requirements:

```typescript
FL: {
  will: {
    witnessCount: 2,
    notaryRequired: false,
    notaryAlternative: false,
    selfProvingAllowed: true,
    minimumWitnessAge: 18,
    holographicAllowed: false, // Florida does NOT recognize holographic wills
    specialRequirements: "Florida does not recognize holographic wills; self-proving affidavit recommended",
    witnessRestrictions: {
      beneficiaryCanWitness: true,
      beneficiaryWitnessConsequence: 'void_bequest', // Supernumerary rule
      familyCanWitness: true,
      healthcareProviderCanWitness: true,
      facilityEmployeeCanWitness: true,
      additionalRestrictions: "Interested witness bequest void unless 2+ disinterested witnesses also sign",
    },
    noContestClauseEnforceable: true,
    noContestLimitations: null,
    defaultSurvivalPeriod: 120,
    rufadaaAdopted: true,
    communityPropertyState: false,
  },
  financial_poa: {
    witnessCount: 2,
    notaryRequired: true, // Florida requires BOTH witnesses AND notary
    notaryAlternative: false,
    documentName: "Durable Power of Attorney",
    minimumWitnessAge: 18,
    specialRequirements: "Florida requires two witnesses AND notarization (F.S. §709.2105)",
    upoaaAdopted: true,
    witnessRestrictions: {
      beneficiaryCanWitness: true,
      beneficiaryWitnessConsequence: null,
      familyCanWitness: true,
      healthcareProviderCanWitness: true,
      facilityEmployeeCanWitness: true,
      additionalRestrictions: null,
    },
    agentAcceptanceRecommended: true,
    thirdPartyRelianceStatutory: true,
    explicitGrantRequired: ['gifts', 'beneficiary_designations', 'trust_creation'],
  },
  // ... other document types
},
```

**Acceptance Criteria:**
- [ ] FL entry shows notary AND witness requirements for financial POA
- [ ] Holographic wills marked as not allowed
- [ ] Explicit grant requirements listed for Florida

---

### Task 2.5: Update Remaining State Data [HIGH]

**File:** `src/lib/state-legal-requirements.ts`

**Purpose:** Update all 51 state/territory entries with new required fields.

**Implementation Approach:**

1. Create a checklist of all 51 jurisdictions
2. For each state, research and update:
   - Witness restrictions
   - No-contest clause enforceability
   - RUFADAA adoption status
   - Community property status
   - Healthcare POA HIPAA integration
   - Mental health authority rules
   - Nursing home authority rules
   - Pregnancy provision requirements
   - Statutory form requirements
   - Condition definitions

**States Requiring Special Attention:**

| State | Special Issue |
|-------|--------------|
| LA | Notarial testament requirements; civil law state |
| VT | No self-proving affidavit |
| DC | Combined advance directive form |
| NY | Strict healthcare proxy witness rules |
| WI | Marital property state (similar to community property) |
| AZ, ID, NV, NM, WA | Community property states |

**Acceptance Criteria:**
- [ ] All 51 state entries compile against enhanced interface
- [ ] Community property states identified correctly (AZ, CA, ID, LA, NV, NM, TX, WA, WI)
- [ ] States with pregnancy provision requirements identified (TX, and others per research)
- [ ] States with statutory form requirements identified

---

### Task 2.6: Add State Condition Definitions [MEDIUM]

**File:** `src/lib/state-legal-requirements.ts`

**Purpose:** Add state-specific legal definitions for terminal condition, permanent unconsciousness, and end-stage condition.

**Implementation:**

For each state, research the statutory definitions. Example variations:

```typescript
// Texas uses "six months" timeframe
terminalCondition: "incurable condition...will produce death within six months"

// California uses "relatively short time"
terminalCondition: "incurable condition...will result in death within a relatively short time"

// Some states specify "reasonable medical judgment"
terminalCondition: "incurable condition...according to reasonable medical judgment will result in death"
```

**Acceptance Criteria:**
- [ ] Each state has specific condition definitions
- [ ] Definitions sourced from state statutes
- [ ] Timeframes vary appropriately by state

---

## Epic 3: Will Template Enhancements

### Task 3.1: Enhance Will Declaration Clause [CRITICAL]

**File:** `src/app/(auth)/(dashboard)/legacy/components/legal-document-pdf.tsx`

**Location:** `WillDocument` function, declaration section (around line 500-520)

**Current Code:**
```tsx
<Text style={styles.legalClause}>
  I, {r.fullName || "[YOUR FULL LEGAL NAME]"}, of {r.address || "[YOUR ADDRESS]"}, 
  State of {stateName}, being of sound mind and memory, do hereby declare this 
  to be my Last Will and Testament, hereby revoking all prior wills and codicils.
</Text>
```

**New Code:**
```tsx
<Text style={styles.legalClause}>
  I, {r.fullName || "[YOUR FULL LEGAL NAME]"}, a resident of {r.city || "[CITY]"}, 
  {r.county || "[COUNTY]"} County, State of {stateName}, being of the age of 
  majority in this state, of sound mind and memory, and not acting under duress, 
  menace, fraud, or the undue influence of any person, do hereby make, publish, 
  and declare this instrument to be my Last Will and Testament, hereby expressly 
  revoking all wills and codicils heretofore made by me.
</Text>
```

**Acceptance Criteria:**
- [ ] Declaration includes "age of majority" language
- [ ] Declaration includes "not acting under duress, menace, fraud, or undue influence"
- [ ] Declaration uses "make, publish, and declare" (legally significant phrasing)
- [ ] Declaration includes county field
- [ ] Declaration includes "expressly revoking"

---

### Task 3.2: Add County Field to Wizard [HIGH]

**File:** `src/app/(auth)/(dashboard)/legacy/components/legal-document-wizard.tsx`

**Location:** Personal information step for will wizard

**Implementation:**

Add field after city field:

```typescript
{
  id: "county",
  label: "County of Residence",
  type: "text",
  required: true,
  placeholder: "e.g., Los Angeles",
  helpText: "Your current county of residence (required for legal documents)",
  documentTypes: ['will', 'trust', 'pour_over_will'],
}
```

**Acceptance Criteria:**
- [ ] County field appears in wizard for will, trust, and pour-over will
- [ ] Field is marked required
- [ ] Field value available in PDF generation

---

### Task 3.3: Add Payment of Debts Article [CRITICAL]

**File:** `src/app/(auth)/(dashboard)/legacy/components/legal-document-pdf.tsx`

**Location:** `WillDocument` function, after appointment of executor section

**Implementation:**

Add new article:

```tsx
{/* Article: Payment of Debts, Expenses, and Taxes */}
<View style={styles.section}>
  <Text style={styles.sectionTitle}>Article {getArticleNum()} - Payment of Debts, Expenses, and Taxes</Text>
  <Text style={styles.legalClause}>
    I direct my Executor to pay from my residuary estate all my legally enforceable 
    debts, funeral expenses, costs of administration, and all estate, inheritance, 
    and succession taxes (including any interest and penalties thereon) that may be 
    assessed against my estate or any beneficiary thereof by reason of my death. 
    My Executor shall have sole discretion to determine which debts are legally 
    enforceable.
    {"\n\n"}
    {r.taxPaymentSource === "residuary" && 
      "It is my intention that all such taxes be paid from my residuary estate as an expense of administration, without apportionment or reimbursement from any beneficiary."
    }
    {r.taxPaymentSource === "apportioned" && 
      "It is my intention that estate and inheritance taxes be apportioned among the beneficiaries receiving property subject to such taxes, in proportion to the value of such property."
    }
    {r.taxPaymentSource === "specific_asset" && 
      `It is my intention that all such taxes be paid from the following asset or account: ${r.taxPaymentAsset || "[SPECIFY ASSET]"}.`
    }
  </Text>
</View>
```

**Acceptance Criteria:**
- [ ] Article appears in generated PDF
- [ ] Tax payment source selection affects generated language
- [ ] Article number increments correctly

---

### Task 3.4: Add Tax Payment Source Wizard Field [HIGH]

**File:** `src/app/(auth)/(dashboard)/legacy/components/legal-document-wizard.tsx`

**Location:** Estate distribution section of will wizard

**Implementation:**

```typescript
{
  id: "taxPaymentSource",
  label: "How should estate taxes and expenses be paid?",
  type: "select",
  required: true,
  options: [
    { 
      value: "residuary", 
      label: "From residuary estate (most common)" 
    },
    { 
      value: "apportioned", 
      label: "Apportioned among beneficiaries" 
    },
    { 
      value: "specific_asset", 
      label: "From a specific asset or account" 
    },
  ],
  helpText: "This determines which assets are used to pay estate taxes and administrative costs",
  documentTypes: ['will'],
},
{
  id: "taxPaymentAsset",
  label: "Specify asset for tax payment",
  type: "text",
  required: false,
  conditional: { field: "taxPaymentSource", value: "specific_asset" },
  placeholder: "e.g., Checking account at XYZ Bank ending in 1234",
  helpText: "Describe the specific asset or account to be used",
  documentTypes: ['will'],
}
```

**Acceptance Criteria:**
- [ ] Tax payment source field appears in wizard
- [ ] Conditional field appears when "specific_asset" selected
- [ ] Values available in PDF generation

---

### Task 3.5: Enhance Executor Powers Article [CRITICAL]

**File:** `src/app/(auth)/(dashboard)/legacy/components/legal-document-pdf.tsx`

**Location:** `WillDocument` function, executor section

**Current Issue:** Executor powers are not enumerated.

**Implementation:**

Replace or enhance executor section:

```tsx
{/* Article: Executor Powers and Duties */}
<View style={styles.section}>
  <Text style={styles.sectionTitle}>Article {getArticleNum()} - Executor Powers and Duties</Text>
  <Text style={styles.legalClause}>
    I grant to my Executor, without the necessity of court approval
    {r.executorBondWaiver && ", bond, or surety"}
    , the following powers to be exercised in the Executor's sole discretion:
  </Text>
  
  <View style={styles.subSection}>
    <Text style={styles.articleContent}>
      (a) To retain any property received from my estate for such time as my 
      Executor deems advisable;{"\n\n"}
      
      (b) To sell, lease, exchange, or otherwise dispose of any property, real 
      or personal, at public or private sale, with or without notice, upon such 
      terms and conditions as my Executor deems proper;{"\n\n"}
      
      (c) To invest and reinvest estate funds in any form of property, including 
      securities, real estate, or other investments my Executor deems advisable;{"\n\n"}
      
      (d) To borrow money for any estate purpose and to pledge or mortgage estate 
      property as security;{"\n\n"}
      
      (e) To compromise, settle, or abandon any claims by or against my estate;{"\n\n"}
      
      (f) To employ attorneys, accountants, investment advisors, and other 
      professionals;{"\n\n"}
      
      (g) To make distributions in cash or in kind, or partly in each, at values 
      determined by my Executor;{"\n\n"}
      
      (h) To continue or participate in any business interest I may own;{"\n\n"}
      
      (i) To exercise all rights with respect to digital assets as permitted by 
      applicable law, including the Revised Uniform Fiduciary Access to Digital 
      Assets Act if adopted in {stateName};{"\n\n"}
      
      (j) To perform all other acts necessary or appropriate for the proper 
      administration of my estate.
    </Text>
  </View>

  {r.executorBondWaiver && (
    <Text style={[styles.legalClause, { marginTop: 8 }]}>
      I expressly waive the requirement for any bond or surety for my Executor 
      and any alternate Executor.
    </Text>
  )}

  <Text style={[styles.legalClause, { marginTop: 8 }]}>
    EXECUTOR COMPENSATION: {
      r.executorCompensation === "statutory" 
        ? `My Executor shall be entitled to compensation as provided by the laws of ${stateName}.`
        : r.executorCompensation === "reasonable"
        ? "My Executor shall be entitled to reasonable compensation for services rendered."
        : r.executorCompensation === "none"
        ? "My Executor shall serve without compensation, but shall be reimbursed for reasonable expenses."
        : r.executorCompensation === "specific"
        ? `My Executor shall be entitled to compensation of ${r.executorCompensationAmount || "[SPECIFY AMOUNT]"}.`
        : "My Executor shall be entitled to reasonable compensation."
    }
  </Text>
</View>
```

**Acceptance Criteria:**
- [ ] All 10 enumerated powers appear in PDF
- [ ] Bond waiver language conditional on wizard selection
- [ ] Compensation language reflects wizard selection
- [ ] RUFADAA reference included

---

### Task 3.6: Add Executor Powers Wizard Fields [HIGH]

**File:** `src/app/(auth)/(dashboard)/legacy/components/legal-document-wizard.tsx`

**Location:** Executor section of will wizard

**Implementation:**

```typescript
{
  id: "executorBondWaiver",
  label: "Waive executor bond requirement",
  type: "checkbox",
  required: false,
  defaultValue: true,
  helpText: "A bond is insurance that protects beneficiaries from executor misconduct. Waiving it saves your estate money but removes this protection.",
  documentTypes: ['will', 'pour_over_will'],
},
{
  id: "executorCompensation",
  label: "Executor Compensation",
  type: "select",
  required: true,
  options: [
    { value: "statutory", label: "Statutory rate (state-determined percentage)" },
    { value: "reasonable", label: "Reasonable compensation" },
    { value: "none", label: "No compensation (common for family members)" },
    { value: "specific", label: "Specific amount" },
  ],
  helpText: "How should your executor be paid for their work?",
  documentTypes: ['will', 'pour_over_will'],
},
{
  id: "executorCompensationAmount",
  label: "Specific compensation amount",
  type: "text",
  required: false,
  conditional: { field: "executorCompensation", value: "specific" },
  placeholder: "e.g., $5,000 or 2% of estate value",
  documentTypes: ['will', 'pour_over_will'],
}
```

**Acceptance Criteria:**
- [ ] Bond waiver checkbox defaults to true
- [ ] Compensation options available in wizard
- [ ] Conditional field for specific amount works correctly

---

### Task 3.7: Enhance Residuary Clause [CRITICAL]

**File:** `src/app/(auth)/(dashboard)/legacy/components/legal-document-pdf.tsx`

**Location:** `WillDocument` function, residuary estate section (around line 620-650)

**Current Issue:** Missing contingent layers; doesn't handle all beneficiaries predeceasing.

**Implementation:**

```tsx
{/* Article: Residuary Estate */}
<View style={styles.section}>
  <Text style={styles.sectionTitle}>Article {getArticleNum()} - Residuary Estate</Text>
  <Text style={styles.legalClause}>
    I give, devise, and bequeath all the rest, residue, and remainder of my 
    estate, both real and personal, of whatever kind and wherever situated, 
    which I may own or be entitled to at the time of my death (hereinafter 
    referred to as my "Residuary Estate") as follows:
  </Text>
  
  <View style={styles.subSection}>
    <Text style={styles.articleContent}>
      (a) PRIMARY DISTRIBUTION: If my {r.residuaryRelationship || "beneficiary"}{" "}
      {r.residuaryBeneficiary || "[PRIMARY BENEFICIARY NAME]"} survives me by{" "}
      {survivalPeriod} days, I give {r.residuaryPercentage || "100"}% of my 
      Residuary Estate to {r.residuaryBeneficiary ? "them" : "[PRIMARY BENEFICIARY]"}.
      {"\n\n"}
      
      (b) FIRST CONTINGENT: If {r.residuaryBeneficiary || "[PRIMARY BENEFICIARY]"}{" "}
      does not survive me by {survivalPeriod} days, I give my Residuary Estate to{" "}
      {r.residuaryContingent === "descendants_per_stirpes" 
        ? "my descendants then living, per stirpes"
        : r.residuaryContingent === "specific_person"
        ? `${r.contingentBeneficiary || "[CONTINGENT BENEFICIARY]"}, if they survive me by ${survivalPeriod} days`
        : r.contingentBeneficiary || "[CONTINGENT BENEFICIARY]"
      }.
      {"\n\n"}
      
      (c) FINAL CONTINGENT: If none of the beneficiaries named in paragraphs (a) 
      and (b) above survive me by {survivalPeriod} days, I give my Residuary 
      Estate to {r.ultimateContingent || "[FINAL CONTINGENT BENEFICIARY OR CHARITY]"}.
      {"\n\n"}
      
      (d) DEFAULT: If none of the beneficiaries or organizations named above 
      survive me or are in existence at the time of my death, my Residuary 
      Estate shall be distributed to my heirs at law as determined under the 
      laws of the State of {stateName} in effect at the time of my death.
    </Text>
  </View>
</View>
```

**Acceptance Criteria:**
- [ ] Four levels of contingency (primary, first contingent, final contingent, default)
- [ ] Survival period referenced consistently
- [ ] Per stirpes option available
- [ ] Default to heirs at law as fallback

---

### Task 3.8: Add Residuary Contingency Wizard Fields [HIGH]

**File:** `src/app/(auth)/(dashboard)/legacy/components/legal-document-wizard.tsx`

**Location:** Beneficiary section of will wizard

**Implementation:**

```typescript
{
  id: "residuaryContingent",
  label: "If primary beneficiary doesn't survive you",
  type: "select",
  required: true,
  options: [
    { value: "descendants_per_stirpes", label: "Their descendants (per stirpes)" },
    { value: "specific_person", label: "A specific person" },
    { value: "charity", label: "A charity or organization" },
  ],
  helpText: "Per stirpes means the deceased person's share passes to their children",
  documentTypes: ['will'],
},
{
  id: "contingentBeneficiary",
  label: "First contingent beneficiary name",
  type: "text",
  required: false,
  conditional: { 
    field: "residuaryContingent", 
    values: ["specific_person", "charity"] 
  },
  placeholder: "Full legal name or organization name",
  documentTypes: ['will'],
},
{
  id: "ultimateContingent",
  label: "Final contingent beneficiary",
  type: "text",
  required: true,
  placeholder: "e.g., American Red Cross or John Smith",
  helpText: "Who receives your estate if ALL other beneficiaries predecease you? Often a charity.",
  documentTypes: ['will'],
}
```

**Acceptance Criteria:**
- [ ] Multiple contingency levels available in wizard
- [ ] Per stirpes option explained in help text
- [ ] Ultimate contingent field required

---

### Task 3.9: Add Severability Article [HIGH]

**File:** `src/app/(auth)/(dashboard)/legacy/components/legal-document-pdf.tsx`

**Location:** `WillDocument` function, after definitions section

**Implementation:**

```tsx
{/* Article: Severability */}
<View style={styles.section}>
  <Text style={styles.sectionTitle}>Article {getArticleNum()} - Severability</Text>
  <Text style={styles.legalClause}>
    If any provision of this Will is held to be invalid, illegal, or 
    unenforceable by a court of competent jurisdiction, the validity, legality, 
    and enforceability of the remaining provisions shall not be affected or 
    impaired thereby, and shall continue in full force and effect.
  </Text>
</View>
```

**Acceptance Criteria:**
- [ ] Severability article appears in all generated wills
- [ ] No wizard field needed (always included)

---

### Task 3.10: Enhance Witness Attestation Clause [CRITICAL]

**File:** `src/app/(auth)/(dashboard)/legacy/components/legal-document-pdf.tsx`

**Location:** `WitnessAttestation` function (around line 272-338)

**Current Issue:** Missing mutual presence statement; missing page count reference.

**Implementation:**

Update the `WitnessAttestation` function:

```tsx
function WitnessAttestation({
  count,
  state,
  documentType,
  testatorName,
  pageCount,
}: {
  count: number;
  state: string;
  documentType: string;
  testatorName: string;
  pageCount?: number;
}) {
  const witnesses = Array.from({ length: count }, (_, i) => i + 1);
  const requirements = getStateLegalRequirements(state as USState);
  const minAge = requirements?.will?.minimumWitnessAge || 18;
  const witnessRestrictions = requirements?.will?.witnessRestrictions;

  // Determine beneficiary witness statement based on state
  const getBeneficiaryStatement = () => {
    if (!witnessRestrictions?.beneficiaryCanWitness) {
      return "Neither of us is named as a beneficiary in this document.";
    }
    if (witnessRestrictions.beneficiaryWitnessConsequence === 'void_bequest') {
      return "We understand that if we are named as beneficiaries, our bequests may be void or reduced under applicable law.";
    }
    return "";
  };

  return (
    <View style={styles.witnessSection}>
      <Text style={styles.witnessTitle}>Attestation of Witnesses</Text>
      <Text style={[styles.legalClause, { marginBottom: 12 }]}>
        On the date written below, {testatorName || "[TESTATOR NAME]"}, known to 
        us or proved to us on the basis of satisfactory evidence to be the person 
        whose name is signed on the foregoing instrument, declared to us that the 
        foregoing instrument{pageCount ? `, consisting of ${pageCount} pages including this page,` : ""}{" "}
        was {documentType === "will" ? "their Last Will and Testament" : `their ${documentType}`}, 
        and requested us to act as witnesses to the same.
        {"\n\n"}
        {testatorName || "[TESTATOR NAME]"} signed this {documentType} in our 
        presence, all of us being present at the same time. We observed the 
        signing of this {documentType} by {testatorName || "[TESTATOR NAME]"} 
        and by each other. We believe {testatorName || "[TESTATOR NAME]"} to be 
        of sound mind and memory, over the age of majority, and under no 
        constraint or undue influence.
        {"\n\n"}
        Each of us is now over {minAge} years of age, is a competent witness, 
        and resides at the address set forth below. {getBeneficiaryStatement()}
        {"\n\n"}
        We declare under penalty of perjury under the laws of the State of{" "}
        {STATE_NAMES[state as USState] || state} that the foregoing is true and 
        correct.
      </Text>

      <Text style={[styles.legalClause, { marginBottom: 8 }]}>
        Executed on this _____ day of _______________, 20___, at{" "}
        _______________, {STATE_NAMES[state as USState] || state}.
      </Text>

      {witnesses.map((num) => (
        <View key={num} style={styles.witnessBlock}>
          <Text style={styles.fieldLabel}>Witness {num}:</Text>
          <View style={styles.signatureRow}>
            <View style={styles.signatureColumn}>
              <View style={styles.signatureLine} />
              <Text style={styles.signatureLabel}>Signature</Text>
            </View>
            <View style={styles.signatureColumn}>
              <View style={styles.signatureLine} />
              <Text style={styles.signatureLabel}>Date</Text>
            </View>
          </View>
          <View style={styles.signatureRow}>
            <View style={styles.signatureColumn}>
              <View style={styles.signatureLine} />
              <Text style={styles.signatureLabel}>Printed Name</Text>
            </View>
            <View style={styles.signatureColumn}>
              <View style={styles.signatureLine} />
              <Text style={styles.signatureLabel}>Address</Text>
            </View>
          </View>
          <View style={styles.signatureRow}>
            <View style={{ width: "100%" }}>
              <View style={styles.signatureLine} />
              <Text style={styles.signatureLabel}>City, State, ZIP</Text>
            </View>
          </View>
        </View>
      ))}
    </View>
  );
}
```

**Acceptance Criteria:**
- [ ] Page count reference added (optional parameter)
- [ ] Beneficiary witness statement varies by state
- [ ] "Present at the same time" and "observed signing by each other" language included
- [ ] Date and location of execution line added

---

### Task 3.11: Enhance Self-Proving Affidavit [CRITICAL]

**File:** `src/app/(auth)/(dashboard)/legacy/components/legal-document-pdf.tsx`

**Location:** `SelfProvingAffidavit` function (around line 381-450)

**Current Issue:** Too brief; lacks separate sections for testator vs witnesses.

**Implementation:**

Update the `SelfProvingAffidavit` function:

```tsx
function SelfProvingAffidavit({
  state,
  documentType,
  principalName,
  witnessCount = 2,
}: {
  state: string;
  documentType: string;
  principalName: string;
  witnessCount?: number;
}) {
  const witnesses = Array.from({ length: witnessCount }, (_, i) => i + 1);
  const requirements = getStateLegalRequirements(state as USState);
  const minAge = requirements?.will?.minimumWitnessAge || 18;

  return (
    <View style={styles.selfProvingSection} break>
      <Text style={styles.selfProvingTitle}>Self-Proving Affidavit</Text>
      
      <Text style={styles.selfProvingText}>
        STATE OF {(STATE_NAMES[state as USState] || state).toUpperCase()}
        {"\n"}COUNTY OF _______________________
      </Text>
      
      <Text style={[styles.selfProvingText, { marginTop: 12 }]}>
        We, {principalName || "[TESTATOR/PRINCIPAL NAME]"}, the Testator, and 
        the undersigned witnesses, whose names are signed to the foregoing 
        instrument, being first duly sworn, do hereby declare to the undersigned 
        officer that:
      </Text>

      <View style={styles.subSection}>
        <Text style={styles.selfProvingText}>
          1. The Testator declared to the witnesses that the foregoing instrument 
          is the Testator's {documentType === "will" ? "Last Will and Testament" : documentType};
          {"\n\n"}
          2. The Testator signed the {documentType === "will" ? "Will" : "instrument"} as 
          a free and voluntary act for the purposes therein expressed;
          {"\n\n"}
          3. Each of the witnesses, at the request of the Testator, in the 
          presence and hearing of the Testator, and in the presence of each 
          other, signed the {documentType === "will" ? "Will" : "instrument"} as witnesses;
          {"\n\n"}
          4. At the time of the execution of the {documentType === "will" ? "Will" : "instrument"}, 
          to the best knowledge of each witness:
          {"\n"}   (a) The Testator was at least {minAge} years of age;
          {"\n"}   (b) The Testator was of sound mind and memory;
          {"\n"}   (c) The Testator was under no constraint or undue influence.
        </Text>
      </View>

      <View style={{ marginTop: 20 }}>
        <Text style={styles.fieldLabel}>TESTATOR:</Text>
        <View style={styles.signatureRow}>
          <View style={styles.signatureColumn}>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureLabel}>
              {principalName || "[TESTATOR NAME]"}, Testator
            </Text>
          </View>
          <View style={styles.signatureColumn}>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureLabel}>Date</Text>
          </View>
        </View>
      </View>

      <View style={{ marginTop: 15 }}>
        <Text style={styles.fieldLabel}>WITNESSES:</Text>
        {witnesses.map((num) => (
          <View key={num} style={styles.signatureRow}>
            <View style={styles.signatureColumn}>
              <View style={styles.signatureLine} />
              <Text style={styles.signatureLabel}>Witness {num} Signature</Text>
            </View>
            <View style={styles.signatureColumn}>
              <View style={styles.signatureLine} />
              <Text style={styles.signatureLabel}>Printed Name</Text>
            </View>
          </View>
        ))}
      </View>

      <View style={{ marginTop: 20 }}>
        <Text style={styles.selfProvingText}>
          Subscribed, sworn to and acknowledged before me by{" "}
          {principalName || "[TESTATOR NAME]"}, the Testator, and subscribed and 
          sworn to before me by the above-named witnesses, this _____ day of 
          _______________, 20___.
        </Text>
        
        <View style={[styles.signatureRow, { marginTop: 15 }]}>
          <View style={styles.signatureColumn}>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureLabel}>Notary Public Signature</Text>
          </View>
          <View style={styles.signatureColumn}>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureLabel}>My Commission Expires</Text>
          </View>
        </View>
        
        <View style={styles.signatureRow}>
          <View style={styles.signatureColumn}>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureLabel}>Notary Printed Name</Text>
          </View>
          <View style={styles.signatureColumn}>
            <Text style={[styles.signatureLabel, { textAlign: "center", marginTop: 10 }]}>
              [NOTARY SEAL]
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}
```

**Acceptance Criteria:**
- [ ] Separate signature sections for testator and witnesses
- [ ] All four declarations present
- [ ] Notary acknowledgment section complete
- [ ] State-specific minimum age referenced

---

## Epic 4: Trust Template Enhancements

### Task 4.1: Add Incapacity Determination Article [CRITICAL]

**File:** `src/app/(auth)/(dashboard)/legacy/components/legal-document-pdf.tsx`

**Location:** `TrustDocument` function, after lifetime provisions section

**Implementation:**

Add or enhance incapacity provisions:

```tsx
{/* Article: Provisions During Grantor's Incapacity */}
<View style={styles.section}>
  <Text style={styles.sectionTitle}>Article III: Provisions During Incapacity</Text>
  
  <View style={styles.subSection}>
    <Text style={styles.subSectionLabel}>Section 3.1 Determination of Incapacity</Text>
    <Text style={styles.legalClause}>
      The Grantor shall be considered incapacitated when:
      {"\n\n"}
      {r.incapacityDetermination === "two_physicians" && (
        "(a) Two licensed physicians have examined the Grantor and signed written " +
        "statements certifying that in their medical opinion the Grantor is unable " +
        "to manage financial affairs due to mental or physical incapacity; or"
      )}
      {r.incapacityDetermination === "one_physician" && (
        "(a) One licensed physician has examined the Grantor and signed a written " +
        "statement certifying that in their medical opinion the Grantor is unable " +
        "to manage financial affairs due to mental or physical incapacity; or"
      )}
      {r.incapacityDetermination === "court_only" && (
        "(a) A court of competent jurisdiction has declared the Grantor incompetent " +
        "or incapacitated."
      )}
      {r.incapacityDetermination !== "court_only" && (
        "\n\n(b) A court of competent jurisdiction has declared the Grantor " +
        "incompetent or incapacitated."
      )}
    </Text>
  </View>

  <View style={styles.subSection}>
    <Text style={styles.subSectionLabel}>Section 3.2 Management During Incapacity</Text>
    <Text style={styles.legalClause}>
      During any period of the Grantor's incapacity:
      {"\n\n"}
      (a) The Trustee shall manage the Trust estate for the benefit of the Grantor;
      {"\n\n"}
      (b) The Trustee shall pay to or for the benefit of the Grantor all net 
      income of the Trust;
      {"\n\n"}
      (c) The Trustee shall pay principal as needed for the Grantor's health, 
      education, maintenance, and support, considering the Grantor's accustomed 
      standard of living;
      {"\n\n"}
      (d) The Trustee may make payments for the benefit of persons legally 
      dependent on the Grantor.
    </Text>
  </View>

  <View style={styles.subSection}>
    <Text style={styles.subSectionLabel}>Section 3.3 Restoration of Capacity</Text>
    <Text style={styles.legalClause}>
      If the Grantor regains capacity as certified by 
      {r.incapacityDetermination === "two_physicians" 
        ? " one licensed physician" 
        : " a licensed physician"
      }, all provisions regarding incapacity shall cease and the Grantor's 
      reserved powers shall be fully restored.
    </Text>
  </View>
</View>
```

**Acceptance Criteria:**
- [ ] Incapacity determination method reflects wizard selection
- [ ] Management during incapacity provisions included
- [ ] Restoration of capacity provision included
- [ ] Standard of living reference included

---

### Task 4.2: Add Incapacity Wizard Fields [HIGH]

**File:** `src/app/(auth)/(dashboard)/legacy/components/legal-document-wizard.tsx`

**Location:** Trust wizard, after trustee section

**Implementation:**

```typescript
{
  id: "incapacityDetermination",
  label: "How should your incapacity be determined?",
  type: "select",
  required: true,
  options: [
    { 
      value: "two_physicians", 
      label: "Two physicians must certify in writing (recommended)" 
    },
    { 
      value: "one_physician", 
      label: "One physician certification" 
    },
    { 
      value: "court_only", 
      label: "Only by court determination" 
    },
  ],
  helpText: "Two physicians provides protection against premature transfer of control while avoiding court involvement",
  documentTypes: ['trust'],
}
```

**Acceptance Criteria:**
- [ ] Field appears in trust wizard
- [ ] Default to two_physicians
- [ ] Help text explains implications

---

### Task 4.3: Enhance Spendthrift Clause [HIGH]

**File:** `src/app/(auth)/(dashboard)/legacy/components/legal-document-pdf.tsx`

**Location:** `TrustDocument` function

**Implementation:**

Add full spendthrift provision:

```tsx
{/* Article: Spendthrift Provisions */}
{r.includeSpendthriftClause && (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>Article VI: Spendthrift Provisions</Text>
    <Text style={styles.legalClause}>
      Section 6.1 Spendthrift Protection
      {"\n\n"}
      No beneficiary shall have any right to anticipate, alienate, encumber, 
      pledge, hypothecate, or assign any interest in the principal or income 
      of this Trust, and no interest of any beneficiary shall be subject to 
      the claims of the beneficiary's creditors, spouse, former spouse, or 
      others, or be subject to attachment, garnishment, execution, or other 
      legal process.
      {"\n\n"}
      Section 6.2 Discretionary Distributions
      {"\n\n"}
      Notwithstanding the above, the Trustee in the Trustee's sole discretion 
      may make distributions directly to creditors, service providers, or 
      others for the benefit of any beneficiary, and may refuse to make 
      distributions directly to any beneficiary if the Trustee believes such 
      distributions would be subject to the claims of creditors or others.
    </Text>
  </View>
)}
```

**Acceptance Criteria:**
- [ ] Spendthrift clause conditionally included
- [ ] Both protection and discretionary distribution sections present
- [ ] Language covers creditors, spouses, and legal process

---

### Task 4.4: Add Amendment and Revocation Article [CRITICAL]

**File:** `src/app/(auth)/(dashboard)/legacy/components/legal-document-pdf.tsx`

**Location:** `TrustDocument` function, before signature section

**Implementation:**

```tsx
{/* Article: Amendment and Revocation */}
<View style={styles.section}>
  <Text style={styles.sectionTitle}>Article VIII: Amendment and Revocation</Text>
  
  <View style={styles.subSection}>
    <Text style={styles.subSectionLabel}>Section 8.1 Right to Amend or Revoke</Text>
    <Text style={styles.legalClause}>
      The Grantor reserves the right to amend or revoke this Trust at any time 
      during the Grantor's lifetime, provided the Grantor has legal capacity. 
      Any amendment must be:
      {"\n\n"}
      (a) In writing;
      {"\n"}(b) Signed by the Grantor;
      {"\n"}(c) Delivered to the Trustee;
      {"\n"}(d) Dated.
      {"\n\n"}
      No amendment shall be valid that is executed during a period of the 
      Grantor's incapacity as determined under Article III.
    </Text>
  </View>

  <View style={styles.subSection}>
    <Text style={styles.subSectionLabel}>Section 8.2 Irrevocability Upon Death</Text>
    <Text style={styles.legalClause}>
      This Trust shall become irrevocable upon the Grantor's death. Upon the 
      Grantor's death, no person shall have any power to alter, amend, revoke, 
      or terminate this Trust, except as expressly provided herein.
    </Text>
  </View>

  <View style={styles.subSection}>
    <Text style={styles.subSectionLabel}>Section 8.3 Revocation</Text>
    <Text style={styles.legalClause}>
      The Grantor may revoke this Trust in whole or in part by a written 
      instrument signed by the Grantor and delivered to the Trustee. Upon 
      complete revocation, the Trustee shall transfer all Trust property to 
      the Grantor or as the Grantor directs.
    </Text>
  </View>
</View>
```

**Acceptance Criteria:**
- [ ] Amendment requirements clearly specified
- [ ] Irrevocability upon death stated
- [ ] Revocation procedure included
- [ ] Incapacity during amendment addressed

---

### Task 4.5: Add Trustee Powers Article [CRITICAL]

**File:** `src/app/(auth)/(dashboard)/legacy/components/legal-document-pdf.tsx`

**Location:** `TrustDocument` function, trustee section

**Implementation:**

```tsx
{/* Section: Trustee Powers */}
<View style={styles.subSection}>
  <Text style={styles.subSectionLabel}>Section 5.2 Trustee Powers</Text>
  <Text style={styles.legalClause}>
    The Trustee shall have all powers conferred by law and the following 
    specific powers, to be exercised without court approval:
    {"\n\n"}
    (a) To retain any property received, without liability for loss or 
    depreciation;
    {"\n\n"}
    (b) To sell, exchange, lease, or dispose of any property at public or 
    private sale;
    {"\n\n"}
    (c) To invest and reinvest in any property the Trustee deems advisable, 
    without regard to diversification requirements;
    {"\n\n"}
    (d) To borrow money and encumber Trust property;
    {"\n\n"}
    (e) To compromise or settle claims;
    {"\n\n"}
    (f) To employ professionals and pay reasonable compensation;
    {"\n\n"}
    (g) To make distributions in cash or in kind;
    {"\n\n"}
    (h) To deal with any business interest;
    {"\n\n"}
    (i) To exercise all rights regarding digital assets;
    {"\n\n"}
    (j) To make any tax elections;
    {"\n\n"}
    (k) To do all other acts necessary for Trust administration.
  </Text>
</View>
```

**Acceptance Criteria:**
- [ ] All standard trustee powers enumerated
- [ ] Digital assets power included
- [ ] Tax election power included

---

## Epic 5: Pour-Over Will Enhancements

### Task 5.1: Add Trust Reference Validation [CRITICAL]

**File:** `src/app/(auth)/(dashboard)/legacy/components/legal-document-wizard.tsx`

**Location:** Pour-over will wizard initialization

**Implementation:**

Add validation that checks for existing trust:

```typescript
// In wizard configuration for pour_over_will
const validatePourOverWillPrerequisites = async (
  householdId: Id<"households">,
  documents: LegalDocument[]
): Promise<ValidationResult> => {
  const existingTrust = documents.find(
    doc => doc.documentType === 'trust' && 
           (doc.status === 'complete' || doc.status === 'generated')
  );
  
  if (!existingTrust) {
    return {
      valid: false,
      blocking: true,
      message: "A pour-over will requires an existing revocable living trust. Please create and complete your trust document first.",
    };
  }
  
  // Pre-populate trust name and date from existing trust
  const trustResponses = JSON.parse(existingTrust.responses || '{}');
  return {
    valid: true,
    prefillData: {
      trustName: trustResponses.trustName || existingTrust.title,
      trustDate: trustResponses.trustDate || existingTrust.createdAt,
    },
  };
};
```

**Acceptance Criteria:**
- [ ] Pour-over will creation blocked if no trust exists
- [ ] User-friendly error message displayed
- [ ] Trust name and date auto-populated from existing trust

---

### Task 5.2: Enhance Pour-Over Provision Language [CRITICAL]

**File:** `src/app/(auth)/(dashboard)/legacy/components/legal-document-pdf.tsx`

**Location:** `PourOverWillDocument` function, Article II (around line 1963-1979)

**Current Code:** Pour-over provision exists but verify completeness.

**Enhancement:**

Ensure the following language is present:

```tsx
{/* Article II: Pour-Over Provision */}
<View style={styles.section}>
  <Text style={styles.sectionTitle}>Article II: Pour-Over Provision</Text>
  <Text style={styles.legalClause}>
    I give, devise, and bequeath all the rest, residue, and remainder of my 
    estate, both real and personal, of whatever kind and wherever situated, 
    which I may own or have the right to dispose of at the time of my death 
    (including all failed or lapsed gifts, and including any property over 
    which I have a power of appointment), to the then-acting Trustee or 
    Trustees of the {r.trustName || "[TRUST NAME]"} dated{" "}
    {r.trustDate || "[DATE OF TRUST]"} (the "Trust"), to be added to the trust 
    estate and held, administered, and distributed in accordance with the 
    provisions of the Trust AS IT EXISTS AT MY DEATH (including any amendments 
    made prior to my death), and NOT as it exists at the date of this Will.
    {"\n\n"}
    If for any reason this pour-over disposition fails or is invalid, I give 
    such property to the persons who would have received it under the Trust as 
    if the pour-over had been valid, and in the same shares and subject to the 
    same conditions as provided in the Trust.
  </Text>
</View>
```

**Acceptance Criteria:**
- [ ] "AS IT EXISTS AT MY DEATH" emphasized (allows trust amendments without will update)
- [ ] Backup provision if pour-over fails included
- [ ] Failed/lapsed gifts language included
- [ ] Power of appointment language included

---

## Epic 6: Financial POA Enhancements

### Task 6.1: Add Enumerated Powers Section [CRITICAL]

**File:** `src/app/(auth)/(dashboard)/legacy/components/legal-document-pdf.tsx`

**Location:** `FinancialPOADocument` function, after grant of authority section

**Current Issue:** Powers may be listed as checkboxes without full legal language.

**Implementation:**

Create enumerated powers with full legal text:

```tsx
{/* Article II: Grant of Specific Powers */}
<View style={styles.section}>
  <Text style={styles.sectionTitle}>Article II: Grant of Specific Powers</Text>
  <Text style={styles.legalClause}>
    I grant my Agent the following specific powers, subject to any limitations 
    stated herein:
  </Text>

  {(r.powers?.includes("banking") || r.allPowers) && (
    <View style={styles.subSection}>
      <Text style={styles.subSectionLabel}>(a) BANKING AND FINANCIAL TRANSACTIONS</Text>
      <Text style={styles.articleContent}>
        To open, close, and manage bank accounts of all types; to make deposits 
        and withdrawals; to sign checks, drafts, and other negotiable instruments; 
        to access safe deposit boxes; to wire funds electronically; and to conduct 
        all banking transactions in my name.
      </Text>
    </View>
  )}

  {(r.powers?.includes("real_property") || r.allPowers) && (
    <View style={styles.subSection}>
      <Text style={styles.subSectionLabel}>(b) REAL PROPERTY</Text>
      <Text style={styles.articleContent}>
        To buy, sell, lease, manage, improve, repair, mortgage, or otherwise deal 
        with real estate of any kind, including my principal residence; to execute 
        deeds, contracts, leases, and mortgages; to collect rents and evict tenants; 
        to pay property taxes and insurance; and to take any other action necessary 
        to manage my real property interests.
      </Text>
    </View>
  )}

  {(r.powers?.includes("investments") || r.allPowers) && (
    <View style={styles.subSection}>
      <Text style={styles.subSectionLabel}>(c) INVESTMENTS</Text>
      <Text style={styles.articleContent}>
        To buy, sell, exchange, and manage stocks, bonds, mutual funds, and other 
        securities; to open and manage brokerage and investment accounts; to exercise 
        stock options and voting rights; to receive dividends and interest; and to 
        make investment decisions in my best interest.
      </Text>
    </View>
  )}

  {(r.powers?.includes("retirement") || r.allPowers) && (
    <View style={styles.subSection}>
      <Text style={styles.subSectionLabel}>(d) RETIREMENT ACCOUNTS</Text>
      <Text style={styles.articleContent}>
        To manage IRAs, 401(k)s, pension plans, and other retirement accounts; to 
        make contributions and withdrawals as permitted by law and plan documents; 
        to roll over or transfer accounts; to change beneficiary designations to 
        the extent permitted by applicable law; and to make elections regarding 
        distributions.
      </Text>
    </View>
  )}

  {(r.powers?.includes("taxes") || r.allPowers) && (
    <View style={styles.subSection}>
      <Text style={styles.subSectionLabel}>(e) TAXES</Text>
      <Text style={styles.articleContent}>
        To prepare, sign, and file federal, state, and local tax returns of all 
        types; to represent me before tax authorities including the IRS; to pay 
        taxes, penalties, and interest; to receive refunds; to make tax elections; 
        to sign tax documents; and to retain tax professionals.
      </Text>
    </View>
  )}

  {(r.powers?.includes("insurance") || r.allPowers) && (
    <View style={styles.subSection}>
      <Text style={styles.subSectionLabel}>(f) INSURANCE</Text>
      <Text style={styles.articleContent}>
        To purchase, maintain, modify, cancel, or surrender insurance policies of 
        all types including life, health, disability, property, and liability 
        insurance; to change beneficiary designations; to file claims and receive 
        proceeds; and to exercise any policy options.
      </Text>
    </View>
  )}

  {(r.powers?.includes("benefits") || r.allPowers) && (
    <View style={styles.subSection}>
      <Text style={styles.subSectionLabel}>(g) GOVERNMENT BENEFITS</Text>
      <Text style={styles.articleContent}>
        To apply for and manage Social Security benefits, Medicare, Medicaid, 
        veterans benefits, and other government programs; to complete applications 
        and appeals; and to receive and manage benefit payments.
      </Text>
    </View>
  )}

  {(r.powers?.includes("digital") || r.allPowers) && (
    <View style={styles.subSection}>
      <Text style={styles.subSectionLabel}>(h) DIGITAL ASSETS</Text>
      <Text style={styles.articleContent}>
        Pursuant to applicable state law including {stateName}'s 
        {requirements?.financial_poa?.rufadaaAdopted 
          ? " adoption of the Revised Uniform Fiduciary Access to Digital Assets Act," 
          : ""
        } to access, manage, and control my digital assets and electronic 
        communications, including email accounts, social media accounts, online 
        financial accounts, cryptocurrency, digital files, and any other digital 
        property; to access devices and accounts using my passwords and credentials.
      </Text>
    </View>
  )}

  {r.powers?.includes("gifts") && (
    <View style={styles.subSection}>
      <Text style={styles.subSectionLabel}>(i) GIFTS [SPECIAL AUTHORITY]</Text>
      <Text style={styles.articleContent}>
        To make gifts of my property to such persons and in such amounts as my 
        Agent deems appropriate, provided that such gifts: (i) are consistent with 
        my established pattern of giving, OR (ii) do not exceed the federal annual 
        gift tax exclusion amount per recipient per year. This authority is granted 
        to enable estate planning and tax planning and does not authorize gifts to 
        my Agent unless such gifts are consistent with my established pattern.
      </Text>
    </View>
  )}
</View>
```

**Acceptance Criteria:**
- [ ] Each power category has full legal language
- [ ] Powers conditional on wizard selections
- [ ] RUFADAA reference conditional on state adoption
- [ ] Gifts power marked as special authority
- [ ] All 10 power categories available

---

### Task 6.2: Add Financial POA Powers Wizard [HIGH]

**File:** `src/app/(auth)/(dashboard)/legacy/components/legal-document-wizard.tsx`

**Location:** Financial POA wizard, powers section

**Implementation:**

```typescript
{
  id: "powerSelection",
  label: "How would you like to grant powers?",
  type: "radio",
  required: true,
  options: [
    { value: "all", label: "Grant all standard powers (recommended)" },
    { value: "select", label: "Select specific powers" },
  ],
  helpText: "Granting all powers gives your agent maximum flexibility to handle your affairs",
  documentTypes: ['financial_poa'],
},
{
  id: "powers",
  label: "Select the powers to grant",
  type: "multiselect",
  required: true,
  conditional: { field: "powerSelection", value: "select" },
  options: [
    { value: "banking", label: "Banking and Financial Transactions" },
    { value: "real_property", label: "Real Property (buy, sell, mortgage)" },
    { value: "investments", label: "Investments and Securities" },
    { value: "retirement", label: "Retirement Accounts" },
    { value: "taxes", label: "Tax Matters" },
    { value: "insurance", label: "Insurance" },
    { value: "benefits", label: "Government Benefits" },
    { value: "business", label: "Business Operations" },
    { value: "legal", label: "Legal Matters" },
    { value: "digital", label: "Digital Assets" },
  ],
  documentTypes: ['financial_poa'],
},
{
  id: "giftingAuthority",
  label: "Grant gifting authority",
  type: "checkbox",
  required: false,
  defaultValue: false,
  helpText: "⚠️ Caution: This allows your agent to give away your property. Consider carefully.",
  warningText: "Gifting authority can have significant tax implications and potential for abuse.",
  documentTypes: ['financial_poa'],
},
{
  id: "estatePlanningAuthority",
  label: "Grant estate planning authority",
  type: "checkbox",
  required: false,
  defaultValue: false,
  helpText: "⚠️ Caution: This allows your agent to create/modify trusts and change beneficiaries.",
  warningText: "This grants significant power to modify your estate plan.",
  documentTypes: ['financial_poa'],
}
```

**Acceptance Criteria:**
- [ ] All/select option available
- [ ] Multiselect for individual powers
- [ ] Special warnings for gifting and estate planning
- [ ] Default to "all" recommended

---

### Task 6.3: Add Durability Clause [CRITICAL]

**File:** `src/app/(auth)/(dashboard)/legacy/components/legal-document-pdf.tsx`

**Location:** `FinancialPOADocument` function, after powers section

**Implementation:**

```tsx
{/* Article III: Durability Provision */}
<View style={styles.section}>
  <Text style={styles.sectionTitle}>Article III: Durability Provision</Text>
  <Text style={styles.legalClause}>
    THIS IS A DURABLE POWER OF ATTORNEY. THIS POWER OF ATTORNEY SHALL NOT BE 
    AFFECTED BY MY SUBSEQUENT DISABILITY OR INCAPACITY.
    {"\n\n"}
    This Power of Attorney shall remain in full force and effect unless and 
    until revoked by me in writing, or until my death.
  </Text>
</View>

{/* Article IV: Effective Date */}
<View style={styles.section}>
  <Text style={styles.sectionTitle}>Article IV: Effective Date</Text>
  <Text style={styles.legalClause}>
    {r.effectiveDate === "immediate" ? (
      "This Power of Attorney is effective IMMEDIATELY upon execution and " +
      "shall remain effective unless revoked."
    ) : (
      <>
        This Power of Attorney shall become effective only upon a determination 
        that I am incapacitated. Incapacity shall be determined as follows:
        {"\n\n"}
        {r.springIncapacityMethod === "two_physicians" && (
          "Two licensed physicians must examine me and certify in writing that " +
          "I am unable to manage my property and financial affairs due to mental " +
          "or physical incapacity."
        )}
        {r.springIncapacityMethod === "one_physician" && (
          "One licensed physician must examine me and certify in writing that " +
          "I am unable to manage my property and financial affairs due to mental " +
          "or physical incapacity."
        )}
        {r.springIncapacityMethod === "court" && (
          "A court of competent jurisdiction must declare me incapacitated or " +
          "incompetent."
        )}
      </>
    )}
  </Text>
</View>
```

**Acceptance Criteria:**
- [ ] DURABILITY language in ALL CAPS for emphasis
- [ ] Immediate vs. springing option supported
- [ ] Incapacity determination method reflected for springing POA

---

### Task 6.4: Add Effective Date Wizard Fields [HIGH]

**File:** `src/app/(auth)/(dashboard)/legacy/components/legal-document-wizard.tsx`

**Implementation:**

```typescript
{
  id: "effectiveDate",
  label: "When should this POA become effective?",
  type: "radio",
  required: true,
  options: [
    { 
      value: "immediate", 
      label: "Immediately upon signing (recommended)" 
    },
    { 
      value: "springing", 
      label: "Only upon my incapacity (springing POA)" 
    },
  ],
  helpText: "Immediate is more practical; springing requires proving incapacity before your agent can act, which can cause delays",
  documentTypes: ['financial_poa'],
},
{
  id: "springIncapacityMethod",
  label: "How should incapacity be determined?",
  type: "select",
  required: true,
  conditional: { field: "effectiveDate", value: "springing" },
  options: [
    { value: "two_physicians", label: "Two physicians certify in writing" },
    { value: "one_physician", label: "One physician certifies in writing" },
    { value: "court", label: "Court determination" },
  ],
  helpText: "Two physicians provides more protection but may cause delays",
  documentTypes: ['financial_poa'],
}
```

**Acceptance Criteria:**
- [ ] Immediate vs. springing selection
- [ ] Incapacity method conditional on springing selection

---

### Task 6.5: Add Third-Party Reliance Provision [HIGH]

**File:** `src/app/(auth)/(dashboard)/legacy/components/legal-document-pdf.tsx`

**Location:** `FinancialPOADocument` function

**Implementation:**

```tsx
{/* Article: Third-Party Reliance */}
<View style={styles.section}>
  <Text style={styles.sectionTitle}>Article VI: Third-Party Reliance</Text>
  <Text style={styles.legalClause}>
    Any third party who receives a copy of this Power of Attorney may rely upon 
    it and upon the representations of my Agent as to matters relating to the 
    agency. Third parties are protected in relying upon this document until they 
    have received actual written notice of its termination, revocation, or 
    expiration.
    {"\n\n"}
    A third party that refuses to honor this Power of Attorney may be liable for 
    damages, including attorney's fees, caused by such refusal, as provided by 
    applicable law.
    {"\n\n"}
    A copy or facsimile of this Power of Attorney shall have the same force and 
    effect as the original.
  </Text>
</View>
```

**Acceptance Criteria:**
- [ ] Third-party protection language included
- [ ] Liability for refusal mentioned
- [ ] Copy/facsimile validity stated

---

### Task 6.6: Add Agent Acceptance Form [MEDIUM]

**File:** `src/app/(auth)/(dashboard)/legacy/components/legal-document-pdf.tsx`

**Location:** `FinancialPOADocument` function, after signature section

**Implementation:**

```tsx
{/* Agent Acceptance (Optional) */}
{r.includeAgentAcceptance && (
  <View style={[styles.section, { marginTop: 30 }]} break>
    <Text style={styles.sectionTitle}>Agent Acceptance (Optional but Recommended)</Text>
    <Text style={styles.legalClause}>
      I, {r.agentName || "[AGENT NAME]"}, have read the foregoing Durable Power 
      of Attorney and accept appointment as Agent. I acknowledge that:
      {"\n\n"}
      1. I am a fiduciary and must act in the Principal's best interest;
      {"\n"}
      2. I must act in good faith and only within the scope of authority granted;
      {"\n"}
      3. I must keep the Principal's property separate from my own unless 
      otherwise provided;
      {"\n"}
      4. I must keep records of all transactions;
      {"\n"}
      5. I may be liable for any losses caused by breach of my fiduciary duties.
      {"\n\n"}
      I agree to act in accordance with the Principal's reasonable expectations 
      to the extent actually known by me, otherwise in the Principal's best 
      interest.
    </Text>

    <View style={[styles.signatureBlock, { marginTop: 20 }]}>
      <View style={styles.signatureRow}>
        <View style={styles.signatureColumn}>
          <View style={styles.signatureLine} />
          <Text style={styles.signatureLabel}>Agent Signature</Text>
        </View>
        <View style={styles.signatureColumn}>
          <View style={styles.signatureLine} />
          <Text style={styles.signatureLabel}>Date</Text>
        </View>
      </View>
      <View style={styles.signatureLine} />
      <Text style={styles.signatureLabel}>Printed Name</Text>
    </View>
  </View>
)}
```

**Acceptance Criteria:**
- [ ] Agent acceptance form conditionally included
- [ ] Five fiduciary acknowledgments listed
- [ ] Signature block included

---

## Epic 7: Healthcare POA Enhancements

### Task 7.1: Enhance HIPAA Authorization [CRITICAL]

**File:** `src/app/(auth)/(dashboard)/legacy/components/legal-document-pdf.tsx`

**Location:** `HealthcarePOADocument` function, HIPAA section (around line 985-1022)

**Current Issue:** May be missing required regulatory elements.

**Implementation:**

Replace HIPAA section with comprehensive authorization:

```tsx
{/* Part III: HIPAA Authorization */}
<View style={styles.section}>
  <Text style={styles.sectionTitle}>Part III: HIPAA Authorization</Text>
  
  <Text style={styles.legalClause}>
    Pursuant to the Health Insurance Portability and Accountability Act of 1996 
    ("HIPAA"), 45 C.F.R. Parts 160 and 164, I hereby authorize and direct any 
    healthcare provider, health plan, healthcare clearinghouse, or other covered 
    entity that has provided treatment or services to me, or that has paid for 
    or is seeking payment for such services, to release and disclose any and all 
    of my protected health information and medical records to my Healthcare Agent.
  </Text>

  <View style={styles.subSection}>
    <Text style={styles.subSectionLabel}>Scope of Authorization:</Text>
    <Text style={styles.articleContent}>
      This authorization applies to the following protected health information:
      {"\n\n"}
      (a) Complete medical records from all healthcare providers, including but 
      not limited to: physicians, hospitals, clinics, laboratories, pharmacies, 
      and other healthcare facilities;
      {"\n\n"}
      (b) Mental health records, including psychotherapy notes, to the extent 
      permitted by applicable law;
      {"\n\n"}
      (c) Drug and alcohol treatment records, to the extent permitted by 42 
      C.F.R. Part 2;
      {"\n\n"}
      (d) HIV/AIDS testing and treatment records;
      {"\n\n"}
      (e) Genetic testing information;
      {"\n\n"}
      (f) Records relating to sexually transmitted infections;
      {"\n\n"}
      (g) Billing and payment information;
      {"\n\n"}
      (h) All communications with healthcare providers.
    </Text>
  </View>

  <View style={styles.subSection}>
    <Text style={styles.subSectionLabel}>Purpose of Authorization:</Text>
    <Text style={styles.articleContent}>
      The purpose of this authorization is to enable my Healthcare Agent to:
      {"\n"}(1) Make informed healthcare decisions on my behalf;
      {"\n"}(2) Monitor my health status and treatment;
      {"\n"}(3) Communicate with my healthcare providers;
      {"\n"}(4) Ensure continuity of my medical care.
    </Text>
  </View>

  <View style={styles.subSection}>
    <Text style={styles.subSectionLabel}>Right to Revoke:</Text>
    <Text style={styles.articleContent}>
      I understand that I may revoke this authorization at any time by notifying 
      the healthcare provider in writing, except to the extent that action has 
      been taken in reliance on this authorization.
    </Text>
  </View>

  <View style={styles.subSection}>
    <Text style={styles.subSectionLabel}>Re-Disclosure Notice:</Text>
    <Text style={styles.articleContent}>
      I understand that information disclosed pursuant to this authorization may 
      be subject to re-disclosure by the recipient and may no longer be protected 
      by federal privacy regulations.
    </Text>
  </View>

  <View style={styles.subSection}>
    <Text style={styles.subSectionLabel}>Expiration:</Text>
    <Text style={styles.articleContent}>
      This authorization shall remain in effect until revoked by me or until my 
      death, and shall survive my death to the extent necessary to effectuate my 
      wishes regarding organ donation and disposition of remains.
    </Text>
  </View>

  {r.additionalHipaaRecipients && (
    <View style={styles.subSection}>
      <Text style={styles.subSectionLabel}>Additional Authorized Recipients:</Text>
      <Text style={styles.articleContent}>{r.additionalHipaaRecipients}</Text>
    </View>
  )}
</View>
```

**Acceptance Criteria:**
- [ ] All 8 scope categories listed
- [ ] Purpose statement included
- [ ] Right to revoke stated
- [ ] Re-disclosure notice included
- [ ] Expiration/survival statement included

---

### Task 7.2: Add Mental Health Authority Section [HIGH]

**File:** `src/app/(auth)/(dashboard)/legacy/components/legal-document-pdf.tsx`

**Location:** `HealthcarePOADocument` function, after HIPAA section

**Implementation:**

```tsx
{/* Mental Health Treatment Authority */}
<View style={styles.section}>
  <Text style={styles.sectionTitle}>Part IV: Mental Health Treatment Authority</Text>
  
  {r.mentalHealthAuthority === "full" && (
    <Text style={styles.legalClause}>
      I AUTHORIZE my Healthcare Agent to make decisions regarding mental health 
      treatment on my behalf, including but not limited to:
      {"\n\n"}
      (a) Consent to voluntary admission to a psychiatric facility;
      {"\n"}(b) Consent to psychotropic medications;
      {"\n"}(c) Consent to electroconvulsive therapy (ECT);
      {"\n"}(d) Consent to behavioral health treatment programs;
      {"\n"}(e) Access to mental health records and communications with mental 
      health providers.
    </Text>
  )}
  
  {r.mentalHealthAuthority === "limited" && (
    <Text style={styles.legalClause}>
      I AUTHORIZE my Healthcare Agent to consent to psychotropic medications and 
      outpatient mental health treatment on my behalf.
      {"\n\n"}
      I DO NOT AUTHORIZE my Healthcare Agent to consent to voluntary psychiatric 
      hospitalization on my behalf. Such decisions shall be made only as provided 
      by applicable law governing persons who lack capacity.
    </Text>
  )}
  
  {r.mentalHealthAuthority === "none" && (
    <Text style={styles.legalClause}>
      I DO NOT AUTHORIZE my Healthcare Agent to make decisions regarding mental 
      health treatment on my behalf. Such decisions shall be made only as provided 
      by applicable law governing persons who lack capacity.
      {"\n\n"}
      {hcReqs?.mentalHealthAuthority === "separate_required" && (
        "Note: " + stateName + " may require a separate mental health directive " +
        "for certain mental health treatment decisions."
      )}
    </Text>
  )}
</View>
```

**Acceptance Criteria:**
- [ ] Three levels of mental health authority
- [ ] Specific treatments listed for full authority
- [ ] State-specific note when separate directive required

---

### Task 7.3: Add Mental Health Authority Wizard Field [HIGH]

**File:** `src/app/(auth)/(dashboard)/legacy/components/legal-document-wizard.tsx`

**Implementation:**

```typescript
{
  id: "mentalHealthAuthority",
  label: "Mental Health Treatment Decisions",
  type: "select",
  required: true,
  options: [
    { 
      value: "full", 
      label: "Full authority (including psychiatric hospitalization and medications)" 
    },
    { 
      value: "limited", 
      label: "Limited (medications and outpatient only, no hospitalization)" 
    },
    { 
      value: "none", 
      label: "No mental health authority" 
    },
  ],
  helpText: "Some states require explicit authorization for mental health treatment decisions",
  stateNote: (state: USState) => {
    const req = getStateLegalRequirements(state)?.healthcare_poa;
    if (req?.mentalHealthAuthority === 'separate_required') {
      return `Note: ${STATE_NAMES[state]} may require a separate mental health directive for some decisions.`;
    }
    return null;
  },
  documentTypes: ['healthcare_poa'],
}
```

**Acceptance Criteria:**
- [ ] Three authority levels available
- [ ] State-specific note displays when applicable

---

### Task 7.4: Add Pain Management Authority [HIGH]

**File:** `src/app/(auth)/(dashboard)/legacy/components/legal-document-pdf.tsx`

**Location:** `HealthcarePOADocument` function

**Implementation:**

```tsx
{/* Pain Management */}
<View style={styles.section}>
  <Text style={styles.sectionTitle}>Part V: Pain Management</Text>
  <Text style={styles.legalClause}>
    I AUTHORIZE my Healthcare Agent to consent to the administration of 
    pain-relieving medication in whatever dosage my Agent deems appropriate to 
    keep me comfortable, EVEN IF SUCH MEDICATION MAY HASTEN MY DEATH.
    {"\n\n"}
    My comfort is a priority. I do not want to suffer pain needlessly. I 
    understand that high doses of pain medication may have the effect of 
    shortening my life, and I accept this as a consequence of effective pain 
    management.
  </Text>
</View>
```

**Acceptance Criteria:**
- [ ] Pain management authority explicit
- [ ] "Even if may hasten death" language included
- [ ] Always included (not conditional)

---

## Epic 8: Advance Directive Enhancements

### Task 8.1: Add Treatment Decision Matrix [CRITICAL]

**File:** `src/app/(auth)/(dashboard)/legacy/components/legal-document-pdf.tsx`

**Location:** `AdvanceDirectiveDocument` function, treatment section

**Current Issue:** Treatment decisions may be too simplified.

**Implementation:**

Create condition-specific treatment decisions:

```tsx
{/* Part III: Treatment Instructions by Condition */}
<View style={styles.section}>
  <Text style={styles.sectionTitle}>Part III: Treatment Instructions</Text>
  
  {/* Terminal Condition */}
  <View style={styles.subSection}>
    <Text style={styles.subSectionLabel}>If I have a TERMINAL CONDITION:</Text>
    <Text style={styles.articleContent}>
      General Direction: {
        r.terminalPreference === "all_measures" 
          ? "I WANT all life-prolonging treatments."
          : r.terminalPreference === "comfort_only"
          ? "I want COMFORT CARE ONLY. I do NOT want life-prolonging treatment."
          : "I want treatment tried for a limited time, then comfort care only."
      }
    </Text>
  </View>

  {/* Permanent Unconsciousness */}
  <View style={styles.subSection}>
    <Text style={styles.subSectionLabel}>If I am PERMANENTLY UNCONSCIOUS:</Text>
    <Text style={styles.articleContent}>
      General Direction: {
        r.unconsciousPreference === "all_measures" 
          ? "I WANT all life-prolonging treatments."
          : r.unconsciousPreference === "comfort_only"
          ? "I want COMFORT CARE ONLY. I do NOT want life-prolonging treatment."
          : "I want treatment tried for a limited time, then comfort care only."
      }
    </Text>
  </View>

  {/* Specific Treatments */}
  <View style={[styles.subSection, { marginTop: 15 }]}>
    <Text style={styles.subSectionLabel}>Specific Treatment Decisions:</Text>
    
    <Text style={styles.articleContent}>
      CPR (Cardiopulmonary Resuscitation):{" "}
      {r.cpr === "yes" ? "YES, attempt CPR" 
        : r.cpr === "no" ? "NO (DNR - Do Not Resuscitate)" 
        : "Let my agent decide"}
    </Text>
    
    <Text style={styles.articleContent}>
      Mechanical Ventilation:{" "}
      {r.ventilator === "yes" ? "YES" 
        : r.ventilator === "no" ? "NO" 
        : r.ventilator === "trial" 
          ? `Trial period of ${r.ventilatorTrialDays || "___"} days only`
        : "Let my agent decide"}
    </Text>
    
    <Text style={styles.articleContent}>
      Artificial Nutrition (Feeding Tube):{" "}
      {r.feedingTube === "yes" ? "YES" 
        : r.feedingTube === "no" ? "NO" 
        : r.feedingTube === "trial" 
          ? `Trial period of ${r.feedingTubeTrialDays || "___"} days only`
        : "Let my agent decide"}
    </Text>
    
    <Text style={styles.articleContent}>
      Artificial Hydration (IV Fluids):{" "}
      {r.hydration === "yes" ? "YES" 
        : r.hydration === "no" ? "NO" 
        : r.hydration === "comfort" ? "Only for comfort/medication delivery"
        : "Let my agent decide"}
    </Text>
    
    <Text style={styles.articleContent}>
      Dialysis:{" "}
      {r.dialysis === "yes" ? "YES" 
        : r.dialysis === "no" ? "NO" 
        : r.dialysis === "continue" ? "Continue only if already on dialysis"
        : "Let my agent decide"}
    </Text>
    
    <Text style={styles.articleContent}>
      Blood Transfusions:{" "}
      {r.transfusions === "yes" ? "YES" 
        : r.transfusions === "no" ? "NO" 
        : "Let my agent decide"}
    </Text>
    
    <Text style={styles.articleContent}>
      Antibiotics:{" "}
      {r.antibiotics === "yes" ? "YES" 
        : r.antibiotics === "comfort" ? "Only for comfort (not to extend life)"
        : r.antibiotics === "no" ? "NO"
        : "Let my agent decide"}
    </Text>
  </View>
</View>
```

**Acceptance Criteria:**
- [ ] Separate preferences for terminal and unconscious conditions
- [ ] Seven specific treatment types addressed
- [ ] Trial period option for ventilator and feeding tube
- [ ] "Agent decides" option for each treatment

---

### Task 8.2: Add Treatment Decision Wizard Fields [HIGH]

**File:** `src/app/(auth)/(dashboard)/legacy/components/legal-document-wizard.tsx`

**Implementation:**

```typescript
// Condition-specific preferences
{
  id: "terminalPreference",
  label: "If you have a TERMINAL CONDITION",
  type: "select",
  required: true,
  options: [
    { value: "all_measures", label: "I want all life-prolonging treatments" },
    { value: "comfort_only", label: "Comfort care only (no life-prolonging treatment)" },
    { value: "trial", label: "Try treatment for a limited time, then comfort care" },
  ],
  helpText: "Terminal condition means death is expected within a relatively short time",
  documentTypes: ['advance_directive'],
},
{
  id: "unconsciousPreference",
  label: "If you are PERMANENTLY UNCONSCIOUS",
  type: "select",
  required: true,
  options: [
    { value: "all_measures", label: "I want all life-prolonging treatments" },
    { value: "comfort_only", label: "Comfort care only (no life-prolonging treatment)" },
    { value: "trial", label: "Try treatment for a limited time, then comfort care" },
  ],
  helpText: "Permanent unconsciousness includes persistent vegetative state and irreversible coma",
  documentTypes: ['advance_directive'],
},

// Specific treatments
{
  id: "cpr",
  label: "CPR (Cardiopulmonary Resuscitation)",
  type: "select",
  required: true,
  options: [
    { value: "yes", label: "Yes, attempt CPR" },
    { value: "no", label: "No (DNR - Do Not Resuscitate)" },
    { value: "agent", label: "Let my healthcare agent decide" },
  ],
  helpText: "Chest compressions and rescue breathing if your heart stops",
  documentTypes: ['advance_directive'],
},
{
  id: "ventilator",
  label: "Mechanical Ventilation (Breathing Machine)",
  type: "select",
  required: true,
  options: [
    { value: "yes", label: "Yes, use ventilator" },
    { value: "no", label: "No ventilator" },
    { value: "trial", label: "Time-limited trial only" },
    { value: "agent", label: "Let my healthcare agent decide" },
  ],
  documentTypes: ['advance_directive'],
},
{
  id: "ventilatorTrialDays",
  label: "Ventilator trial period (days)",
  type: "number",
  required: false,
  conditional: { field: "ventilator", value: "trial" },
  min: 1,
  max: 30,
  placeholder: "e.g., 7",
  documentTypes: ['advance_directive'],
},
// ... similar fields for feedingTube, hydration, dialysis, transfusions, antibiotics
```

**Acceptance Criteria:**
- [ ] Condition-specific preference fields
- [ ] All seven treatment type fields
- [ ] Trial period conditional fields
- [ ] Help text explaining each treatment

---

### Task 8.3: Add Pregnancy Exception Section [CRITICAL for TX and other states]

**File:** `src/app/(auth)/(dashboard)/legacy/components/legal-document-pdf.tsx`

**Location:** `AdvanceDirectiveDocument` function

**Implementation:**

```tsx
{/* Pregnancy Exception */}
{adReqs?.pregnancyProvisions?.pregnancyExceptionRequired && (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>Part VII: Pregnancy Exception</Text>
    
    {adReqs.pregnancyProvisions.statutoryLanguage && (
      <Text style={[styles.legalClause, { fontStyle: "italic", marginBottom: 10 }]}>
        {adReqs.pregnancyProvisions.statutoryLanguage}
      </Text>
    )}
    
    <Text style={styles.legalClause}>
      {r.pregnancyException === "suspended" ? (
        "If I am pregnant, this Advance Directive SHALL HAVE NO FORCE AND EFFECT " +
        "during my pregnancy. My healthcare providers shall provide life-sustaining " +
        "treatment as necessary to maintain my life for the benefit of my unborn " +
        "child until delivery is possible."
      ) : (
        "This Advance Directive SHALL REMAIN IN EFFECT even if I am pregnant. My " +
        "wishes regarding life-sustaining treatment shall be followed regardless " +
        "of my pregnancy status. I have made this decision after careful " +
        "consideration of all implications."
      )}
    </Text>
  </View>
)}

{/* For states without required pregnancy provision, make it optional */}
{!adReqs?.pregnancyProvisions?.pregnancyExceptionRequired && r.includePregnancyProvision && (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>Part VII: Pregnancy Provision (Optional)</Text>
    <Text style={styles.legalClause}>
      {r.pregnancyException === "suspended" ? (
        "If I am pregnant, this Advance Directive shall have no force and effect " +
        "during my pregnancy."
      ) : (
        "This Advance Directive shall remain in effect even if I am pregnant."
      )}
    </Text>
  </View>
)}
```

**Acceptance Criteria:**
- [ ] Pregnancy section appears when state requires
- [ ] Statutory language included when state provides it
- [ ] Suspended vs. continues options both supported
- [ ] Optional for states without requirement

---

### Task 8.4: Add Pregnancy Exception Wizard Fields [HIGH]

**File:** `src/app/(auth)/(dashboard)/legacy/components/legal-document-wizard.tsx`

**Implementation:**

```typescript
{
  id: "includePregnancyProvision",
  label: "Include pregnancy provision",
  type: "checkbox",
  required: false,
  defaultValue: (state: USState) => {
    const req = getStateLegalRequirements(state)?.advance_directive;
    return req?.pregnancyProvisions?.pregnancyExceptionRequired || false;
  },
  disabled: (state: USState) => {
    const req = getStateLegalRequirements(state)?.advance_directive;
    return req?.pregnancyProvisions?.pregnancyExceptionRequired || false;
  },
  helpText: (state: USState) => {
    const req = getStateLegalRequirements(state)?.advance_directive;
    if (req?.pregnancyProvisions?.pregnancyExceptionRequired) {
      return `${STATE_NAMES[state]} requires a pregnancy provision in advance directives.`;
    }
    return "Optional provision addressing what happens if you are pregnant";
  },
  documentTypes: ['advance_directive'],
},
{
  id: "pregnancyException",
  label: "If pregnant, this directive should:",
  type: "radio",
  required: true,
  conditional: (data: WizardData, state: USState) => {
    const req = getStateLegalRequirements(state)?.advance_directive;
    return req?.pregnancyProvisions?.pregnancyExceptionRequired || data.includePregnancyProvision;
  },
  options: [
    { 
      value: "suspended", 
      label: "Be suspended during pregnancy (life-sustaining treatment provided)" 
    },
    { 
      value: "continues", 
      label: "Continue to apply during pregnancy" 
    },
  ],
  helpText: "This is a significant decision. Consider discussing with your healthcare agent and family.",
  documentTypes: ['advance_directive'],
}
```

**Acceptance Criteria:**
- [ ] Pregnancy provision required for states that mandate it
- [ ] Optional for other states
- [ ] Clear explanation of implications

---

### Task 8.5: Add Comfort Care Section [CRITICAL]

**File:** `src/app/(auth)/(dashboard)/legacy/components/legal-document-pdf.tsx`

**Location:** `AdvanceDirectiveDocument` function

**Implementation:**

```tsx
{/* Comfort Care - Always Included */}
<View style={styles.section}>
  <Text style={styles.sectionTitle}>Part VI: Comfort Care</Text>
  <Text style={[styles.legalClause, { fontWeight: "bold" }]}>
    Regardless of any other choices I have made in this Directive, I ALWAYS want 
    the following comfort care:
  </Text>
  
  <View style={styles.subSection}>
    <Text style={styles.articleContent}>
      • Pain medication in whatever dosage is needed to keep me comfortable, 
      even if it may hasten my death or affect my consciousness
      {"\n\n"}
      • Measures to maintain my personal hygiene and bodily cleanliness
      {"\n\n"}
      • Measures to keep my mouth and lips moist
      {"\n\n"}
      • Reasonable measures to maintain my dignity and provide a peaceful 
      environment
      {"\n\n"}
      • Opportunity for family, loved ones, and spiritual advisors to be present
      {r.religiousConsiderations && (
        "\n\n• Religious/spiritual accommodations: " + r.religiousConsiderations
      )}
    </Text>
  </View>
  
  <Text style={[styles.legalClause, { fontWeight: "bold", marginTop: 10 }]}>
    Comfort care is NOT optional and should be provided regardless of my 
    treatment decisions above.
  </Text>
</View>
```

**Acceptance Criteria:**
- [ ] Comfort care section always appears (not conditional)
- [ ] "Even if may hasten death" language included
- [ ] Five standard comfort measures listed
- [ ] Religious/spiritual accommodations included if provided
- [ ] Bold emphasis that comfort care is not optional

---

### Task 8.6: Use State-Specific Condition Definitions [HIGH]

**File:** `src/app/(auth)/(dashboard)/legacy/components/legal-document-pdf.tsx`

**Location:** `AdvanceDirectiveDocument` function, definitions section

**Implementation:**

```tsx
{/* Part II: Definitions - Use state-specific definitions */}
<View style={styles.section}>
  <Text style={styles.sectionTitle}>Part II: Definitions</Text>
  
  <Text style={styles.definitionTerm}>"Terminal Condition"</Text>
  <Text style={styles.definitionText}>
    {adReqs?.conditionDefinitions?.terminalCondition || 
      "means an incurable and irreversible condition that, in the opinion of my " +
      "attending physician and one additional physician, will result in my death " +
      "within a relatively short period of time without life-sustaining treatment."}
  </Text>
  
  <Text style={styles.definitionTerm}>"Permanent Unconsciousness"</Text>
  <Text style={styles.definitionText}>
    {adReqs?.conditionDefinitions?.permanentUnconsciousness ||
      "means an irreversible condition in which I am permanently unconscious with " +
      "no reasonable medical expectation of regaining consciousness, including " +
      "persistent vegetative state and irreversible coma."}
  </Text>
  
  <Text style={styles.definitionTerm}>"End-Stage Condition"</Text>
  <Text style={styles.definitionText}>
    {adReqs?.conditionDefinitions?.endStageCondition ||
      "means an irreversible condition caused by injury, disease, or illness that " +
      "has resulted in severe and permanent deterioration indicated by incompetency " +
      "and complete physical dependency, and for which treatment would be medically " +
      "ineffective."}
  </Text>

  {/* Standard definitions that don't vary by state */}
  <Text style={styles.definitionTerm}>"Life-Sustaining Treatment"</Text>
  <Text style={styles.definitionText}>
    means any medical treatment that serves only to prolong the dying process, 
    including mechanical ventilation, CPR, artificial nutrition and hydration, 
    dialysis, and antibiotics.
  </Text>
  
  <Text style={styles.definitionTerm}>"Comfort Care"</Text>
  <Text style={styles.definitionText}>
    means treatment to maintain personal hygiene, alleviate pain and suffering, 
    including pain medication, even if such treatment may hasten my death.
  </Text>
</View>
```

**Acceptance Criteria:**
- [ ] State-specific definitions used when available
- [ ] Fallback to standard definitions when state-specific not available
- [ ] All five key terms defined

---

## Epic 9: UI Enhancements

### Task 9.1: Add Document Coordination Warnings [MEDIUM]

**File:** `src/app/(auth)/(dashboard)/legacy/components/legal-documents-section.tsx`

**Location:** Inside card rendering logic

**Implementation:**

```typescript
// Add helper function
const getDocumentWarnings = (
  docType: DocumentType, 
  existingDocs: Map<string, LegalDocument>
): { blocking: boolean; message: string }[] => {
  const warnings: { blocking: boolean; message: string }[] = [];
  const coordination = DOCUMENT_COORDINATION[docType];
  
  if (!coordination) return warnings;
  
  // Check for blocking prerequisites
  for (const required of coordination.requiredReferences) {
    const requiredDoc = existingDocs.get(required);
    if (!requiredDoc || requiredDoc.status === 'draft') {
      warnings.push({
        blocking: true,
        message: `Requires a completed ${DOCUMENT_TYPES[required as DocumentType]?.name || required}. Create that document first.`,
      });
    }
  }
  
  // Check for recommended companions (non-blocking)
  if (coordination.standaloneWarning) {
    const hasAllCompanions = coordination.recommendedCompanions.every(
      c => existingDocs.has(c) && existingDocs.get(c)?.status !== 'draft'
    );
    if (!hasAllCompanions) {
      warnings.push({
        blocking: false,
        message: coordination.standaloneWarning,
      });
    }
  }
  
  return warnings;
};

// In the card component JSX, add warning display
{(() => {
  const warnings = getDocumentWarnings(docType, documentsByType);
  const blockingWarnings = warnings.filter(w => w.blocking);
  const nonBlockingWarnings = warnings.filter(w => !w.blocking);
  
  return (
    <>
      {blockingWarnings.length > 0 && (
        <div className="mt-2 p-2 bg-destructive/10 border border-destructive/20 rounded text-xs text-destructive">
          <AlertTriangle className="h-3 w-3 inline mr-1" />
          {blockingWarnings[0].message}
        </div>
      )}
      {nonBlockingWarnings.length > 0 && !existingDoc && (
        <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded text-xs text-amber-800">
          <Info className="h-3 w-3 inline mr-1" />
          {nonBlockingWarnings[0].message}
        </div>
      )}
    </>
  );
})()}
```

**Acceptance Criteria:**
- [ ] Blocking warnings prevent document creation
- [ ] Non-blocking warnings display as informational
- [ ] Pour-over will shows blocking warning without trust
- [ ] Trust shows non-blocking warning about pour-over will

---

### Task 9.2: Disable Start Button for Blocked Documents [MEDIUM]

**File:** `src/app/(auth)/(dashboard)/legacy/components/legal-documents-section.tsx`

**Location:** Start Document button

**Implementation:**

```tsx
// Update button to check for blocking conditions
const hasBlockingWarnings = getDocumentWarnings(docType, documentsByType)
  .some(w => w.blocking);

<Button
  variant="outline"
  size="sm"
  className="w-full"
  onClick={() => handleStartDocument(docType)}
  disabled={hasBlockingWarnings}
>
  <Plus className="h-4 w-4 mr-1" />
  {hasBlockingWarnings ? "Prerequisites Required" : "Start Document"}
</Button>
```

**Acceptance Criteria:**
- [ ] Button disabled when prerequisites not met
- [ ] Button text changes to indicate why disabled

---

### Task 9.3: Add Document Relationship Badges [LOW]

**File:** `src/app/(auth)/(dashboard)/legacy/components/legal-documents-section.tsx`

**Location:** Card header area

**Implementation:**

```tsx
// Update DOCUMENT_TYPES to include relationship badges
const DOCUMENT_TYPES: Record<DocumentType, {
  name: string;
  description: string;
  icon: typeof ScrollText;
  shortDescription: string;
  relationshipBadge?: { text: string; variant: "default" | "secondary" | "outline" };
}> = {
  // ... existing properties
  trust: {
    // ... existing
    relationshipBadge: { text: "Pair with Pour-Over Will", variant: "outline" },
  },
  pour_over_will: {
    // ... existing
    relationshipBadge: { text: "Requires Trust", variant: "secondary" },
  },
  advance_directive: {
    // ... existing
    relationshipBadge: { text: "Pair with Healthcare POA", variant: "outline" },
  },
};

// In card header, add badge
{meta.relationshipBadge && !existingDoc && (
  <Badge variant={meta.relationshipBadge.variant} className="text-xs">
    {meta.relationshipBadge.text}
  </Badge>
)}
```

**Acceptance Criteria:**
- [ ] Relationship badges appear on relevant documents
- [ ] Badges only show when document not yet created

---

## Epic 10: Validation Enhancements

### Task 10.1: Create Witness Validation Function [HIGH]

**File:** `src/lib/state-legal-requirements.ts`

**Location:** After existing validation functions (around line 2906)

**Implementation:**

```typescript
/**
 * Validate witness requirements for any document type
 */
export function validateWitnesses(
  state: USState,
  documentType: DocumentType,
  witnesses: Array<{
    name: string;
    age: number;
    isBeneficiary?: boolean;
    isRelated?: boolean;
    isHealthcareProvider?: boolean;
    isFacilityEmployee?: boolean;
  }>
): DocumentValidation {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  const requirements = STATE_LEGAL_REQUIREMENTS[state];
  let docRequirements: { 
    witnessCount: number; 
    minimumWitnessAge: number;
    witnessRestrictions?: WitnessRestrictions;
  };
  
  switch (documentType) {
    case 'will':
      docRequirements = requirements.will;
      break;
    case 'healthcare_poa':
      docRequirements = requirements.healthcare_poa;
      break;
    case 'advance_directive':
      docRequirements = requirements.advance_directive;
      break;
    case 'financial_poa':
      docRequirements = requirements.financial_poa;
      break;
    default:
      return { isValid: true, errors: [], warnings: [] };
  }

  const restrictions = docRequirements.witnessRestrictions;
  const stateName = STATE_NAMES[state];

  // Check witness count
  if (witnesses.length < docRequirements.witnessCount) {
    errors.push(
      `${stateName} requires ${docRequirements.witnessCount} witness${docRequirements.witnessCount !== 1 ? 'es' : ''}. ` +
      `You have ${witnesses.length}.`
    );
  }

  // Check each witness
  witnesses.forEach((witness, index) => {
    const num = index + 1;
    
    // Age check
    if (witness.age < docRequirements.minimumWitnessAge) {
      errors.push(
        `Witness ${num} (${witness.name}) must be at least ${docRequirements.minimumWitnessAge} years old in ${stateName}.`
      );
    }

    if (!restrictions) return;

    // Beneficiary check
    if (witness.isBeneficiary) {
      if (!restrictions.beneficiaryCanWitness) {
        errors.push(
          `Witness ${num} (${witness.name}) cannot be a beneficiary in ${stateName}.`
        );
      } else if (restrictions.beneficiaryWitnessConsequence === 'void_bequest') {
        warnings.push(
          `Witness ${num} (${witness.name}) is a beneficiary. Their bequest may be void under ${stateName} law.`
        );
      } else if (restrictions.beneficiaryWitnessConsequence === 'void_will') {
        errors.push(
          `Witness ${num} (${witness.name}) is a beneficiary. This may void the entire will in ${stateName}.`
        );
      }
    }

    // Healthcare document specific checks
    if (['healthcare_poa', 'advance_directive'].includes(documentType)) {
      if (witness.isHealthcareProvider && !restrictions.healthcareProviderCanWitness) {
        errors.push(
          `Witness ${num} (${witness.name}) cannot be a healthcare provider for healthcare documents in ${stateName}.`
        );
      }
      if (witness.isFacilityEmployee && !restrictions.facilityEmployeeCanWitness) {
        errors.push(
          `Witness ${num} (${witness.name}) cannot be an employee of a healthcare facility in ${stateName}.`
        );
      }
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}
```

**Acceptance Criteria:**
- [ ] Function validates witness count
- [ ] Function validates witness age
- [ ] Function checks beneficiary restrictions
- [ ] Function checks healthcare-specific restrictions
- [ ] Returns both errors (blocking) and warnings (non-blocking)

---

### Task 10.2: Create Document Coordination Validator [HIGH]

**File:** `src/lib/state-legal-requirements.ts`

**Location:** After witness validation function

**Implementation:**

```typescript
/**
 * Validate document coordination requirements
 */
export function validateDocumentCoordination(
  documentType: DocumentType,
  existingDocuments: Array<{ documentType: string; status: string }>
): DocumentValidation {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  const coordination = DOCUMENT_COORDINATION[documentType];
  if (!coordination) {
    return { isValid: true, errors: [], warnings: [] };
  }

  const completedDocTypes = existingDocuments
    .filter(doc => doc.status === 'complete' || doc.status === 'generated')
    .map(doc => doc.documentType);

  // Check required references (blocking)
  for (const required of coordination.requiredReferences) {
    if (!completedDocTypes.includes(required)) {
      const requiredName = DOCUMENT_TYPES.find(dt => dt === required) || required;
      errors.push(
        `A ${documentType} requires a completed ${requiredName}. Please create that document first.`
      );
    }
  }

  // Check recommended companions (warning only)
  if (coordination.standaloneWarning) {
    const missingCompanions = coordination.recommendedCompanions.filter(
      c => !completedDocTypes.includes(c)
    );
    if (missingCompanions.length > 0) {
      warnings.push(coordination.standaloneWarning);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}
```

**Acceptance Criteria:**
- [ ] Function checks required references
- [ ] Function generates warnings for missing companions
- [ ] Pour-over will fails validation without trust

---

## Epic 11: Testing

### Task 11.1: Create Type Definition Tests [HIGH]

**File:** `src/lib/__tests__/state-legal-requirements.test.ts`

**Implementation:**

```typescript
import {
  STATE_LEGAL_REQUIREMENTS,
  US_STATES,
  type EnhancedWillRequirements,
  type WitnessRestrictions,
  validateWitnesses,
  validateDocumentCoordination,
} from '../state-legal-requirements';

describe('State Legal Requirements Types', () => {
  describe('All states have required fields', () => {
    US_STATES.forEach(state => {
      it(`${state} has all enhanced will requirements`, () => {
        const reqs = STATE_LEGAL_REQUIREMENTS[state].will;
        expect(reqs.witnessRestrictions).toBeDefined();
        expect(typeof reqs.noContestClauseEnforceable).toBe('boolean');
        expect(typeof reqs.defaultSurvivalPeriod).toBe('number');
        expect(typeof reqs.rufadaaAdopted).toBe('boolean');
        expect(typeof reqs.communityPropertyState).toBe('boolean');
      });

      it(`${state} has all enhanced healthcare POA requirements`, () => {
        const reqs = STATE_LEGAL_REQUIREMENTS[state].healthcare_poa;
        expect(reqs.witnessRestrictions).toBeDefined();
        expect(['combined', 'separate_recommended', 'separate_required']).toContain(reqs.hipaaIntegration);
        expect(['included', 'separate_required', 'not_permitted']).toContain(reqs.mentalHealthAuthority);
      });

      it(`${state} has all enhanced advance directive requirements`, () => {
        const reqs = STATE_LEGAL_REQUIREMENTS[state].advance_directive;
        expect(reqs.pregnancyProvisions).toBeDefined();
        expect(reqs.conditionDefinitions).toBeDefined();
        expect(reqs.conditionDefinitions.terminalCondition).toBeTruthy();
      });
    });
  });
});
```

**Acceptance Criteria:**
- [ ] Tests verify all 51 states have required fields
- [ ] Tests run without failures after migration

---

### Task 11.2: Create Witness Validation Tests [HIGH]

**File:** `src/lib/__tests__/state-legal-requirements.test.ts`

**Implementation:**

```typescript
describe('Witness Validation', () => {
  it('rejects insufficient witness count', () => {
    const result = validateWitnesses('CA', 'will', [
      { name: 'John', age: 25 }
    ]);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContainEqual(expect.stringContaining('2 witnesses'));
  });

  it('rejects underage witnesses', () => {
    const result = validateWitnesses('CA', 'will', [
      { name: 'John', age: 17 },
      { name: 'Jane', age: 25 }
    ]);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContainEqual(expect.stringContaining('18 years old'));
  });

  it('warns about beneficiary witnesses in void_bequest states', () => {
    const result = validateWitnesses('CA', 'will', [
      { name: 'John', age: 25, isBeneficiary: true },
      { name: 'Jane', age: 25 }
    ]);
    expect(result.isValid).toBe(true); // Not blocking
    expect(result.warnings.length).toBeGreaterThan(0);
    expect(result.warnings).toContainEqual(expect.stringContaining('void'));
  });

  it('rejects healthcare provider witnesses for healthcare documents', () => {
    const result = validateWitnesses('CA', 'healthcare_poa', [
      { name: 'Dr. Smith', age: 45, isHealthcareProvider: true },
      { name: 'Jane', age: 25 }
    ]);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContainEqual(expect.stringContaining('healthcare provider'));
  });

  it('accepts valid witnesses', () => {
    const result = validateWitnesses('CA', 'will', [
      { name: 'John', age: 25 },
      { name: 'Jane', age: 30 }
    ]);
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });
});
```

**Acceptance Criteria:**
- [ ] Tests cover all validation scenarios
- [ ] Tests verify state-specific behavior

---

### Task 11.3: Create Document Coordination Tests [HIGH]

**File:** `src/lib/__tests__/state-legal-requirements.test.ts`

**Implementation:**

```typescript
describe('Document Coordination Validation', () => {
  it('blocks pour-over will without trust', () => {
    const result = validateDocumentCoordination('pour_over_will', []);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContainEqual(expect.stringContaining('trust'));
  });

  it('allows pour-over will with completed trust', () => {
    const result = validateDocumentCoordination('pour_over_will', [
      { documentType: 'revocable_trust', status: 'complete' }
    ]);
    expect(result.isValid).toBe(true);
  });

  it('warns about trust without pour-over will', () => {
    const result = validateDocumentCoordination('revocable_trust', []);
    expect(result.isValid).toBe(true); // Not blocking
    expect(result.warnings.length).toBeGreaterThan(0);
    expect(result.warnings).toContainEqual(expect.stringContaining('pour-over'));
  });

  it('allows will without prerequisites', () => {
    const result = validateDocumentCoordination('will', []);
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });
});
```

**Acceptance Criteria:**
- [ ] Tests verify blocking behavior for pour-over will
- [ ] Tests verify warning behavior for trust
- [ ] Tests verify no prerequisites for standalone documents

---

### Task 11.4: Create PDF Generation Tests [MEDIUM]

**File:** `src/app/(auth)/(dashboard)/legacy/components/__tests__/legal-document-pdf.test.tsx`

**Implementation:**

```typescript
import { renderToString } from '@react-pdf/renderer';
import { LegalDocumentPDF, type LegalDocumentPDFData } from '../legal-document-pdf';

const createMockData = (documentType: string): LegalDocumentPDFData => ({
  documentType: documentType as LegalDocumentPDFData['documentType'],
  state: 'CA',
  responses: {
    fullName: 'John Smith',
    address: '123 Main St, Los Angeles, CA 90001',
    city: 'Los Angeles',
    county: 'Los Angeles',
    survivalPeriod: '30',
    executorName: 'Jane Smith',
    // ... other required fields
  },
  userName: 'John Smith',
  generatedDate: new Date(),
});

describe('Legal Document PDF Generation', () => {
  describe('Will Document', () => {
    it('renders without errors', async () => {
      const data = createMockData('will');
      await expect(renderToString(<LegalDocumentPDF data={data} />)).resolves.toBeDefined();
    });

    it('includes payment of debts article', async () => {
      const data = createMockData('will');
      const output = await renderToString(<LegalDocumentPDF data={data} />);
      expect(output).toContain('Payment of Debts');
    });

    it('includes simultaneous death article', async () => {
      const data = createMockData('will');
      const output = await renderToString(<LegalDocumentPDF data={data} />);
      expect(output).toContain('Simultaneous Death');
    });

    it('includes executor powers', async () => {
      const data = createMockData('will');
      const output = await renderToString(<LegalDocumentPDF data={data} />);
      expect(output).toContain('Executor Powers');
    });

    it('includes severability clause', async () => {
      const data = createMockData('will');
      const output = await renderToString(<LegalDocumentPDF data={data} />);
      expect(output).toContain('Severability');
    });
  });

  describe('Trust Document', () => {
    it('renders without errors', async () => {
      const data = createMockData('trust');
      await expect(renderToString(<LegalDocumentPDF data={data} />)).resolves.toBeDefined();
    });

    it('includes incapacity provisions', async () => {
      const data = createMockData('trust');
      const output = await renderToString(<LegalDocumentPDF data={data} />);
      expect(output).toContain('Incapacity');
    });

    it('includes amendment and revocation', async () => {
      const data = createMockData('trust');
      const output = await renderToString(<LegalDocumentPDF data={data} />);
      expect(output).toContain('Amendment');
      expect(output).toContain('Revocation');
    });
  });

  describe('Healthcare POA Document', () => {
    it('includes HIPAA authorization with required elements', async () => {
      const data = createMockData('healthcare_poa');
      const output = await renderToString(<LegalDocumentPDF data={data} />);
      expect(output).toContain('HIPAA');
      expect(output).toContain('Right to Revoke');
      expect(output).toContain('Re-Disclosure');
    });
  });

  describe('Advance Directive Document', () => {
    it('includes comfort care section', async () => {
      const data = createMockData('advance_directive');
      const output = await renderToString(<LegalDocumentPDF data={data} />);
      expect(output).toContain('Comfort Care');
    });

    it('uses state-specific definitions for CA', async () => {
      const data = createMockData('advance_directive');
      data.state = 'CA';
      const output = await renderToString(<LegalDocumentPDF data={data} />);
      expect(output).toContain('relatively short time'); // CA definition
    });

    it('uses state-specific definitions for TX', async () => {
      const data = createMockData('advance_directive');
      data.state = 'TX';
      const output = await renderToString(<LegalDocumentPDF data={data} />);
      expect(output).toContain('six months'); // TX definition
    });
  });
});
```

**Acceptance Criteria:**
- [ ] Tests verify each document type renders
- [ ] Tests verify required articles present
- [ ] Tests verify state-specific content

---

## Implementation Checklist

### Phase 1: Foundation (Tasks 1.1-1.9, 2.1)
- [ ] All type definitions added
- [ ] State data template created
- [ ] Types compile without errors

### Phase 2: State Data (Tasks 2.2-2.6)
- [ ] California updated
- [ ] Texas updated
- [ ] Florida updated
- [ ] All 51 states updated

### Phase 3: Will Enhancements (Tasks 3.1-3.11)
- [ ] Declaration clause enhanced
- [ ] All missing articles added
- [ ] Witness attestation enhanced
- [ ] Self-proving affidavit enhanced
- [ ] All wizard fields added

### Phase 4: Trust Enhancements (Tasks 4.1-4.5)
- [ ] Incapacity provisions added
- [ ] Spendthrift clause enhanced
- [ ] Amendment/revocation added
- [ ] Trustee powers added

### Phase 5: Pour-Over Will (Tasks 5.1-5.2)
- [ ] Trust reference validation added
- [ ] Pour-over provision enhanced

### Phase 6: Financial POA (Tasks 6.1-6.6)
- [ ] Enumerated powers added
- [ ] Durability clause added
- [ ] Third-party reliance added
- [ ] Agent acceptance added

### Phase 7: Healthcare POA (Tasks 7.1-7.4)
- [ ] HIPAA authorization enhanced
- [ ] Mental health authority added
- [ ] Pain management added

### Phase 8: Advance Directive (Tasks 8.1-8.6)
- [ ] Treatment matrix added
- [ ] Pregnancy exception added
- [ ] Comfort care added
- [ ] State definitions used

### Phase 9: UI/Validation (Tasks 9.1-9.3, 10.1-10.2)
- [ ] Coordination warnings added
- [ ] Validation functions created

### Phase 10: Testing (Tasks 11.1-11.4)
- [ ] All tests written
- [ ] All tests passing

---

**End of Implementation Tasks Document**
