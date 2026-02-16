"use client";

import { useMutation, useQuery } from "convex/react";
import {
  Archive,
  BookOpen,
  Eye,
  FileEdit,
  FileText,
  Filter,
  Loader2,
  MoreHorizontal,
  Plus,
  Send,
  Star,
  Trash2,
  X,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { AdminPageHeader } from "@/app/(auth)/admin/components/admin-page-header";
import { AdminStatusBadge } from "@/app/(auth)/admin/components/admin-status-badge";
import { StatCard } from "@/components/stat-card";
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
import { Switch } from "@/components/ui/switch";
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
import { formatDate } from "@/lib/date-utils";

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

export default function ContentManagerPage() {
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [showArchived, setShowArchived] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [articleToDelete, setArticleToDelete] = useState<{
    id: Id<"educationalArticles">;
    title: string;
  } | null>(null);

  const articles = useQuery(api.articles.listAll, {
    status:
      statusFilter !== "all" ? (statusFilter as "draft" | "published" | "archived") : undefined,
    category: categoryFilter !== "all" ? (categoryFilter as ArticleCategory) : undefined,
  });

  const updateArticle = useMutation(api.articles.update);
  const deleteArticle = useMutation(api.articles.remove);

  const contentStats = useMemo(() => {
    if (!articles) return null;
    const totalViews = articles.reduce((sum, a) => sum + a.viewCount, 0);
    const published = articles.filter((a) => a.status === "published");
    const drafts = articles.filter((a) => a.status === "draft");
    const mostViewed = [...articles].sort((a, b) => b.viewCount - a.viewCount)[0];
    return {
      totalViews,
      published: published.length,
      drafts: drafts.length,
      mostViewed,
    };
  }, [articles]);

  const filteredArticles = useMemo(() => {
    if (!articles) return undefined;
    if (showArchived) return articles;
    return articles.filter((a) => a.status !== "archived");
  }, [articles, showArchived]);

  const archivedCount = articles?.filter((a) => a.status === "archived").length ?? 0;

  const hasActiveFilters = statusFilter !== "all" || categoryFilter !== "all";

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

  const clearFilters = () => {
    setStatusFilter("all");
    setCategoryFilter("all");
  };

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Content Manager"
        subtitle="Stories and guides helping families find their way"
        actions={
          <Button asChild data-tour="content-new-article-btn">
            <Link href="/admin/content/new">
              <Plus className="h-4 w-4 mr-2" />
              New Article
            </Link>
          </Button>
        }
      />

      {/* Content Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" data-tour="content-manager-header">
        <StatCard
          icon={BookOpen}
          iconColor="text-primary"
          value={contentStats?.published ?? 0}
          title="Published"
          description="Live articles"
        />
        <StatCard
          icon={FileEdit}
          iconColor="text-accent"
          value={contentStats?.drafts ?? 0}
          title="Drafts"
          description="Awaiting review"
        />
        <StatCard
          icon={Eye}
          iconColor="text-pathible-forest"
          value={contentStats?.totalViews?.toLocaleString() ?? 0}
          title="Total Views"
          description="All-time article reads"
        />
        <StatCard
          icon={Star}
          iconColor="text-pathible-deep-gold"
          value={contentStats?.mostViewed?.viewCount?.toLocaleString() ?? 0}
          title="Most Viewed"
          description={
            contentStats?.mostViewed
              ? contentStats.mostViewed.title.length > 30
                ? `${contentStats.mostViewed.title.slice(0, 30)}...`
                : contentStats.mostViewed.title
              : "No articles yet"
          }
        />
      </div>

      {/* Filters */}
      <div className="rounded-xl border border-border bg-card p-4" data-tour="content-filters">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 shrink-0">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Filters</span>
          </div>
          <div className="flex items-center gap-3 flex-1">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-44">
                <SelectValue placeholder="All Categories" />
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
          <div className="flex items-center gap-2 shrink-0">
            <Switch id="show-archived" checked={showArchived} onCheckedChange={setShowArchived} />
            <label htmlFor="show-archived" className="text-xs text-muted-foreground cursor-pointer">
              Archived ({archivedCount})
            </label>
          </div>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="h-7 px-2 text-xs shrink-0"
            >
              <X className="mr-1 h-3 w-3" />
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Articles Table */}
      <Card data-tour="content-articles-table" className="border-border">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2.5">
            <div className="rounded-lg bg-primary/10 p-1.5">
              <FileText className="h-4 w-4 text-primary" />
            </div>
            <CardTitle className="font-crimson text-xl">Articles</CardTitle>
          </div>
          <CardDescription>
            {filteredArticles?.length ?? 0} article
            {filteredArticles?.length !== 1 ? "s" : ""}
            {!showArchived && archivedCount > 0 && ` (${archivedCount} archived hidden)`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredArticles === undefined ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredArticles.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <FileText className="h-8 w-8 text-muted-foreground/30 mb-2" />
              <h3 className="font-crimson text-lg font-medium">No articles found</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {hasActiveFilters
                  ? "Try adjusting your filters."
                  : "Create your first educational article to get started."}
              </p>
              {!hasActiveFilters && (
                <Button className="mt-4" asChild>
                  <Link href="/admin/content/new">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Article
                  </Link>
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[300px] max-w-[400px]">Title</TableHead>
                    <TableHead className="w-[140px]">Category</TableHead>
                    <TableHead className="w-[100px]">Status</TableHead>
                    <TableHead className="w-[80px]">Views</TableHead>
                    <TableHead className="w-[100px]">Updated</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredArticles.map((article) => (
                    <TableRow
                      key={article._id}
                      className="cursor-pointer hover:bg-muted/30"
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
                        <AdminStatusBadge type="contentStatus" value={article.status}>
                          {article.status}
                        </AdminStatusBadge>
                      </TableCell>
                      <TableCell className="tabular-nums">{article.viewCount}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(article.updatedAt)}
                      </TableCell>
                      <TableCell>
                        <div
                          className="flex items-center gap-1"
                          role="group"
                          onClick={(e) => e.stopPropagation()}
                          onKeyDown={(e) => e.stopPropagation()}
                        >
                          {article.status === "published" && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              asChild
                              title="View article"
                            >
                              <Link href={`/learn/${article.slug}`} target="_blank">
                                <Eye className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                              </Link>
                            </Button>
                          )}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Actions</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {article.status === "draft" && (
                                <DropdownMenuItem onClick={() => handlePublish(article._id)}>
                                  <Send className="mr-2 h-4 w-4" />
                                  Publish
                                </DropdownMenuItem>
                              )}
                              {article.status === "published" && (
                                <DropdownMenuItem onClick={() => handleArchive(article._id)}>
                                  <Archive className="mr-2 h-4 w-4" />
                                  Archive
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => handleDeleteClick(article._id, article.title)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
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
              Are you sure you want to delete &quot;{articleToDelete?.title}
              &quot;? This action cannot be undone.
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
