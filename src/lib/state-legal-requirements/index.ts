/**
 * State Legal Requirements - Main Entry Point
 *
 * Comprehensive data for all 50 US states plus DC covering:
 * - Last Will and Testament
 * - Revocable Living Trust
 * - Durable Power of Attorney (Financial)
 * - Healthcare Power of Attorney
 * - Advance Healthcare Directive
 *
 * DISCLAIMER: This is a template for informational purposes only.
 * Consult with a qualified attorney for legal advice specific to your situation.
 * Laws change frequently; verify current requirements before relying on this data.
 *
 * Last updated: January 2025
 */

// =============================================================================
// RE-EXPORTS
// =============================================================================

// Data
export { STATE_LEGAL_REQUIREMENTS } from "./basic-data";

// Constants
export {
  COMMUNITY_PROPERTY_STATES,
  DOCUMENT_COORDINATION,
  LEGAL_DISCLAIMER,
  LEGAL_TO_PLAIN,
  STATE_NAMES,
} from "./constants";
export { ENHANCED_STATE_REQUIREMENTS } from "./enhanced-data";
// Types
export {
  type AdvanceDirectiveRequirements,
  DOCUMENT_TYPES,
  type DocumentCoordination,
  type DocumentType,
  type DocumentValidation,
  type EnhancedAdvanceDirectiveRequirements,
  type EnhancedFinancialPOARequirements,
  type EnhancedHealthcarePOARequirements,
  type EnhancedStateLegalRequirements,
  type EnhancedTrustRequirements,
  type EnhancedWillRequirements,
  type FinancialPOARequirements,
  type HealthcarePOARequirements,
  type PregnancyProvisions,
  type StateLegalRequirements,
  type TrustRequirements,
  US_STATES,
  type USState,
  type WillRequirements,
  type WitnessRestrictions,
} from "./types";

// =============================================================================
// IMPORTS FOR HELPER FUNCTIONS
// =============================================================================

import { STATE_LEGAL_REQUIREMENTS } from "./basic-data";

import { COMMUNITY_PROPERTY_STATES, LEGAL_TO_PLAIN, STATE_NAMES } from "./constants";
import { ENHANCED_STATE_REQUIREMENTS } from "./enhanced-data";
import {
  type AdvanceDirectiveRequirements,
  type DocumentType,
  type DocumentValidation,
  type EnhancedStateLegalRequirements,
  type FinancialPOARequirements,
  type HealthcarePOARequirements,
  type StateLegalRequirements,
  type TrustRequirements,
  US_STATES,
  type USState,
  type WillRequirements,
} from "./types";

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Get enhanced state legal requirements
 * Falls back to basic requirements if enhanced not available
 */
export function getEnhancedStateLegalRequirements(
  state: USState,
): EnhancedStateLegalRequirements | StateLegalRequirements | undefined {
  return ENHANCED_STATE_REQUIREMENTS[state] || STATE_LEGAL_REQUIREMENTS[state];
}

/**
 * Get legal requirements for a specific state
 */
export function getStateLegalRequirements(state: USState): StateLegalRequirements {
  return STATE_LEGAL_REQUIREMENTS[state];
}

/**
 * Get requirements for a specific document type in a state
 */
export function getDocumentRequirements<T extends DocumentType>(
  state: USState,
  documentType: T,
): StateLegalRequirements[T] {
  return STATE_LEGAL_REQUIREMENTS[state][documentType];
}

/**
 * Get full state name from abbreviation
 */
export function getStateName(state: USState): string {
  return STATE_NAMES[state];
}

/**
 * Check if a state allows holographic wills
 */
export function allowsHolographicWills(state: USState): boolean {
  return STATE_LEGAL_REQUIREMENTS[state].will.holographicAllowed;
}

/**
 * Check if a state allows self-proving wills
 */
export function allowsSelfProvingWills(state: USState): boolean {
  return STATE_LEGAL_REQUIREMENTS[state].will.selfProvingAllowed;
}

/**
 * Get all states that allow holographic wills
 */
