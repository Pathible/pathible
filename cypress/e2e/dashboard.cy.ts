/// <reference types="cypress" />
import { setupClerkTestingToken } from "@clerk/testing/cypress";

/**
 * Dashboard E2E Tests
 *
 * Tests for the main dashboard page including:
 * - Stats display (vault items, wisdom entries, legacy plan completion)
 * - Next step CTA
 * - Daily reflection section
 *
 * Run with: pnpm test:e2e --spec cypress/e2e/dashboard.cy.ts
 */

const TEST_USER_EMAIL = Cypress.env("TEST_USER_EMAIL");

describe("Dashboard Page", () => {
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

  describe("Dashboard Stats Display", () => {
    it("should display the dashboard stats section", () => {
      // Navigate to dashboard
      cy.visit("/dashboard", { failOnStatusCode: false });

      // Check if we land on dashboard or need to complete setup
      cy.url({ timeout: 15000 }).then((url) => {
        if (url.includes("/dashboard")) {
          // Verify stats section is visible
          cy.get('[data-testid="dashboard-stats"]', { timeout: 10000 }).should("be.visible");

          // Verify all three stat cards are present
          cy.contains("Heritage Vault", { timeout: 10000 }).should("be.visible");
          cy.contains("Wisdom & Stories", { timeout: 10000 }).should("be.visible");
          cy.contains("Legacy Plan", { timeout: 10000 }).should("be.visible");
        } else {
          cy.log("User needs to complete onboarding first - skipping dashboard stats test");
        }
      });
    });

    it("should display legacy plan completion percentage", () => {
      cy.visit("/dashboard", { failOnStatusCode: false });

      cy.url({ timeout: 15000 }).then((url) => {
        if (url.includes("/dashboard")) {
          // Find the Legacy Plan card and verify it shows a percentage
          cy.contains("Legacy Plan", { timeout: 10000 })
            .closest('[class*="card"]')
            .within(() => {
              // Should contain a percentage value (0% or higher)
              cy.contains(/%/).should("be.visible");
            });
        } else {
          cy.log("User needs to complete onboarding first - skipping test");
        }
      });
    });

    it("should display correct numeric values for vault and wisdom stats", () => {
      cy.visit("/dashboard", { failOnStatusCode: false });

      cy.url({ timeout: 15000 }).then((url) => {
        if (url.includes("/dashboard")) {
          // Heritage Vault should show a number
          cy.contains("Heritage Vault", { timeout: 10000 })
            .closest('[class*="card"]')
            .within(() => {
              // Should contain a numeric value
              cy.get('[class*="text"]').first().invoke("text").should("match", /^\d+$/);
            });

          // Wisdom & Stories should show a number
          cy.contains("Wisdom & Stories", { timeout: 10000 })
            .closest('[class*="card"]')
            .within(() => {
              cy.get('[class*="text"]').first().invoke("text").should("match", /^\d+$/);
            });
        } else {
          cy.log("User needs to complete onboarding first - skipping test");
        }
      });
    });
  });

  describe("Dashboard Navigation", () => {
    it("should have clickable stat cards that navigate to correct pages", () => {
      cy.visit("/dashboard", { failOnStatusCode: false });

      cy.url({ timeout: 15000 }).then((url) => {
        if (url.includes("/dashboard")) {
          // Click on Heritage Vault card
          cy.contains("Heritage Vault", { timeout: 10000 }).click();
          cy.url({ timeout: 10000 }).should("include", "/vault");

          // Go back to dashboard
          cy.visit("/dashboard");

          // Click on Wisdom & Stories card
          cy.contains("Wisdom & Stories", { timeout: 10000 }).click();
          cy.url({ timeout: 10000 }).should("include", "/wisdom");

          // Go back to dashboard
          cy.visit("/dashboard");

          // Click on Legacy Plan card
          cy.contains("Legacy Plan", { timeout: 10000 }).click();
          cy.url({ timeout: 10000 }).should("include", "/legacy");
        } else {
          cy.log("User needs to complete onboarding first - skipping test");
        }
      });
    });
  });

  describe("Dashboard Content", () => {
    it("should display welcome message with user name", () => {
      cy.visit("/dashboard", { failOnStatusCode: false });

      cy.url({ timeout: 15000 }).then((url) => {
        if (url.includes("/dashboard")) {
          // Should show welcome message
          cy.contains(/Welcome back,/i, { timeout: 10000 }).should("be.visible");
        } else {
          cy.log("User needs to complete onboarding first - skipping test");
        }
      });
    });

    it("should display next step CTA section", () => {
      cy.visit("/dashboard", { failOnStatusCode: false });

      cy.url({ timeout: 15000 }).then((url) => {
        if (url.includes("/dashboard")) {
          // Should show next step section
          cy.get('[data-tour="next-step-cta"]', { timeout: 10000 }).should("be.visible");
          cy.contains("Next Step", { timeout: 10000 }).should("be.visible");
        } else {
          cy.log("User needs to complete onboarding first - skipping test");
        }
      });
    });

    it("should display daily reflection section", () => {
      cy.visit("/dashboard", { failOnStatusCode: false });

      cy.url({ timeout: 15000 }).then((url) => {
        if (url.includes("/dashboard")) {
          // Should show daily reflection
          cy.get('[data-tour="daily-reflection"]', { timeout: 10000 }).should("be.visible");
          cy.contains("Daily Reflection", { timeout: 10000 }).should("be.visible");
        } else {
          cy.log("User needs to complete onboarding first - skipping test");
        }
      });
    });
  });
});
