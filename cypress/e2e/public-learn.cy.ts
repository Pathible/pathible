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
const TEST_ARTICLE_TITLE = `E2E Public Learn Test Article ${Date.now()}`;
const TEST_ARTICLE_SLUG = `e2e-public-learn-test-${Date.now()}`;

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

      cy.wait(1000);
    }

    // Handle select-plan redirect
    cy.url({ timeout: 10000 }).then((newUrl) => {
      if (newUrl.includes("/select-plan")) {
        cy.wait(2000);
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

    // Verify page loads with key elements
    cy.contains("Faith & Finances", { timeout: 15000 }).should("be.visible");
    cy.contains("Free Resources", { timeout: 10000 }).should("be.visible");
  });

  it("should display navigation elements on learn page", () => {
    cy.visit("/learn", { failOnStatusCode: false });

    // Verify header navigation exists
    cy.get("header", { timeout: 10000 }).should("be.visible");

    // Verify CTA button exists
    cy.contains("Start Your Journey", { timeout: 10000 }).should("exist");
  });

  it("should show subscriber content section with upgrade CTA", () => {
    cy.visit("/learn", { failOnStatusCode: false });

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

    // Check page title
    cy.title().should("include", "Learn");

    // Check meta description
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

    cy.contains("Article Not Found", { timeout: 15000 }).should("be.visible");
    cy.contains("Back to Learn").should("be.visible");
  });

  it("should have back link to /learn on article pages", () => {
    cy.visit("/learn/non-existent-article-slug-12345", { failOnStatusCode: false });

    // Even for not found, should have back link
    cy.contains("Back to Learn").should("be.visible").click();

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

  it("should create a public article and verify it shows on /learn", () => {
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
    cy.wait(2000);
    ensureUserOnboarded();

    // Grant admin role
    cy.grantAdminRole().should((result) => {
      expect(result.success).to.be.true;
    });

    // Navigate to content manager
    cy.visit("/admin/content", { timeout: 30000 });
    cy.contains("Content Manager", { timeout: 15000 }).should("be.visible");

    // Create a new public article
    cy.contains("New Article").click();
    cy.url({ timeout: 10000 }).should("include", "/admin/content/new");

    // Fill in article details
    cy.get("input#title").type(TEST_ARTICLE_TITLE);
    cy.get("input#slug").clear().type(TEST_ARTICLE_SLUG);
    cy.get("textarea#excerpt").type("This is a public test article for E2E testing.");
    cy.get("textarea#content").type(
      "## Introduction\n\nThis is public content that should be visible on the /learn page without authentication.",
    );

    // Set visibility to Public
    cy.contains("Visibility").should("be.visible");
    cy.get('button[role="combobox"]').filter(':contains("Subscribers")').first().click();
    cy.contains('[role="option"]', "Public").click();

    // Save and publish
    cy.contains("button", "Save Draft").click();
    cy.url({ timeout: 30000 }).should("match", /\/admin\/content$/);

    // Publish the article
    cy.contains("tr", TEST_ARTICLE_TITLE, { timeout: 15000 }).within(() => {
      cy.get('button[aria-label="More options"], button:has(svg)').last().click();
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

  it("should show visibility filter in admin content manager", () => {
    setupClerkTestingToken();
    cy.visit("/");
    cy.clerkLoaded();
    cy.clerkSignIn({
      strategy: "email_code",
      identifier: TEST_USER_EMAIL,
    });

    cy.visit("/dashboard", { failOnStatusCode: false });
    cy.wait(2000);
    ensureUserOnboarded();

    cy.grantAdminRole().should((result) => {
      expect(result.success).to.be.true;
    });

    cy.visit("/admin/content", { timeout: 30000 });
    cy.contains("Content Manager", { timeout: 15000 }).should("be.visible");

    // Verify visibility filter exists
    cy.contains("Filters").should("be.visible");
    cy.get('button[role="combobox"]').should("have.length.at.least", 3); // Status, Category, Visibility

    // Click on visibility filter
    cy.get('button[role="combobox"]').eq(2).click();
    cy.contains('[role="option"]', "All Visibility").should("be.visible");
    cy.contains('[role="option"]', "Public").should("be.visible");
    cy.contains('[role="option"]', "Subscribers Only").should("be.visible");
  });

  it("should toggle article visibility via dropdown menu", () => {
    setupClerkTestingToken();
    cy.visit("/");
    cy.clerkLoaded();
    cy.clerkSignIn({
      strategy: "email_code",
      identifier: TEST_USER_EMAIL,
    });

    cy.visit("/dashboard", { failOnStatusCode: false });
    cy.wait(2000);
    ensureUserOnboarded();

    cy.grantAdminRole().should((result) => {
      expect(result.success).to.be.true;
    });

    // Create a test article first
    cy.visit("/admin/content/new", { timeout: 30000 });
    cy.get("input#title").type(TEST_ARTICLE_TITLE);
    cy.get("input#slug").clear().type(TEST_ARTICLE_SLUG);
    cy.get("textarea#excerpt").type("Test visibility toggle article.");
    cy.get("textarea#content").type("Content for visibility toggle test.");
    cy.contains("button", "Save Draft").click();
    cy.url({ timeout: 30000 }).should("match", /\/admin\/content$/);

    // Open dropdown menu for the article
    cy.contains("tr", TEST_ARTICLE_TITLE, { timeout: 15000 }).within(() => {
      cy.get('button[aria-label="More options"], button:has(svg)').last().click();
    });

    // Verify visibility toggle options exist
    // Default is "subscribers", so "Make Public" should be visible
    cy.contains("Make Public").should("be.visible");

    // Click to make public
    cy.contains("Make Public").click();
    cy.contains("Article is now public", { timeout: 10000 }).should("be.visible");

    // Now toggle back - open menu again
    cy.contains("tr", TEST_ARTICLE_TITLE, { timeout: 15000 }).within(() => {
      cy.get('button[aria-label="More options"], button:has(svg)').last().click();
    });

    // Now "Subscribers Only" should be visible
    cy.contains("Subscribers Only").should("be.visible");
    cy.contains("Subscribers Only").click();
    cy.contains("Article is now subscribers-only", { timeout: 10000 }).should("be.visible");
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
    cy.wait(1000);
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
    cy.wait(2000);
    ensureUserOnboarded();

    cy.grantAdminRole().should((result) => {
      expect(result.success).to.be.true;
    });

    // Create long subscriber article
    const longContent = Array(300).fill("This is a test word.").join(" ");

    cy.visit("/admin/content/new", { timeout: 30000 });
    cy.get("input#title").type(TEST_ARTICLE_TITLE);
    cy.get("input#slug").clear().type(TEST_ARTICLE_SLUG);
    cy.get("textarea#excerpt").type("Test subscriber-only article for teaser testing.");
    cy.get("textarea#content").type(longContent.substring(0, 5000)); // Cypress has input limits

    // Keep as subscribers (default)
    cy.contains("button", "Save Draft").click();
    cy.url({ timeout: 30000 }).should("match", /\/admin\/content$/);

    // Publish
    cy.contains("tr", TEST_ARTICLE_TITLE, { timeout: 15000 }).within(() => {
      cy.get('button[aria-label="More options"], button:has(svg)').last().click();
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

    // Look for upgrade CTA (indicates truncated subscriber content)
    cy.contains("Unlock Full Article", { timeout: 10000 }).should("be.visible");
    cy.contains("Start Your Journey").should("be.visible");
  });
});
