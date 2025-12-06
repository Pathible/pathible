import { cookies } from "next/headers";
import { NextResponse } from "next/server";

/**
 * API endpoint to get Convex-compatible JWT token from Better Auth session
 *
 * This endpoint:
 * 1. Reads the Better Auth session from cookies
 * 2. Returns it as a token that Convex can use for authentication
 *
 * Used by server-side code that needs to call Convex with authentication
 */
export async function GET() {
  try {
    const cookieStore = await cookies();

    // Get the Better Auth session token from cookies
    const sessionToken = cookieStore.get("better-auth.session_token");

    if (!sessionToken) {
      return NextResponse.json({ token: null }, { status: 200 });
    }

    // Return the session token as the Convex token
    // Better Auth + Convex integration handles the validation
    return NextResponse.json({ token: sessionToken.value }, { status: 200 });
  } catch (error) {
    console.error("[Auth API] Failed to get token:", error);
    return NextResponse.json({ error: "Failed to retrieve token" }, { status: 500 });
  }
}
