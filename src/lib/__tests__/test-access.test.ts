import { afterEach, describe, expect, it, vi } from "vitest";
import type { MutationCtx } from "@/convex/_generated/server";
import { requireTestAccess } from "@/convex/shared/testAccess";

const context = (email: string): MutationCtx =>
  ({
    auth: { getUserIdentity: async () => ({ email }) },
  }) as unknown as MutationCtx;

afterEach(() => vi.unstubAllEnvs());

describe("test administration access", () => {
  it("is disabled by default even for a test-looking email", async () => {
    vi.stubEnv("ENABLE_TEST_FUNCTIONS", "");
    await expect(requireTestAccess(context("attacker+clerk_test@example.com"))).rejects.toThrow(
      "disabled",
    );
  });

  it("cannot run in a production environment", async () => {
    vi.stubEnv("ENABLE_TEST_FUNCTIONS", "true");
    vi.stubEnv("DEPLOYMENT_ENVIRONMENT", "production");
    await expect(requireTestAccess(context("test@example.com"))).rejects.toThrow("disabled");
  });

  it("requires an exact allowlist match", async () => {
    vi.stubEnv("ENABLE_TEST_FUNCTIONS", "true");
    vi.stubEnv("DEPLOYMENT_ENVIRONMENT", "test");
    vi.stubEnv("TEST_FUNCTION_ALLOWED_EMAILS", "test+clerk_test@example.com");
    await expect(requireTestAccess(context("attacker+clerk_test@example.com"))).rejects.toThrow(
      "explicitly allowed",
    );
    await expect(
      requireTestAccess(context("test+clerk_test@example.com")),
    ).resolves.toBeUndefined();
  });
});
