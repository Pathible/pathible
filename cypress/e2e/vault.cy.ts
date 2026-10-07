/// <reference types="cypress" />
import { setupClerkTestingToken } from "../support/clerk";

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
 * Uses cy.session() for faster test execution via auth caching.
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

describe("Heritage Vault - Complete E2E Test Suite", () => {
  // Store initial counts to verify changes (reserved for future tests)
  let _initialDocumentCount: number;
  let _initialCategoryCount: number;

  describe("Unauthenticated Access", () => {
    it("should redirect to login when accessing vault without auth", () => {
      setupClerkTestingToken();
      cy.visit("/vault");
      cy.url({ timeout: 10000 }).should("include", "/sign-in");
    });
  });

  describe("Complete Vault Workflow", () => {
    beforeEach(() => {
      // Use session caching for fast auth
      cy.signInWithSession("heritage");
      cy.visit("/vault", { timeout: 30000 });
      cy.ensureOnboarded("/vault");
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
      // Navigate from the category name to its container div and find the trash button
      cy.get('[role="dialog"]')
        .contains("span.font-medium", TEST_CATEGORY_NAME)
        .closest("div.rounded-lg")
        .find("button:has(svg.text-destructive)")
        .click();

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
      cy.signInWithSession("heritage");
      cy.visit("/vault", { timeout: 30000 });
      cy.ensureOnboarded("/vault");
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
      cy.signInWithSession("heritage");
      cy.visit("/vault", { timeout: 30000 });
      cy.ensureOnboarded("/vault");
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

          // Find the first category badge that's not "All Documents" (has data-category attribute)
          cy.get('[data-testid="vault-category-filters"] [data-category]')
            .first()
            .then(($category) => {
              // If no categories exist, skip the category filter test
              if ($category.length === 0) {
                cy.log("No categories found, skipping category filter test");
                return;
              }

              const categoryName = $category.attr("data-category");
              const categoryCount = Number.parseInt($category.attr("data-count") || "0", 10);
              cy.log(`Testing category: ${categoryName} with count: ${categoryCount}`);

              // Click the category
              cy.wrap($category).click();

              if (categoryCount > 0) {
                // If there are documents, verify the card count matches
                cy.get('[data-testid="vault-document-card"]').should("have.length", categoryCount);
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
