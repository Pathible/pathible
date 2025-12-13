import { v } from "convex/values";
import { query } from "./_generated/server";

/**
 * User-related queries
 *
 * NOTE: Password management is now handled by Clerk directly.
 * Users can change their password through Clerk's UserProfile component
 * or the Clerk user portal.
 */

/**
 * Get the current authenticated user's Clerk ID
 * Useful for debugging or verification purposes
 */
export const getCurrentUserId = query({
  args: {},
  returns: v.union(v.string(), v.null()),
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    return identity.subject;
  },
});
