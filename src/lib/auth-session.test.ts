import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ query: vi.fn(), action: vi.fn(), auth: vi.fn() }));
vi.mock("@clerk/nextjs/server", () => ({ auth: mocks.auth, currentUser: vi.fn() }));
vi.mock("convex/browser", () => ({
  ConvexHttpClient: class {
    setAuth() {}
    query = mocks.query;
    action = mocks.action;
  },
}));

import { getHasActiveSubscription } from "./auth-session";

describe("planning access overrides", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.stubEnv("NEXT_PUBLIC_CONVEX_URL", "https://test.convex.cloud");
    mocks.auth.mockResolvedValue({ userId: "user_test", getToken: async () => "test_token" });
    mocks.action.mockRejectedValue(new Error("Clerk billing unavailable"));
  });

  it("honors a verified override without reconciling legacy billing", async () => {
    mocks.query.mockResolvedValue({ hasOverride: true, subscriptionStatus: "inactive" });
    expect(await getHasActiveSubscription()).toBe(true);
    expect(mocks.action).not.toHaveBeenCalled();
  });

  it("still reconciles accounts without a valid override and fails closed", async () => {
    mocks.query.mockResolvedValue({ hasOverride: false, subscriptionStatus: "inactive" });
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    try {
      expect(await getHasActiveSubscription()).toBe(false);
      expect(mocks.action).toHaveBeenCalledOnce();
    } finally {
      log.mockRestore();
    }
  });

  it("does not grant an override without an authenticated identity", async () => {
    mocks.auth.mockResolvedValue({ userId: null });
    mocks.query.mockResolvedValue({ hasOverride: true });
    expect(await getHasActiveSubscription()).toBe(false);
    expect(mocks.query).not.toHaveBeenCalled();
  });
});
