"use client";

import { useMutation, useQuery } from "convex/react";
import {
  CheckCircle2,
  Download,
  Edit,
  FileText,
  Heart,
  MapPin,
  MessageSquare,
  Users,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { KeyContactsManager } from "./key-contacts-manager";

interface LegacyPlan {
  _id: Id<"legacyPlans">;
  trustedContacts?: string;
  guardians?: string;
  petCare?: string;
  memorial?: string;
  finalMessage?: string;
  isComplete: boolean;
  completionPercentage: number;
}

interface LegacyStats {
  hasLegacyPlan: boolean;
  isComplete: boolean;
  completionPercentage: number;
  keyContactsCount: number;
  lastUpdated: number | null;
}

interface LegacySummaryProps {
  householdId: Id<"households">;
  legacyPlan: LegacyPlan;
  stats: LegacyStats | null;
}

export function LegacySummary({ householdId, legacyPlan, stats }: LegacySummaryProps) {
  const resetCompletion = useMutation(api.legacy.resetCompletion);
  const keyContacts = useQuery(api.legacy.getKeyContacts, {
    householdId,
    legacyPlanId: legacyPlan._id,
  });

  const handleEditResponses = async () => {
    try {
      await resetCompletion({ householdId });
      toast.success("Returning to edit mode...");
    } catch (error) {
      console.error("Failed to reset completion:", error);
      toast.error("Failed to enter edit mode. Please try again.");
    }
  };

  const handleExportPDF = () => {
    // TODO: Implement PDF export
    toast.info("PDF export will be available in a future update.");
  };

  const formatDate = (timestamp: number | null) => {
    if (!timestamp) return "Never";
    return new Date(timestamp).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
        <h1 className="text-4xl font-bold mb-2">Legacy Plan Complete</h1>
        <p className="text-muted-foreground">Your wishes and values have been documented</p>
        {stats?.lastUpdated && (
          <p className="text-sm text-muted-foreground mt-2">
            Last updated: {formatDate(stats.lastUpdated)}
          </p>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid gap-6">
        {/* Trusted Contacts */}
        {legacyPlan.trustedContacts && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Trusted Contacts
              </CardTitle>
              <CardDescription>People you trust to handle your affairs</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {legacyPlan.trustedContacts}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Guardianship */}
        {legacyPlan.guardians && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-primary" />
                Guardianship Preferences
              </CardTitle>
              <CardDescription>Care for your children and pets</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {legacyPlan.guardians}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Memorial Preferences */}
        {legacyPlan.memorial && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                Memorial Preferences
              </CardTitle>
              <CardDescription>How you want to be remembered</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {legacyPlan.memorial}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Final Message */}
        {legacyPlan.finalMessage && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-primary" />
                Final Message
              </CardTitle>
              <CardDescription>Your message to loved ones</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {legacyPlan.finalMessage}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Key Contacts Manager */}
        <KeyContactsManager
          householdId={householdId}
          legacyPlanId={legacyPlan._id}
          contacts={keyContacts || []}
        />

        {/* Document Access Map */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Document Access Map
            </CardTitle>
            <CardDescription>
              Links to your important documents in the Heritage Vault
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link
              href="/vault"
              className="w-full flex items-center justify-between p-3 border border-border rounded-lg hover:bg-accent transition-colors"
            >
              <span className="text-sm font-medium">Will & Testament</span>
              <Badge variant="secondary">Vault</Badge>
            </Link>
            <Link
              href="/vault"
              className="w-full flex items-center justify-between p-3 border border-border rounded-lg hover:bg-accent transition-colors"
            >
              <span className="text-sm font-medium">Insurance Documents</span>
              <Badge variant="secondary">Vault</Badge>
            </Link>
            <Link
              href="/vault"
              className="w-full flex items-center justify-between p-3 border border-border rounded-lg hover:bg-accent transition-colors"
            >
              <span className="text-sm font-medium">Financial Accounts</span>
              <Badge variant="secondary">Vault</Badge>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 justify-center pt-4">
        <Button onClick={handleExportPDF} size="lg">
          <Download className="mr-2 h-5 w-5" />
          Export Legacy Summary PDF
        </Button>
        <Button onClick={handleEditResponses} variant="outline" size="lg">
          <Edit className="mr-2 h-5 w-5" />
          Edit Responses
        </Button>
      </div>

      {/* Disclaimer */}
      <div className="p-4 bg-muted/50 rounded-lg mt-8">
        <p className="text-sm text-muted-foreground text-center">
          <strong>Important:</strong> Legacy Planning is not legal or financial advice. It is a
          guided space to help you think through your values, intentions, and hopes. Please consult
          with qualified professionals for legal and financial matters.
        </p>
      </div>
    </div>
  );
}
