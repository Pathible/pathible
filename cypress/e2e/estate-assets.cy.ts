/// <reference types="cypress" />

/**
 * Estate Assets E2E Tests
 *
 * Tests for the estate assets page including:
 * - Page load and content display
 * - Status pipeline display
 * - Asset creation via dialog
 * - Asset list and filtering
 * - Asset detail dialog
 *
 * Uses Clerk testing tokens for automated authentication.
 * All tests clean up estate data after themselves.
 */

const TEST_ASSET_NAME = `E2E Test Asset ${Date.now()}`;

describe("Estate Assets", () => {
  beforeEach(() => {
    cy.signInWithSession("legacy");
    cy.visit("/dashboard", { timeout: 30000 });
    cy.ensureOnboarded("/dashboard");
    cy.activateEstateMode();
  });

  afterEach(() => {
    cy.cleanupEstateData();
  });

  it("should load the assets page with content", () => {
    cy.visit("/estate/assets", { timeout: 30000 });
    cy.get('[data-testid="assets-content"]', { timeout: 10000 }).should("be.visible");
    cy.contains("Assets").should("be.visible");
    cy.contains("Track and manage estate assets").should("be.visible");
  });

  it("should display the status pipeline when assets exist", () => {
    // First create an asset so the pipeline renders
    cy.visit("/estate/assets", { timeout: 30000 });
    cy.get('[data-testid="assets-content"]', { timeout: 10000 }).should("be.visible");

    cy.get('[data-testid="add-asset-button"]').click();
    cy.get('[role="dialog"]').should("be.visible");

    cy.get('[data-testid="asset-name-input"]').type(TEST_ASSET_NAME);
    cy.get('[data-testid="asset-value-input"]').type("50000");
    cy.get('[data-testid="asset-dialog-submit"]').click();

    cy.get('[role="dialog"]').should("not.exist");

    // Pipeline should now render with at least one stage
    cy.get('[data-testid="asset-status-pipeline"]', { timeout: 10000 }).should("be.visible");
    cy.get('[data-testid="pipeline-stage-identified"]').should("be.visible");
  });

  it("should open the create asset dialog", () => {
    cy.visit("/estate/assets", { timeout: 30000 });
    cy.get('[data-testid="assets-content"]', { timeout: 10000 }).should("be.visible");

    cy.get('[data-testid="add-asset-button"]').click();
    cy.get('[role="dialog"]').should("be.visible");
    cy.contains("Add Asset").should("be.visible");
    cy.contains("Add a new asset to the estate inventory").should("be.visible");

    // Verify form fields exist
    cy.get('[data-testid="asset-name-input"]').should("be.visible");
    cy.get('[data-testid="asset-category-select"]').should("be.visible");
    cy.get('[data-testid="asset-value-input"]').should("be.visible");
    cy.get('[data-testid="asset-institution-input"]').should("be.visible");
    cy.get('[data-testid="asset-account-input"]').should("be.visible");
    cy.get('[data-testid="asset-beneficiary-input"]').should("be.visible");
    cy.get('[data-testid="asset-description-input"]').should("be.visible");
    cy.get('[data-testid="asset-notes-input"]').should("be.visible");
    cy.get('[data-testid="asset-dialog-submit"]').should("be.visible");
  });

  it("should fill in asset form and submit", () => {
    cy.visit("/estate/assets", { timeout: 30000 });
    cy.get('[data-testid="assets-content"]', { timeout: 10000 }).should("be.visible");

    cy.get('[data-testid="add-asset-button"]').click();
    cy.get('[role="dialog"]').should("be.visible");

    cy.get('[data-testid="asset-name-input"]').type(TEST_ASSET_NAME);
    cy.get('[data-testid="asset-value-input"]').type("25000");
    cy.get('[data-testid="asset-institution-input"]').type("E2E Test Bank");
    cy.get('[data-testid="asset-account-input"]').type("****9999");
    cy.get('[data-testid="asset-beneficiary-input"]').type("E2E Beneficiary");
    cy.get('[data-testid="asset-description-input"]').type("Automated test asset description");
    cy.get('[data-testid="asset-notes-input"]').type("Internal test notes");

    cy.get('[data-testid="asset-dialog-submit"]').click();

    // Dialog should close after submission
    cy.get('[role="dialog"]').should("not.exist");
  });

  it("should show asset in list after creation", () => {
    cy.visit("/estate/assets", { timeout: 30000 });
    cy.get('[data-testid="assets-content"]', { timeout: 10000 }).should("be.visible");

    // Create an asset
    cy.get('[data-testid="add-asset-button"]').click();
    cy.get('[role="dialog"]').should("be.visible");
    cy.get('[data-testid="asset-name-input"]').type(TEST_ASSET_NAME);
    cy.get('[data-testid="asset-value-input"]').type("10000");
    cy.get('[data-testid="asset-dialog-submit"]').click();
    cy.get('[role="dialog"]').should("not.exist");

    // Asset should appear in the list
    cy.get('[data-testid="asset-list"]', { timeout: 10000 }).should("be.visible");
    cy.contains(TEST_ASSET_NAME, { timeout: 10000 }).should("be.visible");
  });

  it("should filter assets by status", () => {
    cy.visit("/estate/assets", { timeout: 30000 });
    cy.get('[data-testid="assets-content"]', { timeout: 10000 }).should("be.visible");

    // Verify status filter exists
    cy.get('[data-testid="asset-status-filter"]').should("be.visible");

    // Open the status filter dropdown
    cy.get('[data-testid="asset-status-filter"]').click();
    cy.get('[role="listbox"]').should("be.visible");

    // Select a specific status
    cy.contains('[role="option"]', "Found").click();

    // The filter should be applied (either shows matching assets or empty state)
    cy.get('[data-testid="asset-list"]').should("be.visible");
  });

  it("should open asset detail dialog when clicking a card", () => {
    cy.visit("/estate/assets", { timeout: 30000 });
    cy.get('[data-testid="assets-content"]', { timeout: 10000 }).should("be.visible");

    // Create an asset first
    cy.get('[data-testid="add-asset-button"]').click();
    cy.get('[role="dialog"]').should("be.visible");
    cy.get('[data-testid="asset-name-input"]').type(TEST_ASSET_NAME);
    cy.get('[data-testid="asset-dialog-submit"]').click();
    cy.get('[role="dialog"]').should("not.exist");

    // Click on the asset card
    cy.contains(TEST_ASSET_NAME, { timeout: 10000 })
      .closest("[data-testid^='asset-card-']")
      .click();

    // Edit dialog should open
    cy.get('[role="dialog"]').should("be.visible");
    cy.contains("Edit Asset").should("be.visible");
    cy.get('[data-testid="asset-status-select"]').should("be.visible");
  });

  it("should update asset status from the detail dialog", () => {
    cy.visit("/estate/assets", { timeout: 30000 });
    cy.get('[data-testid="assets-content"]', { timeout: 10000 }).should("be.visible");

    // Create an asset
    cy.get('[data-testid="add-asset-button"]').click();
    cy.get('[role="dialog"]').should("be.visible");
    cy.get('[data-testid="asset-name-input"]').type(TEST_ASSET_NAME);
    cy.get('[data-testid="asset-dialog-submit"]').click();
    cy.get('[role="dialog"]').should("not.exist");

    // Open the asset detail
    cy.contains(TEST_ASSET_NAME, { timeout: 10000 })
      .closest("[data-testid^='asset-card-']")
      .click();
    cy.get('[role="dialog"]').should("be.visible");

    // Change status from identified to verified
    cy.get('[data-testid="asset-status-select"]').click();
    cy.get('[role="listbox"]').should("be.visible");
    cy.contains('[role="option"]', "Confirmed").click();

    // Status notes field should appear when status changes
    cy.get('[data-testid="asset-status-notes-input"]', { timeout: 5000 }).should("be.visible");
    cy.get('[data-testid="asset-status-notes-input"]').type("Verified via bank statement");

    // Save changes
    cy.get('[data-testid="asset-dialog-submit"]').click();
    cy.get('[role="dialog"]').should("not.exist");

    // Verify the asset card now shows "Confirmed" badge
    cy.contains(TEST_ASSET_NAME, { timeout: 10000 })
      .closest("[data-testid^='asset-card-']")
      .contains("Confirmed")
      .should("be.visible");
  });

  it("should show status history in the asset detail dialog", () => {
    cy.visit("/estate/assets", { timeout: 30000 });
    cy.get('[data-testid="assets-content"]', { timeout: 10000 }).should("be.visible");

    // Create an asset
    cy.get('[data-testid="add-asset-button"]').click();
    cy.get('[role="dialog"]').should("be.visible");
    cy.get('[data-testid="asset-name-input"]').type(TEST_ASSET_NAME);
    cy.get('[data-testid="asset-dialog-submit"]').click();
    cy.get('[role="dialog"]').should("not.exist");

    // Open detail and update status to create history
    cy.contains(TEST_ASSET_NAME, { timeout: 10000 })
      .closest("[data-testid^='asset-card-']")
      .click();
    cy.get('[role="dialog"]').should("be.visible");

    cy.get('[data-testid="asset-status-select"]').click();
    cy.get('[role="listbox"]').should("be.visible");
    cy.contains('[role="option"]', "Confirmed").click();
    cy.get('[data-testid="asset-status-notes-input"]').type("First status change");
    cy.get('[data-testid="asset-dialog-submit"]').click();
    cy.get('[role="dialog"]').should("not.exist");

    // Re-open the detail dialog to check status history
    cy.contains(TEST_ASSET_NAME, { timeout: 10000 })
      .closest("[data-testid^='asset-card-']")
      .click();
    cy.get('[role="dialog"]').should("be.visible");

    // Status history section should be visible
    cy.get('[data-testid="asset-status-history"]', { timeout: 10000 }).should("be.visible");
    cy.get('[data-testid="asset-status-history"]').contains("Found").should("be.visible");
    cy.get('[data-testid="asset-status-history"]').contains("Confirmed").should("be.visible");
  });
});
