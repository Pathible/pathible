import { v } from "convex/values";
import { internalMutation } from "../_generated/server";
import { articleSeedData } from "./articles";

/**
 * Seed Educational Articles
 *
 * This mutation populates the educationalArticles table with initial content.
 * It should be run once during initial setup or to reset article content.
 *
 * Usage from Convex dashboard or CLI:
 *   npx convex run seeds/seedArticles:seed
 *
 * To clear and reseed:
 *   npx convex run seeds/seedArticles:clearAndSeed
 */

/**
 * Seed articles into the database
 * Skips articles that already exist (based on slug)
 */
export const seed = internalMutation({
  args: {
    authorId: v.optional(v.string()),
  },
  returns: v.object({
    created: v.number(),
    skipped: v.number(),
    errors: v.array(v.string()),
  }),
  handler: async (ctx, args) => {
    const authorId = args.authorId ?? "system";
    const now = Date.now();

    let created = 0;
    let skipped = 0;
    const errors: string[] = [];

    for (const article of articleSeedData) {
      try {
        // Check if article with this slug already exists
        const existing = await ctx.db
          .query("educationalArticles")
          .withIndex("by_slug", (q) => q.eq("slug", article.slug))
          .unique();

        if (existing) {
          skipped++;
          continue;
        }

        await ctx.db.insert("educationalArticles", {
          title: article.title,
          slug: article.slug,
          content: article.content,
          excerpt: article.excerpt,
          category: article.category,
          status: article.status,
          visibility: article.visibility,
          readTimeMinutes: article.readTimeMinutes,
          viewCount: article.viewCount,
          authorId: authorId,
          publishedAt: article.status === "published" ? now : undefined,
          updatedAt: now,
        });

        created++;
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        errors.push(`Failed to create "${article.title}": ${message}`);
      }
    }

    return { created, skipped, errors };
  },
});

/**
 * Clear all articles and reseed
 * WARNING: This deletes all existing articles!
 */
export const clearAndSeed = internalMutation({
  args: {
    authorId: v.optional(v.string()),
    confirmDelete: v.boolean(),
  },
  returns: v.object({
    deleted: v.number(),
    created: v.number(),
    errors: v.array(v.string()),
  }),
  handler: async (ctx, args) => {
    if (!args.confirmDelete) {
      return {
        deleted: 0,
        created: 0,
        errors: ["Must set confirmDelete: true to proceed"],
      };
    }

    const authorId = args.authorId ?? "system";
    const now = Date.now();

    // Delete all existing articles
    const existingArticles = await ctx.db.query("educationalArticles").collect();

    let deleted = 0;
    for (const article of existingArticles) {
      await ctx.db.delete(article._id);
      deleted++;
    }

    // Seed new articles
    let created = 0;
    const errors: string[] = [];

    for (const article of articleSeedData) {
      try {
        await ctx.db.insert("educationalArticles", {
          title: article.title,
          slug: article.slug,
          content: article.content,
          excerpt: article.excerpt,
          category: article.category,
          status: article.status,
          visibility: article.visibility,
          readTimeMinutes: article.readTimeMinutes,
          viewCount: article.viewCount,
          authorId: authorId,
          publishedAt: article.status === "published" ? now : undefined,
          updatedAt: now,
        });

        created++;
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        errors.push(`Failed to create "${article.title}": ${message}`);
      }
    }

    return { deleted, created, errors };
  },
});

/**
 * Get seed data info (for verification)
 */
export const getSeedInfo = internalMutation({
  args: {},
  returns: v.object({
    totalArticles: v.number(),
    byCategory: v.array(
      v.object({
        category: v.string(),
        count: v.number(),
      }),
    ),
    articles: v.array(
      v.object({
        title: v.string(),
        slug: v.string(),
        category: v.string(),
      }),
    ),
  }),
  handler: async () => {
    const byCategory: Record<string, number> = {};

    for (const article of articleSeedData) {
      byCategory[article.category] = (byCategory[article.category] || 0) + 1;
    }

    return {
      totalArticles: articleSeedData.length,
      byCategory: Object.entries(byCategory).map(([category, count]) => ({
        category,
        count,
      })),
      articles: articleSeedData.map((a) => ({
        title: a.title,
        slug: a.slug,
        category: a.category,
      })),
    };
  },
});
