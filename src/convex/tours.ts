import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import { internalMutation, mutation, query } from "./_generated/server";
import { requireAdmin, requireAuth } from "./auth";

// ============================================================================
// VALIDATORS
// ============================================================================

const tourStatusValidator = v.union(
  v.literal("draft"),
  v.literal("published"),
  v.literal("archived"),
);

const tourValidator = v.object({
  _id: v.id("tours"),
  _creationTime: v.number(),
  key: v.string(),
  name: v.string(),
  description: v.optional(v.string()),
  status: tourStatusValidator,
  version: v.number(),
  priority: v.number(),
  minTier: v.optional(
    v.union(v.literal("foundations"), v.literal("heritage"), v.literal("legacy")),
  ),
  createdBy: v.string(),
  createdAt: v.number(),
  updatedAt: v.number(),
});

const tourStepValidator = v.object({
  _id: v.id("tourSteps"),
  _creationTime: v.number(),
  tourId: v.id("tours"),
  stepKey: v.string(),
  order: v.number(),
  route: v.string(),
  anchorKey: v.string(),
  title: v.string(),
  body: v.string(),
  enabled: v.boolean(),
  activationKey: v.optional(v.string()),
  versionIntroduced: v.number(),
  createdAt: v.number(),
  updatedAt: v.number(),
});

// ============================================================================
// TOUR QUERIES
// ============================================================================

/**
 * List all tours (admin only)
 * Returns all tours regardless of status
 */
export const listAll = query({
  args: {},
  returns: v.array(tourValidator),
  handler: async (ctx) => {
    await requireAdmin(ctx);

    const tours = await ctx.db.query("tours").withIndex("by_status_and_priority").collect();

    return tours;
  },
});

/**
 * List published tours (for regular users)
 * Only returns published tours, ordered by priority
 */
export const listPublished = query({
  args: {},
  returns: v.array(tourValidator),
  handler: async (ctx) => {
    await requireAuth(ctx);

    const tours = await ctx.db
      .query("tours")
      .withIndex("by_status_and_priority", (q) => q.eq("status", "published"))
      .collect();

    return tours;
  },
});

/**
 * List published tours with their enabled steps (for TourManager)
 * Returns tours ordered by priority with their enabled steps
 */
export const listPublishedWithSteps = query({
  args: {},
  returns: v.array(
    v.object({
      ...tourValidator.fields,
      steps: v.array(
        v.object({
          _id: v.id("tourSteps"),
          stepKey: v.string(),
          order: v.number(),
          route: v.string(),
          anchorKey: v.string(),
          title: v.string(),
          body: v.string(),
          versionIntroduced: v.number(),
        }),
      ),
    }),
  ),
  handler: async (ctx) => {
    await requireAuth(ctx);

    const tours = await ctx.db
      .query("tours")
      .withIndex("by_status_and_priority", (q) => q.eq("status", "published"))
      .collect();

    // Fetch enabled steps for each tour
    const toursWithSteps = await Promise.all(
      tours.map(async (tour) => {
        const steps = await ctx.db
          .query("tourSteps")
          .withIndex("by_tour_and_order", (q) => q.eq("tourId", tour._id))
          .collect();

        const enabledSteps = steps
          .filter((step) => step.enabled)
          .map((step) => ({
            _id: step._id,
            stepKey: step.stepKey,
            order: step.order,
            route: step.route,
            anchorKey: step.anchorKey,
            title: step.title,
            body: step.body,
            versionIntroduced: step.versionIntroduced,
          }));

        return {
          ...tour,
          steps: enabledSteps,
        };
      }),
    );

    return toursWithSteps;
  },
});

/**
 * Get a single tour by ID (admin only)
 */
export const get = query({
  args: { tourId: v.id("tours") },
  returns: v.union(tourValidator, v.null()),
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    return await ctx.db.get(args.tourId);
  },
});

/**
 * Get a tour by key (for regular users, only if published)
 */
export const getByKey = query({
  args: { key: v.string() },
  returns: v.union(tourValidator, v.null()),
  handler: async (ctx, args) => {
    await requireAuth(ctx);

    const tour = await ctx.db
      .query("tours")
      .withIndex("by_key", (q) => q.eq("key", args.key))
      .unique();

    // Only return if published
    if (tour && tour.status === "published") {
      return tour;
    }

    return null;
  },
});

// ============================================================================
// TOUR MUTATIONS
// ============================================================================

/**
 * Create a new tour (admin only)
 * Tours start as drafts with version 1
 */
export const create = mutation({
  args: {
    key: v.string(),
    name: v.string(),
    description: v.optional(v.string()),
    priority: v.optional(v.number()),
  },
  returns: v.id("tours"),
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    // Get the admin's user ID
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Check if key already exists
    const existing = await ctx.db
      .query("tours")
      .withIndex("by_key", (q) => q.eq("key", args.key))
      .unique();

    if (existing) {
      throw new Error(`Tour with key "${args.key}" already exists`);
    }

    const now = Date.now();

    const tourId = await ctx.db.insert("tours", {
      key: args.key,
      name: args.name,
      description: args.description,
      status: "draft",
      version: 1,
      priority: args.priority ?? 100,
      createdBy: identity.subject,
      createdAt: now,
      updatedAt: now,
    });

    return tourId;
  },
});

