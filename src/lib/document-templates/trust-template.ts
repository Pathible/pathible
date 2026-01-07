/**
 * Revocable Living Trust Template Definition
 */

export const TRUST_TEMPLATE_INFO = {
  id: "revocable_trust",
  name: "Revocable Living Trust",
  description:
    "A legal arrangement that allows you to transfer assets to a trust during your lifetime, avoiding probate and providing flexible management.",
  category: "estate_planning",
  estimatedCompletionTime: "30-45 minutes",
  requiresNotary: true,
  requiresWitnesses: false,
  defaultWitnessCount: 0,
} as const;

export const TRUST_REQUIRED_FIELDS = [
  "fullName",
  "address",
  "state",
  "trustName",
  "trusteeName",
  "successorTrusteeName",
  "primaryBeneficiary",
] as const;

export const TRUST_OPTIONAL_FIELDS = [
  "county",
  "city",
  "dateOfBirth",
  "spouseName",
  "isJointTrust",
  "coTrusteeName",
  "secondSuccessorTrusteeName",
  "trusteeRelationship",
  "successorTrusteeRelationship",
  "trusteeAddress",
  "successorTrusteeAddress",
  "trusteeCompensation",
  "trusteeCompensationAmount",
  "initialAssets",
  "realPropertyAssets",
  "financialAccountAssets",
  "personalPropertyAssets",
  "primaryBeneficiaryPercentage",
  "primaryBeneficiaryRelationship",
  "additionalBeneficiaries",
  "contingentBeneficiary",
  "contingentBeneficiaryPercentage",
  "hasMinorBeneficiaries",
  "minorBeneficiaryAge",
  "subtrustsForMinors",
  "spendthriftProvision",
  "incapacityProvisions",
  "incapacityDetermination",
  "distributionSchedule",
  "discretionaryDistributions",
  "charityBeneficiary",
  "charityPercentage",
  "petProvisions",
  "petCaretaker",
  "petCareFund",
  "revocationProcedure",
  "amendmentProcedure",
  "governingLaw",
  "disputeResolution",
  "noContestClause",
] as const;

export const TRUST_ARTICLE_SECTIONS = [
  { id: "declaration", title: "Declaration of Trust", required: true },
  { id: "definitions", title: "Definitions", required: true },
  { id: "trust_property", title: "Trust Property", required: true },
  { id: "trustee_appointment", title: "Appointment of Trustee", required: true },
  { id: "trustee_powers", title: "Trustee Powers", required: true },
  { id: "trustee_duties", title: "Trustee Duties", required: true },
  { id: "trustee_compensation", title: "Trustee Compensation", required: false },
  { id: "lifetime_distributions", title: "Distributions During Lifetime", required: true },
  { id: "incapacity", title: "Incapacity Provisions", required: true },
  { id: "death_distributions", title: "Distributions Upon Death", required: true },
  { id: "beneficiary_provisions", title: "Beneficiary Provisions", required: true },
  {
    id: "minor_beneficiaries",
    title: "Minor Beneficiaries",
    required: false,
    condition: "hasMinorBeneficiaries",
  },
  { id: "spendthrift", title: "Spendthrift Provisions", required: false },
  { id: "revocation_amendment", title: "Revocation and Amendment", required: true },
  { id: "successor_trustee", title: "Successor Trustee Provisions", required: true },
  { id: "no_contest", title: "No-Contest Provision", required: false },
  { id: "miscellaneous", title: "Miscellaneous Provisions", required: true },
  { id: "governing_law", title: "Governing Law", required: true },
  { id: "signature", title: "Signature and Acknowledgment", required: true },
] as const;

export type TrustRequiredField = (typeof TRUST_REQUIRED_FIELDS)[number];
export type TrustOptionalField = (typeof TRUST_OPTIONAL_FIELDS)[number];
export type TrustField = TrustRequiredField | TrustOptionalField;
export type TrustArticleSection = (typeof TRUST_ARTICLE_SECTIONS)[number];
