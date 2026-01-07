import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireAuth, requireHouseholdAccess, requireSubscriptionTier } from "./auth";
import { logActivity } from "./shared/activity";

/**
 * Legal Documents functions
 *
 * Provides queries and mutations for managing legal document templates.
 * Documents include: Will, Trust, Pour-Over Will, Financial POA,
 * Healthcare POA, and Advance Directive.
 *
 * IMPORTANT: These are educational templates, NOT legal advice.
 * Users must acknowledge disclaimers before generating documents.
 */

// ============================================================================
// VALIDATORS
// ============================================================================

const documentTypeValidator = v.union(
  v.literal("will"),
  v.literal("trust"),
  v.literal("pour_over_will"),
  v.literal("financial_poa"),
  v.literal("healthcare_poa"),
  v.literal("advance_directive"),
);

const documentStatusValidator = v.union(
  v.literal("draft"),
  v.literal("complete"),
  v.literal("generated"),
);

const contactRoleValidator = v.union(
  // Will roles
  v.literal("executor"),
  v.literal("alternate_executor"),
  v.literal("guardian"),
  v.literal("alternate_guardian"),
  v.literal("beneficiary"),
  v.literal("witness"),
  // Trust roles
  v.literal("trustee"),
  v.literal("successor_trustee"),
  v.literal("trust_beneficiary"),
  // POA roles
  v.literal("agent"),
  v.literal("alternate_agent"),
  v.literal("healthcare_agent"),
  v.literal("alternate_healthcare_agent"),
  // Other
  v.literal("notary"),
  v.literal("other"),
);

const legalDocumentValidator = v.object({
  _id: v.id("legalDocuments"),
  _creationTime: v.number(),
  householdId: v.id("households"),
  profileId: v.id("profiles"),
  documentType: documentTypeValidator,
  state: v.string(),
  status: documentStatusValidator,
  responses: v.string(),
  completedAt: v.optional(v.number()),
  lastGeneratedAt: v.optional(v.number()),
  generationCount: v.optional(v.number()),
  disclaimerAcknowledgedAt: v.number(),
  createdAt: v.number(),
  updatedAt: v.number(),
});

const legalDocumentContactValidator = v.object({
  _id: v.id("legalDocumentContacts"),
  _creationTime: v.number(),
  householdId: v.id("households"),
  legalDocumentId: v.id("legalDocuments"),
  keyContactId: v.optional(v.id("keyContacts")),
  role: contactRoleValidator,
  name: v.string(),
  relationship: v.optional(v.string()),
  phone: v.optional(v.string()),
  email: v.optional(v.string()),
  address: v.optional(v.string()),
  distributionPercentage: v.optional(v.number()),
  specificBequest: v.optional(v.string()),
  isPrimary: v.optional(v.boolean()),
  notes: v.optional(v.string()),
});

// ============================================================================
// DOCUMENT TYPE METADATA
// ============================================================================

export const DOCUMENT_TYPES = {
  will: {
    name: "Last Will and Testament",
    description:
      "Specifies how your assets will be distributed and names guardians for minor children",
    icon: "ScrollText",
  },
  trust: {
    name: "Revocable Living Trust",
    description:
      "Holds assets during your lifetime and distributes them after death, avoiding probate",
    icon: "Shield",
  },
  pour_over_will: {
    name: "Pour-Over Will",
    description: "Companion to a trust that transfers any assets not in the trust at death",
    icon: "FileText",
  },
  financial_poa: {
    name: "Durable Power of Attorney",
    description: "Authorizes someone to handle your financial affairs if you become incapacitated",
    icon: "Landmark",
  },
  healthcare_poa: {
    name: "Healthcare Power of Attorney",
    description: "Designates someone to make medical decisions on your behalf",
    icon: "Heart",
  },
  advance_directive: {
    name: "Advance Healthcare Directive",
    description: "Documents your wishes for end-of-life medical treatment",
    icon: "ClipboardList",
  },
} as const;

// ============================================================================
// QUERIES
// ============================================================================

/**
 * List all legal documents for a household
 */