/**
 * Update tour settings (admin only)
 * Does not affect version - use bumpVersion for that
 */
export const update = mutation({
  args: {
    tourId: v.id("tours"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    status: v.optional(tourStatusValidator),
    priority: v.optional(v.number()),
    minTier: v.optional(
      v.union(v.literal("foundations"), v.literal("heritage"), v.literal("legacy")),
    ),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const tour = await ctx.db.get(args.tourId);
    if (!tour) {
      throw new Error("Tour not found");
    }

    const updates: Record<string, unknown> = {
      updatedAt: Date.now(),
    };

    if (args.name !== undefined) updates.name = args.name;
    if (args.description !== undefined) updates.description = args.description;
    if (args.status !== undefined) updates.status = args.status;
    if (args.priority !== undefined) updates.priority = args.priority;
    if (args.minTier !== undefined) updates.minTier = args.minTier;

    await ctx.db.patch(args.tourId, updates);

    return null;
  },
});

/**
 * Archive a tour (admin only)
 * Sets status to archived
 */
export const archive = mutation({
  args: { tourId: v.id("tours") },
  returns: v.null(),
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const tour = await ctx.db.get(args.tourId);
    if (!tour) {
      throw new Error("Tour not found");
    }

    await ctx.db.patch(args.tourId, {
      status: "archived",
      updatedAt: Date.now(),
    });

    return null;
  },
});

/**
 * Bump tour version (admin only)
 * Increments version by 1
 * New steps added after this will get the new versionIntroduced
 */
export const bumpVersion = mutation({
  args: { tourId: v.id("tours") },
  returns: v.number(),
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const tour = await ctx.db.get(args.tourId);
    if (!tour) {
      throw new Error("Tour not found");
    }

    const newVersion = tour.version + 1;

    await ctx.db.patch(args.tourId, {
      version: newVersion,
      updatedAt: Date.now(),
    });

    return newVersion;
  },
});

// ============================================================================
// TOUR STEPS QUERIES
// ============================================================================

/**
 * List all steps for a tour (admin only)
 */
export const listSteps = query({
  args: { tourId: v.id("tours") },
  returns: v.array(tourStepValidator),
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const steps = await ctx.db
      .query("tourSteps")
      .withIndex("by_tour_and_order", (q) => q.eq("tourId", args.tourId))
      .collect();

    return steps;
  },
});

/**
 * List enabled steps for a tour (for regular users)
 * Only returns enabled steps from published tours
 */
export const listEnabledSteps = query({
  args: { tourKey: v.string() },
  returns: v.array(tourStepValidator),
  handler: async (ctx, args) => {
    await requireAuth(ctx);

    // Get the published tour
    const tour = await ctx.db
      .query("tours")
      .withIndex("by_key", (q) => q.eq("key", args.tourKey))
      .unique();

    if (!tour || tour.status !== "published") {
      return [];
    }

    // Get all steps and filter for enabled
    const steps = await ctx.db
      .query("tourSteps")
      .withIndex("by_tour_and_order", (q) => q.eq("tourId", tour._id))
      .collect();

    return steps.filter((step) => step.enabled);
  },
});

// ============================================================================
// TOUR STEPS MUTATIONS
// ============================================================================

/**
 * Create a new tour step (admin only)
 * versionIntroduced is set to the current tour version
 */
export const createStep = mutation({
  args: {
    tourId: v.id("tours"),
    stepKey: v.string(),
    route: v.string(),
    anchorKey: v.string(),
    title: v.string(),
    body: v.string(),
    enabled: v.optional(v.boolean()),
    activationKey: v.optional(v.string()),
  },
  returns: v.id("tourSteps"),
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const tour = await ctx.db.get(args.tourId);
    if (!tour) {
      throw new Error("Tour not found");
    }

    // Check if stepKey already exists in this tour
    const existingStep = await ctx.db
      .query("tourSteps")
      .withIndex("by_tour_and_stepKey", (q) =>
        q.eq("tourId", args.tourId).eq("stepKey", args.stepKey),
      )
      .unique();

    if (existingStep) {
      throw new Error(`Step with key "${args.stepKey}" already exists in this tour`);
    }

    // Get the current max order for this tour
    const existingSteps = await ctx.db
      .query("tourSteps")
      .withIndex("by_tour_and_order", (q) => q.eq("tourId", args.tourId))
      .collect();

    const maxOrder = existingSteps.reduce((max, step) => Math.max(max, step.order), -1);

    const now = Date.now();

    const stepId = await ctx.db.insert("tourSteps", {
      tourId: args.tourId,
      stepKey: args.stepKey,
      order: maxOrder + 1,
      route: args.route,
      anchorKey: args.anchorKey,
      title: args.title,
      body: args.body,
      enabled: args.enabled ?? true,
      activationKey: args.activationKey,
      versionIntroduced: tour.version,
      createdAt: now,
      updatedAt: now,
    });

    // Update tour's updatedAt
    await ctx.db.patch(args.tourId, { updatedAt: now });

    return stepId;
  },
});

