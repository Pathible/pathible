/**
 * State Legal Requirements for Estate Planning Documents
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
// TYPE DEFINITIONS
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
 * State display names
 */
export const STATE_NAMES: Record<USState, string> = {
  AL: "Alabama",
  AK: "Alaska",
  AZ: "Arizona",
  AR: "Arkansas",
  CA: "California",
  CO: "Colorado",
  CT: "Connecticut",
  DE: "Delaware",
  DC: "District of Columbia",
  FL: "Florida",
  GA: "Georgia",
  HI: "Hawaii",
  ID: "Idaho",
  IL: "Illinois",
  IN: "Indiana",
  IA: "Iowa",
  KS: "Kansas",
  KY: "Kentucky",
  LA: "Louisiana",
  ME: "Maine",
  MD: "Maryland",
  MA: "Massachusetts",
  MI: "Michigan",
  MN: "Minnesota",
  MS: "Mississippi",
  MO: "Missouri",
  MT: "Montana",
  NE: "Nebraska",
  NV: "Nevada",
  NH: "New Hampshire",
  NJ: "New Jersey",
  NM: "New Mexico",
  NY: "New York",
  NC: "North Carolina",
  ND: "North Dakota",
  OH: "Ohio",
  OK: "Oklahoma",
  OR: "Oregon",
  PA: "Pennsylvania",
  RI: "Rhode Island",
  SC: "South Carolina",
  SD: "South Dakota",
  TN: "Tennessee",
  TX: "Texas",
  UT: "Utah",
  VT: "Vermont",
  VA: "Virginia",
  WA: "Washington",
  WV: "West Virginia",
  WI: "Wisconsin",
  WY: "Wyoming",
};

// =============================================================================
// STATE LEGAL REQUIREMENTS DATA
// =============================================================================

