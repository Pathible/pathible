/**
 * Type definitions for Better Auth integration
 *
 * These types define the structure of Better Auth user objects and related data.
 * Better Auth manages its own user tables internally, but we need these types
 * for proper TypeScript support in our Convex functions.
 */

/**
 * Better Auth User object
 * This represents the core user data managed by Better Auth
 */
export interface BetterAuthUser {
  _id: string; // Better Auth user ID
  email: string;
  emailVerified: boolean;
  name?: string;
  image?: string;
  createdAt: number; // Unix timestamp
  updatedAt: number; // Unix timestamp
}

/**
 * Pathible Profile with Better Auth User
 * Combined type for when we need both auth user and profile data
 */
export interface AuthUserWithProfile {
  user: BetterAuthUser;
  profile: {
    _id: string; // Convex ID for profiles table
    userId: string; // Better Auth user ID
    firstName: string;
    lastName: string;
    avatarUrl?: string;
    phone?: string;
    dateOfBirth?: number; // Unix timestamp
    updatedAt: number; // Unix timestamp
    _creationTime: number;
  };
}

/**
 * Session info - what we get from Better Auth session checks
 */
export interface SessionInfo {
  user: BetterAuthUser;
  session: {
    id: string;
    userId: string;
    expiresAt: number;
    token: string;
    ipAddress?: string;
    userAgent?: string;
  };
}

/**
 * Type guard to check if an object is a BetterAuthUser
 */
export function isBetterAuthUser(obj: unknown): obj is BetterAuthUser {
  return (
    typeof obj === "object" &&
    obj !== null &&
    "_id" in obj &&
    "email" in obj &&
    "emailVerified" in obj &&
    "createdAt" in obj &&
    "updatedAt" in obj &&
    typeof (obj as Record<string, unknown>)._id === "string" &&
    typeof (obj as Record<string, unknown>).email === "string" &&
    typeof (obj as Record<string, unknown>).emailVerified === "boolean" &&
    typeof (obj as Record<string, unknown>).createdAt === "number" &&
    typeof (obj as Record<string, unknown>).updatedAt === "number"
  );
}

/**
 * Extract email safely from a Better Auth user object
 */
export function getUserEmail(user: unknown): string {
  if (isBetterAuthUser(user)) {
    return user.email;
  }
  // Fallback for unsafe access with proper type checking
  if (typeof user === "object" && user !== null && "email" in user) {
    const email = (user as Record<string, unknown>).email;
    return typeof email === "string" ? email : "";
  }
  return "";
}

/**
 * Extract user ID safely from a Better Auth user object
 */
export function getUserId(user: unknown): string {
  if (isBetterAuthUser(user)) {
    return user._id;
  }
  // Fallback for unsafe access with proper type checking
  if (typeof user === "object" && user !== null && "_id" in user) {
    const id = (user as Record<string, unknown>)._id;
    return typeof id === "string" ? id : "";
  }
  return "";
}
