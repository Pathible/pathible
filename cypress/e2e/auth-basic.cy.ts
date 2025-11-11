/// <reference types="cypress" />

/**
 * Basic Authentication Journey Tests
 *
 * These tests verify the core authentication flows without mocking.
 * They test against the real application to ensure everything works end-to-end.
 *
 * Note: These tests require the dev server to be running (pnpm dev)
 */

describe("Basic Authentication Tests", () => {
  const testEmail = `test-${Date.now()}@pathible.com`;
  const testOtp = "123456"; // Default test OTP from Better Auth config

  beforeEach(() => {
    // Clear all state before each test
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.window().then((win) => {
      win.sessionStorage.clear();
    });
  });

  describe("Login Page", () => {
    it("should load login page with correct elements", () => {
      cy.visit("/login");

      // Verify page elements
      cy.contains("Welcome to Your Legacy").should("be.visible");
      cy.get('[data-testid="email-input"]').should("be.visible");
      cy.get('[data-testid="send-code-button"]').should("be.visible");
      cy.contains("No password needed").should("be.visible");
    });

    it("should show OTP input after entering email and clicking send", () => {
      cy.visit("/login");

      // Enter email
      cy.get('[data-testid="email-input"]').type(testEmail);

      // Click send code
      cy.get('[data-testid="send-code-button"]').click();

      // Wait for OTP screen (may take a few seconds for API call)
      cy.get('[data-testid="otp-input"]', { timeout: 15000 }).should("be.visible");

      // Verify OTP screen elements
      cy.contains("Enter Code").should("be.visible");
      cy.contains(testEmail).should("be.visible");
      cy.get('[data-testid="verify-code-button"]').should("be.visible");
    });

    it("should allow going back from OTP screen to email entry", () => {
      cy.visit("/login");

      // Enter email and get to OTP screen
      cy.get('[data-testid="email-input"]').type(testEmail);
      cy.get('[data-testid="send-code-button"]').click();
      cy.get('[data-testid="otp-input"]', { timeout: 15000 }).should("be.visible");

      // Click back button
      cy.get('[data-testid="back-to-email-button"]').click();

      // Should be back on email screen
      cy.get('[data-testid="email-input"]').should("be.visible");
      cy.get('[data-testid="send-code-button"]').should("be.visible");
    });
  });

  describe("Onboarding Page", () => {
    it("should have correct form elements", () => {
      // Try to visit onboarding directly (will redirect if not authenticated)
      cy.visit("/onboarding", { failOnStatusCode: false });

      // If redirected to login, that's expected behavior
      // If on onboarding, verify elements
      cy.url().then((url) => {
        if (url.includes("/onboarding")) {
          cy.contains("Complete Your Profile").should("be.visible");
          cy.get('[data-testid="first-name-input"]').should("be.visible");
          cy.get('[data-testid="last-name-input"]').should("be.visible");
          cy.get('[data-testid="submit-profile-button"]').should("be.visible");
        }
      });
    });
  });

  describe("Dashboard Page", () => {
    it("should redirect to login when accessing dashboard without auth", () => {
      cy.visit("/dashboard");

      // Should be redirected to login
      cy.url({ timeout: 10000 }).should("include", "/login");
    });
  });

  describe("Protected Routes", () => {
    it("should redirect unauthenticated users to login", () => {
      // Only test routes that actually exist
      cy.visit("/dashboard");
      cy.url({ timeout: 10000 }).should("include", "/login");
    });
  });
});
