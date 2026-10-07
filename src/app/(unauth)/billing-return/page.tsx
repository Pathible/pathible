"use client";

import { useAction, useConvexAuth } from "convex/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { FullPageLoader } from "@/components/full-page-loader";
import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";

export default function BillingReturnPage() {
  return (
    <Suspense fallback={<FullPageLoader />}>
      <VerifyPurchase />
    </Suspense>
  );
}

function VerifyPurchase() {
  const { isAuthenticated } = useConvexAuth();
  const reconcile = useAction(api.billing.reconcileCurrentUser);
  const router = useRouter();
  const searchParams = useSearchParams();
  const started = useRef(false);
  const [error, setError] = useState(false);
  const destination =
    searchParams.get("next") === "/profile-settings" ? "/profile-settings" : "/onboarding";
  const verify = useCallback(async () => {
    setError(false);
    try {
      if (!(await reconcile({}))) throw new Error("No active plan yet");
      router.replace(destination);
    } catch {
      setError(true);
    }
  }, [reconcile, router, destination]);
  useEffect(() => {
    if (started.current || !isAuthenticated) return;
    started.current = true;
    void verify();
  }, [isAuthenticated, verify]);
  if (!error) return <FullPageLoader />;
  return (
    <main className="mx-auto max-w-lg space-y-5 px-6 py-20 text-center">
      <h1 className="text-2xl font-semibold">We could not confirm your plan yet</h1>
      <p>
        If you completed checkout, please try again. You do not need to purchase another plan. For
        help, contact support@pathible.com.
      </p>
      <Button onClick={() => void verify()}>Check My Plan Again</Button>
    </main>
  );
}
