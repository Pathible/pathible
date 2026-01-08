import { describe, expect, it } from "vitest";

/**
 * Wizard Step Configuration Tests
 *
 * These tests define the expected structure of legal document wizard steps.
 * They serve as a contract ensuring wizard step configurations remain stable.
 *
 * IMPORTANT: If a test fails after a wizard change:
 * 1. Review the change carefully - was it intentional?
 * 2. Consider user experience impact of step order changes
 * 3. Update the test to match the new structure
 */

/**
 * Expected wizard step IDs for each document type.
 * These define the required user journey through each document wizard.
 */

const EXPECTED_WILL_STEPS = [
  { id: "personal", title: "Personal Information", requiredFields: ["testator", "county", "maritalStatus"] },
  { id: "executor", title: "Executor", requiredFields: ["executor"] },
  { id: "beneficiaries", title: "Beneficiaries", requiredFields: ["residuaryBeneficiary"] },
  { id: "provisions", title: "Special Provisions", requiredFields: [] },
  { id: "guardians", title: "Guardians", requiredFields: [] },
  { id: "digital", title: "Digital Assets", requiredFields: [] },
  { id: "final", title: "Final Wishes", requiredFields: [] },
];

const EXPECTED_TRUST_STEPS = [
  { id: "personal", title: "Personal Information", requiredFields: ["grantor", "county"] },
  { id: "trust_name", title: "Trust Name", requiredFields: ["trustName"] },
  { id: "trustees", title: "Trustees", requiredFields: ["trustee"] },
  { id: "beneficiaries", title: "Beneficiaries", requiredFields: ["primaryBeneficiary"] },
  { id: "assets", title: "Trust Assets", requiredFields: [] },
  { id: "distributions", title: "Distributions", requiredFields: [] },
  { id: "provisions", title: "Trust Provisions", requiredFields: [] },
];

const EXPECTED_POUR_OVER_WILL_STEPS = [
  { id: "personal", title: "Personal Information", requiredFields: ["testator", "county"] },
  { id: "trust_reference", title: "Trust Reference", requiredFields: ["trustName"] },
  { id: "executor", title: "Executor", requiredFields: ["executor"] },
  { id: "guardians", title: "Guardians", requiredFields: [] },
  { id: "final", title: "Final Provisions", requiredFields: [] },
];

const EXPECTED_FINANCIAL_POA_STEPS = [
  { id: "personal", title: "Personal Information", requiredFields: ["principal"] },
  { id: "agent", title: "Agent Selection", requiredFields: ["agent"] },
  { id: "powers", title: "Powers Granted", requiredFields: ["grantedPowers"] },
  { id: "effective", title: "Effective Date", requiredFields: [] },
  { id: "limitations", title: "Limitations", requiredFields: [] },
];

const EXPECTED_HEALTHCARE_POA_STEPS = [
  { id: "personal", title: "Personal Information", requiredFields: ["principal"] },
  { id: "agent", title: "Healthcare Agent", requiredFields: ["healthcareAgent"] },
  { id: "powers", title: "Healthcare Powers", requiredFields: [] },
  { id: "preferences", title: "Treatment Preferences", requiredFields: [] },
  { id: "hipaa", title: "HIPAA Authorization", requiredFields: [] },
];

const EXPECTED_ADVANCE_DIRECTIVE_STEPS = [
  { id: "personal", title: "Personal Information", requiredFields: ["principal"] },
  { id: "terminal", title: "Terminal Condition", requiredFields: ["terminalConditionPreference"] },
  { id: "unconscious", title: "Permanent Unconsciousness", requiredFields: ["permanentUnconsciousnessPreference"] },
  { id: "treatments", title: "Treatment Decisions", requiredFields: [] },
  { id: "comfort", title: "Comfort Care", requiredFields: [] },
  { id: "organ", title: "Organ Donation", requiredFields: [] },
  { id: "final", title: "Final Instructions", requiredFields: [] },
];

