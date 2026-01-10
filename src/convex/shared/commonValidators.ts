/**
 * Common Convex validators used across multiple modules.
 *
 * This file centralizes validator definitions to:
 * - Eliminate duplication across modules
 * - Ensure consistency in type definitions
 * - Make it easier to add new values to enums
 */

import { v } from "convex/values";

// ============================================================================
// RELATIONSHIP VALIDATORS
// ============================================================================

/**
 * Valid relationship types for family members
 */
export const RELATIONSHIP_TYPES = [
  "parent",
  "child",
  "spouse",
  "partner",
  "sibling",
  "grandparent",
  "grandchild",
  "aunt_uncle",
  "niece_nephew",
  "cousin",
  "in_law",
  "other",
] as const;

export type RelationshipType = (typeof RELATIONSHIP_TYPES)[number];

export const relationshipTypeValidator = v.union(
  v.literal("parent"),
  v.literal("child"),
  v.literal("spouse"),
  v.literal("partner"),
  v.literal("sibling"),
  v.literal("grandparent"),
  v.literal("grandchild"),
  v.literal("aunt_uncle"),
  v.literal("niece_nephew"),
  v.literal("cousin"),
  v.literal("in_law"),
  v.literal("other"),
);

// ============================================================================
// KEY CONTACT VALIDATORS
// ============================================================================

/**
 * Valid roles for key contacts (non-family members)
 */
export const KEY_CONTACT_ROLES = [
  "attorney",
  "financial_advisor",
  "executor",
  "trustee",
  "guardian",
  "healthcare_proxy",
  "friend",
  "neighbor",
  "business_partner",
  "caregiver",
  "charitable_org",
  "religious_org",
  "other",
] as const;

export type KeyContactRole = (typeof KEY_CONTACT_ROLES)[number];

export const keyContactRoleValidator = v.union(
  v.literal("attorney"),
  v.literal("financial_advisor"),
  v.literal("executor"),
  v.literal("trustee"),
  v.literal("guardian"),
  v.literal("healthcare_proxy"),
  v.literal("friend"),
  v.literal("neighbor"),
  v.literal("business_partner"),
  v.literal("caregiver"),
  v.literal("charitable_org"),
  v.literal("religious_org"),
  v.literal("other"),
);

// ============================================================================
// PERSON VALIDATORS
// ============================================================================

/**
 * Valid gender options
 */
export const GENDERS = ["male", "female", "prefer_not_to_say"] as const;

export type Gender = (typeof GENDERS)[number];

export const genderValidator = v.union(
  v.literal("male"),
  v.literal("female"),
  v.literal("prefer_not_to_say"),
);

/**
 * Valid marital status options
 */
export const MARITAL_STATUSES = [
  "single",
  "married",
  "divorced",
  "widowed",
  "domestic_partnership",
  "separated",
] as const;

export type MaritalStatus = (typeof MARITAL_STATUSES)[number];

export const maritalStatusValidator = v.union(
  v.literal("single"),
  v.literal("married"),
  v.literal("divorced"),
  v.literal("widowed"),
  v.literal("domestic_partnership"),
  v.literal("separated"),
);

// ============================================================================
// MEMBER STATUS VALIDATORS
// ============================================================================

/**
 * Valid status options for family members
 */
export const MEMBER_STATUSES = ["active", "pending_invite", "inactive"] as const;

export type MemberStatus = (typeof MEMBER_STATUSES)[number];

export const memberStatusValidator = v.union(
  v.literal("active"),
  v.literal("pending_invite"),
  v.literal("inactive"),
);

// ============================================================================
// HOUSEHOLD VALIDATORS
// ============================================================================

/**
 * Valid household member roles
 */
export const HOUSEHOLD_ROLES = ["owner", "steward", "viewer", "executor"] as const;

export type HouseholdRole = (typeof HOUSEHOLD_ROLES)[number];

export const householdRoleValidator = v.union(
  v.literal("owner"),
  v.literal("steward"),
  v.literal("viewer"),
  v.literal("executor"),
);

/**
 * Valid subscription tiers
 */
export const SUBSCRIPTION_TIERS = ["foundations", "heritage", "legacy", "founders"] as const;

export type SubscriptionTierType = (typeof SUBSCRIPTION_TIERS)[number];

export const subscriptionTierValidator = v.union(
  v.literal("foundations"),
  v.literal("heritage"),
  v.literal("legacy"),
  v.literal("founders"),
);

/**
 * Valid subscription statuses
 */
export const SUBSCRIPTION_STATUSES = ["active", "inactive", "cancelled", "past_due"] as const;

export type SubscriptionStatusType = (typeof SUBSCRIPTION_STATUSES)[number];

export const subscriptionStatusValidator = v.union(
  v.literal("active"),
  v.literal("inactive"),
  v.literal("cancelled"),
  v.literal("past_due"),
);

// ============================================================================
// ONBOARDING VALIDATORS
// ============================================================================

/**
 * Valid onboarding status options
 */
export const ONBOARDING_STATUSES = [
  "not_started",
  "profile_complete",
  "household_complete",
  "preferences_complete",
  "complete",
] as const;

export type OnboardingStatus = (typeof ONBOARDING_STATUSES)[number];

export const onboardingStatusValidator = v.union(
  v.literal("not_started"),
  v.literal("profile_complete"),
  v.literal("household_complete"),
  v.literal("preferences_complete"),
  v.literal("complete"),
);

// ============================================================================
// VAULT VALIDATORS
// ============================================================================

/**
 * Valid document access levels
 */
export const ACCESS_LEVELS = ["household", "admins", "custom"] as const;

export type AccessLevel = (typeof ACCESS_LEVELS)[number];

export const accessLevelValidator = v.union(
  v.literal("household"),
  v.literal("admins"),
  v.literal("custom"),
);

// ============================================================================
// PERSON REFERENCE VALIDATORS
// ============================================================================

/**
 * Source types for person references
 */
export const PERSON_SOURCE_TYPES = ["familyMember", "keyContact", "manual"] as const;

export type PersonSourceType = (typeof PERSON_SOURCE_TYPES)[number];

export const personSourceTypeValidator = v.union(
  v.literal("familyMember"),
  v.literal("keyContact"),
  v.literal("manual"),
);
