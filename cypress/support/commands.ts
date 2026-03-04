/// <reference types="cypress" />

/**
 * Cypress Custom Commands
 *
 * This file contains custom commands for E2E testing with Clerk authentication.
 * Clerk-specific commands (clerkSignIn, clerkSignOut, clerkLoaded) are provided
 * by @clerk/testing/cypress and registered in e2e.ts.
 */

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Sign in with session caching - reuses auth across tests
       * This dramatically speeds up test suites by caching Clerk auth state
       * @param tier - Subscription tier to set (default: 'heritage')
       * @example cy.signInWithSession('heritage')
       */
      signInWithSession(tier?: "foundations" | "heritage" | "legacy"): Chainable<void>;

      /**
       * Sign in with fresh state (for onboarding tests)
       * Creates a unique session that resets the test user
       * @example cy.signInFreshUser()
       */
      signInFreshUser(): Chainable<void>;

      /**
       * Shared onboarding helper - completes onboarding if needed
       * Replaces duplicate ensureUserOnboarded functions in test files
       * @param targetPage - Page to navigate to after onboarding (default: '/dashboard')
       * @example cy.ensureOnboarded('/vault')
       */
      ensureOnboarded(targetPage?: string): Chainable<void>;

      /**
       * Check if element exists without failing the test
       * @example cy.elementExists('[data-testid="profile"]').then(exists => {...})
       */
      elementExists(selector: string): Chainable<boolean>;

      /**
       * Wait for navigation to complete and ensure page is loaded
       * @example cy.waitForNavigation('/dashboard')
       */
      waitForNavigation(path: string): Chainable<void>;

      /**
       * Clean up test state (cookies, localStorage, sessionStorage)
       * @example cy.cleanupTestState()
       */
      cleanupTestState(): Chainable<void>;

      /**
       * Mock a user with a specific subscription plan
       * @example cy.mockUserWithPlan('heritage')
       */
      mockUserWithPlan(plan: "foundations" | "heritage" | "legacy"): Chainable<void>;

      /**
       * Assert that a feature element is accessible (visible)
       * @example cy.assertFeatureAccessible('[data-testid="vault-tags-section"]')
       */
      assertFeatureAccessible(selector: string): Chainable<void>;

      /**
       * Assert that a feature is blocked (shows upgrade prompt)
       * @example cy.assertFeatureBlocked('vault_tags_collections')
       */
      assertFeatureBlocked(featureSlug: string): Chainable<void>;

      /**
       * Assert upgrade prompt is shown for a specific feature
       * @example cy.assertUpgradePromptShown('vault_tags_collections')
       */
      assertUpgradePromptShown(featureSlug: string): Chainable<void>;

      /**
       * Reset test user to clean state (deletes profile, households, and all related data)
       * Must be called AFTER signing in with Clerk.
       * SECURITY: Only works for test user emails (+clerk_test, +e2e_test, etc.)
       * @example cy.resetTestUser()
       */
      resetTestUser(): Chainable<{
        success: boolean;
        message: string;
        deleted: {
          profile: boolean;
          memberships: number;
          households: number;
          familyUnits: number;
          familyMembers: number;
          documents: number;
          categories: number;
          preferences: number;
          invitations: number;
          activityLogs: number;
          wisdomEntries: number;
          letters: number;
          coreBeliefs: number;
          legacyPlans: number;
          keyContacts: number;
          financialAccounts: number;
          properties: number;
          insurancePolicies: number;
          userSuggestions: number;
          notifications: number;
          subscriptions: number;
          userRoles: number;
        };
      }>;

      /**
       * Check if test user is in clean state (no profile)
       * Must be called AFTER signing in with Clerk.
       * @example cy.isTestUserClean().then(result => {...})
       */
      isTestUserClean(): Chainable<{
        isClean: boolean;
        hasProfile: boolean;
        hasMemberships: boolean;
        hasHouseholds: boolean;
      }>;

      /**
       * Grant admin role to the current test user
       * Must be called AFTER signing in with Clerk.
       * SECURITY: Only works for test user emails (+clerk_test, +e2e_test, etc.)
       * @example cy.grantAdminRole()
       */
      grantAdminRole(): Chainable<{
        success: boolean;
        message: string;
      }>;

      /**
       * Clean up test articles created during E2E tests
       * Deletes all articles with slugs starting with "e2e-test-" or titles containing "E2E Test Article"
       * Must be called AFTER signing in with Clerk.
       * SECURITY: Only works for test user emails (+clerk_test, +e2e_test, etc.)
       * @example cy.cleanupTestArticles()
       */
      cleanupTestArticles(): Chainable<{
        success: boolean;
        message: string;
        deletedCount: number;
      }>;

      /**
       * Set subscription tier override for test user's household
       * Allows testing features that require higher tier subscriptions
       * Must be called AFTER signing in with Clerk and completing onboarding.
       * SECURITY: Only works for test user emails (+clerk_test, +e2e_test, etc.)
       * @example cy.setSubscriptionTier('heritage')
       */
      setSubscriptionTier(tier: "foundations" | "heritage" | "legacy" | "founders"): Chainable<{
        success: boolean;
        message: string;
      }>;

      /**
       * Activate estate mode for the test user's household (skips cooldown)
       * Gets the household ID automatically and creates an active estate activation.
       * Must be called AFTER signing in with Clerk and completing onboarding.
       * SECURITY: Only works for test user emails (+clerk_test, +e2e_test, etc.)
       * @example cy.activateEstateMode()
       */
      activateEstateMode(): Chainable<{
        success: boolean;
        message: string;
        activationId?: string;
      }>;

      /**
       * Clean up all estate data for the test user's household
       * Removes activations, checklist items, assets, communications, and distributions.
       * Must be called AFTER signing in with Clerk and completing onboarding.
       * SECURITY: Only works for test user emails (+clerk_test, +e2e_test, etc.)
       * @example cy.cleanupEstateData()
       */
      cleanupEstateData(): Chainable<{
        success: boolean;
        message: string;
        deletedCount: number;
      }>;

      /**
       * Clean up test financial data (accounts, properties, insurance policies)
       * Deletes all financial data created during E2E tests for the test user
       * Must be called AFTER signing in with Clerk.
       * SECURITY: Only works for test user emails (+clerk_test, +e2e_test, etc.)
       * @example cy.cleanupTestFinancialData()
       */
      cleanupTestFinancialData(): Chainable<{
        success: boolean;
        message: string;
        deletedCounts: {
          accounts: number;
          properties: number;
          policies: number;
        };
      }>;

      /**
       * Clean up test wisdom data (entries, core beliefs)
       * Deletes all wisdom data created during E2E tests for the test user
       * Must be called AFTER signing in with Clerk.
       * SECURITY: Only works for test user emails (+clerk_test, +e2e_test, etc.)
       * @example cy.cleanupTestWisdomData()
       */
      cleanupTestWisdomData(): Chainable<{
        success: boolean;
        message: string;
        deletedCounts: {
          entries: number;
          coreBeliefs: number;
        };
      }>;
    }
  }
}

