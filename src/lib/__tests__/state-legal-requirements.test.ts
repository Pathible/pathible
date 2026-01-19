import { describe, expect, it } from "vitest";
import {
  allowsHolographicWills,
  allowsSelfProvingWills,
  getStateLegalRequirements,
  getStateName,
  isCommunityPropertyState,
  US_STATES,
  type USState,
} from "../state-legal-requirements";

/**
 * State Legal Requirements Tests
 *
 * These tests verify that state-specific legal requirements are:
 * 1. Complete for all 50 states + DC
 * 2. Consistent in structure
 * 3. Valid in their values
 *
 * IMPORTANT: These are snapshot-style tests. If requirements change,
 * update the snapshots deliberately after legal review.
 */

describe("State Legal Requirements", () => {
  describe("Coverage", () => {
    it("should have requirements for all 50 states plus DC", () => {
      expect(US_STATES).toHaveLength(51); // 50 states + DC
    });

    it("should return valid requirements for each state", () => {
      for (const state of US_STATES) {
        const requirements = getStateLegalRequirements(state);
        expect(requirements).toBeDefined();
        expect(requirements.will).toBeDefined();
        expect(requirements.revocable_trust).toBeDefined();
        expect(requirements.financial_poa).toBeDefined();
        expect(requirements.healthcare_poa).toBeDefined();
        expect(requirements.advance_directive).toBeDefined();
      }
    });

    it("should have state names for all states", () => {
      for (const state of US_STATES) {
        const name = getStateName(state);
        expect(name).toBeTruthy();
        expect(name.length).toBeGreaterThan(2);
      }
    });
  });

  describe("Will Requirements Structure", () => {
    it("should have will requirements for all states", () => {
      for (const state of US_STATES) {
        const requirements = getStateLegalRequirements(state);
        expect(requirements.will).toBeDefined();
        expect(requirements.will.witnessCount).toBeGreaterThanOrEqual(2);
        expect(requirements.will.witnessCount).toBeLessThanOrEqual(3);
      }
    });

    it("should have valid witness counts (2 or 3)", () => {
      const witnessCounts = new Map<number, USState[]>();

      for (const state of US_STATES) {
        const { will } = getStateLegalRequirements(state);
        const count = will.witnessCount;

        if (!witnessCounts.has(count)) {
          witnessCounts.set(count, []);
        }
        witnessCounts.get(count)?.push(state);
      }

      // Most states require 2 witnesses
      expect(witnessCounts.get(2)?.length).toBeGreaterThan(45);

      // South Carolina requires 3 witnesses
      const threeWitnessStates = witnessCounts.get(3) || [];
      expect(threeWitnessStates).toContain("SC");
    });

    it("should have consistent notarization field", () => {
      for (const state of US_STATES) {
        const { will } = getStateLegalRequirements(state);
        expect(typeof will.notaryRequired).toBe("boolean");
      }
    });

    it("should have self-proving affidavit option for most states", () => {
      let selfProvingCount = 0;

      for (const state of US_STATES) {
        if (allowsSelfProvingWills(state)) {
          selfProvingCount++;
        }
      }

      // Most states allow self-proving affidavits
      expect(selfProvingCount).toBeGreaterThan(45);
    });
  });

  describe("Holographic Will Recognition", () => {
    it("should correctly identify holographic will states", () => {
      // States that recognize holographic wills (sample)
      const expectedHolographicStates: USState[] = ["CA", "TX", "VA", "NC", "TN"];

      for (const state of expectedHolographicStates) {
        expect(allowsHolographicWills(state)).toBe(true);
      }
    });

    it("should correctly identify non-holographic states", () => {
      // States that do NOT recognize holographic wills (sample)
      const nonHolographicStates: USState[] = ["FL", "NY", "IL", "OH"];

      for (const state of nonHolographicStates) {
        expect(allowsHolographicWills(state)).toBe(false);
      }
    });
  });

  describe("Community Property States", () => {
    it("should identify all community property states", () => {
      const communityPropertyStates: USState[] = [
        "AZ",
        "CA",
        "ID",
        "LA",
        "NV",
        "NM",
        "TX",
        "WA",
        "WI",
      ];

      for (const state of communityPropertyStates) {
        expect(isCommunityPropertyState(state)).toBe(true);
      }
    });

    it("should identify common law states", () => {
      const commonLawStates: USState[] = ["NY", "FL", "IL", "PA", "OH"];

      for (const state of commonLawStates) {
        expect(isCommunityPropertyState(state)).toBe(false);
      }
    });
  });

  describe("Witness Restrictions", () => {
    it("should have witness age requirements", () => {
      for (const state of US_STATES) {
        const { will } = getStateLegalRequirements(state);
        expect(will.minimumWitnessAge).toBeGreaterThanOrEqual(14);
        expect(will.minimumWitnessAge).toBeLessThanOrEqual(21);
      }
    });
  });

  describe("State-Specific Snapshot Tests", () => {
    it("California requirements should be stable", () => {
      const ca = getStateLegalRequirements("CA");
      expect(ca.will).toMatchObject({
        witnessCount: 2,
        notaryRequired: false,
        selfProvingAllowed: false, // CA does NOT recognize self-proving wills
        holographicAllowed: true,
        minimumWitnessAge: 18,
      });
      expect(isCommunityPropertyState("CA")).toBe(true);
      expect(getStateName("CA")).toBe("California");
    });

    it("New York requirements should be stable", () => {
      const ny = getStateLegalRequirements("NY");
      expect(ny.will).toMatchObject({
        witnessCount: 2,
        notaryRequired: false,
        selfProvingAllowed: true,
        holographicAllowed: false,
        minimumWitnessAge: 18,
      });
      expect(isCommunityPropertyState("NY")).toBe(false);
      expect(getStateName("NY")).toBe("New York");
    });

    it("Texas requirements should be stable", () => {
      const tx = getStateLegalRequirements("TX");
      expect(tx.will).toMatchObject({
        witnessCount: 2,
        notaryRequired: false,
        selfProvingAllowed: true,
        holographicAllowed: true,
        minimumWitnessAge: 14, // Texas allows 14+ witnesses
      });
      expect(isCommunityPropertyState("TX")).toBe(true);
      expect(getStateName("TX")).toBe("Texas");
    });

    it("South Carolina requirements should be stable (3 witnesses)", () => {
      const sc = getStateLegalRequirements("SC");
      expect(sc.will.witnessCount).toBe(3); // SC is the only state requiring 3 witnesses
      expect(getStateName("SC")).toBe("South Carolina");
    });

    it("Vermont requirements should be stable", () => {
      const vt = getStateLegalRequirements("VT");
      expect(vt.will.witnessCount).toBe(2);
      expect(vt.will.selfProvingAllowed).toBe(true);
      expect(getStateName("VT")).toBe("Vermont");
    });

    it("Louisiana requirements should be stable (notarization)", () => {
      const la = getStateLegalRequirements("LA");
      expect(la.will.notaryRequired).toBe(true); // Louisiana is unique
      expect(isCommunityPropertyState("LA")).toBe(true);
      expect(getStateName("LA")).toBe("Louisiana");
    });
  });

  describe("Trust Requirements", () => {
    it("should have trust requirements for all states", () => {
      for (const state of US_STATES) {
        const requirements = getStateLegalRequirements(state);
        expect(requirements.revocable_trust).toBeDefined();
        expect(typeof requirements.revocable_trust.witnessCount).toBe("number");
        expect(typeof requirements.revocable_trust.notaryRequired).toBe("boolean");
      }
    });
  });

  describe("POA Requirements", () => {
    it("should have financial POA requirements for all states", () => {
      for (const state of US_STATES) {
        const requirements = getStateLegalRequirements(state);
        expect(requirements.financial_poa).toBeDefined();
        expect(typeof requirements.financial_poa.witnessCount).toBe("number");
        expect(typeof requirements.financial_poa.notaryRequired).toBe("boolean");
      }
    });

    it("should have healthcare POA requirements for all states", () => {
      for (const state of US_STATES) {
        const requirements = getStateLegalRequirements(state);
        expect(requirements.healthcare_poa).toBeDefined();
        expect(typeof requirements.healthcare_poa.witnessCount).toBe("number");
        expect(typeof requirements.healthcare_poa.notaryRequired).toBe("boolean");
      }
    });
  });

  describe("Advance Directive Requirements", () => {
    it("should have advance directive requirements for all states", () => {
      for (const state of US_STATES) {
        const requirements = getStateLegalRequirements(state);
        expect(requirements.advance_directive).toBeDefined();
        expect(typeof requirements.advance_directive.witnessCount).toBe("number");
        expect(typeof requirements.advance_directive.notaryRequired).toBe("boolean");
      }
    });
  });
});

