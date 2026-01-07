# Scope of Work: Legal Document Template System Remediation

**Project:** Second Nature Legacy Planning - Legal Document Templates  
**Version:** 1.0  
**Date:** January 5, 2026  
**Prepared For:** Jim, Engineering Leadership  
**Classification:** Technical Specification

---

## Executive Summary

This scope of work addresses critical gaps identified in the legal document template generation system. The current implementation has significant deficiencies that could result in generated documents being legally defective or failing to meet state-specific requirements. This document provides detailed specifications for remediation across six document types and two primary source files.

### Risk Assessment

| Risk Level | Issue | Impact |
|------------|-------|--------|
| **CRITICAL** | Trust and Pour-Over Will templates don't exist (code falls through to Will template) | Users believe they have valid trust documents when they don't |
| **CRITICAL** | Missing survival period and simultaneous death clauses in Will | Assets may pass through multiple estates or to unintended recipients |
| **HIGH** | HIPAA authorization language insufficient | Healthcare agents may be unable to access medical records |
| **HIGH** | Missing executor/trustee powers enumeration | Fiduciaries may need court approval for routine actions |
| **MEDIUM** | Self-proving affidavit language inadequate | Probate may require locating witnesses |
| **MEDIUM** | Witness attestation missing required elements | Documents may be challenged |

---

## Table of Contents

