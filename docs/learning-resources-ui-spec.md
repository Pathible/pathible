# Faith & Finances Learning Resources - UI Design Specification

## Design Overview

This specification defines the UI design for the "Faith & Finances" Learning Resources section, a stage-based educational experience that guides users through their legacy planning journey with faith-centered content.

**Design Philosophy:**
- Calming, peaceful aesthetic aligned with faith-based audiences
- Purposeful whitespace creating visual breathing room
- Gentle, encouraging language throughout
- Non-gamified progress tracking (subtle, not competitive)
- Stage-based organization reflecting the user's journey

---

## 1. Color Palette & Design Tokens

Building on Pathible's existing design system:

```css
/* Primary Colors (existing) */
--primary: 130 25% 39%;          /* Forest green #4B7F52 */
--secondary: 135 17% 56%;        /* Sage green #7BA083 */
--accent: 46 65% 52%;            /* Rich gold #D4AF37 */
--background: 36 33% 95%;        /* Warm sand #F6F4F1 */

/* Learning Resources Specific */
--learning-featured-bg: 130 25% 95%;     /* Very light forest green */
--learning-stage-1: 130 25% 39%;         /* Forest (Understanding) */
--learning-stage-2: 135 17% 56%;         /* Sage (Building) */
--learning-stage-3: 46 65% 52%;          /* Gold (Strengthening) */
--learning-read-opacity: 0.6;            /* Read article opacity */
--learning-card-hover: 130 25% 97%;      /* Subtle hover state */
```

---

## 2. Page Structure & Layout

### Container
```tsx
<div className="px-6 py-8 max-w-screen-2xl mx-auto">
  {/* Content */}
</div>
```

### Overall Hierarchy
1. Hero Section with Featured Article
2. Progress Indicator (simple text)
3. Stage Sections (3 collapsible on mobile)
4. Each stage contains article cards

---

## 3. Hero / Featured Section

### Design Intent
The hero prominently features the "Start Here" article, creating an obvious entry point. It should feel inviting, not overwhelming.

### Component Structure

```tsx
// /src/components/learning/LearningHero.tsx

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, Clock, ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";

interface LearningHeroProps {
  featuredArticle: {
    title: string;
    excerpt: string;
    readTimeMinutes: number;
    slug: string;
    isRead: boolean;
  };
  totalArticles: number;
  readCount: number;
}

export function LearningHero({ featuredArticle, totalArticles, readCount }: LearningHeroProps) {
  return (
    <section className="mb-12">
      {/* Welcome Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <BookOpen className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold font-crimson">
            Faith & Finances
          </h1>
        </div>
        <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed">
          Biblical wisdom for building a legacy that honors God and blesses your family.
          Take your time - these resources are here whenever you're ready.
        </p>
      </div>

      {/* Featured "Start Here" Card */}
      <Link href={`/financial/articles/${featuredArticle.slug}`}>
        <Card className={`
          relative overflow-hidden
          bg-gradient-to-br from-primary/5 via-transparent to-accent/5
          border-primary/20
          hover:border-primary/40 hover:shadow-lg
          transition-all duration-300
          ${featuredArticle.isRead ? 'opacity-80' : ''}
        `}>
          {/* Decorative accent */}
          <div className="absolute top-0 left-0 w-1 h-full bg-primary" />

          <CardHeader className="pb-4">
            <div className="flex items-center gap-2 mb-2">
              <Badge className="bg-primary/10 text-primary border-0 font-medium">
                <Sparkles className="h-3 w-3 mr-1" />
                Start Here
              </Badge>
              {featuredArticle.isRead && (
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <CheckCircle className="h-3 w-3 text-primary" />
                  Read
                </span>
              )}
            </div>
            <CardTitle className="text-2xl md:text-3xl font-crimson leading-tight">
              {featuredArticle.title}
            </CardTitle>
            <CardDescription className="text-base mt-2 leading-relaxed">
              {featuredArticle.excerpt}
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>{featuredArticle.readTimeMinutes} min read</span>
              </div>
              <Button variant="ghost" className="text-primary hover:text-primary hover:bg-primary/10">
                Begin Reading
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </Link>

      {/* Simple Progress Text */}
      <div className="mt-6 text-center">
        <p className="text-sm text-muted-foreground">
          You've read <span className="font-medium text-foreground">{readCount}</span> of{" "}
          <span className="font-medium text-foreground">{totalArticles}</span> articles
        </p>
      </div>
    </section>
  );
}
```

