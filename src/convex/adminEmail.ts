import { paginationOptsValidator } from "convex/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import { action, internalMutation, mutation, query } from "./_generated/server";
import { requireAdmin } from "./auth";

/**
 * Admin Email Management
 *
 * Functions for managing email templates and sending emails to users.
 * All functions require admin role.
 */

// ============================================================================
// EMAIL TEMPLATE QUERIES
// ============================================================================

/**
 * List all email templates
 */
export const listTemplates = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("emailTemplates"),
      _creationTime: v.number(),
      name: v.string(),
      subject: v.string(),
      description: v.optional(v.string()),
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
    }),
  ),
  handler: async (ctx) => {
    await requireAdmin(ctx);

    const templates = await ctx.db.query("emailTemplates").order("desc").collect();

    return templates.map((t) => ({
      _id: t._id,
      _creationTime: t._creationTime,
      name: t.name,
      subject: t.subject,
      description: t.description,
      category: t.category,
      updatedAt: t.updatedAt,
    }));
  },
});

/**
 * Get a single template by ID
 */
export const getTemplate = query({
  args: { templateId: v.id("emailTemplates") },
  returns: v.union(
    v.object({
      _id: v.id("emailTemplates"),
      _creationTime: v.number(),
      name: v.string(),
      subject: v.string(),
      content: v.string(),
      description: v.optional(v.string()),
      variables: v.array(v.string()),
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
    }),
    v.null(),
  ),
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const template = await ctx.db.get(args.templateId);
    if (!template) {
      return null;
    }

    return {
      _id: template._id,
      _creationTime: template._creationTime,
      name: template.name,
      subject: template.subject,
      content: template.content,
      description: template.description,
      variables: template.variables,
      category: template.category,
      updatedAt: template.updatedAt,
    };
  },
});

// ============================================================================
// EMAIL TEMPLATE MUTATIONS
// ============================================================================

/**
 * Create a new email template
 */
export const createTemplate = mutation({
  args: {
    name: v.string(),
    subject: v.string(),
    content: v.string(),
    description: v.optional(v.string()),
    variables: v.array(v.string()),
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
  },
  returns: v.id("emailTemplates"),
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    // Check for duplicate name
    const existing = await ctx.db
      .query("emailTemplates")
      .withIndex("by_name", (q) => q.eq("name", args.name))
      .unique();

    if (existing) {
      throw new Error(`Template with name "${args.name}" already exists`);
    }

    const templateId = await ctx.db.insert("emailTemplates", {
      name: args.name,
      subject: args.subject,
      content: args.content,
      description: args.description,
      variables: args.variables,
      category: args.category,
      updatedAt: Date.now(),
    });

    console.log(`[Admin Email] Created template: ${args.name}`);

    return templateId;
  },
});

/**
 * Update an existing email template
 */
export const updateTemplate = mutation({
  args: {
    templateId: v.id("emailTemplates"),
    name: v.optional(v.string()),
    subject: v.optional(v.string()),
    content: v.optional(v.string()),
    description: v.optional(v.string()),
    variables: v.optional(v.array(v.string())),
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
  },
  returns: v.object({ success: v.boolean() }),
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const template = await ctx.db.get(args.templateId);
    if (!template) {
      throw new Error("Template not found");
    }

    // If name is being changed, check for duplicates
    const newName = args.name;
    if (newName && newName !== template.name) {
      const existing = await ctx.db
        .query("emailTemplates")
        .withIndex("by_name", (q) => q.eq("name", newName))
        .unique();

      if (existing) {
        throw new Error(`Template with name "${args.name}" already exists`);
      }
    }

    await ctx.db.patch(args.templateId, {
      ...(args.name && { name: args.name }),
      ...(args.subject && { subject: args.subject }),
      ...(args.content && { content: args.content }),
      ...(args.description !== undefined && { description: args.description }),
      ...(args.variables && { variables: args.variables }),
      ...(args.category !== undefined && { category: args.category }),
      updatedAt: Date.now(),
    });

    console.log(`[Admin Email] Updated template: ${template.name}`);

    return { success: true };
  },
});

