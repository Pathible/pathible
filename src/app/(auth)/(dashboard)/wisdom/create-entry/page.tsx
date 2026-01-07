"use client";

import { useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import {
  ArrowLeft,
  BookOpen,
  Check,
  ChevronRight,
  FileText,
  Heart,
  Lightbulb,
  Loader2,
  Lock,
  Sparkles,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FeatureGate } from "@/components/feature-gate";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/convex/_generated/api";
import { FEATURES } from "@/lib/feature-access";

// Intent types with guided prompts
const INTENTS = [
  {
    id: "life-lesson",
    title: "Share a Life Lesson",
    description: "Pass down wisdom you've gained through experience",
    icon: Lightbulb,
    category: "lessons" as const,
    prompts: {
      starter: "The lesson I learned was...",
      context: "What was happening in your life when you learned this?",
      meaning: "Why does this matter for your family to know?",
      blessing: "What do you hope they carry forward from this lesson?",
    },
    examples: {
      opening:
        "When I was 32, I learned that success means nothing without the people you love beside you.",
      closing: "Remember this when life gets busy. The people matter more than the achievements.",
    },
  },
  {
    id: "family-story",
    title: "Tell a Family Story",
    description: "Preserve a memorable moment or tradition",
    icon: BookOpen,
    category: "stories" as const,
    prompts: {
      starter: "There's a story I want you to know about...",
      context: "Where and when did this happen? Who was there?",
      meaning: "What makes this story important to our family?",
      blessing: "What do you hope this story teaches you?",
    },
    examples: {
      opening: "Every Sunday, your great-grandmother would gather us all in her tiny kitchen.",
      closing: "This tradition shaped who we are. I hope you'll carry it forward in your own way.",
    },
  },
  {
    id: "future-advice",
    title: "Write Advice for the Future",
    description: "Share guidance for life's big moments",
    icon: Sparkles,
    category: "advice" as const,
    prompts: {
      starter: "When you face this moment, I want you to know...",
      context: "What experience taught you this advice?",
      meaning: "Why is this guidance important?",
      blessing: "What outcome do you hope this advice leads to?",
    },
    examples: {
      opening:
        "When you're about to make a big decision, pause and ask yourself what you'll think in 10 years.",
      closing: "Trust yourself. You have everything you need inside you already.",
    },
  },
  {
    id: "tradition",
    title: "Capture a Tradition",
    description: "Document a family practice or ritual",
    icon: FileText,
    category: "traditions" as const,
    prompts: {
      starter: "In our family, we always...",
      context: "How did this tradition start? Who passed it down?",
      meaning: "What does this tradition represent for our family?",
      blessing: "How do you hope this tradition continues?",
    },
    examples: {
      opening:
        "Every New Year's Eve, we write down one thing we're letting go of and burn it together.",
      closing: "This simple act has helped us start each year with intention and hope.",
    },
  },
] as const;

type Intent = (typeof INTENTS)[number];
type Step = "intent" | "guided" | "finish";
type GuidedStep = 1 | 2 | 3 | 4;
type SaveOption = "draft" | "private" | "family";

const STEP_LABELS = ["The Moment", "The Context", "The Meaning", "The Hope"];

export default function CreateWisdomEntryPage() {
  const router = useRouter();
  const { user, isLoaded: isUserLoaded } = useUser();

  // Flow state
  const [currentStep, setCurrentStep] = useState<Step>("intent");
  const [selectedIntent, setSelectedIntent] = useState<Intent | null>(null);

  // Guided prompts state
  const [guidedStep, setGuidedStep] = useState<GuidedStep>(1);
  const [responses, setResponses] = useState({
    starter: "",
    context: "",
    meaning: "",
    blessing: "",
  });

  // Finish state
  const [title, setTitle] = useState("");
  const [saveOption, setSaveOption] = useState<SaveOption>("private");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get user's households
  const households = useQuery(api.households.list, isUserLoaded && user ? {} : "skip");
  const householdId = households?.[0]?._id;

  // Mutation
  const createWisdomEntry = useMutation(api.wisdom.create);

  const handleIntentSelect = (intent: Intent) => {
    setSelectedIntent(intent);
    setCurrentStep("guided");
  };

  const handleResponseChange = (key: keyof typeof responses, value: string) => {
    setResponses((prev) => ({ ...prev, [key]: value }));
  };

  const getGuidedPromptKey = (): keyof typeof responses => {
    const keys: (keyof typeof responses)[] = ["starter", "context", "meaning", "blessing"];
    return keys[guidedStep - 1];
  };

  const getCurrentPrompt = () => {
    if (!selectedIntent) return "";
    const key = getGuidedPromptKey();
    return selectedIntent.prompts[key];
  };

  const getCurrentResponse = () => {
    return responses[getGuidedPromptKey()];
  };

  const hasAnyContent = () => {
    return Object.values(responses).some((r) => r.trim().length > 0);
  };

  const getProgressPercent = () => {
    if (currentStep === "intent") return 0;
    if (currentStep === "guided") return (guidedStep / 4) * 75;
    return 100;
  };

  const handleNextGuidedStep = () => {
    if (guidedStep < 4) {
      setGuidedStep((prev) => (prev + 1) as GuidedStep);
    } else {
      setCurrentStep("finish");
    }
  };

  const handlePrevGuidedStep = () => {
    if (guidedStep > 1) {
      setGuidedStep((prev) => (prev - 1) as GuidedStep);
    } else {
      setCurrentStep("intent");
      setSelectedIntent(null);
    }
  };

  const handleSkipToFinish = () => {
    setCurrentStep("finish");
  };

  const handleBackToGuided = () => {
    setCurrentStep("guided");
  };

  // Combine responses into content
  const buildContent = () => {
    const parts: string[] = [];
    if (responses.starter.trim()) {
      parts.push(responses.starter.trim());
    }
    if (responses.context.trim()) {
      parts.push(responses.context.trim());
    }
    if (responses.meaning.trim()) {
      parts.push(responses.meaning.trim());
    }
    if (responses.blessing.trim()) {
      parts.push(responses.blessing.trim());
    }
    return parts.join("\n\n");
  };

  const handleSave = async () => {
    if (!householdId || !selectedIntent || !title.trim()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const content = buildContent();
      if (!content.trim()) {
        setError("Please add some content to your wisdom entry");
        setIsSubmitting(false);
        return;
      }

      await createWisdomEntry({
        householdId,
        title: title.trim(),
        content,
        category: selectedIntent.category,
        isPublished: saveOption === "family",
      });

      router.push("/wisdom/library");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save entry");
      setIsSubmitting(false);
    }
  };

  // Loading state
  if (!isUserLoaded || households === undefined) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // ==================== INTENT SELECTION STEP ====================
  if (currentStep === "intent") {
    return (
      <FeatureGate feature={FEATURES.WISDOM_ENTRIES}>
        <div className="min-h-[80vh] flex flex-col">
          <div className="px-6 py-4">
            <Link
              href="/wisdom"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Wisdom Hub
            </Link>
          </div>

          <div className="flex-1 flex items-center justify-center px-6 pb-12">
            <div className="w-full max-w-3xl">
              <div className="text-center mb-8">
                <Heart className="h-12 w-12 mx-auto text-primary mb-6" />
                <h1 className="text-3xl font-bold mb-3">What would you like to share today?</h1>
                <p className="text-muted-foreground max-w-xl mx-auto">
                  Choose the type of wisdom you want to preserve. We'll guide you through with
                  simple questions.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {INTENTS.map((intent) => {
                  const Icon = intent.icon;
                  return (
                    <Card
                      key={intent.id}
                      className="cursor-pointer hover:border-primary/50 hover:shadow-sm transition-all"
                      onClick={() => handleIntentSelect(intent)}
                    >
                      <CardContent className="p-5">
                        <div className="flex items-start gap-4">
                          <div className="p-2.5 rounded-lg bg-primary/10 text-primary shrink-0">
                            <Icon className="h-5 w-5" />
                          </div>
                          <div className="flex-1 text-left min-w-0">
                            <h3 className="font-semibold">{intent.title}</h3>
                            <p className="text-sm text-muted-foreground">{intent.description}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              <p className="mt-8 text-center text-sm text-muted-foreground">
                Want to write freely?{" "}
                <Link href="/wisdom/create-entry/quick" className="text-primary hover:underline">
                  Use quick mode
                </Link>
              </p>
            </div>
          </div>
        </div>
      </FeatureGate>
    );
  }

  // ==================== GUIDED PROMPTS STEP ====================
  if (currentStep === "guided" && selectedIntent) {
    const Icon = selectedIntent.icon;

    return (
      <FeatureGate feature={FEATURES.WISDOM_ENTRIES}>
        <div className="min-h-[80vh] flex flex-col">
          <div className="px-6 py-4 flex items-center justify-between">
            <button
              type="button"
              onClick={handlePrevGuidedStep}
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>
            {hasAnyContent() && (
              <button
                type="button"
                onClick={handleSkipToFinish}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Skip to finish
              </button>
            )}
          </div>

          <div className="flex-1 flex items-center justify-center px-6 pb-12">
            <div className="w-full max-w-2xl space-y-6">
              {/* Progress */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Step {guidedStep} of 4</span>
                  <span className="font-medium">{STEP_LABELS[guidedStep - 1]}</span>
                </div>
                <Progress value={getProgressPercent()} className="h-2" />
              </div>

              {/* Intent badge */}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Icon className="h-4 w-4" />
                <span>{selectedIntent.title}</span>
              </div>

              {/* Main prompt card */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">{getCurrentPrompt()}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea
                    placeholder="Take your time. Write as little or as much as feels right..."
                    value={getCurrentResponse()}
                    onChange={(e) => handleResponseChange(getGuidedPromptKey(), e.target.value)}
                    className="min-h-[200px] resize-none text-base leading-relaxed"
                  />

                  {/* Example hint */}
                  <div className="p-4 bg-muted/50 rounded-lg space-y-2">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Example
                    </p>
                    <p className="text-sm italic">
                      {guidedStep === 1
                        ? selectedIntent.examples.opening
                        : guidedStep === 4
                          ? selectedIntent.examples.closing
                          : "Take a moment to reflect. There's no right or wrong answer."}
                    </p>
                  </div>

                  {/* Actions */}
                  <Button onClick={handleNextGuidedStep} className="w-full py-6 text-lg">
                    {guidedStep < 4 ? "Continue" : "Finish Entry"}
                    <ChevronRight className="h-5 w-5 ml-2" />
                  </Button>

                  <p className="text-center text-sm text-muted-foreground">
                    You can stop at any step. What you've written will be saved.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </FeatureGate>
    );
  }

  // ==================== FINISH STEP ====================
  return (
    <FeatureGate feature={FEATURES.WISDOM_ENTRIES}>
      <div className="min-h-[80vh] flex flex-col">
        <div className="px-6 py-4">
          <button
            type="button"
            onClick={handleBackToGuided}
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to editing
          </button>
        </div>

        <div className="flex-1 px-6 pb-12">
          <div className="w-full max-w-2xl mx-auto space-y-6">
            {/* Progress */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Final step</span>
                <span className="font-medium">Save your wisdom</span>
              </div>
              <Progress value={100} className="h-2" />
            </div>

            {error && (
              <div className="p-3 bg-destructive/10 text-destructive rounded-md text-sm">
                {error}
              </div>
            )}

            {/* Preview of content */}
            <Card className="bg-muted/30">
              <CardHeader>
                <CardTitle className="text-lg">What you've written</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {responses.starter && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                      The Moment
                    </p>
                    <p>{responses.starter}</p>
                  </div>
                )}
                {responses.context && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                      The Context
                    </p>
                    <p>{responses.context}</p>
                  </div>
                )}
                {responses.meaning && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                      The Meaning
                    </p>
                    <p>{responses.meaning}</p>
                  </div>
                )}
                {responses.blessing && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                      The Hope
                    </p>
                    <p>{responses.blessing}</p>
                  </div>
                )}
                {!hasAnyContent() && (
                  <p className="text-muted-foreground italic">No content written yet.</p>
                )}
              </CardContent>
            </Card>

            {/* Required: Title */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Give it a title *</CardTitle>
                <CardDescription>A short, memorable name for this wisdom entry</CardDescription>
              </CardHeader>
              <CardContent>
                <Input
                  placeholder="e.g., The Day I Learned to Let Go"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="text-lg"
                  maxLength={200}
                />
              </CardContent>
            </Card>

            {/* Save Options */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">How would you like to save this?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <SaveOptionCard
                  selected={saveOption === "draft"}
                  onClick={() => setSaveOption("draft")}
                  icon={null}
                  title="Save as Draft"
                  description="Continue editing later. Only you can see this."
                />
                <SaveOptionCard
                  selected={saveOption === "private"}
                  onClick={() => setSaveOption("private")}
                  icon={<Lock className="w-4 h-4 text-primary" />}
                  title="Save Private"
                  description="Complete and saved. Only you can see this."
                />
                <SaveOptionCard
                  selected={saveOption === "family"}
                  onClick={() => setSaveOption("family")}
                  icon={<Users className="w-4 h-4 text-primary" />}
                  title="Share with Family"
                  description="Your family members can view this wisdom."
                />
              </CardContent>
            </Card>

            {/* Save Button */}
            <div className="flex gap-3">
              <Button
                onClick={handleSave}
                className="flex-1 py-6 text-lg"
                disabled={isSubmitting || !title.trim() || !hasAnyContent()}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                    Saving...
                  </>
                ) : saveOption === "draft" ? (
                  "Save Draft"
                ) : saveOption === "family" ? (
                  "Save & Share"
                ) : (
                  "Save Entry"
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push("/wisdom")}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </div>
    </FeatureGate>
  );
}

// Save Option Card Component
function SaveOptionCard({
  selected,
  onClick,
  icon,
  title,
  description,
}: {
  selected: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <button
      type="button"
      className={`w-full p-4 rounded-lg border cursor-pointer transition-all text-left ${
        selected ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
      }`}
      onClick={onClick}
    >
      <div className="flex items-center gap-3">
        <div
          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
            selected ? "border-primary bg-primary" : "border-muted-foreground"
          }`}
        >
          {selected && <Check className="w-3 h-3 text-primary-foreground" />}
        </div>
        <div className="flex items-center gap-2">
          {icon}
          <div>
            <p className="font-medium">{title}</p>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
        </div>
      </div>
    </button>
  );
}