// Import Clerk testing token setup
import { setupClerkTestingToken } from "@clerk/testing/cypress";

/**
 * Sign in with session caching - reuses auth across tests
 * Uses cy.session() to cache Clerk auth state and dramatically speed up test suites
 *
 * NOTE: The tier parameter is stored and used by ensureOnboarded() to set the
 * subscription tier AFTER navigating to the target page. This avoids extra page loads.
 */
Cypress.Commands.add(
  "signInWithSession",
  (tier: "foundations" | "heritage" | "legacy" = "heritage") => {
    // Store the tier for later use by ensureOnboarded
    Cypress.env("CURRENT_TIER", tier);

    // Restore the auth session (this is cached across specs)
    cy.session(
      ["auth"],
      () => {
        // Initial session setup - only runs on first call
        setupClerkTestingToken();
        cy.visit("/");
        cy.clerkLoaded();
        cy.clerkSignIn({
          strategy: "email_code",
          identifier: Cypress.env("TEST_USER_EMAIL"),
        });
        cy.visit("/dashboard", { timeout: 30000 });
        cy.url().should("satisfy", (url: string) => {
          return (
            url.includes("/dashboard") ||
            url.includes("/onboarding") ||
            url.includes("/select-plan")
          );
        });
      },
      {
        validate: () => {
          // Lightweight validation - just check cookies exist
          cy.getCookie("__clerk_db_jwt").should("exist");
        },
        cacheAcrossSpecs: true,
      },
    );
  },
);

