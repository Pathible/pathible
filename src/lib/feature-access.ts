/**
 * Feature Access Control Utilities
 *
 * Single source of truth for feature identifiers and access checking.
 * Uses Clerk Billing's has() method for feature-based access control.
 *
 * IMPORTANT: These slugs must match exactly what's configured in Clerk Dashboard.
 * Run /api/debug/clerk-billing to verify the current Clerk configuration.
 *
 * @see https://clerk.com/docs/nextjs/guides/billing/for-b2c#control-access-with-features-and-plans
 */

import { useAuth } from "@clerk/nextjs";

/**
 * Feature slugs from Clerk Dashboard
 * These MUST match the exact slugs configured in Clerk Billing
 *
 * Plan hierarchy:
 * - Foundations: Base features
 * - Heritage: Foundations + advanced features
 * - Legacy: Heritage + premium features
 */
export const FEATURES = {
  // ============================================================================
  // HERITAGE VAULT FEATURES
  // ============================================================================
  /** Secure document storage with encryption (Foundations+) */
  VAULT_DOCUMENT_STORAGE: "vault_document_storage",
  /** Photo and video uploads (Foundations+) */
  VAULT_PHOTO_VIDEO: "vault_photo_video",
  /** Folder organization (Foundations+) */
  VAULT_FOLDERS: "vault_folders",
  /** Tags and collections for organization (Heritage+) */
  VAULT_TAGS_COLLECTIONS: "vault_tags_collections",
  /** Voice memo and oral history uploads (Heritage+) */
  VAULT_VOICE_UPLOADS: "vault_voice_uploads",
  /** Guided organization wizards (Heritage+) */
  VAULT_GUIDED_ORGANIZATION: "vault_guided_organization",

  // ============================================================================
  // FINANCIAL INTELLIGENCE FEATURES
  // ============================================================================
  /** Financial account overview (Foundations+) */
  FINANCIAL_OVERVIEW: "financial_overview",
  /** Detailed account summaries (Heritage+) */
  FINANCIAL_SUMMARIES: "financial_summaries",
  /** AI-powered financial insights (Heritage+) */
  FINANCIAL_INSIGHTS: "financial_insights",
  /** Spending categorization (Legacy) */
  FINANCIAL_SPENDING_CATEGORIES: "financial_spending_categories",
  /** Trend analysis over time (Legacy) */
  FINANCIAL_TRENDS: "financial_trends",

  // ============================================================================
  // FAMILY NETWORK FEATURES
  // ============================================================================
  /** Add family members to household (Foundations+) */
  FAMILY_MEMBERS: "family_members",
  /** Rich member profiles (Heritage+) */
  FAMILY_PROFILES: "family_profiles",
  /** Family messaging (Heritage+) */
  FAMILY_MESSAGING: "family_messaging",
  /** Relationship mapping and family tree (Legacy) */
  FAMILY_RELATIONSHIPS: "family_relationships",

  // ============================================================================
  // LEGACY BUILDER FEATURES
  // ============================================================================
  /** Guided questionnaires for life story (Legacy) */
  LEGACY_QUESTIONNAIRES: "legacy_questionnaires",
  /** Story templates for legacy documents (Legacy) */
  LEGACY_STORY_TEMPLATES: "legacy_story_templates",

  // ============================================================================
  // WISDOM & EDUCATION FEATURES
  // ============================================================================
  /** Wisdom entries for values and lessons (Heritage+) */
  WISDOM_ENTRIES: "wisdom_entries",
  /** Shared wisdom pages for collaboration (Legacy) */
  WISDOM_SHARED_PAGES: "wisdom_shared_pages",

  // ============================================================================
  // SUPPORT FEATURES
  // ============================================================================
  /** Standard email support (Foundations) */
  STANDARD_SUPPORT: "standard_support",
  /** Priority support with faster response (Heritage) */
  SUPPORT_PRIORITY: "support_priority",
  /** Concierge support with personal rep (Legacy) */
  SUPPORT_CONCIERGE: "support_concierge",

  // ============================================================================
  // EARLY ACCESS
  // ============================================================================
  /** Early access to new features (Heritage+) */
  EARLY_ACCESS_FEATURES: "early_access_features",
} as const;

export type FeatureSlug = (typeof FEATURES)[keyof typeof FEATURES];

/**
 * Feature metadata for UI display
 * Maps feature slugs to human-readable names and descriptions
 */
