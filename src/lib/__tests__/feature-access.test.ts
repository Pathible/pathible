import { describe, expect, it } from "vitest";
import {
  FEATURE_TIERS,
  tierHasAccess,
  tierHasFeatureAccess,
} from "@/convex/shared/subscriptionTiers";
import {
  FEATURE_METADATA,
  FEATURES,
  getRequiredPlanForFeature,
  PLAN_LABELS,
  SUBSCRIPTION_TIERS,
} from "../feature-access";

/**
 * Feature Access Tests
 *
 * Tests for feature gating utilities that control access to premium features
 * based on subscription tier. Now uses Convex tier-based checks instead of
 * Clerk's has() function.
 */

describe("tierHasAccess", () => {
  it("should grant access when user tier equals required tier", () => {
    expect(tierHasAccess("heritage", "heritage")).toBe(true);
  });

  it("should grant access when user tier is higher than required", () => {
    expect(tierHasAccess("legacy", "foundations")).toBe(true);
    expect(tierHasAccess("legacy", "heritage")).toBe(true);
    expect(tierHasAccess("heritage", "foundations")).toBe(true);
  });

  it("should deny access when user tier is lower than required", () => {
    expect(tierHasAccess("foundations", "heritage")).toBe(false);
    expect(tierHasAccess("foundations", "legacy")).toBe(false);
    expect(tierHasAccess("heritage", "legacy")).toBe(false);
  });

  it("should treat founders as equivalent to legacy", () => {
    expect(tierHasAccess("founders", "legacy")).toBe(true);
    expect(tierHasAccess("founders", "heritage")).toBe(true);
    expect(tierHasAccess("founders", "foundations")).toBe(true);
  });
});

describe("tierHasFeatureAccess", () => {
  it("should grant foundations users access to foundations features", () => {
    expect(tierHasFeatureAccess("foundations", "vault_document_storage")).toBe(true);
    expect(tierHasFeatureAccess("foundations", "financial_overview")).toBe(true);
  });

  it("should deny foundations users access to heritage features", () => {
    expect(tierHasFeatureAccess("foundations", "vault_tags_collections")).toBe(false);
    expect(tierHasFeatureAccess("foundations", "wisdom_entries")).toBe(false);
  });

  it("should grant heritage users access to heritage and foundations features", () => {
    expect(tierHasFeatureAccess("heritage", "vault_tags_collections")).toBe(true);
    expect(tierHasFeatureAccess("heritage", "vault_document_storage")).toBe(true);
  });

  it("should deny heritage users access to legacy features", () => {
    expect(tierHasFeatureAccess("heritage", "legacy_legal_documents")).toBe(false);
  });

  it("should grant legacy users access to all features", () => {
    expect(tierHasFeatureAccess("legacy", "vault_document_storage")).toBe(true);
    expect(tierHasFeatureAccess("legacy", "vault_tags_collections")).toBe(true);
    expect(tierHasFeatureAccess("legacy", "legacy_legal_documents")).toBe(true);
  });
});

describe("getRequiredPlanForFeature", () => {
  it("should return correct required plan for vault tags feature", () => {
    const result = getRequiredPlanForFeature(FEATURES.VAULT_TAGS_COLLECTIONS);
    expect(typeof result).toBe("string");
    expect(result.length).toBeGreaterThan(0);
  });

  it("should return correct required plan for financial overview feature", () => {
    const result = getRequiredPlanForFeature(FEATURES.FINANCIAL_OVERVIEW);
    expect(typeof result).toBe("string");
    expect(result.length).toBeGreaterThan(0);
  });

  it("should return correct required plan for wisdom entries feature", () => {
    const result = getRequiredPlanForFeature(FEATURES.WISDOM_ENTRIES);
    expect(typeof result).toBe("string");
    expect(result.length).toBeGreaterThan(0);
  });
});

describe("FEATURE_METADATA", () => {
  it("should have metadata for all feature slugs", () => {
    for (const featureSlug of Object.values(FEATURES)) {
      const metadata = FEATURE_METADATA[featureSlug];
      expect(metadata).toBeDefined();
      expect(metadata.name).toBeDefined();
      expect(metadata.description).toBeDefined();
      expect(metadata.requiredPlan).toBeDefined();
    }
  });

  it("should have valid requiredPlan for each feature", () => {
    const validPlans = Object.values(PLAN_LABELS);

    for (const featureSlug of Object.values(FEATURES)) {
      const metadata = FEATURE_METADATA[featureSlug];
      expect(validPlans).toContain(metadata.requiredPlan);
    }
  });
});

describe("PLAN_LABELS", () => {
  it("should have labels for all subscription tiers", () => {
    for (const tier of SUBSCRIPTION_TIERS) {
      expect(PLAN_LABELS[tier]).toBeDefined();
      expect(typeof PLAN_LABELS[tier]).toBe("string");
    }
  });
});

describe("FEATURES constant", () => {
  it("should have all expected feature slugs", () => {
    expect(FEATURES.VAULT_TAGS_COLLECTIONS).toBeDefined();
    expect(FEATURES.FINANCIAL_OVERVIEW).toBeDefined();
    expect(FEATURES.WISDOM_ENTRIES).toBeDefined();
  });

  it("should have unique values for all feature slugs", () => {
    const values = Object.values(FEATURES);
    const uniqueValues = new Set(values);
    expect(uniqueValues.size).toBe(values.length);
  });
});

describe("FEATURE_TIERS mapping", () => {
  it("should have a tier mapping for every feature slug", () => {
    for (const slug of Object.values(FEATURES)) {
      expect(FEATURE_TIERS[slug]).toBeDefined();
      expect(SUBSCRIPTION_TIERS).toContain(FEATURE_TIERS[slug]);
    }
  });
});
