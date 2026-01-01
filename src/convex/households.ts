import { v } from "convex/values";
import type { Doc, Id } from "./_generated/dataModel";
import { mutation, query } from "./_generated/server";
import {
  checkFamilyMemberLimit,
  requireActiveSubscription,
  requireAuth,
  requireHouseholdAccess,
  requireHouseholdAdmin,
} from "./auth";
import { logActivity } from "./shared/activity";
import { incrementMemberCount } from "./shared/counters";
import { EMAIL_REGEX } from "./shared/validators";

/**
 * Household management functions
 *
 * Households are the primary organizational unit for families in Pathible.
 * Each household can have multiple members with different roles.
 */

function countsTowardMemberLimit(membership: Doc<"householdMemberships">): boolean {
  return membership.role !== "owner" && membership.status === "active";
}

// ============================================================================
// QUERIES
// ============================================================================

/**
 * Get a household by ID
 * User must be a member to access
 */
export const get = query({
  args: {
    householdId: v.id("households"),
  },
  returns: v.union(
    v.object({
      _id: v.id("households"),
      _creationTime: v.number(),
      name: v.string(),
      description: v.optional(v.string()),
      imageUrl: v.optional(v.string()),
      primaryContactId: v.id("profiles"),
      subscriptionTier: v.union(
        v.literal("foundations"),
        v.literal("heritage"),
        v.literal("legacy"),
        v.literal("founders"),
      ),
      subscriptionStatus: v.union(
        v.literal("active"),
        v.literal("inactive"),
        v.literal("cancelled"),
        v.literal("past_due"),
      ),
      updatedAt: v.number(),
      // Include the user's role in this household
      userRole: v.union(
        v.literal("owner"),
        v.literal("steward"),
        v.literal("viewer"),
        v.literal("executor"),
      ),
      memberCount: v.number(),
      familyUnitCount: v.optional(v.number()),
      storageUsedBytes: v.optional(v.number()),
      vaultDocumentCount: v.optional(v.number()),
    }),
    v.null(),
  ),
  handler: async (ctx, args) => {
    // Get the specific household requested
    const household = await ctx.db.get(args.householdId);
    if (!household) {
      return null;
    }

    // Verify the user has access to this household
    let membership: Doc<"householdMemberships">;
    try {
      membership = await requireHouseholdAccess(ctx, args.householdId);
    } catch {
      // User is not a member of this household
      return null;
    }

    return {
      ...household,
      userRole: membership.role,
      // Use pre-computed counter (O(1) instead of N+1 query)
      memberCount: household.memberCount ?? 0,
    };
  },
});

/**
 * List all households the current user is a member of
 *
 * Returns null during auth race conditions (when session isn't ready yet)
 * This allows clients to distinguish between:
 * - undefined: query still loading
 * - null: auth not ready (should retry)
 * - []: auth worked but user has no households
 */
export const list = query({
  args: {},
  returns: v.union(
    v.array(
      v.object({
        _id: v.id("households"),
        _creationTime: v.number(),
        name: v.string(),
        description: v.optional(v.string()),
        imageUrl: v.optional(v.string()),
        primaryContactId: v.id("profiles"),
        subscriptionTier: v.union(
          v.literal("foundations"),
          v.literal("heritage"),
          v.literal("legacy"),
          v.literal("founders"),
        ),
        subscriptionStatus: v.union(
          v.literal("active"),
          v.literal("inactive"),
          v.literal("cancelled"),
          v.literal("past_due"),
        ),
        updatedAt: v.number(),
        // Include the user's role in this household
        userRole: v.union(
          v.literal("owner"),
          v.literal("steward"),
          v.literal("viewer"),
          v.literal("executor"),
        ),
        memberCount: v.number(),
        familyUnitCount: v.optional(v.number()),
        storageUsedBytes: v.optional(v.number()),
        vaultDocumentCount: v.optional(v.number()),
      }),
    ),
    v.null(),
  ),
  handler: async (ctx) => {
    // Handle auth race condition: return null if auth token not yet synchronized
    // This allows the frontend to show loading state until Convex auth is ready
    let profile: Awaited<ReturnType<typeof requireAuth>>["profile"];
    try {
      const auth = await requireAuth(ctx);
      profile = auth.profile;
    } catch {
      // Return null to signal "auth not ready" - distinct from [] which means "no households"
      return null;
    }

    // Get all active memberships for this user
    const memberships = await ctx.db
      .query("householdMemberships")
      .withIndex("by_user", (q) => q.eq("userId", profile._id))
      .collect();

    const activeMemberships = memberships.filter((m) => m.status === "active");

    // Get household details for each membership
    const households = await Promise.all(
      activeMemberships.map(async (membership) => {
        const household = await ctx.db.get(membership.householdId);
        if (!household) return null;

        return {
          ...household,
          userRole: membership.role,
          // Use pre-computed counter (O(1) instead of N+1 query)
          memberCount: household.memberCount ?? 0,
        };
      }),
    );

    // Filter out any null values and return with proper typing
    type HouseholdWithDetails = NonNullable<(typeof households)[number]>;
    return households.filter((h): h is HouseholdWithDetails => h !== null);
  },
});

