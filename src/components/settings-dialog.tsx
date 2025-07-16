
"use client";

import * as React from "react";
import type { SaveSettings, UserProfile } from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SettingsManager } from "./settings-manager";

interface SettingsDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  userProfile: UserProfile;
  setUserProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
  saveSettings: SaveSettings;
  setSaveSettings: React.Dispatch<React.SetStateAction<SaveSettings>>;
}

export function SettingsDialog({
  isOpen,
  setIsOpen,
  userProfile,
  setUserProfile,
  saveSettings,
  setSaveSettings,
}: SettingsDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Impostazioni</DialogTitle>
          <DialogDescription>
            Gestisci le preferenze dell'applicazione e il tuo profilo.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <SettingsManager
            userProfile={userProfile}
            setUserProfile={setUserProfile}
            saveSettings={saveSettings}
            setSaveSettings={setSaveSettings}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
