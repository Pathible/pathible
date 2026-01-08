import { describe, expect, it } from "vitest";
import {
  ADVANCE_DIRECTIVE_ARTICLE_SECTIONS,
  ADVANCE_DIRECTIVE_OPTIONAL_FIELDS,
  ADVANCE_DIRECTIVE_REQUIRED_FIELDS,
  // Advance Directive
  ADVANCE_DIRECTIVE_TEMPLATE_INFO,
  FINANCIAL_POA_ARTICLE_SECTIONS,
  FINANCIAL_POA_OPTIONAL_FIELDS,
  FINANCIAL_POA_REQUIRED_FIELDS,
  // Financial POA
  FINANCIAL_POA_TEMPLATE_INFO,
  HEALTHCARE_POA_ARTICLE_SECTIONS,
  HEALTHCARE_POA_REQUIRED_FIELDS,
  // Healthcare POA
  HEALTHCARE_POA_TEMPLATE_INFO,
  POUR_OVER_WILL_REQUIRED_FIELDS,
  // Pour-Over Will
  POUR_OVER_WILL_TEMPLATE_INFO,
  TRUST_ARTICLE_SECTIONS,
  TRUST_OPTIONAL_FIELDS,
  TRUST_REQUIRED_FIELDS,
  // Trust
  TRUST_TEMPLATE_INFO,
  WILL_ARTICLE_SECTIONS,
  WILL_OPTIONAL_FIELDS,
  WILL_REQUIRED_FIELDS,
  // Will
  WILL_TEMPLATE_INFO,
} from "../document-templates";

/**
 * Document Template Tests
 *
 * These tests verify that document template structures remain stable.
 * Any changes to these templates should be intentional and reviewed.
 *
 * IMPORTANT: If a test fails after a template change:
 * 1. Review the change carefully
 * 2. Consider backward compatibility for existing documents
 * 3. Update the test to match the new structure
 */