/**
 * List all members of a household
 * User must be a member to view
 */
export const listMembers = query({
  args: {
    householdId: v.id("households"),
  },
  returns: v.array(
    v.object({
      _id: v.id("householdMemberships"),
      userId: v.id("profiles"),
      profile: v.object({
        _id: v.id("profiles"),
        firstName: v.string(),
        lastName: v.string(),
        avatarUrl: v.optional(v.string()),
      }),
      relationship: v.optional(v.string()),
      role: v.union(
        v.literal("owner"),
        v.literal("steward"),
        v.literal("viewer"),
        v.literal("executor"),
      ),
      status: v.union(v.literal("active"), v.literal("pending"), v.literal("inactive")),
      invitedBy: v.optional(v.id("profiles")),
      joinedAt: v.optional(v.number()),
    }),
  ),
  handler: async (ctx, args) => {
    await requireHouseholdAccess(ctx, args.householdId);

    const memberships = await ctx.db
      .query("householdMemberships")
      .withIndex("by_household", (q) => q.eq("householdId", args.householdId))
      .collect();

    // Get profile details for each member
    const members = await Promise.all(
      memberships.map(async (membership) => {
        const profile = await ctx.db.get(membership.userId);
        if (!profile) return null;

        return {
          _id: membership._id,
          userId: membership.userId,
          profile: {
            _id: profile._id,
            firstName: profile.firstName,
            lastName: profile.lastName,
            avatarUrl: profile.avatarUrl,
          },
          relationship: membership.relationship,
          role: membership.role,
          status: membership.status,
          invitedBy: membership.invitedBy,
          joinedAt: membership.joinedAt,
        };
      }),
    );

    // Filter out null values and sort by role (owners first, then stewards, etc.)
    type MemberWithProfile = NonNullable<(typeof members)[number]>;
    const validMembers = members.filter((m): m is MemberWithProfile => m !== null);
    const roleOrder = { owner: 0, steward: 1, executor: 2, viewer: 3 };
    return validMembers.sort((a, b) => roleOrder[a.role] - roleOrder[b.role]);
  },
});

/**
 * List pending invitations for a household
 * User must be an admin to view
 */
export const listInvitations = query({
  args: {
    householdId: v.id("households"),
  },
  returns: v.array(
    v.object({
      _id: v.id("householdInvitations"),
      _creationTime: v.number(),
      email: v.string(),
      invitedBy: v.object({
        _id: v.id("profiles"),
        firstName: v.string(),
        lastName: v.string(),
      }),
      relationship: v.optional(v.string()),
      role: v.union(v.literal("steward"), v.literal("viewer"), v.literal("executor")),
      status: v.union(
        v.literal("pending"),
        v.literal("accepted"),
        v.literal("declined"),
        v.literal("expired"),
        v.literal("failed"),
      ),
      expiresAt: v.number(),
    }),
  ),
  handler: async (ctx, args) => {
    await requireHouseholdAdmin(ctx, args.householdId);

    const invitations = await ctx.db
      .query("householdInvitations")
      .withIndex("by_household", (q) => q.eq("householdId", args.householdId))
      .collect();

    // Get inviter details for each invitation
    const invitationsWithDetails = await Promise.all(
      invitations.map(async (invitation) => {
        const inviter = await ctx.db.get(invitation.invitedBy);
        if (!inviter) return null;

        return {
          _id: invitation._id,
          _creationTime: invitation._creationTime,
          email: invitation.email,
          invitedBy: {
            _id: inviter._id,
            firstName: inviter.firstName,
            lastName: inviter.lastName,
          },
          relationship: invitation.relationship,
          role: invitation.role,
          status: invitation.status,
          expiresAt: invitation.expiresAt,
        };
      }),
    );

    type InvitationWithDetails = NonNullable<(typeof invitationsWithDetails)[number]>;
    return invitationsWithDetails.filter((i): i is InvitationWithDetails => i !== null);
  },
});

