
"use client"

import { useState, useEffect, Dispatch, SetStateAction, useCallback, useContext } from 'react';
import { AutoSaveContext } from '@/context/autosave-context';

export function useLocalStorage<T>(
  key: string, 
  initialValue: T
): [T, Dispatch<SetStateAction<T>>, () => void, boolean] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    // We do this sync to avoid hydration mismatch
    if (typeof window === 'undefined') {
      return initialValue;
    }
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading from localStorage key “${key}”:`, error);
      return initialValue;
    }
  });

  const [hasPendingChanges, setHasPendingChanges] = useState(false);
  const autoSaveContext = useContext(AutoSaveContext);

  const [autoSaveEnabled, setAutoSaveEnabled] = useState(() => {
    if (typeof window === 'undefined') {
      return false;
    }
    try {
      const saveSettingsItem = window.localStorage.getItem('save-settings');
      return saveSettingsItem ? JSON.parse(saveSettingsItem).autoSave : false;
    } catch {
      return false;
    }
  });


  useEffect(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (item) {
          const loadedValue = JSON.parse(item);
          // Check if loaded value is different from initial memory state
          if (JSON.stringify(loadedValue) !== JSON.stringify(storedValue)) {
             setStoredValue(loadedValue);
          }
      }
    } catch (error) {
      console.error(`Error reading from localStorage key “${key}”:`, error);
    }
  }, [key]);

  const setValue: Dispatch<SetStateAction<T>> = (value) => {
    const valueToStore = value instanceof Function ? value(storedValue) : value;
    setStoredValue(valueToStore);
    if (!autoSaveEnabled) {
      setHasPendingChanges(true);
    }
  };

  const saveValue = useCallback(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue));
      setHasPendingChanges(false);
    } catch (error) {
      console.error(`Error writing to localStorage key “${key}”:`, error);
    }
  }, [key, storedValue]);

  useEffect(() => {
    if (autoSaveEnabled) {
      saveValue();
    }
  }, [storedValue, autoSaveEnabled, saveValue]);

  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
        if (event.key === 'save-settings') {
            try {
                if (event.newValue) {
                    const newSettings = JSON.parse(event.newValue);
                    setAutoSaveEnabled(newSettings.autoSave);
                     if (newSettings.autoSave) {
                        setHasPendingChanges(false);
                    }
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

  return [storedValue, setValue, saveValue, hasPendingChanges];
}
