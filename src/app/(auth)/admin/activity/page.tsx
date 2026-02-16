"use client";

import { usePaginatedQuery, useQuery } from "convex/react";
import { Search } from "lucide-react";
import { useState } from "react";
import { AdminPageHeader } from "@/app/(auth)/admin/components/admin-page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { api } from "@/convex/_generated/api";
import { ActivityFilters } from "./activity-filters";
import { ActivityLogsTable } from "./activity-logs-table";

export default function ActivityLogsPage() {
  const [search, setSearch] = useState("");
  const [actionType, setActionType] = useState<string | undefined>(undefined);
  const [module, setModule] = useState<string | undefined>(undefined);
  const [startDate, setStartDate] = useState<number | undefined>(undefined);
  const [endDate, setEndDate] = useState<number | undefined>(undefined);

  // Fetch activity logs with pagination
  const { results, status, loadMore } = usePaginatedQuery(
    api.admin.listActivityLogs,
    {
      search: search || undefined,
      actionType,
      module,
      startDate,
      endDate,
    },
    { initialNumItems: 15 },
  );

  // Fetch counts for filter dropdowns
  const counts = useQuery(api.admin.getActionTypeCounts, {});

  const handleClearFilters = () => {
    setSearch("");
    setActionType(undefined);
    setModule(undefined);
    setStartDate(undefined);
    setEndDate(undefined);
  };

  const hasActiveFilters = Boolean(search || actionType || module || startDate || endDate);

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Activity Logs"
        subtitle="Every action is a family taking one more step"
      />

      {/* Filters */}
      <ActivityFilters
        actionType={actionType}
        setActionType={setActionType}
        module={module}
        setModule={setModule}
        startDate={startDate}
        setStartDate={setStartDate}
        endDate={endDate}
        setEndDate={setEndDate}
        onClear={handleClearFilters}
        hasActiveFilters={hasActiveFilters}
        counts={counts}
      />

      {/* Activity Table Card */}
      <Card className="border-border">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="font-crimson text-xl">User Activity</CardTitle>
              <CardDescription>Logins, content creation, and profile changes</CardDescription>
            </div>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search logs..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ActivityLogsTable results={results} status={status} loadMore={loadMore} />
        </CardContent>
      </Card>
    </div>
  );
}
