/// <reference types="cypress" />
import { setupClerkTestingToken } from "../../support/clerk";

/**
 * Profile Settings E2E Tests
 *
 * Tests for the profile settings page including:
 * - Displaying current profile information
 * - Updating personal information
 * - Viewing subscription status
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

      // Navigate to profile settings
      cy.visit("/profile-settings", { timeout: 30000 });
    } else if (url.includes("/select-plan")) {
      cy.log("User on select-plan - navigating to settings");
      cy.visit("/profile-settings", { timeout: 30000 });
    }
  });

  // Set subscription tier for feature access
  cy.setSubscriptionTier("heritage").then((result) => {
    if (!result.success) {
      cy.log(`Warning: Failed to set subscription tier: ${result.message}`);
    }
  });
}

describe("Profile Settings - E2E Test Suite", () => {
  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
  });

  describe("Unauthenticated Access", () => {
    it("should redirect to login when accessing profile settings without auth", () => {
      setupClerkTestingToken();
      cy.visit("/profile-settings");
      cy.url({ timeout: 10000 }).should("include", "/sign-in");
    });
  });

  describe("Profile Settings Display", () => {
    beforeEach(() => {
      setupClerkTestingToken();
      cy.visit("/");
      cy.clerkLoaded();
      cy.clerkSignIn({
        strategy: "email_code",
        identifier: Cypress.expose("TEST_USER_EMAIL"),
      });
      cy.visit("/profile-settings", { timeout: 30000 });
      ensureUserOnboarded();
      cy.contains("Profile Settings", { timeout: 15000 }).should("be.visible");
    });

    it("should display profile settings page header", () => {
      cy.contains("Profile Settings").should("be.visible");
      cy.contains("Your account details and preferences").should("be.visible");
    });

    it("should display personal information card", () => {
      cy.contains("Personal Information").should("be.visible");
    });

    it("should display contact information card", () => {
      cy.contains("Contact Information").should("be.visible");
    });

    it("should display subscription card", () => {
      cy.contains("Subscription").should("be.visible");
    });

    it("should display danger zone card", () => {
      cy.contains("Danger Zone").should("be.visible");
    });
  });

  describe("Personal Information Updates", () => {
    beforeEach(() => {
      setupClerkTestingToken();
      cy.visit("/");
      cy.clerkLoaded();
      cy.clerkSignIn({
        strategy: "email_code",
        identifier: Cypress.expose("TEST_USER_EMAIL"),
      });
      cy.visit("/profile-settings", { timeout: 30000 });
      ensureUserOnboarded();
      cy.contains("Profile Settings", { timeout: 15000 }).should("be.visible");
    });

    it("should show save button for name changes", () => {
      // Personal Information has inline form with Save Name button
      cy.contains("button", "Save Name").should("be.visible");
    });

    it("should open edit dialog when clicking email edit button", () => {
      // The Edit button is for changing email, not the whole card
      cy.contains("button", "Edit").click();

      // Dialog should open for email change
      cy.get('[role="dialog"]').should("be.visible");
      cy.contains("Change Email Address").should("be.visible");
    });
  });

  describe("Contact Information Updates", () => {
    beforeEach(() => {
      setupClerkTestingToken();
      cy.visit("/");
      cy.clerkLoaded();
      cy.clerkSignIn({
        strategy: "email_code",
        identifier: Cypress.expose("TEST_USER_EMAIL"),
      });
      cy.visit("/profile-settings", { timeout: 30000 });
      ensureUserOnboarded();
      cy.contains("Profile Settings", { timeout: 15000 }).should("be.visible");
    });

    it("should show inline form fields for contact information", () => {
      // Contact Information has inline editable fields, not an Edit button
      cy.get("input#phone").should("exist");
      cy.get("input#address").should("exist");
      cy.get("input#city").should("exist");
    });

    it("should show save button for contact information", () => {
      // Contact Information has Save Contact Info button
      cy.contains("button", "Save Contact Info").should("be.visible");
    });
  });
});
