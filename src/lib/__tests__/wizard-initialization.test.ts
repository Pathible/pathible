import { describe, expect, it } from "vitest";

/**
 * Wizard Initialization Tests
 *
 * These tests verify the auto-fill behavior for legal document wizards.
 * The wizard should pre-populate fields from the user's familyMember record
 * to reduce data entry burden.
 *
 * CRITICAL: These tests document the expected initialization behavior
 * to prevent regressions in the auto-fill functionality.
 */

// Types matching the wizard's internal types
interface FamilyMemberRecord {
  county?: string;
  maritalStatus?: string;
  firstName: string;
  lastName: string;
}

interface HouseholdRecord {
  name: string;
}

interface SavedResponses {
  county?: string;
  maritalStatus?: string;
  trustName?: string;
  [key: string]: string | undefined;
}

/**
 * Pure function that replicates the wizard's initialization logic
 * This allows us to unit test the logic without React component rendering
 */
function initializeWizardResponses(
  savedResponses: SavedResponses,
  currentUserFamilyMember: FamilyMemberRecord | null,
  household: HouseholdRecord,
  documentType: string,
): SavedResponses {
  const initialResponses: SavedResponses = {
    ...savedResponses,
  };

  // Auto-fill county from current user's family member record
  if (!savedResponses.county && currentUserFamilyMember?.county) {
    initialResponses.county = currentUserFamilyMember.county;
  }

  // Auto-fill maritalStatus from current user's family member record
  if (!savedResponses.maritalStatus && currentUserFamilyMember?.maritalStatus) {
    initialResponses.maritalStatus = currentUserFamilyMember.maritalStatus;
  }

  // Auto-fill Trust Name from household name for trust documents
  if (documentType === "trust" && !savedResponses.trustName && household.name) {
    initialResponses.trustName = `${household.name} Revocable Living Trust`;
  }

  return initialResponses;
}

/**
 * Simulates the query loading states in Convex React
 * undefined = loading, null = not found, value = found
 */
type QueryState<T> = undefined | null | T;

/**
 * Determines if initialization should proceed based on query states
 * This replicates the race condition fix in the wizard
 */
function shouldInitialize(
  document: unknown,
  household: unknown,
  familyMemberQueryState: QueryState<FamilyMemberRecord>,
  hasInitialized: boolean,
): boolean {
  // familyMemberQueryState is undefined while loading, null if not found, or the record if found
  // We must wait for the query to complete (not be undefined) before initializing
  const familyMemberQueryResolved = familyMemberQueryState !== undefined;

  return !!(document && household && familyMemberQueryResolved && !hasInitialized);
}

describe("Wizard Initialization Logic", () => {
  const mockHousehold: HouseholdRecord = { name: "Smith Family" };
  const mockDocument = { documentType: "will", responses: "{}" };

  describe("Auto-fill from familyMember", () => {
    it("should auto-fill county when familyMember has county and no saved value", () => {
      const familyMember: FamilyMemberRecord = {
        firstName: "John",
        lastName: "Smith",
        county: "Los Angeles",
      };
      const savedResponses: SavedResponses = {};

      const result = initializeWizardResponses(savedResponses, familyMember, mockHousehold, "will");

      expect(result.county).toBe("Los Angeles");
    });

    it("should auto-fill maritalStatus when familyMember has maritalStatus and no saved value", () => {
      const familyMember: FamilyMemberRecord = {
        firstName: "John",
        lastName: "Smith",
        maritalStatus: "married",
      };
      const savedResponses: SavedResponses = {};

      const result = initializeWizardResponses(savedResponses, familyMember, mockHousehold, "will");

      expect(result.maritalStatus).toBe("married");
    });

    it("should auto-fill both county and maritalStatus together", () => {
      const familyMember: FamilyMemberRecord = {
        firstName: "John",
        lastName: "Smith",
        county: "Orange",
        maritalStatus: "single",
      };
      const savedResponses: SavedResponses = {};

      const result = initializeWizardResponses(savedResponses, familyMember, mockHousehold, "will");

      expect(result.county).toBe("Orange");
      expect(result.maritalStatus).toBe("single");
    });

    it("should NOT override saved county value", () => {
      const familyMember: FamilyMemberRecord = {
        firstName: "John",
        lastName: "Smith",
        county: "Los Angeles",
      };
      const savedResponses: SavedResponses = { county: "San Diego" };

      const result = initializeWizardResponses(savedResponses, familyMember, mockHousehold, "will");

      expect(result.county).toBe("San Diego");
    });

    it("should NOT override saved maritalStatus value", () => {
      const familyMember: FamilyMemberRecord = {
        firstName: "John",
        lastName: "Smith",
        maritalStatus: "married",
      };
      const savedResponses: SavedResponses = { maritalStatus: "divorced" };

      const result = initializeWizardResponses(savedResponses, familyMember, mockHousehold, "will");

      expect(result.maritalStatus).toBe("divorced");
    });

    it("should handle null familyMember gracefully", () => {
      const savedResponses: SavedResponses = {};

      const result = initializeWizardResponses(savedResponses, null, mockHousehold, "will");

      expect(result.county).toBeUndefined();
      expect(result.maritalStatus).toBeUndefined();
    });

    it("should handle familyMember without county or maritalStatus", () => {
      const familyMember: FamilyMemberRecord = {
        firstName: "John",
        lastName: "Smith",
      };
      const savedResponses: SavedResponses = {};

      const result = initializeWizardResponses(savedResponses, familyMember, mockHousehold, "will");

      expect(result.county).toBeUndefined();
      expect(result.maritalStatus).toBeUndefined();
    });
  });

  describe("Trust name auto-fill", () => {
    it("should auto-fill trustName for trust documents", () => {
      const savedResponses: SavedResponses = {};

      const result = initializeWizardResponses(savedResponses, null, mockHousehold, "trust");

      expect(result.trustName).toBe("Smith Family Revocable Living Trust");
    });

    it("should NOT auto-fill trustName for non-trust documents", () => {
      const savedResponses: SavedResponses = {};

      const result = initializeWizardResponses(savedResponses, null, mockHousehold, "will");

      expect(result.trustName).toBeUndefined();
    });

    it("should NOT override saved trustName", () => {
      const savedResponses: SavedResponses = { trustName: "Custom Trust Name" };

      const result = initializeWizardResponses(savedResponses, null, mockHousehold, "trust");

      expect(result.trustName).toBe("Custom Trust Name");
    });
  });

  describe("Race condition prevention", () => {
    it("should NOT initialize when familyMember query is still loading (undefined)", () => {
      const result = shouldInitialize(mockDocument, mockHousehold, undefined, false);

      expect(result).toBe(false);
    });

    it("should initialize when familyMember query returns null (not found)", () => {
      const result = shouldInitialize(mockDocument, mockHousehold, null, false);

      expect(result).toBe(true);
    });

    it("should initialize when familyMember query returns a record", () => {
      const familyMember: FamilyMemberRecord = {
        firstName: "John",
        lastName: "Smith",
        county: "Los Angeles",
      };

      const result = shouldInitialize(mockDocument, mockHousehold, familyMember, false);

      expect(result).toBe(true);
    });

    it("should NOT initialize when already initialized", () => {
      const familyMember: FamilyMemberRecord = {
        firstName: "John",
        lastName: "Smith",
      };

      const result = shouldInitialize(mockDocument, mockHousehold, familyMember, true);

      expect(result).toBe(false);
    });

    it("should NOT initialize when document is not loaded", () => {
      const familyMember: FamilyMemberRecord = {
        firstName: "John",
        lastName: "Smith",
      };

      const result = shouldInitialize(undefined, mockHousehold, familyMember, false);

      expect(result).toBe(false);
    });

    it("should NOT initialize when household is not loaded", () => {
      const familyMember: FamilyMemberRecord = {
        firstName: "John",
        lastName: "Smith",
      };

      const result = shouldInitialize(mockDocument, undefined, familyMember, false);

      expect(result).toBe(false);
    });
  });
});

