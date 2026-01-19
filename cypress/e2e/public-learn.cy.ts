/// <reference types="cypress" />

/**
 * Public Learn Feature E2E Tests
 *
 * Tests the public /learn page accessibility WITHOUT authentication:
 * 1. Public /learn page is accessible without login
 * 2. Public article detail pages are accessible
 * 3. Navigation works correctly
 *
 * These tests verify that the learn feature is publicly available.
 * NO AUTHENTICATION is required for these tests.
 *
 * Run with: pnpm test:e2e --spec cypress/e2e/public-learn.cy.ts
 */

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
    cy.contains("Clarity for your", { timeout: 15000 }).should("be.visible");
    cy.contains("family", { timeout: 10000 }).should("be.visible");
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
    cy.contains("Clarity for your", { timeout: 10000 }).should("be.visible");

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

  it("should display a seeded public article without authentication", () => {
    // Visit the learn page first to find an article
    cy.visit("/learn", { failOnStatusCode: false });
    cy.get("body", { timeout: 15000 }).should("be.visible");

    // Check if there are any articles to click on
    cy.get("body").then(($body) => {
      // Look for article cards/links - they should be anchor tags within the articles section
      const articleLinks = $body.find('a[href^="/learn/"]');

      if (articleLinks.length > 0) {
        // Click the first article
        cy.get('a[href^="/learn/"]').first().click();

        // Should be on an article page
        cy.url({ timeout: 10000 }).should("match", /\/learn\/.+/);

        // Should show article content (title at minimum)
        cy.get("h1", { timeout: 10000 }).should("be.visible");

        // Should have back link
        cy.contains("Back to Learn").should("be.visible");
      } else {
        // No articles seeded - just verify the page loads correctly
        cy.log("No seeded articles found - skipping article detail test");
      }
    });
  });
});
