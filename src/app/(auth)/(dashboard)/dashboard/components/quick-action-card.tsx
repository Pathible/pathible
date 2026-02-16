import type { LucideIcon } from "lucide-react";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

interface QuickActionCardProps {
  title: string;
  description: string;
  route: string;
  icon: LucideIcon;
  ctaLabel: string;
}

export function QuickActionCard({
  title,
  description,
  route,
  icon: Icon,
  ctaLabel,
}: QuickActionCardProps) {
  return (
    <Link
      href={route}
      className="group flex flex-col rounded-xl border border-primary/20 bg-primary/5 p-2 transition-all hover:bg-primary/10 hover:shadow-md"
    >
      <div className="flex items-center gap-3 mb-2 ">
        <div className="rounded-lg bg-primary/10 p-2">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        <h4 className="font-semibold">{title}</h4>
      </div>
      <p className="text-sm text-muted-foreground flex-1 mb-4">
        {description}
        <span className="pl-2 inline-flex items-center gap-1.5 text-sm font-medium text-primary mt-auto">
          {ctaLabel}
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </span>
      </p>
    </Link>
  );
}
