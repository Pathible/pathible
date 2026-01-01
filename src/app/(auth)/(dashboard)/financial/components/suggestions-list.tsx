"use client";

import { useMutation } from "convex/react";
import { CheckCircle, Lightbulb, X } from "lucide-react";
import { toast } from "sonner";
import { ComingSoonBadge } from "@/components/coming-soon";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

interface Suggestion {
  _id: Id<"userSuggestions">;
  _creationTime: number;
  userId: Id<"profiles">;
  householdId: Id<"households">;
  suggestionId: Id<"smartSuggestions">;
  status: "pending" | "dismissed" | "completed";
  dismissedAt?: number;
  completedAt?: number;
  // Enriched suggestion details
  title: string;
  description: string;
  category: "document" | "planning" | "financial" | "legal" | "legacy" | "other";
  priority: "high" | "medium" | "low";
  icon?: string;
}

interface SuggestionsListProps {
  suggestions: Suggestion[];
  isLoading: boolean;
}

export function SuggestionsList({ suggestions, isLoading }: SuggestionsListProps) {
  const dismissSuggestion = useMutation(api.financial.dismissSuggestion);
  const completeSuggestion = useMutation(api.financial.completeSuggestion);

  const handleDismiss = async (suggestionId: Id<"userSuggestions">) => {
    try {
      await dismissSuggestion({ suggestionId });
      toast.success("Suggestion dismissed");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to dismiss suggestion");
    }
  };

  const handleComplete = async (suggestionId: Id<"userSuggestions">) => {
    try {
      await completeSuggestion({ suggestionId });
      toast.success("Suggestion marked as complete");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to complete suggestion");
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case "high":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      case "medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "low":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case "financial":
        return "💰";
      case "legal":
        return "⚖️";
      case "planning":
        return "📋";
      case "document":
        return "📄";
      default:
        return "💡";
    }
  };

  if (isLoading) {
    return null;
  }

  if (suggestions.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <Lightbulb className="h-16 w-16 text-muted-foreground mb-4" />
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-xl font-semibold">Smart Suggestions</h3>
            <ComingSoonBadge size="sm" />
          </div>
          <p className="text-sm text-muted-foreground text-center max-w-md">
            AI-powered financial suggestions are coming soon. We&apos;ll analyze your financial
            profile and provide personalized recommendations to help optimize your planning.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {suggestions.map((suggestion) => (
        <Card key={suggestion._id} className="overflow-hidden">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3 flex-1">
                <div className="text-2xl mt-1">{getCategoryIcon(suggestion.category)}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <CardTitle className="text-lg">{suggestion.title}</CardTitle>
                    <Badge className={getPriorityColor(suggestion.priority)}>
                      {suggestion.priority}
                    </Badge>
                  </div>
                  <CardDescription>{suggestion.description}</CardDescription>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDismiss(suggestion._id)}
                className="shrink-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Button onClick={() => handleComplete(suggestion._id)} className="w-full">
              <CheckCircle className="h-4 w-4 mr-2" />
              Mark as Complete
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
