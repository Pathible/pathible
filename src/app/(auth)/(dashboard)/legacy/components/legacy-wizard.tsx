"use client";

import { useMutation } from "convex/react";
import { ArrowLeft, ArrowRight, Heart, MapPin, MessageSquare, Users } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

interface LegacyPlan {
  _id: Id<"legacyPlans">;
  trustedContacts?: string;
  guardians?: string;
  petCare?: string;
  memorial?: string;
  finalMessage?: string;
  isComplete: boolean;
  completionPercentage: number;
}

interface LegacyWizardProps {
  householdId: Id<"households">;
  legacyPlan: LegacyPlan | null;
  onCreatePlan: () => Promise<Id<"legacyPlans">>;
}

const questions = [
  {
    id: "trustedContacts" as const,
    title: "Who do you trust to handle things?",
    description: "Who would you turn to if you needed someone to handle things for your family?",
    icon: Users,
    placeholder:
      "List the people you trust with important decisions and responsibilities. Include their names, relationship to you, and what specific responsibilities you would entrust to them...",
  },
  {
    id: "guardians" as const,
    title: "Who should care for your children or pets?",
    description: "If something happened to you, who would love them the way you do?",
    icon: Heart,
    placeholder:
      "Describe your wishes for the care of your children and/or pets. Include who you would want as guardians, any backup choices, and specific instructions for their care...",
  },
  {
    id: "memorial" as const,
    title: "How would you like to be celebrated?",
    description: "How would you like to be celebrated and remembered by those who love you?",
    icon: MapPin,
    placeholder:
      "Describe your memorial preferences and where you'd like to be remembered. Include preferences for services, location, music, readings, or any special requests...",
  },
  {
    id: "finalMessage" as const,
    title: "What blessing do you want to leave your family?",
    description: "Leave a message of love, wisdom, or guidance for those you care about.",
    icon: MessageSquare,
    placeholder:
      "Write your message to loved ones. Share what you want them to remember, wisdom you want to pass on, or simply express your love and gratitude...",
  },
];

type SectionType = "trustedContacts" | "guardians" | "memorial" | "finalMessage";

export function LegacyWizard({ householdId, legacyPlan, onCreatePlan }: LegacyWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<Record<SectionType, string>>({
    trustedContacts: "",
    guardians: "",
    memorial: "",
    finalMessage: "",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);

  // Mutations
  const updateSection = useMutation(api.legacy.updateSection);
  const markComplete = useMutation(api.legacy.markComplete);

  // Initialize form data from existing plan
  useEffect(() => {
    if (legacyPlan && !hasInitialized) {
      setFormData({
        trustedContacts: legacyPlan.trustedContacts || "",
        guardians: legacyPlan.guardians || "",
        memorial: legacyPlan.memorial || "",
        finalMessage: legacyPlan.finalMessage || "",
      });
      setHasInitialized(true);

      // Find the first incomplete step
      const firstEmptyStep = questions.findIndex((q) => {
        const value = legacyPlan[q.id];
        return !value || value.trim().length === 0;
      });
      if (firstEmptyStep !== -1) {
        setCurrentStep(firstEmptyStep);
      }
    }
  }, [legacyPlan, hasInitialized]);

  const progress = ((currentStep + 1) / questions.length) * 100;
  const currentQuestion = questions[currentStep];

  // Auto-save when moving between steps
  const saveCurrentSection = useCallback(async () => {
    const section = questions[currentStep].id;
    const content = formData[section];

    if (!content.trim()) return;

    setIsSaving(true);
    try {
      // Create plan if it doesn't exist
      if (!legacyPlan) {
        await onCreatePlan();
      }
      await updateSection({
        householdId,
        section,
        content,
      });
    } catch (error) {
      console.error("Failed to save section:", error);
      toast.error("Failed to save your response. Please try again.");
      throw error; // Re-throw to prevent navigation
    } finally {
      setIsSaving(false);
    }
  }, [currentStep, formData, householdId, legacyPlan, onCreatePlan, updateSection]);

  const handleNext = async () => {
    try {
      await saveCurrentSection();
    } catch {
      // Error already handled with toast in saveCurrentSection
      return;
    }

    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Complete the plan
      try {
        await markComplete({ householdId });
        toast.success("Legacy plan completed!");
      } catch (error) {
        console.error("Failed to mark complete:", error);
        toast.error("Failed to complete your plan. Please try again.");
      }
    }
  };

  const handleBack = async () => {
    try {
      await saveCurrentSection();
    } catch {
      // Error already handled with toast in saveCurrentSection
      return;
    }

    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleInputChange = (value: string) => {
    const section = currentQuestion.id;
    setFormData((prev) => ({ ...prev, [section]: value }));
  };

  const Icon = currentQuestion.icon;

  return (
    <div className="space-y-6" data-tour="legacy-wizard">
      {/* Progress Card */}
      <Card>
        <CardContent>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Progress</span>
            <span className="text-sm text-muted-foreground">
              Question {currentStep + 1} of {questions.length}
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </CardContent>
      </Card>

      {/* Question Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-lg bg-primary/10">
              <Icon className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <Badge variant="outline" className="mb-2">
                Step {currentStep + 1}
              </Badge>
              <CardTitle className="text-2xl">{currentQuestion.title}</CardTitle>
            </div>
          </div>
          <CardDescription className="text-base">{currentQuestion.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="answer" className="text-base">
              Your Response
            </Label>
            <Textarea
              id="answer"
              placeholder={currentQuestion.placeholder}
              value={formData[currentQuestion.id]}
              onChange={(e) => handleInputChange(e.target.value)}
              className="min-h-[200px] resize-none"
            />
            <p className="text-xs text-muted-foreground">
              No rush. You can come back to this anytime. Your words here are a gift.
            </p>
          </div>

          <div className="flex justify-between pt-4">
            <Button onClick={handleBack} variant="outline" disabled={currentStep === 0 || isSaving}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <Button onClick={handleNext} disabled={isSaving}>
              {isSaving ? (
                "Saving..."
              ) : currentStep === questions.length - 1 ? (
                "Complete"
              ) : (
                <>
                  Next
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quick Navigation */}
      <Card>
        <CardContent>
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium">Quick Navigation</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {questions.map((q, index) => {
              const QIcon = q.icon;
              const isComplete = formData[q.id].trim().length > 0;
              const isCurrent = index === currentStep;

              return (
                <Button
                  key={q.id}
                  variant={isCurrent ? "default" : isComplete ? "secondary" : "outline"}
                  size="sm"
                  className="justify-start"
                  onClick={async () => {
                    await saveCurrentSection();
                    setCurrentStep(index);
                  }}
                  disabled={isSaving}
                >
                  <QIcon className="h-4 w-4 mr-2" />
                  <span className="truncate text-xs">Step {index + 1}</span>
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
