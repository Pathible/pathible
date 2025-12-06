import { getToken as getTokenNextjs } from "@convex-dev/better-auth/nextjs";
import { createAuth } from "@/convex/auth";

/**
 * Get the Convex JWT token from Better Auth session
 *
 * Uses the official @convex-dev/better-auth/nextjs helper which:
 * 1. Reads the Better Auth session from cookies
 * 2. Generates a valid Convex JWT token
 *
 * @returns Convex JWT token string or null if not authenticated
 */
export const getToken = () => {
  return getTokenNextjs(createAuth);
};
