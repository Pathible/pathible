"use node";

/**
 * Server-side Analytics Module
 *
 * Provides internal actions for tracking events to PostHog from Convex mutations.
 * Use ctx.scheduler.runAfter(0, internal.analytics.trackEvent, {...}) to track
 * events without blocking the mutation response.
 *
 * @example
 * ```ts
 * // In a mutation handler
 * await ctx.scheduler.runAfter(0, internal.analytics.trackEvent, {
 *   distinctId: profile.clerkUserId,
 *   event: "onboarding_completed",
 *   properties: { goals: args.goals },
 * });
 * ```
 */
import { v } from "convex/values";
import { internalAction } from "./_generated/server";

// PostHog library identifier for tracking event source
const POSTHOG_LIB_NAME = "convex-server";

/**
 * Properties validator for analytics events.
 *
 * NOTE: v.any() is intentional here - analytics properties are inherently dynamic
 * and vary per event type. This is safe because:
 * 1. These are internal actions, not exposed to external clients
 * 2. All callers are within our codebase with controlled property shapes
 * 3. PostHog accepts arbitrary JSON properties
 */
const analyticsPropertiesValidator = v.optional(v.record(v.string(), v.any()));

/**
 * Helper function to make PostHog API requests with consistent error handling.
 * Centralizes the PostHog configuration check and HTTP request logic.
 */
async function makePostHogRequest(
  body: Record<string, unknown>,
  operationName: string,
): Promise<void> {
  const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST;

  if (!posthogKey || !posthogHost) {
    console.log(`[Analytics] PostHog not configured, skipping ${operationName}`);
    return;
  }

  try {
    const response = await fetch(`${posthogHost}/capture/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: posthogKey,
        ...body,
        timestamp: new Date().toISOString(),
      }),
    });

    if (!response.ok) {
      console.error(`[Analytics] ${operationName} failed:`, response.status, await response.text());
    }
  } catch (error) {
    console.error(`[Analytics] Failed to ${operationName}:`, error);
  }
}

/**
 * Track an event to PostHog
 *
 * This is an internal action that sends events to PostHog's capture endpoint.
 * Should be called via ctx.scheduler.runAfter() to avoid blocking mutations.
 */
export const trackEvent = internalAction({
  args: {
    distinctId: v.string(),
    event: v.string(),
    properties: analyticsPropertiesValidator,
  },
  returns: v.null(),
  handler: async (_, args) => {
    await makePostHogRequest(
      {
        event: args.event,
        distinct_id: args.distinctId,
        properties: {
          ...args.properties,
          $lib: POSTHOG_LIB_NAME,
        },
      },
      `track event: ${args.event}`,
    );

    return null;
  },
});

/**
 * Identify a user in PostHog with their properties
 *
 * Call this when a user signs up or updates their profile to sync
 * user properties to PostHog for segmentation and analysis.
 */
export const identifyUser = internalAction({
  args: {
    distinctId: v.string(),
    // NOTE: v.any() is intentional - user properties are dynamic per-caller
    properties: v.record(v.string(), v.any()),
  },
  returns: v.null(),
  handler: async (_, args) => {
    await makePostHogRequest(
      {
        event: "$identify",
        distinct_id: args.distinctId,
        properties: {
          $set: args.properties,
        },
      },
      "identify user",
    );

    return null;
  },
});

/**
 * Track a group (household) in PostHog
 *
 * Associates users with their household for group-level analytics.
 */
export const identifyGroup = internalAction({
  args: {
    distinctId: v.string(),
    groupType: v.string(),
    groupKey: v.string(),
    properties: analyticsPropertiesValidator,
  },
  returns: v.null(),
  handler: async (_, args) => {
    await makePostHogRequest(
      {
        event: "$groupidentify",
        distinct_id: args.distinctId,
        properties: {
          $group_type: args.groupType,
          $group_key: args.groupKey,
          $group_set: args.properties ?? {},
        },
      },
      "identify group",
    );

    return null;
  },
});
