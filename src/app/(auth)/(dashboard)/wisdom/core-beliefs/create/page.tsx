"use client";

import { useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import {
  ArrowLeft,
  Briefcase,
  Check,
  ChevronRight,
  Church,
  Heart,
  HelpCircle,
  Loader2,
  Sparkles,
  User,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/convex/_generated/api";

const CATEGORIES = [
  {
    value: "faith",
    label: "Faith",
    description: "Beliefs rooted in spirituality or religion",
    icon: Church,
  },
  {
    value: "family",
    label: "Family",
    description: "Values about family bonds and relationships",
    icon: Users,
  },
  {
    value: "work",
    label: "Work",
    description: "Principles that guide your professional life",
    icon: Briefcase,
  },
  {
    value: "community",
    label: "Community",
    description: "Values about service and connection to others",
    icon: Sparkles,
  },
  {
    value: "personal",
    label: "Personal",
    description: "Individual values and self-development",
    icon: User,
  },
  {
    value: "other",
    label: "Other",
    description: "Beliefs that don't fit other categories",
    icon: HelpCircle,
  },
] as const;

type Category = (typeof CATEGORIES)[number]["value"];
type Step = "category" | "statement" | "reflection" | "review";

export default function CreateBeliefWizardPage() {
  const router = useRouter();
  const { user, isLoaded: isUserLoaded } = useUser();

  const [step, setStep] = useState<Step>("category");
  const [category, setCategory] = useState<Category | null>(null);
  const [statement, setStatement] = useState("");
  const [reflection, setReflection] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get user's households
  const households = useQuery(api.households.list, isUserLoaded && user ? {} : "skip");
  const householdId = households?.[0]?._id;

  // Mutation
  const createBelief = useMutation(api.coreBeliefs.create);

  const handleCategorySelect = (cat: Category) => {
    setCategory(cat);
    setStep("statement");
  };

  const handleStatementNext = () => {
    if (!statement.trim()) {
      setError("Please enter your belief statement");
      return;
    }
    setError(null);
    setStep("reflection");
  };

  const handleReflectionNext = () => {
    if (!reflection.trim()) {
      setError("Please share why this belief is important to you");
      return;
    }
    setError(null);
    setStep("review");
  };

  const handleSubmit = async () => {
    if (!householdId || !category) return;

    setIsSubmitting(true);
    setError(null);

    try {
      await createBelief({
        householdId,
        statement: statement.trim(),
        reflection: reflection.trim(),
        category,
      });
      router.push("/wisdom/core-beliefs");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create belief");
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    setError(null);
    if (step === "statement") setStep("category");
    else if (step === "reflection") setStep("statement");
    else if (step === "review") setStep("reflection");
  };

  // Loading state
  if (!isUserLoaded || households === undefined) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const selectedCategory = CATEGORIES.find((c) => c.value === category);

  return (
    <div className="min-h-[80vh] flex flex-col">
      {/* Back link */}
      <div className="px-6 py-4">
        {step === "category" ? (
          <Link
            href="/wisdom/core-beliefs"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
        ) : (
          <button
            type="button"
            onClick={handleBack}
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
        )}
      </div>

      {/* Main content - centered */}
      <div className="flex-1 flex items-center justify-center px-6 pb-12">
        <div className="w-full max-w-3xl">
          {/* Step: Category Selection */}
          {step === "category" && (
            <div className="text-center">
              <Heart className="h-12 w-12 mx-auto text-primary mb-6" />
              <h1 className="text-3xl font-bold mb-3">What area of life does this belief guide?</h1>
              <p className="text-muted-foreground mb-8">
                Choose the category that best represents your core belief. This helps organize your
                values.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {CATEGORIES.map((cat) => {
                  const Icon = cat.icon;
                  return (
                    <Card
                      key={cat.value}
                      className="cursor-pointer hover:border-primary/50 hover:shadow-sm transition-all"
                      onClick={() => handleCategorySelect(cat.value)}
                    >
                      <CardContent className="p-5">
                        <div className="flex items-start gap-4">
                          <div className="p-2.5 rounded-lg bg-primary/10 text-primary shrink-0">
                            <Icon className="h-5 w-5" />
                          </div>
                          <div className="flex-1 text-left min-w-0">
                            <h3 className="font-semibold">{cat.label}</h3>
                            <p className="text-sm text-muted-foreground">{cat.description}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Quick mode link */}
              <p className="mt-8 text-sm text-muted-foreground">
                Already know what you want to write?{" "}
                <Link
                  href="/wisdom/core-beliefs?quick=true"
                  className="text-primary hover:underline"
                >
                  Use quick mode
                </Link>
              </p>
            </div>
          )}

          {/* Step: Statement */}
          {step === "statement" && (
            <div className="text-center">
              <Heart className="h-12 w-12 mx-auto text-primary mb-6" />
              <h1 className="text-3xl font-bold mb-3">What do you believe?</h1>
              <p className="text-muted-foreground mb-8">
                Express your core belief in a single, powerful statement. This is the foundation of
                your value.
              </p>

              {error && (
                <div className="mb-6 p-3 bg-destructive/10 text-destructive rounded-md text-sm">
                  {error}
                </div>
              )}

              <div className="text-left space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="statement" className="text-base">
                    Your Belief Statement
                  </Label>
                  <Input
                    id="statement"
                    value={statement}
                    onChange={(e) => setStatement(e.target.value)}
                    placeholder="e.g., Family is the foundation of a meaningful life"
                    className="text-lg py-6"
                    maxLength={200}
                  />
                  <p className="text-xs text-muted-foreground text-right">
                    {statement.length}/200 characters
                  </p>
                </div>

                <Button
                  onClick={handleStatementNext}
                  className="w-full py-6 text-lg"
                  disabled={!statement.trim()}
                >
                  Continue
                  <ChevronRight className="h-5 w-5 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {/* Step: Reflection */}
          {step === "reflection" && (
            <div className="text-center">
              <Heart className="h-12 w-12 mx-auto text-primary mb-6" />
              <h1 className="text-3xl font-bold mb-3">Why is this belief important to you?</h1>
              <p className="text-muted-foreground mb-8">
                Share the story behind this belief. What experiences shaped it? How does it guide
                your decisions?
              </p>

              {error && (
                <div className="mb-6 p-3 bg-destructive/10 text-destructive rounded-md text-sm">
                  {error}
                </div>
              )}

              <div className="text-left space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="reflection" className="text-base">
                    Your Reflection
                  </Label>
                  <Textarea
                    id="reflection"
                    value={reflection}
                    onChange={(e) => setReflection(e.target.value)}
                    placeholder="Through every challenge and triumph, this belief has guided me..."
                    className="min-h-[150px] text-base"
                    maxLength={5000}
                  />
                  <p className="text-xs text-muted-foreground text-right">
                    {reflection.length}/5000 characters
                  </p>
                </div>

                <Button
                  onClick={handleReflectionNext}
                  className="w-full py-6 text-lg"
                  disabled={!reflection.trim()}
                >
                  Review Your Belief
                  <ChevronRight className="h-5 w-5 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {/* Step: Review */}
          {step === "review" && selectedCategory && (
            <div className="text-center">
              <div className="h-12 w-12 mx-auto bg-primary/10 text-primary rounded-full flex items-center justify-center mb-6">
                <Check className="h-6 w-6" />
              </div>
              <h1 className="text-3xl font-bold mb-3">Review Your Core Belief</h1>
              <p className="text-muted-foreground mb-8">
                Take a moment to review before saving this belief to your legacy.
              </p>

              {error && (
                <div className="mb-6 p-3 bg-destructive/10 text-destructive rounded-md text-sm">
                  {error}
                </div>
              )}

              <Card className="text-left mb-6">
                <CardContent className="p-6 space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Category</p>
                    <div className="flex items-center gap-2">
                      <selectedCategory.icon className="h-4 w-4 text-primary" />
                      <span className="font-medium">{selectedCategory.label}</span>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Belief Statement</p>
                    <p className="font-semibold text-lg">{statement}</p>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Reflection</p>
                    <p className="text-muted-foreground">{reflection}</p>
                  </div>
                </CardContent>
              </Card>

              <Button
                onClick={handleSubmit}
                className="w-full py-6 text-lg"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Heart className="h-5 w-5 mr-2" />
                    Save to My Legacy
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
