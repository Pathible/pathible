"use client";

import { useClerk, useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { Clock, Info, Loader2, LogIn, Scale } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/convex/_generated/api";

/**
 * Activation page content - single confirmation page.
 *
 * Minimizes cognitive burden during grief with a simple, clear layout:
 * - Deceased's name input
 * - Optional date of death
 * - Acknowledgment checkbox
 * - Explanation of 48-hour cooldown
 * - One "Begin Estate Administration" button
 */
export function ActivateEstateContent() {
  const { user, isLoaded: isUserLoaded } = useUser();
  const { openSignIn } = useClerk();
  const router = useRouter();

  const households = useQuery(api.households.list, isUserLoaded && user ? {} : "skip");
  const household = households?.[0];
  const householdId = household?._id;

  const members = useQuery(api.households.listMembers, householdId ? { householdId } : "skip");
  const profile = useQuery(api.profiles.get, isUserLoaded && user ? {} : "skip");

  const activateEstate = useMutation(api.estate.activateEstate);

  const [deceasedName, setDeceasedName] = useState("");
  const [dateOfDeath, setDateOfDeath] = useState("");
  const [acknowledged, setAcknowledged] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [needsReauth, setNeedsReauth] = useState(false);

  if (!isUserLoaded || households === undefined || members === undefined) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Check if the current user is an executor
  const currentMembership = members?.find((m) => m.userId === profile?._id);
  const isExecutor = currentMembership?.role === "executor";

  if (!isExecutor) {
    return (
      <div className="space-y-6">
        <h2 className="text-3xl font-bold">Estate Administration</h2>
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>Executor role required</AlertTitle>
          <AlertDescription>
            Only the designated executor can activate estate administration. If you believe this is
            an error, please contact the household owner.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Already in estate mode
  if (household?.estateMode) {
    router.replace("/estate");
    return null;
  }

  const canSubmit = deceasedName.trim().length > 0 && acknowledged && !isSubmitting;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit || !householdId) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const dateOfDeathTimestamp = dateOfDeath ? new Date(dateOfDeath).getTime() : undefined;

      await activateEstate({
        householdId,
        deceasedName: deceasedName.trim(),
        dateOfDeath: dateOfDeathTimestamp,
      });

      router.push("/estate");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Something went wrong. Please try again.";
      const isAuthError = /re-?auth|reverif|session.*expired|fresh.*auth|step.*up/i.test(message);
      if (isAuthError) {
        setNeedsReauth(true);
      }
      setError(message);
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold">Begin Estate Administration</h2>
        <p className="mt-2 text-muted-foreground">
          We are sorry for your loss. This process will help you organize and manage the estate with
          care and clarity.
        </p>
      </div>

      <Alert>
        <Clock className="h-4 w-4" />
        <AlertTitle>48-hour safety period</AlertTitle>
        <AlertDescription>
          After activation, there is a 48-hour waiting period before estate administration fully
          takes effect. During this time, all household members will be notified and can review the
          activation. This helps protect everyone involved.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Scale className="h-5 w-5 text-primary" />
            <CardTitle>Activation Details</CardTitle>
          </div>
          <CardDescription>
            Provide the information below to begin estate administration. You can upload a death
            certificate later as part of the administration checklist.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="deceased-name">
                Name of the deceased <span className="text-destructive">*</span>
              </Label>
              <Input
                id="deceased-name"
                type="text"
                placeholder="Full legal name"
                value={deceasedName}
                onChange={(e) => setDeceasedName(e.target.value)}
                required
                data-testid="deceased-name-input"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="date-of-death">Date of death (optional)</Label>
              <Input
                id="date-of-death"
                type="date"
                value={dateOfDeath}
                onChange={(e) => setDateOfDeath(e.target.value)}
                max={new Date().toISOString().split("T")[0]}
                data-testid="date-of-death-input"
              />
            </div>

            <div className="flex items-start gap-3 rounded-lg border border-border p-4">
              <Checkbox
                id="acknowledgment"
                checked={acknowledged}
                onCheckedChange={(checked) => setAcknowledged(checked === true)}
                data-testid="acknowledgment-checkbox"
              />
              <Label htmlFor="acknowledgment" className="text-sm leading-relaxed cursor-pointer">
                I understand that this tool is for organizational purposes only and does not
                constitute legal advice. I acknowledge that all household members will be notified
                of this activation.
              </Label>
            </div>

            {error && (
              <Alert variant="destructive">
                {needsReauth ? <LogIn className="h-4 w-4" /> : <Info className="h-4 w-4" />}
                <AlertTitle>{needsReauth ? "Re-authentication required" : "Error"}</AlertTitle>
                <AlertDescription>
                  {needsReauth ? (
                    <div className="space-y-2">
                      <p>
                        For security, you must verify your identity before activating estate
                        administration. Please sign in again to proceed.
                      </p>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => openSignIn({ afterSignInUrl: "/estate/activate" })}
                        data-testid="reauth-button"
                      >
                        <LogIn className="mr-2 h-4 w-4" />
                        Sign in again
                      </Button>
                    </div>
                  ) : (
                    error
                  )}
                </AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              disabled={!canSubmit}
              className="w-full sm:w-auto"
              data-testid="begin-estate-btn"
            >
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Begin Estate Administration
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
