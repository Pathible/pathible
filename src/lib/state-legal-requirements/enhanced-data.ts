/**
 * Enhanced State Legal Requirements Data
 *
 * This module contains the ENHANCED_STATE_REQUIREMENTS constant with
 * detailed properties for select states. More states will be added over time.
 *
 * DISCLAIMER: This is a template for informational purposes only.
 * Consult with a qualified attorney for legal advice specific to your situation.
 *
 * Last updated: January 2025
 */

import type { EnhancedStateLegalRequirements, USState } from "./types";

// =============================================================================
// ENHANCED STATE REQUIREMENTS
// =============================================================================

/**
 * Enhanced state requirements with detailed properties
 * Starting with California, Texas, and Florida - expand to all states over time
 */
export const ENHANCED_STATE_REQUIREMENTS: Partial<Record<USState, EnhancedStateLegalRequirements>> =
  {
    CA: {
      will: {
        // Base requirements
        witnessCount: 2,
        notaryRequired: false,
        notaryAlternative: false,
        selfProvingAllowed: true,
        minimumWitnessAge: 18,
        holographicAllowed: true,
        specialRequirements:
          "Holographic wills valid if material provisions, date, and signature in testator's handwriting. California Probate Code §6110-6113.",
        // Enhanced properties
        witnessRestrictions: {
          beneficiaryCanWitness: true,
          beneficiaryWitnessConsequence: "void_bequest",
          familyCanWitness: true,
          healthcareProviderCanWitness: true,
          facilityEmployeeCanWitness: true,
          additionalRestrictions:
            "Under Cal. Probate Code §6112, a beneficiary-witness creates a presumption of undue influence. The bequest may be void unless there are two other disinterested witnesses.",
        },
        noContestClauseEnforceable: true,
        noContestLimitations:
          "Enforceable unless beneficiary has probable cause for contest. Cal. Probate Code §21311.",
        defaultSurvivalPeriod: 120, // California uses 120 hours (5 days) under simultaneous death
        rufadaaAdopted: true,
        communityPropertyState: true,
      },
      revocable_trust: {
        witnessCount: 0,
        notaryRequired: true,
        documentName: "Revocable Living Trust",
        minimumWitnessAge: 18,
        specialRequirements:
          "California Trust Law: Cal. Probate Code §§15000-19403. Certificate of Trust recognized under §18100.5.",
        // Enhanced
        certificateOfTrustRecognized: true,
        pourOverWillRequirements:
          "Pour-over will recommended to capture assets not transferred to trust during lifetime.",
        trustCodeReference: "Cal. Probate Code §§15000-19403",
      },
      financial_poa: {
        witnessCount: 0,
        notaryRequired: true,
        notaryAlternative: false,
        documentName: "Durable Power of Attorney for Asset Management",
        minimumWitnessAge: 18,
        specialRequirements:
          "California Uniform Durable Power of Attorney Act: Cal. Probate Code §§4120-4545. Statutory form available.",
        // Enhanced
        upoaaAdopted: true,
        witnessRestrictions: {
          beneficiaryCanWitness: true,
          beneficiaryWitnessConsequence: null,
          familyCanWitness: true,
          healthcareProviderCanWitness: true,
          facilityEmployeeCanWitness: true,
          additionalRestrictions: null,
        },
        agentAcceptanceRecommended: true,
        thirdPartyRelianceStatutory: true,
        explicitGrantRequired: [
          "gift_making",
          "trust_modification",
          "beneficiary_designation_changes",
          "delegation",
        ],
      },
      healthcare_poa: {
        witnessCount: 2,
        notaryRequired: false,
        notaryAlternative: true,
        documentName: "Advance Health Care Directive",
        minimumWitnessAge: 18,
        specialRequirements:
          "Cal. Probate Code §§4700-4701. One witness cannot be healthcare provider, operator of community care facility, or operator of residential care facility for the elderly.",
        // Enhanced
        witnessRestrictions: {
          beneficiaryCanWitness: true,
          beneficiaryWitnessConsequence: null,
          familyCanWitness: true,
          healthcareProviderCanWitness: false,
          facilityEmployeeCanWitness: false,
          additionalRestrictions:
            "If principal is in skilled nursing facility, patient advocate or ombudsman must sign as one of the witnesses.",
        },
        hipaaIntegration: "combined",
        mentalHealthAuthority: "separate_required",
        nursingHomeAuthority: "separate_required",
      },
      advance_directive: {
        witnessCount: 2,
        notaryRequired: false,
        notaryAlternative: true,
        documentName: "Advance Health Care Directive",
        minimumWitnessAge: 18,
        specialRequirements:
          "Cal. Probate Code §§4700-4701. Combined with healthcare POA in California.",
        // Enhanced
        pregnancyProvisions: {
          pregnancyExceptionRequired: false,
          defaultBehavior: "patient_choice",
          statutoryLanguage: null,
        },
        witnessRestrictions: {
          beneficiaryCanWitness: true,
          beneficiaryWitnessConsequence: null,
          familyCanWitness: true,
          healthcareProviderCanWitness: false,
          facilityEmployeeCanWitness: false,
          additionalRestrictions: "Same witness restrictions as healthcare POA.",
        },
        statutoryFormRequired: false,
        statutoryFormReference: "Cal. Probate Code §4701 provides optional statutory form",
        conditionDefinitions: {
          terminalCondition:
            "An incurable and irreversible condition that has been medically confirmed and will, within reasonable medical judgment, result in death within a relatively short time.",
          permanentUnconsciousness:
            "An irreversible condition, as certified by two physicians, in which thought and awareness of self and environment are absent.",
          endStageCondition:
            "A condition that is incurable and irreversible and that will continue in its course until death occurs.",
        },
      },
    },
    TX: {
      will: {
        witnessCount: 2,
        notaryRequired: false,
        notaryAlternative: false,
        selfProvingAllowed: true,
        minimumWitnessAge: 14,
        holographicAllowed: true,
        specialRequirements:
          "Holographic wills valid if entirely in testator's handwriting. Texas Estates Code §251.051-052.",
        witnessRestrictions: {
          beneficiaryCanWitness: true,
          beneficiaryWitnessConsequence: "void_bequest",
          familyCanWitness: true,
          healthcareProviderCanWitness: true,
          facilityEmployeeCanWitness: true,
          additionalRestrictions:
            "Under Texas Estates Code §254.002, a beneficiary-witness is treated as if they predeceased testator for their specific bequest, unless two other disinterested witnesses also sign.",
        },
        noContestClauseEnforceable: true,
        noContestLimitations:
          "Enforceable unless beneficiary brings action in good faith and with just cause. Texas Estates Code §254.005.",
        defaultSurvivalPeriod: 120,
        rufadaaAdopted: true,
        communityPropertyState: true,
      },
      revocable_trust: {
        witnessCount: 0,
        notaryRequired: true,
        documentName: "Revocable Living Trust",
        minimumWitnessAge: 18,
        specialRequirements:
          "Texas Trust Code: Texas Property Code §§111-115. Certificate of Trust recognized under §114.086.",
        certificateOfTrustRecognized: true,
        pourOverWillRequirements: "Pour-over will recommended to fund trust with probate assets.",
        trustCodeReference: "Texas Property Code §§111.001-115.017",
      },
      financial_poa: {
        witnessCount: 0,
        notaryRequired: true,
        notaryAlternative: false,
        documentName: "Statutory Durable Power of Attorney",
        minimumWitnessAge: 18,
        specialRequirements:
          "Texas Durable Power of Attorney Act: Texas Estates Code §751-752. Statutory form available.",
        upoaaAdopted: false,
        witnessRestrictions: {
          beneficiaryCanWitness: true,
          beneficiaryWitnessConsequence: null,
          familyCanWitness: true,
          healthcareProviderCanWitness: true,
          facilityEmployeeCanWitness: true,
          additionalRestrictions: null,
        },
        agentAcceptanceRecommended: true,
        thirdPartyRelianceStatutory: true,
        explicitGrantRequired: [
          "gift_making",
          "beneficiary_designation_changes",
          "trust_modification",
        ],
      },
      healthcare_poa: {
        witnessCount: 2,
        notaryRequired: false,
        notaryAlternative: true,
        documentName: "Medical Power of Attorney",
        minimumWitnessAge: 18,
        specialRequirements:
          "Texas Health & Safety Code Chapter 166. One witness cannot be designated agent, healthcare provider, or employee of provider.",
        witnessRestrictions: {
          beneficiaryCanWitness: true,
          beneficiaryWitnessConsequence: null,
          familyCanWitness: true,
          healthcareProviderCanWitness: false,
          facilityEmployeeCanWitness: false,
          additionalRestrictions:
            "One witness cannot be the agent, healthcare provider, or healthcare facility employee.",
        },
        hipaaIntegration: "combined",
        mentalHealthAuthority: "included",
        nursingHomeAuthority: "included",
      },
      advance_directive: {
        witnessCount: 2,
        notaryRequired: false,
        notaryAlternative: true,
        documentName: "Directive to Physicians and Family or Surrogates",
        minimumWitnessAge: 18,
        specialRequirements:
          "Texas Health & Safety Code §166.031-166.051. Statutory form should be substantially followed.",
        pregnancyProvisions: {
          pregnancyExceptionRequired: true,
          defaultBehavior: "directive_suspended",
          statutoryLanguage:
            "I understand that under Texas law this directive cannot be given effect if I am pregnant.",
        },
        witnessRestrictions: {
          beneficiaryCanWitness: true,
          beneficiaryWitnessConsequence: null,
          familyCanWitness: true,
          healthcareProviderCanWitness: false,
          facilityEmployeeCanWitness: false,
          additionalRestrictions: "Same restrictions as Medical Power of Attorney.",
        },
        statutoryFormRequired: true,
        statutoryFormReference: "Texas Health & Safety Code §166.033",
        conditionDefinitions: {
          terminalCondition:
            "An incurable condition caused by injury, disease, or illness that according to reasonable medical judgment will produce death within six months, even with available life-sustaining treatment.",
          permanentUnconsciousness:
            "A condition that, to a reasonable degree of medical probability as certified by two physicians, one of which is the attending physician, is irreversible.",
          endStageCondition:
            "A condition that is incurable and irreversible and that will, in the opinion of the attending physician, result in death within a relatively short time.",
        },
      },
    },
    FL: {
      will: {
        witnessCount: 2,
        notaryRequired: false,
        notaryAlternative: false,
        selfProvingAllowed: true,
        minimumWitnessAge: 18,
        holographicAllowed: false,
        specialRequirements:
          "Florida does not recognize holographic wills. Florida Statutes §732.502.",
        witnessRestrictions: {
          beneficiaryCanWitness: true,
          beneficiaryWitnessConsequence: "void_bequest",
          familyCanWitness: true,
          healthcareProviderCanWitness: true,
          facilityEmployeeCanWitness: true,
          additionalRestrictions:
            "Under Florida Statutes §732.504, an interested witness's bequest is void unless there are two other disinterested attesting witnesses.",
        },
        noContestClauseEnforceable: true,
        noContestLimitations: "Florida enforces no-contest clauses. Florida Statutes §732.517.",
        defaultSurvivalPeriod: 120,
        rufadaaAdopted: true,
        communityPropertyState: false,
      },
      revocable_trust: {
        witnessCount: 0,
        notaryRequired: true,
        documentName: "Revocable Living Trust",
        minimumWitnessAge: 18,
        specialRequirements:
          "Florida Trust Code: Florida Statutes Chapter 736. Certificate of Trust recognized under §736.1017.",
        certificateOfTrustRecognized: true,
        pourOverWillRequirements: "Pour-over will commonly used with Florida trusts.",
        trustCodeReference: "Florida Statutes Chapter 736",
      },
      financial_poa: {
        witnessCount: 2,
        notaryRequired: true,
        notaryAlternative: false,
        documentName: "Durable Power of Attorney",
        minimumWitnessAge: 18,
        specialRequirements:
          "Florida Statutes §709. Requires notarization AND two witnesses. Statutory form provided.",
        upoaaAdopted: true,
        witnessRestrictions: {
          beneficiaryCanWitness: true,
          beneficiaryWitnessConsequence: null,
          familyCanWitness: true,
          healthcareProviderCanWitness: true,
          facilityEmployeeCanWitness: true,
          additionalRestrictions: "Witnesses cannot be the principal or the agent.",
        },
        agentAcceptanceRecommended: true,
        thirdPartyRelianceStatutory: true,
        explicitGrantRequired: [
          "gift_making",
          "trust_creation",
          "beneficiary_designation_changes",
          "delegation",
        ],
      },
      healthcare_poa: {
        witnessCount: 2,
        notaryRequired: false,
        notaryAlternative: true,
        documentName: "Designation of Health Care Surrogate",
        minimumWitnessAge: 18,
        specialRequirements: "Florida Statutes §765. Witnesses cannot be the designated surrogate.",
        witnessRestrictions: {
          beneficiaryCanWitness: true,
          beneficiaryWitnessConsequence: null,
          familyCanWitness: true,
          healthcareProviderCanWitness: true,
          facilityEmployeeCanWitness: true,
          additionalRestrictions: "Witness cannot be the designated surrogate.",
        },
        hipaaIntegration: "combined",
        mentalHealthAuthority: "included",
        nursingHomeAuthority: "included",
      },
      advance_directive: {
        witnessCount: 2,
        notaryRequired: false,
        notaryAlternative: true,
        documentName: "Living Will",
        minimumWitnessAge: 18,
        specialRequirements:
          "Florida Statutes §765.303. Form should be substantially similar to statutory form.",
        pregnancyProvisions: {
          pregnancyExceptionRequired: true,
          defaultBehavior: "directive_suspended",
          statutoryLanguage:
            "If I have been diagnosed as pregnant and that diagnosis is known to my physician, this declaration shall have no force or effect during the course of my pregnancy.",
        },
        witnessRestrictions: {
          beneficiaryCanWitness: true,
          beneficiaryWitnessConsequence: null,
          familyCanWitness: true,
          healthcareProviderCanWitness: true,
          facilityEmployeeCanWitness: true,
          additionalRestrictions: null,
        },
        statutoryFormRequired: false,
        statutoryFormReference: "Florida Statutes §765.303",
        conditionDefinitions: {
          terminalCondition:
            "A condition caused by injury, disease, or illness from which there is no reasonable medical probability of recovery and which, without treatment, can be expected to cause death.",
          permanentUnconsciousness:
            "A condition that, to a reasonable degree of medical certainty as certified by two physicians, one of which is the attending physician, is irreversible and from which there is no reasonable probability of recovery.",
          endStageCondition:
            "An irreversible condition that is caused by injury, disease, or illness which has resulted in progressively severe and permanent deterioration.",
        },
      },
    },
  };
