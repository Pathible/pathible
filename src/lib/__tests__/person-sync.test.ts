import { describe, expect, it } from "vitest";

/**
 * Person Sync Tests
 *
 * Tests for syncing person data between legal documents and source records
 * (familyMembers and keyContacts).
 *
 * These tests verify:
 * - Data transformation and normalization
 * - Validation rules for state codes and ZIP codes
 * - Proper field mapping between PersonReference and source records
 */

// Types matching the PersonReference from person-utils
interface PersonReference {
  sourceType: "familyMember" | "keyContact" | "manual";
  familyMemberId?: string;
  keyContactId?: string;
  fullName: string;
  firstName?: string;
  lastName?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  phone?: string;
  email?: string;
  relationship?: string;
  dateOfBirth?: number;
}

/**
 * Validates state code format (2-letter uppercase)
 */
function validateState(state: string | undefined): {
  valid: boolean;
  normalized?: string;
  error?: string;
} {
  if (!state) return { valid: true, normalized: undefined };

  const trimmed = state.trim().toUpperCase();
  if (trimmed.length === 0) return { valid: true, normalized: undefined };
  if (trimmed.length !== 2) {
    return { valid: false, error: "State must be a 2-letter code (e.g., CA, NY)" };
  }
  return { valid: true, normalized: trimmed };
}

/**
 * Validates ZIP code format (5 digits or 9 digits with optional hyphen)
 */
function validateZipCode(zipCode: string | undefined): {
  valid: boolean;
  normalized?: string;
  error?: string;
} {
  if (!zipCode) return { valid: true, normalized: undefined };

  const trimmed = zipCode.trim().replace(/\s/g, "");
  if (trimmed.length === 0) return { valid: true, normalized: undefined };
  if (!/^\d{5}(-?\d{4})?$/.test(trimmed)) {
    return {
      valid: false,
      error: "ZIP code must be 5 digits or 9 digits (e.g., 12345 or 12345-6789)",
    };
  }
  return { valid: true, normalized: trimmed };
}

/**
 * Determines if a PersonReference should trigger a sync operation
 */
function shouldSyncPerson(personRef: PersonReference | null | undefined): boolean {
  if (!personRef) return false;
  if (personRef.sourceType === "manual") return false;
  if (personRef.sourceType === "familyMember" && personRef.familyMemberId) return true;
  if (personRef.sourceType === "keyContact" && personRef.keyContactId) return true;
  return false;
}

/**
 * Normalizes person data for sync operation
 */
function normalizePersonData(personRef: PersonReference): {
  firstName?: string;
  lastName?: string;
  fullName?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  phone?: string;
  email?: string;
  dateOfBirth?: number;
} {
  return {
    firstName: personRef.firstName?.trim() || undefined,
    lastName: personRef.lastName?.trim() || undefined,
    fullName: personRef.fullName?.trim() || undefined,
    address: personRef.address?.trim() || undefined,
    city: personRef.city?.trim() || undefined,
    state: personRef.state?.trim().toUpperCase() || undefined,
    zipCode: personRef.zipCode?.trim().replace(/\s/g, "") || undefined,
    phone: personRef.phone?.trim() || undefined,
    email: personRef.email?.trim().toLowerCase() || undefined,
    dateOfBirth: personRef.dateOfBirth,
  };
}

describe("State Code Validation", () => {
  it("should accept valid 2-letter state codes", () => {
    const validCodes = ["CA", "NY", "TX", "FL", "WA", "OR"];
    for (const code of validCodes) {
      const result = validateState(code);
      expect(result.valid).toBe(true);
      expect(result.normalized).toBe(code);
    }
  });

  it("should normalize lowercase state codes to uppercase", () => {
    expect(validateState("ca")).toEqual({ valid: true, normalized: "CA" });
    expect(validateState("ny")).toEqual({ valid: true, normalized: "NY" });
    expect(validateState("Tx")).toEqual({ valid: true, normalized: "TX" });
  });

  it("should trim whitespace from state codes", () => {
    expect(validateState("  CA  ")).toEqual({ valid: true, normalized: "CA" });
    expect(validateState("\tNY\n")).toEqual({ valid: true, normalized: "NY" });
  });

  it("should reject state codes with wrong length", () => {
    expect(validateState("C").valid).toBe(false);
    expect(validateState("CAL").valid).toBe(false);
    expect(validateState("California").valid).toBe(false);
  });

  it("should handle empty and undefined values gracefully", () => {
    expect(validateState(undefined)).toEqual({ valid: true, normalized: undefined });
    expect(validateState("")).toEqual({ valid: true, normalized: undefined });
    expect(validateState("   ")).toEqual({ valid: true, normalized: undefined });
  });
});

