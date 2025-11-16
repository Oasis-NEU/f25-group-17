import { useState, useCallback } from 'react';

interface UseLocalStorageReturn<T> {
  data: T;
  setData: (data: T) => void;
  loadData: (key: string, onLoad?: (data: T) => void) => void;
  saveData: (key: string, data: T) => void;
  removeData: (key: string) => void;
}

export function useLocalStorage<T>(initialValue: T): UseLocalStorageReturn<T> {
  const [data, setData] = useState<T>(initialValue);

  const loadData = useCallback((key: string, onLoad?: (data: T) => void) => {
    try {
      const saved = localStorage.getItem(key);
      if (saved) {
        const parsed = JSON.parse(saved);
        setData(parsed);
        if (onLoad) onLoad(parsed);
      }
    } catch (err) {
      console.error(`Error loading ${key} from localStorage:`, err);
    }
  }, []);

  const saveData = useCallback((key: string, dataToSave: T) => {
    try {
      localStorage.setItem(key, JSON.stringify(dataToSave));
      setData(dataToSave);
    } catch (err) {
      console.error(`Error saving ${key} to localStorage:`, err);
    }
  }, []);

  const removeData = useCallback((key: string) => {
    try {
      localStorage.removeItem(key);
      setData(initialValue);
    } catch (err) {
      console.error(`Error removing ${key} from localStorage:`, err);
    }
  }, [initialValue]);

  return {
    data,
    setData,
    loadData,
    saveData,
    removeData,
  };
}
