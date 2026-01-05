"use client";

import { Braces } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { VARIABLE_GROUPS } from "@/lib/email-utils";

interface VariablePickerProps {
  onSelect: (variable: string) => void;
}

const CATEGORY_LABELS: Record<string, string> = {
  user: "User",
  household: "Household",
  platform: "Platform",
};

export function VariablePicker({ onSelect }: VariablePickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button type="button" variant="ghost" size="sm">
          <Braces className="mr-1 h-4 w-4" />
          Variable
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72" align="start">
        <div className="space-y-4">
          <div>
            <h4 className="mb-2 text-sm font-medium">Insert Variable</h4>
            <p className="text-xs text-muted-foreground">
              Click a variable to insert it at the cursor position.
            </p>
          </div>

          {Object.entries(VARIABLE_GROUPS).map(([category, variables]) => (
            <div key={category}>
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {CATEGORY_LABELS[category] || category}
              </p>
              <div className="space-y-1">
                {variables.map((variable) => (
                  <button
                    key={variable.key}
                    type="button"
                    onClick={() => onSelect(`{{${variable.key}}}`)}
                    className="w-full rounded px-2 py-1.5 text-left transition-colors hover:bg-muted"
                  >
                    <code className="text-sm text-primary">{`{{${variable.key}}}`}</code>
                    <p className="text-xs text-muted-foreground">{variable.description}</p>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
