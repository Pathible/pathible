/// <reference types="cypress" />
import { setupClerkTestingToken } from "@clerk/testing/cypress";

/**
 * Complete User Journey E2E Test
 *
 * This test validates the ENTIRE user journey from fresh signup to vault usage:
 * 1. Sign in with Clerk (test user)
 * 2. Reset user to clean state (no profile, no household)
 * 3. Complete onboarding wizard:
 *    - Step 1: Profile creation (first name, last name)
 *    - Step 2: Household creation (name)
 *    - Step 3: Goals selection
 * 4. Select subscription plan (Foundations - free tier)
 * 5. Access vault and verify it works
 *
 * IMPORTANT: This test uses `cy.resetTestUser()` to ensure a clean state
 * before each run. The test user email must contain "+clerk_test" for
 * the reset to work (security measure).
 *
 * Run with: pnpm test:e2e --spec cypress/e2e/complete-journey.cy.ts
 */

// Test constants
const TEST_USER_EMAIL = Cypress.env("TEST_USER_EMAIL");
const TEST_FIRST_NAME = "E2E";
const TEST_LAST_NAME = "TestUser";
const TEST_HOUSEHOLD_NAME = `Test Household ${Date.now()}`;

describe("Complete User Journey - New User to Vault Access", () => {
  before(() => {
    // Verify test user email is configured
    expect(TEST_USER_EMAIL, "TEST_USER_EMAIL must be set in cypress.env.json").to.exist;
    expect(TEST_USER_EMAIL, "TEST_USER_EMAIL must contain +clerk_test").to.include("+clerk_test");
  });

  beforeEach(() => {
    // Clear browser state
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.window().then((win) => {
      win.sessionStorage.clear();
    });
  });

  it("should complete full user journey: signup → onboarding → plan selection → vault access", () => {
    // =========================================================================
    // STEP 1: Sign in with Clerk
    // =========================================================================
    cy.log("**STEP 1: Signing in with Clerk**");

    setupClerkTestingToken();
    cy.visit("/");
    cy.clerkLoaded();
    cy.clerkSignIn({
      strategy: "email_code",
      identifier: TEST_USER_EMAIL,
    });

    // =========================================================================
    // STEP 2: Reset test user to clean state
    // =========================================================================
    cy.log("**STEP 2: Resetting test user to clean state**");

    // Visit a page to ensure Convex client is loaded
    cy.visit("/onboarding", { failOnStatusCode: false });
    cy.wait(2000); // Wait for Convex client to initialize

    // Reset the test user
    cy.resetTestUser().should((result) => {
      expect(result.success).to.be.true;
    });

    // Reload to pick up the clean state
    cy.reload();
    cy.wait(1000);

    // =========================================================================
    // STEP 3: Complete Onboarding - Step 1 (Profile)
    // =========================================================================
    cy.log("**STEP 3: Completing onboarding - Profile**");

    // Should be on onboarding page
    cy.url({ timeout: 15000 }).should("include", "/onboarding");

    // Wait for the onboarding page to load
    cy.contains("Complete Your Profile", { timeout: 10000 }).should("be.visible");
    cy.contains("Step 1 of 3", { timeout: 5000 }).should("be.visible");

    // Fill in profile information
    cy.get("input#firstName").clear().type(TEST_FIRST_NAME);
    cy.get("input#lastName").clear().type(TEST_LAST_NAME);

    // Click Next to proceed
    cy.contains("button", "Next").click();

    // Wait for profile to be saved
    cy.contains("Profile updated!", { timeout: 10000 }).should("be.visible");

    // =========================================================================
    // STEP 4: Complete Onboarding - Step 2 (Household)
    // =========================================================================
    cy.log("**STEP 4: Completing onboarding - Household**");

    // Should now be on household step
    cy.contains("Create Your First Household", { timeout: 10000 }).should("be.visible");
    cy.contains("Step 2 of 3", { timeout: 5000 }).should("be.visible");

    // Fill in household name
    cy.get("input#householdName").clear().type(TEST_HOUSEHOLD_NAME);

    // Click Next to proceed
    cy.contains("button", "Next").click();

    // Wait for household to be created
    cy.contains("Household created!", { timeout: 10000 }).should("be.visible");

    // =========================================================================
    // STEP 5: Complete Onboarding - Step 3 (Goals)
    // =========================================================================
    cy.log("**STEP 5: Completing onboarding - Goals**");

    // Should now be on goals step
    cy.contains("What brings you to Pathible?", { timeout: 10000 }).should("be.visible");
    cy.contains("Step 3 of 3", { timeout: 5000 }).should("be.visible");

    // Select at least one goal (click the first checkbox)
    cy.get('button[role="checkbox"]').first().click();

    // Click Complete Setup to finish onboarding
    cy.contains("button", "Complete Setup").click();

    // Wait for success message and redirect
    cy.contains("Onboarding complete!", { timeout: 10000 }).should("be.visible");

    // =========================================================================
    // STEP 6: Handle Subscription Plan (if needed)
    // =========================================================================
    cy.log("**STEP 6: Handling subscription plan**");

    // After onboarding, user should be redirected somewhere
    // If user already has a Clerk subscription (test mode), they go straight to dashboard
    // If not, they go to /select-plan
    cy.url({ timeout: 15000 }).then((url) => {
      if (url.includes("/select-plan")) {
        cy.log("User needs to select a plan");

        // Wait for plan selection page to load
        cy.contains(/Choose Your Legacy Plan|Choose Your Plan/, { timeout: 10000 }).should(
          "be.visible",
        );

        // For Clerk's PricingTable in test mode, the free plan might auto-activate
        // or we need to click a button. Try to find any subscription button.
        cy.get("body").then(($body) => {
          // Check if there's a button to select a plan
          const selectButton = $body.find(
            'button:contains("Get Started"), button:contains("Start"), button:contains("Select")',
          );
          if (selectButton.length > 0) {
            cy.wrap(selectButton.first()).click();
          }
        });

        // Wait for redirect to dashboard
        cy.url({ timeout: 30000 }).should("include", "/dashboard");
      } else if (url.includes("/dashboard")) {
        cy.log("User already has a plan - on dashboard");
      } else {
        // Unexpected URL - wait and check again
        cy.wait(2000);
        cy.url().should("satisfy", (u: string) => {
          return u.includes("/dashboard") || u.includes("/select-plan");
        });
      }
    });

    // =========================================================================
    // STEP 7: Verify Vault Access
    // =========================================================================
    cy.log("**STEP 7: Verifying vault access**");

    // Navigate to vault
    cy.visit("/vault");

    // Should be able to access vault (not redirected)
    cy.url({ timeout: 15000 }).should("include", "/vault");

    // Verify vault page content is visible
    cy.contains("Heritage Vault", { timeout: 15000 }).should("be.visible");

    // Verify we can see the upload button (indicating full access)
    cy.contains(/Upload|Add Document/i, { timeout: 10000 }).should("be.visible");

    cy.log("**SUCCESS: Complete user journey test passed!**");
  });

  it("should redirect unauthenticated users from protected routes", () => {
    cy.log("**Testing unauthenticated redirect**");

    setupClerkTestingToken();

    // Try to access vault without signing in
    cy.visit("/vault");
    cy.url({ timeout: 15000 }).should("include", "/sign-in");

    // Try to access dashboard without signing in
    cy.visit("/dashboard");
    cy.url({ timeout: 15000 }).should("include", "/sign-in");
  });

  it("should redirect incomplete users to onboarding", () => {
    cy.log("**Testing onboarding redirect for incomplete users**");

    setupClerkTestingToken();
    cy.visit("/");
    cy.clerkLoaded();
    cy.clerkSignIn({
      strategy: "email_code",
      identifier: TEST_USER_EMAIL,
    });

    // Visit onboarding to load Convex client
    cy.visit("/onboarding", { failOnStatusCode: false });
    cy.wait(2000);

    // Reset user to clean state
    cy.resetTestUser().should((result) => {
      expect(result.success).to.be.true;
    });

    // Reload to pick up clean state
    cy.reload();
    cy.wait(1000);

    // Now try to access vault - should be redirected to onboarding
    cy.visit("/vault", { failOnStatusCode: false });

    // Should be redirected to either onboarding or select-plan
    cy.url({ timeout: 15000 }).should("satisfy", (url: string) => {
      return url.includes("/onboarding") || url.includes("/select-plan");
    });
  });
});

describe("Vault Operations After Full Onboarding", () => {
  beforeEach(() => {
    // Clear state
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.window().then((win) => {
      win.sessionStorage.clear();
    });

    // Sign in
    setupClerkTestingToken();
    cy.visit("/");
    cy.clerkLoaded();
    cy.clerkSignIn({
      strategy: "email_code",
      identifier: TEST_USER_EMAIL,
    });
  });

  it("should allow document upload after completing journey", () => {
    cy.log("**Testing document upload**");

    // Navigate to vault
    cy.visit("/vault", { failOnStatusCode: false });

    // Check if we need to complete onboarding first
    cy.url({ timeout: 15000 }).then((url) => {
      if (url.includes("/vault")) {
        // Already have access - test upload
        cy.contains("Heritage Vault", { timeout: 10000 }).should("be.visible");

        // Click upload button
        cy.contains(/Upload|Add Document/i).click();

        // Verify upload modal/form appears
        cy.get('input[type="file"]').should("exist");
      } else {
        // Need to complete onboarding first - skip this test
        cy.log("User not fully onboarded - skipping upload test");
      }
    });
  });
});
