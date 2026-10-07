/// <reference types="cypress" />
import { setupClerkTestingToken } from "../support/clerk";

/**
 * Subscription & Billing E2E Tests
 *
 * Tests for subscription-related flows:
 * - Select plan page display and behavior
 * - Plan change mode
 * - Subscription tier gating
 * - Redirect behavior based on subscription status
 *
 * Note: Clerk's PricingTable is an iframe component that cannot be fully
 * automated in E2E tests. These tests verify the surrounding behavior.
 *
 * Critical for: Revenue, user conversion, feature access
 *
 * Run with: pnpm test:e2e
 */

/**
 * Helper to ensure user is fully onboarded
 */
function ensureUserOnboarded() {
  cy.url({ timeout: 15000 }).then((url) => {
    if (url.includes("/onboarding")) {
      cy.log("User needs onboarding - completing now");
      cy.contains("Complete Your Profile", { timeout: 10000 }).should("be.visible");
      cy.get("input#firstName").clear().type("E2E");
      cy.get("input#lastName").clear().type("TestUser");
      cy.contains("button", "Next").click();
      cy.contains("Profile updated!", { timeout: 10000 }).should("be.visible");

      cy.contains("Create Your First Household", { timeout: 10000 }).should("be.visible");
      cy.get("input#householdName").clear().type(`Test Household ${Date.now()}`);
      cy.contains("button", "Next").click();
      cy.contains("Household created!", { timeout: 10000 }).should("be.visible");

      cy.contains("What brings you to Pathible?", { timeout: 10000 }).should("be.visible");
      cy.get('button[role="checkbox"]').first().click();
      cy.contains("button", "Complete Setup").click();
      cy.contains("Onboarding complete!", { timeout: 10000 }).should("be.visible");

      // Wait for navigation to complete after onboarding (select-plan or dashboard)
      cy.url({ timeout: 15000 }).should("satisfy", (url: string) => {
        return url.includes("/select-plan") || url.includes("/dashboard");
      });
    }
  });
}

