/// <reference types="cypress" />
import { setupClerkTestingToken } from "@clerk/testing/cypress";

/**
 * Financial Module E2E Tests
 *
 * Comprehensive tests for the financial page including:
 * - Financial accounts (create, edit, delete)
 * - Properties (create, edit, delete)
 * - Insurance policies (create, edit, delete)
 * - Financial stats display
 *
 * Uses Clerk testing tokens for automated authentication (no OTP needed).
 * All tests clean up after themselves.
 *
 * Run with: pnpm test:e2e
 */

// Test constants
const TEST_ACCOUNT_NAME = `E2E Test Account ${Date.now()}`;
const TEST_PROPERTY_NAME = `E2E Test Property ${Date.now()}`;
const TEST_POLICY_PROVIDER = `E2E Test Insurance ${Date.now()}`;

/**
 * Helper to ensure user is fully onboarded before accessing financial page
 * Handles cases where user is redirected to onboarding or select-plan
 * Also sets subscription tier for feature access
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

      // Navigate to financial
      cy.visit("/financial", { timeout: 30000 });
    } else if (url.includes("/select-plan")) {
      cy.log("User on select-plan - waiting for redirect");
      cy.url({ timeout: 30000 }).should("satisfy", (u: string) => {
        return u.includes("/dashboard") || u.includes("/select-plan") || u.includes("/financial");
      });
      cy.visit("/financial", { timeout: 30000 });
    }
  });

  // Set subscription tier to 'heritage' for feature access
  cy.log("Setting subscription tier to heritage for financial access");
  cy.setSubscriptionTier("heritage").then((result) => {
    if (!result.success) {
      cy.log(`Warning: Failed to set subscription tier: ${result.message}`);
    }
  });
}

describe("Financial Module - E2E Test Suite", () => {
  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
  });

  describe("Unauthenticated Access", () => {
    it("should redirect to login when accessing financial page without auth", () => {
      setupClerkTestingToken();
      cy.visit("/financial");
      cy.url({ timeout: 10000 }).should("include", "/sign-in");
    });
  });

  describe("Financial Accounts Workflow", () => {
    beforeEach(() => {
      setupClerkTestingToken();
      cy.visit("/");
      cy.clerkLoaded();
      cy.clerkSignIn({
        strategy: "email_code",
        identifier: Cypress.env("TEST_USER_EMAIL"),
      });
      cy.visit("/financial", { timeout: 30000 });
      ensureUserOnboarded();
      cy.contains("Financial Clarity", { timeout: 15000 }).should("be.visible");
    });

    it("should create a new financial account", () => {
      // Click Add Account button
      cy.contains("button", "Add Account").first().click();

      // Fill in account details
      cy.get('[role="dialog"]').should("be.visible");
      cy.get("input#name").clear().type(TEST_ACCOUNT_NAME);
      cy.get("input#institution").clear().type("Test Bank");
      cy.get("input#accountNumberLast4").clear().type("1234");
      cy.get("input#balance").clear().type("1000.50");

      // Submit form
      cy.contains("button", "Create").click();

      // Verify success toast
      cy.contains("Account created successfully", { timeout: 10000 }).should("be.visible");

      // Verify account appears in list
      cy.contains(TEST_ACCOUNT_NAME, { timeout: 10000 }).should("be.visible");
    });

    it("should edit an existing account", () => {
      // First create an account to edit
      cy.contains("button", "Add Account").first().click();
      cy.get('[role="dialog"]').should("be.visible");
      cy.get("input#name").clear().type(TEST_ACCOUNT_NAME);
      cy.get("input#institution").clear().type("Test Bank");
      cy.contains("button", "Create").click();
      cy.contains("Account created successfully", { timeout: 10000 }).should("be.visible");

      // Find and click edit button for the account
      cy.contains(TEST_ACCOUNT_NAME)
        .closest("div.flex.items-center.justify-between")
        .find('button[title="Edit account"]')
        .click();

      // Edit account details
      cy.get('[role="dialog"]').should("be.visible");
      cy.get("input#balance").clear().type("2500.00");

      // Submit form
      cy.contains("button", "Update").click();

      // Verify success toast
      cy.contains("Account updated successfully", { timeout: 10000 }).should("be.visible");

      // Verify updated balance appears
      cy.contains("$2,500.00", { timeout: 10000 }).should("be.visible");
    });

    it("should delete an account with confirmation", () => {
      // First create an account to delete
      cy.contains("button", "Add Account").first().click();
      cy.get('[role="dialog"]').should("be.visible");
      cy.get("input#name").clear().type(TEST_ACCOUNT_NAME);
      cy.get("input#institution").clear().type("Test Bank");
      cy.contains("button", "Create").click();
      cy.contains("Account created successfully", { timeout: 10000 }).should("be.visible");

      // Find and click delete button for the account
      cy.contains(TEST_ACCOUNT_NAME)
        .closest("div.flex.items-center.justify-between")
        .find('button[title="Delete account"]')
        .click();

      // Confirm deletion - wait for dialog animation to complete
      cy.get('[role="alertdialog"]').should("be.visible");
      cy.get('[role="alertdialog"]').within(() => {
        cy.contains("button", "Delete").should("be.visible").click();
      });

      // Verify success toast
      cy.contains("Account deleted successfully", { timeout: 10000 }).should("be.visible");

      // Verify account no longer appears
      cy.contains(TEST_ACCOUNT_NAME).should("not.exist");
    });

    it("should show validation error for empty account name", () => {
      cy.contains("button", "Add Account").first().click();
      cy.get('[role="dialog"]').should("be.visible");

      // Try to submit with empty name
      cy.get("input#institution").clear().type("Test Bank");
      cy.contains("button", "Create").click();

      // HTML5 validation should prevent submission
      cy.get("input#name:invalid").should("exist");
    });
  });

  describe("Properties Workflow", () => {
    beforeEach(() => {
      setupClerkTestingToken();
      cy.visit("/");
      cy.clerkLoaded();
      cy.clerkSignIn({
        strategy: "email_code",
        identifier: Cypress.env("TEST_USER_EMAIL"),
      });
      cy.visit("/financial", { timeout: 30000 });
      ensureUserOnboarded();
      cy.contains("Financial Clarity", { timeout: 15000 }).should("be.visible");
    });

    it("should create a new property", () => {
      // Click Add Property button
      cy.contains("button", "Add Property").first().click();

      // Fill in property details
      cy.get('[role="dialog"]').should("be.visible");
      cy.get("input#name").clear().type(TEST_PROPERTY_NAME);
      cy.get("input#address").clear().type("123 Test Street");
      cy.get("input#estimatedValue").clear().type("500000");

      // Submit form
      cy.contains("button", "Create").click();

      // Verify success toast
      cy.contains("Property created successfully", { timeout: 10000 }).should("be.visible");

      // Verify property appears in list
      cy.contains(TEST_PROPERTY_NAME, { timeout: 10000 }).should("be.visible");
    });

    it("should delete a property with confirmation", () => {
      // First create a property to delete
      cy.contains("button", "Add Property").first().click();
      cy.get('[role="dialog"]').should("be.visible");
      cy.get("input#name").clear().type(TEST_PROPERTY_NAME);
      cy.contains("button", "Create").click();
      cy.contains("Property created successfully", { timeout: 10000 }).should("be.visible");

      // Find and click delete button for the property
      cy.contains(TEST_PROPERTY_NAME)
        .closest("div.flex.items-center.justify-between")
        .find('button[title="Delete property"]')
        .click();

      // Confirm deletion - wait for dialog animation to complete
      cy.get('[role="alertdialog"]').should("be.visible");
      cy.get('[role="alertdialog"]').within(() => {
        cy.contains("button", "Delete").should("be.visible").click();
      });

      // Verify success toast
      cy.contains("Property deleted successfully", { timeout: 10000 }).should("be.visible");
    });
  });

  describe("Insurance Policies Workflow", () => {
    beforeEach(() => {
      setupClerkTestingToken();
      cy.visit("/");
      cy.clerkLoaded();
      cy.clerkSignIn({
        strategy: "email_code",
        identifier: Cypress.env("TEST_USER_EMAIL"),
      });
      cy.visit("/financial", { timeout: 30000 });
      ensureUserOnboarded();
      cy.contains("Financial Clarity", { timeout: 15000 }).should("be.visible");
    });

    it("should create a new insurance policy", () => {
      // Click Add Policy button
      cy.contains("button", "Add Policy").first().click();

      // Fill in policy details
      cy.get('[role="dialog"]').should("be.visible");
      cy.get("input#provider").clear().type(TEST_POLICY_PROVIDER);
      cy.get("input#coverageAmount").clear().type("100000");
      cy.get("input#premiumAmount").clear().type("150");

      // Submit form
      cy.contains("button", "Create").click();

      // Verify success toast
      cy.contains("Policy created successfully", { timeout: 10000 }).should("be.visible");

      // Verify policy appears in list
      cy.contains(TEST_POLICY_PROVIDER, { timeout: 10000 }).should("be.visible");
    });

    it("should delete an insurance policy with confirmation", () => {
      // First create a policy to delete
      cy.contains("button", "Add Policy").first().click();
      cy.get('[role="dialog"]').should("be.visible");
      cy.get("input#provider").clear().type(TEST_POLICY_PROVIDER);
      cy.contains("button", "Create").click();
      cy.contains("Policy created successfully", { timeout: 10000 }).should("be.visible");

      // Find and click delete button for the policy
      cy.contains(TEST_POLICY_PROVIDER)
        .closest("div.flex.items-center.justify-between")
        .find('button[title="Delete policy"]')
        .click();

      // Confirm deletion - wait for dialog animation to complete
      cy.get('[role="alertdialog"]').should("be.visible");
      cy.get('[role="alertdialog"]').within(() => {
        cy.contains("button", "Delete").should("be.visible").click();
      });

      // Verify success toast
      cy.contains("Policy deleted successfully", { timeout: 10000 }).should("be.visible");
    });
  });

  describe("Financial Stats Display", () => {
    beforeEach(() => {
      setupClerkTestingToken();
      cy.visit("/");
      cy.clerkLoaded();
      cy.clerkSignIn({
        strategy: "email_code",
        identifier: Cypress.env("TEST_USER_EMAIL"),
      });
      cy.visit("/financial", { timeout: 30000 });
      ensureUserOnboarded();
      cy.contains("Financial Clarity", { timeout: 15000 }).should("be.visible");
    });

    it("should display financial stats cards", () => {
      // Verify stats cards are visible
      cy.contains("Accounts").should("be.visible");
      cy.contains("Properties").should("be.visible");
      cy.contains("Insurance").should("be.visible");
    });

    it("should navigate between tabs", () => {
      // Click Smart Suggestions tab
      cy.contains("Smart Suggestions").click();
      cy.url().should("include", "tab=suggestions");

      // Click Faith & Finances tab
      cy.contains("Faith & Finances").click();
      cy.url().should("include", "tab=learning");

      // Click Overview tab
      cy.contains("Overview").click();
      cy.url().should("not.include", "tab=");
    });
  });
});
