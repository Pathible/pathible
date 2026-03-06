/// <reference types="cypress" />

/**
 * Estate Communications E2E Tests
 *
 * Tests for the estate communications page including:
 * - Page load and content display
 * - Log communication form
 * - Communication creation and list
 * - Tab switching between log and timeline views
 *
 * Uses Clerk testing tokens for automated authentication.
 * All tests clean up estate data after themselves.
 */

const TEST_RECIPIENT = `E2E Test Recipient ${Date.now()}`;
const TEST_SUBJECT = `E2E Test Subject ${Date.now()}`;

describe("Estate Communications", () => {
  beforeEach(() => {
    cy.signInWithSession("legacy");
    cy.visit("/dashboard", { timeout: 30000 });
    cy.ensureOnboarded("/dashboard");
    cy.activateEstateMode();
  });

  afterEach(() => {
    cy.cleanupEstateData();
  });

  it("should load the communications page with content", () => {
    cy.visit("/estate/communications", { timeout: 30000 });
    cy.get('[data-testid="communications-content"]', { timeout: 10000 }).should("be.visible");
    cy.contains("Communications").should("be.visible");
    cy.contains("Track all estate-related communications").should("be.visible");
  });

  it("should open the log communication form", () => {
    cy.visit("/estate/communications", { timeout: 30000 });
    cy.get('[data-testid="communications-content"]', { timeout: 10000 }).should("be.visible");

    cy.get('[data-testid="log-communication-button"]').click();
    cy.get('[role="dialog"]').should("be.visible");
    cy.contains("Log Communication").should("be.visible");

    // Verify form fields exist
    cy.get('[data-testid="comm-recipient-input"]').should("be.visible");
    cy.get('[data-testid="comm-org-input"]').should("be.visible");
    cy.get('[data-testid="comm-email-input"]').should("be.visible");
    cy.get('[data-testid="comm-phone-input"]').should("be.visible");
    cy.get('[data-testid="comm-category-select"]').should("be.visible");
    cy.get('[data-testid="comm-method-select"]').should("be.visible");
    cy.get('[data-testid="comm-subject-input"]').should("be.visible");
    cy.get('[data-testid="comm-summary-input"]').should("be.visible");
    cy.get('[data-testid="comm-date-input"]').should("be.visible");
    cy.get('[data-testid="comm-form-submit"]').should("be.visible");
  });

  it("should fill in communication details and submit", () => {
    cy.visit("/estate/communications", { timeout: 30000 });
    cy.get('[data-testid="communications-content"]', { timeout: 10000 }).should("be.visible");

    cy.get('[data-testid="log-communication-button"]').click();
    cy.get('[role="dialog"]').should("be.visible");

    cy.get('[data-testid="comm-recipient-input"]').type(TEST_RECIPIENT);
    cy.get('[data-testid="comm-org-input"]').type("E2E Test Organization");
    cy.get('[data-testid="comm-subject-input"]').type(TEST_SUBJECT);
    cy.get('[data-testid="comm-summary-input"]').type(
      "This is an automated test communication summary for E2E testing.",
    );

    // Set a follow-up date (7 days in the future)
    const futureDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const formattedDate = futureDate.toISOString().split("T")[0];
    cy.get('[data-testid="comm-followup-date-input"]').type(formattedDate);
    cy.get('[data-testid="comm-followup-notes-input"]').type("Follow up on account closure");

    cy.get('[data-testid="comm-form-submit"]').click();

    // Dialog should close after submission
    cy.get('[role="dialog"]').should("not.exist");

    // Communication should appear in the log
    cy.get('[data-testid="communication-log"]', { timeout: 10000 }).should("be.visible");
    cy.contains(TEST_RECIPIENT, { timeout: 10000 }).should("be.visible");
  });

  it("should display the follow-up panel when follow-ups exist", () => {
    cy.visit("/estate/communications", { timeout: 30000 });
    cy.get('[data-testid="communications-content"]', { timeout: 10000 }).should("be.visible");

    // Create a communication with a follow-up
    cy.get('[data-testid="log-communication-button"]').click();
    cy.get('[role="dialog"]').should("be.visible");

    cy.get('[data-testid="comm-recipient-input"]').type(TEST_RECIPIENT);
    cy.get('[data-testid="comm-subject-input"]').type(TEST_SUBJECT);
    cy.get('[data-testid="comm-summary-input"]').type("Communication with follow-up for testing.");

    // Set follow-up date in the future
    const futureDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const formattedDate = futureDate.toISOString().split("T")[0];
    cy.get('[data-testid="comm-followup-date-input"]').type(formattedDate);
    cy.get('[data-testid="comm-followup-notes-input"]').type("E2E follow-up test");

    cy.get('[data-testid="comm-form-submit"]').click();
    cy.get('[role="dialog"]').should("not.exist");

    // Follow-up panel should be visible
    cy.get('[data-testid="follow-up-panel"]', { timeout: 10000 }).should("be.visible");
    cy.contains("Pending Follow-ups").should("be.visible");
  });

  it("should mark a follow-up as complete", () => {
    cy.visit("/estate/communications", { timeout: 30000 });
    cy.get('[data-testid="communications-content"]', { timeout: 10000 }).should("be.visible");

    // Create a communication with a follow-up
    cy.get('[data-testid="log-communication-button"]').click();
    cy.get('[role="dialog"]').should("be.visible");

    cy.get('[data-testid="comm-recipient-input"]').type(TEST_RECIPIENT);
    cy.get('[data-testid="comm-subject-input"]').type(TEST_SUBJECT);
    cy.get('[data-testid="comm-summary-input"]').type(
      "Communication to test follow-up completion.",
    );

    // Set follow-up date in the future
    const futureDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const formattedDate = futureDate.toISOString().split("T")[0];
    cy.get('[data-testid="comm-followup-date-input"]').type(formattedDate);
    cy.get('[data-testid="comm-followup-notes-input"]').type("Mark this complete");

    cy.get('[data-testid="comm-form-submit"]').click();
    cy.get('[role="dialog"]').should("not.exist");

    // Follow-up panel should be visible
    cy.get('[data-testid="follow-up-panel"]', { timeout: 10000 }).should("be.visible");

    // Click "Done" on the follow-up item
    cy.get('[data-testid="follow-up-panel"]').find("button").contains("Done").first().click();

    // Follow-up panel should disappear (no more pending follow-ups)
    cy.get('[data-testid="follow-up-panel"]', { timeout: 10000 }).should("not.exist");
  });

  it("should switch between log and timeline views", () => {
    cy.visit("/estate/communications", { timeout: 30000 });
    cy.get('[data-testid="communications-content"]', { timeout: 10000 }).should("be.visible");

    // Log tab should be active by default
    cy.get('[data-testid="comm-tab-log"]').should("be.visible");
    cy.get('[data-testid="comm-tab-timeline"]').should("be.visible");

    // Communication log should be visible by default
    cy.get('[data-testid="communication-log"]', { timeout: 10000 }).should("be.visible");

    // Switch to timeline tab
    cy.get('[data-testid="comm-tab-timeline"]').click();

    // Timeline view should be visible (either with entries or empty state)
    cy.get('[data-testid="communication-timeline"], [data-testid="comm-timeline-empty"]', {
      timeout: 10000,
    }).should("be.visible");

    // Switch back to log tab
    cy.get('[data-testid="comm-tab-log"]').click();
    cy.get('[data-testid="communication-log"]', { timeout: 10000 }).should("be.visible");
  });
});
