import { afterEach, describe, expect, it, vi } from "vitest";
import { unsubscribe } from "@/convex/emailPreferences";
import { markProcessing } from "@/convex/emailQueue";
import { checkShareRateLimit, consumeShareDownload } from "@/convex/estateDocuments";

// Exercise the registered mutation handlers with a small database double.
function run(handler: unknown, ctx: unknown, args: unknown): Promise<unknown> {
  return (handler as { _handler: (ctx: unknown, args: unknown) => Promise<unknown> })._handler(
    ctx,
    args,
  );
}
afterEach(() => vi.useRealTimers());

describe("maintenance mutation enforcement", () => {
  it("suppresses previously queued campaign emails after opt-out without retrying", async () => {
    const patch = vi.fn();
    const schedule = vi.fn();
    const ctx = {
      db: {
        get: async () => ({
          status: "queued",
          campaignId: "campaign",
          recipientContext: { profileId: "profile" },
          maxAttempts: 3,
        }),
        query: (table: string) => ({
          withIndex: () => ({
            first: async () => ({ emailNotifications: false }),
            unique: async () =>
              table === "emailCampaigns" ? { _id: "campaign-record", failedCount: 0 } : null,
          }),
        }),
        patch,
      },
      scheduler: { runAfter: schedule },
    };
    expect(await run(markProcessing, ctx, { emailId: "email" })).toBe(false);
    expect(patch).toHaveBeenCalledWith(
      "email",
      expect.objectContaining({
        status: "failed",
        attempts: 3,
        errorMessage: expect.stringContaining("opted out"),
      }),
    );
    expect(schedule).toHaveBeenCalledOnce();
  });

  it("keeps transactional account emails independent of optional campaign preferences", async () => {
    const patch = vi.fn();
    expect(
      await run(
        markProcessing,
        { db: { get: async () => ({ status: "queued" }), patch } },
        { emailId: "email" },
      ),
    ).toBe(true);
    expect(patch).toHaveBeenCalledWith("email", expect.objectContaining({ status: "processing" }));
  });

  it("shares a five-request limit across callers and resets after one minute", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(100000);
    const share = { _id: "share", requestWindowStartedAt: 0, requestCount: 0 };
    const ctx = {
      db: {
        query: () => ({ withIndex: () => ({ unique: async () => share }) }),
        patch: async (_id: string, fields: object) => {
          Object.assign(share, fields);
        },
      },
    };
    for (let i = 0; i < 5; i++)
      expect(await run(checkShareRateLimit, ctx, { token: "token" })).toBe(true);
    expect(await run(checkShareRateLimit, ctx, { token: "token" })).toBe(false);
    vi.advanceTimersByTime(60000);
    expect(await run(checkShareRateLimit, ctx, { token: "token" })).toBe(true);
  });

  it("does not create throttle records for arbitrary invalid tokens", async () => {
    const patch = vi.fn();
    expect(
      await run(
        checkShareRateLimit,
        { db: { query: () => ({ withIndex: () => ({ unique: async () => null }) }), patch } },
        { token: "random" },
      ),
    ).toBe(true);
    expect(patch).not.toHaveBeenCalled();
  });

  it("refuses a download when its limit is already exhausted", async () => {
    const patch = vi.fn();
    const share = {
      status: "active",
      expiresAt: Date.now() + 10000,
      downloadCount: 1,
      maxDownloads: 1,
    };
    expect(
      await run(
        consumeShareDownload,
        { db: { query: () => ({ withIndex: () => ({ unique: async () => share }) }), patch } },
        { token: "token", verifiedEmails: ["recipient@example.com"] },
      ),
    ).toBe(false);
    expect(patch).not.toHaveBeenCalled();
  });

  it("rejects unknown unsubscribe tokens and updates only the token's profile", async () => {
    const patch = vi.fn();
    const token = "a".repeat(64);
    const missing = { db: { query: () => ({ withIndex: () => ({ unique: async () => null }) }) } };
    await expect(run(unsubscribe, missing, { token })).rejects.toThrow("Invalid unsubscribe link");
    const ctx = {
      db: {
        query: () => ({
          withIndex: () => ({
            unique: async () => ({ profileId: "profile" }),
            first: async () => ({ _id: "preferences" }),
          }),
        }),
        patch,
      },
    };
    expect(await run(unsubscribe, ctx, { token })).toBeNull();
    expect(patch).toHaveBeenCalledWith(
      "preferences",
      expect.objectContaining({ emailNotifications: false }),
    );
  });
});
