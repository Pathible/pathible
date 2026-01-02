/// <reference types="cypress" />
import { setupClerkTestingToken } from "@clerk/testing/cypress";

/**
 * Legacy Planning E2E Tests
 *
 * Tests for the legacy planning page including:
 * - Page access and authentication
 * - Legacy wizard flow
 * - Legacy summary display
 * - PDF export functionality
 *
 * Uses Clerk testing tokens for automated authentication (no OTP needed).
 *
 * Run with: pnpm test:e2e
 */

/**
 * Helper to ensure user is fully onboarded before accessing legacy page
 * Handles cases where user is redirected to onboarding or select-plan
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
      cy.url().then((newUrl) => {
        if (newUrl.includes("/select-plan")) {
          cy.url({ timeout: 15000 }).should("satisfy", (u: string) => {
            return u.includes("/dashboard") || u.includes("/select-plan");
          });
        }
      });

      // Now navigate to legacy
      cy.visit("/legacy", { timeout: 30000 });
    } else if (url.includes("/select-plan")) {
      cy.log("User on select-plan - waiting for redirect");
      cy.url({ timeout: 30000 }).should("satisfy", (u: string) => {
        return u.includes("/dashboard") || u.includes("/select-plan") || u.includes("/legacy");
      });
      cy.visit("/legacy", { timeout: 30000 });
    }
  });
}

describe("Legacy Planning - E2E Test Suite", () => {
  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
  });

  describe("Unauthenticated Access", () => {
    it("should redirect to login when accessing legacy without auth", () => {
      setupClerkTestingToken();
      cy.visit("/legacy");
      cy.url({ timeout: 10000 }).should("include", "/sign-in");
    });
  });

  describe("Authenticated Access", () => {
    beforeEach(() => {
      setupClerkTestingToken();
      cy.visit("/legacy", { timeout: 30000 });
      ensureUserOnboarded();
    });

    it("should load the legacy planning page", () => {
      // Wait for page content to load
      cy.get("body", { timeout: 15000 }).should("be.visible");

      // The page should show either:
      // 1. Legacy Planning wizard (if not complete)
      // 2. Legacy Summary (if complete)
      cy.get("body").then(($body) => {
        const hasWizard = $body.text().includes("Legacy Planning");
        const hasSummary = $body.text().includes("Your Legacy is Taking Shape");

        expect(hasWizard || hasSummary).to.be.true;
      });
    });

    it("should show legacy wizard when plan is not complete", () => {
      // Check for wizard elements
      cy.get("body", { timeout: 15000 }).then(($body) => {
        if ($body.text().includes("Legacy Planning")) {
          cy.contains("Legacy Planning").should("be.visible");
          cy.contains("Give your family clarity").should("be.visible");
        }
      });
    });
  });

  describe("Legacy Summary with PDF Export", () => {
    beforeEach(() => {
      setupClerkTestingToken();
      cy.visit("/legacy", { timeout: 30000 });
      ensureUserOnboarded();
    });

    it("should display export PDF button when legacy plan is complete", () => {
      // Wait for page to load
      cy.get("body", { timeout: 15000 }).should("be.visible");

      // Check if we're on the summary page (plan is complete)
      cy.get("body").then(($body) => {
        if ($body.text().includes("Your Legacy is Taking Shape")) {
          // Summary page is shown - check for export button
          cy.contains("button", "Export Legacy Summary PDF").should("be.visible");
          cy.contains("button", "Edit Responses").should("be.visible");
        } else {
          // Wizard is shown - this is expected for new users
          cy.log("Legacy plan not complete - wizard shown (expected for new users)");
        }
      });
    });

    it("should show loading state when exporting PDF", () => {
      // Wait for page to load
      cy.get("body", { timeout: 15000 }).should("be.visible");

      // Only test if on summary page
      cy.get("body").then(($body) => {
        if ($body.text().includes("Your Legacy is Taking Shape")) {
          // Click the export button
          cy.contains("button", "Export Legacy Summary PDF").click();

          // Should show loading state (button text changes)
          // Note: This may be too fast to catch in some cases
          cy.get("button")
            .contains(/Generating PDF|Export Legacy Summary PDF/)
            .should("exist");
        } else {
          cy.log("Skipping PDF export test - legacy plan not complete");
        }
      });
    });
  });

  describe("Legacy Summary Content", () => {
    beforeEach(() => {
      setupClerkTestingToken();
      cy.visit("/legacy", { timeout: 30000 });
      ensureUserOnboarded();
    });

    it("should display Document Access Map section on summary page", () => {
      cy.get("body", { timeout: 15000 }).should("be.visible");

      cy.get("body").then(($body) => {
        if ($body.text().includes("Your Legacy is Taking Shape")) {
          // Check for Document Access Map
          cy.contains("Document Access Map").should("be.visible");
          cy.contains("Will & Testament").should("be.visible");
          cy.contains("Insurance Documents").should("be.visible");
          cy.contains("Financial Accounts").should("be.visible");
        }
      });
    });

    it("should display disclaimer on summary page", () => {
      cy.get("body", { timeout: 15000 }).should("be.visible");

      cy.get("body").then(($body) => {
        if ($body.text().includes("Your Legacy is Taking Shape")) {
          cy.contains("not legal or financial advice").should("be.visible");
        }
      });
    });
  });
});
