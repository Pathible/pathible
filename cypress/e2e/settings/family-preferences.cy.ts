/// <reference types="cypress" />
import { setupClerkTestingToken } from "../../support/clerk";

/**
 * Family Preferences E2E Tests
 *
 * Tests for the family preferences page including:
 * - Displaying current household information
 * - Updating household name
 * - Notification preferences
 *
 * Uses Clerk testing tokens for automated authentication.
 *
 * Run with: pnpm test:e2e
 */

/**
 * Helper to ensure user is fully onboarded before accessing settings
 */
function ensureUserOnboarded() {
  cy.url({ timeout: 15000 }).then((url) => {
    if (url.includes("/onboarding")) {
      cy.log("User needs onboarding - completing now");
      // Complete profile step
      cy.contains("Complete Your Profile", { timeout: 10000 }).should("be.visible");
      cy.get("input#firstName").clear().type("E2E");
      cy.get("input#lastName").clear().type("TestUser");
      cy.contains("button", "Next").click();
      cy.contains("Profile updated!", { timeout: 10000 }).should("be.visible");

      // Complete household step
      cy.contains("Create Your First Household", { timeout: 10000 }).should("be.visible");
      cy.get("input#householdName").clear().type(`Test Household ${Date.now()}`);
      cy.contains("button", "Next").click();
      cy.contains("Household created!", { timeout: 10000 }).should("be.visible");

      // Complete goals step
      cy.contains("What brings you to Pathible?", { timeout: 10000 }).should("be.visible");
      cy.get('button[role="checkbox"]').first().click();
      cy.contains("button", "Complete Setup").click();
      cy.contains("Onboarding complete!", { timeout: 10000 }).should("be.visible");

      // Wait for redirect
      cy.wait(1000);

      // Navigate to family preferences
      cy.visit("/family-preferences", { timeout: 30000 });
    } else if (url.includes("/select-plan")) {
      cy.log("User on select-plan - navigating to settings");
      cy.visit("/family-preferences", { timeout: 30000 });
    }
  });

  // Set subscription tier for feature access
  cy.setSubscriptionTier("heritage").then((result) => {
    if (!result.success) {
      cy.log(`Warning: Failed to set subscription tier: ${result.message}`);
    }
  });
}

describe("Family Preferences - E2E Test Suite", () => {
  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
  });

  describe("Unauthenticated Access", () => {
    it("should redirect to login when accessing family preferences without auth", () => {
      setupClerkTestingToken();
      cy.visit("/family-preferences");
      cy.url({ timeout: 10000 }).should("include", "/sign-in");
    });
  });

  describe("Family Preferences Display", () => {
    beforeEach(() => {
      setupClerkTestingToken();
      cy.visit("/");
      cy.clerkLoaded();
      cy.clerkSignIn({
        strategy: "email_code",
        identifier: Cypress.expose("TEST_USER_EMAIL"),
      });
      cy.visit("/family-preferences", { timeout: 30000 });
      ensureUserOnboarded();
      cy.contains("Family Preferences", { timeout: 15000 }).should("be.visible");
    });

    it("should display family preferences page header", () => {
      cy.contains("Family Preferences").should("be.visible");
      cy.contains("Manage your immediate family unit settings").should("be.visible");
    });

    it("should display family information card", () => {
      cy.contains("Family Information").should("be.visible");
    });

    it("should display notification preferences card", () => {
      cy.contains("Notification Preferences").should("be.visible");
    });
  });

  describe("Family Information Updates", () => {
    beforeEach(() => {
      setupClerkTestingToken();
      cy.visit("/");
      cy.clerkLoaded();
      cy.clerkSignIn({
        strategy: "email_code",
        identifier: Cypress.expose("TEST_USER_EMAIL"),
      });
      cy.visit("/family-preferences", { timeout: 30000 });
      ensureUserOnboarded();
      cy.contains("Family Preferences", { timeout: 15000 }).should("be.visible");
    });

    it("should show family name input field", () => {
      // Family Information has inline form with Family Name input
      cy.contains("Family Name").should("be.visible");
      cy.get("input#name").should("exist");
    });

    it("should show description field in family information", () => {
      // Family Information has Description textarea
      cy.contains("Description").should("be.visible");
      cy.get("textarea#description").should("exist");
    });

    it("should show save button for family information", () => {
      // Family Information has inline form with Save Changes button
      cy.contains("button", "Save Changes").should("be.visible");
    });

    it("should update household name inline", () => {
      // Update family name in inline form
      const newName = `Updated Family ${Date.now()}`;
      cy.get("input#name").clear().type(newName);

      // Save changes
      cy.contains("button", "Save Changes").click();

      // Verify success
      cy.contains("updated", { timeout: 10000, matchCase: false }).should("be.visible");
    });
  });

  describe("Notification Preferences", () => {
    beforeEach(() => {
      setupClerkTestingToken();
      cy.visit("/");
      cy.clerkLoaded();
      cy.clerkSignIn({
        strategy: "email_code",
        identifier: Cypress.expose("TEST_USER_EMAIL"),
      });
      cy.visit("/family-preferences", { timeout: 30000 });
      ensureUserOnboarded();
      cy.contains("Family Preferences", { timeout: 15000 }).should("be.visible");
    });

    it("should display notification preferences section", () => {
      cy.contains("Notification Preferences").should("be.visible");
    });

    it("should show weekly activity digest toggle", () => {
      // Notification Preferences has a Switch component with Weekly Activity Digest label
      cy.contains("Weekly Activity Digest").should("be.visible");
      // Switch component renders as button with role="switch"
      cy.get('#weeklyNotifications[role="switch"]').should("exist");
    });
  });
});
