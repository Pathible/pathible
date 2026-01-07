"use client";

import { useQuery } from "convex/react";
import { Loader2, Search } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

export function HouseholdsList() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const households = useQuery(api.admin.users.listHouseholds, {
    search: search || undefined,
  });

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getTierBadge = (tier: string) => {
    const styles = {
      foundations: "bg-pathible-forest/10 text-pathible-forest border-pathible-forest/20",
      heritage: "bg-pathible-sage/20 text-pathible-sage border-pathible-sage/30",
      legacy: "bg-pathible-gold/20 text-pathible-gold border-pathible-gold/30",
      founders: "bg-primary text-primary-foreground border-primary",
    };
    return styles[tier as keyof typeof styles] || "";
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      active: "bg-primary/10 text-primary border-primary/20",
      inactive: "bg-muted text-muted-foreground border-muted",
      cancelled: "bg-destructive/10 text-destructive border-destructive/20",
      past_due: "bg-amber-500/10 text-amber-700 border-amber-500/20 dark:text-amber-400",
    };
    return styles[status as keyof typeof styles] || "";
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="font-crimson text-xl">All Households</CardTitle>
          <div className="relative w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search households..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8"
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
          <div className="text-center py-8 text-muted-foreground">
            {search ? "No households match your search" : "No households found"}
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
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => {
                    router.push(`/admin/users/households/${household._id}`);
                  }}
                >
                  <TableCell className="font-medium">
                    <Link
                      href={`/admin/users/households/${household._id}`}
                      className="hover:underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {household.name}
                    </Link>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {household.primaryContactName}
                  </TableCell>
                  <TableCell>{household.memberCount}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Badge className={getTierBadge(household.subscriptionTier)}>
                        {household.subscriptionTier}
                      </Badge>
                      {household.tierOverride && (
                        <>
                          <span className="text-muted-foreground">/</span>
                          <Badge className={getTierBadge(household.tierOverride)}>
                            {household.tierOverride}
                          </Badge>
                        </>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusBadge(household.subscriptionStatus)}>
                      {household.subscriptionStatus}
                    </Badge>
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
