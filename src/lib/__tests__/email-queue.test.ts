import { describe, expect, it } from "vitest";
import {
  calculateBatchScheduleTimes,
  calculateRetryDelay,
  generateVaultEmptyEmailHtml,
  isEligibleForVaultEmptyEmail,
  RATE_LIMIT_DELAY_MS,
  RETRY_DELAYS_MS,
  shouldRetryEmail,
  type VaultEmptyRecipientCriteria,
} from "../email-utils";

describe("Email Queue Utilities", () => {
  describe("calculateBatchScheduleTimes", () => {
    it("returns empty array for zero emails", () => {
      const times = calculateBatchScheduleTimes(0, 1000);
      expect(times).toEqual([]);
    });

    it("returns single time for one email", () => {
      const startTime = 1000;
      const times = calculateBatchScheduleTimes(1, startTime);
      expect(times).toEqual([1000]);
    });

    it("staggers emails 500ms apart", () => {
      const startTime = 1000;
      const times = calculateBatchScheduleTimes(5, startTime);

      expect(times).toHaveLength(5);
      expect(times[0]).toBe(1000);
      expect(times[1]).toBe(1500);
      expect(times[2]).toBe(2000);
      expect(times[3]).toBe(2500);
      expect(times[4]).toBe(3000);
    });

    it("respects rate limit of 2 emails per second", () => {
      const startTime = 0;
      const times = calculateBatchScheduleTimes(10, startTime);

      // 10 emails should take 4.5 seconds (500ms * 9 intervals)
      const totalDuration = times[times.length - 1] - times[0];
      expect(totalDuration).toBe(4500);

      // Each interval should be 500ms
      for (let i = 1; i < times.length; i++) {
        expect(times[i] - times[i - 1]).toBe(RATE_LIMIT_DELAY_MS);
      }
    });

    it("handles large batches correctly", () => {
      const startTime = 0;
      const times = calculateBatchScheduleTimes(100, startTime);

      expect(times).toHaveLength(100);
      expect(times[99]).toBe(99 * 500); // Last email at 49.5 seconds
    });
  });

  describe("calculateRetryDelay", () => {
    it("returns 1 minute for first retry", () => {
      expect(calculateRetryDelay(1)).toBe(RETRY_DELAYS_MS[0]);
      expect(calculateRetryDelay(1)).toBe(60_000);
    });

    it("returns 5 minutes for second retry", () => {
      expect(calculateRetryDelay(2)).toBe(RETRY_DELAYS_MS[1]);
      expect(calculateRetryDelay(2)).toBe(300_000);
    });

    it("returns 15 minutes for third retry", () => {
      expect(calculateRetryDelay(3)).toBe(RETRY_DELAYS_MS[2]);
      expect(calculateRetryDelay(3)).toBe(900_000);
    });

    it("caps at maximum delay for attempts beyond array length", () => {
      expect(calculateRetryDelay(4)).toBe(RETRY_DELAYS_MS[2]);
      expect(calculateRetryDelay(10)).toBe(RETRY_DELAYS_MS[2]);
      expect(calculateRetryDelay(100)).toBe(RETRY_DELAYS_MS[2]);
    });

    it("handles edge case of attempt 0", () => {
      // Should return first delay (index clamped to 0)
      expect(calculateRetryDelay(0)).toBe(RETRY_DELAYS_MS[0]);
    });
  });

  describe("shouldRetryEmail", () => {
    it("returns true when attempts are less than max", () => {
      expect(shouldRetryEmail(0, 3)).toBe(true);
      expect(shouldRetryEmail(1, 3)).toBe(true);
      expect(shouldRetryEmail(2, 3)).toBe(true);
    });

    it("returns false when attempts equal max", () => {
      expect(shouldRetryEmail(3, 3)).toBe(false);
    });

    it("returns false when attempts exceed max", () => {
      expect(shouldRetryEmail(4, 3)).toBe(false);
      expect(shouldRetryEmail(10, 3)).toBe(false);
    });

    it("works with different max attempts values", () => {
      expect(shouldRetryEmail(0, 1)).toBe(true);
      expect(shouldRetryEmail(1, 1)).toBe(false);

      expect(shouldRetryEmail(4, 5)).toBe(true);
      expect(shouldRetryEmail(5, 5)).toBe(false);
    });
  });
});

