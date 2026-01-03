"use client";

import { Heart, UserPlus, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

/**
 * ConnectionTypeDialog - Dialog for selecting relationship type when connecting nodes
 */

interface ConnectionTypeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (relationshipType: "parent_of" | "spouse_of" | "partner_of") => void;
}

const relationshipOptions = [
  {
    type: "parent_of" as const,
    label: "Parent of",
    description: "First person is a parent of the second",
    icon: Users,
    color: "text-slate-600",
  },
  {
    type: "spouse_of" as const,
    label: "Spouse",
    description: "These two people are married",
    icon: Heart,
    color: "text-pink-500",
  },
  {
    type: "partner_of" as const,
    label: "Partner",
    description: "These two people are unmarried partners",
    icon: UserPlus,
    color: "text-purple-500",
  },
];

export function ConnectionTypeDialog({ open, onOpenChange, onSelect }: ConnectionTypeDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Select Relationship Type</DialogTitle>
          <DialogDescription>Choose how these two family members are related</DialogDescription>
        </DialogHeader>

        <div className="grid gap-3 py-4">
          {relationshipOptions.map((option) => {
            const Icon = option.icon;
            return (
              <Button
                key={option.type}
                variant="outline"
                className="h-auto p-4 justify-start"
                onClick={() => {
                  onSelect(option.type);
                  onOpenChange(false);
                }}
              >
                <Icon className={`h-5 w-5 mr-3 ${option.color}`} />
                <div className="text-left">
                  <div className="font-medium">{option.label}</div>
                  <div className="text-xs text-muted-foreground">{option.description}</div>
                </div>
              </Button>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
