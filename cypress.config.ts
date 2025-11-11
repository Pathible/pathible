import { defineConfig } from "cypress";

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

    setupNodeEvents(on, config) {
      // implement node event listeners here
      on("task", {
        log(message) {
          console.log(message);
          return null;
        },
      });

      return config;
    },

    env: {
      // Test OTP code that will be used in tests
      TEST_OTP: "123456",
      // Test user emails
      NEW_USER_EMAIL: "newuser@test.pathible.com",
      RETURNING_USER_EMAIL: "returning@test.pathible.com",
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
