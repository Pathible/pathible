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
 *
 * Note: Email queue processing no longer uses polling crons.
 * Emails are processed immediately via ctx.scheduler when enqueued.
 * See src/convex/emailQueue.ts for details.
 */

const crons = cronJobs();

// ============================================================================
// AUTOMATED ENGAGEMENT EMAILS
// ============================================================================

/**
 * Weekly automated emails - Sunday at 6 PM UTC
 *
 * Triggers scheduled email templates configured for weekly delivery.
 * Currently used for: Heritage Vault Empty engagement emails
 *
 * To add more schedules, add additional cron entries:
 * - Daily 9 AM: crons.cron("daily automated emails", "0 9 * * *", ...)
 * - Weekdays 10 AM: crons.cron("weekday emails", "0 10 * * 1-5", ...)
 */
crons.cron(
  "weekly automated emails",
  "0 18 * * 0", // Sunday at 6 PM UTC
  internal.automatedEmails.checkAndRunScheduledEmails,
  {},
);

export default crons;
