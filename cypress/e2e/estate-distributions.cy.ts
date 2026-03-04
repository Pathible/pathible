/// <reference types="cypress" />

/**
 * Estate Distributions E2E Tests
 *
 * Tests for the estate distributions page including:
 * - Page load and content display
 * - Distribution summary display
 * - Record distribution form
 * - Distribution creation
 * - By-beneficiary view
 *
 * Uses Clerk testing tokens for automated authentication.
 * All tests clean up estate data after themselves.
 */

const TEST_DIST_ASSET_NAME = `E2E Dist Asset ${Date.now()}`;
const TEST_BENEFICIARY = `E2E Beneficiary ${Date.now()}`;

describe("Estate Distributions", () => {
  beforeEach(() => {
    cy.signInWithSession("legacy");
    cy.visit("/dashboard", { timeout: 30000 });
    cy.ensureOnboarded("/dashboard");
    cy.activateEstateMode();
  });

  afterEach(() => {
    cy.cleanupEstateData();
  });

  it("should load the distributions page with content", () => {
    cy.visit("/estate/distributions", { timeout: 30000 });
    cy.get('[data-testid="distributions-content"]', { timeout: 10000 }).should("be.visible");
    cy.contains("Distributions").should("be.visible");
    cy.contains("Track asset distributions to beneficiaries").should("be.visible");
  });

  it("should display distribution summary after recording a distribution", () => {
    // First create an asset (distributions require an asset)
    cy.visit("/estate/assets", { timeout: 30000 });
    cy.get('[data-testid="assets-content"]', { timeout: 10000 }).should("be.visible");

    cy.get('[data-testid="add-asset-button"]').click();
    cy.get('[role="dialog"]').should("be.visible");
    cy.get('[data-testid="asset-name-input"]').type(TEST_DIST_ASSET_NAME);
    cy.get('[data-testid="asset-value-input"]').type("100000");
    cy.get('[data-testid="asset-dialog-submit"]').click();
    cy.get('[role="dialog"]').should("not.exist");

    // Navigate to distributions and record one
    cy.visit("/estate/distributions", { timeout: 30000 });
    cy.get('[data-testid="distributions-content"]', { timeout: 10000 }).should("be.visible");

    cy.get('[data-testid="record-distribution-button"]').click();
    cy.get('[role="dialog"]').should("be.visible");

    // Select the asset
    cy.get('[data-testid="dist-asset-select"]').click();
    cy.get('[role="listbox"]').should("be.visible");
    cy.contains('[role="option"]', TEST_DIST_ASSET_NAME).click();

    cy.get('[data-testid="dist-beneficiary-input"]').type(TEST_BENEFICIARY);
    cy.get('[data-testid="dist-relationship-input"]').type("Spouse");
    cy.get('[data-testid="dist-value-input"]').type("50000");
    cy.get('[data-testid="dist-description-input"]').type("E2E test distribution");

    cy.get('[data-testid="dist-form-submit"]').click();
    cy.get('[role="dialog"]').should("not.exist");

    // Distribution summary should now be visible
    cy.get('[data-testid="distribution-summary"]', { timeout: 10000 }).should("be.visible");
    cy.contains("Total Distributions").should("be.visible");
    cy.contains("Total Value Distributed").should("be.visible");
  });

  it("should open the record distribution form", () => {
    cy.visit("/estate/distributions", { timeout: 30000 });
    cy.get('[data-testid="distributions-content"]', { timeout: 10000 }).should("be.visible");

    cy.get('[data-testid="record-distribution-button"]').click();
    cy.get('[role="dialog"]').should("be.visible");
    cy.contains("Record Distribution").should("be.visible");
    cy.contains("Record an asset distribution to a beneficiary").should("be.visible");

    // Verify form fields exist
    cy.get('[data-testid="dist-asset-select"]').should("be.visible");
    cy.get('[data-testid="dist-beneficiary-input"]').should("be.visible");
    cy.get('[data-testid="dist-relationship-input"]').should("be.visible");
    cy.get('[data-testid="dist-value-input"]').should("be.visible");
    cy.get('[data-testid="dist-method-select"]').should("be.visible");
    cy.get('[data-testid="dist-date-input"]').should("be.visible");
    cy.get('[data-testid="dist-description-input"]').should("be.visible");
    cy.get('[data-testid="dist-notes-input"]').should("be.visible");
    cy.get('[data-testid="dist-form-submit"]').should("be.visible");
  });

  it("should fill in distribution details and submit", () => {
    // Create an asset first
    cy.visit("/estate/assets", { timeout: 30000 });
    cy.get('[data-testid="assets-content"]', { timeout: 10000 }).should("be.visible");

    cy.get('[data-testid="add-asset-button"]').click();
    cy.get('[role="dialog"]').should("be.visible");
    cy.get('[data-testid="asset-name-input"]').type(TEST_DIST_ASSET_NAME);
    cy.get('[data-testid="asset-value-input"]').type("75000");
    cy.get('[data-testid="asset-dialog-submit"]').click();
    cy.get('[role="dialog"]').should("not.exist");

    // Navigate to distributions
    cy.visit("/estate/distributions", { timeout: 30000 });
    cy.get('[data-testid="distributions-content"]', { timeout: 10000 }).should("be.visible");

    cy.get('[data-testid="record-distribution-button"]').click();
    cy.get('[role="dialog"]').should("be.visible");

    // Select asset
    cy.get('[data-testid="dist-asset-select"]').click();
    cy.get('[role="listbox"]').should("be.visible");
    cy.contains('[role="option"]', TEST_DIST_ASSET_NAME).click();

    // Fill in beneficiary details
    cy.get('[data-testid="dist-beneficiary-input"]').type(TEST_BENEFICIARY);
    cy.get('[data-testid="dist-relationship-input"]').type("Child");
    cy.get('[data-testid="dist-value-input"]').type("25000");
    cy.get('[data-testid="dist-description-input"]').type("Partial distribution for E2E test");
    cy.get('[data-testid="dist-notes-input"]').type("Internal notes for test distribution");

    cy.get('[data-testid="dist-form-submit"]').click();

    // Dialog should close
    cy.get('[role="dialog"]').should("not.exist");

    // Distribution should appear in the list
    cy.get('[data-testid="distribution-list"]', { timeout: 10000 }).should("be.visible");
    cy.contains(TEST_BENEFICIARY, { timeout: 10000 }).should("be.visible");
  });

  it("should delete a distribution", () => {
    // Create an asset first
    cy.visit("/estate/assets", { timeout: 30000 });
    cy.get('[data-testid="assets-content"]', { timeout: 10000 }).should("be.visible");

    cy.get('[data-testid="add-asset-button"]').click();
    cy.get('[role="dialog"]').should("be.visible");
    cy.get('[data-testid="asset-name-input"]').type(TEST_DIST_ASSET_NAME);
    cy.get('[data-testid="asset-value-input"]').type("40000");
    cy.get('[data-testid="asset-dialog-submit"]').click();
    cy.get('[role="dialog"]').should("not.exist");

    // Navigate to distributions and record one
    cy.visit("/estate/distributions", { timeout: 30000 });
    cy.get('[data-testid="distributions-content"]', { timeout: 10000 }).should("be.visible");

    cy.get('[data-testid="record-distribution-button"]').click();
    cy.get('[role="dialog"]').should("be.visible");

    cy.get('[data-testid="dist-asset-select"]').click();
    cy.get('[role="listbox"]').should("be.visible");
    cy.contains('[role="option"]', TEST_DIST_ASSET_NAME).click();

    cy.get('[data-testid="dist-beneficiary-input"]').type(TEST_BENEFICIARY);
    cy.get('[data-testid="dist-value-input"]').type("20000");
    cy.get('[data-testid="dist-form-submit"]').click();
    cy.get('[role="dialog"]').should("not.exist");

    // Distribution should be in the list
    cy.get('[data-testid="distribution-list"]', { timeout: 10000 }).should("be.visible");
    cy.contains(TEST_BENEFICIARY, { timeout: 10000 }).should("be.visible");

    // Click the delete button on the distribution row
    cy.get('[data-testid^="dist-delete-"]').first().click();

    // Distribution should be removed from the list
    cy.get('[data-testid="dist-list-empty"]', { timeout: 10000 }).should("be.visible");
  });

  it("should display the by-beneficiary view", () => {
    // Create asset and distribution first
    cy.visit("/estate/assets", { timeout: 30000 });
    cy.get('[data-testid="assets-content"]', { timeout: 10000 }).should("be.visible");

    cy.get('[data-testid="add-asset-button"]').click();
    cy.get('[role="dialog"]').should("be.visible");
    cy.get('[data-testid="asset-name-input"]').type(TEST_DIST_ASSET_NAME);
    cy.get('[data-testid="asset-value-input"]').type("60000");
    cy.get('[data-testid="asset-dialog-submit"]').click();
    cy.get('[role="dialog"]').should("not.exist");

    cy.visit("/estate/distributions", { timeout: 30000 });
    cy.get('[data-testid="distributions-content"]', { timeout: 10000 }).should("be.visible");

    // Record a distribution
    cy.get('[data-testid="record-distribution-button"]').click();
    cy.get('[role="dialog"]').should("be.visible");

    cy.get('[data-testid="dist-asset-select"]').click();
    cy.get('[role="listbox"]').should("be.visible");
    cy.contains('[role="option"]', TEST_DIST_ASSET_NAME).click();

    cy.get('[data-testid="dist-beneficiary-input"]').type(TEST_BENEFICIARY);
    cy.get('[data-testid="dist-value-input"]').type("30000");
    cy.get('[data-testid="dist-form-submit"]').click();
    cy.get('[role="dialog"]').should("not.exist");

    // Switch to By Beneficiary tab
    cy.get('[data-testid="dist-tab-beneficiary"]').click();

    // By-beneficiary view should display
    cy.get('[data-testid="distribution-by-beneficiary"]', { timeout: 10000 }).should("be.visible");
    cy.contains(TEST_BENEFICIARY).should("be.visible");
  });
});
