"use client";

import { SignInButton, useAuth } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { FullPageLoader } from "@/components/full-page-loader";
import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";

export default function UnsubscribePage() {
  return (
    <Suspense fallback={<FullPageLoader />}>
      <EmailPreferences />
    </Suspense>
  );
}

function EmailPreferences() {
  const token = useSearchParams().get("token");
  const { isSignedIn, isLoaded } = useAuth();
  const unsubscribe = useMutation(api.emailPreferences.unsubscribe);
  const unsubscribeCurrentUser = useMutation(api.emailPreferences.unsubscribeCurrentUser);
  const [status, setStatus] = useState<"ready" | "saving" | "done" | "error">("ready");
  const confirm = async () => {
    setStatus("saving");
    try {
      if (token) await unsubscribe({ token });
      else await unsubscribeCurrentUser({});
      setStatus("done");
    } catch {
      setStatus("error");
    }
  };
  return (
    <main className="mx-auto max-w-lg space-y-5 px-6 py-20 text-center">
      <h1 className="text-3xl font-semibold">Email Preferences</h1>
      {status === "done" ? (
        <p role="status">
          You are unsubscribed from optional Pathible emails. Essential account and security
          messages may still be sent.
        </p>
      ) : (
        <>
          <p>
            Stop receiving optional Pathible emails. Your account and family documents remain
            available.
          </p>
          {token || isSignedIn ? (
            <Button disabled={status === "saving"} onClick={() => void confirm()}>
              Unsubscribe From Optional Emails
            </Button>
          ) : isLoaded ? (
            <SignInButton forceRedirectUrl="/unsubscribe">
              <Button>Sign In to Manage Emails</Button>
            </SignInButton>
          ) : (
            <p>Loading…</p>
          )}
          {status === "error" && (
            <p role="alert">
              We could not update your preference. Try the latest link in your email, or contact
              support@pathible.com.
            </p>
          )}
        </>
      )}
    </main>
  );
}
