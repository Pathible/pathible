"use client";

import { AdminStatusBadge } from "@/app/(auth)/admin/components/admin-status-badge";

const TYPE_CATEGORIES: Record<string, string[]> = {
  document: ["document_uploaded", "document_viewed", "document_updated", "document_deleted"],
  wisdom: ["wisdom_created", "wisdom_updated", "wisdom_deleted"],
  letter: ["letter_created"],
  household: [
    "household_created",
    "household_updated",
    "member_invited",
    "member_joined",
    "member_removed",
    "member_role_updated",
  ],
  financial: [
    "asset_created",
    "asset_updated",
    "asset_deleted",
    "policy_created",
    "policy_updated",
    "policy_deleted",
  ],
  family: [
    "family_unit_created",
    "family_unit_updated",
    "family_unit_deleted",
    "family_member_created",
    "family_member_updated",
    "family_member_deleted",
  ],
  category: ["category_created", "category_updated", "category_deleted"],
  other: ["plan_updated", "suggestion_completed", "other"],
};

function getCategoryForType(actionType: string): string {
  for (const [category, types] of Object.entries(TYPE_CATEGORIES)) {
    if (types.includes(actionType)) return category;
  }
  return "other";
}

function formatActionTypeShort(actionType: string): string {
  const parts = actionType.split("_");
  const lastPart = parts[parts.length - 1];
  return lastPart.charAt(0).toUpperCase() + lastPart.slice(1);
}

export function ActivityTypeBadge({ actionType }: { actionType: string }) {
  const category = getCategoryForType(actionType);
  const label = formatActionTypeShort(actionType);

  return (
    <AdminStatusBadge type="activityCategory" value={category}>
      {label}
    </AdminStatusBadge>
  );
}
