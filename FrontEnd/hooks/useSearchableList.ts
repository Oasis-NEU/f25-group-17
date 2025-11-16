import { useState, useCallback } from 'react';

interface UseSearchableListReturn {
  items: Array<{ value: string }>;
  searchValues: string[];
  showDropdowns: boolean[];
  isSelecting: boolean[];
  addEmptyItem: () => void;
  removeItem: (index: number) => void;
  removeAllItems: () => void;
  handleItemValueChange: (index: number, value: string) => void;
  handleItemSelection: (index: number, value: string) => void;
  handleItemFocus: (index: number) => void;
  handleItemBlur: (index: number, dataList: string[]) => void;
  closeDropdown: (index: number) => void;
}

export function useSearchableList(initialItems: string[] = []): UseSearchableListReturn {
  const [items, setItems] = useState([{ value: "" }]);
  const [searchValues, setSearchValues] = useState<string[]>([""]);
  const [showDropdowns, setShowDropdowns] = useState<boolean[]>([false]);
  const [isSelecting, setIsSelecting] = useState<boolean[]>([false]);

  const addEmptyItem = useCallback(() => {
    setItems(prev => [...prev, { value: "" }]);
    setSearchValues(prev => [...prev, ""]);
    setShowDropdowns(prev => [...prev, false]);
    setIsSelecting(prev => [...prev, false]);
  }, []);

  const removeItem = useCallback((index: number) => {
    setItems(prev => prev.filter((_, i) => i !== index));
    setSearchValues(prev => prev.filter((_, i) => i !== index));
    setShowDropdowns(prev => prev.filter((_, i) => i !== index));
    setIsSelecting(prev => prev.filter((_, i) => i !== index));
  }, []);

  const removeAllItems = useCallback(() => {
    setItems([{ value: "" }]);
    setSearchValues([""]);
    setShowDropdowns([false]);
    setIsSelecting([false]);
  }, []);

  const handleItemValueChange = useCallback((index: number, value: string) => {
    setSearchValues(prev => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
    
    setItems(prev => {
      const next = [...prev];
      next[index].value = value;
      return next;
    });
    
    setShowDropdowns(prev => {
      const next = [...prev];
      next[index] = true;
      return next;
    });
  }, []);

  const handleItemSelection = useCallback((index: number, value: string) => {
    setIsSelecting(prev => {
      const next = [...prev];
      next[index] = true;
      return next;
    });
    
    setSearchValues(prev => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
    
    setItems(prev => {
      const next = [...prev];
      next[index].value = value;
      return next;
    });
    
    setShowDropdowns(prev => {
      const next = [...prev];
      next[index] = false;
      return next;
    });
  }, []);

  const handleItemFocus = useCallback((index: number) => {
    const previousValue = searchValues[index];
    
    if (!window.previousSearchValues) {
      window.previousSearchValues = {};
    }
    window.previousSearchValues[index] = previousValue;
    
    setSearchValues(prev => {
      const next = [...prev];
      next[index] = "";
      return next;
    });
    
    setShowDropdowns(prev => {
      const next = [...prev];
      next[index] = true;
      return next;
    });
    
    setIsSelecting(prev => {
      const next = [...prev];
      next[index] = false;
      return next;
    });
  }, [searchValues]);

  const handleItemBlur = useCallback((index: number, dataList: string[]) => {
    setTimeout(() => {
      const search = searchValues[index];
      
      if (!search || search.trim() === "") {
        const previousValue = window.previousSearchValues?.[index] || "";
        setSearchValues(prev => {
          const next = [...prev];
          next[index] = previousValue;
          return next;
        });
        setItems(prev => {
          const next = [...prev];
          next[index].value = previousValue;
          return next;
        });
        setShowDropdowns(prev => {
          const next = [...prev];
          next[index] = false;
          return next;
        });
        return;
      }

      const filtered = dataList
        .filter(c =>
          c.toLowerCase().includes(search.toLowerCase())
        )
        .sort((a, b) => a.localeCompare(b));
      
      // Auto-fill with first match regardless of exact match
      if (filtered.length > 0) {
        handleItemSelection(index, filtered[0]);
      }
      
      setShowDropdowns(prev => {
        const next = [...prev];
        next[index] = false;
        return next;
      });
      
      setIsSelecting(prev => {
        const next = [...prev];
        next[index] = false;
        return next;
      });
    }, 150);
  }, [searchValues, items, handleItemSelection]);

  const closeDropdown = useCallback((index: number) => {
    setShowDropdowns(prev => {
      const next = [...prev];
      next[index] = false;
      return next;
    });
  }, []);

  return {
    items,
    searchValues,
    showDropdowns,
    isSelecting,
    addEmptyItem,
    removeItem,
    removeAllItems,
    handleItemValueChange,
    handleItemSelection,
    handleItemFocus,
    handleItemBlur,
    closeDropdown,
  };
}

// Extend Window interface to include previous values
declare global {
  interface Window {
    previousSearchValues?: { [key: number]: string };
  }
}