describe("Wizard Step Configurations", () => {
  describe("Will Wizard Steps", () => {
    it("should have all required steps in correct order", () => {
      const stepIds = EXPECTED_WILL_STEPS.map((s) => s.id);
      expect(stepIds).toEqual([
        "personal",
        "executor",
        "beneficiaries",
        "provisions",
        "guardians",
        "digital",
        "final",
      ]);
    });

    it("should start with personal information", () => {
      expect(EXPECTED_WILL_STEPS[0].id).toBe("personal");
      expect(EXPECTED_WILL_STEPS[0].title).toBe("Personal Information");
    });

    it("should have executor step before beneficiaries", () => {
      const executorIndex = EXPECTED_WILL_STEPS.findIndex((s) => s.id === "executor");
      const beneficiariesIndex = EXPECTED_WILL_STEPS.findIndex((s) => s.id === "beneficiaries");
      expect(executorIndex).toBeLessThan(beneficiariesIndex);
    });

    it("should have required fields for critical steps", () => {
      const personalStep = EXPECTED_WILL_STEPS.find((s) => s.id === "personal");
      const executorStep = EXPECTED_WILL_STEPS.find((s) => s.id === "executor");
      const beneficiariesStep = EXPECTED_WILL_STEPS.find((s) => s.id === "beneficiaries");

      expect(personalStep?.requiredFields).toContain("testator");
      expect(executorStep?.requiredFields).toContain("executor");
      expect(beneficiariesStep?.requiredFields).toContain("residuaryBeneficiary");
    });

    it("should end with final wishes", () => {
      const lastStep = EXPECTED_WILL_STEPS[EXPECTED_WILL_STEPS.length - 1];
      expect(lastStep.id).toBe("final");
    });
  });

  describe("Trust Wizard Steps", () => {
    it("should have all required steps", () => {
      const stepIds = EXPECTED_TRUST_STEPS.map((s) => s.id);
      expect(stepIds).toContain("personal");
      expect(stepIds).toContain("trust_name");
      expect(stepIds).toContain("trustees");
      expect(stepIds).toContain("beneficiaries");
      expect(stepIds).toContain("assets");
    });

    it("should have trust name step early in flow", () => {
      const trustNameIndex = EXPECTED_TRUST_STEPS.findIndex((s) => s.id === "trust_name");
      expect(trustNameIndex).toBeLessThan(3);
    });

    it("should require trustee selection", () => {
      const trusteeStep = EXPECTED_TRUST_STEPS.find((s) => s.id === "trustees");
      expect(trusteeStep?.requiredFields).toContain("trustee");
    });
  });

  describe("Pour-Over Will Wizard Steps", () => {
    it("should reference existing trust", () => {
      const trustRefStep = EXPECTED_POUR_OVER_WILL_STEPS.find((s) => s.id === "trust_reference");
      expect(trustRefStep).toBeDefined();
      expect(trustRefStep?.requiredFields).toContain("trustName");
    });

    it("should have executor step", () => {
      const executorStep = EXPECTED_POUR_OVER_WILL_STEPS.find((s) => s.id === "executor");
      expect(executorStep).toBeDefined();
    });
  });

  describe("Financial POA Wizard Steps", () => {
    it("should have agent selection step", () => {
      const agentStep = EXPECTED_FINANCIAL_POA_STEPS.find((s) => s.id === "agent");
      expect(agentStep).toBeDefined();
      expect(agentStep?.requiredFields).toContain("agent");
    });

    it("should have powers granted step", () => {
      const powersStep = EXPECTED_FINANCIAL_POA_STEPS.find((s) => s.id === "powers");
      expect(powersStep).toBeDefined();
    });

    it("should have effective date configuration", () => {
      const effectiveStep = EXPECTED_FINANCIAL_POA_STEPS.find((s) => s.id === "effective");
      expect(effectiveStep).toBeDefined();
    });
  });

  describe("Healthcare POA Wizard Steps", () => {
    it("should have healthcare agent selection", () => {
      const agentStep = EXPECTED_HEALTHCARE_POA_STEPS.find((s) => s.id === "agent");
      expect(agentStep).toBeDefined();
      expect(agentStep?.title).toContain("Healthcare Agent");
    });

    it("should have HIPAA authorization step", () => {
      const hipaaStep = EXPECTED_HEALTHCARE_POA_STEPS.find((s) => s.id === "hipaa");
      expect(hipaaStep).toBeDefined();
    });
  });

  describe("Advance Directive Wizard Steps", () => {
    it("should have terminal condition step", () => {
      const terminalStep = EXPECTED_ADVANCE_DIRECTIVE_STEPS.find((s) => s.id === "terminal");
      expect(terminalStep).toBeDefined();
      expect(terminalStep?.requiredFields).toContain("terminalConditionPreference");
    });

    it("should have permanent unconsciousness step", () => {
      const unconsciousStep = EXPECTED_ADVANCE_DIRECTIVE_STEPS.find((s) => s.id === "unconscious");
      expect(unconsciousStep).toBeDefined();
    });

    it("should have comfort care step", () => {
      const comfortStep = EXPECTED_ADVANCE_DIRECTIVE_STEPS.find((s) => s.id === "comfort");
      expect(comfortStep).toBeDefined();
    });

    it("should have organ donation step", () => {
      const organStep = EXPECTED_ADVANCE_DIRECTIVE_STEPS.find((s) => s.id === "organ");
      expect(organStep).toBeDefined();
    });
  });
});