/**
 * Update a tour step (admin only)
 * Note: versionIntroduced is read-only after creation
 */
export const updateStep = mutation({
  args: {
    stepId: v.id("tourSteps"),
    route: v.optional(v.string()),
    anchorKey: v.optional(v.string()),
    title: v.optional(v.string()),
    body: v.optional(v.string()),
    enabled: v.optional(v.boolean()),
    activationKey: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const step = await ctx.db.get(args.stepId);
    if (!step) {
      throw new Error("Step not found");
    }

    const now = Date.now();

    const updates: Record<string, unknown> = {
      updatedAt: now,
    };

    if (args.route !== undefined) updates.route = args.route;
    if (args.anchorKey !== undefined) updates.anchorKey = args.anchorKey;
    if (args.title !== undefined) updates.title = args.title;
    if (args.body !== undefined) updates.body = args.body;
    if (args.enabled !== undefined) updates.enabled = args.enabled;
    if (args.activationKey !== undefined) updates.activationKey = args.activationKey;

    await ctx.db.patch(args.stepId, updates);

    // Update tour's updatedAt
    await ctx.db.patch(step.tourId, { updatedAt: now });

    return null;
  },
});

/**
 * Delete a tour step (admin only)
 */
export const deleteStep = mutation({
  args: { stepId: v.id("tourSteps") },
  returns: v.null(),
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const step = await ctx.db.get(args.stepId);
    if (!step) {
      throw new Error("Step not found");
    }

    const tourId = step.tourId;

    await ctx.db.delete(args.stepId);

    // Reorder remaining steps to maintain contiguous order
    const remainingSteps = await ctx.db
      .query("tourSteps")
      .withIndex("by_tour_and_order", (q) => q.eq("tourId", tourId))
      .collect();

    // Sort by current order and reassign
    remainingSteps.sort((a, b) => a.order - b.order);
    for (let i = 0; i < remainingSteps.length; i++) {
      if (remainingSteps[i].order !== i) {
        await ctx.db.patch(remainingSteps[i]._id, { order: i });
      }
    }

    // Update tour's updatedAt
    await ctx.db.patch(tourId, { updatedAt: Date.now() });

    return null;
  },
});

/**
 * Reorder tour steps (admin only)
 * Takes an array of step IDs in the new order
 */
export const reorderSteps = mutation({
  args: {
    tourId: v.id("tours"),
    stepIds: v.array(v.id("tourSteps")),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const tour = await ctx.db.get(args.tourId);
    if (!tour) {
      throw new Error("Tour not found");
    }

    const now = Date.now();

    // Update each step's order based on its position in the array
    for (let i = 0; i < args.stepIds.length; i++) {
      const step = await ctx.db.get(args.stepIds[i]);
      if (!step) {
        throw new Error(`Step ${args.stepIds[i]} not found`);
      }
      if (step.tourId !== args.tourId) {
        throw new Error(`Step ${args.stepIds[i]} does not belong to this tour`);
      }

      if (step.order !== i) {
        await ctx.db.patch(args.stepIds[i], {
          order: i,
          updatedAt: now,
        });
      }
    }

    // Update tour's updatedAt
    await ctx.db.patch(args.tourId, { updatedAt: now });

    return null;
  },
});

// ============================================================================
// USER TOUR STATE
// ============================================================================

const userTourStateValidator = v.object({
  _id: v.id("userTourState"),
  _creationTime: v.number(),
  userId: v.id("profiles"),
  tourId: v.id("tours"),
  lastSeenVersion: v.number(),
  dismissed: v.boolean(),
  dismissedAt: v.optional(v.number()),
  completedStepKeys: v.array(v.string()),
  createdAt: v.number(),
  updatedAt: v.number(),
});

/**
 * Get user's state for a specific tour
 */
export const getUserTourState = query({
  args: { tourId: v.id("tours") },
  returns: v.union(userTourStateValidator, v.null()),
  handler: async (ctx, args) => {
    const { profile } = await requireAuth(ctx);

    const state = await ctx.db
      .query("userTourState")
      .withIndex("by_user_and_tour", (q) => q.eq("userId", profile._id).eq("tourId", args.tourId))
      .unique();

    return state;
  },
});

/**
 * Get all tour states for the current user
 */
export const getUserTourStates = query({
  args: {},
  returns: v.array(userTourStateValidator),
  handler: async (ctx) => {
    const { profile } = await requireAuth(ctx);

    const states = await ctx.db
      .query("userTourState")
      .withIndex("by_user_and_tour", (q) => q.eq("userId", profile._id))
      .collect();

    return states;
  },
});

