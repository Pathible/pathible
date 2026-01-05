"use client";

import { Plus, Send } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmailTemplatesList } from "./components/email-templates-list";
import { SentEmailsList } from "./components/sent-emails-list";

export default function EmailSystemPage() {
  const [activeTab, setActiveTab] = useState("templates");

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-crimson text-3xl font-semibold">Email System</h1>
          <p className="text-muted-foreground">Manage email templates and send communications</p>
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
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="sent">Sent Emails</TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="mt-6">
          <EmailTemplatesList />
        </TabsContent>

        <TabsContent value="sent" className="mt-6">
          <SentEmailsList />
        </TabsContent>
      </Tabs>
    </div>
  );
}
