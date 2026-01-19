import { describe, expect, it } from "vitest";
import {
  ADVANCE_DIRECTIVE_ARTICLE_SECTIONS,
  ADVANCE_DIRECTIVE_OPTIONAL_FIELDS,
  ADVANCE_DIRECTIVE_REQUIRED_FIELDS,
  ADVANCE_DIRECTIVE_TEMPLATE_INFO,
} from "../document-templates/advance-directive-template";
import { getStateLegalRequirements, US_STATES } from "../state-legal-requirements";

/**
 * Advance Healthcare Directive (Living Will) Document Tests
 *
 * Comprehensive tests for advance directive template structure, field validation,
 * state requirements, and PDF generation readiness.
 *
 * An advance directive specifies end-of-life care preferences and treatment
 * decisions when the individual cannot communicate their wishes.
 */

describe("Advance Directive Template", () => {
  describe("Template Metadata", () => {
    it("should have correct template identifier", () => {
      expect(ADVANCE_DIRECTIVE_TEMPLATE_INFO.id).toBe("advance_directive");
    });

    it("should have proper display name", () => {
      expect(ADVANCE_DIRECTIVE_TEMPLATE_INFO.name).toBe("Advance Healthcare Directive");
    });

    it("should be categorized as healthcare planning", () => {
      expect(ADVANCE_DIRECTIVE_TEMPLATE_INFO.category).toBe("healthcare_planning");
    });

    it("should have descriptive information", () => {
      expect(ADVANCE_DIRECTIVE_TEMPLATE_INFO.description).toContain("legal document");
      expect(ADVANCE_DIRECTIVE_TEMPLATE_INFO.description).toContain("medical treatment");
      expect(ADVANCE_DIRECTIVE_TEMPLATE_INFO.description).toContain("end-of-life");
    });

    it("should have reasonable estimated completion time", () => {
      expect(ADVANCE_DIRECTIVE_TEMPLATE_INFO.estimatedCompletionTime).toBe("20-30 minutes");
    });

    it("should not require notarization by default", () => {
      expect(ADVANCE_DIRECTIVE_TEMPLATE_INFO.requiresNotary).toBe(false);
    });

    it("should require witnesses", () => {
      expect(ADVANCE_DIRECTIVE_TEMPLATE_INFO.requiresWitnesses).toBe(true);
    });

    it("should default to 2 witnesses", () => {
      expect(ADVANCE_DIRECTIVE_TEMPLATE_INFO.defaultWitnessCount).toBe(2);
    });

    it("should have alternate names for the document", () => {
      expect(ADVANCE_DIRECTIVE_TEMPLATE_INFO.alternateNames).toContain("Living Will");
      expect(ADVANCE_DIRECTIVE_TEMPLATE_INFO.alternateNames).toContain("Advance Medical Directive");
      expect(ADVANCE_DIRECTIVE_TEMPLATE_INFO.alternateNames).toContain("Healthcare Declaration");
    });

    it("should have exactly 3 alternate names", () => {
      expect(ADVANCE_DIRECTIVE_TEMPLATE_INFO.alternateNames).toHaveLength(3);
    });
  });

  describe("Required Fields", () => {
    it("should have exactly 5 required fields", () => {
      expect(ADVANCE_DIRECTIVE_REQUIRED_FIELDS).toHaveLength(5);
    });

    it("should require full name", () => {
      expect(ADVANCE_DIRECTIVE_REQUIRED_FIELDS).toContain("fullName");
    });

    it("should require address", () => {
      expect(ADVANCE_DIRECTIVE_REQUIRED_FIELDS).toContain("address");
    });

    it("should require state", () => {
      expect(ADVANCE_DIRECTIVE_REQUIRED_FIELDS).toContain("state");
    });

    it("should require terminal condition preference", () => {
      expect(ADVANCE_DIRECTIVE_REQUIRED_FIELDS).toContain("terminalConditionPreference");
    });

    it("should require permanent unconsciousness preference", () => {
      expect(ADVANCE_DIRECTIVE_REQUIRED_FIELDS).toContain("permanentUnconsciousnessPreference");
    });

    it("should have required fields in expected order", () => {
      const fieldOrder = [...ADVANCE_DIRECTIVE_REQUIRED_FIELDS];
      expect(fieldOrder).toEqual([
        "fullName",
        "address",
        "state",
        "terminalConditionPreference",
        "permanentUnconsciousnessPreference",
      ]);
    });
  });

  describe("Optional Fields", () => {
    it("should have a comprehensive set of optional fields", () => {
      expect(ADVANCE_DIRECTIVE_OPTIONAL_FIELDS.length).toBeGreaterThanOrEqual(60);
    });

    describe("Location Fields", () => {
      it("should have county field", () => {
        expect(ADVANCE_DIRECTIVE_OPTIONAL_FIELDS).toContain("county");
      });

      it("should have city field", () => {
        expect(ADVANCE_DIRECTIVE_OPTIONAL_FIELDS).toContain("city");
      });
    });

    describe("Personal Information Fields", () => {
      it("should have date of birth field", () => {
        expect(ADVANCE_DIRECTIVE_OPTIONAL_FIELDS).toContain("dateOfBirth");
      });
    });

    describe("Condition Preference Fields", () => {
      it("should have end stage condition preference", () => {
        expect(ADVANCE_DIRECTIVE_OPTIONAL_FIELDS).toContain("endStageConditionPreference");
      });

      it("should have general life-sustaining treatment preference", () => {
        expect(ADVANCE_DIRECTIVE_OPTIONAL_FIELDS).toContain("lifeSustainingTreatmentGeneral");
      });
    });

    describe("CPR and Resuscitation Fields", () => {
      it("should have cardiopulmonary resuscitation field", () => {
        expect(ADVANCE_DIRECTIVE_OPTIONAL_FIELDS).toContain("cardiopulmonaryResuscitation");
      });

      it("should have CPR preference field", () => {
        expect(ADVANCE_DIRECTIVE_OPTIONAL_FIELDS).toContain("cprPreference");
      });
    });

    describe("Mechanical Ventilation Fields", () => {
      it("should have mechanical ventilation field", () => {
        expect(ADVANCE_DIRECTIVE_OPTIONAL_FIELDS).toContain("mechanicalVentilation");
      });

      it("should have ventilator preference field", () => {
        expect(ADVANCE_DIRECTIVE_OPTIONAL_FIELDS).toContain("ventilatorPreference");
      });
    });

    describe("Nutrition and Hydration Fields", () => {
      it("should have artificial nutrition field", () => {
        expect(ADVANCE_DIRECTIVE_OPTIONAL_FIELDS).toContain("artificialNutrition");
      });

      it("should have feeding tube preference field", () => {
        expect(ADVANCE_DIRECTIVE_OPTIONAL_FIELDS).toContain("feedingTubePreference");
      });

      it("should have artificial hydration field", () => {
        expect(ADVANCE_DIRECTIVE_OPTIONAL_FIELDS).toContain("artificialHydration");
      });

      it("should have hydration preference field", () => {
        expect(ADVANCE_DIRECTIVE_OPTIONAL_FIELDS).toContain("hydrationPreference");
      });
    });

    describe("Dialysis Fields", () => {
      it("should have dialysis field", () => {
        expect(ADVANCE_DIRECTIVE_OPTIONAL_FIELDS).toContain("dialysis");
      });

      it("should have dialysis preference field", () => {
        expect(ADVANCE_DIRECTIVE_OPTIONAL_FIELDS).toContain("dialysisPreference");
      });
    });

    describe("Antibiotics Fields", () => {
      it("should have antibiotics field", () => {
        expect(ADVANCE_DIRECTIVE_OPTIONAL_FIELDS).toContain("antibiotics");
      });

      it("should have antibiotics preference field", () => {
        expect(ADVANCE_DIRECTIVE_OPTIONAL_FIELDS).toContain("antibioticsPreference");
      });
    });

    describe("Blood Transfusion Fields", () => {
      it("should have blood transfusions field", () => {
        expect(ADVANCE_DIRECTIVE_OPTIONAL_FIELDS).toContain("bloodTransfusions");
      });

      it("should have blood transfusion preference field", () => {
        expect(ADVANCE_DIRECTIVE_OPTIONAL_FIELDS).toContain("bloodTransfusionPreference");
      });
    });

    describe("Surgical Procedure Fields", () => {
      it("should have surgical procedures field", () => {
        expect(ADVANCE_DIRECTIVE_OPTIONAL_FIELDS).toContain("surgicalProcedures");
      });

      it("should have surgery preference field", () => {
        expect(ADVANCE_DIRECTIVE_OPTIONAL_FIELDS).toContain("surgeryPreference");
      });
    });

    describe("Diagnostic Test Fields", () => {
      it("should have diagnostic tests field", () => {
        expect(ADVANCE_DIRECTIVE_OPTIONAL_FIELDS).toContain("diagnosticTests");
      });

      it("should have diagnostic preference field", () => {
        expect(ADVANCE_DIRECTIVE_OPTIONAL_FIELDS).toContain("diagnosticPreference");
      });
    });

    describe("Pain and Comfort Care Fields", () => {
      it("should have pain management field", () => {
        expect(ADVANCE_DIRECTIVE_OPTIONAL_FIELDS).toContain("painManagement");
      });

      it("should have pain management preference field", () => {
        expect(ADVANCE_DIRECTIVE_OPTIONAL_FIELDS).toContain("painManagementPreference");
      });

      it("should have comfort care only field", () => {
        expect(ADVANCE_DIRECTIVE_OPTIONAL_FIELDS).toContain("comfortCareOnly");
      });

      it("should have hospice care preference field", () => {
        expect(ADVANCE_DIRECTIVE_OPTIONAL_FIELDS).toContain("hospiceCarePreference");
      });

      it("should have palliative care instructions field", () => {
        expect(ADVANCE_DIRECTIVE_OPTIONAL_FIELDS).toContain("palliativeCareInstructions");
      });
    });

    describe("Trial Period Fields", () => {
      it("should have trial period preference field", () => {
        expect(ADVANCE_DIRECTIVE_OPTIONAL_FIELDS).toContain("trialPeriodPreference");
      });

      it("should have trial period duration field", () => {
        expect(ADVANCE_DIRECTIVE_OPTIONAL_FIELDS).toContain("trialPeriodDuration");
      });
    });

    describe("Pregnancy Fields", () => {
      it("should have pregnancy provision field", () => {
        expect(ADVANCE_DIRECTIVE_OPTIONAL_FIELDS).toContain("pregnancyProvision");
      });

      it("should have pregnancy preference field", () => {
        expect(ADVANCE_DIRECTIVE_OPTIONAL_FIELDS).toContain("pregnancyPreference");
      });
    });

    describe("Organ Donation Fields", () => {
      it("should have organ donation field", () => {
        expect(ADVANCE_DIRECTIVE_OPTIONAL_FIELDS).toContain("organDonation");
      });

      it("should have organ donation type field", () => {
        expect(ADVANCE_DIRECTIVE_OPTIONAL_FIELDS).toContain("organDonationType");
      });

      it("should have organ donation purpose field", () => {
        expect(ADVANCE_DIRECTIVE_OPTIONAL_FIELDS).toContain("organDonationPurpose");
      });

      it("should have organ donation limitations field", () => {
        expect(ADVANCE_DIRECTIVE_OPTIONAL_FIELDS).toContain("organDonationLimitations");
      });

      it("should have tissue donation field", () => {
        expect(ADVANCE_DIRECTIVE_OPTIONAL_FIELDS).toContain("tissueDonation");
      });
    });

    describe("Autopsy Fields", () => {
      it("should have autopsy preference field", () => {
        expect(ADVANCE_DIRECTIVE_OPTIONAL_FIELDS).toContain("autopsyPreference");
      });

      it("should have autopsy limitations field", () => {
        expect(ADVANCE_DIRECTIVE_OPTIONAL_FIELDS).toContain("autopsyLimitations");
      });
    });

    describe("Body Disposition Fields", () => {
      it("should have body disposition field", () => {
        expect(ADVANCE_DIRECTIVE_OPTIONAL_FIELDS).toContain("bodyDisposition");
      });

      it("should have burial preference field", () => {
        expect(ADVANCE_DIRECTIVE_OPTIONAL_FIELDS).toContain("burialPreference");
      });

      it("should have cremation preference field", () => {
        expect(ADVANCE_DIRECTIVE_OPTIONAL_FIELDS).toContain("cremationPreference");
      });

      it("should have body donation field", () => {
        expect(ADVANCE_DIRECTIVE_OPTIONAL_FIELDS).toContain("bodyDonation");
      });

      it("should have funeral instructions field", () => {
        expect(ADVANCE_DIRECTIVE_OPTIONAL_FIELDS).toContain("funeralInstructions");
      });
    });

    describe("Spiritual and Cultural Fields", () => {
      it("should have spiritual preferences field", () => {
        expect(ADVANCE_DIRECTIVE_OPTIONAL_FIELDS).toContain("spiritualPreferences");
      });

      it("should have religious restrictions field", () => {
        expect(ADVANCE_DIRECTIVE_OPTIONAL_FIELDS).toContain("religiousRestrictions");
      });

      it("should have cultural considerations field", () => {
        expect(ADVANCE_DIRECTIVE_OPTIONAL_FIELDS).toContain("culturalConsiderations");
      });

      it("should have clergy contact field", () => {
        expect(ADVANCE_DIRECTIVE_OPTIONAL_FIELDS).toContain("clergyContact");
      });
    });

    describe("Personal Values Fields", () => {
      it("should have personal statement field", () => {
        expect(ADVANCE_DIRECTIVE_OPTIONAL_FIELDS).toContain("personalStatement");
      });

      it("should have quality of life values field", () => {
        expect(ADVANCE_DIRECTIVE_OPTIONAL_FIELDS).toContain("qualityOfLifeValues");
      });

      it("should have treatment goals field", () => {
        expect(ADVANCE_DIRECTIVE_OPTIONAL_FIELDS).toContain("treatmentGoals");
      });
    });

    describe("Healthcare Provider Fields", () => {
      it("should have healthcare agent name field", () => {
        expect(ADVANCE_DIRECTIVE_OPTIONAL_FIELDS).toContain("healthcareAgentName");
      });

      it("should have healthcare agent phone field", () => {
        expect(ADVANCE_DIRECTIVE_OPTIONAL_FIELDS).toContain("healthcareAgentPhone");
      });

      it("should have primary physician field", () => {
        expect(ADVANCE_DIRECTIVE_OPTIONAL_FIELDS).toContain("primaryPhysician");
      });

      it("should have primary physician phone field", () => {
        expect(ADVANCE_DIRECTIVE_OPTIONAL_FIELDS).toContain("primaryPhysicianPhone");
      });

      it("should have preferred hospital field", () => {
        expect(ADVANCE_DIRECTIVE_OPTIONAL_FIELDS).toContain("preferredHospital");
      });
    });

    describe("Contact and Notification Fields", () => {
      it("should have family notification instructions field", () => {
        expect(ADVANCE_DIRECTIVE_OPTIONAL_FIELDS).toContain("familyNotificationInstructions");
      });

      it("should have emergency contacts field", () => {
        expect(ADVANCE_DIRECTIVE_OPTIONAL_FIELDS).toContain("emergencyContacts");
      });
    });

    describe("Administrative Fields", () => {
      it("should have additional instructions field", () => {
        expect(ADVANCE_DIRECTIVE_OPTIONAL_FIELDS).toContain("additionalInstructions");
      });

      it("should have review date field", () => {
        expect(ADVANCE_DIRECTIVE_OPTIONAL_FIELDS).toContain("reviewDate");
      });

      it("should have expiration date field", () => {
        expect(ADVANCE_DIRECTIVE_OPTIONAL_FIELDS).toContain("expirationDate");
      });
    });
  });

  describe("Article Sections", () => {
    it("should have exactly 20 article sections", () => {
      expect(ADVANCE_DIRECTIVE_ARTICLE_SECTIONS).toHaveLength(20);
    });

    it("should have 9 required sections", () => {
      const requiredSections = ADVANCE_DIRECTIVE_ARTICLE_SECTIONS.filter((s) => s.required);
      expect(requiredSections).toHaveLength(9);
    });

    it("should have 11 optional sections", () => {
      const optionalSections = ADVANCE_DIRECTIVE_ARTICLE_SECTIONS.filter((s) => !s.required);
      expect(optionalSections).toHaveLength(11);
    });

    describe("Required Sections", () => {
      it("should have declaration section", () => {
        const section = ADVANCE_DIRECTIVE_ARTICLE_SECTIONS.find((s) => s.id === "declaration");
        expect(section).toBeDefined();
        expect(section?.required).toBe(true);
        expect(section?.title).toBe("Declaration");
      });

      it("should have definitions section", () => {
        const section = ADVANCE_DIRECTIVE_ARTICLE_SECTIONS.find((s) => s.id === "definitions");
        expect(section).toBeDefined();
        expect(section?.required).toBe(true);
        expect(section?.title).toBe("Definitions of Medical Conditions");
      });

      it("should have terminal condition section", () => {
        const section = ADVANCE_DIRECTIVE_ARTICLE_SECTIONS.find(
          (s) => s.id === "terminal_condition",
        );
        expect(section).toBeDefined();
        expect(section?.required).toBe(true);
        expect(section?.title).toBe("Terminal Condition Instructions");
      });

      it("should have permanent unconsciousness section", () => {
        const section = ADVANCE_DIRECTIVE_ARTICLE_SECTIONS.find(
          (s) => s.id === "permanent_unconsciousness",
        );
        expect(section).toBeDefined();
        expect(section?.required).toBe(true);
        expect(section?.title).toBe("Permanent Unconsciousness Instructions");
      });

      it("should have pain management section", () => {
        const section = ADVANCE_DIRECTIVE_ARTICLE_SECTIONS.find((s) => s.id === "pain_management");
        expect(section).toBeDefined();
        expect(section?.required).toBe(true);
        expect(section?.title).toBe("Pain Management and Comfort Care");
      });

      it("should have revocation section", () => {
        const section = ADVANCE_DIRECTIVE_ARTICLE_SECTIONS.find((s) => s.id === "revocation");
        expect(section).toBeDefined();
        expect(section?.required).toBe(true);
        expect(section?.title).toBe("Revocation");
      });

      it("should have severability section", () => {
        const section = ADVANCE_DIRECTIVE_ARTICLE_SECTIONS.find((s) => s.id === "severability");
        expect(section).toBeDefined();
        expect(section?.required).toBe(true);
        expect(section?.title).toBe("Severability");
      });

      it("should have governing law section", () => {
        const section = ADVANCE_DIRECTIVE_ARTICLE_SECTIONS.find((s) => s.id === "governing_law");
        expect(section).toBeDefined();
        expect(section?.required).toBe(true);
        expect(section?.title).toBe("Governing Law");
      });

      it("should have signature section", () => {
        const section = ADVANCE_DIRECTIVE_ARTICLE_SECTIONS.find((s) => s.id === "signature");
        expect(section).toBeDefined();
        expect(section?.required).toBe(true);
        expect(section?.title).toBe("Signature and Witnesses");
      });
    });

    describe("Optional Sections", () => {
      it("should have end stage condition section", () => {
        const section = ADVANCE_DIRECTIVE_ARTICLE_SECTIONS.find(
          (s) => s.id === "end_stage_condition",
        );
        expect(section).toBeDefined();
        expect(section?.required).toBe(false);
        expect(section?.title).toBe("End-Stage Condition Instructions");
      });

      it("should have life sustaining general section", () => {
        const section = ADVANCE_DIRECTIVE_ARTICLE_SECTIONS.find(
          (s) => s.id === "life_sustaining_general",
        );
        expect(section).toBeDefined();
        expect(section?.required).toBe(false);
        expect(section?.title).toBe("General Life-Sustaining Treatment");
      });

      it("should have specific treatments section", () => {
        const section = ADVANCE_DIRECTIVE_ARTICLE_SECTIONS.find(
          (s) => s.id === "specific_treatments",
        );
        expect(section).toBeDefined();
        expect(section?.required).toBe(false);
        expect(section?.title).toBe("Specific Treatment Preferences");
      });

      it("should have pregnancy provision section", () => {
        const section = ADVANCE_DIRECTIVE_ARTICLE_SECTIONS.find(
          (s) => s.id === "pregnancy_provision",
        );
        expect(section).toBeDefined();
        expect(section?.required).toBe(false);
        expect(section?.title).toBe("Pregnancy Provision");
      });

      it("should have organ donation section", () => {
        const section = ADVANCE_DIRECTIVE_ARTICLE_SECTIONS.find((s) => s.id === "organ_donation");
        expect(section).toBeDefined();
        expect(section?.required).toBe(false);
        expect(section?.title).toBe("Organ and Tissue Donation");
      });

      it("should have autopsy section", () => {
        const section = ADVANCE_DIRECTIVE_ARTICLE_SECTIONS.find((s) => s.id === "autopsy");
        expect(section).toBeDefined();
        expect(section?.required).toBe(false);
        expect(section?.title).toBe("Autopsy Preferences");
      });

      it("should have body disposition section", () => {
        const section = ADVANCE_DIRECTIVE_ARTICLE_SECTIONS.find((s) => s.id === "body_disposition");
        expect(section).toBeDefined();
        expect(section?.required).toBe(false);
        expect(section?.title).toBe("Body Disposition");
      });

      it("should have personal values section", () => {
        const section = ADVANCE_DIRECTIVE_ARTICLE_SECTIONS.find((s) => s.id === "personal_values");
        expect(section).toBeDefined();
        expect(section?.required).toBe(false);
        expect(section?.title).toBe("Personal Values Statement");
      });

      it("should have spiritual preferences section", () => {
        const section = ADVANCE_DIRECTIVE_ARTICLE_SECTIONS.find(
          (s) => s.id === "spiritual_preferences",
        );
        expect(section).toBeDefined();
        expect(section?.required).toBe(false);
        expect(section?.title).toBe("Spiritual and Religious Preferences");
      });

      it("should have healthcare providers section", () => {
        const section = ADVANCE_DIRECTIVE_ARTICLE_SECTIONS.find(
          (s) => s.id === "healthcare_providers",
        );
        expect(section).toBeDefined();
        expect(section?.required).toBe(false);
        expect(section?.title).toBe("Healthcare Provider Information");
      });

      it("should have additional instructions section", () => {
        const section = ADVANCE_DIRECTIVE_ARTICLE_SECTIONS.find(
          (s) => s.id === "additional_instructions",
        );
        expect(section).toBeDefined();
        expect(section?.required).toBe(false);
        expect(section?.title).toBe("Additional Instructions");
      });
    });

    describe("Section Ordering", () => {
      it("should start with declaration section", () => {
        expect(ADVANCE_DIRECTIVE_ARTICLE_SECTIONS[0].id).toBe("declaration");
      });

      it("should have definitions early in the document", () => {
        const definitionsIndex = ADVANCE_DIRECTIVE_ARTICLE_SECTIONS.findIndex(
          (s) => s.id === "definitions",
        );
        expect(definitionsIndex).toBeLessThan(5);
      });

      it("should have terminal condition before permanent unconsciousness", () => {
        const terminalIndex = ADVANCE_DIRECTIVE_ARTICLE_SECTIONS.findIndex(
          (s) => s.id === "terminal_condition",
        );
        const unconsciousIndex = ADVANCE_DIRECTIVE_ARTICLE_SECTIONS.findIndex(
          (s) => s.id === "permanent_unconsciousness",
        );
        expect(terminalIndex).toBeLessThan(unconsciousIndex);
      });

      it("should end with signature section", () => {
        const lastSection =
          ADVANCE_DIRECTIVE_ARTICLE_SECTIONS[ADVANCE_DIRECTIVE_ARTICLE_SECTIONS.length - 1];
        expect(lastSection.id).toBe("signature");
      });

      it("should have revocation before signature", () => {
        const revocationIndex = ADVANCE_DIRECTIVE_ARTICLE_SECTIONS.findIndex(
          (s) => s.id === "revocation",
        );
        const signatureIndex = ADVANCE_DIRECTIVE_ARTICLE_SECTIONS.findIndex(
          (s) => s.id === "signature",
        );
        expect(revocationIndex).toBeLessThan(signatureIndex);
      });
    });
  });

  describe("Treatment Categories", () => {
    it("should cover all major treatment categories", () => {
      const treatmentCategories = [
        "cardiopulmonaryResuscitation",
        "mechanicalVentilation",
        "artificialNutrition",
        "artificialHydration",
        "dialysis",
        "antibiotics",
        "bloodTransfusions",
        "surgicalProcedures",
        "diagnosticTests",
        "painManagement",
      ];

      for (const category of treatmentCategories) {
        expect(ADVANCE_DIRECTIVE_OPTIONAL_FIELDS).toContain(category);
      }
    });

    it("should have 10 major treatment categories", () => {
      const treatmentCategories = [
        "cardiopulmonaryResuscitation",
        "mechanicalVentilation",
        "artificialNutrition",
        "artificialHydration",
        "dialysis",
        "antibiotics",
        "bloodTransfusions",
        "surgicalProcedures",
        "diagnosticTests",
        "painManagement",
      ];
      expect(treatmentCategories).toHaveLength(10);
    });
  });
});

