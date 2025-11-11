import { createClient, type GenericCtx } from "@convex-dev/better-auth";
import { convex } from "@convex-dev/better-auth/plugins";
import { components } from "./_generated/api";
import { DataModel } from "./_generated/dataModel";
import { query, internalQuery } from "./_generated/server";
import { betterAuth } from "better-auth";
import { emailOTP } from "better-auth/plugins";
import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import { Resend } from "resend";
import { getSignInOTPEmail } from "../lib/email-templates/otp-sign-in";
import { getEmailVerificationOTPEmail } from "../lib/email-templates/otp-email-verification";
import { getPasswordResetOTPEmail } from "../lib/email-templates/otp-password-reset";
import type { BetterAuthUser } from "../types/auth";

const siteUrl = process.env.SITE_URL!;
const isDevelopment = process.env.NODE_ENV === 'development';

// Initialize Resend with API key from environment
// Note: In development without RESEND_API_KEY, emails will be logged to console
const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;
const emailFromAddress = process.env.EMAIL_FROM_ADDRESS || "noreply@pathible.com";
const emailFromName = process.env.EMAIL_FROM_NAME || "Pathible";

// The component client has methods needed for integrating Convex with Better Auth,
// as well as helper methods for general use.
export const authComponent = createClient<DataModel>(components.betterAuth);

export const createAuth = (
  ctx: GenericCtx<DataModel>,
  { optionsOnly } = { optionsOnly: false }
) => {
  return betterAuth({
    // disable logging when createAuth is called just to generate options.
    // this is not required, but there's a lot of noise in logs without it.
    logger: {
      disabled: optionsOnly,
    },
    baseURL: siteUrl,
    database: authComponent.adapter(ctx),
    plugins: [
      // Email OTP authentication with secure defaults
      emailOTP({
        // Send OTP via Resend (or console in development)
        sendVerificationOTP: async ({ email, otp, type }) => {
          // Development logging only
          if (isDevelopment) {
            console.log('==============================================');
            console.log('[OTP] Email:', email);
            console.log('[OTP] Type:', type);
            console.log('[OTP] OTP Code:', otp);
            console.log('[OTP] Resend configured:', !!resend);
            console.log('==============================================');
          }

          // Get appropriate email template based on type
          let emailContent: { subject: string; html: string; text: string };

          if (type === "sign-in") {
            emailContent = getSignInOTPEmail(otp);
          } else if (type === "email-verification") {
            emailContent = getEmailVerificationOTPEmail(otp);
          } else {
            // type === "forget-password"
            emailContent = getPasswordResetOTPEmail(otp);
          }

          // Development: Log to console if Resend not configured
          if (!resend) {
            if (isDevelopment) {
              console.log(`
==============================================
📧 OTP Email (Development Mode)
==============================================
To: ${email}
Type: ${type}
Subject: ${emailContent.subject}
OTP Code: ${otp}
==============================================
Note: Configure RESEND_API_KEY to send real emails
==============================================
              `);
            }
            return;
          }

          // Production: Send via Resend
          if (isDevelopment) {
            console.log('[OTP] Attempting to send via Resend...');
          }

          try {
            const { data, error } = await resend.emails.send({
              from: `${emailFromName} <${emailFromAddress}>`,
              to: email,
              subject: emailContent.subject,
              html: emailContent.html,
              text: emailContent.text,
            });

            if (error) {
              console.error('[OTP] Resend error:', error);
              throw new Error(`Failed to send OTP email: ${error.message}`);
            }

            if (isDevelopment) {
              console.log(`[OTP] ✅ Success! Email sent to ${email} (ID: ${data?.id})`);
            }
          } catch (error) {
            console.error('[OTP] Exception sending email:', error);
            throw error;
          }
        },

        // Security Options
        otpLength: 6, // 6-digit OTP
        expiresIn: 300, // 5 minutes
        allowedAttempts: 3, // Maximum 3 attempts before OTP becomes invalid
        sendVerificationOnSignUp: true, // Send OTP to verify email on sign-up
        disableSignUp: false, // Allow automatic user creation on sign-in

        // Store OTP encrypted in database for security
        storeOTP: "encrypted",
      }),

      // The Convex plugin is required for Convex compatibility
      convex(),
    ],
  });
};

// ============================================================================
// AUTHENTICATION QUERIES
// ============================================================================

/**
 * Get the current authenticated user
 * Returns null if not authenticated
 *
 * Note: Returns Better Auth user object which is managed by the auth component.
 * The shape of this object is flexible and may contain additional fields.
 */
