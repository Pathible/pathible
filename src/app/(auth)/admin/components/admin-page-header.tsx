import type { ReactNode } from "react";

interface AdminPageHeaderProps {
  title: string;
  subtitle: string;
  actions?: ReactNode;
}

export function AdminPageHeader({ title, subtitle, actions }: AdminPageHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <h1 className="font-crimson text-3xl sm:text-4xl font-semibold tracking-tight">{title}</h1>
        <p className="text-muted-foreground mt-1 font-crimson text-lg">{subtitle}</p>
      </div>
      {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
    </div>
  );
}
