import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireAdmin, requireAuth } from "./auth";

/**
 * Educational Articles Module
 *
 * Admin-managed content for Faith & Finances and other educational resources.
 */

// Validators for reuse
const articleCategoryValidator = v.union(
  v.literal("estate_planning"),
  v.literal("financial_planning"),
  v.literal("family_legacy"),
  v.literal("legal"),
  v.literal("insurance"),
  v.literal("digital_legacy"),
  v.literal("end_of_life"),
  v.literal("faith_stewardship"),
  v.literal("other"),
);

const articleStatusValidator = v.union(
  v.literal("draft"),
  v.literal("published"),
  v.literal("archived"),
);

// ============================================================================
// QUERIES
// ============================================================================

/**
 * List all articles (admin view)
 */
export const listAll = query({
  args: {
    status: v.optional(articleStatusValidator),
    category: v.optional(articleCategoryValidator),
  },
  returns: v.array(
    v.object({
      _id: v.id("educationalArticles"),
      _creationTime: v.number(),
      title: v.string(),
      slug: v.string(),
      excerpt: v.string(),
      category: v.string(),
      status: v.string(),
      readTimeMinutes: v.number(),
      viewCount: v.number(),
      publishedAt: v.optional(v.number()),
      updatedAt: v.number(),
    }),
  ),
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    let articles = await ctx.db.query("educationalArticles").order("desc").collect();

    // Filter by status if provided
    if (args.status) {
      articles = articles.filter((a) => a.status === args.status);
    }

    // Filter by category if provided
    if (args.category) {
      articles = articles.filter((a) => a.category === args.category);
    }

    return articles.map((article) => ({
      _id: article._id,
      _creationTime: article._creationTime,
      title: article.title,
      slug: article.slug,
      excerpt: article.excerpt,
      category: article.category,
      status: article.status,
      readTimeMinutes: article.readTimeMinutes,
      viewCount: article.viewCount,
      publishedAt: article.publishedAt,
      updatedAt: article.updatedAt,
    }));
  },
});

/**
 * Get published articles for public display
 */
export const listPublished = query({
  args: {
    category: v.optional(articleCategoryValidator),
    limit: v.optional(v.number()),
  },
  returns: v.array(
    v.object({
      _id: v.id("educationalArticles"),
      title: v.string(),
      slug: v.string(),
      excerpt: v.string(),
      category: v.string(),
      readTimeMinutes: v.number(),
      featuredImageUrl: v.optional(v.string()),
      publishedAt: v.optional(v.number()),
    }),
  ),
  handler: async (ctx, args) => {
    const limit = args.limit ?? 20;

    let articles = await ctx.db
      .query("educationalArticles")
      .withIndex("by_status", (q) => q.eq("status", "published"))
      .order("desc")
      .take(limit);

    // Filter by category if provided
    if (args.category) {
      articles = articles.filter((a) => a.category === args.category);
    }

    return articles.map((article) => ({
      _id: article._id,
      title: article.title,
      slug: article.slug,
      excerpt: article.excerpt,
      category: article.category,
      readTimeMinutes: article.readTimeMinutes,
      featuredImageUrl: article.featuredImageUrl,
      publishedAt: article.publishedAt,
    }));
  },
});

/**
 * Get a single article by ID (admin view - includes all fields)
 */
export const get = query({
  args: {
    id: v.id("educationalArticles"),
  },
  returns: v.union(
    v.object({
      _id: v.id("educationalArticles"),
      _creationTime: v.number(),
      title: v.string(),
      slug: v.string(),
      content: v.string(),
      excerpt: v.string(),
      category: v.string(),
      status: v.string(),
      readTimeMinutes: v.number(),
      featuredImageUrl: v.optional(v.string()),
      viewCount: v.number(),
      authorId: v.string(),
      publishedAt: v.optional(v.number()),
      updatedAt: v.number(),
    }),
    v.null(),
  ),
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const article = await ctx.db.get(args.id);
    if (!article) return null;

    return {
      _id: article._id,
      _creationTime: article._creationTime,
      title: article.title,
      slug: article.slug,
      content: article.content,
      excerpt: article.excerpt,
      category: article.category,
      status: article.status,
      readTimeMinutes: article.readTimeMinutes,
      featuredImageUrl: article.featuredImageUrl,
      viewCount: article.viewCount,
      authorId: article.authorId,
      publishedAt: article.publishedAt,
      updatedAt: article.updatedAt,
    };
  },
});

/**
 * Get a published article by slug (public view)
 */
