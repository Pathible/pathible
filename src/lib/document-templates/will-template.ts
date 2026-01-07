/**
 * Last Will and Testament Template Definition
 */

export const WILL_TEMPLATE_INFO = {
  id: "will",
  name: "Last Will and Testament",
  description:
    "A legal document that declares how your property should be distributed after death.",
  category: "estate_planning",
  estimatedCompletionTime: "20-30 minutes",
  requiresNotary: false,
  requiresWitnesses: true,
  defaultWitnessCount: 2,
} as const;

export const WILL_REQUIRED_FIELDS = [
  "fullName",
  "address",
  "state",
  "maritalStatus",
  "executorName",
  "residuaryBeneficiary",
] as const;

export const WILL_OPTIONAL_FIELDS = [
  "county",
  "city",
  "dateOfBirth",
  "spouseName",
  "hasMinorChildren",
  "childrenNames",
  "alternateExecutorName",
  "executorRelationship",
  "executorAddress",
  "alternateExecutorRelationship",
  "waiveExecutorBond",
  "executorCompensation",
  "executorCompensationAmount",
  "guardianName",
  "alternateGuardianName",
  "guardianRelationship",
  "guardianAddress",
  "excludedGuardian",
  "specificBequests",
  "residuaryPercentage",
  "residuaryRelationship",
  "additionalBeneficiaries",
  "contingentBeneficiary",
  "residuaryContingent",
  "finalContingentBeneficiary",
  "survivalPeriod",
  "noContestClause",
  "digitalExecutor",
  "digitalAssetsInstructions",
  "passwordLocation",
  "burialPreference",
  "burialInstructions",
  "organDonation",
] as const;

export const WILL_ARTICLE_SECTIONS = [
  { id: "declaration", title: "Declaration", required: true },
  { id: "family_status", title: "Family Status", required: true },
  { id: "debts_taxes", title: "Payment of Debts and Taxes", required: true },
  { id: "executor", title: "Appointment of Executor", required: true },
  { id: "executor_powers", title: "Executor Powers", required: true },
  { id: "specific_bequests", title: "Specific Bequests", required: false },
  { id: "residuary", title: "Residuary Estate", required: true },
  { id: "guardian", title: "Guardianship", required: false, condition: "hasMinorChildren" },
  { id: "simultaneous_death", title: "Simultaneous Death", required: true },
  { id: "digital_assets", title: "Digital Assets", required: false },
  { id: "no_contest", title: "No-Contest Provision", required: false },
  { id: "final_wishes", title: "Final Wishes", required: false },
  { id: "definitions", title: "Definitions", required: true },
  { id: "severability", title: "Severability", required: true },
  { id: "governing_law", title: "Governing Law", required: true },
] as const;

export type WillRequiredField = (typeof WILL_REQUIRED_FIELDS)[number];
export type WillOptionalField = (typeof WILL_OPTIONAL_FIELDS)[number];
export type WillField = WillRequiredField | WillOptionalField;
export type WillArticleSection = (typeof WILL_ARTICLE_SECTIONS)[number];
