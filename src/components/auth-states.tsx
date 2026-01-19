"use client";

import { AlertCircle, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

/**
 * Loading spinner for auth/data loading states
 */
export function AuthLoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-12">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  );
}

interface AuthStateCardProps {
  /** Context for the message (e.g., "vault", "financial") */
  context?: string;
}

/**
 * Card shown when user is not authenticated
 */
export function SignInRequiredCard({ context }: AuthStateCardProps) {
  const contextText = context ? `your family's ${context}` : "this feature";

  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center justify-center py-12">
        <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">Let&apos;s Get You Signed In</h3>
        <p className="text-sm text-muted-foreground text-center max-w-sm">
          Sign in to access {contextText}.
        </p>
      </CardContent>
    </Card>
  );
}

/**
 * Card shown when connection to backend fails after retries
 */
export function ConnectionErrorCard() {
  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center justify-center py-12">
        <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">Having Trouble Connecting</h3>
        <p className="text-sm text-muted-foreground text-center max-w-sm mb-4">
          We&apos;re having trouble reaching your family&apos;s data. Mind giving it another try?
        </p>
      </CardContent>
    </Card>
  );
}

/**
 * Card shown when user has no household (needs to complete onboarding)
 */
export function SetupRequiredCard({ context }: AuthStateCardProps) {
  const contextText = context ? `organizing your family's ${context}` : "using this feature";

  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center justify-center py-12">
        <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">Let&apos;s Get You Set Up</h3>
        <p className="text-sm text-muted-foreground text-center max-w-sm">
          Complete your profile to start {contextText}.
        </p>
      </CardContent>
    </Card>
  );
}
