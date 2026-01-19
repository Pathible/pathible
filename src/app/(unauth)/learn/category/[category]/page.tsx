import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PublicPageLayout } from "@/components/PublicPageLayout";
import {
  ARTICLE_CATEGORY_LABELS,
  type ArticleCategory,
  slugToCategory,
} from "@/convex/shared/categories";
import { generatePageMetadata } from "@/lib/seo-config";
import { CategoryArticlesSection } from "./CategoryArticlesSection";

interface CategoryPageProps {
  params: Promise<{
    category: string;
  }>;
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { category: categorySlug } = await params;
  const category = slugToCategory(categorySlug);

  if (!category) {
    return generatePageMetadata({
      title: "Category Not Found",
      description: "The requested category could not be found.",
      path: `/learn/category/${categorySlug}`,
    });
  }

  const categoryLabel = ARTICLE_CATEGORY_LABELS[category as ArticleCategory];

  return generatePageMetadata({
    title: `${categoryLabel} - Learn`,
    description: `Articles and guides about ${categoryLabel.toLowerCase()}. Simple guidance to give your family clarity instead of chaos.`,
    path: `/learn/category/${categorySlug}`,
  });
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { category: categorySlug } = await params;
  const category = slugToCategory(categorySlug);

  if (!category) {
    notFound();
  }

  const categoryLabel = ARTICLE_CATEGORY_LABELS[category as ArticleCategory];

  return (
    <PublicPageLayout>
      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <nav className="mb-4">
              <Link
                href="/learn"
                className="text-sm text-muted-foreground hover:text-pathible-forest transition-colors"
              >
                ← Back to Learn
              </Link>
            </nav>
            <h1 className="font-crimson text-3xl sm:text-4xl mb-4">{categoryLabel}</h1>
            <p className="text-muted-foreground text-lg max-w-2xl">
              Articles and guides about {categoryLabel.toLowerCase()}.
            </p>
          </div>

          <CategoryArticlesSection category={category} />
        </div>
      </section>
    </PublicPageLayout>
  );
}