// ============================================================================
// Note: The generateSecureToken action has been moved to src/convex/utils.ts
// to use Node.js crypto module without affecting other functions in this file

// ============================================================================
// MUTATIONS
// ============================================================================

/**
 * Create a new household
 * The creator becomes the owner and primary contact
 */
export const create = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
  },
  returns: v.id("households"),
  handler: async (ctx, args) => {
    const { profile } = await requireAuth(ctx);

    // Validate inputs
    if (!args.name.trim()) {
      throw new Error("Household name is required");
    }

    if (args.name.length > 100) {
      throw new Error("Household name is too long (max 100 characters)");
    }

    if (args.description && args.description.length > 500) {
      throw new Error("Description is too long (max 500 characters)");
    }

    // Create the household
    const householdId = await ctx.db.insert("households", {
      name: args.name.trim(),
      description: args.description?.trim(),
      primaryContactId: profile._id,
      subscriptionTier: "foundations",
      subscriptionStatus: "active",
      storageUsedBytes: 0,
      memberCount: 0,
      familyUnitCount: 0,
      updatedAt: Date.now(),
    });

    // Add the creator as owner
    await ctx.db.insert("householdMemberships", {
      householdId,
      userId: profile._id,
      role: "owner",
      status: "active",
      joinedAt: Date.now(),
    });

    await logActivity(ctx, {
      householdId,
      userId: profile._id,
      module: "household",
      actionType: "household_created",
      entityType: "household",
      entityId: householdId,
      description: "Created household",
    });

    return householdId;
  },
});

/**
 * Update a household
 * User must be an admin or owner
 */
