import { v } from "convex/values";
import { internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import { internalAction, internalMutation, internalQuery } from "./_generated/server";

/**
 * Email Queue System
 *
 * Rate-limited email processing queue that respects Resend's 2 emails/second limit.
 * Emails are scheduled 500ms apart (1000ms / 2 = 500ms per email).
 *
 * Flow:
 * 1. Emails are enqueued with staggered scheduledFor timestamps
 * 2. Cron job (every 30 seconds) processes ready emails
 * 3. Failed emails are retried with exponential backoff
 */

// ============================================================================
// CONSTANTS
// ============================================================================

const RATE_LIMIT_DELAY_MS = 500; // 500ms between emails = 2 emails/second
const DEFAULT_MAX_ATTEMPTS = 3;
const RETRY_DELAYS_MS = [60_000, 300_000, 900_000]; // 1min, 5min, 15min
const BATCH_PROCESS_SIZE = 10; // Process 10 emails at a time

// ============================================================================
// INTERNAL MUTATIONS
// ============================================================================

/**
 * Enqueue a single email for sending
 */
export const enqueueEmail = internalMutation({
  args: {
    to: v.string(),
    subject: v.string(),
    htmlContent: v.string(),
    recipientContext: v.optional(
      v.object({
        profileId: v.optional(v.id("profiles")),
        firstName: v.optional(v.string()),
        lastName: v.optional(v.string()),
        householdName: v.optional(v.string()),
      }),
    ),
    templateId: v.optional(v.id("emailTemplates")),
    campaignId: v.optional(v.string()),
    scheduledFor: v.optional(v.number()),
    maxAttempts: v.optional(v.number()),
  },
  returns: v.id("emailQueue"),
  handler: async (ctx, args) => {
    const now = Date.now();

    return await ctx.db.insert("emailQueue", {
      to: args.to,
      subject: args.subject,
      htmlContent: args.htmlContent,
      recipientContext: args.recipientContext,
      templateId: args.templateId,
      campaignId: args.campaignId,
      status: "queued",
      attempts: 0,
      maxAttempts: args.maxAttempts ?? DEFAULT_MAX_ATTEMPTS,
      scheduledFor: args.scheduledFor ?? now,
    });
  },
});

/**
 * Enqueue a batch of emails with staggered scheduling
 * Each email is scheduled 500ms after the previous one to respect rate limits
 */
export const enqueueEmailBatch = internalMutation({
  args: {
    emails: v.array(
      v.object({
        to: v.string(),
        subject: v.string(),
        htmlContent: v.string(),
        recipientContext: v.optional(
          v.object({
            profileId: v.optional(v.id("profiles")),
            firstName: v.optional(v.string()),
            lastName: v.optional(v.string()),
            householdName: v.optional(v.string()),
          }),
        ),
      }),
    ),
    templateId: v.optional(v.id("emailTemplates")),
    campaignId: v.optional(v.string()),
    maxAttempts: v.optional(v.number()),
  },
  returns: v.object({
    queuedCount: v.number(),
    emailIds: v.array(v.id("emailQueue")),
  }),
  handler: async (ctx, args) => {
    const now = Date.now();
    const emailIds: Id<"emailQueue">[] = [];

    for (let i = 0; i < args.emails.length; i++) {
      const email = args.emails[i];
      const scheduledFor = now + i * RATE_LIMIT_DELAY_MS;

      const emailId = await ctx.db.insert("emailQueue", {
        to: email.to,
        subject: email.subject,
        htmlContent: email.htmlContent,
        recipientContext: email.recipientContext,
        templateId: args.templateId,
        campaignId: args.campaignId,
        status: "queued",
        attempts: 0,
        maxAttempts: args.maxAttempts ?? DEFAULT_MAX_ATTEMPTS,
        scheduledFor,
      });

      emailIds.push(emailId);
    }

    return {
      queuedCount: emailIds.length,
      emailIds,
    };
  },
});

/**
 * Mark email as processing
 */
export const markProcessing = internalMutation({
  args: { emailId: v.id("emailQueue") },
  returns: v.boolean(),
  handler: async (ctx, args) => {
    const email = await ctx.db.get(args.emailId);
    if (!email || email.status !== "queued") {
      return false;
    }

    await ctx.db.patch(args.emailId, {
      status: "processing",
      lastAttemptAt: Date.now(),
    });

    return true;
  },
});

/**
 * Mark email as sent
 */
export const markSent = internalMutation({
  args: {
    emailId: v.id("emailQueue"),
    resendId: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const email = await ctx.db.get(args.emailId);
    if (!email) return null;

    await ctx.db.patch(args.emailId, {
      status: "sent",
      sentAt: Date.now(),
      resendId: args.resendId,
    });

    // Update campaign stats if applicable
    if (email.campaignId) {
      const campaign = await ctx.db
        .query("emailCampaigns")
        .withIndex("by_campaignId", (q) => q.eq("campaignId", email.campaignId as string))
        .unique();

      if (campaign) {
        await ctx.db.patch(campaign._id, {
          sentCount: campaign.sentCount + 1,
        });
      }
    }

    return null;
  },
});

/**
 * Mark email as failed
 */
export const markFailed = internalMutation({
  args: {
    emailId: v.id("emailQueue"),
    errorMessage: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const email = await ctx.db.get(args.emailId);
    if (!email) return null;

    const newAttempts = email.attempts + 1;
    const isFinalFailure = newAttempts >= email.maxAttempts;

    if (isFinalFailure) {
      // Mark as permanently failed
      await ctx.db.patch(args.emailId, {
        status: "failed",
        attempts: newAttempts,
        errorMessage: args.errorMessage,
      });

      // Update campaign stats if applicable
      if (email.campaignId) {
        const campaign = await ctx.db
          .query("emailCampaigns")
          .withIndex("by_campaignId", (q) => q.eq("campaignId", email.campaignId as string))
          .unique();

        if (campaign) {
          await ctx.db.patch(campaign._id, {
            failedCount: campaign.failedCount + 1,
          });
        }
      }
    } else {
      // Schedule for retry with exponential backoff
      const retryDelay = RETRY_DELAYS_MS[Math.min(newAttempts - 1, RETRY_DELAYS_MS.length - 1)];

      await ctx.db.patch(args.emailId, {
        status: "queued",
        attempts: newAttempts,
        errorMessage: args.errorMessage,
        scheduledFor: Date.now() + retryDelay,
      });
    }

    return null;
  },
});

// ============================================================================
// INTERNAL QUERIES
// ============================================================================

/**
 * Get emails ready for processing
 * Returns emails where status=queued AND scheduledFor <= now
 */
export const getReadyEmails = internalQuery({
  args: {
    limit: v.optional(v.number()),
  },
  returns: v.array(
    v.object({
      _id: v.id("emailQueue"),
      to: v.string(),
      subject: v.string(),
      htmlContent: v.string(),
      recipientContext: v.optional(
        v.object({
          profileId: v.optional(v.id("profiles")),
          firstName: v.optional(v.string()),
          lastName: v.optional(v.string()),
          householdName: v.optional(v.string()),
        }),
      ),
      campaignId: v.optional(v.string()),
      attempts: v.number(),
    }),
  ),
  handler: async (ctx, args) => {
    const now = Date.now();
    const limit = args.limit ?? BATCH_PROCESS_SIZE;

    // Get queued emails that are ready to send
    const emails = await ctx.db
      .query("emailQueue")
      .withIndex("by_status_scheduledFor", (q) => q.eq("status", "queued").lte("scheduledFor", now))
      .take(limit);

    return emails.map((e) => ({
      _id: e._id,
      to: e.to,
      subject: e.subject,
      htmlContent: e.htmlContent,
      recipientContext: e.recipientContext,
      campaignId: e.campaignId,
      attempts: e.attempts,
    }));
  },
});

/**
 * Get failed emails that can be retried
 */
export const getRetryableEmails = internalQuery({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("emailQueue"),
      attempts: v.number(),
      maxAttempts: v.number(),
    }),
  ),
  handler: async (ctx) => {
    // Get failed emails where attempts < maxAttempts
    const failedEmails = await ctx.db
      .query("emailQueue")
      .withIndex("by_status", (q) => q.eq("status", "failed"))
      .collect();

    // Filter to only retryable ones
    return failedEmails
      .filter((e) => e.attempts < e.maxAttempts)
      .map((e) => ({
        _id: e._id,
        attempts: e.attempts,
        maxAttempts: e.maxAttempts,
      }));
  },
});

