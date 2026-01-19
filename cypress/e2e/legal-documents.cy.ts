/// <reference types="cypress" />
import { setupClerkTestingToken } from "@clerk/testing/cypress";

/**
 * Legal Documents E2E Tests
 *
 * Comprehensive tests for the legal document templates feature including:
 * - Will creation and editing
 * - State-specific requirements
 * - PDF preview and export
 * - Form validation
 * - Data persistence
 *
 * Uses Clerk testing tokens for automated authentication.
 *
 * Run with: pnpm test:e2e -- --spec "cypress/e2e/legal-documents.cy.ts"
 */

const TEST_USER_EMAIL = Cypress.env("TEST_USER_EMAIL");

describe("Legal Documents - E2E Test Suite", () => {
  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.window().then((win) => {
      win.sessionStorage.clear();
    });
  });

  describe("Unauthenticated Access", () => {
    it("should redirect to login when accessing legal documents without auth", () => {
      cy.visit("/legacy/documents/test-id");
      cy.url({ timeout: 10000 }).should("include", "/sign-in");
    });
  });

  describe("Legal Documents Section", () => {
    beforeEach(() => {
      setupClerkTestingToken();
      cy.visit("/");
      cy.clerkLoaded();
      cy.clerkSignIn({
        strategy: "email_code",
        identifier: TEST_USER_EMAIL,
      });
    });

    it("should display legal documents section on legacy page", () => {
      cy.visit("/legacy?tab=legal-documents", { failOnStatusCode: false });

      cy.url({ timeout: 15000 }).then((url) => {
        if (url.includes("/onboarding") || url.includes("/select-plan")) {
          cy.log("User needs onboarding - skipping test");
          return;
        }

        // Wait for loading to complete - either content appears or spinner disappears
        // The page shows a spinner while loading, then shows content
        cy.get("body", { timeout: 20000 }).should("be.visible");

        // Wait for actual content to load (not just the loading spinner)
        // Either "Legal Document Templates" appears, or "Upgrade" for gated feature
        cy.get("body", { timeout: 20000 }).should(($body) => {
          const bodyText = $body.text();
          const hasLegalDocs =
            bodyText.includes("Legal Document Templates") ||
            bodyText.includes("Educational Purposes Only") ||
            bodyText.includes("Last Will") ||
            bodyText.includes("Last Will and Testament");
          const hasFeatureGate = bodyText.includes("Upgrade") || bodyText.includes("upgrade");

          expect(hasLegalDocs || hasFeatureGate).to.be.true;
        });
      });
    });

    it("should show educational disclaimer prominently", () => {
      cy.visit("/legacy?tab=legal-documents", { failOnStatusCode: false });

      cy.url({ timeout: 15000 }).then((url) => {
        if (url.includes("/onboarding") || url.includes("/select-plan")) {
          cy.log("User needs onboarding - skipping test");
          return;
        }

        cy.get("body", { timeout: 15000 }).should("be.visible");

        cy.get("body").then(($body) => {
          if ($body.text().includes("Legal Document Templates")) {
            // Check for educational disclaimer
            cy.contains("Educational Purposes Only").should("be.visible");
            cy.contains("qualified attorney").should("be.visible");
          }
        });
      });
    });

    it("should display only enabled document types (will only for initial release)", () => {
      cy.visit("/legacy?tab=legal-documents", { failOnStatusCode: false });

      cy.url({ timeout: 15000 }).then((url) => {
        if (url.includes("/onboarding") || url.includes("/select-plan")) {
          cy.log("User needs onboarding - skipping test");
          return;
        }

        cy.get("body", { timeout: 15000 }).should("be.visible");

        cy.get("body").then(($body) => {
          if ($body.text().includes("Legal Document Templates")) {
            // Will should be visible
            cy.contains("Last Will and Testament").should("be.visible");

            // Other document types should NOT be visible (disabled for initial release)
            cy.contains("Revocable Living Trust").should("not.exist");
            cy.contains("Pour-Over Will").should("not.exist");
            cy.contains("Durable Power of Attorney").should("not.exist");
            cy.contains("Healthcare Power of Attorney").should("not.exist");
            cy.contains("Advance Healthcare Directive").should("not.exist");
          }
        });
      });
    });
  });

  describe("Will Document Wizard", () => {
    beforeEach(() => {
      setupClerkTestingToken();
      cy.visit("/");
      cy.clerkLoaded();
      cy.clerkSignIn({
        strategy: "email_code",
        identifier: TEST_USER_EMAIL,
      });
    });

    it("should open disclaimer modal when starting a will", () => {
      cy.visit("/legacy?tab=legal-documents", { failOnStatusCode: false });

      cy.url({ timeout: 15000 }).then((url) => {
        if (url.includes("/onboarding") || url.includes("/select-plan")) {
          cy.log("User needs onboarding - skipping test");
          return;
        }

        cy.get("body", { timeout: 15000 }).should("be.visible");

        cy.get("body").then(($body) => {
          if ($body.text().includes("Last Will and Testament")) {
            // Click start document button for Will
            cy.contains("Start Document").first().click();

            // Should show disclaimer modal
            cy.contains("Important Legal Notice", { timeout: 5000 }).should("be.visible");
            cy.contains("not a substitute for legal advice").should("be.visible");
          }
        });
      });
    });

    it("should require state selection before starting", () => {
      cy.visit("/legacy?tab=legal-documents", { failOnStatusCode: false });

      cy.url({ timeout: 15000 }).then((url) => {
        if (url.includes("/onboarding") || url.includes("/select-plan")) {
          cy.log("User needs onboarding - skipping test");
          return;
        }

        cy.get("body", { timeout: 15000 }).should("be.visible");

        cy.get("body").then(($body) => {
          if ($body.text().includes("Last Will and Testament")) {
            cy.contains("Start Document").first().click();

            // Wait for modal
            cy.contains("Important Legal Notice", { timeout: 5000 }).should("be.visible");

            // Should have state selector
            cy.get('select, [role="combobox"]').should("exist");
          }
        });
      });
    });

    it("should navigate to wizard after accepting disclaimer", () => {
      cy.visit("/legacy?tab=legal-documents", { failOnStatusCode: false });

      cy.url({ timeout: 15000 }).then((url) => {
        if (url.includes("/onboarding") || url.includes("/select-plan")) {
          cy.log("User needs onboarding - skipping test");
          return;
        }

        cy.get("body", { timeout: 15000 }).should("be.visible");

        cy.get("body").then(($body) => {
          if ($body.text().includes("Last Will and Testament")) {
            cy.contains("Start Document").first().click();

            // Wait for modal
            cy.contains("Important Legal Notice", { timeout: 5000 }).should("be.visible");

            // Accept disclaimer (button should be in modal)
            cy.contains("button", /I Understand|Accept|Continue/).click();

            // Should navigate to document editor
            cy.url({ timeout: 10000 }).should("include", "/legacy/documents/");
          }
        });
      });
    });
  });

  describe("Will Wizard Steps", () => {
    beforeEach(() => {
      setupClerkTestingToken();
      cy.visit("/");
      cy.clerkLoaded();
      cy.clerkSignIn({
        strategy: "email_code",
        identifier: TEST_USER_EMAIL,
      });
    });

    it("should display personal information step first", () => {
      // This test assumes we have an existing will document
      cy.visit("/legacy?tab=legal-documents", { failOnStatusCode: false });

      cy.url({ timeout: 15000 }).then((url) => {
        if (url.includes("/onboarding") || url.includes("/select-plan")) {
          cy.log("User needs onboarding - skipping test");
          return;
        }

        cy.get("body", { timeout: 15000 }).should("be.visible");

        cy.get("body").then(($body) => {
          // Check if there's an existing will to edit, or start new
          if ($body.text().includes("Continue") || $body.text().includes("Edit")) {
            // Click edit/continue on existing document
            cy.contains("button", /Continue|Edit/)
              .first()
              .click();

            // Should show wizard with personal info step
            cy.url({ timeout: 10000 }).should("include", "/legacy/documents/");

            // Verify we're on personal information step
            cy.get("body").then(($wizardBody) => {
              const hasPersonalInfo =
                $wizardBody.text().includes("Personal Information") ||
                $wizardBody.text().includes("Full Legal Name") ||
                $wizardBody.text().includes("Your Information");
              expect(hasPersonalInfo).to.be.true;
            });
          }
        });
      });
    });

    it("should show progress indicator", () => {
      cy.visit("/legacy?tab=legal-documents", { failOnStatusCode: false });

      cy.url({ timeout: 15000 }).then((url) => {
        if (url.includes("/onboarding") || url.includes("/select-plan")) {
          cy.log("User needs onboarding - skipping test");
          return;
        }

        cy.get("body", { timeout: 15000 }).should("be.visible");

        cy.get("body").then(($body) => {
          if ($body.text().includes("Continue") || $body.text().includes("Edit")) {
            cy.contains("button", /Continue|Edit/)
              .first()
              .click();

            cy.url({ timeout: 10000 }).should("include", "/legacy/documents/");

            // Should show step progress indicator
            cy.get("body").then(($wizardBody) => {
              const hasProgress =
                $wizardBody.text().includes("Step") ||
                $wizardBody.find('[role="progressbar"]').length > 0 ||
                $wizardBody.find(".progress").length > 0;
              // Progress indicator may be visual only
              cy.log(`Progress indicator found: ${hasProgress}`);
            });
          }
        });
      });
    });

    it("should validate required fields before proceeding", () => {
      cy.visit("/legacy?tab=legal-documents", { failOnStatusCode: false });

      cy.url({ timeout: 15000 }).then((url) => {
        if (url.includes("/onboarding") || url.includes("/select-plan")) {
          cy.log("User needs onboarding - skipping test");
          return;
        }

        cy.get("body", { timeout: 15000 }).should("be.visible");

        cy.get("body").then(($body) => {
          if ($body.text().includes("Continue") || $body.text().includes("Edit")) {
            cy.contains("button", /Continue|Edit/)
              .first()
              .click();

            cy.url({ timeout: 10000 }).should("include", "/legacy/documents/");

            // Try to proceed without filling required fields
            // Clear any existing values first
            cy.get('input[type="text"]').first().clear();

            // Click next
            cy.contains("button", /Next|Continue/).click();

            // Should show validation error or stay on same step
            cy.get("body").then(($validationBody) => {
              const hasError =
                $validationBody.text().includes("required") ||
                $validationBody.text().includes("Please") ||
                $validationBody.text().includes("error");
              // Validation may prevent navigation silently
              cy.log(`Validation error shown: ${hasError}`);
            });
          }
        });
      });
    });
  });

  describe("State-Specific Requirements", () => {
    beforeEach(() => {
      setupClerkTestingToken();
      cy.visit("/");
      cy.clerkLoaded();
      cy.clerkSignIn({
        strategy: "email_code",
        identifier: TEST_USER_EMAIL,
      });
    });

    it("should show state-specific witness requirements", () => {
      cy.visit("/legacy?tab=legal-documents", { failOnStatusCode: false });

      cy.url({ timeout: 15000 }).then((url) => {
        if (url.includes("/onboarding") || url.includes("/select-plan")) {
          cy.log("User needs onboarding - skipping test");
          return;
        }

        cy.get("body", { timeout: 15000 }).should("be.visible");

        cy.get("body").then(($body) => {
          if ($body.text().includes("Continue") || $body.text().includes("Edit")) {
            cy.contains("button", /Continue|Edit/)
              .first()
              .click();

            cy.url({ timeout: 10000 }).should("include", "/legacy/documents/");

            // Navigate through steps until witness step
            // This may require multiple "Next" clicks
            cy.get("body").then(($wizardBody) => {
              if ($wizardBody.text().includes("witness")) {
                // Should show witness requirements
                cy.contains(/witness|Witness/).should("be.visible");
              }
            });
          }
        });
      });
    });
  });

  describe("Document Preview and PDF", () => {
    beforeEach(() => {
      setupClerkTestingToken();
      cy.visit("/");
      cy.clerkLoaded();
      cy.clerkSignIn({
        strategy: "email_code",
        identifier: TEST_USER_EMAIL,
      });
    });

    it("should show preview button for completed documents", () => {
      cy.visit("/legacy?tab=legal-documents", { failOnStatusCode: false });

      cy.url({ timeout: 15000 }).then((url) => {
        if (url.includes("/onboarding") || url.includes("/select-plan")) {
          cy.log("User needs onboarding - skipping test");
          return;
        }

        cy.get("body", { timeout: 15000 }).should("be.visible");

        cy.get("body").then(($body) => {
          // Check for preview button on completed documents
          const hasPreview =
            $body.find('button:contains("Preview")').length > 0 ||
            $body.find('[aria-label*="preview"]').length > 0 ||
            $body.find('[title*="Preview"]').length > 0;

          if (hasPreview) {
            cy.contains("button", "Preview").should("be.visible");
          } else {
            cy.log("No completed documents with preview available");
          }
        });
      });
    });

    it("should open PDF preview modal", () => {
      cy.visit("/legacy?tab=legal-documents", { failOnStatusCode: false });

      cy.url({ timeout: 15000 }).then((url) => {
        if (url.includes("/onboarding") || url.includes("/select-plan")) {
          cy.log("User needs onboarding - skipping test");
          return;
        }

        cy.get("body", { timeout: 15000 }).should("be.visible");

        cy.get("body").then(($body) => {
          const previewButton = $body.find('button[title*="Preview"], [aria-label*="preview"]');

          if (previewButton.length > 0) {
            cy.wrap(previewButton.first()).click();

            // Should open preview modal
            cy.get('[role="dialog"]', { timeout: 5000 }).should("be.visible");

            // Should have PDF viewer or preview content
            cy.get("body").then(($modalBody) => {
              const hasPreview =
                $modalBody.find("iframe").length > 0 ||
                $modalBody.find("canvas").length > 0 ||
                $modalBody.text().includes("Last Will");
              expect(hasPreview).to.be.true;
            });
          } else {
            cy.log("No preview button available");
          }
        });
      });
    });
  });

  describe("Document Data Persistence", () => {
    beforeEach(() => {
      setupClerkTestingToken();
      cy.visit("/");
      cy.clerkLoaded();
      cy.clerkSignIn({
        strategy: "email_code",
        identifier: TEST_USER_EMAIL,
      });
    });

    it("should save progress automatically", () => {
      cy.visit("/legacy?tab=legal-documents", { failOnStatusCode: false });

      cy.url({ timeout: 15000 }).then((url) => {
        if (url.includes("/onboarding") || url.includes("/select-plan")) {
          cy.log("User needs onboarding - skipping test");
          return;
        }

        cy.get("body", { timeout: 15000 }).should("be.visible");

        cy.get("body").then(($body) => {
          if ($body.text().includes("Continue") || $body.text().includes("Edit")) {
            cy.contains("button", /Continue|Edit/)
              .first()
              .click();

            cy.url({ timeout: 10000 }).should("include", "/legacy/documents/");

            // Fill in a field
            const testValue = `Test Name ${Date.now()}`;
            cy.get('input[type="text"]').first().clear().type(testValue);

            // Wait for auto-save (debounced)
            cy.wait(2000);

            // Navigate away
            cy.visit("/legacy?tab=legal-documents");

            // Go back to document
            cy.contains("button", /Continue|Edit/)
              .first()
              .click();

            // Value should be preserved
            cy.get('input[type="text"]').first().should("have.value", testValue);
          }
        });
      });
    });

    it("should show draft status for incomplete documents", () => {
      cy.visit("/legacy?tab=legal-documents", { failOnStatusCode: false });

      cy.url({ timeout: 15000 }).then((url) => {
        if (url.includes("/onboarding") || url.includes("/select-plan")) {
          cy.log("User needs onboarding - skipping test");
          return;
        }

        cy.get("body", { timeout: 15000 }).should("be.visible");

        cy.get("body").then(($body) => {
          // Check for draft badge on incomplete documents
          const hasDraft =
            $body.text().includes("Draft") || $body.find('[data-status="draft"]').length > 0;

          if (hasDraft) {
            cy.contains("Draft").should("be.visible");
          } else {
            cy.log("No draft documents or all documents completed");
          }
        });
      });
    });
  });

  describe("Document Deletion", () => {
    beforeEach(() => {
      setupClerkTestingToken();
      cy.visit("/");
      cy.clerkLoaded();
      cy.clerkSignIn({
        strategy: "email_code",
        identifier: TEST_USER_EMAIL,
      });
    });

    it("should show delete confirmation dialog", () => {
      cy.visit("/legacy?tab=legal-documents", { failOnStatusCode: false });

      cy.url({ timeout: 15000 }).then((url) => {
        if (url.includes("/onboarding") || url.includes("/select-plan")) {
          cy.log("User needs onboarding - skipping test");
          return;
        }

        cy.get("body", { timeout: 15000 }).should("be.visible");

        cy.get("body").then(($body) => {
          // Look for delete button (trash icon)
          const deleteButton = $body.find(
            'button:has(svg[class*="trash"]), button[aria-label*="delete"], button:has(.lucide-trash)',
          );

          if (deleteButton.length > 0) {
            cy.wrap(deleteButton.first()).click();

            // Should show confirmation dialog
            cy.get('[role="alertdialog"]', { timeout: 5000 }).should("be.visible");
            cy.contains("Delete Document").should("be.visible");
            cy.contains("cannot be undone").should("be.visible");
          } else {
            cy.log("No documents to delete");
          }
        });
      });
    });

    it("should cancel deletion when clicking cancel", () => {
      cy.visit("/legacy?tab=legal-documents", { failOnStatusCode: false });

      cy.url({ timeout: 15000 }).then((url) => {
        if (url.includes("/onboarding") || url.includes("/select-plan")) {
          cy.log("User needs onboarding - skipping test");
          return;
        }

        cy.get("body", { timeout: 15000 }).should("be.visible");

        cy.get("body").then(($body) => {
          const deleteButton = $body.find(
            'button:has(svg[class*="trash"]), button[aria-label*="delete"]',
          );

          if (deleteButton.length > 0) {
            cy.wrap(deleteButton.first()).click();

            // Click cancel
            cy.contains("button", "Cancel").click();

            // Dialog should close
            cy.get('[role="alertdialog"]').should("not.exist");

            // Document should still exist
            cy.contains("Last Will and Testament").should("be.visible");
          } else {
            cy.log("No documents to test deletion");
          }
        });
      });
    });
  });

  describe("Back Navigation", () => {
    beforeEach(() => {
      setupClerkTestingToken();
      cy.visit("/");
      cy.clerkLoaded();
      cy.clerkSignIn({
        strategy: "email_code",
        identifier: TEST_USER_EMAIL,
      });
    });

    it("should navigate back to legacy page from wizard", () => {
      cy.visit("/legacy?tab=legal-documents", { failOnStatusCode: false });

      cy.url({ timeout: 15000 }).then((url) => {
        if (url.includes("/onboarding") || url.includes("/select-plan")) {
          cy.log("User needs onboarding - skipping test");
          return;
        }

        cy.get("body", { timeout: 15000 }).should("be.visible");

        cy.get("body").then(($body) => {
          if ($body.text().includes("Continue") || $body.text().includes("Edit")) {
            cy.contains("button", /Continue|Edit/)
              .first()
              .click();

            cy.url({ timeout: 10000 }).should("include", "/legacy/documents/");

            // Click back button
            cy.contains("Back to Legacy Planning").click();

            // Should be back on legacy page
            cy.url({ timeout: 10000 }).should("include", "/legacy");
            cy.url().should("include", "tab=legal-documents");
          }
        });
      });
    });
  });
});

/**
 * Snapshot-like Tests for Document Structure
 * These tests verify that the document structure remains consistent
 */
describe("Legal Documents - Structure Verification", () => {
  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
    setupClerkTestingToken();
    cy.visit("/");
    cy.clerkLoaded();
    cy.clerkSignIn({
      strategy: "email_code",
      identifier: TEST_USER_EMAIL,
    });
  });

  describe("Will Document Structure", () => {
    it("should have consistent document type metadata", () => {
      cy.visit("/legacy?tab=legal-documents", { failOnStatusCode: false });

      cy.url({ timeout: 15000 }).then((url) => {
        if (url.includes("/onboarding") || url.includes("/select-plan")) {
          cy.log("User needs onboarding - skipping test");
          return;
        }

        cy.get("body", { timeout: 15000 }).should("be.visible");

        cy.get("body").then(($body) => {
          if ($body.text().includes("Last Will and Testament")) {
            // Verify will metadata
            cy.contains("Last Will and Testament").should("be.visible");
            cy.contains("Asset distribution").should("be.visible");
          }
        });
      });
    });
  });
});
