"use client";

import { Download, FileSpreadsheet, FileText, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import type { ExportSection } from "@/lib/estate-export";

type ExportFormat = "pdf" | "csv";

interface ExportOptionsProps {
  sections: ExportSection[];
  onSectionsChange: (sections: ExportSection[]) => void;
  availableSections: { key: ExportSection; label: string; count: number }[];
  onExport: (format: ExportFormat) => void;
  exportingFormat: ExportFormat | null;
  canExport: boolean;
}

export function ExportOptions({
  sections,
  onSectionsChange,
  availableSections,
  onExport,
  exportingFormat,
  canExport,
}: ExportOptionsProps) {
  const toggleSection = (section: ExportSection) => {
    if (sections.includes(section)) {
      onSectionsChange(sections.filter((s) => s !== section));
    } else {
      onSectionsChange([...sections, section]);
    }
  };

  const isExporting = exportingFormat !== null;

  return (
    <div className="space-y-4" data-testid="export-options">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Download</CardTitle>
          <CardDescription>Export your estate summary.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => onExport("pdf")}
              disabled={!canExport || isExporting}
              className="flex w-full items-center gap-3 rounded-lg border border-border p-3 text-left transition-colors hover:bg-muted/50 disabled:pointer-events-none disabled:opacity-50"
              data-testid="export-format-pdf"
            >
              {exportingFormat === "pdf" ? (
                <Loader2 className="h-5 w-5 shrink-0 animate-spin text-primary" />
              ) : (
                <FileText className="h-5 w-5 shrink-0 text-muted-foreground" />
              )}
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">PDF Report</p>
                <p className="text-xs text-muted-foreground">
                  Formatted document for printing or sharing
                </p>
              </div>
              <Download className="h-4 w-4 shrink-0 text-muted-foreground" />
            </button>
            <button
              type="button"
              onClick={() => onExport("csv")}
              disabled={!canExport || isExporting}
              className="flex w-full items-center gap-3 rounded-lg border border-border p-3 text-left transition-colors hover:bg-muted/50 disabled:pointer-events-none disabled:opacity-50"
              data-testid="export-format-csv"
            >
              {exportingFormat === "csv" ? (
                <Loader2 className="h-5 w-5 shrink-0 animate-spin text-primary" />
              ) : (
                <FileSpreadsheet className="h-5 w-5 shrink-0 text-muted-foreground" />
              )}
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">CSV Spreadsheet</p>
                <p className="text-xs text-muted-foreground">
                  Tabular data for spreadsheet software
                </p>
              </div>
              <Download className="h-4 w-4 shrink-0 text-muted-foreground" />
            </button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Sections</CardTitle>
          <CardDescription>Choose what to include in your export.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {availableSections.map((section) => (
              <div key={section.key} className="flex items-center gap-3">
                <Checkbox
                  id={`section-${section.key}`}
                  checked={sections.includes(section.key)}
                  onCheckedChange={() => toggleSection(section.key)}
                  disabled={section.count === 0}
                  data-testid={`export-section-${section.key}`}
                />
                <Label
                  htmlFor={`section-${section.key}`}
                  className={`flex-1 text-sm ${section.count === 0 ? "text-muted-foreground" : ""}`}
                >
                  {section.label}
                  <span className="ml-2 text-xs text-muted-foreground">
                    ({section.count} {section.count === 1 ? "item" : "items"})
                  </span>
                </Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
