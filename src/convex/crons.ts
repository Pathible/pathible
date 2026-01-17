import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

/**
 * Pathible Cron Jobs
 *
 * Scheduled tasks for automated operations.
 *
 * Available schedules:
 * - crons.interval("name", { seconds: N }, handler) - Run every N seconds
 * - crons.interval("name", { minutes: N }, handler) - Run every N minutes
 * - crons.interval("name", { hours: N }, handler) - Run every N hours
 * - crons.cron("name", "* * * * *", handler) - Cron expression (minute hour day month weekday)
 *
 * Cron expression examples:
 * - "0 18 * * 0" - Sunday at 6 PM UTC
 * - "0 9 * * 1-5" - Weekdays at 9 AM UTC
 * - "0 0 1 * *" - First day of each month at midnight UTC
 */

const crons = cronJobs();

// ============================================================================
// EMAIL QUEUE PROCESSING
// ============================================================================

/**
 * Process the email queue every 30 seconds
 * Picks up queued emails and sends them via Resend with rate limiting
 */
crons.interval("process email queue", { seconds: 30 }, internal.emailQueue.processEmailQueue, {});

/**
 * Check for failed emails that can be retried every 5 minutes
 * Failed emails with attempts < maxAttempts are rescheduled with exponential backoff
 */
crons.interval("retry failed emails", { minutes: 5 }, internal.emailQueue.retryFailedEmails, {});

// ============================================================================
// AUTOMATED ENGAGEMENT EMAILS
// ============================================================================

/**
 * Weekly vault empty engagement email - Sunday at 6 PM UTC (11 AM PST / 2 PM EST)
 *
 * Sends a friendly reminder to users who:
 * - Have completed onboarding
 * - Have an empty vault (no documents uploaded)
 * - Have email notifications enabled
 * - Completed onboarding at least 3 days ago
 */
crons.cron(
  "weekly vault empty engagement",
  "0 18 * * 0", // Sunday at 6 PM UTC
  internal.automatedEmails.sendWeeklyVaultEmptyEmails,
  {},
);

export default crons;
