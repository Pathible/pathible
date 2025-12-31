"use client";

import { useQuery } from "convex/react";
import { AlertCircle, ArrowLeft, CheckCircle2, ExternalLink, Info } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

interface PreviewContentProps {
  tourId: Id<"tours">;
}

function PreviewContent({ tourId }: PreviewContentProps) {
  const searchParams = useSearchParams();
  const stepId = searchParams.get("step") as Id<"tourSteps"> | null;

  const tour = useQuery(api.tours.get, { tourId });
  const steps = useQuery(api.tours.listSteps, { tourId });

  const [anchorStatus, setAnchorStatus] = useState<"checking" | "found" | "not-found" | null>(null);

  const step = steps?.find((s) => s._id === stepId);

  // Reset anchor status when step changes
  const currentStepId = step?._id;
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentionally reset when step changes
  useEffect(() => {
    setAnchorStatus(null);
  }, [currentStepId]);

  const checkAnchor = () => {
    if (!step) return;

    setAnchorStatus("checking");

    // Open the route in a new tab with preview mode
    const previewUrl = `${step.route}?tour_preview=1&anchor=${encodeURIComponent(step.anchorKey)}`;
    window.open(previewUrl, "_blank");

    // We can't actually check the anchor from here since it's cross-origin
    // The preview mode indicator will show on that page
    setTimeout(() => {
      setAnchorStatus(null);
    }, 2000);
  };

  if (tour === undefined || steps === undefined) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!tour) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Tour not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/admin/tours/${tourId}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="font-crimson text-3xl font-semibold">Preview Tour Step</h1>
          <p className="text-muted-foreground">{tour.name}</p>
        </div>
      </div>

      {!step ? (
        <Card>
          <CardHeader>
            <CardTitle>Select a Step to Preview</CardTitle>
            <CardDescription>
              Choose a step from the list below to preview its anchor
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {steps.map((s) => (
                <Link
                  key={s._id}
                  href={`/admin/tours/${tourId}/preview?step=${s._id}`}
                  className="flex items-center justify-between rounded-lg border p-4 hover:bg-muted transition-colors"
                >
                  <div>
                    <p className="font-medium">{s.title}</p>
                    <p className="text-sm text-muted-foreground">
                      Route: <code className="rounded bg-muted px-1">{s.route}</code> • Anchor:{" "}
                      <code className="rounded bg-muted px-1">{s.anchorKey}</code>
                    </p>
                  </div>
                  <Badge variant={s.enabled ? "default" : "secondary"}>
                    {s.enabled ? "Enabled" : "Disabled"}
                  </Badge>
                </Link>
              ))}
              {steps.length === 0 && (
                <p className="text-center py-8 text-muted-foreground">No steps in this tour yet</p>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Step Details */}
          <Card>
            <CardHeader>
              <CardTitle className="font-crimson text-xl">{step.title}</CardTitle>
              <CardDescription>Step {step.order + 1} in the tour</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Route</p>
                  <code className="rounded bg-muted px-2 py-1 text-sm">{step.route}</code>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Anchor Key</p>
                  <code className="rounded bg-muted px-2 py-1 text-sm">{step.anchorKey}</code>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Status</p>
                  <Badge variant={step.enabled ? "default" : "secondary"}>
                    {step.enabled ? "Enabled" : "Disabled"}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Version Introduced</p>
                  <Badge variant="outline">v{step.versionIntroduced}</Badge>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Body</p>
                <div className="rounded-lg border bg-muted/50 p-4">
                  <p className="whitespace-pre-wrap text-sm">{step.body}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Anchor Validation */}
          <Card>
            <CardHeader>
              <CardTitle className="font-crimson text-xl">Anchor Validation</CardTitle>
              <CardDescription>
                Test if the anchor element exists on the target page
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>How anchors work</AlertTitle>
                <AlertDescription>
                  Tour steps anchor to elements using the{" "}
                  <code className="rounded bg-muted px-1">data-tour</code> attribute. Make sure the
                  target element has{" "}
                  <code className="rounded bg-muted px-1">
                    data-tour=&quot;{step.anchorKey}&quot;
                  </code>{" "}
                  on the page.
                </AlertDescription>
              </Alert>

              <div className="flex items-center gap-4">
                <Button onClick={checkAnchor} disabled={anchorStatus === "checking"}>
                  <ExternalLink className="mr-2 h-4 w-4" />
                  {anchorStatus === "checking" ? "Opening..." : "Open Route to Test"}
                </Button>
                <p className="text-sm text-muted-foreground">
                  Opens <code className="rounded bg-muted px-1">{step.route}</code> in a new tab
                </p>
              </div>

              {anchorStatus === "found" && (
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <AlertTitle className="text-green-800">Anchor Found</AlertTitle>
                  <AlertDescription className="text-green-700">
                    The element with data-tour=&quot;{step.anchorKey}&quot; was found on the page.
                  </AlertDescription>
                </Alert>
              )}

              {anchorStatus === "not-found" && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Anchor Not Found</AlertTitle>
                  <AlertDescription>
                    No element with data-tour=&quot;{step.anchorKey}&quot; was found on the page.
                    Make sure to add this attribute to the target element.
                  </AlertDescription>
                </Alert>
              )}

              <div className="rounded-lg border bg-muted/50 p-4">
                <p className="text-sm font-medium mb-2">Example HTML:</p>
                <pre className="rounded bg-background p-3 text-xs overflow-x-auto">
                  {`<button data-tour="${step.anchorKey}">
  Click me
</button>`}
                </pre>
              </div>
            </CardContent>
          </Card>

          {/* Other Steps */}
          <Card>
            <CardHeader>
              <CardTitle className="font-crimson text-xl">Other Steps</CardTitle>
              <CardDescription>Preview other steps in this tour</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {steps
                  .filter((s) => s._id !== step._id)
                  .map((s) => (
                    <Link
                      key={s._id}
                      href={`/admin/tours/${tourId}/preview?step=${s._id}`}
                      className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted transition-colors"
                    >
                      <div>
                        <p className="font-medium text-sm">{s.title}</p>
                        <p className="text-xs text-muted-foreground">
                          <code>{s.anchorKey}</code>
                        </p>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        Step {s.order + 1}
                      </Badge>
                    </Link>
                  ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

interface PreviewPageProps {
  params: Promise<{ tourId: string }>;
}

export default function PreviewPage({ params }: PreviewPageProps) {
  const [tourId, setTourId] = useState<string | null>(null);

  useEffect(() => {
    params.then((p) => setTourId(p.tourId));
  }, [params]);

  if (!tourId) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      }
    >
      <PreviewContent tourId={tourId as Id<"tours">} />
    </Suspense>
  );
}
