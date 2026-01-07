/**
 * Person Utilities
 *
 * Helper functions for person data manipulation:
 * - Age calculations
 * - Address formatting
 * - Relationship labels
 * - Minor detection
 */

// ============================================================================
// TYPES
// ============================================================================

export interface PersonReference {
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

export interface AddressParts {
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
}

// ============================================================================
// AGE CALCULATIONS
// ============================================================================

/**
 * Calculate age from date of birth (timestamp)
 */
export function calculateAge(dateOfBirth: number): number {
  const today = new Date();
  const birth = new Date(dateOfBirth);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

/**
 * Check if person is a minor (under 18)
 */
export function isMinor(dateOfBirth: number | undefined): boolean {
  if (!dateOfBirth) return false;
  return calculateAge(dateOfBirth) < 18;
}

/**
 * Check if person is an adult (18 or older)
 */
export function isAdult(dateOfBirth: number | undefined): boolean {
  if (!dateOfBirth) return true; // Assume adult if no DOB
  return calculateAge(dateOfBirth) >= 18;
}

/**
 * Get age description (e.g., "32 years old" or "Minor (15)")
 */
export function getAgeDescription(dateOfBirth: number | undefined): string | null {
  if (!dateOfBirth) return null;
  const age = calculateAge(dateOfBirth);
  if (age < 18) {
    return `Minor (${age})`;
  }
  return `${age} years old`;
}

// ============================================================================
// ADDRESS FORMATTING
// ============================================================================

/**
 * Format full address from parts
 * Returns a single line like: "123 Main St, Springfield, CA 90210"
 */
export function formatFullAddress(parts: AddressParts): string {
  const { address, city, state, zipCode } = parts;

  // Build city/state/zip portion
  const locationParts: string[] = [];
  if (city) locationParts.push(city);
  if (state) locationParts.push(state);

  let location = locationParts.join(", ");
  if (zipCode) {
    location = location ? `${location} ${zipCode}` : zipCode;
  }

  // Combine street address with location
  if (address && location) {
    return `${address}, ${location}`;
  }
  return address || location || "";
}

/**
 * Format address for multi-line display
 * Returns array of lines for rendering
 */
export function formatAddressLines(parts: AddressParts): string[] {
  const { address, city, state, zipCode } = parts;
  const lines: string[] = [];

  if (address) {
    lines.push(address);
  }

  // Build city/state/zip line
  const locationParts: string[] = [];
  if (city) locationParts.push(city);
  if (state) locationParts.push(state);

  let location = locationParts.join(", ");
  if (zipCode) {
    location = location ? `${location} ${zipCode}` : zipCode;
  }

  if (location) {
    lines.push(location);
  }

  return lines;
}

/**
 * Format address for legal documents (includes county if provided)
 */
export function formatLegalAddress(parts: AddressParts & { county?: string }): string {
  const { address, city, county, state, zipCode } = parts;

  const locationParts: string[] = [];
  if (city) locationParts.push(city);
  if (county) locationParts.push(`${county} County`);
  if (state) locationParts.push(state);

  let location = locationParts.join(", ");
  if (zipCode) {
    location = location ? `${location} ${zipCode}` : zipCode;
  }

  if (address && location) {
    return `${address}, ${location}`;
  }
  return address || location || "";
}

// ============================================================================
// RELATIONSHIP LABELS
// ============================================================================

const RELATIONSHIP_LABELS: Record<string, string> = {
  parent: "Parent",
  child: "Child",
  spouse: "Spouse",
  partner: "Partner",
  sibling: "Sibling",
  grandparent: "Grandparent",
  grandchild: "Grandchild",
  aunt_uncle: "Aunt/Uncle",
  niece_nephew: "Niece/Nephew",
  cousin: "Cousin",
  in_law: "In-Law",
  other: "Other",
};

const KEY_CONTACT_ROLE_LABELS: Record<string, string> = {
  attorney: "Attorney",
  financial_advisor: "Financial Advisor",
  executor: "Executor",
  trustee: "Trustee",
  guardian: "Guardian",
  healthcare_proxy: "Healthcare Proxy",
  friend: "Friend",
  neighbor: "Neighbor",
  business_partner: "Business Partner",
  caregiver: "Caregiver",
  charitable_org: "Charitable Organization",
  religious_org: "Religious Organization",
  other: "Contact",
};

/**
 * Get human-readable relationship label
 */
export function getRelationshipLabel(type: string): string {
  return RELATIONSHIP_LABELS[type] || type;
}

/**
 * Get human-readable key contact role label
 */
export function getKeyContactRoleLabel(role: string): string {
  return KEY_CONTACT_ROLE_LABELS[role] || role;
}

/**
 * Get all relationship types
 */
export function getRelationshipTypes(): Array<{ value: string; label: string }> {
  return Object.entries(RELATIONSHIP_LABELS).map(([value, label]) => ({
    value,
    label,
  }));
}

/**
 * Get all key contact roles
 */
export function getKeyContactRoles(): Array<{ value: string; label: string }> {
  return Object.entries(KEY_CONTACT_ROLE_LABELS).map(([value, label]) => ({
    value,
    label,
  }));
}

// ============================================================================
// PERSON REFERENCE HELPERS
// ============================================================================

/**
 * Create a manual person reference from form data
 */
export function createManualPersonReference(data: {
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
}): PersonReference {
  return {
    sourceType: "manual",
    ...data,
  };
}

/**
 * Create a family member person reference
 */
export function createFamilyMemberReference(
  familyMemberId: string,
  data: Omit<PersonReference, "sourceType" | "familyMemberId">,
): PersonReference {
  return {
    sourceType: "familyMember",
    familyMemberId,
    ...data,
  };
}

/**
 * Create a key contact person reference
 */
export function createKeyContactReference(
  keyContactId: string,
  data: Omit<PersonReference, "sourceType" | "keyContactId">,
): PersonReference {
  return {
    sourceType: "keyContact",
    keyContactId,
    ...data,
  };
}

/**
 * Check if a person reference is complete (has required fields)
 */
export function isPersonReferenceComplete(ref: PersonReference | null | undefined): boolean {
  if (!ref) return false;
  return Boolean(ref.fullName?.trim());
}

/**
 * Check if person reference has address
 */
export function hasAddress(ref: PersonReference | null | undefined): boolean {
  if (!ref) return false;
  return Boolean(ref.address || ref.city || ref.state);
}

/**
 * Get display name for person reference
 */
export function getPersonDisplayName(ref: PersonReference | null | undefined): string {
  if (!ref) return "";
  return ref.fullName || [ref.firstName, ref.lastName].filter(Boolean).join(" ") || "";
}

/**
 * Get short display with relationship
 */
export function getPersonDisplayWithRelationship(ref: PersonReference | null | undefined): string {
  if (!ref) return "";
  const name = getPersonDisplayName(ref);
  if (ref.relationship) {
    return `${name} (${ref.relationship})`;
  }
  return name;
}

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

/**
 * Validate that a person can serve as executor (must be adult)
 */
export function canServeAsExecutor(ref: PersonReference | null | undefined): {
  valid: boolean;
  reason?: string;
} {
  if (!ref) {
    return { valid: false, reason: "No person selected" };
  }
  if (ref.dateOfBirth && isMinor(ref.dateOfBirth)) {
    return { valid: false, reason: "Executor must be 18 years or older" };
  }
  return { valid: true };
}

/**
 * Validate that a person can serve as guardian (must be adult)
 */
export function canServeAsGuardian(ref: PersonReference | null | undefined): {
  valid: boolean;
  reason?: string;
} {
  if (!ref) {
    return { valid: false, reason: "No person selected" };
  }
  if (ref.dateOfBirth && isMinor(ref.dateOfBirth)) {
    return { valid: false, reason: "Guardian must be 18 years or older" };
  }
  return { valid: true };
}

/**
 * Validate that a person can serve as agent (POA) (must be adult)
 */
export function canServeAsAgent(ref: PersonReference | null | undefined): {
  valid: boolean;
  reason?: string;
} {
  if (!ref) {
    return { valid: false, reason: "No person selected" };
  }
  if (ref.dateOfBirth && isMinor(ref.dateOfBirth)) {
    return { valid: false, reason: "Agent must be 18 years or older" };
  }
  return { valid: true };
}

/**
 * Validate that a person can serve as trustee (must be adult)
 */
export function canServeAsTrustee(ref: PersonReference | null | undefined): {
  valid: boolean;
  reason?: string;
} {
  if (!ref) {
    return { valid: false, reason: "No person selected" };
  }
  if (ref.dateOfBirth && isMinor(ref.dateOfBirth)) {
    return { valid: false, reason: "Trustee must be 18 years or older" };
  }
  return { valid: true };
}

// ============================================================================
// PDF FLATTENING UTILITIES
// ============================================================================

/**
 * Beneficiary entry for legal documents
 */
export interface BeneficiaryEntry {
  id: string;
  person: PersonReference | null;
  percentage: number;
}

/**
 * Convert responses with PersonReference objects to flat strings for PDF generation.
 * This provides backward compatibility with PDF generators that expect string fields.
 *
 * Field mappings translate wizard field IDs to PDF field names:
 * - testator -> fullName, address
 * - executor -> executorName, executorRelationship, executorAddress
 * - etc.
 */
export function flattenResponsesForPDF(
  responses: Record<string, string | boolean | PersonReference | BeneficiaryEntry[] | null>,
): Record<string, string | boolean> {
  const flattened: Record<string, string | boolean> = {};

  // Field mappings: wizard field ID -> PDF field name
  // The wizard uses PersonReference objects, but PDF expects specific field names
  const personFieldMappings: Record<
    string,
    { name: string; relationship?: string; address?: string }
  > = {
    // Testator/Principal fields
    testator: { name: "fullName", address: "address" },
    principal: { name: "fullName", address: "address" },
    grantor: { name: "fullName", address: "address" },
    // Spouse
    spouse: { name: "spouseName" },
    // Executor fields
    executor: {
      name: "executorName",
      relationship: "executorRelationship",
      address: "executorAddress",
    },
    alternateExecutor: {
      name: "alternateExecutorName",
      relationship: "alternateExecutorRelationship",
    },
    // Agent fields (POA)
    agent: { name: "agentName", relationship: "agentRelationship", address: "agentAddress" },
    alternateAgent: { name: "alternateAgentName", relationship: "alternateAgentRelationship" },
    secondAlternateAgent: { name: "secondAlternateAgentName" },
    // Healthcare fields
    healthcareAgent: { name: "healthcareAgentName", relationship: "healthcareAgentRelationship" },
    alternateHealthcareAgent: { name: "alternateHealthcareAgentName" },
    // Guardian fields
    guardian: {
      name: "guardianName",
      relationship: "guardianRelationship",
      address: "guardianAddress",
    },
    alternateGuardian: { name: "alternateGuardianName" },
    // Beneficiary fields
    residuaryBeneficiary: { name: "residuaryBeneficiary", relationship: "residuaryRelationship" },
    contingentBeneficiary: { name: "contingentBeneficiary" },
    secondContingentBeneficiary: { name: "secondContingentBeneficiary" },
    // Trust fields
    trustee: { name: "trusteeName", relationship: "trusteeRelationship" },
    successorTrustee: { name: "successorTrusteeName" },
  };

  for (const [key, value] of Object.entries(responses)) {
    if (value === null || value === undefined) {
      // Skip null/undefined values
      continue;
    }

    if (typeof value === "string" || typeof value === "boolean") {
      flattened[key] = value;
    } else if (Array.isArray(value)) {
      // BeneficiaryEntry[] - convert to text format for PDF
      const beneficiaries = value as BeneficiaryEntry[];
      const lines = beneficiaries
        .filter((b) => b.person?.fullName)
        .map((b) => {
          const name = b.person?.fullName || "";
          const relationship = b.person?.relationship || "";
          const percentage = b.percentage ? `${b.percentage}%` : "";
          return [name, relationship, percentage].filter(Boolean).join(" - ");
        });
      flattened[key] = lines.join("\n");
    } else if (typeof value === "object" && "fullName" in value) {
      // PersonReference - extract relevant fields and map to PDF field names
      const person = value as PersonReference;
      const mapping = personFieldMappings[key];

      if (mapping) {
        // Use the mapped field names
        if (person.fullName) flattened[mapping.name] = person.fullName;
        if (mapping.relationship && person.relationship) {
          flattened[mapping.relationship] = person.relationship;
        }
        if (mapping.address && person.address) {
          flattened[mapping.address] = person.address;
        }
      } else {
        // Fallback: use the key directly
        flattened[key] = person.fullName || "";
      }

      // Also preserve the original key for compatibility
      flattened[key] = person.fullName || "";

      // Add address fields with Name suffix for PDF (e.g., executorAddress)
      if (person.address) flattened[`${key}Address`] = person.address;
      if (person.phone) flattened[`${key}Phone`] = person.phone;
      if (person.email) flattened[`${key}Email`] = person.email;
      if (person.relationship) flattened[`${key}Relationship`] = person.relationship;
      if (person.city) flattened[`${key}City`] = person.city;
      if (person.state) flattened[`${key}State`] = person.state;
      if (person.zipCode) flattened[`${key}ZipCode`] = person.zipCode;
    }
  }

  return flattened;
}
