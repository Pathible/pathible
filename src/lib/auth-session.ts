import { cookies } from "next/headers";

/**
 * Get the current authenticated user session on the server
 *
 * This checks if a Better Auth session exists by looking at cookies.
 * For server-side components, we just check if they're authenticated,
 * and let client-side components handle the actual Convex queries.
 *
 * Returns a simple auth indicator, not full user data.
 */
export async function getServerSession() {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("better-auth.session_token");

    if (!sessionToken) {
      console.log("[Auth] No session found");
      return null;
    }

    // Just return a simple indicator that user is authenticated
    // Client-side will handle fetching actual user data via Convex
    return { authenticated: true };
  } catch (error) {
    console.error("[Auth] Failed to get server session:", error);
    return null;
  }
}

/**
 * Get the current user with their profile on the server
 *
 * For server components, we can't easily call Convex with auth.
 * Instead, we'll make a simple HTTP request to our Convex backend
 * using the session cookie.
 */
export async function getServerSessionWithProfile() {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("better-auth.session_token");

    if (!sessionToken) {
      console.log("[Auth] No session found for profile check");
      return null;
    }

    // Make HTTP request to Convex to check if profile exists
    // Using the Better Auth session cookie
    const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
    const response = await fetch(`${convexUrl}/api/query`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: `better-auth.session_token=${sessionToken.value}`,
      },
      body: JSON.stringify({
        path: "auth:getCurrentUserWithProfile",
        args: {},
        format: "json",
      }),
    });

    if (!response.ok) {
      console.error("[Auth] Convex query failed:", response.status);
      return null;
    }

    const data = await response.json();
    return data.value;
  } catch (error) {
    console.error("[Auth] Failed to get server session with profile:", error);
    return null;
  }
}

/**
 * Require authentication on the server
 * Throws error if not authenticated (for use in Server Components)
 */
export async function requireServerAuth() {
  const session = await getServerSessionWithProfile();

  if (!session) {
    throw new Error("Unauthorized: Authentication required");
  }

  return session;
}
