import type { LucideIcon } from "lucide-react";
import { HelpCircle, LogOut, User, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface HeaderMenuItem {
  label: string;
  href: string;
  icon: LucideIcon;
  testId?: string;
}

const defaultMenuItems: HeaderMenuItem[] = [
  { label: "Profile Settings", href: "/profile-settings", icon: User },
  { label: "Family Preferences", href: "/family-preferences", icon: Users },
  { label: "Help Center", href: "/help", icon: HelpCircle },
];

interface DashboardHeaderProps {
  familyName?: string;
  userName?: string;
  menuItems?: HeaderMenuItem[];
}

export function DashboardHeader({ familyName, userName, menuItems }: DashboardHeaderProps) {
  const items = menuItems ?? defaultMenuItems;

  return (
    <header className="flex items-center justify-between w-full">
      <div className="flex items-center gap-4">
        <Image
          src="/pathible-logo.svg"
          alt="Pathible"
          width={120}
          height={40}
          className="h-12 w-auto"
          priority
        />
        {familyName && (
          <span className="text-sm text-muted-foreground hidden sm:inline">{familyName}</span>
        )}
      </div>

      <div className="flex items-center gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="flex items-center gap-2 h-10"
              data-testid="user-menu-trigger"
            >
              <div
                className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-foreground font-medium text-sm"
                data-testid="user-avatar"
              >
                {userName
                  ?.split(" ")
                  .map((n) => n[0])
                  .join("")}
              </div>
              <span className="text-sm font-medium hidden sm:inline">{userName}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56" data-testid="user-menu">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {items.map((item) => (
              <DropdownMenuItem key={item.href} asChild>
                <Link href={item.href} data-testid={item.testId}>
                  <item.icon className="mr-2 h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild className="text-destructive">
              <Link href="/sign-out" data-testid="sign-out-link">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sign Out</span>
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
