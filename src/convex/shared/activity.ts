import type { Doc, Id } from "../_generated/dataModel";
import type { MutationCtx } from "../_generated/server";

/**
 * Module to entity type mapping for validation.
 * Each module can only contain specific entity types.
 */
const MODULE_ENTITY_MAP: Record<
  NonNullable<Doc<"activityLog">["module"]>,
  NonNullable<Doc<"activityLog">["entityType"]>[]
> = {
  vault: ["document", "category"],
  wisdom: ["wisdom_entry", "core_belief"],
  financial: ["financial_account", "property", "insurance_policy"],
  family: ["family_unit", "family_member"],
  legacy: ["plan", "letter", "legal_document", "legal_document_contact"],
  household: ["household"],
  suggestion: ["suggestion"],
  estate: [
    "estate_activation",
    "estate_checklist_item",
    "estate_asset",
    "estate_asset_status_change",
    "estate_document",
    "estate_document_share",
    "estate_communication",
    "estate_distribution",
  ],
};

/**
 * Validates that the module and entityType are compatible.
 * Logs a warning if there's a mismatch (does not throw to avoid breaking existing code).
 */
function validateModuleEntityType(
  module: Doc<"activityLog">["module"],
  entityType: Doc<"activityLog">["entityType"],
): void {
  if (!module || !entityType || entityType === "other") {
    return; // Skip validation for undefined or "other"
  }

  const validEntities = MODULE_ENTITY_MAP[module];
  if (validEntities && !validEntities.includes(entityType)) {
    console.warn(
      `[logActivity] Module/entityType mismatch: module="${module}" does not typically contain entityType="${entityType}". ` +
        `Expected one of: ${validEntities.join(", ")}`,
    );
  }
}

/**
 * Shape of an activity log entry.
 */
export type ActivityLogInput = {
  householdId: Id<"households">;
  userId: Id<"profiles">;
  module?: Doc<"activityLog">["module"];
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
  // Validate module/entityType compatibility
  validateModuleEntityType(entry.module, entry.entityType);

  await ctx.db.insert("activityLog", {
    householdId: entry.householdId,
    userId: entry.userId,
    module: entry.module,
    actionType: entry.actionType,
    entityType: entry.entityType ?? "other",
    entityId: entry.entityId,
    description: entry.description,
  });
}
