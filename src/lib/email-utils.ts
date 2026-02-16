/**
 * Email Utilities
 *
 * Functions for converting markdown to HTML, substituting variables,
 * and generating email templates.
 */

// ============================================================================
// VARIABLE DEFINITIONS
// ============================================================================

export interface EmailVariable {
  key: string;
  description: string;
  category: "user" | "household" | "platform";
  example: string;
}

export const EMAIL_VARIABLES: EmailVariable[] = [
  // User Variables
  {
    key: "firstName",
    description: "User's first name",
    category: "user",
    example: "Jane",
  },
  {
    key: "lastName",
    description: "User's last name",
    category: "user",
    example: "Smith",
  },
  {
    key: "fullName",
    description: "User's full name",
    category: "user",
    example: "Jane Smith",
  },
  {
    key: "email",
    description: "User's email address",
    category: "user",
    example: "jane@example.com",
  },

  // Household Variables
  {
    key: "householdName",
    description: "Name of user's primary household",
    category: "household",
    example: "Smith Family",
  },
  {
    key: "subscriptionTier",
    description: "Current subscription tier",
    category: "household",
    example: "Heritage",
  },

  // Platform Variables
  {
    key: "appName",
    description: "Application name",
    category: "platform",
    example: "Pathible",
  },
  {
    key: "supportEmail",
    description: "Support email address",
    category: "platform",
    example: "support@pathible.com",
  },
  {
    key: "currentYear",
    description: "Current year (for footers)",
    category: "platform",
    example: new Date().getFullYear().toString(),
  },
  {
    key: "loginUrl",
    description: "Link to login page",
    category: "platform",
    example: "https://pathible.com/login",
  },
  {
    key: "dashboardUrl",
    description: "Link to user dashboard",
    category: "platform",
    example: "https://pathible.com/dashboard",
  },
];

export const VARIABLE_GROUPS = EMAIL_VARIABLES.reduce(
  (acc, variable) => {
    if (!acc[variable.category]) {
      acc[variable.category] = [];
    }
    acc[variable.category].push(variable);
    return acc;
  },
  {} as Record<string, EmailVariable[]>,
);

// ============================================================================
// VARIABLE SUBSTITUTION
// ============================================================================

export interface VariableContext {
  firstName?: string;
  lastName?: string;
  fullName?: string;
  email?: string;
  householdName?: string;
  subscriptionTier?: string;
}

/**
 * Get example values for preview rendering
 */
export function getExampleVariables(): Record<string, string> {
  const examples: Record<string, string> = {};
  for (const variable of EMAIL_VARIABLES) {
    examples[variable.key] = variable.example;
  }
  return examples;
}

/**
 * Substitute variables in content
 */
export function substituteVariables(content: string, context: VariableContext): string {
  let result = content;

  // User variables
  if (context.firstName) {
    result = result.replace(/\{\{firstName\}\}/g, context.firstName);
  }
  if (context.lastName) {
    result = result.replace(/\{\{lastName\}\}/g, context.lastName);
  }
  if (context.fullName) {
    result = result.replace(/\{\{fullName\}\}/g, context.fullName);
  } else if (context.firstName && context.lastName) {
    result = result.replace(/\{\{fullName\}\}/g, `${context.firstName} ${context.lastName}`);
  }
  if (context.email) {
    result = result.replace(/\{\{email\}\}/g, context.email);
  }

  // Household variables
  if (context.householdName) {
    result = result.replace(/\{\{householdName\}\}/g, context.householdName);
  }
  if (context.subscriptionTier) {
    result = result.replace(/\{\{subscriptionTier\}\}/g, context.subscriptionTier);
  }

  // Platform variables (always substituted)
  result = result.replace(/\{\{appName\}\}/g, "Pathible");
  result = result.replace(/\{\{supportEmail\}\}/g, "support@pathible.com");
  result = result.replace(/\{\{currentYear\}\}/g, new Date().getFullYear().toString());
  result = result.replace(/\{\{loginUrl\}\}/g, "https://pathible.com/login");
  result = result.replace(/\{\{dashboardUrl\}\}/g, "https://pathible.com/dashboard");

  return result;
}

/**
 * Extract variable names from template content
 */
export function extractVariables(content: string): string[] {
  const matches = content.match(/\{\{(\w+)\}\}/g);
  if (!matches) return [];

  const variables = new Set<string>();
  for (const match of matches) {
    const varName = match.replace(/\{\{|\}\}/g, "");
    variables.add(varName);
  }

  return Array.from(variables);
}

