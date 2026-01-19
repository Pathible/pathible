/**
 * Constants for State Legal Requirements
 *
 * This module contains constants like state names, document coordination rules,
 * and community property state lists.
 */

import type { DocumentCoordination, DocumentType, USState } from "./types";

// =============================================================================
// STATE NAMES
// =============================================================================

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
// DOCUMENT COORDINATION
// =============================================================================

/**
 * Coordination rules for each document type
 */
export const DOCUMENT_COORDINATION: Record<string, DocumentCoordination> = {
  will: {
    recommendedCompanions: [
      "financial_poa",
      "healthcare_poa",
      "advance_directive",
    ] as DocumentType[],
    requiredReferences: [] as DocumentType[],
    standaloneWarning: null,
  },
  revocable_trust: {
    recommendedCompanions: ["financial_poa", "healthcare_poa"] as DocumentType[],
    requiredReferences: [] as DocumentType[],
    standaloneWarning:
      "A trust without a pour-over will may leave assets outside the trust subject to probate.",
  },
  pour_over_will: {
    recommendedCompanions: [] as DocumentType[],
    requiredReferences: ["revocable_trust"] as DocumentType[],
    standaloneWarning:
      "A pour-over will requires an existing trust to pour assets into. Create your trust first.",
  },
  financial_poa: {
    recommendedCompanions: ["healthcare_poa", "advance_directive"] as DocumentType[],
    requiredReferences: [] as DocumentType[],
    standaloneWarning: null,
  },
  healthcare_poa: {
    recommendedCompanions: ["advance_directive", "financial_poa"] as DocumentType[],
    requiredReferences: [] as DocumentType[],
    standaloneWarning: null,
  },
  advance_directive: {
    recommendedCompanions: ["healthcare_poa"] as DocumentType[],
    requiredReferences: [] as DocumentType[],
    standaloneWarning:
      "An advance directive without a healthcare POA means no one can make decisions not covered by the directive.",
  },
};

// =============================================================================
// COMMUNITY PROPERTY STATES
// =============================================================================

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

// =============================================================================
// PLAIN LANGUAGE TRANSLATIONS
// =============================================================================

/**
 * Translates legal terms to plain English for regular folks.
 * Keeps the accuracy but makes it understandable.
 */
export const LEGAL_TO_PLAIN: Record<string, string> = {
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
