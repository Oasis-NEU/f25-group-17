import React from 'react';
import { Input } from '@chakra-ui/react';

interface SearchableInputProps {
  index: number;
  searchValue: string;
  showDropdown: boolean;
  dataList: string[];
  itemCount: number;
  label?: string;
  placeholder?: string;
  isItemSelected?: (value: string) => boolean;
  onValueChange: (index: number, value: string) => void;
  onFocus: (index: number) => void;
  onBlur: (index: number) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>, index: number) => void;
  onItemSelect: (index: number, value: string) => void;
  onRemove: (index: number) => void;
}

export function SearchableInput({
  index,
  searchValue,
  showDropdown,
  dataList,
  itemCount,
  label = `Item ${index + 1}`,
  placeholder = "Search",
  isItemSelected,
  onValueChange,
  onFocus,
  onBlur,
  onKeyDown,
  onItemSelect,
  onRemove,
}: SearchableInputProps) {
  const filteredItems = [...new Set(
    dataList.filter(item =>
      item.toLowerCase().includes((searchValue || "").toLowerCase())
    )
  )].sort((a, b) => a.localeCompare(b));

  return (
    <div className="bg-gray-900/40 border border-gray-700/40 rounded-xl p-4 flex flex-col gap-3">
      <div className="relative searchable-input-container">
        <label className="block text-red-400 text-xs font-semibold mb-1">
          {label}
        </label>
        <Input
          placeholder={placeholder}
          value={searchValue || ""}
          onChange={(e) => {
            const value = e.target.value;
            onValueChange(index, value);
          }}
          onFocus={() => onFocus(index)}
          onBlur={() => onBlur(index)}
          onKeyDown={(e) => onKeyDown(e, index)}
          className="text-white"
        />

        {/* Dropdown list */}
        {showDropdown && filteredItems.length > 0 && (
          <div className="absolute z-50 w-full mt-2 max-h-60 overflow-y-auto bg-gray-900/95 border border-red-600/30 rounded-lg shadow-[0_0_30px_rgba(220,20,60,0.2)] backdrop-blur-md">
            {filteredItems.length > 0 ? (
              filteredItems.map((item, itemIndex) => {
                const alreadySelected = isItemSelected ? isItemSelected(item) : false;
                
                return (
                  <button
                    key={`${item}-${itemIndex}`}
                    type="button"
                    disabled={alreadySelected}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      if (!alreadySelected) {
                        onItemSelect(index, item);
                      }
                    }}
                    className={`w-full px-4 py-3 text-left border-b border-gray-800/50 last:border-b-0 transition-colors ${
                      alreadySelected
                        ? 'text-gray-500 bg-gray-900/50 cursor-not-allowed'
                        : 'text-white hover:bg-red-600/20 cursor-pointer'
                    }`}
                  >
                    {item}
                    {alreadySelected && <span className="text-xs text-gray-600 ml-2">(already selected)</span>}
                  </button>
                );
              })
            ) : (
              <div className="px-4 py-3 text-gray-400 text-sm">
                No items found
              </div>
            )}
          </div>
        )}
      </div>

      {itemCount > 1 && (
        <button
          type="button"
          onClick={() => onRemove(index)}
          className="text-xs text-red-300 hover:text-red-200 self-end"
        >
          Remove
        </button>
      )}
    </div>
  );
}
