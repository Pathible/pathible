"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { HouseholdsList } from "./components/households-list";
import { UsersList } from "./components/users-list";

export default function UsersAndFamiliesPage() {
  const [activeTab, setActiveTab] = useState("users");

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="font-crimson text-3xl font-semibold">Users & Families</h1>
        <p className="text-muted-foreground">Manage users and household memberships</p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="households">Households</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="mt-6">
          <UsersList />
        </TabsContent>

        <TabsContent value="households" className="mt-6">
          <HouseholdsList />
        </TabsContent>
      </Tabs>
    </div>
  );
}
