
"use client";

import { useState } from 'react';
import type { UserProfile, SaveSettings } from '@/lib/types';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { Dashboard } from "@/components/dashboard";
import { UserProfileDisplay } from "@/components/user-profile-display";
import { SettingsDialog } from '@/components/settings-dialog';
import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-react';
import { AutoSaveProvider } from '@/context/autosave-context';

export default function Home() {
  const [userProfile, setUserProfile] = useLocalStorage<UserProfile>('user-profile', { name: 'Utente', role: 'Membro del Team', icon: 'User' });
  const [saveSettings, setSaveSettings] = useLocalStorage<SaveSettings>('save-settings', { autoSave: false });
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <AutoSaveProvider>
      <div className="flex-1 space-y-4 p-4 sm:p-8 pt-6">
        <Dashboard 
          userProfile={userProfile}
          setUserProfile={setUserProfile}
          saveSettings={saveSettings}
          setSaveSettings={setSaveSettings}
          openSettings={() => setIsSettingsOpen(true)}
        />
        <SettingsDialog
          isOpen={isSettingsOpen}
          setIsOpen={setIsSettingsOpen}
          userProfile={userProfile}
          setUserProfile={setUserProfile}
          saveSettings={saveSettings}
          setSaveSettings={setSaveSettings}
        />
      </div>
    </AutoSaveProvider>
  );
}
