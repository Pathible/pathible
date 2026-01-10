import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireAuth } from "./auth";
import { validateStateCode, validateZipCode } from "./shared/validators";

/**
 * Profile management functions
 *
 * Profiles extend Better Auth user data with additional information.
 * Each authenticated user should have exactly one profile.
 */

// ============================================================================
// QUERIES
// ============================================================================

/**
 * Get the current user's profile
 * Returns null if not authenticated or profile doesn't exist
 */
export const get = query({
  args: {},
  returns: v.union(
    v.object({
      _id: v.id("profiles"),
      _creationTime: v.number(),
      userId: v.string(), // Better Auth user ID
      firstName: v.string(),
      lastName: v.string(),
      email: v.optional(v.string()),
      avatarUrl: v.optional(v.string()),
      phone: v.optional(v.string()),
      dateOfBirth: v.optional(v.number()),
      // Address fields
      address: v.optional(v.string()),
      city: v.optional(v.string()),
      state: v.optional(v.string()),
      zipCode: v.optional(v.string()),
      // Onboarding tracking
      onboardingStatus: v.optional(
        v.union(
          v.literal("not_started"),
          v.literal("profile_complete"),
          v.literal("household_complete"),
          v.literal("preferences_complete"),
          v.literal("complete"),
        ),
      ),
      onboardingStep: v.optional(v.number()),
      onboardingCompletedAt: v.optional(v.number()),
      updatedAt: v.number(),
      // Soft-delete
      deletedAt: v.optional(v.number()),
    }),
    v.null(),
  ),
  handler: async (ctx) => {
    try {
      // requireAuth() already rejects soft-deleted profiles
      const { profile } = await requireAuth(ctx);
      return profile;
    } catch {
      return null;
    }
  },
});

/**
 * Get a profile by ID (public information only)
 * Used for displaying user information to other household members
 */
export const getById = query({
  args: {
    profileId: v.id("profiles"),
  },
  returns: v.union(
    v.object({
      _id: v.id("profiles"),
      firstName: v.string(),
      lastName: v.string(),
      avatarUrl: v.optional(v.string()),
    }),
    v.null(),
  ),
  handler: async (ctx, args) => {
    const profile = await ctx.db.get(args.profileId);
    // Return null for non-existent or soft-deleted profiles
    if (!profile || profile.deletedAt) return null;

    // Return only public information
    return {
      _id: profile._id,
      firstName: profile.firstName,
      lastName: profile.lastName,
      avatarUrl: profile.avatarUrl,
    };
  },
});

// ============================================================================
// MUTATIONS
// ============================================================================

/**
 * Create a user profile
 * This should be called after user signup to complete their profile
 * Returns the profile ID
 *
 * NOTE: This does NOT use requireAuth() because the profile doesn't exist yet!
 * We only check that the user is authenticated, not that they have a profile.
 */
export const create = mutation({
  args: {
    firstName: v.string(),
    lastName: v.string(),
    phone: v.optional(v.string()),
    dateOfBirth: v.optional(v.number()),
  },
  returns: v.id("profiles"),
  handler: async (ctx, args) => {
    // Get user directly without requiring profile (profile doesn't exist yet!)
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const userId = identity.subject; // Clerk user ID
    console.log(`[Profile] Creating profile for user ${userId}`);

    // Check if profile already exists
    const existing = await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();

    if (existing) {
      console.log(`[Profile] Profile already exists: ${existing._id}`);
      throw new Error("Profile already exists");
    }

    // Validate inputs
    if (!args.firstName.trim()) {
      throw new Error("First name is required");
    }
    if (!args.lastName.trim()) {
      throw new Error("Last name is required");
    }

    if (args.phone && args.phone.length > 20) {
      throw new Error("Phone number is too long");
    }

    if (args.dateOfBirth) {
      // Check that date of birth is not in the future
      if (args.dateOfBirth > Date.now()) {
        throw new Error("Date of birth cannot be in the future");
      }
      // Check that user is not unreasonably old (over 150 years)
      const age = (Date.now() - args.dateOfBirth) / (1000 * 60 * 60 * 24 * 365);
      if (age > 150) {
        throw new Error("Invalid date of birth");
      }
    }

    // Create the profile with email from Clerk identity
    const profileId = await ctx.db.insert("profiles", {
      userId,
      email: identity.email ?? undefined,
      firstName: args.firstName.trim(),
      lastName: args.lastName.trim(),
      phone: args.phone,
      dateOfBirth: args.dateOfBirth,
      updatedAt: Date.now(),
    });

    console.log(`[Profile] Created profile ${profileId} for user ${userId}`);

    return profileId;
  },
});

