/**
 * Feature Access Control Utilities
 *
 * Single source of truth for feature identifiers and access checking.
 * Uses Clerk Billing's has() method for feature-based access control.
 *
 * @see https://clerk.com/docs/nextjs/guides/billing/for-b2c#control-access-with-features-and-plans
 */

import { useAuth } from "@clerk/nextjs";

/**
 * Feature slugs from plans-features-schema.md
 * These must match the feature slugs configured in Clerk Dashboard
 */
export const FEATURES = {
  // Heritage Vault Features
  VAULT_STORAGE_BASIC: "vault_storage_basic",
  VAULT_STORAGE_ADVANCED: "vault_storage_advanced",
  VAULT_STORAGE_UNLIMITED: "vault_storage_unlimited",
  VAULT_PHOTOS_VIDEOS: "vault_photos_videos",
  VAULT_FOLDERS: "vault_folders",
  VAULT_TAGS_COLLECTIONS: "vault_tags_collections",
  VAULT_VOICE_RECORDINGS: "vault_voice_recordings",
  VAULT_GUIDED_ORGANIZATION: "vault_guided_organization",

  // Financial Intelligence Features
  FINANCIAL_OVERVIEW: "financial_overview",
  FINANCIAL_SUMMARIES: "financial_summaries",
  FINANCIAL_INSIGHTS_BASIC: "financial_insights_basic",
  FINANCIAL_INSIGHTS_ADVANCED: "financial_insights_advanced",
  FINANCIAL_TRENDS: "financial_trends",

  // Family Network Features
  FAMILY_MEMBERS_1: "family_members_1",
  FAMILY_MEMBERS_3: "family_members_3",
  FAMILY_MEMBERS_UNLIMITED: "family_members_unlimited",
  FAMILY_PROFILES: "family_profiles",
  FAMILY_RELATIONSHIPS: "family_relationships",
  FAMILY_MESSAGING: "family_messaging",

  // Legacy Builder Features
  LEGACY_QUESTIONNAIRES: "legacy_questionnaires",
  LEGACY_STORY_TEMPLATES: "legacy_story_templates",

  // Wisdom Features
  WISDOM_ENTRIES: "wisdom_entries",
  WISDOM_SHARED_PAGES: "wisdom_shared_pages",

  // Support Features
  SUPPORT_STANDARD: "support_standard",
  SUPPORT_PRIORITY: "support_priority",
  SUPPORT_CONCIERGE: "support_concierge",

  // Early Access Features
  EARLY_ACCESS_SOME: "early_access_some",
  EARLY_ACCESS_ALL: "early_access_all",
} as const;

export type FeatureSlug = (typeof FEATURES)[keyof typeof FEATURES];

/**
 * Feature metadata for UI display
 */
export const FEATURE_METADATA: Record<
  FeatureSlug,
  { name: string; description: string; requiredPlan: string }
> = {
  // Heritage Vault
  [FEATURES.VAULT_STORAGE_BASIC]: {
    name: "Basic Storage (5GB)",
    description: "Store up to 5GB of important documents with bank-level encryption",
    requiredPlan: "Foundations",
  },
  [FEATURES.VAULT_STORAGE_ADVANCED]: {
    name: "Advanced Storage (25GB)",
    description: "Store up to 25GB of documents, photos, and videos",
    requiredPlan: "Heritage",
  },
  [FEATURES.VAULT_STORAGE_UNLIMITED]: {
    name: "Unlimited Storage",
    description: "Store unlimited documents, photos, and videos",
    requiredPlan: "Legacy",
  },
  [FEATURES.VAULT_PHOTOS_VIDEOS]: {
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
  [FEATURES.VAULT_VOICE_RECORDINGS]: {
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
  [FEATURES.FINANCIAL_INSIGHTS_BASIC]: {
    name: "Financial Insights",
    description: "AI-powered insights about your financial health",
    requiredPlan: "Heritage",
  },
  [FEATURES.FINANCIAL_INSIGHTS_ADVANCED]: {
    name: "Advanced Financial Insights",
    description: "Comprehensive insights with spending trends",
    requiredPlan: "Legacy",
  },
  [FEATURES.FINANCIAL_TRENDS]: {
    name: "Trend Analysis",
    description: "View spending and saving trends over time",
    requiredPlan: "Legacy",
  },

  // Family Network
  [FEATURES.FAMILY_MEMBERS_1]: {
    name: "1 Family Viewer",
    description: "Share read-only access with one trusted family member",
    requiredPlan: "Foundations",
  },
  [FEATURES.FAMILY_MEMBERS_3]: {
    name: "3 Family Members",
    description: "Connect up to 3 family members with custom access",
    requiredPlan: "Heritage",
  },
  [FEATURES.FAMILY_MEMBERS_UNLIMITED]: {
    name: "Unlimited Family Members",
    description: "Connect unlimited family members",
    requiredPlan: "Legacy",
  },
  [FEATURES.FAMILY_PROFILES]: {
    name: "Member Profiles",
    description: "Rich profiles for each family member",
    requiredPlan: "Heritage",
  },
  [FEATURES.FAMILY_RELATIONSHIPS]: {
    name: "Relationship Mapping",
    description: "Interactive family tree with relationship visualization",
    requiredPlan: "Legacy",
  },
  [FEATURES.FAMILY_MESSAGING]: {
    name: "Family Messaging",
    description: "Private messaging within your household",
    requiredPlan: "Heritage",
  },

  // Legacy Builder
  [FEATURES.LEGACY_QUESTIONNAIRES]: {
    name: "Legacy Questionnaires",
    description: "Guided prompts to document your life story",
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
  [FEATURES.SUPPORT_STANDARD]: {
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
  [FEATURES.EARLY_ACCESS_SOME]: {
    name: "Early Access",
    description: "Get some new features before general release",
    requiredPlan: "Heritage",
  },
  [FEATURES.EARLY_ACCESS_ALL]: {
    name: "Full Early Access",
    description: "First access to every new feature",
    requiredPlan: "Legacy",
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
 * const hasAnyStorage = checkAnyFeatureAccess(has, [
 *   FEATURES.VAULT_STORAGE_BASIC,
 *   FEATURES.VAULT_STORAGE_ADVANCED,
 *   FEATURES.VAULT_STORAGE_UNLIMITED,
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
 *     FEATURES.VAULT_VOICE_RECORDINGS,
 *   ]);
 *
 *   if (!isLoaded) return <Skeleton />;
 *
 *   return (
 *     <>
 *       {features.vault_tags_collections && <TagsUI />}
 *       {features.vault_voice_recordings && <VoiceUI />}
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
