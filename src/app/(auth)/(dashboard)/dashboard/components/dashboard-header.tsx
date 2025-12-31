import { LogOut, User, Users } from "lucide-react";
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

interface DashboardHeaderProps {
  familyName?: string;
  userName?: string;
}

export function DashboardHeader({ familyName, userName }: DashboardHeaderProps) {
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
                className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-medium text-sm"
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
            <DropdownMenuItem asChild>
              <Link href="/profile-settings">
                <User className="mr-2 h-4 w-4" />
                <span>Profile Settings</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/family-preferences">
                <Users className="mr-2 h-4 w-4" />
                <span>Family Preferences</span>
              </Link>
            </DropdownMenuItem>
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
