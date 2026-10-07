import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import { internalMutation, type MutationCtx, mutation } from "./_generated/server";
import { requireAuth } from "./auth";

async function disableEmails(writer: MutationCtx, profileId: Id<"profiles">) {
  const preferences = await writer.db
    .query("userPreferences")
    .withIndex("by_profile", (q) => q.eq("profileId", profileId))
    .first();
  if (preferences)
    await writer.db.patch(preferences._id, { emailNotifications: false, updatedAt: Date.now() });
  else
    await writer.db.insert("userPreferences", {
      profileId,
      goals: [],
      emailNotifications: false,
      interestedFeatures: [],
      shareDataWithHousehold: true,
      updatedAt: Date.now(),
    });
}

export const ensureToken = internalMutation({
  args: { profileId: v.id("profiles"), token: v.string() },
  returns: v.string(),
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("emailUnsubscribeTokens")
      .withIndex("by_profile", (q) => q.eq("profileId", args.profileId))
      .unique();
    if (existing) return existing.token;
    await ctx.db.insert("emailUnsubscribeTokens", args);
    return args.token;
  },
});

export const unsubscribe = mutation({
  args: { token: v.string() },
  returns: v.null(),
  handler: async (ctx, args) => {
    if (!/^[a-f0-9]{64}$/.test(args.token)) throw new Error("Invalid unsubscribe link");
    const record = await ctx.db
      .query("emailUnsubscribeTokens")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .unique();
    if (!record) throw new Error("Invalid unsubscribe link");
    await disableEmails(ctx, record.profileId);
    return null;
  },
});

export const unsubscribeCurrentUser = mutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const { profile } = await requireAuth(ctx);
    await disableEmails(ctx, profile._id);
    return null;
  },
});
