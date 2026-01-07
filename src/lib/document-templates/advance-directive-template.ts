/**
 * Advance Healthcare Directive (Living Will) Template Definition
 *
 * An advance directive provides instructions for end-of-life care
 * and treatment preferences when the individual cannot communicate.
 */

export const ADVANCE_DIRECTIVE_TEMPLATE_INFO = {
  id: "advance_directive",
  name: "Advance Healthcare Directive",
  description:
    "A legal document that specifies your wishes for medical treatment and end-of-life care if you become unable to communicate your decisions.",
  category: "healthcare_planning",
  estimatedCompletionTime: "20-30 minutes",
  requiresNotary: false,
  requiresWitnesses: true,
  defaultWitnessCount: 2,
  alternateNames: ["Living Will", "Advance Medical Directive", "Healthcare Declaration"],
} as const;

export const ADVANCE_DIRECTIVE_REQUIRED_FIELDS = [
  "fullName",
  "address",
  "state",
  "terminalConditionPreference",
  "permanentUnconsciousnessPreference",
] as const;

export const ADVANCE_DIRECTIVE_OPTIONAL_FIELDS = [
  "county",
  "city",
  "dateOfBirth",
  "endStageConditionPreference",
  "lifeSustainingTreatmentGeneral",
  "cardiopulmonaryResuscitation",
  "cprPreference",
  "mechanicalVentilation",
  "ventilatorPreference",
  "artificialNutrition",
  "feedingTubePreference",
  "artificialHydration",
  "hydrationPreference",
  "dialysis",
  "dialysisPreference",
  "antibiotics",
  "antibioticsPreference",
  "bloodTransfusions",
  "bloodTransfusionPreference",
  "surgicalProcedures",
  "surgeryPreference",
  "diagnosticTests",
  "diagnosticPreference",
  "painManagement",
  "painManagementPreference",
  "comfortCareOnly",
  "hospiceCarePreference",
  "palliativeCareInstructions",
  "trialPeriodPreference",
  "trialPeriodDuration",
  "pregnancyProvision",
  "pregnancyPreference",
  "organDonation",
  "organDonationType",
  "organDonationPurpose",
  "organDonationLimitations",
  "tissueDonation",
  "autopsyPreference",
  "autopsyLimitations",
  "bodyDisposition",
  "burialPreference",
  "cremationPreference",
  "bodyDonation",
  "funeralInstructions",
  "spiritualPreferences",
  "religiousRestrictions",
  "culturalConsiderations",
  "clergyContact",
  "personalStatement",
  "qualityOfLifeValues",
  "treatmentGoals",
  "healthcareAgentName",
  "healthcareAgentPhone",
  "primaryPhysician",
  "primaryPhysicianPhone",
  "preferredHospital",
  "familyNotificationInstructions",
  "emergencyContacts",
  "additionalInstructions",
  "reviewDate",
  "expirationDate",
] as const;

export const ADVANCE_DIRECTIVE_ARTICLE_SECTIONS = [
  { id: "declaration", title: "Declaration", required: true },
  { id: "definitions", title: "Definitions of Medical Conditions", required: true },
  { id: "terminal_condition", title: "Terminal Condition Instructions", required: true },
  {
    id: "permanent_unconsciousness",
    title: "Permanent Unconsciousness Instructions",
    required: true,
  },
  { id: "end_stage_condition", title: "End-Stage Condition Instructions", required: false },
  { id: "life_sustaining_general", title: "General Life-Sustaining Treatment", required: false },
  { id: "specific_treatments", title: "Specific Treatment Preferences", required: false },
  { id: "pain_management", title: "Pain Management and Comfort Care", required: true },
  { id: "pregnancy_provision", title: "Pregnancy Provision", required: false },
  { id: "organ_donation", title: "Organ and Tissue Donation", required: false },
  { id: "autopsy", title: "Autopsy Preferences", required: false },
  { id: "body_disposition", title: "Body Disposition", required: false },
  { id: "personal_values", title: "Personal Values Statement", required: false },
  { id: "spiritual_preferences", title: "Spiritual and Religious Preferences", required: false },
  { id: "healthcare_providers", title: "Healthcare Provider Information", required: false },
  { id: "additional_instructions", title: "Additional Instructions", required: false },
  { id: "revocation", title: "Revocation", required: true },
  { id: "severability", title: "Severability", required: true },
  { id: "governing_law", title: "Governing Law", required: true },
  { id: "signature", title: "Signature and Witnesses", required: true },
] as const;

export type AdvanceDirectiveRequiredField = (typeof ADVANCE_DIRECTIVE_REQUIRED_FIELDS)[number];
export type AdvanceDirectiveOptionalField = (typeof ADVANCE_DIRECTIVE_OPTIONAL_FIELDS)[number];
export type AdvanceDirectiveField = AdvanceDirectiveRequiredField | AdvanceDirectiveOptionalField;
export type AdvanceDirectiveArticleSection = (typeof ADVANCE_DIRECTIVE_ARTICLE_SECTIONS)[number];
