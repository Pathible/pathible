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

export function UsersList() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const users = useQuery(api.admin.users.listUsers, { search: search || undefined });

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="font-crimson text-xl">All Users</CardTitle>
          <div className="relative w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8"
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
          <div className="text-center py-8 text-muted-foreground">
            {search ? "No users match your search" : "No users found"}
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
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => {
                    router.push(`/admin/users/${user._id}`);
                  }}
                >
                  <TableCell className="font-medium">
                    <Link
                      href={`/admin/users/${user._id}`}
                      className="hover:underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {user.firstName} {user.lastName}
                    </Link>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{user.email}</TableCell>
                  <TableCell>
                    {user.status === "active" ? (
                      <Badge className="bg-primary/10 text-primary border-primary/20">active</Badge>
                    ) : (
                      <Badge className="bg-muted text-muted-foreground">inactive</Badge>
                    )}
                  </TableCell>
                  <TableCell>{user.householdCount}</TableCell>
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
