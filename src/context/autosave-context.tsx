
"use client"

import React, { createContext, useState, useEffect, ReactNode } from 'react';

interface AutoSaveContextType {
  isSaving: boolean;
  setIsSaving: React.Dispatch<React.SetStateAction<boolean>>;
  justSaved: boolean;
  setJustSaved: React.Dispatch<React.SetStateAction<boolean>>;
}

export const AutoSaveContext = createContext<AutoSaveContextType | undefined>(undefined);

export function AutoSaveProvider({ children }: { children: ReactNode }) {
  const [isSaving, setIsSaving] = useState(false);
  const [justSaved, setJustSaved] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (justSaved) {
      timer = setTimeout(() => {
        setJustSaved(false);
      }, 2000); // Hide "Saved" message after 2 seconds
    }
    return () => clearTimeout(timer);
  }, [justSaved]);
  
  // If we start saving, we are no longer "just saved"
  useEffect(() => {
    if(isSaving) {
        setJustSaved(false);
    }
  }, [isSaving]);

  return (
    <AutoSaveContext.Provider value={{ isSaving, setIsSaving, justSaved, setJustSaved }}>
      {children}
    </AutoSaveContext.Provider>
  );
}
