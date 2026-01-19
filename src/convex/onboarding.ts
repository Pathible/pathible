import { v } from "convex/values";
import { internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import {
  internalAction,
  internalMutation,
  internalQuery,
  mutation,
  query,
} from "./_generated/server";
import { checkFamilyMemberLimit, requireActiveSubscription, requireAuth } from "./auth";
import { logActivity } from "./shared/activity";
import { onboardingStatusValidator } from "./shared/commonValidators";
import { incrementFamilyUnitCount } from "./shared/counters";
import { EMAIL_REGEX } from "./shared/validators";

/**
 * Onboarding Module
 *
 * Handles the 4-step onboarding wizard:
 * 1. Profile - Complete user profile information
 * 2. Household - Create first household
 * 3. Preferences - Set goals and preferences
 * 4. Invitations - Send invitations to family members
 */

// ============================================================================
// QUERIES
// ============================================================================

/**
 * Get the current user's onboarding status and existing data
 * Used to resume onboarding or redirect to correct step
 */
export const getStatus = query({
  args: {},
  returns: v.object({
    status: onboardingStatusValidator,
    currentStep: v.number(),
    profile: v.object({
      firstName: v.string(),
      lastName: v.string(),
      phone: v.optional(v.string()),
      dateOfBirth: v.optional(v.number()),
      avatarUrl: v.optional(v.string()),
    }),
    household: v.optional(
      v.object({
        id: v.id("households"),
        name: v.string(),
      }),
    ),
  }),
  handler: async (ctx) => {
    const { profile } = await requireAuth(ctx);

    // Get household if exists
    const membership = await ctx.db
      .query("householdMemberships")
      .withIndex("by_user", (q) => q.eq("userId", profile._id))
      .first();

    let household: { id: Id<"households">; name: string } | undefined;
    if (membership) {
      const h = await ctx.db.get(membership.householdId);
      if (h) {
        household = { id: h._id, name: h.name };
      }
    }

    return {
      status: profile.onboardingStatus || "not_started",
      currentStep: profile.onboardingStep || 1,
      profile: {
        firstName: profile.firstName,
        lastName: profile.lastName,
        phone: profile.phone,
        dateOfBirth: profile.dateOfBirth,
        avatarUrl: profile.avatarUrl,
      },
      household,
    };
  },
});

// ============================================================================
// MUTATIONS - Step 1: Profile
// ============================================================================

/**
 * Update user profile with additional information
 * Step 1 of onboarding
 *
 * NOTE: This mutation handles BOTH new users (creates profile) and
 * existing users (updates profile). New Clerk users don't have a
 * profile until they complete this step.
 */
export const updateProfile = mutation({
  args: {
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    phone: v.optional(v.string()),
    dateOfBirth: v.optional(v.number()),
    avatarUrl: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    // Get identity directly - don't use requireAuth since profile may not exist
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const userId = identity.subject; // Clerk user ID

    // Validate inputs - firstName and lastName are required for new profiles
    if (args.firstName !== undefined && !args.firstName.trim()) {
      throw new Error("First name cannot be empty");
    }
    if (args.lastName !== undefined && !args.lastName.trim()) {
      throw new Error("Last name cannot be empty");
    }
    if (args.dateOfBirth && args.dateOfBirth > Date.now()) {
      throw new Error("Date of birth cannot be in the future");
    }
    if (args.phone && !/^\+?[\d\s\-()]+$/.test(args.phone)) {
      throw new Error("Invalid phone number format");
    }

    // Check if profile already exists
    const existingProfile = await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();

    if (existingProfile) {
      // Update existing profile
      const updates: {
        updatedAt: number;
        onboardingStatus: "profile_complete";
        onboardingStep: number;
        firstName?: string;
        lastName?: string;
        phone?: string;
        dateOfBirth?: number;
        avatarUrl?: string;
      } = {
        updatedAt: Date.now(),
        onboardingStatus: "profile_complete",
        onboardingStep: 2,
      };

      if (args.firstName !== undefined) updates.firstName = args.firstName.trim();
      if (args.lastName !== undefined) updates.lastName = args.lastName.trim();
      if (args.phone !== undefined) updates.phone = args.phone;
      if (args.dateOfBirth !== undefined) updates.dateOfBirth = args.dateOfBirth;
      if (args.avatarUrl !== undefined) updates.avatarUrl = args.avatarUrl;

      await ctx.db.patch(existingProfile._id, updates);
    } else {
      // Create new profile for first-time users
      // firstName and lastName are required for new profiles
      if (!args.firstName?.trim() || !args.lastName?.trim()) {
        throw new Error("First name and last name are required");
      }

      await ctx.db.insert("profiles", {
        userId,
        firstName: args.firstName.trim(),
        lastName: args.lastName.trim(),
        phone: args.phone,
        dateOfBirth: args.dateOfBirth,
        avatarUrl: args.avatarUrl,
        onboardingStatus: "profile_complete",
        onboardingStep: 2,
        updatedAt: Date.now(),
      });

      console.log(`[Onboarding] Created profile for user ${userId}`);
    }

    return null;
  },
});

// ============================================================================
// MUTATIONS - Step 2: Household
// ============================================================================

/**
 * Create user's first household
 * Step 2 of onboarding
 * Automatically creates membership with owner role
 */
export const createFirstHousehold = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    // Subscription tier from Clerk Billing - passed from frontend
    // This allows the household to be created with the user's actual subscription tier
    // rather than defaulting to "foundations"
    subscriptionTier: v.optional(
      v.union(
        v.literal("foundations"),
        v.literal("heritage"),
        v.literal("legacy"),
        v.literal("founders"),
      ),
    ),
  },
  returns: v.id("households"),
  handler: async (ctx, args) => {
    const { user, profile } = await requireAuth(ctx);

    // Validate
    if (!args.name.trim()) {
      throw new Error("Household name is required");
    }
    if (args.name.length > 100) {
      throw new Error("Household name is too long (max 100 characters)");
    }

    // Check if user already has a household (prevent duplicates during onboarding)
    const existingMembership = await ctx.db
      .query("householdMemberships")
      .withIndex("by_user", (q) => q.eq("userId", profile._id))
      .first();

    if (existingMembership) {
      throw new Error("You already belong to a household");
    }

    // Use the tier from Clerk Billing if provided, otherwise default to foundations
    const tier = args.subscriptionTier || "foundations";

    // Create household
    const householdId = await ctx.db.insert("households", {
      name: args.name.trim(),
      description: args.description?.trim(),
      primaryContactId: profile._id,
      subscriptionTier: tier,
      subscriptionStatus: "active",
      storageUsedBytes: 0,
      memberCount: 0,
      familyUnitCount: 0,
      updatedAt: Date.now(),
    });

    // Create membership (owner role)
    await ctx.db.insert("householdMemberships", {
      householdId,
      userId: profile._id,
      role: "owner",
      status: "active",
      joinedAt: Date.now(),
    });

    // Create primary family unit for this household
    // This represents the user's immediate family in the Family Ecosystem
    const familyUnitId = await ctx.db.insert("familyUnits", {
      householdId,
      name: "Your Family",
      description: "Your immediate family",
      relationshipToHousehold: "Primary",
      isPrimary: true,
      orderIndex: 0,
      createdBy: profile._id,
      updatedAt: Date.now(),
    });

    await incrementFamilyUnitCount(ctx.db, householdId, 1);

    // Add the user as the first member of the primary family unit
    await ctx.db.insert("familyMembers", {
      familyUnitId,
      householdId,
      profileId: profile._id,
      firstName: profile.firstName,
      lastName: profile.lastName,
      email: user.email,
      phone: profile.phone,
      avatarUrl: profile.avatarUrl,
      dateOfBirth: profile.dateOfBirth,
      city: profile.city,
      county: profile.county,
      state: profile.state,
      address: profile.address,
      zipCode: profile.zipCode,
      maritalStatus: profile.maritalStatus,
      relationshipType: "parent", // Default - user can update later
      roles: ["Family Admin"],
      status: "active",
      orderIndex: 0,
      createdBy: profile._id,
      updatedAt: Date.now(),
    });

    // Update profile onboarding status
    await ctx.db.patch(profile._id, {
      onboardingStatus: "household_complete",
      onboardingStep: 3,
      updatedAt: Date.now(),
    });

    await logActivity(ctx, {
      householdId,
      userId: profile._id,
      module: "household",
      actionType: "household_created",
      entityType: "household",
      entityId: householdId,
      description: `Created household "${args.name.trim()}"`,
    });

    return householdId;
  },
});