/**
 * Delete an email template
 */
export const deleteTemplate = mutation({
  args: { templateId: v.id("emailTemplates") },
  returns: v.object({ success: v.boolean() }),
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const template = await ctx.db.get(args.templateId);
    if (!template) {
      throw new Error("Template not found");
    }

    await ctx.db.delete(args.templateId);

    console.log(`[Admin Email] Deleted template: ${template.name}`);

    return { success: true };
  },
});

// ============================================================================
// SENT EMAILS QUERIES
// ============================================================================

/**
 * Get a single sent email by ID
 */
export const getSentEmail = query({
  args: { emailId: v.id("sentEmails") },
  returns: v.union(
    v.object({
      _id: v.id("sentEmails"),
      _creationTime: v.number(),
      subject: v.string(),
      content: v.string(),
      htmlContent: v.string(),
      recipientType: v.string(),
      recipientCount: v.number(),
      templateName: v.optional(v.string()),
      sentByName: v.string(),
      status: v.string(),
      errorMessage: v.optional(v.string()),
      recipientFilter: v.optional(
        v.object({
          tiers: v.optional(v.array(v.string())),
          userIds: v.optional(v.array(v.id("profiles"))),
        }),
      ),
    }),
    v.null(),
  ),
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const email = await ctx.db.get(args.emailId);
    if (!email) return null;

    // Get template name if exists
    let templateName: string | undefined;
    if (email.templateId) {
      const template = await ctx.db.get(email.templateId);
      templateName = template?.name;
    }

    // Get sender name
    const sender = await ctx.db.get(email.sentBy);
    const sentByName = sender ? `${sender.firstName} ${sender.lastName}` : "Unknown";

    return {
      _id: email._id,
      _creationTime: email._creationTime,
      subject: email.subject,
      content: email.content,
      htmlContent: email.htmlContent,
      recipientType: email.recipientType,
      recipientCount: email.recipientCount,
      templateName,
      sentByName,
      status: email.status,
      errorMessage: email.errorMessage,
      recipientFilter: email.recipientFilter,
    };
  },
});

/**
 * List sent emails with pagination
 */
export const listSentEmails = query({
  args: {
    paginationOpts: paginationOptsValidator,
  },
  returns: v.object({
    page: v.array(
      v.object({
        _id: v.id("sentEmails"),
        _creationTime: v.number(),
        subject: v.string(),
        recipientType: v.string(),
        recipientCount: v.number(),
        templateName: v.optional(v.string()),
        sentByName: v.string(),
        status: v.string(),
      }),
    ),
    isDone: v.boolean(),
    continueCursor: v.string(),
  }),
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const results = await ctx.db.query("sentEmails").order("desc").paginate(args.paginationOpts);

    const enrichedEmails = await Promise.all(
      results.page.map(async (email) => {
        // Get template name if exists
        let templateName: string | undefined;
        if (email.templateId) {
          const template = await ctx.db.get(email.templateId);
          templateName = template?.name;
        }

        // Get sender name
        const sender = await ctx.db.get(email.sentBy);
        const sentByName = sender ? `${sender.firstName} ${sender.lastName}` : "Unknown";

        return {
          _id: email._id,
          _creationTime: email._creationTime,
          subject: email.subject,
          recipientType: email.recipientType,
          recipientCount: email.recipientCount,
          templateName,
          sentByName,
          status: email.status,
        };
      }),
    );

    return {
      page: enrichedEmails,
      isDone: results.isDone,
      continueCursor: results.continueCursor,
    };
  },
});

// ============================================================================
// RECIPIENT QUERIES
// ============================================================================

/**
 * Get recipient count for compose preview
 */
