/**
 * Server-side PostHog Utilities
 *
 * Use these utilities for tracking events from API routes, server actions,
 * and other server-side code.
 *
 * IMPORTANT: Always call shutdown() after capturing events to ensure
 * they are flushed before the request completes.
 *
 * @example
 * ```ts
 * import { trackServerEvent, getPostHogClient } from '@/lib/posthog-server';
 *
 * // Simple one-off event
 * await trackServerEvent('user_id', 'event_name', { property: 'value' });
 *
 * // Multiple events (reuse client)
 * const posthog = getPostHogClient();
 * if (posthog) {
 *   posthog.capture({ distinctId: 'user_id', event: 'event_1' });
 *   posthog.capture({ distinctId: 'user_id', event: 'event_2' });
 *   await posthog.shutdown();
 * }
 * ```
 */
import { PostHog } from "posthog-node";

const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST;

/**
 * Create a new PostHog client instance for server-side tracking.
 * Returns null if PostHog is not configured.
 *
 * Remember to call shutdown() after capturing events!
 */
export function getPostHogClient(): PostHog | null {
  if (!posthogKey || !posthogHost) {
    return null;
  }

  return new PostHog(posthogKey, {
    host: posthogHost,
    // Flush events immediately for serverless environments
    flushAt: 1,
    flushInterval: 0,
  });
}

/**
 * Track a single event from server-side code.
 * Handles client creation and shutdown automatically.
 *
 * @param distinctId - User identifier (Clerk user ID, anonymous ID, etc.)
 * @param event - Event name
 * @param properties - Optional event properties
 */
export async function trackServerEvent(
  distinctId: string,
  event: string,
  properties?: Record<string, unknown>,
): Promise<void> {
  const posthog = getPostHogClient();
  if (!posthog) return;

  try {
    posthog.capture({
      distinctId,
      event,
      properties,
    });
    await posthog.shutdown();
  } catch (error) {
    // Log but don't throw - analytics shouldn't break the app
    console.error("[PostHog] Failed to track event:", error);
  }
}

/**
 * Identify a user with their properties from server-side code.
 * Call this when user signs up or updates their profile.
 *
 * @param distinctId - User identifier (typically Clerk user ID)
 * @param properties - User properties to set
 */
export async function identifyUser(
  distinctId: string,
  properties: Record<string, unknown>,
): Promise<void> {
  const posthog = getPostHogClient();
  if (!posthog) return;

  try {
    posthog.identify({
      distinctId,
      properties,
    });
    await posthog.shutdown();
  } catch (error) {
    console.error("[PostHog] Failed to identify user:", error);
  }
}
