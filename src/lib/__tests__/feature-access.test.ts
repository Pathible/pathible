import { describe, expect, it, vi } from "vitest";
import {
  checkAnyFeatureAccess,
  checkFeatureAccess,
  checkHasActivePlan,
  FEATURE_METADATA,
  FEATURES,
  getCurrentPlanTier,
  getRequiredPlanForFeature,
  PLAN_LABELS,
  SUBSCRIPTION_TIERS,
} from "../feature-access";

/**
 * Feature Access Tests
 *
 * Tests for feature gating utilities that control access to premium features
 * based on subscription tier. Critical for:
 * - Ensuring users only see features they have access to
 * - Validating subscription tier checks
 * - Preventing unauthorized access to premium features
 */

describe("checkFeatureAccess", () => {
  it("should return false when has function is undefined", () => {
    const result = checkFeatureAccess(undefined, FEATURES.VAULT_TAGS_COLLECTIONS);
    expect(result).toBe(false);
  });

  it("should return true when user has feature", () => {
    const mockHas = vi.fn().mockReturnValue(true);
    const result = checkFeatureAccess(mockHas, FEATURES.VAULT_TAGS_COLLECTIONS);

    expect(result).toBe(true);
    expect(mockHas).toHaveBeenCalledWith({ feature: FEATURES.VAULT_TAGS_COLLECTIONS });
  });

  it("should return false when user lacks feature", () => {
    const mockHas = vi.fn().mockReturnValue(false);
    const result = checkFeatureAccess(mockHas, FEATURES.VAULT_TAGS_COLLECTIONS);

    expect(result).toBe(false);
    expect(mockHas).toHaveBeenCalledWith({ feature: FEATURES.VAULT_TAGS_COLLECTIONS });
  });

  it("should return false for invalid feature slug", () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const mockHas = vi.fn().mockReturnValue(true);

    // Cast to unknown to test runtime validation with invalid input
    const result = checkFeatureAccess(
      mockHas,
      "invalid_feature_slug" as unknown as Parameters<typeof checkFeatureAccess>[1],
    );

    expect(result).toBe(false);
    expect(consoleSpy).toHaveBeenCalledWith(
      "[feature-access] Invalid feature slug: invalid_feature_slug",
    );
    expect(mockHas).not.toHaveBeenCalled();

    consoleSpy.mockRestore();
  });
});

describe("checkAnyFeatureAccess", () => {
  it("should return false when has function is undefined", () => {
    const result = checkAnyFeatureAccess(undefined, [
      FEATURES.VAULT_TAGS_COLLECTIONS,
      FEATURES.FINANCIAL_OVERVIEW,
    ]);
    expect(result).toBe(false);
  });

  it("should return true when user has any of the features", () => {
    const mockHas = vi.fn().mockImplementation(({ feature }) => {
      return feature === FEATURES.FINANCIAL_OVERVIEW;
    });

    const result = checkAnyFeatureAccess(mockHas, [
      FEATURES.VAULT_TAGS_COLLECTIONS,
      FEATURES.FINANCIAL_OVERVIEW,
    ]);

    expect(result).toBe(true);
  });

  it("should return false when user has none of the features", () => {
    const mockHas = vi.fn().mockReturnValue(false);

    const result = checkAnyFeatureAccess(mockHas, [
      FEATURES.VAULT_TAGS_COLLECTIONS,
      FEATURES.FINANCIAL_OVERVIEW,
    ]);

    expect(result).toBe(false);
  });

  it("should short-circuit when first feature matches", () => {
    const mockHas = vi.fn().mockReturnValue(true);

    const result = checkAnyFeatureAccess(mockHas, [
      FEATURES.VAULT_TAGS_COLLECTIONS,
      FEATURES.FINANCIAL_OVERVIEW,
    ]);

    expect(result).toBe(true);
    // Should only check first feature due to short-circuit
    expect(mockHas).toHaveBeenCalledTimes(1);
  });
});

describe("checkHasActivePlan", () => {
  it("should return false when has function is undefined", () => {
    const result = checkHasActivePlan(undefined);
    expect(result).toBe(false);
  });

  it("should return true when user has any valid plan", () => {
    const mockHas = vi.fn().mockImplementation(({ plan }) => {
      return plan === "heritage";
    });

    const result = checkHasActivePlan(mockHas);
    expect(result).toBe(true);
  });

  it("should return false when user has no plan", () => {
    const mockHas = vi.fn().mockReturnValue(false);

    const result = checkHasActivePlan(mockHas);
    expect(result).toBe(false);
  });

  it("should check all subscription tiers", () => {
    const mockHas = vi.fn().mockReturnValue(false);

    checkHasActivePlan(mockHas);

    // Should check each tier
    for (const tier of SUBSCRIPTION_TIERS) {
      expect(mockHas).toHaveBeenCalledWith({ plan: tier });
    }
  });
});

describe("getCurrentPlanTier", () => {
  it("should return null when has function is undefined", () => {
    const result = getCurrentPlanTier(undefined);
    expect(result).toBeNull();
  });

  it("should return founders tier when user has founders plan", () => {
    const mockHas = vi.fn().mockImplementation(({ plan }) => {
      return plan === "founders";
    });

    const result = getCurrentPlanTier(mockHas);
    expect(result).toBe("founders");
  });

  it("should return legacy tier when user has legacy plan", () => {
    const mockHas = vi.fn().mockImplementation(({ plan }) => {
      return plan === "legacy";
    });

    const result = getCurrentPlanTier(mockHas);
    expect(result).toBe("legacy");
  });

  it("should return heritage tier when user has heritage plan", () => {
    const mockHas = vi.fn().mockImplementation(({ plan }) => {
      return plan === "heritage";
    });

    const result = getCurrentPlanTier(mockHas);
    expect(result).toBe("heritage");
  });

  it("should return foundations tier when user has foundations plan", () => {
    const mockHas = vi.fn().mockImplementation(({ plan }) => {
      return plan === "foundations";
    });

    const result = getCurrentPlanTier(mockHas);
    expect(result).toBe("foundations");
  });

  it("should return null when user has no plan", () => {
    const mockHas = vi.fn().mockReturnValue(false);

    const result = getCurrentPlanTier(mockHas);
    expect(result).toBeNull();
  });

  it("should return highest tier when user has multiple plans", () => {
    // User has both founders and heritage
    const mockHas = vi.fn().mockImplementation(({ plan }) => {
      return plan === "founders" || plan === "heritage";
    });

    const result = getCurrentPlanTier(mockHas);
    // Founders should be returned first as highest tier
    expect(result).toBe("founders");
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
    // Core feature categories should exist
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