// ============================================================================
// MARKDOWN TO HTML CONVERSION
// ============================================================================

/**
 * Simple markdown to HTML converter with inline styles for email compatibility
 * Handles common markdown patterns without external dependencies
 */
export function markdownToHtml(markdown: string): string {
  let html = markdown;

  // Define inline styles for email compatibility
  const styles = {
    h1: "font-family: 'Inter', sans-serif; color: #000000; font-size: 36px; line-height: 125%; font-weight: bold; margin-bottom: 10px; margin-top: 0; text-align: center;",
    h2: "font-family: 'Inter', sans-serif; color: #000000; font-size: 24px; line-height: 125%; font-weight: bold; margin-bottom: 10px; margin-top: 20px;",
    h3: "font-family: 'Inter', sans-serif; color: #000000; font-size: 18px; line-height: 125%; font-weight: bold; margin-bottom: 10px; margin-top: 16px;",
    p: "font-family: 'Inter', sans-serif; color: #515856; font-size: 16px; line-height: 165%; margin-top: 0; margin-bottom: 10px;",
    li: "font-family: 'Inter', sans-serif; color: #515856; font-size: 16px; line-height: 165%;",
    ul: "font-family: 'Inter', sans-serif; color: #515856; font-size: 16px; line-height: 165%; margin-top: 0; margin-bottom: 10px; padding-left: 24px;",
    ol: "font-family: 'Inter', sans-serif; color: #515856; font-size: 16px; line-height: 165%; margin-top: 0; margin-bottom: 10px; padding-left: 24px;",
    a: "color: #4B7F52; text-decoration: underline;",
    hr: "border: none; border-top: 1px solid #EAECED; margin: 20px 0;",
  };

  // Headers
  html = html.replace(/^### (.*$)/gim, `<h3 style="${styles.h3}">$1</h3>`);
  html = html.replace(/^## (.*$)/gim, `<h2 style="${styles.h2}">$1</h2>`);
  html = html.replace(/^# (.*$)/gim, `<h1 style="${styles.h1}">$1</h1>`);

  // Bold and italic
  html = html.replace(/\*\*\*(.*?)\*\*\*/g, "<strong><em>$1</em></strong>");
  html = html.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/\*(.*?)\*/g, "<em>$1</em>");
  html = html.replace(/___(.*?)___/g, "<strong><em>$1</em></strong>");
  html = html.replace(/__(.*?)__/g, "<strong>$1</strong>");
  html = html.replace(/_(.*?)_/g, "<em>$1</em>");

  // Button links - syntax: [button: Button Text](url)
  // Uses table-based button for email client compatibility
  const buttonStyle = `
    display: inline-block;
    padding: 14px 25px;
    font-family: 'Inter', sans-serif;
    color: #ffffff;
    font-size: 14px;
    font-weight: bold;
    text-decoration: none;
    background-color: #4B7F52;
    border-radius: 6px;
    line-height: 16px;
  `
    .replace(/\s+/g, " ")
    .trim();

  html = html.replace(
    /\[button:\s*([^\]]+)\]\(([^)]+)\)/g,
    `<table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="margin: 16px 0;">
      <tr>
        <td align="center" style="background-color: #4B7F52; border-radius: 6px;">
          <a href="$2" target="_blank" style="${buttonStyle}">$1</a>
        </td>
      </tr>
    </table>`,
  );

  // Regular links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, `<a href="$2" style="${styles.a}">$1</a>`);

  // Horizontal rule - use table-based divider for email compatibility
  html = html.replace(
    /^---$/gim,
    `<table width="100%" border="0" cellspacing="0" cellpadding="0"><tr><td style="padding: 20px 0;" align="center"><table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" width="100%"><tr><td style="border-top: 1px solid #EAECED;"></td></tr></table></td></tr></table>`,
  );

  // Unordered lists
  html = html.replace(/^\s*[-*]\s+(.*$)/gim, `<li style="${styles.li}">$1</li>`);

  // Ordered lists
  html = html.replace(/^\s*\d+\.\s+(.*$)/gim, `<li style="${styles.li}">$1</li>`);

  // Fix consecutive list items
  html = html.replace(/<\/li>\s*<li/g, "</li><li");

  // Wrap orphan li tags in ul (simplified approach)
  const liPattern = /(<li[^>]*>[\s\S]*?<\/li>)+/g;
  html = html.replace(liPattern, (match) => {
    if (!match.includes("<ul") && !match.includes("<ol")) {
      return `<ul style="${styles.ul}">${match}</ul>`;
    }
    return match;
  });

  // Paragraphs - wrap lines that aren't already HTML tags
  const lines = html.split("\n");
  const processedLines = lines.map((line) => {
    const trimmed = line.trim();
    if (!trimmed) return "";
    if (trimmed.startsWith("<")) return line;
    return `<p style="${styles.p}">${trimmed}</p>`;
  });
  html = processedLines.join("\n");

  // Clean up empty paragraphs
  html = html.replace(/<p[^>]*><\/p>/g, "");
  html = html.replace(/<p[^>]*>\s*<\/p>/g, "");

  return html;
}

