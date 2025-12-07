"use client";

import { Search, Tag, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface SearchAndFilterProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCategory: string | undefined;
  onCategoryChange: (category: string | undefined) => void;
  categories: Array<{ name: string; documentCount: number }>;
  totalDocuments?: number;
}

export function SearchAndFilter({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  categories,
  totalDocuments = 0,
}: SearchAndFilterProps) {
  return (
    <Card>
      <CardContent className="p-4 space-y-4">
        {/* Search Input - Full Width */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search documents..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="icon-sm"
              className="absolute right-1 top-1/2 -translate-y-1/2"
              onClick={() => onSearchChange("")}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Category Filters */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Filter by category:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge
              variant={selectedCategory === undefined ? "default" : "outline"}
              className={`cursor-pointer transition-all ${
                selectedCategory === undefined
                  ? "bg-primary text-white hover:bg-primary/90"
                  : "hover:bg-secondary/50"
              }`}
              onClick={() => onCategoryChange(undefined)}
            >
              All Documents
              <span className="ml-1 opacity-70">({totalDocuments})</span>
            </Badge>
            {categories.map((category) => (
              <Badge
                key={category.name}
                variant={selectedCategory === category.name ? "default" : "outline"}
                className={`cursor-pointer transition-all ${
                  selectedCategory === category.name
                    ? "bg-primary text-white hover:bg-primary/90"
                    : "hover:bg-secondary/50"
                }`}
                onClick={() =>
                  onCategoryChange(selectedCategory === category.name ? undefined : category.name)
                }
              >
                {category.name}
                <span className="ml-1 opacity-70">({category.documentCount})</span>
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
