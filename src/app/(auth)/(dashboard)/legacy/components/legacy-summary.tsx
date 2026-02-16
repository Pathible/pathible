"use client";

import { pdf } from "@react-pdf/renderer";
import { useMutation, useQuery } from "convex/react";
import {
  CheckCircle2,
  Download,
  Heart,
  Loader2,
  MapPin,
  MessageSquare,
  Pencil,
  Users,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { KeyContactsManager } from "./key-contacts-manager";
import { LegacyPDFDocument } from "./legacy-pdf-document";

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
  householdName: string;
  userName: string;
  legacyPlan: LegacyPlan;
  stats: LegacyStats | null;
}

export function LegacySummary({
  householdId,
  householdName,
  userName,
  legacyPlan,
  stats,
}: LegacySummaryProps) {
  const [isExporting, setIsExporting] = useState(false);
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

  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      // Prepare data for PDF
      const pdfData = {
        trustedContacts: legacyPlan.trustedContacts,
        guardians: legacyPlan.guardians,
        petCare: legacyPlan.petCare,
        memorial: legacyPlan.memorial,
        finalMessage: legacyPlan.finalMessage,
        keyContacts: (keyContacts || []).map((c) => ({
          name: c.name,
          role: c.role,
          phone: c.phone,
          email: c.email,
          address: c.address,
          notes: c.notes,
        })),
        userName,
        householdName,
        lastUpdated: stats?.lastUpdated ? new Date(stats.lastUpdated) : null,
      };

      // Generate PDF blob
      const blob = await pdf(<LegacyPDFDocument data={pdfData} />).toBlob();

      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `legacy-plan-${householdName.toLowerCase().replace(/\s+/g, "-")}-${new Date().toISOString().split("T")[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success("Legacy summary exported successfully!");
    } catch (error) {
      console.error("Failed to export PDF:", error);
      toast.error("Failed to export PDF. Please try again.");
    } finally {
      setIsExporting(false);
    }
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
        <h1 className="text-4xl font-bold mb-2">Your Legacy is Taking Shape</h1>
        <p className="text-muted-foreground">You&apos;ve given your family a true blessing</p>
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
              <CardDescription>The people you&apos;re counting on</CardDescription>
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
              <CardDescription>Who you&apos;d trust with what matters most</CardDescription>
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
              <CardDescription>The celebration of your life</CardDescription>
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
                Your Blessing
              </CardTitle>
              <CardDescription>The words you want them to carry</CardDescription>
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
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 justify-center pt-4">
        <Button onClick={handleExportPDF} size="lg" disabled={isExporting}>
          {isExporting ? (
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          ) : (
            <Download className="mr-2 h-5 w-5" />
          )}
          {isExporting ? "Generating PDF..." : "Export Legacy Summary PDF"}
        </Button>
        <Button onClick={handleEditResponses} variant="outline" size="lg">
          <Pencil className="mr-2 h-5 w-5" />
          Edit Responses
        </Button>
      </div>

      {/* Disclaimer */}
      <div className="p-4 bg-muted/50 rounded-lg mt-8">
        <p className="text-sm text-muted-foreground text-center">
          <strong>A note:</strong> This is a place to put your heart in writing, not legal or
          financial advice. For the official stuff, please work with a professional.
        </p>
      </div>
    </div>
  );
}
