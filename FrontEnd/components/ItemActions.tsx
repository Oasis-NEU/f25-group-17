import React from 'react';

interface ItemActionsProps {
  itemCount: number;
  onAddItem: () => void;
  onRemoveAllItems: () => void;
  addButtonLabel?: string;
  removeAllButtonLabel?: string;
}

export function ItemActions({
  itemCount,
  onAddItem,
  onRemoveAllItems,
  addButtonLabel = "+ Add another item",
  removeAllButtonLabel = "Remove all items",
}: ItemActionsProps) {
  return (
    <div className="flex gap-3 mb-6">
      <button
        type="button"
        onClick={onAddItem}
        className="text-sm text-red-300 hover:text-red-100"
      >
        {addButtonLabel}
      </button>
      {itemCount > 1 && (
        <button
          type="button"
          onClick={onRemoveAllItems}
          className="text-sm text-red-300 hover:text-red-100 ml-auto"
        >
          {removeAllButtonLabel}
        </button>
      )}
    </div>
  );
}
