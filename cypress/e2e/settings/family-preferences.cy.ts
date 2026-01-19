/// <reference types="cypress" />
import { setupClerkTestingToken } from "@clerk/testing/cypress";

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
        identifier: Cypress.env("TEST_USER_EMAIL"),
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
        identifier: Cypress.env("TEST_USER_EMAIL"),
      });
      cy.visit("/family-preferences", { timeout: 30000 });
      ensureUserOnboarded();
      cy.contains("Family Preferences", { timeout: 15000 }).should("be.visible");
    });

    it("should show household name in family information", () => {
      // The household name appears in the Family Name input field
      cy.contains("Family Name").should("be.visible");
      cy.get('input[value*="Household"], input[value*="household"]').should("exist");
    });

    it("should show edit button for family information", () => {
      cy.contains("Family Information")
        .closest("div")
        .parent()
        .find('button:contains("Edit")')
        .should("be.visible");
    });

    it("should open edit dialog when clicking edit", () => {
      cy.contains("Family Information")
        .closest("div")
        .parent()
        .find('button:contains("Edit")')
        .click();

      // Dialog should open
      cy.get('[role="dialog"]').should("be.visible");
    });

    it("should update household name", () => {
      // Open edit dialog
      cy.contains("Family Information")
        .closest("div")
        .parent()
        .find('button:contains("Edit")')
        .click();

      cy.get('[role="dialog"]').should("be.visible");

      // Update household name
      const newName = `Updated Family ${Date.now()}`;
      cy.get('[role="dialog"]').find('input[name="name"]').clear().type(newName);

      // Save changes
      cy.get('[role="dialog"]').find('button:contains("Save")').click();

      // Verify success
      cy.contains("updated", { timeout: 10000 }).should("be.visible");
    });
  });

  describe("Notification Preferences", () => {
    beforeEach(() => {
      setupClerkTestingToken();
      cy.visit("/");
      cy.clerkLoaded();
      cy.clerkSignIn({
        strategy: "email_code",
        identifier: Cypress.env("TEST_USER_EMAIL"),
      });
      cy.visit("/family-preferences", { timeout: 30000 });
      ensureUserOnboarded();
      cy.contains("Family Preferences", { timeout: 15000 }).should("be.visible");
    });

    it("should display notification preferences section", () => {
      cy.contains("Notification Preferences").should("be.visible");
    });

    it("should have toggleable notification options", () => {
      // Check for notification toggle switches
      cy.contains("Notification Preferences")
        .closest("div")
        .parent()
        .find('button[role="switch"]')
        .should("exist");
    });
  });
});
