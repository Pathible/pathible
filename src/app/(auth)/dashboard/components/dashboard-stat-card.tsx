"use client";

import {
  ArrowRight,
  BookOpen,
  FileText,
  Heart,
  type LucideIcon,
  Shield,
  Sparkles,
  Users,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

// Icon mapping for server-to-client serialization
const iconMap: Record<string, LucideIcon> = {
  shield: Shield,
  bookOpen: BookOpen,
  fileText: FileText,
  users: Users,
  heart: Heart,
  sparkles: Sparkles,
};

interface DashboardStatCardProps {
  href: string;
  icon: keyof typeof iconMap;
  value: string | number;
  title: string;
  description: string;
}

export function DashboardStatCard({
  href,
  icon,
  value,
  title,
  description,
}: DashboardStatCardProps) {
  const router = useRouter();
  const Icon = iconMap[icon];

  return (
    <Card
      className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-primary/50"
      onClick={() => router.push(href)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <Icon className="h-8 w-8 text-primary" />
          <ArrowRight className="h-5 w-5 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold mb-1">{value}</div>
        <CardTitle className="text-base mb-1">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardContent>
    </Card>
  );
}