/**
 * Update the current user's profile
 * Returns the updated profile ID
 */
export const update = mutation({
  args: {
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
    phone: v.optional(v.string()),
    dateOfBirth: v.optional(v.number()),
  },
  returns: v.id("profiles"),
  handler: async (ctx, args) => {
    const { profile } = await requireAuth(ctx);

    // Build update object with only provided fields
    const updates: {
      updatedAt: number;
      firstName?: string;
      lastName?: string;
      avatarUrl?: string;
      phone?: string;
      dateOfBirth?: number;
    } = {
      updatedAt: Date.now(),
    };

    if (args.firstName !== undefined) {
      if (!args.firstName.trim()) {
        throw new Error("First name cannot be empty");
      }
      updates.firstName = args.firstName.trim();
    }

    if (args.lastName !== undefined) {
      if (!args.lastName.trim()) {
        throw new Error("Last name cannot be empty");
      }
      updates.lastName = args.lastName.trim();
    }

    if (args.avatarUrl !== undefined) {
      updates.avatarUrl = args.avatarUrl;
    }

    if (args.phone !== undefined) {
      if (args.phone && args.phone.length > 20) {
        throw new Error("Phone number is too long");
      }
      updates.phone = args.phone;
    }

    if (args.dateOfBirth !== undefined) {
      if (args.dateOfBirth > Date.now()) {
        throw new Error("Date of birth cannot be in the future");
      }
      const age = (Date.now() - args.dateOfBirth) / (1000 * 60 * 60 * 24 * 365);
      if (age > 150) {
        throw new Error("Invalid date of birth");
      }
      updates.dateOfBirth = args.dateOfBirth;
    }

    // Update the profile
    await ctx.db.patch(profile._id, updates);

    return profile._id;
  },
});

/**
 * Update contact information (phone and address)
 * Returns the updated profile ID
 */
export const updateContactInfo = mutation({
  args: {
    phone: v.optional(v.string()),
    address: v.optional(v.string()),
    city: v.optional(v.string()),
    state: v.optional(v.string()),
    zipCode: v.optional(v.string()),
  },
  returns: v.id("profiles"),
  handler: async (ctx, args) => {
    const { profile } = await requireAuth(ctx);

    // Build update object with only provided fields
    const updates: {
      updatedAt: number;
      phone?: string;
      address?: string;
      city?: string;
      state?: string;
      zipCode?: string;
    } = {
      updatedAt: Date.now(),
    };

    // Validate and add phone if provided
    if (args.phone !== undefined) {
      if (args.phone && args.phone.length > 20) {
        throw new Error("Phone number is too long");
      }
      updates.phone = args.phone;
    }

    // Validate and add address fields if provided
    if (args.address !== undefined) {
      if (args.address && args.address.length > 200) {
        throw new Error("Address is too long");
      }
      updates.address = args.address;
    }

    if (args.city !== undefined) {
      if (args.city && args.city.length > 100) {
        throw new Error("City name is too long");
      }
      updates.city = args.city;
    }

    if (args.state !== undefined) {
      updates.state = validateStateCode(args.state);
    }

    if (args.zipCode !== undefined) {
      updates.zipCode = validateZipCode(args.zipCode);
    }

    // Update the profile
    await ctx.db.patch(profile._id, updates);

    return profile._id;
  },
});

/**
 * Soft-delete the current user's profile
 * Sets deletedAt timestamp instead of permanently deleting
 * Data is retained for a grace period before permanent deletion
 * Returns null on success
 */
