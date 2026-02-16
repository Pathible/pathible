import type { LucideIcon } from "lucide-react";
import Link from "next/link";

interface TipCardProps {
  text: string;
  icon: LucideIcon;
  route?: string;
  linkText?: string;
}

export function TipCard({ text, icon: Icon, route, linkText }: TipCardProps) {
  return (
    <div className="flex items-start gap-3 rounded-xl border-l-4 border-l-primary/30 bg-card px-5 py-4 shadow-sm">
      <Icon className="h-5 w-5 text-primary/60 shrink-0 mt-0.5" />
      <p className="text-sm text-muted-foreground flex-1">
        {text}
        {route && linkText && (
          <>
            {" "}
            <Link href={route} className="text-primary hover:underline font-medium">
              {linkText} &rarr;
            </Link>
          </>
        )}
      </p>
    </div>
  );
}
