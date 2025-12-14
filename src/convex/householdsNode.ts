"use node";

import { v } from "convex/values";
import { action } from "./_generated/server";

/**
 * Node.js actions for households
 * These actions use Node.js APIs and must be in a separate file with "use node" directive
 */

/**
 * Generate a cryptographically secure random token
 * This is an action because it uses Node.js crypto module
 */
export const generateSecureToken = action({
  args: {},
  returns: v.string(),
  handler: async () => {
    // Use Node.js crypto module for cryptographically secure random tokens
    const crypto = await import("node:crypto");
    return crypto.randomBytes(32).toString("base64url");
  },
});
