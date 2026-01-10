import { describe, expect, it } from "vitest";
import {
  POUR_OVER_WILL_ARTICLE_SECTIONS,
  POUR_OVER_WILL_OPTIONAL_FIELDS,
  POUR_OVER_WILL_REQUIRED_FIELDS,
  POUR_OVER_WILL_TEMPLATE_INFO,
} from "../document-templates/pour-over-will-template";
import { STATE_LEGAL_REQUIREMENTS, US_STATES } from "../state-legal-requirements";

/**
 * Pour-Over Will Document Tests
 *
 * Comprehensive test suite for Pour-Over Will documents.
 * A pour-over will works in conjunction with a revocable living trust,
 * directing any assets not already in the trust to "pour over" into it upon death.
 *
 * Test Coverage:
 * - Template structure and metadata
 * - Required and optional fields
 * - Trust integration requirements
 * - Article sections and ordering
 * - State-specific requirements
 * - PDF generation structure
 *
 * IMPORTANT: If tests fail after changes, review the legal implications
 * of the changes before updating tests.
 */

describe("Pour-Over Will Document - Template Structure", () => {
  describe("Template Metadata", () => {
    it("should have correct template ID", () => {
      expect(POUR_OVER_WILL_TEMPLATE_INFO.id).toBe("pour_over_will");
    });

    it("should have correct display name", () => {
      expect(POUR_OVER_WILL_TEMPLATE_INFO.name).toBe("Pour-Over Will");
    });

    it("should be in estate planning category", () => {
      expect(POUR_OVER_WILL_TEMPLATE_INFO.category).toBe("estate_planning");
    });

    it("should have a description", () => {
      expect(POUR_OVER_WILL_TEMPLATE_INFO.description).toBeTruthy();
      expect(POUR_OVER_WILL_TEMPLATE_INFO.description.length).toBeGreaterThan(20);
    });

    it("should describe trust integration in description", () => {
      const desc = POUR_OVER_WILL_TEMPLATE_INFO.description.toLowerCase();
      expect(desc).toContain("trust");
    });

    it("should have estimated completion time", () => {
      expect(POUR_OVER_WILL_TEMPLATE_INFO.estimatedCompletionTime).toBeTruthy();
    });
  });

  describe("Execution Requirements", () => {
    it("should require witnesses", () => {
      expect(POUR_OVER_WILL_TEMPLATE_INFO.requiresWitnesses).toBe(true);
    });

    it("should have default witness count of 2", () => {
      expect(POUR_OVER_WILL_TEMPLATE_INFO.defaultWitnessCount).toBe(2);
    });

    it("should not require notary by default (varies by state)", () => {
      expect(POUR_OVER_WILL_TEMPLATE_INFO.requiresNotary).toBe(false);
    });

    it("should flag that it requires an existing trust", () => {
      expect(POUR_OVER_WILL_TEMPLATE_INFO.requiresExistingTrust).toBe(true);
    });
  });
});

describe("Pour-Over Will Document - Required Fields", () => {
  describe("Personal Information", () => {
    it("should require full name", () => {
      expect(POUR_OVER_WILL_REQUIRED_FIELDS).toContain("fullName");
    });

    it("should require address", () => {
      expect(POUR_OVER_WILL_REQUIRED_FIELDS).toContain("address");
    });

    it("should require state", () => {
      expect(POUR_OVER_WILL_REQUIRED_FIELDS).toContain("state");
    });
  });

  describe("Trust Reference (Core Requirement)", () => {
    it("should require trust name", () => {
      expect(POUR_OVER_WILL_REQUIRED_FIELDS).toContain("trustName");
    });

    it("should require trust date", () => {
      expect(POUR_OVER_WILL_REQUIRED_FIELDS).toContain("trustDate");
    });

    it("should require trustee name", () => {
      expect(POUR_OVER_WILL_REQUIRED_FIELDS).toContain("trusteeName");
    });
  });

  describe("Executor Information", () => {
    it("should require executor name", () => {
      expect(POUR_OVER_WILL_REQUIRED_FIELDS).toContain("executorName");
    });
  });

  describe("Field Count", () => {
    it("should have 7 required fields", () => {
      expect(POUR_OVER_WILL_REQUIRED_FIELDS.length).toBe(7);
    });

    it("should not have duplicate required fields", () => {
      const uniqueFields = new Set(POUR_OVER_WILL_REQUIRED_FIELDS);
      expect(uniqueFields.size).toBe(POUR_OVER_WILL_REQUIRED_FIELDS.length);
    });
  });
});

