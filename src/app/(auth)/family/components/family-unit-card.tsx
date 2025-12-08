"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { Id } from "@/convex/_generated/dataModel";

interface FamilyMember {
  _id: Id<"familyMembers">;
  firstName: string;
  lastName: string;
  gender?: "male" | "female" | "non_binary" | "prefer_not_to_say" | "other" | undefined;
  avatarUrl?: string;
}

interface FamilyUnit {
  _id: Id<"familyUnits">;
  name: string;
  relationshipToHousehold?: string;
  isPrimary: boolean;
  memberCount: number;
  memberPreview: FamilyMember[];
}

interface FamilyUnitCardProps {
  unit: FamilyUnit;
  onClick: () => void;
}

export function FamilyUnitCard({ unit, onClick }: FamilyUnitCardProps) {
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName[0] || ""}${lastName[0] || ""}`.toUpperCase();
  };

  const getAvatarColor = (gender?: string) => {
    if (gender === "male") return "bg-blue-500";
    if (gender === "female") return "bg-pink-500";
    return "bg-gray-500";
  };

  return (
    <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={onClick}>
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="space-y-1 flex-1 min-w-0">
              <h3 className="font-semibold text-lg truncate">{unit.name}</h3>
              {unit.relationshipToHousehold && (
                <p className="text-sm text-muted-foreground">{unit.relationshipToHousehold}</p>
              )}
            </div>
            {unit.isPrimary && (
              <Badge className="bg-green-600 hover:bg-green-700 ml-2 shrink-0">Primary</Badge>
            )}
          </div>

          {/* Member Avatars */}
          <div className="flex gap-2">
            {unit.memberPreview.map((member) => (
              <Avatar key={member._id} className="h-10 w-10">
                <AvatarFallback
                  className={`${getAvatarColor(member.gender)} text-white text-xs font-medium`}
                >
                  {getInitials(member.firstName, member.lastName)}
                </AvatarFallback>
              </Avatar>
            ))}
            {unit.memberCount > unit.memberPreview.length && (
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-gray-200 text-gray-700 text-xs font-medium">
                  +{unit.memberCount - unit.memberPreview.length}
                </AvatarFallback>
              </Avatar>
            )}
          </div>

          {/* Member Names */}
          <div className="space-y-1 text-sm">
            {unit.memberPreview.slice(0, 2).map((member) => (
              <p key={member._id} className="text-muted-foreground">
                {member.firstName} {member.lastName}
              </p>
            ))}
            {unit.memberCount > 2 && (
              <p className="text-muted-foreground">and {unit.memberCount - 2} more...</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