### Visual Specifications

| Element | Tailwind Classes | Notes |
|---------|------------------|-------|
| Hero Container | `mb-12` | Generous bottom margin |
| Welcome Header | `mb-8` | Breathing room before featured card |
| Page Title | `text-3xl md:text-4xl font-bold font-crimson` | Uses Crimson font for headings |
| Subtitle | `text-lg text-muted-foreground max-w-2xl leading-relaxed` | Constrained width, relaxed line height |
| Featured Card | `bg-gradient-to-br from-primary/5 via-transparent to-accent/5` | Subtle gradient |
| Start Badge | `bg-primary/10 text-primary border-0` | Soft, not attention-grabbing |
| Progress Text | `text-sm text-muted-foreground` | Understated progress indication |

---

## 4. Stage-Based Layout

### Design Intent
Three stages represent the user's journey. On desktop, stages are always visible. On mobile, stages collapse into accordion sections.

### Stage Configuration

```typescript
const LEARNING_STAGES = [
  {
    id: "understanding",
    number: 1,
    title: "Understanding Your Why",
    subtitle: "Building the right mindset",
    icon: Heart,
    accentColor: "primary", // Forest green
    articles: [/* 2 articles */]
  },
  {
    id: "building",
    number: 2,
    title: "Building Your Foundation",
    subtitle: "Practical steps forward",
    icon: Blocks,
    accentColor: "secondary", // Sage green
    articles: [/* 3 articles */]
  },
  {
    id: "strengthening",
    number: 3,
    title: "Strengthening Your Legacy",
    subtitle: "Advanced planning & relationships",
    icon: Sparkles,
    accentColor: "accent", // Gold
    articles: [/* 3 articles */]
  }
];
```

### Desktop Layout Component

```tsx
// /src/components/learning/LearningStages.tsx

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, Blocks, Sparkles } from "lucide-react";

interface LearningStagesProps {
  stages: Stage[];
  readArticles: Set<string>;
}

export function LearningStages({ stages, readArticles }: LearningStagesProps) {
  return (
    <section className="space-y-10">
      {stages.map((stage, index) => (
        <StageSection
          key={stage.id}
          stage={stage}
          readArticles={readArticles}
          animationDelay={index * 100}
        />
      ))}
    </section>
  );
}

function StageSection({ stage, readArticles, animationDelay }: StageSectionProps) {
  const StageIcon = stage.icon;
  const readCount = stage.articles.filter(a => readArticles.has(a.slug)).length;

  // Dynamic accent color based on stage
  const accentStyles = {
    primary: "border-l-primary bg-primary/5",
    secondary: "border-l-secondary bg-secondary/5",
    accent: "border-l-accent bg-accent/5"
  };

  return (
    <div
      className="animate-fade-in-up"
      style={{ animationDelay: `${animationDelay}ms` }}
    >
      {/* Stage Header */}
      <div className="flex items-center gap-4 mb-6">
        <div className={`
          flex items-center justify-center
          w-10 h-10 rounded-full
          bg-${stage.accentColor}/10
          text-${stage.accentColor}
        `}>
          <StageIcon className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Stage {stage.number}
            </span>
            <span className="text-xs text-muted-foreground">
              ({readCount}/{stage.articles.length} read)
            </span>
          </div>
          <h2 className="text-xl md:text-2xl font-semibold font-crimson">
            {stage.title}
          </h2>
          <p className="text-sm text-muted-foreground">
            {stage.subtitle}
          </p>
        </div>
      </div>

      {/* Article Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {stage.articles.map((article) => (
          <ArticleCard
            key={article.slug}
            article={article}
            isRead={readArticles.has(article.slug)}
            accentColor={stage.accentColor}
          />
        ))}
      </div>
    </div>
  );
}
```

