"use client";

import { useMutation } from "convex/react";
import { MoreVertical, Pencil, Plus, Shield, Trash } from "lucide-react";
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
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

interface Insurance {
  _id: Id<"insurancePolicies">;
  type:
    | "life"
    | "health"
    | "home"
    | "auto"
    | "disability"
    | "long_term_care"
    | "umbrella"
    | "other";
  provider: string;
  policyNumberLast4?: string;
  coverageAmount?: number;
  premiumAmount?: number;
  premiumFrequency?: "monthly" | "quarterly" | "semi_annual" | "annual";
}

interface InsuranceManagerProps {
  insurance: Insurance[];
  householdId: Id<"households">;
  isLoading: boolean;
}

export function InsuranceManager({ insurance, householdId, isLoading }: InsuranceManagerProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingInsurance, setEditingInsurance] = useState<Insurance | null>(null);
  const [formData, setFormData] = useState({
    type: "life" as Insurance["type"],
    provider: "",
    policyNumberLast4: "",
    coverageAmount: "",
    premiumAmount: "",
    premiumFrequency: "monthly" as Insurance["premiumFrequency"],
  });

  const createInsurance = useMutation(api.financial.createInsurancePolicy);
  const updateInsurance = useMutation(api.financial.updateInsurancePolicy);
  const deleteInsurance = useMutation(api.financial.deleteInsurancePolicy);

  const handleOpenDialog = (ins?: Insurance) => {
    if (ins) {
      setEditingInsurance(ins);
      setFormData({
        type: ins.type,
        provider: ins.provider,
        policyNumberLast4: ins.policyNumberLast4 || "",
        coverageAmount: ins.coverageAmount?.toString() || "",
        premiumAmount: ins.premiumAmount?.toString() || "",
        premiumFrequency: ins.premiumFrequency || "monthly",
      });
    } else {
      setEditingInsurance(null);
      setFormData({
        type: "life",
        provider: "",
        policyNumberLast4: "",
        coverageAmount: "",
        premiumAmount: "",
        premiumFrequency: "monthly",
      });
    }
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingInsurance) {
        await updateInsurance({
          policyId: editingInsurance._id,
          type: formData.type,
          provider: formData.provider,
          policyNumberLast4: formData.policyNumberLast4 || undefined,
          coverageAmount: formData.coverageAmount ? parseFloat(formData.coverageAmount) : undefined,
          premiumAmount: formData.premiumAmount ? parseFloat(formData.premiumAmount) : undefined,
          premiumFrequency: formData.premiumFrequency,
        });
        toast.success("Insurance policy updated successfully");
      } else {
        await createInsurance({
          householdId,
          type: formData.type,
          provider: formData.provider,
          policyNumberLast4: formData.policyNumberLast4 || undefined,
          coverageAmount: formData.coverageAmount ? parseFloat(formData.coverageAmount) : undefined,
          premiumAmount: formData.premiumAmount ? parseFloat(formData.premiumAmount) : undefined,
          premiumFrequency: formData.premiumFrequency,
        });
        toast.success("Insurance policy created successfully");
      }
      setDialogOpen(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save insurance policy");
    }
  };

  const handleDelete = async (policyId: Id<"insurancePolicies">) => {
    if (!confirm("Are you sure you want to delete this insurance policy?")) return;

    try {
      await deleteInsurance({ policyId });
      toast.success("Insurance policy deleted successfully");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete insurance policy");
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

  const getInsuranceTypeLabel = (type: Insurance["type"]) => {
    const labels: Record<Insurance["type"], string> = {
      life: "Life",
      health: "Health",
      home: "Home",
      auto: "Auto",
      disability: "Disability",
      long_term_care: "Long-term Care",
      umbrella: "Umbrella",
      other: "Other",
    };
    return labels[type];
  };

  const getFrequencyLabel = (frequency?: Insurance["premiumFrequency"]) => {
    if (!frequency) return "";
    const labels: Record<NonNullable<Insurance["premiumFrequency"]>, string> = {
      monthly: "Monthly",
      quarterly: "Quarterly",
      semi_annual: "Semi-Annual",
      annual: "Annual",
    };
    return labels[frequency];
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Insurance Policies
          </CardTitle>
          <CardDescription>Manage your insurance coverage</CardDescription>
          <CardAction>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="h-4 w-4" />
              Add Policy
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent>
          {isLoading ? null : insurance.length === 0 ? (
            <div className="text-center py-12">
              <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No insurance policies yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Start by adding your first insurance policy
              </p>
              <Button onClick={() => handleOpenDialog()}>
                <Plus className="h-4 w-4 mr-2" />
                Add Policy
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {insurance.map((ins) => (
                <div
                  key={ins._id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold">{getInsuranceTypeLabel(ins.type)} Insurance</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">{ins.provider}</p>
                    {ins.policyNumberLast4 && (
                      <p className="text-xs text-muted-foreground">****{ins.policyNumberLast4}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      {ins.coverageAmount !== undefined && (
                        <div className="mb-1">
                          <p className="text-xs text-muted-foreground">Coverage</p>
                          <p className="font-semibold">{formatCurrency(ins.coverageAmount)}</p>
                        </div>
                      )}
                      {ins.premiumAmount !== undefined && (
                        <div>
                          <p className="text-xs text-muted-foreground">Premium</p>
                          <p className="text-sm">
                            {formatCurrency(ins.premiumAmount)}{" "}
                            {ins.premiumFrequency && (
                              <span className="text-xs text-muted-foreground">
                                {getFrequencyLabel(ins.premiumFrequency)}
                              </span>
                            )}
                          </p>
                        </div>
                      )}
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleOpenDialog(ins)}>
                          <Pencil className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDelete(ins._id)}
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
            <DialogTitle>
              {editingInsurance ? "Edit Insurance Policy" : "Add New Insurance Policy"}
            </DialogTitle>
            <DialogDescription>
              {editingInsurance
                ? "Update your insurance policy information"
                : "Add a new insurance policy to track"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="type">Insurance Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) =>
                    setFormData({ ...formData, type: value as Insurance["type"] })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="life">Life</SelectItem>
                    <SelectItem value="health">Health</SelectItem>
                    <SelectItem value="home">Home</SelectItem>
                    <SelectItem value="auto">Auto</SelectItem>
                    <SelectItem value="disability">Disability</SelectItem>
                    <SelectItem value="long_term_care">Long-term Care</SelectItem>
                    <SelectItem value="umbrella">Umbrella</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="provider">Provider</Label>
                <Input
                  id="provider"
                  value={formData.provider}
                  onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
                  placeholder="e.g., State Farm"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="policyNumberLast4">Policy Number Last 4 (Optional)</Label>
                <Input
                  id="policyNumberLast4"
                  value={formData.policyNumberLast4}
                  onChange={(e) => setFormData({ ...formData, policyNumberLast4: e.target.value })}
                  placeholder="1234"
                  maxLength={4}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="coverageAmount">Coverage Amount (Optional)</Label>
                <Input
                  id="coverageAmount"
                  type="number"
                  step="1000"
                  value={formData.coverageAmount}
                  onChange={(e) => setFormData({ ...formData, coverageAmount: e.target.value })}
                  placeholder="0"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="premiumAmount">Premium Amount (Optional)</Label>
                  <Input
                    id="premiumAmount"
                    type="number"
                    step="0.01"
                    value={formData.premiumAmount}
                    onChange={(e) => setFormData({ ...formData, premiumAmount: e.target.value })}
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="premiumFrequency">Frequency</Label>
                  <Select
                    value={formData.premiumFrequency}
                    onValueChange={(value) =>
                      setFormData({
                        ...formData,
                        premiumFrequency: value as Insurance["premiumFrequency"],
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="quarterly">Quarterly</SelectItem>
                      <SelectItem value="semi_annual">Semi-Annual</SelectItem>
                      <SelectItem value="annual">Annual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">{editingInsurance ? "Update" : "Create"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
