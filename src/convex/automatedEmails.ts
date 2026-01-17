import { v } from "convex/values";
import { internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import { internalAction, internalQuery } from "./_generated/server";

/**
 * Automated Email System
 *
 * Handles scheduled engagement emails for user retention.
 * All emails are sent through the rate-limited email queue.
 */

// ============================================================================
// CONSTANTS
// ============================================================================

const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000;

// ============================================================================
// EMAIL TEMPLATES
// ============================================================================

/**
 * Generate HTML content for the vault empty engagement email
 */
function generateVaultEmptyEmailHtml(firstName: string, householdName?: string): string {
  const greeting = firstName ? `Hi ${firstName},` : "Hi there,";
  const householdMention = householdName
    ? `You've set up the ${householdName} household`
    : "You've set up your household";

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Heritage Vault Awaits</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; background-color: #f5f5f5;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f5f5f5;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center;">
              <img src="https://pathible.com/pathible-logo.png" alt="Pathible" width="140" style="max-width: 140px;">
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 20px 40px;">
              <h1 style="color: #1a1a1a; font-size: 24px; font-weight: 600; margin: 0 0 20px;">Your Heritage Vault is ready</h1>

              <p style="color: #4a4a4a; font-size: 16px; margin: 0 0 16px;">
                ${greeting}
              </p>

              <p style="color: #4a4a4a; font-size: 16px; margin: 0 0 16px;">
                ${householdMention} and we're excited to help you build your family's legacy. Your Heritage Vault is ready and waiting for its first document.
              </p>

              <p style="color: #4a4a4a; font-size: 16px; margin: 0 0 24px;">
                Start with something simple—a family photo, an important document, or a cherished recipe. Every journey begins with a single step.
              </p>

              <!-- CTA Button -->
              <table role="presentation" cellspacing="0" cellpadding="0" style="margin: 0 auto 24px;">
                <tr>
                  <td style="background-color: #2563eb; border-radius: 6px;">
                    <a href="https://pathible.com/dashboard/vault" style="display: inline-block; padding: 14px 32px; color: #ffffff; font-size: 16px; font-weight: 600; text-decoration: none;">
                      Upload Your First Document
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Benefits Section -->
              <div style="background-color: #f8fafc; border-radius: 6px; padding: 20px; margin-bottom: 24px;">
                <p style="color: #1a1a1a; font-size: 14px; font-weight: 600; margin: 0 0 12px;">
                  Why start today?
                </p>
                <ul style="color: #4a4a4a; font-size: 14px; margin: 0; padding-left: 20px;">
                  <li style="margin-bottom: 8px;"><strong>Peace of mind</strong> — Know your important documents are safe and accessible</li>
                  <li style="margin-bottom: 8px;"><strong>Easy access</strong> — Find what you need, when you need it</li>
                  <li style="margin-bottom: 8px;"><strong>Lasting legacy</strong> — Preserve memories for future generations</li>
                </ul>
              </div>

              <p style="color: #6b7280; font-size: 14px; margin: 0;">
                Questions? We're here to help. Just reply to this email or visit our <a href="https://pathible.com/help" style="color: #2563eb; text-decoration: none;">Help Center</a>.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; border-top: 1px solid #e5e7eb;">
              <p style="color: #9ca3af; font-size: 12px; margin: 0 0 8px; text-align: center;">
                You're receiving this email because you signed up for Pathible and enabled email notifications.
              </p>
              <p style="color: #9ca3af; font-size: 12px; margin: 0; text-align: center;">
                <a href="https://pathible.com/dashboard/settings" style="color: #9ca3af; text-decoration: underline;">Manage email preferences</a> ·
                <a href="https://pathible.com" style="color: #9ca3af; text-decoration: underline;">pathible.com</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
}

// ============================================================================
// RECIPIENT QUERIES
// ============================================================================

/**
 * Get users eligible for the weekly vault empty engagement email
 *
 * Criteria:
 * - Onboarding status is "complete"
 * - Household has vaultDocumentCount === 0 (or undefined for legacy data)
 * - User preferences have emailNotifications === true
 * - Onboarding completed at least 3 days ago
 */
export const getVaultEmptyRecipients = internalQuery({
  args: {},
  returns: v.array(
    v.object({
      profileId: v.id("profiles"),
      email: v.string(),
      firstName: v.string(),
      lastName: v.string(),
      householdName: v.optional(v.string()),
    }),
  ),
  handler: async (ctx) => {
    const now = Date.now();
    const threeDaysAgo = now - THREE_DAYS_MS;

    // Get all profiles with complete onboarding
    const profiles = await ctx.db.query("profiles").collect();

    const eligibleProfiles = profiles.filter((p) => {
      // Must have completed onboarding
      if (p.onboardingStatus !== "complete") return false;

      // Must have completed onboarding at least 3 days ago
      if (!p.onboardingCompletedAt || p.onboardingCompletedAt > threeDaysAgo) return false;

      // Must have an email
      if (!p.email) return false;

      // Must not be deleted
      if (p.deletedAt) return false;

      return true;
    });

    const recipients: Array<{
      profileId: (typeof profiles)[0]["_id"];
      email: string;
      firstName: string;
      lastName: string;
      householdName?: string;
    }> = [];

    for (const profile of eligibleProfiles) {
      // Check email notifications preference
      const preferences = await ctx.db
        .query("userPreferences")
        .withIndex("by_profile", (q) => q.eq("profileId", profile._id))
        .unique();

      // Skip if notifications disabled
      if (!preferences?.emailNotifications) continue;

      // Get household membership
      const membership = await ctx.db
        .query("householdMemberships")
        .withIndex("by_user", (q) => q.eq("userId", profile._id))
        .first();

      if (!membership) continue;

      // Get household and check vault document count
      const household = await ctx.db.get(membership.householdId);

      if (!household) continue;

      // Skip if vault has documents (vaultDocumentCount > 0)
      // Note: undefined means legacy data that hasn't been backfilled, treat as 0
      const vaultCount = household.vaultDocumentCount ?? 0;
      if (vaultCount > 0) continue;

      recipients.push({
        profileId: profile._id,
        email: profile.email as string,
        firstName: profile.firstName,
        lastName: profile.lastName,
        householdName: household.name,
      });
    }

    return recipients;
  },
});

// ============================================================================
// AUTOMATED EMAIL ACTIONS (CRON HANDLERS)
// ============================================================================

/**
 * Send weekly vault empty engagement emails
 * Called by cron job every Sunday at 6 PM UTC
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
    // Get eligible recipients
    const recipients: Array<{
      profileId: Id<"profiles">;
      email: string;
      firstName: string;
      lastName: string;
      householdName?: string;
    }> = await ctx.runQuery(internal.automatedEmails.getVaultEmptyRecipients, {});

    if (recipients.length === 0) {
      console.log("[Automated Emails] No vault empty recipients found");
      return {
        recipientCount: 0,
        campaignId: "",
        skipped: true,
      };
    }

    // Create campaign ID with date
    const dateStr = new Date().toISOString().split("T")[0];
    const campaignId = `weekly_vault_empty_${dateStr}`;

    // Create campaign record
    await ctx.runMutation(internal.emailQueue.createCampaign, {
      campaignId,
      type: "weekly_vault_empty",
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
      const subject = `${recipient.firstName}, your Heritage Vault is ready for its first document`;
      const htmlContent = generateVaultEmptyEmailHtml(recipient.firstName, recipient.householdName);

      return {
        to: recipient.email,
        subject,
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
        campaignId,
      },
    );

    console.log(
      `[Automated Emails] Enqueued ${result.queuedCount} vault empty engagement emails for campaign ${campaignId}`,
    );

    return {
      recipientCount: result.queuedCount,
      campaignId,
      skipped: false,
    };
  },
});
