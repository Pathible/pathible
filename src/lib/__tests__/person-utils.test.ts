import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import {
  // Age calculations
  calculateAge,
  isMinor,
  isAdult,
  getAgeDescription,
  // Address formatting
  formatFullAddress,
  formatAddressLines,
  formatLegalAddress,
  // Relationship labels
  getRelationshipLabel,
  getKeyContactRoleLabel,
  getRelationshipTypes,
  getKeyContactRoles,
  // Person reference helpers
  createManualPersonReference,
  createFamilyMemberReference,
  createKeyContactReference,
  isPersonReferenceComplete,
  hasAddress,
  getPersonDisplayName,
  getPersonDisplayWithRelationship,
  // Validation helpers
  canServeAsExecutor,
  canServeAsGuardian,
  canServeAsAgent,
  canServeAsTrustee,
  // PDF flattening
  flattenResponsesForPDF,
  type PersonReference,
} from "../person-utils";

/**
 * Person Utilities Tests
 *
 * These tests verify the utility functions used for person data manipulation
 * in legal documents. Critical for:
 * - Age-based role validation (executor, guardian must be adults)
 * - Address formatting for legal documents
 * - PDF generation data flattening
 */

describe("Age Calculations", () => {
  beforeEach(() => {
    // Mock the current date to January 15, 2024
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2024, 0, 15));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("calculateAge", () => {
    it("should calculate age correctly for adult", () => {
      // Born January 15, 1990 = 34 years old
      const dob = new Date(1990, 0, 15).getTime();
      expect(calculateAge(dob)).toBe(34);
    });

    it("should calculate age correctly before birthday this year", () => {
      // Born March 15, 1990 - hasn't had birthday yet
      const dob = new Date(1990, 2, 15).getTime();
      expect(calculateAge(dob)).toBe(33);
    });

    it("should calculate age correctly for minor", () => {
      // Born January 15, 2010 = 14 years old
      const dob = new Date(2010, 0, 15).getTime();
      expect(calculateAge(dob)).toBe(14);
    });

    it("should handle birthdays on exact current date", () => {
      // Born January 15, 2000 - birthday today
      const dob = new Date(2000, 0, 15).getTime();
      expect(calculateAge(dob)).toBe(24);
    });

    it("should handle day before birthday", () => {
      // Born January 16, 2000 - birthday tomorrow
      const dob = new Date(2000, 0, 16).getTime();
      expect(calculateAge(dob)).toBe(23);
    });
  });

  describe("isMinor", () => {
    it("should return true for person under 18", () => {
      const dob = new Date(2010, 0, 15).getTime(); // 14 years old
      expect(isMinor(dob)).toBe(true);
    });

    it("should return false for person exactly 18", () => {
      const dob = new Date(2006, 0, 15).getTime(); // exactly 18
      expect(isMinor(dob)).toBe(false);
    });

    it("should return false for adult", () => {
      const dob = new Date(1990, 0, 15).getTime();
      expect(isMinor(dob)).toBe(false);
    });

    it("should return false for undefined DOB", () => {
      expect(isMinor(undefined)).toBe(false);
    });
  });

  describe("isAdult", () => {
    it("should return false for minor", () => {
      const dob = new Date(2010, 0, 15).getTime();
      expect(isAdult(dob)).toBe(false);
    });

    it("should return true for person exactly 18", () => {
      const dob = new Date(2006, 0, 15).getTime();
      expect(isAdult(dob)).toBe(true);
    });

    it("should return true for undefined DOB (assumed adult)", () => {
      expect(isAdult(undefined)).toBe(true);
    });
  });

  describe("getAgeDescription", () => {
    it("should return age for adults", () => {
      const dob = new Date(1990, 0, 15).getTime();
      expect(getAgeDescription(dob)).toBe("34 years old");
    });

    it("should return Minor label for minors", () => {
      const dob = new Date(2010, 0, 15).getTime();
      expect(getAgeDescription(dob)).toBe("Minor (14)");
    });

    it("should return null for undefined DOB", () => {
      expect(getAgeDescription(undefined)).toBeNull();
    });
  });
});

