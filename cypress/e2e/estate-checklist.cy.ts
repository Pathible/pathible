/// <reference types="cypress" />

/**
 * Estate Checklist E2E Tests
 *
 * Tests for the estate checklist page including:
 * - Checklist page display and loading
 * - Progress indicator rendering
 * - Category panels in accordion layout
 * - Adding custom tasks
 * - Checklist item interactions (expand, toggle)
 *
 * Uses Clerk testing tokens for automated authentication.
 * Uses cy.session() for faster test execution via auth caching.
 * All tests clean up estate data after themselves.
 *
 * Run with: pnpm test:e2e
 */

describe("Estate Checklist", () => {
  beforeEach(() => {
    cy.signInWithSession("legacy");
    cy.visit("/dashboard", { timeout: 30000 });
    cy.ensureOnboarded("/dashboard");
    cy.activateEstateMode();
    cy.visit("/estate/checklist", { timeout: 30000 });
  });

  afterEach(() => {
    cy.cleanupEstateData();
  });

  it("should display checklist page with content", () => {
    cy.get('[data-testid="checklist-content"]', { timeout: 15000 }).should("be.visible");
    cy.contains("Checklist").should("be.visible");
    cy.contains("A guided list to help you through the process").should("be.visible");
  });

  it("should show checklist progress indicator", () => {
    cy.get('[data-testid="checklist-progress"]', { timeout: 15000 }).should("be.visible");
    // Progress ring should show percentage
    cy.get('[data-testid="checklist-progress"]').find("svg").should("exist");
    // Should show "X of Y tasks complete" text
    cy.get('[data-testid="checklist-progress"]').should("contain", "tasks complete");
  });

  it("should display category panels in accordion", () => {
    cy.get('[data-testid="checklist-panel"]', { timeout: 15000 }).should("be.visible");

    // Verify at least the first category exists
    cy.get('[data-testid="checklist-category-first_things_first"]').should("exist");

    // Verify category labels are displayed
    cy.contains("First Things First").should("exist");
  });

  it("should expand and collapse category panels", () => {
    cy.get('[data-testid="checklist-panel"]', { timeout: 15000 }).should("be.visible");

    // Click on a category to expand it
    cy.get('[data-testid="checklist-category-first_things_first"]')
      .find("[data-radix-collection-item]")
      .click();

    // Should show checklist items inside the expanded category
    cy.get('[data-testid="checklist-category-first_things_first"]')
      .find('[data-testid^="checklist-item-"]')
      .should("have.length.greaterThan", 0);
  });

  it("should show the add task button", () => {
    cy.get('[data-testid="add-task-button"]', { timeout: 15000 }).should("be.visible");
    cy.get('[data-testid="add-task-button"]').should("contain", "Add Task");
  });

  it("should open add task dialog and display form fields", () => {
    cy.get('[data-testid="add-task-button"]', { timeout: 15000 }).click();

    // Dialog should open
    cy.get('[role="dialog"]').should("be.visible");
    cy.contains("Add Custom Task").should("be.visible");
    cy.contains("Custom category").should("be.visible");

    // Form fields should be present
    cy.get('[data-testid="add-task-title"]').should("be.visible");
    cy.get('[data-testid="add-task-description"]').should("be.visible");
    cy.get('[data-testid="add-task-submit"]').should("be.visible");

    // Submit should be disabled without a title
    cy.get('[data-testid="add-task-submit"]').should("be.disabled");
  });

  it("should enable submit button when title is provided", () => {
    cy.get('[data-testid="add-task-button"]', { timeout: 15000 }).click();
    cy.get('[role="dialog"]').should("be.visible");

    // Type a title
    cy.get('[data-testid="add-task-title"]').type("Custom test task");

    // Submit should now be enabled
    cy.get('[data-testid="add-task-submit"]').should("not.be.disabled");
  });

  it("should add a custom task", () => {
    const taskTitle = `E2E Custom Task ${Date.now()}`;

    cy.get('[data-testid="add-task-button"]', { timeout: 15000 }).click();
    cy.get('[role="dialog"]').should("be.visible");

    // Fill in the form
    cy.get('[data-testid="add-task-title"]').type(taskTitle);
    cy.get('[data-testid="add-task-description"]').type("Automated test task description");
    cy.get('[data-testid="add-task-submit"]').click();

    // Dialog should close after submission
    cy.get('[role="dialog"]', { timeout: 10000 }).should("not.exist");

    // The custom task should appear in the checklist under "Custom Tasks" category
    cy.get('[data-testid="checklist-category-custom"]', { timeout: 10000 }).should("exist");

    // Expand the custom category to see the task
    cy.get('[data-testid="checklist-category-custom"]')
      .find("[data-radix-collection-item]")
      .click();

    cy.contains(taskTitle, { timeout: 10000 }).should("be.visible");
  });

  it("should show locked when-ready section when not enough progress", () => {
    // The "When You're Ready" section should be locked initially
    cy.get('[data-testid="checklist-when-ready-locked"]', { timeout: 15000 }).should("exist");
    cy.get('[data-testid="checklist-when-ready-locked"]').should(
      "contain",
      "More tasks will appear",
    );
  });

  it("should show progress counts on category headers", () => {
    cy.get('[data-testid="checklist-panel"]', { timeout: 15000 }).should("be.visible");

    // Each category should show a completion count (e.g., "0/5")
    cy.get('[data-testid="checklist-category-first_things_first"]')
      .find(".tabular-nums")
      .should("exist")
      .invoke("text")
      .should("match", /\d+\/\d+/);
  });

  it("should toggle checklist item completion", () => {
    cy.get('[data-testid="checklist-panel"]', { timeout: 15000 }).should("be.visible");

    // Expand the first category
    cy.get('[data-testid="checklist-category-first_things_first"]')
      .find("[data-radix-collection-item]")
      .click();

    // Find the first checklist item's checkbox and click it
    cy.get('[data-testid="checklist-category-first_things_first"]')
      .find('[data-testid^="checklist-checkbox-"]')
      .first()
      .as("firstCheckbox");

    // Toggle the checkbox to mark as completed
    cy.get("@firstCheckbox").click();

    // The item should now show completed styling (line-through)
    cy.get('[data-testid="checklist-category-first_things_first"]')
      .find('[data-testid^="checklist-item-"]')
      .first()
      .find(".line-through", { timeout: 10000 })
      .should("exist");

    // Toggle back to uncompleted
    cy.get("@firstCheckbox").click();

    // Line-through should be removed
    cy.get('[data-testid="checklist-category-first_things_first"]')
      .find('[data-testid^="checklist-item-"]')
      .first()
      .find(".line-through")
      .should("not.exist");
  });

  it("should update progress when items are completed", () => {
    cy.get('[data-testid="checklist-progress"]', { timeout: 15000 }).should("be.visible");

    // Capture initial progress text
    cy.get('[data-testid="checklist-progress"]')
      .invoke("text")
      .then((initialText) => {
        // Expand the first category and toggle an item
        cy.get('[data-testid="checklist-category-first_things_first"]')
          .find("[data-radix-collection-item]")
          .click();

        cy.get('[data-testid="checklist-category-first_things_first"]')
          .find('[data-testid^="checklist-checkbox-"]')
          .first()
          .click();

        // Progress text should update (completed count increases)
        cy.get('[data-testid="checklist-progress"]', { timeout: 10000 })
          .invoke("text")
          .should("not.eq", initialText);
      });
  });
});