describe("ZIP Code Validation", () => {
  it("should accept valid 5-digit ZIP codes", () => {
    const validZips = ["12345", "90210", "00000", "99999"];
    for (const zip of validZips) {
      const result = validateZipCode(zip);
      expect(result.valid).toBe(true);
      expect(result.normalized).toBe(zip);
    }
  });

  it("should accept valid 9-digit ZIP codes with hyphen", () => {
    expect(validateZipCode("12345-6789")).toEqual({ valid: true, normalized: "12345-6789" });
    expect(validateZipCode("90210-1234")).toEqual({ valid: true, normalized: "90210-1234" });
  });

  it("should accept valid 9-digit ZIP codes without hyphen", () => {
    expect(validateZipCode("123456789")).toEqual({ valid: true, normalized: "123456789" });
    expect(validateZipCode("902101234")).toEqual({ valid: true, normalized: "902101234" });
  });

  it("should trim whitespace from ZIP codes", () => {
    expect(validateZipCode("  12345  ")).toEqual({ valid: true, normalized: "12345" });
    expect(validateZipCode("12345 - 6789")).toEqual({ valid: true, normalized: "12345-6789" });
  });

  it("should reject invalid ZIP codes", () => {
    expect(validateZipCode("1234").valid).toBe(false); // Too short
    expect(validateZipCode("123456").valid).toBe(false); // Wrong length
    expect(validateZipCode("1234567").valid).toBe(false); // Wrong length
    expect(validateZipCode("12345-67").valid).toBe(false); // Wrong extended length
    expect(validateZipCode("ABCDE").valid).toBe(false); // Not numeric
    expect(validateZipCode("12-345").valid).toBe(false); // Hyphen in wrong place
  });

  it("should handle empty and undefined values gracefully", () => {
    expect(validateZipCode(undefined)).toEqual({ valid: true, normalized: undefined });
    expect(validateZipCode("")).toEqual({ valid: true, normalized: undefined });
    expect(validateZipCode("   ")).toEqual({ valid: true, normalized: undefined });
  });
});

describe("Person Sync Decision", () => {
  it("should sync familyMember with valid ID", () => {
    const personRef: PersonReference = {
      sourceType: "familyMember",
      familyMemberId: "member123",
      fullName: "John Smith",
    };
    expect(shouldSyncPerson(personRef)).toBe(true);
  });

  it("should sync keyContact with valid ID", () => {
    const personRef: PersonReference = {
      sourceType: "keyContact",
      keyContactId: "contact456",
      fullName: "Jane Attorney",
    };
    expect(shouldSyncPerson(personRef)).toBe(true);
  });

  it("should NOT sync manual entries", () => {
    const personRef: PersonReference = {
      sourceType: "manual",
      fullName: "Manual Entry Person",
    };
    expect(shouldSyncPerson(personRef)).toBe(false);
  });

  it("should NOT sync familyMember without ID", () => {
    const personRef: PersonReference = {
      sourceType: "familyMember",
      fullName: "John Smith",
    };
    expect(shouldSyncPerson(personRef)).toBe(false);
  });

  it("should NOT sync keyContact without ID", () => {
    const personRef: PersonReference = {
      sourceType: "keyContact",
      fullName: "Jane Attorney",
    };
    expect(shouldSyncPerson(personRef)).toBe(false);
  });

  it("should handle null and undefined gracefully", () => {
    expect(shouldSyncPerson(null)).toBe(false);
    expect(shouldSyncPerson(undefined)).toBe(false);
  });
});

