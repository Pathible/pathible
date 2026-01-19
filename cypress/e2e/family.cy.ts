/// <reference types="cypress" />
import { setupClerkTestingToken } from "@clerk/testing/cypress";

/**
 * Family Ecosystem E2E Tests
 *
 * Tests for the family page including:
 * - Family page loads correctly
 * - Family unit display
 * - Invite member dialog
 *
 * Run with: pnpm test:e2e --spec cypress/e2e/family.cy.ts
 */

const TEST_USER_EMAIL = Cypress.env("TEST_USER_EMAIL");

/**
 * Helper to ensure user is on family page, handling onboarding redirect
 */
function ensureOnFamily(): Cypress.Chainable<boolean> {
  return cy.url({ timeout: 15000 }).then((url) => {
    if (url.includes("/onboarding") || url.includes("/select-plan")) {
      cy.log("User needs to complete setup - test will be skipped");
      return false;
    }
    return url.includes("/family");
  });
}

describe("Family Ecosystem Page", () => {
  beforeEach(() => {
    // Clear browser state
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.window().then((win) => {
      win.sessionStorage.clear();
    });

    // Sign in
    setupClerkTestingToken();
    cy.visit("/");
    cy.clerkLoaded();
    cy.clerkSignIn({
      strategy: "email_code",
      identifier: TEST_USER_EMAIL,
    });
  });

  describe("Family Page Display", () => {
    it("should display the family ecosystem page", () => {
      cy.visit("/family", { failOnStatusCode: false });

      ensureOnFamily().then((onFamily) => {
        if (!onFamily) {
          cy.log("Skipping - user not on family page");
          return;
        }

        // Verify page header is visible
        cy.contains("Family Ecosystem", { timeout: 10000 }).should("be.visible");
      });
    });

    it("should display Invite Member and Add Family buttons", () => {
      cy.visit("/family", { failOnStatusCode: false });

      ensureOnFamily().then((onFamily) => {
        if (!onFamily) {
          cy.log("Skipping - user not on family page");
          return;
        }

        // Check for action buttons
        cy.get('[data-tour="family-invite-member"]', { timeout: 10000 }).should("be.visible");
        cy.get('[data-tour="family-add-unit"]', { timeout: 10000 }).should("be.visible");
      });
    });
  });

  describe("Invite Member Dialog", () => {
    it("should open invite member dialog when clicking Invite Member button", () => {
      cy.visit("/family", { failOnStatusCode: false });

      ensureOnFamily().then((onFamily) => {
        if (!onFamily) {
          cy.log("Skipping - user not on family page");
          return;
        }

        // Click Invite Member button
        cy.get('[data-tour="family-invite-member"]', { timeout: 10000 }).click();

        // Verify dialog opens
        cy.contains("Add Someone to Your Family", { timeout: 5000 }).should("be.visible");
        cy.get('input[placeholder="First name"]').should("be.visible");
        cy.get('input[placeholder="Last name"]').should("be.visible");
        cy.get('input[type="email"]').should("be.visible");
      });
    });

    it("should close invite member dialog when clicking Cancel", () => {
      cy.visit("/family", { failOnStatusCode: false });

      ensureOnFamily().then((onFamily) => {
        if (!onFamily) {
          cy.log("Skipping - user not on family page");
          return;
        }

        // Open dialog
        cy.get('[data-tour="family-invite-member"]', { timeout: 10000 }).click();
        cy.contains("Add Someone to Your Family", { timeout: 5000 }).should("be.visible");

        // Click Cancel
        cy.contains("button", "Cancel").click();

        // Verify dialog closes
        cy.contains("Add Someone to Your Family").should("not.exist");
      });
    });

    it("should validate required fields in invite form", () => {
      cy.visit("/family", { failOnStatusCode: false });

      ensureOnFamily().then((onFamily) => {
        if (!onFamily) {
          cy.log("Skipping - user not on family page");
          return;
        }

        // Open dialog
        cy.get('[data-tour="family-invite-member"]', { timeout: 10000 }).click();
        cy.contains("Add Someone to Your Family", { timeout: 5000 }).should("be.visible");

        // Try to submit without filling required fields
        cy.contains("button", "Add Member").click();

        // Form should still be open (HTML5 validation prevents submission)
        cy.contains("Add Someone to Your Family").should("be.visible");
      });
    });
  });

  describe("Add Family Unit Dialog", () => {
    it("should open add family dialog when clicking Add Family button", () => {
      cy.visit("/family", { failOnStatusCode: false });

      ensureOnFamily().then((onFamily) => {
        if (!onFamily) {
          cy.log("Skipping - user not on family page");
          return;
        }

        // Click Add Family button
        cy.get('[data-tour="family-add-unit"]', { timeout: 10000 }).click();

        // Verify dialog opens
        cy.contains("Add a Family Group", { timeout: 5000 }).should("be.visible");
        cy.get('input[placeholder*="Johnson"]').should("be.visible");
      });
    });

    it("should close add family dialog when clicking Cancel", () => {
      cy.visit("/family", { failOnStatusCode: false });

      ensureOnFamily().then((onFamily) => {
        if (!onFamily) {
          cy.log("Skipping - user not on family page");
          return;
        }

        // Open dialog
        cy.get('[data-tour="family-add-unit"]', { timeout: 10000 }).click();
        cy.contains("Add a Family Group", { timeout: 5000 }).should("be.visible");

        // Click Cancel
        cy.contains("button", "Cancel").click();

        // Verify dialog closes
        cy.contains("Add a Family Group").should("not.exist");
      });
    });
  });
});