/**
 * Mark a step as completed
 */
export const completeStep = mutation({
  args: {
    tourId: v.id("tours"),
    stepKey: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { profile } = await requireAuth(ctx);

    const tour = await ctx.db.get(args.tourId);
    if (!tour) {
      throw new Error("Tour not found");
    }

    const now = Date.now();

    // Get or create user tour state
    const state = await ctx.db
      .query("userTourState")
      .withIndex("by_user_and_tour", (q) => q.eq("userId", profile._id).eq("tourId", args.tourId))
      .unique();

    if (!state) {
      await ctx.db.insert("userTourState", {
        userId: profile._id,
        tourId: args.tourId,
        lastSeenVersion: tour.version,
        dismissed: false,
        completedStepKeys: [args.stepKey],
        createdAt: now,
        updatedAt: now,
      });
    } else {
      // Add step key if not already completed
      const completedKeys = state.completedStepKeys.includes(args.stepKey)
        ? state.completedStepKeys
        : [...state.completedStepKeys, args.stepKey];

      await ctx.db.patch(state._id, {
        completedStepKeys: completedKeys,
        lastSeenVersion: tour.version,
        updatedAt: now,
      });
    }

    return null;
  },
});

/**
 * Dismiss a tour
 */
export const dismissTour = mutation({
  args: { tourId: v.id("tours") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { profile } = await requireAuth(ctx);

    const tour = await ctx.db.get(args.tourId);
    if (!tour) {
      throw new Error("Tour not found");
    }

    const now = Date.now();

    // Get or create user tour state
    const state = await ctx.db
      .query("userTourState")
      .withIndex("by_user_and_tour", (q) => q.eq("userId", profile._id).eq("tourId", args.tourId))
      .unique();

    if (!state) {
      await ctx.db.insert("userTourState", {
        userId: profile._id,
        tourId: args.tourId,
        lastSeenVersion: tour.version,
        dismissed: true,
        dismissedAt: now,
        completedStepKeys: [],
        createdAt: now,
        updatedAt: now,
      });
    } else {
      await ctx.db.patch(state._id, {
        dismissed: true,
        dismissedAt: now,
        lastSeenVersion: tour.version,
        updatedAt: now,
      });
    }

    return null;
  },
});

/**
 * Reset tour state (allows re-taking a tour)
 */
export const resetTourState = mutation({
  args: { tourId: v.id("tours") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { profile } = await requireAuth(ctx);

    const state = await ctx.db
      .query("userTourState")
      .withIndex("by_user_and_tour", (q) => q.eq("userId", profile._id).eq("tourId", args.tourId))
      .unique();

    if (state) {
      await ctx.db.patch(state._id, {
        dismissed: false,
        dismissedAt: undefined,
        completedStepKeys: [],
        updatedAt: Date.now(),
      });
    }

    return null;
  },
});

// ============================================================================
// SEED DATA (Admin only - for initial setup)
// ============================================================================

/**
 * Seed the Welcome Tour (admin only)
 * Creates a published tour with steps that guide new users through the dashboard
 */