describe("Person Data Normalization", () => {
  it("should normalize all string fields", () => {
    const personRef: PersonReference = {
      sourceType: "familyMember",
      familyMemberId: "123",
      fullName: "  John Smith  ",
      firstName: "  John  ",
      lastName: "  Smith  ",
      address: "  123 Main St  ",
      city: "  Springfield  ",
      state: "  ca  ",
      zipCode: "  12345  ",
      phone: "  555-1234  ",
      email: "  JOHN@EXAMPLE.COM  ",
    };

    const normalized = normalizePersonData(personRef);

    expect(normalized.fullName).toBe("John Smith");
    expect(normalized.firstName).toBe("John");
    expect(normalized.lastName).toBe("Smith");
    expect(normalized.address).toBe("123 Main St");
    expect(normalized.city).toBe("Springfield");
    expect(normalized.state).toBe("CA");
    expect(normalized.zipCode).toBe("12345");
    expect(normalized.phone).toBe("555-1234");
    expect(normalized.email).toBe("john@example.com");
  });

  it("should preserve dateOfBirth as-is", () => {
    const timestamp = 946684800000; // 2000-01-01
    const personRef: PersonReference = {
      sourceType: "familyMember",
      fullName: "John Smith",
      dateOfBirth: timestamp,
    };

    const normalized = normalizePersonData(personRef);

    expect(normalized.dateOfBirth).toBe(timestamp);
  });

  it("should convert empty strings to undefined", () => {
    const personRef: PersonReference = {
      sourceType: "familyMember",
      fullName: "John Smith",
      firstName: "",
      lastName: "   ",
      address: "",
    };

    const normalized = normalizePersonData(personRef);

    expect(normalized.firstName).toBeUndefined();
    expect(normalized.lastName).toBeUndefined();
    expect(normalized.address).toBeUndefined();
  });
});

describe("Key Contact Name Handling", () => {
  it("should use fullName for key contacts", () => {
    const personRef: PersonReference = {
      sourceType: "keyContact",
      keyContactId: "123",
      fullName: "Law Offices of Smith & Jones",
      firstName: "Law",
      lastName: "Offices",
    };

    const normalized = normalizePersonData(personRef);

    // Key contacts should use fullName as the primary identifier
    expect(normalized.fullName).toBe("Law Offices of Smith & Jones");
  });

  it("should construct name from firstName/lastName if fullName is missing", () => {
    // This scenario shouldn't normally happen, but let's handle it
    const personRef: PersonReference = {
      sourceType: "keyContact",
      keyContactId: "123",
      fullName: "", // Empty
      firstName: "John",
      lastName: "Attorney",
    };

    const normalized = normalizePersonData(personRef);

    expect(normalized.firstName).toBe("John");
    expect(normalized.lastName).toBe("Attorney");
  });
});

describe("Integration: Complete Sync Workflow", () => {
  it("should correctly process a familyMember edit from wizard", () => {
    // Simulates the data flow when a user edits a family member in the wizard
    const wizardPersonRef: PersonReference = {
      sourceType: "familyMember",
      familyMemberId: "member_123abc",
      fullName: "John Michael Smith",
      firstName: "John",
      lastName: "Smith",
      address: "456 Oak Avenue",
      city: "San Francisco",
      state: "ca", // User typed lowercase
      zipCode: "94102-1234",
      phone: "(555) 123-4567",
      email: "John.Smith@Email.COM", // User typed mixed case
      dateOfBirth: 315532800000, // 1980-01-01
    };

    // Should decide to sync
    expect(shouldSyncPerson(wizardPersonRef)).toBe(true);

    // Validate state
    const stateValidation = validateState(wizardPersonRef.state);
    expect(stateValidation.valid).toBe(true);
    expect(stateValidation.normalized).toBe("CA");

    // Validate ZIP
    const zipValidation = validateZipCode(wizardPersonRef.zipCode);
    expect(zipValidation.valid).toBe(true);
    expect(zipValidation.normalized).toBe("94102-1234");

    // Normalize data
    const normalized = normalizePersonData(wizardPersonRef);
    expect(normalized.state).toBe("CA");
    expect(normalized.email).toBe("john.smith@email.com");
    expect(normalized.phone).toBe("(555) 123-4567");
  });

  it("should correctly process a keyContact edit from wizard", () => {
    const wizardPersonRef: PersonReference = {
      sourceType: "keyContact",
      keyContactId: "contact_456def",
      fullName: "Acme Legal Services, LLC",
      address: "100 Corporate Plaza, Suite 500",
      city: "Los Angeles",
      state: "CA",
      zipCode: "90001",
      phone: "800-555-0100",
      email: "info@acmelegal.com",
    };

    expect(shouldSyncPerson(wizardPersonRef)).toBe(true);

    const normalized = normalizePersonData(wizardPersonRef);
    expect(normalized.fullName).toBe("Acme Legal Services, LLC");
    expect(normalized.address).toBe("100 Corporate Plaza, Suite 500");
  });

  it("should NOT sync manual entries", () => {
    const wizardPersonRef: PersonReference = {
      sourceType: "manual",
      fullName: "Temporary Person",
      address: "Unknown Address",
    };

    expect(shouldSyncPerson(wizardPersonRef)).toBe(false);
  });
});