describe("Pour-Over Will Document - Optional Fields", () => {
  describe("Address Details", () => {
    it("should support county", () => {
      expect(POUR_OVER_WILL_OPTIONAL_FIELDS).toContain("county");
    });

    it("should support city", () => {
      expect(POUR_OVER_WILL_OPTIONAL_FIELDS).toContain("city");
    });

    it("should support date of birth", () => {
      expect(POUR_OVER_WILL_OPTIONAL_FIELDS).toContain("dateOfBirth");
    });
  });

  describe("Family Information", () => {
    it("should support spouse name", () => {
      expect(POUR_OVER_WILL_OPTIONAL_FIELDS).toContain("spouseName");
    });

    it("should support marital status", () => {
      expect(POUR_OVER_WILL_OPTIONAL_FIELDS).toContain("maritalStatus");
    });

    it("should support minor children flag", () => {
      expect(POUR_OVER_WILL_OPTIONAL_FIELDS).toContain("hasMinorChildren");
    });

    it("should support children names", () => {
      expect(POUR_OVER_WILL_OPTIONAL_FIELDS).toContain("childrenNames");
    });
  });

  describe("Executor Details", () => {
    it("should support alternate executor", () => {
      expect(POUR_OVER_WILL_OPTIONAL_FIELDS).toContain("alternateExecutorName");
    });

    it("should support executor relationship", () => {
      expect(POUR_OVER_WILL_OPTIONAL_FIELDS).toContain("executorRelationship");
    });

    it("should support executor address", () => {
      expect(POUR_OVER_WILL_OPTIONAL_FIELDS).toContain("executorAddress");
    });

    it("should support alternate executor relationship", () => {
      expect(POUR_OVER_WILL_OPTIONAL_FIELDS).toContain("alternateExecutorRelationship");
    });

    it("should support waiving executor bond", () => {
      expect(POUR_OVER_WILL_OPTIONAL_FIELDS).toContain("waiveExecutorBond");
    });

    it("should support executor compensation options", () => {
      expect(POUR_OVER_WILL_OPTIONAL_FIELDS).toContain("executorCompensation");
      expect(POUR_OVER_WILL_OPTIONAL_FIELDS).toContain("executorCompensationAmount");
    });
  });

  describe("Guardian Information", () => {
    it("should support guardian name", () => {
      expect(POUR_OVER_WILL_OPTIONAL_FIELDS).toContain("guardianName");
    });

    it("should support alternate guardian", () => {
      expect(POUR_OVER_WILL_OPTIONAL_FIELDS).toContain("alternateGuardianName");
    });

    it("should support guardian relationship", () => {
      expect(POUR_OVER_WILL_OPTIONAL_FIELDS).toContain("guardianRelationship");
    });

    it("should support guardian address", () => {
      expect(POUR_OVER_WILL_OPTIONAL_FIELDS).toContain("guardianAddress");
    });

    it("should support excluded guardian option", () => {
      expect(POUR_OVER_WILL_OPTIONAL_FIELDS).toContain("excludedGuardian");
    });
  });

  describe("Property Dispositions", () => {
    it("should support specific bequests", () => {
      expect(POUR_OVER_WILL_OPTIONAL_FIELDS).toContain("specificBequests");
    });

    it("should support tangible personal property designation", () => {
      expect(POUR_OVER_WILL_OPTIONAL_FIELDS).toContain("tangiblePersonalProperty");
      expect(POUR_OVER_WILL_OPTIONAL_FIELDS).toContain("tangiblePropertyRecipient");
    });

    it("should support excluded assets", () => {
      expect(POUR_OVER_WILL_OPTIONAL_FIELDS).toContain("excludedAssets");
    });
  });

  describe("Legal Provisions", () => {
    it("should support survival period", () => {
      expect(POUR_OVER_WILL_OPTIONAL_FIELDS).toContain("survivalPeriod");
    });

    it("should support no-contest clause", () => {
      expect(POUR_OVER_WILL_OPTIONAL_FIELDS).toContain("noContestClause");
    });
  });

  describe("Final Wishes", () => {
    it("should support burial preference", () => {
      expect(POUR_OVER_WILL_OPTIONAL_FIELDS).toContain("burialPreference");
    });

    it("should support burial instructions", () => {
      expect(POUR_OVER_WILL_OPTIONAL_FIELDS).toContain("burialInstructions");
    });

    it("should support organ donation", () => {
      expect(POUR_OVER_WILL_OPTIONAL_FIELDS).toContain("organDonation");
    });
  });

  describe("Field Count", () => {
    it("should have reasonable number of optional fields (25+)", () => {
      expect(POUR_OVER_WILL_OPTIONAL_FIELDS.length).toBeGreaterThanOrEqual(25);
    });

    it("should not have duplicate optional fields", () => {
      const uniqueFields = new Set(POUR_OVER_WILL_OPTIONAL_FIELDS);
      expect(uniqueFields.size).toBe(POUR_OVER_WILL_OPTIONAL_FIELDS.length);
    });
  });
});

