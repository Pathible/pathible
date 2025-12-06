import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { authComponent, requireAuth } from "./auth";

/**
 * Profile management functions
 *
 * Profiles extend Better Auth user data with additional information.
 * Each authenticated user should have exactly one profile.
 */

// ============================================================================
// QUERIES
// ============================================================================

/**
 * Get the current user's profile
 * Returns null if not authenticated or profile doesn't exist
 */
export const get = query({
  args: {},
  returns: v.union(
    v.object({
      _id: v.id("profiles"),
      _creationTime: v.number(),
      userId: v.string(), // Better Auth user ID
      firstName: v.string(),
      lastName: v.string(),
      avatarUrl: v.optional(v.string()),
      phone: v.optional(v.string()),
      dateOfBirth: v.optional(v.number()),
      updatedAt: v.number(),
    }),
    v.null(),
  ),
  handler: async (ctx) => {
    try {
      const { profile } = await requireAuth(ctx);
      return profile;
    } catch {
      return null;
    }
  },
});

/**
 * Get a profile by ID (public information only)
 * Used for displaying user information to other household members
 */
export const getById = query({
  args: {
    profileId: v.id("profiles"),
  },
  returns: v.union(
    v.object({
      _id: v.id("profiles"),
      firstName: v.string(),
      lastName: v.string(),
      avatarUrl: v.optional(v.string()),
    }),
    v.null(),
  ),
  handler: async (ctx, args) => {
    const profile = await ctx.db.get(args.profileId);
    if (!profile) return null;

    // Return only public information
    return {
      _id: profile._id,
      firstName: profile.firstName,
      lastName: profile.lastName,
      avatarUrl: profile.avatarUrl,
    };
  },
});

// ============================================================================
// MUTATIONS
// ============================================================================

/**
 * Create a user profile
 * This should be called after user signup to complete their profile
 * Returns the profile ID
 *
 * NOTE: This does NOT use requireAuth() because the profile doesn't exist yet!
 * We only check that the user is authenticated, not that they have a profile.
 */
export const create = mutation({
  args: {
    firstName: v.string(),
    lastName: v.string(),
    phone: v.optional(v.string()),
    dateOfBirth: v.optional(v.number()),
  },
  returns: v.id("profiles"),
  handler: async (ctx, args) => {
    // Get user directly without requiring profile (profile doesn't exist yet!)
    const user = await authComponent.getAuthUser(ctx);
    if (!user) {
      throw new Error("Not authenticated");
    }

    console.log(`[Profile] Creating profile for user ${user._id}`);

    // Check if profile already exists
    const existing = await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) => q.eq("userId", String(user._id)))
      .unique();

    if (existing) {
      console.log(`[Profile] Profile already exists: ${existing._id}`);
      throw new Error("Profile already exists");
    }

    // Validate inputs
    if (!args.firstName.trim()) {
      throw new Error("First name is required");
    }
    if (!args.lastName.trim()) {
      throw new Error("Last name is required");
    }

    if (args.phone && args.phone.length > 20) {
      throw new Error("Phone number is too long");
    }

    if (args.dateOfBirth) {
      // Check that date of birth is not in the future
      if (args.dateOfBirth > Date.now()) {
        throw new Error("Date of birth cannot be in the future");
      }
      // Check that user is not unreasonably old (over 150 years)
      const age = (Date.now() - args.dateOfBirth) / (1000 * 60 * 60 * 24 * 365);
      if (age > 150) {
        throw new Error("Invalid date of birth");
      }
    }

    // Create the profile
    const profileId = await ctx.db.insert("profiles", {
      userId: String(user._id),
      firstName: args.firstName.trim(),
      lastName: args.lastName.trim(),
      phone: args.phone,
      dateOfBirth: args.dateOfBirth,
      updatedAt: Date.now(),
    });

    console.log(`[Profile] Created profile ${profileId} for user ${user._id}`);

    return profileId;
  },
});

/**
 * Update the current user's profile
 * Returns the updated profile ID
 */
