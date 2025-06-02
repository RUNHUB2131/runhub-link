import { useState, useEffect } from 'react';

interface UseDraftDataOptions<T> {
  isOpen: boolean;
  storageKey: string;
  initialData: T;
}

interface UseDraftDataReturn<T> {
  data: T;
  setData: React.Dispatch<React.SetStateAction<T>>;
  draftRestored: boolean;
  clearDraft: () => void;
}

export function useDraftData<T>({
  isOpen,
  storageKey,
  initialData,
}: UseDraftDataOptions<T>): UseDraftDataReturn<T> {
  const [data, setData] = useState<T>(initialData);
  const [draftRestored, setDraftRestored] = useState(false);

  // Load draft data from localStorage when dialog opens
  useEffect(() => {
    if (isOpen) {
      const savedDraft = localStorage.getItem(storageKey);
      if (savedDraft) {
        try {
          const draftData = JSON.parse(savedDraft);
          setData(draftData);
          setDraftRestored(true);
          // Clear the notification after 3 seconds
          setTimeout(() => setDraftRestored(false), 3000);
        } catch (error) {
          console.error('Error parsing saved draft:', error);
          // Fallback to initial data if draft is corrupted
          setData(initialData);
        }
      } else {
        // No draft exists, use initial data
        setData(initialData);
      }
    }
  }, [isOpen, initialData, storageKey]);

  // Save draft to localStorage whenever data changes
  useEffect(() => {
    if (isOpen) {
      localStorage.setItem(storageKey, JSON.stringify(data));
    }
  }, [data, isOpen, storageKey]);

  const clearDraft = () => {
    localStorage.removeItem(storageKey);
  };

  return {
    data,
    setData,
    draftRestored,
    clearDraft,
  };
} 