/**
 * Get queue statistics for monitoring
 */
export const getQueueStats = internalQuery({
  args: {},
  returns: v.object({
    queued: v.number(),
    processing: v.number(),
    sent: v.number(),
    failed: v.number(),
  }),
  handler: async (ctx) => {
    const queued = await ctx.db
      .query("emailQueue")
      .withIndex("by_status", (q) => q.eq("status", "queued"))
      .collect();

    const processing = await ctx.db
      .query("emailQueue")
      .withIndex("by_status", (q) => q.eq("status", "processing"))
      .collect();

    const sent = await ctx.db
      .query("emailQueue")
      .withIndex("by_status", (q) => q.eq("status", "sent"))
      .collect();

    const failed = await ctx.db
      .query("emailQueue")
      .withIndex("by_status", (q) => q.eq("status", "failed"))
      .collect();

    return {
      queued: queued.length,
      processing: processing.length,
      sent: sent.length,
      failed: failed.length,
    };
  },
});

// ============================================================================
// CAMPAIGN MANAGEMENT
// ============================================================================

/**
 * Create a new email campaign
 */
export const createCampaign = internalMutation({
  args: {
    campaignId: v.string(),
    type: v.union(
      v.literal("weekly_vault_empty"),
      v.literal("weekly_digest"),
      v.literal("admin_broadcast"),
      v.literal("other"),
    ),
    totalRecipients: v.number(),
  },
  returns: v.id("emailCampaigns"),
  handler: async (ctx, args) => {
    return await ctx.db.insert("emailCampaigns", {
      campaignId: args.campaignId,
      type: args.type,
      status: "pending",
      totalRecipients: args.totalRecipients,
      sentCount: 0,
      failedCount: 0,
      startedAt: Date.now(),
    });
  },
});

