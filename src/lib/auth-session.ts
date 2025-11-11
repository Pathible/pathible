import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { getToken } from "./auth-server";

/**
 * Get the current authenticated user session on the server
 * Returns null if not authenticated
 */
export async function getServerSession() {
  try {
    const token = await getToken();

    if (!token) {
      return null;
    }

    // Fetch the current user using the Convex API
    const user = await fetchQuery(
      api.auth.getCurrentUser,
      {},
      { token }
    );

    return user;
  } catch (error) {
    console.error("[Auth] Failed to get server session:", error);
    return null;
  }
}

/**
 * Get the current user with their profile on the server
 * Returns null if not authenticated or profile doesn't exist
 */
export async function getServerSessionWithProfile() {
  try {
    const token = await getToken();

    if (!token) {
      return null;
    }

    // Fetch the current user with profile
    const userWithProfile = await fetchQuery(
      api.auth.getCurrentUserWithProfile,
      {},
      { token }
    );

    return userWithProfile;
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