export const getBySlug = query({
  args: {
    slug: v.string(),
  },
  returns: v.union(
    v.object({
      _id: v.id("educationalArticles"),
      title: v.string(),
      slug: v.string(),
      content: v.string(),
      excerpt: v.string(),
      category: v.string(),
      readTimeMinutes: v.number(),
      featuredImageUrl: v.optional(v.string()),
      publishedAt: v.optional(v.number()),
    }),
    v.null(),
  ),
  handler: async (ctx, args) => {
    const article = await ctx.db
      .query("educationalArticles")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();

    if (!article || article.status !== "published") return null;

    return {
      _id: article._id,
      title: article.title,
      slug: article.slug,
      content: article.content,
      excerpt: article.excerpt,
      category: article.category,
      readTimeMinutes: article.readTimeMinutes,
      featuredImageUrl: article.featuredImageUrl,
      publishedAt: article.publishedAt,
    };
  },
});

// ============================================================================
// MUTATIONS
// ============================================================================

/**
 * Create a new article
 */
export const create = mutation({
  args: {
    title: v.string(),
    slug: v.string(),
    content: v.string(),
    excerpt: v.string(),
    category: articleCategoryValidator,
    readTimeMinutes: v.number(),
    featuredImageUrl: v.optional(v.string()),
    status: v.optional(articleStatusValidator),
  },
  returns: v.id("educationalArticles"),
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const { user } = await requireAuth(ctx);

    // Check for duplicate slug
    const existing = await ctx.db
      .query("educationalArticles")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();

    if (existing) {
      throw new Error(`An article with slug "${args.slug}" already exists`);
    }

    const status = args.status ?? "draft";
    const now = Date.now();

    const articleId = await ctx.db.insert("educationalArticles", {
      title: args.title,
      slug: args.slug,
      content: args.content,
      excerpt: args.excerpt,
      category: args.category,
      readTimeMinutes: args.readTimeMinutes,
      featuredImageUrl: args.featuredImageUrl,
      status,
      viewCount: 0,
      authorId: user._id,
      publishedAt: status === "published" ? now : undefined,
      updatedAt: now,
    });

    return articleId;
  },
});

/**
 * Update an existing article
 */
export const update = mutation({
  args: {
    id: v.id("educationalArticles"),
    title: v.optional(v.string()),
    slug: v.optional(v.string()),
    content: v.optional(v.string()),
    excerpt: v.optional(v.string()),
    category: v.optional(articleCategoryValidator),
    readTimeMinutes: v.optional(v.number()),
    featuredImageUrl: v.optional(v.string()),
    status: v.optional(articleStatusValidator),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const article = await ctx.db.get(args.id);
    if (!article) {
      throw new Error("Article not found");
    }

    // Check for duplicate slug if changing
    const newSlug = args.slug;
    if (newSlug && newSlug !== article.slug) {
      const existing = await ctx.db
        .query("educationalArticles")
        .withIndex("by_slug", (q) => q.eq("slug", newSlug))
        .unique();

      if (existing) {
        throw new Error(`An article with slug "${newSlug}" already exists`);
      }
    }

    const now = Date.now();
    const wasPublished = article.status === "published";
    const willBePublished = args.status === "published";

    await ctx.db.patch(args.id, {
      ...(args.title !== undefined && { title: args.title }),
      ...(args.slug !== undefined && { slug: args.slug }),
      ...(args.content !== undefined && { content: args.content }),
      ...(args.excerpt !== undefined && { excerpt: args.excerpt }),
      ...(args.category !== undefined && { category: args.category }),
      ...(args.readTimeMinutes !== undefined && { readTimeMinutes: args.readTimeMinutes }),
      ...(args.featuredImageUrl !== undefined && { featuredImageUrl: args.featuredImageUrl }),
      ...(args.status !== undefined && { status: args.status }),
      // Set publishedAt when first published
      ...(!wasPublished && willBePublished && { publishedAt: now }),
      updatedAt: now,
    });

    return null;
  },
});

/**
 * Delete an article
 */
export const remove = mutation({
  args: {
    id: v.id("educationalArticles"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const article = await ctx.db.get(args.id);
    if (!article) {
      throw new Error("Article not found");
    }

    await ctx.db.delete(args.id);

    return null;
  },
});

/**
 * Increment view count (called when article is viewed)
 */
export const incrementViewCount = mutation({
  args: {
    id: v.id("educationalArticles"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const article = await ctx.db.get(args.id);
    if (!article) return null;

    await ctx.db.patch(args.id, {
      viewCount: article.viewCount + 1,
    });

    return null;
  },
});
