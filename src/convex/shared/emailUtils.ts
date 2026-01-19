/**
 * Email Utilities for Convex Functions
 *
 * Shared utilities for email generation in Convex functions.
 * Note: This is a copy of relevant functions from src/lib/email-utils.ts
 * since Convex cannot import from src/lib.
 */

// ============================================================================
// BRAND CONSTANTS
// ============================================================================

export const BRAND = {
  forestGreen: "#4B7F52",
  sandBackground: "#F6F4F1",
  textColor: "#515856",
  headingColor: "#000000",
  logoUrl:
    "https://storage.mlcdn.com/account_image/1563253/11BNWhJy75n9STQblPUejbYJx7cBnC60AlmVDoML.png",
} as const;

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

  // Handle simple conditional blocks: {{#if varName}}...{{else}}...{{/if}}
  // This is a simplified Handlebars-like syntax
  const conditionalPattern = /\{\{#if (\w+)\}\}([\s\S]*?)(?:\{\{else\}\}([\s\S]*?))?\{\{\/if\}\}/g;
  result = result.replace(conditionalPattern, (_match, varName, ifContent, elseContent) => {
    const value = context[varName as keyof VariableContext];
    if (value) {
      return ifContent;
    }
    return elseContent || "";
  });

  return result;
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

  // Button links - syntax: [Button Text](url) when on its own line
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

  // Links on their own line become buttons
  html = html.replace(
    /^(\[([^\]]+)\]\(([^)]+)\))$/gim,
    `<table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="margin: 16px 0;">
      <tr>
        <td align="center" style="background-color: #4B7F52; border-radius: 6px;">
          <a href="$3" target="_blank" style="${buttonStyle}">$2</a>
        </td>
      </tr>
    </table>`,
  );

  // Regular links (inline)
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
        <table width="640" bgcolor="${BRAND.sandBackground}" align="center" border="0" cellspacing="0" cellpadding="0" style="width: 640px; min-width: 640px;">
          <tr>
            <td height="30" style="line-height: 30px;"></td>
          </tr>
          <tr>
            <td align="center" style="padding: 0 50px;">
              <a href="https://pathible.com" style="text-decoration: none;">
                <img src="${BRAND.logoUrl}" border="0" alt="Pathible" width="125" style="max-width: 125px; display: inline-block;">
              </a>
            </td>
          </tr>
          <tr>
            <td height="30" style="line-height: 30px;"></td>
          </tr>
        </table>

        <!-- Main Content Section -->
        <table width="640" bgcolor="${BRAND.sandBackground}" align="center" border="0" cellspacing="0" cellpadding="0" style="color: ${BRAND.textColor}; width: 640px; min-width: 640px;">
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
                    <p style="font-family: 'Inter', sans-serif; color: ${BRAND.textColor}; font-size: 14px; line-height: 150%; margin-bottom: 6px; margin-top: 0;">Your voice. Your values. Your legacy.</p>
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
                    <p style="font-family: 'Inter', sans-serif; color: ${BRAND.textColor}; font-size: 14px; line-height: 150%; margin-bottom: 6px; margin-top: 0;">You received this email because you are using Pathible.</p>
                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td height="8" style="line-height: 8px;"></td>
                      </tr>
                      <tr>
                        <td align="left">
                          <p style="font-family: 'Inter', sans-serif; color: ${BRAND.textColor}; font-size: 14px; line-height: 150%; margin-bottom: 0; margin-top: 0;">
                            <a href="https://pathible.com/unsubscribe" style="color: ${BRAND.textColor}; text-decoration: underline;">Unsubscribe</a>
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
// SCHEDULE UTILITIES
// ============================================================================

/**
 * Check if the current time matches a template's schedule
 */
export function shouldRunScheduledEmail(
  schedule: {
    frequency: "weekly" | "daily";
    dayOfWeek?: number;
    hourUtc: number;
  },
  currentTime: Date = new Date(),
): boolean {
  const currentHourUtc = currentTime.getUTCHours();
  const currentDayOfWeek = currentTime.getUTCDay();

  // Check if the hour matches
  if (currentHourUtc !== schedule.hourUtc) {
    return false;
  }

  // For weekly schedules, check the day of week
  if (schedule.frequency === "weekly") {
    if (schedule.dayOfWeek === undefined) {
      return false; // Weekly requires a day of week
    }
    return currentDayOfWeek === schedule.dayOfWeek;
  }

  // Daily schedules run every day at the specified hour
  return true;
}

/**
 * Get a human-readable description of a schedule
 */
export function getScheduleDescription(schedule: {
  frequency: "weekly" | "daily";
  dayOfWeek?: number;
  hourUtc: number;
}): string {
  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  const hour12 = schedule.hourUtc % 12 || 12;
  const ampm = schedule.hourUtc < 12 ? "AM" : "PM";
  const timeStr = `${hour12} ${ampm} UTC`;

  if (schedule.frequency === "weekly" && schedule.dayOfWeek !== undefined) {
    return `Weekly (${dayNames[schedule.dayOfWeek]}s ${timeStr})`;
  }

  return `Daily (${timeStr})`;
}
