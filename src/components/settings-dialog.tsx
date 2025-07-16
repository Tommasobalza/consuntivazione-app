
"use client"

import * as React from "react"
import type { SaveSettings, UserProfile } from "@/lib/types"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { SettingsManager } from "./settings-manager"
import { Settings } from "lucide-react"

interface SettingsDialogProps {
  userProfile: UserProfile;
  setUserProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
  saveSettings: SaveSettings;
  setSaveSettings: React.Dispatch<React.SetStateAction<SaveSettings>>;
  hasPendingChanges: boolean;
  onSaveChanges: () => void;
}

export function SettingsDialog({
  userProfile,
  setUserProfile,
  saveSettings,
  setSaveSettings,
  hasPendingChanges,
  onSaveChanges
}: SettingsDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Settings className="h-5 w-5" />
          <span className="sr-only">Impostazioni</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Impostazioni Applicazione</DialogTitle>
        </DialogHeader>
        <SettingsManager
          userProfile={userProfile}
          setUserProfile={setUserProfile}
          saveSettings={saveSettings}
          setSaveSettings={setSaveSettings}
          hasPendingChanges={hasPendingChanges}
          onSaveChanges={onSaveChanges}
        />
      </DialogContent>
    </Dialog>
  )
}
