"use client";

import { useMutation } from "convex/react";
import { Ban, Clock, Download, Mail, ShieldCheck, XCircle } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

type ShareStatus = "active" | "expired" | "revoked" | "exhausted";

interface ShareItem {
  _id: Id<"documentShares">;
  vaultDocumentName: string;
  recipientName: string;
  recipientEmail: string;
  recipientRole?: string;
  expiresAt: number;
  maxDownloads: number;
  downloadCount: number;
  status: ShareStatus;
  createdAt: number;
  revokedAt?: number;
}

interface ShareManagementListProps {
  shares: ShareItem[];
}

const STATUS_CONFIG: Record<
  ShareStatus,
  {
    label: string;
    variant: "default" | "secondary" | "destructive" | "outline";
    icon: typeof Clock;
  }
> = {
  active: { label: "Active", variant: "default", icon: ShieldCheck },
  expired: { label: "Expired", variant: "secondary", icon: Clock },
  revoked: { label: "Revoked", variant: "destructive", icon: XCircle },
  exhausted: { label: "Exhausted", variant: "secondary", icon: Download },
};

export function ShareManagementList({ shares }: ShareManagementListProps) {
  return (
    <div className="space-y-3" data-testid="share-management-list">
      {shares.map((share) => (
        <ShareRow key={share._id} share={share} />
      ))}
    </div>
  );
}

function ShareRow({ share }: { share: ShareItem }) {
  const [isRevoking, setIsRevoking] = useState(false);
  const revokeShare = useMutation(api.estateDocuments.revokeDocumentShare);

  const config = STATUS_CONFIG[share.status];
  const StatusIcon = config.icon;
  const isExpired = share.status === "active" && Date.now() > share.expiresAt;

  const handleRevoke = async () => {
    setIsRevoking(true);
    try {
      await revokeShare({ shareId: share._id });
    } finally {
      setIsRevoking(false);
    }
  };

  const daysUntilExpiry = Math.max(
    0,
    Math.ceil((share.expiresAt - Date.now()) / (1000 * 60 * 60 * 24)),
  );

  return (
    <div className="rounded-lg border p-4 space-y-2" data-testid={`share-item-${share._id}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="font-medium truncate">{share.vaultDocumentName}</p>
          <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
            <Mail className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">
              {share.recipientName}
              {share.recipientRole && <span className="opacity-70"> ({share.recipientRole})</span>}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">{share.recipientEmail}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Badge variant={isExpired ? "secondary" : config.variant} className="gap-1">
            <StatusIcon className="h-3 w-3" />
            {isExpired ? "Expired" : config.label}
          </Badge>
          {share.status === "active" && !isExpired && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 gap-1 text-xs text-destructive hover:text-destructive"
              onClick={handleRevoke}
              disabled={isRevoking}
              data-testid={`revoke-share-${share._id}`}
            >
              <Ban className="h-3 w-3" />
              {isRevoking ? "Revoking..." : "Revoke"}
            </Button>
          )}
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
        <span>
          Downloads: {share.downloadCount} / {share.maxDownloads}
        </span>
        {share.status === "active" && !isExpired && (
          <span>
            Expires in {daysUntilExpiry} day{daysUntilExpiry !== 1 ? "s" : ""}
          </span>
        )}
        <span>Created {new Date(share.createdAt).toLocaleDateString()}</span>
        {share.revokedAt && <span>Revoked {new Date(share.revokedAt).toLocaleDateString()}</span>}
      </div>
    </div>
  );
}