export const update = mutation({
  args: {
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
    phone: v.optional(v.string()),
    dateOfBirth: v.optional(v.number()),
  },
  returns: v.id("profiles"),
  handler: async (ctx, args) => {
    const { profile } = await requireAuth(ctx);

    // Build update object with only provided fields
    const updates: {
      updatedAt: number;
      firstName?: string;
      lastName?: string;
      avatarUrl?: string;
      phone?: string;
      dateOfBirth?: number;
    } = {
      updatedAt: Date.now(),
    };

    if (args.firstName !== undefined) {
      if (!args.firstName.trim()) {
        throw new Error("First name cannot be empty");
      }
      updates.firstName = args.firstName.trim();
    }

    if (args.lastName !== undefined) {
      if (!args.lastName.trim()) {
        throw new Error("Last name cannot be empty");
      }
      updates.lastName = args.lastName.trim();
    }

    if (args.avatarUrl !== undefined) {
      updates.avatarUrl = args.avatarUrl;
    }

    if (args.phone !== undefined) {
      if (args.phone && args.phone.length > 20) {
        throw new Error("Phone number is too long");
      }
      updates.phone = args.phone;
    }

    if (args.dateOfBirth !== undefined) {
      if (args.dateOfBirth > Date.now()) {
        throw new Error("Date of birth cannot be in the future");
      }
      const age = (Date.now() - args.dateOfBirth) / (1000 * 60 * 60 * 24 * 365);
      if (age > 150) {
        throw new Error("Invalid date of birth");
      }
      updates.dateOfBirth = args.dateOfBirth;
    }

    // Update the profile
    await ctx.db.patch(profile._id, updates);

    return profile._id;
  },
});

/**
 * Delete the current user's profile
 * WARNING: This will cascade delete all user data
 * Returns null on success
 */
export const deleteProfile = mutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const { profile } = await requireAuth(ctx);

    // Check if user is the primary contact for any households
    const householdsAsPrimary = await ctx.db
      .query("households")
      .withIndex("by_primaryContactId", (q) => q.eq("primaryContactId", profile._id))
      .collect();

    if (householdsAsPrimary.length > 0) {
      throw new Error(
        "Cannot delete profile: You are the primary contact for one or more households. Please transfer ownership first.",
      );
    }

    // Get all household memberships to clean up
    const memberships = await ctx.db
      .query("householdMemberships")
      .withIndex("by_user", (q) => q.eq("userId", profile._id))
      .collect();

    // Check if user is the only owner of any households
    for (const membership of memberships) {
      if (membership.role === "owner") {
        const household = await ctx.db.get(membership.householdId);
        if (household) {
          // Count other owners
          const otherOwners = await ctx.db
            .query("householdMemberships")
            .withIndex("by_household", (q) => q.eq("householdId", membership.householdId))
            .collect();

          const hasOtherOwner = otherOwners.some(
            (m) => m.role === "owner" && m.userId !== profile._id,
          );

          if (!hasOtherOwner) {
            throw new Error(
              `Cannot delete profile: You are the only owner of household "${household.name}". Please transfer ownership first.`,
            );
          }
        }
      }
    }

    // Delete all memberships
    for (const membership of memberships) {
      await ctx.db.delete(membership._id);
    }

    // Delete all invitations sent by this user
    const invitations = await ctx.db.query("householdInvitations").collect();
    for (const invitation of invitations) {
      if (invitation.invitedBy === profile._id) {
        await ctx.db.delete(invitation._id);
      }
    }

    // Delete all activity log entries
    const activities = await ctx.db
      .query("activityLog")
      .withIndex("by_user", (q) => q.eq("userId", profile._id))
      .collect();
    for (const activity of activities) {
      await ctx.db.delete(activity._id);
    }

    // Delete all notifications
    const notifications = await ctx.db
      .query("notifications")
      .withIndex("by_user", (q) => q.eq("userId", profile._id))
      .collect();
    for (const notification of notifications) {
      await ctx.db.delete(notification._id);
    }

    // Finally, delete the profile
    await ctx.db.delete(profile._id);

    return null;
  },
});
