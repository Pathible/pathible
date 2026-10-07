/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as admin from "../admin.js";
import type * as admin_users from "../admin/users.js";
import type * as adminEmail from "../adminEmail.js";
import type * as analytics from "../analytics.js";
import type * as articles from "../articles.js";
import type * as auth from "../auth.js";
import type * as automatedEmails from "../automatedEmails.js";
import type * as coreBeliefs from "../coreBeliefs.js";
import type * as crons from "../crons.js";
import type * as emailQueue from "../emailQueue.js";
import type * as estate from "../estate.js";
import type * as estateAssets from "../estateAssets.js";
import type * as estateCommunications from "../estateCommunications.js";
import type * as estateDistributions from "../estateDistributions.js";
import type * as estateDocuments from "../estateDocuments.js";
import type * as estateHelpers from "../estateHelpers.js";
import type * as familyEcosystem from "../familyEcosystem.js";
import type * as financial from "../financial.js";
import type * as households from "../households.js";
import type * as householdsNode from "../householdsNode.js";
import type * as http from "../http.js";
import type * as legacy from "../legacy.js";
import type * as legalDocuments from "../legalDocuments.js";
import type * as migrations_migrateArticleCategories from "../migrations/migrateArticleCategories.js";
import type * as onboarding from "../onboarding.js";
import type * as persons from "../persons.js";
import type * as profiles from "../profiles.js";
import type * as roles from "../roles.js";
import type * as seeds_articles from "../seeds/articles.js";
import type * as seeds_estateChecklistTemplates from "../seeds/estateChecklistTemplates.js";
import type * as seeds_seedArticles from "../seeds/seedArticles.js";
import type * as seeds_seedDemoAccount from "../seeds/seedDemoAccount.js";
import type * as seeds_seedSystemEmailTemplates from "../seeds/seedSystemEmailTemplates.js";
import type * as seeds_systemEmailTemplates from "../seeds/systemEmailTemplates.js";
import type * as shared_activity from "../shared/activity.js";
import type * as shared_analyticsHelpers from "../shared/analyticsHelpers.js";
import type * as shared_categories from "../shared/categories.js";
import type * as shared_commonValidators from "../shared/commonValidators.js";
import type * as shared_constants from "../shared/constants.js";
import type * as shared_counters from "../shared/counters.js";
import type * as shared_emailUtils from "../shared/emailUtils.js";
import type * as shared_stripeConfig from "../shared/stripeConfig.js";
import type * as shared_subscriptionTiers from "../shared/subscriptionTiers.js";
import type * as shared_validators from "../shared/validators.js";
import type * as stripe from "../stripe.js";
import type * as stripeActions from "../stripeActions.js";
import type * as testing from "../testing.js";
import type * as tours from "../tours.js";
import type * as users from "../users.js";
import type * as utils from "../utils.js";
import type * as vault from "../vault.js";
import type * as vaultActions from "../vaultActions.js";
import type * as vaultHelpers from "../vaultHelpers.js";
import type * as waitlist from "../waitlist.js";
import type * as wisdom from "../wisdom.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  admin: typeof admin;
  "admin/users": typeof admin_users;
  adminEmail: typeof adminEmail;
  analytics: typeof analytics;
  articles: typeof articles;
  auth: typeof auth;
  automatedEmails: typeof automatedEmails;
  coreBeliefs: typeof coreBeliefs;
  crons: typeof crons;
  emailQueue: typeof emailQueue;
  estate: typeof estate;
  estateAssets: typeof estateAssets;
  estateCommunications: typeof estateCommunications;
  estateDistributions: typeof estateDistributions;
  estateDocuments: typeof estateDocuments;
  estateHelpers: typeof estateHelpers;
  familyEcosystem: typeof familyEcosystem;
  financial: typeof financial;
  households: typeof households;
  householdsNode: typeof householdsNode;
  http: typeof http;
  legacy: typeof legacy;
  legalDocuments: typeof legalDocuments;
  "migrations/migrateArticleCategories": typeof migrations_migrateArticleCategories;
  onboarding: typeof onboarding;
  persons: typeof persons;
  profiles: typeof profiles;
  roles: typeof roles;
  "seeds/articles": typeof seeds_articles;
  "seeds/estateChecklistTemplates": typeof seeds_estateChecklistTemplates;
  "seeds/seedArticles": typeof seeds_seedArticles;
  "seeds/seedDemoAccount": typeof seeds_seedDemoAccount;
  "seeds/seedSystemEmailTemplates": typeof seeds_seedSystemEmailTemplates;
  "seeds/systemEmailTemplates": typeof seeds_systemEmailTemplates;
  "shared/activity": typeof shared_activity;
  "shared/analyticsHelpers": typeof shared_analyticsHelpers;
  "shared/categories": typeof shared_categories;
  "shared/commonValidators": typeof shared_commonValidators;
  "shared/constants": typeof shared_constants;
  "shared/counters": typeof shared_counters;
  "shared/emailUtils": typeof shared_emailUtils;
  "shared/stripeConfig": typeof shared_stripeConfig;
  "shared/subscriptionTiers": typeof shared_subscriptionTiers;
  "shared/validators": typeof shared_validators;
  stripe: typeof stripe;
  stripeActions: typeof stripeActions;
  testing: typeof testing;
  tours: typeof tours;
  users: typeof users;
  utils: typeof utils;
  vault: typeof vault;
  vaultActions: typeof vaultActions;
  vaultHelpers: typeof vaultHelpers;
  waitlist: typeof waitlist;
  wisdom: typeof wisdom;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
