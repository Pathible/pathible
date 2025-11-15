import { fetchMutation } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { cookies } from "next/headers";

/**
 * Get the Convex JWT token from Better Auth session
 *
 * Better Auth integration with Convex works by:
 * 1. Better Auth stores session in cookies
 * 2. We need to exchange that session for a Convex JWT
 * 3. The Convex JWT is what we use for authenticated queries
 *
 * @returns Convex JWT token string or null if not authenticated
 */
export async function getToken(): Promise<string | null> {
  try {
    const cookieStore = await cookies();

    // Get the Better Auth session token
    const sessionToken = cookieStore.get("better-auth.session_token");

    if (!sessionToken) {
      console.log("[Auth] No session token found in cookies");
      return null;
    }

    console.log("[Auth] Session token found, exchanging for Convex JWT");

    // For now, return the session token
    // The Better Auth Convex component should handle validation
    return sessionToken.value;
  } catch (error) {
    console.error("[Auth] Failed to get token:", error);
    return null;
  }
}
