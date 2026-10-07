describe("public billing boundaries", () => {
  it("rejects anonymous checkout requests", () => {
    cy.request({
      method: "POST",
      url: "/api/stripe/create-checkout",
      body: { priceId: "unapproved", mode: "payment" },
      failOnStatusCode: false,
    })
      .its("status")
      .should("eq", 401);
  });
  it("rejects anonymous portal requests", () => {
    cy.request({ method: "POST", url: "/api/stripe/create-portal", failOnStatusCode: false })
      .its("status")
      .should("eq", 401);
  });
  it("shows public pricing without marking an unpaid plan as current", () => {
    cy.visit("/pricing");
    cy.contains("Foundations").should("be.visible");
    cy.contains("Heritage").should("be.visible");
    cy.contains("Legacy").should("be.visible");
    cy.contains("Current Plan").should("not.exist");
    cy.contains("Start Free Trial").should("not.exist");
    cy.contains("button", "Subscribe").should("be.visible");
  });
  it("keeps protected planning and Executor routes behind authentication", () => {
    for (const path of ["/dashboard", "/estate"]) {
      cy.visit(path);
      cy.url().should("match", /\/login|\/sign-in/);
    }
  });
});
