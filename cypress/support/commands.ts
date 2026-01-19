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

// Export to make TypeScript happy
export {};
