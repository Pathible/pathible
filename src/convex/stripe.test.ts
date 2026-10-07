/// <reference types="vite/client" />
import { convexTest } from "convex-test";
import { describe, expect, it, vi } from "vitest";
import { api, internal } from "./_generated/api";
import schema from "./schema";

const modules = import.meta.glob("./**/*.ts");
async function setup(role: "owner" | "viewer" = "owner") {
  const t = convexTest(schema, modules);
  const householdId = await t.run(async (ctx) => {
    const profileId = await ctx.db.insert("profiles", {
      userId: "user_owner",
      firstName: "Test",
      lastName: "Owner",
      updatedAt: 1,
    });
    const id = await ctx.db.insert("households", {
      name: "Test",
      primaryContactId: profileId,
      subscriptionTier: "foundations",
      subscriptionStatus: "inactive",
      stripeCustomerId: "cus_test",
      updatedAt: 1,
    });
    await ctx.db.insert("householdMemberships", {
      householdId: id,
      userId: profileId,
      role,
      status: "active",
    });
    return id;
  });
  return { t, householdId, user: t.withIdentity({ subject: "user_owner" }) };
}

describe("billing authorization and reconciliation", () => {
  it("rejects viewers from billing", async () => {
    const { user } = await setup("viewer");
    await expect(user.query(api.stripe.getBillingAccount, {})).rejects.toThrow();
  });
  it("returns linked billing identity, not an email lookup", async () => {
    const { user } = await setup();
    expect(await user.query(api.stripe.getBillingAccount, {})).toMatchObject({
      stripeCustomerId: "cus_test",
    });
  });
  it("household return validators accept persisted billing fields", async () => {
    const { user, householdId } = await setup();
    expect(await user.query(api.households.get, { householdId })).toMatchObject({
      stripeCustomerId: "cus_test",
    });
    expect(await user.query(api.households.list, {})).toHaveLength(1);
  });
  it("rejects expired overrides even when equal to paid tier", async () => {
    const { t, user, householdId } = await setup();
    await t.run((ctx) =>
      ctx.db.patch(householdId, { tierOverride: "foundations", tierOverrideExpiresAt: 1 }),
    );
    expect(await user.query(api.auth.getEffectiveSubscription, {})).toMatchObject({
      hasOverride: false,
    });
  });
  it("deduplicates events and ignores updates from a replaced subscription", async () => {
    vi.stubEnv("STRIPE_PRICE_FOUNDATIONS", "price_test");
    const { t, householdId } = await setup();
    const args = {
      eventId: "evt_1",
      snapshotAt: 10,
      stripeCustomerId: "cus_test",
      stripeSubscriptionId: "sub_current",
      priceId: "price_test",
      status: "active" as const,
    };
    await t.mutation(internal.stripe.applySubscription, args);
    await t.mutation(internal.stripe.applySubscription, { ...args, status: "cancelled" });
    await t.mutation(internal.stripe.applySubscription, {
      ...args,
      eventId: "evt_old",
      stripeSubscriptionId: "sub_old",
      status: "cancelled",
    });
    expect(await t.run((ctx) => ctx.db.get(householdId))).toMatchObject({
      subscriptionStatus: "active",
      stripeSubscriptionId: "sub_current",
    });
    vi.unstubAllEnvs();
  });
  it("fails unresolved customers so the webhook can retry", async () => {
    const { t } = await setup();
    await expect(
      t.mutation(internal.stripe.applySubscription, {
        eventId: "evt_missing",
        snapshotAt: 10,
        stripeCustomerId: "cus_missing",
        stripeSubscriptionId: "sub_test",
        priceId: "unknown",
        status: "active",
      }),
    ).rejects.toThrow();
  });
  it("test-only admin grants fail closed without an explicit isolated deployment", async () => {
    const { t } = await setup();
    await expect(
      t
        .withIdentity({ subject: "user_owner", email: "attacker+clerk_test@example.com" })
        .mutation(api.testing.grantAdminRole, {}),
    ).rejects.toThrow();
  });
});

describe("security and unpaid onboarding regressions", () => {
  it("caller-selected Legacy or Founders never grants paid access", async () => {
    for (const tier of ["legacy", "founders"] as const) {
      const t = convexTest(schema, modules);
      await t.run((ctx) =>
        ctx.db.insert("profiles", {
          userId: "user_new",
          firstName: "New",
          lastName: "User",
          updatedAt: 1,
        }),
      );
      const user = t.withIdentity({ subject: "user_new" });
      const householdId = await user.mutation(api.onboarding.createFirstHousehold, {
        name: "Unpaid",
        subscriptionTier: tier,
      });
      expect(await t.run((ctx) => ctx.db.get(householdId))).toMatchObject({
        subscriptionTier: "foundations",
        subscriptionStatus: "inactive",
      });
      expect(await user.query(api.auth.getEffectiveSubscription, {})).toMatchObject({
        subscriptionStatus: "inactive",
        hasOverride: false,
      });
    }
  });
  it("legacy migration cannot claim an unrelated or unverified email", async () => {
    const t = convexTest(schema, modules);
    const profileId = await t.run((ctx) =>
      ctx.db.insert("profiles", {
        userId: "legacy_owner",
        email: "owner@example.com",
        firstName: "Old",
        lastName: "Owner",
        updatedAt: 1,
      }),
    );
    for (const identity of [
      { subject: "user_attacker", email: "attacker@example.com", emailVerified: true },
      { subject: "user_attacker", email: "owner@example.com", emailVerified: false },
    ])
      await expect(
        t
          .withIdentity(identity)
          .mutation(api.profiles.linkToClerkUser, { email: "owner@example.com" }),
      ).rejects.toThrow(/verified matching/);
    expect((await t.run((ctx) => ctx.db.get(profileId)))?.userId).toBe("legacy_owner");
    expect(
      await t
        .withIdentity({ subject: "user_owner", email: "owner@example.com", emailVerified: true })
        .mutation(api.profiles.linkToClerkUser, { email: "owner@example.com" }),
    ).toBe(profileId);
  });
  it("Clerk events cannot overwrite Stripe-owned access", async () => {
    const { t, householdId } = await setup();
    await t.run((ctx) =>
      ctx.db.patch(householdId, { billingProvider: "stripe", subscriptionStatus: "active" }),
    );
    await t.mutation(internal.auth.syncSubscriptionTier, {
      clerkUserId: "user_owner",
      status: "cancelled",
      tier: "legacy",
    });
    expect(await t.run((ctx) => ctx.db.get(householdId))).toMatchObject({
      subscriptionStatus: "active",
      subscriptionTier: "foundations",
      billingProvider: "stripe",
    });
  });
});

describe("test-helper production isolation", () => {
  it("rejects even an allowlisted test email on an arbitrary production issuer", async () => {
    vi.stubEnv("TESTING_ENABLED", "true");
    vi.stubEnv("TESTING_USER_IDS", "user_owner");
    vi.stubEnv("CLERK_JWT_ISSUER_DOMAIN", "https://auth.another-production.example");
    const { t } = await setup();
    await expect(
      t
        .withIdentity({ subject: "user_owner", email: "owner+clerk_test@example.com" })
        .mutation(api.testing.grantAdminRole, {}),
    ).rejects.toThrow();
    vi.unstubAllEnvs();
  });
});
