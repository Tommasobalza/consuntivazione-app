
"use client"

import { useContext } from 'react';
import { AutoSaveContext } from '@/context/autosave-context';
import { Loader2, CheckCircle2 } from 'lucide-react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import type { SaveSettings } from '@/lib/types';

export function AutoSaveIndicator() {
  const context = useContext(AutoSaveContext);
  const [saveSettings] = useLocalStorage<SaveSettings>('save-settings', { autoSave: true });

  if (!context || !saveSettings.autoSave) {
    return null;
  }

  const { isSaving, justSaved } = context;

  const getIndicator = () => {
    if (isSaving) {
      return {
        icon: <Loader2 className="h-4 w-4 animate-spin" />,
        text: 'Salvataggio...'
      };
    }
    if (justSaved) {
      return {
        icon: <CheckCircle2 className="h-4 w-4 text-green-500" />,
        text: 'Salvato'
      };
    }
    return null;
  };

  const indicator = getIndicator();

  if (!indicator) {
    return null;
  }

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50">
      <div className="flex items-center gap-2 rounded-full bg-secondary text-secondary-foreground px-3 py-1.5 text-xs font-medium shadow-md">
        {indicator.icon}
        <span>{indicator.text}</span>
      </div>
    </div>
  );
}
