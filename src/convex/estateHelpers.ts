import type { Doc, Id } from "./_generated/dataModel";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import { requireAuth, requireHouseholdAccess } from "./auth";

/**
 * Estate Administration Helpers
 *
 * Access control and validation helpers for estate administration features.
 */

/**
 * Require that the executor product has been purchased for a household.
 * Throws if not purchased. Returns the household document.
 */
export async function requireExecutorPurchase(
  ctx: QueryCtx | MutationCtx,
  householdId: Id<"households">,
): Promise<Doc<"households">> {
  const household = await ctx.db.get(householdId);
  if (!household) throw new Error("Household not found");
  if (household.executorPurchased !== true) {
    throw new Error("Executor product purchase required");
  }
  return household;
}

/**
 * Require executor access to a household.
 *
 * Verifies the current user has the "executor" role in the household,
 * OR is a system admin. Throws if neither condition is met.
 */
export async function requireExecutorAccess(
  ctx: QueryCtx | MutationCtx,
  householdId: Id<"households">,
): Promise<{ membership: Doc<"householdMemberships">; profile: Doc<"profiles"> }> {
  const { profile } = await requireAuth(ctx);
  const membership = await requireHouseholdAccess(ctx, householdId);

  if (membership.role === "executor") {
    return { membership, profile };
  }

  // Check for admin role as fallback
  const userRole = await ctx.db
    .query("userRoles")
    .withIndex("by_userId", (q) => q.eq("userId", profile.userId))
    .unique();

  if (userRole?.role === "admin") {
    return { membership, profile };
  }

  throw new Error("Access denied: Executor role required");
}

/**
 * Require that estate mode is active for a household.
 *
 * Verifies the household has estateMode === true AND there is an active
 * estate activation record. Returns the activation record.
 */
export async function requireActiveEstate(
  ctx: QueryCtx | MutationCtx,
  householdId: Id<"households">,
): Promise<Doc<"estateActivations">> {
  const household = await ctx.db.get(householdId);
  if (!household) {
    throw new Error("Household not found");
  }

  if (household.estateMode !== true) {
    throw new Error("Estate mode is not active for this household");
  }

  if (!household.estateActivationId) {
    throw new Error("No estate activation found for this household");
  }

  const activation = await ctx.db.get(household.estateActivationId);
  if (!activation || activation.status !== "active") {
    throw new Error("No active estate activation found");
  }

  return activation;
}

/**
 * Require that a household is NOT in estate mode.
 *
 * This is a synchronous check on an already-fetched household document.
 * Zero extra DB reads. Used as a guard in write mutations to prevent
 * modifications during estate administration.
 *
 * @param household - The household document (already fetched by requireActiveSubscription)
 * @throws Error if the household is in estate mode
 */
export function requireNotInEstateMode(household: Doc<"households">): void {
  if (household.estateMode === true) {
    throw new Error(
      "This household is in estate administration mode. Planning features are read-only.",
    );
  }
}
