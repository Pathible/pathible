"use client";

import { Clock, FileText, FolderOpen, HardDrive } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

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
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <FileText className="h-8 w-8 text-primary" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold mb-1">{stats.totalDocuments}</div>
          <CardTitle className="text-base mb-1">Total Documents</CardTitle>
          <CardDescription>Stored securely</CardDescription>
        </CardContent>
      </Card>

      {/* Total Storage */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <HardDrive className="h-8 w-8 text-accent" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold mb-1">{formatBytes(stats.totalSize)}</div>
          <CardTitle className="text-base mb-1">Storage Used</CardTitle>
          <CardDescription>Total file size</CardDescription>
        </CardContent>
      </Card>

      {/* Categories */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <FolderOpen className="h-8 w-8 text-secondary" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold mb-1">{stats.totalCategories}</div>
          <CardTitle className="text-base mb-1">Categories</CardTitle>
          <CardDescription>Organization tags</CardDescription>
        </CardContent>
      </Card>

      {/* Recent Uploads */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <Clock className="h-8 w-8 text-muted-foreground" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold mb-1">{stats.recentUploads}</div>
          <CardTitle className="text-base mb-1">Recent Uploads</CardTitle>
          <CardDescription>Last 30 days</CardDescription>
        </CardContent>
      </Card>
    </div>
  );
}
