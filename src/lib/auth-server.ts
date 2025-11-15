import { cookies } from "next/headers";

/**
 * Get the Better Auth token from cookies
 * This retrieves the session token that Better Auth stores in cookies
 */
export async function getToken(): Promise<string | null> {
  try {
    const cookieStore = await cookies();

    // Better Auth stores the session token in a cookie named "better-auth.session_token"
    const sessionToken = cookieStore.get("better-auth.session_token");

    if (!sessionToken) {
      return null;
    }

    return sessionToken.value;
  } catch (error) {
    console.error("[Auth] Failed to get token from cookies:", error);
    return null;
  }
}
