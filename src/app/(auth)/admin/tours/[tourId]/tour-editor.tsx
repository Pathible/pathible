"use client";

import { useMutation, useQuery } from "convex/react";
import {
  ArrowLeft,
  ArrowUpDown,
  ChevronUp,
  Eye,
  GripVertical,
  MousePointer2,
  Pencil,
  Plus,
  RefreshCw,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

interface TourEditorProps {
  tourId: Id<"tours">;
}

type TourStatus = "draft" | "published" | "archived";

export function TourEditor({ tourId }: TourEditorProps) {
  const router = useRouter();

  const tour = useQuery(api.tours.get, { tourId });
  const steps = useQuery(api.tours.listSteps, { tourId });

  const updateTour = useMutation(api.tours.update);
  const bumpVersion = useMutation(api.tours.bumpVersion);
  const createStep = useMutation(api.tours.createStep);
  const updateStep = useMutation(api.tours.updateStep);
  const deleteStep = useMutation(api.tours.deleteStep);
  const reorderSteps = useMutation(api.tours.reorderSteps);

  // Tour settings state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<TourStatus>("draft");
  const [priority, setPriority] = useState(100);
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Step dialogs state
  const [stepDialogOpen, setStepDialogOpen] = useState(false);
  const [editingStep, setEditingStep] = useState<Id<"tourSteps"> | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [stepToDelete, setStepToDelete] = useState<{
    id: Id<"tourSteps">;
    title: string;
  } | null>(null);
  const [bumpDialogOpen, setBumpDialogOpen] = useState(false);

  // Step form state
  const [stepKey, setStepKey] = useState("");
  const [stepRoute, setStepRoute] = useState("");
  const [stepAnchorKey, setStepAnchorKey] = useState("");
  const [stepTitle, setStepTitle] = useState("");
  const [stepBody, setStepBody] = useState("");
  const [stepEnabled, setStepEnabled] = useState(true);
  const [stepActivationKey, setStepActivationKey] = useState("");
  const [isSelectingElement, setIsSelectingElement] = useState(false);

  // Listen for element selection from visual builder
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Only accept messages from same origin
      if (event.origin !== window.location.origin) return;

      if (event.data?.type === "TOUR_ELEMENT_SELECTED") {
        const { route, computedKey, selector } = event.data.payload;
        setStepRoute(route);
        setStepAnchorKey(selector);
        // Auto-generate step key from computed key if not editing
        if (!editingStep && !stepKey) {
          setStepKey(computedKey.toLowerCase().replace(/[^a-z0-9-]/g, "-"));
        }
        setIsSelectingElement(false);
        toast.success("Element Selected", {
          description: `Selected element on ${route}`,
        });
      } else if (event.data?.type === "TOUR_SELECTION_CANCELLED") {
        setIsSelectingElement(false);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [editingStep, stepKey]);

  const openVisualSelector = () => {
    setIsSelectingElement(true);
    // Open the app in a new window with tour_builder mode
    const baseUrl = window.location.origin;
    const targetRoute = stepRoute || "/dashboard";
    window.open(
      `${baseUrl}${targetRoute}?tour_builder=1`,
      "tour_builder",
      "width=1200,height=800,menubar=no,toolbar=no,location=no,status=no",
    );
  };

  // Initialize form when tour loads
  useEffect(() => {
    if (tour) {
      setName(tour.name);
      setDescription(tour.description || "");
      setStatus(tour.status);
      setPriority(tour.priority);
      setHasChanges(false);
    }
  }, [tour]);

  // Track changes
  useEffect(() => {
    if (tour) {
      const changed =
        name !== tour.name ||
        description !== (tour.description || "") ||
        status !== tour.status ||
        priority !== tour.priority;
      setHasChanges(changed);
    }
  }, [name, description, status, priority, tour]);

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      await updateTour({
        tourId,
        name: name.trim(),
        description: description.trim() || undefined,
        status,
        priority,
      });
      toast.success("Settings Saved", {
        description: "Tour settings have been updated.",
      });
      setHasChanges(false);
    } catch (error) {
      toast.error("Error", {
        description: error instanceof Error ? error.message : "Failed to save settings",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleBumpVersion = async () => {
    try {
      const newVersion = await bumpVersion({ tourId });
      toast.success("Version Bumped", {
        description: `Tour is now at version ${newVersion}. New steps will use this version.`,
      });
      setBumpDialogOpen(false);
    } catch (error) {
      toast.error("Error", {
        description: error instanceof Error ? error.message : "Failed to bump version",
      });
    }
  };

  const resetStepForm = useCallback(() => {
    setStepKey("");
    setStepRoute("");
    setStepAnchorKey("");
    setStepTitle("");
    setStepBody("");
    setStepEnabled(true);
    setStepActivationKey("");
    setEditingStep(null);
  }, []);

  const openCreateStepDialog = () => {
    resetStepForm();
    setStepDialogOpen(true);
  };

  const openEditStepDialog = (step: {
    _id: Id<"tourSteps">;
    stepKey: string;
    route: string;
    anchorKey: string;
    title: string;
    body: string;
    enabled: boolean;
    activationKey?: string;
  }) => {
    setEditingStep(step._id);
    setStepKey(step.stepKey);
    setStepRoute(step.route);
    setStepAnchorKey(step.anchorKey);
    setStepTitle(step.title);
    setStepBody(step.body);
    setStepEnabled(step.enabled);
    setStepActivationKey(step.activationKey || "");
    setStepDialogOpen(true);
  };

  const handleSaveStep = async () => {
    // Validation
    if (!stepKey.trim() || !stepRoute.trim() || !stepAnchorKey.trim() || !stepTitle.trim()) {
      toast.error("Validation Error", {
        description: "Key, route, anchor key, and title are required",
      });
      return;
    }

    const keyRegex = /^[a-z0-9-]+$/;
    if (!keyRegex.test(stepKey)) {
      toast.error("Invalid Key", {
        description: "Step key must be lowercase letters, numbers, and hyphens only",
      });
      return;
    }

    setIsSaving(true);
    try {
      if (editingStep) {
        await updateStep({
          stepId: editingStep,
          route: stepRoute.trim(),
          anchorKey: stepAnchorKey.trim(),
          title: stepTitle.trim(),
          body: stepBody.trim(),
          enabled: stepEnabled,
          activationKey: stepActivationKey.trim() || undefined,
        });
        toast.success("Step Updated", {
          description: "Tour step has been updated.",
        });
      } else {
        await createStep({
          tourId,
          stepKey: stepKey.trim(),
          route: stepRoute.trim(),
          anchorKey: stepAnchorKey.trim(),
          title: stepTitle.trim(),
          body: stepBody.trim(),
          enabled: stepEnabled,
          activationKey: stepActivationKey.trim() || undefined,
        });
        toast.success("Step Created", {
          description: "New tour step has been created.",
        });
      }
      setStepDialogOpen(false);
      resetStepForm();
    } catch (error) {
      toast.error("Error", {
        description: error instanceof Error ? error.message : "Failed to save step",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteStep = async () => {
    if (!stepToDelete) return;

    setIsSaving(true);
    try {
      await deleteStep({ stepId: stepToDelete.id });
      toast.success("Step Deleted", {
        description: `Step "${stepToDelete.title}" has been deleted.`,
      });
      setDeleteDialogOpen(false);
      setStepToDelete(null);
    } catch (error) {
      toast.error("Error", {
        description: error instanceof Error ? error.message : "Failed to delete step",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const moveStep = async (stepId: Id<"tourSteps">, direction: "up" | "down") => {
    if (!steps) return;

    const currentIndex = steps.findIndex((s) => s._id === stepId);
    if (currentIndex === -1) return;

    const newIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= steps.length) return;

    // Create new order
    const newOrder = [...steps];
    const [movedStep] = newOrder.splice(currentIndex, 1);
    newOrder.splice(newIndex, 0, movedStep);

    try {
      await reorderSteps({
        tourId,
        stepIds: newOrder.map((s) => s._id),
      });
    } catch (error) {
      toast.error("Error", {
        description: error instanceof Error ? error.message : "Failed to reorder steps",
      });
    }
  };

  if (tour === undefined || steps === undefined) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (tour === null) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <h2 className="font-crimson text-2xl font-semibold">Tour Not Found</h2>
        <p className="mt-2 text-muted-foreground">
          The tour you&apos;re looking for doesn&apos;t exist or has been deleted.
        </p>
        <Button asChild className="mt-4">
          <Link href="/admin/tours">Back to Tours</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin/tours">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="font-crimson text-3xl font-semibold">{tour.name}</h1>
            <p className="text-muted-foreground">
              <code className="rounded bg-zinc-200 px-1.5 py-0.5 text-sm text-zinc-800 dark:bg-zinc-700 dark:text-zinc-100">
                {tour.key}
              </code>
              <span className="mx-2">•</span>
              Version {tour.version}
            </p>
          </div>
        </div>
        <Badge
          variant={
            tour.status === "published"
              ? "default"
              : tour.status === "draft"
                ? "secondary"
                : "outline"
          }
        >
          {tour.status}
        </Badge>
      </div>

      {/* Tour Settings */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="font-crimson text-xl">Tour Settings</CardTitle>
          <CardDescription>Configure the basic settings for this tour</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as TourStatus)}>
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
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Input
                id="priority"
                type="number"
                value={priority}
                onChange={(e) => setPriority(Number(e.target.value))}
              />
              <p className="text-xs text-muted-foreground">
                Lower numbers are shown first. Default is 100.
              </p>
            </div>
            <div className="space-y-2">
              <Label>Version</Label>
              <div className="flex items-center gap-2">
                <Input value={`v${tour.version}`} disabled className="w-24" />
                <Button variant="outline" onClick={() => setBumpDialogOpen(true)}>
                  <ChevronUp className="mr-2 h-4 w-4" />
                  Bump Version
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Bump to re-show new steps to users who dismissed the tour.
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" disabled={!hasChanges} onClick={() => router.refresh()}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Reset
            </Button>
            <Button disabled={!hasChanges || isSaving} onClick={handleSaveSettings}>
              {isSaving ? "Saving..." : "Save Settings"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tour Steps */}
      <Card className="border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="font-crimson text-xl">Tour Steps</CardTitle>
              <CardDescription>
                {steps.length} step{steps.length !== 1 ? "s" : ""} in this tour
              </CardDescription>
            </div>
            <Button onClick={openCreateStepDialog}>
              <Plus className="mr-2 h-4 w-4" />
              Add Step
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {steps.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <ArrowUpDown className="h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-4 font-crimson text-lg font-medium">No steps yet</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Add steps to guide users through this tour.
              </p>
              <Button className="mt-4" onClick={openCreateStepDialog}>
                <Plus className="mr-2 h-4 w-4" />
                Add First Step
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">Order</TableHead>
                  <TableHead className="w-[80px]">Enabled</TableHead>
                  <TableHead>Route</TableHead>
                  <TableHead>Anchor Key</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Version</TableHead>
                  <TableHead className="w-[120px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {steps.map((step, index) => (
                  <TableRow key={step._id}>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <GripVertical className="h-4 w-4 text-muted-foreground" />
                        <div className="flex flex-col">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-5 w-5"
                            disabled={index === 0}
                            onClick={() => moveStep(step._id, "up")}
                          >
                            <ChevronUp className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-5 w-5 rotate-180"
                            disabled={index === steps.length - 1}
                            onClick={() => moveStep(step._id, "down")}
                          >
                            <ChevronUp className="h-3 w-3" />
                          </Button>
                        </div>
                        <span className="text-sm font-medium">{step.order + 1}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={step.enabled}
                        onCheckedChange={async (checked) => {
                          try {
                            await updateStep({ stepId: step._id, enabled: checked });
                          } catch {
                            toast.error("Failed to update step");
                          }
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <code className="rounded bg-zinc-200 px-1.5 py-0.5 text-xs text-zinc-800 dark:bg-zinc-700 dark:text-zinc-100">
                        {step.route}
                      </code>
                    </TableCell>
                    <TableCell>
                      <code className="rounded bg-zinc-200 px-1.5 py-0.5 text-xs text-zinc-800 dark:bg-zinc-700 dark:text-zinc-100">
                        {step.anchorKey}
                      </code>
                    </TableCell>
                    <TableCell className="font-medium">{step.title}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        v{step.versionIntroduced}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => openEditStepDialog(step)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                          <Link
                            href={`/admin/tours/${tourId}/preview?step=${step._id}`}
                            target="_blank"
                          >
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => {
                            setStepToDelete({ id: step._id, title: step.title });
                            setDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Step Create/Edit Dialog */}
      <Dialog open={stepDialogOpen} onOpenChange={setStepDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingStep ? "Edit Step" : "Add Step"}</DialogTitle>
            <DialogDescription>
              {editingStep
                ? "Update this tour step"
                : "Add a new step to this tour. It will be added at the end."}
            </DialogDescription>
          </DialogHeader>
          {/* Visual Element Selector */}
          <div className="rounded-lg border border-dashed border-primary/50 bg-primary/5 p-4">
            <div className="flex items-start gap-3">
              <div className="rounded-full bg-primary/10 p-2">
                <MousePointer2 className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-foreground">Visual Element Selector</h4>
                <p className="mt-1 text-sm text-muted-foreground">
                  Click the button below to open the app and visually select an element. The route
                  and anchor will be filled automatically.
                </p>
                <Button
                  type="button"
                  variant="outline"
                  className="mt-3"
                  onClick={openVisualSelector}
                  disabled={isSelectingElement}
                >
                  <MousePointer2 className="mr-2 h-4 w-4" />
                  {isSelectingElement ? "Waiting for selection..." : "Select Element Visually"}
                </Button>
              </div>
            </div>
          </div>

          <div className="grid gap-4 py-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="step-key">Step Key</Label>
              <Input
                id="step-key"
                placeholder="welcome-message"
                value={stepKey}
                onChange={(e) => setStepKey(e.target.value.toLowerCase())}
                disabled={!!editingStep}
              />
              <p className="text-xs text-muted-foreground">
                Unique identifier within this tour. Cannot be changed after creation.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="step-route">Route</Label>
              <Input
                id="step-route"
                placeholder="/dashboard"
                value={stepRoute}
                onChange={(e) => setStepRoute(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Page where this step appears (auto-filled by visual selector)
              </p>
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="step-anchor">Element Selector</Label>
              <Input
                id="step-anchor"
                placeholder="[data-testid='dashboard-stats']"
                value={stepAnchorKey}
                onChange={(e) => setStepAnchorKey(e.target.value)}
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                CSS selector for the target element (auto-filled by visual selector)
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="step-activation">Activation Key (optional)</Label>
              <Input
                id="step-activation"
                placeholder=""
                value={stepActivationKey}
                onChange={(e) => setStepActivationKey(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Optional key to trigger this step programmatically
              </p>
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="step-title">Title</Label>
              <Input
                id="step-title"
                placeholder="Welcome to Pathible"
                value={stepTitle}
                onChange={(e) => setStepTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="step-body">Body</Label>
              <Textarea
                id="step-body"
                placeholder="This is where you'll find all your important information..."
                value={stepBody}
                onChange={(e) => setStepBody(e.target.value)}
                rows={4}
              />
              <p className="text-xs text-muted-foreground">Supports markdown formatting</p>
            </div>
            <div className="flex items-center gap-2 sm:col-span-2">
              <Switch id="step-enabled" checked={stepEnabled} onCheckedChange={setStepEnabled} />
              <Label htmlFor="step-enabled">Enabled</Label>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setStepDialogOpen(false);
                resetStepForm();
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveStep} disabled={isSaving}>
              {isSaving ? "Saving..." : editingStep ? "Update Step" : "Add Step"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Step Confirmation */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Step</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{stepToDelete?.title}&quot;? This action cannot
              be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteStep} disabled={isSaving}>
              {isSaving ? "Deleting..." : "Delete Step"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bump Version Confirmation */}
      <Dialog open={bumpDialogOpen} onOpenChange={setBumpDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bump Tour Version</DialogTitle>
            <DialogDescription>
              This will increment the tour version from v{tour.version} to v{tour.version + 1}.
              <br />
              <br />
              New steps added after bumping will automatically get the new version. Users who
              dismissed this tour will see new steps (those with versionIntroduced {`>`} their
              lastSeenVersion).
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBumpDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleBumpVersion}>Bump to v{tour.version + 1}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