export const seedWelcomeTour = mutation({
  args: {},
  returns: v.id("tours"),
  handler: async (ctx) => {
    await requireAdmin(ctx);

    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Check if welcome tour already exists (ignore archived tours)
    const existing = await ctx.db
      .query("tours")
      .withIndex("by_key", (q) => q.eq("key", "welcome-tour"))
      .unique();

    if (existing && existing.status !== "archived") {
      throw new Error(
        "Welcome Tour already exists. Archive it first or use the editor to modify it.",
      );
    }

    // If archived version exists, we'll create a new one with a different key
    const tourKey = existing ? `welcome-tour-${Date.now()}` : "welcome-tour";

    const now = Date.now();

    // Create the tour
    const tourId = await ctx.db.insert("tours", {
      key: tourKey,
      name: "Welcome to Pathible",
      description: "A quick tour to help you get started with your legacy planning journey.",
      status: "published",
      version: 1,
      priority: 10, // High priority so it shows first
      createdBy: identity.subject,
      createdAt: now,
      updatedAt: now,
    });

    // Define the tour steps (9 steps covering dashboard and all navigation)
    const steps = [
      {
        stepKey: "welcome-stats",
        route: "/dashboard",
        anchorKey: "dashboard-stats",
        title: "Your Legacy at a Glance",
        body: "These cards show your progress across all areas of Pathible. Track your vault documents, wisdom entries, and legacy plan completion here.",
      },
      {
        stepKey: "welcome-next-step",
        route: "/dashboard",
        anchorKey: "next-step-cta",
        title: "Personalized Guidance",
        body: "Based on your progress, we suggest the best next action to take. Click here anytime to continue building your legacy.",
      },
      {
        stepKey: "welcome-reflection",
        route: "/dashboard",
        anchorKey: "daily-reflection",
        title: "Daily Inspiration",
        body: "Start each day with wisdom and reflection. These curated quotes help you stay connected to your values and purpose.",
      },
      {
        stepKey: "welcome-nav-dashboard",
        route: "/dashboard",
        anchorKey: "nav-dashboard",
        title: "Your Dashboard",
        body: "This is your home base. Return here anytime to see your progress and get personalized recommendations for your next steps.",
      },
      {
        stepKey: "welcome-nav-vault",
        route: "/dashboard",
        anchorKey: "nav-vault",
        title: "Heritage Vault",
        body: "Securely store important documents like wills, insurance policies, and family records. Everything your loved ones will need, organized in one place.",
      },
      {
        stepKey: "welcome-nav-financial",
        route: "/dashboard",
        anchorKey: "nav-financial",
        title: "Financial Intelligence",
        body: "Track your accounts, insurance policies, and property in one place. Get a clear picture of your financial legacy.",
      },
      {
        stepKey: "welcome-nav-family",
        route: "/dashboard",
        anchorKey: "nav-family",
        title: "Family Ecosystem",
        body: "Connect with your family members and manage roles and permissions. Decide who can access what when the time comes.",
      },
      {
        stepKey: "welcome-nav-wisdom",
        route: "/dashboard",
        anchorKey: "nav-wisdom",
        title: "Wisdom & Education",
        body: "Capture life lessons, stories, and values to pass down to future generations. This is your space to share what matters most.",
      },
      {
        stepKey: "welcome-nav-legacy",
        route: "/dashboard",
        anchorKey: "nav-legacy",
        title: "Legacy Planning",
        body: "Document your final wishes, write letters to loved ones, and ensure your story is preserved. This is the heart of Pathible.",
      },
    ];

    // Create each step
    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      await ctx.db.insert("tourSteps", {
        tourId,
        stepKey: step.stepKey,
        order: i,
        route: step.route,
        anchorKey: step.anchorKey,
        title: step.title,
        body: step.body,
        enabled: true,
        versionIntroduced: 1,
        createdAt: now,
        updatedAt: now,
      });
    }

    return tourId;
  },
});

/**
 * Seed Feature Tours (admin only)
 * Creates tours for each major feature module: Vault, Wisdom, Family, Financial, Legacy
 */
