"use client";

import { useMutation, useQuery } from "convex/react";
import { ArrowLeft, Loader2, Save, Trash2 } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

const CATEGORIES = [
  { value: "faith_stewardship", label: "Faith & Stewardship" },
  { value: "estate_planning", label: "Estate Planning" },
  { value: "financial_planning", label: "Financial Planning" },
  { value: "family_legacy", label: "Family Legacy" },
  { value: "legal", label: "Legal" },
  { value: "insurance", label: "Insurance" },
  { value: "digital_legacy", label: "Digital Legacy" },
  { value: "end_of_life", label: "End of Life" },
  { value: "other", label: "Other" },
] as const;

type CategoryValue = (typeof CATEGORIES)[number]["value"];

interface FormData {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  readTimeMinutes: number;
  featuredImageUrl?: string;
}

export default function EditArticlePage() {
  const params = useParams();
  const router = useRouter();
  const articleId = params.id as Id<"educationalArticles">;

  const [category, setCategory] = useState<CategoryValue>("faith_stewardship");
  const [status, setStatus] = useState<"draft" | "published" | "archived">("draft");

  const article = useQuery(api.articles.get, { id: articleId });
  const updateArticle = useMutation(api.articles.update);
  const deleteArticle = useMutation(api.articles.remove);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>();

  // Populate form when article loads
  useEffect(() => {
    if (article) {
      reset({
        title: article.title,
        slug: article.slug,
        excerpt: article.excerpt,
        content: article.content,
        readTimeMinutes: article.readTimeMinutes,
        featuredImageUrl: article.featuredImageUrl ?? "",
      });
      setCategory(article.category as CategoryValue);
      setStatus(article.status as "draft" | "published" | "archived");
    }
  }, [article, reset]);

  const onSubmit = async (data: FormData) => {
    try {
      await updateArticle({
        id: articleId,
        title: data.title,
        slug: data.slug,
        excerpt: data.excerpt,
        content: data.content,
        category,
        readTimeMinutes: data.readTimeMinutes,
        featuredImageUrl: data.featuredImageUrl || undefined,
        status,
      });

      toast.success("Article updated");
      router.push("/admin/content");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update article");
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this article? This cannot be undone.")) {
      return;
    }
    try {
      await deleteArticle({ id: articleId });
      toast.success("Article deleted");
      router.push("/admin/content");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete article");
    }
  };

  if (article === undefined) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (article === null) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin/content">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="font-crimson text-3xl font-semibold">Article Not Found</h1>
            <p className="text-muted-foreground">This article may have been deleted.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin/content">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="font-crimson text-3xl font-semibold">Edit Article</h1>
            <p className="text-muted-foreground">Make changes to your article</p>
          </div>
        </div>
        <Button variant="destructive" size="sm" onClick={handleDelete}>
          <Trash2 className="h-4 w-4 mr-2" />
          Delete
        </Button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Content</CardTitle>
                <CardDescription>The main article content</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    placeholder="Article title"
                    {...register("title", { required: "Title is required" })}
                  />
                  {errors.title && (
                    <p className="text-sm text-destructive">{errors.title.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="slug">URL Slug</Label>
                  <Input
                    id="slug"
                    placeholder="url-friendly-slug"
                    {...register("slug", { required: "Slug is required" })}
                  />
                  {errors.slug && <p className="text-sm text-destructive">{errors.slug.message}</p>}
                  <p className="text-xs text-muted-foreground">
                    This will be used in the article URL
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="excerpt">Excerpt</Label>
                  <Textarea
                    id="excerpt"
                    placeholder="A brief summary of the article..."
                    rows={3}
                    {...register("excerpt", { required: "Excerpt is required" })}
                  />
                  {errors.excerpt && (
                    <p className="text-sm text-destructive">{errors.excerpt.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="content">Content</Label>
                  <Textarea
                    id="content"
                    placeholder="Write your article content here... (Markdown supported)"
                    rows={15}
                    className="font-mono text-sm"
                    {...register("content", { required: "Content is required" })}
                  />
                  {errors.content && (
                    <p className="text-sm text-destructive">{errors.content.message}</p>
                  )}
                  <p className="text-xs text-muted-foreground">Markdown formatting is supported</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select value={category} onValueChange={(v) => setCategory(v as CategoryValue)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="readTime">Read Time (minutes)</Label>
                  <Input
                    id="readTime"
                    type="number"
                    min={1}
                    max={60}
                    {...register("readTimeMinutes", {
                      valueAsNumber: true,
                      required: "Read time is required",
                      min: { value: 1, message: "Minimum 1 minute" },
                    })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="featuredImage">Featured Image URL</Label>
                  <Input
                    id="featuredImage"
                    placeholder="https://..."
                    {...register("featuredImageUrl")}
                  />
                  <p className="text-xs text-muted-foreground">Optional cover image</p>
                </div>

                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select
                    value={status}
                    onValueChange={(v) => setStatus(v as "draft" | "published" | "archived")}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 space-y-3">
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
                {article.status === "published" && (
                  <Button variant="outline" className="w-full" asChild>
                    <Link href={`/financial/articles/${article.slug}`} target="_blank">
                      View Published Article
                    </Link>
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Article Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Article Info</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-1">
                <p>Views: {article.viewCount}</p>
                <p>Created: {new Date(article._creationTime).toLocaleDateString()}</p>
                <p>Updated: {new Date(article.updatedAt).toLocaleDateString()}</p>
                {article.publishedAt && (
                  <p>Published: {new Date(article.publishedAt).toLocaleDateString()}</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}
