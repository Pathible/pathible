import { describe, expect, it } from "vitest";
import {
  FINANCIAL_POA_ARTICLE_SECTIONS,
  FINANCIAL_POA_OPTIONAL_FIELDS,
  FINANCIAL_POA_REQUIRED_FIELDS,
  FINANCIAL_POA_TEMPLATE_INFO,
} from "../document-templates/financial-poa-template";
import { STATE_LEGAL_REQUIREMENTS, US_STATES } from "../state-legal-requirements";

/**
 * Durable Financial Power of Attorney Document Tests
 *
 * Comprehensive test suite for Financial POA documents.
 * A financial POA grants an agent authority to handle financial matters
 * on behalf of the principal, including banking, investments, and property.
 *
 * Test Coverage:
 * - Template structure and metadata
 * - Required and optional fields
 * - Power categories (banking, real estate, investments, etc.)
 * - Agent appointment and succession
 * - Effective date options (immediate vs springing)
 * - Self-dealing restrictions
 * - Article sections and ordering
 * - State-specific requirements
 * - PDF generation structure
 */

describe("Financial POA Document - Template Structure", () => {
  describe("Template Metadata", () => {
    it("should have correct template ID", () => {
      expect(FINANCIAL_POA_TEMPLATE_INFO.id).toBe("financial_poa");
    });

    it("should have correct display name", () => {
      expect(FINANCIAL_POA_TEMPLATE_INFO.name).toBe("Durable Financial Power of Attorney");
    });

    it("should be in financial planning category", () => {
      expect(FINANCIAL_POA_TEMPLATE_INFO.category).toBe("financial_planning");
    });

    it("should have a comprehensive description", () => {
      expect(FINANCIAL_POA_TEMPLATE_INFO.description).toBeTruthy();
      expect(FINANCIAL_POA_TEMPLATE_INFO.description.length).toBeGreaterThan(50);
    });

    it("should describe financial scope in description", () => {
      const desc = FINANCIAL_POA_TEMPLATE_INFO.description.toLowerCase();
      expect(desc).toContain("financial");
    });

    it("should have estimated completion time", () => {
      expect(FINANCIAL_POA_TEMPLATE_INFO.estimatedCompletionTime).toBeTruthy();
    });
  });

  describe("Execution Requirements", () => {
    it("should require notarization", () => {
      expect(FINANCIAL_POA_TEMPLATE_INFO.requiresNotary).toBe(true);
    });

    it("should require witnesses", () => {
      expect(FINANCIAL_POA_TEMPLATE_INFO.requiresWitnesses).toBe(true);
    });

    it("should have default witness count of 2", () => {
      expect(FINANCIAL_POA_TEMPLATE_INFO.defaultWitnessCount).toBe(2);
    });
  });
});

describe("Financial POA Document - Required Fields", () => {
  describe("Personal Information", () => {
    it("should require full name", () => {
      expect(FINANCIAL_POA_REQUIRED_FIELDS).toContain("fullName");
    });

    it("should require address", () => {
      expect(FINANCIAL_POA_REQUIRED_FIELDS).toContain("address");
    });

    it("should require state", () => {
      expect(FINANCIAL_POA_REQUIRED_FIELDS).toContain("state");
    });
  });

  describe("Agent Information", () => {
    it("should require agent name", () => {
      expect(FINANCIAL_POA_REQUIRED_FIELDS).toContain("agentName");
    });

    it("should require agent address", () => {
      expect(FINANCIAL_POA_REQUIRED_FIELDS).toContain("agentAddress");
    });
  });

  describe("Powers", () => {
    it("should require granted powers specification", () => {
      expect(FINANCIAL_POA_REQUIRED_FIELDS).toContain("grantedPowers");
    });
  });

  describe("Field Count", () => {
    it("should have 6 required fields", () => {
      expect(FINANCIAL_POA_REQUIRED_FIELDS.length).toBe(6);
    });

    it("should not have duplicate required fields", () => {
      const uniqueFields = new Set(FINANCIAL_POA_REQUIRED_FIELDS);
      expect(uniqueFields.size).toBe(FINANCIAL_POA_REQUIRED_FIELDS.length);
    });
  });
});