### Mobile Accordion Layout

```tsx
// /src/components/learning/LearningStagesMobile.tsx

"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export function LearningStagesMobile({ stages, readArticles }: LearningStagesProps) {
  return (
    <Accordion type="single" collapsible defaultValue="understanding" className="space-y-4">
      {stages.map((stage) => {
        const StageIcon = stage.icon;
        const readCount = stage.articles.filter(a => readArticles.has(a.slug)).length;

        return (
          <AccordionItem
            key={stage.id}
            value={stage.id}
            className="border rounded-xl px-4 bg-card"
          >
            <AccordionTrigger className="hover:no-underline py-4">
              <div className="flex items-center gap-3 text-left">
                <div className={`p-2 rounded-lg bg-${stage.accentColor}/10`}>
                  <StageIcon className={`h-4 w-4 text-${stage.accentColor}`} />
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">
                    Stage {stage.number} - {readCount}/{stage.articles.length} read
                  </span>
                  <h3 className="font-semibold font-crimson">
                    {stage.title}
                  </h3>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-4">
              <p className="text-sm text-muted-foreground mb-4">
                {stage.subtitle}
              </p>
              <div className="space-y-3">
                {stage.articles.map((article) => (
                  <ArticleCardCompact
                    key={article.slug}
                    article={article}
                    isRead={readArticles.has(article.slug)}
                  />
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
}
```

---

## 5. Article Cards

### Standard Article Card (Desktop)

```tsx
// /src/components/learning/ArticleCard.tsx

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle } from "lucide-react";
import Link from "next/link";

interface ArticleCardProps {
  article: {
    slug: string;
    title: string;
    excerpt: string;
    category: string;
    readTimeMinutes: number;
  };
  isRead: boolean;
  accentColor?: string;
}

const CATEGORY_LABELS: Record<string, string> = {
  mindset: "Mindset",
  practical: "Practical",
  relationships: "Relationships",
  faith_stewardship: "Faith & Stewardship",
};

export function ArticleCard({ article, isRead, accentColor = "primary" }: ArticleCardProps) {
  return (
    <Link href={`/financial/articles/${article.slug}`}>
      <Card className={`
        h-full
        transition-all duration-200
        hover:shadow-md hover:border-${accentColor}/40
        ${isRead ? 'opacity-70 bg-muted/30' : 'bg-card'}
      `}>
        <CardHeader className="pb-2">
          {/* Category & Read Status Row */}
          <div className="flex items-center justify-between mb-2">
            <Badge
              variant="outline"
              className="text-xs font-normal border-muted-foreground/30"
            >
              {CATEGORY_LABELS[article.category] || article.category}
            </Badge>
            {isRead && (
              <div className="flex items-center gap-1 text-xs text-primary">
                <CheckCircle className="h-3.5 w-3.5" />
                <span className="sr-only">Read</span>
              </div>
            )}
          </div>

          {/* Title */}
          <CardTitle className="text-lg font-crimson leading-snug line-clamp-2">
            {article.title}
          </CardTitle>

          {/* Excerpt */}
          <CardDescription className="line-clamp-2 mt-1">
            {article.excerpt}
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-0">
          {/* Read Time */}
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="h-3.5 w-3.5" />
            <span>{article.readTimeMinutes} min read</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
```

### Compact Article Card (Mobile)

```tsx
// /src/components/learning/ArticleCardCompact.tsx

import { Clock, CheckCircle, ChevronRight } from "lucide-react";
import Link from "next/link";

interface ArticleCardCompactProps {
  article: {
    slug: string;
    title: string;
    readTimeMinutes: number;
  };
  isRead: boolean;
}

export function ArticleCardCompact({ article, isRead }: ArticleCardCompactProps) {
  return (
    <Link
      href={`/financial/articles/${article.slug}`}
      className={`
        flex items-center justify-between
        p-3 rounded-lg border
        transition-colors duration-150
        hover:bg-muted/50
        ${isRead ? 'bg-muted/30 opacity-75' : 'bg-card'}
      `}
    >
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {/* Read Indicator */}
        {isRead ? (
          <CheckCircle className="h-4 w-4 text-primary shrink-0" />
        ) : (
          <div className="w-4 h-4 rounded-full border-2 border-muted-foreground/30 shrink-0" />
        )}

        <div className="min-w-0">
          <h4 className={`
            font-medium text-sm truncate
            ${isRead ? 'text-muted-foreground' : 'text-foreground'}
          `}>
            {article.title}
          </h4>
          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
            <Clock className="h-3 w-3" />
            <span>{article.readTimeMinutes} min</span>
          </div>
        </div>
      </div>

      <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
    </Link>
  );
}
```

