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

| Document | Status | Wizard | PDF | Tests |
|----------|--------|--------|-----|-------|
| Will | ✅ Implemented | ✅ | ✅ | ⬜ |
| Trust | 🔄 Partial | ✅ | ✅ | ⬜ |
| Pour-Over Will | 🔄 Partial | ✅ | ✅ | ⬜ |
| Financial POA | 🔄 Partial | ✅ | ✅ | ⬜ |
| Healthcare POA | 🔄 Partial | ✅ | ✅ | ⬜ |
| Advance Directive | 🔄 Partial | ✅ | ✅ | ⬜ |

---

## 1. Last Will and Testament

### 1.1 Wizard Steps Verification

- [ ] **Step: Personal Information**
  - [ ] Full legal name validation (required, max 200 chars)
  - [ ] State of residence validation (valid US state code)
  - [ ] County validation (required for some states)
  - [ ] Marital status affects subsequent steps

- [ ] **Step: Family Information**
  - [ ] Spouse information (conditional on marital status)
  - [ ] Children list with PersonReference pattern
  - [ ] Minor children detection triggers guardian selection

- [ ] **Step: Executor Selection**
  - [ ] Primary executor (required)
  - [ ] Alternate executor (recommended)
  - [ ] Executor must be 18+ adult
  - [ ] Cannot select minor children as executor

- [ ] **Step: Guardian Selection** (if minor children)
  - [ ] Primary guardian for minor children
  - [ ] Alternate guardian
  - [ ] Guardian cannot be the testator

- [ ] **Step: Beneficiaries**
  - [ ] At least one beneficiary required
  - [ ] Percentage shares must total 100%
  - [ ] Contingent beneficiaries (if primary predeceases)

- [ ] **Step: Specific Bequests**
  - [ ] Item description validation
  - [ ] Beneficiary selection for each item
  - [ ] Optional - can skip this step

- [ ] **Step: Residuary Estate**
  - [ ] Distribution of remaining assets
  - [ ] Per stirpes vs per capita options

- [ ] **Step: Witness Requirements**
  - [ ] State-specific witness count (2-3)
  - [ ] Witness age requirements
  - [ ] Witness restrictions (not beneficiaries in some states)

- [ ] **Step: Notarization**
  - [ ] State-specific notarization requirements
  - [ ] Self-proving affidavit options

### 1.2 State-Specific Requirements Tests

- [ ] Test witness requirements for all 50 states + DC
- [ ] Test notarization requirements for all jurisdictions
- [ ] Test holographic will recognition by state
- [ ] Test community property states handling

### 1.3 PDF Generation Tests

- [ ] PDF renders with all sections
- [ ] Testator name appears correctly
- [ ] State-specific language included
- [ ] Witness signature lines match state requirements
- [ ] Page numbering correct
- [ ] Legal disclaimers present

### 1.4 Snapshot Tests

```typescript
// Example test structure
describe('Will Document', () => {
  describe('Wizard Steps', () => {
    it('should have consistent step structure', () => {
      expect(WILL_STEPS).toMatchSnapshot();
    });

    it('should have all required fields', () => {
      const requiredFields = getRequiredFields(WILL_STEPS);
      expect(requiredFields).toMatchSnapshot();
    });
  });

  describe('PDF Generation', () => {
    it('should generate consistent PDF structure', () => {
      const pdfData = generateWillPDF(mockWillData);
      expect(pdfData.sections).toMatchSnapshot();
    });
  });

  describe('State Requirements', () => {
    it('should have consistent witness requirements', () => {
      const witnessReqs = getAllStateWitnessRequirements('will');
      expect(witnessReqs).toMatchSnapshot();
    });
  });
});
```

---

## 2. Revocable Living Trust

### 2.1 Wizard Steps Verification

- [ ] **Step: Grantor Information**
  - [ ] Full legal name (required)
  - [ ] State of residence
  - [ ] Trust name generation (e.g., "John Smith Revocable Living Trust")

- [ ] **Step: Trust Type Selection**
  - [ ] Individual trust
  - [ ] Joint trust (married couples)
  - [ ] Affects co-trustee requirements

- [ ] **Step: Trustee Selection**
  - [ ] Initial trustee (usually grantor)
  - [ ] Successor trustee (required)
  - [ ] Alternate successor trustee
  - [ ] Corporate trustee option

- [ ] **Step: Beneficiaries**
  - [ ] Primary beneficiaries with shares
  - [ ] Contingent beneficiaries
  - [ ] Distribution age for minors
  - [ ] Special needs trust provisions

- [ ] **Step: Asset Integration**
  - [ ] Display linked financial accounts
  - [ ] Display linked properties
  - [ ] Display linked insurance policies
  - [ ] Manual asset entry option

- [ ] **Step: Distribution Instructions**
  - [ ] Immediate distribution vs staged
  - [ ] Age-based distributions
  - [ ] Spendthrift provisions
  - [ ] Education/health provisions

