"use client";

import { useAuth } from "@clerk/nextjs";
import { Check, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatBytesAsGB } from "@/convex/shared/constants";
import {
  PLAN_LIMITS,
  SUBSCRIPTION_TIERS,
  type SubscriptionTier,
  TIER_DISPLAY,
  UNLIMITED,
} from "@/convex/shared/subscriptionTiers";

interface PricingPlansProps {
  currentTier?: SubscriptionTier | null;
  mode?: "new" | "change";
}

const TIER_FEATURES: Record<SubscriptionTier, string[]> = {
  foundations: [
    "Secure document storage (5 GB)",
    "Photo & video uploads",
    "Folder organization",
    "Financial overview",
    "1 family member",
    "Standard support",
  ],
  heritage: [
    "Everything in Foundations",
    "Tags & collections",
    "Voice recordings",
    "Guided organization",
    "Financial summaries & insights",
    "Family profiles & messaging",
    "Wisdom entries",
    "Up to 3 family members",
    "25 GB storage",
    "Priority support",
  ],
  legacy: [
    "Everything in Heritage",
    "Spending categories & trends",
    "Relationship mapping",
    "Guided questionnaires",
    "Story templates",
    "Legal document templates",
    "Shared wisdom pages",
    "Unlimited members & storage",
    "Concierge support",
  ],
  founders: [
    "All Legacy features forever",
    "Unlimited members & storage",
    "Priority support",
    "Exclusive launch pricing",
  ],
};

/**
 * Stripe Price IDs from environment variables.
 * These must be set in .env.local for the client redirect to work.
 */
const PRICE_IDS: Partial<Record<SubscriptionTier, string>> = {
  foundations: process.env.NEXT_PUBLIC_STRIPE_PRICE_FOUNDATIONS,
  heritage: process.env.NEXT_PUBLIC_STRIPE_PRICE_HERITAGE,
  legacy: process.env.NEXT_PUBLIC_STRIPE_PRICE_LEGACY,
};

export function PricingPlans({ currentTier, mode = "new" }: PricingPlansProps) {
  const { isSignedIn } = useAuth();
  const router = useRouter();
  const [loadingTier, setLoadingTier] = useState<SubscriptionTier | null>(null);

  // Only show purchasable tiers (not founders)
  const visibleTiers = SUBSCRIPTION_TIERS.filter((t) => t !== "founders");

  const handleSelectPlan = async (tier: SubscriptionTier) => {
    if (!isSignedIn) {
      router.push(`/sign-up?redirect_url=/select-plan`);
      return;
    }

    const priceId = PRICE_IDS[tier];
    if (!priceId) {
      toast.error("This plan is not available for purchase.");
      return;
    }

    setLoadingTier(tier);

    try {
      const response = await fetch("/api/stripe/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId, mode: "subscription" }),
      });

      const data = (await response.json()) as { url?: string; error?: string };

      if (!response.ok) {
        throw new Error(data.error || "Failed to create checkout session");
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error("Checkout error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to start checkout");
    } finally {
      setLoadingTier(null);
    }
  };

  return (
    <div className="grid gap-6 md:grid-cols-3 max-w-6xl mx-auto">
      {visibleTiers.map((tier) => {
        const display = TIER_DISPLAY[tier];
        const limits = PLAN_LIMITS[tier];
        const features = TIER_FEATURES[tier];
        const isCurrentPlan = currentTier === tier;
        const isPopular = tier === "heritage";

        return (
          <Card
            key={tier}
            className={`relative flex flex-col ${isPopular ? "border-primary shadow-lg ring-1 ring-primary" : ""}`}
          >
            {isPopular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="bg-primary text-primary-foreground text-xs font-medium px-3 py-1 rounded-full">
                  Most Popular
                </span>
              </div>
            )}

            <CardHeader className="text-center pb-4">
              <CardTitle className="text-2xl">{display.label}</CardTitle>
              <CardDescription className="min-h-[2.5rem]">
                {display.shortDescription}
              </CardDescription>
              <div className="mt-4">
                {display.priceMonthly ? (
                  <div>
                    <span className="text-4xl font-bold">${display.priceMonthly}</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                ) : (
                  <span className="text-2xl font-bold">{display.priceLabel}</span>
                )}
              </div>
            </CardHeader>

            <CardContent className="flex-1 flex flex-col">
              <ul className="space-y-3 flex-1 mb-6">
                {features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <div className="text-xs text-muted-foreground mb-4 space-y-1">
                <p>
                  Storage:{" "}
                  {limits.storageBytesMax === UNLIMITED
                    ? "Unlimited"
                    : `${formatBytesAsGB(limits.storageBytesMax)} GB`}
                </p>
                <p>
                  Family members:{" "}
                  {limits.familyMembersMax === UNLIMITED ? "Unlimited" : limits.familyMembersMax}
                </p>
              </div>

              {isCurrentPlan ? (
                <Button variant="outline" disabled className="w-full">
                  Current Plan
                </Button>
              ) : (
                <Button
                  onClick={() => handleSelectPlan(tier)}
                  disabled={loadingTier !== null}
                  variant={isPopular ? "default" : "outline"}
                  className="w-full"
                >
                  {loadingTier === tier ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Redirecting...
                    </>
                  ) : mode === "change" ? (
                    "Switch Plan"
                  ) : (
                    "Start Free Trial"
                  )}
                </Button>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
