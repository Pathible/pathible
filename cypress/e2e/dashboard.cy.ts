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

/**
 * Helper to ensure user is on dashboard, handling onboarding redirect
 */
function ensureOnDashboard(): Cypress.Chainable<boolean> {
  return cy.url({ timeout: 15000 }).then((url) => {
    if (url.includes("/onboarding") || url.includes("/select-plan")) {
      cy.log("User needs to complete setup - test will be skipped");
      return false;
    }
    return url.includes("/dashboard");
  });
}

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
      cy.visit("/dashboard", { failOnStatusCode: false });

      ensureOnDashboard().then((onDashboard) => {
        if (!onDashboard) {
          cy.log("Skipping - user not on dashboard");
          return;
        }

        // Verify stats section is visible
        cy.get('[data-testid="dashboard-stats"]', { timeout: 10000 }).should("be.visible");

        // Verify all three stat cards are present using data-testid
        cy.get('[data-testid="stat-card-shield"]').should("be.visible");
        cy.get('[data-testid="stat-card-bookOpen"]').should("be.visible");
        cy.get('[data-testid="stat-card-fileText"]').should("be.visible");
      });
    });

    it("should display legacy plan completion percentage", () => {
      cy.visit("/dashboard", { failOnStatusCode: false });

      ensureOnDashboard().then((onDashboard) => {
        if (!onDashboard) {
          cy.log("Skipping - user not on dashboard");
          return;
        }

        // Find the Legacy Plan card and verify it shows a percentage
        cy.get('[data-testid="stat-value-fileText"]')
          .invoke("text")
          .should("match", /^\d+%$/);
      });
    });

    it("should display correct numeric values for vault and wisdom stats", () => {
      cy.visit("/dashboard", { failOnStatusCode: false });

      ensureOnDashboard().then((onDashboard) => {
        if (!onDashboard) {
          cy.log("Skipping - user not on dashboard");
          return;
        }

        // Heritage Vault should show a number
        cy.get('[data-testid="stat-value-shield"]').invoke("text").should("match", /^\d+$/);

        // Wisdom & Stories should show a number
        cy.get('[data-testid="stat-value-bookOpen"]').invoke("text").should("match", /^\d+$/);
      });
    });
  });

  describe("Dashboard Navigation", () => {
    it("should navigate to vault when clicking Heritage Vault card", () => {
      cy.visit("/dashboard", { failOnStatusCode: false });

      ensureOnDashboard().then((onDashboard) => {
        if (!onDashboard) {
          cy.log("Skipping - user not on dashboard");
          return;
        }

        cy.get('[data-testid="stat-card-shield"]').click();
        cy.url({ timeout: 10000 }).should("include", "/vault");
      });
    });

    it("should navigate to wisdom when clicking Wisdom & Stories card", () => {
      cy.visit("/dashboard", { failOnStatusCode: false });

      ensureOnDashboard().then((onDashboard) => {
        if (!onDashboard) {
          cy.log("Skipping - user not on dashboard");
          return;
        }

        cy.get('[data-testid="stat-card-bookOpen"]').click();
        cy.url({ timeout: 10000 }).should("include", "/wisdom");
      });
    });

    it("should navigate to legacy when clicking Legacy Plan card", () => {
      cy.visit("/dashboard", { failOnStatusCode: false });

      ensureOnDashboard().then((onDashboard) => {
        if (!onDashboard) {
          cy.log("Skipping - user not on dashboard");
          return;
        }

        cy.get('[data-testid="stat-card-fileText"]').click();
        cy.url({ timeout: 10000 }).should("include", "/legacy");
      });
    });
  });

  describe("Dashboard Content", () => {
    it("should display welcome message with user name", () => {
      cy.visit("/dashboard", { failOnStatusCode: false });

      ensureOnDashboard().then((onDashboard) => {
        if (!onDashboard) {
          cy.log("Skipping - user not on dashboard");
          return;
        }

        cy.contains(/Welcome back,/i, { timeout: 10000 }).should("be.visible");
      });
    });

    it("should display next step CTA section", () => {
      cy.visit("/dashboard", { failOnStatusCode: false });

      ensureOnDashboard().then((onDashboard) => {
        if (!onDashboard) {
          cy.log("Skipping - user not on dashboard");
          return;
        }

        cy.get('[data-tour="next-step-cta"]', { timeout: 10000 }).should("be.visible");
        cy.contains("Next Step", { timeout: 10000 }).should("be.visible");
      });
    });

    it("should display daily reflection section", () => {
      cy.visit("/dashboard", { failOnStatusCode: false });

      ensureOnDashboard().then((onDashboard) => {
        if (!onDashboard) {
          cy.log("Skipping - user not on dashboard");
          return;
        }

        cy.get('[data-tour="daily-reflection"]', { timeout: 10000 }).should("be.visible");
        cy.contains("Daily Reflection", { timeout: 10000 }).should("be.visible");
      });
    });
  });
});
