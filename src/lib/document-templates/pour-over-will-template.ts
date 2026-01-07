/**
 * Pour-Over Will Template Definition
 *
 * A pour-over will works in conjunction with a revocable living trust,
 * directing any assets not already in the trust to "pour over" into it upon death.
 */

export const POUR_OVER_WILL_TEMPLATE_INFO = {
  id: "pour_over_will",
  name: "Pour-Over Will",
  description:
    "A will that directs any assets not already in your trust to be transferred to your trust upon death, ensuring all assets are distributed according to your trust terms.",
  category: "estate_planning",
  estimatedCompletionTime: "15-20 minutes",
  requiresNotary: false,
  requiresWitnesses: true,
  defaultWitnessCount: 2,
  requiresExistingTrust: true,
} as const;

export const POUR_OVER_WILL_REQUIRED_FIELDS = [
  "fullName",
  "address",
  "state",
  "trustName",
  "trustDate",
  "trusteeName",
  "executorName",
] as const;

export const POUR_OVER_WILL_OPTIONAL_FIELDS = [
  "county",
  "city",
  "dateOfBirth",
  "spouseName",
  "maritalStatus",
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
  "tangiblePersonalProperty",
  "tangiblePropertyRecipient",
  "excludedAssets",
  "survivalPeriod",
  "noContestClause",
  "burialPreference",
  "burialInstructions",
  "organDonation",
] as const;

export const POUR_OVER_WILL_ARTICLE_SECTIONS = [
  { id: "declaration", title: "Declaration", required: true },
  { id: "family_status", title: "Family Status", required: true },
  { id: "trust_identification", title: "Trust Identification", required: true },
  { id: "debts_taxes", title: "Payment of Debts and Taxes", required: true },
  { id: "executor", title: "Appointment of Executor", required: true },
  { id: "executor_powers", title: "Executor Powers", required: true },
  { id: "specific_bequests", title: "Specific Bequests", required: false },
  { id: "pour_over", title: "Pour-Over Provision", required: true },
  { id: "guardian", title: "Guardianship", required: false, condition: "hasMinorChildren" },
  { id: "simultaneous_death", title: "Simultaneous Death", required: true },
  { id: "no_contest", title: "No-Contest Provision", required: false },
  { id: "final_wishes", title: "Final Wishes", required: false },
  { id: "severability", title: "Severability", required: true },
  { id: "governing_law", title: "Governing Law", required: true },
] as const;

export type PourOverWillRequiredField = (typeof POUR_OVER_WILL_REQUIRED_FIELDS)[number];
export type PourOverWillOptionalField = (typeof POUR_OVER_WILL_OPTIONAL_FIELDS)[number];
export type PourOverWillField = PourOverWillRequiredField | PourOverWillOptionalField;
export type PourOverWillArticleSection = (typeof POUR_OVER_WILL_ARTICLE_SECTIONS)[number];