export const FEATURE_METADATA: Record<
  FeatureSlug,
  { name: string; description: string; requiredPlan: string }
> = {
  // Heritage Vault
  [FEATURES.VAULT_DOCUMENT_STORAGE]: {
    name: "Secure Document Storage",
    description: "Store important documents with bank-level encryption",
    requiredPlan: "Foundations",
  },
  [FEATURES.VAULT_PHOTO_VIDEO]: {
    name: "Photo & Video Uploads",
    description: "Preserve family memories with photo and video storage",
    requiredPlan: "Foundations",
  },
  [FEATURES.VAULT_FOLDERS]: {
    name: "Folder Organization",
    description: "Create folders to organize your documents",
    requiredPlan: "Foundations",
  },
  [FEATURES.VAULT_TAGS_COLLECTIONS]: {
    name: "Tags & Collections",
    description: "Organize with tags and curated collections",
    requiredPlan: "Heritage",
  },
  [FEATURES.VAULT_VOICE_UPLOADS]: {
    name: "Voice Recordings",
    description: "Record oral histories and voice memos",
    requiredPlan: "Heritage",
  },
  [FEATURES.VAULT_GUIDED_ORGANIZATION]: {
    name: "Guided Organization",
    description: "Step-by-step wizards for document management",
    requiredPlan: "Heritage",
  },

  // Financial Intelligence
  [FEATURES.FINANCIAL_OVERVIEW]: {
    name: "Financial Overview",
    description: "See all your linked accounts in one place",
    requiredPlan: "Foundations",
  },
  [FEATURES.FINANCIAL_SUMMARIES]: {
    name: "Account Summaries",
    description: "Detailed summaries for each financial account",
    requiredPlan: "Heritage",
  },
  [FEATURES.FINANCIAL_INSIGHTS]: {
    name: "Financial Insights",
    description: "AI-powered insights about your financial health",
    requiredPlan: "Heritage",
  },
  [FEATURES.FINANCIAL_SPENDING_CATEGORIES]: {
    name: "Spending Categories",
    description: "Automatic categorization of your spending",
    requiredPlan: "Legacy",
  },
  [FEATURES.FINANCIAL_TRENDS]: {
    name: "Trend Analysis",
    description: "View spending and saving trends over time",
    requiredPlan: "Legacy",
  },

  // Family Network
  [FEATURES.FAMILY_MEMBERS]: {
    name: "Family Members",
    description: "Add family members to your household",
    requiredPlan: "Foundations",
  },
  [FEATURES.FAMILY_PROFILES]: {
    name: "Member Profiles",
    description: "Rich profiles for each family member",
    requiredPlan: "Heritage",
  },
  [FEATURES.FAMILY_MESSAGING]: {
    name: "Family Messaging",
    description: "Private messaging within your household",
    requiredPlan: "Heritage",
  },
  [FEATURES.FAMILY_RELATIONSHIPS]: {
    name: "Relationship Mapping",
    description: "Interactive family tree with relationship visualization",
    requiredPlan: "Legacy",
  },

  // Legacy Builder
  [FEATURES.LEGACY_QUESTIONNAIRES]: {
    name: "Guided Questionnaires",
    description: "Thoughtful prompts to document your life story",
    requiredPlan: "Legacy",
  },
  [FEATURES.LEGACY_STORY_TEMPLATES]: {
    name: "Story Templates",
    description: "Pre-built templates for common legacy topics",
    requiredPlan: "Legacy",
  },

  // Wisdom
  [FEATURES.WISDOM_ENTRIES]: {
    name: "Wisdom Entries",
    description: "Document family values, lessons, and life advice",
    requiredPlan: "Heritage",
  },
  [FEATURES.WISDOM_SHARED_PAGES]: {
    name: "Shared Wisdom Pages",
    description: "Collaborative pages for family wisdom",
    requiredPlan: "Legacy",
  },

  // Support
  [FEATURES.STANDARD_SUPPORT]: {
    name: "Standard Support",
    description: "Email support with 48-hour response time",
    requiredPlan: "Foundations",
  },
  [FEATURES.SUPPORT_PRIORITY]: {
    name: "Priority Support",
    description: "24-hour response time with live chat",
    requiredPlan: "Heritage",
  },
  [FEATURES.SUPPORT_CONCIERGE]: {
    name: "Concierge Support",
    description: "Personal support rep with same-day response",
    requiredPlan: "Legacy",
  },

  // Early Access
  [FEATURES.EARLY_ACCESS_FEATURES]: {
    name: "Early Feature Access",
    description: "Get new features before general release",
    requiredPlan: "Heritage",
  },
};