describe("Address Formatting", () => {
  describe("formatFullAddress", () => {
    it("should format complete address", () => {
      const result = formatFullAddress({
        address: "123 Main St",
        city: "Springfield",
        state: "CA",
        zipCode: "90210",
      });
      expect(result).toBe("123 Main St, Springfield, CA 90210");
    });

    it("should handle missing street address", () => {
      const result = formatFullAddress({
        city: "Springfield",
        state: "CA",
        zipCode: "90210",
      });
      expect(result).toBe("Springfield, CA 90210");
    });

    it("should handle missing city", () => {
      const result = formatFullAddress({
        address: "123 Main St",
        state: "CA",
        zipCode: "90210",
      });
      expect(result).toBe("123 Main St, CA 90210");
    });

    it("should handle only street address", () => {
      const result = formatFullAddress({
        address: "123 Main St",
      });
      expect(result).toBe("123 Main St");
    });

    it("should handle empty object", () => {
      const result = formatFullAddress({});
      expect(result).toBe("");
    });
  });

  describe("formatAddressLines", () => {
    it("should return array of address lines", () => {
      const result = formatAddressLines({
        address: "123 Main St",
        city: "Springfield",
        state: "CA",
        zipCode: "90210",
      });
      expect(result).toEqual(["123 Main St", "Springfield, CA 90210"]);
    });

    it("should handle missing street address", () => {
      const result = formatAddressLines({
        city: "Springfield",
        state: "CA",
      });
      expect(result).toEqual(["Springfield, CA"]);
    });

    it("should handle empty object", () => {
      const result = formatAddressLines({});
      expect(result).toEqual([]);
    });
  });

  describe("formatLegalAddress", () => {
    it("should include county in address", () => {
      const result = formatLegalAddress({
        address: "123 Main St",
        city: "Springfield",
        county: "Los Angeles",
        state: "CA",
        zipCode: "90210",
      });
      expect(result).toBe("123 Main St, Springfield, Los Angeles County, CA 90210");
    });

    it("should work without county", () => {
      const result = formatLegalAddress({
        address: "123 Main St",
        city: "Springfield",
        state: "CA",
      });
      expect(result).toBe("123 Main St, Springfield, CA");
    });
  });
});

describe("Relationship Labels", () => {
  describe("getRelationshipLabel", () => {
    it("should return label for known relationships", () => {
      expect(getRelationshipLabel("spouse")).toBe("Spouse");
      expect(getRelationshipLabel("parent")).toBe("Parent");
      expect(getRelationshipLabel("child")).toBe("Child");
      expect(getRelationshipLabel("sibling")).toBe("Sibling");
    });

    it("should return input for unknown relationships", () => {
      expect(getRelationshipLabel("custom_relation")).toBe("custom_relation");
    });
  });

  describe("getKeyContactRoleLabel", () => {
    it("should return label for known roles", () => {
      expect(getKeyContactRoleLabel("attorney")).toBe("Attorney");
      expect(getKeyContactRoleLabel("executor")).toBe("Executor");
      expect(getKeyContactRoleLabel("trustee")).toBe("Trustee");
    });

    it("should return input for unknown roles", () => {
      expect(getKeyContactRoleLabel("custom_role")).toBe("custom_role");
    });
  });

  describe("getRelationshipTypes", () => {
    it("should return array of relationship options", () => {
      const types = getRelationshipTypes();
      expect(types.length).toBeGreaterThan(5);
      expect(types).toContainEqual({ value: "spouse", label: "Spouse" });
      expect(types).toContainEqual({ value: "parent", label: "Parent" });
    });
  });

  describe("getKeyContactRoles", () => {
    it("should return array of role options", () => {
      const roles = getKeyContactRoles();
      expect(roles.length).toBeGreaterThan(5);
      expect(roles).toContainEqual({ value: "attorney", label: "Attorney" });
    });
  });
});

