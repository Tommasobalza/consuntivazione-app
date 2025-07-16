
"use client";

import { useState, useEffect } from 'react';
import type { UserProfile, SaveSettings } from '@/lib/types';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { Dashboard } from "@/components/dashboard";
import { AutoSaveProvider } from '@/context/autosave-context';
import { Loader2 } from 'lucide-react';

export default function Home() {
  const [userProfile, setUserProfile] = useLocalStorage<UserProfile>('user-profile', { name: 'Utente', role: 'Membro del Team', icon: 'User' });
  const [saveSettings, setSaveSettings] = useLocalStorage<SaveSettings>('save-settings', { autoSave: false });
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // This effect runs only on the client, after the component has mounted.
    setIsClient(true);
  }, []);

  if (!isClient) {
    // While rendering on the server or during the initial client render, 
    // show a loading state to prevent hydration mismatch.
    return (
        <div className="flex h-screen w-full items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
    );
  }

  return (
    <AutoSaveProvider>
      <div className="flex-1 space-y-4 p-4 sm:p-8 pt-6">
        <Dashboard 
          userProfile={userProfile}
          setUserProfile={setUserProfile}
          saveSettings={saveSettings}
          setSaveSettings={setSaveSettings}
        />
      </div>
    </AutoSaveProvider>
  );
}