describe("Document Templates", () => {
  describe("Will Template", () => {
    it("should have stable template info", () => {
      expect(WILL_TEMPLATE_INFO).toMatchObject({
        id: "will",
        name: "Last Will and Testament",
        requiresNotary: false,
        requiresWitnesses: true,
        defaultWitnessCount: 2,
      });
    });

    it("should have required fields defined", () => {
      expect(WILL_REQUIRED_FIELDS).toContain("fullName");
      expect(WILL_REQUIRED_FIELDS).toContain("state");
      expect(WILL_REQUIRED_FIELDS).toContain("executorName");
      expect(WILL_REQUIRED_FIELDS).toContain("residuaryBeneficiary");
      expect(WILL_REQUIRED_FIELDS.length).toBeGreaterThan(5);
    });

    it("should have optional fields for common scenarios", () => {
      expect(WILL_OPTIONAL_FIELDS).toContain("spouseName");
      expect(WILL_OPTIONAL_FIELDS).toContain("guardianName");
      expect(WILL_OPTIONAL_FIELDS).toContain("specificBequests");
      expect(WILL_OPTIONAL_FIELDS).toContain("digitalAssetsInstructions");
    });

    it("should have article sections in correct order", () => {
      const sectionIds = WILL_ARTICLE_SECTIONS.map((s) => s.id);

      // Declaration should be first
      expect(sectionIds[0]).toBe("declaration");

      // Executor should come before specific bequests
      const executorIndex = sectionIds.indexOf("executor");
      const bequestsIndex = sectionIds.indexOf("specific_bequests");
      expect(executorIndex).toBeLessThan(bequestsIndex);

      // Should have required sections
      const requiredSections = WILL_ARTICLE_SECTIONS.filter((s) => s.required);
      expect(requiredSections.length).toBeGreaterThan(5);
    });

    it("should have guardian section with condition", () => {
      const guardianSection = WILL_ARTICLE_SECTIONS.find((s) => s.id === "guardian");
      expect(guardianSection).toBeDefined();
      expect(guardianSection?.condition).toBe("hasMinorChildren");
      expect(guardianSection?.required).toBe(false);
    });
  });

  describe("Trust Template", () => {
    it("should have stable template info", () => {
      expect(TRUST_TEMPLATE_INFO).toMatchObject({
        id: "revocable_trust",
        name: "Revocable Living Trust",
        requiresNotary: true,
        requiresWitnesses: false,
      });
    });

    it("should have required fields defined", () => {
      expect(TRUST_REQUIRED_FIELDS).toContain("fullName");
      expect(TRUST_REQUIRED_FIELDS).toContain("state");
      expect(TRUST_REQUIRED_FIELDS).toContain("trustName");
      expect(TRUST_REQUIRED_FIELDS).toContain("trusteeName");
      expect(TRUST_REQUIRED_FIELDS.length).toBeGreaterThan(3);
    });

    it("should have trust-specific optional fields", () => {
      expect(TRUST_OPTIONAL_FIELDS).toContain("successorTrusteeRelationship");
      expect(TRUST_OPTIONAL_FIELDS).toContain("initialAssets");
      expect(TRUST_OPTIONAL_FIELDS).toContain("spendthriftProvision");
    });

    it("should have article sections", () => {
      expect(TRUST_ARTICLE_SECTIONS.length).toBeGreaterThan(5);
      const sectionIds = TRUST_ARTICLE_SECTIONS.map((s) => s.id);
      expect(sectionIds).toContain("declaration");
      expect(sectionIds).toContain("trust_property");
      expect(sectionIds).toContain("trustee_powers");
    });
  });

  describe("Pour-Over Will Template", () => {
    it("should have stable template info", () => {
      expect(POUR_OVER_WILL_TEMPLATE_INFO).toMatchObject({
        id: "pour_over_will",
        name: "Pour-Over Will",
      });
    });

    it("should require trust reference", () => {
      expect(POUR_OVER_WILL_REQUIRED_FIELDS).toContain("trustName");
    });
  });

  describe("Financial POA Template", () => {
    it("should have stable template info", () => {
      expect(FINANCIAL_POA_TEMPLATE_INFO).toMatchObject({
        id: "financial_poa",
        name: "Durable Financial Power of Attorney",
        requiresNotary: true,
        requiresWitnesses: true,
      });
    });

    it("should have required fields", () => {
      expect(FINANCIAL_POA_REQUIRED_FIELDS).toContain("fullName");
      expect(FINANCIAL_POA_REQUIRED_FIELDS).toContain("agentName");
      expect(FINANCIAL_POA_REQUIRED_FIELDS).toContain("grantedPowers");
    });

    it("should have optional fields for power categories", () => {
      expect(FINANCIAL_POA_OPTIONAL_FIELDS).toContain("bankingPowers");
      expect(FINANCIAL_POA_OPTIONAL_FIELDS).toContain("investmentPowers");
      expect(FINANCIAL_POA_OPTIONAL_FIELDS).toContain("realEstatePowers");
      expect(FINANCIAL_POA_OPTIONAL_FIELDS).toContain("taxPowers");
      expect(FINANCIAL_POA_OPTIONAL_FIELDS).toContain("giftingPowers");
    });

    it("should have article sections for powers", () => {
      const sectionIds = FINANCIAL_POA_ARTICLE_SECTIONS.map((s) => s.id);
      expect(sectionIds).toContain("banking_powers");
      expect(sectionIds).toContain("real_estate_powers");
      expect(sectionIds).toContain("tax_powers");
      expect(sectionIds).toContain("gifting_powers");
    });
  });

  describe("Healthcare POA Template", () => {
    it("should have stable template info", () => {
      expect(HEALTHCARE_POA_TEMPLATE_INFO).toMatchObject({
        id: "healthcare_poa",
        name: "Healthcare Power of Attorney",
        requiresNotary: false,
        requiresWitnesses: true,
      });
    });

    it("should have required fields", () => {
      expect(HEALTHCARE_POA_REQUIRED_FIELDS).toContain("fullName");
      expect(HEALTHCARE_POA_REQUIRED_FIELDS).toContain("agentName");
      expect(HEALTHCARE_POA_REQUIRED_FIELDS).toContain("agentAddress");
    });

    it("should have article sections for healthcare decisions", () => {
      const sectionIds = HEALTHCARE_POA_ARTICLE_SECTIONS.map((s) => s.id);
      expect(sectionIds).toContain("agent_appointment");
      expect(sectionIds).toContain("general_powers");
      expect(sectionIds).toContain("hipaa");
    });
  });

  describe("Advance Directive Template", () => {
    it("should have stable template info", () => {
      expect(ADVANCE_DIRECTIVE_TEMPLATE_INFO).toMatchObject({
        id: "advance_directive",
        name: "Advance Healthcare Directive",
        requiresNotary: false,
        requiresWitnesses: true,
      });
    });

    it("should have required fields", () => {
      expect(ADVANCE_DIRECTIVE_REQUIRED_FIELDS).toContain("fullName");
      expect(ADVANCE_DIRECTIVE_REQUIRED_FIELDS).toContain("terminalConditionPreference");
      expect(ADVANCE_DIRECTIVE_REQUIRED_FIELDS).toContain("permanentUnconsciousnessPreference");
    });

    it("should have treatment options in optional fields", () => {
      expect(ADVANCE_DIRECTIVE_OPTIONAL_FIELDS).toContain("cardiopulmonaryResuscitation");
      expect(ADVANCE_DIRECTIVE_OPTIONAL_FIELDS).toContain("mechanicalVentilation");
      expect(ADVANCE_DIRECTIVE_OPTIONAL_FIELDS).toContain("artificialNutrition");
      expect(ADVANCE_DIRECTIVE_OPTIONAL_FIELDS).toContain("dialysis");
    });

    it("should have article sections for end-of-life preferences", () => {
      const sectionIds = ADVANCE_DIRECTIVE_ARTICLE_SECTIONS.map((s) => s.id);
      expect(sectionIds).toContain("terminal_condition");
      expect(sectionIds).toContain("permanent_unconsciousness");
      expect(sectionIds).toContain("pain_management");
      expect(sectionIds).toContain("organ_donation");
    });
  });
});

