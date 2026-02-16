"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { AdminPageHeader } from "@/app/(auth)/admin/components/admin-page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { HouseholdsList } from "./components/households-list";
import { UsersList } from "./components/users-list";

export default function UsersAndFamiliesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get("tab") === "households" ? "households" : "users";

  const handleTabChange = (value: string) => {
    router.replace(`/admin/users${value === "households" ? "?tab=households" : ""}`, {
      scroll: false,
    });
  };

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Users & Families"
        subtitle="The families building their legacy with Pathible"
      />

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={handleTabChange}>
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