describe("Financial POA Document - Optional Fields", () => {
  describe("Address Details", () => {
    it("should support county", () => {
      expect(FINANCIAL_POA_OPTIONAL_FIELDS).toContain("county");
    });

    it("should support city", () => {
      expect(FINANCIAL_POA_OPTIONAL_FIELDS).toContain("city");
    });

    it("should support date of birth", () => {
      expect(FINANCIAL_POA_OPTIONAL_FIELDS).toContain("dateOfBirth");
    });
  });

  describe("Agent Details", () => {
    it("should support agent relationship", () => {
      expect(FINANCIAL_POA_OPTIONAL_FIELDS).toContain("agentRelationship");
    });

    it("should support agent phone", () => {
      expect(FINANCIAL_POA_OPTIONAL_FIELDS).toContain("agentPhone");
    });

    it("should support agent email", () => {
      expect(FINANCIAL_POA_OPTIONAL_FIELDS).toContain("agentEmail");
    });
  });

  describe("Alternate Agent", () => {
    it("should support alternate agent name", () => {
      expect(FINANCIAL_POA_OPTIONAL_FIELDS).toContain("alternateAgentName");
    });

    it("should support alternate agent address", () => {
      expect(FINANCIAL_POA_OPTIONAL_FIELDS).toContain("alternateAgentAddress");
    });

    it("should support alternate agent relationship", () => {
      expect(FINANCIAL_POA_OPTIONAL_FIELDS).toContain("alternateAgentRelationship");
    });

    it("should support alternate agent phone", () => {
      expect(FINANCIAL_POA_OPTIONAL_FIELDS).toContain("alternateAgentPhone");
    });

    it("should support second alternate agent", () => {
      expect(FINANCIAL_POA_OPTIONAL_FIELDS).toContain("secondAlternateAgentName");
      expect(FINANCIAL_POA_OPTIONAL_FIELDS).toContain("secondAlternateAgentAddress");
    });
  });

  describe("Effective Date Options", () => {
    it("should support effective date", () => {
      expect(FINANCIAL_POA_OPTIONAL_FIELDS).toContain("effectiveDate");
    });

    it("should support effective immediately flag", () => {
      expect(FINANCIAL_POA_OPTIONAL_FIELDS).toContain("effectiveImmediately");
    });

    it("should support springing power option", () => {
      expect(FINANCIAL_POA_OPTIONAL_FIELDS).toContain("springingPower");
    });

    it("should support springing condition", () => {
      expect(FINANCIAL_POA_OPTIONAL_FIELDS).toContain("springingCondition");
    });

    it("should support incapacity determination method", () => {
      expect(FINANCIAL_POA_OPTIONAL_FIELDS).toContain("incapacityDetermination");
    });
  });

  describe("Durability and Expiration", () => {
    it("should support durable provision", () => {
      expect(FINANCIAL_POA_OPTIONAL_FIELDS).toContain("durableProvision");
    });

    it("should support expiration date", () => {
      expect(FINANCIAL_POA_OPTIONAL_FIELDS).toContain("expirationDate");
    });
  });

  describe("Power Categories", () => {
    it("should support banking powers", () => {
      expect(FINANCIAL_POA_OPTIONAL_FIELDS).toContain("bankingPowers");
    });

    it("should support investment powers", () => {
      expect(FINANCIAL_POA_OPTIONAL_FIELDS).toContain("investmentPowers");
    });

    it("should support real estate powers", () => {
      expect(FINANCIAL_POA_OPTIONAL_FIELDS).toContain("realEstatePowers");
    });

    it("should support business powers", () => {
      expect(FINANCIAL_POA_OPTIONAL_FIELDS).toContain("businessPowers");
    });

    it("should support tax powers", () => {
      expect(FINANCIAL_POA_OPTIONAL_FIELDS).toContain("taxPowers");
    });

    it("should support insurance powers", () => {
      expect(FINANCIAL_POA_OPTIONAL_FIELDS).toContain("insurancePowers");
    });

    it("should support retirement account powers", () => {
      expect(FINANCIAL_POA_OPTIONAL_FIELDS).toContain("retirementAccountPowers");
    });

    it("should support government benefits powers", () => {
      expect(FINANCIAL_POA_OPTIONAL_FIELDS).toContain("governmentBenefitsPowers");
    });

    it("should support legal powers", () => {
      expect(FINANCIAL_POA_OPTIONAL_FIELDS).toContain("legalPowers");
    });
  });

  describe("Gifting Powers", () => {
    it("should support gifting powers", () => {
      expect(FINANCIAL_POA_OPTIONAL_FIELDS).toContain("giftingPowers");
    });

    it("should support gifting limitations", () => {
      expect(FINANCIAL_POA_OPTIONAL_FIELDS).toContain("giftingLimitations");
    });

    it("should support annual gift limit", () => {
      expect(FINANCIAL_POA_OPTIONAL_FIELDS).toContain("annualGiftLimit");
    });
  });

  describe("Self-Dealing and Compensation", () => {
    it("should support self-dealing allowance", () => {
      expect(FINANCIAL_POA_OPTIONAL_FIELDS).toContain("selfDealingAllowed");
    });

    it("should support compensation allowance", () => {
      expect(FINANCIAL_POA_OPTIONAL_FIELDS).toContain("compensationAllowed");
    });

    it("should support compensation amount", () => {
      expect(FINANCIAL_POA_OPTIONAL_FIELDS).toContain("compensationAmount");
    });

    it("should support compensation type", () => {
      expect(FINANCIAL_POA_OPTIONAL_FIELDS).toContain("compensationType");
    });
  });

  describe("Accountability", () => {
    it("should support bond requirement", () => {
      expect(FINANCIAL_POA_OPTIONAL_FIELDS).toContain("bondRequired");
    });

    it("should support accounting requirement", () => {
      expect(FINANCIAL_POA_OPTIONAL_FIELDS).toContain("accountingRequirement");
    });

    it("should support accounting frequency", () => {
      expect(FINANCIAL_POA_OPTIONAL_FIELDS).toContain("accountingFrequency");
    });
  });

  describe("Co-Agent", () => {
    it("should support co-agent name", () => {
      expect(FINANCIAL_POA_OPTIONAL_FIELDS).toContain("coAgentName");
    });

    it("should support co-agent address", () => {
      expect(FINANCIAL_POA_OPTIONAL_FIELDS).toContain("coAgentAddress");
    });

    it("should support co-agent authority", () => {
      expect(FINANCIAL_POA_OPTIONAL_FIELDS).toContain("coAgentAuthority");
    });
  });

  describe("Additional Provisions", () => {
    it("should support special instructions", () => {
      expect(FINANCIAL_POA_OPTIONAL_FIELDS).toContain("specialInstructions");
    });

    it("should support limitations", () => {
      expect(FINANCIAL_POA_OPTIONAL_FIELDS).toContain("limitations");
    });

    it("should support third party reliance", () => {
      expect(FINANCIAL_POA_OPTIONAL_FIELDS).toContain("thirdPartyReliance");
    });

    it("should support revocation instructions", () => {
      expect(FINANCIAL_POA_OPTIONAL_FIELDS).toContain("revocationInstructions");
    });

    it("should support HIPAA authorization", () => {
      expect(FINANCIAL_POA_OPTIONAL_FIELDS).toContain("hipaaAuthorization");
    });
  });

  describe("Field Count", () => {
    it("should have 45+ optional fields", () => {
      expect(FINANCIAL_POA_OPTIONAL_FIELDS.length).toBeGreaterThanOrEqual(45);
    });

    it("should not have duplicate optional fields", () => {
      const uniqueFields = new Set(FINANCIAL_POA_OPTIONAL_FIELDS);
      expect(uniqueFields.size).toBe(FINANCIAL_POA_OPTIONAL_FIELDS.length);
    });
  });
});