- [ ] **Step: Trust Powers**
  - [ ] Investment powers
  - [ ] Real estate powers
  - [ ] Business powers
  - [ ] Amendment/revocation powers

- [ ] **Step: Incapacity Provisions**
  - [ ] Definition of incapacity
  - [ ] Successor trustee activation
  - [ ] Medical certification requirements

### 2.2 State-Specific Requirements Tests

- [ ] Test trust formalities by state
- [ ] Test community property trust handling
- [ ] Test state trust taxation variations

### 2.3 PDF Generation Tests

- [ ] Trust agreement header/title
- [ ] Article numbering consistency
- [ ] Schedule A (initial assets)
- [ ] Signature blocks for all parties
- [ ] Notarization section

### 2.4 Snapshot Tests

```typescript
describe('Trust Document', () => {
  describe('Wizard Steps', () => {
    it('should have consistent step structure', () => {
      expect(TRUST_STEPS).toMatchSnapshot();
    });
  });

  describe('Asset Integration', () => {
    it('should correctly map financial accounts', () => {
      const mapped = mapFinancialAccountsToTrust(mockAccounts);
      expect(mapped).toMatchSnapshot();
    });
  });
});
```

---

## 3. Pour-Over Will

### 3.1 Wizard Steps Verification

- [ ] **Step: Personal Information**
  - [ ] Same as regular will
  - [ ] Link to existing trust required

- [ ] **Step: Trust Reference**
  - [ ] Trust name (from linked trust document)
  - [ ] Trust date
  - [ ] Validation that trust exists

- [ ] **Step: Executor Selection**
  - [ ] Should default to trust's successor trustee
  - [ ] Can override with different executor

- [ ] **Step: Guardian Selection** (if minor children)
  - [ ] Same as regular will

- [ ] **Step: Specific Bequests**
  - [ ] Items NOT in trust
  - [ ] Personal property allocations

- [ ] **Step: Pour-Over Clause**
  - [ ] Confirm all residuary goes to trust
  - [ ] Explanation of pour-over mechanism

### 3.2 Integration Tests

- [ ] Test trust document linkage
- [ ] Test consistency between trust and pour-over will
- [ ] Test executor/trustee alignment warnings

### 3.3 PDF Generation Tests

- [ ] Pour-over clause language
- [ ] Trust reference accuracy
- [ ] Coordination with trust document

### 3.4 Snapshot Tests

```typescript
describe('Pour-Over Will', () => {
  describe('Trust Integration', () => {
    it('should reference linked trust correctly', () => {
      const pourOver = generatePourOverWill(mockData, linkedTrust);
      expect(pourOver.trustReference).toMatchSnapshot();
    });
  });
});
```

---

## 4. Durable Financial Power of Attorney

### 4.1 Wizard Steps Verification

- [ ] **Step: Principal Information**
  - [ ] Full legal name
  - [ ] Address
  - [ ] State of residence

- [ ] **Step: Agent Selection**
  - [ ] Primary agent (required)
  - [ ] First alternate agent
  - [ ] Second alternate agent
  - [ ] Co-agents option

- [ ] **Step: Powers Granted**
  - [ ] Banking and financial
  - [ ] Real estate transactions
  - [ ] Business operations
  - [ ] Tax matters
  - [ ] Government benefits
  - [ ] Insurance
  - [ ] Gifts (with limitations)
  - [ ] Digital assets

- [ ] **Step: Effective Date**
  - [ ] Immediate effect
  - [ ] Springing (upon incapacity)
  - [ ] Incapacity determination method

- [ ] **Step: Limitations**
  - [ ] Gift limitations
  - [ ] Excluded powers
  - [ ] Reporting requirements

- [ ] **Step: Durability Clause**
  - [ ] Survives incapacity (required for "durable")
  - [ ] Termination conditions

- [ ] **Step: Compensation**
  - [ ] Agent compensation terms
  - [ ] Expense reimbursement

### 4.2 State-Specific Requirements Tests

- [ ] Test statutory form states
- [ ] Test Uniform Power of Attorney Act states
- [ ] Test witness requirements by state
- [ ] Test notarization requirements by state
- [ ] Test recording requirements for real estate powers

### 4.3 PDF Generation Tests

- [ ] Powers checklist format
- [ ] State-specific statutory language
- [ ] Agent acceptance section
- [ ] Third-party reliance provisions

### 4.4 Snapshot Tests

```typescript
describe('Financial POA', () => {
  describe('Powers Configuration', () => {
    it('should have consistent power definitions', () => {
      expect(FINANCIAL_POA_POWERS).toMatchSnapshot();
    });
  });

  describe('State Forms', () => {
    it('should use correct statutory form for each state', () => {
      US_STATES.forEach(state => {
        const form = getStatutoryForm(state, 'financial_poa');
        expect(form).toMatchSnapshot(`${state}-financial-poa-form`);
      });
    });
  });
});
```

