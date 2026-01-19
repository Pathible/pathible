/**
 * System Email Templates - Seed Data
 *
 * These are the automated email templates that are triggered by cron jobs.
 * The content is stored in markdown format with variable placeholders.
 */

/**
 * Template data structure matching the emailTemplates schema
 */
export interface SystemEmailTemplateData {
  name: string;
  systemTemplateKey: string;
  subject: string;
  content: string;
  description: string;
  variables: string[];
  category: "system";
  isSystemTemplate: true;
  enabled: boolean;
  schedule: {
    frequency: "weekly" | "daily";
    dayOfWeek?: number; // 0-6, Sunday=0
    hourUtc: number; // 0-23
  };
  triggerConditions: {
    onboardingStatus?: string;
    minDaysSinceOnboarding?: number;
    vaultEmpty?: boolean;
    requireEmailNotifications?: boolean;
  };
  campaignType: "weekly_vault_empty" | "weekly_digest" | "admin_broadcast" | "other";
}

/**
 * Vault Empty Engagement Email
 *
 * Sent to users who have completed onboarding but haven't uploaded
 * any documents to their Heritage Vault.
 */
const vaultEmptyTemplate: SystemEmailTemplateData = {
  name: "Heritage Vault Empty",
  systemTemplateKey: "vault_empty",
  subject: "{{firstName}}, your Heritage Vault is ready for its first document",
  content: `# Your Heritage Vault is ready

Hi {{firstName}},

{{#if householdName}}You've set up the {{householdName}} household{{else}}You've set up your household{{/if}} and we're excited to help you build your family's legacy. Your Heritage Vault is ready and waiting for its first document.

Start with something simple—a family photo, an important document, or a cherished recipe. Every journey begins with a single step.

[Upload Your First Document](https://pathible.com/dashboard/vault)

---

## Why start today?

- **Peace of mind** — Know your important documents are safe and accessible
- **Easy access** — Find what you need, when you need it
- **Lasting legacy** — Preserve memories for future generations

---

Questions? We're here to help. Just reply to this email or visit our [Help Center](https://pathible.com/help).`,
  description:
    "Sent weekly to users 3+ days after onboarding who haven't uploaded any documents to their vault.",
  variables: ["firstName", "householdName"],
  category: "system",
  isSystemTemplate: true,
  enabled: true,
  schedule: {
    frequency: "weekly",
    dayOfWeek: 0, // Sunday
    hourUtc: 18, // 6 PM UTC (11 AM PST / 2 PM EST)
  },
  triggerConditions: {
    onboardingStatus: "complete",
    minDaysSinceOnboarding: 3,
    vaultEmpty: true,
    requireEmailNotifications: true,
  },
  campaignType: "weekly_vault_empty",
};

/**
 * All system email templates
 */
export const systemEmailTemplates: SystemEmailTemplateData[] = [vaultEmptyTemplate];