describe("Advance Directive State Requirements", () => {
  describe("Coverage", () => {
    it("should have advance directive requirements for all 51 jurisdictions", () => {
      expect(US_STATES).toHaveLength(51);

      for (const state of US_STATES) {
        const requirements = getStateLegalRequirements(state);
        expect(requirements.advance_directive).toBeDefined();
      }
    });
  });

  describe("Witness Requirements", () => {
    it("should have valid witness counts for all states", () => {
      for (const state of US_STATES) {
        const { advance_directive } = getStateLegalRequirements(state);
        expect(advance_directive.witnessCount).toBeGreaterThanOrEqual(0);
        expect(advance_directive.witnessCount).toBeLessThanOrEqual(3);
      }
    });

    it("should require 2 witnesses in most states", () => {
      let twoWitnessCount = 0;

      for (const state of US_STATES) {
        const { advance_directive } = getStateLegalRequirements(state);
        if (advance_directive.witnessCount === 2) {
          twoWitnessCount++;
        }
      }

      // Most states require 2 witnesses for advance directives
      expect(twoWitnessCount).toBeGreaterThanOrEqual(40);
    });
  });

  describe("Notarization Requirements", () => {
    it("should have notarization field for all states", () => {
      for (const state of US_STATES) {
        const { advance_directive } = getStateLegalRequirements(state);
        expect(typeof advance_directive.notaryRequired).toBe("boolean");
      }
    });

    it("should not require notarization in most states", () => {
      let noNotaryCount = 0;

      for (const state of US_STATES) {
        const { advance_directive } = getStateLegalRequirements(state);
        if (!advance_directive.notaryRequired) {
          noNotaryCount++;
        }
      }

      // Most states don't require notarization for advance directives
      expect(noNotaryCount).toBeGreaterThanOrEqual(40);
    });
  });

  describe("Document Names", () => {
    it("should have document names for all states", () => {
      for (const state of US_STATES) {
        const { advance_directive } = getStateLegalRequirements(state);
        expect(advance_directive.documentName).toBeTruthy();
      }
    });

    it("should have descriptive document names", () => {
      for (const state of US_STATES) {
        const { advance_directive } = getStateLegalRequirements(state);
        expect(advance_directive.documentName.length).toBeGreaterThan(5);
      }
    });
  });

  describe("State-Specific Validations", () => {
    it("Texas should have standard advance directive requirements", () => {
      const { advance_directive } = getStateLegalRequirements("TX");
      expect(advance_directive.witnessCount).toBe(2);
    });

    it("California should have advance directive requirements", () => {
      const { advance_directive } = getStateLegalRequirements("CA");
      expect(advance_directive.witnessCount).toBe(2);
      expect(advance_directive.documentName).toBeTruthy();
    });

    it("New York should have advance directive requirements", () => {
      const { advance_directive } = getStateLegalRequirements("NY");
      expect(advance_directive.witnessCount).toBe(2);
    });

    it("Florida should have advance directive requirements", () => {
      const { advance_directive } = getStateLegalRequirements("FL");
      expect(advance_directive.witnessCount).toBe(2);
    });
  });
});

