"use client";

import { useState } from "react";
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

        <p className="mt-4 text-xs text-muted-foreground">
          Notification preferences are coming soon. This setting is currently for preview only.
        </p>
      </CardContent>
    </Card>
  );
}
