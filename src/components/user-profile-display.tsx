
"use client";

import { useLocalStorage } from "@/hooks/use-local-storage";
import type { UserProfile } from "@/lib/types";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User } from "lucide-react";

export function UserProfileDisplay() {
  const [userProfile] = useLocalStorage<UserProfile>('user-profile', { name: 'Utente', role: 'Membro del Team' });

  return (
    <div className="flex items-center gap-3">
      <Avatar>
        <AvatarFallback>
          <User className="h-5 w-5" />
        </AvatarFallback>
      </Avatar>
      <div className="text-right">
        <p className="font-semibold text-sm">{userProfile.name}</p>
        <p className="text-xs text-muted-foreground">{userProfile.role}</p>
      </div>
    </div>
  );
}
