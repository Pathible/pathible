# Legal Documents Implementation & Test Plan

**Created**: 2026-01-06
**Purpose**: Track implementation tasks and test coverage for all legal document types

---

## Overview

Each legal document type requires:
1. **Wizard Steps** - Step-by-step data collection
2. **State Requirements** - State-specific legal variations
3. **PDF Generation** - Document preview and export
4. **Validation Tests** - Ensure data integrity and correctness
5. **Snapshot Tests** - Prevent unintended changes to document structure

---

## Document Types

| Document | Status | Wizard | PDF | Unit Tests | PDF Tests |
|----------|--------|--------|-----|------------|-----------|
| Will | ✅ Production | ✅ | ✅ | ✅ Complete | ⬜ Pending |
| Trust | 🔄 Dev Only | ✅ | ✅ | ✅ Complete (189) | ✅ Complete |
| Pour-Over Will | 🔄 Dev Only | ✅ | ✅ | ✅ Complete (152) | ✅ Complete |
| Financial POA | 🔄 Dev Only | ✅ | ✅ | ✅ Complete (165) | ⬜ Pending |
| Healthcare POA | 🔄 Dev Only | ✅ | ✅ | ✅ Complete (139) | ⬜ Pending |
| Advance Directive | 🔄 Dev Only | ✅ | ✅ | ✅ Complete (147) | ⬜ Pending |

---

## 1. Last Will and Testament

### 1.1 Wizard Steps Verification

**Tested in:** `wizard-steps.test.ts`, `document-templates.test.ts`

- [x] **Step: Personal Information** (step id: `personal`)
  - [x] Full legal name validation (testator field required)
  - [x] County validation (required field)
  - [x] Marital status affects subsequent steps (spouse conditional)

- [x] **Step: Executor Selection** (step id: `executor`)
  - [x] Primary executor (required)
  - [x] Alternate executor (optional)
  - [x] Executor must be 18+ adult (tested in `person-utils.test.ts` - `canServeAsExecutor`)

- [x] **Step: Beneficiaries** (step id: `beneficiaries`)
  - [x] Residuary beneficiary required
  - [x] Additional beneficiaries list
  - [x] Contingent beneficiary option

- [x] **Step: Special Provisions** (step id: `provisions`)
  - [x] No-contest clause option
  - [x] Simultaneous death clause
  - [x] Tax payment instructions

- [x] **Step: Guardians** (step id: `guardians`)
  - [x] Conditional on hasMinorChildren
  - [x] Primary guardian selection
  - [x] Alternate guardian option
  - [x] Guardian must be 18+ adult (tested in `person-utils.test.ts` - `canServeAsGuardian`)

- [x] **Step: Digital Assets** (step id: `digital`)
  - [x] Digital executor option
  - [x] Digital assets instructions
  - [x] Password location field

- [x] **Step: Final Wishes** (step id: `final`)
  - [x] Burial/cremation preference
  - [x] Organ donation option
  - [x] Special instructions

### 1.2 State-Specific Requirements Tests

**Tested in:** `state-legal-requirements.test.ts` (28 tests)