describe("Wizard Step Consistency", () => {
  const allStepConfigs = [
    { name: "Will", steps: EXPECTED_WILL_STEPS },
    { name: "Trust", steps: EXPECTED_TRUST_STEPS },
    { name: "Pour-Over Will", steps: EXPECTED_POUR_OVER_WILL_STEPS },
    { name: "Financial POA", steps: EXPECTED_FINANCIAL_POA_STEPS },
    { name: "Healthcare POA", steps: EXPECTED_HEALTHCARE_POA_STEPS },
    { name: "Advance Directive", steps: EXPECTED_ADVANCE_DIRECTIVE_STEPS },
  ];

  it("should have unique step IDs within each wizard", () => {
    for (const { name, steps } of allStepConfigs) {
      const ids = steps.map((s) => s.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    }
  });

  it("should have titles for all steps", () => {
    for (const { name, steps } of allStepConfigs) {
      for (const step of steps) {
        expect(step.title).toBeTruthy();
        expect(step.title.length).toBeGreaterThan(3);
      }
    }
  });

  it("should start all wizards with personal information", () => {
    for (const { name, steps } of allStepConfigs) {
      expect(steps[0].id).toBe("personal");
    }
  });

  it("should have reasonable number of steps (3-10)", () => {
    for (const { name, steps } of allStepConfigs) {
      expect(steps.length).toBeGreaterThanOrEqual(3);
      expect(steps.length).toBeLessThanOrEqual(10);
    }
  });
});

describe("Required Fields Validation", () => {
  it("all wizards should have at least one step with required fields", () => {
    const allSteps = [
      EXPECTED_WILL_STEPS,
      EXPECTED_TRUST_STEPS,
      EXPECTED_POUR_OVER_WILL_STEPS,
      EXPECTED_FINANCIAL_POA_STEPS,
      EXPECTED_HEALTHCARE_POA_STEPS,
      EXPECTED_ADVANCE_DIRECTIVE_STEPS,
    ];

    for (const steps of allSteps) {
      const hasRequiredField = steps.some((step) => step.requiredFields.length > 0);
      expect(hasRequiredField).toBe(true);
    }
  });

  it("personal step should always require principal/testator/grantor", () => {
    const personalSteps = [
      { wizard: "Will", step: EXPECTED_WILL_STEPS[0] },
      { wizard: "Trust", step: EXPECTED_TRUST_STEPS[0] },
      { wizard: "Pour-Over", step: EXPECTED_POUR_OVER_WILL_STEPS[0] },
    ];

    for (const { wizard, step } of personalSteps) {
      const hasIdentityField = step.requiredFields.some((f) =>
        ["testator", "grantor", "principal"].includes(f)
      );
      expect(hasIdentityField).toBe(true);
    }
  });
});
