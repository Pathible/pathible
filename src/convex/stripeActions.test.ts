/// <reference types="vite/client" />

import { convexTest } from "convex-test";
import { Webhook } from "svix";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { api, internal } from "./_generated/api";
import schema from "./schema";

const stripe = vi.hoisted(() => ({
  customers: { create: vi.fn(), retrieve: vi.fn() },
  subscriptions: { list: vi.fn(), retrieve: vi.fn() },
  checkout: { sessions: { create: vi.fn(), retrieve: vi.fn() } },
  billingPortal: { sessions: { create: vi.fn() } },
  events: { retrieve: vi.fn() },
  invoices: { retrieve: vi.fn() },
  charges: { retrieve: vi.fn() },
}));
const clerkSubscription = vi.hoisted(() => vi.fn());
vi.mock("stripe", () => ({
  default: class {
    customers = stripe.customers;
    subscriptions = stripe.subscriptions;
    checkout = stripe.checkout;
    billingPortal = stripe.billingPortal;
    events = stripe.events;
    invoices = stripe.invoices;
    charges = stripe.charges;
  },
}));
vi.mock("@clerk/backend", () => ({
  createClerkClient: () => ({ billing: { getUserBillingSubscription: clerkSubscription } }),
}));
const modules = import.meta.glob("./**/*.ts");

async function setup(provider: "stripe" | "clerk" | undefined = "stripe") {
  const t = convexTest(schema, modules);
  const householdId = await t.run(async (ctx) => {
    const profileId = await ctx.db.insert("profiles", {
      userId: "user_test",
      firstName: "Test",
      lastName: "Owner",
      updatedAt: 1,
    });
    const id = await ctx.db.insert("households", {
      name: "Test",
      primaryContactId: profileId,
      subscriptionTier: "foundations",
      subscriptionStatus: "inactive",
      billingProvider: provider,
      stripeCustomerId: "cus_test",
      updatedAt: 1,
    });
    await ctx.db.insert("householdMemberships", {
      householdId: id,
      userId: profileId,
      role: "owner",
      status: "active",
    });
    return id;
  });
  stripe.customers.retrieve.mockResolvedValue({ id: "cus_test", metadata: { householdId } });
  return { t, householdId, user: t.withIdentity({ subject: "user_test" }) };
}
beforeEach(() => {
  vi.resetAllMocks();
  vi.stubEnv("STRIPE_SECRET_KEY", "test_key");
  vi.stubEnv("CLERK_SECRET_KEY", "test_key");
  vi.stubEnv("STRIPE_PRICE_FOUNDATIONS", "price_foundations");
  vi.stubEnv("STRIPE_PRICE_HERITAGE", "price_heritage");
  vi.stubEnv("STRIPE_PRICE_FOUNDERS", "price_private");
  vi.stubEnv("STRIPE_PRICE_EXECUTOR", "price_executor");
  stripe.subscriptions.list.mockResolvedValue({ data: [] });
  stripe.checkout.sessions.create.mockResolvedValue({ url: "https://checkout.stripe.com/test" });
  stripe.billingPortal.sessions.create.mockResolvedValue({
    url: "https://billing.stripe.com/test",
  });
  clerkSubscription.mockResolvedValue({ subscriptionItems: [] });
});

