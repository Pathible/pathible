/**
 * Centralized Article Categories
 *
 * This is the single source of truth for article categories across the application.
 * All category-related constants, types, and display labels should be imported from here.
 *
 * Category Mapping:
 * - beliefs_values: "Beliefs & Values" (formerly Faith & Stewardship)
 * - family_planning: "Planning for Your Family" (formerly Estate Planning)
 * - financial_clarity: "Financial Clarity" (formerly Financial Planning)
 * - family_legacy: "Family Legacy" (unchanged)
 * - legal_basics: "Legal Basics" (formerly Legal)
 * - insurance_essentials: "Insurance Essentials" (formerly Insurance)
 * - digital_access: "Digital Access" (formerly Digital Legacy)
 * - after_loss: "After a Loss" (formerly End of Life)
 * - more: "More" (formerly Other)
 */

import { v } from "convex/values";

/**
 * Article category values - these are the database identifiers
 */
export const ARTICLE_CATEGORY_VALUES = [
  "beliefs_values",
  "family_planning",
  "financial_clarity",
  "family_legacy",
  "legal_basics",
  "insurance_essentials",
  "digital_access",
  "after_loss",
  "more",
] as const;

/**
 * TypeScript type for article categories
 */
export type ArticleCategory = (typeof ARTICLE_CATEGORY_VALUES)[number];

/**
 * Legacy category values for migration support
 * Maps old database values to new ones
 */
export const LEGACY_CATEGORY_MAPPING: Record<string, ArticleCategory> = {
  faith_stewardship: "beliefs_values",
  estate_planning: "family_planning",
  financial_planning: "financial_clarity",
  family_legacy: "family_legacy",
  legal: "legal_basics",
  insurance: "insurance_essentials",
  digital_legacy: "digital_access",
  end_of_life: "after_loss",
  other: "more",
};

/**
 * Display labels for article categories
 * Use these when showing categories in the UI
 */
export const ARTICLE_CATEGORY_LABELS: Record<ArticleCategory, string> = {
  beliefs_values: "Beliefs & Values",
  family_planning: "Planning for Your Family",
  financial_clarity: "Financial Clarity",
  family_legacy: "Family Legacy",
  legal_basics: "Legal Basics",
  insurance_essentials: "Insurance Essentials",
  digital_access: "Digital Access",
  after_loss: "After a Loss",
  more: "More",
};

/**
 * Helper function to get display label for a category
 */
export function getCategoryLabel(category: ArticleCategory): string {
  return ARTICLE_CATEGORY_LABELS[category] ?? category;
}

/**
 * Helper function to migrate legacy category to new category
 * Returns the new category if it's a legacy value, otherwise returns as-is
 */
export function migrateLegacyCategory(category: string): ArticleCategory {
  if (category in LEGACY_CATEGORY_MAPPING) {
    return LEGACY_CATEGORY_MAPPING[category];
  }
  // If it's already a new category value, return it
  if (ARTICLE_CATEGORY_VALUES.includes(category as ArticleCategory)) {
    return category as ArticleCategory;
  }
  // Default fallback
  return "more";
}

/**
 * Convex validator for article categories
 * Use this in schema definitions and function validators
 *
 * NOTE: This validator includes both new and legacy category values
 * to support the migration period. After running the migration
 * (migrateArticleCategories), you can remove the legacy literals.
 */
export const articleCategoryValidator = v.union(
  // New category values
  v.literal("beliefs_values"),
  v.literal("family_planning"),
  v.literal("financial_clarity"),
  v.literal("family_legacy"),
  v.literal("legal_basics"),
  v.literal("insurance_essentials"),
  v.literal("digital_access"),
  v.literal("after_loss"),
  v.literal("more"),
  // Legacy category values (for migration support - remove after migration)
  v.literal("faith_stewardship"),
  v.literal("estate_planning"),
  v.literal("financial_planning"),
  v.literal("legal"),
  v.literal("insurance"),
  v.literal("digital_legacy"),
  v.literal("end_of_life"),
  v.literal("other"),
);

/**
 * Category options for select dropdowns and forms
 * Returns an array of {value, label} objects
 */
export const ARTICLE_CATEGORY_OPTIONS = ARTICLE_CATEGORY_VALUES.map((value) => ({
  value,
  label: ARTICLE_CATEGORY_LABELS[value],
}));