// ============================================================================
// EMAIL TEMPLATE WRAPPER
// ============================================================================

/**
 * Wrap HTML content in email template with styling
 * Uses table-based layout with inline styles for maximum email client compatibility
 */
export function wrapInEmailTemplate(content: string, subject: string): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
  <!--[if mso]>
  <style type="text/css">
    body, table, td {font-family: Arial, Helvetica, sans-serif !important;}
  </style>
  <![endif]-->
</head>
<body style="margin: 0; padding: 0; background-color:#ffffff; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
<div class="document" role="article" aria-roledescription="email" aria-label="" lang="" dir="ltr" style="background-color:#ffffff; line-height: 100%; font-size:medium; font-size:max(16px, 1rem);">

        <!--[if gte mso 9]>
        <v:background xmlns:v="urn:schemas-microsoft-com:vml" fill="t" if="variable.bodyBackgroundImage.value">
            <v:fill type="tile" src="" color="#ffffff"/>
        </v:background>
        <![endif]-->
  
<table width="100%" bgcolor="#ffffff" border="0" cellspacing="0" cellpadding="0">
    <tr>
      <td align="center" style="padding: 0 8px;">
        <!-- Logo Section -->
        <table width="640" bgcolor="#F6F4F1" align="center" border="0" cellspacing="0" cellpadding="0" style="width: 640px; min-width: 640px;">
          <tr>
            <td height="30" style="line-height: 30px;"></td>
          </tr>
          <tr>
            <td align="center" style="padding: 0 50px;">
              <a href="https://pathible.com" style="text-decoration: none;">
                <img src="https://storage.mlcdn.com/account_image/1563253/11BNWhJy75n9STQblPUejbYJx7cBnC60AlmVDoML.png" border="0" alt="Pathible" width="125" style="max-width: 125px; display: inline-block;">
              </a>
            </td>
          </tr>
          <tr>
            <td height="30" style="line-height: 30px;"></td>
          </tr>
        </table>

        <!-- Main Content Section -->
        <table width="640" bgcolor="#F6F4F1" align="center" border="0" cellspacing="0" cellpadding="0" style="color: #515856; width: 640px; min-width: 640px;">
          <tr>
            <td height="20" style="line-height: 20px;"></td>
          </tr>
          <tr>
            <td style="padding: 0 50px;">
              ${content}
            </td>
          </tr>
          <tr>
            <td height="40" style="line-height: 40px;"></td>
          </tr>
        </table>

        

        <!-- Footer Section -->
        <table width="640" bgcolor="#ffffff" align="center" border="0" cellspacing="0" cellpadding="0" style="width: 640px; min-width: 640px;">
          <tr>
            <td height="40" style="line-height: 40px;"></td>
          </tr>
          <tr>
            <td style="padding: 0 50px;">
              <table align="center" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="left" width="250" valign="top" style="text-align: left;">
                    <h5 style="font-family: 'Inter', sans-serif; color: #000000; font-size: 15px; line-height: 125%; font-weight: bold; margin-bottom: 6px; margin-top: 0;">Pathible</h5>
                    <p style="font-family: 'Inter', sans-serif; color: #515856; font-size: 14px; line-height: 150%; margin-bottom: 6px; margin-top: 0;">Your voice. Your values. Your legacy.</p>
                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td height="16" style="line-height: 16px;"></td>
                      </tr>
                      <tr>
                        <td>
                          <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                            <tr>
                              <td align="center" valign="middle" width="18" style="padding: 0 5px 0 0;">
                                <a href="https://www.facebook.com/people/Pathible/61577949614554/" target="_blank" style="text-decoration: none;">
                                  <img src="https://assets.mlcdn.com/ml/images/icons/default/rounded_corners/black/facebook.png" width="18" alt="facebook">
                                </a>
                              </td>
                              <td align="center" valign="middle" width="18" style="padding: 0 0 0 5px;">
                                <a href="https://www.instagram.com/pathible.legacy/" target="_blank" style="text-decoration: none;">
                                  <img src="https://assets.mlcdn.com/ml/images/icons/default/rounded_corners/black/instagram.png" width="18" alt="instagram">
                                </a>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                  <td width="40" height="30" style="line-height: 30px;"></td>
                  <td align="left" width="250" valign="top" style="text-align: left;">
                    <p style="font-family: 'Inter', sans-serif; color: #515856; font-size: 14px; line-height: 150%; margin-bottom: 6px; margin-top: 0;">You received this email because you are using Pathible.</p>
                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td height="8" style="line-height: 8px;"></td>
                      </tr>
                      <tr>
                        <td align="left">
                          <p style="font-family: 'Inter', sans-serif; color: #515856; font-size: 14px; line-height: 150%; margin-bottom: 0; margin-top: 0;">
                            <a href="https://pathible.com/unsubscribe" style="color: #515856; text-decoration: underline;">Unsubscribe</a>
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td height="40" style="line-height: 40px;"></td>
          </tr>
        </table>

      </td>
    </tr>
  </table>
