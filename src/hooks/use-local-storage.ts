
"use client"

import { useState, useEffect, Dispatch, SetStateAction, useCallback, useContext } from 'react';
import { AutoSaveContext } from '@/context/autosave-context';

export function useLocalStorage<T>(
  key: string, 
  initialValue: T
): [T, Dispatch<SetStateAction<T>>, () => void] {
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const [isInitialized, setIsInitialized] = useState(false);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const autoSaveContext = useContext(AutoSaveContext);

  useEffect(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        setStoredValue(JSON.parse(item));
      }
      
      const saveSettingsItem = window.localStorage.getItem('save-settings');
      if (saveSettingsItem) {
        setAutoSaveEnabled(JSON.parse(saveSettingsItem).autoSave);
      }

    } catch (error) {
      console.error(`Error reading from localStorage key “${key}”:`, error);
    } finally {
      setIsInitialized(true);
    }
  }, [key]);

  const saveValue = useCallback(() => {
    if (autoSaveContext && autoSaveEnabled) {
      autoSaveContext.setIsSaving(true);
    }
    try {
        setTimeout(() => {
          window.localStorage.setItem(key, JSON.stringify(storedValue));
          if (autoSaveContext && autoSaveEnabled) {
            autoSaveContext.setIsSaving(false);
            autoSaveContext.setJustSaved(true);
          }
        }, 500); // Simulate network latency
    } catch (error) {
      console.error(`Error writing to localStorage key “${key}”:`, error);
       if (autoSaveContext) {
        autoSaveContext.setIsSaving(false);
      }
    }
  }, [key, storedValue, autoSaveContext, autoSaveEnabled]);

  const manualSave = useCallback(() => {
     try {
      window.localStorage.setItem(key, JSON.stringify(storedValue));
    } catch (error) {
      console.error(`Error writing to localStorage key “${key}”:`, error);
    }
  }, [key, storedValue]);


  useEffect(() => {
    if (isInitialized && autoSaveEnabled) {
        saveValue();
    }
  }, [storedValue, isInitialized, autoSaveEnabled, saveValue]);

  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
        if (event.key === 'save-settings') {
            try {
                if (event.newValue) {
                    setAutoSaveEnabled(JSON.parse(event.newValue).autoSave);
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