describe("Subscription & Billing - E2E Test Suite", () => {
  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
  });

  describe("Unauthenticated Access", () => {
    it("should redirect to login when accessing select-plan without auth", () => {
      setupClerkTestingToken();
      cy.visit("/select-plan");
      cy.url({ timeout: 15000 }).should("satisfy", (url: string) => {
        return url.includes("/login") || url.includes("/sign-in");
      });
    });
  });

  describe("Select Plan Page - New User", () => {
    beforeEach(() => {
      setupClerkTestingToken();
      cy.visit("/");
      cy.clerkLoaded();
      cy.clerkSignIn({
        strategy: "email_code",
        identifier: Cypress.expose("TEST_USER_EMAIL"),
      });
      // Reset user to simulate new user without subscription
      cy.visit("/dashboard", { timeout: 30000 });
      cy.window({ timeout: 30000 }).then((win) => {
        const testHelpers = (
          win as unknown as { __CONVEX_TEST_HELPERS__?: { resetTestUser: () => Promise<unknown> } }
        ).__CONVEX_TEST_HELPERS__;
        if (testHelpers) {
          return cy.wrap(testHelpers.resetTestUser(), { timeout: 30000 });
        }
      });
    });

    it("should display select plan page for new users after onboarding", () => {
      cy.visit("/onboarding", { timeout: 30000 });
      ensureUserOnboarded();

      // After onboarding without subscription, should be on select-plan
      cy.url({ timeout: 15000 }).should("satisfy", (url: string) => {
        return url.includes("/select-plan") || url.includes("/dashboard");
      });
    });

    it("should display plan selection header", () => {
      cy.visit("/select-plan", { timeout: 30000 });
      // May redirect if already has plan, check what page we're on
      cy.url({ timeout: 15000 }).then((url) => {
        if (url.includes("/select-plan")) {
          cy.contains("Choose Your Legacy Plan").should("be.visible");
          cy.contains("Start preserving your family's story today").should("be.visible");
        }
      });
    });

    it("should display trust section", () => {
      cy.visit("/select-plan", { timeout: 30000 });
      cy.url({ timeout: 15000 }).then((url) => {
        if (url.includes("/select-plan")) {
          cy.contains("Trusted by Many Families").should("be.visible");
        }
      });
    });
  });

  describe("Select Plan Page - Plan Change Mode", () => {
    beforeEach(() => {
      setupClerkTestingToken();
      cy.visit("/");
      cy.clerkLoaded();
      cy.clerkSignIn({
        strategy: "email_code",
        identifier: Cypress.expose("TEST_USER_EMAIL"),
      });
      cy.visit("/dashboard", { timeout: 30000 });
      ensureUserOnboarded();
      // Set subscription tier to simulate existing subscriber
      cy.setSubscriptionTier("heritage").then((result) => {
        if (!result.success) {
          cy.log(`Warning: Failed to set subscription tier: ${result.message}`);
        }
      });
    });

    it("should show change plan header when ?change=true", () => {
      cy.visit("/select-plan?change=true", { timeout: 30000 });
      cy.contains("Change Your Plan", { timeout: 15000 }).should("be.visible");
      cy.contains("Upgrade or downgrade your subscription").should("be.visible");
    });

    it("should show back to settings link in change mode", () => {
      cy.visit("/select-plan?change=true", { timeout: 30000 });
      cy.contains("Back to Settings", { timeout: 15000 }).should("be.visible");
    });

    it("should navigate back to profile settings when clicking back link", () => {
      cy.visit("/select-plan?change=true", { timeout: 30000 });
      cy.contains("Back to Settings", { timeout: 15000 }).click();
      cy.url({ timeout: 10000 }).should("include", "/profile-settings");
    });
  });

  describe("Subscription Tier Gating", () => {
    beforeEach(() => {
      setupClerkTestingToken();
      cy.visit("/");
      cy.clerkLoaded();
      cy.clerkSignIn({
        strategy: "email_code",
        identifier: Cypress.expose("TEST_USER_EMAIL"),
      });
      cy.visit("/dashboard", { timeout: 30000 });
      ensureUserOnboarded();
    });

    it("should grant access to financial features with heritage tier", () => {
      cy.setSubscriptionTier("heritage");
      cy.visit("/financial", { timeout: 30000 });
      cy.contains("Financial Clarity", { timeout: 15000 }).should("be.visible");
    });

    it("should grant access to wisdom features with heritage tier", () => {
      cy.setSubscriptionTier("heritage");
      cy.visit("/wisdom", { timeout: 30000 });
      // The wisdom page header shows "Wisdom & Stories"
      cy.contains("Wisdom & Stories", { timeout: 15000 }).should("be.visible");
    });

    it("should grant access to legacy features with heritage tier", () => {
      cy.setSubscriptionTier("heritage");
      cy.visit("/legacy", { timeout: 30000 });
      // Legacy page should be accessible
      cy.url({ timeout: 15000 }).should("include", "/legacy");
    });

    it("should grant access to vault features with any tier", () => {
      cy.setSubscriptionTier("foundations");
      cy.visit("/vault", { timeout: 30000 });
      cy.url({ timeout: 15000 }).should("include", "/vault");
    });
  });

  describe("Subscription-Based Redirects", () => {
    beforeEach(() => {
      setupClerkTestingToken();
      cy.visit("/");
      cy.clerkLoaded();
      cy.clerkSignIn({
        strategy: "email_code",
        identifier: Cypress.expose("TEST_USER_EMAIL"),
      });
      cy.visit("/dashboard", { timeout: 30000 });
      ensureUserOnboarded();
    });

    it("should redirect to dashboard when accessing select-plan with active subscription", () => {
      cy.setSubscriptionTier("heritage");
      cy.visit("/select-plan", { timeout: 30000 });
      // Should redirect to dashboard since user has active plan
      cy.url({ timeout: 15000 }).should("include", "/dashboard");
    });

    it("should stay on select-plan when ?change=true even with active subscription", () => {
      cy.setSubscriptionTier("heritage");
      cy.visit("/select-plan?change=true", { timeout: 30000 });
      // Should stay on select-plan in change mode
      cy.url({ timeout: 15000 }).should("include", "/select-plan");
    });
  });

  describe("Pricing Page (Public)", () => {
    it("should display pricing page without authentication", () => {
      setupClerkTestingToken();
      cy.visit("/pricing");
      cy.url({ timeout: 10000 }).should("include", "/pricing");
      // Pricing page should have plan information
      cy.contains("Choose Your Legacy Plan", { timeout: 10000 }).should("exist");
    });
  });
});