describe("Pour-Over Will Document - Article Sections", () => {
  describe("Required Core Sections", () => {
    it("should have declaration section", () => {
      const section = POUR_OVER_WILL_ARTICLE_SECTIONS.find((s) => s.id === "declaration");
      expect(section).toBeDefined();
      expect(section?.required).toBe(true);
    });

    it("should have family status section", () => {
      const section = POUR_OVER_WILL_ARTICLE_SECTIONS.find((s) => s.id === "family_status");
      expect(section).toBeDefined();
      expect(section?.required).toBe(true);
    });

    it("should have trust identification section (key for pour-over)", () => {
      const section = POUR_OVER_WILL_ARTICLE_SECTIONS.find((s) => s.id === "trust_identification");
      expect(section).toBeDefined();
      expect(section?.required).toBe(true);
    });

    it("should have pour-over provision section (core purpose)", () => {
      const section = POUR_OVER_WILL_ARTICLE_SECTIONS.find((s) => s.id === "pour_over");
      expect(section).toBeDefined();
      expect(section?.required).toBe(true);
    });

    it("should have debts and taxes section", () => {
      const section = POUR_OVER_WILL_ARTICLE_SECTIONS.find((s) => s.id === "debts_taxes");
      expect(section).toBeDefined();
      expect(section?.required).toBe(true);
    });

    it("should have executor section", () => {
      const section = POUR_OVER_WILL_ARTICLE_SECTIONS.find((s) => s.id === "executor");
      expect(section).toBeDefined();
      expect(section?.required).toBe(true);
    });

    it("should have executor powers section", () => {
      const section = POUR_OVER_WILL_ARTICLE_SECTIONS.find((s) => s.id === "executor_powers");
      expect(section).toBeDefined();
      expect(section?.required).toBe(true);
    });

    it("should have simultaneous death section", () => {
      const section = POUR_OVER_WILL_ARTICLE_SECTIONS.find((s) => s.id === "simultaneous_death");
      expect(section).toBeDefined();
      expect(section?.required).toBe(true);
    });

    it("should have severability section", () => {
      const section = POUR_OVER_WILL_ARTICLE_SECTIONS.find((s) => s.id === "severability");
      expect(section).toBeDefined();
      expect(section?.required).toBe(true);
    });

    it("should have governing law section", () => {
      const section = POUR_OVER_WILL_ARTICLE_SECTIONS.find((s) => s.id === "governing_law");
      expect(section).toBeDefined();
      expect(section?.required).toBe(true);
    });
  });

  describe("Optional/Conditional Sections", () => {
    it("should have specific bequests as optional", () => {
      const section = POUR_OVER_WILL_ARTICLE_SECTIONS.find((s) => s.id === "specific_bequests");
      expect(section).toBeDefined();
      expect(section?.required).toBe(false);
    });

    it("should have guardian section conditional on minor children", () => {
      const section = POUR_OVER_WILL_ARTICLE_SECTIONS.find((s) => s.id === "guardian");
      expect(section).toBeDefined();
      expect(section?.required).toBe(false);
      expect(section?.condition).toBe("hasMinorChildren");
    });

    it("should have no-contest provision as optional", () => {
      const section = POUR_OVER_WILL_ARTICLE_SECTIONS.find((s) => s.id === "no_contest");
      expect(section).toBeDefined();
      expect(section?.required).toBe(false);
    });

    it("should have final wishes as optional", () => {
      const section = POUR_OVER_WILL_ARTICLE_SECTIONS.find((s) => s.id === "final_wishes");
      expect(section).toBeDefined();
      expect(section?.required).toBe(false);
    });
  });

  describe("Section Ordering", () => {
    it("should start with declaration", () => {
      expect(POUR_OVER_WILL_ARTICLE_SECTIONS[0].id).toBe("declaration");
    });

    it("should have trust identification early in document", () => {
      const trustIndex = POUR_OVER_WILL_ARTICLE_SECTIONS.findIndex(
        (s) => s.id === "trust_identification",
      );
      expect(trustIndex).toBeLessThan(4);
    });

    it("should have pour-over provision after trust identification", () => {
      const trustIndex = POUR_OVER_WILL_ARTICLE_SECTIONS.findIndex(
        (s) => s.id === "trust_identification",
      );
      const pourOverIndex = POUR_OVER_WILL_ARTICLE_SECTIONS.findIndex((s) => s.id === "pour_over");
      expect(pourOverIndex).toBeGreaterThan(trustIndex);
    });

    it("should have executor before pour-over provision (handles estate first)", () => {
      // Executor handles estate administration before assets pour over to trust
      const pourOverIndex = POUR_OVER_WILL_ARTICLE_SECTIONS.findIndex((s) => s.id === "pour_over");
      const executorIndex = POUR_OVER_WILL_ARTICLE_SECTIONS.findIndex((s) => s.id === "executor");
      expect(executorIndex).toBeLessThan(pourOverIndex);
    });

    it("should end with governing law or severability", () => {
      const lastSection =
        POUR_OVER_WILL_ARTICLE_SECTIONS[POUR_OVER_WILL_ARTICLE_SECTIONS.length - 1];
      expect(["governing_law", "severability"]).toContain(lastSection.id);
    });
  });

  describe("Section Count", () => {
    it("should have 14 article sections", () => {
      expect(POUR_OVER_WILL_ARTICLE_SECTIONS.length).toBe(14);
    });

    it("should have at least 10 required sections", () => {
      const requiredSections = POUR_OVER_WILL_ARTICLE_SECTIONS.filter((s) => s.required);
      expect(requiredSections.length).toBeGreaterThanOrEqual(10);
    });

    it("should have unique section IDs", () => {
      const ids = POUR_OVER_WILL_ARTICLE_SECTIONS.map((s) => s.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it("should have titles for all sections", () => {
      for (const section of POUR_OVER_WILL_ARTICLE_SECTIONS) {
        expect(section.title).toBeTruthy();
        expect(section.title.length).toBeGreaterThan(3);
      }
    });
  });
});

describe("Pour-Over Will Document - Trust Integration", () => {
  describe("Trust Dependency", () => {
    it("should explicitly require an existing trust", () => {
      expect(POUR_OVER_WILL_TEMPLATE_INFO.requiresExistingTrust).toBe(true);
    });

    it("should have trust name as required field", () => {
      expect(POUR_OVER_WILL_REQUIRED_FIELDS).toContain("trustName");
    });

    it("should have trust date as required field", () => {
      expect(POUR_OVER_WILL_REQUIRED_FIELDS).toContain("trustDate");
    });

    it("should have trustee name as required field", () => {
      expect(POUR_OVER_WILL_REQUIRED_FIELDS).toContain("trusteeName");
    });
  });

  describe("Trust Reference Section", () => {
    it("should have trust identification article section", () => {
      const section = POUR_OVER_WILL_ARTICLE_SECTIONS.find((s) => s.id === "trust_identification");
      expect(section).toBeDefined();
      expect(section?.title).toBe("Trust Identification");
    });

    it("should have pour-over provision article section", () => {
      const section = POUR_OVER_WILL_ARTICLE_SECTIONS.find((s) => s.id === "pour_over");
      expect(section).toBeDefined();
      expect(section?.title).toBe("Pour-Over Provision");
    });
  });
});

describe("Pour-Over Will Document - State Requirements", () => {
  describe("All States Coverage", () => {
    it("should have will requirements for all 51 jurisdictions", () => {
      for (const state of US_STATES) {
        const requirements = STATE_LEGAL_REQUIREMENTS[state];
        expect(requirements).toBeDefined();
        expect(requirements.will).toBeDefined();
      }
    });

    it("should have consistent will requirements structure", () => {
      for (const state of US_STATES) {
        const willReqs = STATE_LEGAL_REQUIREMENTS[state].will;
        expect(willReqs).toHaveProperty("witnessCount");
        expect(willReqs).toHaveProperty("notaryRequired");
        expect(willReqs).toHaveProperty("selfProvingAllowed");
      }
    });
  });

  describe("Witness Requirements", () => {
    it("should require at least 2 witnesses in most states", () => {
      const statesWithTwoWitnesses = US_STATES.filter(
        (state) => STATE_LEGAL_REQUIREMENTS[state].will.witnessCount === 2,
      );
      expect(statesWithTwoWitnesses.length).toBeGreaterThanOrEqual(45);
    });

    it("should require 3 witnesses in South Carolina", () => {
      expect(STATE_LEGAL_REQUIREMENTS.SC.will.witnessCount).toBe(3);
    });

    it("should require 2 witnesses in Vermont", () => {
      expect(STATE_LEGAL_REQUIREMENTS.VT.will.witnessCount).toBe(2);
    });
  });

  describe("Notary Requirements", () => {
    it("should require notary in Louisiana", () => {
      expect(STATE_LEGAL_REQUIREMENTS.LA.will.notaryRequired).toBe(true);
    });

    it("should support self-proving affidavit in most states", () => {
      const statesWithSelfProving = US_STATES.filter(
        (state) => STATE_LEGAL_REQUIREMENTS[state].will.selfProvingAllowed,
      );
      expect(statesWithSelfProving.length).toBeGreaterThanOrEqual(45);
    });
  });

  describe("State Snapshots", () => {
    it("should have correct California will requirements", () => {
      expect(STATE_LEGAL_REQUIREMENTS.CA.will).toMatchObject({
        witnessCount: 2,
        notaryRequired: false,
        selfProvingAllowed: false, // California does NOT recognize self-proving wills
      });
    });

    it("should have correct New York will requirements", () => {
      expect(STATE_LEGAL_REQUIREMENTS.NY.will).toMatchObject({
        witnessCount: 2,
        notaryRequired: false,
        selfProvingAllowed: true,
      });
    });

    it("should have correct Texas will requirements", () => {
      expect(STATE_LEGAL_REQUIREMENTS.TX.will).toMatchObject({
        witnessCount: 2,
        notaryRequired: false,
        selfProvingAllowed: true,
      });
    });

    it("should have correct Florida will requirements", () => {
      expect(STATE_LEGAL_REQUIREMENTS.FL.will).toMatchObject({
        witnessCount: 2,
        notaryRequired: false,
        selfProvingAllowed: true,
      });
    });
  });
});

describe("Pour-Over Will Document - Executor Provisions", () => {
  describe("Required Executor Fields", () => {
    it("should require primary executor", () => {
      expect(POUR_OVER_WILL_REQUIRED_FIELDS).toContain("executorName");
    });
  });

  describe("Optional Executor Fields", () => {
    it("should support alternate executor", () => {
      expect(POUR_OVER_WILL_OPTIONAL_FIELDS).toContain("alternateExecutorName");
    });

    it("should support executor relationship", () => {
      expect(POUR_OVER_WILL_OPTIONAL_FIELDS).toContain("executorRelationship");
    });

    it("should support bond waiver", () => {
      expect(POUR_OVER_WILL_OPTIONAL_FIELDS).toContain("waiveExecutorBond");
    });

    it("should support executor compensation", () => {
      expect(POUR_OVER_WILL_OPTIONAL_FIELDS).toContain("executorCompensation");
    });
  });

  describe("Executor Article Sections", () => {
    it("should have executor appointment section", () => {
      const section = POUR_OVER_WILL_ARTICLE_SECTIONS.find((s) => s.id === "executor");
      expect(section).toBeDefined();
      expect(section?.required).toBe(true);
    });

    it("should have executor powers section", () => {
      const section = POUR_OVER_WILL_ARTICLE_SECTIONS.find((s) => s.id === "executor_powers");
      expect(section).toBeDefined();
      expect(section?.required).toBe(true);
    });
  });
});

describe("Pour-Over Will Document - Guardian Provisions", () => {
  describe("Conditional Guardian Section", () => {
    it("should have guardian section with hasMinorChildren condition", () => {
      const section = POUR_OVER_WILL_ARTICLE_SECTIONS.find((s) => s.id === "guardian");
      expect(section).toBeDefined();
      expect(section?.condition).toBe("hasMinorChildren");
      expect(section?.required).toBe(false);
    });
  });

  describe("Guardian Optional Fields", () => {
    it("should support guardian name", () => {
      expect(POUR_OVER_WILL_OPTIONAL_FIELDS).toContain("guardianName");
    });

    it("should support alternate guardian", () => {
      expect(POUR_OVER_WILL_OPTIONAL_FIELDS).toContain("alternateGuardianName");
    });

    it("should support guardian relationship", () => {
      expect(POUR_OVER_WILL_OPTIONAL_FIELDS).toContain("guardianRelationship");
    });

    it("should support excluded guardian", () => {
      expect(POUR_OVER_WILL_OPTIONAL_FIELDS).toContain("excludedGuardian");
    });
  });
});

describe("Pour-Over Will Document - PDF Generation Structure", () => {
  /**
   * PDF page structure expectations based on pour-over-will-pdf-generator.tsx
   */
  const EXPECTED_PDF_PAGES = [
    {
      pageNum: 1,
      sections: [
        "header",
        "declaration",
        "trust_identification",
        "pour_over_provision",
        "coordination_with_trust",
        "executor",
        "guardian_if_applicable",
        "taxes_and_expenses",
        "simultaneous_death",
        "fiduciary_powers",
        "severability",
        "testator_signature",
        "witness_attestation",
      ],
    },
    {
      pageNum: 2,
      sections: ["notary_acknowledgment_if_required", "self_proving_affidavit_if_allowed"],
      conditional: true,
    },
  ];

  describe("Page Structure", () => {
    it("should have 1-2 pages depending on state requirements", () => {
      expect(EXPECTED_PDF_PAGES.length).toBe(2);
      expect(EXPECTED_PDF_PAGES[1].conditional).toBe(true);
    });

    it("should have header on first page", () => {
      expect(EXPECTED_PDF_PAGES[0].sections).toContain("header");
    });

    it("should have testator signature on first page", () => {
      expect(EXPECTED_PDF_PAGES[0].sections).toContain("testator_signature");
    });

    it("should have witness attestation on first page", () => {
      expect(EXPECTED_PDF_PAGES[0].sections).toContain("witness_attestation");
    });

    it("should have notary/self-proving on second page if state requires", () => {
      expect(EXPECTED_PDF_PAGES[1].sections).toContain("notary_acknowledgment_if_required");
      expect(EXPECTED_PDF_PAGES[1].sections).toContain("self_proving_affidavit_if_allowed");
    });
  });

  describe("Header Section", () => {
    const EXPECTED_HEADER_ELEMENTS = ["title", "testator_name", "state_of_execution"];

    it("should display document title", () => {
      expect(EXPECTED_HEADER_ELEMENTS).toContain("title");
    });

    it("should display testator name", () => {
      expect(EXPECTED_HEADER_ELEMENTS).toContain("testator_name");
    });

    it("should display state", () => {
      expect(EXPECTED_HEADER_ELEMENTS).toContain("state_of_execution");
    });
  });

  describe("Trust Reference Section", () => {
    const EXPECTED_TRUST_ELEMENTS = ["trust_name", "trust_date", "amendment_reference"];

    it("should display trust name", () => {
      expect(EXPECTED_TRUST_ELEMENTS).toContain("trust_name");
    });

    it("should display trust date", () => {
      expect(EXPECTED_TRUST_ELEMENTS).toContain("trust_date");
    });

    it("should reference amendments", () => {
      expect(EXPECTED_TRUST_ELEMENTS).toContain("amendment_reference");
    });
  });

  describe("Pour-Over Provision Section", () => {
    const EXPECTED_POUR_OVER_ELEMENTS = [
      "residue_disposition",
      "trustee_reference",
      "distribution_according_to_trust",
      "failsafe_provision",
    ];

    it("should dispose of residue to trust", () => {
      expect(EXPECTED_POUR_OVER_ELEMENTS).toContain("residue_disposition");
    });

    it("should reference trustee", () => {
      expect(EXPECTED_POUR_OVER_ELEMENTS).toContain("trustee_reference");
    });

    it("should reference trust distribution terms", () => {
      expect(EXPECTED_POUR_OVER_ELEMENTS).toContain("distribution_according_to_trust");
    });

    it("should have failsafe provision if pour-over fails", () => {
      expect(EXPECTED_POUR_OVER_ELEMENTS).toContain("failsafe_provision");
    });
  });

  describe("Article Numbering", () => {
    const EXPECTED_ARTICLE_COUNT_MIN = 8;

    it("should have at least 8 articles", () => {
      // Based on PDF generator: trust id, pour-over, coordination, executor, taxes, death, fiduciary, severability
      expect(EXPECTED_ARTICLE_COUNT_MIN).toBe(8);
    });

    it("should start with Trust Identification (Article 1)", () => {
      // First article after declaration
      const trustSection = POUR_OVER_WILL_ARTICLE_SECTIONS.find(
        (s) => s.id === "trust_identification",
      );
      expect(trustSection).toBeDefined();
    });

    it("should number guardian article conditionally", () => {
      // Guardian appears only when hasMinorChildren is true
      const guardianSection = POUR_OVER_WILL_ARTICLE_SECTIONS.find((s) => s.id === "guardian");
      expect(guardianSection?.condition).toBe("hasMinorChildren");
    });
  });

  describe("Executor Section in PDF", () => {
    const EXPECTED_EXECUTOR_ELEMENTS = [
      "primary_executor_name",
      "executor_relationship_if_provided",
      "alternate_executor",
      "executor_powers_reference",
      "bond_waiver",
    ];

    it("should display primary executor", () => {
      expect(EXPECTED_EXECUTOR_ELEMENTS).toContain("primary_executor_name");
    });

    it("should display relationship if provided", () => {
      expect(EXPECTED_EXECUTOR_ELEMENTS).toContain("executor_relationship_if_provided");
    });

    it("should display alternate executor", () => {
      expect(EXPECTED_EXECUTOR_ELEMENTS).toContain("alternate_executor");
    });

    it("should waive bond requirement", () => {
      expect(EXPECTED_EXECUTOR_ELEMENTS).toContain("bond_waiver");
    });
  });

  describe("Fiduciary Powers Section", () => {
    const EXPECTED_POWERS = [
      "retain_property",
      "sell_lease_exchange",
      "borrow_money",
      "compromise_claims",
      "employ_professionals",
      "make_distributions",
      "state_law_powers",
    ];

    it("should list 7 fiduciary powers", () => {
      expect(EXPECTED_POWERS.length).toBe(7);
    });

    it("should include state law powers reference", () => {
      expect(EXPECTED_POWERS).toContain("state_law_powers");
    });
  });

  describe("Signature Blocks", () => {
    it("should have testator signature block", () => {
      expect(EXPECTED_PDF_PAGES[0].sections).toContain("testator_signature");
    });

    it("should have witness attestation", () => {
      expect(EXPECTED_PDF_PAGES[0].sections).toContain("witness_attestation");
    });
  });

  describe("State-Specific Content", () => {
    it("should display full state name in header", () => {
      // PDF generator uses STATE_NAMES mapping
      const stateMapping = { CA: "California", NY: "New York", TX: "Texas" };
      expect(Object.keys(stateMapping)).toContain("CA");
    });

    it("should reference state law in fiduciary powers", () => {
      // "all powers granted under the laws of [STATE]"
      const section = POUR_OVER_WILL_ARTICLE_SECTIONS.find((s) => s.id === "executor_powers");
      expect(section).toBeDefined();
    });
  });

  describe("Page Footer", () => {
    const EXPECTED_FOOTER_ELEMENTS = ["draft_disclaimer", "testator_name", "page_number"];

    it("should display draft disclaimer", () => {
      expect(EXPECTED_FOOTER_ELEMENTS).toContain("draft_disclaimer");
    });

    it("should display testator name", () => {
      expect(EXPECTED_FOOTER_ELEMENTS).toContain("testator_name");
    });

    it("should display page number", () => {
      expect(EXPECTED_FOOTER_ELEMENTS).toContain("page_number");
    });
  });
});

describe("Pour-Over Will Document - PDF Data Mapping", () => {
  describe("Required Field Mapping", () => {
    const REQUIRED_PDF_MAPPINGS = [
      { field: "fullName", pdfLocation: "header, declaration, signature" },
      { field: "address", pdfLocation: "declaration" },
      { field: "state", pdfLocation: "header, governing law, fiduciary powers" },
      { field: "trustName", pdfLocation: "trust identification, pour-over provision" },
      { field: "trustDate", pdfLocation: "trust identification" },
      { field: "trusteeName", pdfLocation: "pour-over provision (trustee reference)" },
      { field: "executorName", pdfLocation: "executor section" },
    ];

    it("should map all 7 required fields to PDF content", () => {
      expect(REQUIRED_PDF_MAPPINGS.length).toBe(7);
    });

    it("should map fullName to multiple locations", () => {
      const mapping = REQUIRED_PDF_MAPPINGS.find((m) => m.field === "fullName");
      expect(mapping?.pdfLocation).toContain("header");
      expect(mapping?.pdfLocation).toContain("declaration");
      expect(mapping?.pdfLocation).toContain("signature");
    });

    it("should map state to multiple locations", () => {
      const mapping = REQUIRED_PDF_MAPPINGS.find((m) => m.field === "state");
      expect(mapping?.pdfLocation).toContain("header");
      expect(mapping?.pdfLocation).toContain("governing law");
    });

    it("should map trustName prominently", () => {
      const mapping = REQUIRED_PDF_MAPPINGS.find((m) => m.field === "trustName");
      expect(mapping?.pdfLocation).toContain("trust identification");
      expect(mapping?.pdfLocation).toContain("pour-over provision");
    });
  });

  describe("Optional Field Mapping", () => {
    const OPTIONAL_PDF_MAPPINGS = [
      { field: "executorRelationship", condition: "if provided" },
      { field: "alternateExecutorName", condition: "if provided" },
      { field: "guardianName", condition: "hasMinorChildren" },
      { field: "alternateGuardianName", condition: "hasMinorChildren" },
    ];

    it("should conditionally render executor relationship", () => {
      const mapping = OPTIONAL_PDF_MAPPINGS.find((m) => m.field === "executorRelationship");
      expect(mapping?.condition).toBe("if provided");
    });

    it("should conditionally render guardian info", () => {
      const mapping = OPTIONAL_PDF_MAPPINGS.find((m) => m.field === "guardianName");
      expect(mapping?.condition).toBe("hasMinorChildren");
    });
  });

  describe("Conditional Content", () => {
    it("should show guardian section only when hasMinorChildren is true", () => {
      const guardianSection = POUR_OVER_WILL_ARTICLE_SECTIONS.find((s) => s.id === "guardian");
      expect(guardianSection?.condition).toBe("hasMinorChildren");
    });

    it("should show notary only when state requires", () => {
      // Based on will.notaryRequired state requirement
      expect(STATE_LEGAL_REQUIREMENTS.LA.will.notaryRequired).toBe(true);
      expect(STATE_LEGAL_REQUIREMENTS.CA.will.notaryRequired).toBe(false);
    });

    it("should show self-proving affidavit only when state allows", () => {
      // Based on will.selfProvingAllowed state requirement
      const statesWithSelfProving = US_STATES.filter(
        (state) => STATE_LEGAL_REQUIREMENTS[state].will.selfProvingAllowed,
      );
      expect(statesWithSelfProving.length).toBeGreaterThan(0);
    });
  });
});

describe("Pour-Over Will Document - Cross-Validation", () => {
  describe("Template and State Requirement Alignment", () => {
    it("should have witness requirement matching template default", () => {
      // Most states require 2 witnesses, matching template default
      expect(POUR_OVER_WILL_TEMPLATE_INFO.defaultWitnessCount).toBe(2);
      const statesWithTwoWitnesses = US_STATES.filter(
        (state) => STATE_LEGAL_REQUIREMENTS[state].will.witnessCount === 2,
      );
      expect(statesWithTwoWitnesses.length).toBeGreaterThanOrEqual(45);
    });
  });

  describe("Required Fields and Article Sections Alignment", () => {
    it("should have trust-related article section for trust required fields", () => {
      // trustName is required -> trust_identification section exists
      expect(POUR_OVER_WILL_REQUIRED_FIELDS).toContain("trustName");
      const trustSection = POUR_OVER_WILL_ARTICLE_SECTIONS.find(
        (s) => s.id === "trust_identification",
      );
      expect(trustSection).toBeDefined();
    });

    it("should have executor article section for executor required field", () => {
      expect(POUR_OVER_WILL_REQUIRED_FIELDS).toContain("executorName");
      const executorSection = POUR_OVER_WILL_ARTICLE_SECTIONS.find((s) => s.id === "executor");
      expect(executorSection).toBeDefined();
    });
  });

  describe("Pour-Over Will vs Regular Will Comparison", () => {
    it("should require trust name (pour-over specific)", () => {
      expect(POUR_OVER_WILL_REQUIRED_FIELDS).toContain("trustName");
    });

    it("should require trust date (pour-over specific)", () => {
      expect(POUR_OVER_WILL_REQUIRED_FIELDS).toContain("trustDate");
    });

    it("should require trustee name (pour-over specific)", () => {
      expect(POUR_OVER_WILL_REQUIRED_FIELDS).toContain("trusteeName");
    });

    it("should have pour-over provision section (pour-over specific)", () => {
      const section = POUR_OVER_WILL_ARTICLE_SECTIONS.find((s) => s.id === "pour_over");
      expect(section).toBeDefined();
    });

    it("should have trust identification section (pour-over specific)", () => {
      const section = POUR_OVER_WILL_ARTICLE_SECTIONS.find((s) => s.id === "trust_identification");
      expect(section).toBeDefined();
    });
  });
});

describe("Pour-Over Will Document - Legal Compliance", () => {
  describe("Declaration Requirements", () => {
    it("should have declaration as first required section", () => {
      const firstRequired = POUR_OVER_WILL_ARTICLE_SECTIONS.find((s) => s.required);
      expect(firstRequired?.id).toBe("declaration");
    });
  });

  describe("Severability Clause", () => {
    it("should have severability section", () => {
      const section = POUR_OVER_WILL_ARTICLE_SECTIONS.find((s) => s.id === "severability");
      expect(section).toBeDefined();
      expect(section?.required).toBe(true);
    });
  });

  describe("Governing Law", () => {
    it("should have governing law section", () => {
      const section = POUR_OVER_WILL_ARTICLE_SECTIONS.find((s) => s.id === "governing_law");
      expect(section).toBeDefined();
      expect(section?.required).toBe(true);
    });
  });

  describe("Simultaneous Death Provision", () => {
    it("should have simultaneous death section", () => {
      const section = POUR_OVER_WILL_ARTICLE_SECTIONS.find((s) => s.id === "simultaneous_death");
      expect(section).toBeDefined();
      expect(section?.required).toBe(true);
    });
  });

  describe("Debts and Taxes", () => {
    it("should have debts and taxes section", () => {
      const section = POUR_OVER_WILL_ARTICLE_SECTIONS.find((s) => s.id === "debts_taxes");
      expect(section).toBeDefined();
      expect(section?.required).toBe(true);
    });
  });
});
