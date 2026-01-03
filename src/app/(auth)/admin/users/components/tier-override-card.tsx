"use client";

import { useMutation } from "convex/react";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

interface TierOverrideCardProps {
  householdId: Id<"households">;
  currentTier: string;
  tierOverride?: string;
  tierOverrideExpiresAt?: number;
  tierOverrideReason?: string;
}

export function TierOverrideCard({
  householdId,
  currentTier,
  tierOverride,
  tierOverrideExpiresAt,
  tierOverrideReason,
}: TierOverrideCardProps) {
  const applyTierOverride = useMutation(api.admin.users.applyTierOverride);
  const removeTierOverride = useMutation(api.admin.users.removeTierOverride);

  const [selectedTier, setSelectedTier] = useState<string>(tierOverride || currentTier);
  const [expirationDate, setExpirationDate] = useState<string>("");
  const [reason, setReason] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getTierBadge = (tier: string) => {
    const styles = {
      foundations: "bg-pathible-forest/10 text-pathible-forest border-pathible-forest/20",
      heritage: "bg-pathible-sage/20 text-pathible-sage border-pathible-sage/30",
      legacy: "bg-pathible-gold/20 text-pathible-gold border-pathible-gold/30",
      founders: "bg-primary text-primary-foreground border-primary",
    };
    return <Badge className={styles[tier as keyof typeof styles] || ""}>{tier}</Badge>;
  };

  const handleApplyOverride = async () => {
    if (!reason.trim()) {
      alert("Please provide a reason for the tier override");
      return;
    }

    setIsProcessing(true);
    try {
      await applyTierOverride({
        householdId,
        tier: selectedTier as "foundations" | "heritage" | "legacy" | "founders",
        expiresAt: expirationDate
          ? new Date(expirationDate).getTime()
          : undefined,
        reason: reason.trim(),
      });
      setReason("");
      setExpirationDate("");
    } catch (error) {
      console.error("Failed to apply tier override:", error);
      alert("Failed to apply tier override. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRemoveOverride = async () => {
    setIsProcessing(true);
    try {
      await removeTierOverride({ householdId });
      setSelectedTier(currentTier);
      setShowRemoveDialog(false);
    } catch (error) {
      console.error("Failed to remove tier override:", error);
      alert("Failed to remove tier override. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const hasActiveOverride = !!tierOverride;
  const isOverrideExpired =
    tierOverrideExpiresAt && tierOverrideExpiresAt < Date.now();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-crimson text-xl">Subscription Override</CardTitle>
        <CardDescription>
          Temporarily override this household&apos;s subscription tier
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current State Display */}
        <div className="rounded-lg border border-border bg-muted/30 p-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Current State:</span>
              {hasActiveOverride ? (
                <Badge variant="outline" className="border-primary/50 text-primary">
                  Override Active
                </Badge>
              ) : (
                <Badge variant="outline">No Override</Badge>
              )}
            </div>

            {hasActiveOverride && (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Override Tier:</span>
                  {getTierBadge(tierOverride)}
                </div>
                {tierOverrideExpiresAt && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Expires:</span>
                    <span className={`text-sm ${isOverrideExpired ? "text-destructive" : ""}`}>
                      {formatDate(tierOverrideExpiresAt)}
                      {isOverrideExpired && " (Expired)"}
                    </span>
                  </div>
                )}
                {tierOverrideReason && (
                  <div>
                    <span className="text-sm text-muted-foreground">Reason:</span>
                    <p className="text-sm mt-1">{tierOverrideReason}</p>
                  </div>
                )}
              </>
            )}

            {!hasActiveOverride && (
              <p className="text-sm text-muted-foreground">
                This household is using its standard subscription tier: {getTierBadge(currentTier)}
              </p>
            )}
          </div>
        </div>

        {/* Override Form */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="tier">Override Tier</Label>
            <Select value={selectedTier} onValueChange={setSelectedTier}>
              <SelectTrigger id="tier">
                <SelectValue placeholder="Select tier" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="foundations">Foundations</SelectItem>
                <SelectItem value="heritage">Heritage</SelectItem>
                <SelectItem value="legacy">Legacy</SelectItem>
                <SelectItem value="founders">Founders</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="expiration">
              Expiration Date <span className="text-muted-foreground">(optional)</span>
            </Label>
            <Input
              id="expiration"
              type="date"
              value={expirationDate}
              onChange={(e) => setExpirationDate(e.target.value)}
              min={new Date().toISOString().split("T")[0]}
            />
            <p className="text-xs text-muted-foreground">
              Leave blank for a permanent override
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">
              Reason <span className="text-destructive">*</span>
            </Label>
            <Input
              id="reason"
              placeholder="e.g., Promotional offer, Support escalation, Beta tester"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <Button onClick={handleApplyOverride} disabled={isProcessing || !reason.trim()}>
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Applying...
              </>
            ) : hasActiveOverride ? (
              "Update Override"
            ) : (
              "Apply Override"
            )}
          </Button>

          {hasActiveOverride && (
            <Button
              variant="outline"
              onClick={() => setShowRemoveDialog(true)}
              disabled={isProcessing}
            >
              Remove Override
            </Button>
          )}
        </div>
      </CardContent>

      {/* Remove Override Confirmation Dialog */}
      <AlertDialog open={showRemoveDialog} onOpenChange={setShowRemoveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Tier Override</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove the tier override? The household will revert to
              their standard subscription tier: {currentTier}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRemoveOverride} disabled={isProcessing}>
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Removing...
                </>
              ) : (
                "Remove Override"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
