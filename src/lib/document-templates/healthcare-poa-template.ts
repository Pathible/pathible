/**
 * Healthcare Power of Attorney Template Definition
 *
 * A healthcare POA grants an agent authority to make medical decisions
 * on behalf of the principal when they cannot make decisions themselves.
 */

export const HEALTHCARE_POA_TEMPLATE_INFO = {
  id: "healthcare_poa",
  name: "Healthcare Power of Attorney",
  description:
    "A legal document that designates someone to make medical decisions on your behalf if you become unable to make them yourself.",
  category: "healthcare_planning",
  estimatedCompletionTime: "15-20 minutes",
  requiresNotary: false,
  requiresWitnesses: true,
  defaultWitnessCount: 2,
} as const;

export const HEALTHCARE_POA_REQUIRED_FIELDS = [
  "fullName",
  "address",
  "state",
  "agentName",
  "agentAddress",
  "agentPhone",
] as const;

export const HEALTHCARE_POA_OPTIONAL_FIELDS = [
  "county",
  "city",
  "dateOfBirth",
  "agentRelationship",
  "agentEmail",
  "alternateAgentName",
  "alternateAgentAddress",
  "alternateAgentRelationship",
  "alternateAgentPhone",
  "secondAlternateAgentName",
  "secondAlternateAgentAddress",
  "effectiveDate",
  "effectiveImmediately",
  "effectiveUponIncapacity",
  "incapacityDetermination",
  "incapacityPhysicianCount",
  "generalMedicalDecisions",
  "surgeryAuthority",
  "medicationAuthority",
  "diagnosticTestsAuthority",
  "hospitalAdmissionAuthority",
  "nursingHomeAuthority",
  "homeHealthCareAuthority",
  "hospiceAuthority",
  "painManagementAuthority",
  "lifeSustainingTreatment",
  "artificialNutrition",
  "artificialHydration",
  "mechanicalVentilation",
  "dialysis",
  "cprPreferences",
  "organDonation",
  "organDonationLimitations",
  "autopsyPreferences",
  "bodyDisposition",
  "mentalHealthAuthority",
  "mentalHealthTreatmentTypes",
  "psychotropicMedications",
  "ectAuthority",
  "psychiatricHospitalization",
  "substanceAbuseTreatment",
  "hipaaAuthorization",
  "medicalRecordsAccess",
  "healthcareProviderCommunication",
  "spiritualPreferences",
  "religiousRestrictions",
  "culturalConsiderations",
  "primaryPhysician",
  "primaryPhysicianPhone",
  "preferredHospital",
  "healthInsuranceInfo",
  "specialInstructions",
  "limitations",
  "expirationDate",
  "revocationInstructions",
] as const;

export const HEALTHCARE_POA_ARTICLE_SECTIONS = [
  { id: "declaration", title: "Declaration", required: true },
  { id: "agent_appointment", title: "Appointment of Healthcare Agent", required: true },
  { id: "alternate_agents", title: "Alternate Agents", required: false },
  { id: "effective_date", title: "Effective Date", required: true },
  { id: "incapacity_determination", title: "Determination of Incapacity", required: true },
  { id: "general_powers", title: "General Healthcare Powers", required: true },
  { id: "specific_treatments", title: "Specific Treatment Decisions", required: false },
  { id: "life_sustaining", title: "Life-Sustaining Treatment", required: false },
  { id: "mental_health", title: "Mental Health Treatment", required: false },
  { id: "organ_donation", title: "Organ Donation", required: false },
  { id: "hipaa", title: "HIPAA Authorization", required: true },
  { id: "personal_preferences", title: "Personal and Religious Preferences", required: false },
  { id: "healthcare_providers", title: "Healthcare Provider Information", required: false },
  { id: "agent_duties", title: "Agent Duties and Standards", required: true },
  { id: "limitations", title: "Limitations on Powers", required: false },
  { id: "revocation", title: "Revocation", required: true },
  { id: "severability", title: "Severability", required: true },
  { id: "governing_law", title: "Governing Law", required: true },
  { id: "signature", title: "Signature and Witnesses", required: true },
  { id: "agent_acceptance", title: "Agent Acceptance", required: false },
] as const;

export type HealthcarePOARequiredField = (typeof HEALTHCARE_POA_REQUIRED_FIELDS)[number];
export type HealthcarePOAOptionalField = (typeof HEALTHCARE_POA_OPTIONAL_FIELDS)[number];
export type HealthcarePOAField = HealthcarePOARequiredField | HealthcarePOAOptionalField;
export type HealthcarePOAArticleSection = (typeof HEALTHCARE_POA_ARTICLE_SECTIONS)[number];