describe("Stripe checkout and current-state fulfillment", () => {
  it("rejects unsupported product, mode, private plan, and redirect origin", async () => {
    const { user } = await setup();
    for (const input of [
      { priceId: "price_executor", mode: "subscription" as const, origin: "http://localhost:3000" },
      { priceId: "price_foundations", mode: "payment" as const, origin: "http://localhost:3000" },
      { priceId: "price_private", mode: "subscription" as const, origin: "http://localhost:3000" },
      {
        priceId: "price_foundations",
        mode: "subscription" as const,
        origin: "https://attacker.example",
      },
    ])
      await expect(user.action(api.stripeActions.createCheckout, input)).rejects.toThrow();
    expect(stripe.checkout.sessions.create).not.toHaveBeenCalled();
  });
  it("reserves one stable checkout attempt and does not reissue trials", async () => {
    const { user } = await setup();
    const args = {
      priceId: "price_foundations",
      mode: "subscription" as const,
      origin: "http://localhost:3000",
    };
    await user.action(api.stripeActions.createCheckout, args);
    await user.action(api.stripeActions.createCheckout, args);
    const calls = stripe.checkout.sessions.create.mock.calls;
    expect(calls[0]).toEqual(calls[1]);
    expect(calls[0][0].subscription_data).not.toHaveProperty("trial_period_days");
    expect(calls[0][0].customer_update).toEqual({ address: "auto", name: "auto" });
  });
  it("plan changes update the existing subscription through portal confirmation", async () => {
    const { user } = await setup();
    stripe.subscriptions.list.mockResolvedValue({
      data: [
        {
          id: "sub_existing",
          status: "active",
          items: { data: [{ id: "si_test", price: { id: "price_foundations" }, quantity: 1 }] },
        },
      ],
    });
    await user.action(api.stripeActions.createCheckout, {
      priceId: "price_heritage",
      mode: "subscription",
      origin: "http://localhost:3000",
    });
    expect(stripe.checkout.sessions.create).not.toHaveBeenCalled();
    expect(stripe.billingPortal.sessions.create.mock.calls[0][0]).toMatchObject({
      customer: "cus_test",
      flow_data: {
        type: "subscription_update_confirm",
        subscription_update_confirm: { subscription: "sub_existing" },
      },
    });
  });
  it("never starts Stripe subscription checkout for an existing Clerk payer", async () => {
    const { user } = await setup("clerk");
    await expect(
      user.action(api.stripeActions.createCheckout, {
        priceId: "price_foundations",
        mode: "subscription",
        origin: "http://localhost:3000",
      }),
    ).rejects.toThrow(/Clerk/);
    expect(stripe.checkout.sessions.create).not.toHaveBeenCalled();
  });
  it("modern invoice events reconcile current subscription state, not invoice status", async () => {
    const { t, householdId } = await setup();
    stripe.events.retrieve.mockResolvedValue({
      id: "evt_invoice",
      type: "invoice.paid",
      created: 1,
      data: { object: { id: "in_test" } },
    });
    stripe.invoices.retrieve.mockResolvedValue({
      parent: { subscription_details: { subscription: "sub_test" } },
    });
    stripe.subscriptions.retrieve.mockResolvedValue({
      id: "sub_test",
      customer: "cus_test",
      status: "canceled",
      items: { data: [{ price: { id: "price_foundations" } }] },
      metadata: {},
    });
    await t.action(internal.stripeActions.processEvent, { eventId: "evt_invoice" });
    expect(await t.run((ctx) => ctx.db.get(householdId))).toMatchObject({
      subscriptionStatus: "cancelled",
    });
  });
  it("unpaid completed checkouts do not grant Executor", async () => {
    const { t, householdId } = await setup();
    stripe.events.retrieve.mockResolvedValue({
      id: "evt_unpaid",
      type: "checkout.session.completed",
      data: { object: { id: "cs_test" } },
    });
    stripe.checkout.sessions.retrieve.mockResolvedValue({
      mode: "payment",
      payment_status: "unpaid",
    });
    await t.action(internal.stripeActions.processEvent, { eventId: "evt_unpaid" });
    expect((await t.run((ctx) => ctx.db.get(householdId)))?.executorPurchased).not.toBe(true);
  });
  it("unverified synthetic active legacy rows do not grant paid access", async () => {
    const { t, user, householdId } = await setup();
    await t.run((ctx) =>
      ctx.db.patch(householdId, { billingProvider: undefined, subscriptionStatus: "active" }),
    );
    expect(await user.query(api.auth.getEffectiveSubscription, {})).toMatchObject({
      subscriptionStatus: "inactive",
    });
    await user.action(api.stripeActions.reconcileLegacy, {});
    expect(await t.run((ctx) => ctx.db.get(householdId))).toMatchObject({
      subscriptionStatus: "inactive",
      billingProvider: "stripe",
    });
  });
  it("verifies legacy paid coverage and keeps its management with Clerk", async () => {
    const { t, user, householdId } = await setup();
    await t.run((ctx) => ctx.db.patch(householdId, { billingProvider: undefined }));
    clerkSubscription.mockResolvedValue({
      subscriptionItems: [{ status: "active", plan: { slug: "heritage" } }],
    });
    await user.action(api.stripeActions.reconcileLegacy, {});
    expect(await t.run((ctx) => ctx.db.get(householdId))).toMatchObject({
      subscriptionTier: "heritage",
      subscriptionStatus: "active",
      billingProvider: "clerk",
    });
  });
  it("refuses live cutover while old paid coverage remains", async () => {
    const { t, householdId } = await setup("clerk");
    clerkSubscription.mockResolvedValue({
      subscriptionItems: [
        { status: "canceled", periodEnd: Date.now() + 100000, plan: { slug: "heritage" } },
      ],
    });
    await expect(
      t.action(internal.stripeActions.finishClerkCutover, { householdId, approvedBy: "admin" }),
    ).rejects.toThrow(/Clerk still/);
  });
});

