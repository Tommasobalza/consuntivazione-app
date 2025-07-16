
"use client";

import type { UserProfile } from "@/lib/types";
import { userIcons } from "@/lib/types";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface UserProfileDisplayProps {
  userProfile: UserProfile;
}

export function UserProfileDisplay({ userProfile }: UserProfileDisplayProps) {
  const Icon = userIcons[userProfile.icon as keyof typeof userIcons] || userIcons.User;

  return (
    <div className="flex items-center gap-3">
      <Avatar>
        <AvatarFallback>
          <Icon className="h-5 w-5" />
        </AvatarFallback>
      </Avatar>
      <div className="text-right">
        <p className="font-semibold text-sm">{userProfile.name}</p>
        <p className="text-xs text-muted-foreground">{userProfile.role}</p>
      </div>
    </div>
  );
}
