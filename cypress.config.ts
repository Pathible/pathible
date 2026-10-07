import { clerkSetup } from "@clerk/testing/cypress";
import { defineConfig } from "cypress";
import dotenv from "dotenv";

// Test-specific settings take precedence over the local development configuration.
dotenv.config({ path: [".env.test", ".env.local"] });

export default defineConfig({
  e2e: {
    baseUrl: "http://localhost:3000",
    supportFile: "cypress/support/e2e.ts",
    specPattern: "cypress/e2e/**/*.cy.{js,jsx,ts,tsx}",
    video: false,
    screenshotOnRunFailure: true,
    viewportWidth: 1280,
    viewportHeight: 720,
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    responseTimeout: 10000,

    async setupNodeEvents(on, config) {
      // Set up Clerk testing tokens for E2E tests
      // This bypasses bot detection and enables automated auth testing
      const clerkConfig = await clerkSetup({ config });

      // Additional task handlers
      on("task", {
        log(message) {
          console.log(message);
          return null;
        },
      });

      return clerkConfig;
    },

    env: {
      // Load from .env.test - Cypress automatically picks up CYPRESS_* prefixed vars
      // IMPORTANT: Clerk requires +clerk_test subaddress for Testing Tokens
      TEST_USER_EMAIL: process.env.CYPRESS_TEST_USER_EMAIL || "test+clerk_test@example.com",
      // Clerk keys for testing (needed by @clerk/testing)
      CLERK_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
      CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY,
    },
  },

  component: {
    devServer: {
      framework: "next",
      bundler: "webpack",
    },
  },

  retries: {
    runMode: 2,
    openMode: 0,
  },
});
