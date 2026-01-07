import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireAuth, requireHouseholdAccess } from "./auth";

/**
 * Person Resolution Module
 *
 * Provides queries and mutations for:
 * - Resolving person data from familyMembers or keyContacts
 * - Finding family members by relationship
 * - Building person picker options
 * - Saving new contacts from legal document entry
 */

// ============================================================================
// VALIDATORS
// ============================================================================

const relationshipTypeValidator = v.union(
  v.literal("parent"),
  v.literal("child"),
  v.literal("spouse"),
  v.literal("partner"),
  v.literal("sibling"),
  v.literal("grandparent"),
  v.literal("grandchild"),
  v.literal("aunt_uncle"),
  v.literal("niece_nephew"),
  v.literal("cousin"),
  v.literal("in_law"),
  v.literal("other"),
);

const keyContactRoleValidator = v.union(
  v.literal("attorney"),
  v.literal("financial_advisor"),
  v.literal("executor"),
  v.literal("trustee"),
  v.literal("guardian"),
  v.literal("healthcare_proxy"),
  v.literal("friend"),
  v.literal("neighbor"),
  v.literal("business_partner"),
  v.literal("caregiver"),
  v.literal("charitable_org"),
  v.literal("religious_org"),
  v.literal("other"),
);

const personReferenceValidator = v.object({
  sourceType: v.union(v.literal("familyMember"), v.literal("keyContact"), v.literal("manual")),
  familyMemberId: v.optional(v.id("familyMembers")),
  keyContactId: v.optional(v.id("keyContacts")),
  // Resolved or manually entered data
  fullName: v.string(),
  firstName: v.optional(v.string()),
  lastName: v.optional(v.string()),
  address: v.optional(v.string()),
  city: v.optional(v.string()),
  state: v.optional(v.string()),
  zipCode: v.optional(v.string()),
  phone: v.optional(v.string()),
  email: v.optional(v.string()),
  relationship: v.optional(v.string()),
  dateOfBirth: v.optional(v.number()),
});

const personOptionValidator = v.object({
  id: v.string(),
  type: v.union(v.literal("familyMember"), v.literal("keyContact")),
  sourceId: v.string(), // ID as string for easier handling
  fullName: v.string(),
  firstName: v.optional(v.string()),
  lastName: v.optional(v.string()),
  relationship: v.optional(v.string()),
  relationshipType: v.optional(v.string()),
  isCurrentUser: v.boolean(),
  displayLabel: v.string(),
  subLabel: v.optional(v.string()),
  dateOfBirth: v.optional(v.number()),
  address: v.optional(v.string()),
  city: v.optional(v.string()),
  state: v.optional(v.string()),
  zipCode: v.optional(v.string()),
  phone: v.optional(v.string()),
  email: v.optional(v.string()),
});

const familyMemberValidator = v.object({
  _id: v.id("familyMembers"),
  _creationTime: v.number(),
  familyUnitId: v.id("familyUnits"),
  householdId: v.id("households"),
  profileId: v.optional(v.id("profiles")),
  firstName: v.string(),
  lastName: v.string(),
  email: v.optional(v.string()),
  phone: v.optional(v.string()),
  avatarUrl: v.optional(v.string()),
  dateOfBirth: v.optional(v.number()),
  gender: v.optional(
    v.union(v.literal("male"), v.literal("female"), v.literal("prefer_not_to_say")),
  ),
  city: v.optional(v.string()),
  county: v.optional(v.string()),
  state: v.optional(v.string()),
  address: v.optional(v.string()),
  zipCode: v.optional(v.string()),
  maritalStatus: v.optional(
    v.union(
      v.literal("single"),
      v.literal("married"),
      v.literal("divorced"),
      v.literal("widowed"),
      v.literal("domestic_partnership"),
      v.literal("separated"),
    ),
  ),
  relationshipType: relationshipTypeValidator,
  roles: v.array(v.string()),
  status: v.union(v.literal("active"), v.literal("pending_invite"), v.literal("inactive")),
  orderIndex: v.number(),
  notes: v.optional(v.string()),
  createdBy: v.id("profiles"),
  updatedAt: v.number(),
});

// ============================================================================
// QUERIES
// ============================================================================

/**
 * Get all person options for a household
 * Used to populate person picker dropdowns
 */
