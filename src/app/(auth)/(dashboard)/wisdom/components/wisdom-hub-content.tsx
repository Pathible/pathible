"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { ArrowRight, BookOpen, Heart, Lightbulb, Loader2, PenLine, Users } from "lucide-react";
import Link from "next/link";
import { StatCard } from "@/components/stat-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { api } from "@/convex/_generated/api";
import { useEstateMode } from "@/hooks/use-estate-mode";
import { QuickActionCard } from "../../dashboard/components/quick-action-card";
import { TipCard } from "../../dashboard/components/tip-card";

export function WisdomHubContent() {
  const { user, isLoaded: isUserLoaded } = useUser();
  const { isEstateMode } = useEstateMode();

  const households = useQuery(api.households.list, isUserLoaded && user ? {} : "skip");
  const householdId = households?.[0]?._id;

  const wisdomStats = useQuery(api.wisdom.getStats, householdId ? { householdId } : "skip");
  const recentEntries = useQuery(api.wisdom.list, householdId ? { householdId } : "skip");
  const coreBeliefsData = useQuery(api.coreBeliefs.list, householdId ? { householdId } : "skip");

  if (!isUserLoaded || households === undefined) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

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

  const entries = recentEntries ?? [];
  const previewEntries = entries.slice(0, 3);
  const beliefs = coreBeliefsData?.beliefs ?? [];
  const previewBeliefs = beliefs.slice(0, 3);

  return (
    <>
      {/* Header - matches vault, financial, family, legacy pattern */}
      <div className="mb-8" data-testid="wisdom-hub-heading">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-lg bg-primary/10">
            <BookOpen className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold">Wisdom & Stories</h1>
        </div>
        <p className="text-muted-foreground text-lg">
          Your grandchildren deserve to know you. Pass down your faith, your stories, and the
          lessons that shaped who you are.
        </p>
      </div>

      {/* Journey Progress - top position so users see where they stand */}
      <div className="mb-8">
        <div
          className={`grid grid-cols-1 ${isEstateMode ? "md:grid-cols-2" : "md:grid-cols-3"} gap-4`}
        >
          {!isEstateMode && (
            <QuickActionCard
              title="Write Something Today"
              description="A story, a lesson, a piece of advice - whatever is on your heart."
              route="/wisdom/create-entry"
              icon={PenLine}
              ctaLabel="Start writing"
            />
          )}
          <StatCard
            icon={BookOpen}
            iconColor="text-primary"
            value={stats.wisdomEntries === 0 ? "\u2014" : stats.wisdomEntries}
            title="Stories Preserved"
            description={
              stats.wisdomEntries === 0
                ? "Your first story is waiting to be written"
                : "Stories and lessons you've shared"
            }
            href="/wisdom/library"
          />
          <StatCard
            icon={Users}
            iconColor="text-secondary"
            value={stats.sharedWithFamily === 0 ? "\u2014" : stats.sharedWithFamily}
            title="Shared with Family"
            description={
              stats.sharedWithFamily === 0
                ? "Publish entries to share with loved ones"
                : "Available to your loved ones"
            }
            href="/wisdom/library"
          />
        </div>
      </div>

      {/* Your Stories section */}
      <div className="mb-8" data-tour="wisdom-library">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Your Stories</h2>
          {entries.length > 0 && (
            <Link
              href="/wisdom/library"
              className="inline-flex items-center gap-1 text-sm text-primary hover:underline font-medium"
            >
              View all
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          )}
        </div>

        {recentEntries === undefined ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="h-32">
                <CardContent className="p-4">
                  <div className="h-4 w-3/4 bg-muted animate-pulse rounded mb-3" />
                  <div className="h-3 w-full bg-muted animate-pulse rounded mb-2" />
                  <div className="h-3 w-2/3 bg-muted animate-pulse rounded" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : entries.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="p-8 text-center">
              <BookOpen className="h-10 w-10 mx-auto text-muted-foreground/50 mb-3" />
              <p className="font-medium mb-1">
                {isEstateMode
                  ? "No stories have been shared yet"
                  : "Your family is waiting to hear from you"}
              </p>
              {!isEstateMode && (
                <>
                  <p className="text-sm text-muted-foreground mb-4">
                    The stories only you can tell &mdash; start with one.
                  </p>
                  <Button asChild>
                    <Link href="/wisdom/create-entry">Write Your First Story</Link>
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {previewEntries.map((entry) => (
              <Link key={entry._id} href={`/wisdom/library/${entry._id}`} className="block">
                <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-1 line-clamp-1">{entry.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-3">{entry.content}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Core Beliefs section */}
      <div className="mb-8" data-tour="wisdom-core-beliefs">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Core Beliefs</h2>
          {beliefs.length > 0 && (
            <Link
              href="/wisdom/core-beliefs"
              className="inline-flex items-center gap-1 text-sm text-primary hover:underline font-medium"
            >
              View all
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          )}
        </div>

        {coreBeliefsData === undefined ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <div className="h-4 w-2/3 bg-muted animate-pulse rounded" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : beliefs.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="p-8 text-center">
              <Heart className="h-10 w-10 mx-auto text-muted-foreground/50 mb-3" />
              <p className="font-medium mb-1">
                {isEstateMode ? "No core beliefs have been defined yet" : "What do you stand for?"}
              </p>
              {!isEstateMode && (
                <>
                  <p className="text-sm text-muted-foreground mb-4">
                    The convictions that shaped your life, written down for generations.
                  </p>
                  <Button asChild>
                    <Link href="/wisdom/core-beliefs">Define Your First Belief</Link>
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {previewBeliefs.map((belief) => (
              <Link key={belief._id} href="/wisdom/core-beliefs" className="block">
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-4">
                    <p className="font-medium">{belief.statement}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Contextual tip - only when no entries and not in estate mode */}
      {stats.wisdomEntries === 0 && !isEstateMode && (
        <TipCard
          icon={Lightbulb}
          text="Start with something simple. What's one piece of advice you'd want your grandchildren to know?"
          route="/wisdom/create-entry"
          linkText="Write it now"
        />
      )}
    </>
  );
}
