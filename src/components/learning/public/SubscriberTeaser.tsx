import { Clock, Lock } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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

interface SubscriberTeaserProps {
  article: {
    slug: string;
    title: string;
    excerpt: string;
    category: string;
    readTimeMinutes: number;
  };
}

export function SubscriberTeaser({ article }: SubscriberTeaserProps) {
  return (
    <Card className="h-full bg-muted/30 border-dashed border-pathible-sage/30 relative overflow-hidden">
      {/* Lock overlay indicator */}
      <div className="absolute top-3 right-3">
        <div className="w-8 h-8 rounded-full bg-pathible-gold/10 flex items-center justify-center">
          <Lock className="h-4 w-4 text-pathible-gold" />
        </div>
      </div>

      <CardHeader className="pb-2">
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="outline" className="text-xs font-normal border-muted-foreground/30">
            {CATEGORY_LABELS[article.category] || article.category}
          </Badge>
          <Badge className="text-xs bg-pathible-gold/10 text-pathible-gold border-0">
            Subscribers Only
          </Badge>
        </div>

        <CardTitle className="text-lg font-crimson leading-snug line-clamp-2 text-muted-foreground">
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
          <Button asChild size="sm" variant="outline" className="text-xs h-7">
            <Link href="/signup">Subscribe to Read</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
