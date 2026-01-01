"use client";

import { useState } from "react";
import { ComingSoonBadge } from "@/components/coming-soon";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

interface NotificationPreferencesCardProps {
  canEdit: boolean;
}

export function NotificationPreferencesCard({ canEdit }: NotificationPreferencesCardProps) {
  const [weeklyNotifications, setWeeklyNotifications] = useState(true);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification Preferences</CardTitle>
        <CardDescription>Control how you receive family activity updates</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="weeklyNotifications">Weekly Activity Digest</Label>
            <p className="text-sm text-muted-foreground">
              Receive a weekly summary of family member activities
            </p>
          </div>
          <Switch
            id="weeklyNotifications"
            checked={weeklyNotifications}
            onCheckedChange={setWeeklyNotifications}
            disabled={!canEdit}
          />
        </div>

        <div className="mt-4 flex items-center gap-2">
          <ComingSoonBadge size="sm" />
          <p className="text-xs text-muted-foreground">
            This setting is currently for preview only.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