export const STATE_LEGAL_REQUIREMENTS: Record<USState, StateLegalRequirements> = {
  // ---------------------------------------------------------------------------
  // ALABAMA
  // ---------------------------------------------------------------------------
  AL: {
    will: {
      witnessCount: 2,
      notaryRequired: false,
      notaryAlternative: false,
      selfProvingAllowed: true,
      minimumWitnessAge: 18,
      holographicAllowed: false,
      specialRequirements:
        "Witnesses must be competent and cannot be beneficiaries. Self-proving affidavit requires notarization.",
    },
    revocable_trust: {
      witnessCount: 0,
      notaryRequired: true,
      documentName: "Revocable Living Trust",
      minimumWitnessAge: 18,
      specialRequirements: "Notarization recommended for real property transfers.",
    },
    financial_poa: {
      witnessCount: 1,
      notaryRequired: true,
      notaryAlternative: false,
      documentName: "Durable Power of Attorney",
      minimumWitnessAge: 19,
      specialRequirements:
        "Age of majority in Alabama is 19. Must be acknowledged before a notary. Statutory form available under Alabama Uniform Power of Attorney Act.",
    },
    healthcare_poa: {
      witnessCount: 2,
      notaryRequired: false,
      notaryAlternative: true,
      documentName: "Health Care Proxy",
      minimumWitnessAge: 19,
      specialRequirements:
        "One witness must not be a health care provider, operator of a health care facility, or an employee of either.",
    },
    advance_directive: {
      witnessCount: 2,
      notaryRequired: false,
      notaryAlternative: true,
      documentName: "Advance Directive for Health Care",
      minimumWitnessAge: 19,
      specialRequirements:
        "Witnesses cannot be related by blood, marriage, or adoption. Cannot be entitled to any portion of estate.",
    },
  },

  // ---------------------------------------------------------------------------
  // ALASKA
  // ---------------------------------------------------------------------------
  AK: {
    will: {
      witnessCount: 2,
      notaryRequired: false,
      notaryAlternative: false,
      selfProvingAllowed: true,
      minimumWitnessAge: 18,
      holographicAllowed: true,
      specialRequirements:
        "Holographic wills must be entirely in testator's handwriting and signed. No witnesses required for holographic wills.",
    },
    revocable_trust: {
      witnessCount: 0,
      notaryRequired: true,
      documentName: "Revocable Living Trust",
      minimumWitnessAge: 18,
      specialRequirements: null,
    },
    financial_poa: {
      witnessCount: 0,
      notaryRequired: true,
      notaryAlternative: false,
      documentName: "Durable Power of Attorney",
      minimumWitnessAge: 18,
      specialRequirements:
        "Must be signed and acknowledged before a notary. Alaska follows Uniform Power of Attorney Act.",
    },
    healthcare_poa: {
      witnessCount: 2,
      notaryRequired: false,
      notaryAlternative: true,
      documentName: "Power of Attorney for Health Care",
      minimumWitnessAge: 18,
      specialRequirements: "Witnesses cannot be the appointed agent.",
    },
    advance_directive: {
      witnessCount: 2,
      notaryRequired: false,
      notaryAlternative: true,
      documentName: "Advance Health Care Directive",
      minimumWitnessAge: 18,
      specialRequirements: "Can be combined with healthcare POA in single document.",
    },
  },

  // ---------------------------------------------------------------------------
  // ARIZONA
  // ---------------------------------------------------------------------------
  AZ: {
    will: {
      witnessCount: 2,
      notaryRequired: false,
      notaryAlternative: false,
      selfProvingAllowed: true,
      minimumWitnessAge: 18,
      holographicAllowed: true,
      specialRequirements:
        "Holographic wills valid if material portions in testator's handwriting. Self-proving affidavit requires notarization.",
    },
    revocable_trust: {
      witnessCount: 0,
      notaryRequired: true,
      documentName: "Revocable Living Trust",
      minimumWitnessAge: 18,
      specialRequirements: "Notarization required for recording real property deeds to trust.",
    },
    financial_poa: {
      witnessCount: 1,
      notaryRequired: true,
      notaryAlternative: false,
      documentName: "Durable Power of Attorney",
      minimumWitnessAge: 18,
      specialRequirements:
        "Must be notarized and have one witness. Witness cannot be the agent or notary.",
    },
    healthcare_poa: {
      witnessCount: 1,
      notaryRequired: true,
      notaryAlternative: false,
      documentName: "Health Care Power of Attorney",
      minimumWitnessAge: 18,
      specialRequirements:
        "Witness cannot be the agent, healthcare provider, or operator of healthcare facility.",
    },
    advance_directive: {
      witnessCount: 1,
      notaryRequired: true,
      notaryAlternative: false,
      documentName: "Living Will",
      minimumWitnessAge: 18,
      specialRequirements: "Part of combined Advance Directive document in Arizona.",
    },
  },

  // ---------------------------------------------------------------------------
  // ARKANSAS
  // ---------------------------------------------------------------------------
  AR: {
    will: {
      witnessCount: 2,
      notaryRequired: false,
      notaryAlternative: false,
      selfProvingAllowed: true,
      minimumWitnessAge: 18,
      holographicAllowed: true,
      specialRequirements:
        "Holographic wills must be entirely in testator's handwriting. Witnesses cannot be beneficiaries.",
    },
    revocable_trust: {
      witnessCount: 0,
      notaryRequired: true,
      documentName: "Revocable Living Trust",
      minimumWitnessAge: 18,
      specialRequirements: null,
    },
    financial_poa: {
      witnessCount: 0,
      notaryRequired: true,
      notaryAlternative: false,
      documentName: "Durable Power of Attorney",
      minimumWitnessAge: 18,
      specialRequirements: "Must be acknowledged before a notary public.",
    },
    healthcare_poa: {
      witnessCount: 2,
      notaryRequired: false,
      notaryAlternative: true,
      documentName: "Health Care Proxy",
      minimumWitnessAge: 18,
      specialRequirements: "Witnesses cannot be the agent or healthcare provider.",
    },
    advance_directive: {
      witnessCount: 2,
      notaryRequired: false,
      notaryAlternative: true,
      documentName: "Declaration",
      minimumWitnessAge: 18,
      specialRequirements: "Arkansas uses 'Declaration' instead of Living Will terminology.",
    },
  },

  // ---------------------------------------------------------------------------
  // CALIFORNIA
  // ---------------------------------------------------------------------------
  CA: {
    will: {
      witnessCount: 2,
      notaryRequired: false,
      notaryAlternative: false,
      selfProvingAllowed: false,
      minimumWitnessAge: 18,
      holographicAllowed: true,
      specialRequirements:
        "California does NOT recognize self-proving wills. Holographic wills require material provisions and signature in testator's handwriting.",
    },
    revocable_trust: {
      witnessCount: 0,
      notaryRequired: true,
      documentName: "Revocable Living Trust",
      minimumWitnessAge: 18,
      specialRequirements:
        "Notarization required for real property transfers. California has robust trust law under Probate Code.",
    },
    financial_poa: {
      witnessCount: 2,
      notaryRequired: true,
      notaryAlternative: false,
      documentName: "Durable Power of Attorney for Finances",
      minimumWitnessAge: 18,
      specialRequirements:
        "Requires notarization AND two witnesses. Witnesses cannot be the agent. Statutory form available (Probate Code 4401).",
    },
    healthcare_poa: {
      witnessCount: 2,
      notaryRequired: false,
      notaryAlternative: true,
      documentName: "Advance Health Care Directive",
      minimumWitnessAge: 18,
      specialRequirements:
        "If patient in skilled nursing facility, one witness must be a patient advocate or ombudsman.",
    },
    advance_directive: {
      witnessCount: 2,
      notaryRequired: false,
      notaryAlternative: true,
      documentName: "Advance Health Care Directive",
      minimumWitnessAge: 18,
      specialRequirements:
        "California combines healthcare POA and living will into single Advance Health Care Directive.",
    },
  },

  // ---------------------------------------------------------------------------
  // COLORADO
  // ---------------------------------------------------------------------------
  CO: {
    will: {
      witnessCount: 2,
      notaryRequired: false,
      notaryAlternative: false,
      selfProvingAllowed: true,
      minimumWitnessAge: 18,
      holographicAllowed: true,
      specialRequirements:
        "Holographic wills valid if material portions and signature in testator's handwriting.",
    },
    revocable_trust: {
      witnessCount: 0,
      notaryRequired: true,
      documentName: "Revocable Living Trust",
      minimumWitnessAge: 18,
      specialRequirements: "Colorado follows Uniform Trust Code.",
    },
    financial_poa: {
      witnessCount: 0,
      notaryRequired: true,
      notaryAlternative: false,
      documentName: "Durable Power of Attorney",
      minimumWitnessAge: 18,
      specialRequirements:
        "Must be acknowledged before a notary. Colorado follows Uniform Power of Attorney Act.",
    },
    healthcare_poa: {
      witnessCount: 2,
      notaryRequired: false,
      notaryAlternative: true,
      documentName: "Medical Durable Power of Attorney",
      minimumWitnessAge: 18,
      specialRequirements: "Witnesses cannot be the agent. May use notary instead of witnesses.",
    },
    advance_directive: {
      witnessCount: 2,
      notaryRequired: false,
      notaryAlternative: true,
      documentName: "Living Will Declaration",
      minimumWitnessAge: 18,
      specialRequirements: null,
    },
  },

  // ---------------------------------------------------------------------------
  // CONNECTICUT
  // ---------------------------------------------------------------------------
  CT: {
    will: {
      witnessCount: 2,
      notaryRequired: false,
      notaryAlternative: false,
      selfProvingAllowed: true,
      minimumWitnessAge: 18,
      holographicAllowed: false,
      specialRequirements:
        "Witnesses should be disinterested (not beneficiaries). Testator must sign in presence of witnesses.",
    },
    revocable_trust: {
      witnessCount: 0,
      notaryRequired: true,
      documentName: "Revocable Living Trust",
      minimumWitnessAge: 18,
      specialRequirements: null,
    },
    financial_poa: {
      witnessCount: 2,
      notaryRequired: true,
      notaryAlternative: false,
      documentName: "Durable Power of Attorney",
      minimumWitnessAge: 18,
      specialRequirements:
        "Requires notarization and two witnesses. Statutory short form available.",
    },
    healthcare_poa: {
      witnessCount: 2,
      notaryRequired: false,
      notaryAlternative: false,
      documentName: "Appointment of Health Care Representative",
      minimumWitnessAge: 18,
      specialRequirements: "Witnesses cannot be the appointed representative.",
    },
    advance_directive: {
      witnessCount: 2,
      notaryRequired: false,
      notaryAlternative: false,
      documentName: "Living Will",
      minimumWitnessAge: 18,
      specialRequirements: null,
    },
  },

  // ---------------------------------------------------------------------------
  // DELAWARE
  // ---------------------------------------------------------------------------
  DE: {
    will: {
      witnessCount: 2,
      notaryRequired: false,
      notaryAlternative: false,
      selfProvingAllowed: true,
      minimumWitnessAge: 18,
      holographicAllowed: false,
      specialRequirements:
        "Testator must sign at the end of the will. Witnesses sign in presence of testator.",
    },
    revocable_trust: {
      witnessCount: 0,
      notaryRequired: true,
      documentName: "Revocable Living Trust",
      minimumWitnessAge: 18,
      specialRequirements: "Delaware has favorable trust laws and no state income tax on trusts.",
    },
    financial_poa: {
      witnessCount: 1,
      notaryRequired: true,
      notaryAlternative: false,
      documentName: "Durable Power of Attorney",
      minimumWitnessAge: 18,
      specialRequirements: "Must be acknowledged before a notary. Statutory form available.",
    },
    healthcare_poa: {
      witnessCount: 2,
      notaryRequired: false,
      notaryAlternative: false,
      documentName: "Health-Care Power of Attorney",
      minimumWitnessAge: 18,
      specialRequirements: "Witnesses cannot be the agent or healthcare provider.",
    },
    advance_directive: {
      witnessCount: 2,
      notaryRequired: false,
      notaryAlternative: false,
      documentName: "Advance Health-Care Directive",
      minimumWitnessAge: 18,
      specialRequirements: "Delaware combines living will and healthcare POA into single document.",
    },
  },

  // ---------------------------------------------------------------------------
  // DISTRICT OF COLUMBIA
  // ---------------------------------------------------------------------------
  DC: {
    will: {
      witnessCount: 2,
      notaryRequired: false,
      notaryAlternative: false,
      selfProvingAllowed: true,
      minimumWitnessAge: 18,
      holographicAllowed: false,
      specialRequirements:
        "Witnesses must sign in presence of testator. Disinterested witnesses recommended.",
    },
    revocable_trust: {
      witnessCount: 0,
      notaryRequired: true,
      documentName: "Revocable Living Trust",
      minimumWitnessAge: 18,
      specialRequirements: null,
    },
    financial_poa: {
      witnessCount: 0,
      notaryRequired: true,
      notaryAlternative: false,
      documentName: "Durable Power of Attorney",
      minimumWitnessAge: 18,
      specialRequirements:
        "DC follows Uniform Power of Attorney Act. Must be acknowledged before notary.",
    },
    healthcare_poa: {
      witnessCount: 2,
      notaryRequired: false,
      notaryAlternative: false,
      documentName: "Durable Power of Attorney for Health Care",
      minimumWitnessAge: 18,
      specialRequirements:
        "Witnesses cannot be the agent, healthcare provider, or related to either.",
    },
    advance_directive: {
      witnessCount: 2,
      notaryRequired: false,
      notaryAlternative: false,
      documentName: "Declaration",
      minimumWitnessAge: 18,
      specialRequirements: "DC calls living will a 'Declaration'.",
    },
  },

  // ---------------------------------------------------------------------------
  // FLORIDA
  // ---------------------------------------------------------------------------
  FL: {
    will: {
      witnessCount: 2,
      notaryRequired: false,
      notaryAlternative: false,
      selfProvingAllowed: true,
      minimumWitnessAge: 18,
      holographicAllowed: false,
      specialRequirements:
        "Florida does NOT recognize holographic wills. Must be signed at end. Self-proving affidavit requires notarization. Witnesses must sign in presence of each other and testator.",
    },
    revocable_trust: {
      witnessCount: 0,
      notaryRequired: true,
      documentName: "Revocable Living Trust",
      minimumWitnessAge: 18,
      specialRequirements:
        "Florida Trust Code provides specific rules. Notarization required for real property transfers.",
    },
    financial_poa: {
      witnessCount: 2,
      notaryRequired: true,
      notaryAlternative: false,
      documentName: "Durable Power of Attorney",
      minimumWitnessAge: 18,
      specialRequirements:
        "Must be notarized AND have two witnesses. Very specific statutory form under F.S. 709.2202.",
    },
    healthcare_poa: {
      witnessCount: 2,
      notaryRequired: false,
      notaryAlternative: false,
      documentName: "Designation of Health Care Surrogate",
      minimumWitnessAge: 18,
      specialRequirements: "One witness cannot be the patient's spouse or blood relative.",
    },
    advance_directive: {
      witnessCount: 2,
      notaryRequired: false,
      notaryAlternative: false,
      documentName: "Living Will",
      minimumWitnessAge: 18,
      specialRequirements: "One witness must not be spouse or blood relative.",
    },
  },

  // ---------------------------------------------------------------------------
  // GEORGIA
  // ---------------------------------------------------------------------------
  GA: {
    will: {
      witnessCount: 2,
      notaryRequired: false,
      notaryAlternative: false,
      selfProvingAllowed: true,
      minimumWitnessAge: 14,
      holographicAllowed: false,
      specialRequirements:
        "Georgia allows witnesses as young as 14. Witnesses should be disinterested.",
    },
    revocable_trust: {
      witnessCount: 0,
      notaryRequired: true,
      documentName: "Revocable Living Trust",
      minimumWitnessAge: 18,
      specialRequirements: "Georgia Trust Code governs. Registration with court is optional.",
    },
    financial_poa: {
      witnessCount: 1,
      notaryRequired: true,
      notaryAlternative: false,
      documentName: "Financial Power of Attorney",
      minimumWitnessAge: 18,
      specialRequirements:
        "Must be acknowledged before notary with one witness. Statutory form available under O.C.G.A. 10-6B.",
    },
    healthcare_poa: {
      witnessCount: 2,
      notaryRequired: false,
      notaryAlternative: false,
      documentName: "Health Care Agency",
      minimumWitnessAge: 18,
      specialRequirements:
        "Witnesses cannot be agent, healthcare provider, or related to patient. One witness cannot be employee of healthcare facility.",
    },
    advance_directive: {
      witnessCount: 2,
      notaryRequired: false,
      notaryAlternative: false,
      documentName: "Advance Directive for Health Care",
      minimumWitnessAge: 18,
      specialRequirements:
        "Georgia combines living will and healthcare agency into Advance Directive.",
    },
  },

  // ---------------------------------------------------------------------------
  // HAWAII
  // ---------------------------------------------------------------------------
  HI: {
    will: {
      witnessCount: 2,
      notaryRequired: false,
      notaryAlternative: false,
      selfProvingAllowed: true,
      minimumWitnessAge: 18,
      holographicAllowed: true,
      specialRequirements:
        "Holographic wills valid if signature and material portions in testator's handwriting.",
    },
    revocable_trust: {
      witnessCount: 0,
      notaryRequired: true,
      documentName: "Revocable Living Trust",
      minimumWitnessAge: 18,
      specialRequirements: "Hawaii follows Uniform Trust Code.",
    },
    financial_poa: {
      witnessCount: 0,
      notaryRequired: true,
      notaryAlternative: false,
      documentName: "Durable Power of Attorney",
      minimumWitnessAge: 18,
      specialRequirements:
        "Must be acknowledged before notary. Hawaii follows Uniform Power of Attorney Act.",
    },
    healthcare_poa: {
      witnessCount: 2,
      notaryRequired: false,
      notaryAlternative: true,
      documentName: "Durable Power of Attorney for Health Care",
      minimumWitnessAge: 18,
      specialRequirements: "May use notarization in lieu of witnesses.",
    },
    advance_directive: {
      witnessCount: 2,
      notaryRequired: false,
      notaryAlternative: true,
      documentName: "Advance Health Care Directive",
      minimumWitnessAge: 18,
      specialRequirements: "Hawaii uses combined advance directive form.",
    },
  },

  // ---------------------------------------------------------------------------
  // IDAHO
  // ---------------------------------------------------------------------------
  ID: {
    will: {
      witnessCount: 2,
      notaryRequired: false,
      notaryAlternative: false,
      selfProvingAllowed: true,
      minimumWitnessAge: 18,
      holographicAllowed: true,
      specialRequirements:
        "Holographic wills valid if material provisions and signature in testator's handwriting.",
    },
    revocable_trust: {
      witnessCount: 0,
      notaryRequired: true,
      documentName: "Revocable Living Trust",
      minimumWitnessAge: 18,
      specialRequirements: "Idaho follows Uniform Trust Code.",
    },
    financial_poa: {
      witnessCount: 0,
      notaryRequired: true,
      notaryAlternative: false,
      documentName: "Durable Power of Attorney",
      minimumWitnessAge: 18,
      specialRequirements:
        "Must be acknowledged before notary. Idaho follows Uniform Power of Attorney Act.",
    },
    healthcare_poa: {
      witnessCount: 2,
      notaryRequired: false,
      notaryAlternative: true,
      documentName: "Durable Power of Attorney for Health Care",
      minimumWitnessAge: 18,
      specialRequirements: null,
    },
    advance_directive: {
      witnessCount: 2,
      notaryRequired: false,
      notaryAlternative: true,
      documentName: "Living Will and Durable Power of Attorney for Health Care",
      minimumWitnessAge: 18,
      specialRequirements: "Idaho uses combined directive form.",
    },
  },

  // ---------------------------------------------------------------------------
  // ILLINOIS
  // ---------------------------------------------------------------------------
  IL: {
    will: {
      witnessCount: 2,
      notaryRequired: false,
      notaryAlternative: false,
      selfProvingAllowed: true,
      minimumWitnessAge: 18,
      holographicAllowed: false,
      specialRequirements: "Witnesses must be credible and sign in each other's presence.",
    },
    revocable_trust: {
      witnessCount: 0,
      notaryRequired: true,
      documentName: "Revocable Living Trust",
      minimumWitnessAge: 18,
      specialRequirements: "Illinois Trust and Trustees Act governs.",
    },
    financial_poa: {
      witnessCount: 1,
      notaryRequired: true,
      notaryAlternative: false,
      documentName: "Statutory Short Form Power of Attorney for Property",
      minimumWitnessAge: 18,
      specialRequirements:
        "Illinois has specific statutory short form. Must be acknowledged before notary with witness.",
    },
    healthcare_poa: {
      witnessCount: 1,
      notaryRequired: false,
      notaryAlternative: false,
      documentName: "Statutory Short Form Power of Attorney for Health Care",
      minimumWitnessAge: 18,
      specialRequirements:
        "Witness cannot be agent. Illinois has specific statutory form (755 ILCS 45).",
    },
    advance_directive: {
      witnessCount: 1,
      notaryRequired: false,
      notaryAlternative: false,
      documentName: "Declaration",
      minimumWitnessAge: 18,
      specialRequirements: "Illinois calls living will a 'Declaration' under Living Will Act.",
    },
  },

  // ---------------------------------------------------------------------------
  // INDIANA
  // ---------------------------------------------------------------------------
  IN: {
    will: {
      witnessCount: 2,
      notaryRequired: false,
      notaryAlternative: false,
      selfProvingAllowed: true,
      minimumWitnessAge: 18,
      holographicAllowed: false,
      specialRequirements:
        "Attestation clause should state witnesses signed at testator's request.",
    },
    revocable_trust: {
      witnessCount: 0,
      notaryRequired: true,
      documentName: "Revocable Living Trust",
      minimumWitnessAge: 18,
      specialRequirements: "Indiana Trust Code governs.",
    },
    financial_poa: {
      witnessCount: 0,
      notaryRequired: true,
      notaryAlternative: false,
      documentName: "Power of Attorney",
      minimumWitnessAge: 18,
      specialRequirements: "Must be acknowledged before notary to be durable.",
    },
    healthcare_poa: {
      witnessCount: 0,
      notaryRequired: true,
      notaryAlternative: false,
      documentName: "Health Care Representative Appointment",
      minimumWitnessAge: 18,
      specialRequirements:
        "Must be notarized. Agent cannot be healthcare provider unless related to principal.",
    },
    advance_directive: {
      witnessCount: 2,
      notaryRequired: false,
      notaryAlternative: false,
      documentName: "Living Will Declaration",
      minimumWitnessAge: 18,
      specialRequirements: "Indiana has specific statutory form for living will declaration.",
    },
  },

  // ---------------------------------------------------------------------------
  // IOWA
  // ---------------------------------------------------------------------------
  IA: {
    will: {
      witnessCount: 2,
      notaryRequired: false,
      notaryAlternative: false,
      selfProvingAllowed: true,
      minimumWitnessAge: 18,
      holographicAllowed: false,
      specialRequirements: "Witnesses must be competent adults.",
    },
    revocable_trust: {
      witnessCount: 0,
      notaryRequired: true,
      documentName: "Revocable Living Trust",
      minimumWitnessAge: 18,
      specialRequirements: "Iowa Trust Code governs.",
    },
    financial_poa: {
      witnessCount: 0,
      notaryRequired: true,
      notaryAlternative: false,
      documentName: "Durable Power of Attorney",
      minimumWitnessAge: 18,
      specialRequirements:
        "Must be acknowledged before notary. Statutory form available under Iowa Code Chapter 633B.",
    },
    healthcare_poa: {
      witnessCount: 2,
      notaryRequired: false,
      notaryAlternative: true,
      documentName: "Durable Power of Attorney for Health Care",
      minimumWitnessAge: 18,
      specialRequirements:
        "Witnesses cannot be healthcare provider, agent, or related to principal. May be notarized instead.",
    },
    advance_directive: {
      witnessCount: 2,
      notaryRequired: false,
      notaryAlternative: true,
      documentName: "Living Will Declaration",
      minimumWitnessAge: 18,
      specialRequirements: null,
    },
  },

  // ---------------------------------------------------------------------------
  // KANSAS
  // ---------------------------------------------------------------------------
  KS: {
    will: {
      witnessCount: 2,
      notaryRequired: false,
      notaryAlternative: false,
      selfProvingAllowed: true,
      minimumWitnessAge: 18,
      holographicAllowed: false,
      specialRequirements:
        "Testator must sign or acknowledge signature in presence of both witnesses.",
    },
    revocable_trust: {
      witnessCount: 0,
      notaryRequired: true,
      documentName: "Revocable Living Trust",
      minimumWitnessAge: 18,
      specialRequirements: "Kansas Uniform Trust Code governs.",
    },
    financial_poa: {
      witnessCount: 0,
      notaryRequired: true,
      notaryAlternative: false,
      documentName: "Durable Power of Attorney",
      minimumWitnessAge: 18,
      specialRequirements:
        "Must be acknowledged before notary. Kansas follows Uniform Power of Attorney Act.",
    },
    healthcare_poa: {
      witnessCount: 2,
      notaryRequired: false,
      notaryAlternative: true,
      documentName: "Durable Power of Attorney for Health Care Decisions",
      minimumWitnessAge: 18,
      specialRequirements:
        "Witnesses cannot be the agent or healthcare provider. Notary may substitute for one witness.",
    },
    advance_directive: {
      witnessCount: 2,
      notaryRequired: false,
      notaryAlternative: true,
      documentName: "Declaration",
      minimumWitnessAge: 18,
      specialRequirements: "Kansas uses 'Declaration' terminology for living will.",
    },
  },

  // ---------------------------------------------------------------------------
  // KENTUCKY
  // ---------------------------------------------------------------------------
  KY: {
    will: {
      witnessCount: 2,
      notaryRequired: false,
      notaryAlternative: false,
      selfProvingAllowed: true,
      minimumWitnessAge: 18,
      holographicAllowed: true,
      specialRequirements:
        "Holographic wills must be entirely in testator's handwriting and signed. Must be proved by two witnesses who can identify handwriting.",
    },
    revocable_trust: {
      witnessCount: 0,
      notaryRequired: true,
      documentName: "Revocable Living Trust",
      minimumWitnessAge: 18,
      specialRequirements: null,
    },
    financial_poa: {
      witnessCount: 0,
      notaryRequired: true,
      notaryAlternative: false,
      documentName: "Durable Power of Attorney",
      minimumWitnessAge: 18,
      specialRequirements: "Must be acknowledged before notary.",
    },
    healthcare_poa: {
      witnessCount: 2,
      notaryRequired: false,
      notaryAlternative: true,
      documentName: "Health Care Surrogate Designation",
      minimumWitnessAge: 18,
      specialRequirements:
        "Witnesses cannot be the surrogate, healthcare provider, or financially responsible for principal's care.",
    },
    advance_directive: {
      witnessCount: 2,
      notaryRequired: false,
      notaryAlternative: true,
      documentName: "Living Will Directive",
      minimumWitnessAge: 18,
      specialRequirements:
        "Kentucky combines health care surrogate and living will in advance directive form.",
    },
  },

  // ---------------------------------------------------------------------------
  // LOUISIANA
  // ---------------------------------------------------------------------------
  LA: {
    will: {
      witnessCount: 2,
      notaryRequired: true,
      notaryAlternative: false,
      selfProvingAllowed: true,
      minimumWitnessAge: 18,
      holographicAllowed: true,
      specialRequirements:
        "Louisiana has unique civil law system. Notarial will requires notary and two witnesses. Olographic (holographic) will must be entirely handwritten, dated, and signed. 'Forced heirship' rules may limit disinheritance of children under 24 or permanently incapable children.",
    },
    revocable_trust: {
      witnessCount: 0,
      notaryRequired: true,
      documentName: "Revocable Living Trust",
      minimumWitnessAge: 18,
      specialRequirements: "Louisiana Trust Code is unique due to civil law heritage.",
    },
    financial_poa: {
      witnessCount: 2,
      notaryRequired: true,
      notaryAlternative: false,
      documentName: "Procuration (Power of Attorney)",
      minimumWitnessAge: 18,
      specialRequirements:
        "Louisiana uses civil law terminology. Must be executed before notary with two witnesses. Called 'mandate' or 'procuration' in Louisiana law.",
    },
    healthcare_poa: {
      witnessCount: 2,
      notaryRequired: false,
      notaryAlternative: false,
      documentName: "Declaration Concerning Health Care Decisions",
      minimumWitnessAge: 18,
      specialRequirements: "Part of Louisiana's combined Advance Directive form.",
    },
    advance_directive: {
      witnessCount: 2,
      notaryRequired: false,
      notaryAlternative: false,
      documentName: "Louisiana Advance Health Care Directive",
      minimumWitnessAge: 18,
      specialRequirements: "Louisiana has specific statutory form (RS 40:1151 et seq.).",
    },
  },

  // ---------------------------------------------------------------------------
  // MAINE
  // ---------------------------------------------------------------------------
  ME: {
    will: {
      witnessCount: 2,
      notaryRequired: false,
      notaryAlternative: false,
      selfProvingAllowed: true,
      minimumWitnessAge: 18,
      holographicAllowed: true,
      specialRequirements:
        "Holographic wills valid if material portions in testator's handwriting.",
    },
    revocable_trust: {
      witnessCount: 0,
      notaryRequired: true,
      documentName: "Revocable Living Trust",
      minimumWitnessAge: 18,
      specialRequirements: "Maine follows Uniform Trust Code.",
    },
    financial_poa: {
      witnessCount: 0,
      notaryRequired: true,
      notaryAlternative: false,
      documentName: "Durable Power of Attorney",
      minimumWitnessAge: 18,
      specialRequirements:
        "Must be acknowledged before notary. Maine follows Uniform Power of Attorney Act.",
    },
    healthcare_poa: {
      witnessCount: 2,
      notaryRequired: false,
      notaryAlternative: false,
      documentName: "Durable Power of Attorney for Health Care",
      minimumWitnessAge: 18,
      specialRequirements: null,
    },
    advance_directive: {
      witnessCount: 2,
      notaryRequired: false,
      notaryAlternative: false,
      documentName: "Advance Health-Care Directive",
      minimumWitnessAge: 18,
      specialRequirements: "Maine uses combined advance directive form.",
    },
  },

  // ---------------------------------------------------------------------------
  // MARYLAND
  // ---------------------------------------------------------------------------
  MD: {
    will: {
      witnessCount: 2,
      notaryRequired: false,
      notaryAlternative: false,
      selfProvingAllowed: true,
      minimumWitnessAge: 18,
      holographicAllowed: false,
      specialRequirements: "Witnesses must be credible and sign in testator's presence.",
    },
    revocable_trust: {
      witnessCount: 0,
      notaryRequired: true,
      documentName: "Revocable Living Trust",
      minimumWitnessAge: 18,
      specialRequirements: "Maryland Trust Act governs.",
    },
    financial_poa: {
      witnessCount: 2,
      notaryRequired: true,
      notaryAlternative: false,
      documentName: "Power of Attorney",
      minimumWitnessAge: 18,
      specialRequirements:
        "Must be notarized and signed by two witnesses. Agent must sign acceptance before acting.",
    },
    healthcare_poa: {
      witnessCount: 2,
      notaryRequired: false,
      notaryAlternative: false,
      documentName: "Advance Directive",
      minimumWitnessAge: 18,
      specialRequirements: "Part of Maryland's combined Advance Directive form.",
    },
    advance_directive: {
      witnessCount: 2,
      notaryRequired: false,
      notaryAlternative: false,
      documentName: "Advance Directive",
      minimumWitnessAge: 18,
      specialRequirements:
        "Maryland combines healthcare agent appointment and living will in single Advance Directive.",
    },
  },

  // ---------------------------------------------------------------------------
  // MASSACHUSETTS
  // ---------------------------------------------------------------------------
  MA: {
    will: {
      witnessCount: 2,
      notaryRequired: false,
      notaryAlternative: false,
      selfProvingAllowed: true,
      minimumWitnessAge: 18,
      holographicAllowed: false,
      specialRequirements:
        "Testator must sign or acknowledge signature in presence of both witnesses who sign in each other's presence.",
    },
    revocable_trust: {
      witnessCount: 0,
      notaryRequired: true,
      documentName: "Revocable Living Trust",
      minimumWitnessAge: 18,
      specialRequirements: "Massachusetts Uniform Trust Code governs.",
    },
    financial_poa: {
      witnessCount: 0,
      notaryRequired: true,
      notaryAlternative: false,
      documentName: "Durable Power of Attorney",
      minimumWitnessAge: 18,
      specialRequirements: "Must be acknowledged before notary.",
    },
    healthcare_poa: {
      witnessCount: 2,
      notaryRequired: false,
      notaryAlternative: false,
      documentName: "Health Care Proxy",
      minimumWitnessAge: 18,
      specialRequirements:
        "Massachusetts calls it 'Health Care Proxy'. Witnesses cannot be the agent.",
    },
    advance_directive: {
      witnessCount: 2,
      notaryRequired: false,
      notaryAlternative: false,
      documentName: "Health Care Proxy",
      minimumWitnessAge: 18,
      specialRequirements:
        "Massachusetts does not have a traditional 'living will' statute. Health Care Proxy serves as primary directive.",
    },
  },

  // ---------------------------------------------------------------------------
  // MICHIGAN
  // ---------------------------------------------------------------------------
  MI: {
    will: {
      witnessCount: 2,
      notaryRequired: false,
      notaryAlternative: false,
      selfProvingAllowed: true,
      minimumWitnessAge: 18,
      holographicAllowed: true,
      specialRequirements:
        "Holographic wills valid if signature and material portions in testator's handwriting.",
    },
    revocable_trust: {
      witnessCount: 0,
      notaryRequired: true,
      documentName: "Revocable Living Trust",
      minimumWitnessAge: 18,
      specialRequirements: "Michigan Trust Code governs.",
    },
    financial_poa: {
      witnessCount: 0,
      notaryRequired: true,
      notaryAlternative: false,
      documentName: "Durable Power of Attorney",
      minimumWitnessAge: 18,
      specialRequirements: "Must be acknowledged before notary.",
    },
    healthcare_poa: {
      witnessCount: 2,
      notaryRequired: false,
      notaryAlternative: false,
      documentName: "Durable Power of Attorney for Health Care",
      minimumWitnessAge: 18,
      specialRequirements:
        "Witnesses cannot be patient's spouse, parent, child, grandchild, sibling, presumptive heir, known beneficiary, healthcare provider, or employee of healthcare facility.",
    },
    advance_directive: {
      witnessCount: 2,
      notaryRequired: false,
      notaryAlternative: false,
      documentName: "Advance Directive",
      minimumWitnessAge: 18,
      specialRequirements: "Michigan has specific witness restriction rules.",
    },
  },

  // ---------------------------------------------------------------------------
  // MINNESOTA
  // ---------------------------------------------------------------------------
  MN: {
    will: {
      witnessCount: 2,
      notaryRequired: false,
      notaryAlternative: false,
      selfProvingAllowed: true,
      minimumWitnessAge: 18,
      holographicAllowed: false,
      specialRequirements:
        "Witnesses must be competent. Self-proving affidavit requires notarization.",
    },
    revocable_trust: {
      witnessCount: 0,
      notaryRequired: true,
      documentName: "Revocable Living Trust",
      minimumWitnessAge: 18,
      specialRequirements: "Minnesota Trust Code governs.",
    },
    financial_poa: {
      witnessCount: 0,
      notaryRequired: true,
      notaryAlternative: false,
      documentName: "Statutory Short Form Power of Attorney",
      minimumWitnessAge: 18,
      specialRequirements:
        "Must be acknowledged before notary. Minnesota has statutory short form (Minn. Stat. 523.23).",
    },
    healthcare_poa: {
      witnessCount: 2,
      notaryRequired: false,
      notaryAlternative: true,
      documentName: "Health Care Directive",
      minimumWitnessAge: 18,
      specialRequirements:
        "May use notarization instead of witnesses. Part of combined Health Care Directive.",
    },
    advance_directive: {
      witnessCount: 2,
      notaryRequired: false,
      notaryAlternative: true,
      documentName: "Health Care Directive",
      minimumWitnessAge: 18,
      specialRequirements:
        "Minnesota combines healthcare agent and living will into single Health Care Directive.",
    },
  },

  // ---------------------------------------------------------------------------
  // MISSISSIPPI
  // ---------------------------------------------------------------------------
  MS: {
    will: {
      witnessCount: 2,
      notaryRequired: false,
      notaryAlternative: false,
      selfProvingAllowed: true,
      minimumWitnessAge: 18,
      holographicAllowed: true,
      specialRequirements:
        "Holographic wills must be entirely in testator's handwriting and signed. Must be proved by three credible witnesses to handwriting.",
    },
    revocable_trust: {
      witnessCount: 0,
      notaryRequired: true,
      documentName: "Revocable Living Trust",
      minimumWitnessAge: 18,
      specialRequirements: null,
    },
    financial_poa: {
      witnessCount: 0,
      notaryRequired: true,
      notaryAlternative: false,
      documentName: "Durable Power of Attorney",
      minimumWitnessAge: 21,
      specialRequirements: "Mississippi age of majority is 21. Must be acknowledged before notary.",
    },
    healthcare_poa: {
      witnessCount: 2,
      notaryRequired: false,
      notaryAlternative: false,
      documentName: "Health Care Power of Attorney",
      minimumWitnessAge: 18,
      specialRequirements: "Witnesses cannot be the agent.",
    },
    advance_directive: {
      witnessCount: 2,
      notaryRequired: false,
      notaryAlternative: false,
      documentName: "Advance Health-Care Directive",
      minimumWitnessAge: 18,
      specialRequirements: null,
    },
  },

  // ---------------------------------------------------------------------------
  // MISSOURI
  // ---------------------------------------------------------------------------
  MO: {
    will: {
      witnessCount: 2,
      notaryRequired: false,
      notaryAlternative: false,
      selfProvingAllowed: true,
      minimumWitnessAge: 18,
      holographicAllowed: false,
      specialRequirements: "Testator must sign at end of will in presence of both witnesses.",
    },
    revocable_trust: {
      witnessCount: 0,
      notaryRequired: true,
      documentName: "Revocable Living Trust",
      minimumWitnessAge: 18,
      specialRequirements: "Missouri Uniform Trust Code governs.",
    },
    financial_poa: {
      witnessCount: 0,
      notaryRequired: true,
      notaryAlternative: false,
      documentName: "Durable Power of Attorney",
      minimumWitnessAge: 18,
      specialRequirements: "Must be acknowledged before notary.",
    },
    healthcare_poa: {
      witnessCount: 0,
      notaryRequired: true,
      notaryAlternative: false,
      documentName: "Durable Power of Attorney for Health Care",
      minimumWitnessAge: 18,
      specialRequirements: "Must be notarized. Part of combined Health Care Directive.",
    },
    advance_directive: {
      witnessCount: 0,
      notaryRequired: true,
      notaryAlternative: false,
      documentName: "Declaration",
      minimumWitnessAge: 18,
      specialRequirements: "Missouri calls living will a 'Declaration'. Must be notarized.",
    },
  },

  // ---------------------------------------------------------------------------
  // MONTANA
  // ---------------------------------------------------------------------------
  MT: {
    will: {
      witnessCount: 2,
      notaryRequired: false,
      notaryAlternative: false,
      selfProvingAllowed: true,
      minimumWitnessAge: 18,
      holographicAllowed: true,
      specialRequirements:
        "Holographic wills valid if material portions and signature in testator's handwriting.",
    },
    revocable_trust: {
      witnessCount: 0,
      notaryRequired: true,
      documentName: "Revocable Living Trust",
      minimumWitnessAge: 18,
      specialRequirements: "Montana follows Uniform Trust Code.",
    },
    financial_poa: {
      witnessCount: 0,
      notaryRequired: true,
      notaryAlternative: false,
      documentName: "Durable Power of Attorney",
      minimumWitnessAge: 18,
      specialRequirements:
        "Must be acknowledged before notary. Montana follows Uniform Power of Attorney Act.",
    },
    healthcare_poa: {
      witnessCount: 2,
      notaryRequired: false,
      notaryAlternative: true,
      documentName: "Durable Power of Attorney for Health Care",
      minimumWitnessAge: 18,
      specialRequirements: null,
    },
    advance_directive: {
      witnessCount: 2,
      notaryRequired: false,
      notaryAlternative: true,
      documentName: "Declaration",
      minimumWitnessAge: 18,
      specialRequirements: "Montana calls living will a 'Declaration'.",
    },
  },

  // ---------------------------------------------------------------------------
  // NEBRASKA
  // ---------------------------------------------------------------------------
  NE: {
    will: {
      witnessCount: 2,
      notaryRequired: false,
      notaryAlternative: false,
      selfProvingAllowed: true,
      minimumWitnessAge: 18,
      holographicAllowed: true,
      specialRequirements:
        "Holographic wills valid if material portions and signature in testator's handwriting.",
    },
    revocable_trust: {
      witnessCount: 0,
      notaryRequired: true,
      documentName: "Revocable Living Trust",
      minimumWitnessAge: 18,
      specialRequirements: "Nebraska follows Uniform Trust Code.",
    },
    financial_poa: {
      witnessCount: 0,
      notaryRequired: true,
      notaryAlternative: false,
      documentName: "Durable Power of Attorney",
      minimumWitnessAge: 19,
      specialRequirements:
        "Nebraska age of majority is 19. Must be acknowledged before notary. Nebraska follows Uniform Power of Attorney Act.",
    },
    healthcare_poa: {
      witnessCount: 2,
      notaryRequired: false,
      notaryAlternative: true,
      documentName: "Durable Power of Attorney for Health Care",
      minimumWitnessAge: 19,
      specialRequirements: "Nebraska age of majority is 19.",
    },
    advance_directive: {
      witnessCount: 2,
      notaryRequired: false,
      notaryAlternative: true,
      documentName: "Declaration",
      minimumWitnessAge: 19,
      specialRequirements: "Nebraska calls living will a 'Declaration'.",
    },
  },

  // ---------------------------------------------------------------------------
  // NEVADA
  // ---------------------------------------------------------------------------
  NV: {
    will: {
      witnessCount: 2,
      notaryRequired: false,
      notaryAlternative: false,
      selfProvingAllowed: true,
      minimumWitnessAge: 18,
      holographicAllowed: true,
      specialRequirements:
        "Holographic wills valid if material provisions and signature in testator's handwriting.",
    },
    revocable_trust: {
      witnessCount: 0,
      notaryRequired: true,
      documentName: "Revocable Living Trust",
      minimumWitnessAge: 18,
      specialRequirements: "Nevada has favorable trust laws with strong asset protection.",
    },
    financial_poa: {
      witnessCount: 0,
      notaryRequired: true,
      notaryAlternative: false,
      documentName: "Durable Power of Attorney",
      minimumWitnessAge: 18,
      specialRequirements:
        "Must be acknowledged before notary. Nevada follows Uniform Power of Attorney Act.",
    },
    healthcare_poa: {
      witnessCount: 2,
      notaryRequired: false,
      notaryAlternative: true,
      documentName: "Durable Power of Attorney for Health Care Decisions",
      minimumWitnessAge: 18,
      specialRequirements:
        "Witnesses cannot be healthcare provider, operator of healthcare facility, or the agent.",
    },
    advance_directive: {
      witnessCount: 2,
      notaryRequired: false,
      notaryAlternative: true,
      documentName:
        "Declaration Governing the Withholding or Withdrawal of Life-Sustaining Treatment",
      minimumWitnessAge: 18,
      specialRequirements: "Nevada has specific statutory forms.",
    },
  },

  // ---------------------------------------------------------------------------
  // NEW HAMPSHIRE
  // ---------------------------------------------------------------------------
  NH: {
    will: {
      witnessCount: 2,
      notaryRequired: false,
      notaryAlternative: false,
      selfProvingAllowed: true,
      minimumWitnessAge: 18,
      holographicAllowed: false,
      specialRequirements: "Witnesses must be credible and sign in presence of testator.",
    },
    revocable_trust: {
      witnessCount: 0,
      notaryRequired: true,
      documentName: "Revocable Living Trust",
      minimumWitnessAge: 18,
      specialRequirements: "New Hampshire follows Uniform Trust Code.",
    },
    financial_poa: {
      witnessCount: 0,
      notaryRequired: true,
      notaryAlternative: false,
      documentName: "Durable Power of Attorney",
      minimumWitnessAge: 18,
      specialRequirements: "Must be acknowledged before notary.",
    },
    healthcare_poa: {
      witnessCount: 2,
      notaryRequired: false,
      notaryAlternative: true,
      documentName: "Durable Power of Attorney for Health Care",
      minimumWitnessAge: 18,
      specialRequirements: null,
    },
    advance_directive: {
      witnessCount: 2,
      notaryRequired: false,
      notaryAlternative: true,
      documentName: "Living Will",
      minimumWitnessAge: 18,
      specialRequirements: null,
    },
  },

  // ---------------------------------------------------------------------------
  // NEW JERSEY
  // ---------------------------------------------------------------------------
  NJ: {
    will: {
      witnessCount: 2,
      notaryRequired: false,
      notaryAlternative: false,
      selfProvingAllowed: true,
      minimumWitnessAge: 18,
      holographicAllowed: true,
      specialRequirements:
        "Holographic wills valid if material portions and signature in testator's handwriting. Self-proving affidavit requires notarization.",
    },
    revocable_trust: {
      witnessCount: 0,
      notaryRequired: true,
      documentName: "Revocable Living Trust",
      minimumWitnessAge: 18,
      specialRequirements: "New Jersey follows Uniform Trust Code.",
    },
    financial_poa: {
      witnessCount: 2,
      notaryRequired: true,
      notaryAlternative: false,
      documentName: "Durable Power of Attorney",
      minimumWitnessAge: 18,
      specialRequirements: "Must be notarized with two witnesses.",
    },
    healthcare_poa: {
      witnessCount: 2,
      notaryRequired: false,
      notaryAlternative: false,
      documentName: "Proxy Directive",
      minimumWitnessAge: 18,
      specialRequirements: "Part of New Jersey Advance Directive.",
    },
    advance_directive: {
      witnessCount: 2,
      notaryRequired: false,
      notaryAlternative: false,
      documentName: "Advance Directive for Health Care",
      minimumWitnessAge: 18,
      specialRequirements:
        "New Jersey combines proxy directive and instruction directive in single document.",
    },
  },

  // ---------------------------------------------------------------------------
  // NEW MEXICO
  // ---------------------------------------------------------------------------
  NM: {
    will: {
      witnessCount: 2,
      notaryRequired: false,
      notaryAlternative: false,
      selfProvingAllowed: true,
      minimumWitnessAge: 18,
      holographicAllowed: false,
      specialRequirements:
        "New Mexico is a community property state. Witnesses must sign in each other's presence.",
    },
    revocable_trust: {
      witnessCount: 0,
      notaryRequired: true,
      documentName: "Revocable Living Trust",
      minimumWitnessAge: 18,
      specialRequirements: "New Mexico follows Uniform Trust Code.",
    },
    financial_poa: {
      witnessCount: 0,
      notaryRequired: true,
      notaryAlternative: false,
      documentName: "Durable Power of Attorney",
      minimumWitnessAge: 18,
      specialRequirements:
        "Must be acknowledged before notary. New Mexico follows Uniform Power of Attorney Act.",
    },
    healthcare_poa: {
      witnessCount: 0,
      notaryRequired: true,
      notaryAlternative: false,
      documentName: "Durable Power of Attorney for Health Care",
      minimumWitnessAge: 18,
      specialRequirements:
        "Must be notarized. Part of combined Optional Advance Health-Care Directive form.",
    },
    advance_directive: {
      witnessCount: 0,
      notaryRequired: true,
      notaryAlternative: false,
      documentName: "Optional Advance Health-Care Directive",
      minimumWitnessAge: 18,
      specialRequirements: "New Mexico uses combined form. Notarization required.",
    },
  },

  // ---------------------------------------------------------------------------
  // NEW YORK
  // ---------------------------------------------------------------------------
  NY: {
    will: {
      witnessCount: 2,
      notaryRequired: false,
      notaryAlternative: false,
      selfProvingAllowed: true,
      minimumWitnessAge: 18,
      holographicAllowed: false,
      specialRequirements:
        "Holographic wills only valid for military personnel and mariners. Testator must declare to witnesses that document is will. Witnesses must sign within 30 days.",
    },
    revocable_trust: {
      witnessCount: 0,
      notaryRequired: true,
      documentName: "Revocable Living Trust",
      minimumWitnessAge: 18,
      specialRequirements: "New York EPTL governs trusts.",
    },
    financial_poa: {
      witnessCount: 2,
      notaryRequired: true,
      notaryAlternative: false,
      documentName: "Statutory Short Form Power of Attorney",
      minimumWitnessAge: 18,
      specialRequirements:
        "Must use statutory short form or substantially similar form. Requires notarization and two witnesses. Agent must sign before notary to accept.",
    },
    healthcare_poa: {
      witnessCount: 2,
      notaryRequired: false,
      notaryAlternative: false,
      documentName: "Health Care Proxy",
      minimumWitnessAge: 18,
      specialRequirements:
        "New York calls it Health Care Proxy. Witnesses cannot be the agent. Agent cannot sign as witness.",
    },
    advance_directive: {
      witnessCount: 2,
      notaryRequired: false,
      notaryAlternative: false,
      documentName: "Health Care Proxy",
      minimumWitnessAge: 18,
      specialRequirements:
        "New York does not have a separate living will statute. Health Care Proxy can include treatment preferences.",
    },
  },

  // ---------------------------------------------------------------------------
  // NORTH CAROLINA
  // ---------------------------------------------------------------------------
  NC: {
    will: {
      witnessCount: 2,
      notaryRequired: false,
      notaryAlternative: false,
      selfProvingAllowed: true,
      minimumWitnessAge: 18,
      holographicAllowed: true,
      specialRequirements:
        "Holographic wills must be entirely in testator's handwriting, signed, and found among valuable papers or in safe deposit box.",
    },
    revocable_trust: {
      witnessCount: 0,
      notaryRequired: true,
      documentName: "Revocable Living Trust",
      minimumWitnessAge: 18,
      specialRequirements: "North Carolina follows Uniform Trust Code.",
    },
    financial_poa: {
      witnessCount: 0,
      notaryRequired: true,
      notaryAlternative: false,
      documentName: "Durable Power of Attorney",
      minimumWitnessAge: 18,
      specialRequirements:
        "Must be acknowledged before notary. Statutory short form available under N.C.G.S. 32C.",
    },
    healthcare_poa: {
      witnessCount: 2,
      notaryRequired: false,
      notaryAlternative: true,
      documentName: "Health Care Power of Attorney",
      minimumWitnessAge: 18,
      specialRequirements:
        "Witnesses cannot be healthcare provider or employee of healthcare facility. Notarization can replace witnesses.",
    },
    advance_directive: {
      witnessCount: 2,
      notaryRequired: false,
      notaryAlternative: true,
      documentName: "Advance Directive for a Natural Death",
      minimumWitnessAge: 18,
      specialRequirements:
        "North Carolina calls living will an 'Advance Directive for a Natural Death'. One witness must not be relative, heir, or healthcare provider.",
    },
  },

  // ---------------------------------------------------------------------------
  // NORTH DAKOTA
  // ---------------------------------------------------------------------------
  ND: {
    will: {
      witnessCount: 2,
      notaryRequired: false,
      notaryAlternative: false,
      selfProvingAllowed: true,
      minimumWitnessAge: 18,
      holographicAllowed: true,
      specialRequirements:
        "Holographic wills valid if material portions and signature in testator's handwriting.",
    },
    revocable_trust: {
      witnessCount: 0,
      notaryRequired: true,
      documentName: "Revocable Living Trust",
      minimumWitnessAge: 18,
      specialRequirements: "North Dakota follows Uniform Trust Code.",
    },
    financial_poa: {
      witnessCount: 0,
      notaryRequired: true,
      notaryAlternative: false,
      documentName: "Durable Power of Attorney",
      minimumWitnessAge: 18,
      specialRequirements:
        "Must be acknowledged before notary. North Dakota follows Uniform Power of Attorney Act.",
    },
    healthcare_poa: {
      witnessCount: 2,
      notaryRequired: false,
      notaryAlternative: true,
      documentName: "Durable Power of Attorney for Health Care",
      minimumWitnessAge: 18,
      specialRequirements: null,
    },
    advance_directive: {
      witnessCount: 2,
      notaryRequired: false,
      notaryAlternative: true,
      documentName: "Health Care Directive",
      minimumWitnessAge: 18,
      specialRequirements: "North Dakota uses combined Health Care Directive form.",
    },
  },

  // ---------------------------------------------------------------------------
  // OHIO
  // ---------------------------------------------------------------------------
  OH: {
    will: {
      witnessCount: 2,
      notaryRequired: false,
      notaryAlternative: false,
      selfProvingAllowed: true,
      minimumWitnessAge: 18,
      holographicAllowed: false,
      specialRequirements:
        "Testator must sign at end of will. Witnesses must sign in presence of testator.",
    },
    revocable_trust: {
      witnessCount: 0,
      notaryRequired: true,
      documentName: "Revocable Living Trust",
      minimumWitnessAge: 18,
      specialRequirements: "Ohio Trust Code governs.",
    },
    financial_poa: {
      witnessCount: 0,
      notaryRequired: true,
      notaryAlternative: false,
      documentName: "Durable Power of Attorney",
      minimumWitnessAge: 18,
      specialRequirements:
        "Must be acknowledged before notary. Statutory form available under Ohio Revised Code 1337.60.",
    },
    healthcare_poa: {
      witnessCount: 2,
      notaryRequired: false,
      notaryAlternative: true,
      documentName: "Health Care Power of Attorney",
      minimumWitnessAge: 18,
      specialRequirements:
        "Witnesses cannot be agent, attending physician, or administrator of nursing home.",
    },
    advance_directive: {
      witnessCount: 2,
      notaryRequired: false,
      notaryAlternative: true,
      documentName: "Living Will Declaration",
      minimumWitnessAge: 18,
      specialRequirements: "Ohio has specific statutory form.",
    },
  },

  // ---------------------------------------------------------------------------
  // OKLAHOMA
  // ---------------------------------------------------------------------------
  OK: {
    will: {
      witnessCount: 2,
      notaryRequired: false,
      notaryAlternative: false,
      selfProvingAllowed: true,
      minimumWitnessAge: 18,
      holographicAllowed: true,
      specialRequirements:
        "Holographic wills must be entirely in testator's handwriting. No witnesses required for holographic wills.",
    },
    revocable_trust: {
      witnessCount: 0,
      notaryRequired: true,
      documentName: "Revocable Living Trust",
      minimumWitnessAge: 18,
      specialRequirements: "Oklahoma Trust Act governs.",
    },
    financial_poa: {
      witnessCount: 0,
      notaryRequired: true,
      notaryAlternative: false,
      documentName: "Durable Power of Attorney",
      minimumWitnessAge: 18,
      specialRequirements: "Must be acknowledged before notary.",
    },
    healthcare_poa: {
      witnessCount: 2,
      notaryRequired: false,
      notaryAlternative: false,
      documentName: "Durable Power of Attorney for Health Care",
      minimumWitnessAge: 18,
      specialRequirements: "Witnesses cannot be the agent.",
    },
    advance_directive: {
      witnessCount: 2,
      notaryRequired: false,
      notaryAlternative: false,
      documentName: "Advance Directive for Health Care",
      minimumWitnessAge: 18,
      specialRequirements: null,
    },
  },

  // ---------------------------------------------------------------------------
  // OREGON
  // ---------------------------------------------------------------------------
  OR: {
    will: {
      witnessCount: 2,
      notaryRequired: false,
      notaryAlternative: false,
      selfProvingAllowed: true,
      minimumWitnessAge: 18,
      holographicAllowed: false,
      specialRequirements: "Testator and witnesses should all sign in presence of each other.",
    },
    revocable_trust: {
      witnessCount: 0,
      notaryRequired: true,
      documentName: "Revocable Living Trust",
      minimumWitnessAge: 18,
      specialRequirements: "Oregon follows Uniform Trust Code.",
    },
    financial_poa: {
      witnessCount: 0,
      notaryRequired: true,
      notaryAlternative: false,
      documentName: "Durable Power of Attorney",
      minimumWitnessAge: 18,
      specialRequirements:
        "Must be acknowledged before notary. Oregon follows Uniform Power of Attorney Act.",
    },
    healthcare_poa: {
      witnessCount: 2,
      notaryRequired: false,
      notaryAlternative: true,
      documentName: "Appointment of Health Care Representative",
      minimumWitnessAge: 18,
      specialRequirements: "Part of Oregon Advance Directive form.",
    },
    advance_directive: {
      witnessCount: 2,
      notaryRequired: false,
      notaryAlternative: true,
      documentName: "Advance Directive",
      minimumWitnessAge: 18,
      specialRequirements:
        "Oregon uses combined Advance Directive form with specific statutory requirements.",
    },
  },

  // ---------------------------------------------------------------------------
  // PENNSYLVANIA
  // ---------------------------------------------------------------------------
  PA: {
    will: {
      witnessCount: 2,
      notaryRequired: false,
      notaryAlternative: false,
      selfProvingAllowed: true,
      minimumWitnessAge: 18,
      holographicAllowed: true,
      specialRequirements:
        "Holographic wills valid. Must be signed at the end. Witnesses recommend but not strictly required for non-holographic wills (signing is key requirement).",
    },
    revocable_trust: {
      witnessCount: 0,
      notaryRequired: true,
      documentName: "Revocable Living Trust",
      minimumWitnessAge: 18,
      specialRequirements: "Pennsylvania Trust Act governs.",
    },
    financial_poa: {
      witnessCount: 2,
      notaryRequired: true,
      notaryAlternative: false,
      documentName: "Durable Financial Power of Attorney",
      minimumWitnessAge: 18,
      specialRequirements:
        "Must be notarized and signed by two witnesses. Statutory form available (20 Pa. C.S. 5601).",
    },
    healthcare_poa: {
      witnessCount: 2,
      notaryRequired: false,
      notaryAlternative: false,
      documentName: "Health Care Power of Attorney",
      minimumWitnessAge: 18,
      specialRequirements: "Witnesses cannot be the agent.",
    },
    advance_directive: {
      witnessCount: 2,
      notaryRequired: false,
      notaryAlternative: false,
      documentName: "Living Will",
      minimumWitnessAge: 18,
      specialRequirements: "Part of Pennsylvania's combined Advance Health Care Directive.",
    },
  },

  // ---------------------------------------------------------------------------
  // RHODE ISLAND
  // ---------------------------------------------------------------------------
  RI: {
    will: {
      witnessCount: 2,
      notaryRequired: false,
      notaryAlternative: false,
      selfProvingAllowed: true,
      minimumWitnessAge: 18,
      holographicAllowed: false,
      specialRequirements:
        "Testator must sign in presence of witnesses. Witnesses must sign in presence of testator.",
    },
    revocable_trust: {
      witnessCount: 0,
      notaryRequired: true,
      documentName: "Revocable Living Trust",
      minimumWitnessAge: 18,
      specialRequirements: null,
    },
    financial_poa: {
      witnessCount: 0,
      notaryRequired: true,
      notaryAlternative: false,
      documentName: "Durable Power of Attorney",
      minimumWitnessAge: 18,
      specialRequirements: "Must be acknowledged before notary.",
    },
    healthcare_poa: {
      witnessCount: 2,
      notaryRequired: false,
      notaryAlternative: false,
      documentName: "Durable Power of Attorney for Health Care",
      minimumWitnessAge: 18,
      specialRequirements: null,
    },
    advance_directive: {
      witnessCount: 2,
      notaryRequired: false,
      notaryAlternative: false,
      documentName: "Declaration",
      minimumWitnessAge: 18,
      specialRequirements:
        "Rhode Island calls living will a 'Declaration'. Witnesses cannot be related or financially interested.",
    },
  },

  // ---------------------------------------------------------------------------
  // SOUTH CAROLINA
  // ---------------------------------------------------------------------------
  SC: {
    will: {
      witnessCount: 3,
      notaryRequired: false,
      notaryAlternative: false,
      selfProvingAllowed: true,
      minimumWitnessAge: 18,
      holographicAllowed: false,
      specialRequirements:
        "South Carolina requires THREE witnesses, unlike most states. All must sign in presence of testator.",
    },
    revocable_trust: {
      witnessCount: 0,
      notaryRequired: true,
      documentName: "Revocable Living Trust",
      minimumWitnessAge: 18,
      specialRequirements: "South Carolina Trust Code governs.",
    },
    financial_poa: {
      witnessCount: 0,
      notaryRequired: true,
      notaryAlternative: false,
      documentName: "Durable Power of Attorney",
      minimumWitnessAge: 18,
      specialRequirements:
        "Must be acknowledged before notary. South Carolina follows Uniform Power of Attorney Act.",
    },
    healthcare_poa: {
      witnessCount: 2,
      notaryRequired: false,
      notaryAlternative: true,
      documentName: "Health Care Power of Attorney",
      minimumWitnessAge: 18,
      specialRequirements: "Part of combined Advance Health Care Directive.",
    },
    advance_directive: {
      witnessCount: 2,
      notaryRequired: false,
      notaryAlternative: true,
      documentName: "Declaration of a Desire for a Natural Death",
      minimumWitnessAge: 18,
      specialRequirements: "South Carolina uses specific statutory form.",
    },
  },

  // ---------------------------------------------------------------------------
  // SOUTH DAKOTA
  // ---------------------------------------------------------------------------
  SD: {
    will: {
      witnessCount: 2,
      notaryRequired: false,
      notaryAlternative: false,
      selfProvingAllowed: true,
      minimumWitnessAge: 18,
      holographicAllowed: true,
      specialRequirements:
        "Holographic wills valid if material portions and signature in testator's handwriting.",
    },
    revocable_trust: {
      witnessCount: 0,
      notaryRequired: true,
      documentName: "Revocable Living Trust",
      minimumWitnessAge: 18,
      specialRequirements:
        "South Dakota has favorable trust laws with strong asset protection and dynasty trust provisions.",
    },
    financial_poa: {
      witnessCount: 0,
      notaryRequired: true,
      notaryAlternative: false,
      documentName: "Durable Power of Attorney",
      minimumWitnessAge: 18,
      specialRequirements:
        "Must be acknowledged before notary. South Dakota follows Uniform Power of Attorney Act.",
    },
    healthcare_poa: {
      witnessCount: 2,
      notaryRequired: false,
      notaryAlternative: true,
      documentName: "Durable Power of Attorney for Health Care",
      minimumWitnessAge: 18,
      specialRequirements: null,
    },
    advance_directive: {
      witnessCount: 2,
      notaryRequired: false,
      notaryAlternative: true,
      documentName: "Living Will Declaration",
      minimumWitnessAge: 18,
      specialRequirements: null,
    },
  },

  // ---------------------------------------------------------------------------
  // TENNESSEE
  // ---------------------------------------------------------------------------
  TN: {
    will: {
      witnessCount: 2,
      notaryRequired: false,
      notaryAlternative: false,
      selfProvingAllowed: true,
      minimumWitnessAge: 18,
      holographicAllowed: true,
      specialRequirements:
        "Holographic wills must be entirely in testator's handwriting and signed. Must be proved by two witnesses to handwriting.",
    },
    revocable_trust: {
      witnessCount: 0,
      notaryRequired: true,
      documentName: "Revocable Living Trust",
      minimumWitnessAge: 18,
      specialRequirements: "Tennessee Investment Services Act governs trusts.",
    },
    financial_poa: {
      witnessCount: 0,
      notaryRequired: true,
      notaryAlternative: false,
      documentName: "Durable Power of Attorney",
      minimumWitnessAge: 18,
      specialRequirements:
        "Must be acknowledged before notary. Tennessee follows Uniform Power of Attorney Act.",
    },
    healthcare_poa: {
      witnessCount: 2,
      notaryRequired: false,
      notaryAlternative: true,
      documentName: "Durable Power of Attorney for Health Care",
      minimumWitnessAge: 18,
      specialRequirements: "Part of combined Advance Care Plan.",
    },
    advance_directive: {
      witnessCount: 2,
      notaryRequired: false,
      notaryAlternative: true,
      documentName: "Advance Care Plan",
      minimumWitnessAge: 18,
      specialRequirements: "Tennessee uses combined Advance Care Plan form.",
    },
  },

  // ---------------------------------------------------------------------------
  // TEXAS
  // ---------------------------------------------------------------------------
  TX: {
    will: {
      witnessCount: 2,
      notaryRequired: false,
      notaryAlternative: false,
      selfProvingAllowed: true,
      minimumWitnessAge: 14,
      holographicAllowed: true,
      specialRequirements:
        "Texas allows witnesses as young as 14. Holographic wills must be entirely in testator's handwriting. Texas is community property state.",
    },
    revocable_trust: {
      witnessCount: 0,
      notaryRequired: true,
      documentName: "Revocable Living Trust",
      minimumWitnessAge: 18,
      specialRequirements: "Texas Trust Code governs. Community property considerations apply.",
    },
    financial_poa: {
      witnessCount: 0,
      notaryRequired: true,
      notaryAlternative: false,
      documentName: "Statutory Durable Power of Attorney",
      minimumWitnessAge: 18,
      specialRequirements:
        "Must be acknowledged before notary. Texas has specific statutory form (Estates Code Ch. 752).",
    },
    healthcare_poa: {
      witnessCount: 2,
      notaryRequired: false,
      notaryAlternative: false,
      documentName: "Medical Power of Attorney",
      minimumWitnessAge: 18,
      specialRequirements:
        "Witnesses cannot be agent, healthcare provider employee, or residential care employee. One witness cannot be related, employee of principal, or heir.",
    },
    advance_directive: {
      witnessCount: 2,
      notaryRequired: false,
      notaryAlternative: false,
      documentName: "Directive to Physicians and Family or Surrogates",
      minimumWitnessAge: 18,
      specialRequirements:
        "Texas uses specific statutory form. Texas has Out-of-Hospital DNR form as separate document.",
    },
  },

  // ---------------------------------------------------------------------------
  // UTAH
  // ---------------------------------------------------------------------------
  UT: {
    will: {
      witnessCount: 2,
      notaryRequired: false,
      notaryAlternative: false,
      selfProvingAllowed: true,
      minimumWitnessAge: 18,
      holographicAllowed: true,
      specialRequirements:
        "Holographic wills valid if material portions and signature in testator's handwriting.",
    },
    revocable_trust: {
      witnessCount: 0,
      notaryRequired: true,
      documentName: "Revocable Living Trust",
      minimumWitnessAge: 18,
      specialRequirements: "Utah follows Uniform Trust Code.",
    },
    financial_poa: {
      witnessCount: 0,
      notaryRequired: true,
      notaryAlternative: false,
      documentName: "Durable Power of Attorney",
      minimumWitnessAge: 18,
      specialRequirements:
        "Must be acknowledged before notary. Utah follows Uniform Power of Attorney Act.",
    },
    healthcare_poa: {
      witnessCount: 0,
      notaryRequired: true,
      notaryAlternative: false,
      documentName: "Health Care Power of Attorney",
      minimumWitnessAge: 18,
      specialRequirements: "Must be notarized. Part of combined Advance Health Care Directive.",
    },
    advance_directive: {
      witnessCount: 0,
      notaryRequired: true,
      notaryAlternative: false,
      documentName: "Advance Health Care Directive",
      minimumWitnessAge: 18,
      specialRequirements: "Utah uses combined directive. Notarization required.",
    },
  },

  // ---------------------------------------------------------------------------
  // VERMONT
  // ---------------------------------------------------------------------------
  VT: {
    will: {
      witnessCount: 2,
      notaryRequired: false,
      notaryAlternative: false,
      selfProvingAllowed: true,
      minimumWitnessAge: 18,
      holographicAllowed: false,
      specialRequirements: "Witnesses must be credible.",
    },
    revocable_trust: {
      witnessCount: 0,
      notaryRequired: true,
      documentName: "Revocable Living Trust",
      minimumWitnessAge: 18,
      specialRequirements: "Vermont follows Uniform Trust Code.",
    },
    financial_poa: {
      witnessCount: 0,
      notaryRequired: true,
      notaryAlternative: false,
      documentName: "Durable Power of Attorney",
      minimumWitnessAge: 18,
      specialRequirements:
        "Must be acknowledged before notary. Vermont follows Uniform Power of Attorney Act.",
    },
    healthcare_poa: {
      witnessCount: 2,
      notaryRequired: false,
      notaryAlternative: false,
      documentName: "Durable Power of Attorney for Health Care",
      minimumWitnessAge: 18,
      specialRequirements: null,
    },
    advance_directive: {
      witnessCount: 2,
      notaryRequired: false,
      notaryAlternative: false,
      documentName: "Advance Directive",
      minimumWitnessAge: 18,
      specialRequirements: "Vermont uses combined Advance Directive form.",
    },
  },

  // ---------------------------------------------------------------------------
  // VIRGINIA
  // ---------------------------------------------------------------------------
  VA: {
    will: {
      witnessCount: 2,
      notaryRequired: false,
      notaryAlternative: false,
      selfProvingAllowed: true,
      minimumWitnessAge: 18,
      holographicAllowed: true,
      specialRequirements:
        "Holographic wills must be entirely in testator's handwriting and signed. Must be proved by two disinterested witnesses.",
    },
    revocable_trust: {
      witnessCount: 0,
      notaryRequired: true,
      documentName: "Revocable Living Trust",
      minimumWitnessAge: 18,
      specialRequirements: "Virginia Uniform Trust Code governs.",
    },
    financial_poa: {
      witnessCount: 0,
      notaryRequired: true,
      notaryAlternative: false,
      documentName: "Durable Power of Attorney",
      minimumWitnessAge: 18,
      specialRequirements:
        "Must be acknowledged before notary. Virginia follows Uniform Power of Attorney Act.",
    },
    healthcare_poa: {
      witnessCount: 2,
      notaryRequired: false,
      notaryAlternative: false,
      documentName: "Health Care Power of Attorney",
      minimumWitnessAge: 18,
      specialRequirements: null,
    },
    advance_directive: {
      witnessCount: 2,
      notaryRequired: false,
      notaryAlternative: false,
      documentName: "Advance Directive",
      minimumWitnessAge: 18,
      specialRequirements: "Virginia uses combined Advance Directive form.",
    },
  },

  // ---------------------------------------------------------------------------
  // WASHINGTON
  // ---------------------------------------------------------------------------
  WA: {
    will: {
      witnessCount: 2,
      notaryRequired: false,
      notaryAlternative: false,
      selfProvingAllowed: true,
      minimumWitnessAge: 18,
      holographicAllowed: false,
      specialRequirements:
        "Washington is community property state. Witnesses should be competent adults.",
    },
    revocable_trust: {
      witnessCount: 0,
      notaryRequired: true,
      documentName: "Revocable Living Trust",
      minimumWitnessAge: 18,
      specialRequirements: "Washington Trust Act governs. Community property considerations apply.",
    },
    financial_poa: {
      witnessCount: 0,
      notaryRequired: true,
      notaryAlternative: false,
      documentName: "Durable Power of Attorney",
      minimumWitnessAge: 18,
      specialRequirements:
        "Must be acknowledged before notary. Washington follows Uniform Power of Attorney Act.",
    },
    healthcare_poa: {
      witnessCount: 2,
      notaryRequired: false,
      notaryAlternative: false,
      documentName: "Durable Power of Attorney for Health Care",
      minimumWitnessAge: 18,
      specialRequirements: "Part of combined Health Care Directive.",
    },
    advance_directive: {
      witnessCount: 2,
      notaryRequired: false,
      notaryAlternative: false,
      documentName: "Health Care Directive",
      minimumWitnessAge: 18,
      specialRequirements: "Washington uses combined Health Care Directive form.",
    },
  },

  // ---------------------------------------------------------------------------
  // WEST VIRGINIA
  // ---------------------------------------------------------------------------
  WV: {
    will: {
      witnessCount: 2,
      notaryRequired: false,
      notaryAlternative: false,
      selfProvingAllowed: true,
      minimumWitnessAge: 18,
      holographicAllowed: true,
      specialRequirements: "Holographic wills valid if entirely in testator's handwriting.",
    },
    revocable_trust: {
      witnessCount: 0,
      notaryRequired: true,
      documentName: "Revocable Living Trust",
      minimumWitnessAge: 18,
      specialRequirements: "West Virginia follows Uniform Trust Code.",
    },
    financial_poa: {
      witnessCount: 0,
      notaryRequired: true,
      notaryAlternative: false,
      documentName: "Durable Power of Attorney",
      minimumWitnessAge: 18,
      specialRequirements:
        "Must be acknowledged before notary. West Virginia follows Uniform Power of Attorney Act.",
    },
    healthcare_poa: {
      witnessCount: 2,
      notaryRequired: false,
      notaryAlternative: true,
      documentName: "Medical Power of Attorney",
      minimumWitnessAge: 18,
      specialRequirements: "Part of combined Medical Power of Attorney form.",
    },
    advance_directive: {
      witnessCount: 2,
      notaryRequired: false,
      notaryAlternative: true,
      documentName: "Living Will",
      minimumWitnessAge: 18,
      specialRequirements: null,
    },
  },

  // ---------------------------------------------------------------------------
  // WISCONSIN
  // ---------------------------------------------------------------------------
  WI: {
    will: {
      witnessCount: 2,
      notaryRequired: false,
      notaryAlternative: false,
      selfProvingAllowed: true,
      minimumWitnessAge: 18,
      holographicAllowed: false,
      specialRequirements:
        "Wisconsin is marital property state (similar to community property). Witnesses should be competent adults.",
    },
    revocable_trust: {
      witnessCount: 0,
      notaryRequired: true,
      documentName: "Revocable Living Trust",
      minimumWitnessAge: 18,
      specialRequirements: "Wisconsin Trust Code governs. Marital property considerations apply.",
    },
    financial_poa: {
      witnessCount: 0,
      notaryRequired: true,
      notaryAlternative: false,
      documentName: "Power of Attorney for Finances and Property",
      minimumWitnessAge: 18,
      specialRequirements: "Must be acknowledged before notary. Wisconsin has statutory form.",
    },
    healthcare_poa: {
      witnessCount: 2,
      notaryRequired: false,
      notaryAlternative: false,
      documentName: "Power of Attorney for Health Care",
      minimumWitnessAge: 18,
      specialRequirements:
        "Wisconsin has specific statutory form. Witnesses cannot be healthcare provider, agent's spouse, or related to patient.",
    },
    advance_directive: {
      witnessCount: 2,
      notaryRequired: false,
      notaryAlternative: false,
      documentName: "Declaration to Physicians",
      minimumWitnessAge: 18,
      specialRequirements:
        "Wisconsin calls living will a 'Declaration to Physicians' (Living Will).",
    },
  },

  // ---------------------------------------------------------------------------
  // WYOMING
  // ---------------------------------------------------------------------------
  WY: {
    will: {
      witnessCount: 2,
      notaryRequired: false,
      notaryAlternative: false,
      selfProvingAllowed: true,
      minimumWitnessAge: 18,
      holographicAllowed: true,
      specialRequirements:
        "Holographic wills valid if material portions and signature in testator's handwriting.",
    },
    revocable_trust: {
      witnessCount: 0,
      notaryRequired: true,
      documentName: "Revocable Living Trust",
      minimumWitnessAge: 18,
      specialRequirements: "Wyoming follows Uniform Trust Code.",
    },
    financial_poa: {
      witnessCount: 0,
      notaryRequired: true,
      notaryAlternative: false,
      documentName: "Durable Power of Attorney",
      minimumWitnessAge: 18,
      specialRequirements:
        "Must be acknowledged before notary. Wyoming follows Uniform Power of Attorney Act.",
    },
    healthcare_poa: {
      witnessCount: 2,
      notaryRequired: false,
      notaryAlternative: true,
      documentName: "Durable Power of Attorney for Health Care",
      minimumWitnessAge: 18,
      specialRequirements: null,
    },
    advance_directive: {
      witnessCount: 2,
      notaryRequired: false,
      notaryAlternative: true,
      documentName: "Living Will",
      minimumWitnessAge: 18,
      specialRequirements: null,
    },
  },
} as const;

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

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
 * Get community property states
 * These states have special rules for married couples
 */
