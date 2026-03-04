"use client";

import { useMutation } from "convex/react";
import { ChevronDown, StickyNote } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { cn } from "@/lib/utils";

interface ChecklistItemProps {
  id: Id<"estateChecklistItems">;
  title: string;
  description?: string;
  isCompleted: boolean;
  notes?: string;
  isCustom: boolean;
}

/**
 * Individual checklist item with checkbox, expandable description, and notes.
 * Large touch targets for mobile use (executors checking items at appointments).
 */
export function ChecklistItem({
  id,
  title,
  description,
  isCompleted,
  notes: initialNotes,
  isCustom,
}: ChecklistItemProps) {
  const [expanded, setExpanded] = useState(false);
  const [showNotes, setShowNotes] = useState(!!initialNotes);
  const [notesValue, setNotesValue] = useState(initialNotes ?? "");
  const [isSavingNotes, setIsSavingNotes] = useState(false);

  const updateItem = useMutation(api.estate.updateChecklistItem);

  const handleToggle = async () => {
    await updateItem({ itemId: id, isCompleted: !isCompleted });
  };

  const handleSaveNotes = async () => {
    setIsSavingNotes(true);
    try {
      await updateItem({ itemId: id, notes: notesValue });
    } finally {
      setIsSavingNotes(false);
    }
  };

  return (
    <div
      className={cn("rounded-lg border p-4 transition-colors", isCompleted && "bg-muted/50")}
      data-testid={`checklist-item-${id}`}
    >
      <div className="flex items-start gap-3">
        <Checkbox
          checked={isCompleted}
          onCheckedChange={handleToggle}
          className="mt-0.5 h-5 w-5"
          data-testid={`checklist-checkbox-${id}`}
        />
        <div className="flex-1 min-w-0">
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="flex w-full items-start justify-between gap-2 text-left"
          >
            <span
              className={cn(
                "text-sm font-medium leading-snug",
                isCompleted && "line-through text-muted-foreground",
              )}
            >
              {title}
              {isCustom && (
                <span className="ml-2 inline-flex items-center rounded-full bg-secondary px-2 py-0.5 text-xs text-secondary-foreground">
                  Custom
                </span>
              )}
            </span>
            {description && (
              <ChevronDown
                className={cn(
                  "h-4 w-4 shrink-0 text-muted-foreground transition-transform mt-0.5",
                  expanded && "rotate-180",
                )}
              />
            )}
          </button>

          {expanded && description && (
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{description}</p>
          )}

          {expanded && (
            <div className="mt-3">
              {!showNotes ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowNotes(true)}
                  className="h-8 gap-1.5 text-xs text-muted-foreground"
                >
                  <StickyNote className="h-3.5 w-3.5" />
                  Add a note
                </Button>
              ) : (
                <div className="space-y-2">
                  <Textarea
                    placeholder="Add notes about this task..."
                    value={notesValue}
                    onChange={(e) => setNotesValue(e.target.value)}
                    className="min-h-[60px] text-sm"
                    maxLength={1000}
                  />
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      onClick={handleSaveNotes}
                      disabled={isSavingNotes || notesValue === (initialNotes ?? "")}
                      className="h-7 text-xs"
                    >
                      {isSavingNotes ? "Saving..." : "Save Note"}
                    </Button>
                    {!initialNotes && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setShowNotes(false);
                          setNotesValue("");
                        }}
                        className="h-7 text-xs"
                      >
                        Cancel
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