/**
 * Cross-Template Consistency Tests
 */
describe("Template Consistency", () => {
  const allTemplateInfos = [
    WILL_TEMPLATE_INFO,
    TRUST_TEMPLATE_INFO,
    POUR_OVER_WILL_TEMPLATE_INFO,
    FINANCIAL_POA_TEMPLATE_INFO,
    HEALTHCARE_POA_TEMPLATE_INFO,
    ADVANCE_DIRECTIVE_TEMPLATE_INFO,
  ];

  it("should have unique template IDs", () => {
    const ids = allTemplateInfos.map((t) => t.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it("should have names for all templates", () => {
    for (const template of allTemplateInfos) {
      expect(template.name).toBeTruthy();
      expect(template.name.length).toBeGreaterThan(5);
    }
  });

  it("should have descriptions for all templates", () => {
    for (const template of allTemplateInfos) {
      expect(template.description).toBeTruthy();
      expect(template.description.length).toBeGreaterThan(20);
    }
  });

  it("should have categories for all templates", () => {
    for (const template of allTemplateInfos) {
      expect(template.category).toBeTruthy();
    }
  });
});

/**
 * Required Fields Consistency Tests
 */
describe("Required Fields Consistency", () => {
  const allRequiredFields = [
    { name: "Will", fields: WILL_REQUIRED_FIELDS },
    { name: "Trust", fields: TRUST_REQUIRED_FIELDS },
    { name: "Pour-Over Will", fields: POUR_OVER_WILL_REQUIRED_FIELDS },
    { name: "Financial POA", fields: FINANCIAL_POA_REQUIRED_FIELDS },
    { name: "Healthcare POA", fields: HEALTHCARE_POA_REQUIRED_FIELDS },
    { name: "Advance Directive", fields: ADVANCE_DIRECTIVE_REQUIRED_FIELDS },
  ];

  it("should require fullName for all document types", () => {
    for (const { name, fields } of allRequiredFields) {
      expect(fields).toContain("fullName");
    }
  });

  it("should require state for estate planning documents", () => {
    expect(WILL_REQUIRED_FIELDS).toContain("state");
    expect(TRUST_REQUIRED_FIELDS).toContain("state");
  });

  it("should have no duplicate required fields within a template", () => {
    for (const { name, fields } of allRequiredFields) {
      const uniqueFields = new Set(fields);
      expect(uniqueFields.size).toBe(fields.length);
    }
  });
});
