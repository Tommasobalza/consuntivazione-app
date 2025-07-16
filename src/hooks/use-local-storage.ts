
"use client"

import { useState, useEffect, Dispatch, SetStateAction, useCallback, useContext } from 'react';
import { AutoSaveContext } from '@/context/autosave-context';

interface UseLocalStorageOptions {
  silent?: boolean;
}

export function useLocalStorage<T>(
  key: string, 
  initialValue: T,
  options: UseLocalStorageOptions = {}
): [T, Dispatch<SetStateAction<T>>, () => void] {
  const { silent = false } = options;
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const [isInitialized, setIsInitialized] = useState(false);
  const autoSaveContext = useContext(AutoSaveContext);

  const [autoSaveEnabled, setAutoSaveEnabled] = useState(() => {
    if (typeof window === 'undefined') {
      return true;
    }
    try {
      const saveSettingsItem = window.localStorage.getItem('save-settings');
      return saveSettingsItem ? JSON.parse(saveSettingsItem).autoSave : true;
    } catch {
      return true;
    }
  });


  useEffect(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        setStoredValue(JSON.parse(item));
      }
    } catch (error) {
      console.error(`Error reading from localStorage key “${key}”:`, error);
    } finally {
      setIsInitialized(true);
    }
  }, [key]);

  const saveValue = useCallback(() => {
    if (autoSaveContext && autoSaveEnabled && !silent) {
      autoSaveContext.setIsSaving(true);
    }
    try {
        // Use a timeout to simulate network latency and batch savings
        setTimeout(() => {
          window.localStorage.setItem(key, JSON.stringify(storedValue));
          if (autoSaveContext && autoSaveEnabled && !silent) {
            autoSaveContext.setIsSaving(false);
            autoSaveContext.setJustSaved(true);
          }
        }, 500); 
    } catch (error) {
      console.error(`Error writing to localStorage key “${key}”:`, error);
       if (autoSaveContext && autoSaveEnabled && !silent) {
        autoSaveContext.setIsSaving(false);
      }
    }
  }, [key, storedValue, autoSaveContext, autoSaveEnabled, silent]);

  const manualSave = useCallback(() => {
     try {
      window.localStorage.setItem(key, JSON.stringify(storedValue));
    } catch (error) {
      console.error(`Error writing to localStorage key “${key}”:`, error);
    }
  }, [key, storedValue]);


  useEffect(() => {
    if (isInitialized) {
      if (autoSaveEnabled) {
        saveValue();
      }
    }
  }, [storedValue, isInitialized, autoSaveEnabled, saveValue]);

  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
        if (event.key === 'save-settings') {
            try {
                if (event.newValue) {
                    const newSettings = JSON.parse(event.newValue);
                    setAutoSaveEnabled(newSettings.autoSave);
                }
            } catch (error) {
                console.error("Error parsing save-settings from storage event", error)
            }
        }
    }
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
        window.removeEventListener('storage', handleStorageChange);
    }
  }, []);

  return [storedValue, setStoredValue, manualSave];
}
