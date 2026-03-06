/// <reference types="cypress" />

/**
 * Estate Activation E2E Tests
 *
 * Tests for the estate activation flow including:
 * - Sidebar navigation visibility for legacy tier users
 * - Activation page form elements and interactions
 * - Estate mode activation via test helper
 * - Estate dashboard display after activation
 * - Read-only banner on planning pages during estate mode
 * - Estate sidebar navigation between pages
 *
 * Uses Clerk testing tokens for automated authentication.
 * Uses cy.session() for faster test execution via auth caching.
 * All tests clean up estate data after themselves.
 *
 * Run with: pnpm test:e2e
 */

describe("Estate Activation", () => {
  beforeEach(() => {
    cy.signInWithSession("legacy"); // Estate requires Legacy tier
    cy.visit("/dashboard", { timeout: 30000 });
    cy.ensureOnboarded("/dashboard");
  });

  afterEach(() => {
    cy.cleanupEstateData();
  });

  it("should show estate nav item for legacy tier users", () => {
    cy.get('[data-testid="estate-admin-nav-item"]', { timeout: 10000 }).should("be.visible");
    cy.get('[data-testid="estate-admin-nav-item"]')
      .find("a")
      .should("have.attr", "href", "/estate");
  });

  it("should navigate to estate and show activation prompt when not activated", () => {
    cy.visit("/estate", { timeout: 30000 });
    // Should show the not-activated view with activation button
    cy.get('[data-testid="activate-estate-button"]', { timeout: 15000 }).should("be.visible");
    cy.contains("Estate Administration").should("be.visible");
    cy.contains("Begin Activation").should("be.visible");
  });

  it("should display activation form with required fields", () => {
    cy.visit("/estate/activate", { timeout: 30000 });

    // Verify form elements are present
    cy.get('[data-testid="deceased-name-input"]', { timeout: 15000 }).should("be.visible");
    cy.get('[data-testid="date-of-death-input"]').should("be.visible");
    cy.get('[data-testid="acknowledgment-checkbox"]').should("be.visible");
    cy.get('[data-testid="begin-estate-btn"]').should("be.visible");

    // Verify the submit button is disabled without required fields
    cy.get('[data-testid="begin-estate-btn"]').should("be.disabled");

    // Verify informational content is shown
    cy.contains("48-hour safety period").should("be.visible");
    cy.contains("Begin Estate Administration").should("be.visible");
  });

  it("should enable submit button only when required fields are filled", () => {
    cy.visit("/estate/activate", { timeout: 30000 });

    // Wait for form to load
    cy.get('[data-testid="deceased-name-input"]', { timeout: 15000 }).should("be.visible");

    // Button should be disabled initially
    cy.get('[data-testid="begin-estate-btn"]').should("be.disabled");

    // Fill in deceased name only - still disabled without acknowledgment
    cy.get('[data-testid="deceased-name-input"]').type("John Doe");
    cy.get('[data-testid="begin-estate-btn"]').should("be.disabled");

    // Check acknowledgment without name - clear and check
    cy.get('[data-testid="deceased-name-input"]').clear();
    cy.get('[data-testid="acknowledgment-checkbox"]').click();
    cy.get('[data-testid="begin-estate-btn"]').should("be.disabled");

    // Fill both - should be enabled
    cy.get('[data-testid="deceased-name-input"]').type("John Doe");
    cy.get('[data-testid="begin-estate-btn"]').should("not.be.disabled");
  });

  it("should show estate dashboard after activation", () => {
    cy.activateEstateMode();
    cy.visit("/estate", { timeout: 30000 });

    // Verify the active estate view is displayed
    cy.get('[data-testid="estate-stats-grid"]', { timeout: 15000 }).should("be.visible");
    cy.contains("Estate Overview").should("be.visible");
    cy.contains("Active").should("be.visible");
  });

  it("should show read-only banner on planning pages during estate mode", () => {
    cy.activateEstateMode();
    cy.visit("/vault", { timeout: 30000 });

    // Check for the read-only estate banner
    cy.get('[data-testid="estate-readonly-banner"]', { timeout: 15000 }).should("be.visible");
    cy.get('[data-testid="estate-readonly-banner"]').should(
      "contain",
      "Planning features are view-only",
    );

    // Verify the "View Estate" link is present
    cy.get('[data-testid="estate-banner-link"]')
      .should("be.visible")
      .and("have.attr", "href", "/estate");
  });

  it("should show estate status banner on estate pages", () => {
    cy.activateEstateMode();
    cy.visit("/estate", { timeout: 30000 });

    cy.get('[data-testid="estate-status-banner"]', { timeout: 15000 }).should("be.visible");
    cy.get('[data-testid="estate-status-banner"]').should(
      "contain",
      "Estate administration is active",
    );
  });

  it("should navigate between estate pages via sidebar", () => {
    cy.activateEstateMode();
    cy.visit("/estate", { timeout: 30000 });

    // Verify estate sidebar is present
    cy.get('[data-testid="estate-sidebar"]', { timeout: 15000 }).should("exist");

    // Verify sidebar nav items exist
    cy.get('[data-testid="estate-nav-overview"]').should("exist");
    cy.get('[data-testid="estate-nav-checklist"]').should("exist");
    cy.get('[data-testid="estate-nav-assets"]').should("exist");
    cy.get('[data-testid="estate-nav-documents"]').should("exist");
    cy.get('[data-testid="estate-nav-communications"]').should("exist");
    cy.get('[data-testid="estate-nav-distributions"]').should("exist");

    // Navigate to checklist via sidebar
    cy.get('[data-testid="estate-nav-checklist"]').find("a").click();
    cy.url({ timeout: 10000 }).should("include", "/estate/checklist");
  });
});
