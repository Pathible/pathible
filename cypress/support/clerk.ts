// Cypress 16 keeps secrets on the Node side. Clerk's current browser helpers still
// use the removed Cypress.env API, so this adapter uses cy.env without exposing tokens.
import type { Clerk } from "@clerk/shared/types";
import type {} from "@clerk/testing/cypress";

type ClerkSignInParams = Parameters<Cypress.Chainable["clerkSignIn"]>[0];

type ClerkWindow = Window & { Clerk: Clerk };
export function setupClerkTestingToken(): void {
  cy.env(["CLERK_FAPI", "CLERK_TESTING_TOKEN"], { log: false }).then((values) => {
    const host = values.CLERK_FAPI;
    const token = values.CLERK_TESTING_TOKEN;
    if (typeof host !== "string" || typeof token !== "string")
      throw new Error("Clerk testing configuration is missing");
    cy.intercept(`https://${host}/v1/**`, (request) => {
      request.query.__clerk_testing_token = token;
      request.continue();
      request.on("response", (response) => {
        if (response.body?.response?.captcha_bypass === false)
          response.body.response.captcha_bypass = true;
        if (response.body?.client?.captcha_bypass === false)
          response.body.client.captcha_bypass = true;
      });
    });
  });
}

export function addClerkCommands({
  Cypress: runner,
  cy: commands,
}: {
  Cypress: typeof Cypress;
  cy: typeof cy;
}): void {
  runner.Commands.add("clerkLoaded", () => {
    commands
      .window()
      .should((window) => expect((window as ClerkWindow).Clerk?.loaded).to.equal(true));
  });
  runner.Commands.add("clerkSignOut", (options) => {
    commands.window().then((window) => (window as ClerkWindow).Clerk.signOut(options));
  });
  runner.Commands.add("clerkSignIn", (params: ClerkSignInParams) => {
    setupClerkTestingToken();
    commands.clerkLoaded();
    commands.window().then(async (window) => {
      const clerk = (window as ClerkWindow).Clerk;
      if (!clerk.client) throw new Error("Clerk client not loaded");
      if (params.strategy !== "email_code" || !params.identifier.includes("+clerk_test"))
        throw new Error("Only Clerk development test-email sign-in is supported");
      const signIn = await clerk.client.signIn.create({ identifier: params.identifier });
      const factor = signIn.supportedFirstFactors?.find((item) => item.strategy === "email_code");
      if (factor?.strategy !== "email_code")
        throw new Error("Test account has no email-code factor");
      await signIn.prepareFirstFactor({
        strategy: "email_code",
        emailAddressId: factor.emailAddressId,
      });
      const result = await signIn.attemptFirstFactor({ strategy: "email_code", code: "424242" });
      if (result.status !== "complete") throw new Error("Test sign-in was not completed");
      await clerk.setActive({ session: result.createdSessionId });
    });
  });
}
