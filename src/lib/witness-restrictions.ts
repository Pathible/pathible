/**
 * Witness Restrictions Utilities
 *
 * Provides helper functions and constants for determining
 * witness eligibility based on state requirements.
 */

import type { USState, WitnessRestrictions } from "./state-legal-requirements";
import { ENHANCED_STATE_REQUIREMENTS, STATE_LEGAL_REQUIREMENTS } from "./state-legal-requirements";

/**
 * States where beneficiary witnesses can void their bequest
 */
export const BENEFICIARY_WITNESS_RESTRICTION_STATES: USState[] = [
  "CA",
  "TX",
  "FL",
  "NY",
  "PA",
  "IL",
  "OH",
  "GA",
  "NC",
  "MI",
  "NJ",
  "VA",
  "WA",
  "AZ",
  "MA",
  "TN",
  "IN",
  "MO",
  "MD",
  "WI",
];

/**
 * States where healthcare providers cannot witness healthcare documents
 */
export const HEALTHCARE_PROVIDER_WITNESS_RESTRICTION_STATES: USState[] = [
  "CA",
  "TX",
  "FL",
  "NY",
  "PA",
  "IL",
  "OH",
  "GA",
  "NC",
  "MI",
  "NJ",
  "VA",
  "WA",
  "AZ",
  "MA",
  "TN",
  "IN",
  "MO",
  "MD",
  "WI",
  "CO",
  "MN",
  "SC",
  "AL",
  "LA",
  "KY",
  "OR",
  "OK",
  "CT",
  "UT",
];

/**
 * Get witness restrictions for a given state and document type
 */
export function getWitnessRestrictions(
  state: USState,
  documentType: "will" | "healthcare_poa" | "advance_directive" | "financial_poa",
): WitnessRestrictions | null {
  const enhanced = ENHANCED_STATE_REQUIREMENTS[state];
  if (enhanced) {
    switch (documentType) {
      case "will":
        return enhanced.will.witnessRestrictions;
      case "healthcare_poa":
        return enhanced.healthcare_poa.witnessRestrictions;
      case "advance_directive":
        return enhanced.advance_directive.witnessRestrictions;
      case "financial_poa":
        return enhanced.financial_poa.witnessRestrictions;
      default:
        return null;
    }
  }
  return null;
}

/**
 * Check if a beneficiary can witness a will in a given state
 */
export function canBeneficiaryWitness(state: USState): boolean {
  const enhanced = ENHANCED_STATE_REQUIREMENTS[state];
  if (enhanced) {
    return enhanced.will.witnessRestrictions.beneficiaryCanWitness;
  }
  // Default to true with warning
  return true;
}

/**
 * Get the consequence of a beneficiary witnessing in a given state
 */
export function getBeneficiaryWitnessConsequence(state: USState): string {
  const enhanced = ENHANCED_STATE_REQUIREMENTS[state];
  if (enhanced) {
    const consequence = enhanced.will.witnessRestrictions.beneficiaryWitnessConsequence;
    switch (consequence) {
      case "void_bequest":
        return "The bequest to the witnessing beneficiary may be void or reduced.";
      case "void_will":
        return "The entire will may be invalidated.";
      case "no_consequence":
        return "No legal consequence, but not recommended.";
      default:
        return "Consult with an attorney.";
    }
  }
  return "Consult applicable state law regarding interested witnesses.";
}

/**
 * Check if a healthcare provider can witness healthcare documents
 */
export function canHealthcareProviderWitness(state: USState): boolean {
  return !HEALTHCARE_PROVIDER_WITNESS_RESTRICTION_STATES.includes(state);
}

/**
 * Get the minimum witness age for a document type in a state
 */
export function getMinimumWitnessAge(state: USState, documentType: string): number {
  const reqs = STATE_LEGAL_REQUIREMENTS[state];
  if (!reqs) return 18;

  switch (documentType) {
    case "will":
      return reqs.will.minimumWitnessAge;
    case "healthcare_poa":
      return reqs.healthcare_poa.minimumWitnessAge;
    case "advance_directive":
      return reqs.advance_directive.minimumWitnessAge;
    case "financial_poa":
      return reqs.financial_poa.minimumWitnessAge;
    default:
      return 18;
  }
}
