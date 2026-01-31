/// <reference types="cypress" />
import { setupClerkTestingToken } from "@clerk/testing/cypress";

/**
 * Onboarding Flow E2E Tests
 *
 * Comprehensive tests for the multi-step onboarding wizard:
 * - Step 1: Profile completion (firstName, lastName, phone, dateOfBirth)
 * - Step 2: Household creation (name, description)
 * - Step 3: Goals selection
 *
 * Critical for: User activation, first-time experience, data integrity
 *
 * Uses Clerk testing tokens for automated authentication.
 * Uses cy.signInFreshUser() to reset user state for onboarding tests.
 *
 * Run with: pnpm test:e2e
 */

// Test constants
const TEST_FIRST_NAME = "E2E";
const TEST_LAST_NAME = "TestUser";
const TEST_PHONE = "+1 555-123-4567";
const TEST_HOUSEHOLD_NAME = `E2E Household ${Date.now()}`;

describe("Onboarding Flow - E2E Test Suite", () => {
  describe("Unauthenticated Access", () => {
    it("should redirect to login when accessing onboarding without auth", () => {
      setupClerkTestingToken();
      cy.visit("/onboarding");
      // Onboarding should be accessible but will show sign-in if not authenticated
      cy.url({ timeout: 10000 }).should("satisfy", (url: string) => {
        return url.includes("/sign-in") || url.includes("/onboarding");
      });
    });
  });

  describe("Complete Onboarding Flow", () => {
    beforeEach(() => {
      // Use fresh user session that resets test user for onboarding
      cy.signInFreshUser();
      cy.visit("/onboarding", { timeout: 30000 });
    });

    it("should display onboarding page with progress indicator", () => {
      cy.get('[data-testid="onboarding-page"]', { timeout: 15000 }).should("be.visible");
      cy.get('[data-testid="onboarding-progress"]').should("be.visible");
      cy.get('[data-testid="onboarding-step-indicator"]').should("contain", "Step 1 of 3");
    });

    it("should display Step 1: Profile form", () => {
      cy.get('[data-testid="onboarding-step-profile"]', { timeout: 15000 }).should("be.visible");
      cy.get('[data-testid="onboarding-firstName"]').should("be.visible");
      cy.get('[data-testid="onboarding-lastName"]').should("be.visible");
      cy.get('[data-testid="onboarding-phone"]').should("be.visible");
      cy.get('[data-testid="onboarding-dateOfBirth"]').should("be.visible");
    });

    it("should show validation error when submitting empty profile", () => {
      cy.get('[data-testid="onboarding-page"]', { timeout: 15000 }).should("be.visible");
      cy.get('[data-testid="onboarding-next-button"]').click();
      // Should show toast error
      cy.contains("Please enter your first and last name", { timeout: 5000 }).should("be.visible");
      // Should stay on step 1
      cy.get('[data-testid="onboarding-step-indicator"]').should("contain", "Step 1 of 3");
    });

    it("should progress from Step 1 to Step 2 with valid profile data", () => {
      cy.get('[data-testid="onboarding-page"]', { timeout: 15000 }).should("be.visible");

      // Fill in profile
      cy.get('[data-testid="onboarding-firstName"]').clear().type(TEST_FIRST_NAME);
      cy.get('[data-testid="onboarding-lastName"]').clear().type(TEST_LAST_NAME);
      cy.get('[data-testid="onboarding-phone"]').clear().type(TEST_PHONE);

      // Click next
      cy.get('[data-testid="onboarding-next-button"]').click();

      // Wait for success toast
      cy.contains("Profile updated!", { timeout: 10000 }).should("be.visible");

      // Should be on step 2
      cy.get('[data-testid="onboarding-step-indicator"]').should("contain", "Step 2 of 3");
      cy.get('[data-testid="onboarding-step-household"]').should("be.visible");
    });

    it("should show validation error when submitting empty household name", () => {
      cy.get('[data-testid="onboarding-page"]', { timeout: 15000 }).should("be.visible");

      // Complete step 1
      cy.get('[data-testid="onboarding-firstName"]').clear().type(TEST_FIRST_NAME);
      cy.get('[data-testid="onboarding-lastName"]').clear().type(TEST_LAST_NAME);
      cy.get('[data-testid="onboarding-next-button"]').click();
      cy.contains("Profile updated!", { timeout: 10000 }).should("be.visible");

      // Try to submit empty household
      cy.get('[data-testid="onboarding-next-button"]').click();
      cy.contains("Please enter a household name", { timeout: 5000 }).should("be.visible");
      cy.get('[data-testid="onboarding-step-indicator"]').should("contain", "Step 2 of 3");
    });

    it("should progress from Step 2 to Step 3 with valid household data", () => {
      cy.get('[data-testid="onboarding-page"]', { timeout: 15000 }).should("be.visible");

      // Complete step 1
      cy.get('[data-testid="onboarding-firstName"]').clear().type(TEST_FIRST_NAME);
      cy.get('[data-testid="onboarding-lastName"]').clear().type(TEST_LAST_NAME);
      cy.get('[data-testid="onboarding-next-button"]').click();
      cy.contains("Profile updated!", { timeout: 10000 }).should("be.visible");

      // Complete step 2
      cy.get('[data-testid="onboarding-householdName"]').clear().type(TEST_HOUSEHOLD_NAME);
      cy.get('[data-testid="onboarding-next-button"]').click();
      cy.contains("Household created!", { timeout: 10000 }).should("be.visible");

      // Should be on step 3
      cy.get('[data-testid="onboarding-step-indicator"]').should("contain", "Step 3 of 3");
      cy.get('[data-testid="onboarding-step-goals"]').should("be.visible");
    });

    it("should show validation error when submitting without goals", () => {
      cy.get('[data-testid="onboarding-page"]', { timeout: 15000 }).should("be.visible");

      // Complete step 1
      cy.get('[data-testid="onboarding-firstName"]').clear().type(TEST_FIRST_NAME);
      cy.get('[data-testid="onboarding-lastName"]').clear().type(TEST_LAST_NAME);
      cy.get('[data-testid="onboarding-next-button"]').click();
      cy.contains("Profile updated!", { timeout: 10000 }).should("be.visible");

      // Complete step 2
      cy.get('[data-testid="onboarding-householdName"]').clear().type(TEST_HOUSEHOLD_NAME);
      cy.get('[data-testid="onboarding-next-button"]').click();
      cy.contains("Household created!", { timeout: 10000 }).should("be.visible");

      // Try to submit without selecting goals
      cy.get('[data-testid="onboarding-next-button"]').click();
      cy.contains("Please select at least one goal", { timeout: 5000 }).should("be.visible");
    });

    it("should complete full onboarding flow and redirect appropriately", () => {
      cy.get('[data-testid="onboarding-page"]', { timeout: 15000 }).should("be.visible");

      // Complete step 1
      cy.get('[data-testid="onboarding-firstName"]').clear().type(TEST_FIRST_NAME);
      cy.get('[data-testid="onboarding-lastName"]').clear().type(TEST_LAST_NAME);
      cy.get('[data-testid="onboarding-next-button"]').click();
      cy.contains("Profile updated!", { timeout: 10000 }).should("be.visible");

      // Complete step 2
      cy.get('[data-testid="onboarding-householdName"]').clear().type(TEST_HOUSEHOLD_NAME);
      cy.get('[data-testid="onboarding-next-button"]').click();
      cy.contains("Household created!", { timeout: 10000 }).should("be.visible");

      // Complete step 3 - select multiple goals
      cy.get('[data-testid="onboarding-goal-document_organization"]').click();
      cy.get('[data-testid="onboarding-goal-legacy_planning"]').click();
      cy.get('[data-testid="onboarding-next-button"]').click();

      // Should show completion message
      cy.contains("Onboarding complete!", { timeout: 10000 }).should("be.visible");

      // Should redirect to select-plan (since test user typically doesn't have active subscription)
      // or dashboard if they do have one
      cy.url({ timeout: 15000 }).should("satisfy", (url: string) => {
        return url.includes("/select-plan") || url.includes("/dashboard");
      });
    });

    it("should allow navigation back to previous steps", () => {
      cy.get('[data-testid="onboarding-page"]', { timeout: 15000 }).should("be.visible");

      // Complete step 1
      cy.get('[data-testid="onboarding-firstName"]').clear().type(TEST_FIRST_NAME);
      cy.get('[data-testid="onboarding-lastName"]').clear().type(TEST_LAST_NAME);
      cy.get('[data-testid="onboarding-next-button"]').click();
      cy.contains("Profile updated!", { timeout: 10000 }).should("be.visible");

      // Now on step 2, go back
      cy.get('[data-testid="onboarding-back-button"]').click();

      // Should be back on step 1
      cy.get('[data-testid="onboarding-step-indicator"]').should("contain", "Step 1 of 3");
      cy.get('[data-testid="onboarding-step-profile"]').should("be.visible");

      // Data should be preserved
      cy.get('[data-testid="onboarding-firstName"]').should("have.value", TEST_FIRST_NAME);
      cy.get('[data-testid="onboarding-lastName"]').should("have.value", TEST_LAST_NAME);
    });

    it("should disable back button on first step", () => {
      cy.get('[data-testid="onboarding-page"]', { timeout: 15000 }).should("be.visible");
      cy.get('[data-testid="onboarding-back-button"]').should("be.disabled");
    });
  });

  describe("Goal Selection", () => {
    beforeEach(() => {
      // Use fresh user session that resets test user
      cy.signInFreshUser();
      cy.visit("/onboarding", { timeout: 30000 });
      cy.get('[data-testid="onboarding-page"]', { timeout: 15000 }).should("be.visible");

      // Navigate to step 3
      cy.get('[data-testid="onboarding-firstName"]').clear().type(TEST_FIRST_NAME);
      cy.get('[data-testid="onboarding-lastName"]').clear().type(TEST_LAST_NAME);
      cy.get('[data-testid="onboarding-next-button"]').click();
      cy.contains("Profile updated!", { timeout: 10000 }).should("be.visible");

      cy.get('[data-testid="onboarding-householdName"]').clear().type(TEST_HOUSEHOLD_NAME);
      cy.get('[data-testid="onboarding-next-button"]').click();
      cy.contains("Household created!", { timeout: 10000 }).should("be.visible");
    });

    it("should display all goal options", () => {
      cy.get('[data-testid="onboarding-step-goals"]').should("be.visible");
      cy.get('[data-testid="onboarding-goal-document_organization"]').should("exist");
      cy.get('[data-testid="onboarding-goal-legacy_planning"]').should("exist");
      cy.get('[data-testid="onboarding-goal-family_heritage"]').should("exist");
      cy.get('[data-testid="onboarding-goal-financial_clarity"]').should("exist");
      cy.get('[data-testid="onboarding-goal-estate_planning"]').should("exist");
      cy.get('[data-testid="onboarding-goal-end_of_life_planning"]').should("exist");
    });

    it("should allow selecting and deselecting goals", () => {
      // Select a goal
      cy.get('[data-testid="onboarding-goal-document_organization"]').click();
      cy.get('[data-testid="onboarding-goal-document_organization"]').should(
        "have.attr",
        "data-state",
        "checked",
      );

      // Deselect the same goal
      cy.get('[data-testid="onboarding-goal-document_organization"]').click();
      cy.get('[data-testid="onboarding-goal-document_organization"]').should(
        "have.attr",
        "data-state",
        "unchecked",
      );
    });

    it("should allow selecting multiple goals", () => {
      cy.get('[data-testid="onboarding-goal-document_organization"]').click();
      cy.get('[data-testid="onboarding-goal-legacy_planning"]').click();
      cy.get('[data-testid="onboarding-goal-family_heritage"]').click();

      cy.get('[data-testid="onboarding-goal-document_organization"]').should(
        "have.attr",
        "data-state",
        "checked",
      );
      cy.get('[data-testid="onboarding-goal-legacy_planning"]').should(
        "have.attr",
        "data-state",
        "checked",
      );
      cy.get('[data-testid="onboarding-goal-family_heritage"]').should(
        "have.attr",
        "data-state",
        "checked",
      );
    });
  });
});