export const seedFeatureTours = mutation({
  args: {},
  returns: v.object({
    vaultTourId: v.id("tours"),
    wisdomTourId: v.id("tours"),
    familyTourId: v.id("tours"),
    financialTourId: v.id("tours"),
    legacyTourId: v.id("tours"),
  }),
  handler: async (ctx) => {
    await requireAdmin(ctx);

    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const now = Date.now();

    // Helper function to create a tour if it doesn't exist
    const createTourIfNotExists = async (
      key: string,
      name: string,
      description: string,
      priority: number,
    ) => {
      const existing = await ctx.db
        .query("tours")
        .withIndex("by_key", (q) => q.eq("key", key))
        .unique();

      if (existing && existing.status !== "archived") {
        return existing._id;
      }

      const tourKey = existing ? `${key}-${Date.now()}` : key;

      return await ctx.db.insert("tours", {
        key: tourKey,
        name,
        description,
        status: "published",
        version: 1,
        priority,
        createdBy: identity.subject,
        createdAt: now,
        updatedAt: now,
      });
    };

    // Helper function to create a step if it doesn't exist
    const createStepIfNotExists = async (
      tourId: typeof vaultTourId,
      stepKey: string,
      order: number,
      route: string,
      anchorKey: string,
      title: string,
      body: string,
    ) => {
      const existing = await ctx.db
        .query("tourSteps")
        .withIndex("by_tour_and_stepKey", (q) => q.eq("tourId", tourId).eq("stepKey", stepKey))
        .unique();

      if (existing) {
        return existing._id;
      }

      return await ctx.db.insert("tourSteps", {
        tourId,
        stepKey,
        order,
        route,
        anchorKey,
        title,
        body,
        enabled: true,
        versionIntroduced: 1,
        createdAt: now,
        updatedAt: now,
      });
    };

    // ========== VAULT TOUR ==========
    const vaultTourId = await createTourIfNotExists(
      "vault-tour",
      "Heritage Vault Tour",
      "Learn how to securely store and organize important documents for your family.",
      20,
    );

    await createStepIfNotExists(
      vaultTourId,
      "vault-upload",
      0,
      "/vault",
      "vault-upload-btn",
      "Upload Documents",
      "Click here to securely upload important documents. Your files are encrypted and stored safely for your family.",
    );

    await createStepIfNotExists(
      vaultTourId,
      "vault-categories",
      1,
      "/vault",
      "vault-manage-categories",
      "Organize with Categories",
      "Create and manage categories to keep your documents organized. Add custom categories like 'Wills', 'Insurance', or 'Medical Records'.",
    );

    // ========== WISDOM TOUR ==========
    const wisdomTourId = await createTourIfNotExists(
      "wisdom-tour",
      "Wisdom & Education Tour",
      "Discover how to capture and share life lessons, stories, and values with future generations.",
      30,
    );

    await createStepIfNotExists(
      wisdomTourId,
      "wisdom-create",
      0,
      "/wisdom",
      "wisdom-create-entry",
      "Share Your Wisdom",
      "Create a new wisdom entry to capture life lessons, family stories, or advice for future generations. Our guided prompts make it easy.",
    );

    await createStepIfNotExists(
      wisdomTourId,
      "wisdom-library",
      1,
      "/wisdom",
      "wisdom-library",
      "Your Wisdom Library",
      "Access all your saved wisdom entries here. Review, edit, and choose which entries to share with your family.",
    );

    await createStepIfNotExists(
      wisdomTourId,
      "wisdom-beliefs",
      2,
      "/wisdom",
      "wisdom-core-beliefs",
      "Define Core Beliefs",
      "Document the fundamental beliefs and values that guide your life. These become a lasting foundation for future generations.",
    );

    // ========== FAMILY TOUR ==========
    const familyTourId = await createTourIfNotExists(
      "family-tour",
      "Family Ecosystem Tour",
      "Learn how to connect with family members and manage your extended family network.",
      40,
    );

    await createStepIfNotExists(
      familyTourId,
      "family-invite",
      0,
      "/family",
      "family-invite-member",
      "Invite Family Members",
      "Add family members to your primary family unit. They'll be able to access shared documents and wisdom based on permissions you set.",
    );

    await createStepIfNotExists(
      familyTourId,
      "family-add-unit",
      1,
      "/family",
      "family-add-unit",
      "Add Extended Family",
      "Create additional family units to organize your extended family network. Group in-laws, cousins, or other branches of your family tree.",
    );

    // ========== FINANCIAL TOUR ==========
    const financialTourId = await createTourIfNotExists(
      "financial-tour",
      "Financial Intelligence Tour",
      "Learn how to track your financial accounts, properties, and insurance in one secure place.",
      50,
    );

    await createStepIfNotExists(
      financialTourId,
      "financial-account",
      0,
      "/financial",
      "financial-add-account",
      "Track Financial Accounts",
      "Add your bank accounts, investments, and retirement funds. Keep all your financial information organized for your family's future reference.",
    );

    await createStepIfNotExists(
      financialTourId,
      "financial-property",
      1,
      "/financial",
      "financial-add-property",
      "Record Properties",
      "Document your real estate holdings including your home, rental properties, or land. Track values and important details.",
    );

    await createStepIfNotExists(
      financialTourId,
      "financial-insurance",
      2,
      "/financial",
      "financial-add-policy",
      "Manage Insurance Policies",
      "Keep track of your insurance policies including life, health, home, and auto. Your family will know exactly what coverage exists.",
    );

    // ========== LEGACY TOUR ==========
    const legacyTourId = await createTourIfNotExists(
      "legacy-tour",
      "Legacy Planning Tour",
      "Create your lasting legacy with guided questions about your wishes, values, and final messages.",
      60,
    );

    await createStepIfNotExists(
      legacyTourId,
      "legacy-wizard",
      0,
      "/legacy",
      "legacy-wizard",
      "Your Legacy Journey",
      "This guided wizard helps you document important decisions: trusted contacts, guardianship wishes, memorial preferences, and heartfelt messages to loved ones.",
    );

    return {
      vaultTourId,
      wisdomTourId,
      familyTourId,
      financialTourId,
      legacyTourId,
    };
  },
});

/**
 * Seed Learning Center Tour (internal - run via CLI)
 * Archives the old Faith & Finances tour since learning content moved to public /learn page
 *
 * Usage: npx convex run tours:seedLearningCenterTour
 */
export const seedLearningCenterTour = internalMutation({
  args: {},
  returns: v.object({
    tourId: v.optional(v.id("tours")),
    archived: v.boolean(),
  }),
  handler: async (ctx) => {
    const existing = await ctx.db
      .query("tours")
      .withIndex("by_key", (q) => q.eq("key", "learning-center-tour"))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        status: "archived",
        updatedAt: Date.now(),
      });
      return { tourId: existing._id, archived: true };
    }

    return { tourId: undefined, archived: false };
  },
});

/**
 * Seed Content Manager Tour (internal - run via CLI)
 * Creates or updates the tour for administrators to learn the content management system
 *
 * Usage: npx convex run tours:seedContentManagerTour
 */