export const list = query({
  args: {
    householdId: v.id("households"),
  },
  returns: v.array(legalDocumentValidator),
  handler: async (ctx, args) => {
    const { profile } = await requireAuth(ctx);
    await requireHouseholdAccess(ctx, args.householdId);

    // Get all documents for this user in this household
    const documents = await ctx.db
      .query("legalDocuments")
      .withIndex("by_household_and_profile", (q) =>
        q.eq("householdId", args.householdId).eq("profileId", profile._id),
      )
      .collect();

    return documents;
  },
});

/**
 * Get a specific legal document by ID
 */
export const get = query({
  args: {
    householdId: v.id("households"),
    documentId: v.id("legalDocuments"),
  },
  returns: v.union(legalDocumentValidator, v.null()),
  handler: async (ctx, args) => {
    const { profile } = await requireAuth(ctx);
    await requireHouseholdAccess(ctx, args.householdId);

    const document = await ctx.db.get(args.documentId);

    // Verify ownership and household match (belt-and-suspenders security)
    if (
      !document ||
      document.profileId !== profile._id ||
      document.householdId !== args.householdId
    ) {
      return null;
    }

    return document;
  },
});

/**
 * Get a legal document by type (for checking if one exists)
 */
export const getByType = query({
  args: {
    householdId: v.id("households"),
    documentType: documentTypeValidator,
  },
  returns: v.union(legalDocumentValidator, v.null()),
  handler: async (ctx, args) => {
    const { profile } = await requireAuth(ctx);
    await requireHouseholdAccess(ctx, args.householdId);

    // Find document of this type for this user
    const documents = await ctx.db
      .query("legalDocuments")
      .withIndex("by_household_and_type", (q) =>
        q.eq("householdId", args.householdId).eq("documentType", args.documentType),
      )
      .collect();

    // Filter to this user's document
    const userDocument = documents.find((doc) => doc.profileId === profile._id);
    return userDocument ?? null;
  },
});

/**
 * Get contacts for a legal document
 */
export const getContacts = query({
  args: {
    householdId: v.id("households"),
    documentId: v.id("legalDocuments"),
  },
  returns: v.array(legalDocumentContactValidator),
  handler: async (ctx, args) => {
    const { profile } = await requireAuth(ctx);
    await requireHouseholdAccess(ctx, args.householdId);

    // Verify document ownership
    const document = await ctx.db.get(args.documentId);
    if (!document || document.profileId !== profile._id) {
      return [];
    }

    const contacts = await ctx.db
      .query("legalDocumentContacts")
      .withIndex("by_document", (q) => q.eq("legalDocumentId", args.documentId))
      .collect();

    return contacts;
  },
});

/**
 * Get summary stats for legal documents
 */
export const getStats = query({
  args: {
    householdId: v.id("households"),
  },
  returns: v.object({
    totalDocuments: v.number(),
    completedDocuments: v.number(),
    draftDocuments: v.number(),
    documentsByType: v.record(v.string(), v.number()),
  }),
  handler: async (ctx, args) => {
    const { profile } = await requireAuth(ctx);
    await requireHouseholdAccess(ctx, args.householdId);

    const documents = await ctx.db
      .query("legalDocuments")
      .withIndex("by_household_and_profile", (q) =>
        q.eq("householdId", args.householdId).eq("profileId", profile._id),
      )
      .collect();

    const documentsByType: Record<string, number> = {};
    let completedDocuments = 0;
    let draftDocuments = 0;

    for (const doc of documents) {
      documentsByType[doc.documentType] = (documentsByType[doc.documentType] || 0) + 1;
      if (doc.status === "complete" || doc.status === "generated") {
        completedDocuments++;
      } else {
        draftDocuments++;
      }
    }

    return {
      totalDocuments: documents.length,
      completedDocuments,
      draftDocuments,
      documentsByType,
    };
  },
});

// ============================================================================
// MUTATIONS
// ============================================================================

/**
 * Create a new legal document (start wizard)
 */