/**
 * Update campaign status
 */
export const updateCampaignStatus = internalMutation({
  args: {
    campaignId: v.string(),
    status: v.union(
      v.literal("pending"),
      v.literal("sending"),
      v.literal("completed"),
      v.literal("failed"),
    ),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const campaign = await ctx.db
      .query("emailCampaigns")
      .withIndex("by_campaignId", (q) => q.eq("campaignId", args.campaignId))
      .unique();

    if (campaign) {
      const updates: { status: typeof args.status; completedAt?: number } = {
        status: args.status,
      };

      if (args.status === "completed" || args.status === "failed") {
        updates.completedAt = Date.now();
      }

      await ctx.db.patch(campaign._id, updates);
    }

    return null;
  },
});

/**
 * Check if campaign is complete
 */
export const checkCampaignCompletion = internalMutation({
  args: { campaignId: v.string() },
  returns: v.boolean(),
  handler: async (ctx, args) => {
    const campaign = await ctx.db
      .query("emailCampaigns")
      .withIndex("by_campaignId", (q) => q.eq("campaignId", args.campaignId))
      .unique();

    if (!campaign || campaign.status === "completed" || campaign.status === "failed") {
      return true;
    }

    // Check if all emails for this campaign are processed
    const pendingEmails = await ctx.db
      .query("emailQueue")
      .withIndex("by_campaignId", (q) => q.eq("campaignId", args.campaignId))
      .collect();

    const hasUnprocessed = pendingEmails.some(
      (e) => e.status === "queued" || e.status === "processing",
    );

    if (!hasUnprocessed) {
      // All emails processed, mark campaign as completed
      await ctx.db.patch(campaign._id, {
        status: "completed",
        completedAt: Date.now(),
      });

      return true;
    }

    return false;
  },
});

// ============================================================================
// QUEUE PROCESSING (CRON HANDLERS)
// ============================================================================

/**
 * Process the email queue - called by cron every 30 seconds
 */
export const processEmailQueue = internalAction({
  args: {},
  returns: v.object({
    processed: v.number(),
    sent: v.number(),
    failed: v.number(),
  }),
  handler: async (ctx): Promise<{ processed: number; sent: number; failed: number }> => {
    const emails: Array<{
      _id: Id<"emailQueue">;
      to: string;
      subject: string;
      htmlContent: string;
      recipientContext?: {
        profileId?: Id<"profiles">;
        firstName?: string;
        lastName?: string;
        householdName?: string;
      };
      campaignId?: string;
      attempts: number;
    }> = await ctx.runQuery(internal.emailQueue.getReadyEmails, {});

    if (emails.length === 0) {
      return { processed: 0, sent: 0, failed: 0 };
    }

    const { Resend } = await import("resend");
    const resend = new Resend(process.env.RESEND_API_KEY);

    let sent = 0;
    let failed = 0;

    for (const email of emails) {
      // Mark as processing
      const acquired = await ctx.runMutation(internal.emailQueue.markProcessing, {
        emailId: email._id,
      });

      if (!acquired) {
        continue; // Another process grabbed this email
      }

      try {
        const response = await resend.emails.send({
          from: "Pathible <noreply@app.pathible.com>",
          replyTo: "support@pathible.com",
          to: email.to,
          subject: email.subject,
          html: email.htmlContent,
        });

        if (response.error) {
          throw new Error(response.error.message);
        }

        await ctx.runMutation(internal.emailQueue.markSent, {
          emailId: email._id,
          resendId: response.data?.id,
        });

        sent++;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Unknown error";
        console.error(`[Email Queue] Failed to send email ${email._id}: ${errorMessage}`);

        await ctx.runMutation(internal.emailQueue.markFailed, {
          emailId: email._id,
          errorMessage,
        });

        failed++;
      }

      // Rate limiting: wait 500ms between sends
      await new Promise((resolve) => setTimeout(resolve, RATE_LIMIT_DELAY_MS));
    }

    // Check campaign completions for any campaigns in this batch
    const campaignIds = new Set(
      emails.map((e: { campaignId?: string }) => e.campaignId).filter(Boolean),
    );
    for (const campaignId of campaignIds) {
      if (campaignId) {
        await ctx.runMutation(internal.emailQueue.checkCampaignCompletion, { campaignId });
      }
    }

    return {
      processed: emails.length,
      sent,
      failed,
    };
  },
});

/**
 * Retry failed emails - called by cron every 5 minutes
 */
export const retryFailedEmails = internalAction({
  args: {},
  returns: v.object({ retriedCount: v.number() }),
  handler: async (ctx): Promise<{ retriedCount: number }> => {
    const retryable: Array<{
      _id: Id<"emailQueue">;
      attempts: number;
      maxAttempts: number;
    }> = await ctx.runQuery(internal.emailQueue.getRetryableEmails, {});

    if (retryable.length === 0) {
      return { retriedCount: 0 };
    }

    // The markFailed mutation already schedules retries with exponential backoff
    return { retriedCount: retryable.length };
  },
});
