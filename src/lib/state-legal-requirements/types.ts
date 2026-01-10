/**
 * Type definitions for State Legal Requirements
 *
 * This module contains all type definitions and interfaces used
 * throughout the state legal requirements system.
 *
 * DISCLAIMER: This is a template for informational purposes only.
 * Consult with a qualified attorney for legal advice specific to your situation.
 *
 * Last updated: January 2025
 */

// =============================================================================
// BASE TYPE DEFINITIONS
// =============================================================================

/**
 * US State and Territory codes
 */
export const US_STATES = [
  "AL",
  "AK",
  "AZ",
  "AR",
  "CA",
  "CO",
  "CT",
  "DE",
  "DC",
  "FL",
  "GA",
  "HI",
  "ID",
  "IL",
  "IN",
  "IA",
  "KS",
  "KY",
  "LA",
  "ME",
  "MD",
  "MA",
  "MI",
  "MN",
  "MS",
  "MO",
  "MT",
  "NE",
  "NV",
  "NH",
  "NJ",
  "NM",
  "NY",
  "NC",
  "ND",
  "OH",
  "OK",
  "OR",
  "PA",
  "RI",
  "SC",
  "SD",
  "TN",
  "TX",
  "UT",
  "VT",
  "VA",
  "WA",
  "WV",
  "WI",
  "WY",
] as const;

export type USState = (typeof US_STATES)[number];

/**
 * Document types supported
 */
export const DOCUMENT_TYPES = [
  "will",
  "revocable_trust",
  "financial_poa",
  "healthcare_poa",
  "advance_directive",
] as const;

export type DocumentType = (typeof DOCUMENT_TYPES)[number];

// =============================================================================
// BASE REQUIREMENTS INTERFACES
// =============================================================================

/**
 * Requirements for Last Will and Testament
 */
export interface WillRequirements {
  /** Number of witnesses required */
  witnessCount: number;
  /** Whether notarization is required */
  notaryRequired: boolean;
  /** Whether notary can replace witness requirements */
  notaryAlternative: boolean;
  /** Whether self-proving affidavit is allowed */
  selfProvingAllowed: boolean;
  /** Minimum age for witnesses */
  minimumWitnessAge: number;
  /** Whether holographic (handwritten) wills are valid */
  holographicAllowed: boolean;
  /** Any special state requirements */
  specialRequirements: string | null;
}

/**
 * Requirements for Revocable Living Trust
 */
export interface TrustRequirements {
  /** Number of witnesses required (usually 0) */
  witnessCount: number;
  /** Whether notarization is required */
  notaryRequired: boolean;
  /** State-specific document name */
  documentName: string;
  /** Minimum age for witnesses if required */
  minimumWitnessAge: number;
  /** Any special state requirements */
  specialRequirements: string | null;
}

/**
 * Requirements for Durable Power of Attorney (Financial)
 */
export interface FinancialPOARequirements {
  /** Number of witnesses required */
  witnessCount: number;
  /** Whether notarization is required */
  notaryRequired: boolean;
  /** Whether notary can replace witness requirements */
  notaryAlternative: boolean;
  /** State-specific document name */
  documentName: string;
  /** Minimum age for witnesses */
  minimumWitnessAge: number;
  /** Any special state requirements */
  specialRequirements: string | null;
}

/**
 * Requirements for Healthcare Power of Attorney
 */
export interface HealthcarePOARequirements {
  /** Number of witnesses required */
  witnessCount: number;
  /** Whether notarization is required */
  notaryRequired: boolean;
  /** Whether notary can replace witness requirements */
  notaryAlternative: boolean;
  /** State-specific document name */
  documentName: string;
  /** Minimum age for witnesses */
  minimumWitnessAge: number;
  /** Any special state requirements */
  specialRequirements: string | null;
}

/**
 * Requirements for Advance Healthcare Directive
 */
export interface AdvanceDirectiveRequirements {
  /** Number of witnesses required */
  witnessCount: number;
  /** Whether notarization is required */
  notaryRequired: boolean;
  /** Whether notary can replace witness requirements */
  notaryAlternative: boolean;
  /** State-specific document name */
  documentName: string;
  /** Minimum age for witnesses */
  minimumWitnessAge: number;
  /** Any special state requirements */
  specialRequirements: string | null;
}

// =============================================================================
// ENHANCED TYPE DEFINITIONS
// =============================================================================

/**
 * Witness restriction categories by document type and state
 */
export interface WitnessRestrictions {
  /** Whether beneficiaries can serve as witnesses */
  beneficiaryCanWitness: boolean;
  /** Consequence if beneficiary witnesses */
  beneficiaryWitnessConsequence: "void_bequest" | "void_will" | "no_consequence" | null;
  /** Whether family members can witness */
  familyCanWitness: boolean;
  /** Whether healthcare providers can witness healthcare documents */
  healthcareProviderCanWitness: boolean;
  /** Whether facility operators/employees can witness */
  facilityEmployeeCanWitness: boolean;
  /** Special restrictions as free text */
  additionalRestrictions: string | null;
}

