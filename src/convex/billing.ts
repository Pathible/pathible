import { v } from "convex/values";
import { internal } from "./_generated/api";
import { type ActionCtx, action, internalAction } from "./_generated/server";
import { parseBillingState } from "./shared/billingState";

async function reconcile(ctx: ActionCtx, clerkUserId: string): Promise<boolean> {
  const secret = process.env.CLERK_SECRET_KEY;
  if (!secret) throw new Error("Billing verification is not configured");
  const response = await fetch(
    `https://api.clerk.com/v1/users/${encodeURIComponent(clerkUserId)}/billing/subscription`,
    {
      headers: { Authorization: `Bearer ${secret}` },
    },
  );
  if (!response.ok) throw new Error(`Billing verification failed (${response.status})`);
  const state = parseBillingState(await response.json());
  const synced = await ctx.runMutation(internal.auth.syncSubscriptionTier, {
    clerkUserId,
    ...state,
  });
  if (!synced.success) throw new Error(synced.message);
  return (
    state.status === "active" && (state.validUntil === undefined || state.validUntil > Date.now())
  );
}

export const reconcileCurrentUser = action({
  args: {},
  returns: v.boolean(),
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Authentication required");
    return await reconcile(ctx, identity.subject);
  },
});

export const reconcileUser = internalAction({
  args: { clerkUserId: v.string() },
  returns: v.null(),
  handler: async (ctx, args) => {
    await reconcile(ctx, args.clerkUserId);
    return null;
  },
});
