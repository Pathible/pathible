"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { ArrowRight, BookMarked, BookOpen, Heart, Loader2 } from "lucide-react";
import Link from "next/link";
import { ComingSoonBadge } from "@/components/coming-soon";
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
                {comingSoon && <ComingSoonBadge size="sm" />}
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
          Let&apos;s get you set up so you can start sharing your story.
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
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <BookOpen className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold">Wisdom & Stories</h1>
        </div>
        <p className="text-muted-foreground text-lg max-w-2xl">
          Pass down your faith, not just your finances. This is where your heart lives on.
        </p>
      </div>

      {/* Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div data-tour="wisdom-create-entry">
          <NavCard
            href="/wisdom/create-entry"
            icon={<BookOpen className="h-5 w-5" />}
            title="Share Your Wisdom"
            description="Share a piece of your heart that will outlast you"
          />
        </div>

        <div data-tour="wisdom-library">
          <NavCard
            href="/wisdom/library"
            icon={<BookMarked className="h-5 w-5" />}
            title="Your Wisdom Library"
            description="Everything you've written for the ones you love"
          />
        </div>

        <div data-tour="wisdom-core-beliefs">
          <NavCard
            href="/wisdom/core-beliefs"
            icon={<Heart className="h-5 w-5" />}
            title="Core Beliefs"
            description="The truths you've built your life on, written down for generations"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <StatCard title="Your Wisdom Entries" value={stats.wisdomEntries} />
        <StatCard title="Shared with Family" value={stats.sharedWithFamily} />
      </div>
    </>
  );
}
