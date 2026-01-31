import type { Doc, Id } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";

/**
 * Narrow type for db access in mutations.
 */
type MutationDb = MutationCtx["db"];

type HouseholdDoc = Doc<"households">;

function currentCounter(value: number | undefined): number {
  return typeof value === "number" ? value : 0;
}

async function adjustHouseholdCounter(
  db: MutationDb,
  householdId: Id<"households">,
  field: keyof Pick<HouseholdDoc, "memberCount" | "familyUnitCount">,
  delta: number,
): Promise<void> {
  const household = await db.get(householdId);
  if (!household) return;

  const updatedValue = Math.max(0, currentCounter(household[field] as number | undefined) + delta);
  if ((household[field] as number | undefined) === updatedValue) {
    return;
  }

  await db.patch(householdId, { [field]: updatedValue } as Partial<HouseholdDoc>);
}

export async function incrementMemberCount(
  db: MutationDb,
  householdId: Id<"households">,
  delta: number,
): Promise<void> {
  await adjustHouseholdCounter(db, householdId, "memberCount", delta);
}

export async function incrementFamilyUnitCount(
  db: MutationDb,
  householdId: Id<"households">,
  delta: number,
): Promise<void> {
  await adjustHouseholdCounter(db, householdId, "familyUnitCount", delta);
}

export async function getMemberCountFromHousehold(
  ctx: QueryCtx | MutationCtx,
  household: HouseholdDoc,
): Promise<number> {
  if (typeof household.memberCount === "number") {
    return household.memberCount;
  }

  // Fallback to live query when counter is missing (e.g., migrated data).
  const activeMemberships = await ctx.db
    .query("householdMemberships")
    .withIndex("by_household_and_status", (q) =>
      q.eq("householdId", household._id).eq("status", "active"),
    )
    .collect();

  return activeMemberships.filter((membership) => membership.role !== "owner").length;
}

export async function getFamilyUnitCount(
  ctx: QueryCtx | MutationCtx,
  household: HouseholdDoc,
): Promise<number> {
  if (typeof household.familyUnitCount === "number") {
    return household.familyUnitCount;
  }

  const units = await ctx.db
    .query("familyUnits")
    .withIndex("by_household_and_orderIndex", (q) => q.eq("householdId", household._id))
    .collect();

  return units.length;
}