export const seedContentManagerTour = internalMutation({
  args: {},
  returns: v.object({
    tourId: v.id("tours"),
    created: v.boolean(),
    stepsUpdated: v.number(),
  }),
  handler: async (ctx) => {
    const now = Date.now();
    let created = false;

    // Check if tour already exists
    const existing = await ctx.db
      .query("tours")
      .withIndex("by_key", (q) => q.eq("key", "admin-content-tour"))
      .unique();

    let tourId: Id<"tours">;

    if (existing) {
      tourId = existing._id;
      // Update tour metadata
      await ctx.db.patch(existing._id, {
        name: "Content Manager Tour",
        description: "Learn how to create and manage educational articles for Faith & Finances.",
        status: "published",
        priority: 15,
        updatedAt: now,
      });
    } else {
      // Create the tour
      tourId = await ctx.db.insert("tours", {
        key: "admin-content-tour",
        name: "Content Manager Tour",
        description: "Learn how to create and manage educational articles for Faith & Finances.",
        status: "published",
        version: 1,
        priority: 15,
        createdBy: "system",
        createdAt: now,
        updatedAt: now,
      });
      created = true;
    }

    // Define the tour steps
    const steps = [
      {
        stepKey: "content-header",
        route: "/admin/content",
        anchorKey: "content-manager-header",
        title: "Content Manager",
        body: "Welcome to the Content Manager! Here you can create, edit, and publish educational articles that appear in the Faith & Finances section.",
      },
      {
        stepKey: "content-new-article",
        route: "/admin/content",
        anchorKey: "content-new-article-btn",
        title: "Create New Articles",
        body: "Click here to write a new article. Articles support Markdown formatting for rich content including headers, lists, and blockquotes.",
      },
      {
        stepKey: "content-filters",
        route: "/admin/content",
        anchorKey: "content-filters",
        title: "Filter Articles",
        body: "Use these filters to find articles by status (draft, published, archived) or category. This helps manage your content library as it grows.",
      },
      {
        stepKey: "content-table",
        route: "/admin/content",
        anchorKey: "content-articles-table",
        title: "Article List",
        body: "Click any row to edit an article. Use the menu on the right to publish, archive, or delete articles. Published articles immediately appear in Faith & Finances.",
      },
    ];

    // Create or update each step
    let stepsUpdated = 0;
    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];

      // Check if step exists
      const existingStep = await ctx.db
        .query("tourSteps")
        .withIndex("by_tour_and_stepKey", (q) => q.eq("tourId", tourId).eq("stepKey", step.stepKey))
        .unique();

      if (existingStep) {
        // Update existing step
        await ctx.db.patch(existingStep._id, {
          order: i,
          route: step.route,
          anchorKey: step.anchorKey,
          title: step.title,
          body: step.body,
          enabled: true,
          updatedAt: now,
        });
      } else {
        // Create new step
        await ctx.db.insert("tourSteps", {
          tourId,
          stepKey: step.stepKey,
          order: i,
          route: step.route,
          anchorKey: step.anchorKey,
          title: step.title,
          body: step.body,
          enabled: true,
          versionIntroduced: 1,
          createdAt: now,
          updatedAt: now,
        });
      }
      stepsUpdated++;
    }

    return { tourId, created, stepsUpdated };
  },
});

/**
 * Seed Legal Documents Tour (internal - run via CLI)
 * Creates or updates the tour for the legal documents section
 *
 * Usage: npx convex run tours:seedLegalDocumentsTour
 */
export const seedLegalDocumentsTour = internalMutation({
  args: {},
  returns: v.object({
    tourId: v.id("tours"),
    created: v.boolean(),
    stepsUpdated: v.number(),
  }),
  handler: async (ctx) => {
    const now = Date.now();
    let created = false;

    // Check if tour already exists
    const existing = await ctx.db
      .query("tours")
      .withIndex("by_key", (q) => q.eq("key", "legal-documents-tour"))
      .unique();

    let tourId: Id<"tours">;

    if (existing) {
      tourId = existing._id;
      // Update tour metadata
      await ctx.db.patch(existing._id, {
        name: "Legal Documents Tour",
        description: "Learn how to create and manage essential estate planning documents.",
        status: "published",
        priority: 50,
        updatedAt: now,
      });
    } else {
      // Create the tour
      tourId = await ctx.db.insert("tours", {
        key: "legal-documents-tour",
        name: "Legal Documents Tour",
        description: "Learn how to create and manage essential estate planning documents.",
        status: "published",
        version: 1,
        priority: 50,
        createdBy: "system",
        createdAt: now,
        updatedAt: now,
      });
      created = true;
    }

    // Define the tour steps
    const steps = [
      {
        stepKey: "legal-documents-tab",
        route: "/legacy",
        anchorKey: "legal-documents-tab",
        title: "Legal Documents",
        body: "Click this tab to access your legal document templates. Create essential estate planning documents like wills, trusts, and powers of attorney.",
      },
      {
        stepKey: "legal-docs-disclaimer",
        route: "/legacy?tab=legal-documents",
        anchorKey: "legal-docs-disclaimer",
        title: "Important Notice",
        body: "These templates are for educational purposes to help you organize your estate planning information. Always consult with a qualified attorney before signing any legal documents.",
      },
      {
        stepKey: "legal-documents-grid",
        route: "/legacy?tab=legal-documents",
        anchorKey: "legal-documents-grid",
        title: "Choose a Document",
        body: "Select from available document types like Last Will and Testament, Revocable Living Trust, or Pour-Over Will. Each wizard guides you step-by-step through the information needed.",
      },
      {
        stepKey: "legal-docs-getting-started",
        route: "/legacy?tab=legal-documents",
        anchorKey: "legal-docs-getting-started",
        title: "Getting Started Tips",
        body: "Your progress saves automatically as you work. State-specific legal requirements are shown based on your location. Once complete, download PDFs to review with an attorney.",
      },
    ];

    // Create or update each step
    let stepsUpdated = 0;
    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];

      // Check if step exists
      const existingStep = await ctx.db
        .query("tourSteps")
        .withIndex("by_tour_and_stepKey", (q) => q.eq("tourId", tourId).eq("stepKey", step.stepKey))
        .unique();

      if (existingStep) {
        // Update existing step
        await ctx.db.patch(existingStep._id, {
          order: i,
          route: step.route,
          anchorKey: step.anchorKey,
          title: step.title,
          body: step.body,
          enabled: true,
          updatedAt: now,
        });
      } else {
        // Create new step
        await ctx.db.insert("tourSteps", {
          tourId,
          stepKey: step.stepKey,
          order: i,
          route: step.route,
          anchorKey: step.anchorKey,
          title: step.title,
          body: step.body,
          enabled: true,
          versionIntroduced: 1,
          createdAt: now,
          updatedAt: now,
        });
      }
      stepsUpdated++;
    }

    return { tourId, created, stepsUpdated };
  },
});

