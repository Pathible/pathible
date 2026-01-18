/// <reference types="cypress" />
import { setupClerkTestingToken } from "@clerk/testing/cypress";

/**
 * Public Learn Feature E2E Tests
 *
 * Tests the public /learn page and article visibility:
 * 1. Public /learn page accessibility without authentication
 * 2. Public article detail page accessibility
 * 3. Subscriber article teaser display with upgrade CTA
 * 4. Admin visibility toggle functionality
 *
 * Run with: pnpm test:e2e --spec cypress/e2e/public-learn.cy.ts
 */

const TEST_USER_EMAIL = Cypress.env("TEST_USER_EMAIL");
// Use unique identifiers for each test run to avoid conflicts
const TEST_RUN_ID = Date.now();
const TEST_ARTICLE_TITLE = `E2E Public Learn Test Article ${TEST_RUN_ID}`;
const TEST_ARTICLE_SLUG = `e2e-public-learn-test-${TEST_RUN_ID}`;

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
      cy.get("input#householdName").clear().type(`Learn Test Household ${TEST_RUN_ID}`);
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

    // Verify navigation exists - the layout uses 'nav' element, not 'header'
    cy.get("nav", { timeout: 10000 }).should("be.visible");

    // Verify CTA button exists (in the subscriber section or CTA section)
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

describe("Admin Visibility Toggle - Content Management", () => {
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
    // Clean up test articles
    cy.log("**Cleaning up test articles after test**");
    cy.cleanupTestArticles().then((result) => {
      if (result.deletedCount > 0) {
        cy.log(`Cleaned up ${result.deletedCount} test article(s)`);
      }
    });
  });

  it("should create an article and toggle visibility via dropdown menu", () => {
    // Sign in as admin
    setupClerkTestingToken();
    cy.visit("/");
    cy.clerkLoaded();
    cy.clerkSignIn({
      strategy: "email_code",
      identifier: TEST_USER_EMAIL,
    });

    // Wait for Convex client
    cy.visit("/dashboard", { failOnStatusCode: false });
    cy.get("body", { timeout: 15000 }).should("be.visible");
    ensureUserOnboarded();

    // Grant admin role
    cy.grantAdminRole().should((result) => {
      expect(result.success).to.be.true;
    });

    // Navigate to content manager
    cy.visit("/admin/content", { timeout: 30000 });
    cy.contains("Content Manager", { timeout: 15000 }).should("be.visible");

    // Create a new article
    cy.contains("New Article").click();
    cy.url({ timeout: 10000 }).should("include", "/admin/content/new");

    // Fill in article details
    // Note: The article editor does NOT have a visibility selector
    // Visibility is set via the dropdown menu in the content list
    cy.get("input#title", { timeout: 10000 }).should("be.visible").type(TEST_ARTICLE_TITLE);
    cy.get("input#slug").clear().type(TEST_ARTICLE_SLUG);
    cy.get("textarea#excerpt").type("This is a test article for E2E testing visibility toggle.");
    cy.get("textarea#content").type(
      "## Introduction\n\nThis is content for testing visibility controls.",
    );

    // Save as draft (default status is draft)
    cy.contains("button", "Save Draft").click();

    // Wait for redirect back to content list
    cy.url({ timeout: 30000 }).should("match", /\/admin\/content$/);
    cy.contains("Content Manager", { timeout: 15000 }).should("be.visible");

    // Find the article row and open dropdown menu
    cy.contains("tr", TEST_ARTICLE_TITLE, { timeout: 15000 }).within(() => {
      // The MoreHorizontal icon button
      cy.get("button").last().click();
    });

    // Default visibility is "subscribers", so "Make Public" should be visible
    cy.contains("Make Public", { timeout: 5000 }).should("be.visible");

    // Click to make public
    cy.contains("Make Public").click();
    cy.contains("Article is now public", { timeout: 10000 }).should("be.visible");

    // Now toggle back - open menu again
    cy.contains("tr", TEST_ARTICLE_TITLE, { timeout: 15000 }).within(() => {
      cy.get("button").last().click();
    });

    // Now "Subscribers Only" should be visible (since it's currently public)
    cy.contains("Subscribers Only", { timeout: 5000 }).should("be.visible");
    cy.contains("Subscribers Only").click();
    cy.contains("Article is now subscribers-only", { timeout: 10000 }).should("be.visible");
  });

  it("should show visibility filter in admin content manager", () => {
    setupClerkTestingToken();
    cy.visit("/");
    cy.clerkLoaded();
    cy.clerkSignIn({
      strategy: "email_code",
      identifier: TEST_USER_EMAIL,
    });

    cy.visit("/dashboard", { failOnStatusCode: false });
    cy.get("body", { timeout: 15000 }).should("be.visible");
    ensureUserOnboarded();

    cy.grantAdminRole().should((result) => {
      expect(result.success).to.be.true;
    });

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
    // Sign in as admin
    setupClerkTestingToken();
    cy.visit("/");
    cy.clerkLoaded();
    cy.clerkSignIn({
      strategy: "email_code",
      identifier: TEST_USER_EMAIL,
    });

    // Wait for Convex client
    cy.visit("/dashboard", { failOnStatusCode: false });
    cy.get("body", { timeout: 15000 }).should("be.visible");
    ensureUserOnboarded();

    // Grant admin role
    cy.grantAdminRole().should((result) => {
      expect(result.success).to.be.true;
    });

    // Navigate to content manager
    cy.visit("/admin/content", { timeout: 30000 });
    cy.contains("Content Manager", { timeout: 15000 }).should("be.visible");

    // Create a new article
    cy.contains("New Article").click();
    cy.url({ timeout: 10000 }).should("include", "/admin/content/new");

    // Fill in article details
    cy.get("input#title", { timeout: 10000 }).should("be.visible").type(TEST_ARTICLE_TITLE);
    cy.get("input#slug").clear().type(TEST_ARTICLE_SLUG);
    cy.get("textarea#excerpt").type("This is a public test article for E2E testing.");
    cy.get("textarea#content").type(
      "## Introduction\n\nThis is public content that should be visible on the /learn page without authentication.",
    );

    // Save draft first
    cy.contains("button", "Save Draft").click();

    // Wait for redirect back to content list
    cy.url({ timeout: 30000 }).should("match", /\/admin\/content$/);
    cy.contains("Content Manager", { timeout: 15000 }).should("be.visible");

    // Make the article public via dropdown
    cy.contains("tr", TEST_ARTICLE_TITLE, { timeout: 15000 }).within(() => {
      cy.get("button").last().click();
    });
    cy.contains("Make Public").click();
    cy.contains("Article is now public", { timeout: 10000 }).should("be.visible");

    // Now publish the article
    cy.contains("tr", TEST_ARTICLE_TITLE, { timeout: 15000 }).within(() => {
      cy.get("button").last().click();
    });
    cy.contains("Publish").click();
    cy.contains("Article published", { timeout: 10000 }).should("be.visible");

    // Sign out and verify article appears on public /learn page
    cy.clerkSignOut();
    cy.clearCookies();
    cy.clearLocalStorage();

    cy.visit("/learn", { failOnStatusCode: false });
    cy.contains(TEST_ARTICLE_TITLE, { timeout: 15000 }).should("be.visible");
  });
});