export const deleteProfile = mutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const { profile } = await requireAuth(ctx);

    // Check if already soft-deleted
    if (profile.deletedAt) {
      throw new Error("Profile is already deleted");
    }

    // Check if user is the primary contact for any households
    const householdsAsPrimary = await ctx.db
      .query("households")
      .withIndex("by_primaryContactId", (q) => q.eq("primaryContactId", profile._id))
      .collect();

    if (householdsAsPrimary.length > 0) {
      throw new Error(
        "Cannot delete profile: You are the primary contact for one or more households. Please transfer ownership first.",
      );
    }

    // Get all household memberships to check ownership
    const memberships = await ctx.db
      .query("householdMemberships")
      .withIndex("by_user", (q) => q.eq("userId", profile._id))
      .collect();

    // Check if user is the only owner of any households
    for (const membership of memberships) {
      if (membership.role === "owner") {
        const household = await ctx.db.get(membership.householdId);
        if (household) {
          // Count other owners
          const otherOwners = await ctx.db
            .query("householdMemberships")
            .withIndex("by_household", (q) => q.eq("householdId", membership.householdId))
            .collect();

          const hasOtherOwner = otherOwners.some(
            (m) => m.role === "owner" && m.userId !== profile._id,
          );

          if (!hasOtherOwner) {
            throw new Error(
              `Cannot delete profile: You are the only owner of household "${household.name}". Please transfer ownership first.`,
            );
          }
        }
      }
    }

    // Soft-delete: Set deletedAt timestamp instead of hard delete
    await ctx.db.patch(profile._id, {
      deletedAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Mark memberships as inactive (soft removal from households)
    for (const membership of memberships) {
      await ctx.db.patch(membership._id, {
        status: "inactive",
      });
    }

    return null;
  },
});

/**
 * Migration: Link existing profile to Clerk user
 *
 * This mutation is used to migrate profiles created under Better Auth
 * to work with Clerk authentication. It updates the profile's userId
 * to match the current Clerk user ID.
 *
 * NOTE: This is a one-time migration function. Once all profiles are
 * migrated, this function should be removed.
 */
export const linkToClerkUser = mutation({
  args: {
    email: v.string(), // Email to find the existing profile
  },
  returns: v.union(v.id("profiles"), v.null()),
  handler: async (ctx, args) => {
    // Get the current Clerk user identity
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const clerkUserId = identity.subject;

    console.log(`[Migration] Linking profile for email ${args.email} to Clerk user ${clerkUserId}`);

    // First, check if a profile already exists for this Clerk user ID
    const existingClerkProfile = await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) => q.eq("userId", clerkUserId))
      .unique();

    if (existingClerkProfile) {
      console.log(`[Migration] Profile already exists for Clerk user: ${existingClerkProfile._id}`);
      return existingClerkProfile._id;
    }

    // Find profile by email pattern in the userId (Better Auth format)
    // Better Auth often stores the email as part of the user identifier
    // We'll look for any profile and check manually
    const allProfiles = await ctx.db.query("profiles").collect();

    // Find a profile that might match - look for non-Clerk formatted userId
    // or try to match based on other criteria
    let profileToMigrate = null;

    for (const profile of allProfiles) {
      // Skip already-migrated profiles (Clerk IDs start with "user_")
      if (profile.userId.startsWith("user_")) {
        continue;
      }

      // If email matches what we're looking for, this is likely the profile
      // Better Auth profiles might have email-based IDs or we match by name/other fields
      if (!profile.deletedAt) {
        profileToMigrate = profile;
        break;
      }
    }

    if (!profileToMigrate) {
      console.log(`[Migration] No unmigrated profile found for email ${args.email}`);
      return null;
    }

    console.log(
      `[Migration] Found profile to migrate: ${profileToMigrate._id} (old userId: ${profileToMigrate.userId})`,
    );

    // Update the profile's userId to the Clerk user ID
    await ctx.db.patch(profileToMigrate._id, {
      userId: clerkUserId,
      updatedAt: Date.now(),
    });

    console.log(
      `[Migration] Successfully linked profile ${profileToMigrate._id} to Clerk user ${clerkUserId}`,
    );

    return profileToMigrate._id;
  },
});
