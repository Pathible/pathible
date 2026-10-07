"use node";

import { randomBytes } from "node:crypto";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import { internalAction } from "./_generated/server";

export const createLink = internalAction({
  args: { profileId: v.id("profiles") },
  returns: v.string(),
  handler: async (ctx, args): Promise<string> => {
    const token: string = await ctx.runMutation(internal.emailPreferences.ensureToken, {
      profileId: args.profileId,
      token: randomBytes(32).toString("hex"),
    });
    return `https://www.pathible.com/unsubscribe?token=${token}`;
  },
});
