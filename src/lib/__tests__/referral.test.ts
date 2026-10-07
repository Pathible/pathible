import { describe, expect, it } from "vitest";
import { normalizeReferralSource, referralRedirect } from "../referral";

describe("partner attribution", () => {
  it("carries a partner from signup to onboarding", () => {
    expect(referralRedirect("/onboarding", "attorney-smith")).toBe(
      "/onboarding?ref=attorney-smith",
    );
  });

  it("rejects arbitrary redirect URLs and malformed attribution", () => {
    expect(normalizeReferralSource("https://attacker.example")).toBeUndefined();
    expect(normalizeReferralSource("x".repeat(101))).toBeUndefined();
    expect(referralRedirect("/onboarding", "<script>")).toBe("/onboarding");
  });

  it("keeps valid attribution stable", () => {
    expect(normalizeReferralSource(" cfr_2026 ")).toBe("cfr_2026");
  });
});