// ============================================================================
// MUTATIONS - Step 3: Preferences
// ============================================================================

/**
 * Set user preferences and goals
 * Step 3 of onboarding
 */
export const setPreferences = mutation({
  args: {
    goals: v.array(
      v.union(
        v.literal("document_organization"),
        v.literal("legacy_planning"),
        v.literal("family_heritage"),
        v.literal("financial_clarity"),
        v.literal("estate_planning"),
        v.literal("end_of_life_planning"),
      ),
    ),
    emailNotifications: v.boolean(),
    interestedFeatures: v.array(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { profile } = await requireAuth(ctx);

    // Validate
    if (args.goals.length === 0) {
      throw new Error("Please select at least one goal");
    }
    if (args.goals.length > 6) {
      throw new Error("Please select no more than 6 goals");
    }

    // Check if preferences already exist (in case of retry)
    const existing = await ctx.db
      .query("userPreferences")
      .withIndex("by_profile", (q) => q.eq("profileId", profile._id))
      .first();

    if (existing) {
      // Update existing
      await ctx.db.patch(existing._id, {
        goals: args.goals,
        emailNotifications: args.emailNotifications,
        interestedFeatures: args.interestedFeatures,
        updatedAt: Date.now(),
      });
    } else {
      // Create new
      await ctx.db.insert("userPreferences", {
        profileId: profile._id,
        goals: args.goals,
        emailNotifications: args.emailNotifications,
        interestedFeatures: args.interestedFeatures,
        shareDataWithHousehold: true, // Default
        updatedAt: Date.now(),
      });
    }

    // Update profile onboarding status - mark as complete
    // Step 3 is now the final step, subscription selection comes next
    await ctx.db.patch(profile._id, {
      onboardingStatus: "complete",
      onboardingStep: 3,
      onboardingCompletedAt: Date.now(),
      updatedAt: Date.now(),
    });

    return null;
  },
});

// ============================================================================
// MUTATIONS - Step 4: Invitations
// ============================================================================

/**
 * Send invitations to family members
 * Step 4 of onboarding
 * Creates invitations and schedules email sending
 */
export const sendInvitations = mutation({
  args: {
    invitations: v.array(
      v.object({
        email: v.string(),
        relationship: v.optional(v.string()),
        role: v.union(v.literal("steward"), v.literal("viewer"), v.literal("executor")),
      }),
    ),
  },
  returns: v.object({
    sent: v.number(),
    failed: v.number(),
  }),
  handler: async (ctx, args) => {
    const { profile } = await requireAuth(ctx);

    // Get user's household (must have one from step 2)
    const membership = await ctx.db
      .query("householdMemberships")
      .withIndex("by_user", (q) => q.eq("userId", profile._id))
      .first();

    if (!membership) {
      throw new Error("No household found. Please complete household setup first.");
    }

    const household = await ctx.db.get(membership.householdId);
    if (!household) {
      throw new Error("Household not found");
    }

    // Validate invitations
    if (args.invitations.length === 0) {
      // Allow skipping invitations
      await ctx.db.patch(profile._id, {
        onboardingStatus: "complete",
        onboardingCompletedAt: Date.now(),
        updatedAt: Date.now(),
      });
      return { sent: 0, failed: 0 };
    }

    if (args.invitations.length > 10) {
      throw new Error("Cannot send more than 10 invitations at once");
    }

    // SECURITY: Require active subscription and check member limit
    await requireActiveSubscription(ctx, household._id);
    const { currentCount, maxCount } = await checkFamilyMemberLimit(ctx, household._id, false);
    const remaining = maxCount - currentCount;
    if (args.invitations.length > remaining) {
      throw new Error(
        `Cannot send ${args.invitations.length} invitation(s). Your plan allows ${maxCount} member(s) and you have ${remaining} slot(s) remaining. Upgrade for more.`,
      );
    }

    // Validate email addresses
    for (const inv of args.invitations) {
      if (!EMAIL_REGEX.test(inv.email)) {
        throw new Error(`Invalid email address: ${inv.email}`);
      }
    }

    let sent = 0;
    let failed = 0;

    // Create invitations
    for (const inv of args.invitations) {
      try {
        // Check if invitation already exists using compound index
        const existingInvite = await ctx.db
          .query("householdInvitations")
          .withIndex("by_household_email_status", (q) =>
            q
              .eq("householdId", household._id)
              .eq("email", inv.email.toLowerCase())
              .eq("status", "pending"),
          )
          .first();

        if (existingInvite) {
          // Skip duplicate
          continue;
        }

        // Generate unique token
        const token = crypto.randomUUID();

        // Create invitation
        const invitationId = await ctx.db.insert("householdInvitations", {
          householdId: household._id,
          email: inv.email.toLowerCase(),
          invitedBy: profile._id,
          relationship: inv.relationship,
          role: inv.role,
          token,
          status: "pending",
          expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
        });

        // Schedule email sending (non-blocking)
        await ctx.scheduler.runAfter(0, internal.onboarding.sendInvitationEmail, {
          invitationId,
        });

        sent++;
      } catch (error) {
        console.error(`Failed to send invitation to ${inv.email}:`, error);
        failed++;
      }
    }

    // Mark onboarding complete
    await ctx.db.patch(profile._id, {
      onboardingStatus: "complete",
      onboardingCompletedAt: Date.now(),
      updatedAt: Date.now(),
    });

    await logActivity(ctx, {
      householdId: household._id,
      userId: profile._id,
      module: "household",
      actionType: "member_invited",
      entityType: "household",
      entityId: household._id,
      description: `Invited ${sent} family member(s) to household`,
    });

    return { sent, failed };
  },
});

/**
 * Skip invitations and complete onboarding
 * Step 4 optional skip
 */
export const skipInvitations = mutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const { profile } = await requireAuth(ctx);

    // Mark onboarding complete without sending invitations
    await ctx.db.patch(profile._id, {
      onboardingStatus: "complete",
      onboardingCompletedAt: Date.now(),
      updatedAt: Date.now(),
    });

    return null;
  },
});

