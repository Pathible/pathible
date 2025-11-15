/// <reference types="cypress" />

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Custom command to log in with OTP
       * @example cy.loginWithOtp('user@test.com', '123456')
       */
      loginWithOtp(email: string, otp: string): Chainable<void>;

      /**
       * Custom command to create a profile
       * @example cy.createProfile('John', 'Doe')
       */
      createProfile(firstName: string, lastName: string): Chainable<void>;

      /**
       * Custom command to check if element exists without failing
       * @example cy.elementExists('[data-testid="profile"]').then(exists => {...})
       */
      elementExists(selector: string): Chainable<boolean>;

      /**
       * Custom command to wait for navigation and ensure page is loaded
       * @example cy.waitForNavigation('/dashboard')
       */
      waitForNavigation(path: string): Chainable<void>;

      /**
       * Custom command to mock OTP sending and automatically intercept
       * @example cy.mockOtpFlow()
       */
      mockOtpFlow(): Chainable<void>;

      /**
       * Custom command to clean up test user data
       * @example cy.cleanupTestUser('test@example.com')
       */
      cleanupTestUser(email: string): Chainable<void>;

      /**
       * Custom command to directly authenticate via API (bypassing UI)
       * @example cy.authenticateViaApi('user@test.com')
       */
      authenticateViaApi(email: string): Chainable<void>;

      /**
       * Custom command to verify user is authenticated
       * @example cy.verifyAuthenticated()
       */
      verifyAuthenticated(): Chainable<void>;

      /**
       * Custom command to verify user is NOT authenticated
       * @example cy.verifyNotAuthenticated()
       */
      verifyNotAuthenticated(): Chainable<void>;
    }
  }
}

/**
 * Login with OTP
 * Fills in email, requests OTP, and enters code
 * Uses {force: true} to handle element coverage issues
 */
Cypress.Commands.add("loginWithOtp", (email: string, otp: string) => {
  // Visit login page
  cy.visit("/login");

  // Fill in email (use force to handle any overlays)
  cy.get('[data-testid="email-input"]', { timeout: 10000 })
    .should("be.visible")
    .type(email, { force: true });

  // Click send code button
  cy.get('[data-testid="send-code-button"]').click({ force: true });

  // Wait for OTP input to appear
  cy.get('[data-testid="otp-input"]', { timeout: 15000 }).should("be.visible");

  // Enter OTP code - type directly on the InputOTP component
  cy.get('[data-testid="otp-input"]').type(otp, { force: true });

  // The verification happens automatically when 6 digits are entered
  // Wait for redirect (either to dashboard or onboarding)
  cy.url({ timeout: 20000 }).should("not.include", "/login");
});

/**
 * Create a profile
 * Fills in first name and last name on onboarding page
 */
Cypress.Commands.add("createProfile", (firstName: string, lastName: string) => {
  // Should be on onboarding page
  cy.url().should("include", "/onboarding");

  // Fill in profile form
  cy.get('[data-testid="first-name-input"]').should("be.visible").type(firstName);
  cy.get('[data-testid="last-name-input"]').should("be.visible").type(lastName);

  // Submit form
  cy.get('[data-testid="submit-profile-button"]').click();

  // Wait for redirect to dashboard
  cy.url({ timeout: 15000 }).should("include", "/dashboard");
});

/**
 * Check if element exists without failing the test
 */
Cypress.Commands.add("elementExists", (selector: string) => {
  return cy.get("body").then(($body) => {
    return $body.find(selector).length > 0;
  });
});

/**
 * Wait for navigation to complete and ensure page is loaded
 */
Cypress.Commands.add("waitForNavigation", (path: string) => {
  cy.url({ timeout: 15000 }).should("include", path);
  // Wait for page to be fully loaded
  cy.get("body").should("be.visible");
});

/**
 * Mock the OTP flow by intercepting the API calls
 * This allows tests to proceed without actual email sending
 * and includes comprehensive Convex API mocking
 */
