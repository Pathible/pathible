"use client";

import { useQuery } from "convex/react";
import { Loader2, Search, Users } from "lucide-react";
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

export function UsersList() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const users = useQuery(api.admin.users.listUsers, {
    search: search || undefined,
  });

  return (
    <Card className="border-border">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="rounded-lg bg-primary/10 p-1.5">
              <Users className="h-4 w-4 text-primary" />
            </div>
            <div>
              <CardTitle className="font-crimson text-xl">All Users</CardTitle>
              <CardDescription>People who trust Pathible with what matters</CardDescription>
            </div>
          </div>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {users === undefined ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : users.users.length === 0 ? (
          <div className="text-center py-8">
            <Users className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              {search ? "No users match your search" : "No users found"}
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Households</TableHead>
                <TableHead>Joined</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.users.map((user) => (
                <TableRow
                  key={user._id}
                  className="cursor-pointer hover:bg-muted/30"
                  onClick={() => {
                    router.push(`/admin/users/${user._id}`);
                  }}
                >
                  <TableCell className="font-medium">
                    <Link
                      href={`/admin/users/${user._id}`}
                      className="hover:text-primary hover:underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {user.firstName} {user.lastName}
                    </Link>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{user.email}</TableCell>
                  <TableCell>
                    <AdminStatusBadge type="memberStatus" value={user.status} />
                  </TableCell>
                  <TableCell className="tabular-nums">{user.householdCount}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(user._creationTime)}
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
