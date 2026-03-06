"use client";

import { useMutation } from "convex/react";
import { Clock, Loader2, Scale, ShieldAlert, XCircle } from "lucide-react";
import { useState } from "react";
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { formatDateLong } from "@/lib/date-utils";

interface EstateAdminCardProps {
  householdId: Id<"households">;
  estateMode?: boolean;
  executorPurchased?: boolean;
  executorPurchasedAt?: number;
  activation?: {
    _id: Id<"estateActivations">;
    status: "pending" | "active" | "contested" | "completed" | "cancelled";
    deceasedName: string;
    activatedAt: number;
    cooldownEndsAt: number;
    activatedByName: string;
  };
}

const statusConfig: Record<
  string,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline" }
> = {
  pending: { label: "Pending Cooldown", variant: "secondary" },
  active: { label: "Active", variant: "default" },
  contested: { label: "Contested", variant: "destructive" },
  completed: { label: "Completed", variant: "outline" },
  cancelled: { label: "Cancelled", variant: "outline" },
};

export function EstateAdminCard({
  householdId,
  estateMode,
  executorPurchased,
  executorPurchasedAt,
  activation,
}: EstateAdminCardProps) {
  const completeCooldown = useMutation(api.admin.users.completeCooldownEarly);
  const cancelActivation = useMutation(api.admin.users.cancelEstateActivation);
  const grantExecutor = useMutation(api.admin.users.grantExecutorPurchase);
  const revokeExecutor = useMutation(api.admin.users.revokeExecutorPurchase);

  const [reason, setReason] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showRevokeDialog, setShowRevokeDialog] = useState(false);
  const [executorReason, setExecutorReason] = useState("");
  const [isExecutorProcessing, setIsExecutorProcessing] = useState(false);

  const handleGrantExecutor = async () => {
    if (!executorReason.trim()) {
      alert("Please provide a reason");
      return;
    }
    setIsExecutorProcessing(true);
    try {
      await grantExecutor({ householdId, reason: executorReason.trim() });
      setExecutorReason("");
    } catch (error) {
      console.error("Failed to grant executor purchase:", error);
      alert(error instanceof Error ? error.message : "Failed to grant executor purchase");
    } finally {
      setIsExecutorProcessing(false);
    }
  };

  const handleRevokeExecutor = async () => {
    if (!executorReason.trim()) {
      alert("Please provide a reason");
      return;
    }
    setIsExecutorProcessing(true);
    try {
      await revokeExecutor({ householdId, reason: executorReason.trim() });
      setExecutorReason("");
      setShowRevokeDialog(false);
    } catch (error) {
      console.error("Failed to revoke executor purchase:", error);
      alert(error instanceof Error ? error.message : "Failed to revoke executor purchase");
    } finally {
      setIsExecutorProcessing(false);
    }
  };

  const handleSkipCooldown = async () => {
    if (!reason.trim()) {
      alert("Please provide a reason");
      return;
    }

    setIsProcessing(true);
    try {
      await completeCooldown({ householdId, reason: reason.trim() });
      setReason("");
    } catch (error) {
      console.error("Failed to skip cooldown:", error);
      alert(error instanceof Error ? error.message : "Failed to skip cooldown");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancelActivation = async () => {
    if (!reason.trim()) {
      alert("Please provide a reason");
      return;
    }

    setIsProcessing(true);
    try {
      await cancelActivation({ householdId, reason: reason.trim() });
      setReason("");
      setShowCancelDialog(false);
    } catch (error) {
      console.error("Failed to cancel activation:", error);
      alert(error instanceof Error ? error.message : "Failed to cancel activation");
    } finally {
      setIsProcessing(false);
    }
  };

  const status = activation ? statusConfig[activation.status] : null;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Scale className="h-5 w-5" />
          <CardTitle className="font-crimson text-xl">Estate Administration</CardTitle>
        </div>
        <CardDescription>Manage estate activation status and cooldown period</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Executor Product */}
        <div className="rounded-lg border border-border p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Executor Product:</span>
            <Badge variant={executorPurchased ? "default" : "outline"}>
              {executorPurchased ? "Purchased" : "Not Purchased"}
            </Badge>
          </div>
          {executorPurchased && executorPurchasedAt && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Purchased:</span>
              <span className="text-sm">{formatDateLong(executorPurchasedAt)}</span>
            </div>
          )}

          <div className="space-y-2 pt-1">
            <Label htmlFor="executor-reason">
              Reason <span className="text-destructive">*</span>
            </Label>
            <Input
              id="executor-reason"
              placeholder="e.g., Customer purchase, support grant"
              value={executorReason}
              onChange={(e) => setExecutorReason(e.target.value)}
            />
          </div>

          <div className="flex gap-3">
            {!executorPurchased ? (
              <Button
                size="sm"
                onClick={handleGrantExecutor}
                disabled={isExecutorProcessing || !executorReason.trim()}
              >
                {isExecutorProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Grant Purchase"
                )}
              </Button>
            ) : (
              <Button
                size="sm"
                variant="destructive"
                onClick={() => setShowRevokeDialog(true)}
                disabled={isExecutorProcessing || !executorReason.trim()}
              >
                Revoke Purchase
              </Button>
            )}
          </div>
        </div>

        {/* Estate Activation State */}
        <div className="rounded-lg border border-border p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Estate Mode:</span>
            <Badge variant={estateMode ? "default" : "outline"}>
              {estateMode ? "Active" : "Inactive"}
            </Badge>
          </div>

          {activation ? (
            <>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Activation Status:</span>
                <Badge variant={status?.variant ?? "outline"}>
                  {status?.label ?? activation.status}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Deceased:</span>
                <span className="text-sm font-medium">{activation.deceasedName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Activated by:</span>
                <span className="text-sm">{activation.activatedByName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Activated:</span>
                <span className="text-sm">{formatDateLong(activation.activatedAt)}</span>
              </div>
              {activation.status === "pending" && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Cooldown ends:</span>
                  <span className="text-sm font-medium">
                    {formatDateLong(activation.cooldownEndsAt)}
                  </span>
                </div>
              )}
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              No estate activation exists for this household.
            </p>
          )}
        </div>

        {/* Admin Actions */}
        {activation &&
          (activation.status === "pending" ||
            activation.status === "active" ||
            activation.status === "contested") && (
            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label htmlFor="estate-reason">
                  Reason <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="estate-reason"
                  placeholder="e.g., Testing, Customer support request"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                />
              </div>

              <div className="flex gap-3">
                {activation.status === "pending" && (
                  <Button onClick={handleSkipCooldown} disabled={isProcessing || !reason.trim()}>
                    {isProcessing ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Clock className="h-4 w-4 mr-2" />
                        Skip Cooldown
                      </>
                    )}
                  </Button>
                )}

                <Button
                  variant="destructive"
                  onClick={() => setShowCancelDialog(true)}
                  disabled={isProcessing || !reason.trim()}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Cancel Activation
                </Button>
              </div>
            </div>
          )}
      </CardContent>

      {/* Cancel Confirmation Dialog */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-destructive" />
              Cancel Estate Activation
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will cancel the estate activation for <strong>{activation?.deceasedName}</strong>{" "}
              and disable estate mode. This action is logged and the household will be notified.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing}>Go Back</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelActivation}
              disabled={isProcessing}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Cancelling...
                </>
              ) : (
                "Confirm Cancellation"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Revoke Executor Purchase Confirmation Dialog */}
      <AlertDialog open={showRevokeDialog} onOpenChange={setShowRevokeDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-destructive" />
              Revoke Executor Purchase
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will revoke the executor product purchase for this household. They will lose
              access to estate administration features.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isExecutorProcessing}>Go Back</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRevokeExecutor}
              disabled={isExecutorProcessing}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isExecutorProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Revoking...
                </>
              ) : (
                "Confirm Revoke"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
