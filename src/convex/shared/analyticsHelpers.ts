/**
 * Shared Analytics Helpers
 *
 * Provides helper functions for tracking analytics events from Convex mutations.
 * These wrap the internal analytics actions with a consistent interface.
 *
 * @example
 * ```ts
 * import { trackAnalytics, identifyUserAnalytics } from "./shared/analyticsHelpers";
 *
 * // In a mutation handler
 * await trackAnalytics(ctx, profile.userId, "feature_used", { feature: "vault" });
 * ```
 */
import { internal } from "../_generated/api";
import type { MutationCtx } from "../_generated/server";

/**
 * Track an analytics event from a mutation.
 * Uses ctx.scheduler.runAfter(0, ...) to avoid blocking the mutation response.
 *
 * @param ctx - The mutation context
 * @param distinctId - User identifier (typically Clerk user ID)
 * @param event - Event name (use snake_case, e.g., "document_uploaded")
 * @param properties - Optional event properties (use snake_case keys)
 */
export async function trackAnalytics(
  ctx: MutationCtx,
  distinctId: string,
  event: string,
  properties?: Record<string, unknown>,
): Promise<void> {
  await ctx.scheduler.runAfter(0, internal.analytics.trackEvent, {
    distinctId,
    event,
    properties,
  });
}

/**
 * Identify a user with their properties for segmentation.
 * Call this when a user signs up or updates their profile.
 *
 * @param ctx - The mutation context
 * @param distinctId - User identifier (typically Clerk user ID)
 * @param properties - User properties to set (use snake_case keys)
 */
export async function identifyUserAnalytics(
  ctx: MutationCtx,
  distinctId: string,
  properties: Record<string, unknown>,
): Promise<void> {
  await ctx.scheduler.runAfter(0, internal.analytics.identifyUser, {
    distinctId,
    properties,
  });
}

/**
 * Associate a user with a group (e.g., household) for group-level analytics.
 *
 * @param ctx - The mutation context
 * @param distinctId - User identifier (typically Clerk user ID)
 * @param groupType - Type of group (e.g., "household")
 * @param groupKey - Unique group identifier
 * @param properties - Optional group properties
 */
export async function identifyGroupAnalytics(
  ctx: MutationCtx,
  distinctId: string,
  groupType: string,
  groupKey: string,
  properties?: Record<string, unknown>,
): Promise<void> {
  await ctx.scheduler.runAfter(0, internal.analytics.identifyGroup, {
    distinctId,
    groupType,
    groupKey,
    properties,
  });
}