export function getHolographicWillStates(): USState[] {
  return US_STATES.filter((state) => STATE_LEGAL_REQUIREMENTS[state].will.holographicAllowed);
}

/**
 * Get all states that require notarization for financial POA
 */
export function getNotaryRequiredForFinancialPOA(): USState[] {
  return US_STATES.filter((state) => STATE_LEGAL_REQUIREMENTS[state].financial_poa.notaryRequired);
}

/**
 * Get states with unique age of majority (not 18)
 */
export function getStatesWithUniqueAgeOfMajority(): { state: USState; age: number }[] {
  const uniqueAges: { state: USState; age: number }[] = [];

  for (const state of US_STATES) {
    const minAge = STATE_LEGAL_REQUIREMENTS[state].financial_poa.minimumWitnessAge;
    if (minAge !== 18) {
      uniqueAges.push({ state, age: minAge });
    }
  }

  return uniqueAges;
}

/**
 * Get states that require more than 2 witnesses for wills
 */
export function getStatesRequiringExtraWitnesses(): USState[] {
  return US_STATES.filter((state) => STATE_LEGAL_REQUIREMENTS[state].will.witnessCount > 2);
}

/**
 * Check if state is a community property state
 */
export function isCommunityPropertyState(state: USState): boolean {
  return COMMUNITY_PROPERTY_STATES.includes(state);
}

/**
 * Get state-specific document name for a document type
 */
export function getStateDocumentName(state: USState, documentType: DocumentType): string {
  const requirements = STATE_LEGAL_REQUIREMENTS[state][documentType];

  if (documentType === "will") {
    return "Last Will and Testament";
  }

  return (requirements as { documentName: string }).documentName;
}

// =============================================================================
// VALIDATION HELPERS
// =============================================================================

/**
 * Validate will signing requirements
 */