export const getCurrentUser = query({
  args: {},
  returns: v.union(
    v.object({
      _id: v.string(),
      email: v.string(),
      emailVerified: v.boolean(),
      name: v.optional(v.string()),
      image: v.optional(v.union(v.string(), v.null())),
      createdAt: v.number(),
      updatedAt: v.number(),
    }),
    v.null()
  ),
  handler: async (ctx) => {
    const user = await authComponent.getAuthUser(ctx);
    if (!user) return null;

    const typedUser = user as BetterAuthUser & { image?: string | null };
    return {
      _id: typedUser._id,
      email: typedUser.email,
      emailVerified: typedUser.emailVerified,
      name: typedUser.name,
      image: typedUser.image,
      createdAt: typedUser.createdAt,
      updatedAt: typedUser.updatedAt,
    };
  },
});

/**
 * Get the current user with their profile
 * Returns null if not authenticated or profile doesn't exist
 */
export const getCurrentUserWithProfile = query({
  args: {},
  returns: v.union(
    v.object({
      user: v.object({
        _id: v.string(),
        email: v.string(),
        emailVerified: v.boolean(),
        name: v.optional(v.string()),
        image: v.optional(v.union(v.string(), v.null())),
        createdAt: v.number(),
        updatedAt: v.number(),
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
        updatedAt: v.number(),
      }),
    }),
    v.null()
  ),
  handler: async (ctx) => {
    const user = await authComponent.getAuthUser(ctx);
    if (!user) return null;

    const typedUser = user as BetterAuthUser & { image?: string | null };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) => q.eq("userId", typedUser._id as string))
      .unique();

    if (!profile) return null;

    return {
      user: {
        _id: typedUser._id,
        email: typedUser.email,
        emailVerified: typedUser.emailVerified,
        name: typedUser.name,
        image: typedUser.image,
        createdAt: typedUser.createdAt,
        updatedAt: typedUser.updatedAt,
      },
      profile
    };
  },
});

// ============================================================================
// AUTHORIZATION HELPERS (Internal)
// ============================================================================

/**
 * Internal helper to check if a user has a specific role
 * Used internally by other functions - not exposed as public API
 */
export const _hasRole = internalQuery({
  args: {
    userId: v.string(), // Better Auth user ID
    role: v.union(v.literal("admin"), v.literal("user")),
  },
  returns: v.boolean(),
  handler: async (ctx, args) => {
    const userRole = await ctx.db
      .query("userRoles")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .unique();

    return userRole?.role === args.role;
  },
});

/**
 * Internal helper to check if a user is a member of a household
 * Used internally by other functions - not exposed as public API
 */
export const _isHouseholdMember = internalQuery({
  args: {
    userId: v.id("profiles"),
    householdId: v.id("households"),
  },
  returns: v.union(
    v.object({
      _id: v.id("householdMemberships"),
      _creationTime: v.number(),
      householdId: v.id("households"),
      userId: v.id("profiles"),
      relationship: v.optional(v.string()),
      role: v.union(
        v.literal("owner"),
        v.literal("steward"),
        v.literal("viewer"),
        v.literal("executor")
      ),
      status: v.union(
        v.literal("active"),
        v.literal("pending"),
        v.literal("inactive")
      ),
      joinedAt: v.number(),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    const membership = await ctx.db
      .query("householdMemberships")
      .withIndex("by_household_and_user", (q) =>
        q.eq("householdId", args.householdId).eq("userId", args.userId)
      )
      .unique();

    // Only return active memberships
    if (!membership || membership.status !== "active") {
      return null;
    }

    return membership;
  },
});

/**
 * Check if the current user has a specific role
 * Public query for role checking
 */
export const hasRole = query({
  args: {
    role: v.union(v.literal("admin"), v.literal("user")),
  },
  returns: v.boolean(),
  handler: async (ctx, args) => {
    const user = await authComponent.getAuthUser(ctx);
    if (!user) return false;

    const typedUser = user as BetterAuthUser;
    const userRole = await ctx.db
      .query("userRoles")
      .withIndex("by_userId", (q) => q.eq("userId", typedUser._id as string))
      .unique();

    return userRole?.role === args.role;
  },
});

/**
 * Check if the current user is a member of a specific household
 * Public query for membership checking
 */
export const isHouseholdMember = query({
  args: {
    householdId: v.id("households"),
  },
  returns: v.boolean(),
  handler: async (ctx, args) => {
    const user = await authComponent.getAuthUser(ctx);
    if (!user) return false;

    const typedUser = user as BetterAuthUser;
    // Get the user's profile
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) => q.eq("userId", typedUser._id as string))
      .unique();

    if (!profile) return false;

    const membership = await ctx.db
      .query("householdMemberships")
      .withIndex("by_household_and_user", (q) =>
        q.eq("householdId", args.householdId).eq("userId", profile._id)
      )
      .unique();

    return membership?.status === "active";
  },
});

