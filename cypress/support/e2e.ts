// ***********************************************************
// This example support/e2e.ts is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import "./commands";

// Alternatively you can use CommonJS syntax:
// require('./commands')

// Global before hook - runs once before all tests
before(() => {
  cy.log("Starting Cypress E2E Test Suite");
});

// Global beforeEach hook - runs before each test
beforeEach(() => {
  // Clear cookies and local storage before each test
  cy.clearCookies();
  cy.clearLocalStorage();
  cy.window().then((win) => {
    win.sessionStorage.clear();
  });

  // Preserve baseUrl for all tests
  cy.log(`Base URL: ${Cypress.config("baseUrl")}`);

  // Set viewport
  cy.viewport(1280, 720);
});

// Global afterEach hook - runs after each test
afterEach(function () {
  // Log test status
  if (this.currentTest?.state === "failed") {
    cy.log(`Test failed: ${this.currentTest.title}`);
  }
});

// Global after hook - runs once after all tests
after(() => {
  cy.log("Cypress E2E Test Suite Complete");
});

// Handle uncaught exceptions
Cypress.on("uncaught:exception", (err) => {
  // Prevent Cypress from failing the test on certain errors
  // You can customize this based on your needs

  // Example: Ignore ResizeObserver errors (common in development)
  if (err.message.includes("ResizeObserver")) {
    return false;
  }

  // Example: Ignore Convex connection errors during tests
  if (err.message.includes("Convex") || err.message.includes("WebSocket")) {
    cy.log("Ignoring Convex connection error in test environment");
    return false;
  }

  // Let other errors fail the test
  return true;
});

// Add custom Cypress configuration
Cypress.config("defaultCommandTimeout", 10000);
Cypress.config("requestTimeout", 10000);
Cypress.config("responseTimeout", 10000);

// Log environment info (console.log is safe outside tests)
console.log("Cypress Test Environment:");
console.log(`TEST_OTP: ${Cypress.env("TEST_OTP") || "123456"}`);
console.log(`NEW_USER_EMAIL: ${Cypress.env("NEW_USER_EMAIL") || "newuser@test.com"}`);
console.log(`RETURNING_USER_EMAIL: ${Cypress.env("RETURNING_USER_EMAIL") || "returning@test.com"}`);