describe("Subscriber Article Teaser - Content Gating", () => {
  before(() => {
    expect(TEST_USER_EMAIL, "TEST_USER_EMAIL must be set").to.exist;
  });

  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.window().then((win) => {
      win.sessionStorage.clear();
    });
  });

  afterEach(() => {
    // Sign back in to clean up
    setupClerkTestingToken();
    cy.visit("/dashboard", { failOnStatusCode: false });
    cy.get("body", { timeout: 15000 }).should("be.visible");
    cy.cleanupTestArticles();
  });

  it("should show truncated content with upgrade CTA for subscriber articles", () => {
    // First, create a subscriber-only article as admin
    setupClerkTestingToken();
    cy.visit("/");
    cy.clerkLoaded();
    cy.clerkSignIn({
      strategy: "email_code",
      identifier: TEST_USER_EMAIL,
    });

    cy.visit("/dashboard", { failOnStatusCode: false });
    cy.get("body", { timeout: 15000 }).should("be.visible");
    ensureUserOnboarded();

    cy.grantAdminRole().should((result) => {
      expect(result.success).to.be.true;
    });

    // Create long subscriber article (visibility defaults to "subscribers")
    const longContent = Array(300).fill("This is a test word.").join(" ");

    cy.visit("/admin/content/new", { timeout: 30000 });
    cy.get("input#title", { timeout: 10000 }).should("be.visible").type(TEST_ARTICLE_TITLE);
    cy.get("input#slug").clear().type(TEST_ARTICLE_SLUG);
    cy.get("textarea#excerpt").type("Test subscriber-only article for teaser testing.");
    cy.get("textarea#content").type(longContent.substring(0, 5000)); // Cypress has input limits

    // Keep as subscribers (default) - no visibility selector in article editor
    cy.contains("button", "Save Draft").click();
    cy.url({ timeout: 30000 }).should("match", /\/admin\/content$/);

    // Publish the article
    cy.contains("tr", TEST_ARTICLE_TITLE, { timeout: 15000 }).within(() => {
      cy.get("button").last().click();
    });
    cy.contains("Publish").click();
    cy.contains("Article published", { timeout: 10000 }).should("be.visible");

    // Sign out and visit the article
    cy.clerkSignOut();
    cy.clearCookies();
    cy.clearLocalStorage();

    cy.visit(`/learn/${TEST_ARTICLE_SLUG}`, { failOnStatusCode: false });

    // Should show article with truncated content and upgrade CTA
    cy.contains(TEST_ARTICLE_TITLE, { timeout: 15000 }).should("be.visible");

    // Look for upgrade CTA - the ArticleUpgradeCTA component uses "Continue Reading" and "Get Started"
    // This appears when article.isTruncated is true
    cy.contains("Continue Reading", { timeout: 10000 }).should("be.visible");
    cy.contains("Get Started").should("be.visible");
  });
});
