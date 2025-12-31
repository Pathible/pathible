"use client";

import { useMutation } from "convex/react";
import { Home, MoreVertical, Pencil, Plus, Trash } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

interface Property {
  _id: Id<"properties">;
  name: string;
  type: "primary_residence" | "secondary_residence" | "rental" | "land" | "commercial" | "other";
  address?: string;
  estimatedValue?: number;
  notes?: string;
}

interface PropertyManagerProps {
  properties: Property[];
  householdId: Id<"households">;
  isLoading: boolean;
}

export function PropertyManager({ properties, householdId, isLoading }: PropertyManagerProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    type: "primary_residence" as Property["type"],
    address: "",
    estimatedValue: "",
    notes: "",
  });

  const createProperty = useMutation(api.financial.createProperty);
  const updateProperty = useMutation(api.financial.updateProperty);
  const deleteProperty = useMutation(api.financial.deleteProperty);

  const handleOpenDialog = (property?: Property) => {
    if (property) {
      setEditingProperty(property);
      setFormData({
        name: property.name,
        type: property.type,
        address: property.address || "",
        estimatedValue: property.estimatedValue?.toString() || "",
        notes: property.notes || "",
      });
    } else {
      setEditingProperty(null);
      setFormData({
        name: "",
        type: "primary_residence",
        address: "",
        estimatedValue: "",
        notes: "",
      });
    }
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingProperty) {
        await updateProperty({
          propertyId: editingProperty._id,
          name: formData.name,
          type: formData.type,
          address: formData.address || undefined,
          estimatedValue: formData.estimatedValue ? parseFloat(formData.estimatedValue) : undefined,
          notes: formData.notes || undefined,
        });
        toast.success("Property updated successfully");
      } else {
        await createProperty({
          householdId,
          name: formData.name,
          type: formData.type,
          address: formData.address || undefined,
          estimatedValue: formData.estimatedValue ? parseFloat(formData.estimatedValue) : undefined,
          notes: formData.notes || undefined,
        });
        toast.success("Property created successfully");
      }
      setDialogOpen(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save property");
    }
  };

  const handleDelete = async (propertyId: Id<"properties">) => {
    if (!confirm("Are you sure you want to delete this property?")) return;

    try {
      await deleteProperty({ propertyId });
      toast.success("Property deleted successfully");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete property");
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const getPropertyTypeLabel = (type: Property["type"]) => {
    const labels: Record<Property["type"], string> = {
      primary_residence: "Primary Residence",
      secondary_residence: "Secondary Residence",
      rental: "Rental",
      land: "Land",
      commercial: "Commercial",
      other: "Other",
    };
    return labels[type];
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Home className="h-5 w-5" />
            Properties
          </CardTitle>
          <CardDescription>Track your real estate holdings</CardDescription>
          <CardAction>
            <Button onClick={() => handleOpenDialog()} data-tour="financial-add-property">
              <Plus className="h-4 w-4" />
              Add Property
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent>
          {isLoading ? null : properties.length === 0 ? (
            <div className="text-center py-12">
              <Home className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No properties yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Start by adding your first property
              </p>
              <Button onClick={() => handleOpenDialog()}>
                <Plus className="h-4 w-4 mr-2" />
                Add Property
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {properties.map((property) => (
                <div
                  key={property._id}
                  className="flex items-start justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold">{property.name}</h4>
                      <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                        {getPropertyTypeLabel(property.type)}
                      </span>
                    </div>
                    {property.address && (
                      <p className="text-sm text-muted-foreground mb-1">{property.address}</p>
                    )}
                    {property.notes && (
                      <p className="text-xs text-muted-foreground line-clamp-2">{property.notes}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-4">
                    {property.estimatedValue !== undefined && (
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">Estimated Value</p>
                        <p className="font-semibold">{formatCurrency(property.estimatedValue)}</p>
                      </div>
                    )}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleOpenDialog(property)}>
                          <Pencil className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDelete(property._id)}
                          className="text-destructive"
                        >
                          <Trash className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingProperty ? "Edit Property" : "Add New Property"}</DialogTitle>
            <DialogDescription>
              {editingProperty ? "Update your property information" : "Add a new property to track"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Property Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Family Home"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Property Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) =>
                    setFormData({ ...formData, type: value as Property["type"] })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="primary_residence">Primary Residence</SelectItem>
                    <SelectItem value="secondary_residence">Secondary Residence</SelectItem>
                    <SelectItem value="rental">Rental</SelectItem>
                    <SelectItem value="land">Land</SelectItem>
                    <SelectItem value="commercial">Commercial</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address (Optional)</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="123 Main St, City, ST 12345"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="estimatedValue">Estimated Value (Optional)</Label>
                <Input
                  id="estimatedValue"
                  type="number"
                  step="1000"
                  value={formData.estimatedValue}
                  onChange={(e) => setFormData({ ...formData, estimatedValue: e.target.value })}
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Additional information about this property"
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">{editingProperty ? "Update" : "Create"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
