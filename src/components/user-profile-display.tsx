
"use client";

import { useState, useEffect } from "react";
import type { UserProfile } from "@/lib/types";
import { userIcons } from "@/lib/types";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface UserProfileDisplayProps {
  userProfile: UserProfile;
}

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) {
    return "Buongiorno";
  }
  if (hour < 18) {
    return "Buon pomeriggio";
  }
  return "Buona sera";
};

export function UserProfileDisplay({ userProfile }: UserProfileDisplayProps) {
  const [greeting, setGreeting] = useState("");

  useEffect(() => {
    setGreeting(getGreeting());
  }, []);

  const Icon = userIcons[userProfile.icon as keyof typeof userIcons] || userIcons.User;

  return (
    <div className="flex items-center gap-3">
      <Avatar>
        <AvatarFallback>
          <Icon className="h-5 w-5" />
        </AvatarFallback>
      </Avatar>
      <div className="text-right">
        <p className="font-semibold text-sm">
          {greeting && `${greeting}, `}{userProfile.name}
        </p>
        <p className="text-xs text-muted-foreground">{userProfile.role}</p>
      </div>
    </div>
  );
}