/**
 * Seed: Legal Document Wizard Tour
 * Guides users through the document wizard interface when editing a legal document.
 * Usage: npx convex run tours:seedLegalDocumentWizardTour
 */
export const seedLegalDocumentWizardTour = internalMutation({
  args: {},
  returns: v.object({
    tourId: v.id("tours"),
    created: v.boolean(),
    stepsUpdated: v.number(),
  }),
  handler: async (ctx) => {
    const now = Date.now();
    let created = false;

    // Check if tour already exists
    const existing = await ctx.db
      .query("tours")
      .withIndex("by_key", (q) => q.eq("key", "legal-document-wizard-tour"))
      .unique();

    let tourId: Id<"tours">;

    if (existing) {
      tourId = existing._id;
      // Update tour metadata
      await ctx.db.patch(existing._id, {
        name: "Document Wizard Tour",
        description: "Learn how to use the legal document wizard to create your documents.",
        status: "published",
        priority: 55,
        updatedAt: now,
      });
    } else {
      // Create the tour
      tourId = await ctx.db.insert("tours", {
        key: "legal-document-wizard-tour",
        name: "Document Wizard Tour",
        description: "Learn how to use the legal document wizard to create your documents.",
        status: "published",
        version: 1,
        priority: 55,
        createdBy: "system",
        createdAt: now,
        updatedAt: now,
      });
      created = true;
    }

    // Define the tour steps - these show when user is editing a document
    // Note: route uses pattern matching for dynamic document IDs
    const steps = [
      {
        stepKey: "legal-doc-preview-toggle",
        route: "/legacy/documents",
        anchorKey: "legal-doc-preview-toggle",
        title: "Live Preview",
        body: "Toggle the live preview panel to see your document update in real-time as you fill in details. This helps you visualize the final result.",
      },
      {
        stepKey: "legal-doc-quick-nav",
        route: "/legacy/documents",
        anchorKey: "legal-doc-quick-nav",
        title: "Quick Navigation",
        body: "Jump to any section of the document using these buttons. Completed sections show a checkmark. Your progress is saved automatically.",
      },
      {
        stepKey: "legal-doc-download-pdf",
        route: "/legacy/documents",
        anchorKey: "legal-doc-download-pdf",
        title: "Download Your Document",
        body: "Once all sections are complete, download your document as a PDF. Remember to have an attorney review it before signing - this is an educational template only.",
      },
    ];

    // Create or update each step
    let stepsUpdated = 0;
    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];

      // Check if step exists
      const existingStep = await ctx.db
        .query("tourSteps")
        .withIndex("by_tour_and_stepKey", (q) => q.eq("tourId", tourId).eq("stepKey", step.stepKey))
        .unique();

      if (existingStep) {
        // Update existing step
        await ctx.db.patch(existingStep._id, {
          order: i,
          route: step.route,
          anchorKey: step.anchorKey,
          title: step.title,
          body: step.body,
          enabled: true,
          updatedAt: now,
        });
      } else {
        // Create new step
        await ctx.db.insert("tourSteps", {
          tourId,
          stepKey: step.stepKey,
          order: i,
          route: step.route,
          anchorKey: step.anchorKey,
          title: step.title,
          body: step.body,
          enabled: true,
          versionIntroduced: 1,
          createdAt: now,
          updatedAt: now,
        });
      }
      stepsUpdated++;
    }

    return { tourId, created, stepsUpdated };
  },
});
