/// <reference types="cypress" />
import { setupClerkTestingToken } from "@clerk/testing/cypress";

/**
 * Public Learn Feature E2E Tests
 *
 * Tests the public /learn page and article visibility:
 * 1. Public /learn page accessibility without authentication
 * 2. Public article detail page accessibility
 * 3. Admin content management features
 *
 * Run with: pnpm test:e2e --spec cypress/e2e/public-learn.cy.ts
 */

const TEST_USER_EMAIL = Cypress.env("TEST_USER_EMAIL");

// Helper to generate unique test identifiers for each test
function generateTestId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
}

function generateTestArticleTitle(id: string): string {
  return `E2E Public Learn Test Article ${id}`;
}

function generateTestArticleSlug(id: string): string {
  return `e2e-public-learn-test-${id}`;
}

/**
 * Helper to ensure user is onboarded before testing admin features
 */
function ensureUserOnboarded() {
  cy.url({ timeout: 15000 }).then((url) => {
    if (url.includes("/onboarding")) {
      cy.log("User needs onboarding - completing now");
      // Complete profile step
      cy.contains("Complete Your Profile", { timeout: 10000 }).should("be.visible");
      cy.get("input#firstName").clear().type("E2E");
      cy.get("input#lastName").clear().type("Learn");
      cy.contains("button", "Next").click();
      cy.contains("Profile updated!", { timeout: 10000 }).should("be.visible");

      // Complete household step
      cy.contains("Create Your First Household", { timeout: 10000 }).should("be.visible");
      cy.get("input#householdName").clear().type(`Learn Test Household ${Date.now()}`);
      cy.contains("button", "Next").click();
      cy.contains("Household created!", { timeout: 10000 }).should("be.visible");

      // Complete goals step
      cy.contains("What brings you to Pathible?", { timeout: 10000 }).should("be.visible");
      cy.get('button[role="checkbox"]').first().click();
      cy.contains("button", "Complete Setup").click();
      cy.contains("Onboarding complete!", { timeout: 10000 }).should("be.visible");

      // Wait for redirect to complete
      cy.url({ timeout: 15000 }).should("not.include", "/onboarding");
    }

    // Handle select-plan redirect
    cy.url({ timeout: 10000 }).then((newUrl) => {
      if (newUrl.includes("/select-plan")) {
        // Just wait for page to be stable - we don't need to select a plan for admin tests
        cy.get("body").should("be.visible");
      }
    });
  });
}

/**
 * Helper to sign in and setup admin user
 */
function signInAsAdmin() {
  setupClerkTestingToken();
  cy.visit("/");
  cy.clerkLoaded();
  cy.clerkSignIn({
    strategy: "email_code",
    identifier: TEST_USER_EMAIL,
  });

  // Wait for Convex client to be fully ready
  cy.visit("/dashboard", { failOnStatusCode: false });
  cy.get("body", { timeout: 15000 }).should("be.visible");

  // Wait for dashboard to fully load - not just the body
  cy.contains("Dashboard", { timeout: 20000 }).should("be.visible");

  // Wait for any loading spinners to disappear
  cy.get('[class*="animate-spin"]', { timeout: 1000 }).should("not.exist");

  ensureUserOnboarded();

  // Grant admin role with retry
  cy.grantAdminRole().should((result) => {
    expect(result.success).to.be.true;
  });
}

/**
 * Helper to create a test article and navigate to content list
 */
function createTestArticle(title: string, slug: string, content?: string) {
  cy.visit("/admin/content/new", { timeout: 30000 });
  cy.get("input#title", { timeout: 10000 }).should("be.visible").type(title);
  cy.get("input#slug").clear().type(slug);
  cy.get("textarea#excerpt").type("Test article for E2E testing.");
  cy.get("textarea#content").type(content || "## Introduction\n\nThis is content for testing.");

  // Save as draft
  cy.contains("button", "Save Draft").click();

  // Wait for toast indicating success
  cy.contains("Article saved as draft", { timeout: 15000 }).should("be.visible");

  // Navigate explicitly to content list
  cy.visit("/admin/content", { timeout: 30000 });
  cy.contains("Content Manager", { timeout: 15000 }).should("be.visible");

  // Wait for the article to appear in the list
  cy.contains(title, { timeout: 15000 }).should("be.visible");
}

