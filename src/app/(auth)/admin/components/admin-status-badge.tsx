"use client";

import type { ComponentProps } from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  ACTIVITY_CATEGORY_STYLES,
  CAMPAIGN_STATUS_STYLES,
  CONTENT_STATUS_STYLES,
  EMAIL_STATUS_STYLES,
  ENABLED_STYLES,
  MEMBER_STATUS_STYLES,
  QUEUE_STATUS_STYLES,
  SUBSCRIPTION_STATUS_STYLES,
  TIER_STYLES,
} from "./admin-utils";

const BADGE_STYLE_MAP = {
  tier: TIER_STYLES,
  subscriptionStatus: SUBSCRIPTION_STATUS_STYLES,
  memberStatus: MEMBER_STATUS_STYLES,
  contentStatus: CONTENT_STATUS_STYLES,
  emailStatus: EMAIL_STATUS_STYLES,
  campaignStatus: CAMPAIGN_STATUS_STYLES,
  queueStatus: QUEUE_STATUS_STYLES,
  enabled: ENABLED_STYLES,
  activityCategory: ACTIVITY_CATEGORY_STYLES,
};

export type AdminBadgeType = keyof typeof BADGE_STYLE_MAP;

export interface AdminStatusBadgeProps extends ComponentProps<typeof Badge> {
  type: AdminBadgeType;
  value: string;
}

export function AdminStatusBadge({
  type,
  value,
  className,
  variant = "outline",
  children,
  ...rest
}: AdminStatusBadgeProps) {
  const style = BADGE_STYLE_MAP[type]?.[value] || "";

  return (
    <Badge variant={variant} className={cn(style, className)} {...rest}>
      {children ?? value}
    </Badge>
  );
}