</div>
</body>
</html>`;
}

/**
 * Convert markdown to full email HTML with template wrapper
 */
export function markdownToEmailHtml(
  markdown: string,
  subject: string,
  variables?: VariableContext,
): string {
  // First substitute variables
  let content = markdown;
  if (variables) {
    content = substituteVariables(content, variables);
  }

  // Convert markdown to HTML
  const htmlContent = markdownToHtml(content);

  // Wrap in email template
  return wrapInEmailTemplate(htmlContent, subject);
}

// ============================================================================
// TEMPLATE CATEGORIES
// ============================================================================

import { EMAIL_CATEGORY_STYLES } from "@/app/(auth)/admin/components/admin-utils";

export const TEMPLATE_CATEGORIES = [
  { value: "onboarding", label: "Onboarding" },
  { value: "retargeting", label: "Retargeting" },
  { value: "announcements", label: "Announcements" },
  { value: "legacy", label: "Legacy" },
  { value: "invitations", label: "Invitations" },
  { value: "digest", label: "Digest" },
  { value: "system", label: "System" },
  { value: "other", label: "Other" },
] as const;

export type TemplateCategory = (typeof TEMPLATE_CATEGORIES)[number]["value"];

export function getCategoryStyle(category: string | undefined): string {
  return EMAIL_CATEGORY_STYLES[category ?? "other"] ?? EMAIL_CATEGORY_STYLES.other;
}

export function getCategoryLabel(category: string | undefined): string {
  const found = TEMPLATE_CATEGORIES.find((c) => c.value === category);
  return found?.label ?? "Other";
}

// ============================================================================
// EMAIL QUEUE UTILITIES
// ============================================================================

export const RATE_LIMIT_DELAY_MS = 500; // 500ms between emails = 2 emails/second
export const DEFAULT_MAX_ATTEMPTS = 3;
export const RETRY_DELAYS_MS = [60_000, 300_000, 900_000]; // 1min, 5min, 15min

/**
 * Calculate scheduled send times for a batch of emails
 * Each email is scheduled 500ms after the previous one to respect rate limits
 */
export function calculateBatchScheduleTimes(
  emailCount: number,
  startTime: number = Date.now(),
): number[] {
  const scheduleTimes: number[] = [];
  for (let i = 0; i < emailCount; i++) {
    scheduleTimes.push(startTime + i * RATE_LIMIT_DELAY_MS);
  }
  return scheduleTimes;
}

/**
 * Calculate the next retry delay based on attempt number
 * Uses exponential backoff: 1min, 5min, 15min
 */
export function calculateRetryDelay(attemptNumber: number): number {
  const index = Math.min(attemptNumber - 1, RETRY_DELAYS_MS.length - 1);
  return RETRY_DELAYS_MS[Math.max(0, index)];
}

/**
 * Determine if an email should be retried based on attempts
 */
export function shouldRetryEmail(attempts: number, maxAttempts: number): boolean {
  return attempts < maxAttempts;
}

// ============================================================================
// VAULT EMPTY EMAIL TEMPLATE
// ============================================================================

/**
 * Generate the inner content for the vault empty engagement email.
 * This returns ONLY the content portion - use wrapInEmailTemplate() to create the full email.
 */
export function generateVaultEmptyEmailContent(firstName: string, householdName?: string): string {
  const greeting = firstName ? `Hi ${firstName},` : "Hi there,";
  const householdMention = householdName
    ? `You've set up the ${householdName} household`
    : "You've set up your household";

  // Brand colors
  const forestGreen = "#4B7F52";
  const textColor = "#515856";
  const headingColor = "#000000";

  return `
              <h1 style="font-family: 'Inter', sans-serif; color: ${headingColor}; font-size: 24px; line-height: 125%; font-weight: bold; margin-bottom: 16px; margin-top: 0;">Your Heritage Vault is ready</h1>

              <p style="font-family: 'Inter', sans-serif; color: ${textColor}; font-size: 16px; line-height: 165%; margin-top: 0; margin-bottom: 16px;">
                ${greeting}
              </p>

              <p style="font-family: 'Inter', sans-serif; color: ${textColor}; font-size: 16px; line-height: 165%; margin-top: 0; margin-bottom: 16px;">
                ${householdMention} and we're excited to help you build your family's legacy. Your Heritage Vault is ready and waiting for its first document.
              </p>

              <p style="font-family: 'Inter', sans-serif; color: ${textColor}; font-size: 16px; line-height: 165%; margin-top: 0; margin-bottom: 24px;">
                Start with something simple—a family photo, an important document, or a cherished recipe. Every journey begins with a single step.
              </p>

              <!-- CTA Button -->
              <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="margin: 0 auto 24px;">
                <tr>
                  <td align="center" style="background-color: ${forestGreen}; border-radius: 6px;">
                    <a href="https://pathible.com/dashboard/vault" target="_blank" style="display: inline-block; padding: 14px 25px; font-family: 'Inter', sans-serif; color: #ffffff; font-size: 14px; font-weight: bold; text-decoration: none; line-height: 16px;">
                      Upload Your First Document
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Benefits Section -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 24px;">
                <tr>
                  <td style="background-color: #EAECED; border-radius: 6px; padding: 20px;">
                    <p style="font-family: 'Inter', sans-serif; color: ${headingColor}; font-size: 14px; font-weight: 600; margin: 0 0 12px;">
                      Why start today?
                    </p>
                    <ul style="font-family: 'Inter', sans-serif; color: ${textColor}; font-size: 14px; line-height: 165%; margin: 0; padding-left: 20px;">
                      <li style="margin-bottom: 8px;"><strong>Peace of mind</strong> — Know your important documents are safe and accessible</li>
                      <li style="margin-bottom: 8px;"><strong>Easy access</strong> — Find what you need, when you need it</li>
                      <li style="margin-bottom: 0;"><strong>Lasting legacy</strong> — Preserve memories for future generations</li>
                    </ul>
                  </td>
                </tr>
              </table>

              <p style="font-family: 'Inter', sans-serif; color: ${textColor}; font-size: 14px; line-height: 165%; margin: 0;">
                Questions? We're here to help. Just reply to this email or visit our <a href="https://pathible.com/help" style="color: ${forestGreen}; text-decoration: underline;">Help Center</a>.
              </p>
`;
}

