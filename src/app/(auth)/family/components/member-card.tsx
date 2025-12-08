"use client";

import { Calendar, Mail, MapPin, Phone } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Id } from "@/convex/_generated/dataModel";

interface FamilyMember {
  _id: Id<"familyMembers">;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  dateOfBirth?: number;
  city?: string;
  state?: string;
  gender?: "male" | "female" | "non_binary" | "prefer_not_to_say" | "other" | undefined;
  relationshipType:
    | "parent"
    | "child"
    | "spouse"
    | "partner"
    | "sibling"
    | "grandparent"
    | "grandchild"
    | "aunt_uncle"
    | "niece_nephew"
    | "cousin"
    | "in_law"
    | "other";
  roles: string[];
  avatarUrl?: string;
}

interface MemberCardProps {
  member: FamilyMember;
  onEdit: () => void;
  onRemove: () => void;
}

export function MemberCard({ member, onEdit, onRemove }: MemberCardProps) {
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName[0] || ""}${lastName[0] || ""}`.toUpperCase();
  };

  const getAvatarColor = (gender?: string) => {
    if (gender === "male") return "bg-blue-500";
    if (gender === "female") return "bg-pink-500";
    return "bg-gray-500";
  };

  const formatRelationship = (relationship: string) => {
    return relationship
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const formatDate = (timestamp?: number) => {
    if (!timestamp) return null;
    return new Date(timestamp).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatLocation = (city?: string, state?: string) => {
    if (city && state) return `${city}, ${state}`;
    if (city) return city;
    if (state) return state;
    return null;
  };

  return (
    <div className="border rounded-lg p-4 hover:bg-accent/50 transition-colors">
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <Avatar className="h-12 w-12">
          <AvatarFallback className={`${getAvatarColor(member.gender)} text-white font-medium`}>
            {getInitials(member.firstName, member.lastName)}
          </AvatarFallback>
        </Avatar>

        {/* Member Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <div className="min-w-0">
              <h4 className="font-semibold text-base truncate">
                {member.firstName} {member.lastName}
              </h4>
              <p className="text-sm text-muted-foreground">
                {formatRelationship(member.relationshipType)}
              </p>
            </div>
            <div className="flex gap-2 shrink-0">
              {member.roles.length > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {member.roles.length === 1 ? member.roles[0] : `${member.roles.length} Roles`}
                </Badge>
              )}
            </div>
          </div>

          {/* Contact Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-3 text-sm">
            {member.email && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{member.email}</span>
              </div>
            )}
            {member.phone && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Phone className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{member.phone}</span>
              </div>
            )}
            {member.dateOfBirth && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{formatDate(member.dateOfBirth)}</span>
              </div>
            )}
            {formatLocation(member.city, member.state) && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{formatLocation(member.city, member.state)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 shrink-0">
          <Button variant="outline" size="sm" onClick={onEdit}>
            Edit
          </Button>
          <Button variant="outline" size="sm" onClick={onRemove}>
            Remove
          </Button>
        </div>
      </div>
    </div>
  );
}