export const update = mutation({
  args: {
    householdId: v.id("households"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
  },
  returns: v.id("households"),
  handler: async (ctx, args) => {
    await requireHouseholdAdmin(ctx, args.householdId);
    const { profile } = await requireAuth(ctx);

    // SECURITY: Require active subscription for modifications
    await requireActiveSubscription(ctx, args.householdId);

    // Build update object with proper typing
    const updates: {
      updatedAt: number;
      name?: string;
      description?: string;
      imageUrl?: string;
    } = {
      updatedAt: Date.now(),
    };

    if (args.name !== undefined) {
      if (!args.name.trim()) {
        throw new Error("Household name cannot be empty");
      }
      if (args.name.length > 100) {
        throw new Error("Household name is too long (max 100 characters)");
      }
      updates.name = args.name.trim();
    }

    if (args.description !== undefined) {
      if (args.description && args.description.length > 500) {
        throw new Error("Description is too long (max 500 characters)");
      }
      updates.description = args.description?.trim();
    }

    if (args.imageUrl !== undefined) {
      updates.imageUrl = args.imageUrl;
    }

    // Update the household
    await ctx.db.patch(args.householdId, updates);

    await logActivity(ctx, {
      householdId: args.householdId,
      userId: profile._id,
      module: "household",
      actionType: "household_updated",
      entityType: "household",
      entityId: args.householdId,
      description: "Updated household",
    });

    return args.householdId;
  },
});

/**
 * Invite a member to the household
 * User must be an admin or owner
 */
export const inviteMember = mutation({
  args: {
    householdId: v.id("households"),
    email: v.string(),
    relationship: v.optional(v.string()),
    role: v.union(v.literal("steward"), v.literal("viewer"), v.literal("executor")),
    secureToken: v.string(), // Pre-generated secure token from action
  },
  returns: v.id("householdInvitations"),
  handler: async (ctx, args) => {
    await requireHouseholdAdmin(ctx, args.householdId);
    const { profile } = await requireAuth(ctx);

    // SECURITY: Require active subscription and check member limit before inviting
    await requireActiveSubscription(ctx, args.householdId);
    await checkFamilyMemberLimit(ctx, args.householdId, true);

    // Validate email
    if (!EMAIL_REGEX.test(args.email)) {
      throw new Error("Invalid email address");
    }

    // Note: We cannot check if the email belongs to an existing user because
    // Better Auth manages its own tables. The existing membership check will
    // happen when they accept the invitation.

    // Check for pending invitation by email and household using compound index
    const pendingInvitation = await ctx.db
      .query("householdInvitations")
      .withIndex("by_household_email_status", (q) =>
        q
          .eq("householdId", args.householdId)
          .eq("email", args.email.toLowerCase())
          .eq("status", "pending"),
      )
      .first();

    // Check if there's a valid (non-expired) pending invitation
    if (pendingInvitation && pendingInvitation.expiresAt > Date.now()) {
      throw new Error("An invitation is already pending for this email");
    }

    // Use the pre-generated secure token (generated via action)
    const token = args.secureToken;

    // Create invitation (expires in 7 days)
    const invitationId = await ctx.db.insert("householdInvitations", {
      householdId: args.householdId,
      email: args.email.toLowerCase(),
      invitedBy: profile._id,
      relationship: args.relationship,
      role: args.role,
      token,
      status: "pending",
      expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    await logActivity(ctx, {
      householdId: args.householdId,
      userId: profile._id,
      module: "household",
      actionType: "member_invited",
      entityType: "household",
      entityId: args.householdId,
      description: `Invited ${args.email} to join household`,
    });

    // TODO: Send invitation email (implement in separate email service)

    return invitationId;
  },
});

/**
 * Accept a household invitation
 * User must be authenticated and the invitation must be valid
 */
export const acceptInvitation = mutation({
  args: {
    token: v.string(),
  },
  returns: v.id("householdMemberships"),
  handler: async (ctx, args) => {
    const { user, profile } = await requireAuth(ctx);

    // Find the invitation
    const invitation = await ctx.db
      .query("householdInvitations")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .unique();

    if (!invitation) {
      throw new Error("Invitation not found");
    }

    // Validate invitation
    if (invitation.status !== "pending") {
      throw new Error("Invitation is no longer valid");
    }

    if (invitation.expiresAt < Date.now()) {
      // Mark as expired
      await ctx.db.patch(invitation._id, { status: "expired" });
      throw new Error("Invitation has expired");
    }

    // Check if email matches - safely access email from user object
    const userEmail = (user as { email?: string }).email || "";
    if (invitation.email.toLowerCase() !== userEmail.toLowerCase()) {
      throw new Error("This invitation is for a different email address");
    }

    // Check if already a member
    const existingMembership = await ctx.db
      .query("householdMemberships")
      .withIndex("by_household_and_user", (q) =>
        q.eq("householdId", invitation.householdId).eq("userId", profile._id),
      )
      .unique();

    if (existingMembership && existingMembership.status === "active") {
      throw new Error("You are already a member of this household");
    }

    // Create or update membership
    let membershipId: Id<"householdMemberships">;
    let shouldIncrement = false;

    if (existingMembership) {
      const wasCounted = countsTowardMemberLimit(existingMembership);
      const nextMembership = {
        ...existingMembership,
        role: invitation.role,
        relationship: invitation.relationship,
        status: "active" as const,
      };

      await ctx.db.patch(existingMembership._id, {
        role: invitation.role,
        relationship: invitation.relationship,
        status: "active",
        joinedAt: Date.now(),
      });
      membershipId = existingMembership._id;
      shouldIncrement = !wasCounted && countsTowardMemberLimit(nextMembership);
    } else {
      // Create new membership
      membershipId = await ctx.db.insert("householdMemberships", {
        householdId: invitation.householdId,
        userId: profile._id,
        relationship: invitation.relationship,
        role: invitation.role,
        status: "active",
        joinedAt: Date.now(),
      });
      // Invitations never create owner roles, so they always count toward the non-owner limit.
      shouldIncrement = true;
    }

    if (shouldIncrement) {
      await incrementMemberCount(ctx.db, invitation.householdId, 1);
    }

    // Mark invitation as accepted
    await ctx.db.patch(invitation._id, { status: "accepted" });

    // Link any pending family member record to this profile
    const pendingFamilyMembers = await ctx.db
      .query("familyMembers")
      .withIndex("by_household_and_status", (q) =>
        q.eq("householdId", invitation.householdId).eq("status", "pending_invite"),
      )
      .collect();

    const matchingFamilyMember = pendingFamilyMembers.find(
      (m) => m.email?.toLowerCase() === invitation.email.toLowerCase(),
    );

    if (matchingFamilyMember) {
      await ctx.db.patch(matchingFamilyMember._id, {
        profileId: profile._id,
        status: "active",
        updatedAt: Date.now(),
      });
    }

    await logActivity(ctx, {
      householdId: invitation.householdId,
      userId: profile._id,
      module: "household",
      actionType: "member_joined",
      entityType: "household",
      entityId: invitation.householdId,
      description: `${profile.firstName} ${profile.lastName} joined the household`,
    });

    // Create notification for inviter
    await ctx.db.insert("notifications", {
      userId: invitation.invitedBy,
      householdId: invitation.householdId,
      type: "invitation",
      title: "Invitation Accepted",
      message: `${profile.firstName} ${profile.lastName} has joined your household`,
      isRead: false,
    });

    return membershipId;
  },
});

/**
 * Remove a member from a household
 * User must be an admin/owner, or the member themselves
 */
export const removeMember = mutation({
  args: {
    householdId: v.id("households"),
    membershipId: v.id("householdMemberships"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { profile } = await requireAuth(ctx);
    const membership = await requireHouseholdAccess(ctx, args.householdId);

    // SECURITY: Require active subscription for member management
    await requireActiveSubscription(ctx, args.householdId);

    // Get the membership being removed
    const targetMembership = await ctx.db.get(args.membershipId);
    if (!targetMembership) {
      throw new Error("Membership not found");
    }

    if (targetMembership.householdId !== args.householdId) {
      throw new Error("Membership does not belong to this household");
    }

    // Check permissions: must be admin/owner or removing yourself
    const isAdmin = membership.role === "owner" || membership.role === "steward";
    const isSelf = targetMembership.userId === profile._id;

    if (!isAdmin && !isSelf) {
      throw new Error("You do not have permission to remove this member");
    }

    // Prevent removing the last owner
    if (targetMembership.role === "owner") {
      const allMemberships = await ctx.db
        .query("householdMemberships")
        .withIndex("by_household", (q) => q.eq("householdId", args.householdId))
        .collect();

      const ownerCount = allMemberships.filter(
        (m) => m.role === "owner" && m.status === "active",
      ).length;

      if (ownerCount <= 1) {
        throw new Error("Cannot remove the last owner. Transfer ownership first.");
      }
    }

    const wasCounted = countsTowardMemberLimit(targetMembership);

    // Mark membership as inactive
    await ctx.db.patch(args.membershipId, { status: "inactive" });

    if (wasCounted) {
      await incrementMemberCount(ctx.db, args.householdId, -1);
    }

    // Log the activity
    const targetProfile = await ctx.db.get(targetMembership.userId);
    const description = isSelf
      ? "Left the household"
      : "Removed " +
        (targetProfile?.firstName || "") +
        " " +
        (targetProfile?.lastName || "") +
        " from household";

    await logActivity(ctx, {
      householdId: args.householdId,
      userId: profile._id,
      module: "household",
      actionType: "member_removed",
      entityType: "household",
      entityId: args.householdId,
      description,
    });

    return null;
  },
});

/**
 * Update a member's role in a household
 * User must be an owner
 */
export const updateMemberRole = mutation({
  args: {
    householdId: v.id("households"),
    membershipId: v.id("householdMemberships"),
    role: v.union(
      v.literal("owner"),
      v.literal("steward"),
      v.literal("viewer"),
      v.literal("executor"),
    ),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { profile } = await requireAuth(ctx);
    const membership = await requireHouseholdAccess(ctx, args.householdId);

    // SECURITY: Require active subscription for role changes
    await requireActiveSubscription(ctx, args.householdId);

    // Only owners can change roles
    if (membership.role !== "owner") {
      throw new Error("Only household owners can change member roles");
    }

    // Get the target membership
    const targetMembership = await ctx.db.get(args.membershipId);
    if (!targetMembership) {
      throw new Error("Membership not found");
    }

    if (targetMembership.householdId !== args.householdId) {
      throw new Error("Membership does not belong to this household");
    }

    // Cannot change your own role if you're the last owner
    if (
      targetMembership.userId === profile._id &&
      targetMembership.role === "owner" &&
      args.role !== "owner"
    ) {
      const allMemberships = await ctx.db
        .query("householdMemberships")
        .withIndex("by_household", (q) => q.eq("householdId", args.householdId))
        .collect();

      const ownerCount = allMemberships.filter(
        (m) => m.role === "owner" && m.status === "active",
      ).length;

      if (ownerCount <= 1) {
        throw new Error("Cannot change role: You are the last owner. Assign another owner first.");
      }
    }

    const wasCounted = countsTowardMemberLimit(targetMembership);
    const willBeCounted = targetMembership.status === "active" && args.role !== "owner";

    // Update the role
    await ctx.db.patch(args.membershipId, { role: args.role });

    if (wasCounted !== willBeCounted) {
      await incrementMemberCount(ctx.db, args.householdId, willBeCounted ? 1 : -1);
    }

    // Log the activity
    const targetProfile = await ctx.db.get(targetMembership.userId);
    const description =
      "Changed " +
      (targetProfile?.firstName || "") +
      " " +
      (targetProfile?.lastName || "") +
      "'s role to " +
      args.role;

    await logActivity(ctx, {
      householdId: args.householdId,
      userId: profile._id,
      module: "household",
      actionType: "member_role_updated",
      entityType: "household",
      entityId: args.householdId,
      description,
    });

    return null;
  },
});