/**
 * Pregnancy provisions for advance directives
 * Some states require explicit language about pregnancy
 */
export interface PregnancyProvisions {
  /** Whether state requires pregnancy exception language */
  pregnancyExceptionRequired: boolean;
  /** State's default behavior if not specified */
  defaultBehavior: "directive_suspended" | "directive_continues" | "patient_choice";
  /** Required statutory language if any */
  statutoryLanguage: string | null;
}

/**
 * Enhanced Will Requirements extending base WillRequirements
 */
export interface EnhancedWillRequirements extends WillRequirements {
  /** Witness restrictions */
  witnessRestrictions: WitnessRestrictions;
  /** Whether no-contest clauses are enforceable in this state */
  noContestClauseEnforceable: boolean;
  /** Limitations on no-contest clause enforcement */
  noContestLimitations: string | null;
  /** Default survival period (days) recognized by state */
  defaultSurvivalPeriod: number;
  /** Whether state has adopted RUFADAA for digital assets */
  rufadaaAdopted: boolean;
  /** Whether this is a community property state */
  communityPropertyState: boolean;
}

/**
 * Enhanced Healthcare POA Requirements
 */
export interface EnhancedHealthcarePOARequirements extends HealthcarePOARequirements {
  /** Witness restrictions specific to healthcare documents */
  witnessRestrictions: WitnessRestrictions;
  /** Whether HIPAA authorization is combined or separate */
  hipaaIntegration: "combined" | "separate_recommended" | "separate_required";
  /** Mental health treatment authority */
  mentalHealthAuthority: "included" | "separate_required" | "not_permitted";
  /** Nursing home admission authority */
  nursingHomeAuthority: "included" | "separate_required" | "court_required";
}

/**
 * Enhanced Advance Directive Requirements
 */
export interface EnhancedAdvanceDirectiveRequirements extends AdvanceDirectiveRequirements {
  /** Pregnancy provisions */
  pregnancyProvisions: PregnancyProvisions;
  /** Witness restrictions */
  witnessRestrictions: WitnessRestrictions;
  /** Whether state has statutory form that must be substantially followed */
  statutoryFormRequired: boolean;
  /** Reference to state statutory form */
  statutoryFormReference: string | null;
  /** State-specific condition definitions */
  conditionDefinitions: {
    terminalCondition: string;
    permanentUnconsciousness: string;
    endStageCondition: string;
  };
}

/**
 * Enhanced Financial POA Requirements
 */
export interface EnhancedFinancialPOARequirements extends FinancialPOARequirements {
  /** Whether state has adopted Uniform Power of Attorney Act */
  upoaaAdopted: boolean;
  /** Witness restrictions */
  witnessRestrictions: WitnessRestrictions;
  /** Whether agent acceptance acknowledgment is recommended */
  agentAcceptanceRecommended: boolean;
  /** Whether state has statutory third-party reliance provisions */
  thirdPartyRelianceStatutory: boolean;
  /** Powers that require explicit grant (not implied) */
  explicitGrantRequired: string[];
}

/**
 * Enhanced Trust Requirements
 */
export interface EnhancedTrustRequirements extends TrustRequirements {
  /** Whether certificate of trust is recognized */
  certificateOfTrustRecognized: boolean;
  /** Pour-over will coordination requirements */
  pourOverWillRequirements: string | null;
  /** Reference to state trust code */
  trustCodeReference: string | null;
}

/**
 * Document coordination and dependencies
 */
export interface DocumentCoordination {
  /** Documents that should be created together */
  recommendedCompanions: DocumentType[];
  /** Documents that must reference each other */
  requiredReferences: DocumentType[];
  /** Warning message for standalone creation */
  standaloneWarning: string | null;
}

/**
 * Complete state legal requirements
 */
export interface StateLegalRequirements {
  will: WillRequirements;
  revocable_trust: TrustRequirements;
  financial_poa: FinancialPOARequirements;
  healthcare_poa: HealthcarePOARequirements;
  advance_directive: AdvanceDirectiveRequirements;
}

/**
 * Enhanced complete state legal requirements with all new properties
 */
export interface EnhancedStateLegalRequirements {
  will: EnhancedWillRequirements;
  revocable_trust: EnhancedTrustRequirements;
  financial_poa: EnhancedFinancialPOARequirements;
  healthcare_poa: EnhancedHealthcarePOARequirements;
  advance_directive: EnhancedAdvanceDirectiveRequirements;
}

// =============================================================================
// VALIDATION TYPES
// =============================================================================

/**
 * Validate that a document meets minimum state requirements
 */
export interface DocumentValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}