export function validateWillRequirements(
  state: USState,
  options: {
    witnessCount: number;
    witnessAges: number[];
    isNotarized: boolean;
    isHolographic: boolean;
    hasSelfProvingAffidavit: boolean;
  },
): DocumentValidation {
  const requirements = STATE_LEGAL_REQUIREMENTS[state].will;
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check holographic validity
  if (options.isHolographic && !requirements.holographicAllowed) {
    errors.push(`${STATE_NAMES[state]} does not recognize holographic (handwritten) wills.`);
  }

  // Check witness count (skip for valid holographic wills)
  if (!options.isHolographic || !requirements.holographicAllowed) {
    if (options.witnessCount < requirements.witnessCount) {
      errors.push(
        `${STATE_NAMES[state]} requires ${requirements.witnessCount} witnesses for a will. You have ${options.witnessCount}.`,
      );
    }
  }

  // Check witness ages
  const underageWitnesses = options.witnessAges.filter(
    (age) => age < requirements.minimumWitnessAge,
  );
  if (underageWitnesses.length > 0) {
    errors.push(
      `${STATE_NAMES[state]} requires witnesses to be at least ${requirements.minimumWitnessAge} years old.`,
    );
  }

  // Check self-proving affidavit
  if (options.hasSelfProvingAffidavit && !requirements.selfProvingAllowed) {
    warnings.push(`${STATE_NAMES[state]} does not recognize self-proving affidavits.`);
  }

  if (options.hasSelfProvingAffidavit && !options.isNotarized) {
    warnings.push(`Self-proving affidavits typically require notarization to be effective.`);
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Get summary of requirements for display
 */
export function getRequirementsSummary(state: USState, documentType: DocumentType): string[] {
  const requirements = STATE_LEGAL_REQUIREMENTS[state][documentType];
  const summary: string[] = [];

  if (documentType === "will") {
    const willReqs = requirements as WillRequirements;
    summary.push(`Witnesses required: ${willReqs.witnessCount}`);
    summary.push(`Minimum witness age: ${willReqs.minimumWitnessAge}`);
    summary.push(`Holographic wills: ${willReqs.holographicAllowed ? "Allowed" : "Not allowed"}`);
    summary.push(
      `Self-proving affidavit: ${willReqs.selfProvingAllowed ? "Allowed" : "Not allowed"}`,
    );
    if (willReqs.specialRequirements) {
      summary.push(`Note: ${willReqs.specialRequirements}`);
    }
  } else {
    const docReqs = requirements as
      | FinancialPOARequirements
      | HealthcarePOARequirements
      | AdvanceDirectiveRequirements
      | TrustRequirements;
    summary.push(`Document name: ${docReqs.documentName}`);
    summary.push(`Witnesses required: ${docReqs.witnessCount}`);
    summary.push(`Notarization required: ${docReqs.notaryRequired ? "Yes" : "No"}`);
    if ("notaryAlternative" in docReqs) {
      summary.push(`Notary can replace witnesses: ${docReqs.notaryAlternative ? "Yes" : "No"}`);
    }
    summary.push(`Minimum witness age: ${docReqs.minimumWitnessAge}`);
    if (docReqs.specialRequirements) {
      summary.push(`Note: ${docReqs.specialRequirements}`);
    }
  }

  return summary;
}

// =============================================================================
// PLAIN LANGUAGE HELPERS
// =============================================================================

/**
 * Convert legal language to plain English
 */
export function toPlainLanguage(legalText: string): string {
  let result = legalText;

  // Sort by length (longest first) to avoid partial replacements
  const sortedTerms = Object.entries(LEGAL_TO_PLAIN).sort(([a], [b]) => b.length - a.length);

  for (const [legal, plain] of sortedTerms) {
    // Case-insensitive replacement
    const regex = new RegExp(legal, "gi");
    result = result.replace(regex, plain);
  }

  return result;
}

/**
 * Get user-friendly requirements summary using plain language.
 * This version speaks to users like friends, not lawyers.
 */
export function getFriendlyRequirementsSummary(
  state: USState,
  documentType: DocumentType,
): string[] {
  const requirements = STATE_LEGAL_REQUIREMENTS[state][documentType];
  const stateName = STATE_NAMES[state];
  const summary: string[] = [];

  if (documentType === "will") {
    const willReqs = requirements as WillRequirements;

    // Witnesses
    if (willReqs.witnessCount === 2) {
      summary.push(
        `You'll need 2 witnesses to watch you sign. They must be at least ${willReqs.minimumWitnessAge} and shouldn't be anyone named in your will.`,
      );
    } else {
      summary.push(
        `${stateName} requires ${willReqs.witnessCount} witness${willReqs.witnessCount !== 1 ? "es" : ""} (at least ${willReqs.minimumWitnessAge} years old).`,
      );
    }

    // Self-proving
    if (willReqs.selfProvingAllowed) {
      summary.push(
        "You can add a notarized statement that makes things easier for your family later—they won't need to track down your witnesses.",
      );
    }

    // Holographic
    if (willReqs.holographicAllowed) {
      summary.push(
        `Good news: ${stateName} accepts handwritten wills. But a typed, witnessed will is still more reliable.`,
      );
    }

    // Special requirements in plain language
    if (willReqs.specialRequirements) {
      const friendly = toPlainLanguage(willReqs.specialRequirements);
      summary.push(friendly);
    }
  } else {
    const docReqs = requirements as
      | FinancialPOARequirements
      | HealthcarePOARequirements
      | AdvanceDirectiveRequirements
      | TrustRequirements;

    // Notarization
    if (docReqs.notaryRequired) {
      summary.push(
        "You'll need to sign this in front of a notary public. Most banks, shipping stores, and libraries have notary services.",
      );
    }

    // Witnesses
    if (docReqs.witnessCount > 0) {
      summary.push(
        `You'll need ${docReqs.witnessCount} witness${docReqs.witnessCount !== 1 ? "es" : ""} (at least ${docReqs.minimumWitnessAge} years old).`,
      );
    }

    // Notary alternative
    if ("notaryAlternative" in docReqs && docReqs.notaryAlternative) {
      summary.push("You can use a notary instead of witnesses if that's easier for you.");
    }

    // Special requirements in plain language
    if (docReqs.specialRequirements) {
      const friendly = toPlainLanguage(docReqs.specialRequirements);
      summary.push(friendly);
    }
  }

  return summary;
}
