/// <reference types="cypress" />
import { setupClerkTestingToken } from "../support/clerk";

/**
 * Admin Content Manager E2E Test
 *
 * Tests the admin content management functionality:
 * 1. Sign in with Clerk (test user)
 * 2. Grant admin role to test user
 * 3. Navigate to admin content manager
 * 4. Create a new article
 * 5. Edit the article
 * 6. Delete the article
 *
 * IMPORTANT: This test uses cy.grantAdminRole() to grant admin access.
 * Only works for test user emails (+clerk_test, etc.)
 * Uses cy.session() for faster test execution via auth caching.
 *
 * Run with: pnpm test:e2e --spec cypress/e2e/admin-content.cy.ts
 */

const TEST_USER_EMAIL = Cypress.expose("TEST_USER_EMAIL");
const TEST_ARTICLE_TITLE = `E2E Test Article ${Date.now()}`;
const TEST_ARTICLE_SLUG = `e2e-test-article-${Date.now()}`;

describe("Admin Content Manager E2E Test", () => {
  before(() => {
    // Verify test user email is configured
    expect(TEST_USER_EMAIL, "TEST_USER_EMAIL must be set").to.exist;
    expect(TEST_USER_EMAIL, "TEST_USER_EMAIL must contain +clerk_test").to.include("+clerk_test");
  });

  after(() => {
    // Final cleanup after all tests in this suite complete
    // This ensures leftover articles are cleaned up even if afterEach fails
    cy.log("**Final cleanup of test articles after all tests**");

    // Sign in to clean up articles
    setupClerkTestingToken();
    cy.visit("/dashboard", { failOnStatusCode: false });
    // Wait for dashboard to be ready (Convex client initialized)
    cy.get("body", { timeout: 10000 }).should("be.visible");

    cy.cleanupTestArticles().then((result) => {
      if (result.deletedCount > 0) {
        cy.log(`Final cleanup: removed ${result.deletedCount} test article(s)`);
      }
    });
  });

  afterEach(() => {
    // Clean up any test articles created during the test
    // This ensures no orphaned data even if test fails
    cy.log("**Cleaning up test articles after test**");
    cy.cleanupTestArticles().then((result) => {
      if (result.deletedCount > 0) {
        cy.log(`Cleaned up ${result.deletedCount} test article(s)`);
      }
    });
  });

  describe("Content Manager CRUD Operations", () => {
    beforeEach(() => {
      // Use session caching for fast auth
      cy.signInWithSession("heritage");

      // Navigate to dashboard first to ensure Convex is initialized
      cy.visit("/dashboard", { failOnStatusCode: false });
      cy.url({ timeout: 10000 }).should("include", "/");

      // Ensure user is onboarded
      cy.ensureOnboarded("/dashboard");

      // Grant admin role
      cy.grantAdminRole().should((result) => {
        expect(result.success).to.be.true;
      });

      // Navigate to admin content manager
      cy.visit("/admin/content", { timeout: 30000 });
      cy.contains("Content Manager", { timeout: 15000 }).should("be.visible");
    });

    it("should display the content manager page", () => {
      // Verify page elements
      cy.contains("Content Manager").should("be.visible");
      cy.contains("New Article").should("be.visible");
      cy.get('[data-testid="vault-search-filter"]').should("not.exist"); // No search on initial load
    });

    it("should create a new article", () => {
      cy.log("**Creating new article**");

      cy.contains("New Article").click();
      cy.url({ timeout: 10000 }).should("include", "/admin/content/new");
      cy.contains("New Article", { timeout: 10000 }).should("be.visible");

      // Fill in article details
      cy.get("input#title").type(TEST_ARTICLE_TITLE);
      cy.get("input#slug").clear().type(TEST_ARTICLE_SLUG);
      cy.get("textarea#excerpt").type("This is a test article created by E2E tests.");
      cy.get("textarea#content").type(
        "## Introduction\n\nThis is the content of the test article.\n\n- Point 1\n- Point 2\n- Point 3",
      );

      // Save the article and wait for success
      cy.contains("button", "Save Draft").click();

      // The form will redirect after successful save
      // Wait for the content list page and verify article appears
      cy.url({ timeout: 30000 }).should("match", /\/admin\/content$/);
      cy.contains(TEST_ARTICLE_TITLE, { timeout: 15000 }).should("be.visible");
      cy.contains("draft").should("be.visible");
    });

    it("should edit an article via the edit page", () => {
      cy.log("**Editing article from edit page**");

      // First check if any test article exists, create one if not
      cy.get("body").then(($body) => {
        if (!$body.text().includes("E2E Test Article")) {
          // Create a quick test article first
          cy.contains("New Article").click();
          cy.get("input#title").type(TEST_ARTICLE_TITLE);
          cy.get("input#slug").clear().type(TEST_ARTICLE_SLUG);
          cy.get("textarea#excerpt").type("Test article");
          cy.get("textarea#content").type("Test content");
          cy.contains("button", "Save Draft").click();
          cy.url({ timeout: 30000 }).should("match", /\/admin\/content$/);
        }
      });

      // Click on the article row to edit (clicking the row navigates to edit page)
      cy.contains("tr", /E2E Test Article/)
        .first()
        .click();

      // Should be on edit page
      cy.url({ timeout: 15000 }).should("match", /\/admin\/content\/[a-z0-9]+$/);
      cy.contains("Edit Article", { timeout: 10000 }).should("be.visible");

      // Update the excerpt
      cy.get("textarea#excerpt").clear().type("Updated test excerpt for E2E tests.");

      // Save changes and wait for redirect
      cy.contains("button", "Save Changes").click();

      // Wait for redirect to content list
      cy.url({ timeout: 30000 }).should("match", /\/admin\/content$/);
      cy.contains("Content Manager", { timeout: 15000 }).should("be.visible");
    });

    it("should delete an article from the edit page", () => {
      cy.log("**Deleting article from edit page**");

      // First check if any test article exists, create one if not
      cy.get("body").then(($body) => {
        if (!$body.text().includes("E2E Test Article")) {
          // Create a quick test article first
          cy.contains("New Article").click();
          cy.get("input#title").type(TEST_ARTICLE_TITLE);
          cy.get("input#slug").clear().type(TEST_ARTICLE_SLUG);
          cy.get("textarea#excerpt").type("Test article to delete");
          cy.get("textarea#content").type("Test content");
          cy.contains("button", "Save Draft").click();
          cy.url({ timeout: 30000 }).should("match", /\/admin\/content$/);
        }
      });

      // Click on the article row to go to edit page
      cy.contains("tr", /E2E Test Article/)
        .first()
        .click();

      // Should be on edit page
      cy.url({ timeout: 15000 }).should("match", /\/admin\/content\/[a-z0-9]+$/);
      cy.contains("Edit Article", { timeout: 10000 }).should("be.visible");

      // Click the Delete button in the header (top right)
      cy.contains("button", "Delete").click();

      // Confirm deletion in the AlertDialog
      cy.get('[role="alertdialog"]', { timeout: 10000 }).should("be.visible");
      cy.get('[role="alertdialog"]').within(() => {
        cy.contains("button", "Delete").click();
      });

      // Should redirect back to content list
      cy.url({ timeout: 30000 }).should("match", /\/admin\/content$/);
    });

    it("should filter articles by status", () => {
      // Verify filter controls exist
      cy.contains("Filters").should("be.visible");

      // Click on status filter
      cy.get('button[role="combobox"]').first().click();
      cy.contains('[role="option"]', "Draft").click();

      // Verify filter is applied by waiting for dropdown to close
      cy.get('[role="option"]').should("not.exist");

      // Reset filter
      cy.get('button[role="combobox"]').first().click();
      cy.contains('[role="option"]', "All Statuses").click();
    });
  });
});
