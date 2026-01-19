/**
 * Basic State Legal Requirements Data
 *
 * This module contains the STATE_LEGAL_REQUIREMENTS constant with
 * data for all 50 US states plus DC.
 *
 * DISCLAIMER: This is a template for informational purposes only.
 * Consult with a qualified attorney for legal advice specific to your situation.
 *
 * Last updated: January 2025
 */

import type { StateLegalRequirements, USState } from "./types";

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
