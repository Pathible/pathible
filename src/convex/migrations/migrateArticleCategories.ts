/**
 * Migration: Update Article Categories
 *
 * This migration updates all existing articles from legacy category values
 * to the new category naming convention:
 *
 * - faith_stewardship → beliefs_values
 * - estate_planning → family_planning
 * - financial_planning → financial_clarity
 * - family_legacy → family_legacy (unchanged)
 * - legal → legal_basics
 * - insurance → insurance_essentials
 * - digital_legacy → digital_access
 * - end_of_life → after_loss
 * - other → more
 *
 * Run this migration after deploying the schema changes.
 */

import { v } from "convex/values";
import { internalMutation } from "../_generated/server";
import type { ArticleCategory } from "../shared/categories";
import { LEGACY_CATEGORY_MAPPING } from "../shared/categories";

/**
 * Migrate all articles to use new category values
 * Run with: npx convex run migrations/migrateArticleCategories:migrateCategories
 */
export const migrateCategories = internalMutation({
  args: {},
  returns: v.object({
    total: v.number(),
    migrated: v.number(),
    alreadyMigrated: v.number(),
    errors: v.array(v.string()),
  }),
  handler: async (ctx) => {
    const articles = await ctx.db.query("educationalArticles").collect();

    let migrated = 0;
    let alreadyMigrated = 0;
    const errors: string[] = [];

    for (const article of articles) {
      const currentCategory = article.category;

      // Check if the category needs migration
      if (currentCategory in LEGACY_CATEGORY_MAPPING) {
        const newCategory = LEGACY_CATEGORY_MAPPING[currentCategory] as ArticleCategory;

        try {
          await ctx.db.patch(article._id, {
            category: newCategory,
          });
          migrated++;
          console.log(`Migrated article "${article.title}": ${currentCategory} → ${newCategory}`);
        } catch (error) {
          const errorMessage = `Failed to migrate article "${article.title}": ${error}`;
          errors.push(errorMessage);
          console.error(errorMessage);
        }
      } else {
        alreadyMigrated++;
        console.log(`Article "${article.title}" already uses new category: ${currentCategory}`);
      }
    }

    console.log(`\nMigration complete:`);
    console.log(`  Total articles: ${articles.length}`);
    console.log(`  Migrated: ${migrated}`);
    console.log(`  Already migrated: ${alreadyMigrated}`);
    console.log(`  Errors: ${errors.length}`);

    return {
      total: articles.length,
      migrated,
      alreadyMigrated,
      errors,
    };
  },
});

/**
 * Preview migration without making changes
 * Run with: npx convex run migrations/migrateArticleCategories:previewMigration
 */
export const previewMigration = internalMutation({
  args: {},
  returns: v.object({
    total: v.number(),
    needsMigration: v.number(),
    alreadyMigrated: v.number(),
    changes: v.array(
      v.object({
        title: v.string(),
        currentCategory: v.string(),
        newCategory: v.string(),
      }),
    ),
  }),
  handler: async (ctx) => {
    const articles = await ctx.db.query("educationalArticles").collect();

    const changes: Array<{ title: string; currentCategory: string; newCategory: string }> = [];
    let alreadyMigrated = 0;

    for (const article of articles) {
      const currentCategory = article.category;

      if (currentCategory in LEGACY_CATEGORY_MAPPING) {
        const newCategory = LEGACY_CATEGORY_MAPPING[currentCategory];
        changes.push({
          title: article.title,
          currentCategory,
          newCategory,
        });
      } else {
        alreadyMigrated++;
      }
    }

    console.log(`\nMigration preview:`);
    console.log(`  Total articles: ${articles.length}`);
    console.log(`  Needs migration: ${changes.length}`);
    console.log(`  Already migrated: ${alreadyMigrated}`);

    if (changes.length > 0) {
      console.log(`\nChanges to be made:`);
      for (const change of changes) {
        console.log(`  - "${change.title}": ${change.currentCategory} → ${change.newCategory}`);
      }
    }

    return {
      total: articles.length,
      needsMigration: changes.length,
      alreadyMigrated,
      changes,
    };
  },
});
