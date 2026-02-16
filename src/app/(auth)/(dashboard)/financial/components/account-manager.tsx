"use client";

import { useMutation } from "convex/react";
import { MoreHorizontal, Pencil, Plus, Trash2, Wallet } from "lucide-react";
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
  DropdownMenuSeparator,
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

interface Account {
  _id: Id<"financialAccounts">;
  name: string;
  type: "checking" | "savings" | "investment" | "retirement" | "crypto" | "other";
  institution: string;
  accountNumberLast4?: string;
  balance?: number;
  currency: string;
}

interface AccountManagerProps {
  accounts: Account[];
  householdId: Id<"households">;
  isLoading: boolean;
}

export function AccountManager({ accounts, householdId, isLoading }: AccountManagerProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [accountToDelete, setAccountToDelete] = useState<{
    id: Id<"financialAccounts">;
    name: string;
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    type: "checking" as Account["type"],
    institution: "",
    accountNumberLast4: "",
    balance: "",
  });

  const createAccount = useMutation(api.financial.createAccount);
  const updateAccount = useMutation(api.financial.updateAccount);
  const deleteAccount = useMutation(api.financial.deleteAccount);

  const handleOpenDialog = (account?: Account) => {
    if (account) {
      setEditingAccount(account);
      setFormData({
        name: account.name,
        type: account.type,
        institution: account.institution,
        accountNumberLast4: account.accountNumberLast4 || "",
        balance: account.balance?.toString() || "",
      });
    } else {
      setEditingAccount(null);
      setFormData({
        name: "",
        type: "checking",
        institution: "",
        accountNumberLast4: "",
        balance: "",
      });
    }
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingAccount) {
        await updateAccount({
          accountId: editingAccount._id,
          name: formData.name,
          type: formData.type,
          institution: formData.institution,
          accountNumberLast4: formData.accountNumberLast4 || undefined,
          balance: formData.balance ? parseFloat(formData.balance) : undefined,
        });
        toast.success("Account updated successfully");
      } else {
        await createAccount({
          householdId,
          name: formData.name,
          type: formData.type,
          institution: formData.institution,
          accountNumberLast4: formData.accountNumberLast4 || undefined,
          balance: formData.balance ? parseFloat(formData.balance) : undefined,
        });
        toast.success("Account created successfully");
      }
      setDialogOpen(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save account");
    }
  };

  const openDeleteConfirm = (accountId: Id<"financialAccounts">, accountName: string) => {
    setAccountToDelete({ id: accountId, name: accountName });
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!accountToDelete) return;

    setIsDeleting(true);
    try {
      await deleteAccount({ accountId: accountToDelete.id });
      toast.success("Account deleted successfully");
      setDeleteDialogOpen(false);
      setAccountToDelete(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete account");
    } finally {
      setIsDeleting(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(value);
  };

  const getAccountTypeLabel = (type: Account["type"]) => {
    const labels: Record<Account["type"], string> = {
      checking: "Checking",
      savings: "Savings",
      investment: "Investment",
      retirement: "Retirement",
      crypto: "Crypto",
      other: "Other",
    };
    return labels[type];
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Financial Accounts
          </CardTitle>
          <CardDescription>The accounts your family should know about</CardDescription>
          <CardAction>
            <Button onClick={() => handleOpenDialog()} data-tour="financial-add-account">
              <Plus className="h-4 w-4" />
              Add Account
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent>
          {isLoading ? null : accounts.length === 0 ? (
            <div className="text-center py-12">
              <Wallet className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nothing here yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Add the accounts your family will need to know about someday
              </p>
              <Button onClick={() => handleOpenDialog()}>
                <Plus className="h-4 w-4 mr-2" />
                Add Account
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {accounts.map((account) => (
                <div
                  key={account._id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold">{account.name}</h4>
                      <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                        {getAccountTypeLabel(account.type)}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{account.institution}</p>
                    {account.accountNumberLast4 && (
                      <p className="text-xs text-muted-foreground">
                        ****{account.accountNumberLast4}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-4">
                    {account.balance !== undefined && (
                      <div className="text-right">
                        <p className="font-semibold">{formatCurrency(account.balance)}</p>
                      </div>
                    )}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Actions</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleOpenDialog(account)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => openDeleteConfirm(account._id, account.name)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
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
            <DialogTitle>{editingAccount ? "Edit Account" : "Add New Account"}</DialogTitle>
            <DialogDescription>
              {editingAccount
                ? "Update the details for this account"
                : "Record the basics so your family can find this when they need it"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Account Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Main Checking"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Account Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) =>
                    setFormData({ ...formData, type: value as Account["type"] })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="checking">Checking</SelectItem>
                    <SelectItem value="savings">Savings</SelectItem>
                    <SelectItem value="investment">Investment</SelectItem>
                    <SelectItem value="retirement">Retirement</SelectItem>
                    <SelectItem value="crypto">Crypto</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="institution">Institution</Label>
                <Input
                  id="institution"
                  value={formData.institution}
                  onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                  placeholder="e.g., Chase Bank"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="accountNumberLast4">Last 4 Digits (Optional)</Label>
                <Input
                  id="accountNumberLast4"
                  value={formData.accountNumberLast4}
                  onChange={(e) => setFormData({ ...formData, accountNumberLast4: e.target.value })}
                  placeholder="1234"
                  maxLength={4}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="balance">Current Balance (Optional)</Label>
                <Input
                  id="balance"
                  type="number"
                  step="0.01"
                  value={formData.balance}
                  onChange={(e) => setFormData({ ...formData, balance: e.target.value })}
                  placeholder="0.00"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">{editingAccount ? "Update" : "Create"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove this account?</AlertDialogTitle>
            <AlertDialogDescription>
              Remove {accountToDelete?.name} from your records? This can&apos;t be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