### Read/Unread State Specifications

| State | Visual Treatment | Classes |
|-------|------------------|---------|
| **Unread** | Full opacity, white background | `bg-card opacity-100` |
| **Read** | Reduced opacity, subtle background | `bg-muted/30 opacity-70` |
| **Read Indicator** | Small green checkmark (not prominent) | `text-primary h-3.5 w-3.5` |
| **Unread Indicator** | Empty circle outline (mobile only) | `border-2 border-muted-foreground/30 rounded-full` |

---

## 6. Responsive Behavior

### Breakpoint Strategy

```tsx
// Main page component handling responsive layouts
// /src/app/(auth)/(dashboard)/financial/learning/page.tsx

"use client";

import { LearningHero } from "@/components/learning/LearningHero";
import { LearningStages } from "@/components/learning/LearningStages";
import { LearningStagesMobile } from "@/components/learning/LearningStagesMobile";

export default function LearningPage() {
  return (
    <div className="px-6 py-8 max-w-screen-2xl mx-auto">
      <LearningHero {...heroProps} />

      {/* Desktop: Multi-column stages */}
      <div className="hidden md:block">
        <LearningStages stages={stages} readArticles={readArticles} />
      </div>

      {/* Mobile: Accordion stages */}
      <div className="md:hidden">
        <LearningStagesMobile stages={stages} readArticles={readArticles} />
      </div>
    </div>
  );
}
```

### Grid Specifications

| Viewport | Article Grid | Behavior |
|----------|--------------|----------|
| Mobile (`< md`) | Single column | Accordion stages, compact cards |
| Tablet (`md`) | 2 columns | Expanded stages, standard cards |
| Desktop (`lg+`) | 3 columns | Full layout with generous spacing |

```css
/* Article Grid Classes */
.article-grid {
  @apply grid gap-4;
  @apply grid-cols-1;      /* Mobile: 1 column */
  @apply md:grid-cols-2;   /* Tablet: 2 columns */
  @apply lg:grid-cols-3;   /* Desktop: 3 columns */
}
```

---

## 7. Visual Tone & Spacing

### Whitespace Guidelines

| Context | Spacing | Tailwind |
|---------|---------|----------|
| Page padding | Horizontal: 24px, Vertical: 32px | `px-6 py-8` |
| Section separation | 48px-80px | `mb-12` or `space-y-10` |
| Stage header to cards | 24px | `mb-6` |
| Card grid gap | 16px | `gap-4` |
| Inside cards | 24px | Standard Card padding |

### Typography Hierarchy

| Element | Font | Size | Weight | Classes |
|---------|------|------|--------|---------|
| Page Title | Crimson | 36px/48px | Bold | `text-3xl md:text-4xl font-bold font-crimson` |
| Stage Title | Crimson | 24px/28px | Semibold | `text-xl md:text-2xl font-semibold font-crimson` |
| Article Title | Crimson | 18px | Semibold | `text-lg font-crimson` |
| Body Text | Inter | 16px | Normal | `text-base font-inter` |
| Captions/Meta | Inter | 12px-14px | Normal | `text-xs` or `text-sm` |

### Animation & Transitions

```css
/* Gentle fade-in for content sections */
.animate-fade-in-up {
  animation: fade-in-up 0.8s ease-out forwards;
}

/* Staggered delays for stages */
.animation-delay-100 { animation-delay: 100ms; }
.animation-delay-200 { animation-delay: 200ms; }
.animation-delay-300 { animation-delay: 300ms; }

/* Card hover transitions */
.card-hover {
  @apply transition-all duration-200;
  @apply hover:shadow-md hover:border-primary/40;
}

/* Accordion smooth open/close (already in shadcn) */
/* data-[state=open]:animate-accordion-down */
/* data-[state=closed]:animate-accordion-up */
```