/**
 * Valid feature slugs for runtime validation
 */
const VALID_FEATURE_SLUGS = new Set(Object.values(FEATURES));

/**
 * Check if user has access to a specific feature (server-side)
 *
 * IMPORTANT: This is for server-side use in API routes and Server Components.
 * Always pair with backend validation in Convex mutations for defense in depth.
 *
 * @example Server-side (API route)
 * ```ts
 * const { has } = await auth();
 * const canAccessTags = checkFeatureAccess(has, FEATURES.VAULT_TAGS_COLLECTIONS);
 * if (!canAccessTags) {
 *   return NextResponse.json({ error: "Upgrade required" }, { status: 403 });
 * }
 * ```
 *
 * @example Server Component
 * ```ts
 * const { has } = await auth();
 * if (!checkFeatureAccess(has, FEATURES.FINANCIAL_TRENDS)) {
 *   return <UpgradePrompt feature={FEATURES.FINANCIAL_TRENDS} />;
 * }
 * ```
 */
export function checkFeatureAccess(
  has: ((params: { feature: string }) => boolean) | undefined,
  feature: FeatureSlug,
): boolean {
  if (!has) return false;

  // Runtime validation to prevent injection
  if (!VALID_FEATURE_SLUGS.has(feature)) {
    console.error(`[feature-access] Invalid feature slug: ${feature}`);
    return false;
  }

  return has({ feature });
}

/**
 * Check if user has access to any of the given features (server-side)
 *
 * @example
 * ```ts
 * const { has } = await auth();
 * const hasAnyVaultFeature = checkAnyFeatureAccess(has, [
 *   FEATURES.VAULT_DOCUMENT_STORAGE,
 *   FEATURES.VAULT_PHOTO_VIDEO,
 * ]);
 * ```
 */
export function checkAnyFeatureAccess(
  has: ((params: { feature: string }) => boolean) | undefined,
  features: FeatureSlug[],
): boolean {
  if (!has) return false;
  return features.some((feature) => has({ feature }));
}

/**
 * Client-side hook for checking feature access
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { hasAccess, isLoaded } = useFeatureAccess(FEATURES.VAULT_TAGS_COLLECTIONS);
 *
 *   if (!isLoaded) return <Skeleton />;
 *   if (!hasAccess) return <UpgradePrompt feature={FEATURES.VAULT_TAGS_COLLECTIONS} />;
 *
 *   return <TagsCollectionsUI />;
 * }
 * ```
 */
export function useFeatureAccess(feature: FeatureSlug) {
  const { has, isLoaded } = useAuth();

  return {
    isLoaded,
    hasAccess: has?.({ feature }) ?? false,
    featureMetadata: FEATURE_METADATA[feature],
  };
}

/**
 * Client-side hook for checking multiple features
 *
 * @example
 * ```tsx
 * function VaultSection() {
 *   const { features, isLoaded } = useMultipleFeatureAccess([
 *     FEATURES.VAULT_TAGS_COLLECTIONS,
 *     FEATURES.VAULT_VOICE_UPLOADS,
 *   ]);
 *
 *   if (!isLoaded) return <Skeleton />;
 *
 *   return (
 *     <>
 *       {features.vault_tags_collections && <TagsUI />}
 *       {features.vault_voice_uploads && <VoiceUI />}
 *     </>
 *   );
 * }
 * ```
 */
export function useMultipleFeatureAccess(featureList: FeatureSlug[]) {
  const { has, isLoaded } = useAuth();

  const features = featureList.reduce(
    (acc, feature) => {
      acc[feature] = has?.({ feature }) ?? false;
      return acc;
    },
    {} as Record<FeatureSlug, boolean>,
  );

  return {
    isLoaded,
    features,
    hasAny: Object.values(features).some(Boolean),
    hasAll: Object.values(features).every(Boolean),
  };
}

/**
 * Get the required plan for upgrading to a feature
 */
export function getRequiredPlanForFeature(feature: FeatureSlug): string {
  return FEATURE_METADATA[feature]?.requiredPlan ?? "Unknown";
}