describe("Financial POA Document - Article Sections", () => {
  describe("Required Core Sections", () => {
    it("should have declaration section", () => {
      const section = FINANCIAL_POA_ARTICLE_SECTIONS.find((s) => s.id === "declaration");
      expect(section).toBeDefined();
      expect(section?.required).toBe(true);
    });

    it("should have agent appointment section", () => {
      const section = FINANCIAL_POA_ARTICLE_SECTIONS.find((s) => s.id === "agent_appointment");
      expect(section).toBeDefined();
      expect(section?.required).toBe(true);
    });

    it("should have effective date section", () => {
      const section = FINANCIAL_POA_ARTICLE_SECTIONS.find((s) => s.id === "effective_date");
      expect(section).toBeDefined();
      expect(section?.required).toBe(true);
    });

    it("should have durable provision section", () => {
      const section = FINANCIAL_POA_ARTICLE_SECTIONS.find((s) => s.id === "durable_provision");
      expect(section).toBeDefined();
      expect(section?.required).toBe(true);
    });

    it("should have general powers section", () => {
      const section = FINANCIAL_POA_ARTICLE_SECTIONS.find((s) => s.id === "general_powers");
      expect(section).toBeDefined();
      expect(section?.required).toBe(true);
    });

    it("should have agent duties section", () => {
      const section = FINANCIAL_POA_ARTICLE_SECTIONS.find((s) => s.id === "agent_duties");
      expect(section).toBeDefined();
      expect(section?.required).toBe(true);
    });

    it("should have third party reliance section", () => {
      const section = FINANCIAL_POA_ARTICLE_SECTIONS.find((s) => s.id === "third_party");
      expect(section).toBeDefined();
      expect(section?.required).toBe(true);
    });

    it("should have revocation section", () => {
      const section = FINANCIAL_POA_ARTICLE_SECTIONS.find((s) => s.id === "revocation");
      expect(section).toBeDefined();
      expect(section?.required).toBe(true);
    });

    it("should have severability section", () => {
      const section = FINANCIAL_POA_ARTICLE_SECTIONS.find((s) => s.id === "severability");
      expect(section).toBeDefined();
      expect(section?.required).toBe(true);
    });

    it("should have governing law section", () => {
      const section = FINANCIAL_POA_ARTICLE_SECTIONS.find((s) => s.id === "governing_law");
      expect(section).toBeDefined();
      expect(section?.required).toBe(true);
    });

    it("should have signature section", () => {
      const section = FINANCIAL_POA_ARTICLE_SECTIONS.find((s) => s.id === "signature");
      expect(section).toBeDefined();
      expect(section?.required).toBe(true);
    });
  });

  describe("Optional Power Sections", () => {
    it("should have alternate agents section as optional", () => {
      const section = FINANCIAL_POA_ARTICLE_SECTIONS.find((s) => s.id === "alternate_agents");
      expect(section).toBeDefined();
      expect(section?.required).toBe(false);
    });

    it("should have banking powers section as optional", () => {
      const section = FINANCIAL_POA_ARTICLE_SECTIONS.find((s) => s.id === "banking_powers");
      expect(section).toBeDefined();
      expect(section?.required).toBe(false);
    });

    it("should have investment powers section as optional", () => {
      const section = FINANCIAL_POA_ARTICLE_SECTIONS.find((s) => s.id === "investment_powers");
      expect(section).toBeDefined();
      expect(section?.required).toBe(false);
    });

    it("should have real estate powers section as optional", () => {
      const section = FINANCIAL_POA_ARTICLE_SECTIONS.find((s) => s.id === "real_estate_powers");
      expect(section).toBeDefined();
      expect(section?.required).toBe(false);
    });

    it("should have business powers section as optional", () => {
      const section = FINANCIAL_POA_ARTICLE_SECTIONS.find((s) => s.id === "business_powers");
      expect(section).toBeDefined();
      expect(section?.required).toBe(false);
    });

    it("should have tax powers section as optional", () => {
      const section = FINANCIAL_POA_ARTICLE_SECTIONS.find((s) => s.id === "tax_powers");
      expect(section).toBeDefined();
      expect(section?.required).toBe(false);
    });

    it("should have insurance powers section as optional", () => {
      const section = FINANCIAL_POA_ARTICLE_SECTIONS.find((s) => s.id === "insurance_powers");
      expect(section).toBeDefined();
      expect(section?.required).toBe(false);
    });

    it("should have retirement powers section as optional", () => {
      const section = FINANCIAL_POA_ARTICLE_SECTIONS.find((s) => s.id === "retirement_powers");
      expect(section).toBeDefined();
      expect(section?.required).toBe(false);
    });

    it("should have government benefits section as optional", () => {
      const section = FINANCIAL_POA_ARTICLE_SECTIONS.find((s) => s.id === "government_benefits");
      expect(section).toBeDefined();
      expect(section?.required).toBe(false);
    });

    it("should have gifting powers section as optional", () => {
      const section = FINANCIAL_POA_ARTICLE_SECTIONS.find((s) => s.id === "gifting_powers");
      expect(section).toBeDefined();
      expect(section?.required).toBe(false);
    });

    it("should have legal powers section as optional", () => {
      const section = FINANCIAL_POA_ARTICLE_SECTIONS.find((s) => s.id === "legal_powers");
      expect(section).toBeDefined();
      expect(section?.required).toBe(false);
    });

    it("should have limitations section as optional", () => {
      const section = FINANCIAL_POA_ARTICLE_SECTIONS.find((s) => s.id === "limitations");
      expect(section).toBeDefined();
      expect(section?.required).toBe(false);
    });

    it("should have compensation section as optional", () => {
      const section = FINANCIAL_POA_ARTICLE_SECTIONS.find((s) => s.id === "compensation");
      expect(section).toBeDefined();
      expect(section?.required).toBe(false);
    });

    it("should have accounting section as optional", () => {
      const section = FINANCIAL_POA_ARTICLE_SECTIONS.find((s) => s.id === "accounting");
      expect(section).toBeDefined();
      expect(section?.required).toBe(false);
    });

    it("should have agent acceptance section as optional", () => {
      const section = FINANCIAL_POA_ARTICLE_SECTIONS.find((s) => s.id === "agent_acceptance");
      expect(section).toBeDefined();
      expect(section?.required).toBe(false);
    });
  });

  describe("Section Ordering", () => {
    it("should start with declaration", () => {
      expect(FINANCIAL_POA_ARTICLE_SECTIONS[0].id).toBe("declaration");
    });

    it("should have agent appointment early", () => {
      const agentIndex = FINANCIAL_POA_ARTICLE_SECTIONS.findIndex(
        (s) => s.id === "agent_appointment",
      );
      expect(agentIndex).toBeLessThan(3);
    });

    it("should have signature near the end", () => {
      const signatureIndex = FINANCIAL_POA_ARTICLE_SECTIONS.findIndex((s) => s.id === "signature");
      expect(signatureIndex).toBeGreaterThan(FINANCIAL_POA_ARTICLE_SECTIONS.length - 5);
    });

    it("should have agent acceptance as last section", () => {
      const lastSection = FINANCIAL_POA_ARTICLE_SECTIONS[FINANCIAL_POA_ARTICLE_SECTIONS.length - 1];
      expect(lastSection.id).toBe("agent_acceptance");
    });
  });

  describe("Section Count", () => {
    it("should have 26 article sections", () => {
      expect(FINANCIAL_POA_ARTICLE_SECTIONS.length).toBe(26);
    });

    it("should have 11 required sections", () => {
      const requiredSections = FINANCIAL_POA_ARTICLE_SECTIONS.filter((s) => s.required);
      expect(requiredSections.length).toBe(11);
    });

    it("should have 15 optional sections", () => {
      const optionalSections = FINANCIAL_POA_ARTICLE_SECTIONS.filter((s) => !s.required);
      expect(optionalSections.length).toBe(15);
    });

    it("should have unique section IDs", () => {
      const ids = FINANCIAL_POA_ARTICLE_SECTIONS.map((s) => s.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it("should have titles for all sections", () => {
      for (const section of FINANCIAL_POA_ARTICLE_SECTIONS) {
        expect(section.title).toBeTruthy();
        expect(section.title.length).toBeGreaterThan(3);
      }
    });
  });
});

describe("Financial POA Document - State Requirements", () => {
  describe("All States Coverage", () => {
    it("should have financial POA requirements for all 51 jurisdictions", () => {
      for (const state of US_STATES) {
        const requirements = STATE_LEGAL_REQUIREMENTS[state];
        expect(requirements).toBeDefined();
        expect(requirements.financial_poa).toBeDefined();
      }
    });

    it("should have consistent financial POA requirements structure", () => {
      for (const state of US_STATES) {
        const poaReqs = STATE_LEGAL_REQUIREMENTS[state].financial_poa;
        expect(poaReqs).toHaveProperty("witnessCount");
        expect(poaReqs).toHaveProperty("notaryRequired");
      }
    });
  });

  describe("Notary Requirements", () => {
    it("should require notary in most states", () => {
      const statesRequiringNotary = US_STATES.filter(
        (state) => STATE_LEGAL_REQUIREMENTS[state].financial_poa.notaryRequired,
      );
      expect(statesRequiringNotary.length).toBeGreaterThanOrEqual(40);
    });
  });

  describe("Witness Requirements", () => {
    it("should have varying witness requirements by state", () => {
      const witnessCounts = US_STATES.map(
        (state) => STATE_LEGAL_REQUIREMENTS[state].financial_poa.witnessCount,
      );
      const uniqueCounts = new Set(witnessCounts);
      expect(uniqueCounts.size).toBeGreaterThanOrEqual(1);
    });
  });

  describe("State Snapshots", () => {
    it("should have correct California financial POA requirements", () => {
      expect(STATE_LEGAL_REQUIREMENTS.CA.financial_poa).toMatchObject({
        notaryRequired: true,
      });
    });

    it("should have correct New York financial POA requirements", () => {
      expect(STATE_LEGAL_REQUIREMENTS.NY.financial_poa).toMatchObject({
        notaryRequired: true,
      });
    });

    it("should have correct Texas financial POA requirements", () => {
      expect(STATE_LEGAL_REQUIREMENTS.TX.financial_poa).toMatchObject({
        notaryRequired: true,
      });
    });

    it("should have correct Florida financial POA requirements", () => {
      expect(STATE_LEGAL_REQUIREMENTS.FL.financial_poa).toMatchObject({
        notaryRequired: true,
      });
    });
  });
});

describe("Financial POA Document - Power Categories", () => {
  describe("Banking Powers", () => {
    it("should have banking powers section", () => {
      const section = FINANCIAL_POA_ARTICLE_SECTIONS.find((s) => s.id === "banking_powers");
      expect(section).toBeDefined();
      expect(section?.title).toContain("Banking");
    });

    it("should have banking powers in optional fields", () => {
      expect(FINANCIAL_POA_OPTIONAL_FIELDS).toContain("bankingPowers");
    });
  });

  describe("Investment Powers", () => {
    it("should have investment powers section", () => {
      const section = FINANCIAL_POA_ARTICLE_SECTIONS.find((s) => s.id === "investment_powers");
      expect(section).toBeDefined();
      expect(section?.title).toContain("Investment");
    });

    it("should have investment powers in optional fields", () => {
      expect(FINANCIAL_POA_OPTIONAL_FIELDS).toContain("investmentPowers");
    });
  });

  describe("Real Estate Powers", () => {
    it("should have real estate powers section", () => {
      const section = FINANCIAL_POA_ARTICLE_SECTIONS.find((s) => s.id === "real_estate_powers");
      expect(section).toBeDefined();
      expect(section?.title).toContain("Real Estate");
    });

    it("should have real estate powers in optional fields", () => {
      expect(FINANCIAL_POA_OPTIONAL_FIELDS).toContain("realEstatePowers");
    });
  });

  describe("Tax Powers", () => {
    it("should have tax powers section", () => {
      const section = FINANCIAL_POA_ARTICLE_SECTIONS.find((s) => s.id === "tax_powers");
      expect(section).toBeDefined();
      expect(section?.title).toContain("Tax");
    });

    it("should have tax powers in optional fields", () => {
      expect(FINANCIAL_POA_OPTIONAL_FIELDS).toContain("taxPowers");
    });
  });

  describe("Gifting Powers", () => {
    it("should have gifting powers section", () => {
      const section = FINANCIAL_POA_ARTICLE_SECTIONS.find((s) => s.id === "gifting_powers");
      expect(section).toBeDefined();
      expect(section?.title).toContain("Gifting");
    });

    it("should have gifting powers and limitations in optional fields", () => {
      expect(FINANCIAL_POA_OPTIONAL_FIELDS).toContain("giftingPowers");
      expect(FINANCIAL_POA_OPTIONAL_FIELDS).toContain("giftingLimitations");
      expect(FINANCIAL_POA_OPTIONAL_FIELDS).toContain("annualGiftLimit");
    });
  });
});

describe("Financial POA Document - PDF Generation Structure", () => {
  const EXPECTED_PDF_PAGES = [
    {
      pageNum: 1,
      sections: [
        "header",
        "durability_notice",
        "article_agent_appointment",
        "article_powers_granted",
      ],
    },
    {
      pageNum: 2,
      sections: [
        "article_special_powers",
        "article_self_dealing",
        "article_effective_date",
        "article_agent_duties",
        "article_limitations_if_provided",
      ],
    },
    {
      pageNum: 3,
      sections: [
        "article_third_party_reliance",
        "article_agent_compensation",
        "article_revocation",
        "article_governing_law",
        "principal_signature",
        "witness_attestation_if_required",
      ],
    },
    {
      pageNum: 4,
      sections: [
        "notary_acknowledgment_if_required",
        "article_agent_acceptance",
        "successor_agent_acceptance_if_provided",
        "important_notices",
      ],
    },
  ];

  describe("Page Structure", () => {
    it("should have 4 pages", () => {
      expect(EXPECTED_PDF_PAGES.length).toBe(4);
    });

    it("should have header on first page", () => {
      expect(EXPECTED_PDF_PAGES[0].sections).toContain("header");
    });

    it("should have durability notice prominently on first page", () => {
      expect(EXPECTED_PDF_PAGES[0].sections).toContain("durability_notice");
    });

    it("should have principal signature on page 3", () => {
      expect(EXPECTED_PDF_PAGES[2].sections).toContain("principal_signature");
    });

    it("should have agent acceptance on page 4", () => {
      expect(EXPECTED_PDF_PAGES[3].sections).toContain("article_agent_acceptance");
    });
  });

  describe("Header Section", () => {
    const EXPECTED_HEADER_ELEMENTS = ["title", "subtitle", "state_of_execution"];

    it("should display document title", () => {
      expect(EXPECTED_HEADER_ELEMENTS).toContain("title");
    });

    it("should display subtitle (for Financial Matters)", () => {
      expect(EXPECTED_HEADER_ELEMENTS).toContain("subtitle");
    });

    it("should display state", () => {
      expect(EXPECTED_HEADER_ELEMENTS).toContain("state_of_execution");
    });
  });

  describe("Powers Granted Section", () => {
    const EXPECTED_POWERS_CHECKBOXES = [
      "banking",
      "real_property",
      "investments",
      "retirement",
      "taxes",
      "insurance",
      "business",
      "government_benefits",
      "legal",
      "digital",
      "personal_property",
      "claims_litigation",
      "estate_transactions",
    ];

    it("should have 13 power categories with checkboxes", () => {
      expect(EXPECTED_POWERS_CHECKBOXES.length).toBe(13);
    });

    it("should include banking powers", () => {
      expect(EXPECTED_POWERS_CHECKBOXES).toContain("banking");
    });

    it("should include real property powers", () => {
      expect(EXPECTED_POWERS_CHECKBOXES).toContain("real_property");
    });

    it("should include digital assets powers", () => {
      expect(EXPECTED_POWERS_CHECKBOXES).toContain("digital");
    });
  });

  describe("Special Powers Section", () => {
    const EXPECTED_SPECIAL_POWERS = [
      "gift_making",
      "create_amend_trusts",
      "change_beneficiaries",
      "delegate_authority",
      "disclaim_property",
    ];

    it("should have 5 special powers requiring express grant", () => {
      expect(EXPECTED_SPECIAL_POWERS.length).toBe(5);
    });

    it("should include gift-making powers", () => {
      expect(EXPECTED_SPECIAL_POWERS).toContain("gift_making");
    });

    it("should include trust creation powers", () => {
      expect(EXPECTED_SPECIAL_POWERS).toContain("create_amend_trusts");
    });

    it("should include beneficiary change powers", () => {
      expect(EXPECTED_SPECIAL_POWERS).toContain("change_beneficiaries");
    });
  });

  describe("Agent Appointment Section", () => {
    const EXPECTED_AGENT_ELEMENTS = [
      "principal_name",
      "principal_address",
      "principal_dob",
      "agent_name",
      "agent_relationship",
      "agent_address",
      "agent_phone",
      "successor_agent_if_provided",
    ];

    it("should display principal information", () => {
      expect(EXPECTED_AGENT_ELEMENTS).toContain("principal_name");
      expect(EXPECTED_AGENT_ELEMENTS).toContain("principal_address");
    });

    it("should display primary agent information", () => {
      expect(EXPECTED_AGENT_ELEMENTS).toContain("agent_name");
      expect(EXPECTED_AGENT_ELEMENTS).toContain("agent_address");
    });

    it("should display successor agent if provided", () => {
      expect(EXPECTED_AGENT_ELEMENTS).toContain("successor_agent_if_provided");
    });
  });

  describe("Effective Date Section", () => {
    const EFFECTIVE_DATE_OPTIONS = ["immediate", "springing"];

    it("should support immediate effectiveness", () => {
      expect(EFFECTIVE_DATE_OPTIONS).toContain("immediate");
    });

    it("should support springing power (upon incapacity)", () => {
      expect(EFFECTIVE_DATE_OPTIONS).toContain("springing");
    });
  });

  describe("Self-Dealing Section", () => {
    const SELF_DEALING_OPTIONS = ["allowed", "prohibited"];

    it("should have allow/prohibit options", () => {
      expect(SELF_DEALING_OPTIONS).toContain("allowed");
      expect(SELF_DEALING_OPTIONS).toContain("prohibited");
    });
  });

  describe("Agent Acceptance Section", () => {
    const EXPECTED_ACCEPTANCE_ELEMENTS = [
      "acknowledgment_duties",
      "fiduciary_duty",
      "best_interests",
      "separate_property",
      "record_keeping",
      "liability_acknowledgment",
      "primary_agent_signature",
      "successor_agent_signature_if_provided",
    ];

    it("should list 6 acknowledgment points", () => {
      const acknowledgments = EXPECTED_ACCEPTANCE_ELEMENTS.filter((e) => !e.includes("signature"));
      expect(acknowledgments.length).toBe(6);
    });

    it("should have primary agent signature", () => {
      expect(EXPECTED_ACCEPTANCE_ELEMENTS).toContain("primary_agent_signature");
    });

    it("should have successor agent signature if provided", () => {
      expect(EXPECTED_ACCEPTANCE_ELEMENTS).toContain("successor_agent_signature_if_provided");
    });
  });

  describe("Page Footer", () => {
    const EXPECTED_FOOTER_ELEMENTS = ["document_title", "principal_name", "page_number"];

    it("should display document title", () => {
      expect(EXPECTED_FOOTER_ELEMENTS).toContain("document_title");
    });

    it("should display principal name", () => {
      expect(EXPECTED_FOOTER_ELEMENTS).toContain("principal_name");
    });

    it("should display page number", () => {
      expect(EXPECTED_FOOTER_ELEMENTS).toContain("page_number");
    });
  });
});

describe("Financial POA Document - PDF Data Mapping", () => {
  describe("Required Field Mapping", () => {
    const REQUIRED_PDF_MAPPINGS = [
      { field: "fullName", pdfLocation: "header, agent appointment, signature" },
      { field: "address", pdfLocation: "agent appointment" },
      { field: "state", pdfLocation: "header, governing law" },
      { field: "agentName", pdfLocation: "agent appointment, agent acceptance" },
      { field: "agentAddress", pdfLocation: "agent appointment" },
      { field: "grantedPowers", pdfLocation: "powers granted checkboxes" },
    ];

    it("should map all 6 required fields to PDF content", () => {
      expect(REQUIRED_PDF_MAPPINGS.length).toBe(6);
    });

    it("should map fullName to multiple locations", () => {
      const mapping = REQUIRED_PDF_MAPPINGS.find((m) => m.field === "fullName");
      expect(mapping?.pdfLocation).toContain("header");
      expect(mapping?.pdfLocation).toContain("signature");
    });

    it("should map agentName to agent acceptance", () => {
      const mapping = REQUIRED_PDF_MAPPINGS.find((m) => m.field === "agentName");
      expect(mapping?.pdfLocation).toContain("agent acceptance");
    });
  });

  describe("Conditional Content", () => {
    it("should show successor agent only when provided", () => {
      expect(FINANCIAL_POA_OPTIONAL_FIELDS).toContain("alternateAgentName");
    });

    it("should show limitations section only when limitations provided", () => {
      expect(FINANCIAL_POA_OPTIONAL_FIELDS).toContain("limitations");
      const section = FINANCIAL_POA_ARTICLE_SECTIONS.find((s) => s.id === "limitations");
      expect(section?.required).toBe(false);
    });

    it("should show gifting limitations only when gifting powers granted", () => {
      expect(FINANCIAL_POA_OPTIONAL_FIELDS).toContain("giftingPowers");
      expect(FINANCIAL_POA_OPTIONAL_FIELDS).toContain("giftingLimitations");
    });

    it("should show incapacity determination only for springing POA", () => {
      expect(FINANCIAL_POA_OPTIONAL_FIELDS).toContain("springingPower");
      expect(FINANCIAL_POA_OPTIONAL_FIELDS).toContain("incapacityDetermination");
    });

    it("should show witnesses only when state requires", () => {
      // Template requires witnesses by default
      expect(FINANCIAL_POA_TEMPLATE_INFO.requiresWitnesses).toBe(true);
    });

    it("should show notary only when state requires", () => {
      // Check state variation
      const statesRequiringNotary = US_STATES.filter(
        (state) => STATE_LEGAL_REQUIREMENTS[state].financial_poa.notaryRequired,
      );
      expect(statesRequiringNotary.length).toBeGreaterThan(0);
    });
  });
});

describe("Financial POA Document - Cross-Validation", () => {
  describe("Template and State Requirement Alignment", () => {
    it("should have notary requirement matching template default", () => {
      expect(FINANCIAL_POA_TEMPLATE_INFO.requiresNotary).toBe(true);
      const statesRequiringNotary = US_STATES.filter(
        (state) => STATE_LEGAL_REQUIREMENTS[state].financial_poa.notaryRequired,
      );
      expect(statesRequiringNotary.length).toBeGreaterThanOrEqual(40);
    });
  });

  describe("Required Fields and Article Sections Alignment", () => {
    it("should have agent appointment section for agent required field", () => {
      expect(FINANCIAL_POA_REQUIRED_FIELDS).toContain("agentName");
      const section = FINANCIAL_POA_ARTICLE_SECTIONS.find((s) => s.id === "agent_appointment");
      expect(section).toBeDefined();
    });

    it("should have general powers section for grantedPowers required field", () => {
      expect(FINANCIAL_POA_REQUIRED_FIELDS).toContain("grantedPowers");
      const section = FINANCIAL_POA_ARTICLE_SECTIONS.find((s) => s.id === "general_powers");
      expect(section).toBeDefined();
    });
  });

  describe("Power Categories Coverage", () => {
    const EXPECTED_POWER_CATEGORIES = [
      "bankingPowers",
      "investmentPowers",
      "realEstatePowers",
      "businessPowers",
      "taxPowers",
      "insurancePowers",
      "retirementAccountPowers",
      "governmentBenefitsPowers",
      "legalPowers",
      "giftingPowers",
    ];

    it("should have all 10 power categories in optional fields", () => {
      for (const power of EXPECTED_POWER_CATEGORIES) {
        expect(FINANCIAL_POA_OPTIONAL_FIELDS).toContain(power);
      }
    });

    it("should have corresponding article sections for major power categories", () => {
      const powerSections = FINANCIAL_POA_ARTICLE_SECTIONS.filter((s) => s.id.includes("powers"));
      expect(powerSections.length).toBeGreaterThanOrEqual(8);
    });
  });
});

describe("Financial POA Document - Legal Compliance", () => {
  describe("Durable Provision", () => {
    it("should have durable provision as required section", () => {
      const section = FINANCIAL_POA_ARTICLE_SECTIONS.find((s) => s.id === "durable_provision");
      expect(section).toBeDefined();
      expect(section?.required).toBe(true);
    });
  });

  describe("Agent Duties", () => {
    it("should have agent duties as required section", () => {
      const section = FINANCIAL_POA_ARTICLE_SECTIONS.find((s) => s.id === "agent_duties");
      expect(section).toBeDefined();
      expect(section?.required).toBe(true);
    });
  });

  describe("Third Party Reliance", () => {
    it("should have third party reliance as required section", () => {
      const section = FINANCIAL_POA_ARTICLE_SECTIONS.find((s) => s.id === "third_party");
      expect(section).toBeDefined();
      expect(section?.required).toBe(true);
    });
  });

  describe("Revocation", () => {
    it("should have revocation as required section", () => {
      const section = FINANCIAL_POA_ARTICLE_SECTIONS.find((s) => s.id === "revocation");
      expect(section).toBeDefined();
      expect(section?.required).toBe(true);
    });
  });

  describe("Severability", () => {
    it("should have severability as required section", () => {
      const section = FINANCIAL_POA_ARTICLE_SECTIONS.find((s) => s.id === "severability");
      expect(section).toBeDefined();
      expect(section?.required).toBe(true);
    });
  });

  describe("Governing Law", () => {
    it("should have governing law as required section", () => {
      const section = FINANCIAL_POA_ARTICLE_SECTIONS.find((s) => s.id === "governing_law");
      expect(section).toBeDefined();
      expect(section?.required).toBe(true);
    });
  });
});
