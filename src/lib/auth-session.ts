import { auth, currentUser } from "@clerk/nextjs/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

/**
 * Get the current authenticated user session on the server
 *
 * This checks if a Clerk session exists.
 * Returns a simple auth indicator for route protection.
 */
export async function getServerSession() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return null;
    }

    return { authenticated: true, userId };
  } catch (error) {
    console.error("[Auth] Failed to get server session:", error);
    return null;
  }
}

/**
 * Get the current user with their Clerk profile on the server
 *
 * Returns Clerk user data. For Convex profile data,
 * use client-side queries with the authenticated Convex client.
 */
export async function getServerSessionWithProfile() {
  try {
    const user = await currentUser();

    if (!user) {
      return null;
    }

    return {
      user: {
        id: user.id,
        email: user.emailAddresses[0]?.emailAddress ?? "",
        firstName: user.firstName,
        lastName: user.lastName,
        imageUrl: user.imageUrl,
      },
    };
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

/**
 * Check if the current user has admin role
 *
 * This function queries Convex to check the user's role in the userRoles table.
 * Used by server-side code (layouts) to determine if admin-specific bypass logic applies.
 *
 * Returns false if:
 * - User is not authenticated
 * - Convex URL is not configured
 * - Query fails (fail-closed for security - deny access on error)
 * - User doesn't have admin role
 */
export async function getIsAdmin(): Promise<boolean> {
  try {
    // Get the Clerk auth token for Convex
    const { getToken, userId } = await auth();

    if (!userId) {
      return false;
    }

    const token = await getToken({ template: "convex" });
    if (!token) {
      console.warn("[Auth] No Convex token available for admin check");
      return false;
    }

    // Setup Convex HTTP client
    const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
    if (!convexUrl) {
      console.error("[Auth] NEXT_PUBLIC_CONVEX_URL not configured");
      return false;
    }

    const convexClient = new ConvexHttpClient(convexUrl);
    convexClient.setAuth(token);

    // Query user's role from Convex
    const role = await convexClient.query(api.roles.getMyRole);

    return role === "admin";
  } catch (error) {
    // Log error and fail closed - deny admin access on errors for security
    console.error("[Auth] Failed to check admin status:", error);
    return false;
  }
}

/**
 * Onboarding status type returned from Convex
 */
export interface OnboardingStatus {
  hasProfile: boolean;
  onboardingComplete: boolean;
  hasHousehold: boolean;
  needsOnboarding: boolean;
  onboardingStatus?:
    | "not_started"
    | "profile_complete"
    | "household_complete"
    | "preferences_complete"
    | "complete";
}

/**
 * Get the user's onboarding status from Convex
 *
 * This function queries Convex to check:
 * - Whether the user has a profile
 * - Whether onboarding is complete
 * - Whether the user has a household
 *
 * Used by server-side code (layouts) to determine if the user
 * should be redirected to onboarding.
 *
 * Returns null if:
 * - User is not authenticated
 * - Convex URL is not configured
 * - Query fails (fail-open for reliability)
 */
export async function getOnboardingStatus(): Promise<OnboardingStatus | null> {
  try {
    // Get the Clerk auth token for Convex
    const { getToken, userId } = await auth();

    if (!userId) {
      return null;
    }

    const token = await getToken({ template: "convex" });
    if (!token) {
      console.warn("[Auth] No Convex token available");
      return null;
    }

    // Setup Convex HTTP client
    const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
    if (!convexUrl) {
      console.error("[Auth] NEXT_PUBLIC_CONVEX_URL not configured");
      return null;
    }

    const convexClient = new ConvexHttpClient(convexUrl);
    convexClient.setAuth(token);

    // Query onboarding status from Convex
    const status = await convexClient.query(api.auth.getOnboardingStatus);

    return status;
  } catch (error) {
    // Log error but fail open - don't block users on transient errors
    console.error("[Auth] Failed to get onboarding status:", error);
    return null;
  }
}