---

## 8. Gentle Guidance Language

### Copy Guidelines

The UI should use warm, encouraging language that respects the user's pace:

| Context | Example Copy |
|---------|--------------|
| Welcome Message | "Take your time - these resources are here whenever you're ready." |
| Progress | "You've read 3 of 8 articles" (not "3/8 completed!") |
| Stage Intro | "Building the right mindset" (not "You must complete this first") |
| Empty State | "When you're ready, start with the article below." |
| Featured CTA | "Begin Reading" (not "Start Now!" or "Get Started!") |

### Encouraging Messaging Component

```tsx
// /src/components/learning/EncouragingMessage.tsx

const ENCOURAGING_MESSAGES = [
  "Every step forward is a gift to your family.",
  "There's no rush. Thoughtful planning takes time.",
  "You're building something that will outlast you.",
  "This is an act of love for those you care about most.",
];

export function EncouragingMessage() {
  // Show a gentle message based on user's progress or randomly
  const message = ENCOURAGING_MESSAGES[Math.floor(Math.random() * ENCOURAGING_MESSAGES.length)];

  return (
    <p className="text-center text-sm text-muted-foreground italic max-w-md mx-auto">
      {message}
    </p>
  );
}
```

---

## 9. Complete Page Assembly

### Full Page Component Structure

```tsx
// /src/app/(auth)/(dashboard)/financial/learning/page.tsx

"use client";

import { useQuery } from "convex/react";
import { Loader2 } from "lucide-react";
import { api } from "@/convex/_generated/api";

import { LearningHero } from "@/components/learning/LearningHero";
import { LearningStages } from "@/components/learning/LearningStages";
import { LearningStagesMobile } from "@/components/learning/LearningStagesMobile";
import { EncouragingMessage } from "@/components/learning/EncouragingMessage";

// Stage and article configuration
const LEARNING_STAGES = [
  {
    id: "understanding",
    number: 1,
    title: "Understanding Your Why",
    subtitle: "Building the right mindset",
    accentColor: "primary",
    articles: [
      { slug: "stewardship-mindset", title: "The Stewardship Mindset", category: "mindset", readTimeMinutes: 4, excerpt: "..." },
      { slug: "why-planning-matters", title: "Why Planning Matters to God", category: "mindset", readTimeMinutes: 5, excerpt: "..." },
    ]
  },
  {
    id: "building",
    number: 2,
    title: "Building Your Foundation",
    subtitle: "Practical steps forward",
    accentColor: "secondary",
    articles: [
      { slug: "essential-documents", title: "5 Essential Documents Every Family Needs", category: "practical", readTimeMinutes: 6, excerpt: "..." },
      { slug: "talking-to-family", title: "Talking to Your Family About Legacy", category: "practical", readTimeMinutes: 5, excerpt: "..." },
      { slug: "organizing-finances", title: "Organizing Your Financial Life", category: "practical", readTimeMinutes: 7, excerpt: "..." },
    ]
  },
  {
    id: "strengthening",
    number: 3,
    title: "Strengthening Your Legacy",
    subtitle: "Advanced planning & relationships",
    accentColor: "accent",
    articles: [
      { slug: "charitable-giving", title: "Charitable Giving Strategies", category: "relationships", readTimeMinutes: 6, excerpt: "..." },
      { slug: "multi-generational", title: "Multi-Generational Wealth Transfer", category: "relationships", readTimeMinutes: 8, excerpt: "..." },
      { slug: "digital-legacy", title: "Your Digital Legacy", category: "relationships", readTimeMinutes: 5, excerpt: "..." },
    ]
  }
];

const FEATURED_ARTICLE = {
  slug: "gift-of-clarity",
  title: "The Gift of Clarity: Why Your Family Needs a Legacy Plan",
  excerpt: "Discover how thoughtful planning is one of the greatest acts of love you can give your family. This foundational guide will help you understand the 'why' behind legacy planning.",
  readTimeMinutes: 5,
  category: "mindset"
};

export default function LearningResourcesPage() {
  // Fetch user's read articles from database
  const readArticlesData = useQuery(api.articles.getUserReadArticles, {});
  const readArticles = new Set(readArticlesData?.map(a => a.slug) ?? []);

  // Calculate totals
  const totalArticles = LEARNING_STAGES.reduce((sum, stage) => sum + stage.articles.length, 0) + 1; // +1 for featured
  const readCount = readArticles.size;

  // Loading state
  if (readArticlesData === undefined) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="px-6 py-8 max-w-screen-2xl mx-auto">
      {/* Hero with Featured Article */}
      <LearningHero
        featuredArticle={{
          ...FEATURED_ARTICLE,
          isRead: readArticles.has(FEATURED_ARTICLE.slug)
        }}
        totalArticles={totalArticles}
        readCount={readCount}
      />

      {/* Desktop Stages */}
      <div className="hidden md:block">
        <LearningStages
          stages={LEARNING_STAGES}
          readArticles={readArticles}
        />
      </div>

      {/* Mobile Accordion Stages */}
      <div className="md:hidden">
        <LearningStagesMobile
          stages={LEARNING_STAGES}
          readArticles={readArticles}
        />
      </div>

      {/* Encouraging Footer Message */}
      <div className="mt-16 pt-8 border-t border-border/50">
        <EncouragingMessage />
      </div>
    </div>
  );
}
```

