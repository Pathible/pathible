"use client";

import { CheckCircle2, Circle, FileText, Landmark, Mail, Package } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { EstateSummaryData, ExportSection } from "@/lib/estate-export";
import { formatLabel } from "@/lib/estate-export";

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

interface ExportPreviewProps {
  data: EstateSummaryData;
  sections: ExportSection[];
}

export function ExportPreview({ data, sections }: ExportPreviewProps) {
  const hasContent = sections.length > 0;

  if (!hasContent) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">
            Select at least one section to preview the export.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4" data-testid="export-preview">
      {/* Estate Overview - always shown */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Estate of {data.activation.deceasedName}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="text-muted-foreground">Status</div>
            <div>{formatLabel(data.activation.status)}</div>
            <div className="text-muted-foreground">Executor</div>
            <div>{data.executorName}</div>
            {data.activation.dateOfDeath && (
              <>
                <div className="text-muted-foreground">Date of Death</div>
                <div>{formatDate(data.activation.dateOfDeath)}</div>
              </>
            )}
            <div className="text-muted-foreground">Activated</div>
            <div>{formatDate(data.activation.activatedAt)}</div>
          </div>
        </CardContent>
      </Card>

      {/* Checklist Preview */}
      {sections.includes("checklist") && data.checklistItems.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-base">
                Checklist ({data.checklistItems.filter((i) => i.isCompleted).length}/
                {data.checklistItems.length})
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="max-h-48 space-y-1 overflow-y-auto text-sm">
              {data.checklistItems.slice(0, 10).map((item) => (
                <div key={`${item.category}-${item.title}`} className="flex items-center gap-2">
                  {item.isCompleted ? (
                    <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-primary" />
                  ) : (
                    <Circle className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  )}
                  <span className={item.isCompleted ? "text-muted-foreground line-through" : ""}>
                    {item.title}
                  </span>
                </div>
              ))}
              {data.checklistItems.length > 10 && (
                <p className="pt-1 text-xs text-muted-foreground">
                  ... and {data.checklistItems.length - 10} more items
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Assets Preview */}
      {sections.includes("assets") && data.assets.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-base">Assets ({data.assets.length})</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="max-h-48 space-y-2 overflow-y-auto text-sm">
              {data.assets.slice(0, 8).map((asset) => (
                <div
                  key={`${asset.category}-${asset.name}`}
                  className="flex items-center justify-between"
                >
                  <div>
                    <span className="font-medium">{asset.name}</span>
                    <span className="ml-2 text-xs text-muted-foreground">
                      {formatLabel(asset.category)}
                    </span>
                  </div>
                  {asset.estimatedValue != null && (
                    <span className="text-xs font-medium">
                      {formatCurrency(asset.estimatedValue)}
                    </span>
                  )}
                </div>
              ))}
              {data.assets.length > 8 && (
                <p className="pt-1 text-xs text-muted-foreground">
                  ... and {data.assets.length - 8} more assets
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Communications Preview */}
      {sections.includes("communications") && data.communications.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-base">
                Communications ({data.communications.length})
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="max-h-48 space-y-2 overflow-y-auto text-sm">
              {data.communications.slice(0, 6).map((comm) => (
                <div
                  key={`${comm.communicationDate}-${comm.recipientName}`}
                  className="flex items-center justify-between"
                >
                  <div>
                    <span className="font-medium">{comm.recipientName}</span>
                    <span className="ml-2 text-xs text-muted-foreground">{comm.subject}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {formatDate(comm.communicationDate)}
                  </span>
                </div>
              ))}
              {data.communications.length > 6 && (
                <p className="pt-1 text-xs text-muted-foreground">
                  ... and {data.communications.length - 6} more entries
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Distributions Preview */}
      {sections.includes("distributions") && data.distributions.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Landmark className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-base">
                Distributions ({data.distributions.length})
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="max-h-48 space-y-2 overflow-y-auto text-sm">
              {data.distributions.slice(0, 6).map((dist) => (
                <div
                  key={`${dist.distributionDate}-${dist.beneficiaryName}`}
                  className="flex items-center justify-between"
                >
                  <div>
                    <span className="font-medium">{dist.beneficiaryName}</span>
                    {dist.description && (
                      <span className="ml-2 text-xs text-muted-foreground">{dist.description}</span>
                    )}
                  </div>
                  {dist.value != null && (
                    <span className="text-xs font-medium">{formatCurrency(dist.value)}</span>
                  )}
                </div>
              ))}
              {data.distributions.length > 6 && (
                <p className="pt-1 text-xs text-muted-foreground">
                  ... and {data.distributions.length - 6} more distributions
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Guidance Tips */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="py-4">
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-2">
              <FileText className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <div>
                <p className="font-medium">What to bring to your attorney</p>
                <p className="text-muted-foreground">
                  The PDF report includes all sections and is ideal for attorney meetings. Select
                  all sections for a complete overview.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <FileText className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <div>
                <p className="font-medium">What your accountant needs</p>
                <p className="text-muted-foreground">
                  Export the Assets and Distributions sections as CSV for easy import into
                  accounting software.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