/**
 * Sign in with fresh state (for onboarding tests)
 * Creates a unique session that resets the test user to trigger onboarding
 */
Cypress.Commands.add("signInFreshUser", () => {
  // Use a unique session ID based on timestamp to ensure fresh state each time
  cy.session(
    ["auth", "fresh", Date.now()],
    () => {
      setupClerkTestingToken();
      cy.visit("/");
      cy.clerkLoaded();
      cy.clerkSignIn({
        strategy: "email_code",
        identifier: Cypress.env("TEST_USER_EMAIL"),
      });
      cy.visit("/dashboard", { timeout: 30000 });
      cy.resetTestUser();
    },
    {
      // No validation needed - always recreate fresh sessions
      cacheAcrossSpecs: false,
    },
  );
});

/**
 * Shared onboarding helper - completes onboarding if user is redirected there
 * Replaces duplicate ensureUserOnboarded functions across test files
 * Also sets the subscription tier stored by signInWithSession()
 */
Cypress.Commands.add("ensureOnboarded", (targetPage: string = "/dashboard") => {
  cy.url({ timeout: 15000 }).then((url) => {
    if (url.includes("/onboarding")) {
      cy.log("User needs onboarding - completing now");

      // Complete profile step
      cy.get('[data-testid="onboarding-firstName"]', { timeout: 10000 }).clear().type("E2E");
      cy.get('[data-testid="onboarding-lastName"]').clear().type("TestUser");
      cy.get('[data-testid="onboarding-next-button"]').click();
      cy.contains("Profile updated!", { timeout: 10000 }).should("be.visible");

      // Complete household step
      cy.get('[data-testid="onboarding-householdName"]', { timeout: 10000 })
        .clear()
        .type(`Test Household ${Date.now()}`);
      cy.get('[data-testid="onboarding-next-button"]').click();
      cy.contains("Household created!", { timeout: 10000 }).should("be.visible");

      // Complete goals step
      cy.get('button[role="checkbox"]').first().click();
      cy.get('[data-testid="onboarding-next-button"]').click();
      cy.contains("Onboarding complete!", { timeout: 10000 }).should("be.visible");

      // Navigate to target page
      cy.visit(targetPage, { timeout: 30000 });
    } else if (url.includes("/select-plan")) {
      cy.log("User on select-plan - navigating to target page");
      cy.visit(targetPage, { timeout: 30000 });
    }
    // If already on target page or dashboard, we're good
  });

  // Set subscription tier after navigating to target page
  // This uses the tier stored by signInWithSession()
  // Wait for page to be fully loaded with Convex client before setting tier
  const tier = Cypress.env("CURRENT_TIER") || "heritage";
  cy.log(`Setting subscription tier to: ${tier}`);

  // Wait for Convex test helpers to be available (retries until they exist)
  cy.window({ timeout: 30000 })
    .should((win) => {
      const helpers = (win as unknown as { __CONVEX_TEST_HELPERS__?: ConvexTestHelpers })
        .__CONVEX_TEST_HELPERS__;
      expect(helpers).to.exist;
    })
    .then((win) => {
      const helpers = (win as unknown as { __CONVEX_TEST_HELPERS__?: ConvexTestHelpers })
        .__CONVEX_TEST_HELPERS__;
      if (helpers) {
        return cy.wrap(helpers.setTestSubscriptionTier(tier), { timeout: 30000 });
      }
    });
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
 * Clean up test state (cookies, localStorage, sessionStorage)
 */
Cypress.Commands.add("cleanupTestState", () => {
  cy.clearCookies();
  cy.clearLocalStorage();
  cy.window().then((win) => {
    win.sessionStorage.clear();
  });
});

/**
 * Mock a user with a specific subscription plan
 * Intercepts Clerk's auth to return a user with the specified plan features
 */
Cypress.Commands.add("mockUserWithPlan", (plan: "foundations" | "heritage" | "legacy") => {
  // Define features for each plan
  const planFeatures: Record<string, string[]> = {
    foundations: [
      "vault_storage_basic",
      "vault_photos_videos",
      "vault_folders",
      "financial_overview",
      "family_members_1",
      "support_standard",
    ],
    heritage: [
      "vault_storage_basic",
      "vault_storage_advanced",
      "vault_photos_videos",
      "vault_folders",
      "vault_tags_collections",
      "vault_voice_recordings",
      "vault_guided_organization",
      "financial_overview",
      "financial_summaries",
      "financial_insights_basic",
      "family_members_1",
      "family_members_3",
      "family_profiles",
      "family_messaging",
      "wisdom_entries",
      "support_standard",
      "support_priority",
      "early_access_some",
    ],
    legacy: [
      "vault_storage_basic",
      "vault_storage_advanced",
      "vault_storage_unlimited",
      "vault_photos_videos",
      "vault_folders",
      "vault_tags_collections",
      "vault_voice_recordings",
      "vault_guided_organization",
      "financial_overview",
      "financial_summaries",
      "financial_insights_basic",
      "financial_insights_advanced",
      "financial_trends",
      "family_members_1",
      "family_members_3",
      "family_members_unlimited",
      "family_profiles",
      "family_relationships",
      "family_messaging",
      "legacy_questionnaires",
      "legacy_story_templates",
      "wisdom_entries",
      "wisdom_shared_pages",
      "support_standard",
      "support_priority",
      "support_concierge",
      "early_access_some",
      "early_access_all",
    ],
  };

  const features = planFeatures[plan] || [];

  // Mock Clerk's useAuth hook response
  cy.window().then((win) => {
    // Store the plan and features in window for the app to access
    (win as unknown as { __TEST_PLAN__: string }).__TEST_PLAN__ = plan;
    (win as unknown as { __TEST_FEATURES__: string[] }).__TEST_FEATURES__ = features;
  });

  // Intercept Clerk session to include plan
  cy.intercept("GET", "**/v1/client?*", (req) => {
    req.continue((res) => {
      if (res.body?.response?.sessions?.[0]) {
        // Add plan to session metadata
        res.body.response.sessions[0].user = {
          ...res.body.response.sessions[0].user,
          publicMetadata: {
            plan,
            features,
          },
        };
      }
    });
  }).as("clerkSession");

  cy.log(`Mocked user with ${plan} plan (${features.length} features)`);
});

/**
 * Assert that a feature element is accessible (visible)
 */
Cypress.Commands.add("assertFeatureAccessible", (selector: string) => {
  cy.get(selector, { timeout: 10000 }).should("be.visible");
});

/**
 * Assert that a feature is blocked (upgrade prompt shown)
 */
Cypress.Commands.add("assertFeatureBlocked", (featureSlug: string) => {
  cy.get(`[data-testid="upgrade-prompt"][data-feature="${featureSlug}"]`, {
    timeout: 10000,
  }).should("be.visible");
});

/**
 * Assert upgrade prompt is shown for a specific feature
 */
Cypress.Commands.add("assertUpgradePromptShown", (featureSlug: string) => {
  cy.get('[data-testid="upgrade-prompt"]', { timeout: 10000 })
    .should("be.visible")
    .and("have.attr", "data-feature", featureSlug);
});

// Type for the test helpers exposed on window
interface ConvexTestHelpers {
  resetTestUser: () => Promise<{
    success: boolean;
    message: string;
    deleted: {
      profile: boolean;
      memberships: number;
      households: number;
      familyUnits: number;
      familyMembers: number;
      documents: number;
      categories: number;
      preferences: number;
      invitations: number;
      activityLogs: number;
      wisdomEntries: number;
      letters: number;
      coreBeliefs: number;
      legacyPlans: number;
      keyContacts: number;
      financialAccounts: number;
      properties: number;
      insurancePolicies: number;
      userSuggestions: number;
      notifications: number;
      subscriptions: number;
      userRoles: number;
    };
  }>;
  isCleanState: () => Promise<{
    isClean: boolean;
    hasProfile: boolean;
    hasMemberships: boolean;
    hasHouseholds: boolean;
  }>;
  grantAdminRole: () => Promise<{
    success: boolean;
    message: string;
  }>;
  cleanupTestArticles: () => Promise<{
    success: boolean;
    message: string;
    deletedCount: number;
  }>;
  setTestSubscriptionTier: (tier: "foundations" | "heritage" | "legacy" | "founders") => Promise<{
    success: boolean;
    message: string;
  }>;
  getTestHouseholdId: () => Promise<string | null>;
  activateEstateForTesting: (householdId: string) => Promise<{
    success: boolean;
    message: string;
    activationId?: string;
  }>;
  cleanupEstateData: (householdId: string) => Promise<{
    success: boolean;
    message: string;
    deletedCount: number;
  }>;
}

// Result types for test commands
type ResetTestUserResult = {
  success: boolean;
  message: string;
  deleted: {
    profile: boolean;
    memberships: number;
    households: number;
    familyUnits: number;
    familyMembers: number;
    documents: number;
    categories: number;
    preferences: number;
    invitations: number;
    activityLogs: number;
    wisdomEntries: number;
    letters: number;
    coreBeliefs: number;
    legacyPlans: number;
    keyContacts: number;
    financialAccounts: number;
    properties: number;
    insurancePolicies: number;
    userSuggestions: number;
    notifications: number;
    subscriptions: number;
    userRoles: number;
  };
};

type IsCleanStateResult = {
  isClean: boolean;
  hasProfile: boolean;
  hasMemberships: boolean;
  hasHouseholds: boolean;
};

/**
 * Reset test user to clean state
 * Calls the Convex testing.resetTestUser mutation through the window's test helpers.
 * Must be signed in first and on a page with the Convex client loaded.
 */
Cypress.Commands.add("resetTestUser", (): Cypress.Chainable<ResetTestUserResult> => {
  cy.log("**Resetting test user to clean state**");

  return cy
    .window({ timeout: 30000 })
    .then((win): ResetTestUserResult | Cypress.Chainable<ResetTestUserResult> => {
      // Access the test helpers exposed by ConvexClientProvider
      const testHelpers = (win as unknown as { __CONVEX_TEST_HELPERS__?: ConvexTestHelpers })
        .__CONVEX_TEST_HELPERS__;

      if (!testHelpers) {
        // Cannot call cy.log here as it mixes async/sync code
        console.error(
          "Convex test helpers not found on window. Make sure you're on a page with Convex loaded.",
        );
        return {
          success: false,
          message: "Convex test helpers not available",
          deleted: {
            profile: false,
            memberships: 0,
            households: 0,
            familyUnits: 0,
            familyMembers: 0,
            documents: 0,
            categories: 0,
            preferences: 0,
            invitations: 0,
            activityLogs: 0,
            wisdomEntries: 0,
            letters: 0,
            coreBeliefs: 0,
            legacyPlans: 0,
            keyContacts: 0,
            financialAccounts: 0,
            properties: 0,
            insurancePolicies: 0,
            userSuggestions: 0,
            notifications: 0,
            subscriptions: 0,
            userRoles: 0,
          },
        };
      }

      // Call the reset mutation - use console.log instead of cy.log to avoid async/sync mix
      return cy.wrap(testHelpers.resetTestUser(), { timeout: 30000 }).then((result) => {
        console.log("Reset result:", result);
        return result as ResetTestUserResult;
      });
    }) as Cypress.Chainable<ResetTestUserResult>;
});

/**
 * Check if test user is in clean state
 * Calls the Convex testing.isCleanState mutation through the window's test helpers.
 * Must be signed in first and on a page with the Convex client loaded.
 */
Cypress.Commands.add("isTestUserClean", (): Cypress.Chainable<IsCleanStateResult> => {
  cy.log("**Checking if test user is in clean state**");

  return cy
    .window({ timeout: 30000 })
    .then((win): IsCleanStateResult | Cypress.Chainable<IsCleanStateResult> => {
      const testHelpers = (win as unknown as { __CONVEX_TEST_HELPERS__?: ConvexTestHelpers })
        .__CONVEX_TEST_HELPERS__;

      if (!testHelpers) {
        console.error("Convex test helpers not found on window.");
        return {
          isClean: false,
          hasProfile: false,
          hasMemberships: false,
          hasHouseholds: false,
        };
      }

      return cy.wrap(testHelpers.isCleanState(), { timeout: 30000 }).then((result) => {
        console.log("Clean state check:", result);
        return result as IsCleanStateResult;
      });
    }) as Cypress.Chainable<IsCleanStateResult>;
});

// Result type for grantAdminRole
type GrantAdminRoleResult = {
  success: boolean;
  message: string;
};

/**
 * Grant admin role to test user
 * Calls the Convex testing.grantAdminRole mutation through the window's test helpers.
 * Must be signed in first and on a page with the Convex client loaded.
 */
Cypress.Commands.add("grantAdminRole", (): Cypress.Chainable<GrantAdminRoleResult> => {
  cy.log("**Granting admin role to test user**");

  return cy
    .window({ timeout: 30000 })
    .then((win): GrantAdminRoleResult | Cypress.Chainable<GrantAdminRoleResult> => {
      const testHelpers = (win as unknown as { __CONVEX_TEST_HELPERS__?: ConvexTestHelpers })
        .__CONVEX_TEST_HELPERS__;

      if (!testHelpers) {
        console.error("Convex test helpers not found on window.");
        return {
          success: false,
          message: "Convex test helpers not available",
        };
      }

      return cy.wrap(testHelpers.grantAdminRole(), { timeout: 30000 }).then((result) => {
        console.log("Grant admin role result:", result);
        return result as GrantAdminRoleResult;
      });
    }) as Cypress.Chainable<GrantAdminRoleResult>;
});

// Result type for cleanupTestArticles
type CleanupTestArticlesResult = {
  success: boolean;
  message: string;
  deletedCount: number;
};

/**
 * Clean up test articles
 * Calls the Convex testing.cleanupTestArticles mutation through the window's test helpers.
 * Must be signed in first and on a page with the Convex client loaded.
 */
Cypress.Commands.add("cleanupTestArticles", (): Cypress.Chainable<CleanupTestArticlesResult> => {
  cy.log("**Cleaning up test articles**");

  return cy
    .window({ timeout: 30000 })
    .then((win): CleanupTestArticlesResult | Cypress.Chainable<CleanupTestArticlesResult> => {
      const testHelpers = (win as unknown as { __CONVEX_TEST_HELPERS__?: ConvexTestHelpers })
        .__CONVEX_TEST_HELPERS__;

      if (!testHelpers) {
        console.error("Convex test helpers not found on window.");
        return {
          success: false,
          message: "Convex test helpers not available",
          deletedCount: 0,
        };
      }

      return cy.wrap(testHelpers.cleanupTestArticles(), { timeout: 30000 }).then((result) => {
        console.log("Cleanup test articles result:", result);
        return result as CleanupTestArticlesResult;
      });
    }) as Cypress.Chainable<CleanupTestArticlesResult>;
});

// Result type for setSubscriptionTier
type SetSubscriptionTierResult = {
  success: boolean;
  message: string;
};

/**
 * Set subscription tier override for test user's household
 * Allows testing features that require higher tier subscriptions.
 * Must be signed in first and have completed onboarding.
 */
Cypress.Commands.add(
  "setSubscriptionTier",
  (
    tier: "foundations" | "heritage" | "legacy" | "founders",
  ): Cypress.Chainable<SetSubscriptionTierResult> => {
    cy.log(`**Setting subscription tier to ${tier}**`);

    return cy
      .window({ timeout: 30000 })
      .then((win): SetSubscriptionTierResult | Cypress.Chainable<SetSubscriptionTierResult> => {
        const testHelpers = (win as unknown as { __CONVEX_TEST_HELPERS__?: ConvexTestHelpers })
          .__CONVEX_TEST_HELPERS__;

        if (!testHelpers) {
          console.error(
            "Convex test helpers not found on window. Make sure you're on a page with Convex loaded.",
          );
          return {
            success: false,
            message: "Convex test helpers not available",
          };
        }

        return cy
          .wrap(testHelpers.setTestSubscriptionTier(tier), { timeout: 30000 })
          .then((result) => {
            console.log("Set subscription tier result:", result);
            return result as SetSubscriptionTierResult;
          });
      }) as Cypress.Chainable<SetSubscriptionTierResult>;
  },
);

// Result type for cleanupTestFinancialData
type CleanupTestFinancialDataResult = {
  success: boolean;
  message: string;
  deletedCounts: {
    accounts: number;
    properties: number;
    policies: number;
  };
};

/**
 * Clean up test financial data
 * Note: This uses resetTestUser which already deletes financial data as part of its cleanup.
 * For granular cleanup, we log the counts from the reset result.
 */
Cypress.Commands.add(
  "cleanupTestFinancialData",
  (): Cypress.Chainable<CleanupTestFinancialDataResult> => {
    cy.log("**Cleaning up test financial data**");

    return cy
      .window({ timeout: 30000 })
      .then(
        (
          win,
        ): CleanupTestFinancialDataResult | Cypress.Chainable<CleanupTestFinancialDataResult> => {
          const testHelpers = (win as unknown as { __CONVEX_TEST_HELPERS__?: ConvexTestHelpers })
            .__CONVEX_TEST_HELPERS__;

          if (!testHelpers) {
            console.error("Convex test helpers not found on window.");
            return {
              success: false,
              message: "Convex test helpers not available",
              deletedCounts: {
                accounts: 0,
                properties: 0,
                policies: 0,
              },
            };
          }

          // Use resetTestUser which cleans up all data including financial
          return cy.wrap(testHelpers.resetTestUser(), { timeout: 30000 }).then((rawResult) => {
            const result = rawResult as ResetTestUserResult;
            console.log("Cleanup financial data result:", result);
            return {
              success: result.success,
              message: result.message,
              deletedCounts: {
                accounts: result.deleted.financialAccounts,
                properties: result.deleted.properties,
                policies: result.deleted.insurancePolicies,
              },
            } as CleanupTestFinancialDataResult;
          });
        },
      ) as Cypress.Chainable<CleanupTestFinancialDataResult>;
  },
);

// Result type for cleanupTestWisdomData
type CleanupTestWisdomDataResult = {
  success: boolean;
  message: string;
  deletedCounts: {
    entries: number;
    coreBeliefs: number;
  };
};

/**
 * Clean up test wisdom data
 * Note: This uses resetTestUser which already deletes wisdom data as part of its cleanup.
 * For granular cleanup, we log the counts from the reset result.
 */
Cypress.Commands.add(
  "cleanupTestWisdomData",
  (): Cypress.Chainable<CleanupTestWisdomDataResult> => {
    cy.log("**Cleaning up test wisdom data**");

    return cy
      .window({ timeout: 30000 })
      .then((win): CleanupTestWisdomDataResult | Cypress.Chainable<CleanupTestWisdomDataResult> => {
        const testHelpers = (win as unknown as { __CONVEX_TEST_HELPERS__?: ConvexTestHelpers })
          .__CONVEX_TEST_HELPERS__;

        if (!testHelpers) {
          console.error("Convex test helpers not found on window.");
          return {
            success: false,
            message: "Convex test helpers not available",
            deletedCounts: {
              entries: 0,
              coreBeliefs: 0,
            },
          };
        }

        // Use resetTestUser which cleans up all data including wisdom
        return cy.wrap(testHelpers.resetTestUser(), { timeout: 30000 }).then((rawResult) => {
          const result = rawResult as ResetTestUserResult;
          console.log("Cleanup wisdom data result:", result);
          return {
            success: result.success,
            message: result.message,
            deletedCounts: {
              entries: result.deleted.wisdomEntries,
              coreBeliefs: result.deleted.coreBeliefs,
            },
          } as CleanupTestWisdomDataResult;
        });
      }) as Cypress.Chainable<CleanupTestWisdomDataResult>;
  },
);

// Result type for activateEstateMode
type ActivateEstateModeResult = {
  success: boolean;
  message: string;
  activationId?: string;
};

/**
 * Activate estate mode for testing
 * Gets the test user's household ID, then calls activateEstateForTesting.
 * Must be signed in first and have completed onboarding.
 */
Cypress.Commands.add("activateEstateMode", (): Cypress.Chainable<ActivateEstateModeResult> => {
  cy.log("**Activating estate mode for testing**");

  return cy
    .window({ timeout: 30000 })
    .then((win): ActivateEstateModeResult | Cypress.Chainable<ActivateEstateModeResult> => {
      const testHelpers = (win as unknown as { __CONVEX_TEST_HELPERS__?: ConvexTestHelpers })
        .__CONVEX_TEST_HELPERS__;

      if (!testHelpers) {
        console.error("Convex test helpers not found on window.");
        return {
          success: false,
          message: "Convex test helpers not available",
        };
      }

      // First get the household ID, then activate estate mode
      return cy.wrap(testHelpers.getTestHouseholdId(), { timeout: 30000 }).then((householdId) => {
        if (!householdId) {
          return {
            success: false,
            message: "No household found. Complete onboarding first.",
          } as ActivateEstateModeResult;
        }

        return cy
          .wrap(testHelpers.activateEstateForTesting(householdId as string), { timeout: 30000 })
          .then((result) => {
            console.log("Activate estate mode result:", result);
            return result as ActivateEstateModeResult;
          }) as unknown as ActivateEstateModeResult;
      }) as unknown as ActivateEstateModeResult;
    }) as unknown as Cypress.Chainable<ActivateEstateModeResult>;
});

// Result type for cleanupEstateData
type CleanupEstateDataResult = {
  success: boolean;
  message: string;
  deletedCount: number;
};

/**
 * Clean up all estate data for test user's household
 * Gets the test user's household ID, then calls cleanupEstateData.
 * Must be signed in first and have completed onboarding.
 */
Cypress.Commands.add("cleanupEstateData", (): Cypress.Chainable<CleanupEstateDataResult> => {
  cy.log("**Cleaning up estate data**");

  return cy
    .window({ timeout: 30000 })
    .then((win): CleanupEstateDataResult | Cypress.Chainable<CleanupEstateDataResult> => {
      const testHelpers = (win as unknown as { __CONVEX_TEST_HELPERS__?: ConvexTestHelpers })
        .__CONVEX_TEST_HELPERS__;

      if (!testHelpers) {
        console.error("Convex test helpers not found on window.");
        return {
          success: false,
          message: "Convex test helpers not available",
          deletedCount: 0,
        };
      }

      // First get the household ID, then clean up estate data
      return cy.wrap(testHelpers.getTestHouseholdId(), { timeout: 30000 }).then((householdId) => {
        if (!householdId) {
          return {
            success: false,
            message: "No household found. Complete onboarding first.",
            deletedCount: 0,
          } as CleanupEstateDataResult;
        }

        return cy
          .wrap(testHelpers.cleanupEstateData(householdId as string), { timeout: 30000 })
          .then((result) => {
            console.log("Cleanup estate data result:", result);
            return result as CleanupEstateDataResult;
          }) as unknown as CleanupEstateDataResult;
      }) as unknown as CleanupEstateDataResult;
    }) as unknown as Cypress.Chainable<CleanupEstateDataResult>;
});
