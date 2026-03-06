"use client";

import { useMutation } from "convex/react";
import { AlertCircle, CheckCircle2, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

interface FollowUp {
  _id: Id<"estateCommunications">;
  recipientName: string;
  recipientOrganization?: string;
  subject: string;
  followUpDate?: number;
  followUpNotes?: string;
  followUpCompleted?: boolean;
}

interface FollowUpPanelProps {
  followUps: FollowUp[];
}

export function FollowUpPanel({ followUps }: FollowUpPanelProps) {
  const markComplete = useMutation(api.estateCommunications.markFollowUpComplete);

  if (followUps.length === 0) return null;

  const now = Date.now();
  const overdue = followUps.filter((f) => f.followUpDate && f.followUpDate < now);
  const upcoming = followUps.filter((f) => f.followUpDate && f.followUpDate >= now);

  const handleMarkComplete = async (communicationId: Id<"estateCommunications">) => {
    await markComplete({ communicationId });
  };

  return (
    <Card data-testid="follow-up-panel">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Clock className="h-4 w-4" />
          Pending Follow-ups ({followUps.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {overdue.map((fu) => (
          <div
            key={fu._id}
            className="flex items-center justify-between gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-3"
            data-testid={`followup-overdue-${fu._id}`}
          >
            <div className="flex items-start gap-2 min-w-0">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0 text-destructive" />
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{fu.recipientName}</p>
                <p className="text-xs text-muted-foreground truncate">{fu.subject}</p>
                {fu.followUpDate && (
                  <Badge variant="destructive" className="mt-1 text-xs">
                    Overdue: {new Date(fu.followUpDate).toLocaleDateString()}
                  </Badge>
                )}
                {fu.followUpNotes && (
                  <p className="text-xs text-muted-foreground mt-1">{fu.followUpNotes}</p>
                )}
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="shrink-0 h-8 gap-1"
              onClick={() => handleMarkComplete(fu._id)}
              data-testid={`followup-complete-${fu._id}`}
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              Done
            </Button>
          </div>
        ))}

        {upcoming.map((fu) => (
          <div
            key={fu._id}
            className="flex items-center justify-between gap-3 rounded-lg border p-3"
            data-testid={`followup-upcoming-${fu._id}`}
          >
            <div className="flex items-start gap-2 min-w-0">
              <Clock className="h-4 w-4 mt-0.5 shrink-0 text-muted-foreground" />
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{fu.recipientName}</p>
                <p className="text-xs text-muted-foreground truncate">{fu.subject}</p>
                {fu.followUpDate && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Due: {new Date(fu.followUpDate).toLocaleDateString()}
                  </p>
                )}
                {fu.followUpNotes && (
                  <p className="text-xs text-muted-foreground mt-1">{fu.followUpNotes}</p>
                )}
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="shrink-0 h-8 gap-1"
              onClick={() => handleMarkComplete(fu._id)}
              data-testid={`followup-complete-${fu._id}`}
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              Done
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
