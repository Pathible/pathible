"use client";

import { useUser } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { AlertTriangle, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { api } from "@/convex/_generated/api";

interface DangerZoneCardProps {
  profileName: string;
}

export function DangerZoneCard({ profileName }: DangerZoneCardProps) {
  const router = useRouter();
  const { user } = useUser();
  const deleteProfile = useMutation(api.profiles.deleteProfile);
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  const expectedText = "DELETE";
  const canDelete = confirmText === expectedText;

  const handleDeleteAccount = async () => {
    if (!canDelete || !user) return;

    setIsDeleting(true);

    try {
      // Step 1: Delete from Convex (soft-delete profile and related data)
      await deleteProfile({});
      console.log("[AccountDeletion] Convex profile soft-deleted");

      // Step 2: Delete from Clerk (this also signs out the user)
      await user.delete();
      console.log("[AccountDeletion] Clerk account deleted");

      toast.success("Account deleted", {
        description: "Your account has been permanently deleted.",
      });

      // Redirect to sign-in page (user is already signed out after Clerk deletion)
      router.push("/sign-in");
    } catch (error) {
      console.error("[AccountDeletion] Failed to delete account:", error);
      toast.error("Failed to delete account", {
        description: error instanceof Error ? error.message : "Please try again or contact support",
      });
      setIsDeleting(false);
      setDialogOpen(false);
    }
  };

  return (
    <>
      <Separator className="my-6" />

      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Danger Zone
          </CardTitle>
          <CardDescription>Actions that can&apos;t be undone</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4">
            <h4 className="font-medium text-destructive mb-2">Delete Account</h4>
            <p className="text-sm text-muted-foreground mb-4">
              Deleting your account removes everything: your profile, your documents, your wisdom
              entries, all of it. Your family would lose access to everything you&apos;ve created.
              This can&apos;t be undone.
            </p>

            <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="w-full sm:w-auto">
                  Delete Account
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-destructive" />
                    Delete Account Permanently?
                  </AlertDialogTitle>
                  <AlertDialogDescription asChild>
                    <div className="space-y-4">
                      <p>
                        This action <strong>cannot be undone</strong>. This will permanently delete
                        the account for <strong>{profileName}</strong> and remove:
                      </p>
                      <ul className="list-disc list-inside space-y-1 text-sm">
                        <li>Your login credentials and authentication</li>
                        <li>Your profile and personal information</li>
                        <li>All documents in your Heritage Vault</li>
                        <li>Your membership in all households</li>
                        <li>All activity history and notifications</li>
                      </ul>
                      <div className="pt-2">
                        <Label htmlFor="confirm-delete" className="text-sm">
                          Type <strong>DELETE</strong> to confirm:
                        </Label>
                        <Input
                          id="confirm-delete"
                          value={confirmText}
                          onChange={(e) => setConfirmText(e.target.value.toUpperCase())}
                          placeholder="DELETE"
                          className="mt-2"
                          disabled={isDeleting}
                        />
                      </div>
                    </div>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel disabled={isDeleting} onClick={() => setConfirmText("")}>
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteAccount}
                    disabled={!canDelete || isDeleting}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {isDeleting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      "Delete Account"
                    )}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
