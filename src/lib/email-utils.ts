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
 * Simple markdown to HTML converter
 * Handles common markdown patterns without external dependencies
 */
export function markdownToHtml(markdown: string): string {
  let html = markdown;

  // Escape HTML entities first (but preserve intentional HTML)
  // html = html.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  // Headers
  html = html.replace(/^### (.*$)/gim, "<h3>$1</h3>");
  html = html.replace(/^## (.*$)/gim, "<h2>$1</h2>");
  html = html.replace(/^# (.*$)/gim, "<h1>$1</h1>");

  // Bold and italic
  html = html.replace(/\*\*\*(.*?)\*\*\*/g, "<strong><em>$1</em></strong>");
  html = html.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/\*(.*?)\*/g, "<em>$1</em>");
  html = html.replace(/___(.*?)___/g, "<strong><em>$1</em></strong>");
  html = html.replace(/__(.*?)__/g, "<strong>$1</strong>");
  html = html.replace(/_(.*?)_/g, "<em>$1</em>");

  // Links
  html = html.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    '<a href="$2" style="color: #4B7F52; text-decoration: underline;">$1</a>',
  );

  // Horizontal rule
  html = html.replace(
    /^---$/gim,
    '<hr style="border: none; border-top: 1px solid #e5e5e5; margin: 24px 0;">',
  );

  // Unordered lists
  html = html.replace(/^\s*[-*]\s+(.*$)/gim, "<li>$1</li>");
  html = html.replace(/(<li>.*<\/li>)/s, "<ul>$1</ul>");

  // Ordered lists
  html = html.replace(/^\s*\d+\.\s+(.*$)/gim, "<li>$1</li>");

  // Fix consecutive list items
  html = html.replace(/<\/li>\s*<li>/g, "</li><li>");

  // Wrap orphan li tags in ul
  html = html.replace(/(<li>[\s\S]*?<\/li>)(?!\s*<\/ul>)/g, (match) => {
    if (!match.includes("<ul>") && !match.includes("</ul>")) {
      return `<ul>${match}</ul>`;
    }
    return match;
  });

  // Paragraphs - wrap lines that aren't already HTML tags
  const lines = html.split("\n");
  const processedLines = lines.map((line) => {
    const trimmed = line.trim();
    if (!trimmed) return "";
    if (trimmed.startsWith("<")) return line;
    return `<p>${trimmed}</p>`;
  });
  html = processedLines.join("\n");

  // Clean up empty paragraphs
  html = html.replace(/<p><\/p>/g, "");
  html = html.replace(/<p>\s*<\/p>/g, "");

  return html;
}

// ============================================================================
// EMAIL TEMPLATE WRAPPER
// ============================================================================

/**
 * Wrap HTML content in email template with styling
 */
export function wrapInEmailTemplate(content: string, subject: string): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #2C2C2C;
      background-color: #F6F4F1;
      margin: 0;
      padding: 20px;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background: #ffffff;
      border-radius: 8px;
      padding: 32px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    }
    h1 {
      color: #4B7F52;
      font-size: 24px;
      margin-top: 0;
      margin-bottom: 16px;
    }
    h2 {
      color: #4B7F52;
      font-size: 20px;
      margin-top: 24px;
      margin-bottom: 12px;
    }
    h3 {
      color: #4B7F52;
      font-size: 18px;
      margin-top: 20px;
      margin-bottom: 10px;
    }
    p {
      margin: 0 0 16px 0;
    }
    a {
      color: #4B7F52;
      text-decoration: underline;
    }
    ul, ol {
      margin: 0 0 16px 0;
      padding-left: 24px;
    }
    li {
      margin-bottom: 8px;
    }
    .button {
      display: inline-block;
      background: #4B7F52;
      color: #ffffff !important;
      padding: 12px 24px;
      border-radius: 6px;
      text-decoration: none;
      margin: 16px 0;
      font-weight: 500;
    }
    .button:hover {
      background: #3d6943;
    }
    .footer {
      margin-top: 32px;
      padding-top: 16px;
      border-top: 1px solid #e5e5e5;
      font-size: 14px;
      color: #8B8680;
    }
    .footer p {
      margin: 4px 0;
    }
    .footer a {
      color: #8B8680;
    }
  </style>
</head>
<body>
  <div class="container">
    ${content}

    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} Pathible. All rights reserved.</p>
      <p>Questions? Contact us at <a href="mailto:support@pathible.com">support@pathible.com</a></p>
    </div>
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

export const TEMPLATE_CATEGORIES = [
  {
    value: "onboarding",
    label: "Onboarding",
    color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  },
  {
    value: "legacy",
    label: "Legacy",
    color: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
  },
  {
    value: "invitations",
    label: "Invitations",
    color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  },
  {
    value: "digest",
    label: "Digest",
    color: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  },
  {
    value: "system",
    label: "System",
    color: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
  },
  {
    value: "other",
    label: "Other",
    color: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
  },
] as const;

export type TemplateCategory = (typeof TEMPLATE_CATEGORIES)[number]["value"];

export function getCategoryStyle(category: string | undefined): string {
  const found = TEMPLATE_CATEGORIES.find((c) => c.value === category);
  return found?.color ?? TEMPLATE_CATEGORIES[5].color;
}

export function getCategoryLabel(category: string | undefined): string {
  const found = TEMPLATE_CATEGORIES.find((c) => c.value === category);
  return found?.label ?? "Other";
}