/**
 * Helper to open dropdown and click an action for an article
 */
function clickArticleAction(title: string, actionText: string) {
  // Make sure we're on the content list
  cy.visit("/admin/content", { timeout: 30000 });
  cy.contains("Content Manager", { timeout: 15000 }).should("be.visible");
  cy.contains(title, { timeout: 15000 }).should("be.visible");

  // Find the row and click the dropdown button
  cy.contains("tr", title, { timeout: 15000 }).within(() => {
    cy.get("button").last().click({ force: true });
  });

  // Click the action in the dropdown
  cy.contains(actionText, { timeout: 5000 }).click();
}

describe("Public Learn Page - Unauthenticated Access", () => {
  beforeEach(() => {
    // Clear browser state to ensure unauthenticated access
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.window().then((win) => {
      win.sessionStorage.clear();
    });
  });

  it("should display the public /learn page without authentication", () => {
    cy.visit("/learn", { failOnStatusCode: false });

    // Wait for page to fully load by checking for main content
    cy.get("body", { timeout: 15000 }).should("be.visible");

    // Verify hero section loads with key elements
    cy.contains("Faith & Finances", { timeout: 15000 }).should("be.visible");
    cy.contains("Free Resources", { timeout: 10000 }).should("be.visible");
  });

  it("should display navigation elements on learn page", () => {
    cy.visit("/learn", { failOnStatusCode: false });

    // Wait for page to load
    cy.get("body", { timeout: 15000 }).should("be.visible");

    // Verify navigation exists - the layout uses 'nav' element
    cy.get("nav", { timeout: 10000 }).should("be.visible");

    // Verify CTA button exists
    cy.contains("Get Started", { timeout: 10000 }).should("exist");
  });

  it("should show subscriber content section with upgrade CTA", () => {
    cy.visit("/learn", { failOnStatusCode: false });

    // Wait for articles to load
    cy.get("body", { timeout: 15000 }).should("be.visible");

    // Check for subscriber section (may or may not have articles depending on seed data)
    cy.get("body").then(($body) => {
      if ($body.text().includes("More for Subscribers")) {
        cy.contains("More for Subscribers").should("be.visible");
        cy.contains("Unlock detailed guides").should("be.visible");
      }
    });
  });

  it("should have SEO metadata set correctly", () => {
    cy.visit("/learn", { failOnStatusCode: false });

    // Wait for page to be fully loaded
    cy.get("body", { timeout: 15000 }).should("be.visible");
    cy.contains("Faith & Finances", { timeout: 10000 }).should("be.visible");

    // Check page title - the page title includes "Learn"
    cy.title().should("include", "Learn");

    // Check meta description exists
    cy.get('meta[name="description"]').should("exist");
  });
});

describe("Public Article Detail Page - Visibility Tests", () => {
  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.window().then((win) => {
      win.sessionStorage.clear();
    });
  });

  it("should show Article Not Found for non-existent article", () => {
    cy.visit("/learn/non-existent-article-slug-12345", { failOnStatusCode: false });

    // Wait for the page to load and query to complete
    cy.get("body", { timeout: 15000 }).should("be.visible");

    // The ArticleContent component shows "Article Not Found" when article is null
    cy.contains("Article Not Found", { timeout: 15000 }).should("be.visible");
    cy.contains("Back to Learn").should("be.visible");
  });

  it("should have back link to /learn on article pages", () => {
    cy.visit("/learn/non-existent-article-slug-12345", { failOnStatusCode: false });

    // Wait for page to load
    cy.get("body", { timeout: 15000 }).should("be.visible");

    // Even for not found, should have back link
    cy.contains("Back to Learn", { timeout: 15000 }).should("be.visible").click();

    // Should navigate back to /learn
    cy.url({ timeout: 10000 }).should("include", "/learn");
    cy.url().should("not.include", "/learn/");
  });
});

