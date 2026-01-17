import { ArrowRight, Clock } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const CATEGORY_LABELS: Record<string, string> = {
  estate_planning: "Estate Planning",
  financial_planning: "Financial Planning",
  family_legacy: "Family Legacy",
  legal: "Legal",
  insurance: "Insurance",
  digital_legacy: "Digital Legacy",
  end_of_life: "End of Life",
  faith_stewardship: "Faith & Stewardship",
  other: "General",
};

interface PublicArticleCardProps {
  article: {
    slug: string;
    title: string;
    excerpt: string;
    category: string;
    readTimeMinutes: number;
    featuredImageUrl?: string;
  };
}

export function PublicArticleCard({ article }: PublicArticleCardProps) {
  return (
    <Link href={`/learn/${article.slug}`}>
      <Card className="h-full transition-all duration-200 hover:shadow-md hover:border-pathible-forest/40 bg-card group">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between mb-2">
            <Badge variant="outline" className="text-xs font-normal border-muted-foreground/30">
              {CATEGORY_LABELS[article.category] || article.category}
            </Badge>
          </div>

          <CardTitle className="text-lg font-crimson leading-snug line-clamp-2 group-hover:text-pathible-forest transition-colors">
            {article.title}
          </CardTitle>

          <CardDescription className="line-clamp-2 mt-1">{article.excerpt}</CardDescription>
        </CardHeader>

        <CardContent className="pt-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              <span>{article.readTimeMinutes} min read</span>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-pathible-forest group-hover:translate-x-1 transition-all" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
