"use client";

import { Button } from "@/components/ui/button";

interface ScrollButtonProps {
  targetId: string;
  children: React.ReactNode;
  className?: string;
  size?: "default" | "sm" | "lg" | "icon";
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
}

export function ScrollButton({
  targetId,
  children,
  className,
  size = "default",
  variant = "outline",
}: ScrollButtonProps) {
  const handleClick = () => {
    document.getElementById(targetId)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <Button
      size={size}
      variant={variant}
      className={className}
      onClick={handleClick}
    >
      {children}
    </Button>
  );
}
