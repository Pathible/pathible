"use client";

import { Badge } from "@/components/ui/badge";

const TYPE_CATEGORIES = {
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

const CATEGORY_COLORS: Record<string, string> = {
  document: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300",
  wisdom: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300",
  letter: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300",
  household: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300",
  financial: "bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-300",
  family: "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300",
  category: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300",
  other: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
};

function getCategoryForType(actionType: string): string {
  for (const [category, types] of Object.entries(TYPE_CATEGORIES)) {
    if (types.includes(actionType)) return category;
  }
  return "other";
}

function formatActionTypeShort(actionType: string): string {
  // Extract the action verb for compact badge
  const parts = actionType.split("_");
  const lastPart = parts[parts.length - 1];

  // Capitalize first letter
  return lastPart.charAt(0).toUpperCase() + lastPart.slice(1);
}

export function ActivityTypeBadge({ actionType }: { actionType: string }) {
  const category = getCategoryForType(actionType);
  const label = formatActionTypeShort(actionType);

  return (
    <Badge className={`${CATEGORY_COLORS[category]} border-none font-medium`} variant="secondary">
      {label}
    </Badge>
  );
}
