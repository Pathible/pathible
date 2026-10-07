describe("Public acquisition journey", () => {
  it("offers a concrete family action", () => {
    cy.visit("/");
    cy.get("h1").should("contain", "family");
    cy.get('[data-testid="hero-start"]').should("have.attr", "href", "/signup");
  });

  it("separates the primary action and guide link on desktop and mobile", () => {
    for (const width of [1280, 375]) {
      cy.viewport(width, 900);
      cy.visit("/");
      cy.get('[data-testid="hero-start"]').then((button) => {
        cy.get('[data-testid="hero-guide"]').then((guide) => {
          expect(
            guide[0].getBoundingClientRect().top - button[0].getBoundingClientRect().bottom,
          ).to.be.at.least(16);
        });
      });
    }
  });

  it("opens the exact family access guide from the homepage", () => {
    cy.visit("/");
    cy.get('[data-testid="hero-guide"]').click();
    cy.get("article h1").should("be.visible");
    cy.request("/learn/the-family-access-map").its("status").should("eq", 200);
  });

  it("renders JSON-LD as data without executable Next script wrappers", () => {
    cy.visit("/");
    cy.get('script[type="application/ld+json"]').should("have.length", 4);
    cy.get('script[type="application/ld+json"]').each((script) => {
      expect(() => JSON.parse(script.text())).not.to.throw();
    });
  });

  it("preserves a partner referral through the signup redirect", () => {
    cy.visit("/signup?ref=attorney-smith");
    cy.location("pathname").should("eq", "/sign-up");
    cy.location("search").should("contain", "ref=attorney-smith");
  });

  it("offers one annual plan without a monthly toggle", () => {
    cy.visit("/pricing");
    cy.get('[data-testid="annual-family-plan"]').should("contain", "/ year");
    cy.contains("Full annual amount charged at checkout").should("be.visible");
    cy.contains("Monthly").should("not.exist");
  });

  it("keeps partner attribution while browsing before signup", () => {
    cy.clearCookies();
    cy.visit("/?ref=attorney-smith");
    cy.get('[data-testid="hero-start"]').click();
    cy.location("search").should("contain", "ref=attorney-smith");
  });

  it("provides an email preference page without requiring a paid plan", () => {
    cy.visit("/unsubscribe");
    cy.contains("h1", "Email Preferences").should("be.visible");
  });

  it("serves full article content and matching metadata", () => {
    cy.visit("/learn");
    cy.get('a[href^="/learn/"]')
      .first()
      .invoke("attr", "href")
      .then((href) => {
        cy.request(href as string).then(({ body }) => {
          expect(body).not.to.contain("<title>Article Not Found");
          expect(body).to.contain("<article");
        });
        cy.visit(href as string);
        cy.get("article h1")
          .invoke("text")
          .then((title) => {
            cy.title().should("contain", title);
          });
      });
  });

  it("returns 404 for an article that does not exist", () => {
    cy.request({ url: "/learn/article-that-does-not-exist-audit", failOnStatusCode: false })
      .its("status")
      .should("eq", 404);
  });
});
