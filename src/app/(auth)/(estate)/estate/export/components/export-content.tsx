"use client";

import { useUser } from "@clerk/nextjs";
import { pdf } from "@react-pdf/renderer";
import { useQuery } from "convex/react";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import type { ExportSection } from "@/lib/estate-export";
import { downloadFile, generateEstateCSV } from "@/lib/estate-export";
import { EstatePDFDocument } from "./estate-pdf-document";
import { ExportOptions } from "./export-options";
import { ExportPreview } from "./export-preview";

type ExportFormat = "pdf" | "csv";

export function ExportContent() {
  const { user, isLoaded: isUserLoaded } = useUser();
  const households = useQuery(api.households.list, isUserLoaded && user ? {} : "skip");
  const household = households?.[0];
  const householdId = household?._id;

  const summary = useQuery(api.estate.getEstateSummary, householdId ? { householdId } : "skip");

  const [sections, setSections] = useState<ExportSection[]>([
    "checklist",
    "assets",
    "communications",
    "distributions",
  ]);
  const [exportingFormat, setExportingFormat] = useState<ExportFormat | null>(null);

  if (!isUserLoaded || households === undefined) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!household || !household.estateMode) {
    return (
      <div className="text-center py-12 space-y-4">
        <p className="text-muted-foreground">Activate estate administration to export a summary.</p>
        <Button variant="outline" asChild>
          <Link href="/estate">Go to Estate Overview</Link>
        </Button>
      </div>
    );
  }

  if (summary === undefined) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (summary === null) {
    return (
      <div className="text-center py-12 space-y-4">
        <p className="text-muted-foreground">
          No estate data yet. Start by adding items to your checklist or asset list.
        </p>
        <Button variant="outline" asChild>
          <Link href="/estate">Go to Estate Overview</Link>
        </Button>
      </div>
    );
  }

  const availableSections: { key: ExportSection; label: string; count: number }[] = [
    { key: "checklist", label: "Checklist", count: summary.checklistItems.length },
    { key: "assets", label: "Assets", count: summary.assets.length },
    { key: "communications", label: "Communications", count: summary.communications.length },
    { key: "distributions", label: "Distributions", count: summary.distributions.length },
  ];

  const activeSections = sections.filter((s) => {
    const section = availableSections.find((a) => a.key === s);
    return section && section.count > 0;
  });

  const handleExport = async (format: ExportFormat) => {
    if (activeSections.length === 0) {
      toast.error("Select at least one section with data to export.");
      return;
    }

    setExportingFormat(format);
    try {
      const slug = summary.activation.deceasedName
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "");
      const dateStr = new Date().toISOString().split("T")[0];

      if (format === "pdf") {
        const blob = await pdf(
          <EstatePDFDocument data={summary} sections={activeSections} />,
        ).toBlob();
        downloadFile(blob, `estate-summary-${slug}-${dateStr}.pdf`, "application/pdf");
        toast.success("PDF exported successfully.");
      } else {
        const csv = generateEstateCSV(summary, activeSections);
        downloadFile(csv, `estate-summary-${slug}-${dateStr}.csv`, "text/csv");
        toast.success("CSV exported successfully.");
      }
    } catch (error) {
      console.error("Export failed:", error);
      toast.error("Export failed. Please try again.");
    } finally {
      setExportingFormat(null);
    }
  };

  return (
    <div className="space-y-6" data-testid="export-content">
      <div>
        <h2 className="text-4xl font-bold">Export Summary</h2>
        <p className="mt-1 text-muted-foreground">Create a report of your progress so far.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[320px_1fr]">
        <ExportOptions
          sections={sections}
          onSectionsChange={setSections}
          availableSections={availableSections}
          onExport={handleExport}
          exportingFormat={exportingFormat}
          canExport={activeSections.length > 0}
        />
        <ExportPreview data={summary} sections={activeSections} />
      </div>
    </div>
  );
}
