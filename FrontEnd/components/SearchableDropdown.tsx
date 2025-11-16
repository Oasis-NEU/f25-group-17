import React from 'react';
import { Box, Input } from '@chakra-ui/react';

interface SearchableDropdownProps {
  value: string;
  searchValue: string | undefined;
  options: string[];
  placeholder?: string;
  isEditing: boolean;
  showDropdown: boolean;
  onChange: (value: string) => void;
  onFocus: () => void;
  onBlur: () => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onSelect: (option: string) => void;
  sortAlphabetically?: boolean;
}

export function SearchableDropdown({
  value,
  searchValue,
  options,
  placeholder = "Search",
  isEditing,
  showDropdown,
  onChange,
  onFocus,
  onBlur,
  onKeyDown,
  onSelect,
  sortAlphabetically = true,
}: SearchableDropdownProps) {
  const displayValue = searchValue !== undefined ? searchValue : value;
  const filteredOptions = options
    .filter(opt =>
      opt.toLowerCase().includes((searchValue || "").toLowerCase())
    );
  
  const finalOptions = sortAlphabetically 
    ? filteredOptions.sort((a, b) => a.localeCompare(b))
    : filteredOptions;

  return (
    <Box position="relative">
      <Input
        value={displayValue}
        onChange={(e) => onChange(e.target.value)}
        onFocus={onFocus}
        onBlur={onBlur}
        onKeyDown={onKeyDown}
        variant="outline"
        bg="rgba(0,0,0,0.3)"
        color="white"
        border="1px solid rgba(255,255,255,0.1)"
        _hover={{ borderColor: isEditing ? "red.500" : "rgba(255,255,255,0.1)" }}
        _focus={{ borderColor: "red.600", boxShadow: "0 0 0 1px rgba(220,20,60,0.5)" }}
        size="md"
        readOnly={!isEditing}
        cursor={!isEditing ? "default" : "text"}
        placeholder={isEditing ? placeholder : ""}
      />

      {isEditing && showDropdown && filteredOptions.length > 0 && (
        <Box
          position="absolute"
          top="100%"
          left={0}
          right={0}
          mt={2}
          maxH="60"
          overflowY="auto"
          bg="rgba(17, 24, 39, 0.95)"
          border="1px solid rgba(220,20,60,0.3)"
          borderRadius="lg"
          boxShadow="0 0 30px rgba(220,20,60,0.2)"
          backdropFilter="blur(12px)"
          zIndex={50}
        >
          {finalOptions.map((option, idx) => (
            <Box
              key={idx}
              px={4}
              py={3}
              color="white"
              borderBottom="1px solid rgba(255,255,255,0.1)"
              _last={{ borderBottom: "none" }}
              _hover={{ bg: "rgba(220,20,60,0.2)", cursor: "pointer" }}
              transition="all 0.2s"
              onMouseDown={(e) => {
                e.preventDefault();
                onSelect(option);
              }}
            >
              {option}
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
}