// ============================================================================
// INTERNAL FUNCTIONS - Email Sending
// ============================================================================

/**
 * Get invitation details for email
 * Internal query used by sendInvitationEmail action
 */
export const getInvitationDetails = internalQuery({
  args: { invitationId: v.id("householdInvitations") },
  returns: v.union(
    v.object({
      email: v.string(),
      token: v.string(),
      householdName: v.string(),
      inviterName: v.string(),
      expiresAt: v.number(),
    }),
    v.null(),
  ),
  handler: async (ctx, args) => {
    const invitation = await ctx.db.get(args.invitationId);
    if (!invitation) return null;

    const household = await ctx.db.get(invitation.householdId);
    const inviter = await ctx.db.get(invitation.invitedBy);

    if (!household || !inviter) return null;

    return {
      email: invitation.email,
      token: invitation.token,
      householdName: household.name,
      inviterName: `${inviter.firstName} ${inviter.lastName}`,
      expiresAt: invitation.expiresAt,
    };
  },
});

/**
 * Mark invitation as failed
 * Internal mutation used when email sending fails
 */
export const markInvitationFailed = internalMutation({
  args: { invitationId: v.id("householdInvitations") },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.patch(args.invitationId, {
      status: "failed",
    });
    return null;
  },
});

/**
 * Send invitation email
 * Internal action that sends the actual email
 */
