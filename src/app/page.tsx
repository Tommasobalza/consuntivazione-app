
"use client";

import { useState } from 'react';
import type { UserProfile, SaveSettings } from '@/lib/types';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { Dashboard } from "@/components/dashboard";
import { UserProfileDisplay } from "@/components/user-profile-display";
import { SettingsDialog } from '@/components/settings-dialog';
import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { AutoSaveProvider } from '@/context/autosave-context';
import { AutoSaveIndicator } from '@/components/auto-save-indicator';

export default function Home() {
  const [userProfile, setUserProfile] = useLocalStorage<UserProfile>('user-profile', { name: 'Utente', role: 'Membro del Team', icon: 'User' }, { silent: true });
  const [saveSettings, setSaveSettings] = useLocalStorage<SaveSettings>('save-settings', { autoSave: true }, { silent: true });
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const { toast } = useToast();

  return (
    <AutoSaveProvider>
      <AutoSaveIndicator />
      <div className="flex-1 space-y-4 p-4 sm:p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">
            Work Insights
          </h1>
          <div className="flex items-center gap-4">
            <UserProfileDisplay userProfile={userProfile} />
            <Button variant="ghost" size="icon" onClick={() => setIsSettingsOpen(true)}>
              <Settings className="h-5 w-5" />
            </Button>
          </div>
        </div>
        <Dashboard 
          userProfile={userProfile}
          setUserProfile={setUserProfile}
          saveSettings={saveSettings}
          setSaveSettings={setSaveSettings}
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
