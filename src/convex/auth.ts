import { createClient } from "@convex-dev/better-auth";
import { betterAuth } from "better-auth";
import { emailOTP } from "better-auth/plugins";
import { Resend } from "resend";
import { query } from "./_generated/server";
import { v } from "convex/values";
import type { QueryCtx, MutationCtx } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import { components } from "./_generated/api";

/**
 * Better Auth Configuration for Convex
 *
 * This file sets up Better Auth with Convex adapter and exports helper functions
 * for authentication and authorization in Convex functions.
 */

// Initialize Resend for email sending (only in production with API key)
const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

/**
 * Create the Better Auth instance with Convex adapter
 */
export const createAuth = (ctx: any) =>
  betterAuth({
    database: authComponent.adapter(ctx),
    emailAndPassword: {
      enabled: false, // We use email OTP instead
    },
    plugins: [
      emailOTP({
        async sendVerificationOTP({ email, otp, type }) {
          const emailFrom = process.env.EMAIL_FROM_ADDRESS || "noreply@pathible.com";
          const emailFromName = process.env.EMAIL_FROM_NAME || "Pathible";

          if (resend) {
            try {
              await resend.emails.send({
                from: `${emailFromName} <${emailFrom}>`,
                to: email,
                subject:
                  type === "sign-in"
                    ? "Your Pathible Sign-In Code"
                    : type === "email-verification"
                      ? "Verify Your Pathible Email"
                      : "Reset Your Pathible Password",
                html: `
                  <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                    <h1 style="color: #4B7F52;">Pathible</h1>
                    <h2>Your verification code is:</h2>
                    <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; text-align: center;">
                      <h1 style="font-size: 32px; letter-spacing: 8px; margin: 0;">${otp}</h1>
                    </div>
                    <p style="color: #666; margin-top: 20px;">
                      This code will expire in 5 minutes.
                    </p>
                    <p style="color: #999; font-size: 12px;">
                      If you didn't request this code, please ignore this email.
                    </p>
                  </div>
                `,
              });
              console.log(`[Auth] OTP sent to ${email}`);
            } catch (error) {
              console.error(`[Auth] Failed to send OTP to ${email}:`, error);
              throw new Error("Failed to send verification code");
            }
          } else {
            // Development mode - log OTP to console
            console.log(`[Auth] OTP for ${email}: ${otp} (type: ${type})`);
          }
        },
      }),
    ],
  });

/**
 * Better Auth component instance for Convex
 */
export const authComponent = createClient(components.betterAuth, {
  local: {
    schema: undefined, // Uses default schema from component
  },
});

/**
 * Type for authenticated context with user and profile
 */
export interface AuthenticatedContext {
  user: {
    _id: string;
    email: string;
  };
  profile: {
    _id: Id<"profiles">;
    _creationTime: number;
    userId: string;
    firstName: string;
    lastName: string;
    avatarUrl?: string;
    phone?: string;
    dateOfBirth?: number;
    updatedAt: number;
    onboardingStatus?:
      | "not_started"
      | "profile_complete"
      | "household_complete"
      | "preferences_complete"
      | "complete";
    onboardingStep?: number;
    onboardingCompletedAt?: number;
  };
}

/**
 * Require authentication and return user + profile
 *
 * Throws an error if not authenticated or profile doesn't exist.
 * Use this in mutations and queries that require authentication.
 *
 * @example
 * export const myMutation = mutation({
 *   handler: async (ctx, args) => {
 *     const { user, profile } = await requireAuth(ctx);
 *     // ... use user and profile
 *   }
 * });
 */
export async function requireAuth(
  ctx: QueryCtx | MutationCtx
): Promise<AuthenticatedContext> {
  // Get the authenticated user from Better Auth
  const user = await authComponent.getAuthUser(ctx as any);
  if (!user) {
    throw new Error("Not authenticated");
  }

  // Get the user's profile
  const profile = await ctx.db
    .query("profiles")
    .withIndex("by_userId", (q) => q.eq("userId", user._id as any))
    .unique();

  if (!profile) {
    throw new Error("Profile not found");
  }

  return {
    user: {
      _id: user._id as any,
      email: user.email,
    },
    profile,
  };
}

/**
 * Require admin role
 *
 * Throws an error if not authenticated or not an admin.
 * Use this in admin-only mutations and queries.
 *
 * @example
 * export const adminOnlyMutation = mutation({
 *   handler: async (ctx, args) => {
 *     await requireAdmin(ctx);
 *     // ... admin-only logic
 *   }
 * });
 */
export async function requireAdmin(
  ctx: QueryCtx | MutationCtx
): Promise<void> {
  const { user } = await requireAuth(ctx);

  // Check if user has admin role
  const userRole = await ctx.db
    .query("userRoles")
    .withIndex("by_userId", (q) => q.eq("userId", user._id))
    .unique();

  if (!userRole || userRole.role !== "admin") {
    throw new Error("Admin access required");
  }
}

/**
 * Helper: Get the current authenticated user (without requiring a profile)
 *
 * Returns null if not authenticated.
 * Use this helper in other Convex functions when you need to check auth without throwing.
 */
async function getCurrentUserHelper(
  ctx: QueryCtx | MutationCtx
): Promise<{ user: { _id: string; email: string } } | null> {
  console.log("[Convex Auth] getCurrentUserHelper called");
  const user = await authComponent.safeGetAuthUser(ctx as any);
  console.log("[Convex Auth] safeGetAuthUser result:", user ? "✓ User found" : "✗ No user");

  if (!user) {
    return null;
  }

  return {
    user: {
      _id: user._id as any,
      email: user.email,
    },
  };
}

// ============================================================================
// CONVEX QUERY EXPORTS (for Next.js server-side calls)
// ============================================================================

/**
 * Query: Get current authenticated user (for Next.js getServerSession)
 * Returns user info or null if not authenticated
 */
export const getCurrentUser = query({
  args: {},
  returns: v.union(
    v.object({
      user: v.object({
        _id: v.string(),
        email: v.string(),
      }),
    }),
    v.null()
  ),
  handler: async (ctx) => {
    return await getCurrentUserHelper(ctx);
  },
});

/**
 * Query: Get current user with profile (for Next.js getServerSessionWithProfile)
 * Returns user and profile or null if not authenticated or no profile
 */
export const getCurrentUserWithProfile = query({
  args: {},
  returns: v.union(
    v.object({
      user: v.object({
        _id: v.string(),
        email: v.string(),
      }),
      profile: v.object({
        _id: v.id("profiles"),
        _creationTime: v.number(),
        userId: v.string(),
        firstName: v.string(),
        lastName: v.string(),
        avatarUrl: v.optional(v.string()),
        phone: v.optional(v.string()),
        dateOfBirth: v.optional(v.number()),
        onboardingStatus: v.optional(
          v.union(
            v.literal("not_started"),
            v.literal("profile_complete"),
            v.literal("household_complete"),
            v.literal("preferences_complete"),
            v.literal("complete")
          )
        ),
        onboardingStep: v.optional(v.number()),
        onboardingCompletedAt: v.optional(v.number()),
        updatedAt: v.number(),
      }),
    }),
    v.null()
  ),
  handler: async (ctx) => {
    try {
      const auth = await requireAuth(ctx);
      return auth;
    } catch {
      return null;
    }
  },
});