export const COMMUNITY_PROPERTY_STATES: readonly USState[] = [
  "AZ",
  "CA",
  "ID",
  "LA",
  "NV",
  "NM",
  "TX",
  "WA",
  "WI",
] as const;

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
 * Validate that a document meets minimum state requirements
 */
export interface DocumentValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

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
 * Translates legal terms to plain English for regular folks.
 * Keeps the accuracy but makes it understandable.
 */
const LEGAL_TO_PLAIN: Record<string, string> = {
  // Common legal terms
  testator: "the person signing the will",
  "the testator": "you (the person signing the will)",
  principal: "you (the person creating this document)",
  "the principal": "you",
  beneficiary: "person receiving something in your will",
  beneficiaries: "people named to receive things",
  disinterested: "not receiving anything in the will",
  "disinterested witnesses": "witnesses who aren't named to receive anything",
  "competent witnesses": "witnesses who are mentally capable adults",
  notarization: "having a notary public witness your signature",
  notarized: "witnessed by a notary public",
  "acknowledged before a notary": "signed in front of a notary public",
  "self-proving affidavit":
    "a notarized statement that makes the will easier to process (no need to track down witnesses later)",
  holographic: "handwritten",
  "holographic will": "a will written entirely in your own handwriting",
  "age of majority": "the age when you're legally an adult",
  "statutory form": "an official state-approved template",
  "health care proxy": "the person you choose to make medical decisions for you",
  "health care agent": "the person you choose to make medical decisions for you",
  "attorney-in-fact": "the person you trust to handle your finances",
  agent: "the person you're giving authority to",
  "entitled to any portion of estate": "named to receive anything when you pass away",
  "related by blood, marriage, or adoption": "family members",
  "operator of a health care facility": "someone who runs a hospital or nursing home",
  "health care provider": "your doctor, nurse, or other medical professional",
  intestate: "without a valid will",
  executor: "the person who will carry out your wishes",
  grantor: "you (the person creating the trust)",
  trustee: "the person managing the trust",
  "pour-over": "automatically transfers remaining assets into your trust",
};

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

// =============================================================================
// DISCLAIMER
// =============================================================================

export const LEGAL_DISCLAIMER = `
IMPORTANT LEGAL DISCLAIMER:

This information is provided for educational and informational purposes only
and does not constitute legal advice. Laws vary by state and change frequently.

You should:
1. Consult with a qualified attorney licensed in your state
2. Verify all requirements are current before relying on this information
3. Consider your specific circumstances which may require additional provisions

This data was compiled from publicly available sources and represents general
requirements as of January 2025. Specific situations may have additional
requirements or exceptions not covered here.

Pathible and its affiliates assume no responsibility for the accuracy,
completeness, or timeliness of this information.
` as const;