describe("Person Reference Helpers", () => {
  describe("createManualPersonReference", () => {
    it("should create manual person reference", () => {
      const ref = createManualPersonReference({
        fullName: "John Doe",
        phone: "555-1234",
      });
      expect(ref.sourceType).toBe("manual");
      expect(ref.fullName).toBe("John Doe");
      expect(ref.phone).toBe("555-1234");
    });
  });

  describe("createFamilyMemberReference", () => {
    it("should create family member reference with ID", () => {
      const ref = createFamilyMemberReference("fm123", {
        fullName: "Jane Doe",
        relationship: "spouse",
      });
      expect(ref.sourceType).toBe("familyMember");
      expect(ref.familyMemberId).toBe("fm123");
      expect(ref.fullName).toBe("Jane Doe");
    });
  });

  describe("createKeyContactReference", () => {
    it("should create key contact reference with ID", () => {
      const ref = createKeyContactReference("kc456", {
        fullName: "Bob Smith",
        relationship: "attorney",
      });
      expect(ref.sourceType).toBe("keyContact");
      expect(ref.keyContactId).toBe("kc456");
      expect(ref.fullName).toBe("Bob Smith");
    });
  });

  describe("isPersonReferenceComplete", () => {
    it("should return true for complete reference", () => {
      const ref: PersonReference = {
        sourceType: "manual",
        fullName: "John Doe",
      };
      expect(isPersonReferenceComplete(ref)).toBe(true);
    });

    it("should return false for empty name", () => {
      const ref: PersonReference = {
        sourceType: "manual",
        fullName: "   ",
      };
      expect(isPersonReferenceComplete(ref)).toBe(false);
    });

    it("should return false for null", () => {
      expect(isPersonReferenceComplete(null)).toBe(false);
    });

    it("should return false for undefined", () => {
      expect(isPersonReferenceComplete(undefined)).toBe(false);
    });
  });

  describe("hasAddress", () => {
    it("should return true if has street address", () => {
      const ref: PersonReference = {
        sourceType: "manual",
        fullName: "John Doe",
        address: "123 Main St",
      };
      expect(hasAddress(ref)).toBe(true);
    });

    it("should return true if has city", () => {
      const ref: PersonReference = {
        sourceType: "manual",
        fullName: "John Doe",
        city: "Springfield",
      };
      expect(hasAddress(ref)).toBe(true);
    });

    it("should return false if no address components", () => {
      const ref: PersonReference = {
        sourceType: "manual",
        fullName: "John Doe",
      };
      expect(hasAddress(ref)).toBe(false);
    });
  });

  describe("getPersonDisplayName", () => {
    it("should return fullName if present", () => {
      const ref: PersonReference = {
        sourceType: "manual",
        fullName: "John Doe",
        firstName: "John",
        lastName: "Doe",
      };
      expect(getPersonDisplayName(ref)).toBe("John Doe");
    });

    it("should build from firstName/lastName if no fullName", () => {
      const ref: PersonReference = {
        sourceType: "manual",
        fullName: "",
        firstName: "John",
        lastName: "Doe",
      };
      expect(getPersonDisplayName(ref)).toBe("John Doe");
    });

    it("should return empty string for null", () => {
      expect(getPersonDisplayName(null)).toBe("");
    });
  });

  describe("getPersonDisplayWithRelationship", () => {
    it("should include relationship in parentheses", () => {
      const ref: PersonReference = {
        sourceType: "manual",
        fullName: "John Doe",
        relationship: "Spouse",
      };
      expect(getPersonDisplayWithRelationship(ref)).toBe("John Doe (Spouse)");
    });

    it("should return just name if no relationship", () => {
      const ref: PersonReference = {
        sourceType: "manual",
        fullName: "John Doe",
      };
      expect(getPersonDisplayWithRelationship(ref)).toBe("John Doe");
    });
  });
});

describe("Role Validation Helpers", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2024, 0, 15));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const minorDOB = new Date(2010, 0, 15).getTime(); // 14 years old
  const adultDOB = new Date(1990, 0, 15).getTime(); // 34 years old

  describe("canServeAsExecutor", () => {
    it("should return valid for adult", () => {
      const ref: PersonReference = {
        sourceType: "manual",
        fullName: "John Doe",
        dateOfBirth: adultDOB,
      };
      const result = canServeAsExecutor(ref);
      expect(result.valid).toBe(true);
    });

    it("should return invalid for minor with reason", () => {
      const ref: PersonReference = {
        sourceType: "manual",
        fullName: "Young Person",
        dateOfBirth: minorDOB,
      };
      const result = canServeAsExecutor(ref);
      expect(result.valid).toBe(false);
      expect(result.reason).toContain("18 years or older");
    });

    it("should return invalid for null", () => {
      const result = canServeAsExecutor(null);
      expect(result.valid).toBe(false);
      expect(result.reason).toContain("No person selected");
    });

    it("should return valid for person without DOB (assumed adult)", () => {
      const ref: PersonReference = {
        sourceType: "manual",
        fullName: "Unknown Age Person",
      };
      expect(canServeAsExecutor(ref).valid).toBe(true);
    });
  });

  describe("canServeAsGuardian", () => {
    it("should return valid for adult", () => {
      const ref: PersonReference = {
        sourceType: "manual",
        fullName: "Adult Guardian",
        dateOfBirth: adultDOB,
      };
      expect(canServeAsGuardian(ref).valid).toBe(true);
    });

    it("should return invalid for minor", () => {
      const ref: PersonReference = {
        sourceType: "manual",
        fullName: "Minor Person",
        dateOfBirth: minorDOB,
      };
      const result = canServeAsGuardian(ref);
      expect(result.valid).toBe(false);
      expect(result.reason).toContain("Guardian must be 18");
    });
  });

  describe("canServeAsAgent", () => {
    it("should return valid for adult", () => {
      const ref: PersonReference = {
        sourceType: "manual",
        fullName: "Agent Person",
        dateOfBirth: adultDOB,
      };
      expect(canServeAsAgent(ref).valid).toBe(true);
    });

    it("should return invalid for minor", () => {
      const ref: PersonReference = {
        sourceType: "manual",
        fullName: "Minor Person",
        dateOfBirth: minorDOB,
      };
      const result = canServeAsAgent(ref);
      expect(result.valid).toBe(false);
      expect(result.reason).toContain("Agent must be 18");
    });
  });

  describe("canServeAsTrustee", () => {
    it("should return valid for adult", () => {
      const ref: PersonReference = {
        sourceType: "manual",
        fullName: "Trustee Person",
        dateOfBirth: adultDOB,
      };
      expect(canServeAsTrustee(ref).valid).toBe(true);
    });

    it("should return invalid for minor", () => {
      const ref: PersonReference = {
        sourceType: "manual",
        fullName: "Minor Person",
        dateOfBirth: minorDOB,
      };
      const result = canServeAsTrustee(ref);
      expect(result.valid).toBe(false);
      expect(result.reason).toContain("Trustee must be 18");
    });
  });
});