describe("Vault Empty Email Template", () => {
  describe("generateVaultEmptyEmailHtml", () => {
    it("generates valid HTML with first name", () => {
      const html = generateVaultEmptyEmailHtml("John");

      expect(html).toContain("<!DOCTYPE html>");
      expect(html).toContain("Hi John,");
      expect(html).toContain("Your Heritage Vault is ready");
    });

    it("uses generic greeting when no first name provided", () => {
      const html = generateVaultEmptyEmailHtml("");

      expect(html).toContain("Hi there,");
      expect(html).not.toContain("Hi ,");
    });

    it("includes household name when provided", () => {
      const html = generateVaultEmptyEmailHtml("Jane", "Smith Family");

      expect(html).toContain("Hi Jane,");
      expect(html).toContain("You've set up the Smith Family household");
    });

    it("uses generic household mention when no household name", () => {
      const html = generateVaultEmptyEmailHtml("Jane");

      expect(html).toContain("You've set up your household");
      expect(html).not.toContain("You've set up the  household");
    });

    it("includes CTA button with correct link", () => {
      const html = generateVaultEmptyEmailHtml("Test");

      expect(html).toContain("Upload Your First Document");
      expect(html).toContain("https://www.pathible.com/vault");
    });

    it("includes benefits section", () => {
      const html = generateVaultEmptyEmailHtml("Test");

      expect(html).toContain("Why start today?");
      expect(html).toContain("Peace of mind");
      expect(html).toContain("Easy access");
      expect(html).toContain("Lasting legacy");
    });

    it("includes footer with unsubscribe link", () => {
      const html = generateVaultEmptyEmailHtml("Test");

      expect(html).toContain("Unsubscribe");
      expect(html).toContain("https://pathible.com/unsubscribe");
    });

    it("is responsive-ready with viewport meta", () => {
      const html = generateVaultEmptyEmailHtml("Test");

      expect(html).toContain('name="viewport"');
      expect(html).toContain("width=device-width");
    });
  });
});
describe("Vault Empty Recipient Eligibility", () => {
  const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000;
  const NOW = Date.now();

  const createCriteria = (
    overrides: Partial<VaultEmptyRecipientCriteria> = {},
  ): VaultEmptyRecipientCriteria => ({
    onboardingStatus: "complete",
    onboardingCompletedAt: NOW - THREE_DAYS_MS - 1000, // 3 days + 1 second ago
    email: "test@example.com",
    deletedAt: undefined,
    emailNotificationsEnabled: true,
    vaultDocumentCount: 0,
    ...overrides,
  });

  describe("isEligibleForVaultEmptyEmail", () => {
    it("returns true for eligible user", () => {
      const criteria = createCriteria();
      expect(isEligibleForVaultEmptyEmail(criteria, NOW)).toBe(true);
    });

    describe("onboarding status checks", () => {
      it("returns false when onboarding not complete", () => {
        const criteria = createCriteria({ onboardingStatus: "not_started" });
        expect(isEligibleForVaultEmptyEmail(criteria, NOW)).toBe(false);
      });

      it("returns false when onboarding is in progress", () => {
        const criteria = createCriteria({ onboardingStatus: "profile_complete" });
        expect(isEligibleForVaultEmptyEmail(criteria, NOW)).toBe(false);
      });

      it("returns true when onboarding status is complete", () => {
        const criteria = createCriteria({ onboardingStatus: "complete" });
        expect(isEligibleForVaultEmptyEmail(criteria, NOW)).toBe(true);
      });
    });

    describe("onboarding completion time checks", () => {
      it("returns false when onboardingCompletedAt is undefined", () => {
        const criteria = createCriteria({ onboardingCompletedAt: undefined });
        expect(isEligibleForVaultEmptyEmail(criteria, NOW)).toBe(false);
      });

      it("returns false when completed less than 3 days ago", () => {
        const twoDaysAgo = NOW - 2 * 24 * 60 * 60 * 1000;
        const criteria = createCriteria({ onboardingCompletedAt: twoDaysAgo });
        expect(isEligibleForVaultEmptyEmail(criteria, NOW)).toBe(false);
      });

      it("returns true when completed exactly 3 days ago (boundary case)", () => {
        const exactlyThreeDays = NOW - THREE_DAYS_MS;
        const criteria = createCriteria({ onboardingCompletedAt: exactlyThreeDays });
        // Exactly 3 days is eligible (uses > comparison, not >=)
        expect(isEligibleForVaultEmptyEmail(criteria, NOW)).toBe(true);
      });

      it("returns true when completed more than 3 days ago", () => {
        const fourDaysAgo = NOW - 4 * 24 * 60 * 60 * 1000;
        const criteria = createCriteria({ onboardingCompletedAt: fourDaysAgo });
        expect(isEligibleForVaultEmptyEmail(criteria, NOW)).toBe(true);
      });
    });

    describe("email checks", () => {
      it("returns false when email is undefined", () => {
        const criteria = createCriteria({ email: undefined });
        expect(isEligibleForVaultEmptyEmail(criteria, NOW)).toBe(false);
      });

      it("returns false when email is empty string", () => {
        const criteria = createCriteria({ email: "" });
        expect(isEligibleForVaultEmptyEmail(criteria, NOW)).toBe(false);
      });

      it("returns true when email is present", () => {
        const criteria = createCriteria({ email: "user@example.com" });
        expect(isEligibleForVaultEmptyEmail(criteria, NOW)).toBe(true);
      });
    });

    describe("deleted user checks", () => {
      it("returns false when user is deleted", () => {
        const criteria = createCriteria({ deletedAt: NOW - 1000 });
        expect(isEligibleForVaultEmptyEmail(criteria, NOW)).toBe(false);
      });

      it("returns true when deletedAt is undefined", () => {
        const criteria = createCriteria({ deletedAt: undefined });
        expect(isEligibleForVaultEmptyEmail(criteria, NOW)).toBe(true);
      });
    });

    describe("email notification preference checks", () => {
      it("returns false when email notifications disabled", () => {
        const criteria = createCriteria({ emailNotificationsEnabled: false });
        expect(isEligibleForVaultEmptyEmail(criteria, NOW)).toBe(false);
      });

      it("returns true when email notifications enabled", () => {
        const criteria = createCriteria({ emailNotificationsEnabled: true });
        expect(isEligibleForVaultEmptyEmail(criteria, NOW)).toBe(true);
      });
    });

    describe("vault document count checks", () => {
      it("returns true when vault is empty (count = 0)", () => {
        const criteria = createCriteria({ vaultDocumentCount: 0 });
        expect(isEligibleForVaultEmptyEmail(criteria, NOW)).toBe(true);
      });

      it("returns false when vault has 1 document", () => {
        const criteria = createCriteria({ vaultDocumentCount: 1 });
        expect(isEligibleForVaultEmptyEmail(criteria, NOW)).toBe(false);
      });

      it("returns false when vault has multiple documents", () => {
        const criteria = createCriteria({ vaultDocumentCount: 10 });
        expect(isEligibleForVaultEmptyEmail(criteria, NOW)).toBe(false);
      });
    });

    describe("combined criteria", () => {
      it("returns false when multiple criteria fail", () => {
        const criteria = createCriteria({
          onboardingStatus: "not_started",
          email: undefined,
          vaultDocumentCount: 5,
        });
        expect(isEligibleForVaultEmptyEmail(criteria, NOW)).toBe(false);
      });

      it("returns false when only one criterion fails", () => {
        // All criteria pass except vault has documents
        const criteria = createCriteria({ vaultDocumentCount: 1 });
        expect(isEligibleForVaultEmptyEmail(criteria, NOW)).toBe(false);
      });
    });
  });
});
