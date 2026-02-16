import { AlertCircle, CheckCircle2, Clock, Loader2, XCircle } from "lucide-react";
import type { ReactNode } from "react";

export const QUEUE_STATUS_ICONS: Record<string, ReactNode> = {
  queued: <Clock className="h-3 w-3" />,
  processing: <Loader2 className="h-3 w-3 animate-spin" />,
  sent: <CheckCircle2 className="h-3 w-3" />,
  failed: <XCircle className="h-3 w-3" />,
};

export const CAMPAIGN_STATUS_ICONS: Record<string, ReactNode> = {
  pending: <Clock className="h-3 w-3" />,
  sending: <Loader2 className="h-3 w-3 animate-spin" />,
  completed: <CheckCircle2 className="h-3 w-3" />,
  failed: <AlertCircle className="h-3 w-3" />,
};
