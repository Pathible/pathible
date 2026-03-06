import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { articleCategoryValidator } from "./shared/categories";

/**
 * Pathible Database Schema
 *
 * This schema defines the complete data model for the Pathible family heritage
 * and legacy management application.
 */

export default defineSchema({
  // ============================================================================
  // AUTHENTICATION & USER MANAGEMENT
  // ============================================================================

  /**
   * User profiles - extends Clerk user data with additional profile information
   * Clerk handles authentication and provides user identity via JWT
   * Note: userId is v.string() because it's the Clerk user ID (subject from JWT)
   */
  profiles: defineTable({
    userId: v.string(), // Clerk user ID
    email: v.optional(v.string()), // User's email from Clerk (optional for backward compatibility)
    firstName: v.string(),
    lastName: v.string(),
    avatarUrl: v.optional(v.string()),
    phone: v.optional(v.string()),
    dateOfBirth: v.optional(v.number()), // Unix timestamp
    // Address fields for contact information
    address: v.optional(v.string()), // Street address
    city: v.optional(v.string()),
    county: v.optional(v.string()), // County of residence (for legal documents)
    state: v.optional(v.string()), // 2-letter state code (e.g., "CA")
    zipCode: v.optional(v.string()), // ZIP/Postal code
    // Legal document fields
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
    onboardingStep: v.optional(v.number()), // 1-4, current step
    onboardingCompletedAt: v.optional(v.number()), // Unix timestamp
    updatedAt: v.number(), // Unix timestamp
    // Soft-delete support
    deletedAt: v.optional(v.number()), // Unix timestamp when profile was soft-deleted
  }).index("by_userId", ["userId"]),

  /**
   * User roles - for admin access control
   * Roles: 'admin' | 'user'
   * Note: userId is v.string() not v.id() because Better Auth manages user IDs internally
   */
  userRoles: defineTable({
    userId: v.string(), // Better Auth user ID
    role: v.union(v.literal("admin"), v.literal("user")),
  }).index("by_userId", ["userId"]),

  /**
   * User preferences - goals, interests, and communication preferences
   * Set during onboarding step 3
   */
  userPreferences: defineTable({
    profileId: v.id("profiles"),
    // Primary goals (multi-select from onboarding)
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
    // Communication preferences
    emailNotifications: v.boolean(),
    smsNotifications: v.optional(v.boolean()),
    // Feature interests
    interestedFeatures: v.array(v.string()),
    // Privacy settings
    shareDataWithHousehold: v.boolean(), // Default true
    updatedAt: v.number(),
  }).index("by_profile", ["profileId"]),

  // ============================================================================
  // HOUSEHOLD/FAMILY STRUCTURE
  // ============================================================================

  /**
   * Households - the primary organizational unit for families
   */
  households: defineTable({
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
    // Tier override - allows granting higher tier access than what user pays for
    // Use case: Promotional pricing (pay $9.99 for foundations, get legacy features)
    tierOverride: v.optional(
      v.union(
        v.literal("foundations"),
        v.literal("heritage"),
        v.literal("legacy"),
        v.literal("founders"),
      ),
    ),
    tierOverrideReason: v.optional(v.string()), // Audit trail: "promo_2025", "customer_support", etc.
    tierOverrideExpiresAt: v.optional(v.number()), // Unix timestamp - null means permanent
    // Storage usage counter (updated atomically on document create/delete)
    // This avoids O(n) full table scans when checking storage quota
    storageUsedBytes: v.optional(v.number()), // Optional for backwards compatibility with existing data
    // Cached counters for plan enforcement (backfilled lazily for legacy data)
    memberCount: v.optional(v.number()),
    familyUnitCount: v.optional(v.number()),
    // Vault document count counter (updated atomically on document create/delete)
    // Avoids O(n) full table scans for stats queries
    vaultDocumentCount: v.optional(v.number()),
    // Partner referral tracking - identifies which partner referred this household
    // e.g., "cfr" for Christian Financial Resources, "attorney-smith" for a specific lawyer
    referralSource: v.optional(v.string()),
    // Estate administration fields
    estateMode: v.optional(v.boolean()),
    estateActivationId: v.optional(v.id("estateActivations")),
    estateGraceUntil: v.optional(v.number()), // 90-day subscription grace period
    // Executor product (separate from planning subscription)
    executorPurchased: v.optional(v.boolean()),
    executorPurchasedAt: v.optional(v.number()),
    executorPurchasedBy: v.optional(v.id("profiles")),
    updatedAt: v.number(),
  })
    .index("by_primaryContactId", ["primaryContactId"])
    .index("by_referralSource", ["referralSource"]),

  /**
   * Household memberships - join table linking users to households
   */
  householdMemberships: defineTable({
    householdId: v.id("households"),
    userId: v.id("profiles"),
    relationship: v.optional(v.string()), // e.g., "parent", "child", "spouse"
    role: v.union(
      v.literal("owner"),
      v.literal("steward"),
      v.literal("viewer"),
      v.literal("executor"),
    ),
    status: v.union(v.literal("active"), v.literal("pending"), v.literal("inactive")),
    invitedBy: v.optional(v.id("profiles")), // Profile that invited this member
    joinedAt: v.optional(v.number()), // Unix timestamp when member joined
  })
    .index("by_user", ["userId"])
    .index("by_household_and_user", ["householdId", "userId"])
    .index("by_household_and_status", ["householdId", "status"]),

  /**
   * Household invitations - pending invites to join a household
   */
  householdInvitations: defineTable({
    householdId: v.id("households"),
    email: v.string(),
    invitedBy: v.id("profiles"),
    relationship: v.optional(v.string()),
    role: v.union(v.literal("steward"), v.literal("viewer"), v.literal("executor")),
    token: v.string(), // Unique invitation token
    status: v.union(
      v.literal("pending"),
      v.literal("accepted"),
      v.literal("declined"),
      v.literal("expired"),
      v.literal("failed"), // Email send failure
    ),
    expiresAt: v.number(), // Unix timestamp
  })
    .index("by_token", ["token"])
    .index("by_household_email_status", ["householdId", "email", "status"]),

  // ============================================================================
  // FAMILY ECOSYSTEM
  // ============================================================================

  /**
   * Family units - sub-groups within a household (e.g., "The Johnson Family")
   */
  familyUnits: defineTable({
    householdId: v.id("households"),
    name: v.string(),
    description: v.optional(v.string()),
    relationshipToHousehold: v.optional(v.string()),
    isPrimary: v.boolean(),
    orderIndex: v.number(),
    createdBy: v.id("profiles"),
    updatedAt: v.number(),
  })
    .index("by_household_and_orderIndex", ["householdId", "orderIndex"])
    .index("by_household_and_isPrimary", ["householdId", "isPrimary"]),

  /**
   * Family members - members of family units (may or may not be registered users)
   */
  familyMembers: defineTable({
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
    county: v.optional(v.string()), // County of residence (for legal documents)
    state: v.optional(v.string()),
    address: v.optional(v.string()), // Street address
    zipCode: v.optional(v.string()), // ZIP/postal code
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
    relationshipType: v.union(
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
    ),
    roles: v.array(v.string()),
    status: v.union(v.literal("active"), v.literal("pending_invite"), v.literal("inactive")),
    orderIndex: v.number(),
    notes: v.optional(v.string()),
    createdBy: v.id("profiles"),
    updatedAt: v.number(),
  })
    .index("by_familyUnit", ["familyUnitId"])
    .index("by_household_and_status", ["householdId", "status"])
    .index("by_familyUnit_and_status", ["familyUnitId", "status"])
    .index("by_familyUnit_and_profileId", ["familyUnitId", "profileId"]),

  // ============================================================================
  // HERITAGE VAULT
  // ============================================================================

  /**
   * Vault documents - secure document storage with Backblaze B2 and access control
   */
  vaultDocuments: defineTable({
    householdId: v.id("households"),
    uploadedBy: v.id("profiles"),
    name: v.string(),
    description: v.optional(v.string()),

    // Backblaze B2 storage references
    b2FileId: v.string(), // Backblaze file ID
    b2FileName: v.string(), // Full path in bucket (e.g., "household_123/timestamp_uuid_filename.pdf")
    b2BucketName: v.string(), // Bucket name for flexibility

    fileSize: v.number(), // bytes
    fileType: v.string(), // MIME type
    fileHash: v.optional(v.string()), // SHA1 hash for integrity verification

    categories: v.array(v.string()),
    accessLevel: v.union(
      v.literal("household"), // All household members
      v.literal("admins"), // Household admins only
      v.literal("custom"), // Specific users via sharedWithUsers
    ),
    sharedWithUsers: v.array(v.id("profiles")), // For custom access level
    updatedAt: v.number(),
  })
    .index("by_household", ["householdId"])
    .index("by_b2FileId", ["b2FileId"]),

  /**
   * Vault categories - custom categorization for documents
   */
  vaultCategories: defineTable({
    householdId: v.id("households"),
    name: v.string(),
    description: v.optional(v.string()),
    // Document count counter (updated atomically on document create/delete/update)
    // This avoids O(n*m) full table scans when listing categories
    documentCount: v.optional(v.number()), // Optional for backwards compatibility
  })
    .index("by_household", ["householdId"])
    .index("by_household_and_name", ["householdId", "name"]),

  // ============================================================================
  // WISDOM & EDUCATION
  // ============================================================================

  /**
   * Wisdom entries - family values, lessons, and stories
   */
  wisdomEntries: defineTable({
    householdId: v.id("households"),
    authorId: v.id("profiles"),
    title: v.string(),
    content: v.string(), // Rich text/markdown
    category: v.union(
      v.literal("values"),
      v.literal("lessons"),
      v.literal("stories"),
      v.literal("advice"),
      v.literal("traditions"),
    ),
    tags: v.array(v.string()),
    isPublished: v.boolean(),
    sharedWith: v.union(
      v.literal("household"), // All household members
      v.literal("descendants"), // Future generations
      v.literal("specific"), // Specific recipients
    ),
    mediaStorageIds: v.array(v.id("_storage")), // Attached images/videos
    updatedAt: v.number(),
  })
    .index("by_author", ["authorId"])
    .index("by_household_and_category", ["householdId", "category"]),

  /**
   * Letters - future-delivery letters to loved ones
   */
  letters: defineTable({
    householdId: v.id("households"),
    authorId: v.id("profiles"),
    title: v.string(),
    content: v.string(), // Rich text/markdown
    recipientType: v.union(
      v.literal("individual"),
      v.literal("role"), // e.g., "my children"
      v.literal("household"),
    ),
    recipientIds: v.array(v.id("profiles")), // Empty if recipientType is "role" or "household"
    deliveryCondition: v.union(
      v.literal("specific_date"),
      v.literal("after_death"),
      v.literal("milestone"), // e.g., wedding, graduation
      v.literal("manual"),
    ),
    deliveryDate: v.optional(v.number()), // Unix timestamp, for specific_date
    isDelivered: v.boolean(),
    deliveredAt: v.optional(v.number()), // Unix timestamp
    updatedAt: v.number(),
  }).index("by_household", ["householdId"]),

  /**
   * Core beliefs - documented family values and principles
   */
  coreBeliefs: defineTable({
    householdId: v.id("households"),
    createdBy: v.id("profiles"),
    statement: v.string(),
    reflection: v.string(), // Rich text/markdown
    category: v.union(
      v.literal("faith"),
      v.literal("family"),
      v.literal("work"),
      v.literal("community"),
      v.literal("personal"),
      v.literal("other"),
    ),
    orderIndex: v.number(), // For manual ordering
    updatedAt: v.number(),
  }).index("by_household_and_orderIndex", ["householdId", "orderIndex"]),

  // ============================================================================
  // LEGACY PLANNING
  // ============================================================================

  /**
   * Legacy plans - comprehensive end-of-life planning
   */
  legacyPlans: defineTable({
    householdId: v.id("households"),
    userId: v.id("profiles"),
    trustedContacts: v.optional(v.string()), // JSON string of contact info
    guardians: v.optional(v.string()), // JSON string of guardian info
    petCare: v.optional(v.string()), // JSON string of pet care instructions
    memorial: v.optional(v.string()), // JSON string of memorial preferences
    finalMessage: v.optional(v.string()), // Rich text/markdown
    isComplete: v.boolean(),
    completionPercentage: v.number(), // 0-100
    updatedAt: v.number(),
  }).index("by_household_and_user", ["householdId", "userId"]),

  /**
   * Key contacts - important contacts for legacy planning
   */
  keyContacts: defineTable({
    householdId: v.id("households"),
    legacyPlanId: v.optional(v.id("legacyPlans")), // Optional - contacts can exist without legacy plan
    name: v.string(),
    role: v.union(
      // Professional roles
      v.literal("attorney"),
      v.literal("financial_advisor"),
      v.literal("executor"),
      v.literal("trustee"),
      v.literal("guardian"),
      v.literal("healthcare_proxy"),
      // Personal contact roles
      v.literal("friend"),
      v.literal("neighbor"),
      v.literal("business_partner"),
      v.literal("caregiver"),
      v.literal("charitable_org"),
      v.literal("religious_org"),
      v.literal("other"),
    ),
    relationship: v.optional(v.string()), // e.g., "college roommate", "neighbor of 20 years"
    phone: v.optional(v.string()),
    email: v.optional(v.string()),
    address: v.optional(v.string()),
    city: v.optional(v.string()),
    state: v.optional(v.string()),
    zipCode: v.optional(v.string()),
    dateOfBirth: v.optional(v.number()), // For age calculations (executor must be 18+)
    notes: v.optional(v.string()),
  })
    .index("by_household", ["householdId"])
    .index("by_legacyPlan", ["legacyPlanId"]),

  /**
   * Legal documents - user-generated legal document drafts
   * Stores responses to guided wizards for wills, trusts, POAs, etc.
   *
   * IMPORTANT: These are educational templates, not legal advice.
   * Users must acknowledge disclaimers before generating documents.
   */
  legalDocuments: defineTable({
    householdId: v.id("households"),
    profileId: v.id("profiles"),
    documentType: v.union(
      v.literal("will"),
      v.literal("trust"),
      v.literal("pour_over_will"),
      v.literal("financial_poa"),
      v.literal("healthcare_poa"),
      v.literal("advance_directive"),
    ),
    // State determines jurisdiction and specific requirements
    state: v.string(), // 2-letter state code (e.g., "CA")
    status: v.union(
      v.literal("draft"), // User is still filling out
      v.literal("complete"), // All required fields filled
      v.literal("generated"), // PDF has been generated at least once
    ),
    // JSON blob containing all wizard responses
    // Structure varies by documentType
    responses: v.string(),
    // Track document history
    completedAt: v.optional(v.number()), // When marked complete
    lastGeneratedAt: v.optional(v.number()), // Last PDF generation
    generationCount: v.optional(v.number()), // How many times generated
    // User acknowledged legal disclaimers
    disclaimerAcknowledgedAt: v.number(),
    // Timestamps
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_household_and_profile", ["householdId", "profileId"])
    .index("by_household_and_type", ["householdId", "documentType"]),

  /**
   * Legal document contacts - people referenced in legal documents
   * Links to keyContacts where possible, but can store independent entries
   * for document-specific roles (witnesses, notary, etc.)
   */
  legalDocumentContacts: defineTable({
    householdId: v.id("households"),
    legalDocumentId: v.id("legalDocuments"),
    // If linked to an existing key contact
    keyContactId: v.optional(v.id("keyContacts")),
    // Role in this specific document
    role: v.union(
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
    ),
    // Contact details (used if keyContactId is not set)
    name: v.string(),
    relationship: v.optional(v.string()), // e.g., "spouse", "daughter", "friend"
    phone: v.optional(v.string()),
    email: v.optional(v.string()),
    address: v.optional(v.string()),
    // Role-specific fields
    distributionPercentage: v.optional(v.number()), // For beneficiaries
    specificBequest: v.optional(v.string()), // For specific item bequests
    isPrimary: v.optional(v.boolean()), // Primary vs alternate
    notes: v.optional(v.string()),
  })
    .index("by_document", ["legalDocumentId"])
    .index("by_document_and_role", ["legalDocumentId", "role"]),

  // ============================================================================
  // FINANCIAL INTELLIGENCE
  // ============================================================================

  /**
   * Financial accounts - high-level account tracking
   */
  financialAccounts: defineTable({
    householdId: v.id("households"),
    name: v.string(),
    type: v.union(
      v.literal("checking"),
      v.literal("savings"),
      v.literal("investment"),
      v.literal("retirement"),
      v.literal("crypto"),
      v.literal("other"),
    ),
    institution: v.string(),
    accountNumberLast4: v.optional(v.string()), // Last 4 digits for security
    balance: v.optional(v.number()),
    currency: v.string(), // e.g., "USD", "EUR"
    lastUpdated: v.optional(v.number()), // Unix timestamp
    updatedAt: v.number(),
  }).index("by_household", ["householdId"]),

  /**
   * Properties - real estate and property tracking
   */
  properties: defineTable({
    householdId: v.id("households"),
    name: v.string(),
    type: v.union(
      v.literal("primary_residence"),
      v.literal("secondary_residence"),
      v.literal("rental"),
      v.literal("land"),
      v.literal("commercial"),
      v.literal("other"),
    ),
    address: v.optional(v.string()),
    estimatedValue: v.optional(v.number()),
    purchaseDate: v.optional(v.number()), // Unix timestamp
    notes: v.optional(v.string()),
    updatedAt: v.number(),
  }).index("by_household", ["householdId"]),

  /**
   * Insurance policies - insurance policy tracking
   */
  insurancePolicies: defineTable({
    householdId: v.id("households"),
    type: v.union(
      v.literal("life"),
      v.literal("health"),
      v.literal("home"),
      v.literal("auto"),
      v.literal("disability"),
      v.literal("long_term_care"),
      v.literal("umbrella"),
      v.literal("other"),
    ),
    provider: v.string(),
    policyNumberLast4: v.optional(v.string()), // Last 4 digits for security
    coverageAmount: v.optional(v.number()),
    premiumAmount: v.optional(v.number()),
    premiumFrequency: v.optional(
      v.union(
        v.literal("monthly"),
        v.literal("quarterly"),
        v.literal("semi_annual"),
        v.literal("annual"),
      ),
    ),
    beneficiaries: v.optional(v.string()), // JSON string of beneficiary info
    expirationDate: v.optional(v.number()), // Unix timestamp
    updatedAt: v.number(),
  }).index("by_household", ["householdId"]),

  // ============================================================================
  // ADMIN-MANAGED CONTENT
  // ============================================================================

  /**
   * Daily wisdom - admin-curated daily inspirational content
   */
  dailyWisdom: defineTable({
    text: v.string(),
    reference: v.optional(v.string()), // Source attribution
    reflection: v.optional(v.string()), // Additional reflection text
    url: v.optional(v.string()), // Link to full article/resource
    isActive: v.boolean(),
    displayDate: v.number(), // Unix timestamp - when to display
    createdBy: v.string(), // Better Auth user ID (admin)
    updatedAt: v.number(),
  }).index("by_isActive_and_displayDate", ["isActive", "displayDate"]),

  /**
   * Educational articles - admin-authored educational content
   * visibility: "public" = accessible without auth, "subscribers" = requires subscription
   */
  educationalArticles: defineTable({
    title: v.string(),
    slug: v.string(), // URL-friendly identifier
    content: v.string(), // Rich text/markdown
    excerpt: v.string(), // Short description
    category: articleCategoryValidator,
    readTimeMinutes: v.number(),
    featuredImageUrl: v.optional(v.string()),
    status: v.union(v.literal("draft"), v.literal("published"), v.literal("archived")),
    // Visibility controls public access - defaults to "subscribers" for existing articles
    visibility: v.optional(v.union(v.literal("public"), v.literal("subscribers"))),
    viewCount: v.number(),
    authorId: v.string(), // Better Auth user ID (admin author)
    publishedAt: v.optional(v.number()), // Unix timestamp
    updatedAt: v.number(),
  })
    .index("by_slug", ["slug"])
    .index("by_status_and_visibility", ["status", "visibility"])
    .index("by_status_category", ["status", "category"])
    .index("by_status_visibility_category", ["status", "visibility", "category"]),

  /**
   * User article reads - tracks which articles each user has read
   */
  userArticleReads: defineTable({
    userId: v.id("profiles"), // Links to profiles table (user's profile)
    articleId: v.id("educationalArticles"),
    readAt: v.number(), // Unix timestamp when marked as read
  })
    .index("by_user", ["userId"])
    .index("by_user_and_article", ["userId", "articleId"]),

  /**
   * Smart suggestions - AI-driven suggestions for users
   */
  smartSuggestions: defineTable({
    title: v.string(),
    description: v.string(),
    category: v.union(
      v.literal("document"),
      v.literal("planning"),
      v.literal("financial"),
      v.literal("legal"),
      v.literal("legacy"),
      v.literal("other"),
    ),
    priority: v.union(v.literal("high"), v.literal("medium"), v.literal("low")),
    icon: v.optional(v.string()), // Icon identifier
    // Eligibility rules for determining when to show the suggestion
    eligibilityRules: v.optional(
      v.array(
        v.object({
          type: v.union(
            v.literal("subscription_tier"), // Check user's subscription tier
            v.literal("has_documents"), // Check if user has uploaded documents
            v.literal("onboarding_complete"), // Check onboarding status
            v.literal("days_since_signup"), // Check days since registration
            v.literal("feature_unused"), // Check if a feature hasn't been used
            v.literal("custom"), // Custom rule with condition string
          ),
          condition: v.union(
            v.literal("equals"),
            v.literal("not_equals"),
            v.literal("greater_than"),
            v.literal("less_than"),
            v.literal("contains"),
            v.literal("exists"),
          ),
          value: v.optional(v.union(v.string(), v.number(), v.boolean())),
          // Optional: target feature for feature_unused type
          targetFeature: v.optional(v.string()),
        }),
      ),
    ),
    isActive: v.boolean(),
    createdBy: v.string(), // Better Auth user ID (admin)
    updatedAt: v.number(),
  }).index("by_isActive_and_category", ["isActive", "category"]),

  /**
   * User suggestions - tracking of suggestions shown to users
   */
  userSuggestions: defineTable({
    userId: v.id("profiles"),
    householdId: v.id("households"),
    suggestionId: v.id("smartSuggestions"),
    status: v.union(v.literal("pending"), v.literal("dismissed"), v.literal("completed")),
    dismissedAt: v.optional(v.number()), // Unix timestamp
    completedAt: v.optional(v.number()), // Unix timestamp
  })
    .index("by_user_and_status", ["userId", "status"])
    .index("by_household_and_status", ["householdId", "status"]),

  /**
   * Email templates - transactional and system email templates
   *
   * Supports both manual templates (created by admins) and system templates
   * (automated emails triggered by cron jobs with configurable schedules).
   */
  emailTemplates: defineTable({
    // Core template fields
    name: v.string(), // Unique template identifier
    subject: v.string(),
    content: v.string(), // Markdown template with variable placeholders
    description: v.optional(v.string()),
    variables: v.array(v.string()), // Available template variables
    category: v.optional(
      v.union(
        v.literal("onboarding"),
        v.literal("retargeting"),
        v.literal("announcements"),
        v.literal("legacy"),
        v.literal("invitations"),
        v.literal("digest"),
        v.literal("system"),
        v.literal("other"),
      ),
    ),
    updatedAt: v.number(),

    // System template fields (for automated emails)
    isSystemTemplate: v.optional(v.boolean()), // True for automated system templates
    systemTemplateKey: v.optional(v.string()), // Unique key e.g., "vault_empty"
    enabled: v.optional(v.boolean()), // Allow disabling without deleting

    // Schedule configuration for automated emails
    schedule: v.optional(
      v.object({
        frequency: v.union(v.literal("weekly"), v.literal("daily")),
        dayOfWeek: v.optional(v.number()), // 0-6, Sunday=0 (for weekly)
        hourUtc: v.number(), // 0-23
      }),
    ),

    // Trigger conditions - criteria for selecting recipients
    triggerConditions: v.optional(
      v.object({
        onboardingStatus: v.optional(v.string()), // e.g., "complete"
        minDaysSinceOnboarding: v.optional(v.number()), // e.g., 3
        vaultEmpty: v.optional(v.boolean()), // true = vault has no documents
        requireEmailNotifications: v.optional(v.boolean()), // true = user opted in
      }),
    ),

    // Campaign type for tracking and reporting
    campaignType: v.optional(
      v.union(
        v.literal("weekly_vault_empty"),
        v.literal("weekly_digest"),
        v.literal("admin_broadcast"),
        v.literal("other"),
      ),
    ),
  })
    .index("by_name", ["name"])
    .index("by_systemTemplateKey", ["systemTemplateKey"])
    .index("by_isSystemTemplate", ["isSystemTemplate"]),

  /**
   * Sent emails - log of all emails sent through the admin system
   */
  sentEmails: defineTable({
    subject: v.string(),
    content: v.string(), // Stored markdown content
    htmlContent: v.string(), // Rendered HTML sent to Resend
    templateId: v.optional(v.id("emailTemplates")),
    recipientType: v.union(
      v.literal("individual"),
      v.literal("all_users"),
      v.literal("by_tier"),
      v.literal("household_owners"),
    ),
    recipientFilter: v.optional(
      v.object({
        tiers: v.optional(v.array(v.string())),
        userIds: v.optional(v.array(v.id("profiles"))),
      }),
    ),
    recipientCount: v.number(),
    sentBy: v.id("profiles"), // Admin who sent
    status: v.union(
      v.literal("sent"),
      v.literal("partial"), // Some failed
      v.literal("failed"),
      v.literal("queued"), // Added for queue support
    ),
    errorMessage: v.optional(v.string()),
    resendBatchId: v.optional(v.string()), // For tracking with Resend
    campaignId: v.optional(v.string()), // Link to email campaign
  }).index("by_campaignId", ["campaignId"]),

  /**
   * Email queue - rate-limited email processing queue
   * Respects Resend's 2 emails/second limit by scheduling emails 500ms apart
   */
  emailQueue: defineTable({
    to: v.string(), // Recipient email address
    subject: v.string(),
    htmlContent: v.string(), // Pre-rendered HTML content
    // Recipient context for personalization tracking
    recipientContext: v.optional(
      v.object({
        profileId: v.optional(v.id("profiles")),
        firstName: v.optional(v.string()),
        lastName: v.optional(v.string()),
        householdName: v.optional(v.string()),
      }),
    ),
    templateId: v.optional(v.id("emailTemplates")),
    campaignId: v.optional(v.string()), // Links to emailCampaigns
    status: v.union(
      v.literal("queued"),
      v.literal("processing"),
      v.literal("sent"),
      v.literal("failed"),
    ),
    attempts: v.number(), // Number of send attempts
    maxAttempts: v.number(), // Maximum retry attempts (default: 3)
    lastAttemptAt: v.optional(v.number()), // Unix timestamp of last attempt
    errorMessage: v.optional(v.string()), // Last error message
    scheduledFor: v.number(), // Unix timestamp - when to send
    sentAt: v.optional(v.number()), // Unix timestamp when successfully sent
    resendId: v.optional(v.string()), // Resend message ID for tracking
  })
    .index("by_status_scheduledFor", ["status", "scheduledFor"])
    .index("by_campaignId", ["campaignId"]),

  /**
   * Email campaigns - tracking for bulk email operations
   * Used for reporting and monitoring batch email sends
   */
  emailCampaigns: defineTable({
    campaignId: v.string(), // Unique identifier (e.g., "weekly_vault_empty_2024-01-15")
    type: v.union(
      v.literal("weekly_vault_empty"),
      v.literal("weekly_digest"),
      v.literal("admin_broadcast"),
      v.literal("other"),
    ),
    status: v.union(
      v.literal("pending"),
      v.literal("sending"),
      v.literal("completed"),
      v.literal("failed"),
    ),
    totalRecipients: v.number(),
    sentCount: v.number(),
    failedCount: v.number(),
    startedAt: v.number(), // Unix timestamp
    completedAt: v.optional(v.number()), // Unix timestamp when all emails processed
  })
    .index("by_campaignId", ["campaignId"])
    .index("by_type_status", ["type", "status"]),

  // ============================================================================
  // GUIDED TOURS
  // ============================================================================

  /**
   * Tours - admin-managed onboarding tours that guide users through features
   */
  tours: defineTable({
    key: v.string(), // Stable unique identifier (e.g., "welcome", "vault-intro")
    name: v.string(), // Display name
    description: v.optional(v.string()),
    status: v.union(v.literal("draft"), v.literal("published"), v.literal("archived")),
    version: v.number(), // Incremented when tour is updated
    priority: v.number(), // Lower number = higher priority
    minTier: v.optional(
      v.union(v.literal("foundations"), v.literal("heritage"), v.literal("legacy")),
    ), // Reserved for tier-gating tours
    createdBy: v.string(), // Better Auth user ID (admin)
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_key", ["key"])
    .index("by_status_and_priority", ["status", "priority"]),

  /**
   * Tour steps - individual steps within a tour
   */
  tourSteps: defineTable({
    tourId: v.id("tours"),
    stepKey: v.string(), // Stable identifier within the tour
    order: v.number(), // Display order (0-indexed)
    route: v.string(), // Route where this step appears (e.g., "/dashboard")
    anchorKey: v.string(), // data-tour attribute value to anchor to
    title: v.string(),
    body: v.string(), // Rich text/markdown content
    enabled: v.boolean(),
    activationKey: v.optional(v.string()), // Optional key to trigger step programmatically
    versionIntroduced: v.number(), // Tour version when this step was added
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_tour", ["tourId"])
    .index("by_tour_and_order", ["tourId", "order"])
    .index("by_tour_and_stepKey", ["tourId", "stepKey"]),

  /**
   * User tour state - tracks user progress through tours
   */
  userTourState: defineTable({
    userId: v.id("profiles"),
    tourId: v.id("tours"),
    lastSeenVersion: v.number(), // Last tour version the user saw
    dismissed: v.boolean(), // Whether user dismissed the tour
    dismissedAt: v.optional(v.number()), // Unix timestamp
    completedStepKeys: v.array(v.string()), // Steps the user has completed
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_user_and_tour", ["userId", "tourId"]),

  // ============================================================================
  // ESTATE ADMINISTRATION
  // ============================================================================

  /**
   * Estate activations - central record for estate administration activation
   * Tracks the full lifecycle: pending -> active -> completed/cancelled
   * Includes 48-hour cooldown safety mechanism and contest support
   */
  estateActivations: defineTable({
    householdId: v.id("households"),
    activatedBy: v.id("profiles"),
    deceasedName: v.string(),
    deceasedProfileId: v.optional(v.id("profiles")),
    dateOfDeath: v.optional(v.number()),
    status: v.union(
      v.literal("pending"),
      v.literal("active"),
      v.literal("contested"),
      v.literal("completed"),
      v.literal("cancelled"),
    ),
    deathCertificateDocId: v.optional(v.id("vaultDocuments")),
    cooldownEndsAt: v.number(),
    contestedBy: v.optional(v.id("profiles")),
    contestedAt: v.optional(v.number()),
    activatedAt: v.number(),
    completedAt: v.optional(v.number()),
    cancelledAt: v.optional(v.number()),
    cancelReason: v.optional(v.string()),
    notes: v.optional(v.string()),
    cooldownJobId: v.optional(v.id("_scheduled_functions")),
    updatedAt: v.number(),
  })
    .index("by_household", ["householdId"])
    .index("by_activatedBy", ["activatedBy"])
    .index("by_household_and_status", ["householdId", "status"]),

  /**
   * Estate checklist items - guided task list for executors
   * Seeded from templates when estate is activated, with custom items supported
   */
  estateChecklistItems: defineTable({
    householdId: v.id("households"),
    activationId: v.id("estateActivations"),
    title: v.string(),
    description: v.optional(v.string()),
    category: v.union(
      v.literal("first_things_first"),
      v.literal("legal_and_financial"),
      v.literal("property_and_assets"),
      v.literal("notifications"),
      v.literal("ongoing"),
      v.literal("when_ready"),
      v.literal("custom"),
    ),
    sortOrder: v.number(),
    isCompleted: v.boolean(),
    completedAt: v.optional(v.number()),
    completedBy: v.optional(v.id("profiles")),
    notes: v.optional(v.string()),
    isCustom: v.boolean(),
    createdBy: v.optional(v.id("profiles")),
    dueDate: v.optional(v.number()),
    updatedAt: v.number(),
  })
    .index("by_household", ["householdId"])
    .index("by_activation", ["activationId"])
    .index("by_activation_and_category", ["activationId", "category"]),

  /**
   * Estate assets - inventory of assets being administered
   * Status pipeline: identified → verified → institution_contacted → in_transfer → closed → distributed
   */
  estateAssets: defineTable({
    householdId: v.id("households"),
    activationId: v.id("estateActivations"),
    name: v.string(),
    description: v.optional(v.string()),
    category: v.union(
      v.literal("financial_account"),
      v.literal("real_estate"),
      v.literal("vehicle"),
      v.literal("insurance_policy"),
      v.literal("retirement_account"),
      v.literal("business_interest"),
      v.literal("personal_property"),
      v.literal("digital_asset"),
      v.literal("other"),
    ),
    status: v.union(
      v.literal("identified"),
      v.literal("verified"),
      v.literal("institution_contacted"),
      v.literal("in_transfer"),
      v.literal("closed"),
      v.literal("distributed"),
    ),
    estimatedValue: v.optional(v.number()),
    institution: v.optional(v.string()),
    accountNumber: v.optional(v.string()),
    beneficiary: v.optional(v.string()),
    notes: v.optional(v.string()),
    sourceType: v.optional(v.string()),
    sourceId: v.optional(v.string()),
    createdBy: v.id("profiles"),
    updatedAt: v.number(),
  })
    .index("by_household", ["householdId"])
    .index("by_activation", ["activationId"])
    .index("by_activation_and_status", ["activationId", "status"])
    .index("by_activation_and_category", ["activationId", "category"]),

  /**
   * Estate asset status changes - audit trail for asset pipeline progression
   * Each status change is a separate record for full history
   */
  estateAssetStatusChanges: defineTable({
    assetId: v.id("estateAssets"),
    householdId: v.id("households"),
    previousStatus: v.union(
      v.literal("identified"),
      v.literal("verified"),
      v.literal("institution_contacted"),
      v.literal("in_transfer"),
      v.literal("closed"),
      v.literal("distributed"),
    ),
    newStatus: v.union(
      v.literal("identified"),
      v.literal("verified"),
      v.literal("institution_contacted"),
      v.literal("in_transfer"),
      v.literal("closed"),
      v.literal("distributed"),
    ),
    changedBy: v.id("profiles"),
    notes: v.optional(v.string()),
    changedAt: v.number(),
  })
    .index("by_asset", ["assetId"])
    .index("by_household", ["householdId"]),

  /**
   * Estate documents - overlay on vault documents for estate-specific categorization.
   * Links vault documents to estate categories, tracks court submission status and verification.
   */
  estateDocuments: defineTable({
    householdId: v.id("households"),
    estateActivationId: v.id("estateActivations"),
    vaultDocumentId: v.id("vaultDocuments"),
    estateCategory: v.union(
      v.literal("will"),
      v.literal("trust"),
      v.literal("death_certificate"),
      v.literal("insurance_claim"),
      v.literal("deed"),
      v.literal("tax_return"),
      v.literal("bank_statement"),
      v.literal("court_filing"),
      v.literal("correspondence"),
      v.literal("beneficiary_designation"),
      v.literal("other"),
    ),
    submittedTo: v.optional(v.string()),
    submittedAt: v.optional(v.number()),
    sharedWithAttorney: v.optional(v.boolean()),
    verificationStatus: v.union(
      v.literal("unverified"),
      v.literal("verified"),
      v.literal("needs_update"),
    ),
    notes: v.optional(v.string()),
    updatedAt: v.number(),
  })
    .index("by_estate", ["estateActivationId"])
    .index("by_estate_and_category", ["estateActivationId", "estateCategory"])
    .index("by_vault_document", ["vaultDocumentId"]),

  /**
   * Document shares - time-limited secure links for sharing vault documents
   * with external parties (attorneys, beneficiaries, institutions).
   */
  documentShares: defineTable({
    householdId: v.id("households"),
    estateActivationId: v.id("estateActivations"),
    vaultDocumentId: v.id("vaultDocuments"),
    sharedBy: v.id("profiles"),
    recipientName: v.string(),
    recipientEmail: v.string(),
    recipientRole: v.optional(v.string()),
    shareToken: v.string(),
    expiresAt: v.number(),
    maxDownloads: v.number(),
    downloadCount: v.number(),
    status: v.union(
      v.literal("active"),
      v.literal("expired"),
      v.literal("revoked"),
      v.literal("exhausted"),
    ),
    lastAccessedAt: v.optional(v.number()),
    revokedAt: v.optional(v.number()),
    revokedBy: v.optional(v.id("profiles")),
    createdAt: v.number(),
  })
    .index("by_token", ["shareToken"])
    .index("by_estate", ["estateActivationId"])
    .index("by_document", ["vaultDocumentId"])
    .index("by_estate_and_status", ["estateActivationId", "status"]),

  /**
   * Document share access log - audit trail for share link access.
   * Tracks when shares are viewed or downloaded. No IP/user-agent storage for privacy.
   */
  documentShareAccessLog: defineTable({
    documentShareId: v.id("documentShares"),
    accessedAt: v.number(),
    action: v.union(v.literal("viewed"), v.literal("downloaded")),
  }).index("by_share", ["documentShareId"]),

  /**
   * Estate communications - log of notifications sent to institutions, beneficiaries, etc.
   * Tracks who was contacted, when, via what method, and any follow-up needed.
   */
  estateCommunications: defineTable({
    householdId: v.id("households"),
    activationId: v.id("estateActivations"),
    recipientName: v.string(),
    recipientOrganization: v.optional(v.string()),
    recipientEmail: v.optional(v.string()),
    recipientPhone: v.optional(v.string()),
    method: v.union(
      v.literal("phone"),
      v.literal("email"),
      v.literal("mail"),
      v.literal("in_person"),
      v.literal("online_portal"),
      v.literal("fax"),
      v.literal("other"),
    ),
    subject: v.string(),
    summary: v.string(),
    category: v.union(
      v.literal("financial_institution"),
      v.literal("government_agency"),
      v.literal("insurance_company"),
      v.literal("legal"),
      v.literal("beneficiary"),
      v.literal("utility"),
      v.literal("employer"),
      v.literal("other"),
    ),
    relatedAssetId: v.optional(v.id("estateAssets")),
    followUpDate: v.optional(v.number()),
    followUpNotes: v.optional(v.string()),
    followUpCompleted: v.optional(v.boolean()),
    followUpCompletedAt: v.optional(v.number()),
    attachmentDocIds: v.optional(v.array(v.id("vaultDocuments"))),
    loggedBy: v.id("profiles"),
    communicationDate: v.number(),
    updatedAt: v.number(),
  })
    .index("by_household", ["householdId"])
    .index("by_activation", ["activationId"])
    .index("by_activation_and_category", ["activationId", "category"]),

  /**
   * Estate distributions - tracking asset distribution to beneficiaries
   * Records what was distributed, to whom, when, and supporting documentation
   */
  estateDistributions: defineTable({
    householdId: v.id("households"),
    activationId: v.id("estateActivations"),
    assetId: v.id("estateAssets"),
    beneficiaryName: v.string(),
    beneficiaryRelationship: v.optional(v.string()),
    description: v.optional(v.string()),
    value: v.optional(v.number()),
    distributionDate: v.number(),
    method: v.union(
      v.literal("direct_transfer"),
      v.literal("wire_transfer"),
      v.literal("check"),
      v.literal("title_transfer"),
      v.literal("in_kind"),
      v.literal("other"),
    ),
    receiptDocId: v.optional(v.id("vaultDocuments")),
    notes: v.optional(v.string()),
    distributedBy: v.id("profiles"),
    updatedAt: v.number(),
  })
    .index("by_household", ["householdId"])
    .index("by_activation", ["activationId"])
    .index("by_asset", ["assetId"]),

  // ============================================================================
  // ACTIVITY & NOTIFICATIONS
  // ============================================================================

  /**
   * Activity log - audit trail of user actions
   * Note: _creationTime is automatically indexed, so we only need householdId
   */
  activityLog: defineTable({
    householdId: v.id("households"),
    userId: v.id("profiles"),
    // Module groups related features together for filtering
    module: v.optional(
      v.union(
        v.literal("vault"),
        v.literal("wisdom"),
        v.literal("financial"),
        v.literal("family"),
        v.literal("legacy"),
        v.literal("household"),
        v.literal("suggestion"),
        v.literal("estate"),
      ),
    ),
    actionType: v.union(
      // Document actions
      v.literal("document_uploaded"),
      v.literal("document_viewed"),
      v.literal("document_updated"),
      v.literal("document_deleted"),
      // Wisdom actions
      v.literal("wisdom_created"),
      v.literal("wisdom_updated"),
      v.literal("wisdom_deleted"),
      // Letter actions
      v.literal("letter_created"),
      // Household actions
      v.literal("household_created"),
      v.literal("household_updated"),
      v.literal("member_invited"),
      v.literal("member_joined"),
      v.literal("member_removed"),
      v.literal("member_role_updated"),
      // Plan actions
      v.literal("plan_updated"),
      // Financial actions
      v.literal("asset_created"),
      v.literal("asset_updated"),
      v.literal("asset_deleted"),
      v.literal("policy_created"),
      v.literal("policy_updated"),
      v.literal("policy_deleted"),
      // Category actions
      v.literal("category_created"),
      v.literal("category_updated"),
      v.literal("category_deleted"),
      // Family ecosystem actions
      v.literal("family_unit_created"),
      v.literal("family_unit_updated"),
      v.literal("family_unit_deleted"),
      v.literal("family_member_created"),
      v.literal("family_member_updated"),
      v.literal("family_member_deleted"),
      // Suggestion actions
      v.literal("suggestion_completed"),
      // Legal document actions
      v.literal("legal_document_created"),
      v.literal("legal_document_updated"),
      v.literal("legal_document_completed"),
      v.literal("legal_document_generated"),
      v.literal("legal_document_deleted"),
      // Estate actions
      v.literal("estate_activated"),
      v.literal("estate_contested"),
      v.literal("estate_cooldown_complete"),
      v.literal("estate_completed"),
      v.literal("estate_cancelled"),
      v.literal("estate_task_completed"),
      v.literal("estate_document_shared"),
      v.literal("estate_notification_sent"),
      v.literal("estate_asset_status_updated"),
      v.literal("estate_distribution_recorded"),
      // Fallback
      v.literal("other"),
    ),
    entityType: v.optional(
      v.union(
        // Vault entities
        v.literal("document"),
        v.literal("category"),
        // Wisdom entities
        v.literal("wisdom_entry"),
        v.literal("core_belief"),
        v.literal("wisdom"), // Legacy value for backward compatibility
        // Legacy entities
        v.literal("letter"),
        v.literal("plan"),
        // Household entities
        v.literal("household"),
        // Financial entities
        v.literal("financial_account"),
        v.literal("property"),
        v.literal("insurance_policy"),
        // Family entities
        v.literal("family_unit"),
        v.literal("family_member"),
        // Legal document entities
        v.literal("legal_document"),
        v.literal("legal_document_contact"),
        // Estate entities
        v.literal("estate_activation"),
        v.literal("estate_checklist_item"),
        v.literal("estate_asset"),
        v.literal("estate_asset_status_change"),
        v.literal("estate_document"),
        v.literal("estate_document_share"),
        v.literal("estate_communication"),
        v.literal("estate_distribution"),
        // Other
        v.literal("suggestion"),
        v.literal("other"),
      ),
    ),
    entityId: v.optional(v.string()), // ID of the affected entity
    description: v.string(),
  })
    .index("by_household", ["householdId"])
    .index("by_household_and_module", ["householdId", "module"]),

  /**
   * Notifications - user notifications
   */
  notifications: defineTable({
    userId: v.id("profiles"),
    householdId: v.optional(v.id("households")), // Optional - some notifications are global
    type: v.union(
      v.literal("invitation"),
      v.literal("document_shared"),
      v.literal("letter_delivered"),
      v.literal("reminder"),
      v.literal("system"),
      v.literal("estate_activation"),
      v.literal("estate_contested"),
      v.literal("estate_task_due"),
      v.literal("estate_update"),
      v.literal("other"),
    ),
    title: v.string(),
    message: v.string(),
    link: v.optional(v.string()), // URL to navigate to
    isRead: v.boolean(),
    readAt: v.optional(v.number()), // Unix timestamp
  })
    .index("by_user", ["userId"])
    .index("by_user_and_isRead", ["userId", "isRead"]),

  // ============================================================================
  // WAITLIST
  // ============================================================================

  waitlist: defineTable({
    email: v.string(),
    product: v.string(), // e.g. "executor"
    createdAt: v.number(), // Unix timestamp
  }).index("by_email_and_product", ["email", "product"]),
});
