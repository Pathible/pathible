import { auth, currentUser } from "@clerk/nextjs/server";

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
