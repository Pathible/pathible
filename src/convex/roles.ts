import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireAuth, requireAdmin, authComponent } from "./auth";
import type { Id } from "./_generated/dataModel";

/**
 * Role management functions
 *
 * Roles determine system-wide access levels (admin vs regular user).
 * This is separate from household-specific roles.
 */

// ============================================================================
// QUERIES
// ============================================================================

/**
 * Check if the current user has a specific role
 * Returns true if the user has the role, false otherwise
 */
export const checkRole = query({
  args: {
    role: v.union(v.literal("admin"), v.literal("user")),
  },
  returns: v.boolean(),
  handler: async (ctx, args) => {
    try {
      const user = await authComponent.getAuthUser(ctx as any);
      if (!user) return false;

      const userRole = await ctx.db
        .query("userRoles")
        .withIndex("by_userId", (q) => q.eq("userId", user._id as any))
        .unique();

      return userRole?.role === args.role;
    } catch {
      return false;
    }
  },
});

/**
 * Get the current user's role
 * Returns null if not authenticated or no role assigned
 */
export const getMyRole = query({
  args: {},
  returns: v.union(
    v.union(v.literal("admin"), v.literal("user")),
    v.null()
  ),
  handler: async (ctx) => {
    try {
      const user = await authComponent.getAuthUser(ctx as any);
      if (!user) return null;

      const userRole = await ctx.db
        .query("userRoles")
        .withIndex("by_userId", (q) => q.eq("userId", user._id as any))
        .unique();

      return userRole?.role ?? null;
    } catch {
      return null;
    }
  },
});

/**
 * List all admins in the system
 * Admin-only function
 * Returns only role data (not user details from Better Auth)
 */
export const listAdmins = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("userRoles"),
      _creationTime: v.number(),
      userId: v.string(), // Better Auth user ID
      role: v.literal("admin"),
    })
  ),
  handler: async (ctx) => {
    await requireAdmin(ctx);

    // Get all admin roles
    const allRoles = await ctx.db.query("userRoles").collect();
    const adminRoles = allRoles.filter((r) => r.role === "admin");

    // Map to ensure the correct type
    return adminRoles.map((r) => ({
      _id: r._id,
      _creationTime: r._creationTime,
      userId: r.userId,
      role: "admin" as const,
    }));
  },
});

/**
 * Get a user's role by their user ID
 * Admin-only function
 */
export const getUserRole = query({
  args: {
    userId: v.string(), // Better Auth user ID
  },
  returns: v.union(
    v.object({
      _id: v.id("userRoles"),
      _creationTime: v.number(),
      userId: v.string(), // Better Auth user ID
      role: v.union(v.literal("admin"), v.literal("user")),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const userRole = await ctx.db
      .query("userRoles")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .unique();

    return userRole ?? null;
  },
});

// ============================================================================
// MUTATIONS
// ============================================================================

/**
 * Assign a role to a user
 * Admin-only function
 *
 * If the user already has a role, it will be updated.
 * If they don't have a role, a new one will be created.
 */
export const assignRole = mutation({
  args: {
    userId: v.string(), // Better Auth user ID
    role: v.union(v.literal("admin"), v.literal("user")),
  },
  returns: v.id("userRoles"),
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const { user: currentUser } = await requireAuth(ctx);

    // Note: We cannot verify if the target user exists because Better Auth
    // manages its own tables. We trust that the userId is valid.

    // Prevent removing your own admin status
    if (
      (currentUser._id as any) === args.userId &&
      args.role !== "admin"
    ) {
      throw new Error("You cannot remove your own admin role");
    }

    // Check if user already has a role
    const existingRole = await ctx.db
      .query("userRoles")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .unique();

    if (existingRole) {
      // Update existing role
      await ctx.db.patch(existingRole._id, { role: args.role });
      return existingRole._id;
    } else {
      // Create new role
      const roleId = await ctx.db.insert("userRoles", {
        userId: args.userId,
        role: args.role,
      });
      return roleId;
    }
  },
});

/**
 * Remove a user's role
 * Admin-only function
 *
 * WARNING: This removes the user's system-wide role entirely.
 * They will lose any special permissions.
 */
export const removeRole = mutation({
  args: {
    userId: v.string(), // Better Auth user ID
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const { user: currentUser } = await requireAuth(ctx);

    // Prevent removing your own role
    if ((currentUser._id as any) === args.userId) {
      throw new Error("You cannot remove your own role");
    }

    // Find and delete the role
    const userRole = await ctx.db
      .query("userRoles")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .unique();

    if (userRole) {
      await ctx.db.delete(userRole._id);
    }

    return null;
  },
});

/**
 * Initialize the first admin
 * This can only be called when there are no existing admins
 * Used for initial system setup
 */
export const initializeFirstAdmin = mutation({
  args: {},
  returns: v.id("userRoles"),
  handler: async (ctx) => {
    const { user } = await requireAuth(ctx);

    // Check if any admins exist
    const allRoles = await ctx.db.query("userRoles").collect();
    const adminCount = allRoles.filter((r) => r.role === "admin").length;

    if (adminCount > 0) {
      throw new Error("Admin users already exist. This function can only be called for initial setup.");
    }

    // Check if this user already has a role
    const existingRole = await ctx.db
      .query("userRoles")
      .withIndex("by_userId", (q) => q.eq("userId", user._id as any))
      .unique();

    if (existingRole) {
      // Update to admin
      await ctx.db.patch(existingRole._id, { role: "admin" });
      return existingRole._id;
    } else {
      // Create admin role
      const roleId = await ctx.db.insert("userRoles", {
        userId: user._id as any,
        role: "admin",
      });
      return roleId;
    }
  },
});
