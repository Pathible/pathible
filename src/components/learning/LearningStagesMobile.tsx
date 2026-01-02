"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import { ArticleCardCompact } from "./ArticleCardCompact";
import type { LearningStagesProps } from "./types";

/**
 * Mobile accordion layout for learning stages
 * Collapses stages into expandable sections with compact article cards
 */
export function LearningStagesMobile({ stages, readArticles }: LearningStagesProps) {
  return (
    <Accordion type="single" collapsible defaultValue="understanding" className="space-y-4">
      {stages.map((stage) => {
        const StageIcon = stage.icon;
        const readCount = stage.articles.filter((a) => readArticles.has(a.slug)).length;

        // Dynamic accent color styles
        const iconBgClass = {
          primary: "bg-primary/10",
          secondary: "bg-secondary/10",
          accent: "bg-accent/10",
        }[stage.accentColor];

        const iconTextClass = {
          primary: "text-primary",
          secondary: "text-secondary",
          accent: "text-accent",
        }[stage.accentColor];

        return (
          <AccordionItem key={stage.id} value={stage.id} className="border rounded-xl px-4 bg-card">
            <AccordionTrigger className="hover:no-underline py-4">
              <div className="flex items-center gap-3 text-left">
                <div className={`p-2 rounded-lg ${iconBgClass}`}>
                  <StageIcon className={`h-4 w-4 ${iconTextClass}`} />
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">
                    Stage {stage.number} - {readCount}/{stage.articles.length} read
                  </span>
                  <h3 className="font-semibold font-crimson">{stage.title}</h3>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-4">
              <p className="text-sm text-muted-foreground mb-4">{stage.subtitle}</p>
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
