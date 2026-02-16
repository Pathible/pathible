"use client";

import { useMutation, useQuery } from "convex/react";
import { Archive, Compass, Loader2, MoreHorizontal, Plus, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { AdminPageHeader } from "@/app/(auth)/admin/components/admin-page-header";
import { AdminStatusBadge } from "@/app/(auth)/admin/components/admin-status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { formatDate } from "@/lib/date-utils";

function generateKeyFromName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function ToursList() {
  const router = useRouter();
  const tours = useQuery(api.tours.listAll);
  const createTour = useMutation(api.tours.create);
  const archiveTour = useMutation(api.tours.archive);
  const seedWelcomeTour = useMutation(api.tours.seedWelcomeTour);
  const seedFeatureTours = useMutation(api.tours.seedFeatureTours);

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [archiveDialogOpen, setArchiveDialogOpen] = useState(false);
  const [tourToArchive, setTourToArchive] = useState<{
    id: Id<"tours">;
    name: string;
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [newTourKey, setNewTourKey] = useState("");
  const [newTourName, setNewTourName] = useState("");
  const [newTourDescription, setNewTourDescription] = useState("");

  const handleCreate = async () => {
    if (!newTourName.trim()) {
      toast.error("Validation Error", {
        description: "Name is required",
      });
      return;
    }

    const key = generateKeyFromName(newTourName);
    if (!key) {
      toast.error("Invalid Name", {
        description: "Name must contain at least one letter or number",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await createTour({
        key,
        name: newTourName.trim(),
        description: newTourDescription.trim() || undefined,
      });
      toast.success("Tour Created", {
        description: `Tour "${newTourName}" has been created as a draft.`,
      });
      setCreateDialogOpen(false);
      setNewTourKey("");
      setNewTourName("");
      setNewTourDescription("");
    } catch (error) {
      toast.error("Error", {
        description: error instanceof Error ? error.message : "Failed to create tour",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleArchive = async () => {
    if (!tourToArchive) return;

    setIsSubmitting(true);
    try {
      await archiveTour({ tourId: tourToArchive.id });
      toast.success("Tour Archived", {
        description: `Tour "${tourToArchive.name}" has been archived.`,
      });
      setArchiveDialogOpen(false);
      setTourToArchive(null);
    } catch (error) {
      toast.error("Error", {
        description: error instanceof Error ? error.message : "Failed to archive tour",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const openArchiveDialog = (tour: { _id: Id<"tours">; name: string }) => {
    setTourToArchive({ id: tour._id, name: tour.name });
    setArchiveDialogOpen(true);
  };

  const handleSeedWelcomeTour = async () => {
    setIsSubmitting(true);
    try {
      await seedWelcomeTour({});
      toast.success("Welcome Tour Created", {
        description: "The Welcome Tour has been seeded with 9 steps and published.",
      });
    } catch (error) {
      toast.error("Error", {
        description: error instanceof Error ? error.message : "Failed to seed Welcome Tour",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSeedFeatureTours = async () => {
    setIsSubmitting(true);
    try {
      await seedFeatureTours({});
      toast.success("Feature Tours Created", {
        description:
          "5 feature tours (Vault, Wisdom, Family, Financial, Legacy) have been created with 11 steps total.",
      });
    } catch (error) {
      toast.error("Error", {
        description: error instanceof Error ? error.message : "Failed to seed Feature Tours",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (tours === undefined) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Guided Tours"
        subtitle="Guiding families through their first steps"
        actions={
          <>
            <Button variant="outline" onClick={handleSeedWelcomeTour} disabled={isSubmitting}>
              <Sparkles className="mr-2 h-4 w-4" />
              Seed Welcome
            </Button>
            <Button variant="outline" onClick={handleSeedFeatureTours} disabled={isSubmitting}>
              <Sparkles className="mr-2 h-4 w-4" />
              Seed Features
            </Button>
            <Button onClick={() => setCreateDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Tour
            </Button>
          </>
        }
      />

      {/* Tours Table */}
      <Card className="border-border">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2.5">
            <div className="rounded-lg bg-primary/10 p-1.5">
              <Compass className="h-4 w-4 text-primary" />
            </div>
            <CardTitle className="font-crimson text-xl">All Tours</CardTitle>
          </div>
          <CardDescription>
            {tours.length} tour{tours.length !== 1 ? "s" : ""} helping families find their way
          </CardDescription>
        </CardHeader>
        <CardContent>
          {tours.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Compass className="h-8 w-8 text-muted-foreground/30 mb-2" />
              <h3 className="font-crimson text-lg font-medium">No tours yet</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Create your first tour to guide families through the app.
              </p>
              <Button className="mt-4" onClick={() => setCreateDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create Tour
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Key</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Version</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Updated</TableHead>
                  <TableHead className="w-[80px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tours.map((tour) => (
                  <TableRow
                    key={tour._id}
                    className="cursor-pointer hover:bg-muted/30"
                    onClick={() => router.push(`/admin/tours/${tour._id}`)}
                  >
                    <TableCell className="font-medium">{tour.name}</TableCell>
                    <TableCell>
                      <code className="rounded-md bg-muted px-1.5 py-0.5 text-xs font-mono">
                        {tour.key}
                      </code>
                    </TableCell>
                    <TableCell>
                      <AdminStatusBadge type="contentStatus" value={tour.status}>
                        {tour.status}
                      </AdminStatusBadge>
                    </TableCell>
                    <TableCell className="tabular-nums">v{tour.version}</TableCell>
                    <TableCell className="tabular-nums">{tour.priority}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(tour.updatedAt)}
                    </TableCell>
                    <TableCell>
                      {tour.status !== "archived" && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Open menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                openArchiveDialog(tour);
                              }}
                              className="text-destructive focus:text-destructive"
                            >
                              <Archive className="mr-2 h-4 w-4" />
                              Archive
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create Tour Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-crimson">Create New Tour</DialogTitle>
            <DialogDescription>
              Create a new guided tour. It will start as a draft and can be published when ready.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="tour-name">Name</Label>
              <Input
                id="tour-name"
                placeholder="Welcome Tour"
                value={newTourName}
                onChange={(e) => {
                  const name = e.target.value;
                  setNewTourName(name);
                  setNewTourKey(generateKeyFromName(name));
                }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tour-key">Key</Label>
              <Input
                id="tour-key"
                placeholder="welcome-tour"
                value={newTourKey}
                readOnly
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">
                Auto-generated from name. Used as unique identifier.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="tour-description">Description (optional)</Label>
              <Textarea
                id="tour-description"
                placeholder="A brief description of this tour..."
                value={newTourDescription}
                onChange={(e) => setNewTourDescription(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Tour"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Archive Confirmation Dialog */}
      <Dialog open={archiveDialogOpen} onOpenChange={setArchiveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-crimson">Archive Tour</DialogTitle>
            <DialogDescription>
              Are you sure you want to archive &quot;{tourToArchive?.name}
              &quot;? Archived tours will no longer appear to users.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setArchiveDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleArchive} disabled={isSubmitting}>
              {isSubmitting ? "Archiving..." : "Archive Tour"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
