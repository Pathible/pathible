"use client";

import { FileText, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import type { Id } from "@/convex/_generated/dataModel";

interface UploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  file: File;
  categories: Array<{ _id: Id<"vaultCategories">; name: string }>;
  onUpload: (metadata: {
    name: string;
    description?: string;
    categories: string[];
    accessLevel: "household" | "admins" | "custom";
    sharedWithUsers?: Id<"profiles">[];
  }) => Promise<void>;
  isUploading: boolean;
  uploadProgress: number;
}

export function UploadDialog({
  open,
  onOpenChange,
  file,
  categories,
  onUpload,
  isUploading,
  uploadProgress,
}: UploadDialogProps) {
  const [name, setName] = useState(file.name);
  const [description, setDescription] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [accessLevel, setAccessLevel] = useState<"household" | "admins" | "custom">("household");

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.error("Please enter a document name");
      return;
    }

    await onUpload({
      name: name.trim(),
      description: description.trim() || undefined,
      categories: selectedCategories,
      accessLevel,
    });
  };

  const handleCategoryToggle = (categoryName: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryName)
        ? prev.filter((c) => c !== categoryName)
        : [...prev, categoryName],
    );
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${Math.round((bytes / k ** i) * 100) / 100} ${sizes[i]}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]" data-testid="upload-dialog">
        <DialogHeader>
          <DialogTitle>Upload Document</DialogTitle>
          <DialogDescription>
            Add details for your document before uploading to the vault.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* File Info */}
          <div
            className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg"
            data-testid="upload-file-info"
          >
            <FileText className="h-8 w-8 text-primary" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{file.name}</p>
              <p className="text-xs text-muted-foreground">
                {formatFileSize(file.size)} • {file.type || "Unknown type"}
              </p>
            </div>
          </div>

          {/* Document Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Document Name *</Label>
            <Input
              id="name"
              data-testid="upload-name-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter document name"
              disabled={isUploading}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              data-testid="upload-description-input"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add a description (optional)"
              disabled={isUploading}
              rows={3}
            />
          </div>

          {/* Categories */}
          <div className="space-y-2">
            <Label>Categories</Label>
            <div className="flex flex-wrap gap-2" data-testid="upload-categories">
              {categories.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No categories yet. Create some in the Category Manager.
                </p>
              ) : (
                categories.map((category) => (
                  <Badge
                    key={category._id}
                    data-testid={`upload-category-${category.name.toLowerCase().replace(/\s+/g, "-")}`}
                    variant={selectedCategories.includes(category.name) ? "default" : "outline"}
                    className="cursor-pointer hover:bg-primary/90"
                    onClick={() => handleCategoryToggle(category.name)}
                  >
                    {category.name}
                    {selectedCategories.includes(category.name) && <X className="h-3 w-3 ml-1" />}
                  </Badge>
                ))
              )}
            </div>
          </div>

          {/* Access Level */}
          <div className="space-y-2">
            <Label htmlFor="access">Access Level</Label>
            <Select
              value={accessLevel}
              onValueChange={(value) => setAccessLevel(value as "household" | "admins" | "custom")}
              disabled={isUploading}
            >
              <SelectTrigger id="access">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="household">All Household Members</SelectItem>
                <SelectItem value="admins">Admins Only (Owners & Stewards)</SelectItem>
                <SelectItem value="custom">Custom (Select specific members)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {accessLevel === "household" && "All household members can view this document"}
              {accessLevel === "admins" && "Only owners and stewards can view this document"}
              {accessLevel === "custom" && "You can select specific members after upload"}
            </p>
          </div>

          {/* Upload Progress */}
          {isUploading && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Uploading...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isUploading}
            data-testid="upload-cancel-button"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isUploading || !name.trim()}
            data-testid="upload-submit-button"
          >
            {isUploading ? "Uploading..." : "Upload Document"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
