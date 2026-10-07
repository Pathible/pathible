import { describe, expect, it } from "vitest";
import { billingPayerUserId, parseBillingState } from "@/convex/shared/billingState";

const subscription = (items: unknown[], status = "active") => ({
  status,
  subscription_items: items,
});
describe("verified billing state", () => {
  it("uses payer user IDs rather than subscription IDs", () => {
    expect(billingPayerUserId({ id: "sub_123", payer: { user_id: "user_123" } })).toBe("user_123");
    expect(billingPayerUserId({ id: "sub_123" })).toBeUndefined();
    expect(billingPayerUserId({ payer: { user_id: "org_123" } })).toBeUndefined();
  });
  it("selects the highest active known paid plan", () => {
    expect(
      parseBillingState(
        subscription([
          { status: "active", plan: { slug: "foundations" } },
          { status: "active", plan: { slug: "legacy" }, period_end: 2000 },
          { status: "upcoming", plan: { slug: "founders" } },
        ]),
        1000,
      ),
    ).toEqual({ tier: "legacy", status: "active", validUntil: 2000 });
  });
  it("retains canceled access only until the paid period ends", () => {
    const data = subscription(
      [{ status: "canceled", plan: { slug: "legacy" }, period_end: 2000 }],
      "canceled",
    );
    expect(parseBillingState(data, 1999).status).toBe("active");
    expect(parseBillingState(data, 2000).status).toBe("inactive");
  });
  it("does not grant a tier from user metadata, free plans, or unknown plans", () => {
    expect(
      parseBillingState({
        ...subscription([{ status: "active", plan: { slug: "free" } }]),
        public_metadata: { subscription_tier: "legacy" },
      }).status,
    ).toBe("inactive");
    expect(
      parseBillingState(subscription([{ status: "active", plan: { slug: "constructor" } }])).status,
    ).toBe("inactive");
  });
  it("fails closed on malformed responses and past-due subscriptions", () => {
    expect(() => parseBillingState({ status: "active" })).toThrow();
    expect(
      parseBillingState(
        subscription([{ status: "past_due", plan: { slug: "legacy" } }], "past_due"),
      ).status,
    ).toBe("past_due");
  });
});
