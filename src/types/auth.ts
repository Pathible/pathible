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
export function isBetterAuthUser(obj: any): obj is BetterAuthUser {
  return (
    obj &&
    typeof obj._id === 'string' &&
    typeof obj.email === 'string' &&
    typeof obj.emailVerified === 'boolean' &&
    typeof obj.createdAt === 'number' &&
    typeof obj.updatedAt === 'number'
  );
}

/**
 * Extract email safely from a Better Auth user object
 */
export function getUserEmail(user: any): string {
  if (isBetterAuthUser(user)) {
    return user.email;
  }
  // Fallback for unsafe access
  return user?.email || '';
}

/**
 * Extract user ID safely from a Better Auth user object
 */
export function getUserId(user: any): string {
  if (isBetterAuthUser(user)) {
    return user._id;
  }
  // Fallback for unsafe access
  return user?._id || '';
}
