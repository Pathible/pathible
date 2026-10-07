import { beforeEach, describe, expect, it, vi } from "vitest";

const { query } = vi.hoisted(() => ({ query: vi.fn() }));
vi.mock("convex/browser", () => ({
  ConvexHttpClient: class {
    query = query;
  },
}));
vi.mock("react", () => ({ cache: (fn: unknown) => fn }));

describe("public article discovery", () => {
  beforeEach(() => {
    vi.stubEnv("NEXT_PUBLIC_CONVEX_URL", "https://example.convex.cloud");
    query.mockReset();
  });

  it("uses the published record for the article body and metadata", async () => {
    const article = {
      _id: "article_1",
      slug: "current-live-article",
      title: "Current title",
      content: "Current full article body",
      excerpt: "Current excerpt",
      category: "family_legacy",
      readTimeMinutes: 5,
    };
    query.mockResolvedValue(article);
    const { getPublicArticle } = await import("../public-articles");
    expect(await getPublicArticle(article.slug)).toEqual(article);
    expect(query).toHaveBeenCalledWith(expect.anything(), { slug: article.slug });
  });

  it("does not resurrect deleted articles from seed data", async () => {
    query.mockResolvedValue(null);
    const { getPublicArticle } = await import("../public-articles");
    expect(await getPublicArticle("estate-planning-checklist-25-essential-documents")).toBeNull();
  });

  it("builds discovery from current records rather than a fixed slug list", async () => {
    const articles = [{ slug: "newly-published", updatedAt: 123, title: "New" }];
    query.mockResolvedValue(articles);
    const { getPublicArticles } = await import("../public-articles");
    expect(await getPublicArticles()).toEqual(articles);
    expect(query).toHaveBeenCalledWith(expect.anything(), {});
  });
  it("redirects the stable family guide URL to its published legacy slug", async () => {
    query.mockResolvedValue({ slug: "creating-document-access-map-for-loved-ones" });
    const { getArticleRedirect } = await import("../public-articles");
    expect(await getArticleRedirect("the-family-access-map")).toBe(
      "/learn/creating-document-access-map-for-loved-ones",
    );
  });

  it("does not redirect unknown URLs or unpublished guides", async () => {
    query.mockResolvedValue(null);
    const { getArticleRedirect } = await import("../public-articles");
    expect(await getArticleRedirect("the-family-access-map")).toBeNull();
    expect(await getArticleRedirect("unknown-missing-article")).toBeNull();
  });
});
