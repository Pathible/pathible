"use client";

import { Activity, LayoutTemplate, Mail, Plus, Send } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CampaignsList } from "./components/campaigns-list";
import { EmailTemplatesList } from "./components/email-templates-list";
import { QueueStatus } from "./components/queue-status";
import { SentEmailsList } from "./components/sent-emails-list";

export default function EmailSystemPage() {
  const [activeTab, setActiveTab] = useState("templates");

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-crimson text-3xl font-semibold">Email System</h1>
          <p className="text-muted-foreground">
            Manage templates, campaigns, and monitor email delivery
          </p>
        </div>
        <div className="flex gap-2">
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
        </div>
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