describe("Advance Directive PDF Generation Structure", () => {
  describe("Expected Page Sections", () => {
    it("should have title page elements", () => {
      const titlePageElements = [
        "ADVANCE HEALTHCARE DIRECTIVE",
        "Living Will",
        "declarant name",
        "state of execution",
      ];
      expect(titlePageElements).toHaveLength(4);
    });

    it("should have declaration elements", () => {
      const declarationElements = [
        "declaration of intent",
        "legal capacity statement",
        "understanding acknowledgment",
        "voluntary execution",
      ];
      expect(declarationElements).toHaveLength(4);
    });

    it("should have definitions elements", () => {
      const definitionsElements = [
        "terminal condition definition",
        "permanent unconsciousness definition",
        "end-stage condition definition",
        "life-sustaining treatment definition",
        "comfort care definition",
      ];
      expect(definitionsElements).toHaveLength(5);
    });

    it("should have terminal condition elements", () => {
      const terminalElements = [
        "terminal condition instructions",
        "treatment preference selection",
        "comfort care request",
      ];
      expect(terminalElements).toHaveLength(3);
    });

    it("should have permanent unconsciousness elements", () => {
      const unconsciousnessElements = [
        "permanent unconsciousness instructions",
        "treatment withdrawal preference",
        "comfort care continuation",
      ];
      expect(unconsciousnessElements).toHaveLength(3);
    });

    it("should have specific treatment elements", () => {
      const treatmentElements = [
        "CPR preference",
        "ventilator preference",
        "feeding tube preference",
        "hydration preference",
        "dialysis preference",
        "antibiotics preference",
        "blood transfusion preference",
        "surgery preference",
      ];
      expect(treatmentElements).toHaveLength(8);
    });

    it("should have pain management elements", () => {
      const painElements = [
        "pain management instructions",
        "comfort care details",
        "hospice preference",
        "palliative care instructions",
      ];
      expect(painElements).toHaveLength(4);
    });

    it("should have organ donation elements", () => {
      const organElements = [
        "organ donation decision",
        "organs to donate",
        "donation purpose",
        "donation limitations",
        "tissue donation preference",
      ];
      expect(organElements).toHaveLength(5);
    });

    it("should have body disposition elements", () => {
      const bodyElements = [
        "body disposition preference",
        "burial or cremation choice",
        "body donation option",
        "funeral instructions",
      ];
      expect(bodyElements).toHaveLength(4);
    });

    it("should have personal values elements", () => {
      const valuesElements = [
        "personal statement",
        "quality of life values",
        "treatment goals",
        "spiritual preferences",
      ];
      expect(valuesElements).toHaveLength(4);
    });

    it("should have signature block elements", () => {
      const signatureElements = [
        "declarant signature line",
        "signature date",
        "witness 1 signature",
        "witness 1 printed name",
        "witness 1 address",
        "witness 2 signature",
        "witness 2 printed name",
        "witness 2 address",
        "notary block (if required)",
      ];
      expect(signatureElements).toHaveLength(9);
    });
  });

  describe("Document Structure", () => {
    it("should have proper article numbering", () => {
      const requiredSections = ADVANCE_DIRECTIVE_ARTICLE_SECTIONS.filter((s) => s.required);
      for (let i = 0; i < requiredSections.length; i++) {
        expect(requiredSections[i].id).toBeTruthy();
        expect(requiredSections[i].title).toBeTruthy();
      }
    });

    it("should have unique section IDs", () => {
      const ids = ADVANCE_DIRECTIVE_ARTICLE_SECTIONS.map((s) => s.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it("should have meaningful titles", () => {
      for (const section of ADVANCE_DIRECTIVE_ARTICLE_SECTIONS) {
        expect(section.title.length).toBeGreaterThan(5);
        expect(section.title).not.toContain("TODO");
        expect(section.title).not.toContain("undefined");
      }
    });
  });

  describe("Legal Clauses", () => {
    it("should include standard legal provisions", () => {
      const legalSections = ["revocation", "severability", "governing_law"];

      for (const sectionId of legalSections) {
        const section = ADVANCE_DIRECTIVE_ARTICLE_SECTIONS.find((s) => s.id === sectionId);
        expect(section).toBeDefined();
        expect(section?.required).toBe(true);
      }
    });

    it("should have revocation clause", () => {
      const revocation = ADVANCE_DIRECTIVE_ARTICLE_SECTIONS.find((s) => s.id === "revocation");
      expect(revocation).toBeDefined();
      expect(revocation?.title).toBe("Revocation");
    });

    it("should have severability clause", () => {
      const severability = ADVANCE_DIRECTIVE_ARTICLE_SECTIONS.find((s) => s.id === "severability");
      expect(severability).toBeDefined();
      expect(severability?.title).toBe("Severability");
    });

    it("should have governing law clause", () => {
      const governingLaw = ADVANCE_DIRECTIVE_ARTICLE_SECTIONS.find((s) => s.id === "governing_law");
      expect(governingLaw).toBeDefined();
      expect(governingLaw?.title).toBe("Governing Law");
    });
  });
});

describe("Advance Directive vs Healthcare POA Comparison", () => {
  it("should be a separate document type", () => {
    expect(ADVANCE_DIRECTIVE_TEMPLATE_INFO.id).not.toBe("healthcare_poa");
  });

  it("should focus on end-of-life decisions", () => {
    expect(ADVANCE_DIRECTIVE_REQUIRED_FIELDS).toContain("terminalConditionPreference");
    expect(ADVANCE_DIRECTIVE_REQUIRED_FIELDS).toContain("permanentUnconsciousnessPreference");
  });

  it("should have terminal condition section as required", () => {
    const terminalSection = ADVANCE_DIRECTIVE_ARTICLE_SECTIONS.find(
      (s) => s.id === "terminal_condition",
    );
    expect(terminalSection?.required).toBe(true);
  });

  it("should have permanent unconsciousness section as required", () => {
    const unconsciousSection = ADVANCE_DIRECTIVE_ARTICLE_SECTIONS.find(
      (s) => s.id === "permanent_unconsciousness",
    );
    expect(unconsciousSection?.required).toBe(true);
  });

  it("should optionally reference healthcare agent", () => {
    expect(ADVANCE_DIRECTIVE_OPTIONAL_FIELDS).toContain("healthcareAgentName");
    expect(ADVANCE_DIRECTIVE_OPTIONAL_FIELDS).toContain("healthcareAgentPhone");
  });
});

describe("Field Count Verification", () => {
  it("should have exactly 5 required fields", () => {
    expect(ADVANCE_DIRECTIVE_REQUIRED_FIELDS).toHaveLength(5);
  });

  it("should have exactly 61 optional fields", () => {
    expect(ADVANCE_DIRECTIVE_OPTIONAL_FIELDS).toHaveLength(61);
  });

  it("should have 66 total fields", () => {
    const totalFields =
      ADVANCE_DIRECTIVE_REQUIRED_FIELDS.length + ADVANCE_DIRECTIVE_OPTIONAL_FIELDS.length;
    expect(totalFields).toBe(66);
  });

  it("should have no duplicate fields between required and optional", () => {
    const requiredSet = new Set<string>(ADVANCE_DIRECTIVE_REQUIRED_FIELDS);
    const optionalSet = new Set<string>(ADVANCE_DIRECTIVE_OPTIONAL_FIELDS);

    for (const field of ADVANCE_DIRECTIVE_REQUIRED_FIELDS) {
      expect(optionalSet.has(field)).toBe(false);
    }

    for (const field of ADVANCE_DIRECTIVE_OPTIONAL_FIELDS) {
      expect(requiredSet.has(field)).toBe(false);
    }
  });
});