export const getRecipientCount = query({
  args: {
    recipientType: v.union(
      v.literal("individual"),
      v.literal("all_users"),
      v.literal("by_tier"),
      v.literal("household_owners"),
    ),
    tiers: v.optional(v.array(v.string())),
    userIds: v.optional(v.array(v.id("profiles"))),
  },
  returns: v.object({
    count: v.number(),
    breakdown: v.optional(v.record(v.string(), v.number())),
  }),
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    if (args.recipientType === "individual") {
      return {
        count: args.userIds?.length ?? 0,
        breakdown: undefined,
      };
    }

    if (args.recipientType === "all_users") {
      const profiles = await ctx.db.query("profiles").collect();
      const activeProfiles = profiles.filter((p) => !p.deletedAt);
      return {
        count: activeProfiles.length,
        breakdown: undefined,
      };
    }

    if (args.recipientType === "by_tier") {
      const selectedTiers = args.tiers ?? [];
      const households = await ctx.db.query("households").collect();

      const breakdown: Record<string, number> = {};
      let total = 0;

      for (const tier of selectedTiers) {
        const tierHouseholds = households.filter((h) => h.subscriptionTier === tier);
        const tierMemberships = await Promise.all(
          tierHouseholds.map((h) =>
            ctx.db
              .query("householdMemberships")
              .withIndex("by_household_and_status", (q) =>
                q.eq("householdId", h._id).eq("status", "active"),
              )
              .collect(),
          ),
        );

        // Get unique user IDs
        const userIds = new Set<string>();
        for (const memberships of tierMemberships) {
          for (const m of memberships) {
            userIds.add(m.userId.toString());
          }
        }

        breakdown[tier] = userIds.size;
        total += userIds.size;
      }

      return { count: total, breakdown };
    }

    if (args.recipientType === "household_owners") {
      const memberships = await ctx.db.query("householdMemberships").collect();
      const owners = memberships.filter((m) => m.role === "owner" && m.status === "active");
      const uniqueOwners = new Set(owners.map((o) => o.userId.toString()));
      return {
        count: uniqueOwners.size,
        breakdown: undefined,
      };
    }

    return { count: 0, breakdown: undefined };
  },
});

/**
 * Search users for individual recipient selection
 */
export const searchUsersForEmail = query({
  args: { search: v.string() },
  returns: v.array(
    v.object({
      _id: v.id("profiles"),
      firstName: v.string(),
      lastName: v.string(),
      email: v.string(),
    }),
  ),
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    if (!args.search.trim()) {
      return [];
    }

    const searchLower = args.search.toLowerCase();
    const profiles = await ctx.db.query("profiles").collect();

    // Filter and map to results
    const results = profiles
      .filter((p) => !p.deletedAt)
      .filter((p) => {
        const fullName = `${p.firstName} ${p.lastName}`.toLowerCase();
        return fullName.includes(searchLower);
      })
      .slice(0, 10)
      .map((p) => ({
        _id: p._id,
        firstName: p.firstName,
        lastName: p.lastName,
        email: p.email ?? "",
      }));

    return results;
  },
});

// ============================================================================
// EMAIL SENDING
// ============================================================================

/**
 * Internal mutation to record sent email
 */
export const recordSentEmail = internalMutation({
  args: {
    subject: v.string(),
    content: v.string(),
    htmlContent: v.string(),
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
    sentBy: v.id("profiles"),
    status: v.union(
      v.literal("sent"),
      v.literal("partial"),
      v.literal("failed"),
      v.literal("queued"),
    ),
    errorMessage: v.optional(v.string()),
    resendBatchId: v.optional(v.string()),
    campaignId: v.optional(v.string()),
  },
  returns: v.id("sentEmails"),
  handler: async (ctx, args) => {
    return await ctx.db.insert("sentEmails", {
      subject: args.subject,
      content: args.content,
      htmlContent: args.htmlContent,
      templateId: args.templateId,
      recipientType: args.recipientType,
      recipientFilter: args.recipientFilter,
      recipientCount: args.recipientCount,
      sentBy: args.sentBy,
      status: args.status,
      errorMessage: args.errorMessage,
      resendBatchId: args.resendBatchId,
      campaignId: args.campaignId,
    });
  },
});

/**
 * Get recipients for sending email
 */
