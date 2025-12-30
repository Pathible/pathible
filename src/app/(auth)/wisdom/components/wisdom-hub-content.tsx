"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { ArrowRight, BookOpen, Heart, Loader2 } from "lucide-react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { api } from "@/convex/_generated/api";

interface NavCardProps {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  disabled?: boolean;
  comingSoon?: boolean;
}

function NavCard({ href, icon, title, description, disabled, comingSoon }: NavCardProps) {
  const content = (
    <Card
      className={`h-full transition-all ${
        disabled
          ? "opacity-60 cursor-not-allowed"
          : "hover:shadow-md hover:border-primary/30 cursor-pointer"
      }`}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">{icon}</div>
            <div>
              <h3 className="font-semibold text-lg flex items-center gap-2">
                {title}
                {comingSoon && (
                  <span className="text-xs font-normal text-muted-foreground bg-muted px-2 py-0.5 rounded">
                    Coming Soon
                  </span>
                )}
              </h3>
              <p className="text-muted-foreground text-sm mt-1">{description}</p>
            </div>
          </div>
          <ArrowRight className="h-5 w-5 text-muted-foreground" />
        </div>
      </CardContent>
    </Card>
  );

  if (disabled) {
    return <div className="block">{content}</div>;
  }

  return (
    <Link href={href} className="block">
      {content}
    </Link>
  );
}

interface StatCardProps {
  title: string;
  value: number;
}

function StatCard({ title, value }: StatCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <p className="text-muted-foreground text-sm">{title}</p>
        <p className="text-3xl font-bold mt-1">{value}</p>
      </CardContent>
    </Card>
  );
}

export function WisdomHubContent() {
  const { user, isLoaded: isUserLoaded } = useUser();

  // Get user's households
  const households = useQuery(api.households.list, isUserLoaded && user ? {} : "skip");

  const householdId = households?.[0]?._id;

  // Get wisdom stats
  const wisdomStats = useQuery(api.wisdom.getStats, householdId ? { householdId } : "skip");

  // Loading state
  if (!isUserLoaded || households === undefined) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // No household state
  if (!householdId) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">
          Please complete your profile setup to access Wisdom & Education.
        </p>
      </div>
    );
  }

  const stats = {
    wisdomEntries: wisdomStats?.totalEntries ?? 0,
    sharedWithFamily: wisdomStats?.publishedEntries ?? 0,
  };

  return (
    <>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Wisdom & Education</h1>
        <p className="text-muted-foreground text-lg max-w-2xl">
          A sacred space to capture the lessons, beliefs, and heartfelt words that form the
          foundation of your legacy.
        </p>
      </div>

      {/* Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <NavCard
          href="/wisdom/create-entry"
          icon={<BookOpen className="h-5 w-5" />}
          title="Create Wisdom Entry"
          description="Capture a life lesson, memory, or insight to preserve for generations"
        />

        <NavCard
          href="/wisdom/library"
          icon={<Heart className="h-5 w-5" />}
          title="Wisdom Library"
          description="View and manage all your saved wisdom entries"
        />

        <NavCard
          href="/wisdom/core-beliefs"
          icon={<Heart className="h-5 w-5" />}
          title="Core Beliefs"
          description="Define the fundamental beliefs and values that guide your life"
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <StatCard title="Your Wisdom Entries" value={stats.wisdomEntries} />
        <StatCard title="Shared with Family" value={stats.sharedWithFamily} />
      </div>
    </>
  );
}
