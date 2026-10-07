"use client";

import { useAuth } from "@clerk/nextjs";
import { CheckoutButton, usePlans } from "@clerk/nextjs/experimental";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { referralRedirect } from "@/lib/referral";

/** The price and checkout use the same live Clerk plan. Existing subscriptions stay intact. */
export function AnnualFamilyPlan({ redirectUrl = "/onboarding" }: { redirectUrl?: string }) {
  const { isSignedIn } = useAuth();
  const searchParams = useSearchParams();
  const { data: plans, isLoading, error } = usePlans({ for: "user" });
  const plan = plans?.find((candidate) => candidate.slug === "legacy");
  const annualPrice = plan?.annualFee;

  if (isLoading)
    return (
      <p role="status" className="text-center">
        Loading annual plan…
      </p>
    );
  if (error || !plan || !annualPrice) {
    return (
      <p role="alert" className="text-center">
        Our annual plan is temporarily unavailable. Please contact{" "}
        <a className="underline" href="mailto:support@pathible.com">
          support@pathible.com
        </a>
        .
      </p>
    );
  }

  return (
    <div
      className="mx-auto max-w-lg rounded-2xl border bg-card p-8 shadow-sm"
      data-testid="annual-family-plan"
    >
      <h2 className="font-crimson text-3xl">One family. One plan.</h2>
      <p className="mt-4 text-4xl font-semibold">
        {annualPrice.currencySymbol}
        {annualPrice.amountFormatted}
        <span className="text-lg font-normal"> / year</span>
      </p>
      <p className="mt-2 text-sm text-muted-foreground">
        {annualPrice.currency} · Full annual amount charged at checkout. Renews annually until
        canceled.
      </p>
      <ul className="my-6 list-disc space-y-3 pl-5">
        <li>Organize important documents in your Heritage Vault</li>
        <li>Record accounts, insurance, property, and final wishes</li>
        <li>Invite your family and manage their access</li>
        <li>Save the stories and guidance you want to pass on</li>
      </ul>
      {isSignedIn ? (
        <CheckoutButton
          planId={plan.id}
          planPeriod="annual"
          newSubscriptionRedirectUrl={`/billing-return?${new URLSearchParams({ next: redirectUrl })}`}
        >
          <Button className="w-full" size="lg">
            Start My Annual Family Plan
          </Button>
        </CheckoutButton>
      ) : (
        <Button className="w-full" size="lg" asChild>
          <Link href={referralRedirect("/signup", searchParams.get("ref"))}>
            Organize My Family
          </Link>
        </Button>
      )}
      <p className="mt-4 text-sm text-muted-foreground">
        Start with one essential document, then invite someone you trust.
      </p>
    </div>
  );
}