export const getPersonOptions = query({
  args: {
    householdId: v.id("households"),
    includeCurrentUser: v.optional(v.boolean()),
    filterByRelationship: v.optional(v.array(v.string())),
    excludeMinors: v.optional(v.boolean()),
  },
  returns: v.array(personOptionValidator),
  handler: async (ctx, args) => {
    const { profile } = await requireAuth(ctx);
    await requireHouseholdAccess(ctx, args.householdId);

    const options: Array<{
      id: string;
      type: "familyMember" | "keyContact";
      sourceId: string;
      fullName: string;
      firstName?: string;
      lastName?: string;
      relationship?: string;
      relationshipType?: string;
      isCurrentUser: boolean;
      displayLabel: string;
      subLabel?: string;
      dateOfBirth?: number;
      address?: string;
      city?: string;
      state?: string;
      zipCode?: string;
      phone?: string;
      email?: string;
    }> = [];

    // Get family members
    const familyMembers = await ctx.db
      .query("familyMembers")
      .withIndex("by_household_and_status", (q) =>
        q.eq("householdId", args.householdId).eq("status", "active"),
      )
      .collect();

    const now = Date.now();
    const eighteenYearsAgo = now - 18 * 365.25 * 24 * 60 * 60 * 1000;

    for (const member of familyMembers) {
      // Skip current user if not included
      const isCurrentUser = member.profileId === profile._id;
      if (!args.includeCurrentUser && isCurrentUser) {
        continue;
      }

      // Filter by relationship if specified
      if (
        args.filterByRelationship &&
        args.filterByRelationship.length > 0 &&
        !args.filterByRelationship.includes(member.relationshipType)
      ) {
        continue;
      }

      // Exclude minors if requested
      if (args.excludeMinors && member.dateOfBirth && member.dateOfBirth > eighteenYearsAgo) {
        continue;
      }

      // For current user, prefer profile data over family member data
      // This ensures their latest profile address is used
      let address = member.address;
      let city = member.city;
      let state = member.state;
      let zipCode = member.zipCode;
      let phone = member.phone;
      let email = member.email;
      let dateOfBirth = member.dateOfBirth;

      if (isCurrentUser) {
        // Use profile data, falling back to family member data
        address = profile.address || member.address;
        city = profile.city || member.city;
        state = profile.state || member.state;
        zipCode = profile.zipCode || member.zipCode;
        phone = profile.phone || member.phone;
        email = profile.email || member.email;
        dateOfBirth = profile.dateOfBirth || member.dateOfBirth;
      }

      const fullName = `${member.firstName} ${member.lastName}`;
      const relationshipLabel = getRelationshipLabel(member.relationshipType);
      const displayLabel = isCurrentUser
        ? `${fullName} (You)`
        : `${fullName} (${relationshipLabel})`;

      // Build sublabel from address
      const addressParts = [city, state].filter(Boolean);
      const subLabel = addressParts.length > 0 ? addressParts.join(", ") : undefined;

      options.push({
        id: `familyMember:${member._id}`,
        type: "familyMember",
        sourceId: member._id,
        fullName,
        firstName: member.firstName,
        lastName: member.lastName,
        relationship: relationshipLabel,
        relationshipType: member.relationshipType,
        isCurrentUser,
        displayLabel,
        subLabel,
        dateOfBirth,
        address,
        city,
        state,
        zipCode,
        phone,
        email,
      });
    }

    // Get key contacts
    const keyContacts = await ctx.db
      .query("keyContacts")
      .withIndex("by_household", (q) => q.eq("householdId", args.householdId))
      .collect();

    for (const contact of keyContacts) {
      // Exclude minors if requested
      if (args.excludeMinors && contact.dateOfBirth && contact.dateOfBirth > eighteenYearsAgo) {
        continue;
      }

      const roleLabel = getKeyContactRoleLabel(contact.role);
      const displayLabel = contact.relationship
        ? `${contact.name} (${contact.relationship})`
        : `${contact.name} (${roleLabel})`;

      const addressParts = [contact.city, contact.state].filter(Boolean);
      const subLabel = addressParts.length > 0 ? addressParts.join(", ") : undefined;

      options.push({
        id: `keyContact:${contact._id}`,
        type: "keyContact",
        sourceId: contact._id,
        fullName: contact.name,
        relationship: contact.relationship || roleLabel,
        isCurrentUser: false,
        displayLabel,
        subLabel,
        dateOfBirth: contact.dateOfBirth,
        address: contact.address,
        city: contact.city,
        state: contact.state,
        zipCode: contact.zipCode,
        phone: contact.phone,
        email: contact.email,
      });
    }

    return options;
  },
});

