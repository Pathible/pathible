import { CheckCircle, ChevronRight, Clock } from "lucide-react";
import Link from "next/link";

import type { ArticleCardCompactProps } from "./types";

/**
 * Compact article card for mobile accordion layout
 * Shows title and read time with circle/checkmark indicator
 */
export function ArticleCardCompact({ article, isRead }: ArticleCardCompactProps) {
  return (
    <Link
      href={`/financial/articles/${article.slug}`}
      className={`
        flex items-center justify-between
        p-3 rounded-lg border
        transition-colors duration-150
        hover:bg-muted/50
        ${isRead ? "bg-muted/30 opacity-75" : "bg-card"}
      `}
    >
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {/* Read Indicator */}
        {isRead ? (
          <>
            <CheckCircle className="h-4 w-4 text-primary shrink-0" aria-hidden="true" />
            <span className="sr-only">Article read:</span>
          </>
        ) : (
          <div
            className="w-4 h-4 rounded-full border-2 border-muted-foreground/30 shrink-0"
            aria-hidden="true"
          />
        )}

        <div className="min-w-0">
          <h4
            className={`
              font-medium text-sm truncate
              ${isRead ? "text-muted-foreground" : "text-foreground"}
            `}
          >
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