---

## 10. Component File Structure

```
src/
  components/
    learning/
      LearningHero.tsx           # Hero section with featured article
      LearningStages.tsx         # Desktop stage layout
      LearningStagesMobile.tsx   # Mobile accordion layout
      ArticleCard.tsx            # Standard article card
      ArticleCardCompact.tsx     # Compact mobile card
      EncouragingMessage.tsx     # Gentle encouragement
      index.ts                   # Barrel export
  app/
    (auth)/
      (dashboard)/
        financial/
          learning/
            page.tsx             # Main learning resources page
```

---

## 11. Accessibility Considerations

| Feature | Implementation |
|---------|----------------|
| Focus States | Using existing shadcn focus rings (`focus-visible:ring-ring/50`) |
| Color Contrast | All text meets WCAG AA (muted-foreground is 4.5:1+) |
| Screen Readers | `sr-only` labels for icon-only indicators |
| Keyboard Nav | All cards are focusable links, accordion supports keyboard |
| Motion | Respects `prefers-reduced-motion` (tw-animate-css handles this) |

### Screen Reader Announcements

```tsx
// For read status
{isRead && (
  <>
    <CheckCircle className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
    <span className="sr-only">Article read</span>
  </>
)}

// For progress
<p className="text-sm text-muted-foreground">
  You've read <span className="font-medium text-foreground">{readCount}</span> of{" "}
  <span className="font-medium text-foreground">{totalArticles}</span> articles
  <span className="sr-only">. {totalArticles - readCount} remaining.</span>
</p>
```

---

## 12. Dark Mode Support

The design automatically supports dark mode through existing CSS variables:

```css
/* Already defined in globals.css */
.dark {
  --background: 0 0% 17%;
  --card: 0 0% 23%;
  --muted: 30 4% 53%;
  --muted-foreground: 30 4% 70%;
  /* ... etc */
}
```

The component classes use semantic tokens (`bg-card`, `text-muted-foreground`, etc.) that automatically adapt.

---

## Summary

This design specification creates a calming, stage-based learning experience that:

1. **Welcomes users** with a prominent "Start Here" featured article
2. **Organizes content** by journey stage, not arbitrary categories
3. **Tracks progress** subtly without gamification
4. **Adapts gracefully** from desktop multi-column to mobile accordion
5. **Uses gentle language** that respects the user's pace
6. **Maintains brand consistency** with Pathible's existing design system
7. **Ensures accessibility** with proper contrast, focus states, and screen reader support

The visual tone is peaceful and purposeful, reflecting the faith-based audience's preference for thoughtful, unhurried experiences.
