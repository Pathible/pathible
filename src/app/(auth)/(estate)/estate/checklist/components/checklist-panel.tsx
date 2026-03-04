"use client";

import { Lock } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Progress } from "@/components/ui/progress";
import type { Id } from "@/convex/_generated/dataModel";
import { cn } from "@/lib/utils";
import { ChecklistItem } from "./checklist-item";

type ChecklistCategory =
  | "first_things_first"
  | "legal_and_financial"
  | "property_and_assets"
  | "notifications"
  | "ongoing"
  | "when_ready"
  | "custom";

interface ChecklistItemData {
  _id: Id<"estateChecklistItems">;
  title: string;
  description?: string;
  category: ChecklistCategory;
  isCompleted: boolean;
  notes?: string;
  isCustom: boolean;
}

interface CategoryStats {
  category: ChecklistCategory;
  total: number;
  completed: number;
}

interface ChecklistPanelProps {
  items: ChecklistItemData[];
  categoryStats: CategoryStats[];
  showWhenReady: boolean;
}

const CATEGORY_LABELS: Record<ChecklistCategory, string> = {
  first_things_first: "First Things First",
  legal_and_financial: "Legal & Financial",
  property_and_assets: "Property & Assets",
  notifications: "Notifications",
  ongoing: "Ongoing",
  when_ready: "When You're Ready",
  custom: "Custom Tasks",
};

const CATEGORY_ORDER: ChecklistCategory[] = [
  "first_things_first",
  "legal_and_financial",
  "property_and_assets",
  "notifications",
  "ongoing",
  "when_ready",
  "custom",
];

/**
 * Accordion panel that groups checklist items by category.
 * Each category header shows a progress bar and completion count.
 * "When You're Ready" category is hidden until showWhenReady is true.
 */
export function ChecklistPanel({ items, categoryStats, showWhenReady }: ChecklistPanelProps) {
  const itemsByCategory = new Map<ChecklistCategory, ChecklistItemData[]>();
  for (const item of items) {
    const list = itemsByCategory.get(item.category) ?? [];
    list.push(item);
    itemsByCategory.set(item.category, list);
  }

  const statsMap = new Map<ChecklistCategory, CategoryStats>();
  for (const stat of categoryStats) {
    statsMap.set(stat.category, stat);
  }

  const visibleCategories = CATEGORY_ORDER.filter((cat) => {
    if (cat === "when_ready" && !showWhenReady) return false;
    return itemsByCategory.has(cat);
  });

  // Default open the first incomplete category
  const defaultOpen = visibleCategories.find((cat) => {
    const stats = statsMap.get(cat);
    return stats && stats.completed < stats.total;
  });

  return (
    <Accordion
      type="multiple"
      defaultValue={defaultOpen ? [defaultOpen] : []}
      className="space-y-2"
      data-testid="checklist-panel"
    >
      {visibleCategories.map((category) => {
        const categoryItems = itemsByCategory.get(category) ?? [];
        const stats = statsMap.get(category);
        const total = stats?.total ?? categoryItems.length;
        const completed = stats?.completed ?? categoryItems.filter((i) => i.isCompleted).length;
        const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
        const isComplete = completed === total && total > 0;

        return (
          <AccordionItem
            key={category}
            value={category}
            className="rounded-lg border px-4"
            data-testid={`checklist-category-${category}`}
          >
            <AccordionTrigger className="hover:no-underline py-4">
              <div className="flex flex-1 flex-col gap-2 pr-2">
                <div className="flex items-center justify-between">
                  <span className={cn("font-medium", isComplete && "text-muted-foreground")}>
                    {CATEGORY_LABELS[category]}
                  </span>
                  <span className="text-xs text-muted-foreground tabular-nums">
                    {completed}/{total}
                  </span>
                </div>
                <Progress value={percentage} className="h-1.5" />
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2 pb-2">
                {categoryItems.map((item) => (
                  <ChecklistItem
                    key={item._id}
                    id={item._id}
                    title={item.title}
                    description={item.description}
                    isCompleted={item.isCompleted}
                    notes={item.notes}
                    isCustom={item.isCustom}
                  />
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        );
      })}

      {!showWhenReady && itemsByCategory.has("when_ready") && (
        <div
          className="flex items-center gap-3 rounded-lg border border-dashed px-4 py-4 text-muted-foreground"
          data-testid="checklist-when-ready-locked"
        >
          <Lock className="h-4 w-4 shrink-0" />
          <p className="text-sm">More tasks will appear as you make progress on the items above.</p>
        </div>
      )}
    </Accordion>
  );
}