export const getRecipientsForEmail = query({
  args: {
    recipientType: v.union(
      v.literal("individual"),
      v.literal("all_users"),
      v.literal("by_tier"),
      v.literal("household_owners"),
    ),
    tiers: v.optional(v.array(v.string())),
    userIds: v.optional(v.array(v.id("profiles"))),
  },
  returns: v.array(
    v.object({
      profileId: v.id("profiles"),
      firstName: v.string(),
      lastName: v.string(),
      email: v.optional(v.string()),
      clerkUserId: v.string(),
      householdName: v.optional(v.string()),
      subscriptionTier: v.optional(v.string()),
    }),
  ),
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const recipientProfiles: Array<{
      profileId: Id<"profiles">;
      firstName: string;
      lastName: string;
      email?: string;
      clerkUserId: string;
      householdName?: string;
      subscriptionTier?: string;
    }> = [];

    if (args.recipientType === "individual" && args.userIds) {
      for (const userId of args.userIds) {
        const profile = await ctx.db.get(userId);
        if (profile && !profile.deletedAt) {
          const membership = await ctx.db
            .query("householdMemberships")
            .withIndex("by_user", (q) => q.eq("userId", profile._id))
            .first();

          let householdName: string | undefined;
          let subscriptionTier: string | undefined;

          if (membership) {
            const household = await ctx.db.get(membership.householdId);
            householdName = household?.name;
            subscriptionTier = household?.subscriptionTier;
          }

          recipientProfiles.push({
            profileId: profile._id,
            firstName: profile.firstName,
            lastName: profile.lastName,
            email: profile.email,
            clerkUserId: profile.userId,
            householdName,
            subscriptionTier,
          });
        }
      }
    } else if (args.recipientType === "all_users") {
      const profiles = await ctx.db.query("profiles").collect();
      for (const profile of profiles) {
        if (!profile.deletedAt) {
          const membership = await ctx.db
            .query("householdMemberships")
            .withIndex("by_user", (q) => q.eq("userId", profile._id))
            .first();

          let householdName: string | undefined;
          let subscriptionTier: string | undefined;

          if (membership) {
            const household = await ctx.db.get(membership.householdId);
            householdName = household?.name;
            subscriptionTier = household?.subscriptionTier;
          }

          recipientProfiles.push({
            profileId: profile._id,
            firstName: profile.firstName,
            lastName: profile.lastName,
            email: profile.email,
            clerkUserId: profile.userId,
            householdName,
            subscriptionTier,
          });
        }
      }
    } else if (args.recipientType === "by_tier" && args.tiers) {
      const households = await ctx.db.query("households").collect();
      const tierHouseholds = households.filter((h) => args.tiers?.includes(h.subscriptionTier));

      const seenUserIds = new Set<string>();

      for (const household of tierHouseholds) {
        const memberships = await ctx.db
          .query("householdMemberships")
          .withIndex("by_household_and_status", (q) =>
            q.eq("householdId", household._id).eq("status", "active"),
          )
          .collect();

        for (const membership of memberships) {
          if (!seenUserIds.has(membership.userId.toString())) {
            seenUserIds.add(membership.userId.toString());
            const profile = await ctx.db.get(membership.userId);
            if (profile && !profile.deletedAt) {
              recipientProfiles.push({
                profileId: profile._id,
                firstName: profile.firstName,
                lastName: profile.lastName,
                email: profile.email,
                clerkUserId: profile.userId,
                householdName: household.name,
                subscriptionTier: household.subscriptionTier,
              });
            }
          }
        }
      }
    } else if (args.recipientType === "household_owners") {
      const memberships = await ctx.db.query("householdMemberships").collect();
      const owners = memberships.filter((m) => m.role === "owner" && m.status === "active");

      const seenUserIds = new Set<string>();

      for (const membership of owners) {
        if (!seenUserIds.has(membership.userId.toString())) {
          seenUserIds.add(membership.userId.toString());
          const profile = await ctx.db.get(membership.userId);
          if (profile && !profile.deletedAt) {
            const household = await ctx.db.get(membership.householdId);
            recipientProfiles.push({
              profileId: profile._id,
              firstName: profile.firstName,
              lastName: profile.lastName,
              email: profile.email,
              clerkUserId: profile.userId,
              householdName: household?.name,
              subscriptionTier: household?.subscriptionTier,
            });
          }
        }
      }
    }

    return recipientProfiles;
  },
});

