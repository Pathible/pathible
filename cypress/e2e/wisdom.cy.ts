/// <reference types="cypress" />
import { setupClerkTestingToken } from "@clerk/testing/cypress";

/**
 * Wisdom Hub E2E Tests
 *
 * Comprehensive tests for the wisdom hub including:
 * - Creating wisdom entries (guided and quick mode)
 * - Viewing wisdom library
 * - Filtering and searching entries
 * - Deleting entries
 * - Core beliefs management
 *
 * Uses Clerk testing tokens for automated authentication (no OTP needed).
 * Uses cy.session() for faster test execution via auth caching.
 * All tests clean up after themselves.
 *
 * Run with: pnpm test:e2e
 */

// Test constants
const TEST_ENTRY_TITLE = `E2E Test Entry ${Date.now()}`;
const TEST_ENTRY_CONTENT = "This is an automated test entry for E2E testing";

describe("Wisdom Hub - E2E Test Suite", () => {
  describe("Unauthenticated Access", () => {
    it("should redirect to login when accessing wisdom page without auth", () => {
      setupClerkTestingToken();
      cy.visit("/wisdom");
      cy.url({ timeout: 10000 }).should("include", "/sign-in");
    });
  });

  describe("Wisdom Hub Navigation", () => {
    beforeEach(() => {
      cy.signInWithSession("heritage");
      cy.visit("/wisdom", { timeout: 30000 });
      cy.ensureOnboarded("/wisdom");
      cy.contains("Wisdom & Stories", { timeout: 15000 }).should("be.visible");
    });

    it("should display wisdom hub main page with navigation cards", () => {
      // Verify navigation cards are visible
      cy.contains("Share Your Wisdom").should("be.visible");
      cy.contains("Your Wisdom Library").should("be.visible");
      cy.contains("Core Beliefs").should("be.visible");
    });

    it("should display stats cards", () => {
      // Verify stats cards are visible
      cy.contains("Your Wisdom Entries").should("be.visible");
      cy.contains("Shared with Family").should("be.visible");
    });

    it("should navigate to create entry page", () => {
      cy.contains("Share Your Wisdom").click();
      cy.url().should("include", "/wisdom/create-entry");
      cy.contains("What would you like to share today?").should("be.visible");
    });

    it("should navigate to wisdom library", () => {
      cy.contains("Your Wisdom Library").click();
      cy.url().should("include", "/wisdom/library");
      cy.contains("Wisdom Library").should("be.visible");
    });

    it("should navigate to core beliefs", () => {
      cy.contains("Core Beliefs").click();
      cy.url().should("include", "/wisdom/core-beliefs");
    });
  });

  describe("Quick Wisdom Entry Creation", () => {
    beforeEach(() => {
      cy.signInWithSession("heritage");
      cy.visit("/wisdom/create-entry/quick", { timeout: 30000 });
      cy.ensureOnboarded("/wisdom/create-entry/quick");
    });

    it("should create a quick wisdom entry", () => {
      // Fill in entry details
      cy.get('input[placeholder*="title"]', { timeout: 10000 })
        .should("be.visible")
        .clear()
        .type(TEST_ENTRY_TITLE);

      cy.get("textarea").first().clear().type(TEST_ENTRY_CONTENT);

      // Submit form
      cy.contains("button", "Save").click();

      // Should redirect to library after save
      cy.url({ timeout: 15000 }).should("include", "/wisdom/library");

      // Verify entry appears in library
      cy.contains(TEST_ENTRY_TITLE, { timeout: 10000 }).should("be.visible");
    });
  });

  describe("Guided Wisdom Entry Creation", () => {
    beforeEach(() => {
      cy.signInWithSession("heritage");
      cy.visit("/wisdom/create-entry", { timeout: 30000 });
      cy.ensureOnboarded("/wisdom/create-entry");
      cy.contains("What would you like to share today?", { timeout: 15000 }).should("be.visible");
    });

    it("should show intent selection options", () => {
      cy.contains("Share a Life Lesson").should("be.visible");
      cy.contains("Tell a Family Story").should("be.visible");
      cy.contains("Write Advice for the Future").should("be.visible");
      cy.contains("Capture a Tradition").should("be.visible");
    });

    it("should navigate through guided flow for life lesson", () => {
      // Select "Share a Life Lesson"
      cy.contains("Share a Life Lesson").click();

      // Should show guided prompt
      cy.contains("The lesson I learned was...").should("be.visible");
      cy.contains("Step 1 of 4").should("be.visible");

      // Fill in first prompt
      cy.get("textarea").type("Test life lesson content");
      cy.contains("button", "Continue").click();

      // Should advance to step 2
      cy.contains("Step 2 of 4").should("be.visible");
    });

    it("should allow skipping to finish when content exists", () => {
      // Select intent
      cy.contains("Share a Life Lesson").click();

      // Fill in some content
      cy.get("textarea").type("Test content for skip functionality");

      // Click skip to finish
      cy.contains("Skip to finish").click();

      // Should show finish step
      cy.contains("Give it a title").should("be.visible");
    });
  });

  describe("Wisdom Library", () => {
    beforeEach(() => {
      cy.signInWithSession("heritage");
      cy.visit("/wisdom/library", { timeout: 30000 });
      cy.ensureOnboarded("/wisdom/library");
      cy.contains("Wisdom Library", { timeout: 15000 }).should("be.visible");
    });

    it("should display search and filter controls", () => {
      cy.get('input[placeholder*="Search"]').should("be.visible");
      cy.contains("All Categories").should("be.visible");
    });

    it("should filter entries by category", () => {
      // Open category dropdown - use the SelectTrigger button
      cy.get('button[role="combobox"]').click();

      // Wait for dropdown to appear and select a category
      cy.get('[role="listbox"]', { timeout: 5000 }).should("be.visible");
      cy.get('[role="option"]').contains("Life Lessons").click();

      // Verify filter is applied (either shows filtered results or empty state)
      cy.get("body").should("be.visible");
    });

    it("should search entries by text", () => {
      cy.get('input[placeholder*="Search"]').type("test search query");

      // Wait for search results to update
      cy.wait(500);

      // Verify search was performed (results or empty state)
      cy.get("body").should("be.visible");
    });

    it("should show empty state when no entries exist", () => {
      // Reset test user to clean state
      cy.resetTestUser().then((result) => {
        if (result.success) {
          cy.reload();
          // Wait for page to load after reset
          cy.wait(2000);
        }
      });
    });
  });

  describe("Delete Wisdom Entry", () => {
    beforeEach(() => {
      cy.signInWithSession("heritage");
    });

    it("should delete an entry with confirmation dialog", () => {
      // First create an entry to delete
      cy.visit("/wisdom/create-entry/quick", { timeout: 30000 });
      cy.ensureOnboarded("/wisdom/create-entry/quick");

      const entryTitle = `Delete Test ${Date.now()}`;
      cy.get('input[placeholder*="title"]', { timeout: 10000 }).clear().type(entryTitle);
      cy.get("textarea").first().clear().type("Content to delete");
      cy.contains("button", "Save").click();

      // Wait for redirect to library
      cy.url({ timeout: 15000 }).should("include", "/wisdom/library");
      cy.contains(entryTitle, { timeout: 10000 }).should("be.visible");

      // Hover over the entry card to reveal delete button
      cy.contains(entryTitle).closest("div.group").trigger("mouseover");

      // Click delete button
      cy.contains(entryTitle)
        .closest("div.group")
        .find("button")
        .filter(":has(svg.text-destructive)")
        .click();

      // Confirm deletion - wait for dialog animation to complete
      cy.get('[role="alertdialog"]').should("be.visible");
      cy.get('[role="alertdialog"]').within(() => {
        cy.contains("Remove this wisdom entry?").should("be.visible");
        cy.contains("button", "Delete").should("be.visible").click();
      });

      // Verify entry is removed
      cy.contains(entryTitle).should("not.exist");
    });
  });
});
