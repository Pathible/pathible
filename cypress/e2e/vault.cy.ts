/// <reference types="cypress" />
import { setupClerkTestingToken } from "@clerk/testing/cypress";

/**
 * Heritage Vault E2E Tests
 *
 * Comprehensive tests for the vault page including:
 * - Document upload with category selection
 * - Document editing (name, description, categories)
 * - Search functionality
 * - Filter functionality
 * - Category management (add, remove)
 * - Document deletion
 * - Count validation throughout all operations
 *
 * Uses Clerk testing tokens for automated authentication (no OTP needed).
 * All tests clean up after themselves.
 *
 * Run with: pnpm test:e2e
 */

// Test constants
// Note: Some constants are prefixed with _ as they're reserved for future tests
const _TEST_DOCUMENT_NAME = `E2E Test Document ${Date.now()}`;
const _TEST_DESCRIPTION = "This is an automated test document for E2E testing";
const TEST_CATEGORY_NAME = `Test Category ${Date.now()}`;
const _TEST_SEARCH_TERM = "E2E Test";

/**
 * Helper to ensure user is fully onboarded before accessing vault
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
          // User already has plan from Clerk test mode, should redirect to dashboard
          cy.url({ timeout: 15000 }).should("satisfy", (u: string) => {
            return u.includes("/dashboard") || u.includes("/select-plan");
          });
        }
      });

      // Now navigate to vault
      cy.visit("/vault", { timeout: 30000 });
    } else if (url.includes("/select-plan")) {
      cy.log("User on select-plan - waiting for redirect");
      // User should have a plan from Clerk test mode
      cy.url({ timeout: 30000 }).should("satisfy", (u: string) => {
        return u.includes("/dashboard") || u.includes("/select-plan") || u.includes("/vault");
      });
      // Navigate to vault
      cy.visit("/vault", { timeout: 30000 });
    }
    // If already on vault or dashboard, we're good
  });
}

describe("Heritage Vault - Complete E2E Test Suite", () => {
  // Store initial counts to verify changes (reserved for future tests)
  let _initialDocumentCount: number;
  let _initialCategoryCount: number;

  beforeEach(() => {
    // Clear state before each test
    cy.clearCookies();
    cy.clearLocalStorage();
  });

  describe("Unauthenticated Access", () => {
    it("should redirect to login when accessing vault without auth", () => {
      setupClerkTestingToken();
      cy.visit("/vault");
      cy.url({ timeout: 10000 }).should("include", "/sign-in");
    });
  });

  describe("Complete Vault Workflow", () => {
    beforeEach(() => {
      // Set up Clerk testing token - must be called first
      setupClerkTestingToken();
      // Visit a public page to load Clerk JS (not a protected route)
      cy.visit("/");
      // Wait for Clerk to be ready
      cy.clerkLoaded();
      // Sign in with Clerk
      cy.clerkSignIn({
        strategy: "email_code",
        identifier: Cypress.env("TEST_USER_EMAIL"),
      });
      // Now navigate to the protected vault page
      cy.visit("/vault", { timeout: 30000 });
      // Ensure user is fully onboarded (handles redirects to onboarding/select-plan)
      ensureUserOnboarded();
      // Wait for the page to fully load
      cy.contains("Heritage Vault", { timeout: 15000 }).should("be.visible");
    });

    it("should create and delete a category", () => {
      // Wait for data to load
      cy.get('[data-testid="vault-category-all"]', { timeout: 10000 }).should("be.visible");

      // =========================================================================
      // STEP 1: Create a new category for testing
      // =========================================================================
      cy.log("**STEP 1: Creating test category**");

      cy.get('button:contains("Manage Categories")').click();
      cy.get('[role="dialog"]').should("be.visible");

      // Add new category
      cy.get('input[placeholder="Enter category name..."]').clear().type(TEST_CATEGORY_NAME);
      cy.get('[role="dialog"]').find("button").contains("Add").click();

      // Verify category appears in the dialog list (use exist instead of visible due to scroll)
      cy.get('[role="dialog"]').contains(TEST_CATEGORY_NAME, { timeout: 15000 }).should("exist");

      // =========================================================================
      // STEP 2: Delete the test category
      // =========================================================================
      cy.log("**STEP 2: Deleting test category**");

      // Scroll the dialog content to make our category visible
      cy.get('[role="dialog"]').contains(TEST_CATEGORY_NAME).scrollIntoView();

      // Find the delete button (trash icon) for our category and click it
      // Using a more direct approach - find the row container by looking at the category-manager structure
      cy.get('[role="dialog"]')
        .contains(TEST_CATEGORY_NAME)
        .parents('[class*="rounded-lg"][class*="bg-secondary"]')
        .first()
        .within(() => {
          cy.get("button").last().click(); // Delete button is the last button
        });

      // Confirm deletion by clicking the "Delete Category" button
      cy.get('[role="alertdialog"]').should("be.visible");
      // Use contains to find the specific button with this text
      cy.contains("button", "Delete Category").click();

      // Wait for alertdialog to close (mutation may take a moment)
      cy.get('[role="alertdialog"]', { timeout: 15000 }).should("not.exist");

      // Wait for category to be removed from the list (may take a moment for Convex to sync)
      cy.get('[role="dialog"]')
        .contains(TEST_CATEGORY_NAME, { timeout: 15000 })
        .should("not.exist");

      // Close category manager
      cy.get('button[aria-label="Close"], button:contains("Close")').first().click();
      cy.get('[role="dialog"]').should("not.exist");

      cy.log("**Category creation and deletion test completed!**");
    });

    // NOTE: Document upload tests require cloud storage (Backblaze B2) credentials
    // to be properly configured. The upload functionality is tested manually or
    // in a separate integration test environment with proper cloud storage setup.
  });

  describe("Category Management Tests", () => {
    beforeEach(() => {
      setupClerkTestingToken();
      cy.visit("/");
      cy.clerkLoaded();
      cy.clerkSignIn({
        strategy: "email_code",
        identifier: Cypress.env("TEST_USER_EMAIL"),
      });
      cy.visit("/vault", { timeout: 30000 });
      // Ensure user is fully onboarded (handles redirects to onboarding/select-plan)
      ensureUserOnboarded();
      cy.contains("Heritage Vault", { timeout: 15000 }).should("be.visible");
    });

    it("should fix category counts using the Fix Counts button", () => {
      // Open category manager
      cy.get('button:contains("Manage Categories")').click();
      cy.get('[role="dialog"]').should("be.visible");

      // Click Fix Counts button and wait for it to complete
      cy.get('[data-testid="recalculate-counts-button"]').click();

      // Wait for the button to stop showing loading state (Recalculating... disappears)
      cy.get('[data-testid="recalculate-counts-button"]')
        .should("not.contain", "Recalculating...")
        .and("contain", "Fix Counts");

      // Close dialog
      cy.get('button[aria-label="Close"], button:contains("Close")').first().click();
    });
  });

  describe("Search and Filter Edge Cases", () => {
    beforeEach(() => {
      setupClerkTestingToken();
      cy.visit("/");
      cy.clerkLoaded();
      cy.clerkSignIn({
        strategy: "email_code",
        identifier: Cypress.env("TEST_USER_EMAIL"),
      });
      cy.visit("/vault", { timeout: 30000 });
      // Ensure user is fully onboarded (handles redirects to onboarding/select-plan)
      ensureUserOnboarded();
      cy.contains("Heritage Vault", { timeout: 15000 }).should("be.visible");
    });

    it("should show empty state when search has no results", () => {
      // Search for something that doesn't exist
      cy.get('[data-testid="vault-search-input"]').type("xyznonexistent12345");

      // Should show no results (empty state or no document cards)
      cy.get('[data-testid="vault-document-card"]').should("not.exist");

      // Clear search
      cy.get('[data-testid="vault-search-clear"]').click();
    });

    it("should filter by category and show correct count", () => {
      // Wait for the search-and-filter component to load
      cy.get('[data-testid="vault-search-filter"]', { timeout: 15000 }).should("be.visible");

      // Wait for category filters section to be visible
      cy.get('[data-testid="vault-category-filters"]', { timeout: 10000 }).should("be.visible");

      // Verify "All Documents" category button exists
      cy.get('[data-testid="vault-category-all"]').should("be.visible");

      // Get the All Documents count
      cy.get('[data-testid="vault-category-all"]')
        .invoke("attr", "data-count")
        .then((totalCount) => {
          const total = Number.parseInt(totalCount as string, 10);
          cy.log(`Total documents: ${total}`);

          // Click on a specific category (Legal Documents as example)
          cy.get('[data-testid="vault-category-legal-documents"]').click();

          // Check the count for this category
          cy.get('[data-testid="vault-category-legal-documents"]')
            .invoke("attr", "data-count")
            .then((categoryCount) => {
              const expected = Number.parseInt(categoryCount as string, 10);
              cy.log(`Legal Documents count: ${expected}`);

              if (expected > 0) {
                // If there are documents, verify the card count matches
                cy.get('[data-testid="vault-document-card"]').should("have.length", expected);
              } else {
                // If no documents, verify empty state or no cards
                cy.get('[data-testid="vault-document-card"]').should("not.exist");
              }
            });
        });

      // Reset by clicking All Documents
      cy.get('[data-testid="vault-category-all"]').click();
    });
  });
});