/**
 * Get current user's family member record
 * Used to pre-populate testator information
 */
export const getCurrentUserAsFamilyMember = query({
  args: { householdId: v.id("households") },
  returns: v.union(familyMemberValidator, v.null()),
  handler: async (ctx, args) => {
    const { profile } = await requireAuth(ctx);
    await requireHouseholdAccess(ctx, args.householdId);

    const member = await ctx.db
      .query("familyMembers")
      .withIndex("by_household", (q) => q.eq("householdId", args.householdId))
      .filter((q) => q.eq(q.field("profileId"), profile._id))
      .first();

    return member;
  },
});

/**
 * Find spouse for current user
 * Returns the family member with relationshipType "spouse" or "partner"
 */
export const getSpouse = query({
  args: { householdId: v.id("households") },
  returns: v.union(familyMemberValidator, v.null()),
  handler: async (ctx, args) => {
    await requireAuth(ctx);
    await requireHouseholdAccess(ctx, args.householdId);

    // Look for spouse or partner
    const members = await ctx.db
      .query("familyMembers")
      .withIndex("by_household_and_status", (q) =>
        q.eq("householdId", args.householdId).eq("status", "active"),
      )
      .collect();

    const spouse = members.find(
      (m) => m.relationshipType === "spouse" || m.relationshipType === "partner",
    );

    return spouse || null;
  },
});

/**
 * Find children for current user
 * Returns family members with relationshipType "child", sorted by age
 */
export const getChildren = query({
  args: { householdId: v.id("households") },
  returns: v.array(familyMemberValidator),
  handler: async (ctx, args) => {
    await requireAuth(ctx);
    await requireHouseholdAccess(ctx, args.householdId);

    const members = await ctx.db
      .query("familyMembers")
      .withIndex("by_household_and_status", (q) =>
        q.eq("householdId", args.householdId).eq("status", "active"),
      )
      .collect();

    const children = members.filter((m) => m.relationshipType === "child");

    // Sort by date of birth (oldest first)
    children.sort((a, b) => {
      if (!a.dateOfBirth && !b.dateOfBirth) return 0;
      if (!a.dateOfBirth) return 1;
      if (!b.dateOfBirth) return -1;
      return a.dateOfBirth - b.dateOfBirth;
    });

    return children;
  },
});

/**
 * Get family members who are minors (under 18)
 */
export const getMinorChildren = query({
  args: { householdId: v.id("households") },
  returns: v.array(familyMemberValidator),
  handler: async (ctx, args) => {
    await requireAuth(ctx);
    await requireHouseholdAccess(ctx, args.householdId);

    const now = Date.now();
    const eighteenYearsAgo = now - 18 * 365.25 * 24 * 60 * 60 * 1000;

    const members = await ctx.db
      .query("familyMembers")
      .withIndex("by_household_and_status", (q) =>
        q.eq("householdId", args.householdId).eq("status", "active"),
      )
      .collect();

    const minorChildren = members.filter(
      (m) => m.relationshipType === "child" && m.dateOfBirth && m.dateOfBirth > eighteenYearsAgo,
    );

    return minorChildren;
  },
});

/**
 * Resolve a person reference to full data
 * Used when generating PDFs or displaying saved documents
 */
