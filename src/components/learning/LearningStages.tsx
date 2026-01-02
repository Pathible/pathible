import { ArticleCard } from "./ArticleCard";
import type { LearningStagesProps, Stage } from "./types";

interface StageSectionProps {
  stage: Stage;
  readArticles: Set<string>;
  animationDelay: number;
}

/**
 * Individual stage section with header and article grid
 */
function StageSection({ stage, readArticles, animationDelay }: StageSectionProps) {
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
    <div
      className="animate-fade-in-up opacity-0"
      style={{
        animationDelay: `${animationDelay}ms`,
        animationFillMode: "forwards",
      }}
    >
      {/* Stage Header */}
      <div className="flex items-center gap-4 mb-6">
        <div
          className={`
            flex items-center justify-center
            w-10 h-10 rounded-full
            ${iconBgClass}
          `}
        >
          <StageIcon className={`h-5 w-5 ${iconTextClass}`} />
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
          <h2 className="text-xl md:text-2xl font-semibold font-crimson">{stage.title}</h2>
          <p className="text-sm text-muted-foreground">{stage.subtitle}</p>
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

/**
 * Desktop layout for learning stages
 * Shows all three stages with article grids
 */
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
