"use client";

import { FileSpreadsheet, FileText } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import type { ExportSection } from "@/lib/estate-export";

type ExportFormat = "pdf" | "csv";

interface ExportOptionsProps {
  format: ExportFormat;
  onFormatChange: (format: ExportFormat) => void;
  sections: ExportSection[];
  onSectionsChange: (sections: ExportSection[]) => void;
  availableSections: { key: ExportSection; label: string; count: number }[];
}

export function ExportOptions({
  format,
  onFormatChange,
  sections,
  onSectionsChange,
  availableSections,
}: ExportOptionsProps) {
  const toggleSection = (section: ExportSection) => {
    if (sections.includes(section)) {
      onSectionsChange(sections.filter((s) => s !== section));
    } else {
      onSectionsChange([...sections, section]);
    }
  };

  return (
    <div className="space-y-4" data-testid="export-options">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Export Format</CardTitle>
          <CardDescription>Choose how you want to export the data.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => onFormatChange("pdf")}
              className={`flex items-center gap-3 rounded-lg border p-3 text-left transition-colors ${
                format === "pdf" ? "border-primary bg-primary/5" : "border-border hover:bg-muted/50"
              }`}
              data-testid="export-format-pdf"
            >
              <FileText className="h-5 w-5 shrink-0 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">PDF Report</p>
                <p className="text-xs text-muted-foreground">
                  Formatted document for printing or sharing
                </p>
              </div>
            </button>
            <button
              type="button"
              onClick={() => onFormatChange("csv")}
              className={`flex items-center gap-3 rounded-lg border p-3 text-left transition-colors ${
                format === "csv" ? "border-primary bg-primary/5" : "border-border hover:bg-muted/50"
              }`}
              data-testid="export-format-csv"
            >
              <FileSpreadsheet className="h-5 w-5 shrink-0 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">CSV Spreadsheet</p>
                <p className="text-xs text-muted-foreground">
                  Tabular data for spreadsheet software
                </p>
              </div>
            </button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Sections to Include</CardTitle>
          <CardDescription>Select which sections to include in your export.</CardDescription>
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