---

## 5. Healthcare Power of Attorney

### 5.1 Wizard Steps Verification

- [ ] **Step: Principal Information**
  - [ ] Full legal name
  - [ ] Date of birth
  - [ ] Address

- [ ] **Step: Healthcare Agent Selection**
  - [ ] Primary healthcare agent
  - [ ] First alternate
  - [ ] Second alternate
  - [ ] Cannot be treating physician in most states

- [ ] **Step: Powers Granted**
  - [ ] All healthcare decisions
  - [ ] Mental health treatment
  - [ ] Organ donation decisions
  - [ ] Autopsy decisions
  - [ ] Disposition of remains

- [ ] **Step: HIPAA Authorization**
  - [ ] Access to medical records
  - [ ] Discuss with providers
  - [ ] Specific HIPAA release language

- [ ] **Step: Limitations**
  - [ ] Excluded treatments
  - [ ] Religious restrictions
  - [ ] Specific instructions

- [ ] **Step: Activation**
  - [ ] Upon incapacity only
  - [ ] Immediate activation option
  - [ ] Capacity determination process

### 5.2 State-Specific Requirements Tests

- [ ] Test state statutory form requirements
- [ ] Test witness requirements (varies 0-2)
- [ ] Test notarization requirements
- [ ] Test prohibited agent restrictions

### 5.3 PDF Generation Tests

- [ ] HIPAA authorization language
- [ ] State-specific statutory notices
- [ ] Agent powers clearly listed
- [ ] Signature/witness sections

### 5.4 Snapshot Tests

```typescript
describe('Healthcare POA', () => {
  describe('HIPAA Compliance', () => {
    it('should include required HIPAA language', () => {
      const pdf = generateHealthcarePOA(mockData);
      expect(pdf.hipaaSection).toMatchSnapshot();
    });
  });

  describe('Agent Restrictions', () => {
    it('should enforce state agent restrictions', () => {
      const restrictions = getAgentRestrictions('healthcare_poa');
      expect(restrictions).toMatchSnapshot();
    });
  });
});
```

---

## 6. Advance Healthcare Directive (Living Will)

### 6.1 Wizard Steps Verification

- [ ] **Step: Personal Information**
  - [ ] Full legal name
  - [ ] Date of birth
  - [ ] State of residence

- [ ] **Step: Life-Sustaining Treatment**
  - [ ] Terminal condition preferences
  - [ ] Permanent unconsciousness preferences
  - [ ] End-stage condition preferences

- [ ] **Step: Specific Treatments**
  - [ ] CPR/resuscitation
  - [ ] Mechanical ventilation
  - [ ] Artificial nutrition/hydration
  - [ ] Dialysis
  - [ ] Antibiotics
  - [ ] Blood transfusions

- [ ] **Step: Pain Management**
  - [ ] Comfort care always
  - [ ] Pain medication preferences
  - [ ] Hospice care preferences

- [ ] **Step: Organ Donation**
  - [ ] Donate all organs
  - [ ] Specific organs only
  - [ ] Decline donation
  - [ ] Research donation

- [ ] **Step: Additional Instructions**
  - [ ] Religious/spiritual preferences
  - [ ] Specific conditions/wishes
  - [ ] Who should be present

- [ ] **Step: Pregnancy Clause** (if applicable)
  - [ ] State-specific requirements
  - [ ] Override preferences during pregnancy

### 6.2 State-Specific Requirements Tests

- [ ] Test state-specific directive formats
- [ ] Test Five Wishes states
- [ ] Test POLST/MOLST integration
- [ ] Test pregnancy exception states

### 6.3 PDF Generation Tests

- [ ] Treatment preference checkboxes
- [ ] State-mandated language
- [ ] Witness requirements section
- [ ] Healthcare agent coordination

### 6.4 Snapshot Tests

```typescript
describe('Advance Directive', () => {
  describe('Treatment Options', () => {
    it('should have consistent treatment definitions', () => {
      expect(TREATMENT_OPTIONS).toMatchSnapshot();
    });
  });

  describe('State Variations', () => {
    it('should include required state language', () => {
      US_STATES.forEach(state => {
        const language = getStateRequiredLanguage(state, 'advance_directive');
        expect(language).toMatchSnapshot(`${state}-advance-directive-language`);
      });
    });
  });
});
```

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
| 2 | Will | ⬜ | ⬜ | ⬜ | ⬜ | ✅ |
| 3 | Trust | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| 4 | Pour-Over | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| 5 | Financial POA | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| 6 | Healthcare POA | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| 7 | Advance Directive | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |

**Legend**: ⬜ Not started | 🔄 In progress | ✅ Complete

---

## Notes

- All snapshot tests should be reviewed by legal team before finalizing
- State requirements data should be verified against current state laws
- PDF templates should be reviewed for legal compliance
- Consider accessibility requirements for document formats