/**
 * Helper function to personalize email content with recipient variables
 */
function personalizeContent(
  template: string,
  recipient: { firstName: string; lastName: string; email: string },
): string {
  const fullName = `${recipient.firstName} ${recipient.lastName}`.trim();
  const platformVars = {
    appName: "Pathible",
    supportEmail: "support@pathible.com",
    currentYear: new Date().getFullYear().toString(),
    loginUrl: "https://pathible.com/login",
    dashboardUrl: "https://pathible.com/dashboard",
  };

  return template
    .replace(/\{\{firstName\}\}/g, recipient.firstName || "")
    .replace(/\{\{lastName\}\}/g, recipient.lastName || "")
    .replace(/\{\{fullName\}\}/g, fullName || "")
    .replace(/\{\{email\}\}/g, recipient.email || "")
    .replace(/\{\{appName\}\}/g, platformVars.appName)
    .replace(/\{\{supportEmail\}\}/g, platformVars.supportEmail)
    .replace(/\{\{currentYear\}\}/g, platformVars.currentYear)
    .replace(/\{\{loginUrl\}\}/g, platformVars.loginUrl)
    .replace(/\{\{dashboardUrl\}\}/g, platformVars.dashboardUrl);
}

/**
 * Send email action - queues emails for rate-limited sending
 *
 * Instead of sending directly via Resend, emails are added to the queue
 * and processed by the cron job (respecting 2 emails/second rate limit).
 */
