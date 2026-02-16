"use client";

import { useQuery } from "convex/react";
import { Loader2, Search, X } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

export type RecipientType = "individual" | "all_users" | "by_tier" | "household_owners";

interface RecipientSelectorProps {
  recipientType: RecipientType;
  onRecipientTypeChange: (type: RecipientType) => void;
  selectedTiers: string[];
  onSelectedTiersChange: (tiers: string[]) => void;
  selectedUserIds: Id<"profiles">[];
  onSelectedUserIdsChange: (ids: Id<"profiles">[]) => void;
}

const SUBSCRIPTION_TIERS = [
  { value: "foundations", label: "Foundations" },
  { value: "heritage", label: "Heritage" },
  { value: "legacy", label: "Legacy" },
  { value: "founders", label: "Founders" },
];

export function RecipientSelector({
  recipientType,
  onRecipientTypeChange,
  selectedTiers,
  onSelectedTiersChange,
  selectedUserIds,
  onSelectedUserIdsChange,
}: RecipientSelectorProps) {
  const [userSearch, setUserSearch] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<
    Array<{ _id: Id<"profiles">; firstName: string; lastName: string }>
  >([]);

  // Query for recipient count
  const recipientCount = useQuery(api.adminEmail.getRecipientCount, {
    recipientType,
    tiers: recipientType === "by_tier" ? selectedTiers : undefined,
    userIds: recipientType === "individual" ? selectedUserIds : undefined,
  });

  // Query for user search
  const searchResults = useQuery(
    api.adminEmail.searchUsersForEmail,
    userSearch.length >= 2 ? { search: userSearch } : "skip",
  );

  const handleTierToggle = (tier: string) => {
    if (selectedTiers.includes(tier)) {
      onSelectedTiersChange(selectedTiers.filter((t) => t !== tier));
    } else {
      onSelectedTiersChange([...selectedTiers, tier]);
    }
  };

  const handleUserSelect = (user: { _id: Id<"profiles">; firstName: string; lastName: string }) => {
    if (!selectedUserIds.includes(user._id)) {
      onSelectedUserIdsChange([...selectedUserIds, user._id]);
      setSelectedUsers([...selectedUsers, user]);
    }
    setUserSearch("");
  };

  const handleUserRemove = (userId: Id<"profiles">) => {
    onSelectedUserIdsChange(selectedUserIds.filter((id) => id !== userId));
    setSelectedUsers(selectedUsers.filter((u) => u._id !== userId));
  };

  return (
    <div className="space-y-6">
      {/* Recipient Type Selection */}
      <RadioGroup
        value={recipientType}
        onValueChange={(value) => onRecipientTypeChange(value as RecipientType)}
        className="space-y-3"
      >
        <div className="flex items-center space-x-3">
          <RadioGroupItem value="all_users" id="all_users" />
          <Label htmlFor="all_users" className="cursor-pointer">
            All Users
          </Label>
        </div>

        <div className="flex items-center space-x-3">
          <RadioGroupItem value="household_owners" id="household_owners" />
          <Label htmlFor="household_owners" className="cursor-pointer">
            Household Owners Only
          </Label>
        </div>

        <div className="flex items-center space-x-3">
          <RadioGroupItem value="by_tier" id="by_tier" />
          <Label htmlFor="by_tier" className="cursor-pointer">
            By Subscription Tier
          </Label>
        </div>

        <div className="flex items-center space-x-3">
          <RadioGroupItem value="individual" id="individual" />
          <Label htmlFor="individual" className="cursor-pointer">
            Individual Recipients
          </Label>
        </div>
      </RadioGroup>

      {/* Tier Selection */}
      {recipientType === "by_tier" && (
        <div className="ml-7 space-y-3 rounded-lg border bg-muted/30 p-4">
          <p className="text-sm font-medium">Select subscription tiers:</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {SUBSCRIPTION_TIERS.map((tier) => (
              <div key={tier.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`tier-${tier.value}`}
                  checked={selectedTiers.includes(tier.value)}
                  onCheckedChange={() => handleTierToggle(tier.value)}
                />
                <Label htmlFor={`tier-${tier.value}`} className="cursor-pointer text-sm">
                  {tier.label}
                  {recipientCount?.breakdown?.[tier.value] !== undefined && (
                    <span className="ml-1 text-muted-foreground">
                      ({recipientCount.breakdown[tier.value]})
                    </span>
                  )}
                </Label>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Individual User Selection */}
      {recipientType === "individual" && (
        <div className="ml-7 space-y-3 rounded-lg border bg-muted/30 p-4">
          <p className="text-sm font-medium">Search and select users:</p>

          {/* Selected Users */}
          {selectedUsers.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {selectedUsers.map((user) => (
                <Badge key={user._id} variant="outline" className="gap-1 pr-1">
                  {user.firstName} {user.lastName}
                  <button
                    type="button"
                    onClick={() => handleUserRemove(user._id)}
                    className="ml-1 rounded-full p-0.5 hover:bg-muted"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}

          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              placeholder="Search by name..."
              className="pl-9"
            />
          </div>

          {/* Search Results */}
          {userSearch.length >= 2 && (
            <div className="max-h-48 overflow-auto rounded-md border bg-background">
              {searchResults === undefined ? (
                <div className="flex items-center justify-center p-4">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                </div>
              ) : searchResults.length === 0 ? (
                <p className="p-4 text-center text-sm text-muted-foreground">No users found</p>
              ) : (
                <div className="divide-y">
                  {searchResults
                    .filter((user) => !selectedUserIds.includes(user._id))
                    .map((user) => (
                      <button
                        key={user._id}
                        type="button"
                        onClick={() => handleUserSelect(user)}
                        className="w-full px-4 py-2 text-left text-sm hover:bg-muted"
                      >
                        {user.firstName} {user.lastName}
                      </button>
                    ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Recipient Count Display */}
      <div className="rounded-lg border bg-primary/5 p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Recipients:</span>
          <span className="text-lg font-semibold text-primary">
            {recipientCount === undefined ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              `${recipientCount.count} user${recipientCount.count !== 1 ? "s" : ""}`
            )}
          </span>
        </div>
      </div>
    </div>
  );
}
