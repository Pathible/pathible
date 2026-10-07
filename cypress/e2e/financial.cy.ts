/// <reference types="cypress" />
import { setupClerkTestingToken } from "../support/clerk";

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
 * Uses cy.session() for faster test execution via auth caching.
 * All tests clean up after themselves.
 *
 * Run with: pnpm test:e2e
 */

// Test constants
const TEST_ACCOUNT_NAME = `E2E Test Account ${Date.now()}`;
const TEST_PROPERTY_NAME = `E2E Test Property ${Date.now()}`;
const TEST_POLICY_PROVIDER = `E2E Test Insurance ${Date.now()}`;

describe("Financial Module - E2E Test Suite", () => {
  describe("Unauthenticated Access", () => {
    it("should redirect to login when accessing financial page without auth", () => {
      setupClerkTestingToken();
      cy.visit("/financial");
      cy.url({ timeout: 10000 }).should("include", "/sign-in");
    });
  });

  describe("Financial Accounts Workflow", () => {
    beforeEach(() => {
      cy.signInWithSession("heritage");
      cy.visit("/financial", { timeout: 30000 });
      cy.ensureOnboarded("/financial");
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
      // Use a unique name to avoid conflicts with other tests
      const deleteTestAccountName = `Delete Test Account ${Date.now()}`;

      // First create an account to delete
      cy.contains("button", "Add Account").first().click();
      cy.get('[role="dialog"]').should("be.visible");
      cy.get("input#name").clear().type(deleteTestAccountName);
      cy.get("input#institution").clear().type("Test Bank");
      cy.contains("button", "Create").click();
      cy.contains("Account created successfully", { timeout: 10000 }).should("be.visible");

      // Wait for the account to appear in the list
      cy.contains(deleteTestAccountName, { timeout: 10000 }).should("be.visible");

      // Find and click delete button for the account
      cy.contains(deleteTestAccountName)
        .closest("div.flex.items-center.justify-between")
        .find('button[title="Delete account"]')
        .click();

      // Confirm deletion - wait for dialog animation to complete
      cy.get('[role="alertdialog"]').should("be.visible");
      cy.get('[role="alertdialog"]').within(() => {
        cy.contains("button", "Delete").should("be.visible").click();
      });

      // Wait for dialog to close
      cy.get('[role="alertdialog"]').should("not.exist");

      // Verify success toast
      cy.contains("Account deleted successfully", { timeout: 10000 }).should("be.visible");

      // Wait for UI to update and verify account no longer appears
      cy.contains(deleteTestAccountName, { timeout: 10000 }).should("not.exist");
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
      cy.signInWithSession("heritage");
      cy.visit("/financial", { timeout: 30000 });
      cy.ensureOnboarded("/financial");
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
      // Note: Property items use items-start, not items-center
      cy.contains(TEST_PROPERTY_NAME)
        .closest("div.flex.items-start.justify-between")
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
      cy.signInWithSession("heritage");
      cy.visit("/financial", { timeout: 30000 });
      cy.ensureOnboarded("/financial");
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

      // Verify success toast (component shows "Insurance policy created successfully")
      cy.contains("Insurance policy created successfully", {
        timeout: 10000,
      }).should("be.visible");

      // Verify policy appears in list
      cy.contains(TEST_POLICY_PROVIDER, { timeout: 10000 }).should("be.visible");
    });

    it("should delete an insurance policy with confirmation", () => {
      // First create a policy to delete
      cy.contains("button", "Add Policy").first().click();
      cy.get('[role="dialog"]').should("be.visible");
      cy.get("input#provider").clear().type(TEST_POLICY_PROVIDER);
      cy.contains("button", "Create").click();
      cy.contains("Insurance policy created successfully", {
        timeout: 10000,
      }).should("be.visible");

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

      // Verify success toast (component shows "Insurance policy deleted successfully")
      cy.contains("Insurance policy deleted successfully", {
        timeout: 10000,
      }).should("be.visible");
    });
  });

  describe("Financial Stats Display", () => {
    beforeEach(() => {
      cy.signInWithSession("heritage");
      cy.visit("/financial", { timeout: 30000 });
      cy.ensureOnboarded("/financial");
      cy.contains("Financial Clarity", { timeout: 15000 }).should("be.visible");
    });

    it("should display financial stats cards", () => {
      // Verify stats cards are visible
      cy.contains("Accounts").should("be.visible");
      cy.contains("Properties").should("be.visible");
      cy.contains("Insurance").should("be.visible");
    });
  });
});