- [x] Test witness requirements for all 50 states + DC
- [x] Test notarization requirements for all jurisdictions
- [x] Test holographic will recognition by state (CA, TX, VA, NC, TN allow; FL, NY, IL, OH don't)
- [x] Test community property states handling (AZ, CA, ID, LA, NV, NM, TX, WA, WI)
- [x] State snapshot tests: CA, NY, TX, SC (3 witnesses), VT, LA (notary required)

### 1.3 PDF Generation Tests

**Status:** ⬜ Not yet implemented - PDF generators exist but no unit tests


- [ ] PDF renders with all sections
- [ ] Testator name appears correctly
- [ ] State-specific language included
- [ ] Witness signature lines match state requirements
- [ ] Page numbering correct
- [ ] Legal disclaimers present


### 1.4 Template Structure Tests

**Tested in:** `document-templates.test.ts`

- [x] Template info stable (id: "will", name: "Last Will and Testament")
- [x] Required fields defined (fullName, state, executorName, residuaryBeneficiary)
- [x] Optional fields for common scenarios (spouseName, guardianName, specificBequests)
- [x] Article sections in correct order (declaration first, executor before bequests)
- [x] Guardian section has condition (hasMinorChildren)
- [x] 15 article sections defined with required/optional flags


---

## 2. Revocable Living Trust

**Status**: ✅ Comprehensive test suite complete (131 tests)
**Location**: `src/lib/__tests__/trust-document.test.ts`
**Last Updated**: 2026-01-07

### 2.1 Wizard Steps Verification

- [x] **Step: Grantor Information**
  - [x] Full legal name required (fullName field)
  - [x] State of residence required
  - [x] Address required
  - [x] Trust name required

- [x] **Step: Trust Type Selection**
  - [x] Individual trust support
  - [x] Joint trust support (isJointTrust, spouseName)
  - [x] Co-trustee option (coTrusteeName)

- [x] **Step: Trustee Selection**
  - [x] Initial trustee required (trusteeName)
  - [x] Successor trustee required (successorTrusteeName)
  - [x] Second successor trustee optional
  - [x] Trustee relationships captured
  - [x] Trustee addresses captured
  - [x] Trustee compensation options

- [x] **Step: Beneficiaries**
  - [x] Primary beneficiary required
  - [x] Beneficiary percentage support
  - [x] Beneficiary relationship tracking
  - [x] Additional beneficiaries support
  - [x] Contingent beneficiaries support
  - [x] Minor beneficiary provisions (age, subtrusts)
  - [x] Charity beneficiary support
  - [x] Pet provisions support

- [x] **Step: Asset Integration**
  - [x] Initial assets field
  - [x] Real property assets
  - [x] Financial account assets
  - [x] Personal property assets

- [x] **Step: Distribution Instructions**
  - [x] Distribution schedule options
  - [x] Discretionary distributions
  - [x] Minor beneficiary age triggers

- [x] **Step: Trust Powers**
  - [x] Trustee powers article section (required)
  - [x] Trustee duties article section (required)
  - [x] Amendment/revocation procedures

- [x] **Step: Incapacity Provisions**
  - [x] Incapacity provisions field
  - [x] Incapacity determination method
  - [x] Required incapacity article section

### 2.2 State-Specific Requirements Tests (All 51 Jurisdictions)

- [x] Trust requirements for all 50 states + DC
- [x] Consistent structure (witnessCount, notaryRequired, documentName)
- [x] Notarization required for most states (40+)
- [x] Community property state handling (AZ, CA, ID, LA, NV, NM, TX, WA, WI)
- [x] Joint trust considerations for community property states
- [x] State-specific snapshots (CA, NY, TX, FL)

### 2.3 Article Sections (19 Sections)

Required Sections (15):
- [x] Declaration of Trust
- [x] Definitions
- [x] Trust Property
- [x] Trustee Appointment
- [x] Trustee Powers
- [x] Trustee Duties
- [x] Lifetime Distributions
- [x] Incapacity Provisions
- [x] Death Distributions
- [x] Beneficiary Provisions
- [x] Revocation and Amendment
- [x] Successor Trustee
- [x] Miscellaneous Provisions
- [x] Governing Law
- [x] Signature and Acknowledgment

Optional Sections (4):
- [x] Trustee Compensation
- [x] Minor Beneficiaries (conditional on hasMinorBeneficiaries)
- [x] Spendthrift Provisions
- [x] No-Contest Provision

### 2.4 Template Structure Tests

- [x] Template ID: "revocable_trust"
- [x] Legal name: "Revocable Living Trust"
- [x] Category: "estate_planning"
- [x] Requires notarization (true)
- [x] Does not require witnesses (false)
- [x] Estimated completion time present
- [x] Comprehensive description
- [x] 7+ required fields
- [x] 40+ optional fields
- [x] Unique section IDs
- [x] Proper section ordering (declaration first, signature last)

### 2.5 Cross-Validation Tests

- [x] Template notarization matches state requirements
- [x] Template witness config matches state requirements
- [x] Required fields have corresponding article sections
- [x] All major states require notarization (CA, NY, TX, FL, IL, PA)

### 2.6 PDF Generation Tests (58 tests - all passing)

- [x] **Page Structure (5 tests)**
  - [x] 6 pages for complete trust document
  - [x] Header on first page
  - [x] Signature page as page 4
  - [x] Schedule A on page 5
  - [x] Certification of Trust on page 6

- [x] **Header Section (3 tests)**
  - [x] Document title display
  - [x] Trust name (subtitle)
  - [x] State of execution

- [x] **Preamble Section (3 tests)**
  - [x] Grantor information
  - [x] Trustee information
  - [x] Trust name and date reference

- [x] **Article Numbering (4 tests)**
  - [x] 8 core articles
  - [x] Starts with Trust Property (Article I)
  - [x] Trustee Provisions as Article V
  - [x] Governing Law as Article VIII

- [x] **Schedule A - Initial Trust Property (6 tests)**
  - [x] Real property section
  - [x] Bank accounts section
  - [x] Investment accounts section
  - [x] Personal property section
  - [x] Business interests section
  - [x] Placeholder text when assets not specified

- [x] **Signature Blocks (3 tests)**
  - [x] Grantor signature block
  - [x] Trustee signature block
  - [x] Date fields for signatures

- [x] **Notary Section (3 tests)**
  - [x] Notary acknowledgment when required
  - [x] State-specific formatting
  - [x] Principal name in notary block

- [x] **Certification of Trust (6 tests)**
  - [x] Separate page (page 6)
  - [x] Trust creation date certification
  - [x] Current trustees certification
  - [x] Trustee powers certification
  - [x] Proper title format instruction
  - [x] Notary acknowledgment included

- [x] **Optional Sections (4 tests)**
  - [x] No-Contest provision support
  - [x] Dynamic article numbering
  - [x] Incapacity special instructions
  - [x] Distribution timing options

- [x] **Page Footer (2 tests)**
  - [x] Trust name in footer
  - [x] Page numbers

- [x] **Beneficiary Information (5 tests)**
  - [x] Primary beneficiary display
  - [x] Beneficiary relationship
  - [x] Beneficiary percentage
  - [x] Additional beneficiaries
  - [x] Contingent beneficiaries

- [x] **Trustee Information (4 tests)**
  - [x] Initial trustee display
  - [x] Successor trustee display
  - [x] Trustee relationship
  - [x] Second successor display

- [x] **State-Specific Content (4 tests)**
  - [x] State name in header
  - [x] State-specific governing law
  - [x] Special requirements handling
  - [x] State code to name mapping

- [x] **PDF Data Mapping (6 tests)**
  - [x] Required field mapping (7 fields)
  - [x] Optional field mapping (9 fields)
  - [x] Conditional content (no-contest, notary, Schedule A)

### Test Summary

| Category | Tests | Status |
|----------|-------|--------|
| Template Structure | 34 | ✅ |
| Article Sections | 28 | ✅ |
| State Requirements | 17 | ✅ |
| Wizard Steps | 7 | ✅ |
| Beneficiary Logic | 14 | ✅ |
| Trustee Logic | 14 | ✅ |
| Asset Integration | 5 | ✅ |
| Provisions | 12 | ✅ |
| Legal Compliance | 5 | ✅ |
| Cross-Validation | 3 | ✅ |
| PDF Generation | 58 | ✅ |
| **Total** | **189** | ✅ |

---

## 3. Pour-Over Will

**Status**: ✅ Comprehensive test suite complete (152 tests)
**Location**: `src/lib/__tests__/pour-over-will-document.test.ts`
**Last Updated**: 2026-01-07

### 3.1 Template Structure (19 tests)

- [x] **Template Metadata**
  - [x] Template ID: "pour_over_will"
  - [x] Display name: "Pour-Over Will"
  - [x] Category: estate_planning
  - [x] Description includes trust integration
  - [x] Estimated completion time present

- [x] **Execution Requirements**
  - [x] Requires witnesses (true)
  - [x] Default witness count: 2
  - [x] Notary not required by default
  - [x] Requires existing trust flag (true)

### 3.2 Required Fields (9 tests)

- [x] **Personal Information**
  - [x] fullName required
  - [x] address required
  - [x] state required

- [x] **Trust Reference (Core)**
  - [x] trustName required
  - [x] trustDate required
  - [x] trusteeName required

- [x] **Executor**
  - [x] executorName required
  - [x] 7 required fields total
  - [x] No duplicate fields

### 3.3 Optional Fields (29 tests)

- [x] **Address Details** (county, city, dateOfBirth)
- [x] **Family Information** (spouseName, maritalStatus, hasMinorChildren, childrenNames)
- [x] **Executor Details** (alternateExecutorName, executorRelationship, executorAddress, waiveExecutorBond, executorCompensation)
- [x] **Guardian Information** (guardianName, alternateGuardianName, guardianRelationship, excludedGuardian)
- [x] **Property Dispositions** (specificBequests, tangiblePersonalProperty, excludedAssets)
- [x] **Legal Provisions** (survivalPeriod, noContestClause)
- [x] **Final Wishes** (burialPreference, burialInstructions, organDonation)
- [x] 25+ optional fields total

### 3.4 Article Sections (27 tests)

Required Sections (10):
- [x] Declaration
- [x] Family Status
- [x] Trust Identification
- [x] Pour-Over Provision
- [x] Debts and Taxes
- [x] Executor
- [x] Executor Powers
- [x] Simultaneous Death
- [x] Severability
- [x] Governing Law

Optional Sections (4):
- [x] Specific Bequests
- [x] Guardian (condition: hasMinorChildren)
- [x] No-Contest Provision
- [x] Final Wishes

Section Ordering:
- [x] Declaration first
- [x] Trust identification early (within first 4)
- [x] Pour-over provision after trust identification
- [x] Executor before pour-over (handles estate first)
- [x] Governing law last

### 3.5 Trust Integration (8 tests)

- [x] Requires existing trust flag
- [x] Trust name as required field
- [x] Trust date as required field
- [x] Trustee name as required field
- [x] Trust identification article section
- [x] Pour-over provision article section

### 3.6 State Requirements (21 tests)

- [x] All 51 jurisdictions have will requirements
- [x] Consistent structure (witnessCount, notaryRequired, selfProvingAllowed)
- [x] Most states require 2 witnesses (45+)
- [x] South Carolina requires 3 witnesses
- [x] Vermont requires 2 witnesses
- [x] Louisiana requires notary
- [x] State snapshots (CA, NY, TX, FL)

### 3.7 Executor Provisions (9 tests)

- [x] Primary executor required
- [x] Alternate executor optional
- [x] Executor relationship support
- [x] Bond waiver support
- [x] Executor compensation support
- [x] Executor appointment section
- [x] Executor powers section

### 3.8 Guardian Provisions (6 tests)

- [x] Guardian section conditional on hasMinorChildren
- [x] Guardian name support
- [x] Alternate guardian support
- [x] Guardian relationship support
- [x] Excluded guardian option

### 3.9 PDF Generation Structure (28 tests)

- [x] **Page Structure** (1-2 pages)
  - [x] Header on first page
  - [x] Testator signature on first page
  - [x] Witness attestation on first page
  - [x] Notary/self-proving on second page (conditional)

- [x] **Header Section**
  - [x] Document title
  - [x] Testator name
  - [x] State of execution

- [x] **Trust Reference Section**
  - [x] Trust name display
  - [x] Trust date display
  - [x] Amendment reference

- [x] **Pour-Over Provision Section**
  - [x] Residue disposition to trust
  - [x] Trustee reference
  - [x] Distribution according to trust
  - [x] Failsafe provision

- [x] **Fiduciary Powers** (7 powers listed)
- [x] **Signature Blocks** (testator, witnesses)
- [x] **State-Specific Content**
- [x] **Page Footer** (draft disclaimer, testator name, page number)

### 3.10 PDF Data Mapping (11 tests)

- [x] All 7 required fields mapped to PDF
- [x] fullName in header, declaration, signature
- [x] state in header, governing law
- [x] trustName in trust identification, pour-over provision
- [x] Conditional rendering (guardian, notary, self-proving)

### 3.11 Cross-Validation (7 tests)

- [x] Template witness default matches most states
- [x] Required fields have corresponding article sections
- [x] Pour-over specific fields (trustName, trustDate, trusteeName)
- [x] Pour-over specific sections (trust_identification, pour_over)

### 3.12 Legal Compliance (5 tests)

- [x] Declaration as first required section
- [x] Severability section required
- [x] Governing law section required
- [x] Simultaneous death section required
- [x] Debts and taxes section required

### Test Summary

| Category | Tests | Status |
|----------|-------|--------|
| Template Structure | 19 | ✅ |
| Required Fields | 9 | ✅ |
| Optional Fields | 29 | ✅ |
| Article Sections | 27 | ✅ |
| Trust Integration | 8 | ✅ |
| State Requirements | 21 | ✅ |
| Executor Provisions | 9 | ✅ |
| Guardian Provisions | 6 | ✅ |
| PDF Generation | 28 | ✅ |
| PDF Data Mapping | 11 | ✅ |
| Cross-Validation | 7 | ✅ |
| Legal Compliance | 5 | ✅ |
| **Total** | **152** | ✅ |

---

## 4. Durable Financial Power of Attorney

**Status**: ✅ Comprehensive test suite complete (165 tests)
**Location**: `src/lib/__tests__/financial-poa-document.test.ts`
**Last Updated**: 2026-01-07

### 4.1 Template Structure (14 tests)

- [x] **Template Metadata**
  - [x] Template ID: "financial_poa"
  - [x] Display name: "Durable Financial Power of Attorney"
  - [x] Category: estate_planning
  - [x] Estimated completion time present

- [x] **Execution Requirements**
  - [x] Requires notarization (true)
  - [x] Requires witnesses (true)
  - [x] Default witness count: 2

### 4.2 Required Fields (9 tests)

- [x] **Personal Information**
  - [x] fullName required
  - [x] address required
  - [x] state required

- [x] **Agent Information**
  - [x] agentName required
  - [x] agentAddress required

- [x] **Powers**
  - [x] grantedPowers required
  - [x] 6 required fields total

### 4.3 Optional Fields (49 tests)

- [x] **Location Details** (county, city)
- [x] **Personal Info** (dateOfBirth)
- [x] **Alternate Agents** (alternateAgentName, secondAlternateAgentName, addresses, phones)
- [x] **Co-Agent Support** (coAgentName, coAgentAddress, coAgentPhone, coAgentActingMethod)
- [x] **10 Power Categories**:
  - [x] Banking Powers (7 fields)
  - [x] Investment Powers (4 fields)
  - [x] Real Estate Powers (4 fields)
  - [x] Business Powers (3 fields)
  - [x] Tax Powers (4 fields)
  - [x] Insurance Powers (4 fields)
  - [x] Retirement Powers (3 fields)
  - [x] Government Benefits Powers (3 fields)
  - [x] Legal Powers (3 fields)
  - [x] Gifting Powers (4 fields)
- [x] **Effective Date Options** (effectiveDate, effectiveImmediately, springPower, incapacityDetermination)
- [x] **Limitations** (giftLimitations, excludedPowers, selfDealingAllowed)
- [x] **Durability** (durabilityClause, terminationConditions)
- [x] **Compensation** (agentCompensation, expenseReimbursement)
- [x] **Special Provisions** (specialInstructions, successorProvisions, relocationProvisions)
- [x] 47+ optional fields total

### 4.4 Article Sections (26 tests)

Required Sections (11):
- [x] Declaration
- [x] Definitions
- [x] Agent Appointment
- [x] Durability
- [x] General Powers
- [x] Agent Authority
- [x] Agent Duties
- [x] Third Party Reliance
- [x] Revocation
- [x] Governing Law
- [x] Signature

Optional Sections (15):
- [x] Banking Powers
- [x] Investment Powers
- [x] Real Estate Powers
- [x] Business Powers
- [x] Tax Powers
- [x] Insurance Powers
- [x] Retirement Powers
- [x] Government Benefits Powers
- [x] Legal Powers
- [x] Gifting Powers
- [x] Effective Date
- [x] Limitations
- [x] Compensation
- [x] Successor Agent
- [x] Special Instructions

Section Ordering:
- [x] Declaration first
- [x] Definitions early (within first 3)
- [x] Agent appointment after definitions
- [x] Durability clause present
- [x] Signature last

### 4.5 State Requirements (21 tests)

- [x] All 51 jurisdictions have financial POA requirements
- [x] Consistent structure (witnessCount, notaryRequired, documentName)
- [x] Most states require notarization (40+)
- [x] Valid witness counts (0-2)
- [x] State snapshots (CA, NY, TX, FL)

### 4.6 PDF Generation Structure (28 tests)

- [x] **Page Structure** (2-4 pages expected)
- [x] **Header Section** (title, principal name, state)
- [x] **Declaration Elements**
- [x] **Agent Appointment Section**
- [x] **Powers Granted Section** (all 10 categories)
- [x] **Durability Clause Section**
- [x] **Effective Date Section**
- [x] **Limitations Section**
- [x] **Third Party Reliance Section**
- [x] **Signature Block** (principal, witnesses, notary)

### 4.7 Cross-Validation (5 tests)

- [x] Template notarization matches state requirements
- [x] Required fields have corresponding article sections
- [x] All power categories have article sections

### Test Summary

| Category | Tests | Status |
|----------|-------|--------|
| Template Structure | 14 | ✅ |
| Required Fields | 9 | ✅ |
| Optional Fields | 49 | ✅ |
| Article Sections | 26 | ✅ |
| Power Categories | 10 | ✅ |
| State Requirements | 21 | ✅ |
| PDF Generation | 28 | ✅ |
| Cross-Validation | 5 | ✅ |
| Legal Compliance | 3 | ✅ |
| **Total** | **165** | ✅ |

---

## 5. Healthcare Power of Attorney

**Status**: ✅ Comprehensive test suite complete (139 tests)
**Location**: `src/lib/__tests__/healthcare-poa-document.test.ts`
**Last Updated**: 2026-01-07

### 5.1 Template Structure (12 tests)

- [x] **Template Metadata**
  - [x] Template ID: "healthcare_poa"
  - [x] Display name: "Healthcare Power of Attorney"
  - [x] Category: healthcare_planning
  - [x] Estimated completion time present

- [x] **Execution Requirements**
  - [x] Does not require notarization (false)
  - [x] Requires witnesses (true)
  - [x] Default witness count: 2

### 5.2 Required Fields (9 tests)

- [x] **Personal Information**
  - [x] fullName required
  - [x] address required
  - [x] state required

- [x] **Agent Information**
  - [x] agentName required
  - [x] agentAddress required
  - [x] agentPhone required
  - [x] 6 required fields total

### 5.3 Optional Fields (58 tests)

- [x] **Location Details** (county, city, dateOfBirth)
- [x] **Alternate Agents** (alternateAgentName, secondAlternateAgentName, addresses, phones, relationships)
- [x] **Healthcare Decision Powers**:
  - [x] General Powers (allHealthcareDecisions, accessMedicalRecords, consentToTreatment, refuseTreatment)
  - [x] Life-Sustaining Treatment (lifeSustainingTreatment, artificialNutrition, artificialHydration, mechanicalVentilation)
  - [x] Mental Health Powers (mentalHealthTreatment, psychiatricMedications, electroconvulsiveTherapy, psychosurgery, mentalHealthFacility)
  - [x] Care Facility Powers (admitToFacility, dischargeFromFacility, selectCareProviders, hireCaregivers)
- [x] **HIPAA Authorization** (hipaaAuthorization, hipaaScope, accessAllRecords, discussWithProviders)
- [x] **Organ Donation** (organDonation, organDonationType, organDonationPurpose, tissueDonation)
- [x] **Personal Preferences** (religiousRestrictions, culturalPreferences, painManagement, preferredHospital)
- [x] **Activation Options** (effectiveImmediately, effectiveUponIncapacity, incapacityDetermination, revocationInstructions)
- [x] **Special Instructions** (specialInstructions, excludedTreatments, mandatoryTreatments, endOfLifeWishes)
- [x] 56+ optional fields total

### 5.4 Article Sections (20 tests)

Required Sections (11):
- [x] Declaration
- [x] Definitions
- [x] Agent Appointment
- [x] Agent Authority
- [x] General Powers
- [x] Healthcare Decisions
- [x] Agent Duties
- [x] HIPAA Authorization
- [x] Revocation
- [x] Governing Law
- [x] Signature

Optional Sections (9):
- [x] Alternate Agents
- [x] Mental Health Powers
- [x] Life-Sustaining Treatment
- [x] Care Facility Powers
- [x] Organ Donation
- [x] Personal Preferences
- [x] Special Instructions
- [x] Activation
- [x] Nomination of Guardian

Section Ordering:
- [x] Declaration first
- [x] Definitions early (within first 3)
- [x] Agent appointment after definitions
- [x] HIPAA authorization present
- [x] Signature last

### 5.5 State Requirements (17 tests)

- [x] All 51 jurisdictions have healthcare POA requirements
- [x] Consistent structure (witnessCount, notaryRequired, documentName)
- [x] Most states don't require notarization (40+)
- [x] Valid witness counts (0-2)
- [x] State snapshots (CA, NY, TX, FL)

### 5.6 PDF Generation Structure (16 tests)

- [x] **Page Structure** (2-3 pages expected)
- [x] **Header Section** (title, principal name, state)
- [x] **Declaration Elements**
- [x] **Agent Appointment Section**
- [x] **Healthcare Powers Section**
- [x] **HIPAA Authorization Section**
- [x] **Mental Health Powers Section**
- [x] **Life-Sustaining Treatment Section**
- [x] **Signature Block** (principal, witnesses, notary if required)

### 5.7 Cross-Validation (5 tests)

- [x] Template witness config matches state requirements
- [x] Required fields have corresponding article sections
- [x] HIPAA authorization properly included

### Test Summary

| Category | Tests | Status |
|----------|-------|--------|
| Template Structure | 12 | ✅ |
| Required Fields | 9 | ✅ |
| Optional Fields | 58 | ✅ |
| Article Sections | 20 | ✅ |
| State Requirements | 17 | ✅ |
| PDF Generation | 16 | ✅ |
| Cross-Validation | 5 | ✅ |
| Legal Compliance | 2 | ✅ |
| **Total** | **139** | ✅ |

---

## 6. Advance Healthcare Directive (Living Will)

**Status**: ✅ Comprehensive test suite complete (147 tests)
**Location**: `src/lib/__tests__/advance-directive-document.test.ts`
**Last Updated**: 2026-01-07

### 6.1 Template Structure (12 tests)

- [x] **Template Metadata**
  - [x] Template ID: "advance_directive"
  - [x] Display name: "Advance Healthcare Directive"
  - [x] Category: healthcare_planning
  - [x] Estimated completion time present
  - [x] Alternate names: "Living Will", "Advance Medical Directive", "Healthcare Declaration"

- [x] **Execution Requirements**
  - [x] Does not require notarization (false)
  - [x] Requires witnesses (true)
  - [x] Default witness count: 2

### 6.2 Required Fields (7 tests)

- [x] **Personal Information**
  - [x] fullName required
  - [x] address required
  - [x] state required

- [x] **Core Preferences**
  - [x] terminalConditionPreference required
  - [x] permanentUnconsciousnessPreference required
  - [x] 5 required fields total

### 6.3 Optional Fields (76 tests)

- [x] **Location Details** (county, city, dateOfBirth)
- [x] **Condition Preferences** (endStageConditionPreference, lifeSustainingTreatmentGeneral)
- [x] **10 Treatment Categories**:
  - [x] CPR/Resuscitation (cardiopulmonaryResuscitation, cprPreference)
  - [x] Mechanical Ventilation (mechanicalVentilation, ventilatorPreference)
  - [x] Artificial Nutrition (artificialNutrition, feedingTubePreference)
  - [x] Artificial Hydration (artificialHydration, hydrationPreference)
  - [x] Dialysis (dialysis, dialysisPreference)
  - [x] Antibiotics (antibiotics, antibioticsPreference)
  - [x] Blood Transfusions (bloodTransfusions, bloodTransfusionPreference)
  - [x] Surgical Procedures (surgicalProcedures, surgeryPreference)
  - [x] Diagnostic Tests (diagnosticTests, diagnosticPreference)
  - [x] Pain Management (painManagement, painManagementPreference)
- [x] **Comfort Care** (comfortCareOnly, hospiceCarePreference, palliativeCareInstructions)
- [x] **Trial Period** (trialPeriodPreference, trialPeriodDuration)
- [x] **Pregnancy Provision** (pregnancyProvision, pregnancyPreference)
- [x] **Organ Donation** (organDonation, organDonationType, organDonationPurpose, organDonationLimitations, tissueDonation)
- [x] **Autopsy** (autopsyPreference, autopsyLimitations)
- [x] **Body Disposition** (bodyDisposition, burialPreference, cremationPreference, bodyDonation, funeralInstructions)
- [x] **Spiritual/Cultural** (spiritualPreferences, religiousRestrictions, culturalConsiderations, clergyContact)
- [x] **Personal Values** (personalStatement, qualityOfLifeValues, treatmentGoals)
- [x] **Healthcare Providers** (healthcareAgentName, healthcareAgentPhone, primaryPhysician, primaryPhysicianPhone, preferredHospital)
- [x] **Contacts** (familyNotificationInstructions, emergencyContacts)
- [x] **Administrative** (additionalInstructions, reviewDate, expirationDate)
- [x] 61 optional fields total

### 6.4 Article Sections (20 tests)

Required Sections (9):
- [x] Declaration
- [x] Definitions
- [x] Terminal Condition Instructions
- [x] Permanent Unconsciousness Instructions
- [x] Pain Management and Comfort Care
- [x] Revocation
- [x] Severability
- [x] Governing Law
- [x] Signature and Witnesses

Optional Sections (11):
- [x] End-Stage Condition Instructions
- [x] General Life-Sustaining Treatment
- [x] Specific Treatment Preferences
- [x] Pregnancy Provision
- [x] Organ and Tissue Donation
- [x] Autopsy Preferences
- [x] Body Disposition
- [x] Personal Values Statement
- [x] Spiritual and Religious Preferences
- [x] Healthcare Provider Information
- [x] Additional Instructions

Section Ordering:
- [x] Declaration first
- [x] Definitions early (within first 5)
- [x] Terminal condition before permanent unconsciousness
- [x] Revocation before signature
- [x] Signature last

### 6.5 State Requirements (13 tests)

- [x] All 51 jurisdictions have advance directive requirements
- [x] Consistent structure (witnessCount, notaryRequired, documentName)
- [x] Most states don't require notarization (40+)
- [x] Most states require 2 witnesses (40+)
- [x] State snapshots (CA, NY, TX, FL)

### 6.6 PDF Generation Structure (28 tests)

- [x] **Page Structure** (2-4 pages expected)
- [x] **Header Section** (title, declarant name, state)
- [x] **Declaration Elements**
- [x] **Definitions Elements** (5 key definitions)
- [x] **Terminal Condition Elements**
- [x] **Permanent Unconsciousness Elements**
- [x] **Specific Treatment Elements** (8 treatment types)
- [x] **Pain Management Elements**
- [x] **Organ Donation Elements**
- [x] **Body Disposition Elements**
- [x] **Personal Values Elements**
- [x] **Signature Block** (declarant, witnesses, notary if required)

### 6.7 Cross-Validation (5 tests)

- [x] Separate from Healthcare POA document type
- [x] Focus on end-of-life decisions (terminal/unconsciousness preferences)
- [x] Optional healthcare agent reference

### 6.8 Comparison with Healthcare POA (5 tests)

- [x] Different template IDs
- [x] Advance directive focuses on treatment preferences
- [x] Healthcare POA focuses on agent authority
- [x] Can reference healthcare agent optionally

### Test Summary

| Category | Tests | Status |
|----------|-------|--------|
| Template Structure | 12 | ✅ |
| Required Fields | 7 | ✅ |
| Optional Fields | 76 | ✅ |
| Article Sections | 20 | ✅ |
| Treatment Categories | 10 | ✅ |
| State Requirements | 13 | ✅ |
| PDF Generation | 28 | ✅ |
| Cross-Validation | 5 | ✅ |
| POA Comparison | 5 | ✅ |
| Field Count Verification | 4 | ✅ |
| **Total** | **147** | ✅ |

---

## Test Infrastructure

### Test File Structure

```
src/
├── __tests__/
│   └── legal-documents/
│       ├── __snapshots__/
│       │   ├── will.test.ts.snap
│       │   ├── trust.test.ts.snap
│       │   ├── pour-over-will.test.ts.snap
│       │   ├── financial-poa.test.ts.snap
│       │   ├── healthcare-poa.test.ts.snap
│       │   └── advance-directive.test.ts.snap
│       ├── will.test.ts
│       ├── trust.test.ts
│       ├── pour-over-will.test.ts
│       ├── financial-poa.test.ts
│       ├── healthcare-poa.test.ts
│       ├── advance-directive.test.ts
│       ├── state-requirements.test.ts
│       └── shared/
│           ├── fixtures.ts
│           ├── mock-data.ts
│           └── test-utils.ts
```

### Test Categories

1. **Unit Tests**
   - Validator functions
   - Utility functions
   - State requirement lookups

2. **Snapshot Tests**
   - Wizard step structures
   - PDF section structures
   - State-specific language

3. **Integration Tests**
   - Full wizard flow
   - PDF generation end-to-end
   - Cross-document consistency

4. **E2E Tests** (Cypress)
   - Complete document creation flow
   - PDF download verification
   - State selection impacts

---

## Implementation Order

### Phase 1: Test Infrastructure (Priority)
- [ ] Set up test file structure
- [ ] Create shared fixtures and mock data
- [ ] Create test utilities for legal documents

### Phase 2: Will (Complete Coverage)
- [ ] Write unit tests for WILL_STEPS
- [ ] Write snapshot tests for wizard structure
- [ ] Write PDF generation tests
- [ ] Write state requirements tests
- [ ] Create E2E tests for will creation

### Phase 3: Trust
- [ ] Review and fix asset integration
- [ ] Write unit tests for TRUST_STEPS
- [ ] Write snapshot tests
- [ ] Write PDF tests
- [ ] Enable in production

### Phase 4: Pour-Over Will
- [ ] Implement trust document linkage
- [ ] Write unit tests
- [ ] Write integration tests with trust
- [ ] Enable in production

### Phase 5: Financial POA
- [ ] Review state statutory forms
- [ ] Write unit tests
- [ ] Write snapshot tests
- [ ] Enable in production

### Phase 6: Healthcare POA
- [ ] Review HIPAA compliance
- [ ] Write unit tests
- [ ] Write snapshot tests
- [ ] Enable in production

### Phase 7: Advance Directive
- [ ] Review state-specific requirements
- [ ] Write unit tests
- [ ] Write snapshot tests
- [ ] Enable in production

---

## Commands

```bash
# Run all legal document tests
pnpm test:legal-docs

# Run tests for specific document type
pnpm test:legal-docs -- --grep "Will"

# Update snapshots after intentional changes
pnpm test:legal-docs -- -u

# Run E2E tests for legal documents
pnpm test:e2e -- --spec "cypress/e2e/legal-documents/**"
```

---

## Progress Tracking

| Phase | Document | Unit | Snapshot | Integration | E2E | Production |
|-------|----------|------|----------|-------------|-----|------------|
| 1 | Test Infrastructure | ✅ | ✅ | N/A | ✅ | N/A |
| 2 | State Requirements | ✅ | ✅ | N/A | N/A | ✅ |
| 3 | Document Templates | ✅ | ✅ | N/A | N/A | ✅ |
| 4 | Wizard Steps | ✅ | ✅ | N/A | N/A | N/A |
| 5 | Person Utilities | ✅ | N/A | N/A | N/A | ✅ |
| 6 | Will | ✅ | ✅ | ⬜ | ✅ | ✅ |
| 7 | Trust | ✅ | ✅ | ✅ | ⬜ | 🔄 |
| 8 | Pour-Over | ✅ | ✅ | ⬜ | ⬜ | ⬜ |
| 9 | Financial POA | ✅ | ✅ | ⬜ | ⬜ | ⬜ |
| 10 | Healthcare POA | ✅ | ✅ | ⬜ | ⬜ | ⬜ |
| 11 | Advance Directive | ✅ | ✅ | ⬜ | ⬜ | ⬜ |


**Legend**: ⬜ Not started | 🔄 In progress | ✅ Complete

---

## Completed Items (2026-01-07)

### Test Infrastructure
- ✅ Vitest installed and configured (`vitest.config.ts`)
- ✅ Test scripts added to `package.json`
- ✅ Cypress E2E test file created (`cypress/e2e/legal-documents.cy.ts`)
- ✅ Test fixtures created (`cypress/fixtures/legal-documents.json`)

### State Requirements Tests (28 tests - all passing)
Location: `src/lib/__tests__/state-legal-requirements.test.ts`

- ✅ Coverage tests (all 51 jurisdictions)
- ✅ Will requirements structure tests
- ✅ Holographic will recognition tests
- ✅ Community property state tests
- ✅ Witness restriction tests
- ✅ State-specific snapshot tests (CA, NY, TX, SC, VT, LA)
- ✅ Trust requirements tests
- ✅ POA requirements tests
- ✅ Advance directive requirements tests
- ✅ Data validation tests

### Document Template Tests (29 tests - all passing)
Location: `src/lib/__tests__/document-templates.test.ts`

- ✅ Will Template tests
  - Template info stability (id, name, requiresNotary, requiresWitnesses)
  - Required fields (fullName, state, executorName, residuaryBeneficiary)
  - Optional fields (spouseName, guardianName, specificBequests, digitalAssets)
  - Article sections order and structure
  - Guardian section conditional logic
- ✅ Trust Template tests
  - Template info (id: revocable_trust, requiresNotary: true)
  - Required fields (fullName, state, trustName, trusteeName)
  - Optional fields (successorTrusteeRelationship, initialAssets, spendthrift)
  - Article sections (declaration, trust_property, trustee_powers)
- ✅ Pour-Over Will Template tests
  - Template info stability
  - Trust reference requirement (trustName field)
- ✅ Financial POA Template tests
  - Template info (requiresNotary: true, requiresWitnesses: true)
  - Required fields (fullName, agentName, grantedPowers)
  - Optional power categories (banking, investment, real estate, tax, gifting)
  - Article sections for each power type
- ✅ Healthcare POA Template tests
  - Template info (requiresNotary: false, requiresWitnesses: true)
  - Required fields (fullName, agentName, agentAddress)
  - Article sections (agent_appointment, general_powers, hipaa)
- ✅ Advance Directive Template tests
  - Required fields (terminalConditionPreference, permanentUnconsciousnessPreference)
  - Treatment options in optional fields (CPR, ventilation, nutrition, dialysis)
  - Article sections (terminal_condition, permanent_unconsciousness, pain_management)
- ✅ Cross-Template Consistency tests
  - Unique template IDs
  - Names and descriptions for all templates
  - Categories for all templates
- ✅ Required Fields Consistency tests
  - fullName required for all document types
  - state required for estate planning documents
  - No duplicate fields within templates

### Wizard Step Configuration Tests (25 tests - all passing)
Location: `src/lib/__tests__/wizard-steps.test.ts`

- ✅ Will Wizard Steps (7 steps)
  - personal → executor → beneficiaries → provisions → guardians → digital → final
  - Required fields: testator, executor, residuaryBeneficiary
- ✅ Trust Wizard Steps (7 steps)
  - personal → trust_name → trustees → beneficiaries → assets → distributions → provisions
  - Required fields: grantor, trustName, trustee, primaryBeneficiary
- ✅ Pour-Over Will Steps (5 steps)
  - personal → trust_reference → executor → guardians → final
  - Trust name reference required
- ✅ Financial POA Steps (5 steps)
  - personal → agent → powers → effective → limitations
  - Required fields: principal, agent, grantedPowers
- ✅ Healthcare POA Steps (5 steps)
  - personal → agent → powers → preferences → hipaa
  - Healthcare agent selection required
- ✅ Advance Directive Steps (7 steps)
  - personal → terminal → unconscious → treatments → comfort → organ → final
  - Required preferences for terminal condition and permanent unconsciousness
- ✅ Wizard Step Consistency tests
  - Unique step IDs within each wizard
  - Titles for all steps
  - All wizards start with personal information
  - Reasonable step count (3-10 per wizard)
- ✅ Required Fields Validation tests
  - At least one step with required fields per wizard
  - Personal step requires identity field (testator/grantor/principal)

### Person Utilities Tests (63 tests - all passing)
Location: `src/lib/__tests__/person-utils.test.ts`

- ✅ Age Calculation tests
  - calculateAge for adults and minors
  - Birthday edge cases (before, on, after birthday)
  - isMinor/isAdult validation
  - getAgeDescription formatting ("Minor (14)" vs "34 years old")
- ✅ Address Formatting tests
  - formatFullAddress (single line: "123 Main St, Springfield, CA 90210")
  - formatAddressLines (multi-line array)
  - formatLegalAddress (with county for legal documents)
  - Missing component handling
- ✅ Relationship Labels tests
  - getRelationshipLabel (spouse, parent, child, sibling, etc.)
  - getKeyContactRoleLabel (attorney, executor, trustee, etc.)
  - getRelationshipTypes (returns value/label pairs)
  - getKeyContactRoles (returns value/label pairs)
- ✅ Person Reference Helpers tests
  - createManualPersonReference
  - createFamilyMemberReference (with familyMemberId)
  - createKeyContactReference (with keyContactId)
  - isPersonReferenceComplete validation
  - hasAddress check
  - getPersonDisplayName (fullName or firstName + lastName)
  - getPersonDisplayWithRelationship ("John Doe (Spouse)")
- ✅ Role Validation Helpers tests (age-based)
  - canServeAsExecutor (must be 18+)
  - canServeAsGuardian (must be 18+)
  - canServeAsAgent (must be 18+)
  - canServeAsTrustee (must be 18+)
  - Null/undefined handling
  - Assumed adult if no DOB provided
- ✅ PDF Flattening Utilities tests
  - String/boolean passthrough
  - PersonReference → mapped field names (testator → fullName, executor → executorName)
  - Relationship field mapping
  - Address field mapping
  - BeneficiaryEntry[] to text format
  - Null value skipping
  - Suffixed fields (guardianPhone, guardianEmail, etc.)

### E2E Tests (Legal Documents)
Location: `cypress/e2e/legal-documents.cy.ts`

- ✅ Unauthenticated access tests
- ✅ Legal documents section tests
- ✅ Will wizard tests
- ✅ State-specific requirements tests
- ✅ Document preview and PDF tests
- ✅ Data persistence tests
- ✅ Document deletion tests
- ✅ Back navigation tests

### Trust Document Tests (131 tests - all passing)
Location: `src/lib/__tests__/trust-document.test.ts`
Added: 2026-01-07

- ✅ Template Structure (34 tests)
  - Template ID, name, category, notarization, witness config
  - Required fields (7+)
  - Optional fields (40+)
- ✅ Article Sections (28 tests)
  - 15 required sections (declaration → signature)
  - 4 optional sections (compensation, minors, spendthrift, no-contest)
  - Proper ordering validation
- ✅ State Requirements (17 tests)
  - All 51 jurisdictions covered
  - Notarization requirements
  - Community property state handling
- ✅ Wizard Steps (7 tests)
  - 7-step configuration
  - Required fields alignment
- ✅ Beneficiary Logic (14 tests)
  - Primary, additional, contingent beneficiaries
  - Minor beneficiary provisions
  - Charity and pet provisions
- ✅ Trustee Logic (14 tests)
  - Initial, successor, co-trustee
  - Compensation and powers
- ✅ Asset Integration (5 tests)
  - Real property, financial, personal assets
- ✅ Provisions (12 tests)
  - Spendthrift, incapacity, no-contest, revocation
- ✅ Legal Compliance (5 tests)
  - Declaration, governing law, signature sections
- ✅ Cross-Validation (3 tests)
  - Template/state consistency

### Wizard Initialization Tests (20 tests)
Location: `src/lib/__tests__/wizard-initialization.test.ts`
Added: 2026-01-07

**Purpose**: Test auto-fill behavior and race condition prevention in wizard initialization.

- ✅ Auto-fill from familyMember tests (7 tests)
  - Auto-fill county when familyMember has county and no saved value
  - Auto-fill maritalStatus when familyMember has maritalStatus and no saved value
  - Auto-fill both county and maritalStatus together
  - NOT override saved county value
  - NOT override saved maritalStatus value
  - Handle null familyMember gracefully
  - Handle familyMember without county or maritalStatus
- ✅ Trust name auto-fill tests (3 tests)
  - Auto-fill trustName for trust documents
  - NOT auto-fill trustName for non-trust documents
  - NOT override saved trustName
- ✅ Race condition prevention tests (6 tests)
  - NOT initialize when familyMember query is still loading (undefined)
  - Initialize when familyMember query returns null (not found)
  - Initialize when familyMember query returns a record
  - NOT initialize when already initialized
  - NOT initialize when document is not loaded
  - NOT initialize when household is not loaded
- ✅ Marital status values tests (1 test)
  - Accept all valid marital status values
- ✅ Integration scenario tests (3 tests)
  - Correctly initialize a new will with all auto-fill fields
  - Correctly initialize a new trust with all auto-fill fields
  - Preserve existing responses when resuming a document

---

## Test Summary

| Test File | Tests | Status |
|-----------|-------|--------|
| `state-legal-requirements.test.ts` | 28 | ✅ Passing |
| `document-templates.test.ts` | 29 | ✅ Passing |
| `wizard-steps.test.ts` | 25 | ✅ Passing |
| `person-utils.test.ts` | 63 | ✅ Passing |
| `wizard-initialization.test.ts` | 20 | ✅ Passing |
| `trust-document.test.ts` | 189 | ✅ Passing |
| `pour-over-will-document.test.ts` | 152 | ✅ Passing |
| `financial-poa-document.test.ts` | 165 | ✅ Passing |
| `healthcare-poa-document.test.ts` | 139 | ✅ Passing |
| `advance-directive-document.test.ts` | 147 | ✅ Passing |
| **Total** | **957** | ✅ **All Passing** |

Run tests: `pnpm test:run` or `pnpm vitest run`

---

## Next Steps

### Completed
1. ✅ **Trust Document Tests** - Comprehensive test suite (189 tests including PDF generation)
2. ✅ **Trust PDF Generation Tests** - 58 tests covering all PDF sections
3. ✅ **Pour-Over Will Tests** - Comprehensive test suite (152 tests including PDF generation)
4. ✅ **Financial POA Tests** - Comprehensive test suite (165 tests)
5. ✅ **Healthcare POA Tests** - Comprehensive test suite (139 tests)
6. ✅ **Advance Directive Tests** - Comprehensive test suite (147 tests)

### Remaining Work
1. **Trust E2E Tests** - Trust wizard flows in Cypress
2. **Integration Tests** - Trust → pour-over will linkage
3. **E2E Tests for Other Documents** - POA, Advance Directive wizard flows
4. **Will PDF Tests** - PDF generation unit tests for Will document
5. **Production Enablement** - Enable Trust, POA, Advance Directive in production

---


## Notes

- All snapshot tests should be reviewed by legal team before finalizing
- State requirements data should be verified against current state laws
- PDF templates should be reviewed for legal compliance
- Consider accessibility requirements for document formats