Cypress.Commands.add("mockOtpFlow", () => {
  // Intercept OTP send request
  cy.intercept("POST", "**/api/auth/email-otp/send-verification-otp", {
    statusCode: 200,
    body: { success: true },
  }).as("sendOtp");

  // Intercept OTP verification request - return success
  cy.intercept("POST", "**/api/auth/sign-in/email-otp", {
    statusCode: 200,
    body: {
      user: {
        _id: "test-user-id",
        id: "test-user-id",
        email: Cypress.env("NEW_USER_EMAIL") || "newuser@test.pathible.com",
        emailVerified: true,
        createdAt: Date.now(),
      },
      session: {
        token: "test-token",
        sessionToken: "test-session-token",
        expiresAt: Date.now() + 1000 * 60 * 60 * 24, // 24 hours
      },
    },
  }).as("verifyOtp");

  // Intercept Convex token endpoint
  cy.intercept("GET", "**/api/auth/convex/token", {
    statusCode: 200,
    body: { token: "test-convex-jwt-token" },
  }).as("getConvexToken");

  // Mock Convex profile queries
  cy.intercept("POST", "**/api/query", (req) => {
    if (req.body.path === "profiles:get") {
      // Return null for new users (no profile)
      req.reply({
        statusCode: 200,
        body: { value: null },
      });
    } else if (req.body.path === "auth:getCurrentUser") {
      req.reply({
        statusCode: 200,
        body: {
          value: {
            _id: "test-user-id",
            email: "test@example.com",
            emailVerified: true,
          },
        },
      });
    } else if (req.body.path === "auth:getCurrentUserWithProfile") {
      // Return null for new users (no profile yet)
      req.reply({
        statusCode: 200,
        body: { value: null },
      });
    } else {
      // Allow other Convex queries through
      req.continue();
    }
  }).as("convexQuery");

  // Mock Convex mutations (profile creation)
  cy.intercept("POST", "**/api/mutation", (req) => {
    if (req.body.path === "profiles:create") {
      req.reply({
        statusCode: 200,
        body: { value: "profile-created-id" },
      });
    } else {
      req.continue();
    }
  }).as("convexMutation");

  // Mock session checks
  cy.intercept("GET", "**/api/auth/get-session", {
    statusCode: 200,
    body: {
      data: {
        session: {
          userId: "test-user-id",
          expiresAt: Date.now() + 86400000,
        },
        user: {
          id: "test-user-id",
          email: "test@example.com",
          emailVerified: true,
        },
      },
    },
  }).as("getSession");
});

/**
 * Clean up test user data (if API available)
 * Note: This is a placeholder - implement based on your cleanup strategy
 */
Cypress.Commands.add("cleanupTestUser", (email: string) => {
  // This would typically call a test-only API endpoint to clean up
  cy.log(`Cleaning up test user: ${email}`);
  // For now, just clear cookies and local storage
  cy.clearCookies();
  cy.clearLocalStorage();
  cy.window().then((win) => {
    win.sessionStorage.clear();
  });
});

/**
 * Authenticate directly via API (for setting up test state)
 * This bypasses the UI and directly sets authentication state
 */
Cypress.Commands.add("authenticateViaApi", (email: string) => {
  // Set cookies/session as if user logged in
  // This is a mock - adjust based on your auth implementation
  cy.setCookie("better-auth.session_token", "test-session-token");

  // Set local storage if needed
  cy.window().then((win) => {
    win.localStorage.setItem("auth-email", email);
  });

  cy.log(`Authenticated as: ${email}`);
});

/**
 * Verify user is authenticated by checking for auth indicators
 */
Cypress.Commands.add("verifyAuthenticated", () => {
  // Try to visit dashboard - should succeed if authenticated
  cy.visit("/dashboard");
  cy.url({ timeout: 5000 }).should("include", "/dashboard");
  cy.url().should("not.include", "/login");
});

/**
 * Verify user is NOT authenticated by checking redirects
 */
Cypress.Commands.add("verifyNotAuthenticated", () => {
  // Try to visit dashboard - should redirect to login if not authenticated
  cy.visit("/dashboard");
  cy.url({ timeout: 5000 }).should("include", "/login");
});

// Export to make TypeScript happy
export {};