export const resolvePersonReference = query({
  args: {
    reference: personReferenceValidator,
    householdId: v.id("households"),
  },
  returns: personReferenceValidator,
  handler: async (ctx, args) => {
    await requireAuth(ctx);
    await requireHouseholdAccess(ctx, args.householdId);

    const { reference } = args;

    // If manual entry, return as-is
    if (reference.sourceType === "manual") {
      return reference;
    }

    // Resolve from familyMember
    if (reference.sourceType === "familyMember" && reference.familyMemberId) {
      const member = await ctx.db.get(reference.familyMemberId);
      if (member && member.householdId === args.householdId) {
        return {
          ...reference,
          fullName: `${member.firstName} ${member.lastName}`,
          firstName: member.firstName,
          lastName: member.lastName,
          address: member.address,
          city: member.city,
          state: member.state,
          zipCode: member.zipCode,
          phone: member.phone,
          email: member.email,
          dateOfBirth: member.dateOfBirth,
          relationship: member.relationshipType,
        };
      }
    }

    // Resolve from keyContact
    if (reference.sourceType === "keyContact" && reference.keyContactId) {
      const contact = await ctx.db.get(reference.keyContactId);
      if (contact && contact.householdId === args.householdId) {
        return {
          ...reference,
          fullName: contact.name,
          address: contact.address,
          city: contact.city,
          state: contact.state,
          zipCode: contact.zipCode,
          phone: contact.phone,
          email: contact.email,
          dateOfBirth: contact.dateOfBirth,
          relationship: contact.relationship,
        };
      }
    }

    // Fallback: return original reference
    return reference;
  },
});

// ============================================================================
// MUTATIONS
// ============================================================================

/**
 * Save a new contact from legal document entry
 * When user enters a new person and opts to save them
 */
export const saveAsKeyContact = mutation({
  args: {
    householdId: v.id("households"),
    legacyPlanId: v.optional(v.id("legacyPlans")),
    name: v.string(),
    role: keyContactRoleValidator,
    relationship: v.optional(v.string()),
    phone: v.optional(v.string()),
    email: v.optional(v.string()),
    address: v.optional(v.string()),
    city: v.optional(v.string()),
    state: v.optional(v.string()),
    zipCode: v.optional(v.string()),
    dateOfBirth: v.optional(v.number()),
    notes: v.optional(v.string()),
  },
  returns: v.id("keyContacts"),
  handler: async (ctx, args) => {
    await requireAuth(ctx);
    await requireHouseholdAccess(ctx, args.householdId);

    const contactId = await ctx.db.insert("keyContacts", {
      householdId: args.householdId,
      legacyPlanId: args.legacyPlanId,
      name: args.name.trim(),
      role: args.role,
      relationship: args.relationship?.trim(),
      phone: args.phone?.trim(),
      email: args.email?.trim().toLowerCase(),
      address: args.address?.trim(),
      city: args.city?.trim(),
      state: args.state?.trim(),
      zipCode: args.zipCode?.trim(),
      dateOfBirth: args.dateOfBirth,
      notes: args.notes?.trim(),
    });

    return contactId;
  },
});

/**
 * Update family member address
 * Used when user updates their address during legal document creation
 */
export const updateFamilyMemberAddress = mutation({
  args: {
    familyMemberId: v.id("familyMembers"),
    address: v.optional(v.string()),
    city: v.optional(v.string()),
    state: v.optional(v.string()),
    zipCode: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await requireAuth(ctx);

    const member = await ctx.db.get(args.familyMemberId);
    if (!member) {
      throw new Error("Family member not found");
    }

    await requireHouseholdAccess(ctx, member.householdId);

    await ctx.db.patch(args.familyMemberId, {
      address: args.address?.trim(),
      city: args.city?.trim(),
      state: args.state?.trim(),
      zipCode: args.zipCode?.trim(),
      updatedAt: Date.now(),
    });

    return null;
  },
});

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function getRelationshipLabel(type: string): string {
  const labels: Record<string, string> = {
    parent: "Parent",
    child: "Child",
    spouse: "Spouse",
    partner: "Partner",
    sibling: "Sibling",
    grandparent: "Grandparent",
    grandchild: "Grandchild",
    aunt_uncle: "Aunt/Uncle",
    niece_nephew: "Niece/Nephew",
    cousin: "Cousin",
    in_law: "In-Law",
    other: "Family",
  };
  return labels[type] || type;
}

function getKeyContactRoleLabel(role: string): string {
  const labels: Record<string, string> = {
    attorney: "Attorney",
    financial_advisor: "Financial Advisor",
    executor: "Executor",
    trustee: "Trustee",
    guardian: "Guardian",
    healthcare_proxy: "Healthcare Proxy",
    friend: "Friend",
    neighbor: "Neighbor",
    business_partner: "Business Partner",
    caregiver: "Caregiver",
    charitable_org: "Charitable Organization",
    religious_org: "Religious Organization",
    other: "Contact",
  };
  return labels[role] || role;
}
