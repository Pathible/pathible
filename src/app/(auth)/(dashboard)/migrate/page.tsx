"use client";

import { useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { CheckCircle, Loader2, RefreshCw, XCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/convex/_generated/api";

export default function MigratePage() {
  const router = useRouter();
  const { user, isLoaded: isUserLoaded } = useUser();
  const [status, setStatus] = useState<"idle" | "migrating" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");

  // Check if profile already exists
  const profile = useQuery(api.profiles.get, isUserLoaded && user ? {} : "skip");

  // Migration mutation
  const linkToClerkUser = useMutation(api.profiles.linkToClerkUser);

  const handleMigrate = async () => {
    if (!user?.emailAddresses[0]?.emailAddress) {
      setErrorMessage("No email address found");
      setStatus("error");
      return;
    }

    setStatus("migrating");
    setErrorMessage("");

    try {
      const result = await linkToClerkUser({
        email: user.emailAddresses[0].emailAddress,
      });

      if (result) {
        setStatus("success");
        // Redirect to dashboard after successful migration
        setTimeout(() => {
          router.push("/dashboard");
        }, 2000);
      } else {
        setErrorMessage("No profile found to migrate. You may need to complete onboarding.");
        setStatus("error");
      }
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Migration failed");
      setStatus("error");
    }
  };

  // Loading state
  if (!isUserLoaded || profile === undefined) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Profile already exists and is linked
  if (profile) {
    return (
      <div className="flex items-center justify-center min-h-screen p-6">
        <Card className="max-w-md w-full">
          <CardHeader>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-6 w-6 text-green-500" />
              <CardTitle>Profile Already Linked</CardTitle>
            </div>
            <CardDescription>
              Your profile is already connected to your Clerk account.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Welcome back, {profile.firstName} {profile.lastName}!
            </p>
            <Button onClick={() => router.push("/dashboard")} className="w-full">
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen p-6">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle>Account Migration Required</CardTitle>
          <CardDescription>
            We&apos;ve upgraded our authentication system. Click below to link your existing profile
            to your new account.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {user && (
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm">
                <span className="text-muted-foreground">Signed in as:</span>{" "}
                <span className="font-medium">{user.emailAddresses[0]?.emailAddress}</span>
              </p>
            </div>
          )}

          {status === "success" && (
            <div className="flex items-center gap-2 p-3 bg-green-50 text-green-700 rounded-lg">
              <CheckCircle className="h-5 w-5" />
              <span>Migration successful! Redirecting to dashboard...</span>
            </div>
          )}

          {status === "error" && (
            <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-lg">
              <XCircle className="h-5 w-5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <Button
            onClick={handleMigrate}
            disabled={status === "migrating" || status === "success"}
            className="w-full"
          >
            {status === "migrating" ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Migrating...
              </>
            ) : status === "success" ? (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Migration Complete
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Link My Profile
              </>
            )}
          </Button>

          {status === "error" && (
            <Button variant="outline" onClick={() => router.push("/onboarding")} className="w-full">
              Start Fresh with Onboarding
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
