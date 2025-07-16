
"use client"

import { useState, useEffect, Dispatch, SetStateAction, useCallback } from 'react';

export function useLocalStorage<T>(
  key: string, 
  initialValue: T
): [T, Dispatch<SetStateAction<T>>, () => void] {
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const [isInitialized, setIsInitialized] = useState(false);
  const [autoSave, setAutoSave] = useState(true);

  useEffect(() => {
    // This effect runs once to initialize the state from localStorage
    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        setStoredValue(JSON.parse(item));
      }
      
      const saveSettings = window.localStorage.getItem('save-settings');
      if (saveSettings) {
        setAutoSave(JSON.parse(saveSettings).autoSave);
      }

    } catch (error) {
      console.error(`Error reading from localStorage key “${key}”:`, error);
    } finally {
      setIsInitialized(true);
    }
  }, [key]);

  const saveValue = useCallback(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue));
    } catch (error) {
      console.error(`Error writing to localStorage key “${key}”:`, error);
    }
  }, [key, storedValue]);

  useEffect(() => {
    // This effect handles auto-saving
    if (isInitialized && autoSave) {
        saveValue();
    }
  }, [key, storedValue, isInitialized, autoSave, saveValue]);

  // Listen for changes in save-settings
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
        if (event.key === 'save-settings') {
            try {
                if (event.newValue) {
                    setAutoSave(JSON.parse(event.newValue).autoSave);
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

  return [storedValue, setStoredValue, saveValue];
}
