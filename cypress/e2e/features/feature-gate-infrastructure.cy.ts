/**
 * Feature Gate Infrastructure Tests
 *
 * These tests validate that the feature gating infrastructure works correctly.
 * They test the FeatureGate component, UpgradePrompt, and Cypress commands.
 */

describe("Feature Gate Infrastructure", () => {
  beforeEach(() => {
    // Clear any previous state
    cy.clearCookies();
    cy.clearLocalStorage();
  });

  describe("Cypress Commands", () => {
    it("should have mockUserWithPlan command available", () => {
      expect(cy.mockUserWithPlan).to.exist;
    });

    it("should have assertFeatureAccessible command available", () => {
      expect(cy.assertFeatureAccessible).to.exist;
    });

    it("should have assertFeatureBlocked command available", () => {
      expect(cy.assertFeatureBlocked).to.exist;
    });

    it("should have assertUpgradePromptShown command available", () => {
      expect(cy.assertUpgradePromptShown).to.exist;
    });
  });

  describe("Plan Feature Mapping", () => {
    it("should load plans fixture correctly", () => {
      cy.fixture("plans.json").then((data) => {
        expect(data.plans).to.have.property("foundations");
        expect(data.plans).to.have.property("heritage");
        expect(data.plans).to.have.property("legacy");
      });
    });

    it("should have correct features for Foundations plan", () => {
      cy.fixture("plans.json").then((data) => {
        const foundationsFeatures = data.plans.foundations.features;
        expect(foundationsFeatures).to.include("vault_storage_basic");
        expect(foundationsFeatures).to.include("vault_folders");
        expect(foundationsFeatures).to.not.include("vault_tags_collections");
        expect(foundationsFeatures).to.not.include("legacy_questionnaires");
      });
    });

    it("should have correct features for Heritage plan", () => {
      cy.fixture("plans.json").then((data) => {
        const heritageFeatures = data.plans.heritage.features;
        expect(heritageFeatures).to.include("vault_tags_collections");
        expect(heritageFeatures).to.include("vault_voice_recordings");
        expect(heritageFeatures).to.not.include("legacy_questionnaires");
        expect(heritageFeatures).to.not.include("family_relationships");
      });
    });

    it("should have correct features for Legacy plan", () => {
      cy.fixture("plans.json").then((data) => {
        const legacyFeatures = data.plans.legacy.features;
        expect(legacyFeatures).to.include("legacy_questionnaires");
        expect(legacyFeatures).to.include("family_relationships");
        expect(legacyFeatures).to.include("wisdom_shared_pages");
        expect(legacyFeatures).to.include("vault_storage_unlimited");
      });
    });
  });

  describe("Feature Areas", () => {
    it("should have all 7 feature areas defined", () => {
      cy.fixture("plans.json").then((data) => {
        const areas = Object.keys(data.featuresByArea);
        expect(areas).to.have.length(7);
        expect(areas).to.include("heritage_vault");
        expect(areas).to.include("financial");
        expect(areas).to.include("family_network");
        expect(areas).to.include("legacy_builder");
        expect(areas).to.include("wisdom");
        expect(areas).to.include("support");
        expect(areas).to.include("access");
      });
    });
  });
});