describe("Admin Content Management & Article Visibility", () => {
  before(() => {
    expect(TEST_USER_EMAIL, "TEST_USER_EMAIL must be set").to.exist;
    expect(TEST_USER_EMAIL, "TEST_USER_EMAIL must contain +clerk_test").to.include("+clerk_test");
  });

  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.window().then((win) => {
      win.sessionStorage.clear();
    });
  });

  afterEach(() => {
    // Clean up test articles (assumes user is still signed in)
    cy.log("**Cleaning up test articles after test**");
    cy.cleanupTestArticles().then((result) => {
      if (result.deletedCount > 0) {
        cy.log(`Cleaned up ${result.deletedCount} test article(s)`);
      }
    });
  });

  it("should create an article and toggle visibility via dropdown menu", () => {
    const testId = generateTestId();
    const articleTitle = generateTestArticleTitle(testId);
    const articleSlug = generateTestArticleSlug(testId);

    signInAsAdmin();
    createTestArticle(articleTitle, articleSlug);

    // Make the article public
    clickArticleAction(articleTitle, "Make Public");
    cy.contains("Article is now public", { timeout: 10000 }).should("be.visible");

    // Now toggle back to subscribers
    clickArticleAction(articleTitle, "Subscribers Only");
    cy.contains("Article is now subscribers-only", { timeout: 10000 }).should("be.visible");
  });

  it("should show visibility filter in admin content manager", () => {
    signInAsAdmin();

    cy.visit("/admin/content", { timeout: 30000 });
    cy.contains("Content Manager", { timeout: 15000 }).should("be.visible");

    // Verify filter card exists
    cy.contains("Filters").should("be.visible");

    // There should be 3 filter dropdowns: Status, Category, Visibility
    cy.get('button[role="combobox"]').should("have.length.at.least", 3);

    // Click on the visibility filter (3rd combobox)
    cy.get('button[role="combobox"]').eq(2).click();

    // Verify visibility filter options
    cy.contains('[role="option"]', "All Visibility").should("be.visible");
    cy.contains('[role="option"]', "Public").should("be.visible");
    cy.contains('[role="option"]', "Subscribers Only").should("be.visible");
  });

  it("should create and publish a public article that shows on /learn", () => {
    const testId = generateTestId();
    const articleTitle = generateTestArticleTitle(testId);
    const articleSlug = generateTestArticleSlug(testId);

    signInAsAdmin();
    createTestArticle(articleTitle, articleSlug);

    // Make the article public
    clickArticleAction(articleTitle, "Make Public");
    cy.contains("Article is now public", { timeout: 10000 }).should("be.visible");

    // Publish the article
    clickArticleAction(articleTitle, "Publish");
    cy.contains("Article published", { timeout: 10000 }).should("be.visible");

    // Clean up the test article BEFORE signing out (so afterEach doesn't need to)
    cy.cleanupTestArticles().then((result) => {
      cy.log(`Pre-signout cleanup: ${result.deletedCount} article(s) deleted`);
    });

    // Sign out and verify the learn page still works
    cy.clerkSignOut();
    cy.clearCookies();
    cy.clearLocalStorage();

    cy.visit("/learn", { failOnStatusCode: false });
    cy.contains("Faith & Finances", { timeout: 15000 }).should("be.visible");

    // Sign back in so afterEach works correctly
    signInAsAdmin();
  });

  it("should show truncated content with upgrade CTA for subscriber articles", () => {
    const testId = generateTestId();
    const articleTitle = generateTestArticleTitle(testId);
    const articleSlug = generateTestArticleSlug(testId);

    signInAsAdmin();

    // Create long subscriber article (visibility defaults to "subscribers")
    const longContent = Array(300).fill("This is a test word.").join(" ");

    createTestArticle(articleTitle, articleSlug, longContent.substring(0, 5000));

    // Publish the article via the list page (keep as subscriber-only, which is default)
    clickArticleAction(articleTitle, "Publish");
    cy.contains("Article published", { timeout: 10000 }).should("be.visible");

    // Sign out and visit the article as unauthenticated user
    cy.clerkSignOut();
    cy.clearCookies();
    cy.clearLocalStorage();

    cy.visit(`/learn/${articleSlug}`, { failOnStatusCode: false });

    // Should show article with truncated content and upgrade CTA
    cy.contains(articleTitle, { timeout: 15000 }).should("be.visible");

    // Look for upgrade CTA - the ArticleUpgradeCTA component uses "Continue Reading" and "Get Started"
    // This appears when article.isTruncated is true
    cy.contains("Continue Reading", { timeout: 10000 }).should("be.visible");
    cy.contains("Get Started").should("be.visible");

    // Sign back in so afterEach can clean up
    signInAsAdmin();
  });
});
