
import { useState, useCallback, useMemo } from 'react';

interface UseBulkSelectionProps<T> {
  items: T[];
  getItemId: (item: T) => string;
}

export function useBulkSelection<T>({ items, getItemId }: UseBulkSelectionProps<T>) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const isSelected = useCallback((id: string) => selectedIds.has(id), [selectedIds]);

  const isAllSelected = useMemo(() => {
    if (items.length === 0) return false;
    return items.every(item => selectedIds.has(getItemId(item)));
  }, [items, selectedIds, getItemId]);

  const isIndeterminate = useMemo(() => {
    const selectedCount = items.filter(item => selectedIds.has(getItemId(item))).length;
    return selectedCount > 0 && selectedCount < items.length;
  }, [items, selectedIds, getItemId]);

  const toggleItem = useCallback((id: string) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }, []);

  const toggleAll = useCallback(() => {
    if (isAllSelected) {
      // Deselect all items from this list
      setSelectedIds(prev => {
        const newSet = new Set(prev);
        items.forEach(item => newSet.delete(getItemId(item)));
        return newSet;
      });
    } else {
      // Select all items in this list
      setSelectedIds(prev => {
        const newSet = new Set(prev);
        items.forEach(item => newSet.add(getItemId(item)));
        return newSet;
      });
    }
  }, [items, isAllSelected, getItemId]);

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const getSelectedItems = useCallback(() => {
    return items.filter(item => selectedIds.has(getItemId(item)));
  }, [items, selectedIds, getItemId]);

  const selectedCount = useMemo(() => {
    return items.filter(item => selectedIds.has(getItemId(item))).length;
  }, [items, selectedIds, getItemId]);

  return {
    selectedIds,
    isSelected,
    isAllSelected,
    isIndeterminate,
    selectedCount,
    toggleItem,
    toggleAll,
    clearSelection,
    getSelectedItems,
  };
}