1. [File Modifications Overview](#1-file-modifications-overview)
2. [Type Definition Enhancements](#2-type-definition-enhancements)
3. [Will Template Remediation](#3-will-template-remediation)
4. [Trust Template Creation](#4-trust-template-creation)
5. [Pour-Over Will Template Creation](#5-pour-over-will-template-creation)
6. [Financial POA Remediation](#6-financial-poa-remediation)
7. [Healthcare POA Remediation](#7-healthcare-poa-remediation)
8. [Advance Directive Remediation](#8-advance-directive-remediation)
9. [State Requirements Data Enhancement](#9-state-requirements-data-enhancement)
10. [UI Component Updates](#10-ui-component-updates)
11. [Validation Logic Enhancements](#11-validation-logic-enhancements)
12. [Testing Requirements](#12-testing-requirements)
13. [Implementation Priority & Timeline](#13-implementation-priority--timeline)
14. [Acceptance Criteria](#14-acceptance-criteria)

---

## 1. File Modifications Overview

### Files Requiring Modification

| File | Type | Scope |
|------|------|-------|
| `state-legal-requirements.ts` | Enhancement | Add new requirement types, witness restrictions, pregnancy provisions |
| `legal-documents-section.tsx` | Enhancement | Add coordination warnings, document relationship indicators |
| `legal-document-pdf.tsx` | **Major Rewrite** | Create separate generators per document type |
| `legal-document-wizard.tsx` | Enhancement | Add missing wizard steps and fields |
| **NEW:** `document-templates/` | Creation | Template language constants per document type |
| **NEW:** `pdf-generators/` | Creation | Dedicated PDF generator per document type |

### New Files Required

```
src/
├── lib/
│   ├── state-legal-requirements.ts (MODIFY)
│   ├── document-templates/
│   │   ├── index.ts
│   │   ├── will-template.ts
│   │   ├── trust-template.ts
│   │   ├── pour-over-will-template.ts
│   │   ├── financial-poa-template.ts
│   │   ├── healthcare-poa-template.ts
│   │   └── advance-directive-template.ts
│   └── witness-restrictions.ts (NEW)
├── app/(auth)/(dashboard)/legacy/components/
│   ├── legal-documents-section.tsx (MODIFY)
│   ├── legal-document-wizard.tsx (MODIFY)
│   ├── legal-document-pdf.tsx (DEPRECATE → split)
│   └── pdf-generators/
│       ├── index.ts
│       ├── will-pdf-generator.tsx
│       ├── trust-pdf-generator.tsx
│       ├── pour-over-will-pdf-generator.tsx
│       ├── financial-poa-pdf-generator.tsx
│       ├── healthcare-poa-pdf-generator.tsx
│       └── advance-directive-pdf-generator.tsx
```

---

## 2. Type Definition Enhancements

### 2.1 New Types for `state-legal-requirements.ts`

Add the following type definitions after line 182:

```typescript
/**
 * Witness restriction categories
 */
export interface WitnessRestrictions {
  /** Whether beneficiaries can serve as witnesses */
  beneficiaryCanWitness: boolean;
  /** Consequence if beneficiary witnesses (void bequest vs void entire will) */
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

/**
 * Pregnancy provisions for advance directives
 */
export interface PregnancyProvisions {
  /** Whether state requires pregnancy exception language */
  pregnancyExceptionRequired: boolean;
  /** State's default if not specified */
  defaultBehavior: 'directive_suspended' | 'directive_continues' | 'patient_choice';
  /** Required statutory language if any */
  statutoryLanguage: string | null;
}

/**
 * Enhanced Will Requirements
 */
export interface EnhancedWillRequirements extends WillRequirements {
  /** Witness restrictions */
  witnessRestrictions: WitnessRestrictions;
  /** Whether no-contest clauses are enforceable */
  noContestClauseEnforceable: boolean;
  /** No-contest clause limitations */
  noContestLimitations: string | null;
  /** Default survival period (days) recognized by state */
  defaultSurvivalPeriod: number;
  /** Whether state has adopted RUFADAA for digital assets */
  rufadaaAdopted: boolean;
  /** Community property state */
  communityPropertyState: boolean;
}

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
  /** Link to state statutory form if exists */
  statutoryFormReference: string | null;
  /** Accepted condition definitions */
  conditionDefinitions: {
    terminalCondition: string;
    permanentUnconsciousness: string;
    endStageCondition: string;
  };
}

/**
 * Trust-specific requirements
 */
export interface EnhancedTrustRequirements extends TrustRequirements {
  /** Whether certificate of trust is recognized */
  certificateOfTrustRecognized: boolean;
  /** Pour-over will requirements */
  pourOverWillRequirements: string | null;
  /** State trust code reference */
  trustCodeReference: string | null;
}

/**
 * Financial POA specific requirements
 */
export interface EnhancedFinancialPOARequirements extends FinancialPOARequirements {
  /** Whether state has adopted UPOAA */
  upoaaAdopted: boolean;
  /** Witness restrictions */
  witnessRestrictions: WitnessRestrictions;
  /** Whether agent acceptance acknowledgment is recommended */
  agentAcceptanceRecommended: boolean;
  /** Third-party reliance provisions */
  thirdPartyRelianceStatutory: boolean;
  /** Specific powers that require explicit grant */
  explicitGrantRequired: string[];
}
```

### 2.2 Document Coordination Types

Add to support document relationship tracking:

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

export const DOCUMENT_COORDINATION: Record<DocumentType, DocumentCoordination> = {
  will: {
    recommendedCompanions: ['financial_poa', 'healthcare_poa', 'advance_directive'],
    requiredReferences: [],
    standaloneWarning: null,
  },
  revocable_trust: {
    recommendedCompanions: ['pour_over_will', 'financial_poa', 'healthcare_poa'],
    requiredReferences: ['pour_over_will'],
    standaloneWarning: 'A trust without a pour-over will may leave assets outside the trust subject to probate.',
  },
  pour_over_will: {
    recommendedCompanions: [],
    requiredReferences: ['revocable_trust'],
    standaloneWarning: 'A pour-over will requires an existing trust to pour assets into.',
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

---

## 3. Will Template Remediation

### 3.1 Missing Articles to Add

The following articles are **REQUIRED** additions to the will template:

#### Article: Payment of Debts, Expenses, and Taxes

**Purpose:** Directs how debts and taxes are paid; prevents apportionment disputes.

**Implementation:** Add wizard step for tax payment preferences, then generate:

```typescript
// Wizard field to add
{
  id: "taxPaymentSource",
  label: "How should estate taxes be paid?",
  type: "select",
  required: true,
  options: [
    { value: "residuary", label: "From the residuary estate (most common)" },
    { value: "apportioned", label: "Apportioned among beneficiaries" },
    { value: "specific_asset", label: "From a specific asset or account" },
  ],
  helpText: "This determines which assets are used to pay taxes and administrative costs"
}
```

**Template language:**

```
ARTICLE ___: PAYMENT OF DEBTS, EXPENSES, AND TAXES

I direct my Executor to pay from my residuary estate all my legally enforceable 
debts, funeral expenses, costs of administration, and all estate, inheritance, 
and succession taxes (including any interest and penalties thereon) that may be 
assessed against my estate or any beneficiary thereof by reason of my death. 
My Executor shall have sole discretion to determine which debts are legally 
enforceable. It is my intention that all such taxes be paid from my residuary 
estate as an expense of administration, without apportionment or reimbursement 
from any beneficiary.
```

#### Article: Simultaneous Death and Survival Requirement

**Purpose:** Prevents assets from passing through multiple estates in common disaster; establishes clear order of death.

**Implementation:** Add wizard step:

```typescript
{
  id: "survivalPeriod",
  label: "Survival Period Requirement",
  type: "select",
  required: true,
  options: [
    { value: "30", label: "30 days (recommended)" },
    { value: "45", label: "45 days" },
    { value: "60", label: "60 days" },
    { value: "90", label: "90 days" },
    { value: "0", label: "No survival period (not recommended)" },
  ],
  helpText: "Beneficiaries must survive you by this period to inherit. This prevents assets from passing through multiple estates if you die close together."
}
```

**Template language:**

```
ARTICLE ___: SIMULTANEOUS DEATH AND SURVIVAL REQUIREMENT

If any beneficiary under this Will and I die under circumstances where it 
cannot be established by clear and convincing evidence who died first, or if 
any beneficiary dies within [SURVIVAL_PERIOD] days after my death, that 
beneficiary shall be deemed to have predeceased me for all purposes of this 
Will. This provision shall apply to all beneficiaries including my spouse, 
regardless of any presumption of survivorship under applicable law.
```

#### Article: No-Contest Clause

**Purpose:** Deters will challenges by disinheriting challengers.

**Implementation:** Add wizard step (conditional on state enforceability):

```typescript
{
  id: "includeNoContestClause",
  label: "Include No-Contest Clause",
  type: "checkbox",
  required: false,
  conditionalDisplay: (state: string) => {
    const requirements = STATE_LEGAL_REQUIREMENTS[state].will;
    return requirements.noContestClauseEnforceable;
  },
  helpText: "Disinherits any beneficiary who contests your will. Not enforceable in all states.",
  warningText: (state: string) => {
    const requirements = STATE_LEGAL_REQUIREMENTS[state].will;
    return requirements.noContestLimitations;
  }
}
```

**Template language:**

```
ARTICLE ___: NO-CONTEST PROVISION

If any beneficiary under this Will, directly or indirectly, contests or attacks 
this Will or any of its provisions, or conspires with or assists anyone in any 
such contest, or pursues any action that would have the effect of voiding, 
nullifying, or setting aside any of the provisions of this Will, then any share 
or interest in my estate given to that contesting beneficiary under this Will 
is revoked and shall be disposed of as if that contesting beneficiary had 
predeceased me without leaving any surviving descendants. This provision shall 
be enforced to the fullest extent permitted by law.
```

#### Article: Executor Powers

**Purpose:** Grants fiduciary authority without requiring court approval for routine actions.

**Implementation:** Include by default with option to customize:

```typescript
{
  id: "executorPowers",
  label: "Executor Powers",
  type: "multiselect",
  required: true,
  defaultValue: ["all"],
  options: [
    { value: "all", label: "All standard powers (recommended)" },
    { value: "real_property", label: "Sell, lease, or mortgage real estate" },
    { value: "investments", label: "Manage and change investments" },
    { value: "business", label: "Continue or sell business interests" },
    { value: "borrow", label: "Borrow money on behalf of estate" },
    { value: "settle_claims", label: "Settle or compromise claims" },
    { value: "digital_assets", label: "Access and manage digital assets" },
    { value: "distribute_in_kind", label: "Make distributions in kind" },
  ],
  helpText: "Without explicit powers, your executor may need court approval for routine actions"
},
{
  id: "executorBondWaiver",
  label: "Waive executor bond requirement",
  type: "checkbox",
  required: false,
  defaultValue: true,
  helpText: "Saves your estate money by not requiring executor to post a surety bond"
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
    { value: "specific", label: "Specific amount or percentage" },
  ]
}
```

**Template language (full powers version):**

```
ARTICLE ___: EXECUTOR POWERS AND DUTIES

I grant to my Executor, without the necessity of court approval, bond, or 
surety, the following powers to be exercised in the Executor's sole discretion:

(a) To retain any property received from my estate for such time as my Executor 
    deems advisable;
(b) To sell, lease, exchange, or otherwise dispose of any property, real or 
    personal, at public or private sale, with or without notice, upon such 
    terms and conditions as my Executor deems proper;
(c) To invest and reinvest estate funds in any form of property, including 
    securities, real estate, or other investments my Executor deems advisable;
(d) To borrow money for any estate purpose and to pledge or mortgage estate 
    property as security;
(e) To compromise, settle, or abandon any claims by or against my estate;
(f) To employ attorneys, accountants, investment advisors, and other 
    professionals;
(g) To make distributions in cash or in kind, or partly in each, at values 
    determined by my Executor;
(h) To continue or participate in any business interest I may own;
(i) To exercise all rights with respect to digital assets as permitted by 
    applicable law, including the Revised Uniform Fiduciary Access to Digital 
    Assets Act if adopted in my state of residence;
(j) To perform all other acts necessary or appropriate for the proper 
    administration of my estate.

I expressly waive the requirement for any bond or surety for my Executor and 
any alternate Executor.

EXECUTOR COMPENSATION: [COMPENSATION_SELECTION]
```

#### Article: Residuary Clause with Contingencies

**Purpose:** Catches all assets not specifically bequeathed; prevents partial intestacy.

**Implementation:** Enhanced wizard flow:

```typescript
// Step 1: Primary residuary beneficiary
{
  id: "residuaryBeneficiary",
  label: "Primary Residuary Beneficiary",
  type: "beneficiary_selector", // Custom component
  required: true,
  helpText: "Who receives everything not specifically given to someone else?"
},
// Step 2: If primary doesn't survive
{
  id: "residuaryContingent1",
  label: "If primary beneficiary doesn't survive you",
  type: "select",
  required: true,
  options: [
    { value: "descendants_per_stirpes", label: "Their descendants, per stirpes" },
    { value: "specific_person", label: "A specific person" },
    { value: "charity", label: "A charity or organization" },
    { value: "other_beneficiaries", label: "Divided among other beneficiaries" },
  ]
},
// Step 3: Final contingency
{
  id: "ultimateContingent",
  label: "Final Contingent Beneficiary",
  type: "text",
  required: true,
  helpText: "Who receives your estate if all other beneficiaries predecease you? (Often a charity)"
}
```

**Template language:**

```
ARTICLE ___: RESIDUARY ESTATE

I give, devise, and bequeath all the rest, residue, and remainder of my estate, 
both real and personal, of whatever kind and wherever situated, which I may own 
or be entitled to at the time of my death (hereinafter referred to as my 
"Residuary Estate") as follows:

(a) If my [RELATIONSHIP] [PRIMARY_BENEFICIARY_NAME] survives me, I give my 
    entire Residuary Estate to [him/her/them].

(b) If my [RELATIONSHIP] [PRIMARY_BENEFICIARY_NAME] does not survive me, I give 
    my Residuary Estate to [CONTINGENT_DISPOSITION].

(c) If none of the beneficiaries named in paragraphs (a) and (b) above survive 
    me, I give my Residuary Estate to [ULTIMATE_CONTINGENT_NAME], if 
    [he/she/they] survive[s] me, or if [ULTIMATE_CONTINGENT_NAME] is an 
    organization, if it is then in existence.

(d) If none of the beneficiaries or organizations named above survive me or are 
    in existence at the time of my death, my Residuary Estate shall be 
    distributed to my heirs at law as determined under the laws of the State 
    of [STATE] in effect at the time of my death.
```

#### Article: Definitions

**Purpose:** Provides legal clarity for commonly misunderstood terms.

**Template language (include by default):**

```
ARTICLE ___: DEFINITIONS

For purposes of this Will, the following definitions apply:

(a) "Descendants" or "Issue" means children, grandchildren, and more remote 
    descendants in any degree, whether by blood or by legal adoption.

(b) "Per stirpes" means that if any beneficiary predeceases me but leaves 
    descendants who survive me, such deceased beneficiary's share shall pass 
    to such surviving descendants by right of representation. For example, if 
    I leave my estate to my two children equally and one predeceases me leaving 
    two grandchildren, those two grandchildren would split their parent's half.

(c) "Survive" or "Surviving" means living at the time of my death and for 
    [SURVIVAL_PERIOD] days thereafter.

(d) "Digital Assets" means files, data, accounts, and content stored on digital 
    devices or online platforms, including but not limited to email accounts, 
    social media accounts, online financial accounts, digital photographs, 
    cryptocurrency, and any rights to access such digital content.

(e) "Personal Property" means all tangible items other than real estate, 
    including vehicles, furniture, jewelry, artwork, collections, and 
    household items.

(f) "Real Property" means land and anything permanently attached to land, 
    including houses, buildings, and fixtures.
```

#### Article: Severability

**Purpose:** Protects valid provisions if one is invalidated.

**Template language (include by default):**

```
ARTICLE ___: SEVERABILITY

If any provision of this Will is held to be invalid, illegal, or unenforceable 
by a court of competent jurisdiction, the validity, legality, and 
enforceability of the remaining provisions shall not be affected or impaired 
thereby, and shall continue in full force and effect.
```

### 3.2 Enhanced Declaration Clause

**Current (inadequate):**
```
I, [NAME], of [ADDRESS], being of sound mind and memory, do hereby declare 
this to be my Last Will and Testament, revoking all previous wills and codicils.
```

**Required replacement:**
```
LAST WILL AND TESTAMENT OF [FULL_LEGAL_NAME]

I, [FULL_LEGAL_NAME], a resident of [CITY], [COUNTY] County, State of [STATE], 
being of the age of majority in this state, of sound mind and memory, and not 
acting under duress, menace, fraud, or the undue influence of any person, do 
hereby make, publish, and declare this instrument to be my Last Will and 
Testament, hereby expressly revoking all wills and codicils heretofore made 
by me.
```

**Wizard fields to add:**
```typescript
{
  id: "county",
  label: "County of Residence",
  type: "text",
  required: true,
  helpText: "Your current county of residence"
}
```

### 3.3 Enhanced Witness Attestation Clause

**Current (inadequate):** Generic attestation without required elements.

**Required replacement:**

```
ATTESTATION OF WITNESSES

On the date written below, [TESTATOR_NAME], known to us or proved to us on the 
basis of satisfactory evidence to be the person whose name is signed on the 
foregoing instrument, declared to us that the foregoing instrument, consisting 
of [PAGE_COUNT] pages including this page, was [his/her/their] Last Will and 
Testament, and requested us to act as witnesses to the same.

[TESTATOR_NAME] signed this Will in our presence, all of us being present at 
the same time. We observed the signing of this Will by [TESTATOR_NAME] and by 
each other. We believe [TESTATOR_NAME] to be of sound mind and memory, over the 
age of [MINIMUM_AGE], and under no constraint or undue influence.

Each of us is now over [WITNESS_MINIMUM_AGE] years of age, is a competent 
witness, and resides at the address set forth below. [BENEFICIARY_WITNESS_STATEMENT]

We declare under penalty of perjury under the laws of the State of [STATE] that 
the foregoing is true and correct.

Executed on this _____ day of _______________, 20___, at [CITY], [STATE].

_________________________________    _________________________________
Witness 1 Signature                   Witness 2 Signature

_________________________________    _________________________________
Printed Name                          Printed Name

_________________________________    _________________________________
Address                               Address

_________________________________    _________________________________
City, State, ZIP                      City, State, ZIP
```

**Dynamic content based on state:**
```typescript
// BENEFICIARY_WITNESS_STATEMENT varies by state
const getBeneficiaryWitnessStatement = (state: USState): string => {
  const restrictions = STATE_LEGAL_REQUIREMENTS[state].will.witnessRestrictions;
  
  if (!restrictions.beneficiaryCanWitness) {
    return "Neither of us is named as a beneficiary in this Will.";
  } else if (restrictions.beneficiaryWitnessConsequence === 'void_bequest') {
    return "We understand that if we are named as beneficiaries, our bequests may be void.";
  }
  return "";
};
```

### 3.4 Enhanced Self-Proving Affidavit

**Current (inadequate):** Too brief, lacks state-specific compliance.

**Required replacement:**

```
SELF-PROVING AFFIDAVIT

STATE OF [STATE]           )
                           ) ss.
COUNTY OF ________________ )

We, [TESTATOR_NAME], the Testator, and _________________ and _________________, 
the witnesses, whose names are signed to the foregoing instrument, being first 
duly sworn, do hereby declare to the undersigned authority that:

1. The Testator declared to the witnesses that the foregoing instrument is the 
   Testator's Last Will and Testament;
2. The Testator signed the Will as a free and voluntary act for the purposes 
   therein expressed;
3. Each of the witnesses, at the request of the Testator, in the presence and 
   hearing of the Testator and in the presence of each other, signed the Will 
   as witnesses;
4. At the time of the execution of the Will, to the best knowledge of each 
   witness:
   (a) The Testator was at least [MINIMUM_AGE] years of age;
   (b) The Testator was of sound mind and memory;
   (c) The Testator was under no constraint or undue influence.

_________________________________
[TESTATOR_NAME], Testator

_________________________________
Witness 1

_________________________________
Witness 2

Subscribed, sworn to and acknowledged before me by [TESTATOR_NAME], the 
Testator, and subscribed and sworn to before me by _________________ and 
_________________, witnesses, this _____ day of _________________, 20___.

_________________________________
Notary Public
My Commission Expires: _______________
[NOTARY SEAL]
```

---

## 4. Trust Template Creation

### 4.1 Critical Issue

**The trust template does not exist.** Current code falls through to Will template:

```typescript
// CURRENT BROKEN CODE (legal-document-pdf.tsx)
case "trust":
  // Falls through to will template - THIS IS WRONG
```

### 4.2 Required Trust Document Structure

Create new file: `src/lib/document-templates/trust-template.ts`

```typescript
export interface TrustTemplateData {
  // Grantor Information
  grantorFullName: string;
  grantorAddress: string;
  grantorCity: string;
  grantorState: string;
  grantorZip: string;
  
  // Trust Identification
  trustName: string;
  trustDate: Date;
  
  // Trustee Information
  initialTrusteeName: string;
  initialTrusteeAddress: string;
  initialTrusteeRelationship: string;
  successorTrustees: Array<{
    name: string;
    address: string;
    relationship: string;
    order: number;
  }>;
  
  // Incapacity Provisions
  incapacityDetermination: 'two_physicians' | 'one_physician' | 'court_only';
  incapacityPhysicianCount: number;
  
  // Beneficiary Information
  primaryBeneficiary: BeneficiaryInfo;
  contingentBeneficiaries: BeneficiaryInfo[];
  survivalPeriod: number;
  
  // Distribution Instructions
  distributionType: 'outright' | 'staggered' | 'discretionary' | 'special_needs';
  staggeredDistributions?: Array<{
    age: number;
    percentage: number;
  }>;
  
  // Trust Provisions
  includeSpendthriftClause: boolean;
  includeTrustProtector: boolean;
  trustProtectorName?: string;
  trustProtectorPowers?: string[];
  
  // Administrative Provisions
  trusteeCompensation: 'reasonable' | 'statutory' | 'specific' | 'none';
  specificCompensation?: string;
  bondWaiver: boolean;
  accountingRequirements: 'annual' | 'on_request' | 'none';
  accountingRecipients?: string[];
  
  // State-Specific
  state: USState;
  governingLaw: string;
}
```

### 4.3 Required Trust Articles

The trust template **MUST** include these articles:

1. **Article I: Trust Property** - Initial and additional contributions
2. **Article II: Lifetime Provisions During Capacity** - Grantor's reserved powers
3. **Article III: Provisions During Incapacity** - How incapacity is determined and what happens
4. **Article IV: Distribution Upon Death** - Specific and residuary distributions
5. **Article V: Trustee Provisions** - Powers, succession, compensation, bond waiver
6. **Article VI: Spendthrift Provisions** - Creditor protection
7. **Article VII: Administrative Provisions** - Governing law, severability, headings
8. **Article VIII: Amendment and Revocation** - How to change or terminate trust
9. **Schedule A: Trust Property** - Listing of assets transferred to trust

### 4.4 Trust Wizard Steps

Create wizard configuration:

```typescript
export const TRUST_WIZARD_STEPS: WizardStep[] = [
  // Step 1: Trust Basics
  {
    id: "trust_basics",
    title: "Trust Basics",
    fields: [
      {
        id: "trustName",
        label: "Trust Name",
        type: "text",
        required: true,
        defaultValue: (data) => `The ${data.grantorFullName} Revocable Living Trust`,
        helpText: "Usually your name followed by 'Revocable Living Trust'"
      },
      {
        id: "grantorIsInitialTrustee",
        label: "Will you serve as your own initial trustee?",
        type: "radio",
        required: true,
        options: [
          { value: "yes", label: "Yes, I will manage my own trust (most common)" },
          { value: "no", label: "No, someone else will manage it from the start" },
        ],
        helpText: "Most people serve as their own trustee until incapacity or death"
      }
    ]
  },
  
  // Step 2: Successor Trustees
  {
    id: "successor_trustees",
    title: "Successor Trustees",
    fields: [
      {
        id: "successorTrustees",
        label: "Successor Trustees",
        type: "trustee_list", // Custom component for ordered list
        required: true,
        minItems: 1,
        maxItems: 3,
        helpText: "Who will manage the trust if you can't? List in order of preference."
      },
      {
        id: "coTrusteesAllowed",
        label: "Allow co-trustees to serve together?",
        type: "checkbox",
        helpText: "If checked, multiple trustees can serve simultaneously"
      }
    ]
  },
  
  // Step 3: Incapacity Provisions
  {
    id: "incapacity",
    title: "Incapacity Provisions",
    description: "A major benefit of a living trust is avoiding conservatorship if you become incapacitated.",
    fields: [
      {
        id: "incapacityDetermination",
        label: "How should incapacity be determined?",
        type: "select",
        required: true,
        options: [
          { 
            value: "two_physicians", 
            label: "Two physicians must certify (recommended)" 
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
        helpText: "Two physicians provides protection against premature transfer of control"
      },
      {
        id: "incapacityStandard",
        label: "What standard should physicians use?",
        type: "textarea",
        required: true,
        defaultValue: "Unable to manage financial affairs due to mental or physical incapacity",
        helpText: "The medical standard for determining you cannot manage your affairs"
      }
    ]
  },
  
  // Step 4: Distribution Plan
  {
    id: "distribution",
    title: "Distribution Upon Your Death",
    fields: [
      {
        id: "distributionType",
        label: "How should assets be distributed?",
        type: "select",
        required: true,
        options: [
          { value: "outright", label: "Outright to beneficiaries immediately" },
          { value: "staggered", label: "Staggered distributions at certain ages" },
          { value: "discretionary", label: "Trustee discretion (for ongoing management)" },
          { value: "special_needs", label: "Special needs trust provisions" },
        ]
      },
      // Conditional fields based on distribution type
      {
        id: "staggeredAges",
        label: "Distribution schedule",
        type: "distribution_schedule", // Custom component
        conditional: { field: "distributionType", value: "staggered" },
        helpText: "e.g., 1/3 at 25, 1/3 at 30, remainder at 35"
      }
    ]
  },
  
  // Step 5: Trust Protections
  {
    id: "protections",
    title: "Trust Protections",
    fields: [
      {
        id: "includeSpendthriftClause",
        label: "Include spendthrift protection",
        type: "checkbox",
        defaultValue: true,
        helpText: "Protects beneficiaries' inheritance from their creditors"
      },
      {
        id: "includeTrustProtector",
        label: "Include trust protector provisions",
        type: "checkbox",
        defaultValue: false,
        helpText: "Allows a third party to modify administrative provisions after your death"
      }
    ]
  },
  
  // Step 6: Administrative Provisions
  {
    id: "administrative",
    title: "Administrative Provisions",
    fields: [
      {
        id: "trusteeCompensation",
        label: "Trustee Compensation",
        type: "select",
        required: true,
        options: [
          { value: "reasonable", label: "Reasonable compensation" },
          { value: "statutory", label: "Statutory rate (if available)" },
          { value: "specific", label: "Specific amount" },
          { value: "none", label: "No compensation" },
        ]
      },
      {
        id: "bondWaiver",
        label: "Waive bond requirement for trustees",
        type: "checkbox",
        defaultValue: true,
        helpText: "Saves trust money by not requiring trustees to post bond"
      },
      {
        id: "accountingRequirements",
        label: "Trustee accounting requirements",
        type: "select",
        options: [
          { value: "annual", label: "Annual accountings to beneficiaries" },
          { value: "on_request", label: "Upon reasonable request only" },
          { value: "none", label: "No formal accounting required" },
        ]
      }
    ]
  }
];
```

---

## 5. Pour-Over Will Template Creation

### 5.1 Critical Issue

Pour-over will template does not exist. This is a distinct document type with specific requirements.

### 5.2 Pour-Over Will Template Data

```typescript
export interface PourOverWillTemplateData {
  // Testator Information
  testatorFullName: string;
  testatorCity: string;
  testatorCounty: string;
  testatorState: string;
  
  // Trust Reference (REQUIRED)
  trustName: string;
  trustDate: Date;
  trustAmendmentAcknowledgment: boolean; // Confirms trust may be amended
  
  // Executor Information
  executorName: string;
  executorAddress: string;
  executorRelationship: string;
  alternateExecutorName: string;
  alternateExecutorAddress: string;
  
  // Guardian (if applicable)
  hasMinorChildren: boolean;
  guardianName?: string;
  guardianAddress?: string;
  alternateGuardianName?: string;
  alternateGuardianAddress?: string;
  
  // Administrative
  bondWaiver: boolean;
  
  // State-specific
  state: USState;
  witnessCount: number;
  notaryRequired: boolean;
}
```

### 5.3 Pour-Over Will Critical Language

**Key distinguishing clause:**

```
ARTICLE II: POUR-OVER PROVISION

I give, devise, and bequeath all the rest, residue, and remainder of my estate, 
both real and personal, of whatever kind and wherever situated, which I may own 
or have the right to dispose of at the time of my death (including all failed 
or lapsed gifts, and including any property over which I have a power of 
appointment), to the then-acting Trustee or Trustees of the [TRUST_NAME] dated 
[TRUST_DATE] (the "Trust"), to be added to the trust estate and held, 
administered, and distributed in accordance with the provisions of the Trust 
AS IT EXISTS AT MY DEATH (including any amendments made prior to my death), 
and NOT as it exists at the date of this Will.

If for any reason this pour-over disposition fails or is invalid, I give such 
property to the persons who would have received it under the Trust as if the 
pour-over had been valid, and in the same shares and subject to the same 
conditions as provided in the Trust.
```

**Important:** The phrase "AS IT EXISTS AT MY DEATH" is legally significant—it allows trust amendments to be honored without updating the will.

### 5.4 Pour-Over Will Wizard Validation

```typescript
// Validation rule: Pour-over will requires existing trust
export const validatePourOverWill = (
  householdId: Id<"households">,
  documents: LegalDocument[]
): ValidationResult => {
  const existingTrust = documents.find(
    doc => doc.documentType === 'trust' && 
           doc.status !== 'draft'
  );
  
  if (!existingTrust) {
    return {
      valid: false,
      errors: [{
        field: 'trustReference',
        message: 'A pour-over will requires an existing revocable living trust. Please create your trust first.'
      }],
      warnings: []
    };
  }
  
  return { valid: true, errors: [], warnings: [] };
};
```

---

## 6. Financial POA Remediation

### 6.1 Required Enhancements

#### Enhanced Durability Language

**Current (inadequate):** Generic durability statement.

**Required:**
```
THIS IS A DURABLE POWER OF ATTORNEY. THIS POWER OF ATTORNEY SHALL NOT BE 
AFFECTED BY MY SUBSEQUENT DISABILITY OR INCAPACITY. This Power of Attorney 
shall remain in full force and effect unless and until revoked by me in 
writing, or until my death.

[For springing POA:]
This Power of Attorney shall become effective only upon a determination that 
I am incapacitated. Incapacity shall be determined as follows: 
[INCAPACITY_DETERMINATION_METHOD]
```

#### Missing Wizard Fields

```typescript
// Add these wizard steps
{
  id: "poaEffectiveDate",
  label: "When should this POA become effective?",
  type: "select",
  required: true,
  options: [
    { value: "immediate", label: "Immediately upon signing" },
    { value: "springing", label: "Only upon my incapacity (springing POA)" },
  ],
  helpText: "Immediate is more practical; springing requires proving incapacity before agent can act"
},
{
  id: "springIncapacityMethod",
  conditional: { field: "poaEffectiveDate", value: "springing" },
  label: "How should incapacity be determined?",
  type: "select",
  options: [
    { value: "two_physicians", label: "Two physicians certify in writing" },
    { value: "one_physician", label: "One physician certifies in writing" },
    { value: "court", label: "Court determination only" },
  ]
},
{
  id: "thirdPartyReliance",
  label: "Include third-party reliance protection",
  type: "checkbox",
  defaultValue: true,
  helpText: "Protects banks and others who rely on your agent's authority in good faith"
},
{
  id: "agentAcceptance",
  label: "Include agent acceptance acknowledgment",
  type: "checkbox",
  defaultValue: true,
  helpText: "Agent signs to acknowledge fiduciary duties"
}
```

#### Enumerated Powers Section

**Current problem:** Checkbox format insufficient for legal purposes.

**Required:** Full enumeration of each power category with explicit grant language.

```typescript
export const FINANCIAL_POA_POWERS = {
  banking: {
    id: "banking",
    label: "Banking and Financial Transactions",
    description: "Open, close, and manage accounts; sign checks; wire funds",
    templateText: `
(a) BANKING AND FINANCIAL TRANSACTIONS: To open, close, and manage bank 
accounts of all types; to make deposits and withdrawals; to sign checks, 
drafts, and other negotiable instruments; to access safe deposit boxes; to 
wire funds electronically; and to conduct all banking transactions in my name.`
  },
  realProperty: {
    id: "realProperty",
    label: "Real Property",
    description: "Buy, sell, lease, manage, mortgage real estate",
    templateText: `
(b) REAL PROPERTY: To buy, sell, lease, manage, improve, repair, mortgage, 
or otherwise deal with real estate of any kind, including my principal 
residence; to execute deeds, contracts, leases, and mortgages; to collect 
rents and evict tenants; to pay property taxes and insurance; and to take 
any other action necessary to manage my real property interests.`
  },
  investments: {
    id: "investments",
    label: "Investments",
    description: "Manage stocks, bonds, mutual funds, brokerage accounts",
    templateText: `
(c) INVESTMENTS: To buy, sell, exchange, and manage stocks, bonds, mutual 
funds, and other securities; to open and manage brokerage and investment 
accounts; to exercise stock options and voting rights; to receive dividends 
and interest; and to make investment decisions in my best interest.`
  },
  retirement: {
    id: "retirement",
    label: "Retirement Accounts",
    description: "Manage IRAs, 401(k)s, pensions; make contributions/withdrawals",
    templateText: `
(d) RETIREMENT ACCOUNTS: To manage IRAs, 401(k)s, pension plans, and other 
retirement accounts; to make contributions and withdrawals as permitted by 
law and plan documents; to roll over or transfer accounts; to change 
beneficiary designations to the extent permitted by applicable law; and to 
make elections regarding distributions.`
  },
  insurance: {
    id: "insurance",
    label: "Insurance",
    description: "Purchase, maintain, modify, or cash in policies",
    templateText: `
(e) INSURANCE: To purchase, maintain, modify, cancel, or surrender insurance 
policies of all types including life, health, disability, property, and 
liability insurance; to change beneficiary designations; to file claims and 
receive proceeds; and to exercise any policy options.`
  },
  taxes: {
    id: "taxes",
    label: "Taxes",
    description: "Prepare and file returns; represent before tax authorities",
    templateText: `
(f) TAXES: To prepare, sign, and file federal, state, and local tax returns 
of all types; to represent me before tax authorities including the IRS; to 
pay taxes, penalties, and interest; to receive refunds; to make tax elections; 
to sign tax documents; and to retain tax professionals.`
  },
  benefits: {
    id: "benefits",
    label: "Government Benefits",
    description: "Apply for and manage Social Security, Medicare, VA benefits",
    templateText: `
(g) GOVERNMENT BENEFITS: To apply for and manage Social Security benefits, 
Medicare, Medicaid, veterans benefits, and other government programs; to 
complete applications and appeals; and to receive and manage benefit payments.`
  },
  business: {
    id: "business",
    label: "Business Operations",
    description: "Conduct business affairs; form/dissolve entities; sign contracts",
    templateText: `
(h) BUSINESS OPERATIONS: To conduct business affairs in my name; to form, 
operate, sell, or dissolve business entities; to sign contracts and agreements; 
to hire and fire employees; to make business decisions; and to take any 
action I could take personally in connection with any business interest.`
  },
  legal: {
    id: "legal",
    label: "Legal Matters",
    description: "Engage attorneys; commence/defend legal proceedings",
    templateText: `
(i) LEGAL MATTERS: To engage attorneys and other legal professionals; to 
commence, prosecute, settle, or defend legal proceedings on my behalf; to 
sign legal documents including contracts, releases, and settlements; to 
submit disputes to arbitration; and to take any legal action in my name.`
  },
  digital: {
    id: "digital",
    label: "Digital Assets",
    description: "Access and manage online accounts, digital files, cryptocurrency",
    templateText: `
(j) DIGITAL ASSETS: Pursuant to applicable state law including [STATE]'s 
adoption of the Revised Uniform Fiduciary Access to Digital Assets Act (if 
applicable), to access, manage, and control my digital assets and electronic 
communications, including email accounts, social media accounts, online 
financial accounts, digital files, cryptocurrency, and any other digital 
property; to access devices and accounts using my passwords and credentials.`
  },
  gifts: {
    id: "gifts",
    label: "Gifting Authority",
    description: "Make gifts (requires explicit grant; has tax implications)",
    requiresExplicitGrant: true,
    warningText: "Gifting authority can have significant tax implications and potential for abuse. Consider carefully.",
    templateText: `
(k) GIFTS: To make gifts of my property to such persons and in such amounts 
as my Agent deems appropriate, provided that such gifts: (i) are consistent 
with my established pattern of giving, OR (ii) do not exceed the federal 
annual gift tax exclusion amount per recipient per year. This authority is 
granted to enable estate planning and does not authorize gifts to my Agent 
unless such gifts are consistent with my established pattern.`
  },
  estatePlanning: {
    id: "estatePlanning",
    label: "Estate Planning",
    description: "Create/amend trusts; change beneficiaries (requires explicit grant)",
    requiresExplicitGrant: true,
    warningText: "This grants significant power to modify your estate plan. Consider carefully.",
    templateText: `
(l) ESTATE PLANNING: To create, amend, or revoke revocable trusts on my 
behalf; to fund trusts; to change beneficiary designations on accounts, 
policies, and retirement plans; provided that any such action shall be 
consistent with my expressed wishes if known, or if not known, shall be 
in my best interest considering my overall estate plan.`
  }
};
```

#### Agent Acceptance Form

**Add to template:**
```
AGENT ACCEPTANCE (Optional but Recommended)

I, [AGENT_NAME], have read the foregoing Durable Power of Attorney and accept 
appointment as Agent. I acknowledge that:

1. I am a fiduciary and must act in the Principal's best interest;
2. I must act in good faith and only within the scope of authority granted;
3. I must keep the Principal's property separate from my own unless otherwise 
   provided;
4. I must keep records of all transactions;
5. I may be liable for any losses caused by breach of my fiduciary duties.

I agree to act in accordance with the Principal's reasonable expectations to 
the extent actually known by me, otherwise in the Principal's best interest.

_________________________________    Date: _______________
Agent Signature

_________________________________
Printed Name
```

---

## 7. Healthcare POA Remediation

### 7.1 HIPAA Authorization Enhancement

**Current problem:** Generic HIPAA language may not meet regulatory requirements.

**Required replacement:**

```typescript
export const HIPAA_AUTHORIZATION_TEMPLATE = `
HIPAA AUTHORIZATION FOR RELEASE OF PROTECTED HEALTH INFORMATION

Pursuant to the Health Insurance Portability and Accountability Act of 1996 
("HIPAA"), 45 C.F.R. Parts 160 and 164, I hereby authorize and direct any 
healthcare provider, health plan, healthcare clearinghouse, or other covered 
entity that has provided treatment or services to me, or that has paid for or 
is seeking payment for such services, to release and disclose any and all of 
my protected health information and medical records to my Healthcare Agent.

SCOPE OF AUTHORIZATION

This authorization applies to the following protected health information:

(a) Complete medical records from all healthcare providers, including but not 
    limited to: physicians, hospitals, clinics, laboratories, pharmacies, and 
    other healthcare facilities;
    
(b) Mental health records, including psychotherapy notes, to the extent 
    permitted by applicable law;
    
(c) Drug and alcohol treatment records, to the extent permitted by 42 C.F.R. 
    Part 2 [Note: Federal law may require separate consent];
    
(d) HIV/AIDS testing and treatment records;

(e) Genetic testing information;

(f) Records relating to sexually transmitted infections;

(g) Billing and payment information;

(h) Communications with healthcare providers.

PURPOSE OF AUTHORIZATION

The purpose of this authorization is to enable my Healthcare Agent to:
(1) Make informed healthcare decisions on my behalf;
(2) Monitor my health status and treatment;
(3) Communicate with my healthcare providers;
(4) Ensure continuity of my medical care.

EXPIRATION

This authorization shall remain in effect until: [SELECT ONE]
[ ] Revoked by me in writing
[ ] My death (and shall survive my death for purposes of organ donation and 
    disposition of remains)
[ ] The following date: _______________

RIGHT TO REVOKE

I understand that I may revoke this authorization at any time by notifying the 
healthcare provider in writing, except to the extent that action has been 
taken in reliance on this authorization.

RE-DISCLOSURE NOTICE

I understand that information disclosed pursuant to this authorization may be 
subject to re-disclosure by the recipient and may no longer be protected by 
federal privacy regulations.

REFUSAL TO SIGN

I understand that I am not required to sign this authorization as a condition 
of receiving treatment or payment for healthcare services.

_________________________________    Date: _______________
Principal Signature

_________________________________
Printed Name
`;
```

### 7.2 Missing Healthcare Authority Provisions

Add wizard fields:

```typescript
// Mental Health Treatment Authority
{
  id: "mentalHealthAuthority",
  label: "Mental Health Treatment Decisions",
  type: "select",
  required: true,
  options: [
    { 
      value: "full", 
      label: "Full authority including psychiatric hospitalization and medication" 
    },
    { 
      value: "limited", 
      label: "Medication only, no psychiatric hospitalization" 
    },
    { 
      value: "none", 
      label: "No mental health authority" 
    },
  ],
  helpText: "Some states require explicit authorization for mental health decisions",
  stateRequirementNote: (state: USState) => {
    const req = STATE_LEGAL_REQUIREMENTS[state].healthcare_poa;
    return req.mentalHealthAuthority === 'separate_required' 
      ? "Your state may require a separate mental health directive for some decisions."
      : null;
  }
},

// Nursing Home/Facility Admission
{
  id: "facilityAdmissionAuthority",
  label: "Long-Term Care Facility Decisions",
  type: "select",
  required: true,
  options: [
    { value: "full", label: "Authority to consent to nursing home or assisted living admission" },
    { value: "limited", label: "Authority for assisted living only, not nursing homes" },
    { value: "none", label: "No facility admission authority" },
  ],
  helpText: "Some states restrict or require court approval for nursing home admission"
},

// Experimental Treatment
{
  id: "experimentalTreatmentAuthority",
  label: "Experimental/Clinical Trial Treatment",
  type: "select",
  required: true,
  options: [
    { value: "yes", label: "May consent to experimental treatments and clinical trials" },
    { value: "no", label: "No experimental treatments" },
    { value: "agent_discretion", label: "Agent discretion based on circumstances" },
  ]
},

// Pain Management Specific Authority
{
  id: "painManagementAuthority",
  label: "Pain Management",
  type: "checkbox",
  defaultValue: true,
  label: "Authorize maximum pain relief even if it may hasten death",
  helpText: "Ensures comfort care is prioritized"
}
```

### 7.3 Healthcare POA Template Language Additions

```
MENTAL HEALTH TREATMENT AUTHORITY
[If mentalHealthAuthority === 'full']
I authorize my Healthcare Agent to make decisions regarding mental health 
treatment, including:
(a) Consent to voluntary admission to a psychiatric facility;
(b) Consent to psychotropic medications;
(c) Consent to electroconvulsive therapy (ECT);
(d) Consent to behavioral health treatment programs.

[If mentalHealthAuthority === 'limited']
I authorize my Healthcare Agent to consent to psychotropic medications and 
outpatient mental health treatment. I do NOT authorize my Agent to consent 
to voluntary psychiatric hospitalization on my behalf.

[If mentalHealthAuthority === 'none']
I do NOT authorize my Healthcare Agent to make decisions regarding mental 
health treatment. Such decisions shall be made only as provided by applicable 
law governing persons who lack capacity.

---

LONG-TERM CARE FACILITY AUTHORITY
[If facilityAdmissionAuthority === 'full']
I authorize my Healthcare Agent to consent to my admission to or transfer 
between long-term care facilities, including nursing homes, skilled nursing 
facilities, assisted living facilities, memory care facilities, and 
rehabilitation facilities.

---

PAIN MANAGEMENT
I authorize my Healthcare Agent to consent to the administration of 
pain-relieving medication in whatever dosage my Agent deems appropriate to 
keep me comfortable, EVEN IF SUCH MEDICATION MAY HASTEN MY DEATH. My comfort 
is a priority, and I do not want to suffer needlessly.
```

---

## 8. Advance Directive Remediation

### 8.1 Condition Definitions Enhancement

**Current problem:** Imprecise definitions that may not match state law.

**Required:** State-specific statutory definitions:

```typescript
export const CONDITION_DEFINITIONS: Record<USState, {
  terminalCondition: string;
  permanentUnconsciousness: string;
  endStageCondition: string;
}> = {
  CA: {
    terminalCondition: `"Terminal condition" means an incurable and irreversible 
condition that has been medically confirmed and will, within reasonable medical 
judgment, result in death within a relatively short time.`,
    permanentUnconsciousness: `"Permanent unconscious condition" means an 
irreversible condition, as determined by two physicians, in which thought, 
awareness of self and environment, and other indicators of consciousness are 
absent. This includes, but is not limited to, a persistent vegetative state 
or irreversible coma.`,
    endStageCondition: `"End-stage condition" means an irreversible condition 
caused by injury, disease, or illness that has resulted in severe and 
permanent deterioration indicated by incompetency and complete physical 
dependency for which treatment of the irreversible condition would be 
medically ineffective.`
  },
  TX: {
    terminalCondition: `"Terminal condition" means an incurable condition 
caused by injury, disease, or illness that according to reasonable medical 
judgment will produce death within six months, even with available 
life-sustaining treatment provided in accordance with the prevailing 
standard of medical care.`,
    // ... continue for all states
  },
  // ... all 51 jurisdictions
};
```

### 8.2 Treatment Decision Matrix

Replace single checkbox with granular decisions:

```typescript
export const TREATMENT_DECISIONS = [
  {
    id: "cpr",
    label: "Cardiopulmonary Resuscitation (CPR)",
    description: "Chest compressions and rescue breathing if your heart stops",
    options: [
      { value: "yes", label: "Attempt CPR" },
      { value: "no", label: "Do Not Resuscitate (DNR)" },
      { value: "agent", label: "Let my Healthcare Agent decide" },
    ],
    perCondition: true // Show separately for terminal/unconscious/end-stage
  },
  {
    id: "ventilation",
    label: "Mechanical Ventilation (Breathing Machine)",
    description: "Machine that breathes for you through a tube",
    options: [
      { value: "yes", label: "Use ventilator" },
      { value: "no", label: "No ventilator" },
      { value: "trial", label: "Time-limited trial only" },
      { value: "agent", label: "Let my Healthcare Agent decide" },
    ],
    trialDaysField: true // If trial selected, ask for duration
  },
  {
    id: "artificialNutrition",
    label: "Artificial Nutrition (Feeding Tube)",
    description: "Nutrition delivered through a tube in your stomach",
    options: [
      { value: "yes", label: "Use feeding tube" },
      { value: "no", label: "No feeding tube" },
      { value: "trial", label: "Time-limited trial only" },
      { value: "agent", label: "Let my Healthcare Agent decide" },
    ]
  },
  {
    id: "artificialHydration",
    label: "Artificial Hydration (IV Fluids)",
    description: "Fluids delivered through an IV when you cannot drink",
    options: [
      { value: "yes", label: "Use IV fluids" },
      { value: "no", label: "No IV fluids" },
      { value: "comfort", label: "Only for comfort/medication delivery" },
      { value: "agent", label: "Let my Healthcare Agent decide" },
    ]
  },
  {
    id: "dialysis",
    label: "Dialysis (Kidney Machine)",
    description: "Machine that filters your blood when kidneys fail",
    options: [
      { value: "yes", label: "Use dialysis" },
      { value: "no", label: "No dialysis" },
      { value: "continue", label: "Continue if already on dialysis" },
      { value: "agent", label: "Let my Healthcare Agent decide" },
    ]
  },
  {
    id: "transfusions",
    label: "Blood Transfusions",
    description: "Receiving donated blood products",
    options: [
      { value: "yes", label: "Accept transfusions" },
      { value: "no", label: "No transfusions" },
      { value: "agent", label: "Let my Healthcare Agent decide" },
    ]
  },
  {
    id: "antibiotics",
    label: "Antibiotics",
    description: "Medications to treat infections",
    options: [
      { value: "yes", label: "Use antibiotics" },
      { value: "comfort", label: "Only for comfort (not to extend life)" },
      { value: "no", label: "No antibiotics" },
      { value: "agent", label: "Let my Healthcare Agent decide" },
    ]
  }
];
```

### 8.3 Pregnancy Exception Provisions

**Required for states that mandate pregnancy language:**

```typescript
{
  id: "pregnancyException",
  label: "Pregnancy Exception",
  type: "select",
  required: true,
  conditionalDisplay: (state: USState) => {
    return STATE_LEGAL_REQUIREMENTS[state].advance_directive.pregnancyProvisions.pregnancyExceptionRequired;
  },
  options: [
    { 
      value: "suspended", 
      label: "Suspend this directive during pregnancy" 
    },
    { 
      value: "continues", 
      label: "This directive continues to apply during pregnancy" 
    },
  ],
  helpText: (state: USState) => {
    const provisions = STATE_LEGAL_REQUIREMENTS[state].advance_directive.pregnancyProvisions;
    return `Your state's default is: ${provisions.defaultBehavior}. ${provisions.statutoryLanguage || ''}`;
  },
  warningText: "This is a significant decision. Consider discussing with your healthcare agent and family."
}
```

**Template language:**

```
PREGNANCY PROVISION

[If pregnancyException === 'suspended']
If I am pregnant, this Advance Directive SHALL HAVE NO FORCE AND EFFECT during 
my pregnancy. My healthcare providers shall provide life-sustaining treatment 
to maintain my life for the benefit of my unborn child until delivery is 
possible.

[If pregnancyException === 'continues']
This Advance Directive SHALL REMAIN IN EFFECT even if I am pregnant. My wishes 
regarding life-sustaining treatment shall be followed regardless of my 
pregnancy status. I have made this decision after careful consideration.
```

### 8.4 Comfort Care Definition

**Always include (not optional):**

```
COMFORT CARE

Regardless of any other choices I have made in this Directive, I ALWAYS want 
the following comfort care:

• Pain medication in whatever dosage is needed to keep me comfortable, even 
  if it may hasten my death or affect my consciousness
  
• Measures to maintain my personal hygiene and bodily cleanliness

• Measures to keep my mouth and lips moist

• Reasonable measures to maintain my dignity and provide a peaceful environment

• Opportunity for family, loved ones, and spiritual advisors to be present

• [If specified: Religious or spiritual accommodations: _________________]

Comfort care is NOT optional and should be provided regardless of my treatment 
decisions above.
```

---

## 9. State Requirements Data Enhancement

### 9.1 Enhanced State Data Structure

Update `STATE_LEGAL_REQUIREMENTS` to use enhanced types for each state. Example for California:

```typescript
CA: {
  will: {
    witnessCount: 2,
    notaryRequired: false,
    notaryAlternative: false,
    selfProvingAllowed: true,
    minimumWitnessAge: 18,
    holographicAllowed: true,
    specialRequirements: "Witnesses cannot be beneficiaries (void bequest, not void will)",
    // NEW FIELDS
    witnessRestrictions: {
      beneficiaryCanWitness: true,
      beneficiaryWitnessConsequence: 'void_bequest',
      familyCanWitness: true,
      healthcareProviderCanWitness: true,
      facilityEmployeeCanWitness: true,
      additionalRestrictions: "Interested witness rule: if witness is beneficiary, bequest is presumptively void but can be rebutted"
    },
    noContestClauseEnforceable: true,
    noContestLimitations: "Not enforceable if probable cause for contest exists (CA Probate Code §21311)",
    defaultSurvivalPeriod: 120, // hours under CA's USDA
    rufadaaAdopted: true,
    communityPropertyState: true
  },
  healthcare_poa: {
    witnessCount: 2,
    notaryRequired: false,
    notaryAlternative: true,
    documentName: "Advance Health Care Directive",
    minimumWitnessAge: 18,
    specialRequirements: "One witness must be unrelated and not entitled to estate",
    // NEW FIELDS
    witnessRestrictions: {
      beneficiaryCanWitness: false,
      beneficiaryWitnessConsequence: null,
      familyCanWitness: true, // one can be, one cannot
      healthcareProviderCanWitness: false,
      facilityEmployeeCanWitness: false,
      additionalRestrictions: "At least one witness must not be: (1) related by blood, marriage, or adoption, (2) entitled to any portion of estate, (3) the agent, (4) healthcare provider or employee thereof"
    },
    hipaaIntegration: 'combined',
    mentalHealthAuthority: 'included',
    nursingHomeAuthority: 'included'
  },
  advance_directive: {
    witnessCount: 2,
    notaryRequired: false,
    notaryAlternative: true,
    documentName: "Advance Health Care Directive",
    minimumWitnessAge: 18,
    specialRequirements: null,
    // NEW FIELDS
    pregnancyProvisions: {
      pregnancyExceptionRequired: false,
      defaultBehavior: 'patient_choice',
      statutoryLanguage: null
    },
    witnessRestrictions: {
      beneficiaryCanWitness: false,
      beneficiaryWitnessConsequence: null,
      familyCanWitness: true,
      healthcareProviderCanWitness: false,
      facilityEmployeeCanWitness: false,
      additionalRestrictions: null
    },
    statutoryFormRequired: false,
    statutoryFormReference: "California Probate Code §§4700-4701",
    conditionDefinitions: {
      terminalCondition: "incurable and irreversible condition that will result in death within a relatively short time",
      permanentUnconsciousness: "irreversible condition with absence of thought and awareness of self and environment",
      endStageCondition: "irreversible condition with severe deterioration, incompetency, and complete physical dependency"
    }
  },
  // ... other document types
}
```

### 9.2 States Requiring Immediate Attention

The following states have unique requirements that must be specifically addressed:

| State | Unique Requirement | Implementation Note |
|-------|-------------------|---------------------|
| **Louisiana** | Notarial testament required | Different witness/notary structure |
| **Vermont** | No self-proving affidavit | Omit self-proving section |
| **DC** | Combined advance directive form | Statutory form should be offered |
| **Texas** | Specific pregnancy language required | Mandatory pregnancy exception section |
| **Florida** | Two witnesses + notary for POA | Enforce combined requirements |

---

## 10. UI Component Updates

### 10.1 Document Coordination Warnings

Update `legal-documents-section.tsx` to show relationship warnings:

```typescript
// Add to card rendering logic
const getDocumentWarnings = (docType: DocumentType, existingDocs: Map<string, LegalDocument>) => {
  const warnings: string[] = [];
  const coordination = DOCUMENT_COORDINATION[docType];
  
  // Check for required references
  for (const requiredDoc of coordination.requiredReferences) {
    if (!existingDocs.has(requiredDoc)) {
      warnings.push(
        `This document requires a ${DOCUMENT_TYPES[requiredDoc].name}. ` +
        `Please create that document first.`
      );
    }
  }
  
  // Check for standalone warnings
  if (coordination.standaloneWarning && 
      coordination.recommendedCompanions.some(c => !existingDocs.has(c))) {
    warnings.push(coordination.standaloneWarning);
  }
  
  return warnings;
};

// In the card component, add warning display
{documentWarnings.length > 0 && (
  <Alert variant="warning" className="mt-2">
    <AlertTriangle className="h-4 w-4" />
    <AlertDescription>
      {documentWarnings.map((warning, i) => (
        <p key={i} className="text-xs">{warning}</p>
      ))}
    </AlertDescription>
  </Alert>
)}
```

### 10.2 Document Type Indicators

Add visual indicators for document relationships:

```typescript
// Update DOCUMENT_TYPES to include relationship info
const DOCUMENT_TYPES: Record<DocumentType, DocumentTypeMeta> = {
  will: {
    name: "Last Will and Testament",
    description: "Specifies how your assets will be distributed and names guardians for minor children",
    icon: ScrollText,
    shortDescription: "Asset distribution & guardians",
    badge: null, // No special badge
  },
  trust: {
    name: "Revocable Living Trust",
    description: "Holds assets during your lifetime and distributes them after death, avoiding probate",
    icon: Shield,
    shortDescription: "Avoid probate & manage assets",
    badge: { text: "Needs Pour-Over Will", variant: "outline" },
  },
  pour_over_will: {
    name: "Pour-Over Will",
    description: "Companion to a trust that transfers any assets not in the trust at death",
    icon: FileText,
    shortDescription: "Trust companion document",
    badge: { text: "Requires Trust", variant: "secondary" },
    prerequisite: "trust",
  },
  // ... etc
};
```

### 10.3 Progress Indicator Enhancement

Show document completion status with more granularity:

```typescript
// Enhanced stats calculation
const calculateDocumentCompleteness = (doc: LegalDocument): number => {
  const responses = JSON.parse(doc.responses || '{}');
  const requiredFields = getRequiredFieldsForDocType(doc.documentType);
  const completedFields = requiredFields.filter(f => responses[f.id] !== undefined);
  return Math.round((completedFields.length / requiredFields.length) * 100);
};
```

---

## 11. Validation Logic Enhancements

### 11.1 New Validation Functions

Add to `state-legal-requirements.ts`:

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
    isBeneficiary: boolean;
    isRelated: boolean;
    isHealthcareProvider: boolean;
    isFacilityEmployee: boolean;
  }>
): DocumentValidation {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  const requirements = STATE_LEGAL_REQUIREMENTS[state][documentType];
  const restrictions = requirements.witnessRestrictions;
  
  // Check witness count
  if (witnesses.length < requirements.witnessCount) {
    errors.push(
      `${STATE_NAMES[state]} requires ${requirements.witnessCount} witnesses. ` +
      `You have provided ${witnesses.length}.`
    );
  }
  
  // Check each witness
  witnesses.forEach((witness, index) => {
    const witnessNum = index + 1;
    
    // Age check
    if (witness.age < requirements.minimumWitnessAge) {
      errors.push(
        `Witness ${witnessNum} (${witness.name}) must be at least ` +
        `${requirements.minimumWitnessAge} years old.`
      );
    }
    
    // Beneficiary check
    if (witness.isBeneficiary && !restrictions.beneficiaryCanWitness) {
      errors.push(
        `Witness ${witnessNum} (${witness.name}) cannot be a beneficiary ` +
        `under ${STATE_NAMES[state]} law.`
      );
    } else if (witness.isBeneficiary && restrictions.beneficiaryWitnessConsequence === 'void_bequest') {
      warnings.push(
        `Witness ${witnessNum} (${witness.name}) is a beneficiary. ` +
        `Their bequest may be void or reduced under ${STATE_NAMES[state]} law.`
      );
    }
    
    // Healthcare document specific checks
    if (['healthcare_poa', 'advance_directive'].includes(documentType)) {
      if (witness.isHealthcareProvider && !restrictions.healthcareProviderCanWitness) {
        errors.push(
          `Witness ${witnessNum} (${witness.name}) cannot be a healthcare provider ` +
          `for healthcare documents in ${STATE_NAMES[state]}.`
        );
      }
      if (witness.isFacilityEmployee && !restrictions.facilityEmployeeCanWitness) {
        errors.push(
          `Witness ${witnessNum} (${witness.name}) cannot be an employee of a ` +
          `healthcare facility in ${STATE_NAMES[state]}.`
        );
      }
    }
  });
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Validate document coordination
 */
export function validateDocumentCoordination(
  documentType: DocumentType,
  existingDocuments: DocumentType[]
): DocumentValidation {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  const coordination = DOCUMENT_COORDINATION[documentType];
  
  // Check required references
  for (const required of coordination.requiredReferences) {
    if (!existingDocuments.includes(required)) {
      errors.push(
        `A ${DOCUMENT_TYPES[documentType].name} requires a ` +
        `${DOCUMENT_TYPES[required].name} to reference. ` +
        `Please create that document first.`
      );
    }
  }
  
  // Check recommended companions (warnings only)
  for (const companion of coordination.recommendedCompanions) {
    if (!existingDocuments.includes(companion)) {
      warnings.push(
        `Consider also creating a ${DOCUMENT_TYPES[companion].name} ` +
        `to complement your ${DOCUMENT_TYPES[documentType].name}.`
      );
    }
  }
  
  if (coordination.standaloneWarning && 
      coordination.recommendedCompanions.some(c => !existingDocuments.includes(c))) {
    warnings.push(coordination.standaloneWarning);
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}
```

### 11.2 Field-Level Validation

```typescript
/**
 * Validate individual field responses
 */
export function validateFieldResponse(
  field: WizardField,
  value: unknown,
  state: USState,
  allResponses: Record<string, unknown>
): FieldValidation {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Required field check
  if (field.required && (value === undefined || value === null || value === '')) {
    errors.push(`${field.label} is required.`);
    return { isValid: false, errors, warnings };
  }
  
  // Type-specific validation
  switch (field.type) {
    case 'survival_period':
      const period = Number(value);
      if (period < 0 || period > 180) {
        errors.push('Survival period must be between 0 and 180 days.');
      }
      if (period === 0) {
        warnings.push(
          'A zero-day survival period may cause complications if you and a ' +
          'beneficiary die in a common accident.'
        );
      }
      break;
      
    case 'beneficiary_list':
      const beneficiaries = value as BeneficiaryInfo[];
      const totalPercentage = beneficiaries.reduce((sum, b) => sum + (b.percentage || 0), 0);
      if (totalPercentage !== 100) {
        errors.push(`Beneficiary percentages must total 100%. Currently: ${totalPercentage}%`);
      }
      break;
      
    case 'executor':
      const executor = value as ExecutorInfo;
      if (executor.isMinor) {
        errors.push('Executor must be of legal age. Consider naming this person as alternate.');
      }
      break;
      
    // ... additional field type validations
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}
```

---

## 12. Testing Requirements

### 12.1 Unit Tests

```typescript
describe('Legal Document Templates', () => {
  describe('Will Template', () => {
    it('should include all required articles', () => {
      const template = generateWillTemplate(sampleData);
      expect(template).toContain('PAYMENT OF DEBTS');
      expect(template).toContain('SIMULTANEOUS DEATH');
      expect(template).toContain('EXECUTOR POWERS');
      expect(template).toContain('RESIDUARY ESTATE');
      expect(template).toContain('DEFINITIONS');
      expect(template).toContain('SEVERABILITY');
    });
    
    it('should include no-contest clause when enabled and state allows', () => {
      const data = { ...sampleData, includeNoContestClause: true, state: 'CA' };
      const template = generateWillTemplate(data);
      expect(template).toContain('NO-CONTEST PROVISION');
    });
    
    it('should omit no-contest clause when state does not enforce', () => {
      const data = { ...sampleData, includeNoContestClause: true, state: 'FL' }; // FL has limitations
      const template = generateWillTemplate(data);
      expect(template).toContain('NO-CONTEST PROVISION');
      expect(template).toContain('probable cause'); // Should include limitation warning
    });
    
    it('should use correct survival period from wizard input', () => {
      const data = { ...sampleData, survivalPeriod: 60 };
      const template = generateWillTemplate(data);
      expect(template).toContain('sixty (60) days');
    });
  });
  
  describe('Trust Template', () => {
    it('should generate complete trust document (not fall through to will)', () => {
      const template = generateTrustTemplate(sampleTrustData);
      expect(template).toContain('REVOCABLE LIVING TRUST AGREEMENT');
      expect(template).not.toContain('LAST WILL AND TESTAMENT');
    });
    
    it('should include all required trust articles', () => {
      const template = generateTrustTemplate(sampleTrustData);
      expect(template).toContain('TRUST PROPERTY');
      expect(template).toContain('LIFETIME PROVISIONS');
      expect(template).toContain('PROVISIONS DURING INCAPACITY');
      expect(template).toContain('DISTRIBUTION UPON');
      expect(template).toContain('TRUSTEE PROVISIONS');
      expect(template).toContain('SPENDTHRIFT');
      expect(template).toContain('AMENDMENT AND REVOCATION');
    });
  });
  
  describe('Pour-Over Will', () => {
    it('should include trust reference clause', () => {
      const template = generatePourOverWillTemplate(samplePourOverData);
      expect(template).toContain('AS IT EXISTS AT MY DEATH');
      expect(template).toContain(samplePourOverData.trustName);
    });
    
    it('should fail validation without existing trust', () => {
      const result = validateDocumentCoordination('pour_over_will', []);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(expect.stringContaining('requires'));
    });
  });
  
  describe('Healthcare POA', () => {
    it('should include compliant HIPAA authorization', () => {
      const template = generateHealthcarePOATemplate(sampleHealthcareData);
      expect(template).toContain('45 C.F.R.');
      expect(template).toContain('SCOPE OF AUTHORIZATION');
      expect(template).toContain('RIGHT TO REVOKE');
      expect(template).toContain('RE-DISCLOSURE NOTICE');
    });
    
    it('should include mental health authority based on selection', () => {
      const data = { ...sampleHealthcareData, mentalHealthAuthority: 'full' };
      const template = generateHealthcarePOATemplate(data);
      expect(template).toContain('psychiatric facility');
      expect(template).toContain('psychotropic medications');
    });
  });
  
  describe('Advance Directive', () => {
    it('should include state-specific condition definitions', () => {
      const data = { ...sampleDirectiveData, state: 'CA' };
      const template = generateAdvanceDirectiveTemplate(data);
      expect(template).toContain(CONDITION_DEFINITIONS['CA'].terminalCondition);
    });
    
    it('should include pregnancy provision when state requires', () => {
      const data = { ...sampleDirectiveData, state: 'TX' };
      const template = generateAdvanceDirectiveTemplate(data);
      expect(template).toContain('PREGNANCY');
    });
  });
  
  describe('Witness Validation', () => {
    it('should reject beneficiary witness in strict states', () => {
      const witnesses = [
        { name: 'John', age: 30, isBeneficiary: true, isRelated: false, isHealthcareProvider: false, isFacilityEmployee: false },
        { name: 'Jane', age: 30, isBeneficiary: false, isRelated: false, isHealthcareProvider: false, isFacilityEmployee: false }
      ];
      const result = validateWitnesses('NY', 'will', witnesses);
      // NY allows but may void bequest
      expect(result.warnings.length).toBeGreaterThan(0);
    });
    
    it('should reject healthcare provider witness for healthcare documents', () => {
      const witnesses = [
        { name: 'Dr. Smith', age: 45, isBeneficiary: false, isRelated: false, isHealthcareProvider: true, isFacilityEmployee: false },
        { name: 'Jane', age: 30, isBeneficiary: false, isRelated: false, isHealthcareProvider: false, isFacilityEmployee: false }
      ];
      const result = validateWitnesses('CA', 'healthcare_poa', witnesses);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(expect.stringContaining('healthcare provider'));
    });
  });
});
```

### 12.2 Integration Tests

```typescript
describe('Legal Document Wizard Integration', () => {
  it('should create complete will document through wizard flow', async () => {
    // Simulate complete wizard flow
    const wizard = new LegalDocumentWizard('will', 'CA');
    
    // Step through wizard
    await wizard.setResponse('fullName', 'John Smith');
    await wizard.setResponse('address', '123 Main St');
    // ... all required fields
    
    const result = await wizard.generate();
    expect(result.success).toBe(true);
    expect(result.document).toBeDefined();
    expect(result.document.pageCount).toBeGreaterThan(3);
  });
  
  it('should prevent pour-over will creation without trust', async () => {
    const result = await createDocument({
      householdId: testHouseholdId,
      documentType: 'pour_over_will',
      state: 'CA'
    });
    
    expect(result.success).toBe(false);
    expect(result.error).toContain('trust');
  });
  
  it('should show coordination warning when creating trust without pour-over', async () => {
    const result = await createDocument({
      householdId: testHouseholdId,
      documentType: 'trust',
      state: 'CA'
    });
    
    expect(result.warnings).toContain(expect.stringContaining('pour-over'));
  });
});
```

### 12.3 PDF Generation Tests

```typescript
describe('PDF Generation', () => {
  it('should generate valid PDF for each document type', async () => {
    const documentTypes: DocumentType[] = [
      'will', 'trust', 'pour_over_will', 
      'financial_poa', 'healthcare_poa', 'advance_directive'
    ];
    
    for (const docType of documentTypes) {
      const pdf = await generatePDF(docType, getSampleDataForType(docType));
      
      // Validate PDF structure
      expect(pdf.byteLength).toBeGreaterThan(1000);
      expect(pdf.slice(0, 5).toString()).toBe('%PDF-');
      
      // Validate page count
      const pageCount = await getPDFPageCount(pdf);
      expect(pageCount).toBeGreaterThan(0);
    }
  });
  
  it('should include page numbers on all pages', async () => {
    const pdf = await generatePDF('will', sampleWillData);
    const text = await extractPDFText(pdf);
    
    const pageCount = await getPDFPageCount(pdf);
    for (let i = 1; i <= pageCount; i++) {
      expect(text).toContain(`Page ${i} of ${pageCount}`);
    }
  });
});
```

---

## 13. Implementation Priority & Timeline

### Phase 1: Critical Fixes (Week 1-2)

| Task | Priority | Effort | Dependencies |
|------|----------|--------|--------------|
| Create Trust PDF generator | CRITICAL | 3 days | None |
| Create Pour-Over Will PDF generator | CRITICAL | 2 days | Trust generator |
| Add missing Will articles | CRITICAL | 2 days | None |
| Fix HIPAA authorization | HIGH | 1 day | None |

### Phase 2: Core Enhancements (Week 3-4)

| Task | Priority | Effort | Dependencies |
|------|----------|--------|--------------|
| Enhanced type definitions | HIGH | 1 day | None |
| Wizard field additions | HIGH | 3 days | Type definitions |
| Witness validation logic | HIGH | 2 days | Enhanced types |
| Document coordination warnings | MEDIUM | 1 day | None |

### Phase 3: Template Language (Week 5-6)

| Task | Priority | Effort | Dependencies |
|------|----------|--------|--------------|
| Financial POA powers enumeration | HIGH | 2 days | None |
| Advance directive treatment matrix | HIGH | 2 days | None |
| State-specific definitions | MEDIUM | 3 days | None |
| Pregnancy provisions | MEDIUM | 1 day | State definitions |

### Phase 4: Testing & Polish (Week 7-8)

| Task | Priority | Effort | Dependencies |
|------|----------|--------|--------------|
| Unit test suite | HIGH | 3 days | All generators |
| Integration tests | HIGH | 2 days | Unit tests |
| PDF validation tests | MEDIUM | 1 day | PDF generators |
| UI polish | LOW | 2 days | All above |

---

## 14. Acceptance Criteria

### 14.1 Will Template

- [ ] Declaration clause includes age of majority, sound mind, no undue influence language
- [ ] Contains all 7 required articles (debts, simultaneous death, no-contest, executor powers, residuary, definitions, severability)
- [ ] Witness attestation includes capacity declaration, mutual presence statement, penalty of perjury
- [ ] Self-proving affidavit has separate testator and witness sections
- [ ] State-specific elements conditionally included based on `state-legal-requirements.ts`

### 14.2 Trust Template

- [ ] Trust generator exists and is distinct from Will generator
- [ ] Contains all 9 required articles
- [ ] Incapacity provisions clearly define determination method
- [ ] Spendthrift clause included when enabled
- [ ] Amendment/revocation article specifies requirements
- [ ] Schedule A placeholder for trust property

### 14.3 Pour-Over Will Template

- [ ] Pour-over generator exists and is distinct
- [ ] Contains trust reference with exact name and date
- [ ] Includes "as it exists at my death" language
- [ ] Backup provision if pour-over fails
- [ ] Validation prevents creation without existing trust

### 14.4 Financial POA Template

- [ ] Durability clause explicitly states survives incapacity
- [ ] All power categories enumerated with explicit grant language
- [ ] RUFADAA reference for digital assets
- [ ] Agent acceptance form included
- [ ] Third-party reliance provision included
- [ ] Springing vs. immediate option implemented

### 14.5 Healthcare POA Template

- [ ] HIPAA authorization meets regulatory requirements (scope, purpose, revocation, re-disclosure)
- [ ] Mental health authority section with state-specific requirements
- [ ] Nursing home admission authority addressed
- [ ] Pain management authority explicitly granted
- [ ] Witness restrictions enforced per state

### 14.6 Advance Directive Template

- [ ] State-specific condition definitions used
- [ ] Treatment decisions matrix (7 treatment types × 3 conditions)
- [ ] Comfort care section always included and marked non-optional
- [ ] Pregnancy provisions included for states that require
- [ ] Organ donation and disposition preferences captured

### 14.7 System-Wide

- [ ] All documents include enhanced disclaimer
- [ ] Page numbers on all multi-page documents
- [ ] Document coordination warnings implemented
- [ ] Witness validation enforced per state and document type
- [ ] All unit tests passing
- [ ] All integration tests passing

---

## Appendices

### Appendix A: File Change Summary

| File | Lines Changed (Est.) | Type |
|------|---------------------|------|
| `state-legal-requirements.ts` | +800 | Enhancement |
| `legal-documents-section.tsx` | +150 | Enhancement |
| `legal-document-wizard.tsx` | +500 | Enhancement |
| `legal-document-pdf.tsx` | DEPRECATED | Split |
| `document-templates/will-template.ts` | +400 | New |
| `document-templates/trust-template.ts` | +600 | New |
| `document-templates/pour-over-will-template.ts` | +300 | New |
| `document-templates/financial-poa-template.ts` | +500 | New |
| `document-templates/healthcare-poa-template.ts` | +450 | New |
| `document-templates/advance-directive-template.ts` | +400 | New |
| `pdf-generators/*.tsx` (6 files) | +300 each | New |
| `witness-restrictions.ts` | +200 | New |
| Test files | +800 | New |
| **Total** | ~6,000 | |

### Appendix B: Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Template language legally insufficient | All templates reviewed against legal assessment document; recommend attorney review before production |
| State data inaccurate | Source from official state statutes; add last-verified date; implement annual review process |
| Migration breaks existing documents | Version document schemas; implement migration path; backup before deployment |
| Performance degradation | Lazy load template modules; cache state requirements; optimize PDF generation |

---

**Document prepared for implementation review.**

*This specification is intended for internal development use and should be treated as confidential.*
