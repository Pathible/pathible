"use client";

import { Clock, FileText, FolderOpen, HardDrive } from "lucide-react";
import { StatCard } from "@/components/stat-card";

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
      <StatCard
        icon={FileText}
        iconColor="text-primary"
        value={stats.totalDocuments}
        title="Total Documents"
        description="Safe for your family"
      />
      <StatCard
        icon={HardDrive}
        iconColor="text-accent"
        value={formatBytes(stats.totalSize)}
        title="Storage Used"
        description="Your documents at a glance"
      />
      <StatCard
        icon={FolderOpen}
        iconColor="text-secondary"
        value={stats.totalCategories}
        title="Categories"
        description="Keeping things organized"
      />
      <StatCard
        icon={Clock}
        iconColor="text-muted-foreground"
        value={stats.recentUploads}
        title="Recent Uploads"
        description="Added this month"
      />
    </div>
  );
}
