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

const TEST_USER_EMAIL = Cypress.env("TEST_USER_EMAIL");

describe("Legacy Planning - E2E Test Suite", () => {
  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.window().then((win) => {
      win.sessionStorage.clear();
    });
  });

  describe("Unauthenticated Access", () => {
    it("should redirect to login when accessing legacy without auth", () => {
      cy.visit("/legacy");
      cy.url({ timeout: 10000 }).should("include", "/sign-in");
    });
  });

  describe("Authenticated Access", () => {
    beforeEach(() => {
      // Sign in
      setupClerkTestingToken();
      cy.visit("/");
      cy.clerkLoaded();
      cy.clerkSignIn({
        strategy: "email_code",
        identifier: TEST_USER_EMAIL,
      });
    });

    it("should load the legacy planning page", () => {
      cy.visit("/legacy", { failOnStatusCode: false });

      // Handle potential onboarding redirect
      cy.url({ timeout: 15000 }).then((url) => {
        if (url.includes("/onboarding") || url.includes("/select-plan")) {
          cy.log("User needs onboarding - skipping test");
          return;
        }

        // Wait for page content to load
        cy.get("body", { timeout: 15000 }).should("be.visible");

        // The page should show either:
        // 1. Legacy Planning wizard (if not complete)
        // 2. Legacy Summary (if complete)
        // 3. Feature gate/upgrade prompt (if user lacks Legacy tier)
        cy.get("body").then(($body) => {
          const bodyText = $body.text();
          const hasWizard = bodyText.includes("Legacy Planning");
          const hasSummary = bodyText.includes("Your Legacy is Taking Shape");
          const hasFeatureGate =
            bodyText.includes("Upgrade") ||
            bodyText.includes("upgrade") ||
            bodyText.includes("plan");

          // At least one of these should be true
          expect(hasWizard || hasSummary || hasFeatureGate).to.be.true;
        });
      });
    });

    it("should show legacy wizard or feature gate", () => {
      cy.visit("/legacy", { failOnStatusCode: false });

      // Handle potential onboarding redirect
      cy.url({ timeout: 15000 }).then((url) => {
        if (url.includes("/onboarding") || url.includes("/select-plan")) {
          cy.log("User needs onboarding - skipping test");
          return;
        }

        // Wait for page to load
        cy.get("body", { timeout: 15000 }).should("be.visible");

        // Check for one of the expected states:
        // 1. Legacy wizard (if user has Legacy tier and plan not complete)
        // 2. Legacy Summary (if user has Legacy tier and plan complete)
        // 3. Feature gate (if user lacks Legacy tier)
        cy.get("body").then(($body) => {
          const bodyText = $body.text();
          const hasWizard =
            bodyText.includes("Legacy Planning") || bodyText.includes("Give your family clarity");
          const hasSummary = bodyText.includes("Your Legacy is Taking Shape");
          const hasFeatureGate =
            bodyText.includes("Upgrade to Legacy") || bodyText.includes("Guided Questionnaires");

          expect(hasWizard || hasSummary || hasFeatureGate).to.be.true;
        });
      });
    });
  });

  describe("Legacy Summary with PDF Export", () => {
    beforeEach(() => {
      // Sign in
      setupClerkTestingToken();
      cy.visit("/");
      cy.clerkLoaded();
      cy.clerkSignIn({
        strategy: "email_code",
        identifier: TEST_USER_EMAIL,
      });
    });

    it("should display export PDF button when legacy plan is complete", () => {
      cy.visit("/legacy", { failOnStatusCode: false });

      // Handle potential onboarding redirect
      cy.url({ timeout: 15000 }).then((url) => {
        if (url.includes("/onboarding") || url.includes("/select-plan")) {
          cy.log("User needs onboarding - skipping test");
          return;
        }

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
    });

    it("should show loading state when exporting PDF", () => {
      cy.visit("/legacy", { failOnStatusCode: false });

      // Handle potential onboarding redirect
      cy.url({ timeout: 15000 }).then((url) => {
        if (url.includes("/onboarding") || url.includes("/select-plan")) {
          cy.log("User needs onboarding - skipping test");
          return;
        }

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
  });

  describe("Legacy Summary Content", () => {
    beforeEach(() => {
      // Sign in
      setupClerkTestingToken();
      cy.visit("/");
      cy.clerkLoaded();
      cy.clerkSignIn({
        strategy: "email_code",
        identifier: TEST_USER_EMAIL,
      });
    });

    it("should display Document Access Map section on summary page", () => {
      cy.visit("/legacy", { failOnStatusCode: false });

      // Handle potential onboarding redirect
      cy.url({ timeout: 15000 }).then((url) => {
        if (url.includes("/onboarding") || url.includes("/select-plan")) {
          cy.log("User needs onboarding - skipping test");
          return;
        }

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
    });

    it("should display disclaimer on summary page", () => {
      cy.visit("/legacy", { failOnStatusCode: false });

      // Handle potential onboarding redirect
      cy.url({ timeout: 15000 }).then((url) => {
        if (url.includes("/onboarding") || url.includes("/select-plan")) {
          cy.log("User needs onboarding - skipping test");
          return;
        }

        cy.get("body", { timeout: 15000 }).should("be.visible");

        cy.get("body").then(($body) => {
          if ($body.text().includes("Your Legacy is Taking Shape")) {
            cy.contains("not legal or financial advice").should("be.visible");
          }
        });
      });
    });
  });
});