export const create = mutation({
  args: {
    householdId: v.id("households"),
    documentType: documentTypeValidator,
    state: v.string(), // 2-letter state code
  },
  returns: v.id("legalDocuments"),
  handler: async (ctx, args) => {
    const { profile } = await requireAuth(ctx);
    await requireHouseholdAccess(ctx, args.householdId);
    await requireSubscriptionTier(ctx, args.householdId, "legacy");

    // Validate state code
    if (!/^[A-Z]{2}$/.test(args.state)) {
      throw new Error("Invalid state code. Please provide a 2-letter state code (e.g., CA, NY).");
    }

    // Check if document of this type already exists
    const existing = await ctx.db
      .query("legalDocuments")
      .withIndex("by_household_and_type", (q) =>
        q.eq("householdId", args.householdId).eq("documentType", args.documentType),
      )
      .collect();

    const userExisting = existing.find((doc) => doc.profileId === profile._id);
    if (userExisting) {
      throw new Error(
        `You already have a ${DOCUMENT_TYPES[args.documentType].name} document. Please edit the existing one.`,
      );
    }

    const now = Date.now();

    const documentId = await ctx.db.insert("legalDocuments", {
      householdId: args.householdId,
      profileId: profile._id,
      documentType: args.documentType,
      state: args.state,
      status: "draft",
      responses: JSON.stringify({}),
      disclaimerAcknowledgedAt: now,
      createdAt: now,
      updatedAt: now,
    });

    await logActivity(ctx, {
      householdId: args.householdId,
      userId: profile._id,
      actionType: "legal_document_created",
      module: "legacy",
      entityType: "legal_document",
      entityId: documentId,
      description: `Started ${DOCUMENT_TYPES[args.documentType].name}`,
    });

    return documentId;
  },
});

/**
 * Update legal document responses (save wizard progress)
 */
