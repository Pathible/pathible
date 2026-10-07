/**
 * Stripe Configuration - Price ID to Subscription Tier Mapping
 *
 * Maps Stripe Price IDs to internal subscription tiers.
 * Price IDs are loaded from environment variables so they can differ
 * between Stripe test mode and production.
 *
 * IMPORTANT: Set these environment variables in your Convex dashboard:
 * - STRIPE_PRICE_FOUNDATIONS
 * - STRIPE_PRICE_HERITAGE
 * - STRIPE_PRICE_LEGACY
 * - STRIPE_PRICE_FOUNDERS
 * - STRIPE_PRICE_EXECUTOR (one-time payment)
 */

import type { SubscriptionTier } from "./subscriptionTiers";

/**
 * Resolve the Price ID -> Tier mapping from environment variables.
 * Called at runtime inside Convex functions (not at import time).
 */
export function getPriceToTierMap(): Record<string, SubscriptionTier> {
  const map: Record<string, SubscriptionTier> = {};

  const foundations = process.env.STRIPE_PRICE_FOUNDATIONS;
  const heritage = process.env.STRIPE_PRICE_HERITAGE;
  const legacy = process.env.STRIPE_PRICE_LEGACY;
  const founders = process.env.STRIPE_PRICE_FOUNDERS;

  if (foundations) map[foundations] = "foundations";
  if (heritage) map[heritage] = "heritage";
  if (legacy) map[legacy] = "legacy";
  if (founders) map[founders] = "founders";

  return map;
}

/**
 * Resolve a Stripe Price ID to a subscription tier.
 * Returns null if the Price ID is not recognized.
 */
export function resolveTierFromPriceId(priceId: string): SubscriptionTier | null {
  const map = getPriceToTierMap();
  return map[priceId] ?? null;
}

/**
 * Check if a Price ID corresponds to the Executor one-time product.
 */
export function isExecutorPriceId(priceId: string): boolean {
  const executorPriceId = process.env.STRIPE_PRICE_EXECUTOR;
  return !!executorPriceId && priceId === executorPriceId;
}

/**
 * Stripe webhook event types we handle.
 */
export const STRIPE_EVENTS = {
  CHECKOUT_COMPLETED: "checkout.session.completed",
  SUBSCRIPTION_UPDATED: "customer.subscription.updated",
  SUBSCRIPTION_DELETED: "customer.subscription.deleted",
  INVOICE_PAID: "invoice.paid",
  INVOICE_PAYMENT_FAILED: "invoice.payment_failed",
  CHARGE_REFUNDED: "charge.refunded",
} as const;
