"use client";

import { Bookmark, Hash, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

/**
 * Tags and Collections UI for Heritage Vault
 * This feature is gated to Heritage+ tier users.
 *
 * Tags: Flexible labels that can be applied to any document
 * Collections: Curated groups of documents for specific purposes
 */
export function TagsCollections() {
  // Placeholder data - in production, this would come from Convex queries
  const tags = [
    { name: "Important", count: 0, color: "red" },
    { name: "To Review", count: 0, color: "yellow" },
    { name: "Shared", count: 0, color: "blue" },
  ];

  const collections = [
    {
      name: "Emergency Documents",
      description: "Quick access to critical documents",
      documentCount: 0,
    },
    {
      name: "Tax Season",
      description: "Documents needed for tax filing",
      documentCount: 0,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* Tags Section */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Hash className="h-5 w-5 text-muted-foreground" />
              <CardTitle className="text-lg">Tags</CardTitle>
            </div>
            <Button variant="ghost" size="sm">
              <Plus className="h-4 w-4 mr-1" />
              New Tag
            </Button>
          </div>
          <CardDescription>Label documents for easy filtering</CardDescription>
        </CardHeader>
        <CardContent>
          {tags.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <Badge
                  key={tag.name}
                  variant="outline"
                  className="cursor-pointer hover:bg-secondary/50"
                >
                  <Hash className="h-3 w-3 mr-1" />
                  {tag.name}
                  <span className="ml-1 opacity-70">({tag.count})</span>
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No tags yet. Create your first tag to start organizing.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Collections Section */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bookmark className="h-5 w-5 text-muted-foreground" />
              <CardTitle className="text-lg">Collections</CardTitle>
            </div>
            <Button variant="ghost" size="sm">
              <Plus className="h-4 w-4 mr-1" />
              New Collection
            </Button>
          </div>
          <CardDescription>Group related documents together</CardDescription>
        </CardHeader>
        <CardContent>
          {collections.length > 0 ? (
            <div className="space-y-2">
              {collections.map((collection) => (
                <div
                  key={collection.name}
                  className="flex items-center justify-between p-2 rounded-md border border-dashed hover:bg-secondary/30 cursor-pointer transition-colors"
                >
                  <div>
                    <p className="text-sm font-medium">{collection.name}</p>
                    <p className="text-xs text-muted-foreground">{collection.description}</p>
                  </div>
                  <Badge variant="secondary">{collection.documentCount}</Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No collections yet. Create your first collection to group documents.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