export const updateResponses = mutation({
  args: {
    householdId: v.id("households"),
    documentId: v.id("legalDocuments"),
    responses: v.string(), // JSON string
    currentStep: v.optional(v.number()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { profile } = await requireAuth(ctx);
    await requireHouseholdAccess(ctx, args.householdId);
    await requireSubscriptionTier(ctx, args.householdId, "legacy");

    const document = await ctx.db.get(args.documentId);
    if (!document) {
      throw new Error("Document not found");
    }

    if (document.profileId !== profile._id) {
      throw new Error("You do not have permission to edit this document");
    }

    // Validate JSON
    try {
      JSON.parse(args.responses);
    } catch {
      throw new Error("Invalid responses format");
    }

    await ctx.db.patch(args.documentId, {
      responses: args.responses,
      updatedAt: Date.now(),
    });

    return null;
  },
});

/**
 * Mark document as complete
 */
export const markComplete = mutation({
  args: {
    householdId: v.id("households"),
    documentId: v.id("legalDocuments"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { profile } = await requireAuth(ctx);
    await requireHouseholdAccess(ctx, args.householdId);
    await requireSubscriptionTier(ctx, args.householdId, "legacy");

    const document = await ctx.db.get(args.documentId);
    if (!document) {
      throw new Error("Document not found");
    }

    if (document.profileId !== profile._id) {
      throw new Error("You do not have permission to edit this document");
    }

    const now = Date.now();

    await ctx.db.patch(args.documentId, {
      status: "complete",
      completedAt: now,
      updatedAt: now,
    });

    await logActivity(ctx, {
      householdId: args.householdId,
      userId: profile._id,
      actionType: "legal_document_completed",
      module: "legacy",
      entityType: "legal_document",
      entityId: args.documentId,
      description: `Completed ${DOCUMENT_TYPES[document.documentType].name}`,
    });

    return null;
  },
});

/**
 * Record that PDF was generated
 */
export const recordGeneration = mutation({
  args: {
    householdId: v.id("households"),
    documentId: v.id("legalDocuments"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { profile } = await requireAuth(ctx);
    await requireHouseholdAccess(ctx, args.householdId);
    await requireSubscriptionTier(ctx, args.householdId, "legacy");

    const document = await ctx.db.get(args.documentId);
    if (!document) {
      throw new Error("Document not found");
    }

    if (document.profileId !== profile._id) {
      throw new Error("You do not have permission to edit this document");
    }

    const now = Date.now();

    await ctx.db.patch(args.documentId, {
      status: "generated",
      lastGeneratedAt: now,
      generationCount: (document.generationCount || 0) + 1,
      updatedAt: now,
    });

    await logActivity(ctx, {
      householdId: args.householdId,
      userId: profile._id,
      actionType: "legal_document_generated",
      module: "legacy",
      entityType: "legal_document",
      entityId: args.documentId,
      description: `Generated PDF for ${DOCUMENT_TYPES[document.documentType].name}`,
    });

    return null;
  },
});

/**
 * Delete a legal document
 */
export const remove = mutation({
  args: {
    householdId: v.id("households"),
    documentId: v.id("legalDocuments"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { profile } = await requireAuth(ctx);
    await requireHouseholdAccess(ctx, args.householdId);
    await requireSubscriptionTier(ctx, args.householdId, "legacy");

    const document = await ctx.db.get(args.documentId);
    if (!document) {
      throw new Error("Document not found");
    }

    if (document.profileId !== profile._id) {
      throw new Error("You do not have permission to delete this document");
    }

    // Delete associated contacts first
    const contacts = await ctx.db
      .query("legalDocumentContacts")
      .withIndex("by_document", (q) => q.eq("legalDocumentId", args.documentId))
      .collect();

    for (const contact of contacts) {
      await ctx.db.delete(contact._id);
    }

    // Delete the document
    await ctx.db.delete(args.documentId);

    await logActivity(ctx, {
      householdId: args.householdId,
      userId: profile._id,
      actionType: "legal_document_deleted",
      module: "legacy",
      entityType: "legal_document",
      entityId: args.documentId,
      description: `Deleted ${DOCUMENT_TYPES[document.documentType].name}`,
    });

    return null;
  },
});

// ============================================================================
// CONTACT MUTATIONS
// ============================================================================

/**
 * Add a contact to a legal document
 */
export const addContact = mutation({
  args: {
    householdId: v.id("households"),
    documentId: v.id("legalDocuments"),
    role: contactRoleValidator,
    name: v.string(),
    relationship: v.optional(v.string()),
    phone: v.optional(v.string()),
    email: v.optional(v.string()),
    address: v.optional(v.string()),
    distributionPercentage: v.optional(v.number()),
    specificBequest: v.optional(v.string()),
    isPrimary: v.optional(v.boolean()),
    notes: v.optional(v.string()),
    keyContactId: v.optional(v.id("keyContacts")),
  },
  returns: v.id("legalDocumentContacts"),
  handler: async (ctx, args) => {
    const { profile } = await requireAuth(ctx);
    await requireHouseholdAccess(ctx, args.householdId);
    await requireSubscriptionTier(ctx, args.householdId, "legacy");

    const document = await ctx.db.get(args.documentId);
    if (!document) {
      throw new Error("Document not found");
    }

    if (document.profileId !== profile._id) {
      throw new Error("You do not have permission to edit this document");
    }

    // Validate name
    const trimmedName = args.name.trim();
    if (!trimmedName) {
      throw new Error("Contact name is required");
    }
    if (trimmedName.length > 200) {
      throw new Error("Name is too long (max 200 characters)");
    }

    // If linking to a key contact, validate it exists
    if (args.keyContactId) {
      const keyContact = await ctx.db.get(args.keyContactId);
      if (!keyContact || keyContact.householdId !== args.householdId) {
        throw new Error("Invalid key contact");
      }
    }

    const contactId = await ctx.db.insert("legalDocumentContacts", {
      householdId: args.householdId,
      legalDocumentId: args.documentId,
      keyContactId: args.keyContactId,
      role: args.role,
      name: trimmedName,
      relationship: args.relationship,
      phone: args.phone,
      email: args.email,
      address: args.address,
      distributionPercentage: args.distributionPercentage,
      specificBequest: args.specificBequest,
      isPrimary: args.isPrimary,
      notes: args.notes,
    });

    // Update document timestamp
    await ctx.db.patch(args.documentId, {
      updatedAt: Date.now(),
    });

    return contactId;
  },
});

/**
 * Update a contact
 */
export const updateContact = mutation({
  args: {
    householdId: v.id("households"),
    contactId: v.id("legalDocumentContacts"),
    name: v.optional(v.string()),
    relationship: v.optional(v.string()),
    phone: v.optional(v.string()),
    email: v.optional(v.string()),
    address: v.optional(v.string()),
    distributionPercentage: v.optional(v.number()),
    specificBequest: v.optional(v.string()),
    isPrimary: v.optional(v.boolean()),
    notes: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { profile } = await requireAuth(ctx);
    await requireHouseholdAccess(ctx, args.householdId);
    await requireSubscriptionTier(ctx, args.householdId, "legacy");

    const contact = await ctx.db.get(args.contactId);
    if (!contact || contact.householdId !== args.householdId) {
      throw new Error("Contact not found");
    }

    // Verify document ownership
    const document = await ctx.db.get(contact.legalDocumentId);
    if (!document || document.profileId !== profile._id) {
      throw new Error("You do not have permission to edit this contact");
    }

    // Build update object
    const updates: Partial<typeof contact> = {};

    if (args.name !== undefined) {
      const trimmedName = args.name.trim();
      if (!trimmedName) {
        throw new Error("Contact name is required");
      }
      updates.name = trimmedName;
    }
    if (args.relationship !== undefined) updates.relationship = args.relationship;
    if (args.phone !== undefined) updates.phone = args.phone;
    if (args.email !== undefined) updates.email = args.email;
    if (args.address !== undefined) updates.address = args.address;
    if (args.distributionPercentage !== undefined)
      updates.distributionPercentage = args.distributionPercentage;
    if (args.specificBequest !== undefined) updates.specificBequest = args.specificBequest;
    if (args.isPrimary !== undefined) updates.isPrimary = args.isPrimary;
    if (args.notes !== undefined) updates.notes = args.notes;

    await ctx.db.patch(args.contactId, updates);

    // Update document timestamp
    await ctx.db.patch(contact.legalDocumentId, {
      updatedAt: Date.now(),
    });

    return null;
  },
});

/**
 * Delete a contact
 */
export const deleteContact = mutation({
  args: {
    householdId: v.id("households"),
    contactId: v.id("legalDocumentContacts"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { profile } = await requireAuth(ctx);
    await requireHouseholdAccess(ctx, args.householdId);
    await requireSubscriptionTier(ctx, args.householdId, "legacy");

    const contact = await ctx.db.get(args.contactId);
    if (!contact || contact.householdId !== args.householdId) {
      throw new Error("Contact not found");
    }

    // Verify document ownership
    const document = await ctx.db.get(contact.legalDocumentId);
    if (!document || document.profileId !== profile._id) {
      throw new Error("You do not have permission to delete this contact");
    }

    await ctx.db.delete(args.contactId);

    // Update document timestamp
    await ctx.db.patch(contact.legalDocumentId, {
      updatedAt: Date.now(),
    });

    return null;
  },
});

/**
 * Import contacts from key contacts
 */
export const importFromKeyContacts = mutation({
  args: {
    householdId: v.id("households"),
    documentId: v.id("legalDocuments"),
    legacyPlanId: v.id("legacyPlans"),
  },
  returns: v.number(), // Number of contacts imported
  handler: async (ctx, args) => {
    const { profile } = await requireAuth(ctx);
    await requireHouseholdAccess(ctx, args.householdId);
    await requireSubscriptionTier(ctx, args.householdId, "legacy");

    const document = await ctx.db.get(args.documentId);
    if (!document || document.profileId !== profile._id) {
      throw new Error("Document not found");
    }

    // Validate legacyPlan belongs to the same household (prevent IDOR)
    const legacyPlan = await ctx.db.get(args.legacyPlanId);
    if (!legacyPlan || legacyPlan.householdId !== args.householdId) {
      throw new Error("Invalid legacy plan");
    }

    // Get key contacts from legacy plan
    const keyContacts = await ctx.db
      .query("keyContacts")
      .withIndex("by_legacyPlan", (q) => q.eq("legacyPlanId", args.legacyPlanId))
      .collect();

    // Map key contact roles to legal document roles
    const roleMap: Record<string, string> = {
      attorney: "other", // Attorney isn't a document role, but we import for reference
      financial_advisor: "other",
      executor: "executor",
      trustee: "trustee",
      guardian: "guardian",
      healthcare_proxy: "healthcare_agent",
      other: "other",
    };

    let imported = 0;

    for (const keyContact of keyContacts) {
      const role = roleMap[keyContact.role] || "other";

      await ctx.db.insert("legalDocumentContacts", {
        householdId: args.householdId,
        legalDocumentId: args.documentId,
        keyContactId: keyContact._id,
        role: role as "executor" | "trustee" | "guardian" | "healthcare_agent" | "other",
        name: keyContact.name,
        phone: keyContact.phone,
        email: keyContact.email,
        address: keyContact.address,
        notes: keyContact.notes,
        isPrimary: true,
      });

      imported++;
    }

    // Update document timestamp
    await ctx.db.patch(args.documentId, {
      updatedAt: Date.now(),
    });

    return imported;
  },
});
