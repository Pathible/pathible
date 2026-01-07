/**
 * Durable Financial Power of Attorney Template Definition
 *
 * A financial POA grants an agent authority to handle financial matters
 * on behalf of the principal, including banking, investments, and property.
 */

export const FINANCIAL_POA_TEMPLATE_INFO = {
  id: "financial_poa",
  name: "Durable Financial Power of Attorney",
  description:
    "A legal document that grants someone authority to manage your financial affairs, including banking, investments, real estate, and legal matters.",
  category: "financial_planning",
  estimatedCompletionTime: "15-25 minutes",
  requiresNotary: true,
  requiresWitnesses: true,
  defaultWitnessCount: 2,
} as const;

export const FINANCIAL_POA_REQUIRED_FIELDS = [
  "fullName",
  "address",
  "state",
  "agentName",
  "agentAddress",
  "grantedPowers",
] as const;

export const FINANCIAL_POA_OPTIONAL_FIELDS = [
  "county",
  "city",
  "dateOfBirth",
  "agentRelationship",
  "agentPhone",
  "agentEmail",
  "alternateAgentName",
  "alternateAgentAddress",
  "alternateAgentRelationship",
  "alternateAgentPhone",
  "secondAlternateAgentName",
  "secondAlternateAgentAddress",
  "effectiveDate",
  "effectiveImmediately",
  "springingPower",
  "springingCondition",
  "incapacityDetermination",
  "durableProvision",
  "expirationDate",
  "bankingPowers",
  "investmentPowers",
  "realEstatePowers",
  "businessPowers",
  "taxPowers",
  "insurancePowers",
  "retirementAccountPowers",
  "governmentBenefitsPowers",
  "legalPowers",
  "giftingPowers",
  "giftingLimitations",
  "annualGiftLimit",
  "selfDealingAllowed",
  "compensationAllowed",
  "compensationAmount",
  "compensationType",
  "bondRequired",
  "accountingRequirement",
  "accountingFrequency",
  "coAgentName",
  "coAgentAddress",
  "coAgentAuthority",
  "specialInstructions",
  "limitations",
  "thirdPartyReliance",
  "revocationInstructions",
  "hipaaAuthorization",
] as const;

export const FINANCIAL_POA_ARTICLE_SECTIONS = [
  { id: "declaration", title: "Declaration", required: true },
  { id: "agent_appointment", title: "Appointment of Agent", required: true },
  { id: "alternate_agents", title: "Alternate Agents", required: false },
  { id: "effective_date", title: "Effective Date", required: true },
  { id: "durable_provision", title: "Durable Provision", required: true },
  { id: "general_powers", title: "General Powers", required: true },
  { id: "banking_powers", title: "Banking and Financial Powers", required: false },
  { id: "investment_powers", title: "Investment Powers", required: false },
  { id: "real_estate_powers", title: "Real Estate Powers", required: false },
  { id: "business_powers", title: "Business Powers", required: false },
  { id: "tax_powers", title: "Tax Powers", required: false },
  { id: "insurance_powers", title: "Insurance Powers", required: false },
  { id: "retirement_powers", title: "Retirement Account Powers", required: false },
  { id: "government_benefits", title: "Government Benefits Powers", required: false },
  { id: "gifting_powers", title: "Gifting Powers", required: false },
  { id: "legal_powers", title: "Legal Powers", required: false },
  { id: "limitations", title: "Limitations on Powers", required: false },
  { id: "agent_duties", title: "Agent Duties and Standards", required: true },
  { id: "compensation", title: "Agent Compensation", required: false },
  { id: "accounting", title: "Accounting Requirements", required: false },
  { id: "third_party", title: "Third Party Reliance", required: true },
  { id: "revocation", title: "Revocation", required: true },
  { id: "severability", title: "Severability", required: true },
  { id: "governing_law", title: "Governing Law", required: true },
  { id: "signature", title: "Signature and Acknowledgment", required: true },
  { id: "agent_acceptance", title: "Agent Acceptance", required: false },
] as const;

export type FinancialPOARequiredField = (typeof FINANCIAL_POA_REQUIRED_FIELDS)[number];
export type FinancialPOAOptionalField = (typeof FINANCIAL_POA_OPTIONAL_FIELDS)[number];
export type FinancialPOAField = FinancialPOARequiredField | FinancialPOAOptionalField;
export type FinancialPOAArticleSection = (typeof FINANCIAL_POA_ARTICLE_SECTIONS)[number];
