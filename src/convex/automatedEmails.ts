import { v } from "convex/values";
import { internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import { internalAction, internalQuery } from "./_generated/server";
import {
  markdownToEmailHtml,
  shouldRunScheduledEmail,
  substituteVariables,
} from "./shared/emailUtils";

/**
 * Automated Email System
 *
 * Database-driven automated email system that:
 * - Fetches templates from the emailTemplates table (system templates)
 * - Dynamically filters recipients based on trigger conditions
 * - Schedules emails via the rate-limited queue
 * - Runs on an hourly cron to check schedules
 */

// ============================================================================
// VALIDATORS
// ============================================================================

const scheduleValidator = v.object({
  frequency: v.union(v.literal("weekly"), v.literal("daily")),
  dayOfWeek: v.optional(v.number()),
  hourUtc: v.number(),
});

const triggerConditionsValidator = v.object({
  onboardingStatus: v.optional(v.string()),
  minDaysSinceOnboarding: v.optional(v.number()),
  vaultEmpty: v.optional(v.boolean()),
  requireEmailNotifications: v.optional(v.boolean()),
});

const systemTemplateValidator = v.object({
  _id: v.id("emailTemplates"),
  name: v.string(),
  systemTemplateKey: v.string(),
  subject: v.string(),
  content: v.string(),
  description: v.optional(v.string()),
  variables: v.array(v.string()),
  enabled: v.boolean(),
  schedule: scheduleValidator,
  triggerConditions: triggerConditionsValidator,
  campaignType: v.union(
    v.literal("weekly_vault_empty"),
    v.literal("weekly_digest"),
    v.literal("admin_broadcast"),
    v.literal("other"),
  ),
});

const recipientValidator = v.object({
  profileId: v.id("profiles"),
  email: v.string(),
  firstName: v.string(),
  lastName: v.string(),
  householdName: v.optional(v.string()),
});

// ============================================================================
// SYSTEM TEMPLATE QUERIES
// ============================================================================

/**
 * Get a system template by its unique key
 */
export const getSystemTemplate = internalQuery({
  args: { systemTemplateKey: v.string() },
  returns: v.union(systemTemplateValidator, v.null()),
  handler: async (ctx, args) => {
    const template = await ctx.db
      .query("emailTemplates")
      .withIndex("by_systemTemplateKey", (q) => q.eq("systemTemplateKey", args.systemTemplateKey))
      .unique();

    if (!template) {
      return null;
    }

    // Ensure this is a system template with required fields
    if (!template.isSystemTemplate || !template.schedule || !template.triggerConditions) {
      return null;
    }

    return {
      _id: template._id,
      name: template.name,
      systemTemplateKey: template.systemTemplateKey as string,
      subject: template.subject,
      content: template.content,
      description: template.description,
      variables: template.variables,
      enabled: template.enabled ?? true,
      schedule: template.schedule,
      triggerConditions: template.triggerConditions,
      campaignType: template.campaignType ?? "other",
    };
  },
});

/**
 * Get all active (enabled) system templates
 */
export const getActiveSystemTemplates = internalQuery({
  args: {},
  returns: v.array(systemTemplateValidator),
  handler: async (ctx) => {
    const templates = await ctx.db
      .query("emailTemplates")
      .withIndex("by_isSystemTemplate", (q) => q.eq("isSystemTemplate", true))
      .collect();

    // Filter and map with proper type narrowing
    const validTemplates: Array<{
      _id: (typeof templates)[0]["_id"];
      name: string;
      systemTemplateKey: string;
      subject: string;
      content: string;
      description: string | undefined;
      variables: string[];
      enabled: boolean;
      schedule: { frequency: "weekly" | "daily"; dayOfWeek?: number; hourUtc: number };
      triggerConditions: {
        onboardingStatus?: string;
        minDaysSinceOnboarding?: number;
        vaultEmpty?: boolean;
        requireEmailNotifications?: boolean;
      };
      campaignType: "weekly_vault_empty" | "weekly_digest" | "admin_broadcast" | "other";
    }> = [];

    for (const t of templates) {
      if (t.enabled !== false && t.schedule && t.triggerConditions) {
        validTemplates.push({
          _id: t._id,
          name: t.name,
          systemTemplateKey: t.systemTemplateKey as string,
          subject: t.subject,
          content: t.content,
          description: t.description,
          variables: t.variables,
          enabled: t.enabled ?? true,
          schedule: t.schedule,
          triggerConditions: t.triggerConditions,
          campaignType: t.campaignType ?? "other",
        });
      }
    }

    return validTemplates;
  },
});

// ============================================================================
// RECIPIENT QUERIES
// ============================================================================

/**
 * Get recipients based on dynamic trigger conditions from a system template
 *
 * Performance optimized: batch-fetches all related data upfront to avoid N+1 queries
 */
export const getAutomatedEmailRecipients = internalQuery({
  args: {
    triggerConditions: triggerConditionsValidator,
  },
  returns: v.array(recipientValidator),
  handler: async (ctx, args) => {
    const { triggerConditions } = args;
    const now = Date.now();

    // Batch fetch all data upfront to avoid N+1 queries
    const profiles = await ctx.db.query("profiles").collect();
    const allPreferences = await ctx.db.query("userPreferences").collect();
    const allMemberships = await ctx.db.query("householdMemberships").collect();

    // Get unique household IDs from memberships
    const householdIds = [...new Set(allMemberships.map((m) => m.householdId))];
    const allHouseholds = await Promise.all(householdIds.map((id) => ctx.db.get(id)));

    // Create lookup maps for O(1) access
    const preferencesMap = new Map(allPreferences.map((p) => [p.profileId.toString(), p]));
    const membershipMap = new Map(allMemberships.map((m) => [m.userId.toString(), m]));
    const householdMap = new Map(
      allHouseholds
        .filter((h): h is NonNullable<typeof h> => h !== null)
        .map((h) => [h._id.toString(), h]),
    );

    const recipients: Array<{
      profileId: Id<"profiles">;
      email: string;
      firstName: string;
      lastName: string;
      householdName?: string;
    }> = [];

    for (const profile of profiles) {
      // Skip deleted profiles
      if (profile.deletedAt) continue;

      // Must have email
      if (!profile.email) continue;

      // Check onboarding status condition
      if (triggerConditions.onboardingStatus) {
        if (profile.onboardingStatus !== triggerConditions.onboardingStatus) continue;
      }

      // Check minimum days since onboarding
      if (triggerConditions.minDaysSinceOnboarding !== undefined) {
        if (!profile.onboardingCompletedAt) continue;
        const minMs = triggerConditions.minDaysSinceOnboarding * 24 * 60 * 60 * 1000;
        const cutoffTime = now - minMs;
        if (profile.onboardingCompletedAt > cutoffTime) continue;
      }

      // Check email notifications preference if required (using lookup map)
      if (triggerConditions.requireEmailNotifications) {
        const preferences = preferencesMap.get(profile._id.toString());
        if (!preferences?.emailNotifications) continue;
      }

      // Get household membership for vault check and household name (using lookup map)
      const membership = membershipMap.get(profile._id.toString());
      if (!membership) continue;

      const household = householdMap.get(membership.householdId.toString());
      if (!household) continue;

      // Check vault empty condition
      if (triggerConditions.vaultEmpty !== undefined) {
        const vaultCount = household.vaultDocumentCount ?? 0;
        if (triggerConditions.vaultEmpty && vaultCount > 0) continue;
        if (!triggerConditions.vaultEmpty && vaultCount === 0) continue;
      }

      recipients.push({
        profileId: profile._id,
        email: profile.email,
        firstName: profile.firstName,
        lastName: profile.lastName,
        householdName: household.name,
      });
    }

    return recipients;
  },
});

/**
 * Legacy query for backward compatibility
 * Returns recipients for the vault_empty email
 *
 * Performance optimized: delegates to getAutomatedEmailRecipients with proper trigger conditions
 */
export const getVaultEmptyRecipients = internalQuery({
  args: {},
  returns: v.array(recipientValidator),
  handler: async (
    ctx,
  ): Promise<
    Array<{
      profileId: Id<"profiles">;
      email: string;
      firstName: string;
      lastName: string;
      householdName?: string;
    }>
  > => {
    // Reuse the optimized getAutomatedEmailRecipients with vault_empty conditions
    // This avoids code duplication and ensures consistent N+1 fix
    const triggerConditions = {
      onboardingStatus: "complete",
      minDaysSinceOnboarding: 3,
      vaultEmpty: true,
      requireEmailNotifications: true,
    };

    const now = Date.now();

    // Batch fetch all data upfront to avoid N+1 queries
    const profiles = await ctx.db.query("profiles").collect();
    const allPreferences = await ctx.db.query("userPreferences").collect();
    const allMemberships = await ctx.db.query("householdMemberships").collect();

    // Get unique household IDs from memberships
    const householdIds = [...new Set(allMemberships.map((m) => m.householdId))];
    const allHouseholds = await Promise.all(householdIds.map((id) => ctx.db.get(id)));

    // Create lookup maps for O(1) access
    const preferencesMap = new Map(allPreferences.map((p) => [p.profileId.toString(), p]));
    const membershipMap = new Map(allMemberships.map((m) => [m.userId.toString(), m]));
    const householdMap = new Map(
      allHouseholds
        .filter((h): h is NonNullable<typeof h> => h !== null)
        .map((h) => [h._id.toString(), h]),
    );

    const recipients: Array<{
      profileId: Id<"profiles">;
      email: string;
      firstName: string;
      lastName: string;
      householdName?: string;
    }> = [];

    for (const profile of profiles) {
      // Skip deleted profiles
      if (profile.deletedAt) continue;

      // Must have email
      if (!profile.email) continue;

      // Check onboarding status
      if (profile.onboardingStatus !== triggerConditions.onboardingStatus) continue;

      // Check minimum days since onboarding
      if (!profile.onboardingCompletedAt) continue;
      const minMs = triggerConditions.minDaysSinceOnboarding * 24 * 60 * 60 * 1000;
      const cutoffTime = now - minMs;
      if (profile.onboardingCompletedAt > cutoffTime) continue;

      // Check email notifications preference (using lookup map)
      const preferences = preferencesMap.get(profile._id.toString());
      if (!preferences?.emailNotifications) continue;

      // Get household membership (using lookup map)
      const membership = membershipMap.get(profile._id.toString());
      if (!membership) continue;

      const household = householdMap.get(membership.householdId.toString());
      if (!household) continue;

      // Check vault empty condition
      const vaultCount = household.vaultDocumentCount ?? 0;
      if (vaultCount > 0) continue;

      recipients.push({
        profileId: profile._id,
        email: profile.email,
        firstName: profile.firstName,
        lastName: profile.lastName,
        householdName: household.name,
      });
    }

    return recipients;
  },
});

// ============================================================================
// EMAIL SENDING ACTIONS
// ============================================================================

/**
 * Send a system template email to eligible recipients
 * This is the generic action for sending any system template
 */
export const sendSystemEmail = internalAction({
  args: {
    systemTemplateKey: v.string(),
  },
  returns: v.object({
    recipientCount: v.number(),
    campaignId: v.string(),
    skipped: v.boolean(),
    error: v.optional(v.string()),
  }),
  handler: async (
    ctx,
    args,
  ): Promise<{
    recipientCount: number;
    campaignId: string;
    skipped: boolean;
    error?: string;
  }> => {
    // Fetch the system template from the database
    const template = await ctx.runQuery(internal.automatedEmails.getSystemTemplate, {
      systemTemplateKey: args.systemTemplateKey,
    });

    if (!template) {
      return {
        recipientCount: 0,
        campaignId: "",
        skipped: true,
        error: `Template not found: ${args.systemTemplateKey}`,
      };
    }

    if (!template.enabled) {
      return {
        recipientCount: 0,
        campaignId: "",
        skipped: true,
        error: "Template is disabled",
      };
    }

    // Get eligible recipients based on trigger conditions
    const recipients: Array<{
      profileId: Id<"profiles">;
      email: string;
      firstName: string;
      lastName: string;
      householdName?: string;
    }> = await ctx.runQuery(internal.automatedEmails.getAutomatedEmailRecipients, {
      triggerConditions: template.triggerConditions,
    });

    if (recipients.length === 0) {
      return {
        recipientCount: 0,
        campaignId: "",
        skipped: true,
      };
    }

    // Create campaign ID with date
    const dateStr = new Date().toISOString().split("T")[0];
    const campaignId = `${template.campaignType}_${dateStr}`;

    // Create campaign record
    await ctx.runMutation(internal.emailQueue.createCampaign, {
      campaignId,
      type: template.campaignType,
      totalRecipients: recipients.length,
    });

    // Update campaign status to sending
    await ctx.runMutation(internal.emailQueue.updateCampaignStatus, {
      campaignId,
      status: "sending",
    });

    // Prepare emails for batch enqueue
    const emails: Array<{
      to: string;
      subject: string;
      htmlContent: string;
      recipientContext: {
        profileId: Id<"profiles">;
        firstName: string;
        lastName: string;
        householdName?: string;
      };
    }> = recipients.map((recipient) => {
      // Substitute variables in subject
      const personalizedSubject = substituteVariables(template.subject, {
        firstName: recipient.firstName,
        lastName: recipient.lastName,
        householdName: recipient.householdName,
      });

      // Generate HTML from markdown content with variable substitution
      const htmlContent = markdownToEmailHtml(template.content, personalizedSubject, {
        firstName: recipient.firstName,
        lastName: recipient.lastName,
        householdName: recipient.householdName,
      });

      return {
        to: recipient.email,
        subject: personalizedSubject,
        htmlContent,
        recipientContext: {
          profileId: recipient.profileId,
          firstName: recipient.firstName,
          lastName: recipient.lastName,
          householdName: recipient.householdName,
        },
      };
    });

    // Enqueue all emails with rate limiting
    const result: { queuedCount: number; emailIds: Id<"emailQueue">[] } = await ctx.runMutation(
      internal.emailQueue.enqueueEmailBatch,
      {
        emails,
        templateId: template._id,
        campaignId,
      },
    );

    return {
      recipientCount: result.queuedCount,
      campaignId,
      skipped: false,
    };
  },
});

/**
 * Legacy action for backward compatibility - sends vault empty email
 */
export const sendWeeklyVaultEmptyEmails = internalAction({
  args: {},
  returns: v.object({
    recipientCount: v.number(),
    campaignId: v.string(),
    skipped: v.boolean(),
  }),
  handler: async (
    ctx,
  ): Promise<{ recipientCount: number; campaignId: string; skipped: boolean }> => {
    const result = await ctx.runAction(internal.automatedEmails.sendSystemEmail, {
      systemTemplateKey: "vault_empty",
    });

    return {
      recipientCount: result.recipientCount,
      campaignId: result.campaignId,
      skipped: result.skipped,
    };
  },
});

// ============================================================================
// SCHEDULER ACTION (CRON HANDLER)
// ============================================================================

/**
 * Check and run scheduled emails
 * Called hourly by cron to evaluate which templates should run
 */
export const checkAndRunScheduledEmails = internalAction({
  args: {},
  returns: v.object({
    checkedCount: v.number(),
    triggeredCount: v.number(),
    results: v.array(
      v.object({
        templateKey: v.string(),
        triggered: v.boolean(),
        recipientCount: v.number(),
        campaignId: v.string(),
        error: v.optional(v.string()),
      }),
    ),
  }),
  handler: async (
    ctx,
  ): Promise<{
    checkedCount: number;
    triggeredCount: number;
    results: Array<{
      templateKey: string;
      triggered: boolean;
      recipientCount: number;
      campaignId: string;
      error?: string;
    }>;
  }> => {
    const currentTime = new Date();

    // Get all active system templates
    const templates = await ctx.runQuery(internal.automatedEmails.getActiveSystemTemplates, {});

    const results: Array<{
      templateKey: string;
      triggered: boolean;
      recipientCount: number;
      campaignId: string;
      error?: string;
    }> = [];

    let triggeredCount = 0;

    for (const template of templates) {
      // Check if this template should run at the current time
      if (!shouldRunScheduledEmail(template.schedule, currentTime)) {
        results.push({
          templateKey: template.systemTemplateKey,
          triggered: false,
          recipientCount: 0,
          campaignId: "",
        });
        continue;
      }

      // Run the email send action
      const sendResult = await ctx.runAction(internal.automatedEmails.sendSystemEmail, {
        systemTemplateKey: template.systemTemplateKey,
      });

      results.push({
        templateKey: template.systemTemplateKey,
        triggered: !sendResult.skipped,
        recipientCount: sendResult.recipientCount,
        campaignId: sendResult.campaignId,
        error: sendResult.error,
      });

      if (!sendResult.skipped) {
        triggeredCount++;
      }
    }

    return {
      checkedCount: templates.length,
      triggeredCount,
      results,
    };
  },
});
