"use client";

import { Activity, FileText, Key, Mail, TrendingUp, Users } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: "increase" | "decrease" | "neutral";
  icon: React.ReactNode;
}

function StatCard({ title, value, change, changeType = "neutral", icon }: StatCardProps) {
  const changeColor =
    changeType === "increase"
      ? "text-primary"
      : changeType === "decrease"
        ? "text-destructive"
        : "text-muted-foreground";

  return (
    <Card className="border-border">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="font-crimson text-3xl font-semibold">{value}</p>
            {change && (
              <p className={`flex items-center gap-1 text-sm ${changeColor}`}>
                {changeType === "increase" && <TrendingUp className="h-3 w-3" />}
                {change}
              </p>
            )}
          </div>
          <div className="text-muted-foreground">{icon}</div>
        </div>
      </CardContent>
    </Card>
  );
}

interface ActivityItem {
  id: string;
  action: string;
  email: string;
  timestamp: string;
}

interface LegacyRequest {
  id: string;
  title: string;
  requestedBy: string;
  status: string;
  statusColor: "pending" | "review" | "completed";
}

const mockActivity: ActivityItem[] = [
  {
    id: "1",
    action: "New user signup",
    email: "sarah.miller@email.com",
    timestamp: "2 minutes ago",
  },
  {
    id: "2",
    action: "Wisdom entry created",
    email: "john.doe@email.com",
    timestamp: "15 minutes ago",
  },
  {
    id: "3",
    action: "Legacy access requested",
    email: "family.smith@email.com",
    timestamp: "1 hour ago",
  },
  {
    id: "4",
    action: "Household created",
    email: "maria.garcia@email.com",
    timestamp: "2 hours ago",
  },
  {
    id: "5",
    action: "Letter sent to family",
    email: "robert.wilson@email.com",
    timestamp: "3 hours ago",
  },
];

const mockLegacyRequests: LegacyRequest[] = [
  {
    id: "1",
    title: "Smith Family - Legacy Access",
    requestedBy: "jane.smith@email.com",
    status: "Document verification pending",
    statusColor: "pending",
  },
  {
    id: "2",
    title: "Johnson Household - Beneficiary Activation",
    requestedBy: "Pre-designated beneficiary request",
    status: "Awaiting review",
    statusColor: "review",
  },
  {
    id: "3",
    title: "Williams Family - Access Granted",
    requestedBy: "Completed: 2 days ago",
    status: "Active",
    statusColor: "completed",
  },
];

function RecentActivity({ items }: { items: ActivityItem[] }) {
  return (
    <Card className="border-border">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary" />
          <CardTitle className="font-crimson text-xl">Recent Activity</CardTitle>
        </div>
        <CardDescription>Latest user actions across the platform</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-start justify-between border-b border-border pb-4 last:border-0 last:pb-0"
            >
              <div>
                <p className="font-medium">{item.action}</p>
                <p className="text-sm text-muted-foreground">{item.email}</p>
              </div>
              <span className="text-sm text-muted-foreground">{item.timestamp}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function PendingLegacyRequests({ requests }: { requests: LegacyRequest[] }) {
  const getStatusStyles = (statusColor: LegacyRequest["statusColor"]) => {
    switch (statusColor) {
      case "pending":
        return "bg-amber-50 border-amber-200";
      case "review":
        return "bg-amber-50 border-amber-200";
      case "completed":
        return "bg-primary/5 border-primary/20";
      default:
        return "bg-muted border-border";
    }
  };

  return (
    <Card className="border-border">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Key className="h-5 w-5 text-primary" />
          <CardTitle className="font-crimson text-xl">Pending Legacy Requests</CardTitle>
        </div>
        <CardDescription>Requests requiring admin attention</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {requests.map((request) => (
            <div
              key={request.id}
              className={`rounded-lg border p-4 ${getStatusStyles(request.statusColor)}`}
            >
              <p className="font-medium">{request.title}</p>
              <p className="text-sm text-muted-foreground">Requested by: {request.requestedBy}</p>
              <p className="text-sm text-muted-foreground">Status: {request.status}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function AdminDashboard() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="font-crimson text-3xl font-semibold">Admin Dashboard</h1>
        <p className="text-muted-foreground">Overview of platform activity and metrics</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Active Users"
          value="1,284"
          change="+12%"
          changeType="increase"
          icon={<Users className="h-5 w-5" />}
        />
        <StatCard
          title="Content Created"
          value="3,847"
          change="+8%"
          changeType="increase"
          icon={<FileText className="h-5 w-5" />}
        />
        <StatCard
          title="Emails Sent"
          value="892"
          change="+23%"
          changeType="increase"
          icon={<Mail className="h-5 w-5" />}
        />
        <StatCard
          title="Legacy Requests"
          value="12"
          change="3 pending"
          changeType="neutral"
          icon={<Key className="h-5 w-5" />}
        />
      </div>

      {/* Activity and Requests Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        <RecentActivity items={mockActivity} />
        <PendingLegacyRequests requests={mockLegacyRequests} />
      </div>
    </div>
  );
}
