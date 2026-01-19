import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireAdmin, requireAuth } from "./auth";
import { articleCategoryValidator } from "./shared/categories";

const articleStatusValidator = v.union(
  v.literal("draft"),
  v.literal("published"),
  v.literal("archived"),
);

const articleVisibilityValidator = v.union(v.literal("public"), v.literal("subscribers"));

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
    visibility: v.optional(articleVisibilityValidator),
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
      visibility: v.union(v.literal("public"), v.literal("subscribers")),
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

    // Filter by visibility if provided
    if (args.visibility) {
      articles = articles.filter((a) => (a.visibility ?? "subscribers") === args.visibility);
    }

    return articles.map((article) => ({
      _id: article._id,
      _creationTime: article._creationTime,
      title: article.title,
      slug: article.slug,
      excerpt: article.excerpt,
      category: article.category,
      status: article.status,
      visibility: article.visibility ?? "subscribers", // Default to subscribers for existing articles
      readTimeMinutes: article.readTimeMinutes,
      viewCount: article.viewCount,
      publishedAt: article.publishedAt,
      updatedAt: article.updatedAt,
    }));
  },
});

/**
 * Get published articles for authenticated users (dashboard view)
 * Includes both public and subscriber articles
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
      visibility: v.union(v.literal("public"), v.literal("subscribers")),
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
      visibility: article.visibility ?? "subscribers",
      readTimeMinutes: article.readTimeMinutes,
      featuredImageUrl: article.featuredImageUrl,
      publishedAt: article.publishedAt,
    }));
  },
});

/**
 * List public articles for the /learn page (no auth required)
 * Returns only published articles with visibility="public"
 */
export const listPublicArticles = query({
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

    // Use composite index for efficient querying
    let articles = await ctx.db
      .query("educationalArticles")
      .withIndex("by_status_and_visibility", (q) =>
        q.eq("status", "published").eq("visibility", "public"),
      )
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
 * List subscriber-only article previews for the /learn page (no auth required)
 * Returns metadata only (no content) for subscriber articles to show as teasers
 */
export const listSubscriberArticlePreviews = query({
  args: {
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
    }),
  ),
  handler: async (ctx, args) => {
    const limit = args.limit ?? 10;

    // Get subscriber-only published articles
    const articles = await ctx.db
      .query("educationalArticles")
      .withIndex("by_status_and_visibility", (q) =>
        q.eq("status", "published").eq("visibility", "subscribers"),
      )
      .order("desc")
      .take(limit);

    return articles.map((article) => ({
      _id: article._id,
      title: article.title,
      slug: article.slug,
      excerpt: article.excerpt,
      category: article.category,
      readTimeMinutes: article.readTimeMinutes,
      featuredImageUrl: article.featuredImageUrl,
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
      visibility: v.union(v.literal("public"), v.literal("subscribers")),
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
      visibility: article.visibility ?? "subscribers",
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
 * Get a published article by slug (authenticated dashboard view)
 * Returns full content for all published articles
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
      visibility: v.union(v.literal("public"), v.literal("subscribers")),
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
      visibility: article.visibility ?? "subscribers",
      readTimeMinutes: article.readTimeMinutes,
      featuredImageUrl: article.featuredImageUrl,
      publishedAt: article.publishedAt,
    };
  },
});

/**
 * Get article by slug for public /learn pages (no auth required)
 * - Public articles: Returns full content
 * - Subscriber articles: Returns first ~200 words as teaser with truncation flag
 */
export const getPublicBySlug = query({
  args: {
    slug: v.string(),
  },
  returns: v.union(
    v.object({
      _id: v.id("educationalArticles"),
      title: v.string(),
      slug: v.string(),
      content: v.string(), // Full content for public, teaser for subscribers
      excerpt: v.string(),
      category: v.string(),
      visibility: v.union(v.literal("public"), v.literal("subscribers")),
      readTimeMinutes: v.number(),
      featuredImageUrl: v.optional(v.string()),
      publishedAt: v.optional(v.number()),
      isTruncated: v.boolean(), // True if content is truncated (subscriber-only)
    }),
    v.null(),
  ),
  handler: async (ctx, args) => {
    const article = await ctx.db
      .query("educationalArticles")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();

    if (!article || article.status !== "published") return null;

    const visibility = article.visibility ?? "subscribers";
    const isPublic = visibility === "public";

    // For public articles, return full content
    // For subscriber articles, return first ~200 words as teaser
    let content = article.content;
    let isTruncated = false;

    if (!isPublic) {
      // Extract first ~200 words for teaser
      const words = article.content.split(/\s+/);
      if (words.length > 200) {
        content = `${words.slice(0, 200).join(" ")}...`;
        isTruncated = true;
      }
    }

    return {
      _id: article._id,
      title: article.title,
      slug: article.slug,
      content,
      excerpt: article.excerpt,
      category: article.category,
      visibility,
      readTimeMinutes: article.readTimeMinutes,
      featuredImageUrl: article.featuredImageUrl,
      publishedAt: article.publishedAt,
      isTruncated,
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
    visibility: v.optional(articleVisibilityValidator),
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
    const visibility = args.visibility ?? "subscribers"; // Default to subscribers
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
      visibility,
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
    visibility: v.optional(articleVisibilityValidator),
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
      ...(args.visibility !== undefined && { visibility: args.visibility }),
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
 *
 * SECURITY: Requires authentication to prevent view count manipulation.
 * Each authenticated user can increment the count once per article view.
 */
export const incrementViewCount = mutation({
  args: {
    id: v.id("educationalArticles"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    // Require authentication to prevent anonymous view count manipulation
    await requireAuth(ctx);

    const article = await ctx.db.get(args.id);
    if (!article) return null;

    await ctx.db.patch(args.id, {
      viewCount: article.viewCount + 1,
    });

    return null;
  },
});

// ============================================================================
// USER READ TRACKING
// ============================================================================

/**
 * Mark an article as read for the current user
 * Idempotent - calling multiple times won't create duplicate records
 */
export const markAsRead = mutation({
  args: {
    articleId: v.id("educationalArticles"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { profile } = await requireAuth(ctx);

    // Check if already marked as read
    const existing = await ctx.db
      .query("userArticleReads")
      .withIndex("by_user_and_article", (q) =>
        q.eq("userId", profile._id).eq("articleId", args.articleId),
      )
      .unique();

    if (existing) {
      // Already read, no action needed
      return null;
    }

    // Verify article exists
    const article = await ctx.db.get(args.articleId);
    if (!article) {
      throw new Error("Article not found");
    }

    // Create read record
    await ctx.db.insert("userArticleReads", {
      userId: profile._id,
      articleId: args.articleId,
      readAt: Date.now(),
    });

    return null;
  },
});

/**
 * Get all articles the current user has read
 * Returns article slugs for easy lookup
 */
export const getUserReadArticles = query({
  args: {},
  returns: v.array(
    v.object({
      slug: v.string(),
      readAt: v.number(),
    }),
  ),
  handler: async (ctx) => {
    const { profile } = await requireAuth(ctx);

    // Get all read records for this user
    const readRecords = await ctx.db
      .query("userArticleReads")
      .withIndex("by_user", (q) => q.eq("userId", profile._id))
      .collect();

    // Fetch article slugs
    const results: { slug: string; readAt: number }[] = [];
    for (const record of readRecords) {
      const article = await ctx.db.get(record.articleId);
      if (article) {
        results.push({
          slug: article.slug,
          readAt: record.readAt,
        });
      }
    }

    return results;
  },
});
