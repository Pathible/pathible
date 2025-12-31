"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { Id } from "@/convex/_generated/dataModel";

interface FamilyMember {
  _id: Id<"familyMembers">;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
}

interface FamilyUnit {
  _id: Id<"familyUnits">;
  name: string;
  description?: string;
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

  // Get subtitle - use description for primary, relationshipToHousehold for others
  const getSubtitle = () => {
    if (unit.isPrimary) {
      return unit.description || "Your immediate family";
    }
    return unit.relationshipToHousehold || unit.description;
  };

  return (
    <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={onClick}>
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Header - Title with Primary badge */}
          <div className="flex items-start justify-between">
            <div className="space-y-1 flex-1 min-w-0">
              <h3 className="font-semibold text-lg">{unit.name}</h3>
              {getSubtitle() && <p className="text-sm text-muted-foreground">{getSubtitle()}</p>}
            </div>
            {unit.isPrimary && (
              <Badge className="bg-green-600 hover:bg-green-700 ml-2 shrink-0">Primary</Badge>
            )}
          </div>

          {/* Member Avatars with Names Below */}
          <div className="flex gap-4">
            {unit.memberPreview.map((member) => (
              <div key={member._id} className="flex flex-col items-center">
                <Avatar className="h-12 w-12 mb-1">
                  <AvatarFallback className="bg-[#6B7B5C] text-white text-sm font-medium">
                    {getInitials(member.firstName, member.lastName)}
                  </AvatarFallback>
                </Avatar>
                <span className="text-xs text-muted-foreground text-center whitespace-nowrap">
                  {member.firstName} {member.lastName}
                </span>
              </div>
            ))}
            {unit.memberCount > unit.memberPreview.length && (
              <div className="flex flex-col items-center">
                <Avatar className="h-12 w-12 mb-1">
                  <AvatarFallback className="bg-gray-300 text-gray-700 text-sm font-medium">
                    +{unit.memberCount - unit.memberPreview.length}
                  </AvatarFallback>
                </Avatar>
                <span className="text-xs text-muted-foreground">more</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
