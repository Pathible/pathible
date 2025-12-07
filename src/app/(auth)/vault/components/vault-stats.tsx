"use client";

import { Clock, FileText, FolderOpen, HardDrive } from "lucide-react";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";

interface VaultStatsProps {
  stats: {
    totalDocuments: number;
    totalSize: number;
    totalCategories: number;
    recentUploads: number;
  };
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${Math.round((bytes / k ** i) * 100) / 100} ${sizes[i]}`;
}

export function VaultStats({ stats }: VaultStatsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Documents */}
      <Card className="py-2">
        <CardContent className="p-3">
          <div className="flex items-center gap-3">
            <FileText className="h-6 w-6 text-primary shrink-0" />
            <div className="text-2xl font-bold">{stats.totalDocuments}</div>
          </div>
          <div className="mt-1">
            <CardTitle className="text-sm font-medium">Total Documents</CardTitle>
            <CardDescription className="text-xs">Stored securely</CardDescription>
          </div>
        </CardContent>
      </Card>

      {/* Total Storage */}
      <Card className="py-2">
        <CardContent className="p-3">
          <div className="flex items-center gap-3">
            <HardDrive className="h-6 w-6 text-accent shrink-0" />
            <div className="text-2xl font-bold">{formatBytes(stats.totalSize)}</div>
          </div>
          <div className="mt-1">
            <CardTitle className="text-sm font-medium">Storage Used</CardTitle>
            <CardDescription className="text-xs">Total file size</CardDescription>
          </div>
        </CardContent>
      </Card>

      {/* Categories */}
      <Card className="py-2">
        <CardContent className="p-3">
          <div className="flex items-center gap-3">
            <FolderOpen className="h-6 w-6 text-secondary shrink-0" />
            <div className="text-2xl font-bold">{stats.totalCategories}</div>
          </div>
          <div className="mt-1">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
            <CardDescription className="text-xs">Organization tags</CardDescription>
          </div>
        </CardContent>
      </Card>

      {/* Recent Uploads */}
      <Card className="py-2">
        <CardContent className="p-3">
          <div className="flex items-center gap-3">
            <Clock className="h-6 w-6 text-muted-foreground shrink-0" />
            <div className="text-2xl font-bold">{stats.recentUploads}</div>
          </div>
          <div className="mt-1">
            <CardTitle className="text-sm font-medium">Recent Uploads</CardTitle>
            <CardDescription className="text-xs">Last 30 days</CardDescription>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
