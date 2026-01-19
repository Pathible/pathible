"use client";

import { useMutation } from "convex/react";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
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
import { ARTICLE_CATEGORY_OPTIONS, type ArticleCategory } from "@/convex/shared/categories";

interface FormData {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  readTimeMinutes: number;
  featuredImageUrl?: string;
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export default function NewArticlePage() {
  const router = useRouter();
  const [category, setCategory] = useState<ArticleCategory>("beliefs_values");
  const [status, setStatus] = useState<"draft" | "published">("draft");

  const createArticle = useMutation(api.articles.create);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    defaultValues: {
      title: "",
      slug: "",
      excerpt: "",
      content: "",
      readTimeMinutes: 5,
      featuredImageUrl: "",
    },
  });

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setValue("title", newTitle);
    // Auto-generate slug from title
    setValue("slug", generateSlug(newTitle));
  };

  const onSubmit = async (data: FormData) => {
    try {
      await createArticle({
        title: data.title,
        slug: data.slug,
        excerpt: data.excerpt,
        content: data.content,
        category,
        readTimeMinutes: data.readTimeMinutes,
        featuredImageUrl: data.featuredImageUrl || undefined,
        status,
      });

      toast.success(status === "published" ? "Article published!" : "Article saved as draft");
      router.push("/admin/content");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create article");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/content">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="font-crimson text-3xl font-semibold">New Article</h1>
          <p className="text-muted-foreground">Create a new educational article</p>
        </div>
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
                    onChange={handleTitleChange}
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
                  <Select value={category} onValueChange={(v) => setCategory(v as ArticleCategory)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ARTICLE_CATEGORY_OPTIONS.map((cat) => (
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
                    onValueChange={(v) => setStatus(v as "draft" | "published")}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      {status === "published" ? "Publish Article" : "Save Draft"}
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}