describe("Executor refund identity and replay protection", () => {
  it("a full refund before fulfillment cannot be undone by checkout replay", async () => {
    const { t, user, householdId } = await setup();
    const { attemptId } = await user.mutation(internal.stripe.reserveCheckout, {
      householdId,
      mode: "payment",
      priceId: "price_executor",
    });
    await t.mutation(internal.stripe.applyExecutorRefund, {
      eventId: "evt_refund",
      stripeCustomerId: "cus_test",
      paymentIntentId: "pi_executor",
      chargeId: "ch_executor",
      fullyRefunded: true,
    });
    await t.mutation(internal.stripe.applyExecutorPayment, {
      eventId: "evt_paid",
      householdId,
      billingAttemptId: attemptId,
      stripeCustomerId: "cus_test",
      paymentIntentId: "pi_executor",
      chargeId: "ch_executor",
      priceId: "price_executor",
      paid: true,
      fullyRefunded: false,
    });
    expect(await t.run((ctx) => ctx.db.get(householdId))).toMatchObject({
      executorPurchased: false,
    });
  });
  it("partial refunds and refunds for other charges do not revoke the current purchase", async () => {
    const { t, householdId } = await setup();
    await t.run((ctx) =>
      ctx.db.patch(householdId, {
        executorPurchased: true,
        executorPaymentIntentId: "pi_current",
        executorChargeId: "ch_current",
      }),
    );
    await t.mutation(internal.stripe.applyExecutorRefund, {
      eventId: "evt_other",
      stripeCustomerId: "cus_test",
      paymentIntentId: "pi_old",
      chargeId: "ch_old",
      fullyRefunded: true,
    });
    await t.mutation(internal.stripe.applyExecutorRefund, {
      eventId: "evt_partial",
      stripeCustomerId: "cus_test",
      paymentIntentId: "pi_current",
      chargeId: "ch_current",
      fullyRefunded: false,
    });
    expect(await t.run((ctx) => ctx.db.get(householdId))).toMatchObject({
      executorPurchased: true,
    });
  });
});

describe("Clerk webhook verification and current billing", () => {
  it("rejects invalid signatures", async () => {
    const { t } = await setup("clerk");
    vi.stubEnv(
      "CLERK_WEBHOOK_SECRET",
      "whsec_" + Buffer.from("unit-test-signing-key").toString("base64"),
    );
    expect(
      await t.action(internal.stripeActions.processClerkWebhook, {
        body: "{}",
        svixId: "msg_test",
        svixTimestamp: String(Math.floor(Date.now() / 1000)),
        svixSignature: "invalid",
      }),
    ).toBe(400);
    expect(clerkSubscription).not.toHaveBeenCalled();
  });
  it("uses payer user identity and ignores stale or forged plan metadata", async () => {
    const { t, householdId } = await setup("clerk");
    const secret = "whsec_" + Buffer.from("unit-test-signing-key").toString("base64");
    vi.stubEnv("CLERK_WEBHOOK_SECRET", secret);
    const body = JSON.stringify({
      type: "subscription.updated",
      data: {
        id: "sub_not_a_user",
        status: "active",
        plan: "founders",
        payer: { user_id: "user_test" },
      },
    });
    const now = new Date();
    const signature = new Webhook(secret).sign("msg_test", now, body);
    clerkSubscription.mockResolvedValue({
      subscriptionItems: [{ status: "active", plan: { slug: "heritage" } }],
    });
    expect(
      await t.action(internal.stripeActions.processClerkWebhook, {
        body,
        svixId: "msg_test",
        svixTimestamp: String(Math.floor(now.getTime() / 1000)),
        svixSignature: signature,
      }),
    ).toBe(200);
    expect(clerkSubscription).toHaveBeenCalledWith("user_test");
    expect(await t.run((ctx) => ctx.db.get(householdId))).toMatchObject({
      subscriptionTier: "heritage",
      billingProvider: "clerk",
    });
  });
});
