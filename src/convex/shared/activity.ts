import type { Doc, Id } from "../_generated/dataModel";
import type { MutationCtx } from "../_generated/server";

/**
 * Shape of an activity log entry.
 */
export type ActivityLogInput = {
  householdId: Id<"households">;
  userId: Id<"profiles">;
  actionType: Doc<"activityLog">["actionType"];
  entityType?: Doc<"activityLog">["entityType"];
  entityId?: string;
  description: string;
};

/**
 * Insert a new activity log entry.
 */
export async function logActivity(
  ctx: { db: MutationCtx["db"] },
  entry: ActivityLogInput,
): Promise<void> {
  await ctx.db.insert("activityLog", {
    householdId: entry.householdId,
    userId: entry.userId,
    actionType: entry.actionType,
    entityType: entry.entityType ?? "other",
    entityId: entry.entityId,
    description: entry.description,
  });
}