/**
 * Get the current user's role in a specific household
 * Returns null if not a member
 */
export const getHouseholdRole = query({
  args: {
    householdId: v.id("households"),
  },
  returns: v.union(
    v.union(
      v.literal("owner"),
      v.literal("steward"),
      v.literal("viewer"),
      v.literal("executor")
    ),
    v.null()
  ),
  handler: async (ctx, args) => {
    const user = await authComponent.getAuthUser(ctx);
    if (!user) return null;

    const typedUser = user as BetterAuthUser;
    // Get the user's profile
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) => q.eq("userId", typedUser._id as string))
      .unique();

    if (!profile) return null;

    const membership = await ctx.db
      .query("householdMemberships")
      .withIndex("by_household_and_user", (q) =>
        q.eq("householdId", args.householdId).eq("userId", profile._id)
      )
      .unique();

    if (!membership || membership.status !== "active") {
      return null;
    }

    return membership.role;
  },
});

// ============================================================================
// HELPER FUNCTIONS FOR USE IN OTHER MUTATIONS/QUERIES
// ============================================================================

/**
 * Helper function to require authentication and return user with profile
 * Throws error if not authenticated or profile doesn't exist
 *
 * Usage in mutations/queries:
 * const { user, profile } = await requireAuth(ctx);
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function requireAuth(ctx: any): Promise<{
  user: BetterAuthUser;
  profile: {
    _id: Id<"profiles">;
    userId: string;
    firstName: string;
    lastName: string;
    avatarUrl?: string;
    phone?: string;
    dateOfBirth?: number;
    updatedAt: number;
    _creationTime: number;
  };
}> {
  const user = await authComponent.getAuthUser(ctx);
  if (!user) {
    throw new Error("Not authenticated");
  }

  const typedUser = user as BetterAuthUser;
  const profile = await ctx.db
    .query("profiles")
    .withIndex("by_userId", (q: {
      eq: (field: string, value: string) => unknown;
    }) => q.eq("userId", typedUser._id as string))
    .unique();

  if (!profile) {
    throw new Error("Profile not found");
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return { user: typedUser, profile: profile as any };
}

/**
 * Helper function to require admin access
 * Throws error if not authenticated or not an admin
 *
 * Usage in mutations/queries:
 * await requireAdmin(ctx);
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function requireAdmin(ctx: any): Promise<void> {
  const user = await authComponent.getAuthUser(ctx);
  if (!user) {
    throw new Error("Not authenticated");
  }

  const typedUser = user as BetterAuthUser;
  const userRole = await ctx.db
    .query("userRoles")
    .withIndex("by_userId", (q: {
      eq: (field: string, value: string) => unknown;
    }) => q.eq("userId", typedUser._id as string))
    .unique();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const role = userRole as { role?: string } | null;
  if (!role || role.role !== "admin") {
    throw new Error("Admin access required");
  }
}

/**
 * Helper function to require household access
 * Throws error if not authenticated or not a member of the household
 * Returns the membership for role checking
 *
 * Usage in mutations/queries:
 * const membership = await requireHouseholdAccess(ctx, householdId);
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function requireHouseholdAccess(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ctx: any,
  householdId: Id<"households">
): Promise<{
  _id: Id<"householdMemberships">;
  householdId: Id<"households">;
  userId: Id<"profiles">;
  relationship?: string;
  role: "owner" | "steward" | "viewer" | "executor";
  status: "active" | "pending" | "inactive";
  joinedAt: number;
  _creationTime: number;
}> {
  const { profile } = await requireAuth(ctx);

  const membership = await ctx.db
    .query("householdMemberships")
    .withIndex("by_household_and_user", (q: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      eq: (field: string, value: any) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        eq: (field: string, value: any) => unknown;
      };
    }) =>
      q.eq("householdId", householdId).eq("userId", profile._id)
    )
    .unique();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const typedMembership = membership as any;

  if (!typedMembership || typedMembership.status !== "active") {
    throw new Error("Access denied: not a member of this household");
  }

  return typedMembership;
}

/**
 * Helper function to require household admin access
 * Throws error if not authenticated or not an admin/owner of the household
 *
 * Usage in mutations/queries:
 * await requireHouseholdAdmin(ctx, householdId);
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function requireHouseholdAdmin(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ctx: any,
  householdId: Id<"households">
): Promise<void> {
  const membership = await requireHouseholdAccess(ctx, householdId);

  if (membership.role !== "owner" && membership.role !== "steward") {
    throw new Error("Admin access required for this household");
  }
}