describe("PDF Flattening Utilities", () => {
  describe("flattenResponsesForPDF", () => {
    it("should pass through string values", () => {
      const result = flattenResponsesForPDF({
        county: "Los Angeles",
        maritalStatus: "married",
      });
      expect(result.county).toBe("Los Angeles");
      expect(result.maritalStatus).toBe("married");
    });

    it("should pass through boolean values", () => {
      const result = flattenResponsesForPDF({
        noContestClause: true,
        bondWaiver: false,
      });
      expect(result.noContestClause).toBe(true);
      expect(result.bondWaiver).toBe(false);
    });

    it("should flatten PersonReference to mapped field names", () => {
      const testator: PersonReference = {
        sourceType: "manual",
        fullName: "John Doe",
        address: "123 Main St",
      };
      const result = flattenResponsesForPDF({ testator });
      expect(result.fullName).toBe("John Doe");
      expect(result.address).toBe("123 Main St");
    });

    it("should flatten executor with relationship", () => {
      const executor: PersonReference = {
        sourceType: "familyMember",
        fullName: "Jane Smith",
        relationship: "Spouse",
        address: "456 Oak Ave",
      };
      const result = flattenResponsesForPDF({ executor });
      expect(result.executorName).toBe("Jane Smith");
      expect(result.executorRelationship).toBe("Spouse");
      expect(result.executorAddress).toBe("456 Oak Ave");
    });

    it("should handle beneficiary lists", () => {
      const additionalBeneficiaries = [
        {
          id: "1",
          person: { sourceType: "manual" as const, fullName: "Alice Jones", relationship: "Child" },
          percentage: 50,
        },
        {
          id: "2",
          person: { sourceType: "manual" as const, fullName: "Bob Jones", relationship: "Child" },
          percentage: 50,
        },
      ];
      const result = flattenResponsesForPDF({ additionalBeneficiaries });
      expect(result.additionalBeneficiaries).toContain("Alice Jones");
      expect(result.additionalBeneficiaries).toContain("Bob Jones");
      expect(result.additionalBeneficiaries).toContain("50%");
    });

    it("should skip null values", () => {
      const result = flattenResponsesForPDF({
        county: "Los Angeles",
        spouse: null,
      });
      expect(result.county).toBe("Los Angeles");
      expect(result.spouse).toBeUndefined();
    });

    it("should add suffixed fields for person details", () => {
      const guardian: PersonReference = {
        sourceType: "manual",
        fullName: "Guardian Person",
        phone: "555-1234",
        email: "guardian@example.com",
        city: "Springfield",
        state: "CA",
      };
      const result = flattenResponsesForPDF({ guardian });
      expect(result.guardianPhone).toBe("555-1234");
      expect(result.guardianEmail).toBe("guardian@example.com");
      expect(result.guardianCity).toBe("Springfield");
      expect(result.guardianState).toBe("CA");
    });
  });
});
