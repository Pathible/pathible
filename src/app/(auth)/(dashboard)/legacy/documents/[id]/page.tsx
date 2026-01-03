"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { AlertCircle, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { use, useEffect, useState } from "react";
import { FeatureGate } from "@/components/feature-gate";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { FEATURES } from "@/lib/feature-access";
import { LegalDocumentWizard } from "../../components/legal-document-wizard";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function LegalDocumentEditorPage({ params }: PageProps) {
  const { id } = use(params);
  const documentId = id as Id<"legalDocuments">;

  // Track retry attempts for auth sync
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 10;

  // Check Clerk session status
  const { user, isLoaded: isUserLoaded } = useUser();

  // Get user's households
  const households = useQuery(api.households.list, isUserLoaded && user ? {} : "skip");

  // Unified retry logic for auth race conditions
  useEffect(() => {
    const needsRetry = isUserLoaded && retryCount < maxRetries && (!user || households === null);

    if (needsRetry) {
      const timer = setTimeout(() => {
        setRetryCount((c) => c + 1);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isUserLoaded, user, households, retryCount]);

  // Determine if we're still in the auth loading phase
  const isAuthLoading = !isUserLoaded || (!user && retryCount < maxRetries);

  // Use the first household
  const householdId = households?.[0]?._id;

  // Loading state
  if (isAuthLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Not authenticated
  if (!user) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Let&apos;s Get You Signed In</h3>
          <p className="text-sm text-muted-foreground text-center max-w-sm">
            Sign in to access your legal documents.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Still loading households
  if (households === undefined || (households === null && retryCount < maxRetries)) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Auth sync failed
  if (households === null) {
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

  // No household found
  if (!householdId) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Let&apos;s Get You Set Up</h3>
          <p className="text-sm text-muted-foreground text-center max-w-sm">
            Complete your profile to start building your legacy plan.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <FeatureGate feature={FEATURES.LEGACY_LEGAL_DOCUMENTS}>
      <div className="space-y-6">
        {/* Back Navigation */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/legacy">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Legacy Planning
            </Link>
          </Button>
        </div>

        {/* Document Editor */}
        <LegalDocumentWizard
          householdId={householdId}
          documentId={documentId}
          onClose={() => {
            // Navigate back to legacy page
            window.location.href = "/legacy";
          }}
        />
      </div>
    </FeatureGate>
  );
}