/**
 * Generate the full HTML email for vault empty engagement.
 * Uses the shared branded email template wrapper.
 */
export function generateVaultEmptyEmailHtml(firstName: string, householdName?: string): string {
  const content = generateVaultEmptyEmailContent(firstName, householdName);
  return wrapInEmailTemplate(content, "Your Heritage Vault Awaits");
}

// ============================================================================
// RECIPIENT ELIGIBILITY
// ============================================================================

export interface VaultEmptyRecipientCriteria {
  onboardingStatus: string;
  onboardingCompletedAt: number | undefined;
  email: string | undefined;
  deletedAt: number | undefined;
  emailNotificationsEnabled: boolean;
  vaultDocumentCount: number;
}

const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000;

/**
 * Check if a user is eligible for the vault empty engagement email
 */
export function isEligibleForVaultEmptyEmail(
  criteria: VaultEmptyRecipientCriteria,
  currentTime: number = Date.now(),
): boolean {
  // Must have completed onboarding
  if (criteria.onboardingStatus !== "complete") return false;

  // Must have completed onboarding at least 3 days ago
  if (!criteria.onboardingCompletedAt) return false;
  const threeDaysAgo = currentTime - THREE_DAYS_MS;
  if (criteria.onboardingCompletedAt > threeDaysAgo) return false;

  // Must have an email
  if (!criteria.email) return false;

  // Must not be deleted
  if (criteria.deletedAt) return false;

  // Must have email notifications enabled
  if (!criteria.emailNotificationsEnabled) return false;

  // Must have empty vault
  if (criteria.vaultDocumentCount > 0) return false;

  return true;
}
