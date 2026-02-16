"use client";

import { useQuery } from "convex/react";
import { Home, Loader2, Search } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AdminStatusBadge } from "@/app/(auth)/admin/components/admin-status-badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { api } from "@/convex/_generated/api";
import { formatDate } from "@/lib/date-utils";

export function HouseholdsList() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const households = useQuery(api.admin.users.listHouseholds, {
    search: search || undefined,
  });

  return (
    <Card className="border-border">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="rounded-lg bg-accent/10 p-1.5">
              <Home className="h-4 w-4 text-accent" />
            </div>
            <div>
              <CardTitle className="font-crimson text-xl">All Households</CardTitle>
              <CardDescription>Homes being organized with Pathible</CardDescription>
            </div>
          </div>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search households..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {households === undefined ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : households.households.length === 0 ? (
          <div className="text-center py-8">
            <Home className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              {search ? "No households match your search" : "No households found"}
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Primary Contact</TableHead>
                <TableHead>Members</TableHead>
                <TableHead>Tier</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {households.households.map((household) => (
                <TableRow
                  key={household._id}
                  className="cursor-pointer hover:bg-muted/30"
                  onClick={() => {
                    router.push(`/admin/users/households/${household._id}`);
                  }}
                >
                  <TableCell className="font-medium">
                    <Link
                      href={`/admin/users/households/${household._id}`}
                      className="hover:text-primary hover:underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {household.name}
                    </Link>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {household.primaryContactName}
                  </TableCell>
                  <TableCell className="tabular-nums">{household.memberCount}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <AdminStatusBadge type="tier" value={household.subscriptionTier} />
                      {household.tierOverride && (
                        <>
                          <span className="text-muted-foreground/40">/</span>
                          <AdminStatusBadge type="tier" value={household.tierOverride} />
                        </>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <AdminStatusBadge
                      type="subscriptionStatus"
                      value={household.subscriptionStatus}
                    />
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(household._creationTime)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
