import { type SubscriptionTier, TIER_LEVELS } from "./subscriptionTiers";

export function billingRecord(value: unknown): Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

export function billingPayerUserId(data: unknown): string | undefined {
  const userId = billingRecord(billingRecord(data).payer).user_id;
  return typeof userId === "string" && userId.startsWith("user_") ? userId : undefined;
}

/** Parse the canonical backend subscription, never user metadata or a browser-supplied tier. */
export function parseBillingState(value: unknown, now = Date.now()) {
  const subscription = billingRecord(value);
  if (!Array.isArray(subscription.subscription_items))
    throw new Error("Invalid billing subscription response");
  const items = subscription.subscription_items.map(billingRecord);
  const paid = items
    .filter((item) => {
      const slug = billingRecord(item.plan).slug;
      return (
        typeof slug === "string" &&
        Object.hasOwn(TIER_LEVELS, slug) &&
        (item.status === "active" ||
          (item.status === "canceled" &&
            typeof item.period_end === "number" &&
            item.period_end > now))
      );
    })
    .sort(
      (a, b) =>
        TIER_LEVELS[billingRecord(b.plan).slug as SubscriptionTier] -
        TIER_LEVELS[billingRecord(a.plan).slug as SubscriptionTier],
    );
  const item = paid[0];
  return {
    tier: item ? (billingRecord(item.plan).slug as SubscriptionTier) : ("foundations" as const),
    status: item
      ? ("active" as const)
      : subscription.status === "past_due"
        ? ("past_due" as const)
        : ("inactive" as const),
    validUntil: item && typeof item.period_end === "number" ? item.period_end : undefined,
  };
}