export const sendInvitationEmail = internalAction({
  args: {
    invitationId: v.id("householdInvitations"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    // Get invitation details
    const invitation = await ctx.runQuery(internal.onboarding.getInvitationDetails, {
      invitationId: args.invitationId,
    });

    if (!invitation) {
      console.error(`Invitation ${args.invitationId} not found`);
      return null;
    }

    // Send email via Resend (or log in dev mode)
    try {
      if (process.env.RESEND_API_KEY) {
        const { Resend } = await import("resend");
        const resend = new Resend(process.env.RESEND_API_KEY);

        const inviteUrl = `${process.env.SITE_URL}/invite/${invitation.token}`;

        await resend.emails.send({
          from: `${process.env.EMAIL_FROM_NAME || "Pathible"} <${process.env.EMAIL_FROM_ADDRESS}>`,
          to: invitation.email,
          subject: `You've been invited to join ${invitation.householdName} on Pathible`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
              <h1 style="color: #4B7F52;">Pathible</h1>
              <h2>You've been invited!</h2>
              <p>${invitation.inviterName} has invited you to join their household "${invitation.householdName}" on Pathible.</p>
              <p style="margin: 30px 0;">
                <a href="${inviteUrl}" style="background: #4B7F52; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                  Accept Invitation
                </a>
              </p>
              <p style="color: #666;">This invitation expires on ${new Date(invitation.expiresAt).toLocaleDateString()}.</p>
              <p style="color: #999; font-size: 12px; margin-top: 40px;">
                If you didn't expect this invitation, you can safely ignore this email.
              </p>
            </div>
          `,
        });

        console.log(`[Onboarding] Invitation email sent to ${invitation.email}`);
      } else {
        console.log(`[Onboarding] [DEV MODE] Invitation email for ${invitation.email}:`);
        console.log(`  Household: ${invitation.householdName}`);
        console.log(`  Inviter: ${invitation.inviterName}`);
        console.log(`  Token: ${invitation.token}`);
        console.log(`  URL: ${process.env.SITE_URL}/invite/${invitation.token}`);
      }
    } catch (error) {
      console.error(`[Onboarding] Failed to send invitation email:`, error);

      // Update invitation status to failed
      await ctx.runMutation(internal.onboarding.markInvitationFailed, {
        invitationId: args.invitationId,
      });
    }

    return null;
  },
});

/**
 * TEMPORARY: Resend emails for ALL pending invitations
 * Remove after testing is complete
 * Run from dashboard with empty args: {}
 */
export const resendPendingInvitationEmails = internalMutation({
  args: {},
  returns: v.object({
    processed: v.number(),
    invitations: v.array(v.string()),
  }),
  handler: async (ctx) => {
    // Get all pending invitations across all households
    const allInvitations = await ctx.db.query("householdInvitations").collect();
    const pendingInvitations = allInvitations.filter((inv) => inv.status === "pending");

    // Schedule email for each pending invitation that hasn't expired
    const emails: string[] = [];
    for (const invitation of pendingInvitations) {
      if (invitation.expiresAt > Date.now()) {
        await ctx.scheduler.runAfter(0, internal.onboarding.sendInvitationEmail, {
          invitationId: invitation._id,
        });
        emails.push(invitation.email);
      }
    }

    return {
      processed: emails.length,
      invitations: emails,
    };
  },
});