describe("Marital Status Values", () => {
  const validStatuses = [
    "single",
    "married",
    "divorced",
    "widowed",
    "domestic_partnership",
    "separated",
  ];

  it("should accept all valid marital status values", () => {
    for (const status of validStatuses) {
      const familyMember: FamilyMemberRecord = {
        firstName: "John",
        lastName: "Smith",
        maritalStatus: status,
      };
      const savedResponses: SavedResponses = {};
      const mockHousehold: HouseholdRecord = { name: "Test" };

      const result = initializeWizardResponses(savedResponses, familyMember, mockHousehold, "will");

      expect(result.maritalStatus).toBe(status);
    }
  });
});

describe("Integration Scenario: Will Document Creation", () => {
  it("should correctly initialize a new will with all auto-fill fields", () => {
    const familyMember: FamilyMemberRecord = {
      firstName: "Jane",
      lastName: "Doe",
      county: "Alameda",
      maritalStatus: "married",
    };
    const household: HouseholdRecord = { name: "Doe Family" };
    const savedResponses: SavedResponses = {};

    const result = initializeWizardResponses(savedResponses, familyMember, household, "will");

    expect(result.county).toBe("Alameda");
    expect(result.maritalStatus).toBe("married");
    // trustName should NOT be set for will documents
    expect(result.trustName).toBeUndefined();
  });

  it("should correctly initialize a new trust with all auto-fill fields", () => {
    const familyMember: FamilyMemberRecord = {
      firstName: "Jane",
      lastName: "Doe",
      county: "Alameda",
      maritalStatus: "married",
    };
    const household: HouseholdRecord = { name: "Doe Family" };
    const savedResponses: SavedResponses = {};

    const result = initializeWizardResponses(savedResponses, familyMember, household, "trust");

    expect(result.county).toBe("Alameda");
    expect(result.maritalStatus).toBe("married");
    expect(result.trustName).toBe("Doe Family Revocable Living Trust");
  });

  it("should preserve existing responses when resuming a document", () => {
    const familyMember: FamilyMemberRecord = {
      firstName: "Jane",
      lastName: "Doe",
      county: "Alameda",
      maritalStatus: "married",
    };
    const household: HouseholdRecord = { name: "Doe Family" };
    // User has already edited their document
    const savedResponses: SavedResponses = {
      county: "San Francisco", // User changed county
      maritalStatus: "married",
      testatorName: "Jane Elizabeth Doe",
    };

    const result = initializeWizardResponses(savedResponses, familyMember, household, "will");

    // Should preserve user's edits
    expect(result.county).toBe("San Francisco");
    expect(result.maritalStatus).toBe("married");
    expect(result.testatorName).toBe("Jane Elizabeth Doe");
  });
});
