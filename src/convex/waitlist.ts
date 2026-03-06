import { v } from "convex/values";
import { mutation } from "./_generated/server";

export const join = mutation({
  args: {
    email: v.string(),
    product: v.string(),
  },
  returns: v.object({
    success: v.boolean(),
    alreadyJoined: v.boolean(),
  }),
  handler: async (ctx, { email, product }) => {
    const normalizedEmail = email.toLowerCase().trim();

    // Check if already on the waitlist
    const existing = await ctx.db
      .query("waitlist")
      .withIndex("by_email_and_product", (q) =>
        q.eq("email", normalizedEmail).eq("product", product),
      )
      .first();

    if (existing) {
      return { success: true, alreadyJoined: true };
    }

    await ctx.db.insert("waitlist", {
      email: normalizedEmail,
      product,
      createdAt: Date.now(),
    });

    return { success: true, alreadyJoined: false };
  },
});
