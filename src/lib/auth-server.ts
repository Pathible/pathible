import { getToken as getBetterAuthToken } from "@convex-dev/better-auth/nextjs";
import { createAuth } from "@/convex/auth";

/**
 * Get the Convex JWT token from Better Auth session
 *
 * Uses the official @convex-dev/better-auth helper to properly
 * exchange the session cookie for a Convex-compatible JWT token.
 *
 * @returns Convex JWT token string or null if not authenticated
 */
export async function getToken(): Promise<string | null> {
  try {
    const token = await getBetterAuthToken(createAuth);
    return token ?? null;
  } catch (error) {
    console.error("[Auth] Failed to get token:", error);
    return null;
  }
}
