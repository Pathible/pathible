"use node";

import { v } from "convex/values";
import { action } from "./_generated/server";

/**
 * Generate a cryptographically secure random token
 * This is an action because it uses Node.js crypto module
 *
 * This file uses "use node" directive to enable Node.js runtime
 * Only actions can be defined in files with "use node"
 */
export const generateSecureToken = action({
  args: {},
  returns: v.string(),
  handler: async () => {
    // Use Node.js crypto module for cryptographically secure random tokens
    // This is only available in actions, not mutations
    const crypto = await import("node:crypto");
    return crypto.randomBytes(32).toString("base64url");
  },
});