/**
 * Validation Tests
 * Ensure all data is valid and complete
 */
describe("Data Validation", () => {
  it("should have valid state codes (2 uppercase letters)", () => {
    for (const state of US_STATES) {
      expect(state).toMatch(/^[A-Z]{2}$/);
    }
  });

  it("should have unique state codes", () => {
    const unique = new Set(US_STATES);
    expect(unique.size).toBe(US_STATES.length);
  });

  it("should have non-empty state names", () => {
    for (const state of US_STATES) {
      const name = getStateName(state);
      expect(name).toBeTruthy();
      expect(name.length).toBeGreaterThan(2);
    }
  });

  it("should have consistent special requirements field", () => {
    for (const state of US_STATES) {
      const requirements = getStateLegalRequirements(state);
      // specialRequirements can be string or null
      expect(
        requirements.will.specialRequirements === null ||
          typeof requirements.will.specialRequirements === "string",
      ).toBe(true);
    }
  });
});

/**
 * Document Type Consistency Tests
 */
describe("Document Type Consistency", () => {
  const documentTypes = [
    "will",
    "revocable_trust",
    "financial_poa",
    "healthcare_poa",
    "advance_directive",
  ] as const;

  it("should have all document types for every state", () => {
    for (const state of US_STATES) {
      const requirements = getStateLegalRequirements(state);
      for (const docType of documentTypes) {
        expect(requirements[docType]).toBeDefined();
      }
    }
  });

  it("should have document names for POA and directive types", () => {
    for (const state of US_STATES) {
      const requirements = getStateLegalRequirements(state);
      expect(requirements.revocable_trust.documentName).toBeTruthy();
      expect(requirements.financial_poa.documentName).toBeTruthy();
      expect(requirements.healthcare_poa.documentName).toBeTruthy();
      expect(requirements.advance_directive.documentName).toBeTruthy();
    }
  });
});