export const sendEmail = action({
  args: {
    subject: v.string(),
    content: v.string(),
    htmlContent: v.string(),
    templateId: v.optional(v.id("emailTemplates")),
    recipientType: v.union(
      v.literal("individual"),
      v.literal("all_users"),
      v.literal("by_tier"),
      v.literal("household_owners"),
    ),
    tiers: v.optional(v.array(v.string())),
    userIds: v.optional(v.array(v.id("profiles"))),
    recipientEmails: v.array(
      v.object({
        email: v.string(),
        firstName: v.string(),
        lastName: v.string(),
      }),
    ),
  },
  returns: v.object({
    success: v.boolean(),
    sentCount: v.number(),
    errorMessage: v.optional(v.string()),
    campaignId: v.optional(v.string()),
  }),
  handler: async (
    ctx,
    args,
  ): Promise<{
    success: boolean;
    sentCount: number;
    errorMessage?: string;
    campaignId?: string;
  }> => {
    // Get current admin profile
    const { profile } = await ctx.runQuery(internal.auth.requireAuthInternal, {});

    try {
      if (args.recipientEmails.length === 0) {
        throw new Error("No recipients specified");
      }

      // Create campaign ID for tracking
      const dateStr = new Date().toISOString().replace(/[:.]/g, "-");
      const campaignId = `admin_broadcast_${dateStr}`;

      // Create campaign record
      await ctx.runMutation(internal.emailQueue.createCampaign, {
        campaignId,
        type: "admin_broadcast",
        totalRecipients: args.recipientEmails.length,
      });

      // Update campaign status to sending
      await ctx.runMutation(internal.emailQueue.updateCampaignStatus, {
        campaignId,
        status: "sending",
      });

      // Prepare personalized emails for batch enqueue
      const emails = args.recipientEmails.map((recipient) => {
        const personalizedSubject = personalizeContent(args.subject, recipient);
        const personalizedHtml = personalizeContent(args.htmlContent, recipient);

        return {
          to: recipient.email,
          subject: personalizedSubject,
          htmlContent: personalizedHtml,
          recipientContext: {
            firstName: recipient.firstName,
            lastName: recipient.lastName,
          },
        };
      });

      // Enqueue all emails with rate limiting (500ms stagger between each)
      const result: { queuedCount: number; emailIds: Id<"emailQueue">[] } = await ctx.runMutation(
        internal.emailQueue.enqueueEmailBatch,
        {
          emails,
          templateId: args.templateId,
          campaignId,
        },
      );

      // Record the sent email with "queued" status
      await ctx.runMutation(internal.adminEmail.recordSentEmail, {
        subject: args.subject,
        content: args.content,
        htmlContent: args.htmlContent,
        templateId: args.templateId,
        recipientType: args.recipientType,
        recipientFilter: {
          tiers: args.tiers,
          userIds: args.userIds,
        },
        recipientCount: result.queuedCount,
        sentBy: profile._id,
        status: "queued",
        campaignId,
      });

      console.log(`[Admin Email] Queued ${result.queuedCount} emails for campaign ${campaignId}`);

      return {
        success: true,
        sentCount: result.queuedCount,
        campaignId,
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";

      // Record the failed attempt
      await ctx.runMutation(internal.adminEmail.recordSentEmail, {
        subject: args.subject,
        content: args.content,
        htmlContent: args.htmlContent,
        templateId: args.templateId,
        recipientType: args.recipientType,
        recipientFilter: {
          tiers: args.tiers,
          userIds: args.userIds,
        },
        recipientCount: 0,
        sentBy: profile._id,
        status: "failed",
        errorMessage,
      });

      return {
        success: false,
        sentCount: 0,
        errorMessage,
      };
    }
  },
});

/**
 * Send test email to current admin
 */
export const sendTestEmail = action({
  args: {
    subject: v.string(),
    htmlContent: v.string(),
    toEmail: v.string(),
    testFirstName: v.optional(v.string()),
    testLastName: v.optional(v.string()),
  },
  returns: v.object({ success: v.boolean(), error: v.optional(v.string()) }),
  handler: async (ctx, args) => {
    // Verify admin access
    const { profile } = await ctx.runQuery(internal.auth.requireAuthInternal, {});

    const { Resend } = await import("resend");
    const resend = new Resend(process.env.RESEND_API_KEY);

    // Use test values or fall back to admin's profile
    const firstName = args.testFirstName || profile.firstName || "Test";
    const lastName = args.testLastName || profile.lastName || "User";
    const fullName = `${firstName} ${lastName}`.trim();

    // Platform variables
    const platformVars = {
      appName: "Pathible",
      supportEmail: "support@pathible.com",
      currentYear: new Date().getFullYear().toString(),
      loginUrl: "https://pathible.com/login",
      dashboardUrl: "https://pathible.com/dashboard",
    };

    // Substitute variables for test email
    const personalizedSubject = args.subject
      .replace(/\{\{firstName\}\}/g, firstName)
      .replace(/\{\{lastName\}\}/g, lastName)
      .replace(/\{\{fullName\}\}/g, fullName)
      .replace(/\{\{email\}\}/g, args.toEmail)
      .replace(/\{\{appName\}\}/g, platformVars.appName)
      .replace(/\{\{supportEmail\}\}/g, platformVars.supportEmail)
      .replace(/\{\{currentYear\}\}/g, platformVars.currentYear)
      .replace(/\{\{loginUrl\}\}/g, platformVars.loginUrl)
      .replace(/\{\{dashboardUrl\}\}/g, platformVars.dashboardUrl);

    const personalizedHtml = args.htmlContent
      .replace(/\{\{firstName\}\}/g, firstName)
      .replace(/\{\{lastName\}\}/g, lastName)
      .replace(/\{\{fullName\}\}/g, fullName)
      .replace(/\{\{email\}\}/g, args.toEmail)
      .replace(/\{\{appName\}\}/g, platformVars.appName)
      .replace(/\{\{supportEmail\}\}/g, platformVars.supportEmail)
      .replace(/\{\{currentYear\}\}/g, platformVars.currentYear)
      .replace(/\{\{loginUrl\}\}/g, platformVars.loginUrl)
      .replace(/\{\{dashboardUrl\}\}/g, platformVars.dashboardUrl);

    try {
      const response = await resend.emails.send({
        from: "Pathible <noreply@app.pathible.com>",
        replyTo: "support@pathible.com",
        to: args.toEmail,
        subject: `[TEST] ${personalizedSubject}`,
        html: personalizedHtml,
      });

      if (response.error) {
        return { success: false, error: response.error.message };
      }

      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : "Unknown error",
      };
    }
  },
});
