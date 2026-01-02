/// <reference types="cypress" />
import { setupClerkTestingToken } from "@clerk/testing/cypress";

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
 *
 * Run with: pnpm test:e2e --spec cypress/e2e/admin-content.cy.ts
 */

const TEST_USER_EMAIL = Cypress.env("TEST_USER_EMAIL");
const TEST_ARTICLE_TITLE = `E2E Test Article ${Date.now()}`;
const TEST_ARTICLE_SLUG = `e2e-test-article-${Date.now()}`;

/**
 * Helper to ensure user is onboarded before testing
 */
function ensureUserOnboarded() {
  cy.url({ timeout: 15000 }).then((url) => {
    if (url.includes("/onboarding")) {
      cy.log("User needs onboarding - completing now");
      // Complete profile step
      cy.contains("Complete Your Profile", { timeout: 10000 }).should("be.visible");
      cy.get("input#firstName").clear().type("E2E");
      cy.get("input#lastName").clear().type("Admin");
      cy.contains("button", "Next").click();
      cy.contains("Profile updated!", { timeout: 10000 }).should("be.visible");

      // Complete household step
      cy.contains("Create Your First Household", { timeout: 10000 }).should("be.visible");
      cy.get("input#householdName").clear().type(`Admin Test Household ${Date.now()}`);
      cy.contains("button", "Next").click();
      cy.contains("Household created!", { timeout: 10000 }).should("be.visible");

      // Complete goals step
      cy.contains("What brings you to Pathible?", { timeout: 10000 }).should("be.visible");
      cy.get('button[role="checkbox"]').first().click();
      cy.contains("button", "Complete Setup").click();
      cy.contains("Onboarding complete!", { timeout: 10000 }).should("be.visible");

      // Wait for redirect
      cy.wait(1000);
    }

    // Handle select-plan redirect
    cy.url({ timeout: 10000 }).then((newUrl) => {
      if (newUrl.includes("/select-plan")) {
        // Wait for potential auto-redirect for test users with plans
        cy.wait(2000);
      }
    });
  });
}

describe("Admin Content Manager E2E Test", () => {
  before(() => {
    // Verify test user email is configured
    expect(TEST_USER_EMAIL, "TEST_USER_EMAIL must be set").to.exist;
    expect(TEST_USER_EMAIL, "TEST_USER_EMAIL must contain +clerk_test").to.include("+clerk_test");
  });

  beforeEach(() => {
    // Clear browser state
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.window().then((win) => {
      win.sessionStorage.clear();
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
      // Sign in
      setupClerkTestingToken();
      cy.visit("/");
      cy.clerkLoaded();
      cy.clerkSignIn({
        strategy: "email_code",
        identifier: TEST_USER_EMAIL,
      });

      // Wait for Convex client to initialize
      cy.visit("/dashboard", { failOnStatusCode: false });
      cy.wait(2000);

      // Ensure user is onboarded
      ensureUserOnboarded();

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

    it("should create, edit, and delete an article", () => {
      // =========================================================================
      // STEP 1: Create a new article
      // =========================================================================
      cy.log("**STEP 1: Creating new article**");

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

      // Select category (Faith & Stewardship is default)
      // Set status to draft (default)

      // Save the article and wait for success
      cy.contains("button", "Save Draft").click();

      // The form will redirect after successful save
      // Wait for the content list page and verify article appears
      cy.url({ timeout: 30000 }).should("not.include", "/new");
      cy.contains(TEST_ARTICLE_TITLE, { timeout: 15000 }).should("be.visible");
      cy.contains("draft").should("be.visible");

      // =========================================================================
      // STEP 2: Edit the article
      // =========================================================================
      cy.log("**STEP 2: Editing article**");

      // Click on the article row to edit (clicking the row navigates to edit page)
      cy.contains("tr", TEST_ARTICLE_TITLE).click();

      // Should be on edit page
      cy.url({ timeout: 15000 }).should("match", /\/admin\/content\/[a-z0-9]+$/);
      cy.contains("Edit Article", { timeout: 10000 }).should("be.visible");

      // Update the title
      cy.get("input#title").clear().type(`${TEST_ARTICLE_TITLE} - Updated`);

      // Change status to published
      cy.get('button[role="combobox"]').last().click();
      cy.contains('[role="option"]', "Published").click();

      // Save changes and wait for redirect
      cy.contains("button", "Save Changes").click();

      // Wait for redirect to content list and verify updated article
      cy.url({ timeout: 30000 }).should("match", /\/admin\/content$/);
      cy.contains(`${TEST_ARTICLE_TITLE} - Updated`, { timeout: 15000 }).should("be.visible");
      cy.contains("published").should("be.visible");

      // =========================================================================
      // STEP 3: Delete the article
      // =========================================================================
      cy.log("**STEP 3: Deleting article**");

      // Click on the article row to delete (via dropdown)
      cy.contains("tr", `${TEST_ARTICLE_TITLE} - Updated`).within(() => {
        cy.get('button[aria-haspopup="menu"]').click();
      });
      cy.contains('[role="menuitem"]', "Delete").click();

      // Confirm deletion in the AlertDialog
      cy.get('[role="alertdialog"]', { timeout: 10000 }).should("be.visible");
      cy.get('[role="alertdialog"]').contains("button", "Delete").click();

      // Verify article is deleted (wait for it to disappear from the list)
      cy.contains(`${TEST_ARTICLE_TITLE} - Updated`, { timeout: 15000 }).should("not.exist");
    });

    it("should filter articles by status", () => {
      // Verify filter controls exist
      cy.contains("Filters").should("be.visible");

      // Click on status filter
      cy.get('button[role="combobox"]').first().click();
      cy.contains('[role="option"]', "Draft").click();

      // Verify filter is applied (URL might change or table updates)
      cy.wait(500); // Wait for filter to apply

      // Reset filter
      cy.get('button[role="combobox"]').first().click();
      cy.contains('[role="option"]', "All Statuses").click();
    });
  });
});
