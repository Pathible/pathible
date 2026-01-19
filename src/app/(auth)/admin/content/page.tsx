"use client";

import { useMutation, useQuery } from "convex/react";
import {
  Archive,
  Eye,
  FileText,
  Globe,
  Loader2,
  Lock,
  MoreHorizontal,
  Plus,
  Send,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import {
  ARTICLE_CATEGORY_LABELS,
  ARTICLE_CATEGORY_OPTIONS,
  type ArticleCategory,
  LEGACY_CATEGORY_MAPPING,
} from "@/convex/shared/categories";

/**
 * Get display label for a category, handling both legacy and new category values
 */
function getCategoryDisplayLabel(category: string): string {
  if (category in LEGACY_CATEGORY_MAPPING) {
    const newCategory = LEGACY_CATEGORY_MAPPING[category];
    return ARTICLE_CATEGORY_LABELS[newCategory];
  }
  if (category in ARTICLE_CATEGORY_LABELS) {
    return ARTICLE_CATEGORY_LABELS[category as ArticleCategory];
  }
  return category;
}

const STATUS_STYLES: Record<string, string> = {
  draft: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  published: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  archived: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
};

const VISIBILITY_STYLES: Record<string, string> = {
  public: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  subscribers: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
};

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function ContentManagerPage() {
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [visibilityFilter, setVisibilityFilter] = useState<string>("all");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [articleToDelete, setArticleToDelete] = useState<{
    id: Id<"educationalArticles">;
    title: string;
  } | null>(null);

  const articles = useQuery(api.articles.listAll, {
    status:
      statusFilter !== "all" ? (statusFilter as "draft" | "published" | "archived") : undefined,
    category: categoryFilter !== "all" ? (categoryFilter as ArticleCategory) : undefined,
    visibility:
      visibilityFilter !== "all" ? (visibilityFilter as "public" | "subscribers") : undefined,
  });

  const updateArticle = useMutation(api.articles.update);
  const deleteArticle = useMutation(api.articles.remove);

  const handlePublish = async (id: Id<"educationalArticles">) => {
    try {
      await updateArticle({ id, status: "published" });
      toast.success("Article published");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to publish");
    }
  };

  const handleArchive = async (id: Id<"educationalArticles">) => {
    try {
      await updateArticle({ id, status: "archived" });
      toast.success("Article archived");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to archive");
    }
  };

  const handleMakePublic = async (id: Id<"educationalArticles">) => {
    try {
      await updateArticle({ id, visibility: "public" });
      toast.success("Article is now public");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update visibility");
    }
  };

  const handleMakeSubscribers = async (id: Id<"educationalArticles">) => {
    try {
      await updateArticle({ id, visibility: "subscribers" });
      toast.success("Article is now subscribers-only");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update visibility");
    }
  };

  const handleDeleteClick = (id: Id<"educationalArticles">, title: string) => {
    setArticleToDelete({ id, title });
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!articleToDelete) return;
    try {
      await deleteArticle({ id: articleToDelete.id });
      toast.success("Article deleted");
      setDeleteDialogOpen(false);
      setArticleToDelete(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete");
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between" data-tour="content-manager-header">
        <div>
          <h1 className="font-crimson text-3xl font-semibold">Content Manager</h1>
          <p className="text-muted-foreground">
            Create and manage educational articles for Faith & Finances
          </p>
        </div>
        <Button asChild data-tour="content-new-article-btn">
          <Link href="/admin/content/new">
            <Plus className="h-4 w-4 mr-2" />
            New Article
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <Card data-tour="content-filters">
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="w-48">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-48">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {ARTICLE_CATEGORY_OPTIONS.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-48">
              <Select value={visibilityFilter} onValueChange={setVisibilityFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by visibility" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Visibility</SelectItem>
                  <SelectItem value="public">Public</SelectItem>
                  <SelectItem value="subscribers">Subscribers Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Articles Table */}
      <Card data-tour="content-articles-table">
        <CardHeader>
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            <CardTitle>Articles</CardTitle>
          </div>
          <CardDescription>
            {articles?.length ?? 0} article{articles?.length !== 1 ? "s" : ""}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {articles === undefined ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : articles.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold text-lg mb-2">No articles yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first educational article to get started.
              </p>
              <Button asChild>
                <Link href="/admin/content/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Article
                </Link>
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[300px] max-w-[400px]">Title</TableHead>
                    <TableHead className="w-[140px]">Category</TableHead>
                    <TableHead className="w-[100px]">Status</TableHead>
                    <TableHead className="w-[110px]">Visibility</TableHead>
                    <TableHead className="w-[80px]">Views</TableHead>
                    <TableHead className="w-[100px]">Updated</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {articles.map((article) => (
                    <TableRow
                      key={article._id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => router.push(`/admin/content/${article._id}`)}
                    >
                      <TableCell className="max-w-[400px]">
                        <div className="space-y-1">
                          <p className="font-medium truncate">{article.title}</p>
                          <p className="text-sm text-muted-foreground line-clamp-1">
                            {article.excerpt}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{getCategoryDisplayLabel(article.category)}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={STATUS_STYLES[article.status]}>{article.status}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={VISIBILITY_STYLES[article.visibility]}>
                          {article.visibility === "public" ? (
                            <span className="flex items-center gap-1">
                              <Globe className="h-3 w-3" />
                              Public
                            </span>
                          ) : (
                            <span className="flex items-center gap-1">
                              <Lock className="h-3 w-3" />
                              Subscribers
                            </span>
                          )}
                        </Badge>
                      </TableCell>
                      <TableCell>{article.viewCount}</TableCell>
                      <TableCell>{formatDate(article.updatedAt)}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {article.status === "published" && (
                              <DropdownMenuItem asChild>
                                <Link href={`/financial/articles/${article.slug}`} target="_blank">
                                  <Eye className="h-4 w-4 mr-2" />
                                  View
                                </Link>
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            {article.status === "draft" && (
                              <DropdownMenuItem onClick={() => handlePublish(article._id)}>
                                <Send className="h-4 w-4 mr-2" />
                                Publish
                              </DropdownMenuItem>
                            )}
                            {article.status === "published" && (
                              <DropdownMenuItem onClick={() => handleArchive(article._id)}>
                                <Archive className="h-4 w-4 mr-2" />
                                Archive
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            {article.visibility === "subscribers" ? (
                              <DropdownMenuItem onClick={() => handleMakePublic(article._id)}>
                                <Globe className="h-4 w-4 mr-2" />
                                Make Public
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem onClick={() => handleMakeSubscribers(article._id)}>
                                <Lock className="h-4 w-4 mr-2" />
                                Subscribers Only
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDeleteClick(article._id, article.title)}
                              className="text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Article?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{articleToDelete?.title}&quot;? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
