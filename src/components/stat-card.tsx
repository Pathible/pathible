import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface StatCardProps {
  icon: LucideIcon;
  iconColor?: string;
  value: string | number;
  title: string;
  description?: string;
  href?: string;
  progressValue?: number;
  "data-testid"?: string;
}

export function StatCard({
  icon: Icon,
  iconColor = "text-primary",
  value,
  title,
  description,
  href,
  progressValue,
  "data-testid": testId,
}: StatCardProps) {
  const content = (
    <Card
      className={`overflow-hidden py-2 ${href ? "cursor-pointer transition-shadow hover:shadow-md" : ""}`}
    >
      <CardContent className="p-3">
        <div className="flex items-center gap-3">
          <Icon className={`h-6 w-6 shrink-0 ${iconColor}`} />
          <div
            className="text-2xl font-bold"
            data-testid={testId ? `stat-value-${testId}` : undefined}
          >
            {value}
          </div>
        </div>
        <div className="mt-1">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          {description && <CardDescription className="text-xs">{description}</CardDescription>}
          {progressValue !== undefined && progressValue > 0 && (
            <Progress value={progressValue} className="mt-1.5 h-1.5" />
          )}
        </div>
      </CardContent>
    </Card>
  );

  if (href) {
    return (
      <Link href={href} className="block" data-testid={testId ? `stat-card-${testId}` : undefined}>
        {content}
      </Link>
    );
  }

  return content;
}
