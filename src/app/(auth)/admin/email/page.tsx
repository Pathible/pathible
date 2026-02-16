"use client";

import { useQuery } from "convex/react";
import {
  Activity,
  AlertCircle,
  CheckCircle2,
  Clock,
  LayoutTemplate,
  Loader2,
  Mail,
  Plus,
  Send,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { AdminPageHeader } from "@/app/(auth)/admin/components/admin-page-header";
import { StatCard } from "@/components/stat-card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api } from "@/convex/_generated/api";
import { CampaignsList } from "./components/campaigns-list";
import { EmailTemplatesList } from "./components/email-templates-list";
import { QueueStatus } from "./components/queue-status";
import { SentEmailsList } from "./components/sent-emails-list";

export default function EmailSystemPage() {
  const [activeTab, setActiveTab] = useState("templates");
  const stats = useQuery(api.adminEmail.getQueueStats);
  if (stats === undefined) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Email System"
        subtitle="The right message at the right moment"
        actions={
          <>
            <Button variant="outline" asChild>
              <Link href="/admin/email/templates/new">
                <Plus className="mr-2 h-4 w-4" />
                New Template
              </Link>
            </Button>
            <Button asChild>
              <Link href="/admin/email/compose">
                <Send className="mr-2 h-4 w-4" />
                Compose Email
              </Link>
            </Button>
          </>
        }
      />

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Clock}
          iconColor="text-muted-foreground"
          value={stats.queued}
          title="Queued"
          description="Waiting to send"
          data-testid="queued"
        />
        <StatCard
          icon={Loader2}
          iconColor="text-primary"
          value={stats.processing}
          title="Processing"
          description="Being sent now"
          data-testid="processing"
        />
        <StatCard
          icon={CheckCircle2}
          iconColor="text-primary"
          value={stats.sent}
          title="Sent"
          description="Successfully delivered"
          data-testid="sent"
        />
        <StatCard
          icon={AlertCircle}
          iconColor="text-destructive"
          value={stats.failed}
          title="Failed"
          description="Delivery failed"
          data-testid="failed"
        />
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="templates" className="gap-2">
            <LayoutTemplate className="h-4 w-4" />
            Templates
          </TabsTrigger>
          <TabsTrigger value="campaigns" className="gap-2">
            <Mail className="h-4 w-4" />
            Campaigns
          </TabsTrigger>
          <TabsTrigger value="queue" className="gap-2">
            <Activity className="h-4 w-4" />
            Queue
          </TabsTrigger>
          <TabsTrigger value="sent" className="gap-2">
            <Send className="h-4 w-4" />
            Sent
          </TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="mt-6">
          <EmailTemplatesList />
        </TabsContent>

        <TabsContent value="campaigns" className="mt-6">
          <CampaignsList />
        </TabsContent>

        <TabsContent value="queue" className="mt-6">
          <QueueStatus />
        </TabsContent>

        <TabsContent value="sent" className="mt-6">
          <SentEmailsList />
        </TabsContent>
      </Tabs>
    </div>
  );
}
