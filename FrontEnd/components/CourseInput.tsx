import React from 'react';
import { Input } from '@chakra-ui/react';

interface CourseInputProps {
  index: number;
  courseSearch: string;
  showDropdown: boolean;
  classNames: string[];
  savedCoursesLength: number;
  coursesLength: number;
  isAlreadySelected: (course: string) => boolean;
  onCourseNameChange: (index: number, value: string) => void;
  onFocus: (index: number) => void;
  onBlur: (index: number) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>, index: number) => void;
  onCourseSelect: (index: number, courseName: string) => void;
  onRemove: (index: number) => void;
}

export function CourseInput({
  index,
  courseSearch,
  showDropdown,
  classNames,
  savedCoursesLength,
  coursesLength,
  isAlreadySelected,
  onCourseNameChange,
  onFocus,
  onBlur,
  onKeyDown,
  onCourseSelect,
  onRemove,
}: CourseInputProps) {
  const filteredClasses = [...new Set(
    classNames.filter(c =>
      c.toLowerCase().includes((courseSearch || "").toLowerCase())
    )
  )];

  return (
    <div className="bg-gray-900/40 border border-gray-700/40 rounded-xl p-4 flex flex-col gap-3">
      <div className="relative course-dropdown-container">
        <label className="block text-red-400 text-xs font-semibold mb-1">
          Course {index + 1} {index < savedCoursesLength && <span className="text-gray-400">(Saved)</span>}
        </label>
        <Input
          placeholder="Search your class"
          value={courseSearch || ""}
          onChange={(e) => {
            const value = e.target.value;
            onCourseNameChange(index, value);
          }}
          onFocus={() => onFocus(index)}
          onBlur={() => onBlur(index)}
          onKeyDown={(e) => onKeyDown(e, index)}
          className="text-white"
        />

        {/* Dropdown list */}
        {showDropdown && filteredClasses.length > 0 && (
          <div className="absolute z-50 w-full mt-2 max-h-60 overflow-y-auto bg-gray-900/95 border border-red-600/30 rounded-lg shadow-[0_0_30px_rgba(220,20,60,0.2)] backdrop-blur-md">
            {filteredClasses.length > 0 ? (
              filteredClasses.map((cls, clsIndex) => {
                const alreadySelected = isAlreadySelected(cls);
                
                return (
                  <button
                    key={`${cls}-${clsIndex}`}
                    type="button"
                    disabled={alreadySelected}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      if (!alreadySelected) {
                        onCourseSelect(index, cls);
                      }
                    }}
                    className={`w-full px-4 py-3 text-left border-b border-gray-800/50 last:border-b-0 transition-colors ${
                      alreadySelected
                        ? 'text-gray-500 bg-gray-900/50 cursor-not-allowed'
                        : 'text-white hover:bg-red-600/20 cursor-pointer'
                    }`}
                  >
                    {cls}
                    {alreadySelected && <span className="text-xs text-gray-600 ml-2">(already selected)</span>}
                  </button>
                );
              })
            ) : (
              <div className="px-4 py-3 text-gray-400 text-sm">
                No classes found
              </div>
            )}
          </div>
        )}
      </div>

      {coursesLength > 1 && (
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
